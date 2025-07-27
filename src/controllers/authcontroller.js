const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'ton_secret_pour_jwt';

// Inscription
exports.register = (req, res) => {
  const { nom, prenom, email, mot_de_passe } = req.body;
  if (!nom || !prenom || !email || !mot_de_passe) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires.' });
  }

  const checkSql = 'SELECT * FROM Utilisateur WHERE email = ?';
  db.query(checkSql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
    const insertSql = 'INSERT INTO Utilisateur (nom, prenom, email, mot_de_passe) VALUES (?, ?, ?, ?)';
    db.query(insertSql, [nom, prenom, email, hashedPassword], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json({ message: 'Utilisateur créé avec succès.', id: result.insertId });
    });
  });
};

// Connexion
exports.login = (req, res) => {
  const { email, mot_de_passe } = req.body;
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe sont obligatoires.' });
  }

  const sql = 'SELECT * FROM Utilisateur WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const user = results[0];
    const passwordMatch = await bcrypt.compare(mot_de_passe, user.mot_de_passe);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  });
};
