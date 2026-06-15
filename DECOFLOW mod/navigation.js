import { afficherPageDashboard }    from './dashboard.js';
import { afficherPageCategories }   from './categories.js';
import { afficherPageProfil }       from './profil.js';
import { afficherPageDevis }        from './devis.js';
import { afficherPageProduits }     from './produits.js';
import { afficherPageCommandes }    from './commandes.js';
import { afficherPageClients }      from './clients.js';
import { afficherPageAdminPanel }   from './admin.js';
import { afficherPageSuperadmin }   from './superadmin.js';
import { lireSession, supprimerSession } from './db.js';

// ─── Fonctions ────────────────────────────────────────────────────────────────

var LIENS_NAVIGATION = {
  'nav-dashboard':        { page: 'dashboard',          label: 'Dashboard',  roles: ['client', 'admin', 'superadmin'] },
  'nav-produits':         { page: 'produits',           label: 'Produits',   roles: ['client', 'admin', 'superadmin'] },
  'nav-categories':       { page: 'categories',         label: 'Catégories', roles: ['client', 'admin', 'superadmin'] },
  'nav-orders':           { page: 'commandes',          label: 'Commandes',  roles: ['client', 'admin', 'superadmin'] },
  'nav-quotes':           { page: 'devis',              label: 'Devis',      roles: ['client', 'admin', 'superadmin'] },
  'nav-customers':        { page: 'clients',            label: 'Clients',    roles: ['admin', 'superadmin'] },
  'nav-admin-panel':      { page: 'admin-panel',        label: 'Admin',      roles: ['admin', 'superadmin'] },
  'nav-superadmin-panel': { page: 'superadmin-panel',   label: 'Superadmin', roles: ['superadmin'] }
};

var ORDRE_NAVIGATION = [
  'nav-dashboard',
  'nav-produits',
  'nav-categories',
  'nav-orders',
  'nav-quotes',
  'nav-customers',
  'nav-admin-panel',
  'nav-superadmin-panel'
];

function prevenir(e) {
  if (e && typeof e.preventDefault === 'function') e.preventDefault();
}

function attacherLien(id, action) {
  var el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('click', function(e) {
    prevenir(e);
    action();
  });
}

function naviguer(page, prenom, fallback) {
  if (window.decoflowRouter && typeof window.decoflowRouter.naviguerVers === 'function') {
    window.decoflowRouter.naviguerVers(page, prenom);
    return;
  }
  fallback();
}

function pageActiveDepuisUrl() {
  return (window.location.hash || '#dashboard').replace('#', '') || 'dashboard';
}

function classesLienNav(estActif, themeSombre) {
  if (themeSombre) {
    return estActif
      ? 'nav-lien px-3 py-1.5 text-sm font-medium text-white border-b-2 border-terracotta'
      : 'nav-lien px-3 py-1.5 text-sm text-white/60 hover:text-white border-b-2 border-transparent hover:border-terra-light transition';
  }
  return estActif
    ? 'nav-lien px-3 py-1.5 text-sm font-medium text-charcoal border-b-2 border-terracotta'
    : 'nav-lien px-3 py-1.5 text-sm text-muted hover:text-charcoal border-b-2 border-transparent hover:border-terra-light transition';
}

function construireLienNav(id, role, pageActive, themeSombre) {
  var config = LIENS_NAVIGATION[id];
  if (!config || !config.roles.includes(role)) return '';
  var actif = config.page === pageActive;
  return '<a id="' + id + '" href="#" class="' + classesLienNav(actif, themeSombre) + '">' + config.label + '</a>';
}

function libelleRole(role) {
  var labels = {
    client: 'Client',
    admin: 'Admin',
    superadmin: 'Superadmin'
  };
  return labels[role] || 'Client';
}

function iconeRole(role) {
  if (role === 'superadmin') return 'fa-solid fa-crown';
  if (role === 'admin') return 'fa-solid fa-shield-halved';
  return 'fa-solid fa-user';
}

function appliquerDesignNavbar(role, prenom) {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;

  navbar.className = 'bg-charcoal px-4 sm:px-6 py-3 sticky top-0 z-50';
  navbar.innerHTML = `
    <div class="w-full max-w-7xl mx-auto flex items-start gap-6">
      <div id="navbar-logo" class="flex items-center gap-2 min-w-max">
        <img src="LOGOD.png" alt="DecoFlow" class="h-8 brightness-0 invert" />
        <span class="font-display text-2xl font-semibold text-white tracking-wide">DecoFlow</span>
        <span id="badge-role-navbar" class="text-[10px] font-semibold uppercase tracking-wider bg-terracotta text-white px-2 py-0.5 rounded-sm ml-1">
          ${libelleRole(role)}
        </span>
      </div>

      <nav id="navbar-nav" class="hidden md:flex items-center gap-1 flex-1 min-w-0 overflow-x-auto whitespace-nowrap"></nav>

      <div id="navbar-droite" class="flex items-center gap-3 min-w-max ml-auto">
        <div id="profil-utilisateur" class="flex items-center gap-2 cursor-pointer">
          <span class="text-sm font-medium text-white hidden sm:block">${(prenom || 'Utilisateur').split(' ')[0]}</span>
          <div class="w-8 h-8 rounded-full bg-terracotta flex items-center justify-center overflow-hidden">
            <i class="${iconeRole(role)} text-white text-sm"></i>
          </div>
        </div>
        <button id="bouton-deconnexion" type="button"
          class="text-xs text-white/60 hover:text-red-300 transition flex items-center gap-1">
          <i class="fa-solid fa-right-from-bracket text-xs"></i>
          <span class="hidden lg:inline">Déconnexion</span>
        </button>
      </div>
    </div>
  `;
}

function appliquerMenuRole(role) {
  var nav = document.getElementById('navbar-nav') || document.querySelector('#navbar nav');
  if (!nav) return;

  var pageActive = pageActiveDepuisUrl();
  var themeSombre = true;

  nav.innerHTML = ORDRE_NAVIGATION
    .map(function (id) { return construireLienNav(id, role, pageActive, themeSombre); })
    .join('');
}

function assurerBoutonDeconnexion(themeSombre) {
  var boutonExistant = document.getElementById('bouton-deconnexion');
  if (boutonExistant) {
    boutonExistant.className = themeSombre
      ? 'text-xs text-white/60 hover:text-red-300 transition flex items-center gap-1'
      : 'text-xs text-muted hover:text-red-500 transition flex items-center gap-1';
    return;
  }

  var zoneDroite = document.getElementById('navbar-droite') || document.querySelector('#navbar > div:last-child');
  if (!zoneDroite) return;

  var bouton = document.createElement('button');
  bouton.id = 'bouton-deconnexion';
  bouton.type = 'button';
  bouton.className = themeSombre
    ? 'text-xs text-white/60 hover:text-red-300 transition flex items-center gap-1'
    : 'text-xs text-muted hover:text-red-500 transition flex items-center gap-1';
  bouton.innerHTML = '<i class="fa-solid fa-right-from-bracket text-xs"></i><span class="hidden sm:inline">Déconnexion</span>';
  zoneDroite.appendChild(bouton);
}

function masquerElement(id) {
  var element = document.getElementById(id);
  if (element) element.classList.add('hidden');
}

function appliquerPermissionsInterface(role) {
  if (role === 'client') {
    masquerElement('bouton-ajouter-produit');
    masquerElement('bouton-ajouter-categorie');
    return;
  }

  var boutonAjouterProduit = document.getElementById('bouton-ajouter-produit');
  if (boutonAjouterProduit) boutonAjouterProduit.classList.remove('hidden');

  var boutonAjouterCategorie = document.getElementById('bouton-ajouter-categorie');
  if (boutonAjouterCategorie) boutonAjouterCategorie.classList.remove('hidden');
}

export function attacherNavigationNavbar(prenomUtilisateur) {
  var prenom  = prenomUtilisateur || 'Utilisateur';
  var session = lireSession();
  var role    = session && session.role ? session.role : 'client';

  var themeSombre = true;

  appliquerDesignNavbar(role, prenom);
  appliquerMenuRole(role);
  assurerBoutonDeconnexion(themeSombre);
  appliquerPermissionsInterface(role);

  // Liens communs à tous les rôles connectés
  attacherLien('nav-dashboard',  function() { naviguer('dashboard', prenom, function() { afficherPageDashboard(prenom); }); });
  attacherLien('nav-produits',   function() { naviguer('produits', prenom, function() { afficherPageProduits(prenom); }); });
  attacherLien('nav-categories', function() { naviguer('categories', prenom, function() { afficherPageCategories(prenom); }); });
  attacherLien('nav-orders',     function() { naviguer('commandes', prenom, function() { afficherPageCommandes(prenom); }); });
  attacherLien('nav-quotes',     function() { naviguer('devis', prenom, function() { afficherPageDevis(prenom); }); });
  attacherLien('nav-customers',  function() { naviguer('clients', prenom, function() { afficherPageClients(prenom); }); });

  // Liens admin/superadmin uniquement
  if (role === 'admin' || role === 'superadmin') {
    attacherLien('nav-admin-panel', function() { naviguer('admin-panel', prenom, function() { afficherPageAdminPanel(prenom); }); });
  }

  // Lien superadmin uniquement
  if (role === 'superadmin') {
    attacherLien('nav-superadmin-panel', function() { naviguer('superadmin-panel', prenom, function() { afficherPageSuperadmin(prenom); }); });
  }

  // Profil
  attacherLien('profil-utilisateur',   function() { naviguer('profil', prenom, function() { afficherPageProfil(prenom); }); });
  attacherLien('bouton-profil-navbar', function() { naviguer('profil', prenom, function() { afficherPageProfil(prenom); }); });

  // Déconnexion
  var boutonDeconnexion = document.getElementById('bouton-deconnexion');
  if (boutonDeconnexion) {
    boutonDeconnexion.addEventListener('click', function() {
      if (window.decoflowRouter && typeof window.decoflowRouter.deconnecter === 'function') {
        window.decoflowRouter.deconnecter();
        return;
      }
      supprimerSession();
      window.location.hash = '#accueuil';
    });
  }
}