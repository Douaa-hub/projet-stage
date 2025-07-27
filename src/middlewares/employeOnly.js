module.exports = (req, res, next) => {
  if (req.user.role !== 'employe') {
    return res.status(403).json({ error: "Accès interdit : réservé aux employés." });
  }
  next();
};
