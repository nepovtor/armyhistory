// Собирает автономный HTML для просмотра без Telegram и Node.js.
// Отдельный от production приложения режим: данные демонстрации хранятся в браузере.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stories, getScene } from '../server/content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const out = process.argv[2] || path.resolve(root, '..', 'HIStory-demo.html');
const assets = new Map();
const assetsDir = path.join(publicDir, 'assets');
function collectAssets(dir, relativeDir = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectAssets(absolutePath, relativePath);
      continue;
    }
    if (!entry.isFile()) continue;
    const mime = entry.name.endsWith('.svg') ? 'image/svg+xml' : entry.name.endsWith('.webp') ? 'image/webp' : entry.name.endsWith('.png') ? 'image/png' : entry.name.endsWith('.ttf') ? 'font/ttf' : null;
    if (!mime) continue;
    const webPath = `/assets/${relativePath.split(path.sep).join('/')}`;
    assets.set(webPath, `data:${mime};base64,` + fs.readFileSync(absolutePath).toString('base64'));
  }
}
collectAssets(assetsDir);
const storiesCopy = structuredClone(stories);
for (const s of storiesCopy) {
  s.cover = assets.get(s.cover) || s.cover;
  for (const ch of s.chapters) ch.poster = assets.get(ch.poster) || ch.poster;
  for (const scene of s.scenes) {
    if (scene.artwork) scene.artwork = assets.get(scene.artwork) || scene.artwork;
  }
}
let app = fs.readFileSync(path.join(publicDir, 'app.js'), 'utf8');
for (const [filepath, data] of assets) app = app.replaceAll(`'${filepath}'`, `'${data}'`);
// Один движок для серверного чтения и автономной версии.
const engine = fs.readFileSync(path.join(root, 'server/engine.mjs'), 'utf8')
  .replace("import { getScene, stories } from './content.mjs';", '')
  .replaceAll('export function ', 'function ');
const stub = `
const stories = ${JSON.stringify(storiesCopy)};
${getScene.toString()}
${engine}
const __key = 'history-offline-preview-v2';
const __read = story => {
  try {
    const progress = JSON.parse(localStorage.getItem(__key) || 'null');
    return progress && getScene(story, progress.nodeId) && Array.isArray(progress.visited)
      && progress.visited.length && progress.visited.every(id => getScene(story, id))
      && Array.isArray(progress.decisions) && progress.stats ? progress : initialProgress(story);
  } catch { return initialProgress(story); }
};
window.fetch = async (url, opts = {}) => {
  const response = (status, payload) => ({ ok: status < 400, status, json: async () => payload });
  try {
    if (url === '/api/config') return response(200, { demoMode: true, staticPreview: true, gameName: 'HIStory' });
    if (url === '/api/bootstrap') return response(200, {
      user: { name: 'Читатель', demo: true },
      mapAccess: { available: false, unlocked: false, price: 15, currency: 'XTR' },
      stories: stories.map(story => publicStory(story, __read(story)))
    });
    const match = url.match(/^\\/api\\/story\\/([a-z0-9-]+)(?:\\/(advance|back|reset))?$/);
    const story = match && stories.find(story => story.id === match[1]);
    if (!story) return response(404, { error: 'Адрес не найден' });
    let progress = __read(story);
    if (match[2]) {
      if (opts.method !== 'POST') return response(405, { error: 'Метод не разрешён' });
      progress = match[2] === 'reset' ? initialProgress(story)
        : match[2] === 'back' ? rewind(story, progress)
        : advance(story, progress, JSON.parse(opts.body || '{}'));
      localStorage.setItem(__key, JSON.stringify(progress));
    }
    return response(200, publicProgress(story, progress));
  } catch (error) { return response(409, { error: error.message }); }
};
`;
// Защитить закрывающие script-последовательности в пользовательских текстах.
const safeScript = (stub + '\n' + app).replaceAll('</script', '<\\/script');
let css = fs.readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
for (const [filepath, data] of assets) css = css.replaceAll(filepath, data);
const fontLicense = fs.readFileSync(path.join(assetsDir, 'fonts', 'OFL.txt'), 'utf8');
css = `/*\n${fontLicense}\n*/\n` + css;
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1"><meta name="theme-color" content="#0b1e2b"><title>HIStory — демоверсия</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${css}</style></head><body><div id="app" aria-live="polite"></div><div id="toast" role="status" aria-live="polite"></div><script>${safeScript}</script></body></html>`;
fs.writeFileSync(out,html);
console.log('Offline preview generated:',out,fs.statSync(out).size,'bytes');
