import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Storage } from '../server/storage.mjs';
import {
  playbackProducts, playbackFormats, playbackInvoicePayload, playbackProductForPayload,
  createPlaybackInvoiceLink, validatePlaybackCheckout, completePlaybackPayment
} from '../server/playback.mjs';

function withStorage(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'history-playback-'));
  return Promise.resolve().then(() => run(new Storage(dir), dir)).finally(() => fs.rmSync(dir, { recursive: true, force: true }));
}

test('аудио и видео — разные продукты в разработке, без цены и покупки', () => withStorage(async storage => {
  const formats = playbackFormats(storage, 'tg:123456');
  assert.deepEqual(formats.map(format => format.id), ['read', 'audio', 'video']);
  assert.equal(formats[0].purchase, 'free');
  for (const product of playbackProducts) {
    const format = formats.find(format => format.id === product.format);
    assert.equal(format.status, 'development');
    assert.equal(format.price, null);
    assert.equal(format.purchasable, false);
    let calls = 0;
    await assert.rejects(createPlaybackInvoiceLink('test-token', 123456, product, async () => { calls++; }), /разработке/);
    assert.equal(calls, 0);
    const payload = playbackInvoicePayload(product, 123456);
    const checkout = { from: { id: 123456 }, invoice_payload: payload, currency: 'XTR', total_amount: 1 };
    assert.equal(validatePlaybackCheckout(checkout, storage, product).ok, false);
    assert.equal(completePlaybackPayment({ from: checkout.from, successful_payment: { ...checkout, telegram_payment_charge_id: 'fake-charge' } }, storage, product).ok, false);
    assert.equal(storage.hasEntitlement('tg:123456', product.id), false);
  }
  assert.equal(Object.keys(storage.db.payments).length, 0);
}));

test('подготовленный Stars-инвойс использует серверную цену и привязку формата к Telegram ID', async () => {
  const product = { ...playbackProducts[0], status: 'ready', mediaReady: true, supportReady: true, price: 27 };
  const calls = [];
  const url = await createPlaybackInvoiceLink('test-token', 123456, product, async (url, opts) => {
    calls.push({ url, body: JSON.parse(opts.body) });
    return { ok: true, json: async () => ({ ok: true, result: 'https://t.me/$test-audio' }) };
  });
  assert.equal(url, 'https://t.me/$test-audio');
  assert.equal(calls[0].body.currency, 'XTR');
  assert.deepEqual(calls[0].body.prices, [{ label: product.invoiceTitle, amount: 27 }]);
  assert.equal(calls[0].body.payload, playbackInvoicePayload(product, 123456));
  assert.equal(Object.hasOwn(calls[0].body, 'provider_token'), false);
  assert.equal(playbackProductForPayload(calls[0].body.payload).id, product.id);
  assert.equal(playbackProductForPayload('route-map:123456'), null);
  assert.equal(playbackProductForPayload('chapter-1-audio:123456:extra'), null);
  for (const value of [0, -1, 'demo:123456', Number.MAX_SAFE_INTEGER + 1]) assert.throws(() => playbackInvoicePayload(product, value), /Telegram ID/);
});

test('оплата одного формата не открывает другой или карту; повторная доставка идемпотентна', () => withStorage(async (storage, dir) => {
  const product = { ...playbackProducts[1], status: 'ready', mediaReady: true, supportReady: true, price: 39 };
  const query = { from: { id: 123456 }, invoice_payload: playbackInvoicePayload(product, 123456), currency: 'XTR', total_amount: 39 };
  assert.equal(validatePlaybackCheckout(query, storage, product).ok, true);
  for (const bad of [
    { ...query, from: { id: 777 } }, { ...query, currency: 'USD' }, { ...query, total_amount: 1 },
    { ...query, invoice_payload: playbackInvoicePayload(playbackProducts[0], 123456) }
  ]) assert.equal(validatePlaybackCheckout(bad, storage, product).ok, false);
  const message = { from: query.from, successful_payment: { ...query, telegram_payment_charge_id: 'video-charge-1' } };
  assert.equal(completePlaybackPayment(message, storage, product).granted, true);
  assert.equal(completePlaybackPayment(message, storage, product).granted, false);
  assert.equal(validatePlaybackCheckout(query, storage, product).ok, false);
  const restarted = new Storage(dir);
  assert.equal(restarted.hasEntitlement('tg:123456', 'chapter-1-video'), true);
  assert.equal(restarted.hasEntitlement('tg:123456', 'chapter-1-audio'), false);
  assert.equal(restarted.hasEntitlement('tg:123456', 'route-map'), false);
  assert.equal(restarted.hasEntitlement('tg:777', 'chapter-1-video'), false);
  assert.equal(Object.keys(restarted.db.payments).length, 1);
}));

test('статуса ready недостаточно без готового медиа, поддержки и установленной цены', () => withStorage(async storage => {
  for (const fields of [{ mediaReady: false }, { supportReady: false }, { price: null }, { price: -1 }, { price: 1.5 }]) {
    const product = { ...playbackProducts[0], status: 'ready', mediaReady: true, supportReady: true, price: 27, ...fields };
    await assert.rejects(createPlaybackInvoiceLink('test-token', 123456, product), /разработке/);
    const query = { from: { id: 123456 }, invoice_payload: playbackInvoicePayload(product, 123456), currency: 'XTR', total_amount: product.price };
    assert.equal(validatePlaybackCheckout(query, storage, product).ok, false);
  }
}));
