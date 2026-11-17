const tg = window.Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#0b1e2b');
    tg.setBackgroundColor?.('#0b1e2b');
  } catch { /* В обычном браузере Telegram API необязателен. */ }
}
const root = document.querySelector('#app');
const toastNode = document.querySelector('#toast');
const storeKey = 'history-demo-id';
let demoId = localStorage.getItem(storeKey);
if (!demoId || !/^[a-z0-9-]{8,80}$/i.test(demoId)) {
  demoId = 'reader-' + crypto.randomUUID();
  localStorage.setItem(storeKey, demoId);
}
const state = { view: 'loading', config: null, user: null, stories: [], story: null, progress: null, mapAccess: { unlocked: false, price: 15, currency: 'XTR' }, mapImageUrl: null, busy: false, error: null };
const art = {
  draftOffice: '/assets/chapter-1/01_minsk_draft_office.webp',
  threeYears: '/assets/chapter-1/02_three_years_in_navy.webp',
  trainDeparture: '/assets/chapter-1/03_evening_train_departure.webp',
  trainRecruits: '/assets/chapter-1/04_train_recruits.webp',
  simferopolArrival: '/assets/chapter-1/06_arrival_simferopol.webp',
  simferopolSleep: '/assets/chapter-1/07_simferopol_first_sleep.webp',
  haircut: '/assets/chapter-1/08_morning_haircut.webp',
  uniform: '/assets/chapter-1/09_naval_uniform.webp',
  sevastopolBarracks: '/assets/chapter-1/10_sevastopol_barracks.webp',
  examResult: '/assets/comic-v2/exam-result.webp',
  route: '/api/map',
  sea: '/assets/comic-v2/harbor.webp',
  harbor: '/assets/comic-v2/harbor.webp',
  barracks: '/assets/comic-v2/barracks.webp',
  marineOffer: '/assets/comic-v2/marine-offer.webp',
  sparring: '/assets/comic-v2/sparring.webp',
  decision: '/assets/comic-v2/decision.webp',
  diversMissed: '/assets/comic-v2/divers-missed.webp',
  cover: '/assets/chapter-1/09_naval_uniform.webp'
};
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[ch]);
const haptic = () => { try { tg?.HapticFeedback?.impactOccurred?.('light'); } catch { /* optional */ } };
let toastTimer;
function toast(message) {
  toastNode.textContent = message;
  toastNode.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastNode.classList.remove('show'), 3800);
}
async function api(path, options = {}) {
  const headers = { 'X-Demo-Id': demoId, ...options.headers };
  if (tg?.initData) headers['X-Telegram-Init-Data'] = tg.initData;
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = await fetch(path, { ...options, headers });
  let payload = null;
  try { payload = await response.json(); } catch { /* errors below */ }
  if (!response.ok) throw new Error(payload?.error || `Ошибка запроса (${response.status})`);
  return payload;
}
async function loadProtectedImage(path) {
  const headers = { 'X-Demo-Id': demoId };
  if (tg?.initData) headers['X-Telegram-Init-Data'] = tg.initData;
  const response = await fetch(path, { headers });
  if (!response.ok) {
    let payload = null;
    try { payload = await response.json(); } catch { /* errors below */ }
    throw new Error(payload?.error || `Ошибка загрузки карты (${response.status})`);
  }
  return URL.createObjectURL(await response.blob());
}
async function ensureMapImage() {
  if (!state.mapAccess.unlocked || state.mapImageUrl) return;
  state.mapImageUrl = art.route.startsWith('data:') ? art.route : await loadProtectedImage(art.route);
}
async function boot() {
  try {
    state.config = await api('/api/config');
    const data = await api('/api/bootstrap');
    state.user = data.user;
    state.mapAccess = data.mapAccess;
    state.stories = data.stories;
    state.story = data.stories[0];
    state.view = 'library';
    state.error = null;
    render();
  } catch (error) {
    state.error = error.message;
    state.view = 'error';
    render();
  }
}
function brand() {
  return `<div class="logo" aria-label="HIStory"><span class="logo-mark" aria-hidden="true">HI</span><div class="logo-label">HI<span>Story</span></div></div>`;
}
function header(back = 'library', actionLabel = 'Главная') {
  return `<header class="topbar"><button class="backlink" data-action="${back}" aria-label="${escapeHtml(actionLabel)}"><i>‹</i>${escapeHtml(actionLabel)}</button>${brand()}<button class="iconbtn" data-action="journal" title="Дневник истории" aria-label="Дневник истории">≡</button></header>`;
}
function libraryView() {
  const story = state.story;
  if (!story) return `<div class="errorbox">История пока недоступна.</div>`;
  const chapter = story.chapters[0], part = chapter.parts[0];
  const homeCover = '/assets/home-sevastopol-portrait.png';
  return `<main class="page home-view">
    <div class="home-visual"><img class="home-art" src="${homeCover}" alt="Моряк на фоне Севастопольской бухты и памятника затопленным кораблям" decoding="async" fetchpriority="high"/></div>
    <section class="home-content">
      <div class="home-brand" aria-label="HIStory. Три года до дома">
      <h1>HIStory</h1>
      <p class="home-tagline">Три года до дома</p>
      <p class="home-subtitle">Воспоминания о службе на атомной подводной лодке</p>
      </div>
    <nav class="home-actions" aria-label="Меню истории">
      <button class="home-action home-action-read" data-action="read"><span class="home-action-icon" aria-hidden="true">▶</span><span class="home-action-copy"><strong>${story.started ? 'Продолжить' : 'Начать историю'}</strong></span><span class="home-action-arrow" aria-hidden="true">›</span></button>
      <button class="home-action home-action-chapters" data-action="chapters"><span class="home-action-icon" aria-hidden="true">≡</span><span class="home-action-copy"><strong>Главы и части</strong></span><span class="home-action-arrow" aria-hidden="true">›</span></button>
      <button class="home-action home-action-journal" data-action="journal"><span class="home-action-icon" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M16 3c2.2 7 5.8 10.6 13 13-7.2 2.4-10.8 6-13 13-2.2-7-5.8-10.6-13-13 7.2-2.4 10.8-6 13-13z"/></svg></span><span class="home-action-copy"><strong>Дневник истории</strong></span><span class="home-action-arrow" aria-hidden="true">›</span></button>
    </nav>
    <div class="home-foot"><span>Глава 01</span><svg aria-hidden="true" viewBox="0 0 32 32"><path d="M16 4v21m-5-16h10M8 17a8 8 0 0 0 16 0M5 18l3-3 3 3m10 0 3-3 3 3"/><circle cx="16" cy="5" r="2"/></svg><span>${escapeHtml(part.title)}</span></div>
    </section>
  </main>`;
}
function chaptersView() {
  const story=state.story, chapter=story.chapters[0];
  const parts=chapter.parts.map(part=>{
    const locked=['upcoming','locked'].includes(part.status);
    const status=part.status==='done'?'Прочитано':part.status==='upcoming'?'Скоро':part.status==='locked'?'После предыдущей части':part.status==='current'&&story.started?'В процессе':'Доступно';
    const covers={1:'/assets/chapter-1/01_minsk_draft_office.webp',2:'/assets/comic-v2/sparring.webp',3:'/assets/comic-v2/divers-missed.webp'};
    const cover=covers[part.number]||'/assets/comic-v2/submarine.webp';
    return `<button class="part ${locked?'locked':''}" data-action="${locked?'locked':'read'}" data-part="${part.number}" ${locked?'disabled':''} aria-label="Часть ${part.number}. ${escapeHtml(part.title)}. ${status}">
      <span class="part-thumb"><img src="${cover}" alt="" loading="lazy" decoding="async"></span><span class="part-info"><em>Часть ${part.number} · ${status}</em><strong>${escapeHtml(part.title)}</strong><small>${escapeHtml(part.subtitle)}</small></span><span class="part-go" aria-hidden="true">${locked?'—':'→'}</span>
    </button>`;
  }).join('');
  return `<main class="page chapter-view">${header('library','Главная')}
    <section class="chapter-hero"><img src="${escapeHtml(chapter.poster)}" alt="Герой у областного военкомата в Минске" decoding="async"/><div class="chapter-hero-text"><div class="kicker">${escapeHtml(story.collection)} · Глава ${chapter.number}</div><h1>${escapeHtml(chapter.name)}</h1><p>${escapeHtml(chapter.subtitle)}</p></div></section>
    <section class="chapter-section"><div class="section-title"><h2>Части главы</h2><span class="tiny">3 части</span></div>${parts}</section>
    <p class="chapter-footer">Части открываются по порядку. События основаны на личных воспоминаниях и не меняются читательским выбором.</p>
    <div class="chapter-next">1990—1993 · Атомный подводный флот</div>
  </main>`;
}

function routeLegend() {
  return `<ol class="route-legend" aria-label="Пункты схематичного маршрута"><li>Минск</li><li>Симферополь</li><li>Севастополь</li></ol>`;
}

function sceneMedia(scene, image, routeScene) {
  if (routeScene && !state.mapAccess.unlocked) {
    return `<section class="scene-media map-paywall" aria-label="Платный доступ к карте"><span class="map-lock" aria-hidden="true">Карта</span><div><strong>Открыть маршрут</strong><p>Разовый доступ сохранится за вашим Telegram-аккаунтом.</p></div><button class="btn map-buy" data-action="buy-map"><span class="btn-copy">Открыть за ${state.mapAccess.price} ⭐</span><span class="arrow" aria-hidden="true">→</span></button></section>`;
  }
  if (routeScene) {
    return `<figure class="scene-media route-media">
      <div class="scene-frame route-frame"><img class="scene-image route-map" src="${escapeHtml(image)}" alt="Схематичная карта маршрута из Минска через Симферополь в Севастополь" decoding="async"/></div>
      <figcaption class="scene-caption"><strong>${escapeHtml(scene.label)}</strong><span>Маршрут показан схематично</span>${routeLegend()}<button class="text-action" data-action="zoom-map">Развернуть карту</button></figcaption>
      <dialog class="map-dialog" aria-label="Карта маршрута крупным планом"><div class="map-dialog-bar"><strong>Минск → Симферополь → Севастополь</strong><button class="dialog-close" data-action="close-map" aria-label="Закрыть карту">Закрыть</button></div><div class="map-dialog-scroll"><img src="${escapeHtml(image)}" alt="Схематичная карта маршрута из Минска через Симферополь в Севастополь" decoding="async"/></div>${routeLegend()}</dialog>
    </figure>`;
  }
  return `<figure class="scene-media"><div class="scene-frame"><img class="scene-image" src="${escapeHtml(image)}" alt="Иллюстрация к эпизоду: ${escapeHtml(scene.label)}" decoding="async"/></div><figcaption class="scene-caption"><strong>${escapeHtml(scene.label)}</strong><span>${escapeHtml(state.progress.part.title)}</span></figcaption></figure>`;
}

function readerView() {
  const p=state.progress, scene=p.scene, end=scene.type==='part_end', isChoice=scene.type==='choice';
  const image=scene.background==='route' ? state.mapImageUrl : art[scene.background]||art.cover;
  const routeScene=scene.background==='route';
  const step=String(Math.min(p.visitedCount,99)).padStart(2,'0');
  const actions=end
    ? scene.next
      ? `<button class="btn wide" data-action="next"><span class="btn-copy">Начать часть ${scene.part + 1}</span><span class="arrow">→</span></button><button class="subtle-btn" data-action="chapters" aria-label="К частям главы">≡</button>`
      : `<button class="btn wide" data-action="chapters"><span class="btn-copy">К частям главы</span><span class="arrow">›</span></button><button class="subtle-btn" data-action="restart" aria-label="Начать заново">↻</button>`
    : isChoice
      ? `<div class="choices">${scene.choices.map(c=>`<button class="choice" data-action="choice" data-choice="${escapeHtml(c.id)}"><strong>${escapeHtml(c.text)}</strong><small>${escapeHtml(c.hint)}</small></button>`).join('')}</div>`
      : `<button class="btn wide" data-action="next"><span class="btn-copy">${scene.type==='archive'?'Продолжить':'Далее'}</span><span class="arrow">→</span></button>`;
  return `<main class="reader ${end?'part-end':''}">
    <div class="reader-hud"><button class="iconbtn" data-action="chapters" aria-label="Вернуться к главам">←</button>
      <div class="reader-count"><div class="chapter-label"><span>Глава ${p.chapter.number} · часть ${p.part.number}</span><span>${p.partProgress}%</span></div><div class="progress-track" role="progressbar" aria-label="Прогресс части" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.partProgress}"><div class="progress-fill" style="width:${p.partProgress}%"></div></div></div>
      <button class="iconbtn" data-action="journal" aria-label="Дневник истории" title="Дневник">≡</button></div>
    <div class="reader-scroll">${sceneMedia(scene, image, routeScene)}
    <section class="story-panel" aria-label="Текущая сцена"><div class="panel-top"><span class="eyebrow">${end?'Часть завершена':scene.type==='archive'?'Из воспоминаний':isChoice?'Выбери деталь':'От первого лица'}</span><span class="panel-step">${end?'Конец':step}</span></div>
      <p class="scene-text">${escapeHtml(scene.text)}</p>
      ${scene.note?`<div class="scene-note">${escapeHtml(scene.note)}</div>`:''}
      ${isChoice?'<div class="scene-note">Выбор меняет ракурс чтения, но не реальные события.</div>':''}
      <div class="panel-actions">${!end&&p.canGoBack?'<button class="subtle-btn" data-action="back-scene" aria-label="К предыдущей сцене">←</button>':''}${actions}</div>
    </section></div>
  </main>`;
}
function journalView() {
  const p=state.progress, decisions=p?.decisions||[];
  return `<main class="page journal-view">${header(p?'read':'library',p?'К чтению':'Главная')}
    <section class="journal-header"><div class="eyebrow">Бортовой журнал · 1990—1993</div><h1>Дневник<br>истории</h1><p class="journal-description">Даты и места из воспоминаний. Первую часть можно перечитать в любой момент.</p>
      <div class="kicker">Известные даты</div>
      <div class="milestone"><span class="index">19</span><div><strong>Ноябрь 1990 · военкомат</strong><p>Известие о трёхлетней службе в ВМФ.</p></div></div>
      <div class="milestone"><span class="index">19</span><div><strong>Вечер · поезд из Минска</strong><p>Через Симферополь — в Севастополь.</p></div></div>
      <div class="milestone"><span class="index">21</span><div><strong>Ночь · Севастополь</strong><p>Тёмная казарма, нижняя койка, обычная одежда.</p></div></div>
      <div class="milestone"><span class="index">25</span><div><strong>Ноябрь 1990 · распределительный пункт</strong><p>Экзамен у морпехов, отказ и уехавшая группа водолазов.</p></div></div>
      <div class="kicker" style="margin-top:25px">Твой путь</div>
      ${decisions.length?decisions.map((d,i)=>`<div class="milestone"><span class="index">0${i+1}</span><div><strong>${escapeHtml(d.summary)}</strong><p>Глава ${d.chapter}, часть ${d.part}</p></div></div>`).join(''):'<div class="journal-empty">Ты ещё не выбирал, на какой детали остановиться. Продолжай чтение.</div>'}
      <div style="margin-top:22px"><button class="btn wide" data-action="${p?'read':'chapters'}"><span class="btn-copy">${p?'Вернуться к чтению':'Открыть главу'}</span><span class="arrow">→</span></button></div>
    </section>
  </main>`;
}
function render() {
  root.innerHTML = `<div class="shell">${state.view === 'loading' ? `<div class="loading"><div>HIStory</div><small>Открываем архив…</small></div>` : state.view === 'error' ? `<main class="page">${header('library')}<div class="errorbox"><div class="eyebrow">НЕ УДАЛОСЬ ОТКРЫТЬ</div><h2>Приложение недоступно</h2><p>${escapeHtml(state.error)}</p><p style="font-size:12px;color:#a8b3b0">Для проверки в браузере запусти <code>npm run dev</code>. Для запуска внутри Telegram потребуется настроенный бот и HTTPS-адрес.</p><button class="btn wide" data-action="retry">Повторить <span>↻</span></button></div></main>` : state.view === 'library' ? libraryView() : state.view === 'chapters' ? chaptersView() : state.view === 'reader' ? readerView() : journalView()}</div>`;
}
async function openReader(targetPart = null) {
  state.progress = await api(`/api/story/${state.story.id}`);
  if (targetPart && targetPart > state.progress.part.number && state.progress.partCompleted && state.progress.scene.next) {
    state.progress = await api(`/api/story/${state.story.id}/advance`, { method: 'POST', body: JSON.stringify({ nodeId: state.progress.scene.id }) });
  }
  if (state.progress.scene.background === 'route') await ensureMapImage();
  state.view = 'reader';
  render();
}
async function loadLibrary() {
  const data = await api('/api/bootstrap');
  state.mapAccess = data.mapAccess;
  state.stories = data.stories;
  state.story = data.stories.find(s => s.id === state.story?.id) || data.stories[0];
}
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
async function refreshMapAccess() {
  for (let attempt = 0; attempt < 6; attempt++) {
    const data = await api('/api/bootstrap');
    state.mapAccess = data.mapAccess;
    state.stories = data.stories;
    state.story = data.stories.find(s => s.id === state.story?.id) || data.stories[0];
    if (state.mapAccess.unlocked) {
      await ensureMapImage();
      return true;
    }
    if (attempt < 5) await wait(700);
  }
  return false;
}
async function buyMap() {
  if (!tg?.openInvoice) throw new Error('Оплата Stars доступна только внутри Telegram.');
  const { invoiceUrl } = await api('/api/map/invoice', { method: 'POST' });
  const status = await new Promise((resolve, reject) => {
    try { tg.openInvoice(invoiceUrl, resolve); }
    catch (error) { reject(error); }
  });
  if (status === 'cancelled') return toast('Оплата отменена. Карта останется здесь, когда захотите вернуться.');
  if (status === 'failed') return toast('Оплата не прошла. Попробуйте ещё раз.');
  if (!['paid', 'pending'].includes(status)) return toast('Статус оплаты пока неизвестен.');
  const unlocked = await refreshMapAccess();
  render();
  if (unlocked) {
    haptic();
    toast('Карта открыта навсегда.');
  } else {
    toast(status === 'pending' ? 'Платёж обрабатывается. Карта откроется после подтверждения Telegram.' : 'Платёж получен Telegram. Обновите экран через несколько секунд.');
  }
}
async function navigate(action, button) {
  if (state.busy) return;
  if (action === 'retry') return boot();
  if (action === 'locked') return toast('Эта часть появится после продолжения воспоминаний.');
  if (action === 'zoom-map') {
    const dialog = root.querySelector('.map-dialog');
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    return;
  }
  if (action === 'close-map') {
    const dialog = button.closest('dialog');
    if (!dialog) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    return;
  }
  if (action === 'journal') { state.view = 'journal'; render(); return; }
  if (action === 'library') { await loadLibrary(); state.view = 'library'; render(); return; }
  if (action === 'chapters') { await loadLibrary(); state.view = 'chapters'; render(); return; }
  if (action === 'read') return openReader(Number(button.dataset.part) || null);
  if (action === 'buy-map') {
    state.busy = true;
    try { await buyMap(); }
    finally { state.busy = false; }
    return;
  }
  if (action === 'restart') {
    if (!confirm('Начать первую часть заново? Текущий прогресс этой истории будет сброшен.')) return;
  }
  if (!['next','back-scene','choice','restart'].includes(action)) return;
  state.busy = true;
  try {
    const url = `/api/story/${state.story.id}/${action === 'next' || action === 'choice' ? 'advance' : action === 'back-scene' ? 'back' : 'reset'}`;
    const body = action === 'next' || action === 'choice' ? { nodeId: state.progress.scene.id, ...(action === 'choice' ? { choiceId: button.dataset.choice } : {}) } : {};
    const next = await api(url, { method: 'POST', body: JSON.stringify(body) });
    state.progress = next;
    if (state.progress.scene.background === 'route') await ensureMapImage();
    state.view = 'reader';
    haptic();
    render();
  } catch (error) {
    toast(error.message);
    if (error.message.includes('уже пройдена')) {
      try { state.progress = await api(`/api/story/${state.story.id}`); render(); } catch { /* allow retry */ }
    }
  } finally { state.busy = false; }
}
root.addEventListener('click', async event => {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  try { await navigate(target.dataset.action, target); }
  catch (error) { toast(error.message); }
});
document.addEventListener('keydown', event => {
  if (state.busy || state.view !== 'reader') return;
  if (event.key === 'ArrowRight' && state.progress?.scene?.type !== 'choice' && !state.progress.partCompleted) {
    event.preventDefault();
    navigate('next', {});
  } else if (event.key === 'ArrowLeft' && state.progress?.canGoBack) {
    event.preventDefault();
    navigate('back-scene', {});
  }
});
render();
boot();
