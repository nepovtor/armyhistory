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
const state = { view: 'loading', config: null, user: null, stories: [], story: null, progress: null, busy: false, error: null };
const art = {
  station: '/assets/comic-v2/enlist.webp',
  paper: '/assets/comic-v2/commissariat.webp',
  train: '/assets/comic-v2/train.webp',
  route: '/assets/route.svg',
  sea: '/assets/comic-v2/harbor.webp',
  harbor: '/assets/comic-v2/harbor.webp',
  barracks: '/assets/comic-v2/barracks.webp',
  marineOffer: '/assets/comic-v2/marine-offer.webp',
  sparring: '/assets/comic-v2/sparring.webp',
  decision: '/assets/comic-v2/decision.webp',
  diversMissed: '/assets/comic-v2/divers-missed.webp',
  cover: '/assets/comic-v2/cover.webp'
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
async function boot() {
  try {
    state.config = await api('/api/config');
    const data = await api('/api/bootstrap');
    state.user = data.user;
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
  return `<div class="logo" aria-label="HIStory"><span class="logo-mark" aria-hidden="true">⚓</span><div class="logo-label">HI<span>Story</span></div></div>`;
}
function header(back = 'library', actionLabel = 'Главная') {
  return `<header class="topbar"><button class="backlink" data-action="${back}" aria-label="${escapeHtml(actionLabel)}"><i>‹</i>${escapeHtml(actionLabel)}</button>${brand()}<button class="iconbtn" data-action="journal" title="Дневник истории" aria-label="Дневник истории">☷</button></header>`;
}
function libraryView() {
  const story = state.story;
  if (!story) return `<div class="errorbox">История пока недоступна.</div>`;
  const chapter = story.chapters[0], part = chapter.parts[0];
  return `<main class="page home-view">
    <img class="home-art" src="${escapeHtml(story.cover)}" alt="Иллюстрация советского моряка и Севастополя в стиле графической новеллы"/>
    <div class="home-top"><span class="home-emblem" aria-hidden="true">⚓</span><span class="home-period">1990—1993</span></div>
    <section class="home-brand" aria-label="HIStory. Три года до дома">
      <h1>HI<span>Story</span></h1>
      <p class="home-tagline">Три года до дома</p>
      <p class="home-subtitle">Воспоминания о службе на атомной подводной лодке</p>
    </section>
    <nav class="home-actions" aria-label="Меню истории">
      <button class="btn wide" data-action="read"><span class="btn-icon">▸</span><span class="btn-copy">${story.started ? 'Продолжить' : 'Начать историю'}</span><span class="arrow">›</span></button>
      <button class="btn btn-paper btn-small wide" data-action="chapters"><span class="btn-icon">☷</span><span class="btn-copy">Главы и части</span><span class="arrow">›</span></button>
      <button class="btn btn-paper btn-small wide" data-action="journal"><span class="btn-icon">✦</span><span class="btn-copy">Дневник истории</span><span class="arrow">›</span></button>
    </nav>
    <div class="home-foot"><span>ГЛАВА 01</span><span aria-hidden="true">⚓</span><span>${escapeHtml(part.title)}</span></div>
  </main>`;
}
function chaptersView() {
  const story=state.story, chapter=story.chapters[0];
  const parts=chapter.parts.map(part=>{
    const locked=['upcoming','locked'].includes(part.status);
    const status=part.status==='done'?'Прочитано':part.status==='upcoming'?'Скоро':part.status==='locked'?'После предыдущей части':part.status==='current'&&story.started?'В процессе':'Доступно';
    const covers={1:'/assets/comic-v2/enlist.webp',2:'/assets/comic-v2/sparring.webp',3:'/assets/comic-v2/divers-missed.webp'};
    const cover=covers[part.number]||'/assets/comic-v2/submarine.webp';
    return `<button class="part ${locked?'locked':''}" data-action="${locked?'locked':'read'}" data-part="${part.number}" ${locked?'disabled':''} aria-label="Часть ${part.number}. ${escapeHtml(part.title)}. ${status}">
      <span class="part-thumb"><img src="${cover}" alt="" loading="lazy"></span><span class="part-info"><em>Часть ${String(part.number).padStart(2,'0')} · ${status}</em><strong>${escapeHtml(part.title)}</strong><small>${escapeHtml(part.subtitle)}</small></span><span class="part-go" aria-hidden="true">${locked?'⌑':'›'}</span>
    </button>`;
  }).join('');
  return `<main class="page chapter-view">${header('library','Главная')}
    <section class="chapter-hero"><img src="${escapeHtml(chapter.poster)}" alt="Военно-морской пейзаж Севастополя"/><div class="chapter-hero-text"><div class="kicker">${escapeHtml(story.collection)} · ГЛАВА ${String(chapter.number).padStart(2,'0')}</div><h1>${escapeHtml(chapter.name)}</h1><p>${escapeHtml(chapter.subtitle)}</p><div class="anchor-rule" aria-hidden="true">⚓</div></div></section>
    <section class="chapter-section"><div class="section-title"><h2>Части главы</h2><span class="tiny">01 / ${String(chapter.parts.length).padStart(2,'0')}</span></div>${parts}</section>
    <p class="chapter-footer">Части открываются по порядку. События основаны на личных воспоминаниях и не меняются читательским выбором.</p>
    <div class="chapter-next">⚓ &nbsp; 1990—1993 · Атомный подводный флот</div>
  </main>`;
}
function readerView() {
  const p=state.progress, scene=p.scene, end=scene.type==='part_end', isChoice=scene.type==='choice';
  const image=art[scene.background]||art.cover;
  const step=String(Math.min(p.visitedCount,99)).padStart(2,'0');
  const actions=end
    ? scene.next
      ? `<button class="btn wide" data-action="next"><span class="btn-copy">Начать часть ${scene.part + 1}</span><span class="arrow">→</span></button><button class="subtle-btn" data-action="chapters" aria-label="К частям главы">☷</button>`
      : `<button class="btn wide" data-action="chapters"><span class="btn-copy">К частям главы</span><span class="arrow">›</span></button><button class="subtle-btn" data-action="restart" aria-label="Начать заново">↻</button>`
    : isChoice
      ? `<div class="choices">${scene.choices.map(c=>`<button class="choice" data-action="choice" data-choice="${escapeHtml(c.id)}"><strong>${escapeHtml(c.text)}</strong><small>${escapeHtml(c.hint)}</small></button>`).join('')}</div>`
      : `<button class="btn wide" data-action="next"><span class="btn-copy">${scene.type==='archive'?'Продолжить':'Далее'}</span><span class="arrow">→</span></button>`;
  return `<main class="reader ${end?'part-end':''}">
    <div class="scene-art"><img src="${escapeHtml(image)}" alt="Иллюстрация к эпизоду: ${escapeHtml(scene.label)}"/></div>
    <div class="reader-hud"><button class="iconbtn" data-action="chapters" aria-label="Вернуться к главам">‹</button>
      <div class="reader-count"><div class="chapter-label"><span>Глава ${p.chapter.number} · часть ${p.part.number}</span><span>${p.partProgress}%</span></div><div class="progress-track" role="progressbar" aria-label="Прогресс части" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.partProgress}"><div class="progress-fill" style="width:${p.partProgress}%"></div></div></div>
      <button class="iconbtn" data-action="journal" aria-label="Дневник истории" title="Дневник">☷</button></div>
    <div class="reader-center"><div class="scene-place"><span>${escapeHtml(scene.label)}</span><small>${escapeHtml(p.part.title)}</small></div></div>
    <section class="story-panel" aria-label="Текущая сцена"><div class="panel-top"><span class="eyebrow">${end?'Часть завершена':scene.type==='archive'?'Из воспоминаний':isChoice?'Выбери, что узнать':'От первого лица'}</span><span class="panel-step">${end?'⚓':step}</span></div>
      ${end?'<div class="end-emblem" aria-hidden="true">⚓</div>':''}<p class="scene-text">${escapeHtml(scene.text)}</p>
      ${scene.note?`<div class="scene-note">${escapeHtml(scene.note)}</div>`:''}
      ${isChoice?'<div class="scene-note">Выбор меняет ракурс чтения, но не реальные события.</div>':''}
      <div class="panel-actions">${!end&&p.canGoBack?'<button class="subtle-btn" data-action="back-scene" aria-label="К предыдущей сцене">←</button>':''}${actions}</div>
    </section>
  </main>`;
}
function journalView() {
  const p=state.progress, decisions=p?.decisions||[];
  return `<main class="page journal-view">${header(p?'read':'library',p?'К чтению':'Главная')}
    <section class="journal-header"><div class="eyebrow">Бортовой журнал · 1990—1993</div><h1>Дневник<br>истории</h1><p class="journal-description">Даты и места из воспоминаний. Первую часть можно перечитать в любой момент.</p>
      <div class="kicker">Известные даты</div>
      <div class="milestone"><span class="index">19</span><div><strong>Ноябрь 1990 · военкомат</strong><p>Известие о трёхлетней службе в ВМФ.</p></div></div>
      <div class="milestone"><span class="index">19</span><div><strong>Вечер · поезд из Минска</strong><p>Через Симферополь — в Севастополь.</p></div></div>
      <div class="milestone"><span class="index">21</span><div><strong>Ночь · Севастополь</strong><p>Распределительный пункт, казарма, второй ярус.</p></div></div>
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
  state.view = 'reader';
  render();
}
async function loadLibrary() {
  const data = await api('/api/bootstrap');
  state.stories = data.stories;
  state.story = data.stories.find(s => s.id === state.story?.id) || data.stories[0];
}
async function navigate(action, button) {
  if (state.busy) return;
  if (action === 'retry') return boot();
  if (action === 'locked') return toast('Эта часть появится после продолжения воспоминаний.');
  if (action === 'journal') { state.view = 'journal'; render(); return; }
  if (action === 'library') { await loadLibrary(); state.view = 'library'; render(); return; }
  if (action === 'chapters') { await loadLibrary(); state.view = 'chapters'; render(); return; }
  if (action === 'read') return openReader(Number(button.dataset.part) || null);
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
