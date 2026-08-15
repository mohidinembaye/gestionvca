# DEVLOG — Journal de développement

## 14/08/2026 — Création des schémas SQL PostgreSQL et SQLite

### Objectif

Mettre en place la structure de la base de données du projet afin de pouvoir stocker les différentes données nécessaires au fonctionnement de l'application.

### Travail réalisé

Création de deux scripts SQL adaptés aux deux systèmes de gestion de base de données utilisés par le projet :

```text
schema.sql
schema_sqlite.sql
```

Le fichier `schema.sql` contient le schéma destiné à **PostgreSQL**.

Le fichier `schema_sqlite.sql` contient une version adaptée au fonctionnement avec **SQLite**.

Les différences de syntaxe entre PostgreSQL et SQLite ont été prises en compte afin que chaque script puisse être exécuté sur son moteur de base de données respectif.

### Notions apprises

* Création de tables avec SQL
* Clés primaires
* Clés étrangères
* Contraintes SQL
* Types de données PostgreSQL
* Types de données SQLite
* Différences entre PostgreSQL et SQLite
* Organisation d'un schéma de base de données
* Adaptation d'un même modèle de données à plusieurs SGBD

### Fichiers concernés

```text
schema.sql
schema_sqlite.sql
```

### Résultat

Les structures de données nécessaires au projet sont maintenant définies pour PostgreSQL et SQLite.

Le projet dispose ainsi de deux schémas compatibles avec le mécanisme de connexion et de fallback automatique mis en place précédemment.
