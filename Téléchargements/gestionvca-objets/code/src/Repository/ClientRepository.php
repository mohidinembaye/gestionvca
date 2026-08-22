<?php

namespace PapeMohidineMbaye\Code\Repository;

use PapeMohidineMbaye\Code\Core\Database;
use PapeMohidineMbaye\Code\Entity\Client;
use PDO;

class ClientRepository
{
    public function getAllClients(): array
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT id, nom, prenom FROM clients ORDER BY nom, prenom"
        );
        $statement->execute();

        $clients = [];

        foreach ($statement->fetchAll(PDO::FETCH_OBJ) as $ligne) {
            $clients[] = Client::toEntity($ligne);
        }

        return $clients;
    }

    public function getClientById(int $id): ?Client
    {
        $connexion = Database::getConnexion();
        $statement = $connexion->prepare(
            "SELECT id, nom, prenom FROM clients WHERE id = :id"
        );
        $statement->execute(['id' => $id]);
        $ligne = $statement->fetch(PDO::FETCH_OBJ);

        if ($ligne === false) {
            return null;
        }

        return Client::toEntity($ligne);
    }
}
