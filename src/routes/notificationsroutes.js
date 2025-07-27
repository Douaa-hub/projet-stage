const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationscontroller');
const authenticateToken = require('../middlewares/authMiddleware');

// Récupérer toutes les notifications de l'utilisateur connecté
router.get('/', authenticateToken, notificationController.getNotifications);

// Récupérer uniquement les notifications non lues
router.get('/non-lues', authenticateToken, notificationController.getUnreadNotifications);

// Marquer une notification comme lue
router.put('/:id/lu', authenticateToken, notificationController.markAsRead);

module.exports = router;


