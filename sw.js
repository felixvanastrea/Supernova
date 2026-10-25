// Offline support for the installed app. Bump CACHE when shipping an update.
const CACHE='supernova-v5';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png',
  './fonts/pixelify-sans-400.woff2','./fonts/pixelify-sans-600.woff2','./fonts/press-start-2p-400.woff2'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())) });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())) });
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  // the game page: always try the network first so players get updates, fall back to the saved copy offline
  if(r.mode==='navigate'){ e.respondWith(fetch(r).then(res=>{ const cp=res.clone(); caches.open(CACHE).then(c=>c.put('./index.html',cp)); return res }).catch(()=>caches.match('./index.html'))); return }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{ if(res.ok&&new URL(r.url).origin===location.origin){ const cp=res.clone(); caches.open(CACHE).then(c=>c.put(r,cp)) } return res })));
});
