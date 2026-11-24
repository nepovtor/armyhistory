import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
import { stories, getStory } from '../server/content.mjs';
import { initialProgress, advance, rewind, publicStory, publicProgress, assertValidContent } from '../server/engine.mjs';

const storyboard = JSON.parse(fs.readFileSync(new URL('../production/chapter01/storyboard.json', import.meta.url)));
const script = fs.readFileSync(new URL('../production/chapter01/script.md', import.meta.url), 'utf8');
const normalize = text => text.replace(/\s+/g, ' ').trim();

test('опубликованы 41 сцена нового рассказа и все три части без изображений', () => {
  for (const source of storyboard.sourceOfTruth) {
    const bytes = fs.readFileSync(new URL('../production/chapter01/' + source.file, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.file);
  }
  assert.equal(stories.length, 1);
  const story = stories[0];
  assert.equal(getStory(story.id), story);
  assert.doesNotThrow(assertValidContent);
  assert.equal(story.scenes.length, 41);
  assert.equal(story.cover, null);
  assert.equal(story.chapters[0].poster, null);
  assert.deepEqual(story.chapters[0].parts.map(part => part.sceneCount), [10, 11, 20]);
  for (const [index, scene] of story.scenes.entries()) {
    const slide = storyboard.slides[index];
    assert.equal(scene.id, slide.id);
    assert.equal(scene.text, slide.text);
    assert.equal(scene.part, slide.part);
    assert.equal(scene.label, slide.title);
    assert.equal(scene.artwork, null);
    assert.notEqual(scene.background, 'route');
  }
  for (const [index, section] of script.split(/^## Часть \d+\. .+$/m).slice(1).entries()) {
    const text = story.scenes.filter(scene => scene.part === index + 1).map(scene => scene.text).join('\n\n');
    assert.equal(normalize(text), normalize(section));
  }
});

test('вся глава проходится, сохраняет границы частей, возвращается и завершается', () => {
  const story = stories[0];
  assert.ok(story, 'Новый рассказ опубликован');
  let progress = initialProgress(story);
  const seen = [];
  for (const scene of story.scenes) {
    assert.equal(progress.nodeId, scene.id);
    seen.push(progress.nodeId);
    const part = publicProgress(story, progress);
    assert.equal(part.part.number, scene.part);
    assert.ok(part.partProgress >= 0 && part.partProgress <= 100);
    const summary = publicStory(story, progress);
    assert.equal(summary.completed, !scene.next);
    if (scene.type === 'part_end') assert.equal(part.partProgress, 100);
    if (scene.next) progress = advance(story, progress, { nodeId: scene.id });
  }
  assert.equal(new Set(seen).size, 41);
  assert.deepEqual(publicStory(story, progress).chapters[0].parts.map(part => part.status), ['done', 'done', 'done']);
  assert.throws(() => advance(story, progress, { nodeId: progress.nodeId }), /уже завершена/);
  assert.equal(rewind(story, progress).nodeId, story.scenes.at(-2).id);
});
