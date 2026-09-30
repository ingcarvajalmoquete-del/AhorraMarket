import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants.js";

function getToken() {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

function buildHeaders(hasBody) {
  const headers = {};
  const token = getToken();

  if (hasBody) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  return headers;
}

async function parseResponse(response) {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Ocurrio un error al comunicarse con el servidor.");
  }

  return payload;
}

async function request(path, { method = "GET", body } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(Boolean(body)),
    body: body ? JSON.stringify(body) : undefined
  });

  return parseResponse(response);
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" })
};
