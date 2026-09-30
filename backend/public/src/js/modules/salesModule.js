import { saleService } from "../services/saleService.js";
import { loadProducts, getCachedProducts } from "./productsModule.js";
import { formatCurrency, formatDateTime } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";
import { setText, getValue, setValue } from "../utils/dom.js";
import { openModal, closeModal, showToast } from "./uiModule.js";

const TAX_RATE_DISPLAY = 0.18;
let cart = [];

function renderCartRow(item) {
  const lineTotal = item.price * item.quantity;

  return `
    <tr>
      <td>${escapeHtml(item.name)}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(lineTotal)}</td>
      <td>
        <button class="action-btn" data-action="remove-cart-item" data-id="${item.productId}">
          <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-trash"/></svg>
        </button>
      </td>
    </tr>
  `;
}

function renderCartTotals() {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * TAX_RATE_DISPLAY;
  const total = subtotal + tax;

  setText("saleSubtotal", formatCurrency(subtotal));
  setText("saleTax", formatCurrency(tax));
  setText("saleTotal", formatCurrency(total));
}

function renderCart() {
  const table = document.getElementById("saleItemsTable");
  if (table) table.innerHTML = cart.map(renderCartRow).join("");
  renderCartTotals();
}

function addToCart(product, quantity) {
  const existing = cart.find((item) => item.productId === product.id);
  const currentQuantity = existing ? existing.quantity : 0;

  if (currentQuantity + quantity > product.stock) {
    showToast(`Stock insuficiente. Disponible: ${product.stock}`);
    return;
  }

  if (existing) existing.quantity += quantity;
  else cart.push({ productId: product.id, name: product.name, price: product.price, quantity });

  renderCart();
}

async function handleAddProductToSale() {
  const productId = Number(getValue("saleProduct"));
  const quantity = Number(getValue("saleQuantity"));

  if (!productId) return showToast("Selecciona un producto.");
  if (quantity <= 0) return showToast("La cantidad debe ser mayor que cero.");

  const product = getCachedProducts().find((item) => item.id === productId);
  if (!product) return showToast("Producto no encontrado.");

  addToCart(product, quantity);
  setValue("saleProduct", "");
  setValue("saleQuantity", 1);
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.productId !== productId);
  renderCart();
}

async function handleSaveSale() {
  if (cart.length === 0) return showToast("Agrega al menos un producto.");

  try {
    const items = cart.map((item) => ({ productId: item.productId, quantity: item.quantity }));
    const sale = await saleService.create(items);

    cart = [];
    renderCart();
    await loadProducts();
    await loadSales();
    closeModal("saleModal");
    showToast(`Venta #${sale.id} registrada correctamente.`);
    document.dispatchEvent(new CustomEvent("sale:created"));
  } catch (error) {
    showToast(error.message);
  }
}

function renderSaleRow(sale) {
  const productCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);

  return `
    <tr>
      <td>#${sale.id}</td>
      <td>${formatDateTime(sale.createdAt)}</td>
      <td>${productCount}</td>
      <td>${formatCurrency(sale.subtotal)}</td>
      <td>${formatCurrency(sale.tax)}</td>
      <td><strong>${formatCurrency(sale.total)}</strong></td>
      <td>#${sale.userId}</td>
    </tr>
  `;
}

export async function loadSales() {
  const table = document.getElementById("salesTable");
  if (!table) return [];

  const sales = await saleService.getAll();
  table.innerHTML = sales.length
    ? sales.map(renderSaleRow).join("")
    : '<tr><td colspan="7" class="empty-table">No hay ventas registradas.</td></tr>';

  return sales;
}

function initCartActions() {
  document.getElementById("saleItemsTable")?.addEventListener("click", (event) => {
    const button = event.target.closest('[data-action="remove-cart-item"]');
    if (button) removeFromCart(Number(button.dataset.id));
  });
}

export function initSalesModule() {
  document.getElementById("newSaleBtn")?.addEventListener("click", async () => {
    cart = [];
    renderCart();
    await loadProducts();
    openModal("saleModal");
  });

  document.getElementById("addSaleProduct")?.addEventListener("click", handleAddProductToSale);
  document.getElementById("saveSaleBtn")?.addEventListener("click", handleSaveSale);
  initCartActions();
  loadSales();
}
