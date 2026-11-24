#!/usr/bin/env node
/** Validates the planning manifest, and checks live story IDs when run in the HIStory repo. */
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const shotlistPath = path.join(root, 'production', 'chapter01', 'shotlist.json');
const storyFile = path.join(root, 'server', 'content.mjs');
const errors = [];
const warnings = [];

let data;
try {
  data = JSON.parse(await readFile(shotlistPath, 'utf8'));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.log('WAITING: shotlist removed with the old story; no film is available for validation.');
  process.exit(0);
}
if (data.schemaVersion !== 1) errors.push('Expected shotlist schemaVersion 1');
if (data.chapter !== 1) errors.push('Expected chapter 1');
if (!Array.isArray(data.beats) || !data.beats.length) errors.push('Expected non-empty beats');

const ids = new Set();
const shotIds = new Set();
let totalSec = 0;
for (const beat of data.beats || []) {
  if (!beat.sourceNode || ids.has(beat.sourceNode)) errors.push(`Missing/duplicate sourceNode: ${beat.sourceNode}`);
  ids.add(beat.sourceNode);
  if (![1, 2, 3].includes(beat.part)) errors.push(`Invalid part for ${beat.sourceNode}`);
  if (!Array.isArray(beat.shots) || beat.shots.length < 1) errors.push(`No shots for ${beat.sourceNode}`);
  for (const shot of beat.shots || []) {
    if (!shot.id || shotIds.has(shot.id)) errors.push(`Missing/duplicate shot ID: ${shot.id}`);
    shotIds.add(shot.id);
    if (!Number.isFinite(shot.durationSec) || shot.durationSec <= 0 || shot.durationSec > 60) errors.push(`Invalid duration for ${shot.id}`);
    if (!shot.action || !shot.animationMethod || !shot.shotSize) errors.push(`Incomplete direction for ${shot.id}`);
    if (!['planned','blocked','animatic','approved','final'].includes(shot.status)) errors.push(`Invalid status for ${shot.id}`);
    if (shot.status === 'final' && !shot.outputFile) errors.push(`Final shot without outputFile: ${shot.id}`);
    totalSec += Number(shot.durationSec) || 0;
  }
}

if (totalSec < 480 || totalSec > 720) warnings.push(`Planning estimate is ${(totalSec/60).toFixed(1)} min; target 8–12 min (adjust after audio timing)`);

try {
  await access(storyFile);
  const { stories } = await import(`file://${storyFile}`);
  const story = stories.find(s => s.chapters.some(ch => ch.number === 1));
  if (!story) errors.push('No Chapter 1 source story found');
  else {
    const actual = new Set(story.scenes.filter(s => s.chapter === 1).map(s => s.id));
    for (const id of actual) if (!ids.has(id)) errors.push(`Scene missing in shotlist: ${id}`);
    for (const id of ids) if (!actual.has(id)) errors.push(`Unknown scene in shotlist: ${id}`);
  }
  for (const beat of data.beats || []) {
    if (!beat.referenceImage) continue;
    const p = path.join(root, 'public', beat.referenceImage.replace(/^\/assets\//, 'assets/'));
    try { await access(p); } catch { warnings.push(`Reference illustration missing: ${beat.referenceImage} (${beat.sourceNode})`); }
  }
} catch (err) {
  warnings.push(`Running outside full repo or unavailable server/content.mjs: live ID checks skipped (${err.message})`);
}

console.log(`HIStory shotlist: ${data.beats?.length || 0} narrative beats, ${shotIds.size} shots, ${(totalSec/60).toFixed(1)} min planned`);
for (const warn of warnings) console.warn('[WARN]', warn);
for (const error of errors) console.error('[ERROR]', error);
console.log(errors.length ? `FAILED: ${errors.length} error(s)` : 'PASS: structure is valid (this is NOT proof of rendered animation)');
if (errors.length) process.exitCode = 1;
