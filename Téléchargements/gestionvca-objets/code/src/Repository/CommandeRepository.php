<?php

namespace PapeMohidineMbaye\Code\Repository;

use PapeMohidineMbaye\Code\Core\Database;
use PapeMohidineMbaye\Code\Entity\Commande;
use PapeMohidineMbaye\Code\Entity\LigneCommande;
use PapeMohidineMbaye\Code\Entity\StatistiquesVentes;
use Exception;
use PDO;

class CommandeRepository
{
    public function creerCommande(
        int $clientId,
        ?int $utilisateurId,
        string $modeReglement,
        float $montantVerse,
        array $lignes
    ): int {
        $connexion = Database::getConnexion();
        $connexion->beginTransaction();

        try {
            $statement = $connexion->prepare(
                "INSERT INTO commandes (num_cmde, montant_total, montant_verse, mode_paiement, client_id, utilisateur_id)
                 VALUES ('EN_COURS', 0, :montant_verse, :mode_paiement, :client_id, :utilisateur_id)
                 RETURNING id"
            );
            $statement->execute([
                'montant_verse' => $montantVerse,
                'mode_paiement' => $modeReglement,
                'client_id' => $clientId,
                'utilisateur_id' => $utilisateurId,
            ]);
            $commandeId = (int) $statement->fetchColumn();

            $montantTotal = 0.0;

            foreach ($lignes as $ligne) {
                $produitId = (int) $ligne['produit_id'];
                $quantite = (int) $ligne['quantite'];

                $prixStatement = $connexion->prepare(
                    "SELECT prix_unitaire FROM produits WHERE id = :id"
                );
                $prixStatement->execute(['id' => $produitId]);
                $produitLigne = $prixStatement->fetch(PDO::FETCH_OBJ);

                if ($produitLigne === false) {
                    throw new Exception("Produit introuvable (id $produitId).");
                }

                $prixUnitaire = (float) $produitLigne->prix_unitaire;
                $montantTotal += $prixUnitaire * $quantite;

                $ligneStatement = $connexion->prepare(
                    "INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire)
                     VALUES (:commande_id, :produit_id, :quantite, :prix_unitaire)"
                );
                $ligneStatement->execute([
                    'commande_id' => $commandeId,
                    'produit_id' => $produitId,
                    'quantite' => $quantite,
                    'prix_unitaire' => $prixUnitaire,
                ]);

                $stockStatement = $connexion->prepare(
                    "UPDATE produits
                     SET stock_quantite = stock_quantite - :quantite
                     WHERE id = :produit_id AND stock_quantite >= :quantite"
                );
                $stockStatement->execute([
                    'quantite' => $quantite,
                    'produit_id' => $produitId,
                ]);

                if ($stockStatement->rowCount() === 0) {
                    throw new Exception("Stock insuffisant pour le produit id $produitId.");
                }
            }

            $majStatement = $connexion->prepare(
                "UPDATE commandes SET num_cmde = :num_cmde, montant_total = :montant_total WHERE id = :id"
            );
            $majStatement->execute([
                'num_cmde' => 'CMD-' . $commandeId,
                'montant_total' => $montantTotal,
                'id' => $commandeId,
            ]);

            $connexion->commit();

            return $commandeId;
        } catch (Exception $e) {
            $connexion->rollBack();
            throw $e;
        }
    }

    public function getStatistiques(): StatistiquesVentes
    {
        $connexion = Database::getConnexion();

        $statement = $connexion->query(
            "SELECT
                count(id) as commandes_enregistres,
                sum(montant_total) as ca_encaisse,
                sum(montant_verse) as en_cours_clients_total
             FROM commandes"
        );

        return StatistiquesVentes::toEntity($statement->fetch(PDO::FETCH_OBJ));
    }

    public function getCommandesRecentes(int $limite = 20): array
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT
                c.id AS commande_id,
                c.num_cmde,
                c.montant_total,
                c.montant_verse,
                cl.id AS client_id,
                cl.nom AS client_nom,
                cl.prenom AS client_prenom,
                (c.montant_total - c.montant_verse) AS montant_restant,
                CASE
                    WHEN c.montant_verse >= c.montant_total THEN 'COMPTANT'
                    WHEN c.montant_verse <= 0 THEN 'CRÉDIT TOTAL'
                    ELSE 'AVANCE (Credit)'
                END AS statut
             FROM commandes c
             JOIN clients cl ON cl.id = c.client_id
             ORDER BY c.id DESC
             LIMIT :limite"
        );
        $statement->bindValue(':limite', $limite, PDO::PARAM_INT);
        $statement->execute();

        $commandes = [];

        foreach ($statement->fetchAll(PDO::FETCH_OBJ) as $ligne) {
            $commande = Commande::toEntity($ligne);
            $commande->setLignes($this->getLignesCommande($commande->getId()));
            $commandes[] = $commande;
        }

        return $commandes;
    }

    public function getLignesCommande(int $commandeId): array
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT
                lc.id AS ligne_id,
                p.id AS produit_id,
                p.nom AS produit_nom,
                p.prix_unitaire AS produit_prix_unitaire,
                p.stock_quantite AS produit_stock_quantite,
                lc.quantite,
                lc.prix_unitaire,
                (lc.quantite * lc.prix_unitaire) AS sous_total
             FROM lignes_commande lc
             JOIN produits p ON p.id = lc.produit_id
             WHERE lc.commande_id = :commande_id"
        );
        $statement->execute(['commande_id' => $commandeId]);

        $lignes = [];

        foreach ($statement->fetchAll(PDO::FETCH_OBJ) as $ligne) {
            $lignes[] = LigneCommande::toEntity($ligne);
        }

        return $lignes;
    }
}
