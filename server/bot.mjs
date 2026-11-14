import { completeMapPayment, validateMapCheckout } from './payments.mjs';

const API = 'https://api.telegram.org/bot';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function call(token, method, args, signal) {
  const res = await fetch(`${API}${token}/${method}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args), signal
  });
  const json = await res.json();
  if (!res.ok || !json.ok) throw new Error(`Telegram ${method}: ${json.description || res.status}`);
  return json.result;
}

export async function handleBotUpdate(update, { token, appUrl, storage, callApi = call }) {
  const checkout = update.pre_checkout_query;
  if (checkout) {
    const validation = validateMapCheckout(checkout, storage);
    const args = { pre_checkout_query_id: checkout.id, ok: validation.ok };
    if (!validation.ok) args.error_message = validation.errorMessage;
    await callApi(token, 'answerPreCheckoutQuery', args);
    return;
  }
  const message = update.message;
  if (message?.successful_payment) {
    const result = completeMapPayment(message, storage);
    if (!result.ok) {
      console.error('Отклонён некорректный successful_payment:', result.errorMessage);
      return;
    }
    if (result.granted && message.chat?.type === 'private') {
      await callApi(token, 'sendMessage', {
        chat_id: message.chat.id,
        text: 'Оплата получена. Карта маршрута теперь открыта навсегда.',
        reply_markup: { inline_keyboard: [[{ text: '🗺 Открыть карту', web_app: { url: appUrl } }]] }
      });
    }
    return;
  }
  if (!message?.text?.startsWith('/') || message.chat?.type !== 'private') return;
  const webApp = { url: appUrl };
  if (message.text.startsWith('/start')) {
    await callApi(token, 'sendMessage', {
      chat_id: message.chat.id,
      text: '«Три года до дома» — воспоминания о начале службы. Открой первую главу и читай историю по частям.',
      reply_markup: { inline_keyboard: [[{ text: '📖 Открыть «HIStory»', web_app: webApp }]] }
    });
  } else if (message.text.startsWith('/help')) {
    await callApi(token, 'sendMessage', { chat_id: message.chat.id, text: 'Читай историю по главам и частям. Можно рассматривать детали повествования и возвращаться к чтению — прогресс сохранится автоматически. Для старта нажми кнопку «Читать истории» рядом с полем ввода.' });
  }
}

export async function launchBot(token, appUrl, { storage } = {}) {
  if (!token || !/^https:\/\//i.test(appUrl)) return;
  const webApp = { url: appUrl };
  try {
    await call(token, 'setChatMenuButton', { menu_button: { type: 'web_app', text: 'Читать истории', web_app: webApp } });
    await call(token, 'setMyCommands', { commands: [{ command: 'start', description: 'Открыть игру' }, { command: 'help', description: 'Как играть' }] });
    console.info('Кнопка Mini App установлена в Telegram.');
  } catch (e) { console.error('Не удалось установить меню:', e.message); }
  let offset = 0;
  // Long polling; запускайте только один экземпляр приложения.
  while (true) {
    try {
      const updates = await call(token, 'getUpdates', { offset, timeout: 25, allowed_updates: ['message', 'pre_checkout_query'] }, AbortSignal.timeout(36000));
      for (const update of updates) {
        offset = update.update_id + 1;
        await handleBotUpdate(update, { token, appUrl, storage });
      }
    } catch (e) {
      console.error('Ошибка Telegram long polling:', e.message);
      await sleep(4000);
    }
  }
}
