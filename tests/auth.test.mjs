import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { verifyTelegramInitData, getRequestUser } from '../server/auth.mjs';
const token = '12345:ABC-test';
function signData(mod = {}) {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now()/1000)), user: JSON.stringify({id:123456,first_name:'Читатель'}), ...mod });
  const sorted = [...params.entries()].sort(([a],[b])=>a.localeCompare(b,'en')).map(([k,v])=>`${k}=${v}`).join('\n');
  const secret = crypto.createHmac('sha256','WebAppData').update(token).digest();
  params.set('hash',crypto.createHmac('sha256',secret).update(sorted).digest('hex'));
  return params.toString();
}
test('достоверные Telegram initData принимаются',()=>{
 const user=verifyTelegramInitData(signData(),token);
 assert.equal(user.id,'tg:123456');
 assert.equal(user.name,'Читатель');
});
test('подмена или устаревание initData отклоняется',()=>{
 assert.equal(verifyTelegramInitData(signData().replace('123456','777777'),token),null);
 assert.equal(verifyTelegramInitData(signData({auth_date:'12345'}),token),null);
 assert.equal(verifyTelegramInitData(signData()+'&user=%7B%7D',token),null);
});
test('нельзя войти под демо id при выключенном деморежиме',()=>{
 const req={headers:{'x-demo-id':'reader-123456789'}};
 assert.equal(getRequestUser(req,{botToken:token,demoMode:false}),null);
 assert.equal(getRequestUser(req,{botToken:token,demoMode:true}).id,'demo:reader-123456789');
});
