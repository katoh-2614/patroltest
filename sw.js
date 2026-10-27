/* 道路パトロール記録：通信が切れても起動できるようにする（ネット優先・失敗時は保存版）
   保存名にリポジトリ（市町村）のパスを含め、同じ github.io の下の別の市町村版と混ざらないようにする */
const NS = new URL(self.registration.scope).pathname;
const CACHE = "roadpatrol-v6" + NS;
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./exceljs.min.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE && (k.endsWith(NS) || /^roadpatrol-v\d+$/.test(k))).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || !u.pathname.startsWith(NS)) return;   // 背景地図・他の市町村版は対象外
  e.respondWith(fetch(e.request).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
