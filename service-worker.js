/* SAC’ADOS — service worker (PWA v1). ES5, aucune dépendance.
   - Page (index.html) : réseau d’abord, copie en cache si hors ligne → les mises à jour GitHub arrivent tout de suite.
   - CSS / JS / polices : copie en cache servie aussitôt, puis rafraîchie en arrière-plan.
   - Images : mises en cache au fur et à mesure qu’elles s’affichent (pas les 150 Mo d’un coup).
   À CHAQUE MODIFICATION DE CE FICHIER, augmenter VERSION. Pour index.html, css, js, images : rien à faire. */
var VERSION = 'sacados-pwa-v1';
var SHELL = VERSION + '-shell';
var RUNTIME = VERSION + '-runtime';
var IMAGES = 'sacados-images'; /* garde le même nom entre versions : inutile de retélécharger les illustrations */
var MAX_IMAGES = 400;

var BASE_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/pwa/icon-192.png',
  './assets/pwa/icon-512.png',
  './assets/pwa/apple-touch-icon-180.png',
  './js/pwa-v1.js'
];

/* Lit index.html et met aussi en cache toutes les feuilles CSS, scripts et visuels d’interface qu’il appelle.
   Ainsi, quand tu passes de app-v109.js à app-v110.js, rien à modifier ici. */
function shellFromIndex(html) {
  var out = [], re = /(?:href|src)="([^"#]+\.(?:css|js|webp|png)(?:\?[^"]*)?)"/g, m;
  while ((m = re.exec(html))) {
    if (m[1].indexOf('http') !== 0 && m[1].indexOf('assets/illustrations') === -1) { out.push('./' + m[1].replace(/^\.\//, '')); }
  }
  return out;
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(SHELL).then(function (cache) {
      return cache.addAll(BASE_FILES).then(function () {
        return fetch('./index.html', { cache: 'no-cache' }).then(function (r) { return r.text(); }).then(function (html) {
          var list = shellFromIndex(html);
          return Promise.all(list.map(function (u) {
            return cache.add(u).catch(function () {}); /* un fichier manquant ne bloque pas l’installation */
          }));
        });
      });
    })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== SHELL && k !== RUNTIME && k !== IMAGES) { return caches.delete(k); }
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data === 'skipWaiting') { self.skipWaiting(); }
});

function trimImages() {
  return caches.open(IMAGES).then(function (cache) {
    return cache.keys().then(function (keys) {
      if (keys.length <= MAX_IMAGES) { return; }
      return Promise.all(keys.slice(0, keys.length - MAX_IMAGES).map(function (k) { return cache.delete(k); }));
    });
  });
}

var OFFLINE_HTML = '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Sac’Ados — hors ligne</title><style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;' +
  'background:#0f2448;color:#fcebc2;font:18px/1.5 system-ui,sans-serif;text-align:center;padding:24px;box-sizing:border-box}' +
  'button{margin-top:18px;font:inherit;font-weight:700;padding:12px 22px;border-radius:12px;border:2px solid #cb9347;background:#1c3856;color:#fcebc2}</style></head>' +
  '<body><div><div style="font-size:64px">🎒</div><h1 style="font-size:22px">Pas de connexion</h1>' +
  '<p>Ton sac t’attend ! Reconnecte-toi au wifi ou aux données mobiles, puis réessaie.</p>' +
  '<button onclick="location.reload()">Réessayer</button></div></body></html>';

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') { return; }
  var url = new URL(req.url);
  var sameOrigin = url.origin === self.location.origin;
  var inScope = sameOrigin && url.pathname.indexOf(new URL(self.registration.scope).pathname) === 0;
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

  /* 1. La page elle-même : réseau d’abord */
  if (req.mode === 'navigate') {
    if (!inScope) { return; } /* les autres applis BROT2YOU ne sont pas gérées ici */
    event.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(SHELL).then(function (c) { c.put('./index.html', copy); });
        return res;
      }).catch(function () {
        return caches.match('./index.html', { ignoreSearch: true }).then(function (hit) {
          return hit || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
        });
      })
    );
    return;
  }

  /* 2. Images de Sac’Ados : cache d’abord */
  if (inScope && (req.destination === 'image' || /\.(png|webp|jpe?g|gif|svg)$/i.test(url.pathname))) {
    event.respondWith(
      caches.open(IMAGES).then(function (cache) {
        return cache.match(req, { ignoreSearch: true }).then(function (hit) {
          if (hit) { return hit; }
          return fetch(req).then(function (res) {
            if (res.ok) { cache.put(req, res.clone()); trimImages(); }
            return res;
          });
        });
      })
    );
    return;
  }

  /* 3. CSS, JS, JSON, polices : copie immédiate + mise à jour en arrière-plan */
  if ((inScope && /\.(css|js|json|webmanifest)$/i.test(url.pathname)) || isFont) {
    event.respondWith(
      caches.open(RUNTIME).then(function (cache) {
        return cache.match(req).then(function (fresh) {
          /* copie la plus récente d’abord ; sinon celle préparée à l’installation */
          return fresh || caches.match(req, { cacheName: SHELL });
        }).then(function (hit) {
          var net = fetch(req).then(function (res) {
            if (res.ok || res.type === 'opaque') { cache.put(req, res.clone()); }
            return res;
          }).catch(function () { return hit; });
          if (hit) { event.waitUntil(net.then(function () {}, function () {})); }
          return hit || net;
        });
      })
    );
  }
});
