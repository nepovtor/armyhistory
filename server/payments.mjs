export const MAP_ACCESS_PRODUCT = 'route-map';
export const MAP_ACCESS_PRICE = 15;
export const MAP_ACCESS_CURRENCY = 'XTR';

const TELEGRAM_API = 'https://api.telegram.org/bot';

function telegramUserId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function mapInvoicePayload(telegramId) {
  const id = telegramUserId(telegramId);
  if (!id) throw new Error('Некорректный Telegram ID');
  return `map-access:${id}`;
}

export async function createMapInvoiceLink(token, telegramId, fetchImpl = fetch) {
  if (!token) throw new Error('BOT_TOKEN не настроен');
  const response = await fetchImpl(`${TELEGRAM_API}${token}/createInvoiceLink`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Карта маршрута',
      description: 'Разовый доступ к карте маршрута Минск — Симферополь — Севастополь.',
      payload: mapInvoicePayload(telegramId),
      currency: MAP_ACCESS_CURRENCY,
      prices: [{ label: 'Доступ к карте', amount: MAP_ACCESS_PRICE }]
    })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok || typeof result.result !== 'string') {
    throw new Error(`Telegram createInvoiceLink: ${result?.description || response.status}`);
  }
  return result.result;
}

function validatePaymentFields({ telegramId, payload, currency, amount }) {
  const id = telegramUserId(telegramId);
  if (!id || payload !== mapInvoicePayload(id)) {
    return { ok: false, errorMessage: 'Счёт выписан для другого пользователя. Откройте карту заново.' };
  }
  if (currency !== MAP_ACCESS_CURRENCY || amount !== MAP_ACCESS_PRICE) {
    return { ok: false, errorMessage: `Проверьте сумму: доступ к карте стоит ${MAP_ACCESS_PRICE} ⭐.` };
  }
  return { ok: true, userId: `tg:${id}` };
}

export function validateMapCheckout(query, storage) {
  const validation = validatePaymentFields({
    telegramId: query?.from?.id,
    payload: query?.invoice_payload,
    currency: query?.currency,
    amount: query?.total_amount
  });
  if (!validation.ok) return validation;
  if (storage.hasEntitlement(validation.userId, MAP_ACCESS_PRODUCT)) {
    return { ok: false, errorMessage: 'Карта уже доступна — повторная оплата не нужна.' };
  }
  return validation;
}

export function completeMapPayment(message, storage) {
  const payment = message?.successful_payment;
  const validation = validatePaymentFields({
    telegramId: message?.from?.id,
    payload: payment?.invoice_payload,
    currency: payment?.currency,
    amount: payment?.total_amount
  });
  if (!validation.ok) return validation;
  const chargeId = payment?.telegram_payment_charge_id;
  if (typeof chargeId !== 'string' || !chargeId || chargeId.length > 200) {
    return { ok: false, errorMessage: 'Telegram не передал идентификатор платежа.' };
  }
  const granted = storage.grantEntitlement(validation.userId, MAP_ACCESS_PRODUCT, {
    telegramPaymentChargeId: chargeId,
    amount: payment.total_amount,
    currency: payment.currency,
    paidAt: new Date().toISOString()
  });
  return { ...validation, granted };
}
