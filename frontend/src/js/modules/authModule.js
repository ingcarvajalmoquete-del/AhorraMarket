import { loginRequest, getSession, clearSession } from "../services/authService.js";
import { showToast } from "./uiModule.js";

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
  const roleLabel = session.role === "admin" ? "Administrador" : "Empleado";
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
