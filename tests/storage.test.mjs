import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Storage } from '../server/storage.mjs';
import { stories } from '../server/content.mjs';
import { initialProgress, advance } from '../server/engine.mjs';

test('прогресс восстанавливается после перезапуска',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'army-stories-test-'));
 try {
  const storage=new Storage(dir);
  const story=stories[0];
  const old=storage.get('tg:123456',story);
  const next=advance(story,old,{nodeId:old.nodeId});
  storage.put('tg:123456',story,next);
  const restarted=new Storage(dir);
  assert.equal(restarted.get('tg:123456',story).nodeId,'c1p1-02');
  assert.equal(restarted.get('tg:999',story).nodeId,initialProgress(story).nodeId);
 } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
