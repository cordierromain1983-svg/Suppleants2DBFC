/* Mode hors ligne : réseau d'abord (pour recevoir les mises à jour), cache en secours. */
var VERSION = "atelier-v5";
var FICHIERS = ["./", "./index.html", "./outil.html", "./projection.html", "./manifest.webmanifest", "./icone.svg", "./icone-192.png", "./icone-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req).then(function (rep) {
      var copie = rep.clone();
      if (rep.ok) caches.open(VERSION).then(function (c) { c.put(req, copie); });
      return rep;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match("./index.html"); });
    })
  );
});
