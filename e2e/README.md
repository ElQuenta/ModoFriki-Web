# Pruebas E2E (Playwright MCP)

Claude Code abre un navegador real con el **MCP de Playwright** (`.mcp.json`) y ejecuta los 21 casos de [`flows.md`](flows.md): navegación, catálogo, ficha, lector, auth, favoritos, valoración, comentarios, roles y móvil. En cada paso revisa la consola y la red.

No hay scripts de prueba que mantener: **los casos se escriben en lenguaje natural en `flows.md`**, y el agente los ejecuta.

## Requisitos (una sola vez)

1. **Docker Desktop** abierto.
2. El repo del backend clonado **al lado** de este (`../ModoFriki-Backend`). Si está en otra ruta, define la variable de entorno `MODOFRIKI_BACKEND_DIR`.
3. `npm install` en los dos repos.
4. Abre Claude Code en este repo y acepta el servidor MCP `playwright` cuando lo pida (o revísalo con `/mcp`). No necesita API key.

## Uso

| Comando | Qué hace |
| --- | --- |
| `/probar-frontend` | Levanta el backend de pruebas (Docker) y el front en modo e2e, ejecuta todos los casos y reporta los fallos con evidencia. No toca código |
| `/probar-frontend E2E-07` | Un caso concreto (o una sección: `/probar-frontend B`) |
| `/corregir-frontend` | Prueba, corrige los bugs del front en la causa raíz, vuelve a probar, y corre lint, tests y build. **No hace commit** |

`npm run dev:e2e` levanta el front contra `http://localhost:3000/api` (`.env.e2e`) sin tocar tu `.env`.

Las capturas de los fallos quedan en `e2e/reports/` (ignorado por git).

## Datos

Usa los fixtures del backend (`ModoFriki-Backend/postman/fixtures/test-data.sql`): lector `lector.test@modofriki.local` y admin `admin.test@modofriki.local`, ambos con la contraseña `ModoFriki-Test-2026`, más la "Obra de Prueba" con 2 capítulos. Solo existen en la base desechable de Docker.

## Agregar o cambiar un caso

Edita `flows.md` siguiendo el formato `E2E-NN · Título` → pasos numerados → **Esperado**. Usa los nombres accesibles que muestra la app (texto de botones, `aria-label`, headings), no clases CSS. Si cambias una pantalla, actualiza su caso en el mismo PR.
