import { reportService } from "../services/reportService.js";
import { formatCurrency, formatDate, formatDateTime, toInputDate } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";
import { setText, getValue, setValue } from "../utils/dom.js";
import { showToast } from "./uiModule.js";
import { buildSalesPdf, buildSalesXlsx, downloadBlob } from "../utils/reportExport.js";

// Último reporte generado (lo que se exporta a PDF / Excel).
let lastReport = null;

function parseDateOnly(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function initReportDates() {
  const start = document.getElementById("reportStart");
  const end = document.getElementById("reportEnd");
  if (!start || !end) return;

  const now = new Date();
  setValue("reportStart", toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  setValue("reportEnd", toInputDate(now));
}

function applyPreset(preset) {
  const now = new Date();
  setValue("reportEnd", toInputDate(now));

  if (preset === "today") setValue("reportStart", toInputDate(now));
  else if (preset === "7") {
    const date = new Date(now);
    date.setDate(date.getDate() - 6);
    setValue("reportStart", toInputDate(date));
  } else if (preset === "30") {
    const date = new Date(now);
    date.setDate(date.getDate() - 29);
    setValue("reportStart", toInputDate(date));
  } else {
    setValue("reportStart", toInputDate(new Date(now.getFullYear(), now.getMonth(), 1)));
  }

  generateReport();
}

function renderSummary(report, fromValue, toValue) {
  setText("reportSales", formatCurrency(report.totalSales));
  setText("reportTransactions", report.transactions);
  setText("reportAverage", formatCurrency(report.averageTicket));
  setText("reportRangeLabel", fromValue && toValue ? `${formatDate(fromValue)} → ${formatDate(toValue)}` : "Periodo completo");
}

function renderDetailTable(sales) {
  const table = document.getElementById("reportDetailTable");
  if (!table) return;

  if (sales.length === 0) {
    table.innerHTML = '<tr><td colspan="7" class="empty-table">No existen ventas en el periodo seleccionado.</td></tr>';
    return;
  }

  table.innerHTML = sales.map((sale) => {
    const quantity = sale.items.reduce((sum, item) => sum + item.quantity, 0);

    return `
      <tr>
        <td>#${sale.id}</td>
        <td>${formatDateTime(sale.createdAt)}</td>
        <td>${quantity}</td>
        <td>${formatCurrency(sale.subtotal)}</td>
        <td>${formatCurrency(sale.tax)}</td>
        <td><strong>${formatCurrency(sale.total)}</strong></td>
        <td>${escapeHtml(`Usuario #${sale.userId}`)}</td>
      </tr>
    `;
  }).join("");
}

function buildDayRange(fromValue, toValue) {
  const start = fromValue ? parseDateOnly(fromValue) : new Date();
  const end = toValue ? parseDateOnly(toValue) : new Date();
  const days = [];

  for (const day = new Date(start); day <= end && days.length < 31; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }

  return days.length ? days : [new Date()];
}

function valuesForDays(days, dailyTotals) {
  const totalsByDate = Object.fromEntries(dailyTotals.map((entry) => [entry.date, entry.total]));
  return days.map((day) => totalsByDate[toInputDate(day)] || 0);
}

function renderLineChart(days, values) {
  const svg = document.getElementById("reportLineChart");
  const labels = document.getElementById("reportLineLabels");
  const max = Math.max(...values, 1);
  const width = 760;
  const height = 230;
  const padding = 24;

  if (svg) {
    const points = values.map((value, i) => `${padding + (i * (width - padding * 2)) / Math.max(values.length - 1, 1)},${height - padding - (value / max) * (height - padding * 2)}`).join(" ");

    svg.innerHTML = `
      <defs><linearGradient id="reportFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7D8FF0" stop-opacity=".22"/>
        <stop offset="1" stop-color="#7D8FF0" stop-opacity=".02"/>
      </linearGradient></defs>
      <polyline points="${points}" fill="none" stroke="#5269DF" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <polyline points="${points} ${width - padding},${height - padding} ${padding},${height - padding}" fill="url(#reportFill)" stroke="none"/>
    `;
  }

  if (labels) {
    labels.innerHTML = days.map((day) => `<span>${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}</span>`).join("");
  }
}

function renderBarChart(days, values) {
  const bars = document.getElementById("reportBarChart");
  if (!bars) return;

  const max = Math.max(...values, 1);
  const lastDays = days.slice(-12);
  const offset = Math.max(0, days.length - 12);

  bars.innerHTML = lastDays.map((day, i) => {
    const value = values[offset + i] || 0;
    const heightPercent = Math.max(5, (value / max) * 100);
    const label = `${String(day.getDate()).padStart(2, "0")}/${String(day.getMonth() + 1).padStart(2, "0")}`;

    return `
      <div class="report-bar-item">
        <div class="report-bar-value">${formatCurrency(value)}</div>
        <i class="bar-fill" data-height="${heightPercent}"></i>
        <span>${label}</span>
      </div>
    `;
  }).join("");

  bars.querySelectorAll(".bar-fill").forEach((bar) => {
    bar.style.height = `${bar.dataset.height}%`;
  });
}

export async function generateReport() {
  const fromValue = getValue("reportStart");
  const toValue = getValue("reportEnd");

  if (!fromValue || !toValue) {
    showToast("Selecciona la fecha inicial y la final.");
    return null;
  }

  if (parseDateOnly(fromValue) > parseDateOnly(toValue)) {
    showToast("La fecha inicial no puede ser mayor que la final.");
    return null;
  }

  try {
    const report = await reportService.getSalesReport(fromValue, toValue);
    lastReport = { report, fromValue, toValue };

    renderSummary(report, fromValue, toValue);
    renderDetailTable(report.sales);

    const days = buildDayRange(fromValue, toValue);
    const values = valuesForDays(days, report.dailyTotals);
    renderLineChart(days, values);
    renderBarChart(days, values);
    return lastReport;
  } catch (error) {
    showToast(error.message || "No se pudo generar el reporte.");
    return null;
  }
}

function exportContext(current) {
  const { report, fromValue, toValue } = current;
  return {
    report,
    rangeLabel: `${formatDate(fromValue)} - ${formatDate(toValue)}`,
    generatedAt: formatDateTime(new Date()),
    formatDateTime,
    formatCurrency
  };
}

async function handleExport(kind) {
  // Siempre exporta lo que indican las fechas actuales de los filtros.
  const current = await generateReport();
  if (!current) return;

  try {
    const context = exportContext(current);
    const suffix = `${current.fromValue}_${current.toValue}`;

    if (kind === "pdf") {
      downloadBlob(buildSalesPdf(context), `reporte-ventas_${suffix}.pdf`);
      showToast("Reporte PDF generado correctamente.");
    } else {
      downloadBlob(buildSalesXlsx(context), `reporte-ventas_${suffix}.xlsx`);
      showToast("Reporte Excel generado correctamente.");
    }
  } catch (error) {
    showToast(`No se pudo exportar el reporte: ${error.message}`);
  }
}

export function initReportsModule() {
  initReportDates();
  document.getElementById("generateReportBtn")?.addEventListener("click", generateReport);
  document.getElementById("exportReportPdf")?.addEventListener("click", () => handleExport("pdf"));
  document.getElementById("exportReportExcel")?.addEventListener("click", () => handleExport("excel"));
  document.querySelectorAll("[data-report-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.reportPreset));
  });

  generateReport();
}
