<?php

require_once dirname(__DIR__) . '/repository/ClientRepository.php';
require_once dirname(__DIR__) . '/repository/ProduitRepository.php';
require_once dirname(__DIR__) . '/repository/CommandeRepository.php';
require_once dirname(__DIR__) . '/service/VenteService.php';

class PosController
{
    private ClientRepository $clientRepository;
    private ProduitRepository $produitRepository;
    private CommandeRepository $commandeRepository;
    private VenteService $venteService;

    public function __construct()
    {
        $this->clientRepository = new ClientRepository();
        $this->produitRepository = new ProduitRepository();
        $this->commandeRepository = new CommandeRepository();
        $this->venteService = new VenteService();
    }

    public function traiter(): void
    {
        $message = null;

        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
         
            if (isset($_POST['client_id']) && (int) $_POST['client_id'] > 0) {
                $this->venteService->setClientSelectionne((int) $_POST['client_id']);
            }

            $action = $_POST['action'] ?? '';

            $message = match ($action) {
                'add_to_cart' => $this->ajouterAuPanier(),
                'remove_from_cart' => $this->retirerDuPanier(),
                'clear_cart' => $this->viderPanier(),
                'create_order' => $this->confirmerVente(),
                default => null,
            };
        }

        $this->afficherVue($message);
    }

    private function ajouterAuPanier(): ?array
    {
        $produitId = (int) ($_POST['produit_id'] ?? 0);
        $quantite = (int) ($_POST['quantite'] ?? 0);

        if ($produitId <= 0 || $quantite <= 0) {
            return ['type' => 'danger', 'texte' => 'Produit et quantité requis.'];
        }

        $this->venteService->ajouterAuPanier($produitId, $quantite);

        return null;
    }

    private function retirerDuPanier(): ?array
    {
        $produitId = (int) ($_POST['produit_id'] ?? 0);
        $this->venteService->retirerDuPanier($produitId);

        return null;
    }

    private function viderPanier(): ?array
    {
        $this->venteService->viderPanier();

        return null;
    }

    private function confirmerVente(): array
    {
        $clientId = (int) ($_POST['client_id'] ?? 0);
        $modeReglement = (string) ($_POST['mode_reglement'] ?? 'Especes');
        $montantVerse = (float) ($_POST['montant_verse'] ?? 0);

        if ($clientId <= 0) {
            return ['type' => 'danger', 'texte' => 'Client requis.'];
        }

        $utilisateurId = $_SESSION['utilisateur_id'] ?? null;

        try {
            $this->venteService->confirmerVente(
                $clientId,
                $utilisateurId !== null ? (int) $utilisateurId : null,
                $modeReglement,
                $montantVerse
            );

            return ['type' => 'success', 'texte' => 'Vente enregistrée avec succès.'];
        } catch (Exception $e) {
            return ['type' => 'danger', 'texte' => $e->getMessage()];
        }
    }

    private function afficherVue(?array $message): void
    {
        $clients = $this->clientRepository->getAllClients();
        $produits = $this->produitRepository->getAllProduits();
        $commandes = $this->commandeRepository->getCommandesRecentes();

        $panier = $this->venteService->getPanierDetaille();
        $panierTotal = $this->venteService->getMontantTotalPanier();
        $clientSelectionne = $this->venteService->getClientSelectionne();

        $lignesParCommande = [];
        foreach ($commandes as $commande) {
            $lignesParCommande[$commande['id']] = $this->commandeRepository->getLignesCommande($commande['id']);
        }

        require dirname(__DIR__) . '/view/StoreManager.html.php';
    }
}
