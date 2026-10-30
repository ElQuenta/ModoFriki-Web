# Tasks: Comunidad, administración e integración

**Input**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contrato UI](contracts/frontend-ui.md), [matriz](contracts/integration-matrix.md) y [quickstart](quickstart.md).
**Feature**: `001-deuda-tecnica-integracion` · **Rama observada**: `dev` · **Fecha**: 2026-10-29.
**Alcance**: Frontend existente. No desarrollar backend, migraciones ni permisos del servidor en esta feature.

**Tests**: Incluidos por los criterios SC-001/002/008/009 y la constitución IX para comunidad, permisos, conflictos y subidas. Usar Vitest/Testing Library existentes; escribir primero los casos sensibles y observar fallo por comportamiento pendiente. No añadir pruebas que solo reproduzcan implementación ni presentar simulación como E2E.

## Formato y reglas de ejecución

`- [ ] Tnnn [P?] [USn?] Acción con rutas relativas a la raíz del frontend`. Los nombres nuevos son ubicaciones de diseño. [P] solo permite concurrencia dentro de grupos indicados, después de prerrequisitos y sin editar archivos compartidos.

**CONDICIONAL**: tarea sin marcar mientras falte contrato/entorno externo. Registrar bloqueo no la completa. Las tareas independientes continúan; no implementar un endpoint supuesto ni habilitar autoridad por flag público. La verificación real pendiente se registra por separado de la preparación.

[ux-datos.md](checklists/ux-datos.md) tiene 52 ítems sin evaluar, propiedad del revisor. Generar/ejecutar estas tareas no autoriza aprobar sus marcadores. Su revisión documental es distinta de los tests y de este listado.

## Phase 1: Setup — estado inicial y alcance

**Objetivo**: Capturar evidencia y contratos sin regenerar la aplicación.

- [ ] T001 Inspeccionar `package.json`, `package-lock.json`, `tsconfig.app.json`, `src/app/router.tsx` y `vitest.config.ts`; capturar baseline de build/lint/test:run y fallos previos en `specs/001-deuda-tecnica-integracion/validation.md`, sin introducir cambios de código por generar evidencia.
- [ ] T002 Registrar los 52 ítems pendientes de `specs/001-deuda-tecnica-integracion/checklists/ux-datos.md` y sus lagunas que afectan las historias en `specs/001-deuda-tecnica-integracion/validation.md`, sin evaluarlos ni cambiar marcadores; distinguir decisiones de producto ya aprobadas de precisiones técnicas pendientes.
- [ ] T003 Recontrastar de solo lectura rutas/OpenAPI/validaciones del backend y actualizar revisión, consumidores y disponibilidad en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/integration-dependencies.md`, sin inventar endpoints, totales ni máximos de motivo.

**Checkpoint**: Baseline y dependencias documentados; fallos existentes diferenciados de los introducidos por esta feature.

## Phase 2: Foundational — bases compartidas

**Objetivo**: Disponibilidad, acceso y controles accesibles reutilizables. Requiere T001–T003 y precede las historias.

- [ ] T004 Definir modelos en `src/types/integration.ts` y error acotado en `src/lib/integration.ts`: «`Availability`: available o unavailable con referencia DEP», «Estado de consulta: loading, success, empty, error, unavailable» y «`managementAccess` se representa como `allowed | denied | unknown`»; disponibilidad no concede permisos ni respuesta inválida equivale a vacío.
- [ ] T005 [P] Escribir pruebas de foco inicial, Tab/Shift+Tab, Escape, retorno y pending en `src/components/ui/modal.test.tsx`, con un solo diálogo activo y cancelación sin mutación. Cubrir cierre limpio, elección Descartar cambios/Seguir editando en el mismo diálogo y cierre bloqueado durante envío, incluidos Escape y cierre exterior.
- [ ] T006 [P] Escribir pruebas de etiquetas/hint/error asociados y mensajes accesibles en `src/components/admin/Field.test.tsx`, con fixtures independientes de T005.
- [ ] T007 Implementar foco inicial/confinamiento/retorno, IDs accesibles y cierre seguro durante pending en `src/components/ui/modal.tsx` y `src/components/ui/confirm-dialog.tsx`, según T005; conservar tokens y reduced motion y evitar confirmaciones apiladas. Sin cambios, cerrar normalmente; con dirty, pedir Descartar cambios o Seguir editando dentro del mismo diálogo, y bloquear Escape/cierre exterior/Cancelar durante pending hasta conocer resultado.
- [ ] T008 Asociar etiqueta/campo/hint/error mediante IDs en `src/components/admin/Field.tsx` según T006, preservando consumidores y el resolver existente en `src/lib/zod-resolver.ts`.
- [ ] T009 Escribir pruebas JSON/FormData/204, 401 central, 403/404/409, AbortSignal y reintento idempotente en `src/lib/api.test.ts`; reconciliar fallos del contrato existente en `src/lib/api.ts`, sin duplicar cliente HTTP ni añadirle estado visual.
- [ ] T010 Validar las bases compartidas con sus pruebas, build y lint y registrar resultados y límites en `specs/001-deuda-tecnica-integracion/validation.md`; no atribuir autorización real a simulación ni modificar casillas del checklist UX/datos.

**Checkpoint**: T004–T010 completas. Reutilizar React, Router, Hook Form/Zod, Sonner, Lucide y Motion.

## Phase 3: User Story 1 — Comentarios y spoilers (Priority: P1) — MVP

**Goal**: Editor/preview/render seguro y carga robusta sin perder jerarquía ni borradores.
**Independent Test**: Obra/capítulo × raíz/respuesta: publicar/recargar formato, revelar solo uno de dos spoilers por teclado, conservar fuente ante error/409 y no duplicar hilos. No necesita contratos administrativos nuevos.
**Cobertura**: FR-001–005/015/016/022/029/030; SC-001/006/007.

### Tests

- [x] T011 [P] [US1] Crear fixtures y pruebas de gramática/sanitización en `src/lib/markdown/markdown.test.ts`: formatos aprobados, spoilers vacíos/sin cierre/escapados/múltiples, formato interior, saltos blandos y exclusión de código, HTML, protocolos peligrosos e imágenes, conservando literales seguros. Incluir fuente no soportada preservada literalmente (también sintaxis de imagen escrita como texto), sin subida/pegado/arrastre de archivos ni solicitudes automáticas de imagen.
- [x] T012 [P] [US1] Escribir pruebas de editor/preview/disclosure en `src/components/detail/CommentEditor.test.tsx` y `src/components/detail/CommentMarkdown.test.tsx`: dos spoilers independientes, texto oculto no accesible, selección/foco y «máximo 10 000 unidades UTF-16 incluyendo delimitadores», 10 001 rechazado y al menos un carácter no blanco, sin normalización destructiva.
- [x] T013 [P] [US1] Escribir pruebas de cursores, duplicados, fallo adicional, doble envío, cambio de identidad/destino, respuesta tardía, autor ausente y eliminado con descendientes en `src/components/detail/CommentSection.test.tsx`; incluir conflicto que conserva borrador y transporte simulado explícito.

### Implementación

- [x] T014 [US1] Verificar compatibilidad/publicación y fijar las cuatro dependencias runtime Markdown del research en `package.json` y `package-lock.json`, con tipos AST directamente declarados en desarrollo si se importan; no instalar remark-gfm completo, editor pesado ni otra librería de formularios/estado.
- [x] T015 [US1] Crear validación/borrador en `src/lib/comments.ts` y `src/types/comments.ts`: «fuente de tipo string, al menos un carácter no blanco, máximo 10 000 unidades UTF-16 incluyendo delimitadores»; preservar ownerScope, destino/padre, fuente/baseRevision y estados «`idle | submitting | conflict | error`», sin persistencia nueva por defecto. El comentario es solo fuente textual: no File, adjuntos ni referencia de imagen; pegar texto es válido y los constructos no soportados conservan la fuente literal.
- [x] T016 [US1] Implementar plugin sintáctico en `src/lib/markdown/remark-spoilers.ts` y configuración selectiva de tachado/sanitización en `src/lib/markdown/config.ts`, según contrato UI: sin cruce de bloques/anidamiento, literales en código/escapes y sin regex sobre HTML o nodos aislados que rompa formato interior. Convertir cualquier constructo no soportado en texto literal escapado conservando su fuente exacta antes del render; no eliminar silenciosamente sintaxis de imagen ni iniciar cargas por URL.
- [x] T017 [US1] Crear `src/components/detail/Spoiler.tsx` y `src/components/detail/CommentMarkdown.tsx` sobre T016: esquema acotado, enlaces http/https y rutas internas seguras, sin HTML arbitrario ni imágenes automáticas; botón y contenido hermanos, estados separados y reinicio por fuente/revisión/destino.
- [x] T018 [US1] Crear `src/components/detail/CommentEditor.tsx` sobre T015/T017 con texto controlado, barra sobre selección, contador UTF-16, preview común y errores asociados; conservar selección/foco/fuente y bloquear doble confirmación con pending explícito. No incluir selector, subida, pegado o arrastre de archivos ni previews de imágenes en comentarios; Cancelar con cambios ofrece Descartar cambios/Seguir editando en el área del editor.
- [x] T019 [US1] Integrar editor raíz en `src/components/detail/CommentSection.tsx` y editor de respuesta/edición y renderer en `src/components/detail/CommentItem.tsx`, conservando identidad/destino/padre/revisión y sin reutilizar borradores entre cuentas u obras.
- [x] T020 [US1] Propagar AbortSignal en `src/services/community.ts` y deduplicar/aislar carga adicional en `src/components/detail/CommentSection.tsx` y `src/components/detail/CommentItem.tsx`; conservar «nextCursor `{createdAt,id}` o null», orden del servidor y páginas previas al error, sin fabricar cursores.
- [x] T021 [US1] Corregir revisiones y conflictos en `src/components/detail/CommentItem.tsx` y `src/components/detail/ReportDialog.tsx`: no calcular revisión autoritativa tras votos/respuestas/reportes, invalidar y releer mediante listados antes de editar y comparar versión actual ante 409 sin perder fuente/baseRevision ni inventar GET individual.
- [x] T022 [US1] Conservar votos/reportes/eliminación en `src/components/detail/CommentItem.tsx`, autor neutral no disponible, descendientes de DELETED con bodyMarkdown null, claves de voto por cuenta y rollback/reconciliación; resolver reporte no sanciona ni elimina automáticamente.
- [x] T023 [US1] Completar cancelación/cierre y recuperación accesibles en `src/components/detail/CommentEditor.tsx`, `src/components/detail/CommentSection.tsx` y `src/components/detail/CommentItem.tsx`, sin pérdida silenciosa de escritura y con mensajes de validación/carga diferenciados en español.
- [ ] T024 [US1] Medir y ajustar preview en `src/lib/markdown/config.ts` y `src/components/detail/CommentEditor.tsx`: fuente máxima, CPU 4x, 5 calentamientos, 30 muestras y p95 ≤100 ms tras pausa de 150 ms; registrar equipo/navegador y resultados en `specs/001-deuda-tecnica-integracion/validation.md`, sin incluir latencia de red.
- [ ] T025 [US1] Ejecutar T011–T013 y escenarios de comentarios del quickstart, registrando evidencia simulada y real por separado para INT026–INT032 en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`; no cerrar evidencia real si falta entorno.
- [ ] T026 [US1] Cerrar preparación de US1 frente a FR-001–005/029 y SC-001 en `specs/001-deuda-tecnica-integracion/validation.md`, con build/lint/tests pertinentes y restricción real de sanciones todavía pendiente de DEP-003/US2, sin declarar backend probado por simulación.

**Checkpoint**: MVP de comentarios independiente. Las sanciones reales no bloquean su renderer/editor.

## Phase 4: User Story 2 — Usuarios, roles, sanciones y asignaciones (Priority: P1)

**Goal**: Preparar administración con políticas claras; activar HTTP solo con contrato real.
**Independent Test**: Proveedor aislado permite recorrer tabla y confirmar/rechazar roles, sanciones y asignaciones; en uso normal se informa indisponibilidad sin demo ni HTTP supuesto. Autorización/persistencia reales se prueban aparte.
**Cobertura**: FR-006–012/025/027/028; SC-002/009.

### Tests

- [ ] T027 [P] [US2] Escribir casos de políticas en `src/lib/admin-policy.test.ts`: solo terceros BASIC ↔ EDITOR, sin cambios/promociones ADMIN ni rol propio, sanciones solo BASIC/EDITOR, asignaciones solo EDITOR y «`unknown` no se convierte en `allowed` por estar en una lista».
- [ ] T028 [P] [US2] Escribir pruebas en `src/lib/zoned-date.test.ts` y `src/lib/admin-validation.test.ts`: «endsAt obligatorio solo para temporary y posterior al instante actual», extensión posterior al anterior/actual, permanente sin endsAt, motivo no blanco, zona distinta del navegador y horas inexistentes/ambiguas.
- [ ] T029 [P] [US2] Escribir pruebas de puerto/tabla/formularios en `src/services/user-admin.test.ts` y `src/components/admin/UsersTab.test.tsx`: carga/vacío/error/indisponible, continuación sin total inventado, cancelación, sujeto convertido en ADMIN y ninguna petición HTTP en capacidad pendiente, con fixture aislado. Añadir `src/context/AuthRevalidation.test.tsx` para foco/confirmación/403, deduplicación por sesión, resultados tardíos, rol actualizado, pending y fallo recuperable con borradores conservados, sin compartir archivo con tests US3.

### Preparación sin backend nuevo

- [ ] T030 [US2] Crear modelos locales en `src/types/user-admin.ts` y políticas/validación en `src/lib/admin-policy.ts` y `src/lib/admin-validation.ts`: UUID/roles, sanción «`unknown`», «`none`», «`active-temporary`», «`active-permanent`», «`expired` o `revoked`»; motivo no blanco sin máximo remoto inventado; asignación workId/editorId/assignedAt y «revokedAt nullable».
- [ ] T031 [US2] Implementar `src/lib/zoned-date.ts` con Date/Intl, zona IANA de cuenta/fallback America/La_Paz e ida/vuelta explícita: «Hora inexistente se rechaza; hora ambigua requiere seleccionar desfase», sin otra librería de fechas ni zona implícita del navegador.
- [ ] T032 [US2] Crear puerto `UserAdminGateway` y adaptador normal indisponible por operación en `src/services/user-admin.ts`, sin rutas/DTO supuestos ni autoridad local; proveedor falso solo en `src/test/fixtures/user-admin.ts`, inyectable en pruebas y nunca seleccionado automáticamente en producción.
- [ ] T033 [US2] Crear `src/components/admin/UsersTab.tsx` con consulta paginada, políticas y estados diferenciados: «La lista administrativa no necesita exponer correo: mínimo `id`, `username`, `role` y estado de sanción», sin descargar todos los usuarios ni equiparar unknown a none.
- [ ] T034 [US2] Crear `src/components/admin/RoleDialog.tsx` con Hook Form/Zod/modal: solo cambios BASIC ↔ EDITOR de terceros, ADMIN de consulta y nunca destino, confirmación/errores asociados y refresco confirmado, sin cambiar rol visible como confirmado tras rechazo.
- [ ] T035 [US2] Crear `src/components/admin/SanctionDialog.tsx` y `src/components/admin/SanctionStatus.tsx`: temporal/permanente, motivo/zona, extensión solo temporal, retirada confirmada y ADMIN de solo lectura; al elegir permanente limpiar vencimiento/errores, resumir tipo/destinatario/instante y conservar formulario ante fallo.
- [ ] T036 [US2] Crear `src/components/admin/AssignmentsPanel.tsx` con obras vigentes, selector de búsqueda/continuación y confirmación: «Un par vigente no se duplica», «Revocar conserva historial y no retira contenido» y cambiar rol no crea/reactiva asignaciones revocadas; sin filtros remotos supuestos ni destinatarios BASIC/ADMIN.
- [ ] T037 [US2] Integrar Usuarios/gateway en `src/pages/AdminPage.tsx` solo para ADMIN; capacidad ausente muestra indisponibilidad sin filas demo, invalidar consultas pertinentes tras respuesta confirmada y descartar respuestas de identidad anterior.
- [ ] T038 [US2] Preparar restricción propia en `src/hooks/useCommentRestriction.ts` e integrar avisos/bloqueo por sanción conocida en `src/components/detail/CommentSection.tsx` y `src/components/detail/CommentItem.tsx`; impedir crear/responder/editar sin restringir acciones conservadas. Unknown por DEP-003 no se presenta como ausencia confirmada ni bloquea todos los comentarios. Integrar después de T019–T023.
- [ ] T039 [US2] Implementar revalidación deduplicada por sesión en `src/context/AuthContext.tsx` y `src/hooks/useAuth.ts`: GET `/auth/me` al recuperar foco, antes de confirmar acciones administrativas sensibles y después de 403 protegido; mientras se consulta bloquear confirmaciones y, ante fallo recuperable, conservar borradores sin asumir permisos vigentes. Descartar resultados de otra sesión, mantener 401 central y nunca reintentar automáticamente la escritura rechazada. Integrar el estado actual en `src/components/admin/UsersTab.tsx`, `src/components/admin/SanctionDialog.tsx` y `src/components/admin/AssignmentsPanel.tsx`; al vencer sanción reconsultar su contrato propio, sin autoridad del reloj cliente ni bitácora local.
- [ ] T040 [US2] Ejecutar T027–T029 y matriz de preparación de historia 2/SC-009 en `specs/001-deuda-tecnica-integracion/validation.md`, cubriendo transiciones, duplicados, cancelación, pérdida de rol y ADMIN protegido, sin afirmar persistencia, autorización o auditoría reales.

### Activación externa — condicional e independiente por capacidad

- [ ] T041 [US2] CONDICIONAL DEP-001: al publicarse el contrato de listado, adaptar y validar su consulta en `src/services/user-admin.ts` y `src/services/user-admin.test.ts`; documentar ruta/DTO/continuación reales en `specs/001-deuda-tecnica-integracion/integration-dependencies.md`, sin esperar cambios de rol, sanciones ni asignaciones ni inventar backend.
- [ ] T042 [US2] CONDICIONAL T041/entorno real: verificar listado, continuación, vacío/error, privacidad y rechazo BASIC/EDITOR con servidor real y registrar evidencia solo DEP-001 en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`; no depender de otras activaciones administrativas.
- [ ] T043 [US2] CONDICIONAL DEP-002: adaptar cambio de roles BASIC ↔ EDITOR de terceros en `src/services/user-admin.ts` y `src/services/user-admin.test.ts` al contrato publicado, con respuesta validada, errores/concurrencia/trazabilidad y rechazos propios/ADMIN/promoción ADMIN; registrar contrato en `specs/001-deuda-tecnica-integracion/integration-dependencies.md`, sin exigir otros adaptadores para preparar este.
- [ ] T044 [US2] CONDICIONAL T043/entorno real: probar cambio y persistencia, rechazo de rol propio/ADMIN/promoción ADMIN y actualización de identidad del afectado; registrar evidencia solo DEP-002 en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`. El recorrido de selección requiere fuente de identidad confirmada, sin bloquear prueba directa del adaptador por falta de otros contratos.
- [ ] T045 [US2] CONDICIONAL DEP-003: acordar longitud/formato del motivo, consulta propia, instantes y errores antes de adaptar sanciones en `src/services/user-admin.ts` y `src/hooks/useCommentRestriction.ts`; validar respuestas y política sin SUSPENDED, añadir casos de contrato en `src/services/user-admin.test.ts` y documentar contrato en `specs/001-deuda-tecnica-integracion/integration-dependencies.md`, sin esperar roles/asignaciones.
- [ ] T046 [US2] CONDICIONAL T045/entorno real: verificar temporal/permanente, extensión/retirada/vencimiento, bloqueo real de crear/responder/editar, acciones conservadas y rechazo de gestión de ADMIN, incluyendo cambio concurrente; registrar evidencia solo DEP-003 en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`, sin pruebas simuladas como autorización real.
- [ ] T047 [US2] CONDICIONAL DEP-007: adaptar consulta/asignación/revocación y capacidad vigente inequívoca en `src/services/user-admin.ts` y `src/components/admin/AssignmentsPanel.tsx`; registrar contrato/concurrencia/trazabilidad en `specs/001-deuda-tecnica-integracion/integration-dependencies.md`, sin presumir asignación por visibilidad ni esperar el contrato de sanciones.
- [ ] T048 [US2] CONDICIONAL T047/entorno real: verificar persistencia, duplicado, revocación, pérdida de rol y rechazo directo de gestión no autorizada; registrar evidencia solo DEP-007 en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`. Un consumidor sin identidad/obra confirmada sigue pendiente sin invalidar pruebas directas del adaptador disponibles.

**Checkpoint**: T027–T040 acreditan preparación; T041–T048 activan y verifican cada capacidad independientemente. El bloqueo de una pareja no impide avanzar otras ni US3/US4. Formularios se prueban solos; T038 se integra después de US1.

## Phase 5: User Story 3 — Recorridos existentes completos (Priority: P1)

**Goal**: Consumidores, continuación y recuperación de operaciones existentes sin perder lectura ni datos privados.
**Independent Test**: Recorrer matriz disponible, avanzar >100 obras y varias páginas de biblioteca/comunidad, confirmar cambios tras recarga y rechazos por rol. Un hueco frontend no se renombra dependencia externa.
**Cobertura**: FR-013–017/022/024/026/028/030; SC-003/004/008/010.

### Tests

- [ ] T049 [P] [US3] Escribir casos de continuación en `src/services/catalog.test.ts`, `src/services/discovery.test.ts` y `src/services/reading.test.ts`: «Catálogo: array por page/limit, sin total», «Comunidad: items/hasMore/nextCursor», «Biblioteca/discovery: items/total/page/limit»; fixtures de 121 obras/41 favoritos/historial >40, sin mezclar sobres ni inventar total.
- [ ] T050 [P] [US3] Escribir pruebas de roles/rutas/sesión en `src/components/auth/ProtectedRoute.test.tsx` y `src/context/AuthContext.test.tsx`: visitante/BASIC/EDITOR/ADMIN, 401 central, 403 sin otra identidad, respuesta tardía tras cambio de cuenta y datos privados no confirmados durante comprobación de sesión. Incluir revalidación al foco y tras 403, confirmaciones sensibles bloqueadas mientras se consulta y actualización del rol recibido, sin reintento automático de la mutación rechazada.
- [ ] T051 [P] [US3] Escribir regresiones en `src/components/catalog/CatalogView.test.tsx` y `src/context/LibraryContext.test.tsx`: error al pedir más, filtro nuevo, favoritos parciales, unknown distinto de false y claves locales de cuentas distintas; fixtures independientes de T049/T050.

### Implementación

- [ ] T052 [US3] Exponer consultas por página/contexto/AbortSignal en `src/services/catalog.ts`, `src/services/discovery.ts`, `src/services/reading.ts` y `src/hooks/useCatalog.ts`; tamaño inicial 20/límite real por endpoint, sin total inventado ni recarga de todos los lotes; conservar navegación completa de capítulos donde se necesita.
- [ ] T053 [US3] Corregir truncado de 100 obras en `src/components/admin/WorksTab.tsx` y continuación de `src/components/catalog/CatalogView.tsx`; mantener páginas/orden/filtros y deduplicar, admitir última página vacía con retorno cuando no hay total y conservar resultados ante error adicional.
- [ ] T054 [US3] Completar rankings por período/tipo con total real en `src/pages/RankingsPage.tsx`, crear `src/pages/LatestChaptersPage.tsx` y ruta en `src/app/router.tsx`, con enlace desde `src/components/home/LatestChapters.tsx`; mantener las rutas existentes y distinguir muestras acotadas del listado exhaustivo.
- [ ] T055 [US3] Separar página, total real y pertenencia conocida de favoritos en `src/context/LibraryContext.tsx`, `src/hooks/useLibrary.ts` y `src/components/favorites/FavoritesView.tsx`; un mapa parcial no representa biblioteca completa ni ausencia en una página confirma no favorito, y mutaciones afectan solo a la cuenta actual.
- [ ] T056 [US3] Integrar favorito/valoración/progreso autoritativos y continuación de capítulos en `src/hooks/useReading.ts`, `src/components/detail/SeriesDetail.tsx` y `src/components/detail/RatingControl.tsx`; preservar página exacta local y distinguir valoración cero/ausente/unknown, con rango e incrementos reales del contrato. Regla explícita: valoración numérica de 0 a 5 inclusive, en incrementos de 0,5; cero es válido, ausencia indica retirada y unknown falta de consulta. Recontrastar en T003.
- [ ] T057 [US3] Completar historial incremental y rango de calendario en `src/components/profile/ProfileView.tsx` y `src/services/reading.ts`, con fechas/orden/rango máximo inclusivo del contrato; recuperar errores sin rehacer páginas anteriores ni perder resultados. Regla explícita: fechas YYYY-MM-DD, inicio no posterior al fin y máximo 366 días inclusivos en la zona de la cuenta. Validar límites exactos y recontrastar en T003.
- [ ] T058 [US3] Restringir eliminación de capítulos a ADMIN en botón y handler de `src/components/admin/ChaptersPanel.tsx` y añadir `src/components/admin/ChaptersPanel.test.tsx`, conservando «capítulo expectedVersion» y baja lógica; rechazo directo de EDITOR continúa pendiente DEP-006.
- [ ] T059 [US3] Aplicar allowed/denied/unknown a gestión editorial en `src/components/admin/WorksTab.tsx` y `src/components/admin/ChaptersPanel.tsx`, con datos inequívocos del puerto de asignaciones; mientras DEP-007 falte conservar unknown y explicación útil, sin inferir asignación por visibilidad/includeDrafts ni cambiar permisos ADMIN.
- [ ] T060 [US3] Completar confirmación y recuperación de conflictos en `src/components/admin/PagesManager.tsx` y `src/components/admin/ChapterForm.tsx`, preservando versión, número decimal string, posiciones y permutación exacta de páginas; respetar «100 páginas de archivo por solicitud y 1000 por capítulo», sin forzar precondición tras 409. Regla explícita: número de capítulo decimal no negativo, hasta nueve enteros y tres decimales, conservado como texto sin redondeo. Validar límites exactos y recontrastar en T003.
- [ ] T061 [US3] Completar estados/invalidación/casos negativos en `src/components/admin/TaxonomyTab.tsx` y `src/components/admin/ReportsTab.tsx`, usando servicios actuales y cursores, resolución escrita y errores de duplicado diferenciados; resolver reporte no borra comentario ni sanciona cuenta.
- [ ] T062 [US3] Auditar/completar consumidores restantes INT001–INT048 en `src/components/auth/AuthView.tsx`, `src/context/AuthContext.tsx`, `src/hooks/useReading.ts`, `src/components/home/ContinueReading.tsx` y servicios correspondientes; registrar cada corrección o consumidor suficiente en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md`, preservando registro BASIC, decimales y 204, sin activar propuestas históricas DEP-005.
- [ ] T063 [US3] Corregir regresiones de lector/eventos/cuenta en `src/components/reader/ReaderView.tsx`, `src/context/LibraryContext.tsx` y `src/components/detail/CommentItem.tsx`: cascada/paginado, anterior/siguiente, página local, claves userId/guest y UUID estable para reintento; marcado manual no suma apertura/racha ni resultado tardío modifica otra cuenta. Serializar con US1/T056.
- [ ] T064 [US3] Ejecutar T049–T051 y casos sensibles de publicación/permiso/conflicto con fixtures en `specs/001-deuda-tecnica-integracion/validation.md`, incluido capítulo de 101 páginas, >100 obras y 403 tras revocación simulada; no acreditar permiso real por ocultar acciones.
- [ ] T065 [US3] CONDICIONAL entorno real: recorrer INT001–INT048 disponibles mediante `specs/001-deuda-tecnica-integracion/quickstart.md` y completar evidencia positiva/negativa/recarga o no aplica justificado en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md`; PUT/PATCH equivalentes enlazan evidencia de la variante usada y las capacidades no activadas siguen pendientes.
- [ ] T066 [US3] CONDICIONAL DEP-006/servidor corregido: verificar rechazo directo de eliminación por EDITOR asignado/BASIC/visitante, éxito ADMIN y conflicto de versión; registrar INT018 y revisión del servidor en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`, sin modificar backend.

**Checkpoint**: Recorridos disponibles probados en su capa. T065 mantiene pendiente el tramo real de capacidades no activadas y T066 nunca se completa con solo pruebas de interfaz.

## Phase 6: User Story 4 — Tres imágenes por obra (Priority: P2)

**Goal**: Portada/banner de ficha/banner de capítulo independientes y obligatorios, conservando medios existentes.
**Independent Test**: Proveedor aislado con tres imágenes distinguibles, borrador incompleto rechazado y reemplazo individual; banner del lector fuera de páginas. Uso normal impide guardado hasta DEP-004, conservando lectura.
**Cobertura**: FR-018–021/028; SC-005 y regresiones de lectura.

### Tests

- [ ] T067 [P] [US4] Escribir pruebas de slots/DTO en `src/services/work-media.test.ts`: «`persisted: {id,url} | null`, `selected: File | null`, `previewUrl: string | null`, `error?: string`»; ausencia, selección inválida y fallback no persistido; «JPEG/PNG/WebP; hasta 10 MiB por archivo y 100 MiB por solicitud» y tres slots incluso DRAFT.
- [ ] T068 [P] [US4] Escribir pruebas en `src/components/admin/WorkForm.test.tsx` y `src/components/reader/ReaderView.test.tsx`: conservar sin resubir, reemplazo único confirmado, cancelar selección, tercero indisponible y banner sin página/progreso adicional; usar imágenes distinguibles y fixtures independientes.

### Preparación e integración

- [ ] T069 [US4] Añadir modelos en `src/types/work-media.ts` y extender Series en `src/types/index.ts` con detailBannerUrl/chapterBannerUrl y medios independientes: «DTO actual: `coverAsset` → cover; `incapBannerAsset` → chapterBanner. detailBanner queda null hasta contrato DEP-004»; fallback visual no prueba persistencia.
- [ ] T070 [US4] Implementar slots/validación/limpieza de object URLs en `src/services/work-media.ts` y adaptar `src/services/catalog.ts`, preservando nulabilidad y nombres remotos actuales; selección inválida bloquea aunque exista anterior y cancelarla vuelve al persistido, sin vaciar obligatorio ni duplicar incap en dos campos persistidos.
- [ ] T071 [US4] Extender `src/components/admin/WorkForm.tsx` y crear `src/components/admin/WorkImageField.tsx` con tres previews/etiquetas/errores y Hook Form/Zod actuales: «Los tres campos se requieren incluso para DRAFT»; conservar previas sin resubir y distinguir preview fallida de ausencia de referencia con fallback accesible.
- [ ] T072 [US4] Preparar entradas de tres medios y bloqueo del transporte en `src/services/admin.ts` y aviso en `src/components/admin/WorkForm.tsx`; sin DEP-004 no enviar guardado ni nombrar un campo multipart supuesto, conservar formulario/consulta/lectura y expectedUpdatedAt.
- [ ] T073 [US4] Separar portada/banner de ficha en `src/components/detail/SeriesDetail.tsx`, `src/components/home/HeroFeatured.tsx` y `src/services/discovery.ts`, manteniendo portada en tarjetas y fallback antiguo distinto de medio válido para edición; no añadir banner general de plataforma.
- [ ] T074 [US4] Mostrar chapterBannerUrl al inicio de `src/components/reader/ReaderView.tsx` en ambos modos, fuera de páginas/contador/progreso y sin nuevo evento de apertura, conservando navegación y contenido antiguo; serializar con T063.
- [ ] T075 [US4] Completar confirmación de reemplazo y recuperación ante error/409 en `src/components/admin/WorkForm.tsx` y `src/services/admin.ts`; identificar slots afectados, conservar otros medios y selecciones locales, sin sobrescritura silenciosa ni promesa de purga física.
- [ ] T076 [US4] Ejecutar T067/T068 y escenarios de historia 4 en `specs/001-deuda-tecnica-integracion/validation.md`, incluidos obra antigua incompleta, límites, preview fallida, cancelación, tercero indisponible y conteo/progreso; no acreditar tres medios reales con una simulación.
- [ ] T077 [US4] CONDICIONAL DEP-004: con multipart/DTO y reglas publicadas, adaptar/validar tercer medio en `src/services/admin.ts`, `src/services/catalog.ts` y `src/services/work-media.test.ts`; comprobar crear/editar/recargar destinos, reemplazo único/conflicto en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y actualizar `specs/001-deuda-tecnica-integracion/integration-dependencies.md`, sin desarrollar backend.

**Checkpoint**: T067–T076 acreditan preparación. T077 sigue sin marcar mientras no exista soporte y evidencia real del tercer medio.

## Phase 7: Polish & Cross-Cutting Concerns — evidencia y entrega

**Objetivo**: Validación transversal y documentación fiel, sin refactorización global ni ampliación comercial.

- [ ] T078 Ejecutar teclado/foco/errores asociados/responsive 360/1280 px siguiendo `specs/001-deuda-tecnica-integracion/quickstart.md`, corregir defectos en componentes afectados y registrar resultados/límites en `specs/001-deuda-tecnica-integracion/validation.md`, preservando tokens y reduced motion.
- [ ] T079 Revisar privacidad y aislamiento de componentes/servicios modificados y documentar en `specs/001-deuda-tecnica-integracion/validation.md`: sin logs de credenciales/correos/motivos privados/reporteros ni autoridad de roles/sanciones/asignaciones en localStorage; la auditoría pendiente del servidor no se sustituye con bitácora local.
- [ ] T080 Actualizar `README.md`, `specs/001-deuda-tecnica-integracion/quickstart.md` y `specs/001-deuda-tecnica-integracion/plan.md` con comportamiento implementado, dependencias exactas efectivas, novedades y checklist UX/datos de 52 ítems; retirar descripciones históricas de mocks sin cambiar producto ni aprobar casillas por cuenta del revisor.
- [ ] T081 Ejecutar `npm run build`, `npm run lint` y `npm run test:run` tras últimos cambios y registrar resultados/fallos previos en `specs/001-deuda-tecnica-integracion/validation.md`; resolver fallos introducidos por la feature, manteniendo explícitos los ajenos al alcance.
- [ ] T082 Consolidar cobertura FR-001–FR-030/SC-001–SC-010 e INT001–INT048 en `specs/001-deuda-tecnica-integracion/contracts/integration-matrix.md` y `specs/001-deuda-tecnica-integracion/validation.md`, distinguiendo preparación, verificado real, pendiente frontend y bloqueo externo con evidencia; cualquier hueco de implementación sigue como tarea pendiente.
- [ ] T083 CONDICIONAL cierre real: después de T042/T044/T046/T048/T065/T066/T077/T078–T082, registrar aceptación E2E final en `specs/001-deuda-tecnica-integracion/validation.md` y `specs/001-deuda-tecnica-integracion/integration-dependencies.md`; si faltan contratos/entorno, entregar preparación sin marcar esta tarea ni declarar integración completa.

## Dependencies & Execution Order

### Grafo de fases e historias

```text
T001 → T002 → T003 → T004 → {T005 || T006} → T007 → T008 → T009 → T010
                                                               ↓
                       ┌───────────────────────────────────────┤
                       ├─ US1 T011–T026 → integración UI de T038
                       ├─ US2 preparación T027–T040
                       │    ├─ DEP-001 → T041 → T042 (listado)
                       │    ├─ DEP-002 → T043 → T044 (roles)
                       │    ├─ DEP-003 → T045 → T046 (sanciones)
                       │    └─ DEP-007 → T047 → T048 (asignaciones)
                       ├─ US3 T049–T064 → entorno real → T065
                       │                 DEP-006 → T066
                       └─ US4 T067–T076 → DEP-004 → T077

Preparación de historias → T078–T082
Todas las verificaciones reales requeridas + T078–T082 → T083 (cierre E2E)
```

Cada pareja administrativa se puede ejecutar sin esperar las demás. Una prueba directa del adaptador puede usar identidad de prueba confirmada; un recorrido UI de selección necesita además su fuente de datos disponible, sin inventarla. La dependencia de consumidor se registra aparte de la activación del adaptador. El grafo no autoriza escrituras concurrentes; solo grupos [P] con archivos separados se paralelizan.

### Dependencias concretas y archivos compartidos

- Todas las historias requieren T010. US1 no necesita contratos administrativos. Formularios US2 se prueban solos; T038 requiere T019–T023. Si US2 empieza antes, posponer esa integración sin duplicar cambios en textareas antiguas.
- T014 precede imports de T016/T017; T015 precede T018 y esta T019. T020–T023 comparten comentarios y van en serie. T025 registra falta de entorno real sin afirmar que se probó.
- T029 añade AuthRevalidation.test.tsx; T039 implementa el comportamiento de sesión antes de confirmar formularios sensibles. T050, T062 y otros cambios de AuthContext posteriores deben conservar esa revalidación y no sobrescribirla.
- T052 precede T053–T057/T062; T055 → T056 → T063 comparte contexto/hook. T019–T023/T038/T063 comparten comentarios; T037 coordina AdminPage.
- T059 usa unknown mientras falte DEP-007: no necesita esperar T047 para implementar la restricción conservadora, pero habilitar capacidad real de EDITOR sí requiere el dato confirmado de T047.
- Serializar T052 con T069/T070 por catalog.ts; T056 con T073 por SeriesDetail; T063 con T074 por ReaderView; cambios T060/T062 con T072/T075 por servicios/admin. Releer cambios anteriores antes de editar.
- T041/T043/T045/T047 comparten `src/services/user-admin.ts`: adaptar en serie por contrato disponible, sin que eso haga obligatoria la publicación de las otras capacidades. Sus verificaciones independientes son T042/T044/T046/T048, respectivamente.
- T065 verifica operaciones existentes disponibles y deja pendientes tramos bloqueados. T066 requiere servidor corregido, T077 tercer medio contractual y las verificaciones reales necesitan entorno; escribir el bloqueo no las completa.
- T078–T082 pueden validar la preparación aunque haya activaciones pendientes. T083 necesita T042/T044/T046/T048/T065/T066/T077 y T078–T082; no se satisface registrando bloqueos.

### Dependencias externas

| Dependencia | Adaptación / evidencia independiente | Preparación independiente |
| --- | --- | --- |
| DEP-001: listado | T041 / T042 | T027–T040 |
| DEP-002: roles | T043 / T044 | T027–T040 |
| DEP-003: sanción y estado propio | T045 / T046 | T030–T040 y US1 con unknown explícito |
| DEP-004: tercer medio | T077 | T067–T076 con guardado no disponible |
| DEP-005: propuestas históricas | Sin activación automática | T003/T062 registran discrepancias sin ampliar alcance |
| DEP-006: eliminación exclusiva ADMIN en servidor | T066 | T058 y pruebas de interfaz |
| DEP-007: asignaciones/capacidad | T047 / T048 | T032–T040/T059 con unknown |
| Entorno de prueba real | T042/T044/T046/T048/T065/T066/T077/T083 | Tests aislados y consumidores disponibles |

No desarrollar endpoints, migrar bases o editar políticas del servidor desde estas tareas. Cada capacidad ausente permanece no disponible por operación, sin datos demo ni éxito falso.

## Parallel Execution Examples

Ejemplos para ejecución posterior, con prerrequisitos y propiedad de archivos definidos; no se lanzan agentes por generar este documento.

| Grupo | Después de | Tareas simultáneas | Archivos separados |
| --- | --- | --- | --- |
| Bases | T004 | T005 y T006 | Tests modal y Field |
| US1 | T010 | T011, T012 y T013 | Gramática, editor/renderer y carga/hilo |
| US2 | T010 | T027, T028 y T029 | Política, fechas y gateway/tabla/revalidación |
| US3 | T010 | T049, T050 y T051 | Servicios, auth y catálogo/biblioteca |
| US4 | T010 | T067 y T068 | Medios/adaptación y formulario/lector |

Fixtures locales independientes; no escribir archivos compartidos simultáneamente. Los adaptadores que comparten user-admin.ts se editan en serie aun cuando los contratos lleguen independientemente.

## Implementation Strategy

### MVP primero

Fases 1 y 2 → US1 T011–T026: comentarios solo de texto con formato/spoilers, sin subida ni carga de imágenes; preview/publicación preservan la sintaxis no soportada como literal seguro. No prometer administración, sanciones reales ni tres medios por completar el editor.

### Entrega incremental

1. Preparar US2 y revalidación de identidad con proveedor aislado, indisponibilidad normal y cierre de formularios definido.
2. Activar/verificar cada pareja de listado, roles, sanciones o asignaciones al existir su contrato, sin esperar las demás; documentar dependencias de consumidor aparte.
3. Completar US3 con límites explícitos de valoración/calendario/capítulo y evidencia real de lo disponible.
4. Añadir US4 con sus tres imágenes de obra, sin trasladar ese flujo al editor de comentarios; mantener guardado bloqueado hasta soporte contractual.
5. Validar preparación mediante T078–T082 y completar T083 solo cuando pasen todas las verificaciones reales requeridas.

### Trazabilidad

| Requisitos / criterios | Tareas principales |
| --- | --- |
| FR-001–005/029; SC-001 | T011–T026 |
| FR-006/007/011/012 | T027–T034/T037–T044/T050 |
| FR-008–010; SC-002 | T028/T030/T031/T035/T038–T040/T045/T046 |
| FR-025; SC-009 | T027/T030/T032/T036/T039/T047/T048/T059 |
| FR-013/014/017; SC-003/004 | T003/T049/T052–T057/T061/T062/T065/T082 |
| FR-015/016 | T009/T013/T020/T021/T029/T039/T050/T060/T075 |
| FR-018–021; SC-005 | T067–T077 |
| FR-022/030; SC-006 | T005–T008/T012/T017/T023/T034–T037/T071/T078 |
| FR-023; SC-007 | T010/T025/T026/T040/T064–T066/T076/T077/T082/T083 |
| FR-024; SC-008 | T058/T066 |
| FR-026; SC-010 | T051/T055/T056/T063/T074/T078/T079 |
| FR-027/028 | T007/T034–T048/T060/T071/T075/T079 |

### Recuento y correspondencia de identificadores

83 tareas: Setup 3, Foundational 7, US1 16, US2 22, US3 18, US4 11 y cierre 6. Hay 13 tareas [P] y 12 CONDICIONAL: T041–T048, T065–T066, T077 y T083. Todas permanecen sin marcar.

Renumeración de la versión anterior: T001–T040 se conservan; antigua T041 se divide en adaptación de listado T041 y roles T043; antiguas T042/T043 pasan a T045/T047; antigua T044 se separa en verificaciones T042/T044/T046/T048. Antiguas T045–T079 pasan a T049–T083 (+4). El resto de este documento usa los identificadores vigentes.

Marcar una casilla requiere resultado y evidencia descritos. Registrar bloqueo no completa activación; los marcadores de calidad UX/datos no se sincronizan con tasks.md ni se aprueban por esta actualización.
