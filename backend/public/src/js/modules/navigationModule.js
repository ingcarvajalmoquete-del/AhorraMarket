import { SECTION_TITLES } from "../utils/constants.js";
import { setText } from "../utils/dom.js";
import { showToast } from "./uiModule.js";
import { getSession } from "../services/authService.js";
import { canAccess } from "../utils/permissions.js";

function updatePageHeader(section) {
  const page = SECTION_TITLES[section];
  if (!page) return;

  // Para el cajero, la sección de ventas se presenta como "Caja".
  if (section === "sales" && getSession()?.role === "cashier") {
    setText("pageTitle", "Caja");
    setText("pageDescription", "Registra las ventas del día");
    return;
  }

  setText("pageTitle", page.title);
  setText("pageDescription", page.description);
}

function activateSection(section) {
  document.querySelectorAll(".content-section").forEach((element) => {
    element.classList.remove("active-section");
  });

  document.getElementById(`${section}Section`)?.classList.add("active-section");

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === section);
  });
}

export function navigateTo(section) {
  activateSection(section);
  updatePageHeader(section);
}

export function initNavigation(session, onNavigate) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const section = item.dataset.section;

      if (!canAccess(session.role, section)) {
        showToast("No tienes permisos para acceder.");
        return;
      }

      navigateTo(section);
      onNavigate?.(section);
    });
  });
}
