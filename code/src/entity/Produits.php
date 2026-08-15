<?php


class Produit
{
    private int $id;
    private string $nom;
    private float $prixUnitaire;
    private int $stockQuantite;

    public function __construct(
        int $id,
        string $nom,
        float $prixUnitaire,
        int $stockQuantite = 0
    ) {
        $this->id = $id;
        $this->nom = $nom;
        $this->prixUnitaire = $prixUnitaire;
        $this->stockQuantite = $stockQuantite;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getPrixUnitaire(): float
    {
        return $this->prixUnitaire;
    }

    public function getStockQuantite(): int
    {
        return $this->stockQuantite;
    }
}