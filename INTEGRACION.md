# Ahorra Market · Integración real de notificaciones Rukada

Esta versión ya contiene la integración en el código que Express sirve en producción:

`backend/public/`

## Qué se modificó

- `backend/public/src/js/modules/notificationsModule.js`
- `backend/public/src/js/modules/uiModule.js`
- `backend/public/src/css/styles.css`
- `backend/public/dashboard.html`
- `backend/public/index.html`
- `backend/public/src/css/login-pro.css`
- `backend/public/src/assets/images/ahorra-market-logo.png`

## Cómo funciona

Los módulos existentes siguen usando `showToast()` después de sus operaciones.

El flujo es:

`CRUD → showToast() → app:notification → notificationsModule → campana`

Por eso no se agregó una dependencia directa entre Productos, Clientes, Empleados, Usuarios, Ventas, Gastos e Inventario y el centro de notificaciones.

## Operaciones capturadas

La clasificación reconoce automáticamente mensajes de:

- crear / registrar / agregar / activar
- editar / actualizar / modificar
- eliminar / borrar / desactivar
- avisos, errores y validaciones

El módulo identifica además el área correspondiente y la muestra como parte de la notificación.

## Persistencia

Las actividades se almacenan en `localStorage` del navegador, con un máximo de 60 registros. Se pueden marcar como leídas, marcar todas como leídas o limpiar el historial.

## Logo

El logo oficial está en:

`backend/public/src/assets/images/ahorra-market-logo.png`

y se muestra en el login y en el sidebar.

## Nota sobre `window.confirm`

La confirmación nativa que aparece al eliminar un registro es independiente del centro de notificaciones. Después de aceptar y completar la operación, el resultado aparece en la campana.
