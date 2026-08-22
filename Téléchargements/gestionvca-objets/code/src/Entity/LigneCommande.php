<?php

namespace PapeMohidineMbaye\Code\Entity;

class LigneCommande
{
    private int $id;
    private Produit $produit;
    private int $quantite;
    private float $prixUnitaire;
    private float $sousTotal;

    public function __construct(
        int $id,
        Produit $produit,
        int $quantite,
        float $prixUnitaire,
        float $sousTotal
    ) {
        $this->id = $id;
        $this->produit = $produit;
        $this->quantite = $quantite;
        $this->prixUnitaire = $prixUnitaire;
        $this->sousTotal = $sousTotal;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getProduit(): Produit
    {
        return $this->produit;
    }

    public function getQuantite(): int
    {
        return $this->quantite;
    }

    public function getPrixUnitaire(): float
    {
        return $this->prixUnitaire;
    }

    public function getSousTotal(): float
    {
        return $this->sousTotal;
    }

    public static function toEntity(\stdClass $obj): self
    {
        return new self(
            (int) ($obj->ligne_id ?? $obj->id ?? 0),
            Produit::toEntity($obj),
            (int) ($obj->quantite ?? 0),
            (float) ($obj->prix_unitaire ?? 0),
            (float) ($obj->sous_total ?? 0)
        );
    }
}
