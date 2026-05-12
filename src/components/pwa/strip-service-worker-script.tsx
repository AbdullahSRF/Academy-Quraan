const SNIPPET = `
(function(){
  if(!("serviceWorker"in navigator))return;
  var u=function(){return navigator.serviceWorker.getRegistrations().then(function(rs){
    return Promise.all(rs.map(function(r){return r.unregister();}));
  });};
  var p=u();
  if(typeof caches!=="undefined"){
    p=p.then(function(){
      return caches.keys().then(function(keys){
        return Promise.all(keys.map(function(k){return caches.delete(k);}));
      });
    });
  }
  p.catch(function(){});
})();
`.trim();

/** يُنفَّذ مبكرًا من `head` — يزيل SW والكاش القديم (بدون `next/script` لتفادي تحذير ESLint في App Router). */
export function StripServiceWorkerScript() {
  if (process.env.NEXT_PUBLIC_ENABLE_PWA === "1") return null;
  return <script id="strip-service-workers" dangerouslySetInnerHTML={{ __html: SNIPPET }} />;
}
