<?php

namespace PapeMohidineMbaye\Code\Entity;

class LigneBonLivraison
{
    private int $id;
    private int $bonLivraisonId;
    private int $produitId;
    private int $quantite;
    private float $prixAchat;
    private float $sousTotal;

    public function __construct(
        int $id,
        int $bonLivraisonId,
        int $produitId,
        int $quantite,
        float $prixAchat,
        float $sousTotal
    ) {
        $this->id = $id;
        $this->bonLivraisonId = $bonLivraisonId;
        $this->produitId = $produitId;
        $this->quantite = $quantite;
        $this->prixAchat = $prixAchat;
        $this->sousTotal = $sousTotal;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getBonLivraisonId(): int
    {
        return $this->bonLivraisonId;
    }

    public function getProduitId(): int
    {
        return $this->produitId;
    }

    public function getQuantite(): int
    {
        return $this->quantite;
    }

    public function getPrixAchat(): float
    {
        return $this->prixAchat;
    }

    public function getSousTotal(): float
    {
        return $this->sousTotal;
    }
}