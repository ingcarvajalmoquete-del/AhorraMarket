const { getDb } = require("../config/db");

function findAll() {
  return getDb().prepare("SELECT * FROM clients ORDER BY id ASC").all();
}

function findById(id) {
  return getDb().prepare("SELECT * FROM clients WHERE id = ?").get(id);
}

function create({ name, phone, email }) {
  const result = getDb().prepare(`
    INSERT INTO clients (name, phone, email) VALUES (?, ?, ?)
  `).run(name, phone || null, email || null);

  return findById(result.lastInsertRowid);
}

function update(id, { name, phone, email }) {
  getDb().prepare(`
    UPDATE clients SET name = ?, phone = ?, email = ? WHERE id = ?
  `).run(name, phone || null, email || null, id);

  return findById(id);
}

function remove(id) {
  getDb().prepare("DELETE FROM clients WHERE id = ?").run(id);
}

module.exports = { findAll, findById, create, update, remove };
