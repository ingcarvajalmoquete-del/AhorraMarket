export function qs(selector, scope = document) {
  return scope.querySelector(selector);
}

export function qsa(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

export function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

export function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value ?? "";
}

export function getValue(id) {
  return document.getElementById(id)?.value ?? "";
}
