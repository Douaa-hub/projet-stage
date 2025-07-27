const db = require('../../config/db');

// Créer une nouvelle demande
exports.creerDemande = (data, callback) => {
  const { date_sortie, motif, id_utilisateur } = data;

  if (!date_sortie || !motif || !id_utilisateur) {
    return callback(new Error('Tous les champs sont obligatoires.'));
  }

  const sql = `
    INSERT INTO DemandeSortie (date_demande, date_sortie, motif, statut, id_utilisateur)
    VALUES (NOW(), ?, ?, 'en_attente', ?)
  `;
  db.query(sql, [date_sortie, motif, id_utilisateur], callback);
};

// Obtenir toutes les demandes (avec infos utilisateur)
exports.getAllDemandes = (callback) => {
  const sql = `
    SELECT ds.*, u.nom, u.prenom
    FROM DemandeSortie ds
    JOIN Utilisateur u ON ds.id_utilisateur = u.id
    ORDER BY ds.date_demande DESC
  `;
  db.query(sql, callback);
};

// Obtenir les demandes d’un utilisateur
exports.getDemandesByUser = (id_utilisateur, callback) => {
  const sql = `
    SELECT * FROM DemandeSortie 
    WHERE id_utilisateur = ? 
    ORDER BY date_demande DESC
  `;
  db.query(sql, [id_utilisateur], callback);
};

// Modifier une demande (si en attente et appartient à l’utilisateur)
exports.updateDemande = (id, data, callback) => {
  const { date_sortie, motif, id_utilisateur } = data;

  const checkSql = `
    SELECT * FROM DemandeSortie
    WHERE id = ? AND id_utilisateur = ? AND statut = 'en_attente'
  `;
  db.query(checkSql, [id, id_utilisateur], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(new Error('Demande non modifiable'));

    const updateSql = `
      UPDATE DemandeSortie
      SET date_sortie = ?, motif = ?
      WHERE id = ?
    `;
    db.query(updateSql, [date_sortie, motif, id], callback);
  });
};

// Supprimer une demande (si en attente et appartient à l’utilisateur)
exports.deleteDemande = (id, id_utilisateur, callback) => {
  const checkSql = `
    SELECT * FROM DemandeSortie
    WHERE id = ? AND id_utilisateur = ? AND statut = 'en_attente'
  `;
  db.query(checkSql, [id, id_utilisateur], (err, results) => {
    if (err) return callback(err);
    if (results.length === 0) return callback(new Error('Demande non supprimable'));

    const deleteSql = `DELETE FROM DemandeSortie WHERE id = ?`;
    db.query(deleteSql, [id], callback);
  });
};

// Valider ou refuser une demande + notifier
exports.validerDemande = (id, statut, callback) => {
  if (!['validee', 'refusee'].includes(statut)) {
    return callback(new Error('Statut invalide'));
  }

  const updateSql = `UPDATE DemandeSortie SET statut = ? WHERE id = ?`;
  db.query(updateSql, [statut, id], (err) => {
    if (err) return callback(err);

    const messageNotif = statut === 'validee' 
      ? 'Votre demande a été validée.'
      : 'Votre demande a été refusée.';

    const notifSql = `
      INSERT INTO Notification (id_utilisateur, message, date_notification)
      SELECT id_utilisateur, ?, NOW()
      FROM DemandeSortie
      WHERE id = ?
    `;
    db.query(notifSql, [messageNotif, id], callback);
  });
};

// Obtenir les demandes par statut
exports.getByStatut = (statut, callback) => {
  const sql = `
    SELECT * FROM DemandeSortie
    WHERE statut = ?
    ORDER BY date_demande DESC
  `;
  db.query(sql, [statut], callback);
};
