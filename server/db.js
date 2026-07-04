const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'love-constructor.db');
const dataDir = path.dirname(DB_PATH);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password_hash TEXT,
      vk_id TEXT UNIQUE,
      display_name TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      last_login TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS invitations (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      title TEXT,
      html TEXT NOT NULL,
      sender_token TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      is_active INTEGER DEFAULT 1,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS responses (
      id TEXT PRIMARY KEY,
      invitation_id TEXT NOT NULL,
      clicked_yes INTEGER DEFAULT 0,
      selected_date TEXT,
      feedback_text TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (invitation_id) REFERENCES invitations(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_inv_user ON invitations(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_resp_inv ON responses(invitation_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_email ON users(email)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_user_vk ON users(vk_id)`);

  saveDb();
  return db;
}

function saveDb() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

// Auto-save every 30 seconds
setInterval(() => saveDb(), 30000);

process.on('exit', () => saveDb());
process.on('SIGINT', () => { saveDb(); process.exit(); });

module.exports = { getDb, saveDb };
