const db = require('../../config/db');

// Obtenir les notifications d’un utilisateur
exports.findByUserId = (id_utilisateur, callback) => {
  const sql = `
    SELECT * FROM Notification 
    WHERE id_utilisateur = ? 
    ORDER BY date_notification DESC
  `;

  db.query(sql, [id_utilisateur], callback);
};
