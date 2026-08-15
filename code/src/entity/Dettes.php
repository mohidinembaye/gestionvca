<?php

class Dette
{
    private int $id;
    private int $clientId;
    private float $montantInitial;
    private float $montantRestant;
    private float $montantRembourse;

    public function __construct(
        int $id,
        int $clientId,
        float $montantInitial,
        float $montantRestant,
        float $montantRembourse
    ) {
        $this->id = $id;
        $this->clientId = $clientId;
        $this->montantInitial = $montantInitial;
        $this->montantRestant = $montantRestant;
        $this->montantRembourse = $montantRembourse;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getClientId(): int
    {
        return $this->clientId;
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
}