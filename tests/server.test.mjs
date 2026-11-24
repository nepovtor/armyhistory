import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { stories } from '../server/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));

async function withServer(production, run) {
  const probe = net.createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const { port } = probe.address();
  await new Promise(resolve => probe.close(resolve));
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'armyhistory-http-'));
  const child = spawn(process.execPath, ['server/index.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), DATA_DIR: dir,
      NODE_ENV: production ? 'production' : 'development', DEMO_MODE: '1',
      BOT_TOKEN: production ? 'test-token-no-network' : '', APP_URL: '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  try {
    await new Promise((resolve, reject) => {
      child.stdout.on('data', data => { if (data.toString().includes('Mini App запущен')) resolve(); });
      child.once('error', reject);
      child.once('exit', code => reject(new Error(`Server exited before listening: ${code}`)));
    });
    await run(`http://127.0.0.1:${port}`);
  } finally {
    if (child.exitCode === null) {
      const stopped = once(child, 'exit');
      child.kill();
      await stopped;
    }
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

test('HTTP: три части читаются бесплатно, прогресс сохраняется, отсутствующая карта не продаётся', { timeout: 10000 }, () => withServer(false, async base => {
  const headers = { 'X-Demo-Id': 'reader-http-test', 'Content-Type': 'application/json' };
  const request = async (url, body) => {
    const response = await fetch(base + url, { headers, ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) });
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    return response.json();
  };
  assert.equal((await fetch(base + '/api/bootstrap')).status, 401);
  const bootstrap = await request('/api/bootstrap');
  assert.equal(bootstrap.stories.length, 1);
  const url = `/api/story/${stories[0].id}`;
  let progress = await request(url);
  for (const scene of stories[0].scenes) {
    assert.equal(progress.scene.id, scene.id);
    assert.equal(progress.scene.artwork, null);
    if (scene.next) progress = await request(url + '/advance', { nodeId: scene.id });
  }
  assert.equal((await request(url)).scene.id, stories[0].scenes.at(-1).id);
  assert.equal((await request('/api/bootstrap')).stories[0].completed, true);
  assert.equal((await request(url + '/back', {})).scene.id, stories[0].scenes.at(-2).id);
  assert.equal((await request(url + '/reset', {})).scene.id, stories[0].start);
  assert.equal((await fetch(base + '/api/map', { headers })).status, 404);
  assert.equal((await fetch(base + '/api/map/invoice', { headers, method: 'POST' })).status, 404);
}));

test('HTTP production: DEMO_MODE=1 не разрешает клиенту вход без Telegram initData', { timeout: 10000 }, () => withServer(true, async base => {
  assert.equal((await fetch(base + '/health')).status, 200);
  const config = await (await fetch(base + '/api/config')).json();
  assert.equal(config.demoMode, false);
  const denied = await fetch(base + '/api/bootstrap', { headers: { 'X-Demo-Id': 'reader-http-test' } });
  assert.equal(denied.status, 401);
}));
