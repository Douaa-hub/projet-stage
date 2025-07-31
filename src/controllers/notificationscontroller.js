const db = require('../../config/db');

exports.getNotifications = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  const userId = req.user.id;
  const role = req.user.role;

  let sql;
  let params = [];

  if (role === 'gardien') {
    // Pour gardien : toutes les notifications de type 'demande_sortie' liées aux demandes validées
    sql = `
      SELECT n.*, u.matricule, ds.date_sortie
      FROM Notification n
      LEFT JOIN DemandeSortie ds ON n.id_demande_sortie = ds.id
      LEFT JOIN Utilisateur u ON ds.id_utilisateur = u.id
      WHERE n.type = 'demande_sortie' AND ds.statut = 'validee'
      ORDER BY n.date_envoi DESC
    `;
  } else {
    // Pour les autres rôles : notifications propres à l'utilisateur
    sql = `
      SELECT * FROM Notification 
      WHERE id_utilisateur = ? 
      ORDER BY date_envoi DESC
    `;
    params = [userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur SQL getNotifications:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json(results);
  });
};

exports.getNotificationDetails = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }

  const userId = req.user.id;
  const role = req.user.role;

  let sql;
  let params = [];

  if (role === 'gardien') {
    sql = `
      SELECT 
        n.id,
        n.id_utilisateur,
        n.type,
        n.message,
        n.date_envoi,
        n.lu,
        n.id_demande_sortie,
        ds.date_sortie,
        u.matricule,
        u.nom,
        u.prenom
      FROM Notification n
      LEFT JOIN DemandeSortie ds ON n.id_demande_sortie = ds.id
      LEFT JOIN Utilisateur u ON ds.id_utilisateur = u.id
      WHERE n.type = 'demande_sortie' AND ds.statut = 'validee'
      ORDER BY n.date_envoi DESC
    `;
  } else {
    sql = `
      SELECT 
        n.id,
        n.id_utilisateur,
        n.type,
        n.message,
        n.date_envoi,
        n.lu,
        n.id_demande_sortie,
        ds.date_sortie,
        u.matricule,
        u.nom,
        u.prenom
      FROM Notification n
      LEFT JOIN DemandeSortie ds ON n.id_demande_sortie = ds.id
      LEFT JOIN Utilisateur u ON ds.id_utilisateur = u.id
      WHERE n.id_utilisateur = ?
      ORDER BY n.date_envoi DESC
    `;
    params = [userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur SQL getNotificationDetails:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    
    const formattedResults = results.map(notif => ({
      ...notif,
      date_sortie: notif.date_sortie ? new Date(notif.date_sortie).toISOString() : null,
      date_envoi: new Date(notif.date_envoi).toISOString()
    }));

    res.json(formattedResults);
  });
};

exports.getUnreadNotifications = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  
  const userId = req.user.id;
  const role = req.user.role;

  let sql;
  let params = [];

  if (role === 'gardien') {
    sql = `
      SELECT COUNT(*) as count 
      FROM Notification n
      LEFT JOIN DemandeSortie ds ON n.id_demande_sortie = ds.id
      WHERE n.type = 'demande_sortie' AND ds.statut = 'validee' AND n.lu = 0
    `;
  } else {
    sql = `
      SELECT COUNT(*) as count 
      FROM Notification 
      WHERE id_utilisateur = ? AND lu = 0
    `;
    params = [userId];
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error('Erreur SQL getUnreadNotifications:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    res.json({ count: results[0].count });
  });
};

exports.markAsRead = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  
  const userId = req.user.id;
  const notificationId = req.params.id;

  let sql;
  let params;

  if (req.user.role === 'gardien') {
    // Gardien peut marquer toute notification lue (pas filtrée par id_utilisateur)
    sql = `UPDATE Notification SET lu = 1 WHERE id = ?`;
    params = [notificationId];
  } else {
    sql = `UPDATE Notification SET lu = 1 WHERE id = ? AND id_utilisateur = ?`;
    params = [notificationId, userId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erreur SQL markAsRead:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Notification non trouvée ou accès refusé." });
    }
    
    res.json({ success: true, message: "Notification marquée comme lue." });
  });
};

exports.markAllAsRead = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ error: 'Utilisateur non authentifié' });
  }
  
  const userId = req.user.id;
  const role = req.user.role;

  let sql;
  let params = [];

  if (role === 'gardien') {
    sql = `
      UPDATE Notification n
      JOIN DemandeSortie ds ON n.id_demande_sortie = ds.id
      SET n.lu = 1 
      WHERE n.type = 'demande_sortie' AND ds.statut = 'validee' AND n.lu = 0
    `;
  } else {
    sql = `
      UPDATE Notification 
      SET lu = 1 
      WHERE id_utilisateur = ? AND lu = 0
    `;
    params = [userId];
  }

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error('Erreur SQL markAllAsRead:', err);
      return res.status(500).json({ error: 'Erreur base de données' });
    }
    
    res.json({ 
      success: true, 
      message: `Toutes les notifications ont été marquées comme lues.`,
      count: result.affectedRows
    });
  });
};
