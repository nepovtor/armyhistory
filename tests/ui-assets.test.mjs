import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stories } from '../server/content.mjs';
const root = new URL('../', import.meta.url);

test('все сюжетные иллюстрации присутствуют и не загружаются из чужих доменов', () => {
  const backgrounds = {
    draftOffice: 'chapter-1/01_minsk_draft_office.webp',
    threeYears: 'chapter-1/02_three_years_in_navy.webp',
    trainDeparture: 'chapter-1/03_evening_train_departure.webp',
    trainRecruits: 'chapter-1/04_train_recruits.webp',
    route: null,
    simferopolArrival: 'chapter-1/06_arrival_simferopol.webp',
    simferopolSleep: 'chapter-1/07_simferopol_first_sleep.webp',
    haircut: 'chapter-1/08_morning_haircut.webp',
    uniform: 'chapter-1/09_naval_uniform.webp',
    sevastopolBarracks: 'chapter-1/10_sevastopol_barracks.webp',
    sea: 'comic-v2/harbor.webp', harbor: 'comic-v2/harbor.webp', barracks: 'comic-v2/barracks.webp',
    marineOffer: 'comic-v2/marine-offer.webp', sparring: 'comic-v2/sparring.webp', decision: 'comic-v2/decision.webp',
    diversMissed: 'comic-v2/divers-missed.webp', cover: 'comic-v2/cover.webp'
    , trainJourney: 'comic-v2/train-journey.webp', examResult: 'comic-v2/exam-result.webp'
  };
  for (const story of stories) {
    for (const artwork of [story.cover, ...story.chapters.map(ch => ch.poster)]) {
      assert.ok(artwork.startsWith('/assets/'));
      assert.ok(fs.existsSync(new URL(`../public${artwork}`, import.meta.url)), artwork);
    }
    for (const scene of story.scenes) {
      assert.ok(Object.hasOwn(backgrounds, scene.background), `Нет иллюстрации для ${scene.id}`);
      if (scene.background !== 'route') assert.ok(fs.existsSync(new URL(`../public/assets/${backgrounds[scene.background]}`, import.meta.url)));
    }
  }
  assert.ok(fs.existsSync(new URL('../private/chapter-1/05_route_map.webp', import.meta.url)));
  assert.equal(fs.existsSync(new URL('../public/assets/route.svg', import.meta.url)), false);
  assert.equal(fs.existsSync(new URL('../public/assets/chapter-1/05_route_map.webp', import.meta.url)), false);
});

test('клиент показывает оплату карты и не доверяет одному callback Telegram', () => {
  const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const server = fs.readFileSync(new URL('../server/index.mjs', import.meta.url), 'utf8');
  assert.match(app, /route:\s*['"]\/api\/map['"]/);
  assert.match(app, /data-action="buy-map"/);
  assert.match(app, /openInvoice/);
  assert.match(app, /data\.mapAccess/);
  assert.match(app, /mapAccess\.unlocked/);
  assert.match(app, /await api\('\/api\/bootstrap'\)/);
  assert.match(app, /URL\.createObjectURL/);
  assert.match(app, /X-Telegram-Init-Data/);
  assert.match(server, /privateDir,\s*'chapter-1',\s*'05_route_map\.webp'/);
  assert.match(server, /'Content-Type':\s*'image\/webp'/);
  assert.match(server, /img-src 'self' data: blob:/, 'CSP должна разрешать blob URL защищённой карты');
});

test('ридер показывает новые сцены над текстом и разворачивает карту доступно', () => {
  const app = fs.readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
  const css = fs.readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
  const expectedAssets = [
    '01_minsk_draft_office.webp',
    '02_three_years_in_navy.webp',
    '03_evening_train_departure.webp',
    '04_train_recruits.webp',
    '06_arrival_simferopol.webp',
    '07_simferopol_first_sleep.webp',
    '08_morning_haircut.webp',
    '09_naval_uniform.webp',
    '10_sevastopol_barracks.webp'
  ];
  for (const name of expectedAssets) assert.match(app, new RegExp(`chapter-1/${name.replace('.', '\\.')}`));
  assert.match(app, /class="scene-media/);
  assert.match(app, /class="scene-media[\s\S]*class="story-panel/);
  assert.match(app, /decoding="async"/);
  assert.match(app, /data-action="zoom-map"/);
  assert.match(app, /data-action="close-map"/);
  assert.match(app, /<dialog[^>]+class="map-dialog"/);
  assert.match(app, /Минск[\s\S]*Симферополь[\s\S]*Севастополь/);
  assert.match(app, /нижн(?:яя|ей) койк/i, 'Дневник должен сохранять подтверждённую нижнюю койку');
  assert.doesNotMatch(app, /второй ярус/i, 'В дневнике не должно оставаться старого второго яруса');
  assert.match(css, /\.scene-image[^}]*object-fit:\s*contain/);
  assert.match(css, /\.route-map[^}]*object-fit:\s*contain/);
  assert.match(css, /@media\(prefers-reduced-motion:\s*reduce\)/);
});

test('история не приписывает отцу тип или номер атомной лодки', () => {
  const s=stories[0];
  assert.match(s.shortDescription, /1990/);
  assert.match(s.shortDescription, /атомной подводной лодке/);
  assert.match(s.scenes[0].text, /19 ноября 1990/);
  assert.ok(!s.scenes.some(n => /проект\s+\d+|К-\d+/.test(n.text)));
});

test('новые растровые иллюстрации полноформатные и достаточно крупные', () => {
  const assets = fs.readdirSync(new URL('../public/assets/chapter-1/', import.meta.url)).filter(name => name.endsWith('.webp'));
  assert.equal(assets.length, 9);
  for (const name of assets) {
    const bytes = fs.readFileSync(new URL(`../public/assets/chapter-1/${name}`, import.meta.url));
    assert.ok(bytes.length > 100_000, `${name} выглядит слишком маленьким`);
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  }
  const route = fs.readFileSync(new URL('../private/chapter-1/05_route_map.webp', import.meta.url));
  assert.ok(route.length > 100_000);
  assert.equal(route.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(route.subarray(8, 12).toString('ascii'), 'WEBP');
});

test('автономная Pages-сборка встраивает изображения из вложенных папок', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'armyhistory-pages-'));
  const output = path.join(tempDir, 'index.html');
  try {
    execFileSync(process.execPath, [fileURLToPath(new URL('../tools/build-demo.mjs', import.meta.url)), output], {
      cwd: fileURLToPath(root),
      stdio: 'pipe'
    });
    const html = fs.readFileSync(output, 'utf8');
    assert.doesNotMatch(html, /\/assets\//, 'В Pages-сборке остались внешние ссылки на локальные ресурсы');
    assert.doesNotMatch(html, /['"]\/api\/map['"]/, 'Pages-сборка не должна запрашивать защищённую карту');
    assert.ok((html.match(/data:image\/webp;base64/g) || []).length >= 10, 'Не все WebP-иллюстрации встроены');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

test('автономная Pages-сборка разрешает переход к следующей части', () => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'armyhistory-transition-'));
  const output = path.join(tempDir, 'index.html');
  try {
    execFileSync(process.execPath, [fileURLToPath(new URL('../tools/build-demo.mjs', import.meta.url)), output], {
      cwd: fileURLToPath(root),
      stdio: 'pipe'
    });
    const html = fs.readFileSync(output, 'utf8');
    assert.doesNotMatch(
      html,
      /c\.id!==body\.nodeId\s*\|\|\s*c\.type==='part_end'/,
      'Pages-движок не должен блокировать конец части, у которого есть следующая сцена'
    );
    assert.match(
      html,
      /\(c\.type==='part_end'\s*&&\s*!c\.next\)\s*\|\|\s*c\.type==='ending'/,
      'Pages-движок должен повторять правило перехода из серверного движка'
    );
    const runtimeStart = html.indexOf('const __stories = ');
    const runtimeEnd = html.indexOf('window.fetch = async', runtimeStart);
    assert.ok(runtimeStart >= 0 && runtimeEnd > runtimeStart, 'Не найден автономный движок в Pages-сборке');
    const context = {};
    vm.runInNewContext(`${html.slice(runtimeStart, runtimeEnd)}\n` +
      `globalThis.transitionResult=__advance({nodeId:'c1p1-end',stats:{route:0,mood:0},decisions:[],visited:['c1p1-end']},{nodeId:'c1p1-end'});`, context);
    assert.equal(context.transitionResult.nodeId, 'c1p2-01');
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});
