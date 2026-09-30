import { productService } from "../services/productService.js";
import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml, isRequired, isPositiveNumber } from "../utils/validators.js";
import { setValue, setText, getValue } from "../utils/dom.js";
import { openModal, closeModal, showToast } from "./uiModule.js";

let cachedProducts = [];

function stockStatus(stock) {
  if (stock === 0) return { statusClass: "out", statusText: "Agotado" };
  if (stock <= 10) return { statusClass: "low", statusText: "Stock bajo" };
  return { statusClass: "available", statusText: "Disponible" };
}

function renderProductRow(product) {
  const { statusClass, statusText } = stockStatus(product.stock);

  return `
    <tr>
      <td>#${product.id}</td>
      <td><span class="product-name">${escapeHtml(product.name)}</span></td>
      <td>${escapeHtml(product.category)}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${product.stock}</td>
      <td><span class="status ${statusClass}">${statusText}</span></td>
      <td>
        <div class="action-buttons">
          <button class="action-btn" data-action="edit-product" data-id="${product.id}" title="Editar">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-edit"/></svg>
          </button>
          <button class="action-btn" data-action="delete-product" data-id="${product.id}" title="Eliminar">
            <svg class="icon icon-sm" viewBox="0 0 24 24"><use href="#i-trash"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

function renderProducts(products) {
  const table = document.getElementById("productsTable");
  if (!table) return;

  table.innerHTML = products.length
    ? products.map(renderProductRow).join("")
    : '<tr><td colspan="7" class="empty-table">No se encontraron productos.</td></tr>';
}

function populateCategoryFilter(products) {
  const select = document.getElementById("categoryFilter");
  if (!select) return;

  const categories = [...new Set(products.map((product) => product.category))];
  select.innerHTML = '<option value="">Todas las categorias</option>' +
    categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");
}

function populateSaleProductSelect(products) {
  const select = document.getElementById("saleProduct");
  if (!select) return;

  const available = products.filter((product) => product.stock > 0);
  select.innerHTML = '<option value="">Selecciona un producto</option>' +
    available.map((product) => `<option value="${product.id}">${escapeHtml(product.name)} — ${formatCurrency(product.price)} (Stock: ${product.stock})</option>`).join("");
}

export async function loadProducts() {
  cachedProducts = await productService.getAll();
  renderProducts(cachedProducts);
  populateCategoryFilter(cachedProducts);
  populateSaleProductSelect(cachedProducts);
  return cachedProducts;
}

export function getCachedProducts() {
  return cachedProducts;
}

function resetProductForm() {
  setText("productModalTitle", "Nuevo producto");
  ["productId", "productName", "productCategory", "productPrice", "productStock"].forEach((id) => setValue(id, ""));
}

function readProductForm() {
  return {
    name: getValue("productName").trim(),
    category: getValue("productCategory").trim(),
    price: Number(getValue("productPrice")),
    stock: Number(getValue("productStock"))
  };
}

function validateProductForm(data) {
  if (!isRequired(data.name) || !isRequired(data.category)) return "Completa el nombre y la categoria.";
  if (!isPositiveNumber(data.price)) return "El precio debe ser un numero valido.";
  if (!isPositiveNumber(data.stock)) return "El stock debe ser un numero valido.";
  return null;
}

async function handleProductForm(event) {
  event.preventDefault();

  const id = getValue("productId");
  const data = readProductForm();
  const error = validateProductForm(data);

  if (error) {
    showToast(error);
    return;
  }

  try {
    if (id) {
      await productService.update(Number(id), data);
      showToast("Producto actualizado correctamente.");
    } else {
      await productService.create(data);
      showToast("Producto creado correctamente.");
    }

    closeModal("productModal");
    await loadProducts();
  } catch (error_) {
    showToast(error_.message);
  }
}

function fillProductForm(product) {
  setText("productModalTitle", "Editar producto");
  setValue("productId", product.id);
  setValue("productName", product.name);
  setValue("productCategory", product.category);
  setValue("productPrice", product.price);
  setValue("productStock", product.stock);
}

async function handleEditProduct(id) {
  const product = cachedProducts.find((item) => item.id === id);
  if (!product) return;

  fillProductForm(product);
  openModal("productModal");
}

async function handleDeleteProduct(id) {
  const product = cachedProducts.find((item) => item.id === id);
  if (!product) return;

  const confirmed = window.confirm(`¿Deseas eliminar "${product.name}"?`);
  if (!confirmed) return;

  await productService.remove(id);
  await loadProducts();
  showToast("Producto eliminado correctamente.");
}

function initProductTableActions() {
  document.getElementById("productsTable")?.addEventListener("click", (event) => {
    const editButton = event.target.closest('[data-action="edit-product"]');
    const deleteButton = event.target.closest('[data-action="delete-product"]');

    if (editButton) handleEditProduct(Number(editButton.dataset.id));
    if (deleteButton) handleDeleteProduct(Number(deleteButton.dataset.id));
  });
}

function initProductFilters() {
  const applyFilter = () => {
    const search = getValue("productSearch").toLowerCase().trim();
    const category = getValue("categoryFilter");

    const filtered = cachedProducts.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search) || product.category.toLowerCase().includes(search);
      const matchesCategory = category === "" || product.category === category;
      return matchesSearch && matchesCategory;
    });

    renderProducts(filtered);
  };

  document.getElementById("productSearch")?.addEventListener("input", applyFilter);
  document.getElementById("categoryFilter")?.addEventListener("change", applyFilter);
}

export function initProductsModule() {
  document.getElementById("addProductBtn")?.addEventListener("click", () => {
    resetProductForm();
    openModal("productModal");
  });

  document.getElementById("productForm")?.addEventListener("submit", handleProductForm);
  initProductTableActions();
  initProductFilters();
  loadProducts();
}
