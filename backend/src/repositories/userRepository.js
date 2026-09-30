const { getDb } = require("../config/db");

function findAll() {
  return getDb().prepare("SELECT * FROM users ORDER BY id ASC").all();
}

function findById(id) {
  return getDb().prepare("SELECT * FROM users WHERE id = ?").get(id);
}

function findByUsername(username) {
  return getDb().prepare("SELECT * FROM users WHERE username = ?").get(username);
}

function create({ username, name, passwordHash, role }) {
  const result = getDb().prepare(`
    INSERT INTO users (username, name, password_hash, role, active)
    VALUES (?, ?, ?, ?, 1)
  `).run(username, name, passwordHash, role);

  return findById(result.lastInsertRowid);
}

function setActive(id, active) {
  getDb().prepare("UPDATE users SET active = ? WHERE id = ?").run(active ? 1 : 0, id);
  return findById(id);
}

function remove(id) {
  getDb().prepare("DELETE FROM users WHERE id = ?").run(id);
}

module.exports = { findAll, findById, findByUsername, create, setActive, remove };
