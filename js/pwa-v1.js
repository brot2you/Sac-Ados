/* SAC’ADOS — module PWA v1 (installation sur smartphone + mode hors ligne). ES5, autonome.
   - Enregistre service-worker.js
   - Bandeau « Installe Sac’Ados » (Android : vraie fenêtre d’installation ; iPhone/iPad : mode d’emploi illustré)
   - Ligne « Installer l’appli » ajoutée automatiquement dans Réglages
   - Message « Nouvelle version » quand tu publies une mise à jour sur GitHub
   Ne modifie pas app-v1xx.js : peut être retiré en supprimant sa balise <script>. */
(function () {
  'use strict';

  var KEY = 'sacados_pwa';
  var RESHOW_DAYS = 14;
  var deferred = null;
  var ua = navigator.userAgent || '';
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var inApp = /FBAN|FBAV|Instagram|Snapchat|TikTok|Line\/|wv\)/i.test(ua);

  function standalone() {
    return !!((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true);
  }
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function store(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function calme() {
    return document.documentElement.className.indexOf('calme') > -1 ||
      !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* ---------- Styles ---------- */
  var css =
    '.pwa-banner{position:fixed;left:50%;bottom:calc(118px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9000;' +
    'width:min(460px,calc(100vw - 20px));box-sizing:border-box;display:flex;align-items:center;gap:12px;padding:12px 12px 12px 10px;' +
    'background:linear-gradient(145deg,#1c3856,#152942 70%,#0e233a);color:#fcebc2;border:2px solid #cb9347;border-radius:16px;' +
    'box-shadow:inset 0 0 0 2px #3e5670,0 5px 0 #92612d,0 10px 30px rgba(0,0,0,.45);font-family:var(--title,Fredoka,system-ui,sans-serif);' +
    'animation:pwaIn .35s ease-out}' +
    '.pwa-banner img{width:54px;height:54px;flex:none;filter:drop-shadow(0 2px 6px rgba(255,200,90,.35))}' +
    '.pwa-banner b{display:block;font-size:16px;line-height:1.2}' +
    '.pwa-banner small{display:block;font-size:13px;opacity:.85;font-family:"Atkinson Hyperlegible",system-ui,sans-serif;margin-top:2px}' +
    '.pwa-banner .pwa-txt{flex:1;min-width:0}' +
    '.pwa-btn{font:inherit;font-weight:700;font-size:15px;cursor:pointer;padding:10px 14px;border-radius:12px;border:2px solid #cb9347;' +
    'background:linear-gradient(#ffd770,#e6a93a);color:#3a2207;box-shadow:0 3px 0 #92612d;white-space:nowrap}' +
    '.pwa-btn:active{transform:translateY(2px);box-shadow:0 1px 0 #92612d}' +
    '.pwa-btn.ghost{background:transparent;color:#fcebc2;box-shadow:none;border-color:#3e5670}' +
    '.pwa-x{background:none;border:0;color:#fcebc2;font-size:20px;cursor:pointer;padding:4px 6px;opacity:.75;align-self:flex-start}' +
    '.pwa-btn:focus-visible,.pwa-x:focus-visible{outline:3px solid #ffe78b;outline-offset:2px}' +
    '.pwa-overlay{position:fixed;inset:0;z-index:9500;background:rgba(5,14,30,.72);display:flex;align-items:flex-end;justify-content:center;' +
    'padding:12px;padding-bottom:calc(12px + env(safe-area-inset-bottom,0px));box-sizing:border-box}' +
    '@media(min-width:700px){.pwa-overlay{align-items:center}}' +
    '.pwa-sheet{width:min(440px,100%);max-height:calc(100vh - 24px);overflow:auto;box-sizing:border-box;padding:20px 18px 18px;border-radius:18px;' +
    'background:linear-gradient(160deg,#1c3856,#10233c);color:#fcebc2;border:2px solid #cb9347;box-shadow:inset 0 0 0 2px #3e5670,0 6px 0 #92612d;' +
    'font-family:"Atkinson Hyperlegible",system-ui,sans-serif;animation:pwaIn .3s ease-out;position:relative}' +
    '.pwa-sheet h3{margin:0 0 4px;font-family:var(--title,Fredoka,system-ui,sans-serif);font-size:21px;color:#ffe08a}' +
    '.pwa-sheet p{margin:6px 0 12px;font-size:15px;line-height:1.45}' +
    '.pwa-steps{list-style:none;margin:0 0 14px;padding:0;counter-reset:s}' +
    '.pwa-steps li{counter-increment:s;display:flex;gap:12px;align-items:center;padding:10px 12px;margin-bottom:8px;border-radius:12px;' +
    'background:rgba(255,255,255,.06);border:1px solid #3e5670;font-size:15px;line-height:1.35}' +
    '.pwa-steps li:before{content:counter(s);flex:none;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
    'background:#e6a93a;color:#3a2207;font-weight:700;font-family:var(--title,Fredoka,system-ui,sans-serif)}' +
    '.pwa-ico{display:inline-flex;vertical-align:middle;width:26px;height:26px;border-radius:7px;background:#fcebc2;color:#1a5fd0;align-items:center;justify-content:center;margin:0 2px}' +
    '.pwa-ico svg{width:18px;height:18px}' +
    '.pwa-note{font-size:13px;opacity:.85;margin:0 0 14px}' +
    '.pwa-arrow{position:fixed;left:50%;bottom:calc(4px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:9600;font-size:34px;' +
    'color:#ffe08a;text-shadow:0 2px 6px #000;animation:pwaBounce 1s ease-in-out infinite;pointer-events:none}' +
    '.pwa-row-ok{color:#9be38b;font-weight:700}' +
    '@keyframes pwaIn{from{opacity:0;transform:translate(-50%,16px)}to{opacity:1;transform:translate(-50%,0)}}' +
    '.pwa-sheet{animation-name:pwaSheetIn}@keyframes pwaSheetIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}' +
    '@keyframes pwaBounce{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}' +
    '.calme .pwa-banner,.calme .pwa-sheet,.calme .pwa-arrow{animation:none!important}' +
    '@media(prefers-reduced-motion:reduce){.pwa-banner,.pwa-sheet,.pwa-arrow{animation:none!important}}' +
    '@media(max-width:600px){.pwa-banner{bottom:calc(84px + env(safe-area-inset-bottom,0px))}}';
  var st = document.createElement('style');
  st.id = 'sacados-pwa-v1';
  st.appendChild(document.createTextNode(css));
  document.head.appendChild(st);

  var SHARE_SVG = '<span class="pwa-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5v10h14V11h-1"/></svg></span>';
  var PLUS_SVG = '<span class="pwa-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">' +
    '<rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg></span>';
  var DOTS = '<span class="pwa-ico" aria-hidden="true" style="color:#333;font-weight:700">⋮</span>';

  function el(html) { var d = document.createElement('div'); d.innerHTML = html; return d.firstChild; }
  function remove(node) { if (node && node.parentNode) { node.parentNode.removeChild(node); } }

  /* ---------- Fenêtre d’aide ---------- */
  var sheetNode = null, arrowNode = null, lastFocus = null;
  function closeSheet() {
    remove(sheetNode); remove(arrowNode); sheetNode = null; arrowNode = null;
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function openSheet(inner, withArrow) {
    closeSheet();
    lastFocus = document.activeElement;
    sheetNode = el('<div class="pwa-overlay" data-pwa="overlay"><div class="pwa-sheet" role="dialog" aria-modal="true" aria-labelledby="pwaTitle">' +
      '<button class="pwa-x" data-pwa="close" aria-label="Fermer" style="position:absolute;top:8px;right:8px">✕</button>' + inner + '</div></div>');
    document.body.appendChild(sheetNode);
    if (withArrow && !calme()) { arrowNode = el('<div class="pwa-arrow" aria-hidden="true">⬇</div>'); document.body.appendChild(arrowNode); }
    var b = sheetNode.querySelector('.pwa-btn') || sheetNode.querySelector('button');
    if (b) { b.focus(); }
  }

  function helpIOS() {
    var ipad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    openSheet(
      '<h3 id="pwaTitle">🎒 Mets ton sac sur ton écran</h3>' +
      '<p>En 3 gestes, Sac’Ados s’ouvre comme une vraie appli, en plein écran.</p>' +
      '<ol class="pwa-steps">' +
      '<li><span>Touche le bouton Partager ' + SHARE_SVG + (ipad ? ' en haut de l’écran.' : ' en bas de l’écran.') + '</span></li>' +
      '<li><span>Fais défiler et choisis <b>« Sur l’écran d’accueil »</b> ' + PLUS_SVG + '</span></li>' +
      '<li><span>Touche <b>« Ajouter »</b> en haut à droite. C’est prêt !</span></li>' +
      '</ol>' +
      (inApp ? '<p class="pwa-note">⚠️ Tu es dans une autre appli (Instagram, Snapchat…). Ouvre d’abord ce lien dans <b>Safari</b>.</p>' :
        '<p class="pwa-note">Tu ne vois pas « Sur l’écran d’accueil » ? Ouvre ce lien dans <b>Safari</b>, puis recommence.</p>') +
      '<button class="pwa-btn" data-pwa="close" style="width:100%">J’ai compris</button>',
      !ipad
    );
  }

  function helpOther() {
    var macSafari = !isIOS && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|OPR/.test(ua);
    var firefox = /Firefox/.test(ua) && !isAndroid;
    if (macSafari) {
      openSheet(
        '<h3 id="pwaTitle">🎒 Mettre Sac’Ados dans le Dock</h3>' +
        '<ol class="pwa-steps">' +
        '<li><span>En haut de l’écran, ouvre le menu <b>Fichier</b>.</span></li>' +
        '<li><span>Choisis <b>« Ajouter au Dock… »</b>.</span></li>' +
        '<li><span>Clique sur <b>« Ajouter »</b>. Le sac apparaît dans ton Dock.</span></li>' +
        '</ol>' +
        '<button class="pwa-btn" data-pwa="close" style="width:100%">J’ai compris</button>'
      );
      return;
    }
    if (isAndroid && /Firefox/.test(ua)) {
      openSheet(
        '<h3 id="pwaTitle">🎒 Installer Sac’Ados</h3>' +
        '<ol class="pwa-steps">' +
        '<li><span>Touche le menu ' + DOTS + ' (en bas ou en haut à droite de l’écran).</span></li>' +
        '<li><span>Choisis <b>« Ajouter à l’écran d’accueil »</b>.</span></li>' +
        '<li><span>Confirme avec <b>« Ajouter »</b>. L’icône du sac apparaît avec tes autres applis.</span></li>' +
        '</ol>' +
        '<button class="pwa-btn" data-pwa="close" style="width:100%">J’ai compris</button>'
      );
      return;
    }
    if (firefox) {
      openSheet(
        '<h3 id="pwaTitle">🎒 Installer Sac’Ados</h3>' +
        '<p>Firefox ne sait pas installer les applis sur l’ordinateur.</p>' +
        '<p>Ouvre <b>brot2you.github.io/Sac-Ados</b> dans <b>Chrome</b> ou <b>Edge</b> : un bouton « Installer » apparaîtra.</p>' +
        '<p class="pwa-note">Tu peux aussi simplement ajouter Sac’Ados à tes favoris ⭐.</p>' +
        '<button class="pwa-btn" data-pwa="close" style="width:100%">J’ai compris</button>'
      );
      return;
    }
    openSheet(
      '<h3 id="pwaTitle">🎒 Installer Sac’Ados</h3>' +
      '<ol class="pwa-steps">' +
      '<li><span>Ouvre le menu du navigateur ' + DOTS + ' (en haut à droite).</span></li>' +
      '<li><span>Choisis <b>« Installer l’application »</b> ou <b>« Ajouter à l’écran d’accueil »</b>.</span></li>' +
      '<li><span>Confirme. L’icône du sac apparaît avec tes autres applis.</span></li>' +
      '</ol>' +
      '<p class="pwa-note">Astuce : avec <b>Chrome</b> ou <b>Edge</b>, l’installation se fait en un seul clic.</p>' +
      '<button class="pwa-btn" data-pwa="close" style="width:100%">J’ai compris</button>'
    );
  }

  function install() {
    hideBanner();
    if (deferred) {
      var p = deferred; deferred = null;
      p.prompt();
      if (p.userChoice) {
        p.userChoice.then(function (r) {
          if (r && r.outcome === 'accepted') { done(); }
        });
      }
    } else if (isIOS) { helpIOS(); }
    else { helpOther(); }
  }

  function done() {
    var s = load(); s.installed = true; store(s);
    toast('🎒 Sac’Ados est installé ! Retrouve-le sur ton écran d’accueil.');
    hideBanner();
  }

  function toast(msg) {
    var t = document.getElementById('toast');
    if (!t) { return; }
    var d = document.createElement('div'); d.className = 'toast'; d.textContent = msg;
    t.innerHTML = ''; t.appendChild(d);
    setTimeout(function () { if (d.parentNode === t) { t.innerHTML = ''; } }, 3800);
  }

  /* ---------- Bandeau ---------- */
  var bannerNode = null;
  function hideBanner() { remove(bannerNode); bannerNode = null; }
  function canOffer() { return !standalone() && (deferred || isIOS || isAndroid); }
  function modalOpen() {
    var m = document.getElementById('modal');
    return !!((m && m.children.length) || sheetNode);
  }
  function maybeBanner() {
    if (bannerNode || !canOffer()) { return; }
    /* jamais par-dessus l’accueil « choisis ta classe » ou une autre fenêtre : on attend */
    if (modalOpen()) { setTimeout(maybeBanner, 3000); return; }
    var s = load();
    if (s.installed && !deferred) { return; }
    if (s.later && (Date.now() - s.later) < RESHOW_DAYS * 864e5) { return; }
    bannerNode = el('<div class="pwa-banner" role="region" aria-label="Installer l’appli">' +
      '<img src="assets/pwa/icon-192.png" alt="">' +
      '<div class="pwa-txt"><b>Garde ton sac sur ton téléphone</b><small>Une icône, plein écran, même sans réseau.</small></div>' +
      '<button class="pwa-btn" data-pwa="install">Installer</button>' +
      '<button class="pwa-x" data-pwa="later" aria-label="Plus tard">✕</button></div>');
    document.body.appendChild(bannerNode);
  }

  /* ---------- Ligne dans Réglages ---------- */
  function rowHTML() {
    if (standalone()) {
      return '<div class="row pwa-row"><span><b>Appli installée</b><small>Sac’Ados est sur ton écran d’accueil</small></span><span class="pwa-row-ok">✓</span></div>';
    }
    return '<div class="row pwa-row"><span><b>Installer l’appli</b><small>Sur ton téléphone, ta tablette ou ton ordi</small></span>' +
      '<button class="btn primary" data-pwa="install">📲 Installer</button></div>';
  }
  function patchSettings() {
    var modal = document.getElementById('modal');
    if (!modal) { return; }
    var sheet = modal.querySelector('.sheet');
    if (!sheet || sheet.querySelector('.pwa-row')) { return; }
    var h = sheet.querySelector('h3');
    if (!h || h.textContent.replace(/\s/g, '') !== 'Réglages') { return; }
    var rows = sheet.querySelectorAll('.row');
    var node = el(rowHTML());
    if (rows.length) { rows[0].parentNode.insertBefore(node, rows[0]); } else { sheet.appendChild(node); }
  }

  /* ---------- Clics ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    while (t && t !== document && !(t.getAttribute && t.getAttribute('data-pwa'))) { t = t.parentNode; }
    if (!t || t === document) { return; }
    var a = t.getAttribute('data-pwa');
    if (a === 'overlay' && e.target !== t) { return; }
    e.preventDefault(); e.stopPropagation();
    if (a === 'install') { install(); }
    else if (a === 'later') { var s = load(); s.later = Date.now(); store(s); hideBanner(); }
    else if (a === 'close' || a === 'overlay') { closeSheet(); }
    else if (a === 'update') { applyUpdate(); }
  }, true);
  document.addEventListener('keydown', function (e) {
    if ((e.key === 'Escape' || e.keyCode === 27) && sheetNode) { closeSheet(); }
  });

  /* ---------- Événements navigateur ---------- */
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
  });
  window.addEventListener('appinstalled', function () { deferred = null; done(); });

  /* ---------- Service worker + mises à jour ---------- */
  var waitingWorker = null, reloading = false;
  function showUpdate(w) {
    waitingWorker = w;
    var old = document.getElementById('pwaUpdate'); remove(old);
    var n = el('<div class="pwa-banner" id="pwaUpdate" role="status">' +
      '<img src="assets/pwa/icon-192.png" alt="">' +
      '<div class="pwa-txt"><b>Nouvelle version du sac !</b><small>Touche pour l’ouvrir.</small></div>' +
      '<button class="pwa-btn" data-pwa="update">Mettre à jour</button></div>');
    document.body.appendChild(n);
  }
  function applyUpdate() {
    remove(document.getElementById('pwaUpdate'));
    if (waitingWorker) { waitingWorker.postMessage('skipWaiting'); } else { location.reload(); }
  }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' }).then(function (reg) {
        if (reg.waiting && navigator.serviceWorker.controller) { showUpdate(reg.waiting); }
        reg.addEventListener('updatefound', function () {
          var w = reg.installing;
          if (!w) { return; }
          w.addEventListener('statechange', function () {
            if (w.state === 'installed' && navigator.serviceWorker.controller) { showUpdate(w); }
          });
        });
        /* vérifie les mises à jour quand l’élève revient sur l’appli */
        document.addEventListener('visibilitychange', function () {
          if (document.visibilityState === 'visible') { reg.update().catch(function () {}); }
        });
      }).catch(function () {});
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (reloading) { return; }
        reloading = true; location.reload();
      });
    });
  }

  /* ---------- Démarrage ---------- */
  function start() {
    var modal = document.getElementById('modal');
    if (modal && window.MutationObserver) {
      new MutationObserver(function () {
        if (modal.children.length && bannerNode) { hideBanner(); setTimeout(maybeBanner, 3000); }
        patchSettings();
      }).observe(modal, { childList: true, subtree: true });
    }
    if (standalone()) { var s = load(); if (!s.installed) { s.installed = true; store(s); } }
    setTimeout(maybeBanner, 4000);
  }
  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', start); } else { start(); }

  /* accessible depuis la console ou un autre bouton : SacAdosPWA.install() */
  window.SacAdosPWA = { install: install, help: function () { if (isIOS) { helpIOS(); } else { helpOther(); } } };
})();
