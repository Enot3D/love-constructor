const { query } = require('../db');

const Invitation = {
  async create({ id, userId, title, html, senderToken }) {
    await query(
      `INSERT INTO invitations (id, user_id, title, html, sender_token)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, userId, title, html, senderToken]
    );
    return this.findById(id);
  },

  async findById(id) {
    const result = await query(`SELECT * FROM invitations WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  async findByUserId(userId) {
    const result = await query(
      `SELECT id, title, created_at, is_active FROM invitations WHERE user_id = $1 AND is_active = 1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  },

  async getResponseStats(invitationId) {
    const result = await query(
      `SELECT
        COUNT(*) as total,
        SUM(clicked_yes) as yes_count,
        COUNT(CASE WHEN selected_date IS NOT NULL THEN 1 END) as date_count
       FROM responses WHERE invitation_id = $1`,
      [invitationId]
    );
    return result.rows[0] || { total: 0, yes_count: 0, date_count: 0 };
  },

  async delete(id, userId) {
    await query(
      `UPDATE invitations SET is_active = 0 WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );
  },

  async update(id, userId, { title, html }) {
    const sets = [];
    const params = [];
    let i = 1;
    if (title !== undefined) { sets.push(`title = $${i++}`); params.push(title); }
    if (html !== undefined) { sets.push(`html = $${i++}`); params.push(html); }
    if (!sets.length) return;
    params.push(id, userId);
    await query(`UPDATE invitations SET ${sets.join(', ')} WHERE id = $${i++} AND user_id = $${i++}`, params);
  },
};

module.exports = Invitation;
