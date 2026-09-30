export function isRequired(value) {
  return String(value ?? "").trim().length > 0;
}

export function isPositiveNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

export function isValidEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}
