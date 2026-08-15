<?php


class Commande
{
    private int $id;
    private string $numCmde;
    private string $dateCommande;
    private ?string $dateLimite;
    private float $montantTotal;
    private float $montantVerse;
    private float $montantRestant;
    private string $statut;
    private ?string $modePaiement;
    private int $clientId;
    private ?int $utilisateurId;

    public function __construct(
        int $id,
        string $numCmde,
        string $dateCommande,
        ?string $dateLimite,
        float $montantTotal,
        float $montantVerse,
        float $montantRestant,
        string $statut,
        ?string $modePaiement,
        int $clientId,
        ?int $utilisateurId = null
    ) {
        $this->id = $id;
        $this->numCmde = $numCmde;
        $this->dateCommande = $dateCommande;
        $this->dateLimite = $dateLimite;
        $this->montantTotal = $montantTotal;
        $this->montantVerse = $montantVerse;
        $this->montantRestant = $montantRestant;
        $this->statut = $statut;
        $this->modePaiement = $modePaiement;
        $this->clientId = $clientId;
        $this->utilisateurId = $utilisateurId;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getNumCmde(): string
    {
        return $this->numCmde;
    }

    public function getDateCommande(): string
    {
        return $this->dateCommande;
    }

    public function getDateLimite(): ?string
    {
        return $this->dateLimite;
    }

    public function getMontantTotal(): float
    {
        return $this->montantTotal;
    }

    public function getMontantVerse(): float
    {
        return $this->montantVerse;
    }

    public function getMontantRestant(): float
    {
        return $this->montantRestant;
    }

    public function getStatut(): string
    {
        return $this->statut;
    }

    public function getModePaiement(): ?string
    {
        return $this->modePaiement;
    }

    public function getClientId(): int
    {
        return $this->clientId;
    }

    public function getUtilisateurId(): ?int
    {
        return $this->utilisateurId;
    }
}