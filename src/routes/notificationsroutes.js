const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationscontroller');
const authenticateToken = require('../middlewares/authMiddleware');

// Récupérer toutes les notifications (avec détails)
router.get('/', authenticateToken, notificationController.getNotifications);

// Récupérer les notifications avec détails complets
router.get('/details', authenticateToken, notificationController.getNotificationDetails);

// Compter les notifications non lues
router.get('/unread/count', authenticateToken, notificationController.getUnreadNotifications);

// Marquer une notification comme lue
router.put('/:id/read', authenticateToken, notificationController.markAsRead);

// Marquer toutes les notifications comme lues
router.put('/read-all', authenticateToken, notificationController.markAllAsRead);



module.exports = router;


