import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { stories } from '../server/content.mjs';
const root = new URL('../', import.meta.url);

test('все сюжетные иллюстрации присутствуют и не загружаются из чужих доменов', () => {
  const backgrounds = { station: 'enlist.webp', paper: 'commissariat.webp', train: 'train.webp', route: 'route.svg', sea: 'harbor.webp', barracks: 'barracks.svg', cover: 'cover.webp' };
  for (const story of stories) {
    for (const artwork of [story.cover, ...story.chapters.map(ch => ch.poster)]) {
      assert.ok(artwork.startsWith('/assets/'));
      assert.ok(fs.existsSync(new URL(`../public${artwork}`, import.meta.url)), artwork);
    }
    for (const scene of story.scenes) {
      assert.ok(backgrounds[scene.background], `Нет иллюстрации для ${scene.id}`);
      assert.ok(fs.existsSync(new URL(`../public/assets/${backgrounds[scene.background]}`, import.meta.url)));
    }
  }
});

test('история не приписывает отцу тип или номер атомной лодки', () => {
  const s=stories[0];
  assert.match(s.shortDescription, /1990/);
  assert.match(s.shortDescription, /атомной подводной лодке/);
  assert.match(s.scenes[0].text, /19 ноября 1990/);
  assert.ok(!s.scenes.some(n => /проект\s+\d+|К-\d+/.test(n.text)));
});
