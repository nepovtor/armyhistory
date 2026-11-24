import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Storage } from '../server/storage.mjs';
import { story } from './fixtures/story.mjs';
import { initialProgress, advance } from '../server/engine.mjs';

test('прогресс восстанавливается после перезапуска',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'army-stories-test-'));
 try {
  const storage=new Storage(dir);

  const old=storage.get('tg:123456',story);
  const next=advance(story,old,{nodeId:old.nodeId});
  storage.put('tg:123456',story,next);
  const restarted=new Storage(dir);
  assert.equal(restarted.get('tg:123456',story).nodeId,'part1-choice');
  assert.equal(restarted.get('tg:999',story).nodeId,initialProgress(story).nodeId);
 } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});

test('устаревшая сцена из прежней версии безопасно сбрасывается к началу',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'army-stories-migration-'));
 try {

  fs.writeFileSync(path.join(dir,'progress.json'),JSON.stringify({users:{'tg:123456':{stories:{[story.id]:{
   nodeId:'removed-node',stats:{route:1,mood:0},decisions:[],visited:['part1-start','removed-node']
  }}}}}));
  const storage=new Storage(dir);
  const restored=storage.get('tg:123456',story);
  assert.equal(restored.nodeId,story.start);
  assert.deepEqual(restored.visited,[story.start]);
 } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});

test('оплаченный доступ сохраняется без потери старого прогресса',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'army-stories-entitlement-'));
 try {

  const oldProgress=advance(story,initialProgress(story),{nodeId:story.start});
  fs.writeFileSync(path.join(dir,'progress.json'),JSON.stringify({users:{'tg:123456':{stories:{[story.id]:oldProgress}}}}));
  const storage=new Storage(dir);
  assert.equal(storage.hasEntitlement('tg:123456','route-map'),false);
  assert.equal(storage.grantEntitlement('tg:123456','route-map',{
   telegramPaymentChargeId:'charge-1',amount:15,currency:'XTR',paidAt:'2026-11-14T00:00:00.000Z'
  }),true);
  assert.equal(storage.grantEntitlement('tg:123456','route-map',{
   telegramPaymentChargeId:'charge-1',amount:15,currency:'XTR',paidAt:'2026-11-14T00:00:00.000Z'
  }),false);
  const restarted=new Storage(dir);
  assert.equal(restarted.hasEntitlement('tg:123456','route-map'),true);
  assert.equal(restarted.get('tg:123456',story).nodeId,oldProgress.nodeId);
  assert.equal(Object.keys(restarted.db.payments).length,1);
 } finally { fs.rmSync(dir,{recursive:true,force:true}); }
});
