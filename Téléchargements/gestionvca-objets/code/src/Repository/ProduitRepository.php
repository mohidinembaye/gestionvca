<?php

namespace PapeMohidineMbaye\Code\Repository;

use PapeMohidineMbaye\Code\Core\Database;
use PapeMohidineMbaye\Code\Entity\Produit;
use PDO;

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

        foreach ($statement->fetchAll(PDO::FETCH_OBJ) as $ligne) {
            $produits[] = Produit::toEntity($ligne);
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
        $ligne = $statement->fetch(PDO::FETCH_OBJ);

        if ($ligne === false) {
            return null;
        }

        return Produit::toEntity($ligne);
    }
}
