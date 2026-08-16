<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/entity/Produits.php';

class ProduitRepository
{
    public function getAllProduits(): array
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT id, nom, prix_unitaire, stock_quantite FROM produits ORDER BY nom"
        );
        $statement->execute();

        $produits = [];

        foreach ($statement->fetchAll() as $ligne) {
            $produits[] = $this->mapToProduit($ligne);
        }

        return $produits;
    }

    public function getProduitById(int $id): ?Produit
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT id, nom, prix_unitaire, stock_quantite FROM produits WHERE id = :id"
        );
        $statement->execute(['id' => $id]);
        $ligne = $statement->fetch();

        if ($ligne === false) {
            return null;
        }

        return $this->mapToProduit($ligne);
    }

    private function mapToProduit(array $ligne): Produit
    {
        return new Produit(
            (int) $ligne['id'],
            $ligne['nom'],
            (float) $ligne['prix_unitaire'],
            (int) $ligne['stock_quantite']
        );
    }
}
