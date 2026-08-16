<?php

require_once dirname(__DIR__) . '/repository/ProduitRepository.php';
require_once dirname(__DIR__) . '/repository/CommandeRepository.php';


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

        if (!isset($_SESSION[self::CLE_PANIER])) {
            $_SESSION[self::CLE_PANIER] = [];
        }
    }

    public function ajouterAuPanier(int $produitId, int $quantite): void
    {
        if ($quantite <= 0) {
            return;
        }

        $panier = $_SESSION[self::CLE_PANIER];
        $panier[$produitId] = ($panier[$produitId] ?? 0) + $quantite;
        $_SESSION[self::CLE_PANIER] = $panier;
    }

    public function retirerDuPanier(int $produitId): void
    {
        $panier = $_SESSION[self::CLE_PANIER];
        unset($panier[$produitId]);
        $_SESSION[self::CLE_PANIER] = $panier;
    }

    public function viderPanier(): void
    {
        $_SESSION[self::CLE_PANIER] = [];
    }

    public function panierEstVide(): bool
    {
        return $_SESSION[self::CLE_PANIER] === [];
    }

    public function setClientSelectionne(int $clientId): void
    {
        $_SESSION[self::CLE_CLIENT] = $clientId;
    }

    public function getClientSelectionne(): ?int
    {
        return $_SESSION[self::CLE_CLIENT] ?? null;
    }


    public function getPanierDetaille(): array
    {
        $lignes = [];

        foreach ($_SESSION[self::CLE_PANIER] as $produitId => $quantite) {
            $produit = $this->produitRepository->getProduitById((int) $produitId);

            if ($produit === null) {
                continue;
            }

            $lignes[] = [
                'produit_id' => $produit->getId(),
                'nom' => $produit->getNom(),
                'quantite' => $quantite,
                'prix_unitaire' => $produit->getPrixUnitaire(),
                'sous_total' => $produit->getPrixUnitaire() * $quantite,
            ];
        }

        return $lignes;
    }

    public function getMontantTotalPanier(): float
    {
        $total = 0.0;

        foreach ($this->getPanierDetaille() as $ligne) {
            $total += $ligne['sous_total'];
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

        foreach ($_SESSION[self::CLE_PANIER] as $produitId => $quantite) {
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
