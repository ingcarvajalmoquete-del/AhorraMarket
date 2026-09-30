import { apiClient } from "./apiClient.js";

export const employeeService = {
  getAll: async () => (await apiClient.get("/employees")).data,
  create: async (employee) => (await apiClient.post("/employees", employee)).data,
  update: async (id, employee) => (await apiClient.put(`/employees/${id}`, employee)).data,
  remove: async (id) => apiClient.delete(`/employees/${id}`)
};
