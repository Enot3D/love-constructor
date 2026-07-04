const express = require('express');
const { query } = require('../db');
const { adminMiddleware } = require('../middleware/admin');

const router = express.Router();

// All admin routes require admin role
router.use(adminMiddleware);

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const [users, invitations, responses, activeUsers, recentUsers, recentInvitations] = await Promise.all([
      query(`SELECT COUNT(*) as total FROM users`),
      query(`SELECT COUNT(*) as total FROM invitations`),
      query(`SELECT COUNT(*) as total FROM responses`),
      query(`SELECT COUNT(*) as total FROM users WHERE last_login > now() - interval '7 days'`),
      query(`SELECT id, email, display_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 10`),
      query(`SELECT i.id, i.title, i.girl_name, i.created_at, u.email as owner_email FROM invitations i JOIN users u ON i.user_id = u.id ORDER BY i.created_at DESC LIMIT 10`),
    ]);

    // Responses stats
    const respStats = await query(`
      SELECT
        COUNT(*) as total,
        SUM(clicked_yes) as yes_count,
        COUNT(CASE WHEN selected_date IS NOT NULL THEN 1 END) as date_count
      FROM responses
    `);

    // Invitations per day (last 30 days)
    const dailyInvitations = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM invitations
      WHERE created_at > now() - interval '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Users per day (last 30 days)
    const dailyUsers = await query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at > now() - interval '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json({
      totals: {
        users: parseInt(users.rows[0].total),
        invitations: parseInt(invitations.rows[0].total),
        responses: parseInt(responses.rows[0].total),
        activeUsers: parseInt(activeUsers.rows[0].total),
      },
      responses: {
        total: parseInt(respStats.rows[0].total),
        yesCount: parseInt(respStats.rows[0].yes_count || 0),
        dateCount: parseInt(respStats.rows[0].date_count || 0),
      },
      recentUsers: recentUsers.rows,
      recentInvitations: recentInvitations.rows,
      dailyInvitations: dailyInvitations.rows,
      dailyUsers: dailyUsers.rows,
    });
  } catch (e) {
    console.error('Admin stats error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// System info
router.get('/system', async (req, res) => {
  try {
    const dbVersion = await query(`SELECT version()`);
    const dbSize = await query(`SELECT pg_size_pretty(pg_database_size(current_database())) as size`);
    const tableCounts = await query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM invitations) as invitations,
        (SELECT COUNT(*) FROM responses) as responses
    `);

    res.json({
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      dbVersion: dbVersion.rows[0].version,
      dbSize: dbSize.rows[0].size,
      tableCounts: tableCounts.rows[0],
      nodeVersion: process.version,
    });
  } catch (e) {
    console.error('Admin system error:', e);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
