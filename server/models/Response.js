const { getDb, saveDb } = require('../db');

const Response = {
  async create({ id, invitationId, clickedYes, selectedDate, feedbackText }) {
    const db = await getDb();
    db.run(
      `INSERT INTO responses (id, invitation_id, clicked_yes, selected_date, feedback_text)
       VALUES (?, ?, ?, ?, ?)`,
      [id, invitationId, clickedYes ? 1 : 0, selectedDate || null, feedbackText || null]
    );
    saveDb();
  },

  async findByInvitationId(invitationId) {
    const db = await getDb();
    const results = db.exec(
      `SELECT * FROM responses WHERE invitation_id = ? ORDER BY created_at DESC`,
      [invitationId]
    );
    if (!results.length) return [];
    return results[0].values.map(v => rowToObj(results[0].columns, v));
  },

  async findById(id) {
    const db = await getDb();
    const results = db.exec(`SELECT * FROM responses WHERE id = ?`, [id]);
    if (!results.length || !results[0].values.length) return null;
    return rowToObj(results[0].columns, results[0].values[0]);
  },

  async deleteById(id) {
    const db = await getDb();
    db.run(`DELETE FROM responses WHERE id = ?`, [id]);
    saveDb();
  },

  async update(id, updates) {
    const db = await getDb();
    const sets = [];
    const params = [];
    if (updates.clickedYes !== undefined) { sets.push('clicked_yes = ?'); params.push(updates.clickedYes ? 1 : 0); }
    if (updates.selectedDate !== undefined) { sets.push('selected_date = ?'); params.push(updates.selectedDate); }
    if (updates.feedbackText !== undefined) { sets.push('feedback_text = ?'); params.push(updates.feedbackText); }
    if (!sets.length) return;
    params.push(id);
    db.run(`UPDATE responses SET ${sets.join(', ')} WHERE id = ?`, params);
    saveDb();
  },
};

function rowToObj(columns, values) {
  const obj = {};
  columns.forEach((col, i) => { obj[col] = values[i]; });
  return obj;
}

module.exports = Response;
