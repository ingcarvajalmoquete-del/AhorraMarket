import { productService } from "../services/productService.js";
import { saleService } from "../services/saleService.js";
import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";

async function buildNotifications() {
  const items = [];

  const products = await productService.getAll();
  products.filter((product) => product.stock <= 10).slice(0, 3).forEach((product) => {
    items.push({
      title: `Stock bajo: ${escapeHtml(product.name)}`,
      text: `Quedan ${product.stock} unidades disponibles.`,
      tone: "amber"
    });
  });

  const sales = await saleService.getAll();
  const lastSale = sales[0];
  if (lastSale) {
    items.push({
      title: `Venta registrada #${lastSale.id}`,
      text: `Total ${formatCurrency(lastSale.total)}.`,
      tone: "green"
    });
  }

  if (items.length === 0) {
    items.push({ title: "Todo en orden", text: "No tienes notificaciones nuevas por ahora.", tone: "green" });
  }

  return items;
}

async function renderNotifications(panel) {
  const items = await buildNotifications();

  panel.innerHTML = `
    <div class="notif-head"><strong>Notificaciones</strong></div>
    <div class="notif-list">
      ${items.map((item) => `
        <div class="notif-item ${item.tone}">
          <span></span>
          <div><b>${item.title}</b><small>${item.text}</small></div>
        </div>
      `).join("")}
    </div>
  `;
}

export function initNotificationsModule() {
  const button = document.getElementById("notificationBtn");
  const panel = document.getElementById("notificationPanel");
  const dot = document.getElementById("notificationDot");
  if (!button || !panel) return;

  const close = () => {
    panel.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !panel.classList.contains("open");
    panel.classList.toggle("open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));

    if (willOpen) {
      renderNotifications(panel);
      dot?.classList.add("seen");
    }
  });

  panel.addEventListener("click", (event) => event.stopPropagation());
  document.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
