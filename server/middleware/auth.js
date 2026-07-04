const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

// Optional auth — doesn't fail, just sets req.userId if token present
function optionalAuth(req, res, next) {
  const token = req.cookies.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwtSecret);
      req.userId = decoded.userId;
    } catch (e) { /* ignore */ }
  }
  next();
}

module.exports = { authMiddleware, optionalAuth };
