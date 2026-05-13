const express = require('express');
const router = express.Router();
const AlunoHabilidadeController = require('../controllers/AlunoHabilidadeController');

// GET - Renderiza a tela visual com o formulário e a lista atual
router.get('/editar', AlunoHabilidadeController.create);

// POST - Processa o envio do formulário gravando a nota N:N
router.post('/editar', AlunoHabilidadeController.vincular);

module.exports = router;