var V='kaskita-v7',SHELL=['./','index.html','manifest.json','icon_192x192.png','icon_512x512.png','icon_maskable_512x512.png','icon_monochrome_512x512.png'];
/* Tiap berkas dimasukkan sendiri-sendiri: satu berkas yang gagal tidak lagi membatalkan seluruh pemasangan. */
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(u).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==V}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
 var r=e.request,u=new URL(r.url);
 if(r.method!=='GET')return;
 var ok=u.origin===location.origin||u.hostname==='www.gstatic.com'||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
 if(!ok)return; /* Firestore & Auth dibiarkan langsung ke jaringan */
 e.respondWith(fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque')){var cp=res.clone();caches.open(V).then(function(c){c.put(r,cp)})}return res}).catch(function(){return caches.match(r).then(function(m){return m||(r.mode==='navigate'?caches.match('index.html'):undefined)})}))});
