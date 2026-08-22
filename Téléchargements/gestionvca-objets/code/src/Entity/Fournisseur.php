<?php

namespace PapeMohidineMbaye\Code\Entity;


class Fournisseur
{
    private int $id;
    private string $nom;
    private ?string $telephone;

    public function __construct(int $id, string $nom, ?string $telephone = null)
    {
        $this->id = $id;
        $this->nom = $nom;
        $this->telephone = $telephone;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public static function toEntity(\stdClass $obj): self
    {
        return new self(
            (int) ($obj->fournisseur_id ?? $obj->id),
            (string) ($obj->fournisseur_nom ?? $obj->nom),
            $obj->fournisseur_telephone ?? $obj->telephone ?? null
        );
    }
}