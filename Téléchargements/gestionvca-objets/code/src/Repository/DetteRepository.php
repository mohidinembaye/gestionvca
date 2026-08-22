<?php

namespace PapeMohidineMbaye\Code\Repository;

use PapeMohidineMbaye\Code\Core\Database;
use PapeMohidineMbaye\Code\Entity\Commande;
use PapeMohidineMbaye\Code\Entity\StatistiquesDettes;
use PDO;

class DetteRepository
{
    private CommandeRepository $commandeRepository;

    public function __construct()
    {
        $this->commandeRepository = new CommandeRepository();
    }

    public function getStatistiques(): StatistiquesDettes
    {
        $connexion = Database::getConnexion();

        $statement = $connexion->query(
            "SELECT
                sum(montant_restant) as dettes_active,
                count(client_id) as nbr_client_debiteur
             FROM dettes"
        );

        return StatistiquesDettes::toEntity($statement->fetch(PDO::FETCH_OBJ));
    }

    public function getRegistreDetteActive(): array
    {
        $connexion = Database::getConnexion();

        $statement = $connexion->query(
            "SELECT
                c.id AS commande_id,
                c.num_cmde,
                c.date_commande,
                cl.id AS client_id,
                cl.nom AS client_nom,
                cl.prenom AS client_prenom,
                c.montant_total,
                c.montant_verse,
                (c.montant_total - c.montant_verse) AS montant_restant,
                CASE
                    WHEN (c.montant_total - c.montant_verse) = 0 THEN 'SOLDE'
                    ELSE 'non SOLDE'
                END AS statut
             FROM commandes c
             INNER JOIN clients cl ON c.client_id = cl.id
             INNER JOIN dettes d ON d.client_id = cl.id
             WHERE (c.montant_total - c.montant_verse) != 0"
        );

        $dettesActives = [];

        foreach ($statement->fetchAll(PDO::FETCH_OBJ) as $ligne) {
            $commande = Commande::toEntity($ligne);
            $commande->setLignes($this->commandeRepository->getLignesCommande($commande->getId()));
            $dettesActives[] = $commande;
        }

        return $dettesActives;
    }
}
