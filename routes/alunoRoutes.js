const express = require('express');
const AlunoController = require('../controllers/AlunoController');
const router = express.Router();

router.post('/', AlunoController.create);       // Criar aluno
router.get('/', AlunoController.list);          // Listar alunos
router.put('/:id', AlunoController.update);     // Editar aluno
router.delete('/:id', AlunoController.delete);  // Excluir aluno

module.exports = router;