<?php

require_once dirname(__DIR__ ) . '/core/Database.php';
require_once dirname(__DIR__ ). '/controller/PosController.php';

class Router
{
    /** @var array<string, array{controller: string, action: string}> */
    private array $routes = [
        '/' => ['controller' => 'PosController', 'action' => 'afficherVue'],
    ];

    private Database $database;

    public function __construct(Database $database)
    {
        $this->database = $database;

        $this->dispatch();
    }

    private function dispatch(): void
    {
        $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

        if (!isset($this->routes[$uri])) {
            echo "page introuvable";
            return;
        }

        $controllerClass = $this->routes[$uri]['controller'];
        $action = $this->routes[$uri]['action'];

        if (!class_exists($controllerClass)) {
            echo "controller introuvable";
            return;
        }

        $controleur = $this->creerControleur($controllerClass);

        if (!method_exists($controleur, $action)) {
            echo "action introuvable";
            return;
        }

        $controleur->$action();
    }

    private function creerControleur(string $controllerClass): object
    {
        return match ($controllerClass) {
            'PosController' => new PosController($this->database),
            default => new $controllerClass(),
        };
    }
}