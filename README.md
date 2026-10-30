# ModoFriki Web

Interfaz de **ModoFriki**, una biblioteca de cómics, manhwas, mangas y novelas en
español. Consume la API de [ModoFriki-Backend](https://github.com/ElQuenta/ModoFriki-Backend)
(`VITE_API_URL`, por defecto `http://localhost:3000/api`).

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
| `npm run gen:api` | Regenera `src/types/api.generated.ts` desde `../ModoFriki-Backend/openapi.yaml`. Córrelo cuando cambie el contrato y commitea el resultado. |
| `npm run preview` | Previsualiza el build. |
| `npm run lint` | ESLint. |
| `npm run format` | Formatea con Prettier. |
| `npm run test` | Tests en modo watch. |
| `npm run test:run` | Tests una sola vez. |

## Pruebas E2E

Los flujos y requisitos para pruebas asistidas con navegador están descritos en [`e2e/README.md`](e2e/README.md) y [`e2e/flows.md`](e2e/flows.md). La configuración de Playwright MCP está en `.mcp.json`; su disponibilidad depende de que el cliente local conecte ese servidor y de que el backend de pruebas esté levantado. La configuración por sí sola no significa que se hayan ejecutado o aprobado pruebas E2E. La suite automatizada disponible en este repositorio es Vitest (`npm run test:run`).

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Home con destacados, novedades y rankings. |
| `/series` | Catálogo con búsqueda y filtros. |
| `/series/:id/:slug?` | Ficha de serie, capítulos, valoración y comentarios. |
| `/read/:workId/:chapterId` | Lector en cascada o paginado. |
| `/genres` | Géneros y tags. |
| `/rankings` | Obras mejor valoradas. |
| `/favorites` | Biblioteca personal. |
| `/profile` | Perfil, historial y preferencias. |
| `/admin` | Panel de obras, taxonomía y reportes (ADMIN y EDITOR). |
| `/login` y `/register` | Inicio de sesión y registro contra la API. |

## Cuentas de prueba

Con el entorno de pruebas del backend (`npm run test:env:up` en ModoFriki-Backend):

- Lector: `lector.test@modofriki.local` / `ModoFriki-Test-2026`
- Admin: `admin.test@modofriki.local` / `ModoFriki-Test-2026`

Solo existen en esa base desechable. Detalles en [`e2e/README.md`](e2e/README.md).

## Estructura

```txt
src/
  app/          # App, router y providers
  components/   # ui, layout, home, catalog, detail, reader, auth...
  context/      # Auth, Library y UI
  hooks/        # hooks reutilizables
  services/     # llamadas a la API por dominio
  types/        # contratos del dominio
  lib/          # utilidades
  styles/       # tokens y estilos globales
  pages/        # pantallas de cada ruta
```

## Documentación

| Qué | Dónde |
| --- | --- |
| Contrato con la API | `ModoFriki-Backend/docs/API.md` y `openapi.yaml` |
| Pruebas E2E | [`e2e/README.md`](e2e/README.md) |
| Decisiones, dominio y mejoras | Vault de Obsidian `Obsidian-ModoFriki/ModoFriki` (carpeta hermana de los repos; empieza por `ModoFriki - Mapa`) |

## Personalización

Los colores y tipografías viven en `src/styles/tokens.css`. El acento naranja se
controla con `--color-accent`.

## Alcance

- Catálogo, ficha, lector, biblioteca, valoraciones y comentarios consumen servicios de API; la integración real requiere backend conectado.
- Panel editorial con gestión de obras/capítulos y reportes según las capacidades disponibles. Capacidades administrativas pendientes se muestran como no disponibles; el tercer medio por obra permanece bloqueado por DEP-004.
- Preparación de comentarios Markdown seguros con spoilers, paginación de recorridos existentes y aislamiento de datos por cuenta.
- Pruebas unitarias automatizadas con Vitest. La documentación/configuración E2E no constituye evidencia de ejecución real.
