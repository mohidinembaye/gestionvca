<?php

namespace PapeMohidineMbaye\Code\Entity;

class StatistiquesVentes
{
    private int $commandesEnregistrees;
    private float $caEncaisse;
    private float $enCoursClientsTotal;

    public function __construct(int $commandesEnregistrees, float $caEncaisse, float $enCoursClientsTotal)
    {
        $this->commandesEnregistrees = $commandesEnregistrees;
        $this->caEncaisse = $caEncaisse;
        $this->enCoursClientsTotal = $enCoursClientsTotal;
    }

    public function getCommandesEnregistrees(): int
    {
        return $this->commandesEnregistrees;
    }

    public function getCaEncaisse(): float
    {
        return $this->caEncaisse;
    }

    public function getEnCoursClientsTotal(): float
    {
        return $this->enCoursClientsTotal;
    }

    public static function toEntity(\stdClass $obj): self
    {
        return new self(
            (int) ($obj->commandes_enregistres ?? 0),
            (float) ($obj->ca_encaisse ?? 0),
            (float) ($obj->en_cours_clients_total ?? 0)
        );
    }
}
