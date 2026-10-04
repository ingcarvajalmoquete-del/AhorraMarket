import { userService } from "../services/userService.js";
import { getSession } from "../services/authService.js";
import { escapeHtml, isRequired } from "../utils/validators.js";
import { getValue } from "../utils/dom.js";
import { getRoleLabel } from "../utils/permissions.js";
import { openModal, closeModal, showToast, confirmAction } from "./uiModule.js";

function renderUserRow(user, currentUserId) {
  const roleLabel = getRoleLabel(user.role);
  const statusLabel = user.active ? "Activo" : "Inactivo";
  const statusClass = user.active ? "available" : "out";
  const disableSelf = user.id === currentUserId ? "disabled" : "";

  return `
    <tr>
      <td>#${user.id}</td>
      <td><strong>${escapeHtml(user.username)}</strong></td>
      <td>${escapeHtml(user.name)}</td>
      <td>${roleLabel}</td>
      <td><span class="status ${statusClass}">${statusLabel}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" data-action="toggle-user" data-id="${user.id}" ${disableSelf}>
            ${user.active ? "\uD83D\uDD12" : "\uD83D\uDD13"}
          </button>
          <button class="action-btn" data-action="delete-user" data-id="${user.id}" ${disableSelf}>
            <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-trash"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

export async function loadUsers() {
  const table = document.getElementById("usersTable");
  if (!table) return [];

  const session = getSession();
  const users = await userService.getAll();
  table.innerHTML = users.map((user) => renderUserRow(user, session?.id)).join("");
  return users;
}

function validateUserForm(data) {
  if (!isRequired(data.username) || !isRequired(data.name)) return "Completa el usuario y el nombre.";
  if (data.password.length < 6) return "La contrasena debe tener al menos 6 caracteres.";
  return null;
}

async function handleUserForm(event) {
  event.preventDefault();

  const data = {
    username: getValue("newUsername").trim(),
    name: getValue("newUserName").trim(),
    password: getValue("newPassword"),
    role: getValue("newUserRole")
  };

  const error = validateUserForm(data);
  if (error) return showToast(error);

  try {
    await userService.create(data);
    closeModal("userModal");
    await loadUsers();
    showToast("Usuario creado correctamente.");
  } catch (error_) {
    showToast(error_.message);
  }
}

async function handleToggleUser(id) {
  const session = getSession();
  if (id === session?.id) return showToast("No puedes desactivar tu propio usuario.");

  try {
    const user = await userService.toggle(id);
    await loadUsers();
    showToast(user.active ? "Usuario activado." : "Usuario desactivado.");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleDeleteUser(id, username) {
  const session = getSession();
  if (id === session?.id) return showToast("No puedes eliminar tu propio usuario.");

  const confirmed = await confirmAction(`¿Eliminar al usuario "${username}"?`);
  if (!confirmed) return;

  try {
    await userService.remove(id);
    await loadUsers();
    showToast("Usuario eliminado correctamente.");
  } catch (error) {
    showToast(error.message);
  }
}

function initUserTableActions() {
  document.getElementById("usersTable")?.addEventListener("click", (event) => {
    const toggleButton = event.target.closest('[data-action="toggle-user"]');
    const deleteButton = event.target.closest('[data-action="delete-user"]');

    if (toggleButton) handleToggleUser(Number(toggleButton.dataset.id));
    if (deleteButton) {
      const row = deleteButton.closest("tr");
      const username = row?.querySelector("strong")?.textContent || "";
      handleDeleteUser(Number(deleteButton.dataset.id), username);
    }
  });
}

export function initUsersModule() {
  document.getElementById("addUserBtn")?.addEventListener("click", () => {
    document.getElementById("userForm")?.reset();
    openModal("userModal");
  });

  document.getElementById("userForm")?.addEventListener("submit", handleUserForm);
  initUserTableActions();
  loadUsers();
}
