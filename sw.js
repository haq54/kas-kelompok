var V='kaskita-v33',SHELL=['./','index.html'];
/* Tiap berkas dimasukkan sendiri-sendiri: satu berkas yang gagal tidak lagi membatalkan seluruh pemasangan. */
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return Promise.all(SHELL.map(function(u){return c.add(new Request(u,{cache:'reload'})).catch(function(){})}))}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==V}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
function kabar(){return self.clients.matchAll().then(function(l){l.forEach(function(c){c.postMessage({t:'baru'})})})}
/* Berkas situs sendiri: tampil dari cache dulu, diperbarui di latar belakang (selalu divalidasi ulang, tidak lewat cache HTTP).
   Bila isi halaman berubah, halaman diberi tahu agar menampilkan banner "Versi baru siap". */
function swr(e,r){
 var navi=r.mode==='navigate',sel;
 e.waitUntil(new Promise(function(r2){sel=r2})); /* harus dipasang sekarang juga, bukan di dalam promise */
 return caches.open(V).then(function(c){
  return c.match(r,{ignoreSearch:navi}).then(function(lama){
   var salinan=lama&&navi?lama.clone():null; /* disalin sebelum badan respons dipakai halaman */
   var net=fetch(new Request(r,{cache:'no-cache'})).then(function(res){
    if(res&&res.ok){
     var cp=res.clone();
     var simpan=function(){return c.put(r,cp)};
     if(salinan){return Promise.all([salinan.text(),res.clone().text()]).then(function(t){return simpan().then(function(){if(t[0]!==t[1])return kabar()})}).catch(function(){}).then(function(){return res})}
     simpan();
    }
    return res;
   });
   net.then(function(){sel()},function(){sel()});
   if(lama)return lama;
   return net.catch(function(){return navi?c.match('index.html'):undefined});
  });
 });
}
/* SDK Firebase (versi dipatok di URL) dan berkas font tidak berubah: cache dulu. Hanya respons sukses yang disimpan. */
function cf(r){
 return caches.open(V).then(function(c){
  return c.match(r).then(function(m){
   if(m)return m;
   return fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});
  });
 });
}
self.addEventListener('fetch',function(e){
 var r=e.request,u=new URL(r.url);
 if(r.method!=='GET')return;
 if(u.origin===location.origin){e.respondWith(swr(e,r));return}
 if(u.hostname==='www.gstatic.com'||u.hostname==='fonts.gstatic.com'){e.respondWith(cf(r));return}
 if(u.hostname==='fonts.googleapis.com'){ /* CSS font berubah menurut browser: segarkan di latar belakang */
  e.respondWith(caches.open(V).then(function(c){return c.match(r).then(function(m){var net=fetch(r).then(function(res){if(res&&(res.ok||res.type==='opaque'))c.put(r,res.clone());return res});if(m)return m;return net})}));return}
 /* Firestore & Auth dibiarkan langsung ke jaringan */
});
