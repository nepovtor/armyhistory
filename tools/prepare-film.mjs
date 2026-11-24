import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const dir = path.join(root, 'production/chapter01');
const storyboard = JSON.parse(fs.readFileSync(path.join(dir, 'storyboard.json'), 'utf8'));
const direction = JSON.parse(fs.readFileSync(path.join(dir, 'film-direction.json'), 'utf8'));
const delivery = JSON.parse(fs.readFileSync(path.join(dir, 'film-delivery.json'), 'utf8'));
const fps = direction.fps;
const coverage = new Map(direction.coverage.map(beat => [beat.sceneNumber, beat.shots]));
if (coverage.size !== storyboard.slides.length || direction.coverage.length !== coverage.size) throw new Error('Film coverage must include every source scene exactly once');

let cursor = 0;
const beats = storyboard.slides.map(slide => {
  const shots = coverage.get(slide.number);
  if (!shots?.length) throw new Error(`No coverage for ${slide.id}`);
  const frames = Math.round(slide.durationSec * fps);
  const start = cursor;
  const weight = shots.reduce((sum, shot) => sum + shot.weight, 0);
  let usedWeight = 0;
  const planned = shots.map((shot, index) => {
    usedWeight += shot.weight;
    const end = start + Math.round(frames * usedWeight / weight);
    const result = {
      id: `${slide.id}-sh${String(index + 1).padStart(2, '0')}`,
      shotSize: shot.shotSize, framing: shot.framing || 'single',
      startFrame: cursor, endFrame: end, durationSec: (end - cursor) / fps,
      action: shot.action, actionKeys: slide.actionKeys,
      animationMethod: slide.animationMethod,
      requiresCharacterAnimation: slide.animationClass === 'acting',
      camera: shot.framing === 'reverse' ? 'Встречный ракурс; сохранить ось разговора и направление взглядов.' : 'Устойчивая постановочная камера; движение персонажей по действию, без постоянного зума.',
      sound: slide.sound, transition: index === shots.length - 1 ? slide.transition : 'Склейка по действию или взгляду',
      background: slide.background, heroState: slide.heroState,
      status: delivery.shots[`${slide.id}-sh${String(index + 1).padStart(2, '0')}`]?.status || 'planned',
      outputFile: delivery.shots[`${slide.id}-sh${String(index + 1).padStart(2, '0')}`]?.outputFile || null
    };
    if (end <= cursor) throw new Error(`Invalid shot duration: ${result.id}`);
    cursor = end;
    return result;
  });
  return { sourceNode: slide.id, part: slide.part, title: slide.title, startFrame: start, endFrame: cursor, shots: planned };
});

const shotlist = {
  schemaVersion: 1, chapter: 1, title: storyboard.title, status: 'planning_only',
  format: { ...direction.master, fps }, timing: 'estimate_before_recorded_voice',
  totalFrames: cursor, durationSec: cursor / fps,
  continuity: { source: 'reference-bible.md', style: 'style-bible.md', filmGuide: 'film-production.md' },
  beats
};

const cues = storyboard.slides.flatMap(slide => slide.text.split(/\n\n+/).map((text, index) => ({
  id: `${slide.id}-voice${String(index + 1).padStart(2, '0')}`, sourceNode: slide.id,
  speaker: text.startsWith('—') && slide.number === 11 ? 'O1' : text.startsWith('—') && slide.number === 12 ? 'HERO' : 'NARRATOR',
  text,
  audioFile: delivery.recordings[`${slide.id}-voice${String(index + 1).padStart(2, '0')}`]?.audioFile || null,
  inFrame: delivery.recordings[`${slide.id}-voice${String(index + 1).padStart(2, '0')}`]?.inFrame ?? null,
  outFrame: delivery.recordings[`${slide.id}-voice${String(index + 1).padStart(2, '0')}`]?.outFrame ?? null,
  status: delivery.recordings[`${slide.id}-voice${String(index + 1).padStart(2, '0')}`]?.status || 'not_recorded'
})));

const asset = (id, kind, expectedPath, required = true) => ({
  id, kind, required, expectedPath,
  file: delivery.assets[id]?.file || null,
  status: delivery.assets[id]?.file ? 'delivered' : 'missing', approved: delivery.assets[id]?.approved === true
});
const assets = [
  ...['R01', 'R02', 'R03', 'R04'].map(id => asset(id, 'author_reference', `private/film/references/${id}.png`, id !== 'R03')),
  ...Object.keys(storyboard.backgrounds).map(id => asset(id, 'layered_background', `private/film/backgrounds/${id}.blend`)),
  ...[...new Set(storyboard.slides.map(slide => slide.heroState))].map(id => asset(id, 'hero_model_and_rig', `private/film/rigs/hero-${id}.blend`)),
  ...['O1', 'O2', 'recruits'].map(id => asset(id, 'supporting_model_and_rig', `private/film/rigs/${id}.blend`)),
  asset('mouths', 'actual_mouth_drawings', 'private/film/rigs/mouths.blend'),
  ...cues.map(cue => asset(cue.id, 'voice_recording', `private/film/audio/${cue.id}.wav`)),
  asset('ambience', 'licensed_ambience_stems', 'private/film/audio/ambience.wav'),
  asset('music', 'licensed_music_optional', 'private/film/audio/music.wav', false)
];

// A 55-second quality test using chronological excerpts, not the full film.
const pilotScenes = [{ number: 3, seconds: 14 }, { number: 4, seconds: 7 }, { number: 6, seconds: 6 }, { number: 9, seconds: 8 }, { number: 15, seconds: 20 }];
let pilotCursor = 0;
const pilot = pilotScenes.map(({ number, seconds }) => {
  const slide = storyboard.slides.find(slide => slide.number === number);
  const beat = beats.find(beat => beat.sourceNode === slide.id);
  const start = pilotCursor;
  pilotCursor += seconds * fps;
  return {
    sourceNode: slide.id, title: slide.title, startFrame: start, endFrame: pilotCursor,
    sourceShotIds: beat.shots.map(shot => shot.id),
    voiceTreatment: 'Выбрать точный фрагмент авторского текста после записи; окончательный ритм утвердить на голосе.',
    status: 'planned', outputFile: null
  };
});

const outputs = new Map([
  ['shotlist.json', shotlist],
  ['recording-script.json', { schemaVersion: 1, status: 'not_recorded', language: 'ru', timing: 'set_after_recording', cues }],
  ['film-assets.json', { schemaVersion: 1, status: 'inventory_template', note: 'Expected paths are delivery slots, not existing files. Update only after inspecting delivered assets.', assets }],
  ['pilot-plan.json', { schemaVersion: 1, status: 'planning_only', fps, totalFrames: pilotCursor, durationSec: pilotCursor / fps, master: direction.master, segments: pilot }]
]);

const check = process.argv.includes('--check');
for (const [name, value] of outputs) {
  const content = JSON.stringify(value, null, 2) + '\n';
  const file = path.join(dir, name);
  if (check) {
    if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== content) throw new Error(`Regenerate ${name}: npm run film:prepare`);
  } else fs.writeFileSync(file, content);
}
console.log(`${check ? 'Verified' : 'Prepared'} film plan: ${beats.length} scenes, ${beats.reduce((sum, beat) => sum + beat.shots.length, 0)} shots, ${cursor} planned frames; pilot ${pilotCursor / fps}s. No animation or audio rendered.`);
