---
name: ModoFriki Frontend
description: Convenciones de arquitectura, diseño y componentes para la interfaz de ModoFriki-Web (React 19, Vite, TypeScript, Tailwind v4). Úsalo al crear o modificar cualquier pantalla, componente, hook o estilo del frontend.
---

# ModoFriki Frontend

## Contexto

ModoFriki-Web es un lector de cómics, manhwas y novelas en español. En esta fase es
**solo frontend**: no hay llamadas al backend, no hay panel de administración y los
datos viven en mocks locales.

## Stack

- React 19 + Vite 8 + TypeScript 6.
- React Router v7.
- Tailwind CSS v4 mediante `@tailwindcss/vite`.
- `lucide-react` para iconos.
- `motion` para animaciones discretas.
- `clsx` + `tailwind-merge` mediante `cn()`.
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

| Token | Valor |
| --- | --- |
| `--color-base` | `#080808` |
| `--color-surface` | `#111111` |
| `--color-raised` | `#191919` |
| `--color-line` | `#262626` |
| `--color-accent` | `#ff7a00` |
| `--color-accent-hover` | `#ff9130` |
| `--color-primary` | `#f5f5f5` |
| `--color-secondary` | `#a3a3a3` |
| `--color-muted` | `#6f6f6f` |

## Estructura

```txt
src/
  app/          # App, router, providers
  components/   # ui, layout, home, catalog, detail, reader, auth, favorites, profile, common
  context/      # Auth, Library, UI
  hooks/        # hooks reutilizables y de dominio
  data/         # mocks tipados
  types/        # contratos del dominio
  lib/          # cn, format, storage
  styles/       # tokens y estilos globales
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

- Los mocks viven en `src/data/` y están tipados.
- No crees clientes HTTP ni servicios de API en esta fase.
- La persistencia local usa `useLocalStorage` con claves que empiezan por `modofriki_`.

## Rutas

- `/`, `/series`, `/series/:slug`, `/read/:slug/:chapter`.
- `/genres`, `/rankings`, `/favorites`, `/profile`, `/login`, `/register`.
- Cualquier otra ruta muestra la página 404.

## Verificación

Antes de cerrar cualquier cambio:

```bash
npm run build
npm run lint
```

Si falla algo, corrige antes de continuar. No hagas commit con errores.
