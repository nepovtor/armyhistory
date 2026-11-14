import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Storage } from '../server/storage.mjs';
import {
  MAP_ACCESS_CURRENCY,
  MAP_ACCESS_PRICE,
  MAP_ACCESS_PRODUCT,
  createMapInvoiceLink,
  mapInvoicePayload,
  validateMapCheckout
} from '../server/payments.mjs';
import { handleBotUpdate } from '../server/bot.mjs';

async function withStorage(run) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'army-stories-payment-'));
  try { return await run(new Storage(dir)); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test('ссылка Stars создаётся на 15 XTR без платёжного провайдера', async () => {
  const calls = [];
  const fakeFetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return { ok: true, json: async () => ({ ok: true, result: 'https://t.me/$invoice/map-test' }) };
  };
  const link = await createMapInvoiceLink('123:token', 123456, fakeFetch);
  assert.equal(link, 'https://t.me/$invoice/map-test');
  assert.match(calls[0].url, /\/createInvoiceLink$/);
  assert.equal(calls[0].body.currency, MAP_ACCESS_CURRENCY);
  assert.deepEqual(calls[0].body.prices, [{ label: 'Доступ к карте', amount: MAP_ACCESS_PRICE }]);
  assert.equal(calls[0].body.payload, mapInvoicePayload(123456));
  assert.equal(Object.hasOwn(calls[0].body, 'provider_token'), false);
});

test('pre-checkout принимает только владельца, XTR и точную сумму', () => withStorage(storage => {
  const valid = {
    id: 'checkout-1',
    from: { id: 123456 },
    invoice_payload: mapInvoicePayload(123456),
    currency: MAP_ACCESS_CURRENCY,
    total_amount: MAP_ACCESS_PRICE
  };
  assert.deepEqual(validateMapCheckout(valid, storage), { ok: true, userId: 'tg:123456' });
  for (const invalid of [
    { ...valid, from: { id: 777 } },
    { ...valid, currency: 'USD' },
    { ...valid, total_amount: 14 },
    { ...valid, invoice_payload: 'map-access:broken' }
  ]) assert.equal(validateMapCheckout(invalid, storage).ok, false);
  storage.grantEntitlement('tg:123456', MAP_ACCESS_PRODUCT, {
    telegramPaymentChargeId: 'charge-existing', amount: 15, currency: 'XTR', paidAt: '2026-11-14T00:00:00.000Z'
  });
  assert.equal(validateMapCheckout(valid, storage).ok, false);
}));

test('бот подтверждает корректный checkout и сохраняет только successful_payment', async () => withStorage(async storage => {
  const calls = [];
  const callApi = async (_token, method, args) => { calls.push({ method, args }); return true; };
  const checkout = {
    id: 'checkout-2', from: { id: 123456 }, invoice_payload: mapInvoicePayload(123456),
    currency: 'XTR', total_amount: 15
  };
  await handleBotUpdate({ pre_checkout_query: checkout }, { token: '123:token', appUrl: 'https://example.com', storage, callApi });
  assert.deepEqual(calls[0], {
    method: 'answerPreCheckoutQuery',
    args: { pre_checkout_query_id: 'checkout-2', ok: true }
  });
  assert.equal(storage.hasEntitlement('tg:123456', MAP_ACCESS_PRODUCT), false);

  const successfulPayment = {
    currency: 'XTR', total_amount: 15, invoice_payload: mapInvoicePayload(123456),
    telegram_payment_charge_id: 'charge-1', provider_payment_charge_id: ''
  };
  const update = { message: { from: { id: 123456 }, chat: { id: 123456, type: 'private' }, successful_payment: successfulPayment } };
  await handleBotUpdate(update, { token: '123:token', appUrl: 'https://example.com', storage, callApi });
  await handleBotUpdate(update, { token: '123:token', appUrl: 'https://example.com', storage, callApi });
  assert.equal(storage.hasEntitlement('tg:123456', MAP_ACCESS_PRODUCT), true);
  assert.equal(Object.keys(storage.db.payments).length, 1);
}));

test('бот отклоняет checkout с неверной суммой', async () => withStorage(async storage => {
  const calls = [];
  const callApi = async (_token, method, args) => { calls.push({ method, args }); return true; };
  await handleBotUpdate({ pre_checkout_query: {
    id: 'checkout-bad', from: { id: 123456 }, invoice_payload: mapInvoicePayload(123456),
    currency: 'XTR', total_amount: 150
  } }, { token: '123:token', appUrl: 'https://example.com', storage, callApi });
  assert.equal(calls[0].method, 'answerPreCheckoutQuery');
  assert.equal(calls[0].args.ok, false);
  assert.match(calls[0].args.error_message, /15/);
}));
