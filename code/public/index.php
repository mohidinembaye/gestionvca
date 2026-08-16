<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once dirname(__DIR__) . '/src/core/Database.php';
require_once dirname(__DIR__) . '/src/core/Router.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

new Router();
