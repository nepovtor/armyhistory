import test from 'node:test';
import assert from 'node:assert/strict';
import { stories, getStory } from '../server/content.mjs';
import { initialProgress, advance, rewind, publicStory, publicProgress, assertValidContent } from '../server/engine.mjs';
import { story } from './fixtures/story.mjs';

function reach(nodeId, choiceId = 'route') {
  let progress = initialProgress(story);
  for (let i = 0; progress.nodeId !== nodeId && i < story.scenes.length; i++) {
    const scene = story.scenes.find(scene => scene.id === progress.nodeId);
    progress = advance(story, progress, { nodeId: scene.id, ...(scene.type === 'choice' ? { choiceId } : {}) });
  }
  assert.equal(progress.nodeId, nodeId);
  return progress;
}

test('каталог содержит исправленную историю', () => {
  assert.equal(stories.length, 1);
  assert.equal(getStory('removed-story'), null);
  assert.doesNotThrow(assertValidContent);
});

test('изначально открыта первая часть, следующие открываются по порядку', () => {
  const summary = publicStory(story, initialProgress(story));
  assert.deepEqual(summary.chapters[0].parts.map(part => part.status), ['current', 'locked', 'locked']);
  assert.equal(summary.started, false);
});

test('обе развилки сходятся к концу части и сохраняют выбор', () => {
  for (const choiceId of ['route', 'mood']) {
    const progress = reach('part1-end', choiceId);
    assert.deepEqual(progress.visited, ['part1-start', 'part1-choice', `part1-${choiceId}`, 'part1-end']);
    assert.equal(progress.decisions[0].choiceId, choiceId);
    assert.equal(progress.stats[choiceId], 1);
    assert.equal(publicProgress(story, progress).partProgress, 100);
    assert.equal(publicStory(story, progress).partCompleted, true);
  }
});

test('возврат отменяет предыдущий выбор и позволяет выбрать другой', () => {
  const progress = reach('part1-route');
  const previous = rewind(story, progress);
  assert.equal(previous.nodeId, 'part1-choice');
  assert.equal(previous.decisions.length, 0);
  assert.equal(previous.stats.route, 0);
  assert.equal(advance(story, previous, { nodeId: previous.nodeId, choiceId: 'mood' }).nodeId, 'part1-mood');
});

test('нельзя пройти чужой сценой, лишним выбором или недопустимым вариантом', () => {
  const progress = initialProgress(story);
  assert.throws(() => advance(story, progress, { nodeId: 'part2-start' }), /уже пройдена/);
  assert.throws(() => advance(story, progress, { nodeId: progress.nodeId, choiceId: 'route' }), /не требуется/);
  const choice = reach('part1-choice');
  assert.throws(() => advance(story, choice, { nodeId: choice.nodeId, choiceId: 'fake' }), /Выберите один/);
});

test('нельзя пройти дальше конца опубликованной истории', () => {
  const progress = reach('part3-end');
  assert.throws(() => advance(story, progress, { nodeId: progress.nodeId }), /уже завершена/);
});

test('после каждой завершённой части открывается следующая', () => {
  for (const [end, statuses, next] of [
    ['part1-end', ['done', 'available', 'locked'], 'part2-start'],
    ['part2-end', ['done', 'done', 'available'], 'part3-start']
  ]) {
    const progress = reach(end);
    assert.deepEqual(publicStory(story, progress).chapters[0].parts.map(part => part.status), statuses);
    assert.equal(advance(story, progress, { nodeId: progress.nodeId }).nodeId, next);
  }
});
