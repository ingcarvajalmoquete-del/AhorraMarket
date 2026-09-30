import { employeeService } from "../services/employeeService.js";
import { escapeHtml, isRequired } from "../utils/validators.js";
import { setValue, setText, getValue } from "../utils/dom.js";
import { openModal, closeModal, showToast } from "./uiModule.js";

let cachedEmployees = [];

function renderEmployeeRow(employee) {
  const statusClass = employee.active ? "available" : "out";
  const statusLabel = employee.active ? "Activo" : "Inactivo";

  return `
    <tr>
      <td>#${employee.id}</td>
      <td><strong>${escapeHtml(employee.name)}</strong></td>
      <td>${escapeHtml(employee.position || "")}</td>
      <td>${escapeHtml(employee.phone || "")}</td>
      <td><span class="status ${statusClass}">${statusLabel}</span></td>
      <td>
        <button class="table-action" data-action="edit-employee" data-id="${employee.id}" title="Editar">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-edit"/></svg>
        </button>
        <button class="table-action danger" data-action="delete-employee" data-id="${employee.id}" title="Eliminar">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-trash"/></svg>
        </button>
      </td>
    </tr>
  `;
}

async function loadEmployees() {
  const table = document.getElementById("employeesTable");
  if (!table) return;

  cachedEmployees = await employeeService.getAll();
  table.innerHTML = cachedEmployees.length
    ? cachedEmployees.map(renderEmployeeRow).join("")
    : '<tr><td colspan="6" class="empty-table">No hay empleados registrados.</td></tr>';
}

function openEmployeeForm(employee) {
  document.getElementById("employeeForm")?.reset();
  setValue("employeeId", employee?.id || "");
  setText("employeeModalTitle", employee ? "Editar empleado" : "Nuevo empleado");

  if (employee) {
    setValue("employeeName", employee.name);
    setValue("employeePosition", employee.position);
    setValue("employeePhone", employee.phone);
    setValue("employeeActive", String(employee.active));
  }

  openModal("employeeModal");
}

async function handleEmployeeForm(event) {
  event.preventDefault();

  const id = getValue("employeeId");
  const data = {
    name: getValue("employeeName").trim(),
    position: getValue("employeePosition").trim(),
    phone: getValue("employeePhone").trim(),
    active: getValue("employeeActive") === "true"
  };

  if (!isRequired(data.name) || !isRequired(data.position) || !isRequired(data.phone)) {
    return showToast("Completa los datos obligatorios.");
  }

  try {
    if (id) await employeeService.update(Number(id), data);
    else await employeeService.create(data);

    await loadEmployees();
    closeModal("employeeModal");
    showToast(id ? "Empleado actualizado." : "Empleado registrado.");
  } catch (error) {
    showToast(error.message);
  }
}

async function handleDeleteEmployee(id) {
  if (!window.confirm("¿Eliminar este empleado?")) return;
  await employeeService.remove(id);
  await loadEmployees();
  showToast("Empleado eliminado.");
}

function initEmployeeTableActions() {
  document.getElementById("employeesTable")?.addEventListener("click", (event) => {
    const editButton = event.target.closest('[data-action="edit-employee"]');
    const deleteButton = event.target.closest('[data-action="delete-employee"]');

    if (editButton) {
      const employee = cachedEmployees.find((item) => item.id === Number(editButton.dataset.id));
      if (employee) openEmployeeForm(employee);
    }

    if (deleteButton) handleDeleteEmployee(Number(deleteButton.dataset.id));
  });
}

export function initEmployeesModule() {
  document.getElementById("addEmployeeBtn")?.addEventListener("click", () => openEmployeeForm(null));
  document.getElementById("employeeForm")?.addEventListener("submit", handleEmployeeForm);
  initEmployeeTableActions();
  loadEmployees();
}
