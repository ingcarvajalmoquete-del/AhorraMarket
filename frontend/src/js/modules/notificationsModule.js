import { productService } from "../services/productService.js";
import { saleService } from "../services/saleService.js";
import { formatCurrency } from "../utils/formatters.js";
import { escapeHtml } from "../utils/validators.js";

const MAX_NOTIFICATIONS = 8;
const LOW_STOCK_LIMIT = 10;

let notificationCache = [];
let unreadCount = 0;

function getTimeLabel(dateValue) {
  if (!dateValue) return "Ahora";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Reciente";

  const diff = Math.max(0, Date.now() - date.getTime());
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} h`;
  if (days === 1) return "Ayer";
  if (days < 7) return `Hace ${days} días`;

  return date.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short"
  });
}

function createNotification({ id, title, text, tone = "info", icon = "!" , time = null }) {
  return { id, title, text, tone, icon, time };
}

async function buildNotifications() {
  const [productsResult, salesResult] = await Promise.allSettled([
    productService.getAll(),
    saleService.getAll()
  ]);

  const products = productsResult.status === "fulfilled" && Array.isArray(productsResult.value)
    ? productsResult.value
    : [];

  const sales = salesResult.status === "fulfilled" && Array.isArray(salesResult.value)
    ? salesResult.value
    : [];

  const items = [];

  const outOfStock = products.filter((product) => Number(product.stock) <= 0);
  outOfStock.slice(0, 3).forEach((product) => {
    items.push(createNotification({
      id: `out-stock-${product.id}`,
      title: `Sin existencias: ${product.name}`,
      text: "Este producto necesita reposición.",
      tone: "danger",
      icon: "!",
      time: null
    }));
  });

  const lowStock = products
    .filter((product) => Number(product.stock) > 0 && Number(product.stock) <= LOW_STOCK_LIMIT)
    .sort((a, b) => Number(a.stock) - Number(b.stock));

  lowStock.slice(0, 3).forEach((product) => {
    items.push(createNotification({
      id: `low-stock-${product.id}`,
      title: `Stock bajo: ${product.name}`,
      text: `Quedan ${product.stock} unidades disponibles.`,
      tone: "warning",
      icon: "!",
      time: null
    }));
  });

  const lastSale = sales[0];
  if (lastSale) {
    const saleDate = lastSale.created_at || lastSale.createdAt || lastSale.date || lastSale.sale_date;
    items.push(createNotification({
      id: `sale-${lastSale.id}`,
      title: `Venta registrada #${lastSale.id}`,
      text: `Total ${formatCurrency(lastSale.total)}.`,
      tone: "success",
      icon: "✓",
      time: saleDate
    }));
  }

  const previousSale = sales[1];
  if (previousSale && sales.length > 1) {
    const saleDate = previousSale.created_at || previousSale.createdAt || previousSale.date || previousSale.sale_date;
    items.push(createNotification({
      id: `sale-${previousSale.id}`,
      title: `Venta reciente #${previousSale.id}`,
      text: `Total ${formatCurrency(previousSale.total)}.`,
      tone: "info",
      icon: "↗",
      time: saleDate
    }));
  }

  if (items.length === 0) {
    items.push(createNotification({
      id: "system-ok",
      title: "Todo en orden",
      text: "No hay alertas nuevas en este momento.",
      tone: "success",
      icon: "✓"
    }));
  }

  return items.slice(0, MAX_NOTIFICATIONS);
}

function readSeenIds() {
  try {
    return JSON.parse(localStorage.getItem("ahorramarket_notification_seen") || "[]");
  } catch {
    return [];
  }
}

function saveSeenIds(ids) {
  localStorage.setItem(
    "ahorramarket_notification_seen",
    JSON.stringify(ids.slice(-50))
  );
}

function updateBadge(dot) {
  if (!dot) return;
  dot.classList.toggle("seen", unreadCount === 0);
  dot.setAttribute("aria-label", unreadCount ? `${unreadCount} notificaciones nuevas` : "Sin notificaciones nuevas");
}

function renderNotifications(panel, dot) {
  const seenIds = new Set(readSeenIds());
  unreadCount = notificationCache.filter((item) => !seenIds.has(item.id)).length;
  updateBadge(dot);

  panel.innerHTML = `
    <div class="notif-head">
      <div>
        <strong>Notificaciones</strong>
        <small>${unreadCount ? `${unreadCount} nuevas` : "Todo revisado"}</small>
      </div>
      <button type="button" class="notif-mark-all" data-notif-action="read-all">
        Marcar todo leído
      </button>
    </div>

    <div class="notif-list">
      ${notificationCache.map((item) => {
        const seen = seenIds.has(item.id);
        return `
          <article class="notif-item notif-${item.tone} ${seen ? "is-seen" : "is-unread"}" data-notif-id="${escapeHtml(String(item.id))}">
            <span class="notif-icon" aria-hidden="true">${escapeHtml(item.icon)}</span>
            <div class="notif-content">
              <b>${escapeHtml(item.title)}</b>
              <small>${escapeHtml(item.text)}</small>
              <time>${escapeHtml(getTimeLabel(item.time))}</time>
            </div>
            ${seen ? "" : '<span class="notif-unread" aria-label="Nueva"></span>'}
          </article>
        `;
      }).join("")}
    </div>

    <div class="notif-footer">
      <span>Actualizado ahora</span>
      <button type="button" data-notif-action="refresh">Actualizar</button>
    </div>
  `;
}

async function refreshNotifications(panel, dot) {
  panel.classList.add("is-loading");
  try {
    notificationCache = await buildNotifications();
    renderNotifications(panel, dot);
  } catch (error) {
    console.error("No se pudieron cargar las notificaciones:", error);
    notificationCache = [{
      id: "notification-error",
      title: "No se pudo actualizar",
      text: "Revisa la conexión con la API e inténtalo nuevamente.",
      tone: "danger",
      icon: "!"
    }];
    renderNotifications(panel, dot);
  } finally {
    panel.classList.remove("is-loading");
  }
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

  const open = async () => {
    panel.classList.add("open");
    button.setAttribute("aria-expanded", "true");

    if (!notificationCache.length) {
      await refreshNotifications(panel, dot);
    } else {
      renderNotifications(panel, dot);
    }
  };

  button.addEventListener("click", async (event) => {
    event.stopPropagation();
    const willOpen = !panel.classList.contains("open");
    if (willOpen) {
      await open();
    } else {
      close();
    }
  });

  panel.addEventListener("click", async (event) => {
    event.stopPropagation();

    const actionButton = event.target.closest("[data-notif-action]");
    const item = event.target.closest("[data-notif-id]");

    if (actionButton?.dataset.notifAction === "refresh") {
      await refreshNotifications(panel, dot);
      return;
    }

    if (actionButton?.dataset.notifAction === "read-all") {
      saveSeenIds(notificationCache.map((notification) => notification.id));
      renderNotifications(panel, dot);
      return;
    }

    if (item?.dataset.notifId) {
      const seen = new Set(readSeenIds());
      seen.add(item.dataset.notifId);
      saveSeenIds([...seen]);
      renderNotifications(panel, dot);
    }
  });

  document.addEventListener("click", close);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  // Primera carga silenciosa: el indicador queda listo sin abrir el panel.
  refreshNotifications(panel, dot);

  // Refresco periódico ligero; no modifica backend ni crea endpoints nuevos.
  window.setInterval(() => {
    if (!document.hidden) refreshNotifications(panel, dot);
  }, 120000);
}
