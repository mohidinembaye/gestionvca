<?php

namespace PapeMohidineMbaye\Code\Entity;

class Dette
{
    private int $id;
    private Client $client;
    private float $montantInitial;
    private float $montantRestant;
    private float $montantRembourse;

    public function __construct(
        int $id,
        Client $client,
        float $montantInitial,
        float $montantRestant,
        float $montantRembourse
    ) {
        $this->id = $id;
        $this->client = $client;
        $this->montantInitial = $montantInitial;
        $this->montantRestant = $montantRestant;
        $this->montantRembourse = $montantRembourse;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getClient(): Client
    {
        return $this->client;
    }

    public function getMontantInitial(): float
    {
        return $this->montantInitial;
    }

    public function getMontantRestant(): float
    {
        return $this->montantRestant;
    }

    public function getMontantRembourse(): float
    {
        return $this->montantRembourse;
    }

    public static function toEntity(\stdClass $obj): self
    {
        return new self(
            (int) ($obj->dette_id ?? $obj->id),
            Client::toEntity($obj),
            (float) ($obj->montant_initial ?? 0),
            (float) ($obj->montant_restant ?? 0),
            (float) ($obj->montant_rembourse ?? 0)
        );
    }
}
