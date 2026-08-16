<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/entity/Fournisseurs.php';

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

        foreach ($statement->fetchAll() as $ligne) {
            $fournisseurs[] = $this->mapToFournisseur($ligne);
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
        $ligne = $statement->fetch();

        if ($ligne === false) {
            return null;
        }

        return $this->mapToFournisseur($ligne);
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

    private function mapToFournisseur(array $ligne): Fournisseur
    {
        return new Fournisseur(
            (int) $ligne['id'],
            $ligne['nom'],
            $ligne['telephone']
        );
    }
}
