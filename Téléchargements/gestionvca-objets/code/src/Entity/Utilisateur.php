<?php

namespace PapeMohidineMbaye\Code\Entity;

class Utilisateur
{
    private int $id;
    private string $nom;
    private string $email;
    private string $motDePasse;
    private ?Role $role;

    public function __construct(
        int $id,
        string $nom,
        string $email,
        string $motDePasse,
        ?Role $role = null
    ) {
        $this->id = $id;
        $this->nom = $nom;
        $this->email = $email;
        $this->motDePasse = $motDePasse;
        $this->role = $role;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getNom(): string
    {
        return $this->nom;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function getMotDePasse(): string
    {
        return $this->motDePasse;
    }

    public function getRole(): ?Role
    {
        return $this->role;
    }

    public static function toEntity(\stdClass $obj): self
    {
        $role = null;

        if (!empty($obj->role_id)) {
            $role = Role::toEntity($obj);
        }

        return new self(
            (int) ($obj->utilisateur_id ?? $obj->id),
            (string) ($obj->utilisateur_nom ?? $obj->nom),
            (string) ($obj->email ?? ''),
            (string) ($obj->mot_de_passe ?? ''),
            $role
        );
    }
}
