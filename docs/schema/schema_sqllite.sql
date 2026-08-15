roles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
     nom TEXT UNIQUE NOT NULL);

utilisateurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 nom TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL, 
  mot_de_passe TEXT NOT NULL, 
  role_id INTEGER REFERENCES roles(id)
  );

clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 nom TEXT NOT NULL,
  prenom TEXT
  );

produits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 nom TEXT NOT NULL,
  prix_unitaire REAL CHECK (prix_unitaire >= 0),
   stock_quantite INTEGER DEFAULT 0 CHECK (stock_quantite >= 0)
  );

fournisseurs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 nom TEXT NOT NULL, 
 telephone TEXT
 );

commandes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
num_cmde TEXT UNIQUE NOT NULL,
 date_commande TEXT DEFAULT (DATE('now')), 
 date_limite TEXT, montant_total REAL DEFAULT 0.00, 
 montant_verse REAL DEFAULT 0.00, mode_paiement TEXT,
  client_id INTEGER REFERENCES clients(id), 
  utilisateur_id INTEGER REFERENCES utilisateurs(id)
  );

lignes_commande (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 commande_id INTEGER REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id INTEGER REFERENCES produits(id), 
  quantite INTEGER CHECK (quantite > 0), prix_unitaire REAL CHECK (prix_unitaire >= 0));

dettes (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
client_id INTEGER REFERENCES clients(id),
 montant_initial REAL CHECK (montant_initial >= 0),
  montant_restant REAL CHECK (montant_restant >= 0)
  );

reglements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 dette_id INTEGER REFERENCES dettes(id) ON DELETE CASCADE,
  date TEXT DEFAULT (DATE('now')),
   montant REAL CHECK (montant > 0)
   );

bons_livraison (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
ref_bl TEXT UNIQUE NOT NULL, 
date_reception TEXT DEFAULT (DATE('now')),
 valeur_lot REAL DEFAULT 0.00, 
 statut TEXT DEFAULT 'En attente',
  fournisseur_id INTEGER REFERENCES fournisseurs(id),
   utilisateur_id INTEGER REFERENCES utilisateurs(id)
   );

lignes_bon_livraison (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
 bon_livraison_id INTEGER REFERENCES bons_livraison(id) ON DELETE CASCADE,
  produit_id INTEGER REFERENCES produits(id), 
  quantite INTEGER CHECK (quantite > 0), 
  prix_achat REAL CHECK (prix_achat >= 0)
  );