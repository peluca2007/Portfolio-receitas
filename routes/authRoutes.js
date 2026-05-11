const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

// Rota para mostrar o formulário
router.get('/login', AuthController.showLogin);

// Rota para processar o formulário
router.post('/login', AuthController.login);

// Rota para sair
router.get('/logout', AuthController.logout);

module.exports = router;