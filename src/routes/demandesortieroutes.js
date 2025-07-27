const express = require('express');
const router = express.Router();
const demandesortieController = require('../controllers/demandesortiecontrollers');
const verifyToken = require('../middlewares/authMiddleware');

// Routes protégées
router.post('/', verifyToken, demandesortieController.creerDemande);
router.get('/', verifyToken, demandesortieController.getAllDemandes);
router.get('/user/:id', verifyToken, demandesortieController.getDemandesByUser);
router.put('/:id', verifyToken, demandesortieController.updateDemande);
router.delete('/:id', verifyToken, demandesortieController.deleteDemande);

// Correction PUT (pas POST) pour valider/refuser demande
router.put('/:id/valider', verifyToken, demandesortieController.validerDemande);

router.get('/responsable/a_valider', verifyToken, demandesortieController.getDemandesAValiderParResponsable);

module.exports = router;



