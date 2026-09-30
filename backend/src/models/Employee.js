function toPublicEmployee(row) {
  if (!row) return null;

  return {
    id: row.id,
    name: row.name,
    position: row.position,
    phone: row.phone,
    active: Boolean(row.active)
  };
}

module.exports = { toPublicEmployee };
