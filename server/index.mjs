import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getStory, stories } from './content.mjs';
import { advance, rewind, initialProgress, publicStory, publicProgress, assertValidContent } from './engine.mjs';
import { verifyTelegramInitData, getRequestUser } from './auth.mjs';
import { Storage } from './storage.mjs';
import { launchBot } from './bot.mjs';
import { MAP_ACCESS_CURRENCY, MAP_ACCESS_PRICE, MAP_ACCESS_PRODUCT, createMapInvoiceLink } from './payments.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const privateDir = path.join(root, 'private');
const envPath = path.join(root, '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !Object.hasOwn(process.env, m[1])) process.env[m[1]] = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
  }
}
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const APP_URL = process.env.APP_URL || '';
const DEMO_MODE = process.env.DEMO_MODE === '1' && process.env.NODE_ENV !== 'production';
const DATA_DIR = path.resolve(root, process.env.DATA_DIR || './data');
if (!DEMO_MODE && !BOT_TOKEN) {
  console.error('Нет BOT_TOKEN. Для локального просмотра запустите npm run dev, для Telegram задайте BOT_TOKEN.');
  process.exit(1);
}
assertValidContent();
const storage = new Storage(DATA_DIR);

function send(res, code, payload) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(payload));
}
function mapAccess(user) {
  return {
    unlocked: Boolean(user.demo) || storage.hasEntitlement(user.id, MAP_ACCESS_PRODUCT),
    price: MAP_ACCESS_PRICE,
    currency: MAP_ACCESS_CURRENCY
  };
}
function sendProtectedMap(res) {
  const file = path.join(privateDir, 'chapter-1', '05_route_map.webp');
  res.writeHead(200, {
    'Content-Type': 'image/webp',
    'Content-Length': fs.statSync(file).size,
    'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff'
  });
  fs.createReadStream(file).pipe(res);
}
function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 16_384) { reject(new Error('Запрос слишком большой')); req.destroy(); } });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Неверный JSON')); }
    });
    req.on('error', reject);
  });
}
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.ttf': 'font/ttf', '.ico': 'image/x-icon' };
function staticFile(req, res, pathname) {
  const file = path.resolve(publicDir, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!(file === path.join(publicDir, 'index.html') || file.startsWith(publicDir + path.sep))) return send(res, 403, { error: 'Недоступно' });
  let stat;
  try { stat = fs.statSync(file); } catch { return send(res, 404, { error: 'Файл не найден' }); }
  if (!stat.isFile()) return send(res, 404, { error: 'Файл не найден' });
  res.writeHead(200, {
    'Content-Type': types[path.extname(file)] || 'application/octet-stream',
    'Cache-Control': file.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data: blob:; script-src 'self' https://telegram.org; style-src 'self'; connect-src 'self'; base-uri 'none'; object-src 'none'"
  });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url || '/', 'http://localhost').pathname;
    if (pathname === '/health' && req.method === 'GET') return send(res, 200, { ok: true });
    if (!pathname.startsWith('/api/')) {
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, { error: 'Метод не разрешён' });
      return staticFile(req, res, pathname);
    }
    if (pathname === '/api/config' && req.method === 'GET') return send(res, 200, { demoMode: DEMO_MODE, gameName: 'HIStory' });
    const user = getRequestUser(req, { botToken: BOT_TOKEN, demoMode: DEMO_MODE });
    if (!user) return send(res, 401, { error: 'Откройте приложение из Telegram. Локально доступен деморежим.' });
    if (pathname === '/api/bootstrap' && req.method === 'GET') {
      return send(res, 200, {
        user: { name: user.name, demo: Boolean(user.demo) },
        mapAccess: mapAccess(user),
        stories: stories.map(story => publicStory(story, storage.get(user.id, story)))
      });
    }
    if (pathname === '/api/map' && req.method === 'GET') {
      if (!mapAccess(user).unlocked) return send(res, 403, { error: `Карта доступна после оплаты ${MAP_ACCESS_PRICE} ⭐.` });
      return sendProtectedMap(res);
    }
    if (pathname === '/api/map/invoice' && req.method === 'POST') {
      if (user.demo) return send(res, 409, { error: 'В деморежиме карта уже открыта.' });
      if (mapAccess(user).unlocked) return send(res, 409, { error: 'Карта уже открыта.' });
      const invoiceUrl = await createMapInvoiceLink(BOT_TOKEN, user.telegramId);
      return send(res, 200, { invoiceUrl });
    }
    const match = pathname.match(/^\/api\/story\/([a-z0-9-]+)(?:\/(advance|reset|back))?$/);
    if (!match) return send(res, 404, { error: 'Адрес не найден' });
    const story = getStory(match[1]);
    if (!story) return send(res, 404, { error: 'История не найдена' });
    if (!match[2] && req.method === 'GET') return send(res, 200, publicProgress(story, storage.get(user.id, story)));
    if (req.method !== 'POST') return send(res, 405, { error: 'Метод не разрешён' });
    if (match[2] === 'reset') {
      const state = initialProgress(story);
      storage.put(user.id, story, state);
      return send(res, 200, publicProgress(story, state));
    }
    if (match[2] === 'back') {
      const current = storage.get(user.id, story);
      const previous = rewind(story, current);
      storage.put(user.id, story, previous);
      return send(res, 200, publicProgress(story, previous));
    }
    if (match[2] === 'advance') {
      const body = await readJson(req);
      const current = storage.get(user.id, story);
      try {
        const next = advance(story, current, body);
        storage.put(user.id, story, next);
        return send(res, 200, publicProgress(story, next));
      } catch (e) { return send(res, 409, { error: e.message }); }
    }
    return send(res, 404, { error: 'Адрес не найден' });
  } catch (e) {
    console.error('Request error:', e);
    if (!res.headersSent) send(res, 500, { error: 'Внутренняя ошибка сервера' });
  }
});
server.listen(PORT, HOST, () => {
  console.info(`Mini App запущен: http://localhost:${PORT}`);
  if (DEMO_MODE) console.info('Деморежим включён — не используйте его на публичном сервере.');
  if (BOT_TOKEN && APP_URL) launchBot(BOT_TOKEN, APP_URL, { storage }).catch(console.error);
  else if (BOT_TOKEN) console.info('Для кнопки Telegram задайте APP_URL с HTTPS.');
});
