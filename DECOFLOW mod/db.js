// ─── Configuration ────────────────────────────────────────────────────────────

// Détection de l'environnement pour cibler la bonne API (Vercel ou Local)
const BASE_API_URL = typeof window !== 'undefined' && !window.location.hostname.includes('localhost')
  ? `${window.location.origin}/api`
  : 'http://localhost:3000';

const API_URL     = `${BASE_API_URL}/utilisateurs`;
const CLE_SESSION = 'decoflow_session';

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

export async function trouverUtilisateurParEmail(email) {
  try {
    const reponse = await fetch(
      `${API_URL}?email=${encodeURIComponent(email.toLowerCase().trim())}`
    );
    if (!reponse.ok) throw new Error('Erreur lors de la récupération');
    const utilisateurs = await reponse.json();
    return utilisateurs.length > 0 ? utilisateurs[0] : null;
  } catch (erreur) {
    console.error('Erreur db.js (trouverUtilisateurParEmail) :', erreur);
    return null;
  }
}

export async function recupererTousLesUtilisateurs() {
  try {
    const reponse = await fetch(API_URL);
    if (!reponse.ok) throw new Error('Erreur lors de la récupération');
    return await reponse.json();
  } catch (erreur) {
    console.error('Erreur db.js (recupererTousLesUtilisateurs) :', erreur);
    return [];
  }
}

export async function ajouterUtilisateur(nouvelUtilisateur) {
  try {
    const reponse = await fetch(API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(nouvelUtilisateur)
    });
    if (!reponse.ok) throw new Error("Erreur lors de l'enregistrement");
    return await reponse.json();
  } catch (erreur) {
    console.error('Erreur db.js (ajouterUtilisateur) :', erreur);
    throw erreur;
  }
}

export async function modifierUtilisateur(id, donnees) {
  try {
    const reponse = await fetch(`${API_URL}/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(donnees)
    });
    if (!reponse.ok) throw new Error('Erreur lors de la modification');
    return await reponse.json();
  } catch (erreur) {
    console.error('Erreur db.js (modifierUtilisateur) :', erreur);
    throw erreur;
  }
}

export async function modifierRoleUtilisateur(id, nouveauRole) {
  return modifierUtilisateur(id, { role: nouveauRole });
}

export async function supprimerUtilisateur(id) {
  try {
    const reponse = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!reponse.ok) throw new Error('Erreur lors de la suppression');
    return true;
  } catch (erreur) {
    console.error('Erreur db.js (supprimerUtilisateur) :', erreur);
    throw erreur;
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function lireSession() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  
  var donnees = localStorage.getItem(CLE_SESSION);
  if (!donnees) return null;
  try { return JSON.parse(donnees); }
  catch (e) { return null; }
}

export function sauvegarderSession(donneesSession) {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(CLE_SESSION, JSON.stringify(donneesSession));
  }
}

export function supprimerSession() {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem(CLE_SESSION);
  }
}

export function lireRoleSession() {
  var session = lireSession();
  return session ? session.role : null;
}