# Evidencia de validación

## Phase 7 — Polish y preocupaciones transversales (2026-10-30)

**Rama:** `phase7-polish-cross-cutting-concerns`, descendiente de `phase6-tres-imagenes-por-obra`; Phase 6 parte de `dev` en `5829537`. **Alcance:** revisión documental, pruebas frontend locales y clasificación de dependencias. No se conectó backend de prueba ni navegador E2E en este entorno.

### T078 — Accesibilidad y responsive

La revisión estática encontró pruebas jsdom de foco inicial, confinamiento/retorno y cierre seguro en `src/components/ui/modal.test.tsx`, asociación de etiqueta/ayuda/error en `src/components/admin/Field.test.tsx`, `:focus-visible` y reduced motion en estilos globales, además de tests de interacciones del editor. No hay herramientas de navegador/Playwright MCP conectadas a esta sesión (aunque `.mcp.json` documente su configuración), así que no fue posible recorrer teclado en navegador ni comprobar layout, scroll local y reduced motion a 360/1280 px. T078 permanece pendiente de esa comprobación manual; no se afirma cumplimiento visual completo.

### T079 — Privacidad y aislamiento

La búsqueda estática de producción en `src/` no encontró llamadas `console.*` ni logger que registren credenciales, correos, motivos privados o identidad del reportero. Los servicios de reportes envían y muestran campos de reporte en la vista ADMIN según autorización del servidor; no los persisten en almacenamiento local. No se encontró autoridad local para roles, sanciones ni asignaciones: la sesión se revalida con `/auth/me`, el gateway no convierte `unknown` en permiso y las mutaciones dependen del servidor.

Excepción existente: `TOKEN_KEY` guarda el token de sesión en `localStorage`; `PROGRESS_KEY` conserva la página exacta local por ámbito `userId`/`guest` y obra, y `READER_KEY` guarda preferencias de lectura. `VOTES_KEY`/`UI_KEY` son claves declaradas; no se encontró uso de persistencia local para rol, sanción o asignación. El progreso remoto y favoritos se consultan al servicio; favoritos están en memoria y se asocian a la identidad cargada. La auditoría es estática de frontend y no certifica XSS, almacenamiento del navegador, dependencias ni bitácora/autorización del backend. No se creó una bitácora local como sustituto.

### T081 — Verificación local

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| `npm.cmd run build` | Correcto | TypeScript y Vite producción |
| `npm.cmd run lint` | Correcto | ESLint sin salida de errores |
| `npm.cmd run test:run` | 168/168 correctas, 38 archivos | Vitest en la rama Phase 7 |
| `git diff --check` | Pendiente al preparar commit | Se ejecutará tras cerrar documentos |

Las comprobaciones corresponden al árbol de trabajo de Phase 7. No se observaron fallos de tests en esta ejecución. La evidencia previa de Phase 5 no se usa para reemplazar esta suite.

### T082 — Trazabilidad consolidada

La matriz contiene las 48 operaciones INT001–INT048 y sus consumidores. Su sección de cobertura Phase 7 agrupa cada operación y la vincula a requisitos FR y criterios SC, especifica pruebas de preparación frontend donde existen, marca explícitamente verificaciones reales pendientes y conserva los huecos frontend como pendientes. No hay operación E2E real verificada en esta revisión. T065, T066 y T077 siguen pendientes; también están pendientes verificaciones administrativas T042/T044/T046/T048 y dependencias DEP-003/004/006/007 según sus contratos.

| Cobertura | Clasificación en esta rama |
| --- | --- |
| FR-001–FR-030 / SC-001–SC-010 | Trazabilidad documental a tareas, consumidores y evidencia local en la matriz; no equivale a que todos los criterios de aceptación reales estén verificados |
| INT001–INT048 | 48 filas de operación; preparación frontend probada donde se indica, sin verificación E2E real acreditada |
| Huecos de implementación | Permanecen identificados en las filas INT004/005/018/019/047 y tareas pertinentes; no se reclasifican como dependencias externas para cerrarlos |
| Contratos/entorno externos | DEP-001/002/003/004/006/007 y servidor de pruebas impiden cerrar tareas reales condicionales |

### T083 — Aceptación final

No procede: dependen de verificación real T042/T044/T046/T048/T065/T066/T077, y T078 no se completó sin navegador. T083 permanece sin marcar y no se declara integración completa.

El checklist UX/datos sigue con sus 52 casillas sin evaluar; actualizar estas guías no aprueba decisiones del revisor.

## Phase 6 — User Story 4: tres imágenes por obra (2026-10-30)

**Rama:** `phase5-tres-imagenes-por-obra`, creada desde `dev` en `58295371`. **Alcance:** preparación frontend y fixtures; no se conectó a un backend compatible con DEP-004. Estos resultados no acreditan persistencia ni existencia de tres medios en el servidor.

### Evidencia local T067–T076

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Pruebas focalizadas | 17/17 correctas, 6 archivos | `work-media.test.ts`, `admin-work-media.test.ts`, `WorkForm.test.tsx`, `WorkImageField.test.tsx`, `ReaderView.test.tsx`, `WorksTab.test.tsx` |
| Suite frontend completa | 168/168 pruebas, 38 archivos | `npm.cmd run test:run` |
| Build | Correcto | `npm.cmd run build` (TypeScript y Vite) |
| Lint | Correcto | `npm.cmd run lint` (sin errores ni warnings) |
| Estado del transporte de crear/editar | Bloqueado antes de HTTP | `admin-work-media.test.ts`: `createWork` y `updateWork` reportan DEP-004 y no llaman al cliente; no se inventa campo multipart |
| Integridad del diff | Correcta al validar | `git diff --check` |

Los fixtures comprueban los tres slots separados y requeridos aunque la publicación sea borrador; una obra antigua sin banner de ficha conserva sus medios conocidos, muestra el slot ausente y no reutiliza el banner de capítulo como persistencia del banner de ficha; previsualizaciones ausentes o fallidas se distinguen de referencias persistidas; MIME JPEG/PNG/WebP, límite individual inclusivo de 10 MiB y total inclusivo de 100 MiB; selección inválida bloquea pese a imagen persistida y cancelar restaura la previsualización persistida; confirmación informa únicamente el slot reemplazado. El servicio libera object URLs reemplazadas/canceladas/al desmontar. La UI explica DEP-004 y no envía guardados parciales. Un 409 simulado en `WorksTab.test.tsx` conserva el formulario montado y el borrador local, y usa el `updatedAt` recargado en el siguiente intento; no acredita comportamiento de conflicto del servidor.

En el lector, el banner de capítulo aparece antes de las páginas en ambos modos. El test mantiene contador/página en 1 de 3 y no agrega un evento de apertura al cambiar el modo; se usan URLs distintas para portada, banner de ficha y banner de capítulo.

### Límites de evidencia y tareas condicionales

- Los escenarios de reemplazo solo validan selección/confirmación local. No se pudo guardar ni recargar un reemplazo real, comprobar conflicto de `updatedAt`, ni demostrar persistencia de tres destinos: el DTO actual solo ofrece `coverAsset` e `incapBannerAsset`, y el transporte real acepta `cover` e `inpagecover`.
- T077 sigue pendiente mientras backend publique el tercer campo multipart/DTO y sus reglas. No marcarlo completo mediante mocks; requiere crear/editar/recargar las tres ubicaciones, reemplazo individual y conflicto real.
- Las previews y URLs de prueba no sustituyen revisión visual en navegador ni ejecución responsiva con servidor. T078–T083 son fases posteriores.

La evidencia acredita preparación frontend y límites de archivo locales. No acredita que un archivo sea aceptado por almacenamiento/servidor ni que tras recarga se conserven los tres medios.

## Phase 5 — User Story 3: recorridos existentes completos (2026-10-30)

**Rama:** `phase5-recorridos-existentes-completos`; creada desde `dev` limpio y actualizado en `e8ccbb9`. **Alcance:** consumidor/frontend con fixtures locales; no se conectó a un backend de prueba. Los roles, respuestas 403 y persistencia se simularon y no demuestran autorización real.

### Resultado local

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Suite frontend | 153/153 pruebas, 34 archivos | `npm.cmd run test:run`; incluye páginas de catálogo/admin, 41 favoritos e historial, 101 registros de progreso, roles/sesión y conflictos |
| Build | Correcto | `npm.cmd run build` (TypeScript y Vite) |
| Lint | Correcto | `npm.cmd run lint` (sin errores ni warnings) |
| Integridad del diff | Correcta | `git diff --check` |
| Auditoría de consumidores | INT001–INT048 agrupados por recorrido | Ver “Auditoría de consumidores US3” en `contracts/integration-matrix.md`; no afirma verificación E2E |

Pruebas sensibles incluidas: 121 obras en el catálogo y 121 en `WorksTab`, continuación y error adicional conservando resultados, últimas páginas sin total inventado, 41 favoritos e historial a través de tres páginas, progreso remoto de 101 capítulos con deduplicación, acceso ADMIN/EDITOR/BASIC, sesión 401/403 y respuestas tardías, capítulo de 101 páginas en fixture de servicio, decimales exactos, versión y reordenamiento tras 409, y revocación simulada con revalidación sin reintentar la mutación denegada. No se atribuye al fixture la semántica de permisos del servidor.

### Dependencias externas pendientes

- **T065:** requiere recorrer INT001–INT048 contra un backend ejecutable con identidades y datos de prueba autorizados, recarga y resultados positivos/negativos. La mera inspección del OpenAPI/servicios o pruebas con mocks no completa la tarea; permanece pendiente.
- **T066 / DEP-006:** el servidor de referencia todavía necesita corregir la autorización de eliminación de capítulos para reservarla a ADMIN. Requiere luego probar rechazo directo a EDITOR asignado/BASIC/visitante, éxito ADMIN y conflicto de versión; esta rama frontend no modifica backend y la tarea permanece pendiente.
- DEP-007 sigue sin confirmar asignaciones de EDITOR; la UI conserva `unknown` y bloquea gestión ambigua. Esconder o deshabilitar controles no se considera evidencia de autorización.

T049–T064 quedan completadas con estas pruebas y cambios frontend. T065 y T066 permanecen sin marcar por ser condicionales, según el formato de `tasks.md`.

**Revisión:** preparación frontend de US2
**Fecha:** 2026-10-30
**Alcance:** frontend y fixtures aislados. No se usó un backend compatible ni se acreditan permisos, auditoría o persistencia reales.

## Verificación local

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Build de producción | Correcto | `npm run build` (TypeScript y Vite) |
| Lint | Correcto | `npm.cmd run lint` (ESLint, sin errores ni warnings) |
| Pruebas focalizadas US2 | 38/38 correctas, 7 archivos | `admin-policy`, `admin-validation`, `zoned-date`, `user-admin`, `AuthRevalidation`, `UsersTab` y `AssignmentsPanel` |
| Peticiones a capacidades no publicadas | Ninguna | `user-admin.test.ts`: operaciones rechazadas con `CapabilityUnavailable` antes de HTTP |

Las pruebas de componentes usan un gateway falso inyectado explícitamente. Ese resultado solo demuestra comportamiento de frontend bajo fixtures.

## Evidencia simulada por dependencia

| Dependencia | Preparación comprobada | Estado real |
| --- | --- | --- |
| DEP-001 listado | Página/continuación opaca en el puerto, estados de indisponibilidad y `unknown` distinto de `none`; tabla sin correo ni total inventado | Pendiente de contrato y servidor |
| DEP-002 roles | Política BASIC ↔ EDITOR, protecciones de cuenta propia/ADMIN, confirmación de UI y relectura del rol del destinatario | Pendiente de contrato, permisos y persistencia reales |
| DEP-003 sanciones | Validación de motivo/instantes, horas inexistentes/ambiguas, formularios temporal/permanente y hook local de consulta de restricción preparado | Pendiente de contrato, autorización, vencimiento y bloqueo real |
| DEP-007 asignaciones | Puerto y panel de consulta/búsqueda/continuación con confirmación, detección previa de duplicado y revocación separada | Pendiente de contrato, autorización y persistencia reales |
| Revalidación de sesión | Foco, deduplicación en curso, cambio de rol, respuesta tardía de otra sesión, 403 y fallo recuperable | Preparación frontend verificada; no acredita roles guardados en servidor |

## Limitaciones pendientes

- El gateway de producción declara indisponibles listado, cambios de rol, sanciones y asignaciones; no usa rutas ni DTO supuestos. La interfaz no contiene filas de demostración.
- No se verificaron cambios tras recarga, rechazos directos del servidor, trazabilidad, reglas de vencimiento ni persistencia de asignaciones. Corresponden a DEP-001/002/003/007 y a las tareas condicionales T041–T048.
- El estado `unknown` no se presenta como ausencia confirmada de sanción y no bloquea todos los comentarios. Las restricciones reales requieren DEP-003.
- La integración del hook con `CommentSection` y `CommentItem` (T038) se pospone hasta que los cambios T019–T023 de US1 estén presentes en `dev`, según la dependencia explícita del spec.
- La revisión del checklist UX/datos sigue siendo responsabilidad del revisor y no se altera en esta implementación.

---

## Phase 2 — bases compartidas (2026-10-30)

**Rama:** `phase-foundational-bases-compartidas`. **Base:** `dev` en `3bd4873` (rama limpia al inicio).

### Resultado

- T004: se añadieron tipos discriminados de disponibilidad y estado de consulta, además de `ManagementAccess`; `IntegrationUnavailableError` conserva el identificador DEP y no equipara indisponibilidad con vacío ni concede permisos.
- T005–T008: pruebas y cambios de modal/ConfirmDialog cubren foco inicial, Tab/Shift+Tab, Escape, retorno, cierre exterior, pending y confirmación de descarte dentro del diálogo; `Field` conecta etiqueta, hint y error mediante IDs y anuncia error.
- T009: pruebas de cliente cubren JSON, multipart, 204, 401 central, 403 protegido, 404/409, AbortSignal y reintento optativo de operación idempotente. No se duplicó cliente HTTP ni estado visual.
- `npm.cmd run test:run`: 24 archivos, 124 pruebas correctas.
- `npm.cmd run build`: correcto.
- `npm.cmd run lint`: correcto.
- `git diff --check`: correcto.

Las pruebas de API son unitarias con `fetch` simulado. No acreditan permisos, disponibilidad ni persistencia de servidor. No se modificó la checklist UX/datos.

### Hooks y publicación

Se ejecutaron manualmente los hooks locales SessionStart, PostToolUse (el recordatorio se activa para comandos que mencionan rutas `src`) y PreToolUse. La política de PreToolUse deniega explícitamente `git push` y asigna el push al usuario; por ello la rama queda local y no se publicó desde esta sesión.

---

# Validación de US1 — comentarios y spoilers

**Fecha:** 2026-10-29
**Rama:** `US1-comentarios-con-formato-y-spoilers`
**Capa:** frontend local; las pruebas de comunidad usan servicios simulados.

## Resultado

- `npm run build`: correcto.
- `npm run lint`: correcto.
- Pruebas focalizadas: 6 archivos, 27 pruebas correctas. Cubren formato permitido, spoilers independientes y literales, URLs peligrosas, límite de 10 000 unidades UTF-16, preservación del borrador, paginación/deduplicación, doble envío, aislamiento por cuenta/destino, resultados tardíos, revisión vigente, conflicto 409 y comentarios eliminados con respuestas.
- `git diff --check`: correcto.

Estas pruebas acreditan comportamiento del frontend. No acreditan publicación, permisos ni persistencia del backend; no se ejecutó un recorrido E2E real en esta verificación.

## Pendiente

- Medir la latencia de preview indicada en T024 en Chromium con CPU 4x, cinco calentamientos y 30 muestras; todavía no se ha registrado p95.
- Completar el recorrido real de INT026–INT032 cuando haya un entorno de backend disponible y registrar publicación/recarga por separado.
- La restricción real de crear, responder y editar comentarios por sanción sigue dependiendo de DEP-003. El renderer y editor de US1 no dependen de ese contrato.

## Entorno y hooks

El hook local SessionStart se ejecutó y aportó el contexto del proyecto. El hook PostToolUse se invocó al cerrar la implementación y recordó build, lint y pruebas; las tres verificaciones finalizaron correctamente. El hook PreToolUse solo bloquea `git push`, acción que no se realizó.

La checklist `checklists/ux-datos.md` conserva sus 52 puntos sin revisar; no se modificó. El script de prerrequisitos de Spec Kit no pudo ejecutarse porque PowerShell tiene bloqueada la ejecución de scripts. No existe `.specify/extensions.yml`.

---

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
