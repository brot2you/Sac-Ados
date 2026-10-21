
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

  var ui = { view: 'map', world: null, pocket: 'tout', disc: 'tout', query: '', preview: 'arena' };
  var state = load();

  function load() {
    var d = { classe: null, favs: [], seen: {}, lexend: false, calme: false, sound: true, urls: {} };
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
  function appArt(a, cls) { return pixelImg('assets/illustrations/applications/' + a.id + '.webp?v=' + (a.id === 'boost' ? '47' : '46'), cls || 'pixel-app-image'); }
  function discIcon(id) { return pixelImg('assets/illustrations/disciplines/' + id + '.webp?v=47', 'pixel-small-icon'); }
  function typeIcon(id) { return pixelImg('assets/premium/categories/' + id + '-v51.webp', 'pixel-small-icon sac-category-icon'); }
  function uiIcon(id, cls) { return pixelImg(id === 'quest' ? 'assets/premium/icons/quest-gold-v49.png' : 'assets/premium/icons/' + id + '.webp', cls || 'pixel-small-icon'); }
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
  /* V4: illustrated dashboard, with independently clickable real HTML controls. */
  function featuredCard(id) {
    var a = byId[id] || byId.arena, d = discById[a.disc], url = urlOf(a);
    var poster = appArt(a,'v4-feature-art');
    return '<div class="v4-feature">' +
      '<div class="v4-feature-image">' + poster + '</div>' +
      '<div class="v4-feature-copy"><div class="v4-feature-top"><span class="v4-medal" aria-hidden="true">✦</span><div>' +
      '<h3>' + esc(a.nom) + '</h3><span class="v4-feature-meta">' + esc(d.nom) + ' · '+a.niveaux.map(function(n){return n+'e';}).join(' · ') + '</span></div></div>' +
      '<p class="v4-feature-text">' + esc(a.desc) + '</p>' +
      (url ? '<a class="v4-launch" href="' + esc(url) + '" target="_blank" rel="noopener" data-act="launch" data-id="'+a.id+'">▶ &nbsp; LANCER L’APPLICATION</a>' :
      '<button class="v4-launch" disabled>LIEN À VENIR</button>') +
      '<div class="v4-feature-actions"><button type="button" data-act="quickfav" data-id="'+a.id+'">' + (isFav(a.id)?'★ Dans mes favoris':'☆ Mettre en favori') + '</button>' +
      '<button type="button" data-act="item" data-id="'+a.id+'">ⓘ &nbsp; Voir les détails</button></div></div></div>';
  }
  function v4Card(a) {
    return '<button type="button" class="v4-game-card'+(ui.preview===a.id?' selected':'')+'" data-act="preview" data-id="'+a.id+'" aria-label="Prévisualiser '+esc(a.nom)+'" aria-pressed="'+(ui.preview===a.id)+'">'+
      '<span class="v4-game-picture">'+appArt(a,'v4-game-art')+'<span class="v4-card-star" aria-hidden="true">★</span></span>'+
      '<strong>'+esc(a.nom)+'</strong><span class="v4-game-pill">'+esc(discById[a.disc].nom)+'</span></button>';
  }
  function v4InventoryPreview() {
    var sample=['arena','books','geopins','mochi','survival','mtm','dinobuddy','cogni'];
    var html='<aside class="v4-inventory" aria-label="Mon sac d’aventurier"><div class="v4-inventory-banner">'+
      '<h2>MON SAC D’AVENTURIER</h2></div><div class="v4-inventory-body">'+
      '<div class="v4-filter-preview" aria-label="Accéder aux matières">';
    [['Tout','tout'],['Anglais','anglais'],['Français','francais'],['Maths','maths'],['Histoire','histoire'],['Géographie','geo']].forEach(function(x,i){
      html+='<button type="button" class="v4-filter-short'+(i===0?' active':'')+'" data-act="preview-disc" data-d="'+x[1]+'">'+x[0]+'</button>';
    });
    html+='</div><button type="button" data-act="bag" class="v4-search-preview" aria-label="Ouvrir le sac et rechercher une application">⌕ &nbsp; Rechercher une application…</button>';
    html+='<div class="v4-preview-grid">'+sample.filter(function(id){return !!byId[id];}).map(function(id){return v4Card(byId[id]);}).join('')+'</div>'+
      '<div id="v4Feature">'+featuredCard(ui.preview)+'</div></div></aside>';
    return html;
  }
  function v4Subjects() {
    var cls=state.classe || 6;
    var html='<section class="v4-subjects" aria-label="Choisis ta discipline"><div class="v4-scroll-title">Choisis ta discipline !</div><div class="v4-subject-grid">';
    DISCS.forEach(function(d){
      html+='<button type="button" class="v4-subject" data-act="go-disc" data-d="'+d.id+'" style="--disc-color:'+d.c+'">'+
        discIcon(d.id)+'<span>'+esc(d.nom)+'</span></button>';
    });
    return html+'</div></section>';
  }
  function v4Extras() {
    var n=state.classe||6,q=questFor(n), all=progress(APPS);
    var qtxt=q ? esc(q.nom) : 'Explore une application de ton sac';
    return '<div class="v4-extra-row">'+v4Subjects()+
      '<section class="v4-sidequest"><div class="v4-scroll-title">Quête du jour</div><div class="v4-parchment"><p>'+qtxt+'</p>'+
      '<div class="v4-progress"><span style="width:'+(q&&state.seen[q.id]?'100':'0')+'%"></span></div>'+
      '<button type="button" data-act="quests">★ &nbsp; Voir ma quête →</button></div></section>'+
      '<section class="v4-tracker"><div class="v4-scroll-title">Mes découvertes</div><div class="v4-parchment"><p><strong>'+all.seen+' / '+all.total+'</strong> applications ouvertes</p>'+
      '<div class="v4-progress"><span style="width:'+pct(all)+'%"></span></div>'+
      '<button type="button" data-act="discoveries">Découvrir mon album →</button></div></section></div>';
  }
  /* V4.4 : accueil épuré. La carte reste l’unique contenu principal.
     Le sac et tous les outils sont accessibles uniquement par la navigation RPG.
     Les zones d’îles restent interactives pour un accès direct à chaque niveau. */
  function renderMap() {
    var html = '<div class="v4-worldside v44-home">' +
      '<section class="v4-map-panel v44-world-map" aria-label="Carte interactive des quatre mondes de Sac’Ados">' +
      '<img src="assets/worlds/kingdom-map.webp" alt="Carte illustrée de Sac’Ados avec les mondes de 6e, 5e, 4e et 3e" width="1536" height="875" fetchpriority="high" draggable="false">';
    WORLDS.forEach(function (w) {
      var pr = progress(worldApps(w.n));
      html += '<button type="button" class="map-hit hit-' + w.n + '" data-act="world" data-n="' + w.n + '" aria-label="Entrer dans le monde de ' + w.n + 'e : ' + esc(w.nom) + ' ; ' + pr.seen + ' applications découvertes sur ' + pr.total + '">' +
        '<span class="v44-zone-label" aria-hidden="true">' + w.n + 'e</span></button>';
    });
    html += '</section><p class="sr" id="mapHelp">Choisis une île sur la carte pour explorer ses applications, ou touche Mon sac dans le menu inférieur.</p></div>';
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
    var d=discById[a.disc], tag='';
    if(a.bientot) tag='<span class="tag soon">Bientôt</span>';
    else if(state.seen[a.id]) tag='<span class="tag seen">✓ Ouverte</span>';
    else if(a.nouveau) tag='<span class="tag new">Nouveau</span>';
    var fav=isFav(a.id)?'<span class="tag fav" aria-label="Dans tes favoris">★</span>':'';
    return '<button type="button" class="slot" data-act="item" data-id="'+a.id+'" style="'+discStyle(a)+'" aria-label="Voir '+esc(a.nom)+', '+esc(d.nom)+'">'+
      '<span class="slot-art">'+appArt(a,'pixel-poster')+'<span class="v4-slot-star">★</span></span>'+
      fav+tag+'<span class="slot-card-info"><span class="slot-name">'+esc(a.nom)+'</span>'+
      '<span class="slot-sub">'+esc(d.nom)+' · '+esc(a.duree)+'</span></span></button>';
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
    var n=ui.world,w=worldByN[n],all=worldApps(n),p=progress(all);
    var html='<div class="v4-world-intro"><button class="v4-return" data-act="map">← CARTE DES MONDES</button>'+
      '<div><span class="v4-world-kicker">MONDE '+(7-n)+' · CLASSE DE '+n+'e</span>'+
      '<h1>'+esc(w.nom)+'</h1><p>'+p.seen+' application(s) ouverte(s) sur '+p.total+' ayant un lien disponible dans ce monde</p></div></div>'+
      '<div class="v4-world-banner"><img src="assets/worlds/'+worldArtwork(n)+'.webp" alt="Décor de '+esc(w.nom)+'"></div>'+
      '<section class="pack" aria-label="Ton inventaire"><div class="v4-inventory-banner"><h2>MON SAC D’AVENTURIER</h2><span>CLASSE DE '+n+'e · '+all.length+' APPLICATIONS</span></div>'+
      '<div class="pack-body">';
    var q=questFor(n);
    if(q) html+='<div class="v4-quest-inline"><span>★ &nbsp; QUÊTE DU JOUR : '+esc(q.nom)+'</span><button type="button" data-act="item" data-id="'+q.id+'">DÉCOUVRIR →</button></div>';
    html+='<div class="pockets" role="tablist" aria-label="Types d’applications">'+
      '<button class="pocket" role="tab" data-act="pocket" data-p="tout" aria-selected="'+(ui.pocket==='tout')+'">Toutes <span class="n">'+all.length+'</span></button>';
    TYPES.forEach(function(t){var count=all.filter(function(a){return a.type===t.id;}).length;
      if(count)html+='<button class="pocket" role="tab" data-act="pocket" data-p="'+t.id+'" aria-selected="'+(ui.pocket===t.id)+'">'+typeIcon(t.id)+'<span>'+esc(t.nom)+'</span><span class="n">'+count+'</span></button>';
    });
    html+='</div><div class="v4-inventory-controls"><label class="search"><span aria-hidden="true">⌕</span><span class="sr">Rechercher une application</span>'+
      '<input id="q" type="search" placeholder="Rechercher une application..." value="'+esc(ui.query)+'" autocomplete="off"></label>'+
      '<div class="chips" role="group" aria-label="Matières">'+
      '<button class="chip" data-act="disc" data-d="tout" aria-pressed="'+(ui.disc==='tout')+'">Toutes</button>';
    DISCS.forEach(function(d){if(!all.some(function(a){return a.disc===d.id;}))return;
      html+='<button class="chip" data-act="disc" data-d="'+d.id+'" aria-pressed="'+(ui.disc===d.id)+'">'+discIcon(d.id)+esc(d.nom)+'</button>';
    });
    html+='</div></div><div id="grid"></div></div></section>';
    $('view').innerHTML=html;renderGrid();
    var inp=$('q');inp.addEventListener('input',function(){ui.query=inp.value;renderGrid();});
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
    $('loot').innerHTML = '★ ' + p.seen + ' / ' + p.total;
    $('loot').setAttribute('aria-label', p.seen + ' objets découverts sur ' + p.total);
    var soundButton = $('soundToggle');
    if (soundButton) { soundButton.textContent = state.sound ? '♫' : '♩'; soundButton.setAttribute('aria-pressed', String(!!state.sound)); soundButton.setAttribute('aria-label', state.sound ? 'Désactiver les sons rétro' : 'Activer les sons rétro'); }
    document.documentElement.className = (state.lexend ? 'lexend ' : '') + (state.calme ? 'calme' : '');
  }

  function render() {
    // Preserve the real RPG navigation between HTML rerenders, including when it
    // lives inside the overworld panel on desktop.
    var nav = document.querySelector('.rpg-bottom-nav');
    if (nav && nav.parentElement !== document.body) document.body.appendChild(nav);
    renderHeader();
    if ($('hotbar')) $('hotbar').setAttribute('data-open','false');
    if ($('shortcutToggle')) $('shortcutToggle').setAttribute('aria-expanded','false');
    if (ui.view === 'world' && ui.world) { renderWorld(); }
    else if (ui.view === 'quests') { renderQuests(); }
    else if (ui.view === 'discoveries') { renderDiscoveries(); }
    else { renderMap(); }
    renderHotbar();
    if (ui.view === 'map' && nav && document.querySelector('.v4-worldside')) {
      document.querySelector('.v4-worldside').appendChild(nav);
    }
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
    html+='<section class="quest-category-section" aria-labelledby="quest-category-heading">'+
      '<div class="section-line"><div><span class="eyebrow">CHOISIS TON AVENTURE</span><h2 id="quest-category-heading">Les cinq catégories</h2></div></div>'+
      '<div class="quest-category-grid">';
    TYPES.forEach(function(t){
      html+='<button class="quest-category-button" type="button" data-act="quest-category" data-p="'+t.id+'" aria-label="Explorer : '+esc(t.nom)+'">'+
        typeIcon(t.id)+'<span>'+esc(t.nom)+'</span></button>';
    });
    html+='</div></section>';
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
    var grades=a.niveaux.map(function(n){return '<span class="v42-grade">'+n+'e</span>';}).join('');
    var html = '<button type="button" class="close-x v42-close" data-act="close" aria-label="Fermer cette fenêtre">✕</button>';
    html += '<div class="v42-detail">'+
      '<div class="v42-detail-cover" role="img" aria-label="Illustration de '+esc(a.nom)+'">'+appArt(a, 'pixel-modal-poster')+'</div>'+
      '<div class="v42-detail-info"><span class="v42-overline">✦ FICHE DE L’AVENTURIER</span>'+
      '<h3 id="v42-modal-heading">'+esc(a.nom)+'</h3>'+
      '<div class="v42-badges"><span class="v42-tag">'+discIcon(d.id)+esc(d.nom)+'</span><span class="v42-tag">'+typeIcon(t.id)+esc(t.nom)+'</span></div>'+
      '<p class="v42-detail-desc">'+esc(a.desc)+'</p>'+
      '<div class="v42-grades"><strong>Pour les classes :</strong> '+grades+'</div>'+
      '<p class="v42-duration">◷ Durée indicative : '+esc(a.duree)+'</p>';
    if (url) {
      html += '<a class="v42-play" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer" data-act="launch" data-id="'+a.id+'">▶ &nbsp; LANCER L’APPLICATION</a>';
    } else {
      html += '<button type="button" class="v42-play" disabled>'+(a.bientot?'Bientôt disponible':'Lien à venir')+'</button>';
    }
    html += '<button type="button" class="v42-favorite" data-act="fav" data-id="'+a.id+'">'+(isFav(a.id)?'★ Retirer des raccourcis':'☆ Ajouter à mes raccourcis')+'</button>';
    if (state.seen[a.id]) html += '<p class="v42-opened">✓ Application déjà ouverte</p>';
    html += '</div></div>';
    openModal(html);
    var box=$('modal').querySelector('.sheet');
    if(box) box.setAttribute('aria-labelledby','v42-modal-heading');
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
    html += '<div class="row"><span><b>Sons de jeux vidéo</b><small>Petites notes rétro au clic</small></span>' +
      '<button class="switch" role="switch" data-act="toggle" data-k="sound" aria-checked="' + !!state.sound + '" aria-label="Sons de jeux vidéo"></button></div>';
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

  /* Original 8-bit menu effects synthesized locally: no download, no external library.
     Audio starts only after a user interaction; the persistent mute switch is respected. */
  var sfxCtx = null;
  function playSfx(mode) {
    if (!state.sound) return;
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!sfxCtx) sfxCtx = new Ctx();
      if (sfxCtx.state === 'suspended') sfxCtx.resume().catch(function(){});
      var notes = mode === 'open' ? [[523,.0,.045],[659,.06,.045],[784,.12,.10]] :
                  mode === 'star' ? [[659,0,.05],[880,.055,.095]] :
                  mode === 'back' ? [[520,0,.045],[390,.06,.06]] :
                  [[520,0,.055],[680,.055,.045]];
      notes.forEach(function(note){
        var osc=sfxCtx.createOscillator(),gain=sfxCtx.createGain(),t=sfxCtx.currentTime+note[1];
        osc.type='square';osc.frequency.setValueAtTime(note[0],t);
        gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.035,t+.007);
        gain.gain.exponentialRampToValueAtTime(.0001,t+note[2]);
        osc.connect(gain);gain.connect(sfxCtx.destination);osc.start(t);osc.stop(t+note[2]+.007);
      });
    } catch(err) { /* no sound device / blocked by browser -> silently continue */ }
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
    if (act === 'sound-toggle') {
      state.sound = !state.sound; save(); renderHeader();
      if (state.sound) playSfx('star');
      toast(state.sound ? 'Sons rétro activés' : 'Sons coupés');
      return;
    }
    playSfx(act === 'launch' ? 'open' : (act === 'fav' || act === 'quickfav' ? 'star' : (act === 'map' || act === 'close' ? 'back' : 'tap')));

    if (act === 'hot-toggle') {
      var panel=$('hotbar'), trigger=$('shortcutToggle');
      var open=panel.getAttribute('data-open') !== 'true';
      panel.setAttribute('data-open', String(open));
      trigger.setAttribute('aria-expanded', String(open));
      return;
    }
    if (act === 'preview') {
      ui.preview = id;
      var pane=$('v4Feature'); if(pane)pane.innerHTML=featuredCard(id);
      document.querySelectorAll('.v4-game-card').forEach(function(b){
        var on=b.getAttribute('data-id')===id;
        b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));
      });return;
    }
    if (act === 'preview-disc') {
      ui.view='world';ui.world=state.classe||6;ui.disc=t.getAttribute('data-d');ui.pocket='tout';ui.query='';render();window.scrollTo(0,0);return;
    }
    if (act === 'go-disc') {
      ui.view='world';ui.world=state.classe||6;ui.disc=t.getAttribute('data-d');ui.pocket='tout';ui.query='';render();window.scrollTo(0,0);return;
    }
    if (act === 'quickfav') {
      if(isFav(id))state.favs.splice(state.favs.indexOf(id),1);
      else if(state.favs.length>=MAXFAV){toast('Six favoris maximum : libère d’abord une place.');return;}
      else state.favs.push(id);
      save();renderHotbar();
      var pane=$('v4Feature');if(pane)pane.innerHTML=featuredCard(id);
      toast(isFav(id)?'Ajouté aux raccourcis ⭐':'Favori retiré');return;
    }
    if (act === 'world') { openWorld(parseInt(t.getAttribute('data-n'), 10)); }
    else if (act === 'map') { ui.view = 'map'; render(); window.scrollTo(0, 0); }
    else if (act === 'bag') { openWorld(state.classe || ui.world || 6); }
    else if (act === 'quests') { ui.view = 'quests'; render(); window.scrollTo(0, 0); }
    else if (act === 'discoveries') { ui.view = 'discoveries'; render(); window.scrollTo(0, 0); }
    else if (act === 'quest-category') {
      var category=t.getAttribute('data-p');
      if(!typeById[category])return;
      ui.view='world'; ui.world=state.classe||6; ui.pocket=category;ui.disc='tout';ui.query='';
      render();window.scrollTo(0,0);
    }
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
