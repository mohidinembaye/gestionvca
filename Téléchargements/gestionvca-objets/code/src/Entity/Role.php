<?php

namespace PapeMohidineMbaye\Code\Entity;

class Role
{
    private int $id;
    private string $nom;

    public function __construct(int $id, string $nom)
    {
        $this->id = $id;
        $this->nom = $nom;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public static function toEntity(\stdClass $obj): self
    {
        return new self(
            (int) ($obj->role_id ?? $obj->id),
            (string) ($obj->role_nom ?? $obj->nom)
        );
    }
}