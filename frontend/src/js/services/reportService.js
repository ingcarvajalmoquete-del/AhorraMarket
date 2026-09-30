import { apiClient } from "./apiClient.js";

export const reportService = {
  getDashboardSummary: async () => (await apiClient.get("/reports/dashboard-summary")).data,
  getSalesReport: async (from, to) => (await apiClient.get(`/reports/sales?from=${from}&to=${to}`)).data,
  getExpensesByCategory: async () => (await apiClient.get("/reports/expenses-by-category")).data
};
