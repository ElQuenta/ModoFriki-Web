# ModoFriki Web

Interfaz de **ModoFriki**, una biblioteca de cómics, manhwas, mangas y novelas en
español. Esta fase es exclusivamente frontend: usa datos de demostración y no se
conecta al backend.

## Stack

- React 19 + Vite 8 + TypeScript 6.
- React Router v7.
- Tailwind CSS v4.
- Lucide React, Motion y Sonner.
- Zod para validación de formularios.
- Vitest + Testing Library.

## Empezar

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run dev:e2e` | Servidor de desarrollo contra el backend de pruebas (`.env.e2e`). |
| `npm run build` | Verificación de tipos y build de producción. |
| `npm run preview` | Previsualiza el build. |
| `npm run lint` | ESLint. |
| `npm run format` | Formatea con Prettier. |
| `npm run test` | Tests en modo watch. |
| `npm run test:run` | Tests una sola vez. |

## Pruebas E2E con Claude Code

`/probar-frontend` ejecuta los casos de `e2e/flows.md` en un navegador real (MCP de Playwright), y `/corregir-frontend` además corrige los bugs que encuentre. Requisitos y uso en [`e2e/README.md`](e2e/README.md).

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Home con destacados, novedades y rankings. |
| `/series` | Catálogo con búsqueda y filtros. |
| `/series/:slug` | Ficha de serie, capítulos y comentarios. |
| `/read/:slug/:chapter` | Lector en cascada o paginado. |
| `/genres` | Géneros y tags. |
| `/rankings` | Obras mejor valoradas. |
| `/favorites` | Biblioteca personal. |
| `/profile` | Perfil, historial y preferencias. |
| `/login` y `/register` | Autenticación de demostración. |

## Cuenta demo

- Correo: `alex@modofriki.dev`
- Contraseña: `modofriki`

La autenticación es local y solo sirve para demostrar los flujos de interfaz.

## Estructura

```txt
src/
  app/          # App, router y providers
  components/   # ui, layout, home, catalog, detail, reader, auth...
  context/      # Auth, Library y UI
  hooks/        # hooks reutilizables
  data/         # mocks tipados
  types/        # contratos del dominio
  lib/          # utilidades
  styles/       # tokens y estilos globales
  pages/        # pantallas de cada ruta
```

## Personalización

Los colores y tipografías viven en `src/styles/tokens.css`. El acento naranja se
controla con `--color-accent`.

## Alcance

- Solo frontend.
- Sin panel de administración.
- Sin llamadas al backend ni base de datos.
- Datos e imágenes de demostración.
