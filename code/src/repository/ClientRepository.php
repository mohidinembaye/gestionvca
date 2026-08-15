<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/entity/Clients.php';

class ClientRepository

{
    private Database $database;

    public function __construct(Database $database)
    {
        $this->database = $database;
    }

    public function getAllClients(): array
    {
        $lignes = $this->database->executeQuery(
            "SELECT id, nom, prenom FROM clients ORDER BY nom, prenom",
            [],
            false
        );

        $clients = [];

        foreach ($lignes as $ligne) {
            $clients[] = $this->mapToClient($ligne);
        }

        return $clients;
    }

    public function getClientById(int $id): ?Clients
    {
        $ligne = $this->database->executeQuery(
            "SELECT id, nom, prenom FROM clients WHERE id = :id",
            ['id' => $id]
        );

        if ($ligne === []) {
            return null;
        }

        return $this->mapToClient($ligne);
    }

    private function mapToClient(array $ligne): Clients
    {
        return new Clients(
            (int) $ligne['id'],
            $ligne['nom'],
            $ligne['prenom']
        );
    }
}