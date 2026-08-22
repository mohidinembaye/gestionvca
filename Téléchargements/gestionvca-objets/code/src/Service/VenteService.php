<?php

namespace PapeMohidineMbaye\Code\Service;

use PapeMohidineMbaye\Code\Repository\ProduitRepository;
use PapeMohidineMbaye\Code\Repository\CommandeRepository;
use PapeMohidineMbaye\Code\Entity\LignePanier;
use PapeMohidineMbaye\Code\Core\SessionManager;
use Exception;

class VenteService
{
    private const CLE_PANIER = 'panier_vente';
    private const CLE_CLIENT = 'panier_vente_client_id';

    private ProduitRepository $produitRepository;
    private CommandeRepository $commandeRepository;

    public function __construct()
    {
        $this->produitRepository = new ProduitRepository();
        $this->commandeRepository = new CommandeRepository();

        if (!SessionManager::has(self::CLE_PANIER)) {
            SessionManager::set(self::CLE_PANIER, []);
        }
    }

    public function ajouterAuPanier(int $produitId, int $quantite): void
    {
        if ($quantite <= 0) {
            return;
        }

        $panier = SessionManager::get(self::CLE_PANIER, []);
        $panier[$produitId] = ($panier[$produitId] ?? 0) + $quantite;
        SessionManager::set(self::CLE_PANIER, $panier);
    }

    public function retirerDuPanier(int $produitId): void
    {
        $panier = SessionManager::get(self::CLE_PANIER, []);
        unset($panier[$produitId]);
        SessionManager::set(self::CLE_PANIER, $panier);
    }

    public function viderPanier(): void
    {
        SessionManager::set(self::CLE_PANIER, []);
    }

    public function panierEstVide(): bool
    {
        return SessionManager::get(self::CLE_PANIER, []) === [];
    }

    public function setClientSelectionne(int $clientId): void
    {
        SessionManager::set(self::CLE_CLIENT, $clientId);
    }

    public function getClientSelectionne(): ?int
    {
        return SessionManager::get(self::CLE_CLIENT);
    }

    public function getPanierDetaille(): array
    {
        $lignes = [];

        foreach (SessionManager::get(self::CLE_PANIER, []) as $produitId => $quantite) {
            $produit = $this->produitRepository->getProduitById((int) $produitId);

            if ($produit === null) {
                continue;
            }

            $lignes[] = new LignePanier($produit, (int) $quantite);
        }

        return $lignes;
    }

    public function getMontantTotalPanier(): float
    {
        $total = 0.0;

        foreach ($this->getPanierDetaille() as $ligne) {
            $total += $ligne->getSousTotal();
        }

        return $total;
    }

    public function confirmerVente(
        int $clientId,
        ?int $utilisateurId,
        string $modeReglement,
        float $montantVerse
    ): int {
        if ($this->panierEstVide()) {
            throw new Exception('Le panier est vide.');
        }

        $lignes = [];

        foreach (SessionManager::get(self::CLE_PANIER, []) as $produitId => $quantite) {
            $lignes[] = [
                'produit_id' => (int) $produitId,
                'quantite' => (int) $quantite,
            ];
        }

        $commandeId = $this->commandeRepository->creerCommande(
            $clientId,
            $utilisateurId,
            $modeReglement,
            $montantVerse,
            $lignes
        );

        $this->viderPanier();

        return $commandeId;
    }
}
