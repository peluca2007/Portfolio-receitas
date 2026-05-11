const express = require('express');
const ReceitaController = require('../controllers/ReceitaController');
const router = express.Router();

router.post('/', ReceitaController.create);       // Cadastrar
router.get('/', ReceitaController.list);          // Listar
router.put('/:id', ReceitaController.update);     // Editar
router.delete('/:id', ReceitaController.delete);  // Excluir

module.exports = router;