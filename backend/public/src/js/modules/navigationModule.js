import { SECTION_TITLES } from "../utils/constants.js";
import { setText } from "../utils/dom.js";
import { showToast } from "./uiModule.js";

function updatePageHeader(section) {
  const page = SECTION_TITLES[section];
  if (!page) return;

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

      if (section === "users" && session.role !== "admin") {
        showToast("No tienes permisos para acceder.");
        return;
      }

      navigateTo(section);
      onNavigate?.(section);
    });
  });
}
