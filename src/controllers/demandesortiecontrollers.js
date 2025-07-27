const db = require('../../config/db');
const moment = require('moment-timezone');

// Créer une nouvelle demande
exports.creerDemande = (req, res) => {
  if (req.user.role !== 'employe') {
    return res.status(403).json({ error: "Seuls les employés peuvent créer des demandes." });
  }

  const { date_sortie, motif } = req.body;
  const id_utilisateur = req.user.id;

  if (!date_sortie || !motif) {
    return res.status(400).json({ error: "Date de sortie et motif sont obligatoires." });
  }

  const localDateSortie = moment(date_sortie).tz('Africa/Tunis');

  if (!localDateSortie.isValid()) {
    return res.status(400).json({ error: "Date de sortie invalide. Format attendu : YYYY-MM-DDTHH:mm" });
  }

  if (localDateSortie.isBefore(moment().tz('Africa/Tunis'))) {
    return res.status(400).json({ error: "La date de sortie doit être une date future." });
  }

  if (motif.trim().length < 5) {
    return res.status(400).json({ error: "Le motif doit contenir au moins 5 caractères." });
  }

  const sqlResp = "SELECT id_responsable FROM Utilisateur WHERE id = ?";
  db.query(sqlResp, [id_utilisateur], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0 || !results[0].id_responsable) {
      return res.status(400).json({ error: "Responsable non trouvé pour cet employé." });
    }

    const id_responsable = results[0].id_responsable;

    const sql = `
      INSERT INTO DemandeSortie (date_demande, date_sortie, motif, statut, id_utilisateur, id_responsable)
      VALUES (NOW(), ?, ?, 'en_attente', ?, ?)
    `;
    db.query(sql, [localDateSortie.format('YYYY-MM-DD HH:mm:ss'), motif, id_utilisateur, id_responsable], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Demande créée avec succès', id: result.insertId });
    });
  });
};

// Obtenir toutes les demandes
exports.getAllDemandes = (req, res) => {
  const sql = `
    SELECT ds.*, u.nom, u.prenom 
    FROM DemandeSortie ds 
    JOIN Utilisateur u ON ds.id_utilisateur = u.id
    ORDER BY ds.date_demande DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Obtenir les demandes d’un utilisateur
exports.getDemandesByUser = (req, res) => {
  const { id } = req.params;
  if (req.user.role !== 'admin' && req.user.id != id) {
    return res.status(403).json({ error: 'Accès interdit' });
  }

  const sql = `
    SELECT * FROM DemandeSortie 
    WHERE id_utilisateur = ? 
    ORDER BY date_demande DESC
  `;
  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};

// Modifier une demande
exports.updateDemande = (req, res) => {
  const { id } = req.params;
  const { date_sortie, motif } = req.body;
  const id_utilisateur = req.user.id;

  if (!date_sortie || !motif) {
    return res.status(400).json({ error: "Date de sortie et motif sont obligatoires." });
  }

  const localDateSortie = moment(date_sortie).tz('Africa/Tunis');

  if (!localDateSortie.isValid()) {
    return res.status(400).json({ error: "Date de sortie invalide." });
  }

  if (localDateSortie.isBefore(moment().tz('Africa/Tunis'))) {
    return res.status(400).json({ error: "La date de sortie doit être une date future." });
  }

  if (motif.trim().length < 5) {
    return res.status(400).json({ error: "Le motif doit contenir au moins 5 caractères." });
  }

  const checkSql = `
    SELECT * FROM DemandeSortie 
    WHERE id = ? AND id_utilisateur = ? AND statut = 'en_attente'
  `;
  db.query(checkSql, [id, id_utilisateur], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(403).json({ error: "Demande non modifiable" });
    }

    const updateSql = `
      UPDATE DemandeSortie 
      SET date_sortie = ?, motif = ? 
      WHERE id = ?
    `;
    db.query(updateSql, [localDateSortie.format('YYYY-MM-DD HH:mm:ss'), motif, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: 'Demande modifiée avec succès.' });
    });
  });
};

// Supprimer une demande
exports.deleteDemande = (req, res) => {
  const { id } = req.params;
  const id_utilisateur = req.user.id;

  const checkSql = `
    SELECT * FROM DemandeSortie 
    WHERE id = ? AND id_utilisateur = ? AND statut = 'en_attente'
  `;
  db.query(checkSql, [id, id_utilisateur], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(403).json({ error: "Demande non supprimable" });
    }

    const deleteSql = `DELETE FROM DemandeSortie WHERE id = ?`;
    db.query(deleteSql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ message: "Demande supprimée avec succès." });
    });
  });
};

// Valider ou refuser une demande (avec Socket.IO émetteur ciblé)
exports.validerDemande = (req, res) => {
  const io = req.app.get('io');  // Récupère l'instance Socket.IO
  const { id } = req.params;
  const { statut } = req.body;

  if (!statut) {
    return res.status(400).json({ error: "Le statut est obligatoire." });
  }

  if (!['validee', 'refusee'].includes(statut)) {
    return res.status(400).json({ error: 'Statut invalide. Doit être "validee" ou "refusee".' });
  }

  const checkSql = `SELECT * FROM DemandeSortie WHERE id = ?`;
  db.query(checkSql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(404).json({ error: 'Demande non trouvée.' });
    }

    const demande = results[0];

    if (req.user.id !== demande.id_responsable) {
      return res.status(403).json({ error: "Vous n'êtes pas autorisé à valider cette demande." });
    }

    const updateSql = `UPDATE DemandeSortie SET statut = ? WHERE id = ?`;
    db.query(updateSql, [statut, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const messageNotif = statut === 'validee'
        ? 'Votre demande a été validée.'
        : 'Votre demande a été refusée.';

      const notifSql = `
        INSERT INTO Notification (id_utilisateur, type, message, date_envoi, lu, id_demande_sortie)
        SELECT id_utilisateur, 'demande_sortie', ?, NOW(), 0, id 
        FROM DemandeSortie 
        WHERE id = ?
      `;
      db.query(notifSql, [messageNotif, id], (err3) => {
        if (err3) return res.status(500).json({ error: err3.message });

        // Émettre l’événement socket uniquement au demandeur
        io.to(`user_${demande.id_utilisateur}`).emit('nouvelle-notification', {
          type: 'demande_sortie',
          id_demande_sortie: demande.id,
          message: messageNotif,
        });

        if (statut === 'validee') {
          const notifSqlGardien = `
            INSERT INTO Notification (id_utilisateur, type, message, date_envoi, lu)
            SELECT id, 'validation_sortie', CONCAT('Demande validée pour employé ', u.nom, ' ', u.prenom), NOW(), 0
            FROM Utilisateur u
            WHERE u.role = 'gardien'
          `;
          db.query(notifSqlGardien, (err4) => {
            if (err4) return res.status(500).json({ error: err4.message });
            io.to('role_gardien').emit('nouvelle-notification', {
              type: 'validation_sortie',
              message: `Demande validée pour employé ${demande.nom} ${demande.prenom}`,
            });
            res.json({ message: `Demande ${statut} et notifications envoyées.` });
          });
        } else {
          res.json({ message: `Demande ${statut} et notification envoyée.` });
        }
      });
    });
  });
};

// Obtenir les demandes à valider par le responsable
exports.getDemandesAValiderParResponsable = (req, res) => {
  const id_responsable = req.user.id;

  const sql = `
    SELECT ds.*, u.nom, u.prenom 
    FROM DemandeSortie ds
    JOIN Utilisateur u ON ds.id_utilisateur = u.id
    WHERE ds.id_responsable = ? AND ds.statut = 'en_attente'
    ORDER BY ds.date_demande DESC
  `;
  db.query(sql, [id_responsable], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};




