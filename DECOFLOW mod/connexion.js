import { afficherPageInscription } from './inscription.js';
import { afficherPageDashboard }   from './dashboard.js';
import {
  trouverUtilisateurParEmail,
  sauvegarderSession
} from './db.js';
import {
  estEmailValide,
  afficherErreurChamp,
  afficherAlerte,
  changerTexteErreur,
  animerTremblement
} from './utils.js';

function naviguerApresConnexion(utilisateur) {
  if (window.decoflowRouter && typeof window.decoflowRouter.naviguerVers === 'function') {
    window.decoflowRouter.naviguerVers('dashboard', utilisateur.nom);
    return;
  }
  afficherPageDashboard(utilisateur.nom);
}

function naviguerVersInscription() {
  if (window.decoflowRouter && typeof window.decoflowRouter.naviguerVers === 'function') {
    window.decoflowRouter.naviguerVers('inscription');
    return;
  }
  afficherPageInscription();
}

// ─── Rendu ────────────────────────────────────────────────────────────────────

export function afficherPageConnexion() {
  history.pushState({ page: 'connexion' }, '', '#connexion');

  var conteneurApp = document.getElementById('app');

  document.getElementById('corps-application').className =
    'font-body bg-beige min-h-screen flex items-center justify-center p-4 transition-all duration-300';

  conteneurApp.className = 'w-full max-w-4xl';

  conteneurApp.innerHTML = `
    <div id="page-connexion" class="animer-gauche w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[520px]">

      <div id="panneau-formulaire-connexion" class="w-full md:w-1/2 p-10 flex flex-col justify-center">

        <div class="flex items-center gap-2 mb-8">
          <img src="LOGOD.png" alt="DecoFlow" class="h-9" />
          <span class="font-display text-2xl font-semibold text-charcoal tracking-wide">DecoFlow</span>
        </div>

        <h3 class="font-display text-muted text-sm mb-7">
          Ravi de vous revoir. Veuillez entrer vos identifiants.
        </h3>

        <div id="message-erreur-connexion" class="hidden mb-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
          <span id="texte-erreur-connexion">Email ou mot de passe incorrect.</span>
        </div>
        <div id="message-succes-connexion" class="hidden mb-4 bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg px-4 py-3">
          Connexion réussie ! Redirection en cours…
        </div>

        <form id="formulaire-connexion" novalidate>

          <div class="mb-4">
            <label for="champ-email-connexion" class="block text-xs font-medium text-charcoal mb-1.5 uppercase tracking-wider">Email</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-muted pointer-events-none">
                <i class="fa-regular fa-envelope text-sm"></i>
              </span>
              <input id="champ-email-connexion" name="email" type="email" placeholder="nom@exemple.com" autocomplete="email"
                class="champ w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2.5 text-sm text-charcoal placeholder-gray-400 bg-beige/40 transition" />
            </div>
            <p id="erreur-email-connexion" class="hidden mt-1 text-xs text-red-500">Veuillez entrer un email valide.</p>
          </div>

          <div class="mb-5">
            <div class="flex justify-between items-center mb-1.5">
              <label for="champ-motdepasse-connexion" class="block text-xs font-medium text-charcoal uppercase tracking-wider">Mot de passe</label>
            </div>
            <div class="relative">
              <span class="absolute inset-y-0 left-3 flex items-center text-muted pointer-events-none">
                <i class="fa-solid fa-lock text-sm"></i>
              </span>
              <input id="champ-motdepasse-connexion" name="password" type="password" placeholder="••••••••"
                class="champ w-full border border-gray-200 rounded-lg pl-9 pr-10 py-2.5 text-sm text-charcoal placeholder-gray-400 bg-beige/40 transition" />
              <button id="bouton-voir-motdepasse-connexion" type="button" aria-label="Afficher le mot de passe"
                class="absolute inset-y-0 right-3 flex items-center text-muted hover:text-terracotta transition">
                <i id="icone-oeil-connexion" class="fa-regular fa-eye text-sm"></i>
              </button>
            </div>
            <p id="erreur-motdepasse-connexion" class="hidden mt-1 text-xs text-red-500">Veuillez entrer votre mot de passe.</p>
          </div>

          <button id="bouton-connexion" type="submit"
            class="w-full bg-terracotta hover:bg-terra-light text-white font-medium text-sm py-3 rounded-xl mb-4 flex items-center justify-center transition">
            Se connecter
          </button>

        </form>

        <p class="text-center text-sm text-muted mt-4">
          Nouveau ici ? <a id="lien-vers-inscription" href="#" class="text-terracotta hover:underline font-medium">Créer un compte</a>
        </p>

        <!-- Aide test -->
    

      </div>

      <div class="hidden md:block md:w-1/2 relative overflow-hidden bg-[#C4A882]">
        <img src="CONIM.png" alt="Intérieur DecoFlow" class="absolute inset-0 w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
        <cite class="absolute bottom-8 left-6 text-white/60 text-xl not-italic font-body tracking-wider">
          "L'ordre est le plaisir de la raison."<br>Collection DecoFlow 2024
        </cite>
      </div>

    </div>
  `;

  attacherEcouteursConnexion();
}

// ─── Écouteurs ────────────────────────────────────────────────────────────────

function attacherEcouteursConnexion() {
  var boutonVoir = document.getElementById('bouton-voir-motdepasse-connexion');
  var champMdp   = document.getElementById('champ-motdepasse-connexion');
  var iconeOeil  = document.getElementById('icone-oeil-connexion');

  boutonVoir.addEventListener('click', function() {
    var visible = champMdp.type === 'password';
    champMdp.type = visible ? 'text' : 'password';
    iconeOeil.className = visible
      ? 'fa-regular fa-eye-slash text-sm'
      : 'fa-regular fa-eye text-sm';
  });

  document.getElementById('lien-vers-inscription').addEventListener('click', function(e) {
    e.preventDefault();
    naviguerVersInscription();
  });

  document.getElementById('formulaire-connexion').addEventListener('submit', async function(e) {
    e.preventDefault();

    var emailSaisi = document.getElementById('champ-email-connexion').value;
    var motDePasse = document.getElementById('champ-motdepasse-connexion').value;

    afficherAlerte('message-erreur-connexion', false);
    afficherAlerte('message-succes-connexion', false);
    afficherErreurChamp('erreur-email-connexion', false);
    afficherErreurChamp('erreur-motdepasse-connexion', false);

    var valide = true;

    if (!estEmailValide(emailSaisi)) {
      afficherErreurChamp('erreur-email-connexion', true);
      valide = false;
    }

    if (motDePasse.trim() === '') {
      afficherErreurChamp('erreur-motdepasse-connexion', true);
      valide = false;
    }

    if (!valide) {
      animerTremblement(document.getElementById('formulaire-connexion'));
      return;
    }

    var utilisateur = await trouverUtilisateurParEmail(emailSaisi);

    if (!utilisateur || utilisateur.motDePasse !== motDePasse) {
      changerTexteErreur('texte-erreur-connexion', 'Email ou mot de passe incorrect.');
      afficherAlerte('message-erreur-connexion', true);
      animerTremblement(document.getElementById('formulaire-connexion'));
      return;
    }

    afficherAlerte('message-succes-connexion', true);

    // ← Sauvegarde du rôle dans la session
    sauvegarderSession({
      nom:        utilisateur.nom,
      email:      utilisateur.email,
      entreprise: utilisateur.entreprise,
      role:       utilisateur.role,
      id:         utilisateur.id
    });

    setTimeout(function() {
      naviguerApresConnexion(utilisateur);
    }, 800);
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
