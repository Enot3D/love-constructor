const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function getDb() {
  return pool;
}

async function query(text, params) {
  return pool.query(text, params);
}

// Create tables on startup
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        vk_id TEXT UNIQUE,
        display_name TEXT NOT NULL,
        avatar_url TEXT,
        created_at TEXT DEFAULT (now()::text),
        last_login TEXT
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        title TEXT,
        girl_name TEXT,
        html TEXT NOT NULL,
        sender_token TEXT NOT NULL,
        created_at TEXT DEFAULT (now()::text),
        is_active INTEGER DEFAULT 1
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        invitation_id TEXT NOT NULL REFERENCES invitations(id),
        clicked_yes INTEGER DEFAULT 0,
        selected_date TEXT,
        feedback_text TEXT,
        created_at TEXT DEFAULT (now()::text)
      )
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_inv_user ON invitations(user_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_resp_inv ON responses(invitation_id)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)`);
    await client.query(`CREATE INDEX IF NOT EXISTS idx_user_vk ON users(vk_id)`);

    // Migration: add girl_name column if missing
    await client.query(`ALTER TABLE invitations ADD COLUMN IF NOT EXISTS girl_name TEXT`);

    // Migration: add role column if missing
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'`);

    // Migration: add guest_name column if missing
    await client.query(`ALTER TABLE responses ADD COLUMN IF NOT EXISTS guest_name TEXT`);

    // Set egor.novoselisev@gmail.com as admin
    await client.query(`UPDATE users SET role = 'admin' WHERE email = 'egor.novoselisev@gmail.com'`);

    console.log('Database tables initialized');
  } finally {
    client.release();
  }
}

// Graceful shutdown
process.on('SIGTERM', () => pool.end());

module.exports = { getDb, query, initDb };
