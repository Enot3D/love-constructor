const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../db');

const User = {
  async create({ email, password, vkId, displayName, avatarUrl }) {
    const db = await getDb();
    const passwordHash = password ? bcrypt.hashSync(password, 10) : null;

    db.run(
      `INSERT INTO users (email, password_hash, vk_id, display_name, avatar_url)
       VALUES (?, ?, ?, ?, ?)`,
      [email || null, passwordHash, vkId || null, displayName, avatarUrl || null]
    );

    saveDb();

    const result = db.exec(`SELECT last_insert_rowid() as id`);
    const id = result[0].values[0][0];
    return this.findByIdAsync(id);
  },

  async findByIdAsync(id) {
    const db = await getDb();
    const results = db.exec(`SELECT * FROM users WHERE id = ?`, [id]);
    if (!results.length || !results[0].values.length) return null;
    return rowToUser(results[0].columns, results[0].values[0]);
  },

  async findByEmail(email) {
    const db = await getDb();
    const results = db.exec(`SELECT * FROM users WHERE email = ?`, [email]);
    if (!results.length || !results[0].values.length) return null;
    return rowToUser(results[0].columns, results[0].values[0]);
  },

  async findByVkId(vkId) {
    const db = await getDb();
    const results = db.exec(`SELECT * FROM users WHERE vk_id = ?`, [vkId]);
    if (!results.length || !results[0].values.length) return null;
    return rowToUser(results[0].columns, results[0].values[0]);
  },

  async verifyPassword(user, password) {
    if (!user.password_hash) return false;
    return bcrypt.compareSync(password, user.password_hash);
  },

  async updateLastLogin(id) {
    const db = await getDb();
    db.run(`UPDATE users SET last_login = datetime('now') WHERE id = ?`, [id]);
    saveDb();
  },
};

function rowToUser(columns, values) {
  const obj = {};
  columns.forEach((col, i) => { obj[col] = values[i]; });
  return obj;
}

module.exports = User;
