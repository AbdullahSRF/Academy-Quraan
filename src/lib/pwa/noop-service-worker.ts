/** يُستبدل به طلب `/sw.js` عندما يكون PWA معطّلًا — يُلغي أي SW قديم ويمسح الكاش دون اعتراض التنقل. */
export const NOOP_SERVICE_WORKER_BODY = `
self.addEventListener("install", function () {
  self.skipWaiting();
});
self.addEventListener("activate", function (event) {
  event.waitUntil(
    Promise.all([
      caches.keys().then(function (keys) {
        return Promise.all(keys.map(function (k) { return caches.delete(k); }));
      }),
      self.registration.unregister(),
    ])
  );
});
`.trim();
