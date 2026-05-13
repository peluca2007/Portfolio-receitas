const express = require('express');
const HabilidadeController = require('../controllers/HabilidadeController');
const authAdmin = require('../middlewares/authAdmin');
const router = express.Router();

router.get('/', authAdmin, HabilidadeController.dashboard);
router.post('/cadastrar', authAdmin, HabilidadeController.createView);
router.post('/editar/:id', authAdmin, HabilidadeController.updateView);
router.post('/excluir/:id', authAdmin, HabilidadeController.deleteView);

module.exports = router;