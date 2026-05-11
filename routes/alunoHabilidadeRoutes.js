const express = require('express');
const AlunoHabilidadeController = require('../controllers/AlunoHabilidadeController');
const router = express.Router();

router.post('/', AlunoHabilidadeController.vincular);        // Vincular habilidade + nível
router.get('/:aluno_id', AlunoHabilidadeController.listarPorAluno); // Ver currículo do aluno

module.exports = router;