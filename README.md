# Javier Pascual Zamora
# 3ºA INSO U-Tad
# Practica-Intermedia-PWeb2
# BildyApp API REST para gestión de albaranes de obra. Práctica intermedia de la asignatura Programación Web 2 — módulo de gestión de usuarios.

## Tecnologías

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js 22+ con ESM |
| Framework | Express 5 |
| Base de datos | MongoDB Atlas + Mongoose |
| Validación | Zod |
| Autenticación | JWT + bcryptjs |
| Subida de archivos | Multer |
| Seguridad | Helmet, express-rate-limit, express-mongo-sanitize |

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd bildyapp-api

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales
```

## Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://...   # Tu URI de MongoDB Atlas
JWT_SECRET=...                   # Mínimo 32 caracteres
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

## Ejecución

```bash
# Desarrollo (con reinicio automático)
npm run dev

# Producción
npm start
```

## Endpoints

| Método | Ruta | Descripción | Auth |
|---|---|---|---|
| `POST` | `/api/user/register` | Registro de usuario | No |
| `PUT` | `/api/user/validation` | Validar email con código | Token |
| `POST` | `/api/user/login` | Login | No |
| `PUT` | `/api/user/register` | Onboarding: datos personales | Token |
| `PATCH` | `/api/user/company` | Onboarding: datos de compañía | Token |
| `PATCH` | `/api/user/logo` | Subir logo de compañía | Token |
| `GET` | `/api/user` | Obtener usuario autenticado | Token |
| `POST` | `/api/user/refresh` | Renovar access token | No |
| `POST` | `/api/user/logout` | Cerrar sesión | Token |
| `DELETE` | `/api/user` | Eliminar cuenta (`?soft=true`) | Token |
| `PUT` | `/api/user/password` | Cambiar contraseña *(bonus)* | Token |
| `POST` | `/api/user/invite` | Invitar compañero *(solo admin)* | Token |

## Flujo de uso

1. `POST /api/user/register` → obtienes `accessToken` y `refreshToken`
2. Consulta el `verificationCode` en MongoDB Atlas
3. `PUT /api/user/validation` con el código → estado pasa a `verified`
4. `PUT /api/user/register` → añade nombre, apellidos y NIF
5. `PATCH /api/user/company` → crea o únete a una compañía
6. `PATCH /api/user/logo` → sube logo (multipart/form-data)
7. `GET /api/user` → devuelve usuario completo con Company populada

