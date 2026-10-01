# Patch — Notificaciones profesionales para Ahorra Market

Este paquete contiene únicamente los cambios necesarios para adaptar el patrón de
notificaciones de Rukada a Ahorra Market sin cambiar la arquitectura.

## Aplicación

1. Reemplaza:
   `frontend/src/js/modules/notificationsModule.js`
   por el archivo de este paquete.

2. Copia el contenido de:
   `frontend/src/css/notifications.css.patch`
   al final de:
   `frontend/src/css/styles.css`

3. No cambies `frontend/src/js/main.js`: ya inicializa `initNotificationsModule()`.

4. Actualiza `DOCUMENTACION_AHORRA_MARKET.md` agregando la sección 18 incluida en
   `DOCUMENTACION_AHORRA_MARKET_NOTIFICACIONES.md`.

## Backend

No requiere cambios en backend, base de datos, rutas, JWT ni dependencias.

## Resultado

- Dropdown profesional de notificaciones.
- Alertas de stock bajo y sin existencias.
- Avisos de ventas recientes.
- Estado leído/no leído persistente en el navegador.
- Marcar todo como leído.
- Actualización manual.
- Refresco automático cada 2 minutos mientras la pestaña está visible.
- Responsive y compatible con tema claro/oscuro.


### Notificaciones de operaciones
Las operaciones exitosas de registrar, editar, eliminar, activar/desactivar, ventas e inventario se muestran con una alerta profesional y quedan almacenadas en el centro de notificaciones.
