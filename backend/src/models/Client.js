function toPublicClient(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email
  };
}

module.exports = { toPublicClient };
