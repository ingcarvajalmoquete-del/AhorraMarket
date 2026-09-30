function toPublicProduct(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    stock: row.stock
  };
}

module.exports = { toPublicProduct };
