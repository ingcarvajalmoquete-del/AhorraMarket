
## 18. Sistema de notificaciones

A partir de esta actualización, Ahorra Market incorpora un sistema de notificaciones visuales integrado en el encabezado del dashboard.

### 18.1 Arquitectura

El sistema se mantiene completamente dentro de la arquitectura existente:

- `frontend/dashboard.html` conserva el botón y contenedor del panel de notificaciones.
- `frontend/src/js/modules/notificationsModule.js` concentra la lógica del módulo.
- `frontend/src/css/styles.css` contiene los estilos globales; la nueva capa visual de notificaciones debe agregarse al final del archivo.
- No se agregan endpoints, tablas ni cambios en la base de datos.
- El módulo consume los servicios existentes de productos y ventas.

La inicialización continúa realizándose desde `frontend/src/js/main.js` mediante `initNotificationsModule()`.

### 18.2 Eventos notificados

El módulo construye alertas a partir de información real disponible en la aplicación:

| Tipo | Condición | Ejemplo |
|---|---|---|
| Sin existencias | Producto con stock `<= 0` | “Sin existencias: Arroz 5 lb” |
| Stock bajo | Producto con stock entre `1` y `10` | “Stock bajo: Refresco 600ml” |
| Venta registrada | Existe una venta reciente | “Venta registrada #25” |
| Venta reciente | Existe una segunda venta disponible | “Venta reciente #24” |
| Estado normal | No existen alertas | “Todo en orden” |

### 18.3 Comportamiento de usuario

El panel permite:

1. Abrir y cerrar las notificaciones desde el icono de campana.
2. Mostrar un indicador de notificaciones pendientes.
3. Marcar una notificación individual como leída.
4. Marcar todas como leídas.
5. Actualizar manualmente las notificaciones.
6. Cerrar el panel haciendo clic fuera de él.
7. Cerrar el panel con `Escape`.
8. Actualizar automáticamente la información cada 2 minutos cuando la pestaña está visible.

El estado de lectura se conserva únicamente en `localStorage` del navegador. Esto evita modificar la base de datos y mantiene la implementación compatible con la arquitectura actual.

### 18.4 Diseño visual

La interfaz toma como referencia el patrón profesional de dropdown utilizado en Rukada: panel flotante, cabecera diferenciada, lista desplazable, iconos por estado, indicador de elementos nuevos, animación de apertura y adaptación responsive.

La identidad de Ahorra Market se mantiene intacta: el sistema continúa utilizando su paleta índigo, tema claro/oscuro, tipografía y componentes actuales.

### 18.5 Compatibilidad y seguridad

El módulo utiliza:

- JavaScript ES Modules.
- Servicios existentes de `productService` y `saleService`.
- `escapeHtml()` para evitar insertar texto de datos del backend directamente en HTML.
- `Promise.allSettled()` para evitar que un fallo aislado de un servicio inutilice todo el panel.
- Sin dependencias nuevas.
- Sin cambios en Express, JWT, SQLite ni rutas REST.

### 18.6 Archivos modificados

```text
frontend/
└── src/
    ├── css/
    │   └── styles.css                  # agregar estilos de notificaciones
    └── js/
        └── modules/
            └── notificationsModule.js  # reemplazar implementación actual
```

No es necesario modificar `backend/` ni `frontend/src/js/main.js`.


## Integración de notificaciones de operaciones

Las notificaciones de operaciones siguen el patrón de Rukada/SweetAlert2 para el aviso inmediato y agregan un historial persistente en el centro de notificaciones de Ahorra Market.

- Registrar/crear/agregar: aviso de éxito y registro en el historial.
- Editar/actualizar: aviso informativo y registro en el historial.
- Eliminar/desactivar: aviso de eliminación y registro en el historial.
- Ventas e inventario: también generan actividad persistente.
- Los módulos continúan usando `showToast()`, por lo que no se acopla cada módulo directamente al centro de notificaciones.
- El historial se guarda en `localStorage` bajo `ahorra_market_notifications` y se limita a 60 eventos.
- El centro permite marcar eventos como leídos, marcar todo como leído y limpiar el historial.
- Los avisos de stock bajo continúan siendo notificaciones de sistema y no se mezclan con el historial de operaciones.

La implementación reutiliza SweetAlert2, tomado del proyecto Rukada entregado como referencia, para mantener el comportamiento visual de confirmación/éxito, mientras que el historial es una función propia de Ahorra Market.
