const bcrypt = require('bcryptjs');
const { query } = require('../db');

const User = {
  async create({ email, password, vkId, displayName, avatarUrl }) {
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null;

    const result = await query(
      `INSERT INTO users (email, password_hash, vk_id, display_name, avatar_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [email || null, passwordHash, vkId || null, displayName, avatarUrl || null]
    );

    return result.rows[0];
  },

  async findByIdAsync(id) {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await query(`SELECT * FROM users WHERE email = $1`, [email]);
    return result.rows[0] || null;
  },

  async findByVkId(vkId) {
    const result = await query(`SELECT * FROM users WHERE vk_id = $1`, [vkId]);
    return result.rows[0] || null;
  },

  async verifyPassword(user, password) {
    if (!user.password_hash) return false;
    return bcrypt.compareSync(password, user.password_hash);
  },

  async updateLastLogin(id) {
    await query(`UPDATE users SET last_login = now()::text WHERE id = $1`, [id]);
  },
};

module.exports = User;
