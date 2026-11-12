// Собирает автономный HTML для просмотра без Telegram и Node.js.
// Отдельный от production приложения режим: данные демонстрации хранятся в браузере.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { stories } from '../server/content.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const out = process.argv[2] || path.resolve(root, '..', 'HIStory-demo.html');
const assets = new Map();
const assetsDir = path.join(publicDir, 'assets');
function collectAssets(dir, relativeDir = '') {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectAssets(absolutePath, relativePath);
      continue;
    }
    if (!entry.isFile()) continue;
    const mime = entry.name.endsWith('.svg') ? 'image/svg+xml' : entry.name.endsWith('.webp') ? 'image/webp' : entry.name.endsWith('.png') ? 'image/png' : null;
    if (!mime) continue;
    const webPath = `/assets/${relativePath.split(path.sep).join('/')}`;
    assets.set(webPath, `data:${mime};base64,` + fs.readFileSync(absolutePath).toString('base64'));
  }
}
collectAssets(assetsDir);
const storiesCopy = structuredClone(stories);
for (const s of storiesCopy) {
  s.cover = assets.get(s.cover) || s.cover;
  for (const ch of s.chapters) ch.poster = assets.get(ch.poster) || ch.poster;
}
let app = fs.readFileSync(path.join(publicDir, 'app.js'), 'utf8');
for (const [filepath, data] of assets) app = app.replaceAll(`'${filepath}'`, `'${data}'`);
const stub = `
// Только для полностью автономной демонстрации.
const __stories = ${JSON.stringify(storiesCopy)};
const __key = 'history-offline-preview-v2';
const __read = () => {
 try { return JSON.parse(localStorage.getItem(__key) || 'null'); } catch { return null; }
};
const __save = p => { localStorage.setItem(__key, JSON.stringify(p)); };
const __new = () => ({ nodeId:__stories[0].start, stats:{route:0,mood:0}, decisions:[], visited:[__stories[0].start] });
const __scene = id => __stories[0].scenes.find(s=>s.id===id);
const __summary = p => {
 const s=__stories[0],c=__scene(p.nodeId);
 const chapters=s.chapters.map(ch=>({...ch,parts:ch.parts.map(part=>({...part,status:!part.published?'upcoming':p.visited.some(id=>{const i=__scene(id);return i.chapter===ch.number&&i.part===part.number})?(c.type==='part_end'?'done':'current'):'available'}))}));
 return {...s,scenes:undefined,chapters,currentChapter:c.chapter,currentPart:c.part,partCompleted:c.type==='part_end',started:p.visited.length>1,decisionsCount:p.decisions.length};
};
const __progress = p => {
 const s=__stories[0],scene=__scene(p.nodeId),chapter=s.chapters.find(c=>c.number===scene.chapter),part=chapter.parts.find(part=>part.number===scene.part);
 const n=p.visited.filter(id=>{const i=__scene(id);return i.chapter===scene.chapter&&i.part===scene.part}).length;
 return {storyId:s.id,storyTitle:s.title,scene,chapter:{number:chapter.number,name:chapter.name},part:{number:part.number,title:part.title,subtitle:part.subtitle},partProgress:scene.type==='part_end'?100:Math.min(99,Math.round(n/part.sceneCount*100)),visitedCount:p.visited.length,canGoBack:p.visited.length>1,decisions:p.decisions,stats:p.stats,partCompleted:scene.type==='part_end'};
};
const __advance = (p,body) => {
 const c=__scene(p.nodeId);
 if (c.id!==body.nodeId) throw new Error('Переход недоступен');
 if ((c.type==='part_end'&&!c.next)||c.type==='ending') throw new Error('Часть уже завершена');
 const stats={...p.stats},decisions=[...p.decisions];
 let next=c.next;
 if(c.type==='choice') {
   const ch=c.choices.find(ch=>ch.id===body.choiceId);
   if(!ch) throw new Error('Выберите вариант');
   for(const [key,value] of Object.entries(ch.effects||{}))stats[key]=(stats[key]||0)+value;
   next=ch.next;
   decisions.push({sceneId:c.id,choiceId:ch.id,summary:ch.summary,chapter:c.chapter,part:c.part});
 }
 return {nodeId:next,stats,decisions,visited:[...p.visited,next]};
};
const __back = p => {
 if(p.visited.length<2)return __new();
 const last=p.visited.at(-2);let restored=__new();let i=0;
 while(restored.nodeId!==last&&i++<30){const old=restored.nodeId;const ch=p.decisions.find(d=>d.sceneId===old);restored=__advance(restored,{nodeId:old,choiceId:ch?.choiceId});}
 return restored;
};
window.fetch = async (url,opts={}) => {
  const ok=payload=>({ok:true,status:200,json:async()=>payload});
  const err=message=>({ok:false,status:409,json:async()=>({error:message})});
  try {
   if(url==='/api/config')return ok({demoMode:true,gameName:'HIStory'});
   if(url==='/api/bootstrap')return ok({user:{name:'Читатель',demo:true},stories:__stories.map(s=>__summary(__read()||__new()))});
   if(url.endsWith('/reset')){const p=__new();__save(p);return ok(__progress(p));}
   if(url.endsWith('/advance')){const p=__advance(__read()||__new(),JSON.parse(opts.body||'{}'));__save(p);return ok(__progress(p));}
   if(url.endsWith('/back')){const p=__back(__read()||__new());__save(p);return ok(__progress(p));}
   if(url.startsWith('/api/story/'))return ok(__progress(__read()||__new()));
   return err('Неизвестный адрес');
  } catch(e) { return err(e.message); }
};
`;
// Защитить закрывающие script-последовательности в пользовательских текстах.
const safeScript = (stub + '\n' + app).replaceAll('</script', '<\\/script');
const css = fs.readFileSync(path.join(publicDir, 'styles.css'), 'utf8');
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1"><meta name="theme-color" content="#0b1e2b"><title>HIStory — демоверсия</title><script src="https://telegram.org/js/telegram-web-app.js"></script><style>${css}</style></head><body><div id="app" aria-live="polite"></div><div id="toast" role="status" aria-live="polite"></div><script>${safeScript}</script></body></html>`;
fs.writeFileSync(out,html);
console.log('Offline preview generated:',out,fs.statSync(out).size,'bytes');
