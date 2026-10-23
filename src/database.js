const Database = require("better-sqlite3");
const argon2 = require("argon2");

const db = new Database(process.env.DATABASE || "auth.db");

async function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cliente'
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);

  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";
  if (email && password && !db.prepare("SELECT id FROM users WHERE email = ?").get(email)) {
    db.prepare("INSERT INTO users (email, password_hash, role) VALUES (?, ?, 'admin')")
      .run(email, await argon2.hash(password));
  }
}

module.exports = { db, initDatabase };
