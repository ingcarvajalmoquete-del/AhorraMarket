function toPublicUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    role: row.role,
    active: Boolean(row.active)
  };
}

module.exports = { toPublicUser };
