# DEVLOG — Journal de développement

## 15/08/2026 — Création des entités

### Objectif

Traduire le schéma PostgreSQL (ventes, approvisionnement, dettes) en classes de description POO, dans le même style que le projet GestElèves déjà converti.

### Travail réalisé

Création des fichiers dans `src/entity/` :

```
Role.php
Utilisateur.php
Client.php
Produit.php
Fournisseur.php
Commande.php
LigneCommande.php
Dette.php
Reglement.php
BonLivraison.php
LigneBonLivraison.php
```


### Fonctionnement
 Les entités redeviennent de simples porteurs de données — constructeur + getters uniquement. Chaque valeur dérivée (`montant_restant`, `statut`, `sous_total`, `montant_rembourse`) est désormais reçue toute faite depuis la base de données (colonne calculée ou `CASE WHEN` dans la requête SQL), au lieu d'être recalculée en PHP.

### Notions apprises

* Séparation classes de description / classes avec fonctions : une entité ne doit jamais savoir comment elle est persistée.
* Une donnée dérivée peut être portée soit par une méthode PHP, soit par le SQL — le choix se répercute directement sur la forme du constructeur (nombre de paramètres reçus).