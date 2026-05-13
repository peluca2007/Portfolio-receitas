const express = require('express');
const router = express.Router();
const ReceitaController = require('../controllers/ReceitaController');

// Criação
router.get('/nova', ReceitaController.create);
router.post('/nova', ReceitaController.store);

// Gestão (Requisito 1.5) 
router.get('/editar/:id', ReceitaController.edit);
router.post('/editar/:id', ReceitaController.update);
router.post('/excluir/:id', ReceitaController.delete);

// Visualização (Requisito 1.7) 
router.get('/detalhes/:id', ReceitaController.show);

module.exports = router;