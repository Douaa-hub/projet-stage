const express = require('express');
const router = express.Router();

const utilisateurController = require('../controllers/utilisateurController');

// Route création utilisateur (pas besoin d’auth pour s’inscrire)
router.post('/', utilisateurController.creerUtilisateur);

module.exports = router;
