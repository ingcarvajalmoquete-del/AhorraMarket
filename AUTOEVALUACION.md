# Autoevaluación — Requerimientos RA1

Marcado según el documento "Requerimientos y Organización del Código —
Mini Proyecto de Evaluación RA1".

## 1. Requisitos generales de entrega

| Requisito | Cumple | Notas |
|---|---|---|
| Repositorio Git con historial de ambos integrantes | ⬜ | Pendiente: crear el repo y que ambos hagan commits reales. |
| README.md completo | ✅ | `README.md` en la raíz. |
| .gitignore excluye node_modules/, .env, dist/, temporales | ✅ | Raíz y `backend/.gitignore`. |
| Variables en `.env` + `.env.example` versionado | ✅ | `backend/.env.example`. Sin credenciales en el código. |
| Nomenclatura uniforme (kebab-case, camelCase, PascalCase, UPPER_SNAKE_CASE) | ✅ | Carpetas/archivos en kebab-case, funciones/variables en camelCase, modelos en PascalCase, constantes en UPPER_SNAKE_CASE (`HTTP_STATUS`, `LOW_STOCK_THRESHOLD`, etc). |
| Un solo idioma para código y comentarios | ✅ | Identificadores y comentarios de código en inglés; documentación (README, este archivo) en español, tal como recomienda el documento. |

## 2. Organización del frontend

| Requisito | Cumple | Notas |
|---|---|---|
| Estructura de carpetas (`src/css`, `src/js/modules`, `services`, `utils`, `assets`) | ✅ | |
| Módulos ES6 (`import`/`export`), un archivo por responsabilidad | ✅ | 24 módulos independientes. |
| Sin `onclick` en el HTML | ✅ | Los 15 casos originales fueron eliminados y reemplazados por `addEventListener` (delegación de eventos con `data-action`). |
| Sin variables globales sueltas | ✅ | Todo vive en el scope de cada módulo ES6; el estado compartido (carrito, productos cacheados) se expone mediante funciones exportadas, no `window.x`. |
| `services/` centraliza toda comunicación con el backend | ✅ | Un archivo de servicio por entidad, todos sobre `apiClient.js`. |
| Diseño responsivo | ✅ | Se conserva el CSS responsivo original del proyecto. |

## 2.3 Aplicaciones comerciales

| Requisito | Cumple | Notas |
|---|---|---|
| `views`/`components` por pantalla | ✅ | Cada sección tiene su propio módulo (`productsModule`, `salesModule`, etc). |
| Validación en cliente y servidor | ✅ | Cliente: `utils/validators.js`. Servidor: `express-validator` en cada ruta. |
| Formato de moneda/fecha centralizado | ✅ | `utils/formatters.js` (`formatCurrency`, `formatDate`, `formatDateTime`). |

## 3. Organización del backend

| Requisito | Cumple | Notas |
|---|---|---|
| `server.js` solo levanta el servidor | ✅ | Toda la configuración vive en `app.js`. |
| Capas `config/routes/controllers/services/repositories/models/middlewares/utils` | ✅ | |
| Separación estricta de responsabilidades | ✅ | Las rutas no acceden a la base de datos; los controladores no arman SQL; los servicios no tocan `req`/`res`. |
| API REST con sustantivos en plural y verbos HTTP correctos | ✅ | `/api/products`, `/api/sales`, `/api/users`, etc. |
| Códigos de estado HTTP apropiados | ✅ | 200, 201, 400, 401, 403, 404, 500 (`utils/httpStatus.js`). |
| Respuesta uniforme `{ success, data, message }` | ✅ | `utils/sendResponse.js`. |
| Middleware global de errores | ✅ | `middlewares/errorHandler.js`. |
| Validación de datos de entrada en el servidor | ✅ | `express-validator` + `middlewares/validateRequest.js`. |
| Consultas parametrizadas | ✅ | Todas las consultas usan `?` con `better-sqlite3` (repositorios). |
| CORS explícito | ✅ | `cors({ origin: env.corsOrigin })` en `app.js`. |

## 4. Normas contra el código espagueti

| Requisito | Cumple | Notas |
|---|---|---|
| Ninguna función > 40 líneas | ✅ | Verificado manualmente en cada archivo. |
| Ningún archivo > 300 líneas | ✅ | El backend más grande tiene 143 líneas; el frontend más grande, 195. |
| Máx. 3 niveles de anidación | ✅ | |
| Sin código duplicado | ✅ | Lógica repetida extraída a utils (`formatters`, `validators`, `asyncHandler`, `sendResponse`). |
| Sin código comentado ni `console.log` de depuración | ⚠️ | Se conserva un único `console.log` intencional en `backend/server.js` (confirma que el servidor arrancó) y un `console.error` en el manejador global de errores (registro de errores real, no depuración). |
| Sin números mágicos | ✅ | `HTTP_STATUS`, `LOW_STOCK_THRESHOLD`, `SALT_ROUNDS`, etc. |
| Una tarea por función, nombre verbo + sustantivo | ✅ | `calculateTotals`, `renderProductRow`, `toggleUserStatus`, etc. |
| Indentación consistente | ✅ | 2 espacios en todo el proyecto. |

## Simplificaciones documentadas

- El **saldo inicial** del módulo de gastos se guarda en `localStorage` del
  navegador (es una preferencia de configuración, no un registro de
  negocio). Todo lo demás persiste en la base de datos SQLite del backend.
- Se excluyó `formulario.html` (prototipo antiguo y duplicado del módulo de
  gastos, con `<style>` y `<script>` embebidos) porque violaba varias reglas
  de este mismo documento y su funcionalidad ya existe, de forma correcta,
  en `dashboard.html`.
- El script embebido en el `<head>` de `index.html`/`dashboard.html` que
  aplica el tema guardado antes de pintar la página es intencional (evita el
  parpadeo de tema claro/oscuro) y no contiene lógica de negocio.
