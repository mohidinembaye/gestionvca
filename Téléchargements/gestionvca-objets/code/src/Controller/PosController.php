<?php

namespace PapeMohidineMbaye\Code\Controller;

use PapeMohidineMbaye\Code\Repository\ClientRepository;
use PapeMohidineMbaye\Code\Repository\ProduitRepository;
use PapeMohidineMbaye\Code\Repository\CommandeRepository;
use PapeMohidineMbaye\Code\Repository\DetteRepository;
use PapeMohidineMbaye\Code\Service\VenteService;
use PapeMohidineMbaye\Code\Core\SessionManager;
use Exception;

class PosController
{
    private ClientRepository $clientRepository;
    private ProduitRepository $produitRepository;
    private CommandeRepository $commandeRepository;
    private DetteRepository $dettesRepository;

    private VenteService $venteService;

    public function __construct()
    {
        $this->clientRepository = new ClientRepository();
        $this->produitRepository = new ProduitRepository();
        $this->commandeRepository = new CommandeRepository();
        $this->dettesRepository=new DetteRepository();
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

        $utilisateurId = SessionManager::get('utilisateur_id');

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
        $statistiques = $this->commandeRepository->getStatistiques();
        $sta = $this->dettesRepository->getStatistiques();
        $detteactives = $this->dettesRepository->getRegistreDetteActive();

        $panier = $this->venteService->getPanierDetaille();
        $panierTotal = $this->venteService->getMontantTotalPanier();
        $clientSelectionne = $this->venteService->getClientSelectionne();

        $this->renderView(
            'StoreManager.html.php',
            [
                'message' => $message,
                'clients' => $clients,
                'produits' => $produits,
                'statistiques' => $statistiques,
                'sta' => $sta,
                'detteactives' => $detteactives,
                'panier' => $panier,
                'panierTotal' => $panierTotal,
                'clientSelectionne' => $clientSelectionne,
                'commandes' => $commandes,
            ]
        );
    }

    private function renderView(string $view, array $data = []): void
    {
        extract($data);

        require dirname(__DIR__) . '/view/' . $view;
    }
}
