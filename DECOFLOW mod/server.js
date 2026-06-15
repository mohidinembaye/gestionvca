// api/server.js
const jsonServer = require('json-server');
const server = jsonServer.create();

// Déclare le chemin vers ton fichier db.json (qui doit être à la racine du projet)
const router = jsonServer.router('db.json'); 
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Réécriture pour enlever le préfixe /api interne avant que json-server ne traite la requête
server.use(jsonServer.rewriter({
  '/api/*': '/$1'
}));

server.use(router);

module.exports = server;