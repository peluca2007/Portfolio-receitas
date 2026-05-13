const express = require('express');
const AlunoController = require('../controllers/AlunoController');
const router = express.Router();

router.get('/dashboard', AlunoController.dashboard);

module.exports = router;
