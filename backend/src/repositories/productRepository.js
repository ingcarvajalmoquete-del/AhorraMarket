const { getDb } = require("../config/db");

function findAll() {
  return getDb().prepare("SELECT * FROM products ORDER BY id ASC").all();
}

function findById(id) {
  return getDb().prepare("SELECT * FROM products WHERE id = ?").get(id);
}

function create({ name, category, price, stock }) {
  const result = getDb().prepare(`
    INSERT INTO products (name, category, price, stock)
    VALUES (?, ?, ?, ?)
  `).run(name, category, price, stock);

  return findById(result.lastInsertRowid);
}

function update(id, { name, category, price, stock }) {
  getDb().prepare(`
    UPDATE products SET name = ?, category = ?, price = ?, stock = ?
    WHERE id = ?
  `).run(name, category, price, stock, id);

  return findById(id);
}

function decreaseStock(id, quantity) {
  getDb().prepare("UPDATE products SET stock = stock - ? WHERE id = ?").run(quantity, id);
}

function remove(id) {
  getDb().prepare("DELETE FROM products WHERE id = ?").run(id);
}

module.exports = { findAll, findById, create, update, decreaseStock, remove };
