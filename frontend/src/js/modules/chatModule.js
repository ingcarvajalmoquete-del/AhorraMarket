import { productService } from "../services/productService.js";
import { saleService } from "../services/saleService.js";
import { userService } from "../services/userService.js";
import { clientService } from "../services/clientService.js";
import { employeeService } from "../services/employeeService.js";
import { formatCurrency } from "../utils/formatters.js";

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

async function buildAnswer(question) {
  const normalized = normalize(question);
  const products = await productService.getAll();
  const sales = await saleService.getAll();

  const today = new Date();
  const todaySales = sales.filter((sale) => new Date(sale.createdAt).toDateString() === today.toDateString());
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = products.filter((product) => product.stock <= 10);
  const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);

  if (/hola|buenas|hey|saludos/.test(normalized)) {
    return "¡Hola! Soy DS. Puedo ayudarte con ventas, inventario, productos, clientes, empleados, usuarios y reportes.";
  }

  if (/cuantos productos|total productos/.test(normalized)) {
    return `Tienes ${products.length} productos registrados.`;
  }

  if (/stock bajo|reponer|reposicion/.test(normalized)) {
    return lowStock.length
      ? `Hay ${lowStock.length} producto(s) con stock bajo: ${lowStock.map((item) => `${item.name} (${item.stock})`).join(", ")}.`
      : "No hay productos con stock bajo.";
  }

  if (/ventas de hoy|venta hoy|cuanto vendi hoy/.test(normalized)) {
    return `Hoy registraste ${todaySales.length} venta(s) por ${formatCurrency(todayTotal)}.`;
  }

  if (/inventario|valor inventario/.test(normalized)) {
    const units = products.reduce((sum, product) => sum + product.stock, 0);
    return `El valor estimado del inventario es ${formatCurrency(inventoryValue)} y hay ${units} unidades.`;
  }

  if (/cliente/.test(normalized)) {
    const clients = await clientService.getAll();
    return `Hay ${clients.length} cliente(s) registrados. Puedes administrarlos desde Clientes.`;
  }

  if (/empleado/.test(normalized)) {
    const employees = await employeeService.getAll();
    return `Hay ${employees.length} empleado(s) registrados. Puedes gestionarlos desde Empleados.`;
  }

  if (/usuario/.test(normalized)) {
    const users = await userService.getAll();
    return `El sistema tiene ${users.length} usuario(s) registrados.`;
  }

  if (/como.*venta|registrar.*venta|nueva venta/.test(normalized)) {
    return "Para registrar una venta entra en Ventas, pulsa Nueva venta, selecciona producto y cantidad, y confirma.";
  }

  if (/como.*producto|nuevo producto/.test(normalized)) {
    return "En Productos pulsa Nuevo producto, completa nombre, categoria, precio y stock, y guarda.";
  }

  if (/reporte|estadistica/.test(normalized)) {
    return "En Reportes puedes elegir un rango de fechas para consultar ventas, transacciones y promedio por venta.";
  }

  if (/gracias/.test(normalized)) {
    return "¡Con gusto! DS esta aqui para ayudarte con Ahorra Market.";
  }

  return "Puedo responder sobre ventas, inventario, productos, clientes, empleados y reportes de Ahorra Market.";
}

function appendMessage(text, type) {
  const box = document.getElementById("chatMessages");
  if (!box) return;

  const message = document.createElement("div");
  message.className = `chat-msg ${type}`;
  message.textContent = text;
  box.appendChild(message);
  box.scrollTop = box.scrollHeight;
}

async function handleQuestion(rawQuestion) {
  const question = (rawQuestion || "").trim();
  if (!question) return;

  appendMessage(question, "user");
  const answer = await buildAnswer(question);
  window.setTimeout(() => appendMessage(answer, "bot"), 250);
}

export function initChatModule() {
  const toggle = document.getElementById("chatToggle");
  const box = document.getElementById("chatBox");
  const closeButton = document.getElementById("chatClose");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");

  if (!toggle || !box) return;

  toggle.addEventListener("click", () => {
    box.classList.add("open");
    input?.focus();
  });

  closeButton?.addEventListener("click", () => box.classList.remove("open"));

  document.querySelectorAll("[data-chat]").forEach((button) => {
    button.addEventListener("click", () => handleQuestion(button.dataset.chat));
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    handleQuestion(input.value);
    input.value = "";
  });
}
