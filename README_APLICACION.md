# Ahorra Market — actualización real

Este paquete contiene el proyecto actualizado, no solamente un conjunto de archivos de ejemplo.

## Integrado

- Centro de notificaciones profesional inspirado en Rukada.
- Registro automático de operaciones mediante el evento global `app:notification`.
- Creación, edición, eliminación y avisos de los módulos existentes.
- Contador de pendientes.
- Marcar individual / marcar todo como leído.
- Limpiar historial.
- Historial persistente en el navegador.
- Modo claro y oscuro.
- Logo oficial de Ahorra Market en login y sidebar.

## Importante

La aplicación que sirve Express está en:

`backend/public/`

No es necesario mover estos archivos a otra arquitectura.

No se modificaron las rutas, controladores, servicios ni la base de datos del backend.

## Ejecutar

Desde `backend`:

```bash
npm install
npm start
```

La URL local depende del puerto configurado en `.env`.

## Git

Como el ZIP no incluye `.git` ni `node_modules`, si lo vas a usar sobre tu repositorio actual, copia los archivos actualizados dentro de tu carpeta del proyecto y ejecuta:

```bash
git status
git add .
git commit -m "feat: notificaciones profesionales y logo"
git push origin main
```
