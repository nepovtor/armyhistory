import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const dir = fileURLToPath(new URL('../production/chapter01/', import.meta.url));
const run = (command, args) => execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const probe = file => JSON.parse(run('ffprobe', ['-v', 'error', '-count_frames', '-show_entries', 'stream=codec_type,codec_name,width,height,pix_fmt,r_frame_rate,nb_read_frames,sample_rate,channels:format=duration', '-of', 'json', file]));
const checkVideo = (info, width, height, frames) => {
  const video = info.streams.find(stream => stream.codec_type === 'video');
  const [numerator, denominator] = (video?.r_frame_rate || '0/1').split('/').map(Number);
  if (!video || video.width !== width || video.height !== height || numerator / denominator !== 24 || Number(video.nb_read_frames) !== frames) throw new Error('Video dimensions, frame rate or frame count do not match the approved edit');
};

if (process.argv.includes('--smoke-test')) {
  const tmp = path.join(dir, 'tmp/film-toolchain-check');
  fs.mkdirSync(tmp, { recursive: true });
  for (const [name, width, height] of [['landscape', 1920, 1080], ['portrait', 1080, 1920]]) {
    const file = path.join(tmp, `${name}-technical-test.mp4`);
    run('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', `testsrc2=size=${width}x${height}:rate=24`, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '1', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', file]);
    const info = probe(file);
    checkVideo(info, width, height, 24);
    const video = info.streams.find(stream => stream.codec_type === 'video');
    const audio = info.streams.find(stream => stream.codec_type === 'audio');
    if (video.codec_name !== 'h264' || video.pix_fmt !== 'yuv420p' || audio?.codec_name !== 'aac' || audio.sample_rate !== '48000' || audio.channels !== 2) throw new Error('Delivery codec test failed');
    console.log(`PASS: ${width}×${height}, 24fps, H.264/yuv420p, AAC 48kHz stereo. Technical test pattern only; no film rendered.`);
  }
} else {
  const pilot = process.argv.includes('--pilot');
  run(process.execPath, [fileURLToPath(new URL('../scripts/validate-shotlist.mjs', import.meta.url)), '--require-media', ...(pilot ? ['--pilot'] : [])]);
  const plan = JSON.parse(fs.readFileSync(path.join(dir, pilot ? 'pilot-plan.json' : 'shotlist.json'), 'utf8'));
  const delivery = JSON.parse(fs.readFileSync(path.join(dir, 'film-delivery.json'), 'utf8'));
  const portrait = process.argv.includes('--portrait');
  const [width, height] = portrait ? [1080, 1920] : [1920, 1080];
  const mediaPath = relative => {
    if (typeof relative !== 'string') throw new Error('NOT READY: media file is not registered');
    const file = path.resolve(dir, relative);
    if (![path.join(dir, 'private') + path.sep, path.join(dir, 'renders') + path.sep].some(prefix => file.startsWith(prefix))) throw new Error('Film media must stay in private or renders directories');
    if (!fs.statSync(file).isFile()) throw new Error('NOT READY: media file is absent');
    return file;
  };
  const shots = pilot ? plan.segments.map(segment => ({ ...segment, id: segment.sourceNode, outputFile: delivery.pilotSegments[segment.sourceNode]?.outputFile })) : plan.beats.flatMap(beat => beat.shots);
  const files = shots.map(shot => {
    const record = (pilot ? delivery.pilotSegments : delivery.shots)[shot.id];
    if (portrait && record?.portraitApproved !== true) throw new Error(`NOT READY: portrait composition not approved for ${shot.id}`);
    const file = mediaPath(portrait ? record.portraitOutputFile : shot.outputFile);
    checkVideo(probe(file), width, height, shot.endFrame - shot.startFrame);
    return file;
  });
  const masterAudio = mediaPath((pilot ? delivery.pilotAudio : delivery.masterAudio).file);
  const audioInfo = probe(masterAudio);
  const audio = audioInfo.streams.find(stream => stream.codec_type === 'audio');
  if (audio?.sample_rate !== '48000' || audio.channels !== 2 || Number(audioInfo.format.duration) < plan.durationSec - 1 / 24) throw new Error('Approved audio must be stereo 48kHz and cover the final edit');
  const subtitles = mediaPath((pilot ? delivery.pilotSubtitlesSrt : delivery.subtitlesSrt).file);
  if (!/\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}/.test(fs.readFileSync(subtitles, 'utf8'))) throw new Error('Approved SRT file has no timed captions');
  const tmp = path.join(dir, 'tmp');
  const renders = path.join(dir, 'renders');
  fs.mkdirSync(tmp, { recursive: true });
  fs.mkdirSync(renders, { recursive: true });
  const name = `chapter-1-${pilot ? 'pilot' : 'master'}${portrait ? '-portrait' : ''}`;
  const output = path.join(renders, name + '.mp4');
  if (['.mp4', '.srt', '.vtt'].some(extension => fs.existsSync(path.join(renders, name + extension)))) throw new Error('Export already exists; preserve or rename it before exporting again');
  const list = path.join(tmp, `${name}-concat.txt`);
  fs.writeFileSync(list, files.map(file => `file '${file.replaceAll("'", "'\\''")}'`).join('\n') + '\n');
  run('ffmpeg', ['-v', 'error', '-n', '-f', 'concat', '-safe', '0', '-i', list, '-i', masterAudio, '-map', '0:v:0', '-map', '1:a:0', '-t', String(plan.durationSec), '-r', '24', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', output]);
  checkVideo(probe(output), width, height, plan.totalFrames);
  fs.copyFileSync(subtitles, path.join(renders, name + '.srt'), fs.constants.COPYFILE_EXCL);
  run('ffmpeg', ['-v', 'error', '-n', '-i', subtitles, path.join(renders, name + '.vtt')]);
  console.log(`Exported ${name}: ${plan.totalFrames} frames, MP4 + SRT + VTT in the ignored renders directory. Review the full film before delivery.`);
}
