export const API_BASE_URL = `${window.location.origin}/api`;

export const STORAGE_KEYS = {
  TOKEN: "chatbox_token",
  USER: "chatbox_user"
};

export const LOW_STOCK_THRESHOLD = 10;

export const SECTION_TITLES = {
  dashboard: { title: "Dashboard", description: "Resumen general de tu tienda" },
  products: { title: "Productos", description: "Administra el inventario de la tienda" },
  sales: { title: "Ventas", description: "Consulta y registra las ventas" },
  reports: { title: "Reportes", description: "Analiza el rendimiento de tu tienda" },
  inventory: { title: "Inventario", description: "Controla existencias y movimientos" },
  clients: { title: "Clientes", description: "Administra tus clientes" },
  employees: { title: "Empleados", description: "Administra el personal de la tienda" },
  expenses: { title: "Control de gastos", description: "Registra y controla los gastos" },
  users: { title: "Usuarios", description: "Administra los usuarios del sistema" }
};
