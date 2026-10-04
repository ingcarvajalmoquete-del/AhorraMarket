const THEME_STORAGE_KEY = "chatbox_theme";
const TOAST_DURATION_MS = 3200;
const NOTIFICATION_EVENT = "app:notification";

function classifyToast(message) {
  const text = String(message || "").toLowerCase();

  if (/(error|no se pudo|fall[oó]|no tienes|no encontrado|insuficiente|obligatorios|completa|mayor que cero|no puedes)/i.test(text)) {
    return { type: "error", icon: "error", persist: false };
  }

  if (/(eliminad|desactivad)/i.test(text)) {
    return { type: "danger", icon: "delete", persist: true };
  }

  if (/(actualizad|editad)/i.test(text)) {
    return { type: "info", icon: "edit", persist: true };
  }

  if (/(registrad|cread|agregad|activad|guardad|venta .*registrad|inventario actualizad)/i.test(text)) {
    return { type: "success", icon: "check", persist: true };
  }

  return { type: "info", icon: "info", persist: false };
}

function createNotificationPayload(message, meta = {}) {
  const classification = classifyToast(message);
  if (!classification.persist && !meta.persist) return null;

  const type = meta.type || classification.type;
  const title = meta.title || (
    type === "danger" ? "Registro eliminado" :
    type === "info" ? "Registro actualizado" :
    "Operación realizada"
  );

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title,
    message: String(message),
    type,
    icon: meta.icon || classification.icon,
    createdAt: new Date().toISOString(),
    read: false
  };
}

export function showToast(message, meta = {}) {
  const toast = document.getElementById("toast");
  const text = String(message ?? "");
  const classification = classifyToast(text);

  const visualType = meta.type || classification.type;
  const alertConfig = {
    success: { title: "¡Éxito!", icon: "success" },
    info: { title: "¡Actualizado!", icon: "info" },
    danger: { title: "¡Eliminado!", icon: "success" },
    warning: { title: "¡Atención!", icon: "warning" },
    error: { title: "¡Error!", icon: "error" }
  };

  // Rukada usa SweetAlert2 para confirmar visualmente cada operación.
  // Ahorra Market conserva ese comportamiento y además registra el evento en su historial.
  if (window.Swal?.fire) {
    const config = alertConfig[visualType] || alertConfig.info;
    window.Swal.fire({
      title: meta.title || config.title,
      text,
      icon: config.icon,
      confirmButtonText: "Aceptar",
      confirmButtonColor: "#1D2C9D",
      allowOutsideClick: true,
      customClass: { popup: "ahorra-swal-popup" }
    });
  } else if (toast) {
    toast.textContent = text;
    toast.dataset.type = visualType;
    toast.classList.add("active");

    window.clearTimeout(showToast.timeoutId);
    showToast.timeoutId = window.setTimeout(() => {
      toast.classList.remove("active");
    }, TOAST_DURATION_MS);
  }

  const notification = createNotificationPayload(text, meta);
  if (notification) {
    window.dispatchEvent(new CustomEvent(NOTIFICATION_EVENT, { detail: notification }));
  }
}

export { NOTIFICATION_EVENT };

// Confirmation dialog (same SweetAlert2 pattern used by DanielZar before deleting).
export async function confirmAction(message = "¿Estás seguro de esta acción?", confirmText = "Sí, eliminar") {
  if (!window.Swal?.fire) return window.confirm(message);

  const result = await window.Swal.fire({
    title: "¿Estás seguro?",
    text: message,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: confirmText,
    cancelButtonText: "Cancelar",
    customClass: { popup: "ahorra-swal-popup" }
  });

  return result.isConfirmed;
}

export function openModal(id) {
  document.getElementById(id)?.classList.add("open");
}

export function closeModal(id) {
  document.getElementById(id)?.classList.remove("open");
}

export function initModalCloseButtons() {
  document.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", () => closeModal(button.dataset.close));
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function initThemeToggle() {
  const toggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "light";
  applyTheme(savedTheme);

  toggle?.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(current === "light" ? "dark" : "light");
  });
}

export function initSidebarToggle() {
  const toggle = document.getElementById("sidebarToggle");
  const scrim = document.getElementById("sidebarScrim");
  if (!toggle) return;

  const closeSidebar = () => document.body.classList.remove("nav-open");

  toggle.addEventListener("click", () => document.body.classList.toggle("nav-open"));
  scrim?.addEventListener("click", closeSidebar);
  document.querySelectorAll(".nav-item").forEach((item) => item.addEventListener("click", closeSidebar));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeSidebar();
  });
}

export function initPasswordToggle() {
  const button = document.getElementById("togglePassword");
  const input = document.getElementById("password");
  if (!button || !input) return;

  button.addEventListener("click", () => {
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    input.focus();
  });
}

export function initSearchShortcut() {
  const search = document.getElementById("globalSearch");
  if (!search) return;

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      search.focus();
      search.select();
    }
  });
}

export function initForgotLink() {
  const link = document.getElementById("forgotLink");
  const message = document.getElementById("loginMessage");

  link?.addEventListener("click", (event) => {
    event.preventDefault();
    if (message) {
      message.textContent = "Pide a un administrador que restablezca tu contrasena desde el modulo Usuarios.";
    }
  });
}
