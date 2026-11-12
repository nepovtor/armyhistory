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

export async function launchBot(token, appUrl) {
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
      const updates = await call(token, 'getUpdates', { offset, timeout: 25, allowed_updates: ['message'] }, AbortSignal.timeout(36000));
      for (const update of updates) {
        offset = update.update_id + 1;
        const message = update.message;
        if (!message?.text?.startsWith('/')) continue;
        if (message.chat?.type !== 'private') continue;
        if (message.text.startsWith('/start')) {
          await call(token, 'sendMessage', {
            chat_id: message.chat.id,
            text: '«Три года до дома» — воспоминания о начале службы. Открой первую главу и читай историю по частям.',
            reply_markup: { inline_keyboard: [[{ text: '📖 Открыть «HIStory»', web_app: webApp }]] }
          });
        } else if (message.text.startsWith('/help')) {
          await call(token, 'sendMessage', { chat_id: message.chat.id, text: 'Читай историю по главам и частям. Можно рассматривать детали повествования и возвращаться к чтению — прогресс сохранится автоматически. Для старта нажми кнопку «Читать истории» рядом с полем ввода.' });
        }
      }
    } catch (e) {
      console.error('Ошибка Telegram long polling:', e.message);
      await sleep(4000);
    }
  }
}
