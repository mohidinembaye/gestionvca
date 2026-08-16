<?php

require_once dirname(__DIR__) . '/core/Database.php';
require_once dirname(__DIR__) . '/entity/Cients.php';

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

        foreach ($statement->fetchAll() as $ligne) {
            $clients[] = $this->mapToClient($ligne);
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
        $ligne = $statement->fetch();

        if ($ligne === false) {
            return null;
        }

        return $this->mapToClient($ligne);
    }

    private function mapToClient(array $ligne): Client
    {
        return new Client(
            (int) $ligne['id'],
            $ligne['nom'],
            $ligne['prenom']
        );
    }
}
