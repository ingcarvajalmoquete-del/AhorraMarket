import { productService } from "../services/productService.js";
import { saleService } from "../services/saleService.js";
import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";
import { NOTIFICATION_EVENT } from "./uiModule.js";

const STORAGE_KEY = "ahorra_market_notifications";
const MAX_NOTIFICATIONS = 60;

function readHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, MAX_NOTIFICATIONS)));
}

function addNotification(notification) {
  const history = readHistory();
  writeHistory([notification, ...history.filter((item) => item.id !== notification.id)]);
}

function formatRelativeTime(date) {
  const time = new Date(date).getTime();
  const diff = Math.max(0, Date.now() - time);
  const seconds = Math.floor(diff / 1000);
  if (seconds < 10) return "Ahora mismo";
  if (seconds < 60) return `Hace ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} d`;
}

const iconForType = {
  success: "✓",
  info: "✎",
  danger: "×",
  warning: "!",
  error: "!"
};

async function buildSystemNotifications() {
  const items = [];
  try {
    const products = await productService.getAll();
    products.filter((product) => Number(product.stock) <= 10).slice(0, 3).forEach((product) => {
      items.push({
        id: `stock-${product.id}`,
        title: `Stock bajo: ${escapeHtml(product.name)}`,
        message: `Quedan ${product.stock} unidades disponibles.`,
        type: "warning",
        icon: "!",
        createdAt: new Date().toISOString(),
        read: true,
        system: true
      });
    });
  } catch {}

  try {
    const sales = await saleService.getAll();
    const lastSale = sales[0];
    if (lastSale) {
      items.push({
        id: `sale-${lastSale.id}`,
        title: `Venta registrada #${lastSale.id}`,
        message: `Total ${formatCurrency(lastSale.total)}.`,
        type: "success",
        icon: "✓",
        createdAt: lastSale.createdAt || new Date().toISOString(),
        read: true,
        system: true
      });
    }
  } catch {}

  return items;
}

function renderItem(item) {
  const unread = item.read ? "" : " unread";
  return `
    <button class="notification-item${unread}" data-notification-id="${escapeHtml(item.id)}" type="button">
      <span class="notification-icon ${escapeHtml(item.type || "info")}">${escapeHtml(iconForType[item.type] || item.icon || "•")}</span>
      <span class="notification-content">
        <strong>${escapeHtml(item.title || "Notificación")}</strong>
        <small>${escapeHtml(item.message || "")}</small>
        <time>${escapeHtml(formatRelativeTime(item.createdAt))}</time>
      </span>
      ${item.read ? "" : '<i class="notification-unread" aria-label="No leída"></i>'}
    </button>
  `;
}

async function renderNotifications(panel) {
  const history = readHistory();
  const system = await buildSystemNotifications();
  const items = [...history, ...system].slice(0, MAX_NOTIFICATIONS);

  if (items.length === 0) {
    panel.innerHTML = `
      <div class="notif-head"><div><strong>Notificaciones</strong><small>Actividad del sistema</small></div></div>
      <div class="notification-empty"><span>✓</span><strong>Todo en orden</strong><small>No hay actividad nueva.</small></div>`;
    return;
  }

  const unread = history.filter((item) => !item.read).length;
  panel.innerHTML = `
    <div class="notif-head">
      <div><strong>Notificaciones</strong><small>${unread ? `${unread} pendiente${unread === 1 ? "" : "s"}` : "Actividad reciente"}</small></div>
      <div class="notif-actions">
        <button type="button" data-notif-action="read-all">Marcar todo leído</button>
        <button type="button" data-notif-action="clear">Limpiar</button>
      </div>
    </div>
    <div class="notif-list">${items.map(renderItem).join("")}</div>
  `;
}

function updateBadge() {
  const dot = document.getElementById("notificationDot");
  const button = document.getElementById("notificationBtn");
  const unread = readHistory().filter((item) => !item.read).length;

  if (dot) {
    dot.classList.toggle("seen", unread === 0);
    dot.textContent = unread > 9 ? "9+" : unread ? String(unread) : "";
  }
  button?.setAttribute("data-notification-count", String(unread));
}

function markRead(id) {
  const history = readHistory().map((item) => item.id === id ? { ...item, read: true } : item);
  writeHistory(history);
}

function markAllRead() {
  writeHistory(readHistory().map((item) => ({ ...item, read: true })));
}

export function initNotificationsModule() {
  const button = document.getElementById("notificationBtn");
  const panel = document.getElementById("notificationPanel");
  if (!button || !panel) return;

  updateBadge();

  const close = () => {
    panel.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  };

  const refresh = () => {
    updateBadge();
    if (panel.classList.contains("open")) renderNotifications(panel);
  };

  window.addEventListener(NOTIFICATION_EVENT, (event) => {
    if (event.detail) addNotification(event.detail);
    updateBadge();
    if (panel.classList.contains("open")) renderNotifications(panel);
  });

  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    const willOpen = !panel.classList.contains("open");
    panel.classList.toggle("open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) await renderNotifications(panel);
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = event.target.closest("[data-notif-action]")?.dataset.notifAction;
    const item = event.target.closest("[data-notification-id]");

    if (action === "read-all") {
      markAllRead();
      refresh();
      return;
    }

    if (action === "clear") {
      writeHistory([]);
      refresh();
      return;
    }

    if (item) {
      markRead(item.dataset.notificationId);
      refresh();
    }
  });

  document.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
}
