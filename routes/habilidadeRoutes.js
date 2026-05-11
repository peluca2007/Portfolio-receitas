const express = require('express');
const HabilidadeController = require('../controllers/HabilidadeController');
const router = express.Router();

router.post('/', HabilidadeController.create);       // Criar
router.get('/', HabilidadeController.list);          // Listar
router.put('/:id', HabilidadeController.update);     // Editar
router.delete('/:id', HabilidadeController.delete);  // Excluir

module.exports = router;