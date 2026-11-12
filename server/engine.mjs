import { getScene, stories } from './content.mjs';

export function initialProgress(story) {
  return { nodeId: story.start, stats: { route: 0, mood: 0 }, decisions: [], visited: [story.start], updatedAt: new Date().toISOString() };
}
function route(next, stats) {
  if (typeof next === 'string') return next;
  if (next && Object.hasOwn(stats, next.stat)) return Number(stats[next.stat] || 0) >= next.min ? next.yes : next.no;
  throw new Error('Некорректный переход сюжета');
}
export function advance(story, progress, { nodeId, choiceId }) {
  const current = getScene(story, progress.nodeId);
  if (!current || current.id !== nodeId) throw new Error('Эта сцена уже пройдена. Обновите страницу.');
  if ((current.type === 'part_end' && !current.next) || current.type === 'ending') throw new Error('Часть уже завершена');
  const stats = { ...progress.stats };
  let next;
  const decisions = [...progress.decisions];
  if (current.type === 'choice') {
    const choice = current.choices.find(c => c.id === choiceId);
    if (!choice) throw new Error('Выберите один из вариантов');
    for (const [stat, amount] of Object.entries(choice.effects || {})) {
      if (!['route', 'mood'].includes(stat)) throw new Error('Неверная характеристика');
      stats[stat] = Number(stats[stat] || 0) + Number(amount);
    }
    next = route(choice.next, stats);
    decisions.push({ sceneId: current.id, choiceId: choice.id, summary: choice.summary, chapter: current.chapter, part: current.part });
  } else {
    if (choiceId !== undefined && choiceId !== null) throw new Error('Выбор здесь не требуется');
    next = route(current.next, stats);
  }
  const nextScene = getScene(story, next);
  if (!nextScene) throw new Error('Следующая сцена отсутствует');
  return { nodeId: next, stats, decisions, visited: [...progress.visited, next], updatedAt: new Date().toISOString() };
}

// Откат корректно воспроизводит историю с учётом ранее выбранных развилок.
export function rewind(story, progress) {
  if (progress.visited.length <= 1) return initialProgress(story);
  const desired = progress.visited.at(-2);
  let recreated = initialProgress(story);
  let steps = 0;
  while (recreated.nodeId !== desired && steps++ < story.scenes.length + 4) {
    const scene = getScene(story, recreated.nodeId);
    const prevChoice = progress.decisions.find(d => d.sceneId === scene.id);
    recreated = advance(story, recreated, { nodeId: scene.id, ...(prevChoice ? { choiceId: prevChoice.choiceId } : {}) });
  }
  if (recreated.nodeId !== desired) throw new Error('Не удалось вернуться к прошлой сцене');
  return recreated;
}

export function publicStory(story, progress) {
  const current = getScene(story, progress.nodeId);
  const maxChapter = Math.max(...progress.visited.map(id => getScene(story, id)?.chapter || 1));
  return {
    id: story.id, collection: story.collection, title: story.title,
    shortDescription: story.shortDescription, genre: story.genre, duration: story.duration,
    cover: story.cover, currentChapter: current.chapter, currentPart: current.part,
    chapters: story.chapters.map(ch => ({
      number: ch.number, name: ch.name, subtitle: ch.subtitle, poster: ch.poster,
      status: ch.number < maxChapter ? 'done' : ch.number === maxChapter ? 'current' : 'locked',
      parts: ch.parts.map(p => {
        let status = 'locked';
        if (!p.published) status = 'upcoming';
        else if (ch.number < current.chapter || (ch.number === current.chapter && p.number < current.part)) status = 'done';
        else if (ch.number === current.chapter && p.number === current.part) status = current.type === 'part_end' ? 'done' : 'current';
        else if (ch.number === current.chapter && p.number === current.part + 1 && current.type === 'part_end') status = 'available';
        return { ...p, status };
      })
    })),
    completed: current.type === 'ending',
    partCompleted: current.type === 'part_end',
    started: progress.visited.length > 1,
    decisionsCount: progress.decisions.length
  };
}
export function publicProgress(story, progress) {
  const scene = getScene(story, progress.nodeId);
  if (!scene) throw new Error('Сцена не найдена');
  const chapter = story.chapters.find(ch => ch.number === scene.chapter);
  const part = chapter.parts.find(p => p.number === scene.part);
  const visitedCurrent = progress.visited.filter(id => getScene(story, id)?.chapter === scene.chapter && getScene(story, id)?.part === scene.part).length;
  return {
    storyId: story.id, storyTitle: story.title, scene,
    chapter: { number: chapter.number, name: chapter.name },
    part: { number: part.number, title: part.title, subtitle: part.subtitle },
    partProgress: scene.type === 'part_end' ? 100 : Math.min(99, Math.round(visitedCurrent / (part.sceneCount || 1) * 100)),
    visitedCount: progress.visited.length,
    canGoBack: progress.visited.length > 1,
    decisions: progress.decisions,
    stats: progress.stats,
    partCompleted: scene.type === 'part_end'
  };
}
export function assertValidContent() {
  for (const story of stories) {
    if (!story.scenes.length) throw new Error('Пустой сюжет');
    if (!getScene(story, story.start)) throw new Error('Нет начальной сцены');
    const ids = new Set();
    for (const scene of story.scenes) {
      if (ids.has(scene.id)) throw new Error(`Повтор сцены ${scene.id}`);
      ids.add(scene.id);
      const part = story.chapters.find(ch => ch.number === scene.chapter)?.parts.find(p => p.number === scene.part);
      if (!part?.published) throw new Error(`Сцена ${scene.id} без опубликованной части`);
    }
    for (const scene of story.scenes) {
      const routes = scene.type === 'choice' ? scene.choices.map(c => c.next) : scene.next ? [scene.next] : [];
      if (scene.type === 'choice' && !scene.choices?.length) throw new Error('Выбор без вариантов');
      if (!['part_end', 'ending'].includes(scene.type) && !routes.length) throw new Error(`Нет перехода для ${scene.id}`);
      for (const r of routes) {
        const destinations = typeof r === 'string' ? [r] : [r.yes, r.no];
        for (const dest of destinations) if (!ids.has(dest)) throw new Error(`Нет перехода ${scene.id} -> ${dest}`);
      }
    }
  }
}
