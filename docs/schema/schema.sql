-- Active: 1785779490330@@127.0.0.1@5432@gestvca
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
 nom VARCHAR(50) UNIQUE NOT NULL);

CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
 nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
   mot_de_passe VARCHAR(255) NOT NULL, 
   role_id INTEGER REFERENCES roles(id)
   );

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
     nom VARCHAR(100) NOT NULL, 
     prenom VARCHAR(100)
     );

CREATE TABLE produits (
    id SERIAL PRIMARY KEY, 
nom VARCHAR(150) NOT NULL, 
prix_unitaire NUMERIC(10,2) CHECK (prix_unitaire >= 0),
 stock_quantite INTEGER DEFAULT 0 CHECK (stock_quantite >= 0)
 );

CREATE TABLE fournisseurs (
    id SERIAL PRIMARY KEY,
     nom VARCHAR(150) NOT NULL, 
     telephone VARCHAR(20)
     );

CREATE TABLE commandes (
    id SERIAL PRIMARY KEY,
     num_cmde VARCHAR(50) UNIQUE NOT NULL,
      date_commande DATE DEFAULT CURRENT_DATE,
       date_limite DATE, 
       montant_total NUMERIC(12,2) DEFAULT 0.00,
        montant_verse NUMERIC(12,2) DEFAULT 0.00, 
        mode_paiement VARCHAR(50), 
        client_id INTEGER REFERENCES clients(id), 
        utilisateur_id INTEGER REFERENCES utilisateurs(id)
        );

CREATE TABLE lignes_commande (
    id SERIAL PRIMARY KEY,
     commande_id INTEGER REFERENCES commandes(id) ON DELETE CASCADE,
      produit_id INTEGER REFERENCES produits(id),
       quantite INTEGER CHECK (quantite > 0), 
       prix_unitaire NUMERIC(10,2) CHECK (prix_unitaire >= 0)
       );

CREATE TABLE dettes (
    id SERIAL PRIMARY KEY, 
    client_id INTEGER REFERENCES clients(id),
     montant_initial NUMERIC(12,2) CHECK (montant_initial >= 0),
      montant_restant NUMERIC(12,2) CHECK (montant_restant >= 0)
      );

CREATE TABLE reglements (
    id SERIAL PRIMARY KEY, 
    dette_id INTEGER REFERENCES dettes(id) ON DELETE CASCADE,
     date DATE DEFAULT CURRENT_DATE,
      montant NUMERIC(12,2) CHECK (montant > 0)
      );

CREATE TABLE bons_livraison (
    id SERIAL PRIMARY KEY,
     ref_bl VARCHAR(50) UNIQUE NOT NULL, 
     date_reception DATE DEFAULT CURRENT_DATE,
      valeur_lot NUMERIC(12,2) DEFAULT 0.00,
       statut VARCHAR(50) DEFAULT 'En attente', 
       fournisseur_id INTEGER REFERENCES fournisseurs(id),
        utilisateur_id INTEGER REFERENCES utilisateurs(id)
        );

CREATE TABLE lignes_bon_livraison (
    id SERIAL PRIMARY KEY,
 bon_livraison_id INTEGER REFERENCES bons_livraison(id) ON DELETE CASCADE,
  produit_id INTEGER REFERENCES produits(id), 
  quantite INTEGER CHECK (quantite > 0),
   prix_achat NUMERIC(10,2) CHECK (prix_achat >= 0 )
   );