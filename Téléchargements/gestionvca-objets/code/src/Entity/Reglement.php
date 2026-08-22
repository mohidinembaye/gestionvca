<?php

namespace PapeMohidineMbaye\Code\Entity;

class Reglement
{
    private int $id;
    private int $detteId;
    private string $date;
    private float $montant;

    public function __construct(int $id, int $detteId, string $date, float $montant)
    {
        $this->id = $id;
        $this->detteId = $detteId;
        $this->date = $date;
        $this->montant = $montant;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getDetteId(): int
    {
        return $this->detteId;
    }

    public function getDate(): string
    {
        return $this->date;
    }

    public function getMontant(): float
    {
        return $this->montant;
    }
}