# Integración Ahorra Market · Notificaciones Rukada

1. Copia `frontend/src/assets/ahorra-market-logo.png` a la ruta equivalente de tu proyecto.
2. Copia `frontend/src/css/notifications-rukada.css`.
3. Aplica `AhorraMarket_notificaciones_rukada.patch` desde la raíz del repositorio:

```bash
git apply AhorraMarket_notificaciones_rukada.patch
```

El centro de notificaciones escucha el evento global `app:notification`, emitido por `showToast()`. Por ello los módulos CRUD existentes no necesitan importar el centro de notificaciones: sus mensajes de éxito se convierten automáticamente en actividad persistente.

La implementación conserva la arquitectura actual, usa `localStorage`, limita el historial a 60 eventos y permite marcar individualmente, marcar todo como leído y limpiar el historial. El estilo toma como referencia visual la estructura de Rukada: panel desplegable, lista de altura fija/desplazable, iconos circulares, contador y estados de actividad.

### Operaciones cubiertas
- Productos: crear, editar, eliminar.
- Clientes: registrar, editar, eliminar.
- Empleados: registrar, editar, eliminar.
- Usuarios: crear, activar/desactivar, eliminar.
- Ventas: registrar.
- Gastos: agregar y eliminar.
- Inventario: actualización manual.
- Errores y validaciones que ya usan `showToast()`.
