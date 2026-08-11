# Despliegue en Vercel

Esta API Express está configurada para desplegarse como una **Serverless Function** en Vercel.

## Archivos de configuración

- **`vercel.json`**: indica a Vercel que use `@vercel/node` y que todas las rutas (`/(.*)`) apunten a `src/app.js`.
- **`src/app.js`**: exporta el handler serverless (`serverless(app)`) cuando se detecta `process.env.VERCEL`. En local, mantiene el arranque normal con `app.listen()`.
- **`.npmrc`**: contiene `legacy-peer-deps=true` para resolver el conflicto de peer dependencies entre `multer-storage-cloudinary` y `cloudinary`.

## Variables de entorno (configurar en el panel de Vercel)

El archivo `.env` está en `.gitignore` y **no** se sube a GitHub, por lo que debes agregar estas variables manualmente en:

**Vercel → Tu proyecto → Settings → Environment Variables**

```env
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/
DATABASE_NAME=Unistock
JWT_SECRET=<tu_secreto_jwt>
JWT_EXPIRES_IN=8h
BCRYPT_ROUNDS=10

# Email (nodemailer)
EMAIL_USER=unistockoficial@gmail.com
EMAIL_PASS=<app_password>

# Cloudinary
CLOUDINARY_CLOUD_NAME=<tu_cloud_name>
CLOUDINARY_API_KEY=<tu_api_key>
CLOUDINARY_API_SECRET=<tu_api_secret>

# CORS (opcional)
FRONTEND_URL=https://tu-frontend.vercel.app
```

> **Importante**: En MongoDB Atlas debes abrir la whitelist de IPs (0.0.0.0/0) para que la función serverless de Vercel pueda conectarse, ya que las funciones cambian de IP.

## Desplegar

```bash
# Instalar vercel CLI (si no lo tienes)
npm i -g vercel

# Iniciar sesión
vercel login

# Desplegar producción
vercel --prod
```

O conecta el repositorio de GitHub directamente desde el dashboard de Vercel.

## Probar

Después del deploy, visita:

```
https://<tu-proyecto>.vercel.app/health
```

debería responder:

```json
{ "status": "ok", "timestamp": "..." }
```
