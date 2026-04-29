# Xercode IoT Front

Frontend Nuxt para la administracion de Xercode IoT.

## Requisitos

- Node.js compatible con Nuxt 4.
- npm.
- Backend accesible desde la URL configurada en `APP_API_URL`.

## Configuracion

El proyecto lee la URL del backend desde `.env`:

```bash
APP_API_URL=http://localhost:8000
```

## Scripts

```bash
npm run dev
npm run build
npm run preview
```

- `npm run dev`: arranca el servidor de desarrollo de Nuxt.
- `npm run build`: genera la build de produccion.
- `npm run preview`: sirve localmente la build generada.

## Estructura

- `app/pages`: rutas Nuxt.
- `app/layouts`: layouts publico y autenticado.
- `app/components`: componentes de interfaz.
- `app/composables`: estado compartido y cliente API.
- `app/services`: servicios de backend.
- `public`: assets publicos, fuentes y favicon.
