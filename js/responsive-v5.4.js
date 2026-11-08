/* SAC’ADOS V5.4 — carte panoramique : centrage sur l’île de l’élève + boutons ◀ ▶.
   Ne s’active que si la carte dépasse la largeur de l’écran (portrait). ES5. */
(function () {
  'use strict';
  var KEY = 'sacados_v1';
  var timer = null;

  function maClasse() {
    try { return (JSON.parse(localStorage.getItem(KEY) || '{}') || {}).classe; } catch (e) { return null; }
  }
  function calme() {
    if (document.documentElement.className.indexOf('calme') > -1) { return true; }
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  function retirerBarre() {
    var old = document.querySelector('.sa-pan');
    if (old && old.parentNode) { old.parentNode.removeChild(old); }
  }

  function installer() {
    var home = document.querySelector('.v44-home');
    if (!home) { retirerBarre(); return; }
    if (home.getAttribute('data-sa-pan') === '1') { return; }
    home.setAttribute('data-sa-pan', '1');
    retirerBarre();
    if (home.scrollWidth <= home.clientWidth + 8) { return; }

    var c = maClasse();
    var hit = c ? home.querySelector('.map-hit.hit-' + c) : null;
    if (hit) {
      var hr = hit.getBoundingClientRect(), r = home.getBoundingClientRect();
      home.scrollLeft = home.scrollLeft + (hr.left + hr.width / 2) - (r.left + r.width / 2);
    }

    var bar = document.createElement('div');
    bar.className = 'sa-pan';
    bar.innerHTML = '<button type="button" class="sa-pan-btn" data-dir="-1" aria-label="Voir la partie gauche de la carte">◀</button>' +
      '<span class="sa-pan-txt">Fais glisser la carte pour voir les 4 mondes</span>' +
      '<button type="button" class="sa-pan-btn" data-dir="1" aria-label="Voir la partie droite de la carte">▶</button>';
    home.parentNode.insertBefore(bar, home.nextSibling);
    var btns = bar.querySelectorAll('.sa-pan-btn');

    function maj() {
      var max = home.scrollWidth - home.clientWidth;
      btns[0].disabled = home.scrollLeft <= 2;
      btns[1].disabled = home.scrollLeft >= max - 2;
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.sa-pan-btn') : null;
      if (!b) { return; }
      var d = parseInt(b.getAttribute('data-dir'), 10) * home.clientWidth * 0.7;
      if (home.scrollBy) { home.scrollBy({ left: d, behavior: calme() ? 'auto' : 'smooth' }); }
      else { home.scrollLeft += d; }
    });
    home.addEventListener('scroll', maj);
    maj();
  }

  function planifier() { clearTimeout(timer); timer = setTimeout(installer, 60); }

  function demarrer() {
    var view = document.getElementById('view');
    if (!view) { return; }
    if (window.MutationObserver) { new MutationObserver(planifier).observe(view, { childList: true }); }
    window.addEventListener('resize', function () {
      var home = document.querySelector('.v44-home');
      if (home) { home.removeAttribute('data-sa-pan'); }
      planifier();
    });
    window.addEventListener('load', planifier);
    planifier();
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', demarrer); }
  else { demarrer(); }
})();
