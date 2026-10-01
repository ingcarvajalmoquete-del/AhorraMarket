# Ahorra Market — Notificaciones y logo

## Integración realizada

La implementación se hizo sobre el frontend que realmente sirve Express:

`backend/public/`

No se modificó la arquitectura de rutas, controladores, servicios ni base de datos del backend.

### Centro de notificaciones

El módulo:

`backend/public/src/js/modules/notificationsModule.js`

ahora funciona como un centro de actividad global.

Los módulos existentes siguen utilizando `showToast()`. En lugar de acoplar cada módulo directamente al centro de notificaciones, `uiModule.js` emite el evento:

`app:notification`

El módulo de notificaciones escucha ese evento y registra la actividad.

Esto permite capturar las operaciones exitosas que ya existen en:

- Productos: crear, editar y eliminar.
- Clientes: registrar, editar y eliminar.
- Empleados: registrar, editar y eliminar.
- Usuarios: crear, activar/desactivar y eliminar.
- Ventas: registrar.
- Gastos: registrar/eliminar cuando el módulo emite el aviso.
- Inventario: actualizar.
- Reportes y validaciones relevantes.

## Comportamiento visual

El centro utiliza un patrón visual inspirado en las notificaciones profesionales de Rukada:

- Campana con contador de pendientes.
- Panel desplegable.
- Iconos y estados por tipo de operación.
- Verde para creación/registro.
- Azul para edición/actualización.
- Rojo para eliminación.
- Amarillo para avisos y errores.
- Hora relativa.
- Marcar una notificación individual como leída.
- Marcar todas como leídas.
- Limpiar historial.
- Historial persistente mediante `localStorage`.
- Máximo de 60 actividades.
- Responsive y compatible con modo claro/oscuro.

## Logo oficial

Se agregó el logo de Ahorra Market en:

`backend/public/src/assets/images/ahorra-market-logo.png`

Se utiliza en el encabezado lateral y en la pantalla de inicio de sesión.

## Por qué no es estructura spaghetti

Los módulos CRUD no importan directamente el centro de notificaciones. Todos utilizan el canal existente de `showToast()` y este publica un evento común.

El resultado es una separación de responsabilidades:

`módulo CRUD → showToast() → app:notification → notificationsModule`

Esto facilita mantener el proyecto y agregar nuevas operaciones sin duplicar lógica.

## Importante

La confirmación nativa del navegador (`window.confirm`) que aparece al eliminar un registro no es una notificación. Esa ventana solamente confirma la acción. Después de confirmar y ejecutar correctamente la operación, el evento de actividad aparece en la campana.

## Archivos principales modificados

- `backend/public/src/js/modules/notificationsModule.js`
- `backend/public/src/js/modules/uiModule.js`
- `backend/public/src/css/styles.css`
- `backend/public/dashboard.html`
- `backend/public/index.html`
- `backend/public/src/css/login-pro.css`
- `backend/public/src/assets/images/ahorra-market-logo.png`
