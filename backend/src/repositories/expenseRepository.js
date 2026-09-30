const { getDb } = require("../config/db");

function findAll() {
  return getDb().prepare("SELECT * FROM expenses ORDER BY id DESC").all();
}

function findById(id) {
  return getDb().prepare("SELECT * FROM expenses WHERE id = ?").get(id);
}

function create({ description, category, amount }) {
  const result = getDb().prepare(`
    INSERT INTO expenses (description, category, amount) VALUES (?, ?, ?)
  `).run(description, category, amount);

  return findById(result.lastInsertRowid);
}

function remove(id) {
  getDb().prepare("DELETE FROM expenses WHERE id = ?").run(id);
}

module.exports = { findAll, findById, create, remove };
