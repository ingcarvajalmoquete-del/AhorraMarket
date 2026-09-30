export function formatCurrency(value) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP"
  }).format(Number(value) || 0);
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-DO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("es-DO", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

export function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
