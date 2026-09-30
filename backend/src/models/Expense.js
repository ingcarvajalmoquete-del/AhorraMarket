function toPublicExpense(row) {
  if (!row) return null;

  return {
    id: row.id,
    description: row.description,
    category: row.category,
    amount: row.amount,
    createdAt: row.created_at
  };
}

module.exports = { toPublicExpense };
