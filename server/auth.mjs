import crypto from 'node:crypto';

export function verifyTelegramInitData(raw, token, maxAgeSeconds = 86400) {
  if (!raw || !token || raw.length > 16384) return null;
  try {
    const params = new URLSearchParams(raw);
    const all = [...params.entries()];
    if (new Set(all.map(([k]) => k)).size !== all.length) return null;
    const givenHash = params.get('hash');
    const authDate = Number(params.get('auth_date'));
    if (!givenHash || !/^[0-9a-f]{64}$/i.test(givenHash)) return null;
    if (!Number.isSafeInteger(authDate)) return null;
    const now = Math.floor(Date.now() / 1000);
    if (authDate > now + 60 || now - authDate > maxAgeSeconds) return null;
    const pairs = all.filter(([key]) => key !== 'hash').sort(([a], [b]) => a.localeCompare(b, 'en')).map(([k, v]) => `${k}=${v}`).join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const actual = crypto.createHmac('sha256', secret).update(pairs).digest();
    const expected = Buffer.from(givenHash, 'hex');
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;
    const user = JSON.parse(params.get('user') || 'null');
    if (!user || !Number.isSafeInteger(user.id) || user.id <= 0) return null;
    return { id: `tg:${user.id}`, name: String(user.first_name || 'Игрок').slice(0, 80), telegramId: user.id };
  } catch { return null; }
}

export function getRequestUser(req, { botToken, demoMode }) {
  const initData = req.headers['x-telegram-init-data'];
  const verified = verifyTelegramInitData(typeof initData === 'string' ? initData : '', botToken);
  if (verified) return verified;
  // Режим демо предназначен ТОЛЬКО для локальной разработки.
  if (demoMode) {
    const id = req.headers['x-demo-id'];
    if (typeof id === 'string' && /^[a-z0-9-]{8,80}$/i.test(id)) return { id: `demo:${id}`, name: 'Читатель', demo: true };
  }
  return null;
}
