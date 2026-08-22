<?php

namespace PapeMohidineMbaye\Code\Entity;

class StatistiquesDettes
{
    private float $dettesActives;
    private int $nbrClientDebiteur;

    public function __construct(float $dettesActives, int $nbrClientDebiteur)
    {
        $this->dettesActives = $dettesActives;
        $this->nbrClientDebiteur = $nbrClientDebiteur;
    }

    public function getDettesActives(): float
    {
        return $this->dettesActives;
    }

    public function getNbrClientDebiteur(): int
    {
        return $this->nbrClientDebiteur;
    }

    public static function toEntity(\stdClass $obj): self
    {
        return new self(
            (float) ($obj->dettes_active ?? 0),
            (int) ($obj->nbr_client_debiteur ?? 0)
        );
    }
}
