<?php

require_once dirname(__DIR__) . '/src/core/Database.php';
require_once dirname(__DIR__) . '/src/core/Router.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

