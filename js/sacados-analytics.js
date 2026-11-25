/* Sac’Ados — Statistiques respectueuses de la vie privée.
   La collecte reste INACTIVE tant que WEBSITE_ID est vide.
   Activation : copier le Website ID Umami dans la variable ci-dessous.
   Aucune donnée nominative, aucun identifiant d’élève, aucune saisie utilisateur.
*/
(function () {
  'use strict';

  var WEBSITE_ID = 'd77ddf12-31e2-43ad-b953-7a5203c03b76'; // À renseigner après création du site Sac’Ados dans Umami.
  var ID_FORMAT = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  var enabled = ID_FORMAT.test(WEBSITE_ID);
  var pending = [];

  function emit(eventName, data) {
    if (!enabled) return;
    if (window.umami && typeof window.umami.track === 'function') {
      try { window.umami.track(eventName, data); } catch (e) { /* jamais bloquer Sac’Ados */ }
    } else if (pending.length < 30) {
      pending.push([eventName, data]);
    }
  }

  // Ne transmet que des slugs de catalogue, jamais de texte ni d'identité.
  function cleanId(id) {
    return typeof id === 'string' && /^[a-z0-9-]{1,60}$/.test(id) ? id : null;
  }

  window.SacAdosStats = {
    enabled: enabled,
    appViewed: function(id) {
      var key = cleanId(id);
      if (key) emit('fiche_application', { application: key });
    },
    appLaunched: function(id) {
      var key = cleanId(id);
      if (key) emit('lancement_application', { application: key });
    },
    sectionViewed: function(section) {
      var key = cleanId(section);
      if (key) emit('section_visitee', { section: key });
    }
  };

  if (!enabled) return;

  // Chargement du traceur uniquement quand un identifiant réel est configuré.
  var script = document.createElement('script');
  script.defer = true;
  script.src = 'https://cloud.umami.is/script.js';
  script.setAttribute('data-website-id', WEBSITE_ID);
  script.setAttribute('data-domains', 'brot2you.github.io');
  script.setAttribute('data-do-not-track', 'true');
  script.setAttribute('data-exclude-search', 'true');
  script.onload = function () {
    if (window.umami && typeof window.umami.track === 'function') {
      pending.splice(0).forEach(function (e) {
        try { window.umami.track(e[0], e[1]); } catch (error) {}
      });
    }
  };
  script.onerror = function() { pending.length = 0; };
  document.head.appendChild(script);
})();
