import test from 'node:test';
import assert from 'node:assert/strict';
import { stories } from '../server/content.mjs';
import { initialProgress, advance, rewind, publicStory, publicProgress, assertValidContent } from '../server/engine.mjs';
const story = stories[0];

test('сюжет корректен: глава делится на части', () => {
  assert.doesNotThrow(assertValidContent);
  assert.equal(story.chapters[0].parts.length, 3);
  assert.equal(story.chapters[0].parts[0].published, true);
  assert.equal(story.chapters[0].parts[1].published, false);
  assert.equal(story.scenes[0].chapter, 1);
  assert.equal(story.scenes[0].part, 1);
});

test('изначально доступна только часть 1', () => {
  const s = publicStory(story, initialProgress(story));
  assert.equal(s.chapters[0].parts[0].status, 'current');
  assert.equal(s.chapters[0].parts[1].status, 'upcoming');
  assert.equal(s.started, false);
});

test('обе читательские развилки завершаются на 21 ноября, не меняя фактов', () => {
  for (const choiceId of ['route','mood']) {
    let p = initialProgress(story);
    let n = 0;
    while (p.nodeId !== 'c1p1-end' && n++ < 30) {
      const scene = story.scenes.find(s => s.id === p.nodeId);
      p = advance(story, p, { nodeId: scene.id, ...(scene.type === 'choice' ? { choiceId } : {}) });
    }
    assert.equal(p.nodeId, 'c1p1-end');
    assert.equal(p.decisions.length, 1);
    assert.equal(p.decisions[0].choiceId, choiceId);
    assert.equal(publicProgress(story, p).partProgress, 100);
    assert.equal(publicStory(story, p).partCompleted, true);
  }
});

test('предыдущая сцена восстанавливается и после выбора', () => {
  let p = initialProgress(story);
  for (let i = 0; i < 3; i++) p = advance(story, p, { nodeId: p.nodeId });
  p = advance(story, p, { nodeId: p.nodeId, choiceId: 'route' });
  const previous = rewind(story, p);
  assert.equal(previous.nodeId, 'c1p1-04');
  assert.equal(previous.decisions.length, 0);
  assert.equal(previous.stats.route, 0);
  const repeated = advance(story, previous, { nodeId: previous.nodeId, choiceId: 'mood' });
  assert.equal(repeated.nodeId, 'c1p1-05b');
});

test('нельзя пройти чужой сценой или недопустимым выбором', () => {
  let p = initialProgress(story);
  assert.throws(() => advance(story, p, { nodeId: 'c1p1-03' }), /уже пройдена/);
  for (let i=0; i<3;i++) p=advance(story,p,{nodeId:p.nodeId});
  assert.throws(() => advance(story,p,{nodeId:p.nodeId,choiceId:'fake'}),/Выберите один/);
});

test('нельзя пройти дальше конца опубликованной части', () => {
  let p = initialProgress(story);
  while (p.nodeId !== 'c1p1-end') {
    const scene = story.scenes.find(s => s.id === p.nodeId);
    p = advance(story, p, { nodeId: scene.id, ...(scene.type === 'choice' ? {choiceId:'route'} : {}) });
  }
  assert.throws(() => advance(story, p, {nodeId:p.nodeId}),/уже завершена/);
});
