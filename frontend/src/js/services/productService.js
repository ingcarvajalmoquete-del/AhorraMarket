import { apiClient } from "./apiClient.js";

export const productService = {
  getAll: async () => (await apiClient.get("/products")).data,
  getInventorySummary: async () => (await apiClient.get("/products/inventory-summary")).data,
  create: async (product) => (await apiClient.post("/products", product)).data,
  update: async (id, product) => (await apiClient.put(`/products/${id}`, product)).data,
  remove: async (id) => apiClient.delete(`/products/${id}`)
};
