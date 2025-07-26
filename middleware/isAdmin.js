// middleware/isAdmin.js
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next(); // Permite continuar si es admin
  } else {
    res.status(403).json({ error: 'Forbidden: Admins only' });
  }
}

module.exports = isAdmin;
