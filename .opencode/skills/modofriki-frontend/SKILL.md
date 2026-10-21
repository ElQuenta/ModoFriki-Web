---
name: modofriki-frontend
description: Convenciones de arquitectura, diseño y componentes para la interfaz de ModoFriki-Web (React 19, Vite, TypeScript, Tailwind v4). Úsalo al crear o modificar cualquier pantalla, componente, hook o estilo del frontend.
---

# ModoFriki Frontend

## Contexto

ModoFriki-Web es un lector de cómics, manhwas, mangas y novelas en español.
Consume la API real configurada en `VITE_API_URL`; no usa mocks. La autenticación
con roles y el panel `/admin` forman parte de la aplicación.

## Stack

- React 19 + Vite 8 + TypeScript 6.
- React Router v7.
- Tailwind CSS v4 mediante `@tailwindcss/vite`.
- `lucide-react` para iconos.
- `motion` para animaciones discretas.
- `sonner` para notificaciones.
- `react-hook-form` + `zod` para formularios.
- `clsx` + `tailwind-merge` mediante `cn()`.
- Vitest + Testing Library para pruebas.
- React Compiler está activo: evita patrones que rompan las reglas de hooks.

## Identidad visual

- Fondo casi negro, superficies en grises muy oscuros.
- Naranja como único acento fuerte.
- Títulos con `Space Grotesk`; texto con `Inter`.
- Bordes sutiles, radios medios, hover con elevación ligera.
- Sin tema claro en esta fase.
- Usa siempre los tokens de `src/styles/tokens.css`; nunca escribas hexadecimales
  sueltos en componentes.

Tokens principales:

| Token                  | Valor     |
| ---------------------- | --------- |
| `--color-base`         | `#080808` |
| `--color-surface`      | `#111111` |
| `--color-raised`       | `#191919` |
| `--color-line`         | `#262626` |
| `--color-accent`       | `#ff7a00` |
| `--color-accent-hover` | `#ff9130` |
| `--color-primary`      | `#f5f5f5` |
| `--color-secondary`    | `#a3a3a3` |
| `--color-muted`        | `#6f6f6f` |

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

## Reglas de componentes

- Componentes pequeños y con una sola responsabilidad.
- Props tipadas; no uses `any`.
- Usa `cn()` para combinar clases condicionales.
- Los componentes de página no contienen lógica de persistencia; delegan en hooks.
- Los enlaces internos usan `Link` o `NavLink`, nunca `window.location`.
- Las imágenes siempre llevan `alt`, `loading="lazy"` y un fallback visual.
- Los botones iconográficos llevan `aria-label`.
- Respeta `prefers-reduced-motion`.
- No dupliques listas de navegación, géneros o rutas: usa las constantes de `src/lib`.

## Datos

- Toda llamada HTTP pasa por `src/services/*` y `src/lib/api.ts`. No uses `fetch`
  directo en componentes.
- Las consultas usan `useAsync` o los hooks de dominio `useCatalog` y `useReading`.
- Las mutaciones actualizan la UI de forma optimista y revierten si la API falla;
  muestra el error con `errorMessage()`.
- `API_URL` viene de `VITE_API_URL`. El token se guarda en `modofriki_token`; un
  401 con token dispara el evento `modofriki:unauthorized`.
- La persistencia local usa `useLocalStorage` con claves que empiezan por `modofriki_`.
- Respeta los roles: `/favorites` y `/profile` requieren sesión; `/admin` requiere
  rol `ADMIN` o `EDITOR`.

## Rutas

| Ruta                       | Pantalla                                         |
| -------------------------- | ------------------------------------------------ |
| `/`                        | Home pública.                                    |
| `/series`                  | Catálogo con búsqueda y filtros.                 |
| `/series/:id/:slug?`       | Detalle de la obra, capítulos y comentarios.     |
| `/read/:workId/:chapterId` | Lector en cascada o paginado.                    |
| `/genres`                  | Géneros y tags.                                  |
| `/rankings`                | Obras mejor valoradas.                           |
| `/favorites`               | Favoritos, requiere sesión.                      |
| `/profile`                 | Perfil e historial, requiere sesión.             |
| `/admin`                   | Administración, requiere rol `ADMIN` o `EDITOR`. |
| `/login`, `/register`      | Autenticación.                                   |
| `*`                        | Página 404.                                      |

## Verificación

Antes de cerrar cualquier cambio:

```bash
npm run build
npm run lint
npm run test:run
```

Si falla algo, corrige antes de continuar. No hagas commit con errores.
