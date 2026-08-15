<?php

/**
 * Classe de description : représente un utilisateur du système.
 * Aucune vérification de mot de passe ici : elle se fait en base
 * (ex. WHERE mot_de_passe = crypt(:saisi, mot_de_passe)).
 */
class Utilisateur
{
    private int $id;
    private string $nom;
    private string $email;
    private string $motDePasse;
    private ?int $roleId;

    public function __construct(
        int $id,
        string $nom,
        string $email,
        string $motDePasse,
        ?int $roleId = null
    ) {
        $this->id = $id;
        $this->nom = $nom;
        $this->email = $email;
        $this->motDePasse = $motDePasse;
        $this->roleId = $roleId;
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

    public function getRoleId(): ?int
    {
        return $this->roleId;
    }
}