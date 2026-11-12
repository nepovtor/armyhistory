import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { stories } from '../server/content.mjs';
const root = new URL('../', import.meta.url);

test('все сюжетные иллюстрации присутствуют и не загружаются из чужих доменов', () => {
  const backgrounds = {
    station: 'comic-v2/enlist.webp', paper: 'comic-v2/commissariat.webp', train: 'comic-v2/train.webp', route: 'route.svg',
    sea: 'comic-v2/harbor.webp', harbor: 'comic-v2/harbor.webp', barracks: 'comic-v2/barracks.webp',
    marineOffer: 'comic-v2/marine-offer.webp', sparring: 'comic-v2/sparring.webp', decision: 'comic-v2/decision.webp',
    diversMissed: 'comic-v2/divers-missed.webp', cover: 'comic-v2/cover.webp'
  };
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

test('новые растровые иллюстрации полноформатные и достаточно крупные', () => {
  const assets = fs.readdirSync(new URL('../public/assets/comic-v2/', import.meta.url)).filter(name => name.endsWith('.webp'));
  assert.equal(assets.length, 11);
  for (const name of assets) {
    const bytes = fs.readFileSync(new URL(`../public/assets/comic-v2/${name}`, import.meta.url));
    assert.ok(bytes.length > 100_000, `${name} выглядит слишком маленьким`);
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF');
    assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP');
  }
});
