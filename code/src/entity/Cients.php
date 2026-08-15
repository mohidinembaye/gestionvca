<?php


class Client
{
    private int $id;
    private string $nom;
    private ?string $prenom;

    public function __construct(int $id, string $nom, ?string $prenom = null)
    {
        $this->id = $id;
        $this->nom = $nom;
        $this->prenom = $prenom;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }
}