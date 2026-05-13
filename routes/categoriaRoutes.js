const express = require('express');
const CategoriaController = require('../controllers/CategoriaController');
const authAdmin = require('../middlewares/authAdmin');
const router = express.Router();

// Rotas do CRUD (API)
router.post('/api', authAdmin, CategoriaController.create);       // Criar
router.get('/api', authAdmin, CategoriaController.list);          // Listar
router.put('/api/:id', authAdmin, CategoriaController.update);    // Editar por ID
router.delete('/api/:id', authAdmin, CategoriaController.delete); // Excluir por ID

// Rotas de Dashboard
router.get('/', authAdmin, CategoriaController.dashboard);
router.post('/cadastrar', authAdmin, CategoriaController.createView);
router.post('/editar/:id', authAdmin, CategoriaController.updateView);
router.post('/excluir/:id', authAdmin, CategoriaController.deleteView);

module.exports = router;