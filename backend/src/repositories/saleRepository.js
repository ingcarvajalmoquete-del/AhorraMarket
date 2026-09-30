const { getDb } = require("../config/db");

function findAll() {
  return getDb().prepare("SELECT * FROM sales ORDER BY id DESC").all();
}

function findById(id) {
  return getDb().prepare("SELECT * FROM sales WHERE id = ?").get(id);
}

function findItemsBySaleId(saleId) {
  return getDb().prepare("SELECT * FROM sale_items WHERE sale_id = ?").all(saleId);
}

function findSalesBetween(fromDate, toDate) {
  return getDb().prepare(`
    SELECT * FROM sales
    WHERE date(created_at) BETWEEN date(?) AND date(?)
    ORDER BY created_at ASC
  `).all(fromDate, toDate);
}

function createSaleWithItems({ userId, subtotal, tax, total, items }) {
  const db = getDb();

  const insertSale = db.prepare(`
    INSERT INTO sales (user_id, subtotal, tax, total) VALUES (?, ?, ?, ?)
  `);

  const insertItem = db.prepare(`
    INSERT INTO sale_items (sale_id, product_id, product_name, quantity, unit_price, line_total)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const decreaseStock = db.prepare(`
    UPDATE products SET stock = stock - ? WHERE id = ?
  `);

  const runTransaction = db.transaction(() => {
    const saleResult = insertSale.run(userId, subtotal, tax, total);
    const saleId = saleResult.lastInsertRowid;

    items.forEach((item) => {
      insertItem.run(saleId, item.productId, item.productName, item.quantity, item.unitPrice, item.lineTotal);
      decreaseStock.run(item.quantity, item.productId);
    });

    return saleId;
  });

  const saleId = runTransaction();
  return findById(saleId);
}

module.exports = { findAll, findById, findItemsBySaleId, findSalesBetween, createSaleWithItems };
