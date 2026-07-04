const express = require('express');
const { query } = require('../db');
const { adminMiddleware } = require('../middleware/admin');

const router = express.Router();

router.use(adminMiddleware);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const users = await query(`SELECT COUNT(*) as total FROM users`);
    const invitations = await query(`SELECT COUNT(*) as total FROM invitations`);
    const responses = await query(`SELECT COUNT(*) as total FROM responses`);

    const respStats = await query(`
      SELECT
        COUNT(*) as total,
        COALESCE(SUM(clicked_yes), 0) as yes_count,
        COUNT(CASE WHEN selected_date IS NOT NULL AND selected_date != '' THEN 1 END) as date_count
      FROM responses
    `);

    const recentUsers = await query(
      `SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10`
    );

    const recentInvitations = await query(
      `SELECT i.id, i.title, i.girl_name, i.created_at, u.email as owner_email
       FROM invitations i
       LEFT JOIN users u ON i.user_id = u.id
       ORDER BY i.created_at DESC LIMIT 10`
    );

    res.json({
      totals: {
        users: parseInt(users.rows[0].total),
        invitations: parseInt(invitations.rows[0].total),
        responses: parseInt(responses.rows[0].total),
      },
      responses: {
        total: parseInt(respStats.rows[0].total),
        yesCount: parseInt(respStats.rows[0].yes_count),
        dateCount: parseInt(respStats.rows[0].date_count),
      },
      recentUsers: recentUsers.rows,
      recentInvitations: recentInvitations.rows,
    });
  } catch (e) {
    console.error('Admin stats error:', e.message);
    res.status(500).json({ error: 'Ошибка сервера: ' + e.message });
  }
});

// System info
router.get('/system', async (req, res) => {
  try {
    const dbVersion = await query(`SELECT version()`);
    const dbSize = await query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);

    res.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      dbVersion: dbVersion.rows[0].version,
      dbSize: dbSize.rows[0].size,
      nodeVersion: process.version,
    });
  } catch (e) {
    console.error('Admin system error:', e.message);
    res.status(500).json({ error: 'Ошибка сервера: ' + e.message });
  }
});

module.exports = router;
