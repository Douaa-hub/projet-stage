const db = require('../../config/db');
exports.getNotifications = (req, res) => {
  console.log('Headers reçus:', req.headers); // Vérifiez si le token est présent
  // ... reste du code
};
exports.getNotifications = (req, res) => {
  console.log('Dans getNotifications, req.user =', req.user);

  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  const userId = req.user.id;
  const sql = `
    SELECT * FROM Notification 
    WHERE id_utilisateur = ? 
    ORDER BY date_envoi DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL getNotifications:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
};

exports.getUnreadNotifications = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  const userId = req.user.id;
  const sql = `
    SELECT * FROM Notification 
    WHERE id_utilisateur = ? AND lu = 0
    ORDER BY date_envoi DESC
  `;
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Erreur SQL getUnreadNotifications:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
};

exports.markAsRead = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  const userId = req.user.id;
  const notificationId = req.params.id;
  const sql = `
    UPDATE Notification 
    SET lu = 1 
    WHERE id = ? AND id_utilisateur = ?
  `;
  db.query(sql, [notificationId, userId], (err, result) => {
    if (err) {
      console.error('Erreur SQL markAsRead:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification non trouvée ou accès refusé." });
    }
    res.json({ message: "Notification marquée comme lue." });
  });
};
