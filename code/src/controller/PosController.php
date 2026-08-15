<?php

require_once  dirname(__DIR__) . '/core/Database.php';
require_once  dirname(__DIR__) . '/repository/ClientRepository.php';
require_once  dirname(__DIR__) . '/repository/ProduitRepository.php';

class PosController
{
    private ClientRepository $clientRepository;
    private ProduitRepository $produitRepository;
    private CommandeRepository $commandeRepository;

    public function __construct(Database $database)
    {
        $this->clientRepository = new ClientRepository($database);
        $this->produitRepository = new ProduitRepository($database);
        $this->commandeRepository = new CommandeRepository($database);
    }

 
   

    private function afficherVue(?array $message): void
    {
        $clients = $this->clientRepository->getAllClients();
        $produits = $this->produitRepository->getAllProduits();
        $commandes = $this->commandeRepository->getCommandesRecentes();
        var_dump( $clients );
        die;

        require dirname(__DIR__) . '/view/StoreManager.html.php';
    }
}