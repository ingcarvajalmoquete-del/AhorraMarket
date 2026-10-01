const STORAGE_KEY = "ahorra_market_activity_notifications_v3";
const MAX_ITEMS = 60;

const ENTITY_MAP = [
  ["producto", "Productos"],
  ["cliente", "Clientes"],
  ["empleado", "Empleados"],
  ["usuario", "Usuarios"],
  ["venta", "Ventas"],
  ["gasto", "Control de gastos"],
  ["inventario", "Inventario"],
  ["reporte", "Reportes"],
  ["caja", "Caja"],
];

const ACTIONS = [
  { key: "created", words: ["creado", "creada", "registrado", "registrada", "agregado", "agregada", "activado", "activada"] },
  { key: "updated", words: ["actualizado", "actualizada", "editado", "editada", "modificado", "modificada"] },
  { key: "deleted", words: ["eliminado", "eliminada", "borrado", "borrada", "desactivado", "desactivada"] },
  { key: "warning", words: ["stock bajo", "agotado", "insuficiente", "no valido", "no válida", "no valida", "error", "obligatorios", "permisos"] },
];

const ACTION_META = {
  created: { title: "Registro creado", tone: "success", icon: "✓" },
  updated: { title: "Registro actualizado", tone: "update", icon: "↻" },
  deleted: { title: "Registro eliminado", tone: "danger", icon: "×" },
  warning: { title: "Aviso del sistema", tone: "warning", icon: "!" },
  info: { title: "Actividad del sistema", tone: "info", icon: "•" },
};

let notifications = loadNotifications();
let currentPanel = null;
let currentDot = null;

function loadNotifications() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item) => item && item.id && item.timestamp)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_ITEMS)));
  } catch {
    // El centro sigue funcionando aunque el navegador bloquee localStorage.
  }
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function classify(message) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();

  const action = ACTIONS.find((item) =>
    item.words.some((word) => lower.includes(word))
  );
  const entity = ENTITY_MAP.find(([word]) => lower.includes(word));
  const meta = ACTION_META[action?.key || "info"];

  let title = meta.title;
  let module = "Sistema";

  if (entity) {
    module = entity[1];
    title = `${meta.title} · ${module}`;
  }

  return {
    title,
    text,
    module,
    tone: meta.tone,
    icon: meta.icon,
  };
}

function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));

  if (seconds < 10) return "Ahora mismo";
  if (seconds < 60) return `Hace ${seconds} s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;

  return new Date(timestamp).toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
  });
}

function unreadCount() {
  return notifications.filter((item) => !item.read).length;
}

function updateBadge(dot) {
  const unread = unreadCount();
  if (!dot) return;

  dot.classList.toggle("seen", unread === 0);
  dot.classList.toggle("has-notifications", unread > 0);
  dot.dataset.count = unread > 99 ? "99+" : String(unread);
  dot.setAttribute("aria-label", unread ? `${unread} notificaciones pendientes` : "Sin notificaciones pendientes");
}

function render(panel, dot = currentDot) {
  currentPanel = panel;
  currentDot = dot;

  updateBadge(dot);

  const unread = unreadCount();

  const list = notifications.length
    ? notifications.map((item) => `
        <button
          type="button"
          class="rukada-notif-item ${item.read ? "is-read" : "is-unread"}"
          data-notif-id="${escapeHtml(item.id)}"
          aria-label="${escapeHtml(item.title)}"
        >
          <span class="rukada-notif-icon ${escapeHtml(item.tone)}">${escapeHtml(item.icon)}</span>
          <span class="rukada-notif-body">
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.text)}</small>
            <em>${escapeHtml(relativeTime(item.timestamp))} · ${escapeHtml(item.module)}</em>
          </span>
          ${item.read ? "" : '<i class="rukada-notif-unread" aria-hidden="true"></i>'}
        </button>
      `).join("")
    : `
        <div class="rukada-notif-empty">
          <span>✓</span>
          <strong>Todo en orden</strong>
          <small>Las acciones realizadas aparecerán aquí.</small>
        </div>
      `;

  panel.innerHTML = `
    <div class="rukada-notif-head">
      <div>
        <strong>Notificaciones</strong>
        <small>${unread ? `${unread} pendiente${unread === 1 ? "" : "s"}` : "Actividad reciente"}</small>
      </div>
      <button type="button" data-notif-action="read-all" ${unread ? "" : "disabled"}>
        Marcar todo leído
      </button>
    </div>

    <div class="rukada-notif-list">${list}</div>

    <div class="rukada-notif-foot">
      <span>${notifications.length} actividad${notifications.length === 1 ? "" : "es"}</span>
      <button type="button" data-notif-action="clear" ${notifications.length ? "" : "disabled"}>
        Limpiar historial
      </button>
    </div>
  `;
}

function addNotification(message, timestamp = Date.now()) {
  const itemData = classify(message);
  if (!itemData.text) return;

  const previous = notifications[0];

  // Evita duplicados accidentales de una misma operación.
  if (
    previous &&
    previous.text === itemData.text &&
    timestamp - previous.timestamp < 800
  ) {
    return;
  }

  notifications.unshift({
    id: `${timestamp}-${Math.random().toString(36).slice(2, 9)}`,
    timestamp,
    read: false,
    ...itemData,
  });

  notifications = notifications.slice(0, MAX_ITEMS);
  persist();

  if (currentPanel) render(currentPanel, currentDot);
}

function markAsRead(id) {
  const item = notifications.find((notification) => notification.id === id);
  if (!item || item.read) return;

  item.read = true;
  persist();
  render(currentPanel, currentDot);
}

function markAllAsRead() {
  let changed = false;

  notifications.forEach((item) => {
    if (!item.read) {
      item.read = true;
      changed = true;
    }
  });

  if (changed) persist();
  render(currentPanel, currentDot);
}

function clearHistory() {
  notifications = [];
  persist();
  render(currentPanel, currentDot);
}

export function initNotificationsModule() {
  const button = document.getElementById("notificationBtn");
  const panel = document.getElementById("notificationPanel");
  const dot = document.getElementById("notificationDot");

  if (!button || !panel) return;

  currentPanel = panel;
  currentDot = dot;
  updateBadge(dot);

  const close = () => {
    panel.classList.remove("open");
    button.setAttribute("aria-expanded", "false");
  };

  button.addEventListener("click", (event) => {
    event.stopPropagation();

    const willOpen = !panel.classList.contains("open");

    if (willOpen) {
      render(panel, dot);
      panel.classList.add("open");
    } else {
      close();
    }

    button.setAttribute("aria-expanded", String(willOpen));
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();

    const actionButton = event.target.closest("[data-notif-action]");
    if (actionButton) {
      const action = actionButton.dataset.notifAction;
      if (action === "read-all") markAllAsRead();
      if (action === "clear") clearHistory();
      return;
    }

    const item = event.target.closest("[data-notif-id]");
    if (item) markAsRead(item.dataset.notifId);
  });

  document.addEventListener("click", close);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });

  // Canal único para TODOS los módulos CRUD.
  // Los módulos siguen dependiendo solamente de showToast().
  document.addEventListener("app:notification", (event) => {
    const detail = event.detail || {};
    addNotification(detail.message, detail.timestamp || Date.now());
  });

  // Refresca las etiquetas "Hace X min" mientras el panel está abierto.
  window.setInterval(() => {
    if (panel.classList.contains("open")) render(panel, dot);
  }, 30000);
}
