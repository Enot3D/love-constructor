const { getDb, saveDb } = require('../db');

const Invitation = {
  async create({ id, userId, title, html, senderToken }) {
    const db = await getDb();
    db.run(
      `INSERT INTO invitations (id, user_id, title, html, sender_token)
       VALUES (?, ?, ?, ?, ?)`,
      [id, userId, title, html, senderToken]
    );
    saveDb();
    return this.findById(id);
  },

  async findById(id) {
    const db = await getDb();
    const results = db.exec(`SELECT * FROM invitations WHERE id = ?`, [id]);
    if (!results.length || !results[0].values.length) return null;
    return rowToObj(results[0].columns, results[0].values[0]);
  },

  async findByUserId(userId) {
    const db = await getDb();
    const results = db.exec(
      `SELECT id, title, created_at, is_active FROM invitations WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    if (!results.length) return [];
    return results[0].values.map(v => rowToObj(results[0].columns, v));
  },

  async getResponseStats(invitationId) {
    const db = await getDb();
    const results = db.exec(
      `SELECT
        COUNT(*) as total,
        SUM(clicked_yes) as yes_count,
        COUNT(CASE WHEN selected_date IS NOT NULL THEN 1 END) as date_count
       FROM responses WHERE invitation_id = ?`,
      [invitationId]
    );
    if (!results.length || !results[0].values.length) {
      return { total: 0, yes_count: 0, date_count: 0 };
    }
    return rowToObj(results[0].columns, results[0].values[0]);
  },

  async delete(id, userId) {
    const db = await getDb();
    db.run(
      `UPDATE invitations SET is_active = 0 WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    saveDb();
  },

  async update(id, userId, { title, html }) {
    const db = await getDb();
    const sets = [];
    const params = [];
    if (title !== undefined) { sets.push('title = ?'); params.push(title); }
    if (html !== undefined) { sets.push('html = ?'); params.push(html); }
    if (!sets.length) return;
    params.push(id, userId);
    db.run(`UPDATE invitations SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`, params);
    saveDb();
  },
};

function rowToObj(columns, values) {
  const obj = {};
  columns.forEach((col, i) => { obj[col] = values[i]; });
  return obj;
}

module.exports = Invitation;
