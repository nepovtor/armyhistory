import { STARS_CURRENCY } from './payments.mjs';

export const playbackProducts = Object.freeze([
  Object.freeze({ id: 'chapter-1-audio', format: 'audio', label: 'Прослушать историю', invoiceTitle: 'Аудиоверсия · Глава 1', status: 'development', price: null, mediaReady: false, supportReady: false }),
  Object.freeze({ id: 'chapter-1-video', format: 'video', label: 'Посмотреть мини-ролик', invoiceTitle: 'Мини-фильм · Глава 1', status: 'development', price: null, mediaReady: false, supportReady: false })
]);

function purchasable(product) {
  return product?.status === 'ready' && product.mediaReady === true && product.supportReady === true
    && Number.isSafeInteger(product.price) && product.price > 0;
}

export function playbackFormats(storage, userId) {
  return [
    { id: 'read', label: 'Читать историю', status: 'available', purchase: 'free', price: null, purchasable: false, owned: true },
    ...playbackProducts.map(product => ({
      id: product.format, productId: product.id, label: product.label, status: product.status,
      purchase: 'separate', price: purchasable(product) ? product.price : null,
      purchasable: purchasable(product), owned: Boolean(storage?.hasEntitlement(userId, product.id))
    }))
  ];
}

export function playbackInvoicePayload(product, telegramId) {
  const id = Number(telegramId);
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error('Некорректный Telegram ID');
  if (!/^chapter-1-(audio|video)$/.test(product?.id)) throw new Error('Формат не найден');
  return `${product.id}:${id}`;
}

export function playbackProductForPayload(payload) {
  if (typeof payload !== 'string') return null;
  const match = payload.match(/^(chapter-1-(?:audio|video)):[1-9][0-9]*$/);
  return match ? playbackProducts.find(product => product.id === match[1]) ?? null : null;
}

export async function createPlaybackInvoiceLink(token, telegramId, product, fetchImpl = fetch) {
  if (!purchasable(product)) throw new Error('Этот формат ещё в разработке. Оплата недоступна.');
  if (!token) throw new Error('BOT_TOKEN не настроен');
  const payload = playbackInvoicePayload(product, telegramId);
  const response = await fetchImpl(`https://api.telegram.org/bot${token}/createInvoiceLink`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: product.invoiceTitle, description: 'Разовая покупка первой главы в выбранном формате.',
      payload, currency: STARS_CURRENCY,
      prices: [{ label: product.invoiceTitle, amount: product.price }]
    })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok || typeof result.result !== 'string') throw new Error('Не удалось создать счёт Telegram Stars.');
  return result.result;
}

function validateFields(telegramId, payment, product) {
  if (!purchasable(product)) return { ok: false, errorMessage: 'Этот формат ещё в разработке. Оплата недоступна.' };
  const id = Number(telegramId);
  if (!Number.isSafeInteger(id) || id <= 0 || payment?.invoice_payload !== playbackInvoicePayload(product, id)) {
    return { ok: false, errorMessage: 'Счёт выписан для другого пользователя или формата.' };
  }
  if (payment.currency !== STARS_CURRENCY || payment.total_amount !== product.price) {
    return { ok: false, errorMessage: 'Валюта или сумма платежа не совпадает со счётом.' };
  }
  return { ok: true, userId: `tg:${id}` };
}

export function validatePlaybackCheckout(query, storage, product) {
  const validation = validateFields(query?.from?.id, query, product);
  if (!validation.ok) return validation;
  return storage.hasEntitlement(validation.userId, product.id)
    ? { ok: false, errorMessage: 'Этот формат уже куплен. Повторная оплата не нужна.' } : validation;
}

export function completePlaybackPayment(message, storage, product) {
  const payment = message?.successful_payment;
  const validation = validateFields(message?.from?.id, payment, product);
  if (!validation.ok) return validation;
  const chargeId = payment.telegram_payment_charge_id;
  if (typeof chargeId !== 'string' || !chargeId || chargeId.length > 200) return { ok: false, errorMessage: 'Не передан идентификатор платежа Telegram.' };
  const granted = storage.grantEntitlement(validation.userId, product.id, {
    telegramPaymentChargeId: chargeId, amount: payment.total_amount,
    currency: payment.currency, paidAt: new Date().toISOString()
  });
  return { ...validation, granted };
}
