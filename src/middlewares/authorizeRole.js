// Middleware pour autoriser un ou plusieurs rôles à accéder à une route

function authorizeRole(...rolesAutorises) {
  return (req, res, next) => {
    // Vérifie si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).json({ error: 'Utilisateur non authentifié' });
    }

    // Vérifie si le rôle de l'utilisateur est autorisé
    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès interdit : rôle insuffisant' });
    }

    // Passe au middleware suivant si tout est bon
    next();
  };
}

module.exports = authorizeRole;
