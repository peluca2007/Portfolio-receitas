const express = require('express');
const AdminController = require('../controllers/AdminController');
const authAdmin = require('../middlewares/authAdmin');
const router = express.Router();

router.get('/', authAdmin, AdminController.dashboard);
router.get('/auditoria-habilidades', authAdmin, AdminController.auditoriaHabilidades);
router.post('/aluno-habilidade/atualizar', authAdmin, AdminController.atualizarAlunoHabilidade);
router.post('/cadastrar', authAdmin, AdminController.create);
router.post('/editar/:id', authAdmin, AdminController.update);
router.post('/excluir/:id', authAdmin, AdminController.delete);

module.exports = router;
