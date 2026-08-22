# Documentation complète — GESTIONVCA (StoreManager Pro)

## 1. Vue d'ensemble

GESTIONVCA est une application de gestion commerciale (ERP léger) pour une boutique au Sénégal, couvrant à terme quatre domaines : ventes (POS), dettes clients, approvisionnements fournisseurs, et catalogue produits/tiers. Seul le module **POS (Ventes)** est aujourd'hui fonctionnel de bout en bout ; les autres écrans existent visuellement mais n'ont pas encore de contrôleur.

Le projet est écrit en **PHP orienté objet avec autoload Composer** (pas de framework, mais chaque classe est chargée automatiquement via l'autoloader PSR-4 de Composer — plus aucun `require_once` entre classes), avec une base **PostgreSQL** en cible principale et un **repli automatique vers SQLite** si PostgreSQL est injoignable.

Toutes les classes vivent sous l'espace de noms racine `PapeMohidineMbaye\Code\`, un sous-namespace par dossier de `src/` (voir §9bis).

### Architecture en couches

```
public/index.php                    → point d'entrée HTTP unique (require vendor/autoload.php)
    └─ Core\Router                  → aiguille l'URL vers un contrôleur
         └─ Controller\PosController
              ├─ Repository\*Repository   (accès SQL, retourne des entités)
              ├─ Service\VenteService     (logique métier : panier de session)
              └─ src/view/StoreManager.html.php    (affichage, reçoit les données déjà prêtes)
Entity\*                            → objets porteurs de données (aucune logique, aucun SQL)
Core\Database                       → connexion PDO unique (Singleton)
```

Chaque couche a une responsabilité unique :
- **entity** : représente une ligne de table, rien d'autre (constructeur + getters).
- **repository** : traduit des besoins métier en requêtes SQL, retourne des entités ou des tableaux associatifs.
- **service** : logique métier qui ne relève pas d'une seule requête SQL (ici, le panier de vente en session).
- **controller** : reçoit la requête HTTP, orchestre repository + service, transmet des variables prêtes à la vue.
- **view** : affichage pur, ne fait ni SQL ni calcul métier.

---

## 2. Schéma de base de données

Onze tables, définies dans `docs/schema/schema.sql` :

| Table | Colonnes clés | Rôle |
|---|---|---|
| `roles` | `id`, `nom` | Rôles utilisateurs (Admin, Vendeur, Gestionnaire de Stock) |
| `utilisateurs` | `id`, `nom`, `email`, `mot_de_passe`, `role_id` | Comptes internes |
| `clients` | `id`, `nom`, `prenom` | Clients de la boutique |
| `produits` | `id`, `nom`, `prix_unitaire`, `stock_quantite` | Catalogue produits |
| `fournisseurs` | `id`, `nom`, `telephone` | Fournisseurs |
| `commandes` | `id`, `num_cmde`, `montant_total`, `montant_verse`, `mode_paiement`, `client_id`, `utilisateur_id` | Ventes |
| `lignes_commande` | `commande_id`, `produit_id`, `quantite`, `prix_unitaire` | Détail d'une vente |
| `dettes` | `client_id`, `montant_initial`, `montant_restant` | Crédit client |
| `reglements` | `dette_id`, `date`, `montant` | Remboursements de dette |
| `bons_livraison` | `ref_bl`, `date_reception`, `valeur_lot`, `statut`, `fournisseur_id` | Réceptions fournisseur |
| `lignes_bon_livraison` | `bon_livraison_id`, `produit_id`, `quantite`, `prix_achat` | Détail d'une réception |

Aucune colonne `statut` n'existe sur `commandes` : le statut (Payé / Avance / Crédit) est **calculé en SQL** à chaque lecture (`CASE WHEN` dans `CommandeRepository::getCommandesRecentes()`), jamais stocké — pour ne jamais avoir une valeur figée qui se désynchronise du couple `montant_total` / `montant_verse`.

---

## 3. Point d'entrée : `public/index.php`

```php
<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use PapeMohidineMbaye\Code\Core\Router;

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

new Router();
```

**Utilité** : c'est l'unique fichier accessible depuis le navigateur (front controller). Il charge l'autoloader Composer (qui rend disponible **toutes** les classes du projet, plus besoin de `require_once` par classe), importe `Router` via `use`, ouvre la session PHP si elle n'existe pas encore (nécessaire au panier de vente, voir §6), puis instancie `Router`, dont le constructeur déclenche immédiatement le traitement de la requête. Aucune autre logique ne doit vivre ici.

### 3bis. Autoload Composer (`composer.json`)

```json
{
    "name": "pape-mohidine-mbaye/code",
    "autoload": {
        "psr-4": {
            "PapeMohidineMbaye\\Code\\": "src/"
        }
    }
}
```

Cette règle **PSR-4** dit à Composer : "pour trouver la classe `PapeMohidineMbaye\Code\Repository\ClientRepository`, retire le préfixe `PapeMohidineMbaye\Code\`, ce qui donne `Repository\ClientRepository`, puis cherche ce chemin sous `src/`" → `src/Repository/ClientRepository.php`. Deux règles à respecter partout dans le projet pour que ça fonctionne :
- le nom du **dossier** doit correspondre exactement (majuscule/minuscule comprise) au segment de namespace (`Repository/`, pas `repository/`) ;
- le nom du **fichier** doit correspondre exactement au nom de la **classe** qu'il contient (`ClientRepository.php` contient `class ClientRepository`).

C'est pour cette deuxième raison que les fichiers d'entité ont été renommés (`Cients.php` → `Client.php`, `Produits.php` → `Produit.php`, etc.) : avant Composer, le nom de fichier pouvait diverger du nom de classe puisque c'est le développeur qui écrivait le `require_once` avec le bon chemin ; avec l'autoload PSR-4, c'est Composer qui déduit seul le chemin à partir du nom de classe, donc les deux noms doivent être identiques.

---

## 4. `src/core/Database.php` — connexion unique (Singleton)

```php
class Database
{
    private static ?PDO $connexion = null;

    private function __construct() {}

    public static function getConnexion(): PDO
    {
        if (self::$connexion === null) {
            try {
                self::$connexion = new PDO("pgsql:host=localhost;port=5432;dbname=gestvca", "postgres", "motdepasse");
            } catch (PDOException $e) {
                self::$connexion = new PDO("sqlite:" . dirname(__DIR__, 2) . "/erp.db");
            }
            self::$connexion->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            self::$connexion->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        }
        return self::$connexion;
    }
}
```

| Élément | Utilité |
|---|---|
| `private static ?PDO $connexion` | Unique exemplaire de connexion partagé par tout le script — évite d'ouvrir une connexion PDO par requête SQL. |
| `private function __construct()` | Interdit `new Database()` : personne ne doit pouvoir créer une deuxième instance. C'est **la** caractéristique du patron Singleton. |
| `getConnexion(): PDO` (statique) | Point d'accès unique : si aucune connexion n'existe encore, tente PostgreSQL, puis SQLite en repli si PostgreSQL échoue (`catch (PDOException $e)`). Configure ensuite le mode d'erreur (`ERRMODE_EXCEPTION` : toute erreur SQL lève une exception au lieu de renvoyer silencieusement `false`) et le mode de récupération par défaut (`FETCH_ASSOC` : chaque ligne devient un tableau associatif `['colonne' => valeur]`). |

**Pourquoi c'était le bug racine des erreurs précédentes** : tout le reste du code appelait à tort `new Database()` puis `$database->executeQuery(...)`, deux méthodes qui n'existent pas sur cette classe. La correction a consisté à faire en sorte qu'*aucune* classe n'instancie jamais `Database` : chacune appelle directement `Database::getConnexion()` pour obtenir l'objet `PDO` et utilise les méthodes standard de PDO (`prepare`, `execute`, `fetch`, `fetchAll`, `fetchColumn`, `beginTransaction`, `commit`, `rollBack`).

---

## 5. `src/core/Router.php` — aiguillage des requêtes

```php
class Router
{
    private array $routes = [
        '/' => ['controller' => 'PosController', 'action' => 'traiter'],
        '/pos' => ['controller' => 'PosController', 'action' => 'traiter'],
    ];

    public function __construct() { $this->dispatch(); }

    private function dispatch(): void { ... }
    private function creerControleur(string $controllerClass): object { ... }
}
```

| Méthode | Utilité |
|---|---|
| `__construct()` | Appelle immédiatement `dispatch()` — instancier un `Router` suffit à traiter la requête en cours ; c'est pourquoi `index.php` se contente de `new Router();`. |
| `dispatch()` | Lit `$_SERVER['REQUEST_URI']`, en extrait le chemin (`parse_url(..., PHP_URL_PATH)`, pour ignorer la query string), vérifie qu'une route existe pour ce chemin, instancie le bon contrôleur, vérifie que l'action demandée existe (`method_exists`), puis l'appelle. Chaque étape manquante affiche un message d'erreur explicite (`page introuvable`, `controller introuvable`, `action introuvable`) plutôt que de planter silencieusement. |
| `creerControleur()` | Fabrique explicitement dépendant du nom de classe — un `match` associe chaque nom de contrôleur à sa construction. Centralise les dépendances de chaque contrôleur à un seul endroit. |

**Deux routes vers la même action** (`/` et `/pos`) permettent d'accéder au POS aussi bien à la racine du site que via `/pos`, ce qui correspond à l'`action="/pos"` déjà écrite dans les formulaires de la vue.

---

## 6. `src/controller/PosController.php` — le chef d'orchestre

```php
class PosController
{
    private ClientRepository $clientRepository;
    private ProduitRepository $produitRepository;
    private CommandeRepository $commandeRepository;
    private VenteService $venteService;

    public function __construct() { ... }
    public function traiter(): void { ... }
    private function ajouterAuPanier(): ?array { ... }
    private function retirerDuPanier(): ?array { ... }
    private function viderPanier(): ?array { ... }
    private function confirmerVente(): array { ... }
    private function afficherVue(?array $message): void { ... }
}
```

| Méthode | Utilité |
|---|---|
| `__construct()` | Instancie les trois repositories et le service dont ce contrôleur a besoin. Aucun argument requis (chaque dépendance sait se connecter elle-même à la base via `Database::getConnexion()`). |
| `traiter()` (publique, appelée par le `Router`) | Point d'entrée unique de toute requête `/pos`. Si la requête est un `POST`, mémorise d'abord le client sélectionné en session (quel que soit le formulaire soumis), puis dispatche sur `$_POST['action']` via un `match` : `add_to_cart`, `remove_from_cart`, `clear_cart`, `create_order`. Termine toujours par `afficherVue()`, qu'il y ait eu un POST ou non. |
| `ajouterAuPanier()` | Lit `produit_id` et `quantite` du formulaire, valide qu'ils sont positifs, délègue l'ajout réel à `VenteService::ajouterAuPanier()`. Ne touche jamais à la session directement — le contrôleur ne connaît que le service. |
| `retirerDuPanier()` | Lit `produit_id`, délègue à `VenteService::retirerDuPanier()`. |
| `viderPanier()` | Délègue à `VenteService::viderPanier()` (non branchée à un bouton dans la vue actuelle, mais prête à l'emploi). |
| `confirmerVente()` | Lit `client_id`, `mode_reglement`, `montant_verse`, appelle `VenteService::confirmerVente()` dans un `try/catch` — en cas d'échec (stock insuffisant, produit supprimé entre-temps, panier vide), l'exception est transformée en message d'erreur affichable plutôt que de faire planter la page. |
| `afficherVue()` | Recharge systématiquement tout ce dont la vue a besoin après chaque action (clients, produits, commandes récentes, panier détaillé, total du panier, client sélectionné, lignes de chaque commande pour les tiroirs de détail), puis fait un `require` de la vue. Comme `require` partage le scope de la méthode courante, toutes ces variables locales deviennent directement visibles dans `StoreManager.html.php` sans avoir besoin de les passer explicitement. |

**Pourquoi le contrôleur ne fait jamais de SQL lui-même** : il ne connaît que des repositories et un service. S'il fallait changer de moteur de base de données ou de stratégie de panier, aucune ligne de `PosController` n'aurait à changer.

---

## 7. `src/repository/*.php` — accès aux données

### 7.1 `ClientRepository.php`

| Méthode | Utilité |
|---|---|
| `getAllClients(): array` | Retourne tous les clients triés par nom/prénom, sous forme de tableau d'objets `Client`. |
| `getClientById(int $id): ?Client` | Retourne un client précis ou `null` s'il n'existe pas — le type de retour nullable (`?Client`) oblige l'appelant à gérer explicitement le cas absent. |
| `mapToClient(array $ligne): Client` (privée) | Traduit une ligne PDO brute (`['id'=>.., 'nom'=>.., 'prenom'=>..]`) en objet `Client`. Centralise cette conversion à un seul endroit : si la structure de la table change, un seul point à corriger. |

### 7.2 `ProduitRepository.php`

Même structure que `ClientRepository`, pour la table `produits` : `getAllProduits()`, `getProduitById()`, `mapToProduit()`.

### 7.3 `FournisseurRepository.php`

Même principe, avec en plus les opérations d'écriture simples (le catalogue Fournisseurs n'a pas encore de contrôleur, mais le repository est prêt) :

| Méthode | Utilité |
|---|---|
| `creerFournisseur()` | `INSERT ... RETURNING id`, retourne l'identifiant généré directement via `fetchColumn()` sur la clause `RETURNING` (nécessaire car `lastInsertId()` de PDO n'est pas fiable avec PostgreSQL). |
| `modifierFournisseur()` / `supprimerFournisseur()` | `UPDATE` / `DELETE` classiques. |

### 7.4 `CommandeRepository.php` — le plus complexe

| Méthode | Utilité |
|---|---|
| `creerCommande(int $clientId, ?int $utilisateurId, string $modeReglement, float $montantVerse, array $lignes): int` | **Seul point d'écriture d'une vente en base.** Ouvre une transaction (`beginTransaction()`), insère la commande avec un total provisoire de 0, puis pour chaque ligne du panier : relit le prix courant du produit *en base* (jamais celui qui aurait pu être envoyé par le formulaire — protection contre la manipulation côté client), insère la ligne, décrémente le stock avec une clause `WHERE stock_quantite >= :quantite` qui empêche mathématiquement un stock négatif même en cas de vente concurrente. Si `rowCount() === 0` après ce décrément (stock insuffisant), lève une exception. Met enfin à jour le numéro de commande (`CMD-<id>`) et le montant total réel calculé serveur, puis `commit()`. Toute exception déclenche `rollBack()` avant d'être relancée — la commande, ses lignes et le stock restent alors inchangés, comme si rien ne s'était passé. |
| `getCommandesRecentes(int $limite = 20): array` | Requête avec jointure `clients`, calcule `montant_restant` et `statut` (`CASE WHEN`) directement en SQL, pour alimenter le registre des ventes de la vue. |
| `getLignesCommande(int $commandeId): array` | Détail (produit, quantité, prix, sous-total) d'une commande précise, pour le tiroir "Lignes" de chaque ligne du registre. |

### 7.5 Pourquoi les repositories ne reçoivent jamais `Database` en paramètre

Chaque méthode appelle `Database::getConnexion()` elle-même. C'est cohérent avec un Singleton : il n'y a qu'une seule connexion possible dans tout le programme, donc il n'y a aucune raison de l'injecter de classe en classe — chaque classe qui en a besoin va simplement la chercher.

---

## 8. `src/service/VenteService.php` — le panier de vente

C'est la pièce centrale de la demande « panier en session, confirmation avant écriture en base ».

```php
class VenteService
{
    private const CLE_PANIER = 'panier_vente';
    private const CLE_CLIENT = 'panier_vente_client_id';

    public function ajouterAuPanier(int $produitId, int $quantite): void { ... }
    public function retirerDuPanier(int $produitId): void { ... }
    public function viderPanier(): void { ... }
    public function panierEstVide(): bool { ... }
    public function setClientSelectionne(int $clientId): void { ... }
    public function getClientSelectionne(): ?int { ... }
    public function getPanierDetaille(): array { ... }
    public function getMontantTotalPanier(): float { ... }
    public function confirmerVente(int $clientId, ?int $utilisateurId, string $modeReglement, float $montantVerse): int { ... }
}
```

| Méthode | Utilité |
|---|---|
| `__construct()` | Initialise `$_SESSION['panier_vente']` à un tableau vide s'il n'existe pas encore — évite un avertissement PHP au tout premier accès. |
| `ajouterAuPanier(produitId, quantite)` | Le panier de session est un tableau **`produit_id => quantité cumulée`**, pas une liste de lignes. Ajouter deux fois le même produit additionne simplement les quantités (`$panier[$produitId] = ($panier[$produitId] ?? 0) + $quantite;`) au lieu de créer deux lignes distinctes. |
| `retirerDuPanier(produitId)` | `unset()` de la clé correspondante. |
| `viderPanier()` | Remet `$_SESSION['panier_vente']` à `[]`. Appelée automatiquement après une vente confirmée avec succès. |
| `panierEstVide()` | Utilisée par `confirmerVente()` pour refuser une confirmation à vide, et par la vue pour désactiver le bouton "Valider la Vente" tant qu'aucun article n'a été ajouté. |
| `setClientSelectionne()` / `getClientSelectionne()` | Le client choisi est mémorisé en session séparément du panier, pour ne pas se perdre entre deux ajouts d'articles (qui rechargent la page). |
| `getPanierDetaille(): array` | **Ne fait jamais confiance à la session pour le nom ou le prix.** Pour chaque `produit_id` en session, relit l'entité `Produit` courante via `ProduitRepository::getProduitById()` et calcule le sous-total à la volée. Si un produit a été supprimé entre-temps, il est simplement ignoré (`continue`) plutôt que de faire planter l'affichage. C'est ce tableau enrichi qui est transmis à la vue pour afficher le tableau du panier. |
| `getMontantTotalPanier(): float` | Additionne les `sous_total` de `getPanierDetaille()`. |
| `confirmerVente(...)` | Refuse si le panier est vide (`panierEstVide()`). Sinon, transforme le panier de session (`produit_id => quantité`) en tableau de lignes `[['produit_id'=>.., 'quantite'=>..], ...]` attendu par `CommandeRepository::creerCommande()`, l'appelle, puis vide le panier **seulement si l'insertion a réussi** (le `viderPanier()` est après l'appel, donc jamais atteint si une exception est levée avant). |

**Pourquoi cette logique n'est pas dans le contrôleur ni dans le repository** : ajouter/retirer un article, calculer un total, décider quand vider le panier — tout cela est de la **règle métier** (« qu'est-ce qu'une vente en cours ? »), pas de l'persistance (rôle du repository) ni de la gestion HTTP (rôle du contrôleur). Séparer cette couche permet, par exemple, de réutiliser exactement la même logique de panier depuis une autre interface (une API mobile, par exemple) sans dupliquer le calcul du total ou la règle « on ne confirme jamais un panier vide ».

---

## 9. `src/entity/*.php` — les 11 classes de description

Toutes suivent exactement le même moule : propriétés `private` typées, un constructeur qui les initialise toutes, un getter par propriété, **aucune méthode de calcul, aucun accès SQL**. Tableau récapitulatif :

| Fichier | Classe | Propriétés | Particularité |
|---|---|---|---|
| `Cients.php` | `Client` | id, nom, prenom | — |
| `Produits.php` | `Produit` | id, nom, prixUnitaire, stockQuantite | — |
| `Fournisseurs.php` | `Fournisseur` | id, nom, telephone | — |
| `Commandes.php` | `Commande` | id, numCmde, dateCommande, dateLimite, montantTotal, montantVerse, montantRestant, statut, modePaiement, clientId, utilisateurId | `montantRestant` et `statut` sont **reçus du SQL**, pas recalculés en PHP (choix acté après discussion : les calculs dérivés vivent en base). |
| `LignesCommande.php` | `LigneCommande` | id, commandeId, produitId, quantite, prixUnitaire, sousTotal | `sousTotal` idem, fourni par le SQL. |
| `Dettes.php` | `Dette` | id, clientId, montantInitial, montantRestant, montantRembourse | idem. |
| `Reglements.php` | `Reglement` | id, detteId, date, montant | — |
| `BonsLivraison.php` | `BonLivraison` | id, refBl, dateReception, valeurLot, statut, fournisseurId, utilisateurId | — |
| `LignesBonLivraison.php` | `LigneBonLivraison` | id, bonLivraisonId, produitId, quantite, prixAchat, sousTotal | idem. |
| `Roles.php` | `Role` | id, nom | — |
| `Utilisateurs.php` | `Utilisateur` | id, nom, email, motDePasse, roleId | Le mot de passe est stocké tel que reçu de la base — la vérification (`password_verify`/`crypt`) se fait en SQL ou dans un futur `AuthService`, jamais dans l'entité elle-même. |

**Historique** : ces fichiers portaient auparavant le nom pluriel de la table (`Cients.php`, `Produits.php`, `Fournisseurs.php`...) alors que la classe porte le nom singulier d'une instance de cette table. Depuis le passage à l'autoload PSR-4 de Composer (§3bis), fichier et classe doivent porter exactement le même nom — les fichiers ont donc été renommés en conséquence (`Client.php`, `Produit.php`, `Fournisseur.php`, `Commande.php`, `Dette.php`, `Reglement.php`, `Role.php`, `Utilisateur.php`, `LigneCommande.php`, `LigneBonLivraison.php`, `BonLivraison.php`).

---

## 10. `src/view/StoreManager.html.php` — la vue

Fichier unique contenant les cinq écrans de l'application (Dashboard, POS, Dettes, Approvisionnements, Catalogue), affichés/masqués côté client par JavaScript (`switchView()`). Seul l'écran **POS** est aujourd'hui alimenté par PHP ; les quatre autres restent en données statiques.

### 10.1 Ce qui est dynamique dans le module POS

| Élément | Alimenté par |
|---|---|
| `<select name="client_id">` | Boucle `foreach ($clients as $client)`, option pré-sélectionnée selon `$clientSelectionne` (mémorisé en session). |
| `<select name="produit_id">` (article à ajouter) | Boucle `foreach ($produits as $produit)`, pastille 🟢🟡🔴 calculée depuis `getStockQuantite()`, option désactivée si stock ≤ 0. |
| Tableau du panier | Boucle `foreach ($panier as $ligne)` — reflet **exact** de `VenteService::getPanierDetaille()}`, avec un mini-formulaire `🗑️` par ligne (`action=remove_from_cart`). |
| Montant total affiché | `number_format($panierTotal, ...)`, calculé serveur, plus aucun calcul JavaScript. |
| Registre général des ventes | Boucle `foreach ($commandes as $commande)`, badge coloré selon `$commande['statut']`, tiroir de détail alimenté par `$lignesParCommande[$commande['id']]`. |
| Toast de retour | `<?php if (!empty($message)): ?>` — affiche `$message['type']` (`success`/`danger`) et `$message['texte']` renvoyés par le contrôleur. |

### 10.2 Les trois formulaires du POS

1. **Ajout au panier** — `method="POST" action="/pos"`, `action` caché = `add_to_cart`, contient le select client, le select produit et la quantité. Chaque soumission recharge la page.
2. **Retrait d'une ligne** — un formulaire minuscule par ligne du panier, `action` caché = `remove_from_cart` + `produit_id` caché.
3. **Confirmation de la vente** — `id="order-confirm-form"`, `action` caché = `create_order`, contient un `client_id` caché (recopié depuis la session pour ne pas dépendre du formulaire 1), le mode de règlement et le montant versé. Bouton désactivé (`disabled`) tant que `$panier === []`.

Aucun de ces formulaires ne s'appuie plus sur le tableau JavaScript `cart` d'origine (celui-ci a été retiré du flux, même si quelques fonctions mortes subsistent dans le `<script>` — voir §12).

---

## 11. Flux complet d'une vente, étape par étape

1. L'utilisateur ouvre `/pos` → `Router` → `PosController::traiter()` → requête `GET`, aucune action → `afficherVue(null)` → panier vide affiché.
2. Il choisit un produit et une quantité, clique sur `+` → `POST /pos`, `action=add_to_cart` → `PosController::ajouterAuPanier()` → `VenteService::ajouterAuPanier()` écrit dans `$_SESSION['panier_vente']` → la page se recharge, `afficherVue()` relit la session via `getPanierDetaille()` (avec le prix **actuel** du produit) et affiche la ligne.
3. Il répète pour d'autres articles — chaque ajout est un aller-retour serveur complet, jamais un calcul client-side.
4. Il clique sur `🗑️` sur une ligne → `POST /pos`, `action=remove_from_cart` → `unset()` de la clé en session → rechargement.
5. Il choisit le mode de règlement, ajuste le montant versé, clique sur "Valider la Vente" → `POST /pos`, `action=create_order` → `PosController::confirmerVente()` → `VenteService::confirmerVente()` :
   - transforme la session en tableau de lignes,
   - appelle `CommandeRepository::creerCommande()` **(seul moment où la base est écrite)**,
   - qui ouvre une transaction, insère la commande, relit chaque prix en base, insère chaque ligne, décrémente le stock sous garde, calcule le vrai total, `commit()`,
   - si tout réussit, `VenteService` vide le panier de session.
6. `afficherVue()` est rappelée une dernière fois : panier vide, toast de succès, registre des ventes mis à jour avec la nouvelle commande.

Si une erreur survient à l'étape 5 (stock insuffisant, produit supprimé) : `rollBack()` annule tout en base, l'exception remonte jusqu'à `PosController::confirmerVente()` qui la transforme en toast rouge, **le panier de session n'est pas vidé** — l'utilisateur peut corriger et retenter sans tout ressaisir.

---

## 12. Éléments encore incomplets ou à surveiller

- **Dashboard, Dettes, Approvisionnements, Catalogue** : maquettes statiques, aucun contrôleur ni repository branché.
- **`FournisseurRepository`** : prêt mais non utilisé (aucun contrôleur ne l'appelle encore).
- **Fonctions JS `addToCart()` / `renderCart()` / `removeCartItem()`** : mortes (plus aucun `onclick` ne les appelle), laissées en place pour ne pas casser le reste du `<script>`, à supprimer lors d'un nettoyage.
- **`FOR UPDATE`** retiré de `CommandeRepository::creerCommande()` pour compatibilité SQLite (repli automatique) — en PostgreSQL pur, la clause `WHERE stock_quantite >= :quantite` empêche un stock négatif mais laisse une fenêtre de compétition théorique entre deux ventes strictement simultanées sur le même produit.
- **Authentification** : `Utilisateur::verifierMotDePasse()` mentionné dans les versions antérieures a été retiré des entités (aucun calcul dans l'entité) ; aucun `AuthController`/`AuthService` n'existe encore dans ce projet.

---

## 13. Étude comparative : cette architecture (POO) vs une écriture procédurale équivalente

### 13.1 Ce que ferait une version procédurale du même module POS

Une version procédurale typique regrouperait tout dans un ou deux fichiers, par exemple `pos.php`, avec des fonctions libres (`get_all_clients($pdo)`, `get_all_produits($pdo)`, `ajouter_au_panier($produit_id, $quantite)`, `creer_commande($pdo, $client_id, ...)`) et des tableaux associatifs partout au lieu d'objets `Client`/`Produit`. Le panier serait un tableau `$_SESSION['panier']` manipulé directement dans le script qui traite le formulaire, sans couche intermédiaire.

### 13.2 Comparaison point par point

| Critère | Version POO (ce projet) | Version procédurale équivalente |
|---|---|---|
| **Organisation du code** | Une classe = une responsabilité (entité, accès données, règle métier, HTTP, affichage) réparties dans des fichiers dédiés. | Tout peut techniquement tenir dans un seul fichier ; l'organisation dépend entièrement de la discipline du développeur, rien ne l'impose. |
| **Protection des données** | `private` sur chaque propriété d'entité : un `Produit` ne peut pas voir son prix modifié de l'extérieur autrement que par un nouveau constructeur — aucune fonction ailleurs dans le code ne peut corrompre silencieusement un objet déjà créé. | Un tableau `$produit['prix_unitaire']` est modifiable depuis n'importe quel point du script qui y a accès ; rien n'empêche une fonction mal écrite de le changer par erreur. |
| **Dépendances explicites** | `PosController` déclare avoir besoin de `ClientRepository`, `ProduitRepository`, `CommandeRepository`, `VenteService` dans son constructeur — on sait exactement, à la lecture d'une seule méthode, tout ce dont ce contrôleur dépend. | Les fonctions procédurales dépendent souvent de variables globales (`global $pdo;`) ou reçoivent la connexion en paramètre partout, sans qu'un seul endroit ne liste "de quoi ce fichier a besoin". |
| **Réutilisation** | `VenteService` peut être appelé depuis n'importe quel futur contrôleur (une API, un `AdminController`) sans dupliquer la logique du panier. | Réutiliser `ajouter_au_panier()` ailleurs suppose de l'inclure (`require`) avec toutes ses dépendances implicites (la fonction suppose-t-elle que `$pdo` existe déjà en global ? que la session est démarrée ?) — plus fragile. |
| **Testabilité** | On peut instancier `VenteService` seul (avec une session simulée) et tester `ajouterAuPanier()`/`confirmerVente()` indépendamment de tout contrôleur ou de toute vue. | Tester une fonction procédurale isolée demande souvent de recréer tout le contexte global (connexion, session, éventuellement d'autres fonctions dont elle dépend implicitement) — plus difficile à isoler. |
| **Évolution du schéma** | Si `produits` gagne une colonne, un seul endroit change : `ProduitRepository::mapToProduit()` + le constructeur de `Produit`. Tout le reste du code (contrôleur, service, vue) continue de fonctionner via les getters existants. | Le tableau associatif `$produit` circule tel quel dans tout le script ; une colonne renommée ou retirée peut casser silencieusement n'importe quel `$produit['ancien_nom']` disséminé dans le code, sans qu'aucune erreur ne survienne avant l'exécution de cette ligne précise. |
| **Lisibilité pour un nouvel arrivant** | La séparation en dossiers (`entity/`, `repository/`, `service/`, `controller/`, `view/`) indique immédiatement où chercher une information donnée. | Nécessite de lire tout le fichier (ou les commentaires) pour comprendre où se trouve quoi ; la structure n'est pas auto-documentée. |
| **Verbosité / courbe d'apprentissage** | Plus de fichiers, plus de classes à écrire pour un même résultat fonctionnel ; demande de comprendre l'injection de dépendances, l'encapsulation, les types nullable. | Plus rapide à écrire pour un script court ; accessible immédiatement sans notion de POO. |
| **Performance** | Négligeable en pratique ici : l'instanciation d'objets PHP est très peu coûteuse comparée au temps d'une requête SQL ou réseau. | Identique en pratique — aucun avantage réel de performance pour une application de cette taille. |
| **Risque de duplication** | Le calcul du sous-total, la relecture du prix en base, la structure d'une entité : chacun n'existe qu'à un seul endroit. | Sans discipline, le même calcul (`quantite * prix_unitaire`) ou la même requête SQL a tendance à être recopié à plusieurs endroits du script au fil des ajouts de fonctionnalités. |
| **Adapté à ce projet précisément** | Justifié dès que plusieurs écrans (POS, Dettes, Approvisionnements, Catalogue) doivent partager les mêmes entités (`Client`, `Produit`) et, potentiellement, la même logique métier. | Resterait raisonnable si l'application ne comportait qu'un seul écran simple sans perspective d'extension — ce qui n'est pas le cas ici (quatre autres modules restent à construire). |

### 13.3 Conclusion

Pour un script isolé et jetable, l'approche procédurale reste plus rapide à écrire et à comprendre d'un seul coup d'œil. Mais dès qu'un projet doit **grandir** (ajouter Dettes, Approvisionnements, Catalogue, potentiellement une authentification par rôle) et **partager des données entre écrans** (le même `Produit` est vendu en POS, réceptionné en Approvisionnement, listé au Catalogue), la séparation en couches de l'approche POO évite que chaque nouvel écran ne réinvente sa propre façon de représenter un client ou un produit, et limite l'effet de bord d'une modification à une seule classe plutôt qu'à des recherches-remplacements hasardeux dans un gros fichier procédural. C'est ce compromis — un peu plus de code au départ contre une bien meilleure tenue dans le temps — qui justifie l'architecture retenue pour GESTIONVCA.