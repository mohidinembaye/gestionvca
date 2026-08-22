<?php

namespace PapeMohidineMbaye\Code\Entity;

class LignePanier
{
    private Produit $produit;
    private int $quantite;

    public function __construct(Produit $produit, int $quantite)
    {
        $this->produit = $produit;
        $this->quantite = $quantite;
    }

    public function getProduit(): Produit
    {
        return $this->produit;
    }

    public function getQuantite(): int
    {
        return $this->quantite;
    }

    public function getSousTotal(): float
    {
        return $this->produit->getPrixUnitaire() * $this->quantite;
    }
}
