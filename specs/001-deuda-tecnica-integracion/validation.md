# ValidaciÃ³n de US1 y US2

**Fecha:** 2026-10-30
**Rama de trabajo:** `US1-US2-tareas-restantes`
**Alcance:** preparaciÃ³n e integraciÃ³n frontend. Las pruebas de contratos nuevos usan solicitudes simuladas; no acreditan persistencia, autorizaciÃ³n ni auditorÃ­a del servidor.

## VerificaciÃ³n local

| ComprobaciÃ³n | Resultado | Evidencia |
| --- | --- | --- |
| Build de producciÃ³n | Correcto | `npm.cmd run build` (TypeScript y Vite) |
| Lint | Correcto | `npm.cmd run lint` (ESLint, sin errores ni warnings) |
| Pruebas focalizadas US1 + US2 + T038 | 67/67, 13 archivos | Parser/comentarios, polÃ­ticas, fechas, gateway, revalidaciÃ³n, administraciÃ³n y asignaciones |
| Pruebas US1 + T038 | 30/30, 6 archivos | Formato, spoilers, editor, comentarios, borradores, cursores y bloqueo conocido por sanciÃ³n |
| `git diff --check` | Pendiente de corrida final | Se ejecutarÃ¡ antes del commit |

La lista de usuarios, cambios de rol y asignaciones se adaptan a contratos publicados del backend hermano, revisiÃ³n `6d3a989` en `dev`. Sus pruebas unitarias validan parÃ¡metros y mapeos; no ejecutan una conexiÃ³n contra ese backend.

## Evidencia por historia

| Historia/capacidad | PreparaciÃ³n comprobada | Estado de servidor |
| --- | --- | --- |
| US1, INT026â€“INT032 | 30 pruebas de frontend en 6 archivos: creaciÃ³n, respuesta, ediciÃ³n, votos, reportes, eliminaciÃ³n, spoilers, paginaciÃ³n, conflicto y recuperaciÃ³n | Pendiente: no se levantÃ³ entorno backend ni se comprobÃ³ publicaciÃ³n/recarga |
| DEP-001, listado y detalle | Cursor `{createdAt,id}`, continuaciÃ³n, DTO privado, estado de sanciÃ³n `unknown` y GET de detalle | Adaptador probado con mocks; recorrido real pendiente (T042) |
| DEP-002, cambio de rol | BASIC/EDITOR, GET detalle y token CAS `expectedUpdatedAt`; sin destino ADMIN | Adaptador probado con mocks; permisos/persistencia real pendiente (T044) |
| DEP-003, sanciones | Modelo, validaciones de motivo/fecha/zona y consumidor que bloquea solo estado propio activo confirmado | Sin contrato de servidor; T045/T046 pendientes |
| DEP-007, asignaciones | Cursor completo, versiones CAS, detecciÃ³n de duplicado, historial/revocaciÃ³n; obras seleccionadas por el listado vigente de personal | Adaptador probado con mocks; recorrido real pendiente (T048) |
| RevalidaciÃ³n de sesiÃ³n | Foco, deduplicaciÃ³n, cambio de rol, respuesta tardÃ­a, 403 y fallo recuperable | Pruebas frontend; autorizaciÃ³n de servidor no acreditada |

## Pendientes y restricciones

- **T024:** no se logrÃ³ una mediciÃ³n vÃ¡lida con Chromium/Edge, CPU 4x, cinco calentamientos y 30 muestras de preview de 10 000 unidades. No se registra un p95 inventado ni se afirma que cumpla 100 ms.
- **T025:** escenario simulado documentado por separado de los recorridos reales. INT026â€“INT032 real pendiente por falta de entorno conectado.
- **T042/T044/T048:** requieren recorridos contra el entorno de pruebas backend, incluyendo persistencia y rechazos directos. La existencia de rutas no equivale a evidencia de runtime.
- **T045/T046:** DEP-003 no publica operaciones ni esquema de sanciones; el estado `unknown` no se interpreta como `none` y la interfaz no llama rutas supuestas.
- La checklist `checklists/ux-datos.md` conserva sus 52 puntos sin revisar, por corresponder al revisor.

## Hooks y herramientas

- El hook local SessionStart se ejecutÃ³ al comenzar la sesiÃ³n y aportÃ³ el contexto del repositorio.
- El hook PostToolUse se ejecutarÃ¡ al cierre y recordarÃ¡ las verificaciones de build, lint y tests.
- No se usÃ³ `git push`; el hook PreToolUse correspondiente lo bloquea.
- Se usaron subagentes para T038, auditorÃ­a de contratos del backend y evaluaciÃ³n de T024.
- MCP de Playwright no estÃ¡ disponible en esta sesiÃ³n. La falta de esa herramienta no se sustituyÃ³ por una afirmaciÃ³n de E2E real.
- El script de prerrequisitos de Spec Kit continÃºa sin ejecutarse porque PowerShell bloquea scripts; `.specify/extensions.yml` no existe.

## Phase 1 — baseline y revisión de alcance (2026-10-30)

**Rama:** `Phase-1-Setup-estado-inicial-y-alcance`. **Alcance:** evidencia inicial sin cambios de código. Se inspeccionaron `package.json`, `package-lock.json` (lockfileVersion 3), `tsconfig.app.json`, `src/app/router.tsx` y `vitest.config.ts`. Runtime local: Node `v26.1.0`, npm `11.13.0`; en PowerShell se invocó `npm.cmd` porque la política de ejecución bloquea `npm.ps1`.

| Comprobación de baseline | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run build` | Correcto | TypeScript y Vite; sin errores |
| `npm.cmd run lint` | Correcto | ESLint; sin errores ni warnings |
| `npm.cmd run test:run` | 19 archivos y 82 pruebas pasan | Suite completa de Vitest; 9.24 s |
| Fallos previos | Ninguno observado | Las tres comprobaciones completaron correctamente antes de esta fase |

### Checklist UX/datos: 52 ítems pendientes

Se verificó que CHK001–CHK052 están todos sin marcar en `checklists/ux-datos.md`. No se evaluó el checklist ni se cambió marcador alguno. Sus lagunas se agrupan así: CHK001–010 completitud, alcance, borradores y términos; CHK011–014 accesibilidad y presentación; CHK015–020 validación de texto, spoilers, sanciones, imágenes y DTO; CHK021–026 consistencia de permisos y estados; CHK027–032 recuperación ante errores, conflictos y paginación; CHK033–036 aceptación y evidencia; CHK037–040 contratos pendientes, autorización editorial, medición y privacidad; CHK041–046 selección/foco, anuncios accesibles, cierre, Markdown no admitido, errores de imagen y alternancia de sanción; CHK047–052 pertenencia/filtros, calendario, decimales, valoración y semántica de campos parciales. Son asuntos pendientes para revisión, no incumplimientos aprobados.

**Decisiones de producto ya aprobadas:** retiro de capítulos solo por ADMIN; cambio de rol solo entre BASIC y EDITOR para terceros, excluyendo cambios propios y cuentas ADMIN; sanción de comentarios separada de `SUSPENDED`, que impide crear/responder/editar pero conserva acciones autorizadas; tres imágenes requeridas también para borradores; términos separados para portada, banner de ficha y banner de capítulo; auditoría autoritativa del servidor sin bitácora local autoritativa; progreso local exacto del lector separado del progreso remoto. **Precisiones técnicas pendientes:** las preguntas CHK no han sido evaluadas; DEP-003 aún carece de extensión temporal y recorrido real probado; DEP-004 no proporciona el tercer medio; privacidad, errores, límites y contratos se validan con evidencia del consumidor/servidor conforme avance cada tarea. Esta lista no aprueba ni amplía requisitos.

### Revisión de solo lectura del backend

Se contrastó `../ModoFriki-Backend` en `dev`, commit completo `c6a9f18a631db992e584d5a2d04fbf49745fef5c`; el árbol se consultó limpio. Fuentes: rutas registradas, OpenAPI, esquemas Joi, controladores, servicios y repositorios. La existencia del contrato no acredita disponibilidad ni autorización en runtime; no se levantó ni llamó servidor.

DEP-001 (listado/detalle), DEP-002 (cambio de rol) y DEP-007 (asignaciones) mantienen contratos publicados ya adaptados por el frontend; recorridos reales siguen pendientes. DEP-003 ahora tiene `GET /api/admin/users/:userId/comment-sanctions`, `POST /api/admin/users/:userId/comment-sanctions`, `PUT /api/admin/users/:userId/comment-sanctions/:sanctionId/revocation` y consulta propia `GET /api/auth/me/comment-restriction`. Las rutas administrativas requieren ADMIN. La creación valida UUID v4 y motivo no vacío hasta 2000 caracteres según Joi; fecha final es ISO o `null` para permanente; el historial usa cursor compuesto. La consulta propia responde `active`, `reason`, `endsAt` y `permanent`. El backend aplica rechazo por sanción al crear comentarios. No se encontró endpoint de extensión temporal; tampoco se confirmó aquí que la sanción impida edición. Por ello T045/T046 permanecen pendientes hasta terminar el contrato/adaptación y realizar comprobaciones necesarias, sin declarar que la sanción ya cubra crear, responder y editar.
