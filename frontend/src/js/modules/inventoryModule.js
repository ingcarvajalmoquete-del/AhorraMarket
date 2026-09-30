import { productService } from "../services/productService.js";
import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";
import { setText } from "../utils/dom.js";
import { showToast } from "./uiModule.js";

function renderInventoryRow(product) {
  const low = product.stock <= 10;

  return `
    <tr>
      <td><strong>${escapeHtml(product.name)}</strong></td>
      <td>${escapeHtml(product.category)}</td>
      <td>${product.stock}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${formatCurrency(product.price * product.stock)}</td>
      <td><span class="status ${low ? "low" : "available"}">${low ? "Bajo" : "Disponible"}</span></td>
    </tr>
  `;
}

export async function renderInventory() {
  const summary = await productService.getInventorySummary();

  setText("inventoryUnits", summary.totalUnits);
  setText("inventoryLow", summary.lowStockCount);
  setText("inventoryValue", formatCurrency(summary.totalValue));

  const table = document.getElementById("inventoryTable");
  if (table) table.innerHTML = summary.products.map(renderInventoryRow).join("");
}

export function initInventoryModule() {
  document.getElementById("refreshInventory")?.addEventListener("click", async () => {
    await renderInventory();
    showToast("Inventario actualizado.");
  });

  renderInventory();
}
