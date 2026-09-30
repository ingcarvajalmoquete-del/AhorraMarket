# Ahorra Market

Sistema de gestión comercial (punto de venta, inventario, clientes, empleados,
gastos y reportes) para pequeños negocios. Proyecto desarrollado como Mini
Proyecto de Evaluación del Resultado de Aprendizaje 1 (RA1) — Aplicaciones
Web con JavaScript.

## Integrantes del equipo

- Integrante 1 — (completar nombre y rol dentro del proyecto)
- Integrante 2 — (completar nombre y rol dentro del proyecto)

## Descripción funcional

Ahorra Market permite a una tienda:

- Iniciar sesión con roles de **administrador** y **empleado**.
- Administrar productos (crear, editar, eliminar, controlar stock).
- Registrar ventas mediante un carrito (POS) que descuenta el stock
  automáticamente y calcula subtotal, ITBIS y total.
- Administrar clientes y empleados.
- Registrar y controlar gastos, con gráficos de gasto diario y por categoría.
- Consultar reportes de ventas filtrados por rango de fechas.
- Administrar usuarios del sistema (solo administradores).

Toda la información se guarda en una base de datos real (SQLite) a través de
una API REST propia — nada se pierde al cerrar el navegador.

## Arquitectura

```
Ahorra Market/
├── frontend/   Interfaz (HTML + CSS + JavaScript con módulos ES6)
└── backend/    API REST (Node.js + Express + SQLite)
```

Ver `frontend/README.md` y `backend/README.md` (secciones de instalación más
abajo) para el detalle de cada capa.

## Requisitos previos

- Node.js 18 o superior
- Un navegador moderno
- (Opcional) La extensión "Live Server" de VS Code, o cualquier servidor
  estático, para servir el frontend

## Instalación y ejecución

### 1. Backend (API)

```bash
cd backend
npm install
cp .env.example .env
npm start
```

La API queda disponible en `http://127.0.0.1:3000/api`. La primera vez que
se ejecuta, crea automáticamente la base de datos SQLite en `backend/data/`
con dos usuarios de prueba:

| Usuario    | Contraseña   | Rol           |
|------------|--------------|---------------|
| `admin`    | `admin123`   | Administrador |
| `empleado` | `empleado123`| Empleado      |

### 2. Frontend

El frontend es HTML/CSS/JS puro (sin dependencias ni build). Solo necesita
ser servido por HTTP (no abrir con doble clic / `file://`, porque los
módulos ES6 no funcionan bajo ese protocolo):

```bash
cd frontend
npx serve .
# o usar la extensión Live Server de VS Code sobre index.html
```

Abre la URL que indique tu servidor (por ejemplo `http://127.0.0.1:5500`) y
entra con cualquiera de los usuarios de prueba.

> Si el indicador superior muestra **API OFFLINE**, verifica que el backend
> (paso 1) esté corriendo en el puerto 3000.

## Capturas de pantalla

_(Agregar aquí las capturas de la aplicación en funcionamiento: login,
dashboard, ventas, reportes)._

## Notas de este proyecto

- El precio y el ITBIS (18% por defecto) se calculan en el backend, nunca en
  el navegador, para evitar manipulación de totales.
- El "saldo inicial" del módulo de gastos se guarda localmente en el
  navegador (preferencia de la persona usuaria); todo lo demás (productos,
  ventas, clientes, empleados, usuarios y gastos) se guarda en la base de
  datos del backend.
- Se excluyó del proyecto el prototipo antiguo `formulario.html`, por ser un
  duplicado del módulo de gastos con HTML/CSS/JS mezclados en un solo
  archivo; su funcionalidad ya vive, de forma modular, en
  `dashboard.html` → sección "Control de gastos".

Ver `AUTOEVALUACION.md` para el detalle de cumplimiento de cada requisito
del documento de evaluación.


## Documentación actualizada

La documentación funcional, técnica, de instalación, API, base de datos, seguridad y diseño visual está en `DOCUMENTACION_AHORRA_MARKET.md`.
