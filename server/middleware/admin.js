const jwt = require('jsonwebtoken');
const config = require('../config');
const { query } = require('../db');

async function adminMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: 'Не авторизован' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const result = await query(`SELECT id, role FROM users WHERE id = $1`, [decoded.userId]);
    const user = result.rows[0];

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещён' });
    }

    req.userId = decoded.userId;
    req.userRole = user.role;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Недействительный токен' });
  }
}

module.exports = { adminMiddleware };
