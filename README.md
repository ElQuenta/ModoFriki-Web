# ModoFriki Web

Interfaz SPA de **ModoFriki**, una biblioteca de cómics, manhwas, mangas y
novelas en español. Consume la API de
[ModoFriki-Backend](https://github.com/ElQuenta/ModoFriki-Backend), configurada
mediante `VITE_API_URL` (por defecto, `http://localhost:3000/api`).

## Stack

- React 19, Vite 8, TypeScript 6 y React Router v7.
- Tailwind CSS v4, Lucide React, Motion y Sonner.
- React Hook Form + Zod para formularios.
- Vitest + Testing Library para pruebas automatizadas.

## Empezar

```bash
npm install
```

Crea `.env` desde `.env.example` y configura `VITE_API_URL`. Después inicia la
aplicación:

```bash
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo. |
| `npm run dev:e2e` | Servidor de desarrollo con `.env.e2e`. |
| `npm run build` | Verificación de tipos y build de producción. |
| `npm run gen:api` | Genera `src/types/api.generated.ts` desde el OpenAPI del backend. |
| `npm run preview` | Previsualiza el build. |
| `npm run lint` | Ejecuta ESLint. |
| `npm run format` | Formatea con Prettier. |
| `npm run test` | Ejecuta Vitest en modo watch. |
| `npm run test:run` | Ejecuta Vitest una vez. |

## Pruebas E2E

Los recorridos y requisitos de navegador están descritos en
[`e2e/README.md`](e2e/README.md) y [`e2e/flows.md`](e2e/flows.md). `.mcp.json`
documenta la conexión de Playwright MCP; hace falta que el cliente tenga el
navegador instalado y que el backend de pruebas esté disponible. La
configuración no significa que los recorridos E2E se hayan ejecutado o aprobado.
La suite automatizada del repositorio es Vitest (`npm run test:run`).

## Rutas

| Ruta | Pantalla |
| --- | --- |
| `/` | Inicio con destacados, novedades y rankings. |
| `/series` | Catálogo con búsqueda y filtros. |
| `/series/:id/:slug?` | Ficha, capítulos, valoración y comentarios. |
| `/read/:workId/:chapterId` | Lector en cascada o paginado. |
| `/genres` | Géneros y tags. |
| `/rankings` | Obras mejor valoradas. |
| `/favorites` | Biblioteca personal; requiere sesión. |
| `/profile` | Perfil, historial y preferencias; requiere sesión. |
| `/admin` | Administración; requiere rol `ADMIN` o `EDITOR`. |
| `/login`, `/register` | Autenticación contra la API. |

Cualquier otra ruta muestra la página 404.

## Sesión y API

El token se guarda en `localStorage` con la clave `modofriki_token`. Un `401`
con sesión activa la invalida por el mecanismo central de autenticación. Las
rutas protegidas conservan el destino al redirigir a login. Toda llamada HTTP
pasa por servicios de `src/services/` y el cliente de `src/lib/api.ts`; los
componentes no hacen `fetch` directo. Los tipos generados de la API no se editan
a mano.

## Estructura

```text
src/
  app/          # App, router y providers
  components/   # UI, layout, home, catálogo, lector, admin y más
  context/      # Auth, Library y UI
  hooks/        # Hooks reutilizables y de dominio
  lib/          # Cliente API y utilidades
  pages/        # Pantallas de rutas
  services/     # Integración HTTP por dominio
  styles/       # Tokens y estilos globales
  test/         # Configuración y fixtures de pruebas
  types/        # Contratos del dominio
```

## Documentación

- [Skills y hooks](docs/skills-y-hooks.md).
- Skills de OpenCode en `.opencode/skills/`.
- Contrato de API y OpenAPI en el repositorio del backend.
- Validación de integración y limitaciones en `specs/001-deuda-tecnica-integracion/`.

## Alcance

El frontend ofrece catálogo, ficha, lector, biblioteca, comentarios y panel de
administración según los contratos disponibles. Las capacidades aún no
disponibles informan su estado; las pruebas con fixtures no certifican permisos
ni persistencia del backend. El tercer medio independiente de obra sigue
condicionado por DEP-004.
