const bcrypt = require('bcrypt');
const db = require('../../config/db');

exports.creerUtilisateur = async (req, res) => {
  try {
    const { nom, prenom, email, mot_de_passe, role } = req.body;

    if (!nom || !prenom || !email || !mot_de_passe || !role) {
      return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    // Vérifier si email existe déjà
    const checkEmailSql = 'SELECT * FROM Utilisateur WHERE email = ?';
    db.query(checkEmailSql, [email], async (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      if (results.length > 0) {
        return res.status(400).json({ error: "Email déjà utilisé." });
      }

      // Hash du mot de passe
      const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

      const insertSql = `
        INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe, role)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertSql, [nom, prenom, email, hashedPassword, role], (err2, result) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.status(201).json({ message: "Utilisateur créé avec succès.", id: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
