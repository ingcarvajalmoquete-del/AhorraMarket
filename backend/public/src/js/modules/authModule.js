import { loginRequest, getSession, clearSession } from "../services/authService.js";
import { showToast } from "./uiModule.js";
import { getRoleLabel, canAccess, isRestricted } from "../utils/permissions.js";

export function requireSession() {
  const session = getSession();

  if (!session) {
    window.location.href = "index.html";
    return null;
  }

  return session;
}

export function logout() {
  clearSession();
  window.location.href = "index.html";
}

function renderUserHeader(session) {
  const displayName = session.name;
  const roleLabel = getRoleLabel(session.role);
  const initial = displayName.charAt(0).toUpperCase();

  ["currentUserName", "topUserName"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = displayName;
  });

  ["currentUserRole", "topUserRole"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = roleLabel;
  });

  ["userAvatar", "topUserAvatar"].forEach((id) => {
    const element = document.getElementById(id);
    if (element) element.textContent = initial;
  });

  if (session.role !== "admin") {
    document.getElementById("usersNav")?.style.setProperty("display", "none");
  }

  applyRoleRestrictions(session);
}

// Oculta del menú todo lo que el rol no puede usar (p. ej. el cajero solo ve la caja).
function applyRoleRestrictions(session) {
  if (!isRestricted(session.role)) return;

  document.querySelectorAll(".nav-item").forEach((item) => {
    if (!canAccess(session.role, item.dataset.section)) item.style.setProperty("display", "none");
  });

  // Títulos de grupo ("Administración", etc.) que se quedaron sin opciones.
  document.querySelectorAll(".nav-title").forEach((title) => {
    let next = title.nextElementSibling;
    let hasVisible = false;
    while (next && !next.classList.contains("nav-title")) {
      if (next.classList.contains("nav-item") && next.style.display !== "none") hasVisible = true;
      next = next.nextElementSibling;
    }
    if (!hasVisible) title.style.setProperty("display", "none");
  });

  if (session.role === "cashier") {
    const salesNav = document.querySelector('.nav-item[data-section="sales"]');
    const label = [...(salesNav?.childNodes || [])].reverse().find((node) => node.nodeType === Node.TEXT_NODE);
    if (label) label.textContent = "Caja";
    document.getElementById("chatToggle")?.style.setProperty("display", "none");
  }
}

export function initUserHeader(session) {
  renderUserHeader(session);
  document.getElementById("logoutBtn")?.addEventListener("click", logout);
}

export function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;

    try {
      await loginRequest(username, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      showToast(error.message);
    }
  });
}
