const { query } = require('../db');

const Response = {
  async create({ id, invitationId, clickedYes, selectedDate, feedbackText }) {
    await query(
      `INSERT INTO responses (id, invitation_id, clicked_yes, selected_date, feedback_text)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, invitationId, clickedYes ? 1 : 0, selectedDate || null, feedbackText || null]
    );
  },

  async findByInvitationId(invitationId) {
    const result = await query(
      `SELECT * FROM responses WHERE invitation_id = $1 ORDER BY created_at DESC`,
      [invitationId]
    );
    return result.rows;
  },

  async findById(id) {
    const result = await query(`SELECT * FROM responses WHERE id = $1`, [id]);
    return result.rows[0] || null;
  },

  async deleteById(id) {
    await query(`DELETE FROM responses WHERE id = $1`, [id]);
  },

  async update(id, updates) {
    const sets = [];
    const params = [];
    let i = 1;
    if (updates.clickedYes !== undefined) { sets.push(`clicked_yes = $${i++}`); params.push(updates.clickedYes ? 1 : 0); }
    if (updates.selectedDate !== undefined) { sets.push(`selected_date = $${i++}`); params.push(updates.selectedDate); }
    if (updates.feedbackText !== undefined) { sets.push(`feedback_text = $${i++}`); params.push(updates.feedbackText); }
    if (!sets.length) return;
    params.push(id);
    await query(`UPDATE responses SET ${sets.join(', ')} WHERE id = $${i++}`, params);
  },
};

module.exports = Response;
