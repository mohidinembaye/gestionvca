<?php


class BonLivraison
{
    private int $id;
    private string $refBl;
    private string $dateReception;
    private float $valeurLot;
    private string $statut;
    private int $fournisseurId;
    private ?int $utilisateurId;

    public function __construct(
        int $id,
        string $refBl,
        string $dateReception,
        float $valeurLot,
        string $statut,
        int $fournisseurId,
        ?int $utilisateurId = null
    ) {
        $this->id = $id;
        $this->refBl = $refBl;
        $this->dateReception = $dateReception;
        $this->valeurLot = $valeurLot;
        $this->statut = $statut;
        $this->fournisseurId = $fournisseurId;
        $this->utilisateurId = $utilisateurId;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getRefBl(): string
    {
        return $this->refBl;
    }

    public function getDateReception(): string
    {
        return $this->dateReception;
    }

    public function getValeurLot(): float
    {
        return $this->valeurLot;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function getFournisseurId(): int
    {
        return $this->fournisseurId;
    }

    public function getUtilisateurId(): ?int
    {
        return $this->utilisateurId;
    }
}