<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/entity/Fournisseur.php';


class FournisseurRepository
{
    private Database $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    public function getAllFournisseurs(): array
    {
        $lignes = $this->database->executeQuery(
            "SELECT id, nom, telephone FROM fournisseurs ORDER BY nom",
            [],
            false
        );

        $fournisseurs = [];

        foreach ($lignes as $ligne) {
            $fournisseurs[] = $this->mapToFournisseur($ligne);
        }

        return $fournisseurs;
    }

    public function getFournisseurById(int $id): ?Fournisseur
    {
        $ligne = $this->database->executeQuery(
            "SELECT id, nom, telephone FROM fournisseurs WHERE id = :id",
            ['id' => $id]
        );

        if ($ligne === []) {
            return null;
        }

        return $this->mapToFournisseur($ligne);
    }

    public function creerFournisseur(string $nom, ?string $telephone = null): int
    {
        $ligne = $this->database->executeQuery(
            "INSERT INTO fournisseurs (nom, telephone) VALUES (:nom, :telephone) RETURNING id",
            ['nom' => $nom, 'telephone' => $telephone]
        );

        return (int) $ligne['id'];
    }

    public function modifierFournisseur(int $id, string $nom, ?string $telephone = null): void
    {
        $this->database->executeUpdate(
            "UPDATE fournisseurs SET nom = :nom, telephone = :telephone WHERE id = :id",
            ['id' => $id, 'nom' => $nom, 'telephone' => $telephone]
        );
    }

    public function supprimerFournisseur(int $id): void
    {
        $this->database->executeUpdate(
            "DELETE FROM fournisseurs WHERE id = :id",
            ['id' => $id]
        );
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