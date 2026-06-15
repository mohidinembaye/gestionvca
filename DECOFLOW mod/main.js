import { afficherPageAccueil } from "./accueil.js";
import { afficherPageConnexion } from "./connexion.js";
import { afficherPageInscription } from "./inscription.js";
import { afficherPageDashboard } from "./dashboard.js";
import { afficherPageCategories } from "./categories.js";
import { afficherPageProfil } from "./profil.js";
import { afficherPageDevis } from "./devis.js";
import { afficherPageProduits } from "./produits.js";
import { afficherPageCommandes } from "./commandes.js";
import { afficherPageClients } from "./clients.js";
import { afficherPageAdminPanel } from "./admin.js";
import { afficherPageSuperadmin } from "./superadmin.js";
import { lireSession, supprimerSession } from "./db.js";

// ─── Déclarations ─────────────────────────────────────────────────────────────

var session = lireSession();
var ROLES_VALIDES = ["client", "admin", "superadmin"];
var PAGES_CONNECTEES = [
  "dashboard",
  "categories",
  "profil",
  "produits",
  "devis",
  "commandes",
];

// ─── Fonctions — Gardes de navigation ────────────────────────────────────────

function sessionValide(sessionActive) {
  return Boolean(
    sessionActive &&
    sessionActive.email &&
    sessionActive.nom &&
    ROLES_VALIDES.includes(sessionActive.role),
  );
}

function estConnecte() {
  return sessionValide(session);
}

function lireRole() {
  return session ? session.role : null;
}

function rafraichirSession() {
  session = lireSession();
  if (session && !sessionValide(session)) {
    supprimerSession();
    session = null;
  }
}

function gardePublique() {
  if (estConnecte()) {
    rendrePage("dashboard", session.nom);
    return false;
  }
  return true;
}

function gardeConnecte() {
  if (!estConnecte()) {
    rendrePage("connexion");
    return false;
  }
  return true;
}

function gardeAdmin() {
  if (!estConnecte()) {
    rendrePage("connexion");
    return false;
  }
  var role = lireRole();
  if (role !== "admin" && role !== "superadmin") {
    alert("Accès refusé. Cette section est réservée aux administrateurs.");
    rendrePage("dashboard", session.nom);
    return false;
  }
  return true;
}

function gardeSuperadmin() {
  if (!estConnecte()) {
    rendrePage("connexion");
    return false;
  }
  if (lireRole() !== "superadmin") {
    rendrePage("dashboard", session.nom);
    return false;
  }
  return true;
}

// ─── Fonctions — Routeur ──────────────────────────────────────────────────────

function normaliserPage(page) {
  return (page || "").replace("#", "").trim() || null;
}

function nomSessionOuFallback(nom) {
  return nom || (session && session.nom) || undefined;
}

function rendrePage(page, nom) {
  var routes = {
    accueil: function () {
      afficherPageAccueil();
    },
    connexion: function () {
      afficherPageConnexion();
    },
    inscription: function () {
      afficherPageInscription();
    },
    dashboard: function () {
      afficherPageDashboard(nomSessionOuFallback(nom));
    },
    categories: function () {
      afficherPageCategories(nomSessionOuFallback(nom));
    },
    profil: function () {
      afficherPageProfil(nomSessionOuFallback(nom));
    },
    produits: function () {
      afficherPageProduits(nomSessionOuFallback(nom));
    },
    devis: function () {
      afficherPageDevis(nomSessionOuFallback(nom));
    },
    commandes: function () {
      afficherPageCommandes(nomSessionOuFallback(nom));
    },
    clients: function () {
      afficherPageClients(nomSessionOuFallback(nom));
    },
    "admin-panel": function () {
      afficherPageAdminPanel(nomSessionOuFallback(nom));
    },
    "superadmin-panel": function () {
      afficherPageSuperadmin(nomSessionOuFallback(nom));
    },
  };

  var action = routes[page] || routes.accueil;
  action();
}

export function naviguerVers(page, nom) {
  rafraichirSession();

  var pageDemandee = normaliserPage(page);
  if (!pageDemandee) {
    pageDemandee = estConnecte() ? "dashboard" : "accueil";
  }

  if (pageDemandee === "connexion" || pageDemandee === "inscription") {
    if (gardePublique()) rendrePage(pageDemandee, nom);
    return;
  }

  if (PAGES_CONNECTEES.includes(pageDemandee)) {
    if (gardeConnecte()) rendrePage(pageDemandee, nom);
    return;
  }

  if (pageDemandee === "admin-panel") {
    if (gardeAdmin()) rendrePage(pageDemandee, nom);
    return;
  }

  if (pageDemandee === "clients") {
    if (gardeAdmin()) rendrePage(pageDemandee, nom);
    return;
  }

  if (pageDemandee === "superadmin-panel") {
    if (gardeSuperadmin()) rendrePage(pageDemandee, nom);
    return;
  }

  if (pageDemandee === "accueil") {
    rendrePage("accueil");
    return;
  }

  var pageFallback = estConnecte() ? "dashboard" : "accueil";
  rendrePage(pageFallback, nomSessionOuFallback(nom));
}

function naviguerDepuisHistorique(page, nom) {
  var pushStateOriginal = history.pushState;
  history.pushState = function (etat, titre, url) {
    history.replaceState(etat, titre, url);
  };
  try {
    naviguerVers(page, nom);
  } finally {
    history.pushState = pushStateOriginal;
  }
}

function naviguerDepuisHashInitial() {
  var pageInitiale = normaliserPage(window.location.hash);
  if (!pageInitiale) {
    pageInitiale = estConnecte() ? "dashboard" : "accueil";
  }

  naviguerVers(pageInitiale, session && session.nom);
}

// ─── Fonction — Déconnexion et sécurité de session ───────────────────────────

export function verifierSessionSecurisee() {
  rafraichirSession();
  return estConnecte();
}

export function deconnecter() {
  supprimerSession();
  session = null;
  rendrePage("connexion");
}

// ─── API globale légère pour les modules de rendu ────────────────────────────

window.decoflowRouter = {
  naviguerVers: naviguerVers,
  deconnecter: deconnecter,
  verifierSessionSecurisee: verifierSessionSecurisee,
  lireSessionActive: function () {
    rafraichirSession();
    return session;
  },
};

// ─── Initialisation ───────────────────────────────────────────────────────────

rafraichirSession();
if (!window.location.hash) window.location.hash = '#accueil';
naviguerDepuisHashInitial();

// ─── Écouteurs ────────────────────────────────────────────────────────────────

window.addEventListener("popstate", function (evenement) {
  rafraichirSession();

  if (!evenement.state || !evenement.state.page) {
    naviguerDepuisHistorique(window.location.hash, session && session.nom);
    return;
  }

  naviguerDepuisHistorique(evenement.state.page, evenement.state.nom);
});