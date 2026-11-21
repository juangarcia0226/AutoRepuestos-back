# AutoRepuestos · Backend

API REST del sistema de gestión de inventario de AutoRepuestos, una tienda de repuestos de vehículos.
Administra productos, vehículos y su compatibilidad, movimientos de stock, usuarios con roles y autenticación con JWT.

## Tecnologías

- Node.js 20 o superior
- Express 5
- MongoDB Atlas con Mongoose
- Autenticación con JWT y contraseñas cifradas con bcryptjs
- Seguridad: helmet, límite de intentos en el login y CORS por origen
- Documentación con Swagger UI

## Requisitos

- Node.js 20 o superior
- Un cluster de MongoDB Atlas con un usuario de base de datos

## Instalación en local

```bash
npm install
cp .env.example .env     # y completar los valores
npm run crear-admin      # crea el usuario administrador
npm run seed             # carga productos y vehículos de ejemplo
node server.js
```

La API queda en `http://localhost:5000` y la documentación en `http://localhost:5000/api-docs`.

En desarrollo, `npm run crear-admin` crea la cuenta `admin@autorepuestos.com` con la clave `123456`.

## Variables de entorno

| Variable         | Obligatoria              | Descripción                                                        |
|------------------|--------------------------|--------------------------------------------------------------------|
| `MONGO_URI`      | Sí                       | Cadena de conexión de MongoDB Atlas                                |
| `JWT_SECRET`     | Sí                       | Clave para firmar los tokens (en producción, mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | No (por defecto `8h`)    | Duración del token                                                 |
| `PORT`           | No (por defecto `5000`)  | Puerto del servidor                                                |
| `MONGO_DB`       | En producción            | Nombre de la base de datos (por defecto `autorepuestos`)           |
| `CORS_ORIGIN`    | En producción            | Origen(es) del front permitidos, separados por coma                |
| `NODE_ENV`       | No                       | `production` activa las validaciones estrictas                     |
| `TRUST_PROXY`    | Solo detrás de un proxy  | Saltos de proxy a confiar (por ejemplo `1` en Render)              |
| `ADMIN_NOMBRE`   | No                       | Nombre del administrador que crea `crear-admin`                    |
| `ADMIN_CORREO`   | En producción            | Correo del administrador que crea `crear-admin`                    |
| `ADMIN_CLAVE`    | En producción            | Clave del administrador (mínimo 8 caracteres y distinta de `123456`) |
| `SEED_FORZAR`    | Solo para el seed en producción | Debe valer `si` para permitir `npm run seed`                |
| `DOCS_PUBLICAS`  | No                       | Con `false` no se publica `/api-docs`                              |

El archivo `.env.example` tiene la lista completa. El `.env` real nunca se sube al repositorio.

## Scripts

| Comando               | Descripción                                                                 |
|-----------------------|-----------------------------------------------------------------------------|
| `npm run dev`         | Servidor con reinicio automático (nodemon)                                  |
| `npm start`           | Servidor para producción                                                    |
| `npm run crear-admin` | Crea el usuario administrador, o asegura su rol si ya existe                |
| `npm run seed`        | Reemplaza productos, vehículos y movimientos por los datos iniciales. No toca los usuarios. |

## Roles y permisos

| Acción                                                        | Operador | Administrador |
|---------------------------------------------------------------|:--------:|:-------------:|
| Consultar productos, vehículos, resumen y movimientos         | Sí       | Sí            |
| Buscar repuestos por vehículo                                 | Sí       | Sí            |
| Registrar entradas y salidas de stock                         | Sí       | Sí            |
| Cambiar la propia contraseña                                  | Sí       | Sí            |
| Crear, editar y eliminar productos y vehículos                | No       | Sí            |
| Gestionar usuarios                                            | No       | Sí            |

Sin permiso, la API responde `403`. Con token inválido, expirado o de un usuario inactivo, responde `401`.

## Endpoints

Salvo los públicos, todas las rutas requieren el encabezado `Authorization: Bearer <token>`.

| Método | Ruta                            | Acceso        | Descripción                                          |
|--------|---------------------------------|---------------|------------------------------------------------------|
| GET    | /api/v1/salud                   | Público       | Estado del servicio y de la base de datos            |
| POST   | /api/v1/auth/login              | Público       | Iniciar sesión (devuelve el token)                   |
| GET    | /api/v1/auth/perfil             | Autenticado   | Datos y rol del usuario de la sesión                 |
| PUT    | /api/v1/auth/clave              | Autenticado   | Cambiar la contraseña propia                         |
| GET    | /api/v1/productos               | Autenticado   | Listar productos                                     |
| GET    | /api/v1/productos/compatibles   | Autenticado   | Repuestos compatibles (`marca`, `modelo`, `anio`)    |
| GET    | /api/v1/productos/:id           | Autenticado   | Obtener un producto                                  |
| POST   | /api/v1/productos               | Administrador | Crear un producto                                    |
| PUT    | /api/v1/productos/:id           | Administrador | Actualizar un producto (acepta campos sueltos)       |
| DELETE | /api/v1/productos/:id           | Administrador | Eliminar un producto                                 |
| GET    | /api/v1/vehiculos               | Autenticado   | Listar vehículos, con el conteo de productos         |
| POST   | /api/v1/vehiculos               | Administrador | Crear un vehículo                                    |
| PUT    | /api/v1/vehiculos/:id           | Administrador | Actualizar los años de un vehículo                   |
| DELETE | /api/v1/vehiculos/:id           | Administrador | Eliminar un vehículo (si ningún producto lo usa)     |
| GET    | /api/v1/movimientos             | Autenticado   | Últimos movimientos de stock (`limite`)              |
| POST   | /api/v1/movimientos             | Autenticado   | Registrar una entrada o salida de stock              |
| GET    | /api/v1/resumen                 | Autenticado   | Totales y alertas del inventario                     |
| GET    | /api/v1/usuarios                | Administrador | Listar usuarios                                      |
| POST   | /api/v1/usuarios                | Administrador | Crear un usuario                                     |
| PUT    | /api/v1/usuarios/:id            | Administrador | Actualizar nombre, rol, estado o clave de un usuario |
| DELETE | /api/v1/usuarios/:id            | Administrador | Eliminar un usuario                                  |

La descripción completa, con ejemplos y códigos de respuesta, está en `/api-docs`.

## Reglas de negocio

- **Stock:** una salida no puede dejarlo en negativo. El movimiento y el cambio de stock se guardan en una sola transacción.
- **Productos:** la referencia es única y se guarda en mayúsculas.
- **Vehículos:** la combinación marca y modelo es única. Solo se pueden cambiar los años, y no se pueden eliminar mientras algún producto los tenga como compatibles.
- **Cambio de años de un vehículo:** si el rango se reduce, la compatibilidad de los productos se recorta y se quita el vehículo de los que queden sin años en común. Si se amplía, los productos no cambian.
- **Usuarios:** el correo no se puede cambiar. Un administrador no puede quitarse el rol, desactivarse ni eliminarse a sí mismo.
- **Sesiones:** el rol y el estado se consultan a la base de datos en cada petición, así que desactivar a un usuario o cambiarle el rol surte efecto de inmediato.

## Seguridad

- Contraseñas cifradas con bcrypt; el hash nunca sale en las respuestas.
- Login limitado a 10 intentos fallidos por IP cada 15 minutos.
- Encabezados de seguridad con helmet y CORS restringido a los orígenes configurados.
- En producción, el servidor no arranca si faltan variables críticas o si `JWT_SECRET` es corto.
- `crear-admin` exige credenciales propias en producción, y `seed` pide confirmación explícita.

## Estructura

```
configurations/   conexión a Mongo, validación del entorno y documentación Swagger
controllers/      lógica de cada módulo
middlewares/      verificación del token, control de roles y límite de intentos
models/           esquemas de Mongoose (producto, vehículo, movimiento, usuario)
routes/           rutas de cada módulo
scripts/          creación del administrador y carga inicial de datos
server.js         arranque de la aplicación
```

## Producción

Para desplegar (por ejemplo, en Render):

- **Build:** `npm install`
- **Start:** `npm start`
- **Health check:** `/api/v1/salud`
- **Variables:** `NODE_ENV=production`, `MONGO_URI`, `MONGO_DB`, `JWT_SECRET`, `CORS_ORIGIN` y `TRUST_PROXY=1`.
- **Primera vez:** ejecutar `npm run crear-admin` con `ADMIN_CORREO` y `ADMIN_CLAVE` definidos. Para cargar datos de ejemplo, `npm run seed` con `SEED_FORZAR=si`, y retirar esa variable después.
- En Atlas, permitir el acceso de red del servicio desplegado.