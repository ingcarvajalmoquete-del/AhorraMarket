const STORAGE_KEY = "ahorra_market_notifications_v2";
const MAX_ITEMS = 60;

const ACTIONS = [
  { key: "created", words: ["creado", "creada", "registrado", "registrada", "agregado", "agregada", "activado", "activada"] },
  { key: "updated", words: ["actualizado", "actualizada", "editado", "editada", "modificado", "modificada"] },
  { key: "deleted", words: ["eliminado", "eliminada", "borrado", "borrada", "desactivado", "desactivada"] },
  { key: "warning", words: ["stock bajo", "agotado", "insuficiente", "no valido", "no válida", "no valida", "error"] }
];

const ENTITY_MAP = [
  ["producto", "Productos"], ["cliente", "Clientes"], ["empleado", "Empleados"],
  ["usuario", "Usuarios"], ["venta", "Ventas"], ["gasto", "Control de gastos"],
  ["inventario", "Inventario"], ["reporte", "Reportes"]
];

let notifications = loadNotifications();

function loadNotifications() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value.slice(0, MAX_ITEMS) : [];
  } catch {
    return [];
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_ITEMS)));
}

function escapeText(value) {
  const div = document.createElement("div");
  div.textContent = String(value ?? "");
  return div.innerHTML;
}

function classify(message) {
  const text = String(message || "").trim();
  const lower = text.toLowerCase();
  const action = ACTIONS.find((item) => item.words.some((word) => lower.includes(word)));
  const entity = ENTITY_MAP.find(([word]) => lower.includes(word));

  let title = text || "Actividad del sistema";
  let tone = "info";
  let icon = "✓";
  if (action?.key === "created") { tone = "success"; icon = "✓"; }
  if (action?.key === "updated") { tone = "update"; icon = "↻"; }
  if (action?.key === "deleted") { tone = "danger"; icon = "×"; }
  if (action?.key === "warning") { tone = "warning"; icon = "!"; }

  if (entity) {
    const [word, module] = entity;
    const actionLabel = action?.key === "created" ? "Registro creado" :
      action?.key === "updated" ? "Registro actualizado" :
      action?.key === "deleted" ? "Registro eliminado" :
      action?.key === "warning" ? "Aviso del sistema" : "Actividad registrada";
    title = `${actionLabel} · ${module}`;
    // Keep the original toast as the detail so no context is lost.
    if (lower.includes(word)) return { title, text, tone, icon, module };
  }
  return { title, text, tone, icon, module: "Sistema" };
}

function relativeTime(timestamp) {
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 10) return "Ahora mismo";
  if (seconds < 60) return `Hace ${seconds} s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return new Date(timestamp).toLocaleDateString("es-DO", { day: "2-digit", month: "short" });
}

function unreadCount() { return notifications.filter((item) => !item.read).length; }

function render(panel, dot) {
  const unread = unreadCount();
  dot?.classList.toggle("seen", unread === 0);
  dot?.classList.toggle("has-notifications", unread > 0);
  dot?.setAttribute("data-count", unread > 99 ? "99+" : String(unread));

  const list = notifications.length
    ? notifications.map((item) => `
      <button class="rukada-notif-item ${item.read ? "is-read" : "is-unread"}" data-notif-id="${escapeText(item.id)}">
        <span class="rukada-notif-icon ${item.tone}">${escapeText(item.icon)}</span>
        <span class="rukada-notif-body">
          <strong>${escapeText(item.title)}</strong>
          <small>${escapeText(item.text)}</small>
          <em>${escapeText(relativeTime(item.timestamp))}</em>
        </span>
        ${item.read ? "" : '<i class="rukada-notif-unread" aria-label="No leída"></i>'}
      </button>`).join("")
    : `<div class="rukada-notif-empty"><span>✓</span><strong>Todo en orden</strong><small>No hay actividades nuevas.</small></div>`;

  panel.innerHTML = `
    <div class="rukada-notif-head">
      <div><strong>Notificaciones</strong><small>${unread ? `${unread} pendiente${unread === 1 ? "" : "s"}` : "Actividad reciente"}</small></div>
      <button type="button" data-notif-action="read-all" ${unread ? "" : "disabled"}>Marcar todo leído</button>
    </div>
    <div class="rukada-notif-list">${list}</div>
    <div class="rukada-notif-foot">
      <span>${notifications.length} actividad${notifications.length === 1 ? "" : "es"}</span>
      <button type="button" data-notif-action="clear" ${notifications.length ? "" : "disabled"}>Limpiar historial</button>
    </div>`;
}

function addNotification(message) {
  const item = classify(message);
  if (!item.text) return;
  // Avoid duplicating the same operation fired twice within 800 ms.
  const duplicate = notifications[0] && notifications[0].text === item.text && Date.now() - notifications[0].timestamp < 800;
  if (duplicate) return;
  notifications.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, timestamp: Date.now(), read: false, ...item });
  notifications = notifications.slice(0, MAX_ITEMS);
  persist();
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
  const refresh = () => render(panel, dot);

  document.addEventListener("app:notification", (event) => {
    addNotification(event.detail?.message);
    refresh();
  });

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const willOpen = !panel.classList.contains("open");
    panel.classList.toggle("open", willOpen);
    button.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) refresh();
  });

  panel.addEventListener("click", (event) => {
    event.stopPropagation();
    const action = event.target.closest("[data-notif-action]")?.dataset.notifAction;
    const item = event.target.closest("[data-notif-id]");
    if (action === "read-all") {
      notifications.forEach((entry) => { entry.read = true; });
      persist(); refresh(); return;
    }
    if (action === "clear") {
      notifications = []; persist(); refresh(); return;
    }
    if (item) {
      const found = notifications.find((entry) => entry.id === item.dataset.notifId);
      if (found) { found.read = true; persist(); refresh(); }
    }
  });

  document.addEventListener("click", close);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") close(); });
  refresh();
  window.setInterval(refresh, 30000);
}
