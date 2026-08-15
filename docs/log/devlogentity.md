
### Fonctionnement

Certaines valeurs ne sont pas stockées en base mais calculées par l'objet lui-même à partir de son propre état :

* `Commande::getStatut()` → Payé / En Attente / En Retard, déduit de `montant_total`, `montant_verse` et `date_limite`.
* `Commande::getMontantRestant()` → `montant_total - montant_verse`.
* `Dette::getMontantRembourse()` / `estSoldee()` → même logique côté dettes.
* `Produit::estEnRupture()` / `estStockFaible()` → pour les futures alertes de stock.

Le mot de passe de `Utilisateur` reste privé et n'est vérifiable que via `verifierMotDePasse()` (`password_verify`), jamais lu directement.

Point soulevé ensuite : les données viendront de PostgreSQL, donc certaines écritures touchent plusieurs tables et doivent être transactionnelles :

1. Création d'une commande → `commandes` + `lignes_commande` + décrément `produits.stock_quantite`.
2. Création d'un bon de livraison → `bons_livraison` + `lignes_bon_livraison` + incrément `produits.stock_quantite`.
3. Enregistrement d'un règlement → `reglements` + décrément `dettes.montant_restant`.

Décision : ajouter `beginTransaction()` / `commit()` / `rollBack()` à `Database.php` (absents actuellement), et faire porter chaque opération multi-tables par le Repository correspondant dans un bloc `try / beginTransaction / commit / catch → rollBack`.

Anomalie repérée au passage : `Database::executeUpdate()` utilise `lastInsertId()`, non fiable avec PostgreSQL — à remplacer par `RETURNING id` + `fetch()`.

### Notions apprises

* Séparation classes de description / classes avec fonctions : une entité ne doit jamais savoir comment elle est persistée.
* Une donnée dérivée (statut, montant restant) est une méthode, pas une colonne.
* Une transaction est nécessaire dès qu'une opération métier touche plusieurs tables qui doivent rester synchronisées entre elles.