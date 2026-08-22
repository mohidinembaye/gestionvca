<?php

require_once dirname(__DIR__) . '/vendor/autoload.php';

use PapeMohidineMbaye\Code\Core\Router;
use PapeMohidineMbaye\Code\Core\SessionManager;

SessionManager::start();

new Router();
