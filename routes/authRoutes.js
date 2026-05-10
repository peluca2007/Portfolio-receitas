const express = require('express');
const AuthController = require('../controllers/AuthController');
const router = express.Router();

// Rota POST para fazer login (onde o Insomnia vai bater)
router.post('/login', AuthController.login);

// Rota GET para sair
router.get('/logout', AuthController.logout);

module.exports = router;