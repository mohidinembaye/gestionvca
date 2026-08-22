<?php

namespace PapeMohidineMbaye\Code\Entity;

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
    private Client $client;
    private ?Utilisateur $utilisateur;

    private array $lignes = [];

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
        Client $client,
        ?Utilisateur $utilisateur = null
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
        $this->client = $client;
        $this->utilisateur = $utilisateur;
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

    public function getClient(): Client
    {
        return $this->client;
    }

    public function getUtilisateur(): ?Utilisateur
    {
        return $this->utilisateur;
    }

    public function getLignes(): array
    {
        return $this->lignes;
    }

    public function setLignes(array $lignes): void
    {
        $this->lignes = $lignes;
    }

    public static function toEntity(\stdClass|array $data): self
    {
        $isArr = is_array($data);
        $get = static function (string $key, mixed $default = null) use ($data, $isArr): mixed {
            if ($isArr) {
                return array_key_exists($key, $data) ? $data[$key] : $default;
            }
            return property_exists($data, $key) ? $data->$key : $default;
        };

        $obj = (object) $data;
        $utilisateur = null;

        if (!empty($get('utilisateur_id'))) {
            $utilisateur = Utilisateur::toEntity($obj);
        }

        return new self(
            (int) ($get('commande_id') ?? $get('id') ?? 0),
            (string) ($get('num_cmde', '')),
            (string) ($get('date_commande', '')),
            $get('date_limite'),
            (float) ($get('montant_total', 0)),
            (float) ($get('montant_verse', 0)),
            (float) ($get('montant_restant', 0)),
            (string) ($get('statut', '')),
            $get('mode_paiement'),
            Client::toEntity($obj),
            $utilisateur
        );
    }
}
