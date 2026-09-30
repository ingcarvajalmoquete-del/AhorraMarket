import { reportService } from "../services/reportService.js";
import { saleService } from "../services/saleService.js";
import { productService } from "../services/productService.js";
import { expenseService } from "../services/expenseService.js";
import { getInitialBalance } from "./expensesModule.js";
import { formatCurrency, formatDateTime } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";
import { setText } from "../utils/dom.js";
import { navigateTo } from "./navigationModule.js";
import { openModal } from "./uiModule.js";

function productImageUrl(name) {
  const normalized = (name || "").toLowerCase();
  const pexels = (id) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=150`;

  if (normalized.includes("arroz")) return pexels(8108145);
  if (normalized.includes("aceite")) return pexels(3737656);
  if (normalized.includes("leche")) return pexels(4324359);
  if (normalized.includes("pan")) return pexels(7541727);
  if (normalized.includes("jab")) return pexels(6621322);
  if (normalized.includes("azucar")) return pexels(5734741);
  if (normalized.includes("pasta")) return pexels(8108151);
  if (normalized.includes("agua")) return pexels(11860562);
  return pexels(8108145);
}

function renderFeaturedProducts(products) {
  const box = document.getElementById("featuredProducts");
  if (!box) return;

  box.innerHTML = products.slice(0, 5).map((product) => {
    const status = product.stock <= 10 ? "low" : "available";

    return `
      <div class="featured-row">
        <div class="prod-thumb"><img src="${productImageUrl(product.name)}" alt=""></div>
        <strong>${escapeHtml(product.name)}</strong>
        <span>${formatCurrency(product.price)}</span>
        <span class="stock-pill ${status}">${product.stock}</span>
      </div>
    `;
  }).join("");
}

function renderRecentSalesList(sales) {
  const box = document.getElementById("dashboardSalesList");
  if (!box) return;

  if (sales.length === 0) {
    box.innerHTML = '<div class="empty-state">Aun no hay ventas registradas.</div>';
    return;
  }

  box.innerHTML = sales.map((sale) => {
    const productCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);

    return `
      <div class="sale-list-row">
        <div class="sale-badge"><svg viewBox="0 0 24 24"><use href="#i-cart"/></svg></div>
        <div><strong>Venta #${sale.id}</strong><small>${formatDateTime(sale.createdAt)}</small></div>
        <b>${formatCurrency(sale.total)}</b>
        <span>${productCount} prod.</span>
      </div>
    `;
  }).join("");
}

function renderSalesTrendChart(sales) {
  const svg = document.getElementById("salesChart");
  if (!svg) return;

  const today = new Date();
  const dailyTotals = [];

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    const total = sales
      .filter((sale) => new Date(sale.createdAt).toDateString() === day.toDateString())
      .reduce((sum, sale) => sum + sale.total, 0);
    dailyTotals.push(total);
  }

  const max = Math.max(...dailyTotals, 1);
  const width = 400;
  const height = 115;
  const points = dailyTotals.map((value, i) => `${10 + i * (width / 6)},${height - (value / max) * (height - 20)}`).join(" ");

  svg.innerHTML = `
    <polyline points="${points}" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  `;
}

function renderExpenseMiniChart(categories) {
  const container = document.getElementById("dashExpenseBarChart");
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = '<div class="expense-chart-empty">Sin gastos registrados.</div>';
    return;
  }

  const max = Math.max(...categories.map((item) => item.total), 1);

  container.innerHTML = categories.slice(0, 4).map((item) => {
    const heightPercent = Math.round((item.total / max) * 100);
    return `<div><i class="bar-fill" data-height="${heightPercent}"></i><span>${escapeHtml(item.category)}</span></div>`;
  }).join("");

  container.querySelectorAll(".bar-fill").forEach((bar) => {
    bar.style.height = `${bar.dataset.height}%`;
  });
}

function initDashboardShortcuts() {
  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-section-action]");
    if (!target) return;

    const section = target.dataset.sectionAction;
    if (section === "sales") return openModal("saleModal");
    navigateTo(section);
  });
}

export async function loadDashboard() {
  const summary = await reportService.getDashboardSummary();
  const allSales = await saleService.getAll();
  const products = await productService.getAll();

  setText("totalProducts", summary.totalProducts);
  setText("monthSales", formatCurrency(summary.monthSalesTotal));
  setText("monthExpenses", formatCurrency(summary.monthExpensesTotal));
  setText("totalUsers", summary.totalUsers);

  const expensesByCategory = await reportService.getExpensesByCategory();
  const expenses = await expenseService.getAll();
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const initialBalance = getInitialBalance();

  setText("dashInitialBalance", formatCurrency(initialBalance));
  setText("dashExpenseTotal", formatCurrency(totalExpenses));
  setText("dashBalance", formatCurrency(initialBalance - totalExpenses));

  renderFeaturedProducts(products);
  renderRecentSalesList(summary.recentSales);
  renderSalesTrendChart(allSales);
  renderExpenseMiniChart(expensesByCategory);
}

function updateCurrentDate() {
  const element = document.getElementById("currentDate");
  if (!element) return;

  element.textContent = new Date().toLocaleDateString("es-DO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function initDashboardModule() {
  updateCurrentDate();
  initDashboardShortcuts();
  loadDashboard();

  document.addEventListener("sale:created", loadDashboard);
}
