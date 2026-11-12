const tg = window.Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    tg.setHeaderColor?.('#10212b');
    tg.setBackgroundColor?.('#10212b');
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
const art = { station: '/assets/station.svg', train: '/assets/train.svg', sea: '/assets/sea.svg', paper: '/assets/paper.svg', route: '/assets/route.svg', barracks: '/assets/barracks.svg', cover: '/assets/cover.svg' };
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
  return `<div class="logo" aria-label="HIStory"><span class="logo-mark">✶</span><div class="logo-label">HI<br>STORY</div></div>`;
}
function header(back = 'library', actionLabel = 'Главная') {
  return `<header class="topbar"><button class="backlink" data-action="${back}" aria-label="${escapeHtml(actionLabel)}"><i>‹</i>${escapeHtml(actionLabel)}</button><button class="iconbtn" data-action="journal" aria-label="Дневник чтения">☷</button></header>`;
}
function libraryView() {
  const story = state.story;
  if (!story) return `<div class="errorbox">В библиотеке пока нет историй.</div>`;
  const chapter = story.chapters[0];
  const part = chapter.parts[0];
  return `<main class="page">
    <header class="topbar">${brand()}<button class="iconbtn" data-action="journal" title="Дневник чтения" aria-label="Дневник чтения">☷</button></header>
    <section class="library-head">
      <div class="brandline eyebrow">ИСТОРИЯ 01 / ВОСПОМИНАНИЯ</div>
      <h1>Истории,<br>которые<br><em>остаются.</em></h1>
      <p>Настоящие воспоминания. Одна глава, несколько частей. И дорога, с которой всё началось.</p>
    </section>
    <section class="library-card" aria-label="${escapeHtml(story.title)}">
      <img class="library-cover" src="${escapeHtml(story.cover)}" alt="Иллюстрация ночного поезда и моря"/>
      <div class="cover-copy"><div class="cover-number">01<span style="display:block;font:10px var(--sans);letter-spacing:3px;margin-top:9px">АРХИВ ВОСПОМИНАНИЙ</span></div>
      <div><div class="kicker">Глава 01 · часть 01</div><h2>${escapeHtml(story.title)}</h2>
        <p>${escapeHtml(story.shortDescription)}</p>
        <div class="cover-meta"><span class="pill">${escapeHtml(story.genre)}</span><span class="pill">${escapeHtml(story.duration)}</span></div>
        <button class="btn wide" data-action="chapters"><span>${story.partCompleted ? 'Перейти к частям' : story.started ? 'Продолжить историю' : 'Начать историю'}</span><span class="arrow">↗</span></button>
      </div></div>
    </section>
    <div class="small-divider">СЕЙЧАС ДОСТУПНО</div>
    <div class="footline"><b>${escapeHtml(chapter.name)}</b> · ${escapeHtml(part.title)}<br>Следующие части появятся, когда будет продолжение воспоминаний.</div>
  </main>`;
}
function chaptersView() {
  const story = state.story;
  const chapter = story.chapters[0];
  const parts = chapter.parts.map(part => {
    const locked = part.status === 'upcoming';
    const status = part.status === 'done' ? 'ПРОЧИТАНО' : locked ? 'СКОРО' : part.status === 'current' && story.started ? 'ПРОДОЛЖИТЬ' : 'ДОСТУПНО';
    return `<button class="part" data-action="${locked ? 'locked' : 'read'}" ${locked ? 'disabled' : ''} aria-label="Часть ${part.number}. ${escapeHtml(part.title)}. ${status}">
      <span class="part-mark ${locked ? 'locked':''}">${String(part.number).padStart(2, '0')}</span><span class="part-info"><em>${status}</em><strong>Часть ${part.number}. ${escapeHtml(part.title)}</strong><small>${escapeHtml(part.subtitle)}</small></span><span class="part-go">${locked ? '·' : '↗'}</span>
    </button>`;
  }).join('');
  return `<main class="page">${header('library', 'Библиотека')}
    <div class="chapter-hero"><img src="${escapeHtml(chapter.poster)}" alt="Ночной поезд на пути к морю"/><div class="chapter-hero-text"><div class="kicker">${escapeHtml(story.collection)} / ГЛАВА ${String(chapter.number).padStart(2,'0')}</div><h1>${escapeHtml(chapter.name)}</h1><p>${escapeHtml(chapter.subtitle)}</p></div></div>
    <section class="chapter-section"><div class="section-title"><h2>Части главы</h2><span class="tiny">01 / 03</span></div>${parts}</section>
    <p class="chapter-footer">Это воспоминания реального человека. Доступные части можно читать сейчас; новые откроются после добавления текста.</p>
    <section class="chapter-section"><div class="rule"></div><div style="padding-top:22px"><div class="eyebrow">ДАЛЬШЕ</div><div style="font:normal 24px var(--serif);margin-top:10px">Глава 2 <span style="color:#87999a;font:13px var(--sans)">— пока не опубликована</span></div></div></section>
  </main>`;
}
function readerView() {
  const p = state.progress;
  const scene = p.scene;
  const end = scene.type === 'part_end';
  const isChoice = scene.type === 'choice';
  const image = art[scene.background] || art.cover;
  const step = Math.min(p.visitedCount, 99);
  const actions = end
    ? `<button class="btn wide" data-action="chapters"><span>Вернуться к главе</span><span class="arrow">↗</span></button><button class="subtle-btn" data-action="restart" aria-label="Прочитать сначала" title="Прочитать сначала">↻</button>`
    : isChoice
      ? `<div class="choices">${scene.choices.map(c => `<button class="choice" data-action="choice" data-choice="${escapeHtml(c.id)}"><strong>${escapeHtml(c.text)}</strong><small>${escapeHtml(c.hint)}</small></button>`).join('')}</div>`
      : `<button class="btn wide" data-action="next"><span>${scene.type === 'archive' ? 'Вернуться к рассказу' : 'Дальше'}</span><span class="arrow">→</span></button>`;
  return `<main class="reader ${end?'part-end':''}">
      <div class="scene-art"><img src="${escapeHtml(image)}" alt="Атмосферная иллюстрация сцены"/></div>
      <div class="reader-hud"><button class="iconbtn" data-action="chapters" aria-label="Вернуться к главе">‹</button>
        <div class="reader-count"><div class="chapter-label">ГЛАВА ${String(p.chapter.number).padStart(2, '0')} · ЧАСТЬ ${String(p.part.number).padStart(2, '0')} <span style="float:right">${p.partProgress}%</span></div><div class="progress-track" role="progressbar" aria-label="Прогресс части" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.partProgress}"><div class="progress-fill" style="width:${p.partProgress}%"></div></div></div>
        <button class="iconbtn" data-action="journal" title="Дневник" aria-label="Дневник чтения">☷</button>
      </div>
      <div class="reader-center"><div class="scene-place"><span>${escapeHtml(scene.label)}</span><small>${escapeHtml(p.part.title)}</small></div></div>
      <section class="story-panel" aria-label="Текущая сцена"><div class="panel-top"><span class="eyebrow">${end ? 'ЧАСТЬ ЗАВЕРШЕНА' : scene.type === 'archive' ? 'ДЕТАЛЬ ВОСПОМИНАНИЯ' : scene.type === 'choice' ? 'ВЫБОР ЧИТАТЕЛЯ' : 'РАССКАЗ ОТ ПЕРВОГО ЛИЦА'}</span><span class="panel-step">${end ? '✓' : String(step).padStart(2,'0')}</span></div>
       ${end ? '<div class="end-emblem">∗</div>' : ''}<p class="scene-text">${escapeHtml(scene.text)}</p>
       ${scene.note ? `<div class="scene-note">${escapeHtml(scene.note)}</div>` : ''}
       ${isChoice ? '<div class="scene-note">Выбор меняет только ракурс чтения, но не факты истории.</div>' : ''}
       <div class="panel-actions">${!end && p.canGoBack ? '<button class="subtle-btn" data-action="back-scene" aria-label="К предыдущей сцене">←</button>' : ''}${actions}</div>
      </section>
    </main>`;
}
function journalView() {
  const p = state.progress;
  const decisions = p?.decisions || [];
  return `<main class="page">${header(state.progress ? 'read' : 'library', state.progress ? 'К чтению' : 'Библиотека')}
    <section class="journal-header"><div class="brandline eyebrow">АРХИВ 01</div><h1>Дневник<br>истории</h1><p class="journal-description">Даты и места из рассказа. Здесь фиксируется пройденный путь — без вымышленных событий.</p>
      <div class="kicker">ХРОНОЛОГИЯ</div>
      <div class="milestone"><span class="index">19</span><div><strong>Ноябрь · областной военкомат</strong><p>Известие о службе в ВМФ сроком на три года.</p></div></div>
      <div class="milestone"><span class="index">19</span><div><strong>Вечер · поезд из Минска</strong><p>Маршрут через Симферополь к Севастополю.</p></div></div>
      <div class="milestone"><span class="index">21</span><div><strong>Ночь · Севастополь</strong><p>Распределительный пункт. Казарма. Второй ярус.</p></div></div>
      <div class="kicker" style="margin-top:29px">ВЫБОРЫ ЧИТАТЕЛЯ</div>
      ${decisions.length ? decisions.map((decision, i) => `<div class="milestone"><span class="index">0${i+1}</span><div><strong>${escapeHtml(decision.summary)}</strong><p>Глава ${decision.chapter}, часть ${decision.part}</p></div></div>`).join('') : '<div class="journal-empty">Ты ещё не выбирал, какую деталь рассказа рассмотреть. Продолжай читать первую часть.</div>'}
      <div style="margin-top:28px"><button class="btn wide" data-action="${p?'read':'chapters'}"><span>${p?'Вернуться к истории':'Открыть главу'}</span><span class="arrow">↗</span></button></div>
    </section>
  </main>`;
}
function render() {
  root.innerHTML = `<div class="shell">${state.view === 'loading' ? `<div class="loading"><div>HIStory</div><small>Открываем архив…</small></div>` : state.view === 'error' ? `<main class="page">${header('library')}<div class="errorbox"><div class="eyebrow">НЕ УДАЛОСЬ ОТКРЫТЬ</div><h2>Приложение недоступно</h2><p>${escapeHtml(state.error)}</p><p style="font-size:12px;color:#a8b3b0">Для проверки в браузере запусти <code>npm run dev</code>. Для запуска внутри Telegram потребуется настроенный бот и HTTPS-адрес.</p><button class="btn wide" data-action="retry">Повторить <span>↻</span></button></div></main>` : state.view === 'library' ? libraryView() : state.view === 'chapters' ? chaptersView() : state.view === 'reader' ? readerView() : journalView()}</div>`;
}
async function openReader() {
  state.progress = await api(`/api/story/${state.story.id}`);
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
  if (action === 'read') return openReader();
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
