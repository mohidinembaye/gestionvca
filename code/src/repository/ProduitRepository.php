<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/entity/Produits.php';

class ProduitRepository
{
    private Database $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    public function getAllProduits(): array
    {
        $lignes = $this->database->executeQuery(
            "SELECT id, nom, prix_unitaire, stock_quantite FROM produits ORDER BY nom",
            [],
            false
        );

        $produits = [];

        foreach ($lignes as $ligne) {
            $produits[] = $this->mapToProduit($ligne);
        }

        return $produits;
    }

    public function getProduitById(int $id): ?Produits
    {
        $ligne = $this->database->executeQuery(
            "SELECT id, nom, prix_unitaire, stock_quantite FROM produits WHERE id = :id",
            ['id' => $id]
        );

        if ($ligne === []) {
            return null;
        }

        return $this->mapToProduit($ligne);
    }

    private function mapToProduit(array $ligne): Produits
    {
        return new Produits(
            (int) $ligne['id'],
            $ligne['nom'],
            (float) $ligne['prix_unitaire'],
            (int) $ligne['stock_quantite']
        );
    }
}