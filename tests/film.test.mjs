import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { stories } from '../server/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => JSON.parse(fs.readFileSync(new URL('../production/chapter01/' + name, import.meta.url), 'utf8'));
const normalize = text => text.replace(/\s+/g, ' ').trim();

test('монтажный пакет воспроизводится и покрывает все 41 сцену без разрывов кадров', () => {
  execFileSync(process.execPath, ['tools/prepare-film.mjs', '--check'], { cwd: root });
  const plan = read('shotlist.json');
  assert.deepEqual(plan.beats.map(beat => beat.sourceNode), stories[0].scenes.map(scene => scene.id));
  assert.equal(plan.format.fps, 24);
  assert.deepEqual([plan.format.width, plan.format.height], [1920, 1080]);
  let cursor = 0;
  for (const beat of plan.beats) {
    assert.equal(beat.startFrame, cursor);
    for (const shot of beat.shots) {
      assert.equal(shot.startFrame, cursor);
      assert.ok(shot.endFrame > cursor);
      assert.ok(['wide', 'medium', 'close', 'insert'].includes(shot.shotSize));
      assert.ok(shot.action);
      assert.equal(shot.status, 'planned');
      assert.equal(shot.outputFile, null);
      cursor = shot.endFrame;
    }
    assert.equal(beat.endFrame, cursor);
  }
  assert.equal(cursor, plan.totalFrames);
  assert.equal(plan.durationSec, cursor / 24);
  assert.ok(plan.beats.some(beat => beat.shots.some(shot => shot.framing === 'reverse')));
});

test('сценарий записи сохраняет весь исходный текст и только подтверждённые реплики', () => {
  const script = read('recording-script.json');
  for (const scene of stories[0].scenes) {
    const cues = script.cues.filter(cue => cue.sourceNode === scene.id);
    assert.ok(cues.length);
    assert.equal(normalize(cues.map(cue => cue.text).join('\n\n')), normalize(scene.text));
    for (const cue of cues) {
      assert.equal(cue.audioFile, null);
      assert.equal(cue.inFrame, null);
      assert.equal(cue.outFrame, null);
    }
  }
  assert.deepEqual(script.cues.filter(cue => cue.speaker !== 'NARRATOR').map(cue => cue.speaker), ['O1', 'HERO']);
});

test('55-секундный пилот охватывает поезд, ночную казарму и настоящее действие', () => {
  const plan = read('shotlist.json');
  const pilot = read('pilot-plan.json');
  const ids = new Set(plan.beats.flatMap(beat => beat.shots.map(shot => shot.id)));
  assert.equal(pilot.totalFrames, 55 * 24);
  assert.equal(pilot.segments.at(-1).endFrame, pilot.totalFrames);
  for (const segment of pilot.segments) for (const id of segment.sourceShotIds) assert.ok(ids.has(id));
  assert.ok(pilot.segments.some(segment => segment.sourceNode === 'ch01-p01-s03'));
  assert.ok(pilot.segments.some(segment => segment.sourceNode === 'ch01-p01-s09'));
  assert.ok(pilot.segments.some(segment => segment.sourceNode === 'ch01-p02-s15'));
});

test('проверка и экспорт отказывают при отсутствии настоящих утверждённых материалов', () => {
  for (const mode of [[], ['--pilot']]) {
    const validation = spawnSync(process.execPath, ['scripts/validate-shotlist.mjs', '--require-media', ...mode], { cwd: root, encoding: 'utf8' });
    assert.equal(validation.status, 1);
    assert.match(validation.stdout + validation.stderr, /NOT READY/);
    const exportResult = spawnSync(process.execPath, ['tools/assemble-film.mjs', ...mode], { cwd: root, encoding: 'utf8' });
    assert.notEqual(exportResult.status, 0);
    assert.match(exportResult.stderr, /NOT READY/);
  }
  assert.equal(fs.existsSync(new URL('../production/chapter01/renders', import.meta.url)), false);
});
