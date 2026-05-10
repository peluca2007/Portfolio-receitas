const express = require('express');
const CategoriaController = require('../controllers/CategoriaController');
const router = express.Router();

// Rotas do CRUD (Testaremos no Insomnia)
router.post('/', CategoriaController.create);       // Criar
router.get('/', CategoriaController.list);          // Listar
router.put('/:id', CategoriaController.update);     // Editar por ID
router.delete('/:id', CategoriaController.delete);  // Excluir por ID

module.exports = router;