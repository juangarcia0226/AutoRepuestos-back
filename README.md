# AutoRepuestos · Backend

API REST para el sistema de gestión de inventario de AutoRepuestos.
Node.js + Express 5 + MongoDB Atlas (Mongoose), con autenticación JWT.

## Requisitos

- Node.js LTS
- Una base de datos en MongoDB Atlas

## Instalación

```bash
npm install
cp .env.example .env     # y completar los valores
npm run seed             # carga productos y vehículos de ejemplo
npm run crear-admin      # crea el usuario de prueba
npm run dev
```

## Variables de entorno

| Variable         | Descripción                                          |
|------------------|------------------------------------------------------|
| `PORT`           | Puerto del servidor (por defecto 5000)               |
| `MONGO_URI`      | Cadena de conexión de MongoDB Atlas                  |
| `JWT_SECRET`     | Clave para firmar los tokens                         |
| `JWT_EXPIRES_IN` | Duración del token (por ejemplo `8h`)                |
| `CORS_ORIGIN`    | Origen(es) del front permitidos, separados por coma  |

## Scripts

| Comando               | Descripción                                             |
|-----------------------|---------------------------------------------------------|
| `npm run dev`         | Servidor con reinicio automático (nodemon)              |
| `npm start`           | Servidor                                                |
| `npm run seed`        | Reemplaza productos, vehículos y movimientos por los datos iniciales |
| `npm run crear-admin` | Crea el usuario `admin@autorepuestos.com`               |

## Documentación

Con el servidor en marcha: `http://localhost:5000/api-docs`

## Endpoints

Todas las rutas, salvo el login, requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta                                | Descripción                                  |
|--------|-------------------------------------|----------------------------------------------|
| POST   | /api/v1/auth/login                  | Iniciar sesión (devuelve el token)           |
| GET    | /api/v1/auth/perfil                 | Usuario de la sesión actual                  |
| GET    | /api/v1/productos                   | Listar productos                             |
| GET    | /api/v1/productos/compatibles       | Repuestos compatibles (`marca`, `modelo`, `anio`) |
| GET    | /api/v1/productos/:id               | Obtener un producto                          |
| POST   | /api/v1/productos                   | Crear un producto                            |
| PUT    | /api/v1/productos/:id               | Actualizar un producto                       |
| DELETE | /api/v1/productos/:id               | Eliminar un producto                         |
| GET    | /api/v1/vehiculos                   | Listar vehículos (con conteo de productos)   |
| POST   | /api/v1/vehiculos                   | Crear un vehículo                            |
| PUT    | /api/v1/vehiculos/:id               | Actualizar los años de un vehículo           |
| DELETE | /api/v1/vehiculos/:id               | Eliminar un vehículo (si ningún producto lo usa) |
| GET    | /api/v1/movimientos                 | Últimos movimientos de stock (`limite`)      |
| POST   | /api/v1/movimientos                 | Registrar una entrada o salida de stock      |
| GET    | /api/v1/resumen                     | Totales y alertas del inventario             |

## Estructura

```
configurations/   conexión a Mongo y documentación Swagger
controllers/      lógica de cada módulo
middlewares/      verificación del token
models/           esquemas de Mongoose
routes/           rutas de cada módulo
scripts/          carga inicial de datos y creación del administrador
server.js         arranque de la aplicación
```