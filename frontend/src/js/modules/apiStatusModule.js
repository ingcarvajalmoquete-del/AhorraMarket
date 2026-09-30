import { checkApiHealth } from "../services/authService.js";

const CHECK_INTERVAL_MS = 4000;
const RELOAD_DELAY_MS = 900;

let wasOnline = false;
let everConnected = false;

function ensureBlockerElement() {
  if (document.getElementById("apiBlocker")) return;

  const blocker = document.createElement("div");
  blocker.id = "apiBlocker";
  blocker.className = "api-blocker";
  blocker.innerHTML = `
    <div class="api-blocker-card">
      <div class="api-big-plug">\uD83D\uDD0C</div>
      <h2 id="apiBlockerTitle">API OFFLINE</h2>
      <p id="apiBlockerText">El servidor de Ahorra Market no esta conectado.</p>
      <div class="api-loading" id="apiLoading"><span></span><span></span><span></span></div>
      <small>Comprobando conexion automaticamente...</small>
    </div>
  `;
  document.body.appendChild(blocker);
}

function updateBadge(state, icon, label) {
  const status = document.getElementById("apiStatus");
  if (!status) return;

  status.className = `api-status ${state}`;
  status.innerHTML = `<span class="api-plug">${icon}</span><span class="api-status-text">${label}</span>`;
}

function toggleBlocker(visible, title, text) {
  const blocker = document.getElementById("apiBlocker");
  if (!blocker) return;

  blocker.classList.toggle("visible", visible);
  document.body.classList.toggle("api-locked", visible);

  if (title) document.getElementById("apiBlockerTitle").textContent = title;
  if (text) document.getElementById("apiBlockerText").innerHTML = text;
}

function handleOnline() {
  const reconnecting = !wasOnline && everConnected;
  wasOnline = true;
  everConnected = true;

  if (reconnecting) {
    updateBadge("reconnecting", "\uD83D\uDFE0", "API RECONECTANDO...");
    toggleBlocker(true, "API RECONECTANDO...", "Conexion detectada. <strong>Recuperando Ahorra Market...</strong>");
    window.setTimeout(() => window.location.reload(), RELOAD_DELAY_MS);
    return;
  }

  updateBadge("online", "\uD83D\uDFE2", "API ONLINE");
  toggleBlocker(false);
}

function handleOffline() {
  wasOnline = false;
  updateBadge("offline", "\uD83D\uDD0C", "API OFFLINE");
  toggleBlocker(
    true,
    "API OFFLINE",
    "El servidor de Ahorra Market no esta conectado. <strong>Inicia el backend</strong> para continuar."
  );
}

async function pollOnce() {
  const online = await checkApiHealth();
  if (online) handleOnline();
  else handleOffline();
}

export function initApiStatusMonitor() {
  if (!document.getElementById("apiStatus")) return;
  ensureBlockerElement();
  pollOnce();
  window.setInterval(pollOnce, CHECK_INTERVAL_MS);
}

function paintLoginIndicator(online) {
  const note = document.getElementById("loginApiStatus");
  const chip = document.getElementById("loginApiChip");
  if (!note) return;

  note.textContent = online ? "\u25CF API ONLINE - Sistema disponible" : "\uD83D\uDD0C API OFFLINE - Inicia el backend";
  note.className = `login-api-note ${online ? "online" : "offline"}`;

  if (chip) {
    chip.textContent = online ? "API ONLINE" : "API OFFLINE";
    chip.classList.toggle("online", online);
  }
}

export function initLoginApiIndicator() {
  if (!document.getElementById("loginApiStatus")) return;

  const poll = async () => paintLoginIndicator(await checkApiHealth());
  poll();
  window.setInterval(poll, CHECK_INTERVAL_MS);
}
