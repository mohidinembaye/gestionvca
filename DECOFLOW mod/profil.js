import { lireSession, sauvegarderSession, modifierUtilisateur } from './db.js';
import { afficherErreurChamp, afficherAlerte, animerTremblement } from './utils.js';
import { attacherNavigationNavbar } from './navigation.js';

// ─── Déclarations ─────────────────────────────────────────────────────────────

var TRADUCTIONS = {
  fr: {
    titrePage:        'Mon Profil',
    sousTitrePage:    'Gérez votre compte et vos préférences DecoFlow.',
    ongletProfil:     'Profil',
    ongletSecurite:   'Sécurité',
    ongletNotif:      'Notifications',
    ongletAffichage:  'Affichage',
    ongletEquipe:     'Équipe & Accès',
    nomComplet:       'Nom complet',
    email:            'Adresse email',
    entreprise:       'Entreprise',
    telephone:        'Téléphone',
    biographie:       'Biographie & rôle dans l\'équipe',
    biographieClient: 'À propos de vous',
    enregistrer:      'Enregistrer les modifications',
    enregistrement:   'Enregistrement…',
    succesProfil:     'Modifications enregistrées avec succès.',
    erreurProfil:     'Impossible d\'enregistrer. Vérifiez votre connexion.',
    erreurNom:        'Le nom ne peut pas être vide.',
    erreurEmail:      'Veuillez entrer un email valide.',
  },
  en: {
    titrePage:        'My Profile',
    sousTitrePage:    'Manage your account and DecoFlow preferences.',
    ongletProfil:     'Profile',
    ongletSecurite:   'Security',
    ongletNotif:      'Notifications',
    ongletAffichage:  'Display',
    ongletEquipe:     'Team & Access',
    nomComplet:       'Full name',
    email:            'Email address',
    entreprise:       'Company',
    telephone:        'Phone',
    biographie:       'Biography & role in team',
    biographieClient: 'About you',
    enregistrer:      'Save changes',
    enregistrement:   'Saving…',
    succesProfil:     'Changes saved successfully.',
    erreurProfil:     'Unable to save. Check your connection.',
    erreurNom:        'Name cannot be empty.',
    erreurEmail:      'Please enter a valid email.',
  }
};

var langueActive = 'fr';

function t(cle) {
  return (TRADUCTIONS[langueActive] || TRADUCTIONS['fr'])[cle] || cle;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function libelleRole(role) {
  var labels = { client: 'Client', admin: 'Administrateur', superadmin: 'Super Administrateur' };
  return labels[role] || 'Client';
}

function iconeRole(role) {
  if (role === 'superadmin') return 'fa-solid fa-crown';
  if (role === 'admin')      return 'fa-solid fa-shield-halved';
  return 'fa-solid fa-user';
}

function lirePreferences(session) {
  return session.preferences || {
    langue:        'fr',
    densite:       'normal',
    notifications: {
      commandes: true,
      devis:     true,
      stock:     false,
      users:     false,
      hebdo:     false
    }
  };
}

function construireEnteteOnglets(role) {
  var liste = [
    { id: 'onglet-profil',        label: t('ongletProfil') },
    { id: 'onglet-securite',      label: t('ongletSecurite') },
    { id: 'onglet-notifications', label: t('ongletNotif') },
    { id: 'onglet-affichage',     label: t('ongletAffichage') },
  ];
  if (role === 'admin' || role === 'superadmin') {
    liste.push({ id: 'onglet-equipe', label: t('ongletEquipe') });
  }
  return liste.map(function(o, i) {
    var actif = i === 0;
    return '<button id="' + o.id + '" type="button" class="btn-onglet px-4 py-2.5 text-sm '
      + (actif
          ? 'font-medium text-charcoal border-b-2 border-terracotta'
          : 'text-muted hover:text-charcoal border-b-2 border-transparent')
      + ' -mb-px transition">' + o.label + '</button>';
  }).join('');
}

function appliquerDensite(densite) {
  var page = document.getElementById('page-profil');
  if (!page) return;
  if (densite === 'compact') {
    page.classList.add('densite-compact');
    page.classList.remove('densite-normal');
  } else {
    page.classList.add('densite-normal');
    page.classList.remove('densite-compact');
  }
}

// ─── Rendu page ───────────────────────────────────────────────────────────────

export function afficherPageProfil(prenomUtilisateur) {
  history.pushState({ page: 'profil', nom: prenomUtilisateur }, '', '#profil');

  var conteneurApp = document.getElementById('app');
  var session      = lireSession() || {};
  var prenom       = prenomUtilisateur || session.nom || 'Utilisateur';
  var role         = session.role || 'client';
  var prefs        = lirePreferences(session);

  langueActive = prefs.langue || 'fr';

  conteneurApp.className = 'w-full';
  document.getElementById('corps-application').className =
    'font-body bg-beige min-h-screen block p-0 transition-all duration-300';

  conteneurApp.innerHTML = `
    <div id="page-profil" class="animer-fond w-full min-h-screen bg-beige flex flex-col">

      <header id="navbar" class="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div id="navbar-logo" class="flex items-center gap-2 mr-10">
          <img src="LOGOD.png" alt="DecoFlow" class="h-8" />
          <span class="font-display text-2xl font-semibold text-charcoal tracking-wide">DecoFlow</span>
        </div>
        <nav id="navbar-nav" class="hidden md:flex items-center gap-1 flex-1"></nav>
        <div id="navbar-droite" class="flex items-center gap-4">
          <div id="profil-utilisateur" class="flex items-center gap-2 cursor-pointer">
            <span class="text-sm font-medium text-charcoal hidden sm:block">${prenom.split(' ')[0]}</span>
            <div class="w-8 h-8 rounded-full bg-terra-pale flex items-center justify-center">
              <i class="${iconeRole(role)} text-terracotta text-sm"></i>
            </div>
          </div>
        </div>
      </header>

      <main id="contenu-profil" class="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">

        <div class="mb-6 border border-dashed border-gray-200 rounded-xl p-6 bg-white flex items-center justify-between">
          <div>
            <h1 id="titre-page-profil" class="font-display text-4xl font-semibold text-charcoal mb-1">${t('titrePage')}</h1>
            <p id="sous-titre-page-profil" class="text-sm text-muted">${t('sousTitrePage')}</p>
          </div>
          <span class="text-[10px] font-semibold uppercase tracking-wider px-3 py-1 rounded-sm
            ${role === 'superadmin' ? 'bg-charcoal text-white' : role === 'admin' ? 'bg-terracotta text-white' : 'bg-terra-pale text-terracotta'}">
            ${libelleRole(role)}
          </span>
        </div>

        <div id="onglets-profil" class="flex items-center gap-1 mb-6 border-b border-gray-200">
          ${construireEnteteOnglets(role)}
        </div>

        <div id="zone-onglet"></div>

      </main>

      <footer class="bg-white border-t border-gray-100 mt-auto">
        <div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span class="font-display text-lg font-semibold text-charcoal">DecoFlow</span>
          <span class="text-xs text-muted">© 2026 DecoFlow Interior Management. All rights reserved.</span>
        </div>
      </footer>

    </div>

    <!-- Modal invitation -->
    <div id="modal-invitation" class="hidden fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="font-display text-2xl font-semibold text-charcoal">Inviter un membre</h2>
          <button id="fermer-modal-invitation" type="button" class="text-muted hover:text-charcoal transition">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>
        <div id="message-succes-invitation" class="hidden mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
          Invitation envoyée avec succès.
        </div>
        <div id="message-erreur-invitation" class="hidden mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <span id="texte-erreur-invitation">Une erreur est survenue.</span>
        </div>
        <form id="formulaire-invitation" novalidate class="flex flex-col gap-4">
          <div>
            <label for="champ-nom-invitation" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Nom complet</label>
            <input id="champ-nom-invitation" type="text" placeholder="Nom Complet"
              class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
            <p id="erreur-nom-invitation" class="hidden mt-1 text-xs text-red-500">Veuillez entrer un nom.</p>
          </div>
          <div>
            <label for="champ-email-invitation" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Adresse email</label>
            <input id="champ-email-invitation" type="email" placeholder="membre@exemple.com"
              class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
            <p id="erreur-email-invitation" class="hidden mt-1 text-xs text-red-500">Email invalide.</p>
          </div>
          <div>
            <label for="champ-entreprise-invitation" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Entreprise</label>
            <input id="champ-entreprise-invitation" type="text" placeholder="Nom Entreprise"
              class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
          </div>
          <div>
            <label for="champ-role-invitation" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Rôle attribué</label>
            <select id="champ-role-invitation"
              class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition">
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="pt-2 flex gap-3">
            <button id="bouton-envoyer-invitation" type="submit"
              class="flex-1 bg-charcoal text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-terracotta transition-colors duration-200 flex items-center justify-center gap-2">
              <span id="texte-btn-invitation">Envoyer l'invitation</span>
              <span id="spinner-btn-invitation" class="chargement hidden"></span>
            </button>
            <button id="annuler-modal-invitation" type="button"
              class="px-4 py-3 border border-gray-200 text-charcoal text-xs uppercase tracking-widest hover:bg-beige transition-colors duration-200">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  `;

  appliquerDensite(prefs.densite || 'normal');
  rendreOngletProfil(session);
  attacherEcouteursProfil(prenom, session);
  attacherNavigationNavbar(prenom);
  attacherEcouteursModal(session);
}

// ─── Onglet Profil ────────────────────────────────────────────────────────────

function rendreOngletProfil(session) {
  var zone = document.getElementById('zone-onglet');
  if (!zone) return;

  var role          = session.role || 'client';
  var estAdmin      = role === 'admin' || role === 'superadmin';
  var estSuperadmin = role === 'superadmin';

  zone.innerHTML = `
    <div id="contenu-onglet-profil" class="animer-fond grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="bg-white rounded-xl border border-gray-100 p-6">

          <div class="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
            <div class="w-16 h-16 rounded-full bg-terra-pale flex items-center justify-center flex-shrink-0">
              <i class="${iconeRole(role)} text-terracotta text-2xl"></i>
            </div>
            <div>
              <p class="font-display text-xl font-semibold text-charcoal">${session.nom || 'Utilisateur'}</p>
              <p class="text-sm text-muted">${libelleRole(role)} · ${session.entreprise || 'DecoFlow'}</p>
            </div>
          </div>

          <div id="message-succes-profil" class="hidden mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
            ${t('succesProfil')}
          </div>
          <div id="message-erreur-profil" class="hidden mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            <span id="texte-erreur-profil">${t('erreurProfil')}</span>
          </div>

          <form id="formulaire-profil" novalidate class="flex flex-col gap-4">

            <div>
              <label for="champ-nom-profil" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">${t('nomComplet')}</label>
              <input id="champ-nom-profil" type="text" value="${session.nom || ''}"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
              <p id="erreur-nom-profil" class="hidden mt-1 text-xs text-red-500">${t('erreurNom')}</p>
            </div>

            <div>
              <label for="champ-email-profil" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">${t('email')}</label>
              <input id="champ-email-profil" type="email" value="${session.email || ''}"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
              <p id="erreur-email-profil" class="hidden mt-1 text-xs text-red-500">${t('erreurEmail')}</p>
            </div>

            <div>
              <label for="champ-entreprise-profil" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">${t('entreprise')}</label>
              <input id="champ-entreprise-profil" type="text" value="${session.entreprise || ''}"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
            </div>

            ${estAdmin ? `
            <div>
              <label for="champ-telephone-profil" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">${t('telephone')}</label>
              <input id="champ-telephone-profil" type="tel" value="${session.telephone || ''}" placeholder="+221 77 000 00 00"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
            </div>
            ` : ''}

            <div>
              <label for="champ-biographie-profil" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">
                ${estAdmin ? t('biographie') : t('biographieClient')}
              </label>
              <textarea id="champ-biographie-profil" rows="3"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition resize-none"
                placeholder="${estAdmin ? 'Décrivez votre rôle et responsabilités…' : 'Décrivez votre activité…'}">${session.biographie || ''}</textarea>
            </div>

            ${estSuperadmin ? `
            <div class="bg-beige/60 border border-dashed border-terra-light rounded-lg p-4">
              <p class="text-xs font-semibold text-terracotta uppercase tracking-wider mb-1">Informations système</p>
              <p class="text-xs text-muted">ID compte : <span class="font-mono text-charcoal">${session.id || '—'}</span></p>
              <p class="text-xs text-muted">Rôle : <span class="font-mono text-charcoal">${session.role}</span></p>
              <p class="text-xs text-muted mt-1">Ces informations sont en lecture seule.</p>
            </div>
            ` : ''}

            <div class="pt-2">
              <button id="bouton-enregistrer-profil" type="submit"
                class="bg-charcoal text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-terracotta transition-colors duration-200 flex items-center gap-2">
                <span id="texte-btn-profil">${t('enregistrer')}</span>
                <span id="spinner-btn-profil" class="chargement hidden"></span>
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- Colonne droite -->
      <div class="flex flex-col gap-6">

        ${estAdmin ? `
        <div class="bg-white rounded-xl border border-gray-100 p-5">
          <h3 class="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Activité récente</h3>
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-2 text-xs text-muted"><i class="fa-solid fa-circle-check text-green-400 w-4"></i> Connexion réussie aujourd'hui</div>
            <div class="flex items-center gap-2 text-xs text-muted"><i class="fa-solid fa-pen text-terracotta w-4"></i> Profil modifié récemment</div>
            <div class="flex items-center gap-2 text-xs text-muted"><i class="fa-solid fa-users text-blue-400 w-4"></i> 3 utilisateurs gérés ce mois</div>
          </div>
        </div>
        ` : `
        <div class="bg-white rounded-xl border border-gray-100 p-5">
          <h3 class="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Mon espace</h3>
          <div class="flex justify-between text-xs text-muted mb-2"><span>12,4 Go utilisés</span><span>20 Go total</span></div>
          <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-4">
            <div class="h-full bg-terracotta rounded-full" style="width: 62%"></div>
          </div>
          <button type="button" class="w-full border border-gray-200 text-charcoal text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-beige transition-colors duration-200">
            Libérer de l'espace
          </button>
        </div>
        `}

        ${estSuperadmin ? `
        <div class="bg-charcoal rounded-xl p-5">
          <p class="text-terracotta text-xs font-semibold uppercase tracking-widest mb-1">Superadmin</p>
          <p class="text-sm text-white font-medium mb-1">Accès complet au système</p>
          <p class="text-xs text-white/50 mb-4">Vous avez les droits les plus élevés sur la plateforme DecoFlow.</p>
          <button id="lien-vers-superadmin" type="button"
            class="w-full bg-terracotta text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-terra-light transition-colors duration-200">
            Panneau Superadmin →
          </button>
        </div>
        ` : estAdmin ? `
        <div class="bg-[#F5F0EA] rounded-xl border border-terra-pale p-5">
          <p class="text-terracotta text-xs font-semibold uppercase tracking-widest mb-1">Rôle Admin</p>
          <p class="text-sm text-charcoal font-medium mb-1">Accès à la gestion du catalogue et des clients.</p>
          <p class="text-xs text-muted mb-4">Vous pouvez gérer les produits, les commandes et les utilisateurs.</p>
          <button id="lien-vers-admin" type="button"
            class="w-full bg-charcoal text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-terracotta transition-colors duration-200">
            Panneau Admin →
          </button>
        </div>
        ` : `
        <div class="bg-[#F5F0EA] rounded-xl border border-terra-pale p-5">
          <p class="text-terracotta text-xs font-semibold uppercase tracking-widest mb-1">Plan Premium</p>
          <p class="text-sm text-charcoal font-medium mb-1">Débloquez les galeries 4K et les exports illimités.</p>
          <p class="text-xs text-muted mb-4">Accédez à toutes les fonctionnalités avancées de DecoFlow.</p>
          <button type="button" class="w-full bg-charcoal text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-terracotta transition-colors duration-200">
            Passer à l'offre Pro
          </button>
        </div>
        `}

      </div>
    </div>
  `;

  attacherEcouteursFormulaireProfi(session);

  var lienAdmin = document.getElementById('lien-vers-admin');
  if (lienAdmin) {
    lienAdmin.addEventListener('click', function() {
      if (window.decoflowRouter) window.decoflowRouter.naviguerVers('admin-panel', session.nom);
    });
  }

  var lienSuperadmin = document.getElementById('lien-vers-superadmin');
  if (lienSuperadmin) {
    lienSuperadmin.addEventListener('click', function() {
      if (window.decoflowRouter) window.decoflowRouter.naviguerVers('superadmin-panel', session.nom);
    });
  }
}

// ─── Onglet Sécurité ──────────────────────────────────────────────────────────

function rendreOngletSecurite(session) {
  var zone = document.getElementById('zone-onglet');
  if (!zone) return;

  var estAdmin = session.role === 'admin' || session.role === 'superadmin';

  zone.innerHTML = `
    <div class="animer-fond grid grid-cols-1 lg:grid-cols-3 gap-6">

      <div class="lg:col-span-2 flex flex-col gap-6">

        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-display text-xl font-semibold text-charcoal mb-1">Mot de passe</h2>
          <p class="text-xs text-muted mb-5">Choisissez un mot de passe sécurisé d'au moins 8 caractères avec un chiffre.</p>

          <div id="message-succes-securite" class="hidden mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
            Mot de passe modifié avec succès.
          </div>
          <div id="message-erreur-securite" class="hidden mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
            <span id="texte-erreur-securite">Une erreur est survenue.</span>
          </div>

          <form id="formulaire-securite" novalidate class="flex flex-col gap-4">
            <div>
              <label for="champ-mdp-actuel" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Mot de passe actuel</label>
              <input id="champ-mdp-actuel" type="password" placeholder="••••••••"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
              <p id="erreur-mdp-actuel" class="hidden mt-1 text-xs text-red-500">Mot de passe actuel incorrect.</p>
            </div>
            <div>
              <label for="champ-nouveau-mdp" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Nouveau mot de passe</label>
              <input id="champ-nouveau-mdp" type="password" placeholder="••••••••"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
              <p id="erreur-nouveau-mdp" class="hidden mt-1 text-xs text-red-500">8 caractères minimum, dont un chiffre.</p>
            </div>
            <div>
              <label for="champ-confirmer-mdp" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Confirmer le mot de passe</label>
              <input id="champ-confirmer-mdp" type="password" placeholder="••••••••"
                class="champ w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-charcoal bg-beige/40 transition" />
              <p id="erreur-confirmer-mdp" class="hidden mt-1 text-xs text-red-500">Les mots de passe ne correspondent pas.</p>
            </div>
            <div class="pt-2">
              <button id="bouton-changer-mdp" type="submit"
                class="bg-charcoal text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-terracotta transition-colors duration-200 flex items-center gap-2">
                <span id="texte-btn-mdp">Changer le mot de passe</span>
                <span id="spinner-btn-mdp" class="chargement hidden"></span>
              </button>
            </div>
          </form>
        </div>

        ${estAdmin ? `
        <div class="bg-white rounded-xl border border-gray-100 p-6">
          <h2 class="font-display text-xl font-semibold text-charcoal mb-1">Sessions actives</h2>
          <p class="text-xs text-muted mb-5">Vos connexions actuelles sur la plateforme.</p>
          <div class="flex items-center justify-between py-3 border-b border-gray-50">
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-desktop text-terracotta w-5 text-center"></i>
              <div>
                <p class="text-sm font-medium text-charcoal">Chrome — Dakar, Sénégal</p>
                <p class="text-xs text-muted">Session actuelle · Aujourd'hui</p>
              </div>
            </div>
            <span class="text-[10px] font-semibold uppercase tracking-wider bg-green-50 text-green-500 px-2 py-0.5 rounded-sm">Actif</span>
          </div>
        </div>
        ` : ''}

      </div>

      <div class="flex flex-col gap-6">
        <div class="bg-white rounded-xl border border-gray-100 p-5">
          <h3 class="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Conseils sécurité</h3>
          <div class="flex flex-col gap-3">
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-circle-check text-green-400 text-xs mt-0.5 w-4"></i>
              <p class="text-xs text-muted">Utilisez un mot de passe unique pour DecoFlow.</p>
            </div>
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-circle-exclamation text-orange-400 text-xs mt-0.5 w-4"></i>
              <p class="text-xs text-muted">Ne partagez jamais vos identifiants avec un tiers.</p>
            </div>
            <div class="flex items-start gap-2">
              <i class="fa-solid fa-shield-halved text-terracotta text-xs mt-0.5 w-4"></i>
              <p class="text-xs text-muted">Déconnectez-vous sur les appareils partagés.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  attacherEcouteursSecurite(session);
}

// ─── Onglet Notifications ─────────────────────────────────────────────────────

function rendreOngletNotifications(session) {
  var zone = document.getElementById('zone-onglet');
  if (!zone) return;

  var estAdmin = session.role === 'admin' || session.role === 'superadmin';
  var prefs    = lirePreferences(session);
  var notifs   = prefs.notifications || {};

  function toggle(id, actif) {
    return `
      <label class="relative inline-flex items-center cursor-pointer">
        <input id="${id}" type="checkbox" class="sr-only peer" ${actif ? 'checked' : ''} />
        <div class="w-10 h-5 bg-gray-200 peer-checked:bg-terracotta rounded-full transition peer-focus:outline-none"></div>
        <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></div>
      </label>
    `;
  }

  zone.innerHTML = `
    <div class="animer-fond bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
      <h2 class="font-display text-xl font-semibold text-charcoal mb-1">Notifications</h2>
      <p class="text-xs text-muted mb-6">Choisissez les alertes que vous souhaitez recevoir.</p>

      <div id="message-succes-notif" class="hidden mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
        Préférences de notifications enregistrées.
      </div>
      <div id="message-erreur-notif" class="hidden mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        Impossible d'enregistrer. Vérifiez votre connexion.
      </div>

      <div class="flex flex-col gap-0">

        <div class="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <p class="text-sm font-medium text-charcoal">Nouvelles commandes</p>
            <p class="text-xs text-muted">Recevoir une alerte à chaque nouvelle commande.</p>
          </div>
          ${toggle('notif-commandes', notifs.commandes !== false)}
        </div>

        <div class="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <p class="text-sm font-medium text-charcoal">Mises à jour de devis</p>
            <p class="text-xs text-muted">Être notifié des changements sur vos devis.</p>
          </div>
          ${toggle('notif-devis', notifs.devis !== false)}
        </div>

        ${estAdmin ? `
        <div class="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <p class="text-sm font-medium text-charcoal">Alertes stock faible</p>
            <p class="text-xs text-muted">Recevoir une alerte quand un produit passe sous 3 unités.</p>
          </div>
          ${toggle('notif-stock', notifs.stock === true)}
        </div>

        <div class="flex items-center justify-between py-4 border-b border-gray-50">
          <div>
            <p class="text-sm font-medium text-charcoal">Nouveaux utilisateurs inscrits</p>
            <p class="text-xs text-muted">Être notifié lors de chaque nouvelle inscription.</p>
          </div>
          ${toggle('notif-users', notifs.users === true)}
        </div>
        ` : ''}

        <div class="flex items-center justify-between py-4">
          <div>
            <p class="text-sm font-medium text-charcoal">Résumé hebdomadaire</p>
            <p class="text-xs text-muted">Recevoir un récapitulatif chaque lundi matin.</p>
          </div>
          ${toggle('notif-hebdo', notifs.hebdo === true)}
        </div>

      </div>

      <div class="pt-4 border-t border-gray-100 mt-2">
        <button id="bouton-enregistrer-notif" type="button"
          class="bg-charcoal text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-terracotta transition-colors duration-200 flex items-center gap-2">
          <span id="texte-btn-notif">Enregistrer les préférences</span>
          <span id="spinner-btn-notif" class="chargement hidden"></span>
        </button>
      </div>

    </div>
  `;

  attacherEcouteursNotifications(session, estAdmin);
}

// ─── Onglet Affichage ─────────────────────────────────────────────────────────

function rendreOngletAffichage(session) {
  var zone = document.getElementById('zone-onglet');
  if (!zone) return;

  var prefs   = lirePreferences(session);
  var langue  = prefs.langue  || 'fr';
  var densite = prefs.densite || 'normal';

  zone.innerHTML = `
    <div class="animer-fond bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
      <h2 class="font-display text-xl font-semibold text-charcoal mb-1">Affichage</h2>
      <p class="text-xs text-muted mb-6">Personnalisez l'apparence de votre espace DecoFlow.</p>

      <div id="message-succes-affichage" class="hidden mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
        Préférences d'affichage enregistrées.
      </div>
      <div id="message-erreur-affichage" class="hidden mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
        Impossible d'enregistrer. Vérifiez votre connexion.
      </div>

      <div class="flex flex-col gap-6">

        <div>
          <p class="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Langue</p>
          <div class="flex gap-3">
            <label id="label-langue-fr" class="flex-1 border ${langue === 'fr' ? 'border-terracotta bg-beige/60' : 'border-gray-200 bg-white'} rounded-lg p-4 cursor-pointer text-center hover:border-terracotta transition">
              <input type="radio" name="langue" value="fr" class="sr-only" ${langue === 'fr' ? 'checked' : ''} />
              <span class="text-xl mb-1 block">🇫🇷</span>
              <span class="text-xs font-medium text-charcoal">Français</span>
            </label>
            <label id="label-langue-en" class="flex-1 border ${langue === 'en' ? 'border-terracotta bg-beige/60' : 'border-gray-200 bg-white'} rounded-lg p-4 cursor-pointer text-center hover:border-terracotta transition">
              <input type="radio" name="langue" value="en" class="sr-only" ${langue === 'en' ? 'checked' : ''} />
              <span class="text-xl mb-1 block">🇬🇧</span>
              <span class="text-xs font-medium text-charcoal">English</span>
            </label>
          </div>
        </div>

        <div>
          <p class="text-xs font-semibold text-charcoal uppercase tracking-wider mb-3">Densité d'affichage</p>
          <div class="flex gap-3">
            <label id="label-densite-compact" class="flex-1 border ${densite === 'compact' ? 'border-terracotta bg-beige/60' : 'border-gray-200 bg-white'} rounded-lg p-4 cursor-pointer text-center hover:border-terracotta transition">
              <input type="radio" name="densite" value="compact" class="sr-only" ${densite === 'compact' ? 'checked' : ''} />
              <i class="fa-solid fa-list text-terracotta mb-1 block text-lg"></i>
              <span class="text-xs font-medium text-charcoal">Compact</span>
            </label>
            <label id="label-densite-normal" class="flex-1 border ${densite === 'normal' ? 'border-terracotta bg-beige/60' : 'border-gray-200 bg-white'} rounded-lg p-4 cursor-pointer text-center hover:border-terracotta transition">
              <input type="radio" name="densite" value="normal" class="sr-only" ${densite === 'normal' ? 'checked' : ''} />
              <i class="fa-solid fa-table-cells-large text-terracotta mb-1 block text-lg"></i>
              <span class="text-xs font-medium text-charcoal">Normal</span>
            </label>
          </div>
        </div>

      </div>

      <div class="pt-6 border-t border-gray-100 mt-2">
        <button id="bouton-enregistrer-affichage" type="button"
          class="bg-charcoal text-white text-xs uppercase tracking-widest px-6 py-3 hover:bg-terracotta transition-colors duration-200 flex items-center gap-2">
          <span id="texte-btn-affichage">Enregistrer les préférences</span>
          <span id="spinner-btn-affichage" class="chargement hidden"></span>
        </button>
      </div>

    </div>
  `;

  attacherEcouteursAffichage(session);
}

// ─── Onglet Équipe ────────────────────────────────────────────────────────────

function rendreOngletEquipe(session) {
  var zone = document.getElementById('zone-onglet');
  if (!zone) return;

  var estSuperadmin = session.role === 'superadmin';

  zone.innerHTML = `
    <div class="animer-fond flex flex-col gap-6">

      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h2 class="font-display text-xl font-semibold text-charcoal">Membres de l'équipe</h2>
            <p class="text-xs text-muted">Gérez les accès et les rôles des collaborateurs.</p>
          </div>
          ${estSuperadmin ? `
          <button id="bouton-inviter-membre" type="button"
            class="flex items-center gap-2 bg-charcoal text-white text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-terracotta transition-colors duration-200">
            <i class="fa-solid fa-plus text-xs"></i> Inviter
          </button>
          ` : ''}
        </div>

        <div class="grid grid-cols-[2fr_1fr_1fr_auto] px-4 py-2 border-b border-gray-100">
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Membre</span>
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Rôle</span>
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Statut</span>
          <span class="text-xs font-semibold text-muted uppercase tracking-wider">Actions</span>
        </div>

        <div id="liste-equipe">
          ${construireLigneMembre('Moussa Diallo', 'moussa@decoflow.sn', 'admin',  'Actif',   estSuperadmin)}
          ${construireLigneMembre('Fatou Ndiaye',  'fatou@decoflow.sn',  'client', 'Actif',   estSuperadmin)}
          ${construireLigneMembre('Ibou Seck',     'ibou@decoflow.sn',   'client', 'Inactif', estSuperadmin)}
        </div>
      </div>

      ${estSuperadmin ? `
      <div class="bg-white rounded-xl border border-gray-100 p-6">
        <h2 class="font-display text-xl font-semibold text-charcoal mb-1">Permissions par rôle</h2>
        <p class="text-xs text-muted mb-5">Vue d'ensemble des droits accordés à chaque rôle.</p>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-100">
                <th class="text-left font-semibold text-muted uppercase tracking-wider pb-2 pr-4">Fonctionnalité</th>
                <th class="text-center font-semibold text-muted uppercase tracking-wider pb-2 px-4">Client</th>
                <th class="text-center font-semibold text-muted uppercase tracking-wider pb-2 px-4">Admin</th>
                <th class="text-center font-semibold text-muted uppercase tracking-wider pb-2 px-4">Superadmin</th>
              </tr>
            </thead>
            <tbody>
              ${construireLignePermission('Catalogue produits',  true,  true,  true)}
              ${construireLignePermission('Passer commande',     true,  true,  true)}
              ${construireLignePermission('Gérer les produits',  false, true,  true)}
              ${construireLignePermission('Gérer les clients',   false, true,  true)}
              ${construireLignePermission('Panneau Admin',       false, true,  true)}
              ${construireLignePermission('Gérer les rôles',     false, false, true)}
              ${construireLignePermission('Panneau Superadmin',  false, false, true)}
            </tbody>
          </table>
        </div>
      </div>
      ` : ''}

    </div>
  `;

  if (estSuperadmin) {
    var boutonInviter = document.getElementById('bouton-inviter-membre');
    if (boutonInviter) {
      boutonInviter.addEventListener('click', function() {
        var modal = document.getElementById('modal-invitation');
        if (modal) modal.classList.remove('hidden');
      });
    }
  }
}

function construireLigneMembre(nom, email, role, statut, peutModifier) {
  var couleurStatut = statut === 'Actif' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-muted';
  var couleurRole   = role === 'admin' ? 'bg-terracotta text-white' : role === 'superadmin' ? 'bg-charcoal text-white' : 'bg-terra-pale text-terracotta';
  return `
    <div class="grid grid-cols-[2fr_1fr_1fr_auto] items-center px-4 py-3 border-b border-gray-50 hover:bg-beige/30 transition">
      <div>
        <p class="text-sm font-medium text-charcoal">${nom}</p>
        <p class="text-xs text-muted">${email}</p>
      </div>
      <span class="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${couleurRole}">${role}</span>
      <span class="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm ${couleurStatut}">${statut}</span>
      <div class="flex gap-2">
        ${peutModifier ? `
        <button type="button" class="w-7 h-7 flex items-center justify-center border border-gray-200 rounded-lg text-muted hover:text-terracotta hover:border-terracotta transition">
          <i class="fa-regular fa-pen-to-square text-xs"></i>
        </button>
        ` : '<span class="w-7"></span>'}
      </div>
    </div>
  `;
}

function construireLignePermission(label, client, admin, superadmin) {
  function icone(actif) {
    return actif
      ? '<i class="fa-solid fa-check text-green-500"></i>'
      : '<i class="fa-solid fa-xmark text-gray-200"></i>';
  }
  return `
    <tr class="border-b border-gray-50">
      <td class="py-2.5 pr-4 text-charcoal">${label}</td>
      <td class="py-2.5 px-4 text-center">${icone(client)}</td>
      <td class="py-2.5 px-4 text-center">${icone(admin)}</td>
      <td class="py-2.5 px-4 text-center">${icone(superadmin)}</td>
    </tr>
  `;
}

// ─── Écouteurs formulaire profil ──────────────────────────────────────────────

function attacherEcouteursFormulaireProfi(session) {
  var formulaire = document.getElementById('formulaire-profil');
  if (!formulaire) return;

  formulaire.addEventListener('submit', async function(evenement) {
    evenement.preventDefault();

    var nomSaisi        = document.getElementById('champ-nom-profil').value;
    var emailSaisi      = document.getElementById('champ-email-profil').value;
    var entrepriseSaisi = document.getElementById('champ-entreprise-profil').value;
    var biographieSaisi = document.getElementById('champ-biographie-profil').value;
    var champTel        = document.getElementById('champ-telephone-profil');
    var telephoneSaisi  = champTel ? champTel.value : (session.telephone || '');

    afficherAlerte('message-succes-profil', false);
    afficherAlerte('message-erreur-profil', false);
    afficherErreurChamp('erreur-nom-profil', false);
    afficherErreurChamp('erreur-email-profil', false);

    var valide = true;
    if (nomSaisi.trim().length < 2) {
      afficherErreurChamp('erreur-nom-profil', true);
      valide = false;
    }
    var formatEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatEmail.test(emailSaisi.trim())) {
      afficherErreurChamp('erreur-email-profil', true);
      valide = false;
    }
    if (!valide) {
      animerTremblement(formulaire);
      return;
    }

    var btnTexte   = document.getElementById('texte-btn-profil');
    var btnSpinner = document.getElementById('spinner-btn-profil');
    var btnSave    = document.getElementById('bouton-enregistrer-profil');

    if (btnSave)    btnSave.disabled     = true;
    if (btnTexte)   btnTexte.textContent = t('enregistrement');
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    var donneesMaj = {
      nom:        nomSaisi.trim(),
      email:      emailSaisi.toLowerCase().trim(),
      entreprise: entrepriseSaisi.trim(),
      biographie: biographieSaisi.trim(),
      telephone:  telephoneSaisi.trim()
    };

    try {
      if (session.id) {
        await modifierUtilisateur(session.id, donneesMaj);
      }
      var sessionMaj = Object.assign({}, session, donneesMaj);
      sauvegarderSession(sessionMaj);
      afficherAlerte('message-succes-profil', true);
      setTimeout(function() { afficherAlerte('message-succes-profil', false); }, 3000);
    } catch (erreur) {
      document.getElementById('texte-erreur-profil').textContent = t('erreurProfil');
      afficherAlerte('message-erreur-profil', true);
    } finally {
      if (btnSave)    btnSave.disabled     = false;
      if (btnTexte)   btnTexte.textContent = t('enregistrer');
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  });
}

// ─── Écouteurs sécurité ───────────────────────────────────────────────────────

function attacherEcouteursSecurite(session) {
  var formulaire = document.getElementById('formulaire-securite');
  if (!formulaire) return;

  formulaire.addEventListener('submit', async function(evenement) {
    evenement.preventDefault();

    var mdpActuel    = document.getElementById('champ-mdp-actuel').value;
    var nouveauMdp   = document.getElementById('champ-nouveau-mdp').value;
    var confirmerMdp = document.getElementById('champ-confirmer-mdp').value;

    afficherAlerte('message-succes-securite', false);
    afficherAlerte('message-erreur-securite', false);
    afficherErreurChamp('erreur-mdp-actuel', false);
    afficherErreurChamp('erreur-nouveau-mdp', false);
    afficherErreurChamp('erreur-confirmer-mdp', false);

    var valide = true;

    if (mdpActuel !== session.motDePasse) {
      afficherErreurChamp('erreur-mdp-actuel', true);
      valide = false;
    }
    var regex = /\d/;
    if (nouveauMdp.length < 8 || !regex.test(nouveauMdp)) {
      afficherErreurChamp('erreur-nouveau-mdp', true);
      valide = false;
    }
    if (nouveauMdp !== confirmerMdp) {
      afficherErreurChamp('erreur-confirmer-mdp', true);
      valide = false;
    }
    if (!valide) {
      animerTremblement(formulaire);
      return;
    }

    var btnTexte   = document.getElementById('texte-btn-mdp');
    var btnSpinner = document.getElementById('spinner-btn-mdp');
    var btnSave    = document.getElementById('bouton-changer-mdp');

    if (btnSave)    btnSave.disabled     = true;
    if (btnTexte)   btnTexte.textContent = 'Modification…';
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    try {
      if (session.id) {
        await modifierUtilisateur(session.id, { motDePasse: nouveauMdp });
      }
      var sessionMaj = Object.assign({}, session, { motDePasse: nouveauMdp });
      sauvegarderSession(sessionMaj);
      afficherAlerte('message-succes-securite', true);
      formulaire.reset();
      setTimeout(function() { afficherAlerte('message-succes-securite', false); }, 3000);
    } catch (erreur) {
      document.getElementById('texte-erreur-securite').textContent = 'Impossible de modifier. Vérifiez votre connexion.';
      afficherAlerte('message-erreur-securite', true);
    } finally {
      if (btnSave)    btnSave.disabled     = false;
      if (btnTexte)   btnTexte.textContent = 'Changer le mot de passe';
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  });
}

// ─── Écouteurs notifications ──────────────────────────────────────────────────

function attacherEcouteursNotifications(session, estAdmin) {
  var bouton = document.getElementById('bouton-enregistrer-notif');
  if (!bouton) return;

  bouton.addEventListener('click', async function() {
    var btnTexte   = document.getElementById('texte-btn-notif');
    var btnSpinner = document.getElementById('spinner-btn-notif');

    bouton.disabled          = true;
    btnTexte.textContent     = 'Enregistrement…';
    btnSpinner.classList.remove('hidden');

    var notifications = {
      commandes: document.getElementById('notif-commandes') ? document.getElementById('notif-commandes').checked : false,
      devis:     document.getElementById('notif-devis')     ? document.getElementById('notif-devis').checked     : false,
      hebdo:     document.getElementById('notif-hebdo')     ? document.getElementById('notif-hebdo').checked     : false,
    };

    if (estAdmin) {
      notifications.stock = document.getElementById('notif-stock') ? document.getElementById('notif-stock').checked : false;
      notifications.users = document.getElementById('notif-users') ? document.getElementById('notif-users').checked : false;
    }

    var prefs       = lirePreferences(session);
    var nouvellesPrefs = Object.assign({}, prefs, { notifications: notifications });

    try {
      if (session.id) {
        await modifierUtilisateur(session.id, { preferences: nouvellesPrefs });
      }
      var sessionMaj = Object.assign({}, session, { preferences: nouvellesPrefs });
      sauvegarderSession(sessionMaj);
      afficherAlerte('message-succes-notif', true);
      setTimeout(function() { afficherAlerte('message-succes-notif', false); }, 3000);
    } catch (erreur) {
      afficherAlerte('message-erreur-notif', true);
      setTimeout(function() { afficherAlerte('message-erreur-notif', false); }, 3000);
    } finally {
      bouton.disabled          = false;
      btnTexte.textContent     = 'Enregistrer les préférences';
      btnSpinner.classList.add('hidden');
    }
  });
}

// ─── Écouteurs affichage ──────────────────────────────────────────────────────

function attacherEcouteursAffichage(session) {
  // Feedback visuel sélection langue
  var radiosLangue = document.querySelectorAll('input[name="langue"]');
  radiosLangue.forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.getElementById('label-langue-fr').className =
        document.getElementById('label-langue-fr').className.replace('border-terracotta bg-beige/60', 'border-gray-200 bg-white');
      document.getElementById('label-langue-en').className =
        document.getElementById('label-langue-en').className.replace('border-terracotta bg-beige/60', 'border-gray-200 bg-white');
      var labelActif = document.getElementById('label-langue-' + radio.value);
      if (labelActif) {
        labelActif.className = labelActif.className.replace('border-gray-200 bg-white', 'border-terracotta bg-beige/60');
      }
    });
  });

  // Feedback visuel sélection densité
  var radiosDensite = document.querySelectorAll('input[name="densite"]');
  radiosDensite.forEach(function(radio) {
    radio.addEventListener('change', function() {
      document.getElementById('label-densite-compact').className =
        document.getElementById('label-densite-compact').className.replace('border-terracotta bg-beige/60', 'border-gray-200 bg-white');
      document.getElementById('label-densite-normal').className =
        document.getElementById('label-densite-normal').className.replace('border-terracotta bg-beige/60', 'border-gray-200 bg-white');
      var labelActif = document.getElementById('label-densite-' + radio.value);
      if (labelActif) {
        labelActif.className = labelActif.className.replace('border-gray-200 bg-white', 'border-terracotta bg-beige/60');
      }
      appliquerDensite(radio.value);
    });
  });

  // Enregistrement
  var bouton = document.getElementById('bouton-enregistrer-affichage');
  if (!bouton) return;

  bouton.addEventListener('click', async function() {
    var btnTexte   = document.getElementById('texte-btn-affichage');
    var btnSpinner = document.getElementById('spinner-btn-affichage');

    bouton.disabled          = true;
    btnTexte.textContent     = 'Enregistrement…';
    btnSpinner.classList.remove('hidden');

    var langueSelectionnee  = document.querySelector('input[name="langue"]:checked');
    var densiteSelectionnee = document.querySelector('input[name="densite"]:checked');
    var nouvelleLangue      = langueSelectionnee  ? langueSelectionnee.value  : 'fr';
    var nouvelleDensite     = densiteSelectionnee ? densiteSelectionnee.value : 'normal';

    var prefs          = lirePreferences(session);
    var nouvellesPrefs = Object.assign({}, prefs, { langue: nouvelleLangue, densite: nouvelleDensite });

    try {
      if (session.id) {
        await modifierUtilisateur(session.id, { preferences: nouvellesPrefs });
      }
      var sessionMaj = Object.assign({}, session, { preferences: nouvellesPrefs });
      sauvegarderSession(sessionMaj);

      // Appliquer la langue immédiatement
      langueActive = nouvelleLangue;
      appliquerDensite(nouvelleDensite);

      // Mettre à jour les textes de l'en-tête de page
      var titrePage    = document.getElementById('titre-page-profil');
      var sousTitre    = document.getElementById('sous-titre-page-profil');
      if (titrePage) titrePage.textContent = t('titrePage');
      if (sousTitre) sousTitre.textContent = t('sousTitrePage');

      // Mettre à jour les labels des onglets
      var configs = [
        { id: 'onglet-profil',        cle: 'ongletProfil' },
        { id: 'onglet-securite',      cle: 'ongletSecurite' },
        { id: 'onglet-notifications', cle: 'ongletNotif' },
        { id: 'onglet-affichage',     cle: 'ongletAffichage' },
        { id: 'onglet-equipe',        cle: 'ongletEquipe' },
      ];
      configs.forEach(function(c) {
        var el = document.getElementById(c.id);
        if (el) el.textContent = t(c.cle);
      });

      afficherAlerte('message-succes-affichage', true);
      setTimeout(function() { afficherAlerte('message-succes-affichage', false); }, 3000);
    } catch (erreur) {
      afficherAlerte('message-erreur-affichage', true);
      setTimeout(function() { afficherAlerte('message-erreur-affichage', false); }, 3000);
    } finally {
      bouton.disabled          = false;
      btnTexte.textContent     = 'Enregistrer les préférences';
      btnSpinner.classList.add('hidden');
    }
  });
}

// ─── Écouteurs modal invitation ───────────────────────────────────────────────

function attacherEcouteursModal(session) {
  var modal         = document.getElementById('modal-invitation');
  var boutonFermer  = document.getElementById('fermer-modal-invitation');
  var boutonAnnuler = document.getElementById('annuler-modal-invitation');
  var formulaire    = document.getElementById('formulaire-invitation');

  function fermerModal() {
    if (modal) {
      modal.classList.add('hidden');
      if (formulaire) formulaire.reset();
      afficherAlerte('message-succes-invitation', false);
      afficherAlerte('message-erreur-invitation', false);
    }
  }

  if (boutonFermer)  boutonFermer.addEventListener('click',  fermerModal);
  if (boutonAnnuler) boutonAnnuler.addEventListener('click', fermerModal);

  // Fermer en cliquant sur le fond
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) fermerModal();
    });
  }

  if (!formulaire) return;

  formulaire.addEventListener('submit', async function(evenement) {
    evenement.preventDefault();

    var nomSaisi        = document.getElementById('champ-nom-invitation').value;
    var emailSaisi      = document.getElementById('champ-email-invitation').value;
    var entrepriseSaisi = document.getElementById('champ-entreprise-invitation').value;
    var roleSaisi       = document.getElementById('champ-role-invitation').value;

    afficherAlerte('message-succes-invitation', false);
    afficherAlerte('message-erreur-invitation', false);
    afficherErreurChamp('erreur-nom-invitation', false);
    afficherErreurChamp('erreur-email-invitation', false);

    var valide = true;
    if (nomSaisi.trim().length < 2) {
      afficherErreurChamp('erreur-nom-invitation', true);
      valide = false;
    }
    var formatEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formatEmail.test(emailSaisi.trim())) {
      afficherErreurChamp('erreur-email-invitation', true);
      valide = false;
    }
    if (!valide) {
      animerTremblement(formulaire);
      return;
    }

    var btnTexte   = document.getElementById('texte-btn-invitation');
    var btnSpinner = document.getElementById('spinner-btn-invitation');
    var btnEnvoyer = document.getElementById('bouton-envoyer-invitation');

    if (btnEnvoyer) btnEnvoyer.disabled    = true;
    if (btnTexte)   btnTexte.textContent   = 'Envoi en cours…';
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    var nouvelUtilisateur = {
      nom:             nomSaisi.trim(),
      email:           emailSaisi.toLowerCase().trim(),
      entreprise:      entrepriseSaisi.trim(),
      motDePasse:      'Decoflow2024!',
      role:            roleSaisi,
      dateInscription: new Date().toISOString(),
      invitePar:       session.id || null
    };

    try {
      var reponse = await fetch('http://localhost:3000/utilisateurs', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(nouvelUtilisateur)
      });
      if (!reponse.ok) throw new Error('Erreur serveur');

      afficherAlerte('message-succes-invitation', true);
      formulaire.reset();
      setTimeout(function() { fermerModal(); }, 2000);
    } catch (erreur) {
      document.getElementById('texte-erreur-invitation').textContent = 'Impossible d\'envoyer l\'invitation. Vérifiez votre connexion.';
      afficherAlerte('message-erreur-invitation', true);
    } finally {
      if (btnEnvoyer) btnEnvoyer.disabled    = false;
      if (btnTexte)   btnTexte.textContent   = 'Envoyer l\'invitation';
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  });
}

// ─── Écouteurs page ───────────────────────────────────────────────────────────

function attacherEcouteursProfil(prenom, session) {
  var role = session.role || 'client';

  var onglets = [
    { id: 'onglet-profil',        rendu: function() { rendreOngletProfil(session); } },
    { id: 'onglet-securite',      rendu: function() { rendreOngletSecurite(session); } },
    { id: 'onglet-notifications', rendu: function() { rendreOngletNotifications(session); } },
    { id: 'onglet-affichage',     rendu: function() { rendreOngletAffichage(session); } },
  ];

  if (role === 'admin' || role === 'superadmin') {
    onglets.push({ id: 'onglet-equipe', rendu: function() { rendreOngletEquipe(session); } });
  }

  onglets.forEach(function(onglet) {
    var bouton = document.getElementById(onglet.id);
    if (!bouton) return;

    bouton.addEventListener('click', function() {
      onglets.forEach(function(o) {
        var b = document.getElementById(o.id);
        if (!b) return;
        b.className = 'btn-onglet px-4 py-2.5 text-sm text-muted hover:text-charcoal border-b-2 border-transparent -mb-px transition';
      });
      bouton.className = 'btn-onglet px-4 py-2.5 text-sm font-medium text-charcoal border-b-2 border-terracotta -mb-px transition';
      onglet.rendu();
    });
  });
}

tailwind.config = {
  theme: {
    extend: {
      colors: {
        beige:         '#F5F0EA',
        terracotta:    '#C97B5A',
        'terra-light': '#E8A882',
        'terra-pale':  '#F2DDD0',
        charcoal:      '#2C2A27',
        muted:         '#9B9589',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body:    ['Inter', 'sans-serif'],
      },
    }
  }
};