<?php


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
}