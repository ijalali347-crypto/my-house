const CACHE='house-designer-v1';
const CORE=['./','./index.html','./styles.css','./app.js','./pwa.js','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const CDNS=new Set(['https://cdnjs.cloudflare.com','https://cdn.jsdelivr.net','https://fonts.googleapis.com','https://fonts.gstatic.com']);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('house-designer-') && key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin && !CDNS.has(url.origin)) return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    const existing=await cache.match(event.request);
    if(event.request.mode!=='navigate' && existing) return existing;
    try {
      const response=await fetch(event.request);
      if(response.ok || response.type==='opaque') await cache.put(event.request,response.clone());
      return response;
    } catch(error) {
      if(existing) return existing;
      if(event.request.mode==='navigate') return await cache.match('./index.html');
      throw error;
    }
  })());
});
