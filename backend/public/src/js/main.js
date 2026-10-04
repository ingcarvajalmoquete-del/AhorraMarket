import { requireSession, initUserHeader, initLoginForm } from "./modules/authModule.js";
import { initApiStatusMonitor, initLoginApiIndicator } from "./modules/apiStatusModule.js";
import { initThemeToggle, initSidebarToggle, initPasswordToggle, initModalCloseButtons, initSearchShortcut, initForgotLink } from "./modules/uiModule.js";
import { initNavigation, navigateTo } from "./modules/navigationModule.js";
import { initHeroCarousel } from "./modules/carouselModule.js";
import { initDashboardModule } from "./modules/dashboardModule.js";
import { initProductsModule } from "./modules/productsModule.js";
import { initSalesModule } from "./modules/salesModule.js";
import { initUsersModule } from "./modules/usersModule.js";
import { initExpensesModule } from "./modules/expensesModule.js";
import { initClientsModule } from "./modules/clientsModule.js";
import { initEmployeesModule } from "./modules/employeesModule.js";
import { initInventoryModule } from "./modules/inventoryModule.js";
import { initReportsModule } from "./modules/reportsModule.js";
import { initNotificationsModule } from "./modules/notificationsModule.js";
import { initChatModule } from "./modules/chatModule.js";
import { getDefaultSection, isRestricted } from "./utils/permissions.js";

function initLoginPage() {
  initThemeToggle();
  initPasswordToggle();
  initForgotLink();
  initLoginApiIndicator();
  initLoginForm();
}

function initDashboardPage() {
  const session = requireSession();
  if (!session) return;

  initThemeToggle();
  initSidebarToggle();
  initModalCloseButtons();
  initSearchShortcut();
  initApiStatusMonitor();

  initUserHeader(session);
  initNavigation(session, () => {});
  initHeroCarousel();
  initNotificationsModule();

  if (isRestricted(session.role)) {
    // Rol restringido (cajero): solo se inicializa lo necesario para la caja.
    initProductsModule();
    initSalesModule();
  } else {
    initChatModule();
    initDashboardModule();
    initProductsModule();
    initSalesModule();
    initExpensesModule();
    initClientsModule();
    initEmployeesModule();
    initInventoryModule();
    initReportsModule();

    if (session.role === "admin") initUsersModule();
  }

  navigateTo(getDefaultSection(session.role));
}

document.addEventListener("DOMContentLoaded", () => {
  const isDashboard = document.querySelector(".app-container");
  if (isDashboard) initDashboardPage();
  else initLoginPage();
});
