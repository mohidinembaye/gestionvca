<?php

require_once dirname(__DIR__) . '/controller/PosController.php';

class Router
{
    private array $routes = [
        '/' => ['controller' => 'PosController', 'action' => 'traiter'],
        '/pos' => ['controller' => 'PosController', 'action' => 'traiter'],
    ];

    public function __construct()
    {
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
            'PosController' => new PosController(),
            default => new $controllerClass(),
        };
    }
}