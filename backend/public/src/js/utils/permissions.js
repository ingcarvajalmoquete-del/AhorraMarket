// Roles del sistema y qué secciones puede ver cada uno.
export const ROLE_LABELS = {
  admin: "Administrador",
  employee: "Empleado",
  cashier: "Cajero"
};

// Un rol que aparece aquí SOLO puede entrar a las secciones listadas.
const RESTRICTED_SECTIONS = {
  cashier: ["sales"]
};

export function getRoleLabel(role) {
  return ROLE_LABELS[role] || "Empleado";
}

export function canAccess(role, section) {
  if (section === "users") return role === "admin";
  const allowed = RESTRICTED_SECTIONS[role];
  return !allowed || allowed.includes(section);
}

export function getDefaultSection(role) {
  return RESTRICTED_SECTIONS[role]?.[0] || "dashboard";
}

export function isRestricted(role) {
  return Boolean(RESTRICTED_SECTIONS[role]);
}
