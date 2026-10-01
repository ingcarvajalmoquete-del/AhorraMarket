const THEME_STORAGE_KEY = "chatbox_theme";
const TOAST_DURATION_MS = 3200;

export function showToast(message) {
  // Un único canal de actividad para todos los módulos.
  // El módulo de notificaciones escucha este evento sin acoplarse a
  // productos, clientes, empleados, ventas, gastos, etc.
  document.dispatchEvent(new CustomEvent("app:notification", {
    detail: {
      message: String(message || ""),
      timestamp: Date.now()
    }
  }));

  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("show");
  }, TOAST_DURATION_MS);
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
