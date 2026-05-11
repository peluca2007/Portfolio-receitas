const express = require('express');
const CommentController = require('../controllers/CommentController');
const router = express.Router();

router.post('/', CommentController.adicionar);               // Criar comentário
router.get('/:receita_id', CommentController.listarPorReceita); // Listar comentários da receita

module.exports = router;