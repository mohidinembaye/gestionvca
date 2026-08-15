<?php

class Database
{
    private static ?PDO $connexion = null;

    private function __construct()
    {
    }

    public static function getConnexion(): PDO
  {
        if (self::$connexion === null) {
    try {
                self::$connexion = new PDO(
  "pgsql:host=localhost;port=5432;dbname=gestvca",
                    "postgres",
      "motdepasse"
                );
            } catch (PDOException $e) {
                self::$connexion = new PDO(
 "sqlite:" . dirname(__DIR__, 2) . "/erp.db"
   );
  }
 self::$connexion->setAttribute(
   PDO::ATTR_ERRMODE,
    PDO::ERRMODE_EXCEPTION
            );
            self::$connexion->setAttribute(
                PDO::ATTR_DEFAULT_FETCH_MODE,
                PDO::FETCH_ASSOC
            );
        }
        return self::$connexion;
    }
}