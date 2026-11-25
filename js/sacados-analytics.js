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
    favoriteChanged: function(id, added) {
      var key = cleanId(id);
      if (key) emit(added ? 'favori_ajoute' : 'favori_retire', { application: key });
    },
    sectionViewed: function(section) {
      var key = cleanId(section);
      if (key) emit('section_visitee', { section: key });
    }
  };

  if (!enabled) return;

  // Le traceur Umami est chargé de manière officielle via une balise statique
  // dans index.html ; ce module ne fait qu'envoyer les événements personnalisés.
  // Le garde-fou conserve au maximum 30 événements tant que le traceur charge.
  function flushPending() {
    if (!window.umami || typeof window.umami.track !== 'function') return;
    pending.splice(0).forEach(function(e) {
      try { window.umami.track(e[0], e[1]); } catch (error) {}
    });
  }
  if (document.readyState === 'complete') flushPending();
  else window.addEventListener('load', flushPending);
})();
