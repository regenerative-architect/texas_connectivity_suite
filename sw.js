const VERSION='txco-v3.0.0';
const STATIC=[
 './','./index.html','./offline.html','./manifest.webmanifest','./icons/icon.svg','./assets/css/app.css',
 './assets/js/app.js','./assets/js/db.js','./assets/js/collab.js','./assets/js/ai.js','./assets/js/webllm-worker.js',
 './data/texas-current.json','./data/cross-domain.json','./data/requirements.json','./data/guides.json'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(VERSION).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
 const req=event.request,url=new URL(req.url);
 if(req.method!=='GET')return;
 if(url.origin!==location.origin)return; // never proxy/cache WebLLM models or third-party APIs here
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(r=>{const copy=r.clone();caches.open(VERSION).then(c=>c.put('./index.html',copy));return r}).catch(()=>caches.match('./index.html').then(r=>r||caches.match('./offline.html'))));return;
 }
 event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(r=>{if(r.ok){const copy=r.clone();caches.open(VERSION).then(c=>c.put(req,copy))}return r}).catch(()=>caches.match('./offline.html'))));
});
self.addEventListener('message',event=>{if(event.data==='SKIP_WAITING')self.skipWaiting()});
