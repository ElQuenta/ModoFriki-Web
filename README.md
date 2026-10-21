# ModoFriki Web

Interfaz de **ModoFriki**, una biblioteca de cómics, manhwas, mangas y novelas en
español. Es una SPA en React que consume la API configurada en `VITE_API_URL` e
incluye autenticación con roles y panel de administración.

## Stack

- React 19 + Vite 8 + TypeScript 6.
- React Router v7.
- Tailwind CSS v4.
- Lucide React, Motion y Sonner.
- React Hook Form + Zod para formularios.
- Vitest + Testing Library.

## Empezar

```bash
npm install
```

Crea un `.env` a partir de `.env.example` y ajusta la URL de la API:

```env
VITE_API_URL=http://localhost:3000/api
```

Después inicia el servidor:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts

| Script             | Descripción                                  |
| ------------------ | -------------------------------------------- |
| `npm run dev`      | Servidor de desarrollo.                      |
| `npm run build`    | Verificación de tipos y build de producción. |
| `npm run preview`  | Previsualiza el build.                       |
| `npm run lint`     | ESLint.                                      |
| `npm run format`   | Formatea con Prettier.                       |
| `npm run test`     | Tests en modo watch.                         |
| `npm run test:run` | Tests una sola vez.                          |

## Rutas

| Ruta                       | Pantalla                                           |
| -------------------------- | -------------------------------------------------- |
| `/`                        | Home con destacados, novedades y rankings.         |
| `/series`                  | Catálogo con búsqueda y filtros.                   |
| `/series/:id/:slug?`       | Ficha de la obra, capítulos y comentarios.         |
| `/read/:workId/:chapterId` | Lector en cascada o paginado.                      |
| `/genres`                  | Géneros y tags.                                    |
| `/rankings`                | Obras mejor valoradas.                             |
| `/favorites`               | Biblioteca personal; requiere sesión.              |
| `/profile`                 | Perfil, historial y preferencias; requiere sesión. |
| `/admin`                   | Administración; requiere rol `ADMIN` o `EDITOR`.   |
| `/login` y `/register`     | Autenticación.                                     |

Cualquier otra ruta muestra la página 404.

## Autenticación

La sesión se resuelve contra la API. El token se guarda en `localStorage` con la
clave `modofriki_token`; un `401` con token activo cierra la sesión y redirige al
login. Las rutas protegidas redirigen a `/login?next=...` conservando el destino.

## Estructura

```txt
src/
  app/          # App, router y providers
  components/   # ui, layout, home, catalog, detail, reader, auth, favorites, profile, common, admin
  context/      # Auth, Library y UI
  hooks/        # hooks reutilizables y de dominio
  lib/          # api, storage, constants, format, cn, zod-resolver
  pages/        # pantallas de cada ruta
  services/     # catalog, auth, reading, community, discovery, admin
  styles/       # tokens y estilos globales
  test/         # setup de pruebas
  types/        # contratos del dominio
```

## Documentación

- [Skills y hooks del frontend](docs/skills-y-hooks.md): referencia de las skills
  de OpenCode y de los 18 hooks de React.
- Las skills viven en `.opencode/skills/` y se cargan bajo demanda.
- El plugin `.opencode/plugins/modofriki-guard.ts` bloquea operaciones peligrosas
  como `git push` o comandos destructivos.

## Personalización

Los colores y tipografías viven en `src/styles/tokens.css`. El acento naranja se
controla con `--color-accent`.

## Alcance

- Frontend SPA; el backend vive en un proyecto aparte.
- Los datos y las imágenes se obtienen de la API.
- El panel de administración permite gestionar obras, capítulos, taxonomía y
  reportes según el rol del usuario.
