const { db } = require("../database");

function listUsers(req, res) {
  const users = db.prepare("SELECT id, email, role FROM users ORDER BY id").all();
  res.json({ users });
}

module.exports = { listUsers };
