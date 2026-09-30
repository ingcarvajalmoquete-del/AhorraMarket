function toPublicSaleItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
    lineTotal: row.line_total
  };
}

function toPublicSale(row, items = []) {
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    subtotal: row.subtotal,
    tax: row.tax,
    total: row.total,
    createdAt: row.created_at,
    items: items.map(toPublicSaleItem)
  };
}

module.exports = { toPublicSale, toPublicSaleItem };
