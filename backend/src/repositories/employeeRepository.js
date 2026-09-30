const { getDb } = require("../config/db");

function findAll() {
  return getDb().prepare("SELECT * FROM employees ORDER BY id ASC").all();
}

function findById(id) {
  return getDb().prepare("SELECT * FROM employees WHERE id = ?").get(id);
}

function create({ name, position, phone, active }) {
  const result = getDb().prepare(`
    INSERT INTO employees (name, position, phone, active) VALUES (?, ?, ?, ?)
  `).run(name, position || null, phone || null, active ? 1 : 0);

  return findById(result.lastInsertRowid);
}

function update(id, { name, position, phone, active }) {
  getDb().prepare(`
    UPDATE employees SET name = ?, position = ?, phone = ?, active = ? WHERE id = ?
  `).run(name, position || null, phone || null, active ? 1 : 0, id);

  return findById(id);
}

function remove(id) {
  getDb().prepare("DELETE FROM employees WHERE id = ?").run(id);
}

module.exports = { findAll, findById, create, update, remove };
