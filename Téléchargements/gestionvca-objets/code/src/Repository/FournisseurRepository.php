<?php

namespace PapeMohidineMbaye\Code\Repository;

use PapeMohidineMbaye\Code\Core\Database;
use PapeMohidineMbaye\Code\Entity\Fournisseur;
use PDO;

class FournisseurRepository
{
    public function getAllFournisseurs(): array
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT id, nom, telephone FROM fournisseurs ORDER BY nom"
        );
        $statement->execute();

        $fournisseurs = [];

        foreach ($statement->fetchAll(PDO::FETCH_OBJ) as $ligne) {
            $fournisseurs[] = Fournisseur::toEntity($ligne);
        }

        return $fournisseurs;
    }

    public function getFournisseurById(int $id): ?Fournisseur
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT id, nom, telephone FROM fournisseurs WHERE id = :id"
        );
        $statement->execute(['id' => $id]);
        $ligne = $statement->fetch(PDO::FETCH_OBJ);

        if ($ligne === false) {
            return null;
        }

        return Fournisseur::toEntity($ligne);
    }

    public function creerFournisseur(string $nom, ?string $telephone = null): int
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "INSERT INTO fournisseurs (nom, telephone) VALUES (:nom, :telephone) RETURNING id"
        );
        $statement->execute(['nom' => $nom, 'telephone' => $telephone]);

        return (int) $statement->fetchColumn();
    }

    public function modifierFournisseur(int $id, string $nom, ?string $telephone = null): void
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "UPDATE fournisseurs SET nom = :nom, telephone = :telephone WHERE id = :id"
        );
        $statement->execute(['id' => $id, 'nom' => $nom, 'telephone' => $telephone]);
    }

    public function supprimerFournisseur(int $id): void
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare("DELETE FROM fournisseurs WHERE id = :id");
        $statement->execute(['id' => $id]);
    }
}
