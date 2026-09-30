# Ahorra Market — Documentación del sistema

## 1. Identificación

**Nombre del sistema:** Ahorra Market  
**Tipo:** Sistema web de gestión comercial para tiendas  
**Asistente integrado:** DS  
**Versión visual:** 4.0  
**Idioma:** Español  
**Moneda de operación:** RD$  
**Impuesto configurado por defecto:** ITBIS 18%

## 2. Descripción general

Ahorra Market es una aplicación web orientada a la administración de una tienda. Centraliza productos, inventario, ventas, clientes, empleados, usuarios, gastos y reportes en una sola interfaz. El sistema incluye autenticación por roles y un asistente llamado **DS** que responde preguntas sobre la información disponible en el sistema y explica tareas frecuentes.

## 3. Objetivos

- Centralizar la información operativa de la tienda.
- Registrar ventas y actualizar el inventario.
- Controlar productos y niveles de stock.
- Administrar clientes y empleados.
- Registrar gastos y consultar su comportamiento.
- Generar reportes de ventas y gastos.
- Separar permisos entre administradores y empleados.
- Facilitar el uso mediante el asistente DS.

## 4. Módulos

### Inicio / Dashboard
Presenta indicadores generales: productos, ventas del mes, gastos, usuarios y saldo disponible. Incluye productos destacados, actividad y accesos rápidos.

### Productos
Permite crear, editar, consultar y eliminar productos. Cada producto maneja nombre, categoría, precio y stock.

### Ventas
Permite crear ventas mediante un carrito, seleccionar productos y cantidades y calcular subtotal, impuesto y total. El backend valida la operación y actualiza las existencias.

### Inventario
Muestra las unidades disponibles, valor estimado del inventario y productos con stock bajo.

### Clientes
Permite registrar, editar y eliminar clientes con nombre, teléfono y correo electrónico.

### Empleados
Permite administrar empleados, puesto, teléfono y estado activo.

### Control de gastos
Permite registrar gastos por descripción, categoría y monto, además de consultar información gráfica.

### Reportes
Incluye resumen del dashboard, reporte de ventas por rango de fechas y gastos agrupados por categoría.

### Usuarios
El módulo está restringido a administradores. Permite consultar usuarios, crear cuentas, activar/desactivar usuarios y eliminar cuentas.

### DS
DS es el asistente integrado de Ahorra Market. Puede responder sobre cantidad de productos, stock bajo, ventas del día, valor del inventario, clientes, empleados, usuarios y procedimientos básicos.

## 5. Roles y permisos

| Rol | Acceso principal |
|---|---|
| Administrador | Todos los módulos, incluyendo usuarios |
| Empleado | Operación de productos, ventas, inventario, clientes, empleados, gastos y reportes según las reglas del backend |

La API protege las rutas mediante JWT y middleware de autenticación; las rutas de usuarios requieren además privilegios de administrador.

## 6. Arquitectura

```text
Ahorra Market
├── frontend/
│   ├── index.html              # Inicio de sesión
│   ├── dashboard.html          # Aplicación principal
│   └── src/
│       ├── css/                # Estilos y temas
│       └── js/
│           ├── modules/        # Funcionalidades por módulo
│           ├── services/       # Comunicación con la API
│           └── utils/          # Utilidades y validadores
│
└── backend/
    ├── app.js                  # Configuración de Express
    ├── server.js               # Arranque del servidor
    └── src/
        ├── config/             # Entorno y base de datos
        ├── controllers/        # Controladores HTTP
        ├── middlewares/        # Auth, validación y errores
        ├── repositories/       # Acceso a datos
        ├── routes/             # Endpoints REST
        ├── services/           # Lógica de negocio
        └── models/             # Modelos de datos
```

## 7. Tecnologías

### Frontend
- HTML5
- CSS3
- JavaScript ES Modules
- Interfaz responsive
- Tema claro y oscuro

### Backend
- Node.js
- Express 4
- JWT para autenticación
- bcryptjs para contraseñas
- express-validator para validaciones
- Morgan para registros HTTP
- CORS
- sql.js para persistencia en archivo SQLite

## 8. Base de datos

La base de datos utiliza las tablas principales:

- `users`: usuarios, roles, contraseñas cifradas y estado.
- `products`: catálogo y existencias.
- `clients`: clientes.
- `employees`: empleados.
- `sales`: encabezados de ventas.
- `sale_items`: detalle de productos vendidos.
- `expenses`: gastos de la tienda.

La configuración actual conserva el archivo de datos existente en `backend/data/ecogestion.db` para evitar romper una base de datos que ya contenga información. El nombre visual del sistema no obliga a renombrar el archivo físico.

## 9. API REST

La API se ejecuta por defecto en el puerto **3000**.

| Recurso | Ruta base | Función |
|---|---|---|
| Salud | `/api/health` | Verificar que la API está activa |
| Autenticación | `/api/auth` | Inicio de sesión y perfil |
| Usuarios | `/api/users` | Administración de usuarios |
| Productos | `/api/products` | CRUD y resumen de inventario |
| Clientes | `/api/clients` | CRUD de clientes |
| Empleados | `/api/employees` | CRUD de empleados |
| Ventas | `/api/sales` | Crear y consultar ventas |
| Gastos | `/api/expenses` | Registrar y consultar gastos |
| Reportes | `/api/reports` | Dashboard, ventas y gastos |

## 10. Instalación

### Backend

Desde la carpeta `backend`:

```bash
npm install
npm start
```

La API queda disponible normalmente en:

```text
http://127.0.0.1:3000
```

Comprobación rápida:

```text
GET /api/health
```

### Frontend

El frontend es estático y debe servirse mediante HTTP. Desde `frontend` se puede utilizar un servidor estático como Live Server o `npx serve`:

```bash
npx serve .
```

Después se abre la dirección indicada por el servidor, normalmente en el puerto 5500 o similar.

## 11. Usuarios de prueba

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | Administrador |
| `empleado` | `empleado123` | Empleado |

Estas credenciales son únicamente para desarrollo y demostración. En un entorno real deben cambiarse.

## 12. Identidad visual actualizada

La identidad visual fue actualizada para **Ahorra Market** con una paleta índigo definida por los dos colores solicitados:

| Uso | Color | Hex |
|---|---|---|
| Modo oscuro / color de marca oscuro | Índigo profundo | `#1D2C9D` |
| Modo claro / color de marca claro | Azul índigo claro | `#5269DF` |

Se utilizan tonos derivados para fondos, bordes, estados y contrastes. El diseño ya no utiliza el verde como color de identidad.

### Modo claro
- Fondo principal claro.
- Superficies blancas.
- Acento principal `#5269DF`.
- Estados activos, botones y enlaces derivados del azul principal.

### Modo oscuro
- Fondo azul muy oscuro.
- Superficies oscuras.
- Acento principal `#1D2C9D`.
- Variantes claras de índigo para texto de énfasis y controles.

El selector de tema conserva la preferencia del usuario y también respeta la preferencia de tema del sistema cuando todavía no existe una selección guardada.

## 13. DS — asistente del sistema

El asistente se identifica como **DS** y pertenece a Ahorra Market. No sustituye las operaciones del sistema: consulta los servicios disponibles y genera respuestas sencillas.

Ejemplos de consultas soportadas:

- “¿Cuántos productos tengo?”
- “¿Qué productos tienen stock bajo?”
- “¿Cuánto vendí hoy?”
- “¿Cuál es el valor del inventario?”
- “¿Cuántos clientes tengo?”
- “¿Cuántos empleados hay?”
- “¿Cuántos usuarios tiene el sistema?”
- “¿Cómo registro una venta?”
- “¿Cómo creo un producto?”
- “Muéstrame información de reportes.”

## 14. Seguridad

- Contraseñas almacenadas mediante hash con bcryptjs.
- Autenticación basada en JWT.
- Validación de entradas con express-validator.
- Control de acceso para rutas de administración.
- CORS restringido a orígenes locales/configurados.
- Manejo centralizado de errores HTTP.

Para producción se recomienda reemplazar el secreto JWT de desarrollo, utilizar HTTPS, cambiar credenciales de prueba y restringir CORS a los dominios reales.

## 15. Solución de problemas comunes

### `Cannot find module 'morgan'`
Desde `backend` ejecutar:

```bash
npm install
```

### `EADDRINUSE: address already in use :::3000`
Significa que otro proceso ya está utilizando el puerto 3000. En Windows:

```bat
netstat -ano | findstr :3000
```

Identificar el PID que aparece como `LISTENING` y detenerlo si corresponde:

```bat
taskkill /PID NUMERO_PID /F
```

Luego iniciar nuevamente:

```bash
npm start
```

### API OFFLINE en el frontend
Verificar que el backend esté ejecutándose y que el frontend se esté sirviendo por HTTP, no mediante `file://`.

## 16. Flujo general de uso

1. Iniciar el backend.
2. Servir el frontend.
3. Entrar con un usuario autorizado.
4. Revisar el dashboard.
5. Registrar o actualizar productos.
6. Controlar existencias.
7. Registrar ventas.
8. Registrar gastos.
9. Consultar clientes y empleados.
10. Revisar reportes.
11. Utilizar DS para consultas rápidas.

## 17. Estado de la actualización

La versión entregada incorpora:

- Cambio de identidad a **Ahorra Market**.
- Cambio del asistente a **DS**.
- Paleta principal `#1D2C9D` para el modo oscuro y `#5269DF` para el modo claro.
- Actualización del login y dashboard.
- Actualización de textos del asistente y mensajes de API.
- Actualización del título y metadatos del backend.
- Documentación técnica y funcional incluida en el proyecto.
