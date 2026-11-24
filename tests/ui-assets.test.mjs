import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stories } from '../server/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

function browserContext(fetch) {
  const app = { innerHTML: '', addEventListener() {} };
  const saved = new Map([['history-offline-preview-v2', JSON.stringify({ nodeId: 'removed-node' })]]);
  const context = vm.createContext({
    document: {
      querySelector: selector => selector === '#app' ? app : {},
      addEventListener() {}
    },
    localStorage: { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value) },
    crypto: { randomUUID: () => 'test-reader-1234' },
    setTimeout, clearTimeout, fetch
  });
  context.window = context;
  return { context, app };
}

function assertEmptyView(app) {
  assert.match(app.innerHTML, /История обновляется/);
  assert.match(app.innerHTML, /авторскими исправлениями/);
  assert.doesNotMatch(app.innerHTML, /<img|data-action="(?:read|chapters|buy-map)"/);
}

test('в проекте отсутствуют прежние фотографии, история и производственные материалы', () => {
  const assets = fs.readdirSync(path.join(root, 'public/assets')).sort();
  assert.deepEqual(assets, ['fonts', 'icon.svg']);
  for (const relative of [
    'private', 'production/chapter01/assets', 'production/chapter01/renders', 'production/chapter01/rigs', '.taste-skill',
    'docs/source-story-chapter-1-part-1.md', 'docs/source-story-chapter-1-parts-2-3.md'
  ]) assert.equal(fs.existsSync(path.join(root, relative)), false, relative);
});

test('клиент открывает пустой каталог и безопасно обрабатывает переходы', async () => {
  const fetch = async url => ({ ok: true, json: async () => url === '/api/config'
    ? { demoMode: true }
    : { user: { demo: true }, mapAccess: { unlocked: true, price: 15, currency: 'XTR' }, stories: [] }
  });
  const { context, app } = browserContext(fetch);
  const script = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
  await vm.runInContext(script + '\nboot();', context);
  assertEmptyView(app);
  for (const action of ['journal', 'chapters', 'library']) {
    await vm.runInContext(`navigate('${action}', {});`, context);
    assertEmptyView(app);
  }
});

test('Pages содержит три части без фото и корректно читает, возвращает и сбрасывает прогресс', async () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'armyhistory-pages-reader-'));
  try {
    const output = path.join(tempDir, 'index.html');
    execFileSync(process.execPath, [path.join(root, 'tools/build-demo.mjs'), output]);
    const html = fs.readFileSync(output, 'utf8');
    assert.doesNotMatch(html, /data:image\/(?:webp|png|jpeg);base64|home-sevastopol-portrait|comic-v[23]/);
    assert.doesNotMatch(html, /\/assets\//, 'Все оставшиеся шрифты должны быть встроены');
    const { context, app } = browserContext();
    const script = html.slice(html.lastIndexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));
    await vm.runInContext(script + '\nboot();', context);
    assert.match(app.innerHTML, /Место для иллюстрации/);
    assert.match(app.innerHTML, /Начать историю/);
    assert.doesNotMatch(app.innerHTML, /<img/);
    await vm.runInContext("navigate('chapters', {});", context);
    assert.match(app.innerHTML, /Дорога и распределение/);
    assert.match(app.innerHTML, /Экзамен у морпехов/);
    assert.match(app.innerHTML, /Ночь, отказ и новое назначение/);
    assert.doesNotMatch(app.innerHTML, /<img/);
    await vm.runInContext('openReader();', context);
    assert.match(app.innerHTML, /восемнадцать/);
    assert.doesNotMatch(app.innerHTML, /<img|Открыть за/);
    for (let step = 1; step < 41; step++) {
      await vm.runInContext("navigate('next', {});", context);
      assert.match(app.innerHTML, /Место для иллюстрации/);
      assert.doesNotMatch(app.innerHTML, /<img/);
    }
    const bootstrap = await (await context.fetch('/api/bootstrap')).json();
    assert.equal(bootstrap.stories[0].completed, true);
    assert.deepEqual(Array.from(bootstrap.stories[0].chapters[0].parts, part => part.status), ['done', 'done', 'done']);
    assert.equal(bootstrap.mapAccess.available, false);
    await vm.runInContext("navigate('back-scene', {});", context);
    assert.equal(vm.runInContext('state.progress.scene.id', context), stories[0].scenes.at(-2).id);
    await vm.runInContext('boot();', context);
    await vm.runInContext('openReader();', context);
    assert.equal(vm.runInContext('state.progress.scene.id', context), stories[0].scenes.at(-2).id);
    await vm.runInContext("navigate('journal', {});", context);
    assert.match(app.innerHTML, /Прогресс чтения сохраняется автоматически/);
    assert.doesNotMatch(app.innerHTML, /ещё не выбирал/);
    await vm.runInContext('openReader(1);', context);
    assert.equal(vm.runInContext('state.progress.scene.id', context), stories[0].start);
    await context.fetch('/api/story/first-days-1990/reset', { method: 'POST' });
    const reset = await (await context.fetch('/api/story/first-days-1990')).json();
    assert.equal(reset.scene.id, stories[0].start);
    assert.equal(reset.visitedCount, 1);
    const missing = await context.fetch('/api/story/removed-story');
    assert.equal(missing.ok, false);
    const invoice = await context.fetch('/api/map/invoice', { method: 'POST' });
    assert.equal(invoice.ok, false);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('клиент сохраняет серверную проверку покупки и доступные элементы ридера', () => {
  const app = fs.readFileSync(path.join(root, 'public/app.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'public/styles.css'), 'utf8');
  assert.match(app, /openInvoice/);
  assert.match(app, /await api\('\/api\/bootstrap'\)/);
  assert.match(app, /X-Telegram-Init-Data/);
  assert.match(app, /<dialog[^>]+class="map-dialog"/);
  assert.match(css, /@media\(prefers-reduced-motion:\s*reduce\)/);
});
