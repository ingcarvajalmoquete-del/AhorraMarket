import { clientService } from "../services/clientService.js";
import { escapeHtml, isRequired, isValidEmail } from "../utils/validators.js";
import { setValue, setText, getValue } from "../utils/dom.js";
import { openModal, closeModal, showToast } from "./uiModule.js";

let cachedClients = [];

function renderClientRow(client) {
  return `
    <tr>
      <td>#${client.id}</td>
      <td><strong>${escapeHtml(client.name)}</strong></td>
      <td>${escapeHtml(client.phone || "")}</td>
      <td>${escapeHtml(client.email || "—")}</td>
      <td>
        <button class="table-action" data-action="edit-client" data-id="${client.id}" title="Editar">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-edit"/></svg>
        </button>
        <button class="table-action danger" data-action="delete-client" data-id="${client.id}" title="Eliminar">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-trash"/></svg>
        </button>
      </td>
    </tr>
  `;
}

async function loadClients() {
  const table = document.getElementById("clientsTable");
  if (!table) return;

  cachedClients = await clientService.getAll();
  table.innerHTML = cachedClients.length
    ? cachedClients.map(renderClientRow).join("")
    : '<tr><td colspan="5" class="empty-table">No hay clientes registrados.</td></tr>';
}

function openClientForm(client) {
  document.getElementById("clientForm")?.reset();
  setValue("clientId", client?.id || "");
  setText("clientModalTitle", client ? "Editar cliente" : "Nuevo cliente");

  if (client) {
    setValue("clientName", client.name);
    setValue("clientPhone", client.phone);
    setValue("clientEmail", client.email);
  }

  openModal("clientModal");
}

async function handleClientForm(event) {
  event.preventDefault();

  const id = getValue("clientId");
  const data = {
    name: getValue("clientName").trim(),
    phone: getValue("clientPhone").trim(),
    email: getValue("clientEmail").trim()
  };

  if (!isRequired(data.name) || !isRequired(data.phone)) return showToast("Completa los datos obligatorios.");
  if (!isValidEmail(data.email)) return showToast("El correo no es valido.");

  try {
    if (id) await clientService.update(Number(id), data);
    else await clientService.create(data);

    await loadClients();
    closeModal("clientModal");
    showToast(id ? "Cliente actualizado." : "Cliente registrado.");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleDeleteClient(id) {
  if (!window.confirm("¿Eliminar este cliente?")) return;
  await clientService.remove(id);
  await loadClients();
  showToast("Cliente eliminado.");
}

function initClientTableActions() {
  document.getElementById("clientsTable")?.addEventListener("click", (event) => {
    const editButton = event.target.closest('[data-action="edit-client"]');
    const deleteButton = event.target.closest('[data-action="delete-client"]');

    if (editButton) {
      const client = cachedClients.find((item) => item.id === Number(editButton.dataset.id));
      if (client) openClientForm(client);
    }

    if (deleteButton) handleDeleteClient(Number(deleteButton.dataset.id));
  });
}

export function initClientsModule() {
  document.getElementById("addClientBtn")?.addEventListener("click", () => openClientForm(null));
  document.getElementById("clientForm")?.addEventListener("submit", handleClientForm);
  initClientTableActions();
  loadClients();
}
