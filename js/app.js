
(function () {
  'use strict';

  var DATA = JSON.parse(document.getElementById('catalogue').textContent);
  var CFG = DATA.config, WORLDS = DATA.mondes, TYPES = DATA.types, DISCS = DATA.disciplines, APPS = DATA.applis;
  var KEY = 'sacados_v1';
  var MAXFAV = CFG.maxRaccourcis || 6;

  var byId = {}, discById = {}, typeById = {}, worldByN = {};
  APPS.forEach(function (a) { byId[a.id] = a; });
  DISCS.forEach(function (d) { discById[d.id] = d; });
  TYPES.forEach(function (t) { typeById[t.id] = t; });
  WORLDS.forEach(function (w) { worldByN[w.n] = w; });

  var ui = { view: 'map', world: null, pocket: 'tout', disc: 'tout', query: '' };
  var state = load();

  function load() {
    var d = { classe: null, favs: [], seen: {}, lexend: false, calme: false, urls: {} };
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var o = JSON.parse(raw);
        for (var k in o) { if (o.hasOwnProperty(k) && d.hasOwnProperty(k)) { d[k] = o[k]; } }
      }
    } catch (e) {}
    if (!(d.favs instanceof Array)) { d.favs = []; }
    d.favs = d.favs.filter(function (id) { return !!byId[id]; });
    return d;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function tint(hex, a) {
    var h = hex.replace('#', '');
    var r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function fold(s) {
    s = String(s).toLowerCase();
    if (s.normalize) { s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    return s;
  }
  /* V3 pixel art : une image réelle par application, discipline et poche. Aucun texte n'est inclus dans les visuels. */
  function pixelImg(src, cls) {
    return '<img class="' + cls + '" src="' + src + '" alt="" loading="lazy" decoding="async" draggable="false">';
  }
  function appArt(a, cls) { return pixelImg('assets/apps/' + a.id + '.webp', cls || 'pixel-app-image'); }
  function discIcon(id) { return pixelImg('assets/disciplines/' + id + '.png', 'pixel-small-icon'); }
  function typeIcon(id) { return pixelImg('assets/categories/' + id + '.png', 'pixel-small-icon'); }
  function uiIcon(id, cls) { return pixelImg('assets/icons/' + id + '.png', cls || 'pixel-small-icon'); }
  function worldIcon(n) { return uiIcon('world' + n, 'pixel-world-icon'); }

  function urlOf(a) { return (state.urls && state.urls[a.id]) || a.url || ''; }
  function isFav(id) { return state.favs.indexOf(id) > -1; }
  function worldApps(n) { return APPS.filter(function (a) { return a.niveaux.indexOf(n) > -1; }); }
  function progress(list) {
    var av = list.filter(function (a) { return !!urlOf(a); });
    var s = av.filter(function (a) { return !!state.seen[a.id]; }).length;
    return { seen: s, total: av.length };
  }
  function pct(p) { return p.total ? Math.round(p.seen / p.total * 100) : 0; }
  function discStyle(a) {
    var c = discById[a.disc].c;
    return '--c:' + c + ';--t:' + tint(c, 0.14);
  }
  function sortApps(list) {
    var order = {};
    DISCS.forEach(function (d, i) { order[d.id] = i; });
    return list.slice().sort(function (x, y) {
      if (order[x.disc] !== order[y.disc]) { return order[x.disc] - order[y.disc]; }
      return x.nom.localeCompare(y.nom, 'fr');
    });
  }

  /* ---------- Carte du monde ---------- */
  var POS = { 6: { x: 96, y: 492 }, 5: { x: 262, y: 372 }, 4: { x: 98, y: 248 }, 3: { x: 258, y: 122 } };

  function tree(x, y) {
    return '<rect x="' + (x - 2.5) + '" y="' + y + '" width="5" height="10" rx="2" class="f-trunk"/>' +
      '<circle cx="' + x + '" cy="' + (y - 6) + '" r="11" class="f-leaf"/>' +
      '<circle cx="' + (x - 3.5) + '" cy="' + (y - 9.5) + '" r="4.5" class="f-leafl"/>';
  }
  function pine(x, y, s) {
    var w = 11 * s, h = 15 * s;
    return '<rect x="' + (x - 2) + '" y="' + (y - 3) + '" width="4" height="' + (6 * s) + '" class="f-trunk"/>' +
      '<polygon points="' + (x - w) + ',' + y + ' ' + x + ',' + (y - h) + ' ' + (x + w) + ',' + y + '" class="f-pine"/>' +
      '<polygon points="' + x + ',' + (y - h) + ' ' + (x + w) + ',' + y + ' ' + x + ',' + y + '" class="f-pine2"/>' +
      '<polygon points="' + (x - w * 0.75) + ',' + (y - h * 0.6) + ' ' + x + ',' + (y - h * 1.45) + ' ' + (x + w * 0.75) + ',' + (y - h * 0.6) + '" class="f-pine"/>' +
      '<polygon points="' + x + ',' + (y - h * 1.45) + ' ' + (x + w * 0.75) + ',' + (y - h * 0.6) + ' ' + x + ',' + (y - h * 0.6) + '" class="f-pine2"/>';
  }
  function cactus(x, y, s) {
    return '<rect x="' + (x - 4 * s) + '" y="' + (y - 26 * s) + '" width="' + (8 * s) + '" height="' + (26 * s) + '" rx="' + (4 * s) + '" class="f-cactus"/>' +
      '<rect x="' + (x - 11 * s) + '" y="' + (y - 20 * s) + '" width="' + (5 * s) + '" height="' + (11 * s) + '" rx="' + (2.5 * s) + '" class="f-cactus"/>' +
      '<rect x="' + (x - 11 * s) + '" y="' + (y - 12 * s) + '" width="' + (9 * s) + '" height="' + (4 * s) + '" rx="' + (2 * s) + '" class="f-cactus"/>' +
      '<rect x="' + (x + 6 * s) + '" y="' + (y - 23 * s) + '" width="' + (5 * s) + '" height="' + (10 * s) + '" rx="' + (2.5 * s) + '" class="f-cactus"/>' +
      '<rect x="' + (x + 2 * s) + '" y="' + (y - 16 * s) + '" width="' + (9 * s) + '" height="' + (4 * s) + '" rx="' + (2 * s) + '" class="f-cactus"/>';
  }

  function biome(n, x, y) {
    var s = '';
    if (n === 6) {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="24" class="f-grass2"/>';
      s += '<ellipse cx="' + x + '" cy="' + (y - 4) + '" rx="57" ry="22" class="f-grass"/>';
      s += tree(x + 28, y - 22);
      s += '<rect x="' + (x - 14) + '" y="' + (y - 16) + '" width="22" height="15" rx="2" class="f-wall"/>';
      s += '<polygon points="' + (x - 18) + ',' + (y - 15) + ' ' + (x - 3) + ',' + (y - 28) + ' ' + (x + 12) + ',' + (y - 15) + '" class="f-roof"/>';
      s += '<rect x="' + (x - 6) + '" y="' + (y - 9) + '" width="6" height="8" rx="1" class="f-win"/>';
      s += tree(x - 38, y - 10) + tree(x + 40, y - 4);
      s += '<circle cx="' + (x - 22) + '" cy="' + (y + 4) + '" r="2.4" class="f-fl1"/><circle cx="' + (x + 14) + '" cy="' + (y + 6) + '" r="2.4" class="f-fl2"/>';
      s += '<circle cx="' + (x + 22) + '" cy="' + (y + 1) + '" r="2.2" class="f-fl1"/><circle cx="' + (x - 30) + '" cy="' + (y - 2) + '" r="2.2" class="f-fl2"/>';
    } else if (n === 5) {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="24" class="f-dune2"/>';
      s += '<ellipse cx="' + x + '" cy="' + (y - 4) + '" rx="57" ry="22" class="f-dune"/>';
      s += '<polygon points="' + (x - 8) + ',' + (y - 4) + ' ' + (x + 14) + ',' + (y - 42) + ' ' + (x + 36) + ',' + (y - 4) + '" class="f-dune2"/>';
      s += '<polygon points="' + (x - 8) + ',' + (y - 4) + ' ' + (x + 14) + ',' + (y - 42) + ' ' + (x + 14) + ',' + (y - 4) + '" class="f-sand"/>';
      s += cactus(x - 32, y - 2, 1) + cactus(x + 46, y + 2, 0.7);
    } else if (n === 4) {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="24" class="f-pine2"/>';
      s += '<ellipse cx="' + x + '" cy="' + (y - 4) + '" rx="57" ry="22" class="f-grass2"/>';
      s += pine(x - 16, y - 14, 1.05) + pine(x + 8, y - 18, 1.25) + pine(x + 30, y - 10, 1) +
        pine(x - 38, y - 4, 0.9) + pine(x + 44, y, 0.8) + pine(x - 4, y + 2, 0.85);
      s += '<g class="mist"><ellipse cx="' + (x - 20) + '" cy="' + (y - 24) + '" rx="26" ry="6" class="f-mist"/>' +
        '<ellipse cx="' + (x + 26) + '" cy="' + (y - 34) + '" rx="20" ry="5" class="f-mist"/></g>';
    } else {
      s += '<ellipse cx="' + x + '" cy="' + y + '" rx="58" ry="24" class="f-rock2"/>';
      s += '<ellipse cx="' + x + '" cy="' + (y - 4) + '" rx="57" ry="22" class="f-rock"/>';
      s += '<polygon points="' + (x - 56) + ',' + (y - 2) + ' ' + (x - 28) + ',' + (y - 52) + ' ' + (x - 4) + ',' + (y - 2) + '" class="f-rock2"/>';
      s += '<polygon points="' + (x - 36) + ',' + (y - 38) + ' ' + (x - 28) + ',' + (y - 52) + ' ' + (x - 20) + ',' + (y - 38) + ' ' + (x - 24) + ',' + (y - 35) + ' ' + (x - 28) + ',' + (y - 39) + ' ' + (x - 32) + ',' + (y - 35) + '" class="f-snow"/>';
      var cx = x + 16;
      s += '<rect x="' + (cx - 16) + '" y="' + (y - 28) + '" width="32" height="24" class="f-castle"/>';
      s += '<rect x="' + (cx - 24) + '" y="' + (y - 40) + '" width="11" height="36" class="f-castle"/>';
      s += '<rect x="' + (cx + 13) + '" y="' + (y - 40) + '" width="11" height="36" class="f-castle"/>';
      s += '<rect x="' + (cx - 24) + '" y="' + (y - 45) + '" width="3.5" height="5" class="f-castle"/><rect x="' + (cx - 16.5) + '" y="' + (y - 45) + '" width="3.5" height="5" class="f-castle"/>';
      s += '<rect x="' + (cx + 13) + '" y="' + (y - 45) + '" width="3.5" height="5" class="f-castle"/><rect x="' + (cx + 20.5) + '" y="' + (y - 45) + '" width="3.5" height="5" class="f-castle"/>';
      s += '<path d="M' + (cx - 5) + ' ' + (y - 4) + ' v-9 a5 5 0 0 1 10 0 v9 z" class="f-win"/>';
      s += '<rect x="' + (cx - 21) + '" y="' + (y - 31) + '" width="5" height="7" rx="2" class="f-win"/><rect x="' + (cx + 16) + '" y="' + (y - 31) + '" width="5" height="7" rx="2" class="f-win"/>';
      s += '<line x1="' + cx + '" y1="' + (y - 28) + '" x2="' + cx + '" y2="' + (y - 50) + '" stroke="currentColor" stroke-width="2" class="f-pole"/>';
      s += '<polygon points="' + cx + ',' + (y - 50) + ' ' + (cx + 14) + ',' + (y - 45) + ' ' + cx + ',' + (y - 40) + '" class="f-flag"/>';
    }
    return s;
  }

  function islandSVG(w) {
    var n = w.n, p = POS[n], x = p.x, y = p.y;
    var prog = progress(worldApps(n));
    var home = state.classe === n;
    var s = '<g class="island" data-act="world" data-n="' + n + '" tabindex="0" role="button" aria-label="' +
      esc(w.monde + ', ' + w.nom + ', ' + n + 'e, ' + prog.seen + ' objets découverts sur ' + prog.total) + '">';
    if (home) {
      s += '<ellipse cx="' + x + '" cy="' + (y + 6) + '" rx="84" ry="42" fill="none" stroke="var(--pack)" stroke-width="4" class="pulse"/>';
    }
    s += '<g class="lift">';
    s += '<ellipse cx="' + x + '" cy="' + (y + 16) + '" rx="80" ry="32" class="f-sea2"/>';
    s += '<ellipse cx="' + x + '" cy="' + (y + 8) + '" rx="76" ry="35" class="f-foam"/>';
    s += '<ellipse cx="' + x + '" cy="' + (y + 6) + '" rx="71" ry="32" class="f-sand2"/>';
    s += '<ellipse cx="' + x + '" cy="' + (y + 1) + '" rx="69" ry="30" class="f-sand"/>';
    s += biome(n, x, y);
    s += '</g>';
    s += '<rect x="' + (x - 40) + '" y="' + (y + 32) + '" width="80" height="22" rx="7" class="f-wood plate-bg"/>';
    s += '<text x="' + (x - 32) + '" y="' + (y + 47) + '" class="plate-t">' + n + 'e</text>';
    s += '<text x="' + (x + 33) + '" y="' + (y + 47.5) + '" text-anchor="end" class="plate-s">★ ' + prog.seen + '/' + prog.total + '</text>';
    s += '</g>';
    return s;
  }

  function cloud(cls, x, y, k) {
    return '<g class="cloud ' + cls + '"><g transform="translate(' + x + ' ' + y + ') scale(' + k + ')">' +
      '<ellipse cx="0" cy="0" rx="22" ry="11" class="f-cloud"/><ellipse cx="-14" cy="4" rx="14" ry="8" class="f-cloud"/>' +
      '<ellipse cx="16" cy="4" rx="15" ry="8" class="f-cloud"/><ellipse cx="4" cy="-7" rx="13" ry="9" class="f-cloud"/></g></g>';
  }

  function mapSVG() {
    var s = '<svg viewBox="0 0 360 600" role="group" aria-label="Carte des quatre mondes du collège">';
    s += '<rect width="360" height="600" fill="var(--ocean)"/>';
    var waves = [[300, 560], [200, 572], [160, 440], [320, 480], [26, 392], [196, 256], [326, 262], [24, 150], [150, 54], [326, 36], [176, 176], [60, 330], [300, 190], [230, 470]];
    waves.forEach(function (v) {
      s += '<path class="wave" d="M' + v[0] + ' ' + v[1] + ' q5 -5 10 0 q5 -5 10 0"/>';
    });
    var path = 'M40 574 Q60 540 96 520 Q190 470 262 398 Q200 330 98 274 Q170 210 258 148';
    s += '<path d="' + path + '" class="f-path"/><path d="' + path + '" class="f-pathdot"/>';
    s += '<g><line x1="34" y1="584" x2="34" y2="556" stroke="var(--wood)" stroke-width="2.5"/>' +
      '<polygon points="34,556 52,562 34,568" class="f-flag"/><text x="20" y="596" class="start-t">DÉPART</text></g>';
    var order = [6, 5, 4, 3];
    order.forEach(function (n) { if (worldByN[n]) { s += islandSVG(worldByN[n]); } });
    if (state.classe && POS[state.classe]) {
      var p = POS[state.classe];
      s += '<g transform="translate(' + (p.x + 56) + ' ' + (p.y - 46) + ')" aria-hidden="true"><g class="bob">' +
        '<circle cx="0" cy="0" r="17" fill="var(--paper)" stroke="var(--pack-2)" stroke-width="3"/>' +
        '<text x="0" y="7" text-anchor="middle" font-size="19">🎒</text>' +
        '<polygon points="-6,15 6,15 0,24" fill="var(--pack-2)"/></g></g>';
    }
    s += cloud('c1', 300, 300, 1) + cloud('c2', 60, 52, 0.8) + cloud('c3', 190, 520, 0.7);
    s += '</svg>';
    return s;
  }

  function worldArtwork(n) {
    return {6:'prairie',5:'desert',4:'forest',3:'mountain'}[n] || 'prairie';
  }
  function renderMap() {
    var html = '<div class="page-intro"><span class="eyebrow">✦ PIXEL KINGDOM DELUXE ✦</span>' +
      '<h1 class="h1">Bienvenue au Royaume de Sac’Ados</h1>' +
      '<p class="lede">Quatre mondes à explorer, des applications à découvrir. Choisis ton île pour ouvrir ton sac !</p></div>';
    html += '<section class="kingdom-map" aria-label="Carte interactive des quatre mondes">' +
      '<img src="assets/worlds/kingdom-map.webp" width="1536" height="875" alt="Paysage en pixel art : prairie, désert, forêt enchantée et montagnes, reliés par un port central." loading="eager" decoding="async">';
    WORLDS.forEach(function(w){
      var p = progress(worldApps(w.n));
      html += '<button type="button" class="map-hit hit-'+w.n+'" data-act="world" data-n="'+w.n+'"' +
        ' aria-label="Entrer en '+w.n+'e : '+esc(w.nom)+'. '+p.seen+' applications ouvertes sur '+p.total+' disponibles."' +
        ' title="Ouvrir '+esc(w.nom)+'"><span class="sr">Ouvrir '+esc(w.nom)+'</span></button>';
    });
    html += '</section>';
    html += '<div class="map-hint"><span aria-hidden="true">✧</span> Clique sur une île de la carte, ou utilise les cartes ci-dessous.</div>';
    html += '<div class="section-line"><div><span class="eyebrow">CHOISIS TON AVENTURE</span><h2>Les quatre mondes</h2></div>' +
      '<span class="chapter-count">4 DESTINATIONS</span></div>';
    html += '<div class="world-deck">';
    WORLDS.forEach(function (w) {
      var p = progress(worldApps(w.n));
      var home = state.classe === w.n;
      html += '<button type="button" class="world-tile world-'+w.n+(home?' is-home':'')+'" data-act="world" data-n="'+w.n+'">' +
        '<span class="tile-visual"><img src="assets/worlds/'+worldArtwork(w.n)+'.webp" alt="" loading="lazy" decoding="async">' +
        '<span class="tile-badge">'+w.n+'e</span></span>' +
        '<span class="tile-detail"><span class="tile-label">MONDE '+(7-w.n)+(home?' · TON MONDE':'')+'</span>' +
        '<span class="tile-title">'+esc(w.nom)+'</span>' +
        '<span class="bar" aria-hidden="true"><i style="width:'+pct(p)+'%"></i></span>' +
        '<span class="tile-foot">'+p.seen+' / '+p.total+' applis ouvertes <span aria-hidden="true">↗</span></span></span></button>';
    });
    html += '</div>';
    var allp=progress(APPS);
    html += '<div class="adventure-callout"><span class="callout-icon" aria-hidden="true">' + uiIcon('bag', 'pixel-callout-icon') + '</span><div>' +
      '<strong>Ton aventure commence ici !</strong><p>'+allp.seen+' application(s) ouvertes sur '+allp.total+' disponibles. Les découvertes correspondent aux applis lancées, pas à des exercices terminés.</p></div>' +
      '<button class="btn primary" data-act="bag">Explorer mon sac →</button></div>';
    $('view').innerHTML = html;
  }

  /* ---------- Monde : le sac ---------- */
  function questFor(n) {
    var list = worldApps(n).filter(function (a) { return !!urlOf(a); });
    if (!list.length) { return null; }
    var fresh = list.filter(function (a) { return !state.seen[a.id]; });
    var pool = sortApps(fresh.length ? fresh : list);
    var d = new Date();
    var seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + n * 7;
    return pool[seed % pool.length];
  }

  function slotHTML(a) {
    var d = discById[a.disc];
    var tag = '';
    if (a.bientot) { tag = '<span class="tag soon">Bientôt</span>'; }
    else if (state.seen[a.id]) { tag = '<span class="tag seen" aria-label="déjà ouverte">✓ Ouverte</span>'; }
    else if (a.nouveau) { tag = '<span class="tag new">NEW</span>'; }
    var fav = isFav(a.id) ? '<span class="tag fav" aria-label="dans tes raccourcis">★</span>' : '';
    return '<button type="button" class="slot" data-act="item" data-id="' + a.id + '" style="' + discStyle(a) + '" aria-label="' +
      esc(a.nom + ', ' + d.nom) + '">' +
      '<span class="slot-art" aria-hidden="true">' + appArt(a, 'pixel-poster') + '</span>' +
      fav + tag + '<span class="slot-card-info"><span class="slot-name">' + esc(a.nom) + '</span>' +
      '<span class="slot-sub">' + esc(d.nom) + ' · ' + esc(a.duree) + '</span></span></button>';
  }

  function filtered() {
    var q = fold(ui.query.trim());
    return worldApps(ui.world).filter(function (a) {
      if (ui.pocket !== 'tout' && a.type !== ui.pocket) { return false; }
      if (ui.disc !== 'tout' && a.disc !== ui.disc) { return false; }
      if (q) {
        var hay = fold(a.nom + ' ' + a.desc + ' ' + discById[a.disc].nom + ' ' + typeById[a.type].nom);
        if (hay.indexOf(q) < 0) { return false; }
      }
      return true;
    });
  }

  function renderGrid() {
    var list = filtered(), html = '';
    if (!list.length) {
      html = '<div class="empty"><b>Cette poche est vide</b>Choisis une autre poche ou une autre matière, ou efface ta recherche.</div>';
    } else if (ui.pocket === 'tout') {
      TYPES.forEach(function (t) {
        var part = sortApps(list.filter(function (a) { return a.type === t.id; }));
        if (!part.length) { return; }
        html += '<h3 class="sec-h">' + typeIcon(t.id) + esc(t.nom) + ' <small>' + esc(t.desc) + '</small></h3>';
        html += '<div class="grid">' + part.map(slotHTML).join('') + '</div>';
      });
    } else {
      html = '<div class="grid">' + sortApps(list).map(slotHTML).join('') + '</div>';
    }
    $('grid').innerHTML = html;
  }

  function renderWorld() {
    var n = ui.world, w = worldByN[n], all = worldApps(n), p = progress(all);
    var html = '<div class="world-top"><button class="btn" data-act="map">← Retour à la carte</button>' +
      '<div class="wt-txt"><span class="eyebrow">MONDE ' + (7-n) + ' · CLASSE DE ' + n + 'e</span>' +
      '<h1 class="h1">' + esc(w.nom) + '</h1>' +
      '<p class="lede">Choisis une application pour commencer ton aventure.</p>' +
      '<div class="wt-prog"><span class="bar" aria-hidden="true"><i style="width:' + pct(p) + '%"></i></span>' +
      '<span class="wc-p">' + p.seen + ' / ' + p.total + ' applications ouvertes dans ce monde</span></div></div></div>' +
      '<div class="world-banner"><img src="assets/worlds/'+worldArtwork(n)+'.webp" alt="Décor de '+esc(w.nom)+' en pixel art" />' +
      '<span class="banner-level">✦ '+n+'e · MONDE '+(7-n)+'</span></div>';

    html += '<section class="pack" aria-label="Ton sac">';
    html += '<div class="flap"><h2>Ton sac de ' + n + 'e</h2><p>' + all.length + ' objets rangés dans 5 poches</p><span class="buckle" aria-hidden="true"></span></div>';
    html += '<div class="pack-body">';

    var q = questFor(n);
    if (q) {
      var done = !!state.seen[q.id];
      html += '<div class="quest"><span class="quest-ico" aria-hidden="true">' + uiIcon('quest', 'pixel-quest-icon') + '</span><div class="quest-txt">' +
        '<div class="quest-k">' + (done ? 'Application du jour déjà ouverte ✓' : 'Application à découvrir aujourd’hui') + '</div>' +
        '<div class="quest-t">' + (done ? 'Tu as déjà ouvert ' : 'Découvre ') + esc(q.nom) + '</div></div>' +
        '<button class="btn primary" data-act="item" data-id="' + q.id + '">Voir l’objet</button></div>';
    }

    html += '<div class="pockets" role="tablist" aria-label="Poches du sac">';
    html += '<button class="pocket" role="tab" data-act="pocket" data-p="tout" aria-selected="' + (ui.pocket === 'tout') + '">' + uiIcon('bag') + ' Tout le sac <span class="n">' + all.length + '</span></button>';
    TYPES.forEach(function (t) {
      var c = all.filter(function (a) { return a.type === t.id; }).length;
      if (!c) { return; }
      html += '<button class="pocket" role="tab" data-act="pocket" data-p="' + t.id + '" aria-selected="' + (ui.pocket === t.id) + '">' +
        typeIcon(t.id) + ' ' + esc(t.nom) + ' <span class="n">' + c + '</span></button>';
    });
    html += '</div>';

    html += '<div class="tools"><label class="search"><span aria-hidden="true">🔎</span><span class="sr">Rechercher</span>' +
      '<input id="q" type="search" placeholder="Chercher un objet" value="' + esc(ui.query) + '" autocomplete="off"></label>';
    html += '<div class="chips" role="group" aria-label="Matières">';
    html += '<button class="chip" data-act="disc" data-d="tout" aria-pressed="' + (ui.disc === 'tout') + '">Toutes</button>';
    DISCS.forEach(function (d) {
      if (!all.some(function (a) { return a.disc === d.id; })) { return; }
      html += '<button class="chip" data-act="disc" data-d="' + d.id + '" aria-pressed="' + (ui.disc === d.id) + '">' +
        discIcon(d.id) + esc(d.nom) + '</button>';
    });
    html += '</div></div>';

    html += '<div id="grid"></div></div></section>';
    $('view').innerHTML = html;
    renderGrid();
    var inp = $('q');
    inp.addEventListener('input', function () { ui.query = inp.value; renderGrid(); });
  }

  /* ---------- Barre de raccourcis ---------- */
  function renderHotbar() {
    var html = '<div class="hb-inner"><span class="hb-label">Mes raccourcis</span>';
    for (var i = 0; i < MAXFAV; i++) {
      var id = state.favs[i], a = id ? byId[id] : null;
      if (a && urlOf(a)) {
        html += '<a class="hb-slot lnk" href="' + esc(urlOf(a)) + '" target="_blank" rel="noopener" data-act="launch" data-id="' + a.id + '" title="Lancer ' + esc(a.nom) + '" aria-label="Lancer ' + esc(a.nom) + '">' + appArt(a, 'pixel-shortcut-art') + '</a>';
      } else if (a) {
        html += '<button class="hb-slot" data-act="item" data-id="' + a.id + '" title="' + esc(a.nom) + '" aria-label="' + esc(a.nom) + '">' + appArt(a, 'pixel-shortcut-art') + '</button>';
      } else {
        html += '<button class="hb-slot empty-s" data-act="hot-empty" aria-label="Emplacement libre">＋</button>';
      }
    }
    html += '</div>';
    $('hotbar').innerHTML = html;
  }

  function renderHeader() {
    $('appName').textContent = CFG.nom;
    $('appSub').textContent = CFG.sousTitre;
    var p = progress(APPS);
    $('loot').innerHTML = '🏅 ' + p.seen + ' / ' + p.total;
    $('loot').setAttribute('aria-label', p.seen + ' objets découverts sur ' + p.total);
    document.documentElement.className = (state.lexend ? 'lexend ' : '') + (state.calme ? 'calme' : '');
  }

  function render() {
    renderHeader();
    if ($('hotbar')) $('hotbar').setAttribute('data-open','false');
    if ($('shortcutToggle')) $('shortcutToggle').setAttribute('aria-expanded','false');
    if (ui.view === 'world' && ui.world) { renderWorld(); }
    else if (ui.view === 'quests') { renderQuests(); }
    else if (ui.view === 'discoveries') { renderDiscoveries(); }
    else { renderMap(); }
    renderHotbar();
    document.querySelectorAll('.main-tab').forEach(function(tab){
      var on = tab.getAttribute('data-tab') === ui.view;
      if (on) tab.setAttribute('aria-current','page');
      else tab.removeAttribute('aria-current');
    });
  }

  /* ---------- Journal & découvertes ---------- */
  function renderQuests() {
    var n=state.classe || 6, q=questFor(n), w=worldByN[n];
    var html='<div class="page-intro"><span class="eyebrow">JOURNAL DE L’AVENTURIER</span>' +
      '<h1 class="h1">Mes quêtes</h1><p class="lede">Chaque jour, une application à explorer dans ton monde. Une application ouverte n’est pas un exercice validé.</p></div>';
    html+='<div class="journal-card"><div class="journal-icon">' + uiIcon('quest', 'pixel-journal-icon') + '</div><div class="journal-body">' +
      '<span class="eyebrow">DÉCOUVERTE DU JOUR · '+n+'e</span><h2>'+esc(w.nom)+'</h2>';
    if(q){
      html+='<p>' + (state.seen[q.id] ? 'Tu as déjà ouvert cette application :' : 'Ta suggestion pour aujourd’hui :') + '</p>' +
        '<h3>'+esc(q.nom)+'</h3><p>'+esc(q.desc)+'</p></div>' +
        '<button class="btn primary" data-act="item" data-id="'+q.id+'">Voir l’application →</button>';
    } else {
      html+='<p>Aucune application avec un lien disponible pour ce monde actuellement.</p></div>' +
        '<button class="btn primary" data-act="bag">Voir le sac</button>';
    }
    html+='</div><div class="section-line"><div><span class="eyebrow">AUTRES AVENTURES</span><h2>Explorer un autre monde</h2></div></div><div class="mini-worlds">';
    WORLDS.forEach(function(ww){
      html+='<button class="mini-world" data-act="world" data-n="'+ww.n+'"><img src="assets/worlds/'+worldArtwork(ww.n)+'.webp" alt="" loading="lazy">' +
        '<strong>'+ww.n+'e</strong><span>'+esc(ww.nom)+'</span> →</button>';
    });
    html+='</div>';
    $('view').innerHTML=html;
  }
  function renderDiscoveries() {
    var available=APPS.filter(function(a){return !!urlOf(a);});
    var seen=sortApps(available.filter(function(a){return !!state.seen[a.id];}));
    var p=progress(APPS);
    var html='<div class="page-intro"><span class="eyebrow">CARNET DE COLLECTION</span><h1 class="h1">🏅 Mes découvertes</h1>' +
      '<p class="lede">Retrouve les applications que tu as ouvertes et celles qui restent à explorer.</p></div>' +
      '<div class="discover-totals"><strong>'+p.seen+' <small>/ '+p.total+'</small></strong>' +
      '<div><h2>Applications ouvertes</h2><span class="bar" aria-hidden="true"><i style="width:'+pct(p)+'%"></i></span>' +
      '<p>Le compteur indique les applications lancées, pas les activités terminées.</p></div></div>';
    html+='<div class="section-line"><div><span class="eyebrow">MON ALBUM</span><h2>'+(seen.length?'Mes trouvailles':'Aucune découverte pour le moment')+'</h2></div></div>';
    if(seen.length) html+='<div class="grid">'+seen.map(slotHTML).join('')+'</div>';
    else html+='<div class="empty pixel-empty"><b>Ton album attend ses premières découvertes !</b>Ouvre une application depuis ton sac pour la retrouver ici.</div>';
    html+='<div class="bottom-action"><button class="btn primary" data-act="bag">🎒 Explorer mon sac →</button></div>';
    $('view').innerHTML=html;
  }

  /* ---------- Fenêtres ---------- */
  var lastFocus = null;
  function openModal(html, locked) {
    lastFocus = document.activeElement;
    $('modal').innerHTML = '<div class="overlay" data-locked="' + (locked ? '1' : '0') + '"><div class="sheet" role="dialog" aria-modal="true">' + html + '</div></div>';
    var f = $('modal').querySelector('button, a, input');
    if (f) { f.focus(); }
  }
  function closeModal() {
    $('modal').innerHTML = '';
    if (lastFocus && lastFocus.focus && document.body.contains(lastFocus)) { lastFocus.focus(); }
  }
  function modalOpen() { return !!$('modal').firstChild; }

  function showItem(id) {
    var a = byId[id]; if (!a) { return; }
    var d = discById[a.disc], t = typeById[a.type], url = urlOf(a);
    var html = '<button class="close-x" data-act="close" aria-label="Fermer">✕</button>';
    html += '<div class="sheet-head"><div class="sheet-ico pixel-sheet-art" style="' + discStyle(a) + '" aria-hidden="true">' + appArt(a, 'pixel-modal-poster') + '</div><div><h3>' + esc(a.nom) + '</h3>' +
      '<div class="pills"><span class="pill" style="box-shadow:inset 0 0 0 2px ' + d.c + '">' + discIcon(d.id) + ' ' + esc(d.nom) + '</span>' +
      '<span class="pill">' + typeIcon(t.id) + ' ' + esc(t.nom) + '</span><span class="pill">⏱ ' + esc(a.duree) + '</span></div></div></div>';
    html += '<p>' + esc(a.desc) + '</p>';
    html += '<div class="lvls"><span>Pour les classes de</span>';
    [6, 5, 4, 3].forEach(function (n) { html += '<span class="lvl' + (a.niveaux.indexOf(n) > -1 ? ' on' : '') + '">' + n + 'e</span>'; });
    html += '</div><div class="actions">';
    if (url) {
      html += '<a class="btn primary" href="' + esc(url) + '" target="_blank" rel="noopener" data-act="launch" data-id="' + a.id + '">▶ Lancer l’appli</a>';
    } else {
      html += '<button class="btn primary" disabled>' + (a.bientot ? '🥚 Bientôt dans ton sac' : '🔗 Lien à venir') + '</button>';
    }
    html += '<button class="btn" data-act="fav" data-id="' + a.id + '">' + (isFav(a.id) ? '⭐ Retirer des raccourcis' : '☆ Ajouter aux raccourcis') + '</button>';
    html += '</div>';
    if (state.seen[a.id]) { html += '<div class="note">✓ Tu as déjà ouvert cette application.</div>'; }
    openModal(html);
  }

  function classPickHTML() {
    var h = '<div class="class-pick">';
    WORLDS.forEach(function (w) {
      h += '<button data-act="setclass" data-n="' + w.n + '" class="' + (state.classe === w.n ? 'on' : '') + '">' +
        '<span class="e" aria-hidden="true">' + worldIcon(w.n) + '</span><span class="l">' + w.n + 'e</span><span class="s">' + esc(w.nom) + '</span></button>';
    });
    return h + '</div>';
  }

  function showWelcome() {
    var html = '<h3>Bienvenue dans ton ' + esc(CFG.nom) + ' 🎒</h3>' +
      '<p>Toutes les applis du collège sont rangées ici, île par île. Pour commencer, dis-nous en quelle classe tu es.</p>' +
      classPickHTML() + '<p class="note">Tu pourras changer de classe à tout moment dans les réglages ⚙️.</p>';
    openModal(html, true);
  }

  function showSettings() {
    var html = '<button class="close-x" data-act="close" aria-label="Fermer">✕</button><h3>Réglages</h3>';
    html += '<p style="margin-bottom:0"><b>Ma classe</b></p>' + classPickHTML();
    html += '<div class="row"><span><b>Police très lisible</b><small>Lexend, plus aérée</small></span>' +
      '<button class="switch" role="switch" data-act="toggle" data-k="lexend" aria-checked="' + !!state.lexend + '" aria-label="Police très lisible"></button></div>';
    html += '<div class="row"><span><b>Mode calme</b><small>Sans animations</small></span>' +
      '<button class="switch" role="switch" data-act="toggle" data-k="calme" aria-checked="' + !!state.calme + '" aria-label="Mode calme"></button></div>';
    html += '<div class="row"><span><b>Recommencer</b><small>Efface tes découvertes et tes raccourcis</small></span>' +
      '<button class="btn" data-act="reset">Tout effacer</button></div>';
    html += '<div class="row"><span><b>Espace prof</b><small>Ajouter les liens des applis</small></span>' +
      '<button class="btn dark" data-act="prof">Ouvrir</button></div>';
    openModal(html);
  }

  function showProf() {
    var html = '<button class="close-x" data-act="close" aria-label="Fermer">✕</button><h3>Espace prof</h3>';
    html += '<p>Colle l’adresse de chaque appli. « Tester ici » enregistre les liens sur cet appareil seulement. Pour que tous les élèves les voient, génère le catalogue et remplace le bloc <code>catalogue</code> du fichier.</p>';
    html += '<div class="prof-list">';
    sortApps(APPS).forEach(function (a) {
      html += '<div class="prof-item"><label for="u-' + a.id + '">' + appArt(a, 'pixel-prof-art') + ' ' + esc(a.nom) + '</label>' +
        '<input id="u-' + a.id + '" data-id="' + a.id + '" type="url" placeholder="https://brot2you.github.io/…" value="' + esc(urlOf(a)) + '"></div>';
    });
    html += '</div><div class="actions"><button class="btn" data-act="prof-save">Tester ici</button><button class="btn primary" data-act="prof-json">Générer le catalogue</button></div>';
    html += '<div id="jsonOut"></div>';
    openModal(html);
  }

  function readProfInputs() {
    var inputs = $('modal').querySelectorAll('.prof-item input');
    var urls = {};
    for (var i = 0; i < inputs.length; i++) {
      var v = inputs[i].value.trim();
      if (v) { urls[inputs[i].getAttribute('data-id')] = v; }
    }
    return urls;
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $('toast');
    t.innerHTML = '<div class="toast">' + esc(msg) + '</div>';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.innerHTML = ''; }, 2600);
  }

  /* ---------- Actions ---------- */
  function openWorld(n) {
    ui.view = 'world'; ui.world = n; ui.pocket = 'tout'; ui.disc = 'tout'; ui.query = '';
    render();
    window.scrollTo(0, 0);
  }

  document.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-act]') : null;
    if (!t) {
      var ov = e.target.className === 'overlay' ? e.target : null;
      if (ov && ov.getAttribute('data-locked') !== '1') { closeModal(); }
      return;
    }
    var act = t.getAttribute('data-act');
    var id = t.getAttribute('data-id');

    if (act === 'hot-toggle') {
      var panel=$('hotbar'), trigger=$('shortcutToggle');
      var open=panel.getAttribute('data-open') !== 'true';
      panel.setAttribute('data-open', String(open));
      trigger.setAttribute('aria-expanded', String(open));
      return;
    }
    if (act === 'world') { openWorld(parseInt(t.getAttribute('data-n'), 10)); }
    else if (act === 'map') { ui.view = 'map'; render(); window.scrollTo(0, 0); }
    else if (act === 'bag') { openWorld(state.classe || ui.world || 6); }
    else if (act === 'quests') { ui.view = 'quests'; render(); window.scrollTo(0, 0); }
    else if (act === 'discoveries') { ui.view = 'discoveries'; render(); window.scrollTo(0, 0); }
    else if (act === 'pocket') { ui.pocket = t.getAttribute('data-p'); renderWorld(); }
    else if (act === 'disc') { ui.disc = t.getAttribute('data-d'); renderWorld(); }
    else if (act === 'item') { showItem(id); }
    else if (act === 'launch') {
      var first = !state.seen[id];
      state.seen[id] = 1; save();
      setTimeout(function () {
        if (modalOpen()) { closeModal(); }
        render();
        if (first) { toast('Nouvel objet découvert : ' + byId[id].nom + ' 🏅'); }
      }, 350);
    }
    else if (act === 'fav') {
      if (isFav(id)) {
        state.favs.splice(state.favs.indexOf(id), 1); save(); toast('Retiré de tes raccourcis');
      } else if (state.favs.length >= MAXFAV) {
        toast('Ta barre est pleine : retire d’abord un raccourci.'); return;
      } else {
        state.favs.push(id); save(); toast('Ajouté à tes raccourcis ⭐');
      }
      render(); showItem(id);
    }
    else if (act === 'hot-empty') { toast('Ouvre un objet de ton sac et touche « Ajouter aux raccourcis ».'); }
    else if (act === 'close') { closeModal(); }
    else if (act === 'settings') { showSettings(); }
    else if (act === 'setclass') {
      var wasNew = !state.classe;
      state.classe = parseInt(t.getAttribute('data-n'), 10); save();
      closeModal();
      if (wasNew) { ui.view = 'map'; render(); toast('C’est parti ! Ton île t’attend sur la carte.'); }
      else { render(); toast('Classe enregistrée : ' + state.classe + 'e'); }
    }
    else if (act === 'toggle') {
      var k = t.getAttribute('data-k');
      state[k] = !state[k]; save();
      t.setAttribute('aria-checked', String(!!state[k]));
      renderHeader();
    }
    else if (act === 'reset') {
      state.seen = {}; state.favs = []; save(); closeModal(); render(); toast('Ton sac est comme neuf');
    }
    else if (act === 'prof') { showProf(); }
    else if (act === 'prof-save') {
      state.urls = readProfInputs(); save(); render(); toast('Liens enregistrés sur cet appareil');
    }
    else if (act === 'prof-json') {
      var urls = readProfInputs();
      var copy = JSON.parse(JSON.stringify(DATA));
      copy.applis.forEach(function (a) { a.url = urls[a.id] || ''; });
      var out = $('jsonOut');
      out.innerHTML = '<p class="note">Copie tout ce texte et colle-le à la place du contenu du bloc <code>&lt;script id="catalogue"&gt;</code>.</p><textarea class="json" readonly></textarea>';
      var ta = out.querySelector('textarea');
      ta.value = JSON.stringify(copy, null, 2);
      ta.focus(); ta.select();
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOpen()) {
      var ov = $('modal').querySelector('.overlay');
      if (ov && ov.getAttribute('data-locked') !== '1') { closeModal(); }
      return;
    }
    if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute && e.target.getAttribute('role') === 'button' && e.target.tagName.toLowerCase() === 'g') {
      e.preventDefault();
      openWorld(parseInt(e.target.getAttribute('data-n'), 10));
    }
  });

  render();
  if (!state.classe) { showWelcome(); }
})();
