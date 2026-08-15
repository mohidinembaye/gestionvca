# DEVLOG — Journal de développement

## 14/08/2026 — Mise en place de la connexion à la base de données

### Objectif

Mettre en place une classe `Database` permettant de gérer la connexion à la base de données de manière centralisée.

### Travail réalisé

Création du fichier :

src/Core/Database.php

La classe `Database` utilise le pattern **Singleton** afin de garantir qu'une seule instance de `PDO` soit créée pendant l'exécution de l'application.

La connexion principale utilise **PostgreSQL**.

En cas d'échec de la connexion PostgreSQL, un mécanisme de **fallback automatique** permet de basculer vers une base **SQLite** située dans :

erp.db

### Fonctionnement

La méthode :

Database::getConnexion()

permet de récupérer l'instance unique de la connexion PDO.

Le fonctionnement est le suivant :

1. Vérifier si une connexion existe déjà.
2. Si elle existe, la retourner.
3. Sinon, tenter une connexion PostgreSQL.
4. Si PostgreSQL échoue, intercepter l'exception avec `try/catch`.
5. Créer automatiquement une connexion SQLite.
6. Retourner la connexion obtenue.

### Notions apprises

* Pattern Singleton 