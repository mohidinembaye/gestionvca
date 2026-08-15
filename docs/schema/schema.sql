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


INSERT INTO roles (nom) VALUES 
('Admin'),
('Vendeur'),
('Gestionnaire de Stock');

INSERT INTO utilisateurs (nom, email, mot_de_passe, role_id) VALUES 
('Moussa Diop', 'moussa@gestvca.sn', 'passer123', 1),
('Awa Ndiaye', 'awa@gestvca.sn', '123456', 2);

INSERT INTO clients (nom, prenom) VALUES 
('Sow', 'Ibrahima'),
('Faye', 'Fatou'),
('Ba', 'Ousmane');

INSERT INTO produits (nom, prix_unitaire, stock_quantite) VALUES 
('Sac de Riz 50kg', 18500.00, 100),
('Bidon d''Huile 5L', 6500.00, 45),
('Paquet de Sucre 1kg', 700.00, 200),
('Lait en Poudre 500g', 2500.00, 30);

INSERT INTO fournisseurs (nom, telephone) VALUES 
('Grandes Minoteries', '+221338000001'),
('Cosmeto & Food Distribution', '+221338000002');

INSERT INTO commandes (num_cmde, date_commande, date_limite, montant_total, montant_verse, mode_paiement, client_id, utilisateur_id) VALUES 
('CMD-2026-001', '2026-08-01', '2026-08-15', 31500.00, 31500.00, 'Cash', 1, 2),
('CMD-2026-002', '2026-08-10', '2026-08-25', 25000.00, 10000.00, 'Wave', 2, 2);

INSERT INTO lignes_commande (commande_id, produit_id, quantite, prix_unitaire) VALUES 
(1, 1, 1, 18500.00),
(1, 2, 2, 6500.00),
(2, 1, 1, 18500.00),
(2, 2, 1, 6500.00);

INSERT INTO dettes (client_id, montant_initial, montant_restant) VALUES 
(2, 15000.00, 10000.00);

INSERT INTO reglements (dette_id, date, montant) VALUES 
(1, '2026-08-12', 5000.00);

INSERT INTO bons_livraison (ref_bl, date_reception, valeur_lot, statut, fournisseur_id, utilisateur_id) VALUES 
('BL-2026-101', '2026-08-05', 925000.00, 'Recu', 1, 1);

INSERT INTO lignes_bon_livraison (bon_livraison_id, produit_id, quantite, prix_achat) VALUES 
(1, 1, 50, 17500.00),
(1, 3, 50, 1000.00);

SELECT id, nom, prenom FROM clients ORDER BY nom, prenom

SELECT id, nom, prix_unitaire, stock_quantite
             FROM produits
             WHERE stock_quantite <= 5
             ORDER BY stock_quantite ASC