import { expenseService } from "../services/expenseService.js";
import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";
import { setText, setValue, getValue } from "../utils/dom.js";
import { showToast } from "./uiModule.js";

const BALANCE_STORAGE_KEY = "chatbox_initial_balance";
const CHART_WIDTH = 360;
const CHART_HEIGHT = 150;

export function getInitialBalance() {
  return Number(localStorage.getItem(BALANCE_STORAGE_KEY) || 0);
}

function setInitialBalance(value) {
  localStorage.setItem(BALANCE_STORAGE_KEY, String(value));
}

function formatChartValue(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(value % 1000 ? 1 : 0)}k`;
  return `$${Math.round(value)}`;
}

function renderLineChart(container, expenses) {
  if (!container) return;

  if (expenses.length === 0) {
    container.innerHTML = '<div class="expense-chart-empty">Agrega gastos para ver el grafico.</div>';
    return;
  }

  const totalsByDate = {};
  expenses.forEach((expense) => {
    const date = expense.createdAt.slice(0, 10);
    totalsByDate[date] = (totalsByDate[date] || 0) + expense.amount;
  });

  const entries = Object.entries(totalsByDate).sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  const values = entries.map(([, value]) => value);
  const max = Math.max(...values, 1);
  const left = 34;
  const right = 8;
  const top = 8;
  const bottom = 28;
  const innerWidth = CHART_WIDTH - left - right;
  const innerHeight = CHART_HEIGHT - top - bottom;

  const xAt = (i) => left + (entries.length === 1 ? innerWidth / 2 : (i * innerWidth) / (entries.length - 1));
  const yAt = (value) => top + innerHeight - (value / max) * innerHeight;

  const points = values.map((value, i) => `${xAt(i)},${yAt(value)}`).join(" ");
  const area = `${left},${top + innerHeight} ${points} ${xAt(entries.length - 1)},${top + innerHeight}`;
  const circles = values.map((value, i) => `<circle cx="${xAt(i)}" cy="${yAt(value)}" r="3" fill="#5269DF"/>`).join("");
  const labels = entries.map(([date], i) => `<text x="${xAt(i)}" y="${CHART_HEIGHT - 7}" text-anchor="middle" font-size="8" fill="#6b7280">${date.slice(5)}</text>`).join("");

  container.innerHTML = `<svg viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}" role="img" aria-label="Gastos por dia">
    <polygon points="${area}" fill="#5269DF" opacity="0.08"/>
    <polyline points="${points}" fill="none" stroke="#5269DF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    ${circles}${labels}
  </svg>`;
}

function renderBarChart(container, expenses) {
  if (!container) return;

  if (expenses.length === 0) {
    container.innerHTML = '<div class="expense-chart-empty">Agrega gastos para ver el grafico.</div>';
    return;
  }

  const totalsByCategory = {};
  expenses.forEach((expense) => {
    totalsByCategory[expense.category] = (totalsByCategory[expense.category] || 0) + expense.amount;
  });

  const entries = Object.entries(totalsByCategory).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = Math.max(...entries.map(([, value]) => value), 1);
  const left = 30;
  const right = 8;
  const top = 8;
  const bottom = 34;
  const innerWidth = CHART_WIDTH - left - right;
  const innerHeight = CHART_HEIGHT - top - bottom;
  const barWidth = Math.max(12, Math.min(38, (innerWidth / entries.length) * 0.55));
  const gap = innerWidth / entries.length;

  const bars = entries.map(([category, value], i) => {
    const barHeight = (value / max) * innerHeight;
    const x = left + gap * i + (gap - barWidth) / 2;
    const y = top + innerHeight - barHeight;
    const label = category.length > 10 ? `${category.slice(0, 9)}…` : category;
    return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="3" fill="#5269DF"/>
      <text x="${x + barWidth / 2}" y="${CHART_HEIGHT - 7}" text-anchor="middle" font-size="8" fill="#6b7280">${escapeHtml(label)}</text>`;
  }).join("");

  container.innerHTML = `<svg viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}" role="img" aria-label="Gastos por categoria">${bars}</svg>`;
}

function renderExpenseList(container, expenses) {
  if (!container) return;

  if (expenses.length === 0) {
    container.innerHTML = '<p class="gastos-empty">No hay gastos registrados todavia.</p>';
    return;
  }

  container.innerHTML = expenses.map((expense) => `
    <div class="gasto-row">
      <div>
        <strong>${escapeHtml(expense.description)}</strong>
        <small>${escapeHtml(expense.category)} - ${expense.createdAt.slice(0, 10)}</small>
      </div>
      <div class="gasto-actions">
        <span>-${formatCurrency(expense.amount)}</span>
        <button class="btn btn-danger" data-action="delete-expense" data-id="${expense.id}">Eliminar</button>
      </div>
    </div>
  `).join("");
}

async function refreshExpenses() {
  const expenses = await expenseService.getAll();
  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const available = getInitialBalance() - totalSpent;

  setText("saldoInicialGastos", formatCurrency(getInitialBalance()));
  setText("totalGastadoGastos", formatCurrency(totalSpent));
  setText("saldoDisponibleGastos", formatCurrency(available));
  setText("totalGastadoFormulario", formatCurrency(totalSpent));
  setText("saldoFormulario", formatCurrency(available));

  renderExpenseList(document.getElementById("listaGastos"), expenses);
  renderLineChart(document.getElementById("gastosLinea"), expenses);
  renderBarChart(document.getElementById("gastosBarras"), expenses);

  return expenses;
}

async function handleAddExpense() {
  const balanceValue = getValue("gastoSaldo");
  const description = getValue("gastoDescripcion").trim();
  const amount = Number(getValue("gastoMonto"));
  const category = getValue("gastoCategoria");
  const date = getValue("gastoFecha");
  const message = document.getElementById("gastoMensaje");

  if (balanceValue === "" || !description || !date) {
    if (message) message.textContent = "Completa todos los campos.";
    return;
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    if (message) message.textContent = "El monto debe ser mayor que 0.";
    return;
  }

  setInitialBalance(Number(balanceValue));

  try {
    await expenseService.create({ description, category, amount });
    await refreshExpenses();
    setValue("gastoDescripcion", "");
    setValue("gastoMonto", "");
    if (message) message.textContent = "Gasto agregado correctamente.";
  } catch (error) {
    if (message) message.textContent = error.message;
  }
}

function initExpenseListActions() {
  document.getElementById("listaGastos")?.addEventListener("click", async (event) => {
    const button = event.target.closest('[data-action="delete-expense"]');
    if (!button) return;

    await expenseService.remove(Number(button.dataset.id));
    await refreshExpenses();
    showToast("Gasto eliminado correctamente.");
  });
}

export function initExpensesModule() {
  const dateInput = document.getElementById("gastoFecha");
  if (dateInput && !dateInput.value) dateInput.value = new Date().toISOString().slice(0, 10);
  setValue("gastoSaldo", getInitialBalance() || "");

  document.getElementById("addExpenseBtn")?.addEventListener("click", handleAddExpense);
  initExpenseListActions();
  refreshExpenses();
}
