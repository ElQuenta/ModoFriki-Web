# Matriz de integración por operación

Fecha: 2026-10-29. Fuente: routers registrados por `../ModoFriki-Backend/src/app.ts`, sus servicios y validaciones; consumidores inspeccionados en `src/services`, componentes, páginas y hooks del frontend. Esta matriz expresa trabajo de planificación: ninguna fila acredita ejecución contra un servidor ni E2E aprobado. Las rutas de producto incluyen su prefijo `/api` real.

«Existente; por verificar» significa que se encontró un consumidor, pero falta probar sus resultados, errores y persistencia. «Hueco» identifica trabajo de frontend y no una dependencia externa que permita darlo por terminado. Los consumidores propuestos son nombres de diseño, no archivos ya implementados. Las variantes PUT y PATCH equivalentes comparten recorrido; se identifica la variante que usa actualmente el cliente y no se inventan botones duplicados.

## Operaciones registradas de producto

| ID | Método y ruta | Servicio frontend | Consumidor existente o propuesto | Permiso | Paginación / precondición | Estado de planificación |
| --- | --- | --- | --- | --- | --- | --- |
| INT001 | POST `/api/auth/register` | `auth.register` | `AuthView` / `RegisterPage` | Público | Esquema de registro y zona horaria | Existente; por verificar |
| INT002 | POST `/api/auth/login` | `auth.login` | `AuthView` / `LoginPage` | Público | Credenciales válidas | Existente; por verificar |
| INT003 | GET `/api/auth/me` | `auth.getMe` | Recuperación y revalidación de sesión al foco/confirmación sensible/403 | Sesión propia | Token vigente; 401 invalida sesión centralmente | Existente; por verificar |
| INT004 | GET `/api/chapters/latest` | `discovery.listLatestChapters` | `LatestChapters`; propuesto `LatestChaptersPage` | Público | `page`, `limit`, `typeId`; respuesta con total | Hueco: continuación desde muestra inicial de 8 |
| INT005 | GET `/api/works/popular` | `discovery.listPopularWorks` | `RankingsPage`, `RankingSection`, `PopularSection`, `HeroFeatured`, `CatalogView`, `CommandPalette` | Público | `page`, `limit` hasta 50, período y tipo; respuesta con total | Hueco: rankings fija primera página de 50; muestras de inicio son acotadas |
| INT006 | GET `/api/works/recommended` | `discovery.listRecommendedWorks` | `PopularSection` / recomendaciones | Público con identidad opcional | `limit`; colección acotada y `basis`, sin continuación | Existente; por verificar criterio visible |
| INT007 | GET `/api/works` | `catalog.listWorks` | `CatalogView`, `WorksTab`; propuesto selector de obras en asignaciones | Público; borradores según autorización | `page`, `limit` hasta 100, búsqueda, tipo, género, `includeDrafts`; array sin total | Hueco: `WorksTab` trunca a 100; mejorar acumulación estable de catálogo |
| INT008 | POST `/api/works` | `admin.createWork` | `WorksTab` / `WorkForm` | ADMIN | Multipart actual de dos imágenes; esquema editorial | Bloqueado para nuevo guardado de tres imágenes por DEP-004; preparar formulario sin envío parcial |
| INT009 | GET `/api/works/:workId` | `catalog.getWork` | `DetailPage`, `useWork`, `ReaderPage`, edición de obra | Público; ocultos según autorización | Identificador y visibilidad; 404 no revela contenido oculto | Existente; por verificar; adaptar imágenes tras DEP-004 |
| INT010 | PUT `/api/works/:workId` | `admin.updateWork` usa PATCH equivalente | `WorkForm` comparte recorrido con INT011 | ADMIN o EDITOR asignado | `expectedUpdatedAt`; multipart; alias equivalente de PATCH | DEP-004 para tres imágenes; equivalencia contractual documentada, variante no usada |
| INT011 | PATCH `/api/works/:workId` | `admin.updateWork` | `WorksTab` / `WorkForm` | ADMIN o EDITOR asignado | `expectedUpdatedAt`; conserva imágenes no reemplazadas | Bloqueado para guardado de tres imágenes por DEP-004; recuperar conflicto sin perder borrador |
| INT012 | DELETE `/api/works/:workId` | `admin.deleteWork` | `WorksTab` / `ConfirmDialog` | ADMIN o EDITOR asignado | `expectedUpdatedAt`; baja lógica | Existente; por verificar confirmación y conflicto |
| INT013 | GET `/api/works/:workId/chapters` | `catalog.listChapters` | `useChapters`, `SeriesDetail`, `ReaderPage`, `ChaptersPanel` | Público; borradores según autorización | `page`, `limit` hasta 100; cliente recorre páginas hasta respuesta corta | Existente sin truncado; por verificar volumen y recuperación |
| INT014 | POST `/api/works/:workId/chapters` | `admin.createChapter` | `ChaptersPanel` / `ChapterForm` | ADMIN o EDITOR asignado | Multipart; número decimal no negativo de hasta nueve enteros/tres decimales como string; páginas y condiciones de publicación | Existente; por verificar |
| INT015 | GET `/api/works/:workId/chapters/:chapterId` | `catalog.getChapter` | `ReaderPage`, `useChapter`, precarga en `ReaderView` | Público; borradores según autorización | Visibilidad de obra y capítulo | Existente; por verificar |
| INT016 | PUT `/api/works/:workId/chapters/:chapterId` | `admin.updateChapter` usa PATCH equivalente | `ChapterForm` comparte recorrido con INT017 | ADMIN o EDITOR asignado | `expectedVersion`; alias equivalente de PATCH | Existente por variante PATCH; por verificar equivalencia |
| INT017 | PATCH `/api/works/:workId/chapters/:chapterId` | `admin.updateChapter` | `ChaptersPanel` / `ChapterForm` | ADMIN o EDITOR asignado | `expectedVersion`; número decimal no negativo de hasta nueve enteros/tres decimales como string | Existente; por verificar recuperación de 409 |
| INT018 | DELETE `/api/works/:workId/chapters/:chapterId` | `admin.deleteChapter` | `ChaptersPanel` / `ConfirmDialog` | Objetivo: solo ADMIN; backend actual admite EDITOR asignado | `expectedVersion`; baja lógica | Hueco frontend: restringir acción y handler; autorización real bloqueada por DEP-006 |
| INT019 | PUT `/api/works/:workId/chapters/:chapterId/pages` | `admin.replacePages` | `PagesManager` | ADMIN o EDITOR asignado | Multipart `pages`, `expectedVersion`; límites de imágenes | Hueco: confirmación informada de reemplazo y recuperación de conflicto; por verificar |
| INT020 | POST `/api/works/:workId/chapters/:chapterId/pages` | `admin.insertPages` | `PagesManager` | ADMIN o EDITOR asignado | Multipart `pages`, `position`, `expectedVersion` | Existente; por verificar posición y conflicto |
| INT021 | PATCH `/api/works/:workId/chapters/:chapterId/pages` | `admin.reorderPages` | `PagesManager` | ADMIN o EDITOR asignado | JSON `pageIds`, `expectedVersion`; no multipart | Existente; por verificar orden persistido y conflicto |
| INT022 | GET `/api/work-types` | `catalog.listWorkTypes` | `useWorkTypes`, `CatalogView`, `WorkForm`, `TaxonomyTab` | Público | Colección acotada, sin continuación | Existente; por verificar invalidación tras creación |
| INT023 | POST `/api/work-types` | `admin.createWorkType` | `TaxonomyTab` | ADMIN | Nombre y slug válidos | Existente; por verificar duplicado y actualización de filtros |
| INT024 | GET `/api/genres` | `catalog.listGenres` | `useGenres`, `GenresPage`, `CatalogView`, `WorkForm`, `TaxonomyTab` | Público | Colección acotada, sin continuación | Existente; por verificar |
| INT025 | POST `/api/genres` | `admin.createGenre` | `TaxonomyTab` | ADMIN | Nombre y slug válidos | Existente; por verificar duplicado e invalidación |
| INT026 | GET `/api/comments` | `community.listComments`, `community.listReplies` | `CommentSection`, `CommentItem` en ficha y lector | Público con identidad opcional | Destino o padre; `cursorCreatedAt`, `cursorId`, `limit`; `hasMore/nextCursor` | Hueco: deduplicación, aislamiento de contexto y errores de continuación |
| INT027 | POST `/api/comments` | `community.createComment` | `CommentSection`, respuesta en `CommentItem`; propuesto `CommentEditor` compartido | Cuenta activa; backend rechaza sanción vigente en creación (runtime por verificar) | Fuente no vacía hasta 10 000; destino publicado o padre válido | Hueco: editor y preview; enforcement de creación existe en código, recorrido real pendiente |
| INT028 | PATCH `/api/comments/:id` | `community.editComment` | Edición en `CommentItem`; propuesto `CommentEditor` | Autor activo; aplicación de sanción a edición por confirmar | `expectedRevision`; fuente hasta 10 000 | Hueco: recuperación de versión vigente preservando borrador; restricción de edición sancionada pendiente de confirmar |
| INT029 | DELETE `/api/comments/:id` | `community.deleteComment` | `CommentItem` / `ConfirmDialog` | Autor o ADMIN | Baja lógica; conservar descendientes | Existente; por verificar indicador eliminado sin restaurar texto |
| INT030 | PUT `/api/comments/:id/vote` | `community.voteComment` | `CommentItem` | Cuenta activa | `value` 1 o -1; voto local recordado por usuario no acredita voto remoto propio | Existente; por verificar concurrencia y revisión |
| INT031 | DELETE `/api/comments/:id/vote` | `community.removeVote` | `CommentItem` | Cuenta activa | Voto del actor | Existente; por verificar restauración ante error |
| INT032 | POST `/api/comments/:id/reports` | `community.reportComment` | `ReportDialog` | Cuenta activa | Motivo válido; detalles opcionales hasta 2 000 | Existente; por verificar permisos y errores |
| INT033 | GET `/api/comment-reports` | `community.listReports` | `ReportsTab` | ADMIN | Estado opcional; cursor compuesto; `hasMore/nextCursor` | Existente; por verificar continuación y privacidad |
| INT034 | PATCH `/api/comment-reports/:id` | `community.resolveReport` | `ReportsTab` | ADMIN | RESOLVED o DISMISSED; resolución obligatoria hasta 2 000 | Existente; por verificar; resolver reporte no sanciona usuario |
| INT035 | POST `/api/works/:workId/visits` | `reading.recordVisit` | `useWorkStats` en `useReading.ts`, al abrir ficha `SeriesDetail` | Público con identidad opcional | `idempotencyKey` estable para reintentos de la misma apertura | Existente; por verificar que reintento no duplica evento |
| INT036 | GET `/api/works/:workId/stats` | `reading.getWorkStats` | `useWorkStats` en `useReading.ts` / `SeriesDetail` | Público | Obra accesible | Existente; por verificar conteos y valoración |
| INT037 | PUT `/api/works/:workId/rating` | `reading.setRating` | `useReading` / `RatingControl` | Sesión propia | Score 0–5 inclusive en pasos de 0,5; 0 válido, ausencia y unknown distintos | Existente; por verificar persistencia |
| INT038 | DELETE `/api/works/:workId/rating` | `reading.removeRating` | `useReading` / `RatingControl` | Sesión propia | Valoración propia | Existente; por verificar retirada |
| INT039 | POST `/api/chapters/:chapterId/read-events` | `reading.recordReadEvent` | Apertura de capítulo en `ReaderView` | Público con identidad opcional | `idempotencyKey` estable para misma apertura; deduplicación del servicio | Existente; por verificar y distinguir de marcado manual |
| INT040 | PUT `/api/me/read-chapters/:chapterId` | `reading.markChapterRead` | `useReading` / controles de capítulos en ficha | Sesión propia | Marcado manual; no registrar apertura ni sumar racha | Existente; por verificar regresión |
| INT041 | DELETE `/api/me/read-chapters/:chapterId` | `reading.unmarkChapterRead` | `useReading` / controles de capítulos en ficha | Sesión propia | Estado personal del capítulo | Existente; por verificar |
| INT042 | GET `/api/me/favorites` | `reading.listAllFavorites` | `useLibrary` / `FavoritesView` | Sesión propia | `page`, `limit` hasta 100, total; cliente recorre páginas | Existente; por verificar y valorar carga incremental sin mezclar cuentas |
| INT043 | PUT `/api/me/favorites/:workId` | `reading.addFavorite` | `useLibrary` / ficha y tarjetas | Sesión propia | Obra accesible | Existente; por verificar |
| INT044 | DELETE `/api/me/favorites/:workId` | `reading.removeFavorite` | `useLibrary` / ficha, tarjetas y favoritos | Sesión propia | Favorito del actor | Existente; por verificar |
| INT045 | GET `/api/me/reading-history` | `reading.listReadingHistory` | `ContinueReading`, `ProfileView` | Sesión propia | `page`, `limit`, total; perfil acumula páginas | Existente; por verificar continuación, errores y cambio de cuenta |
| INT046 | GET `/api/me/reading-stats` | `reading.getReadingStats` | `ProfileView` | Sesión propia | Zona y actividad del actor | Existente; por verificar |
| INT047 | GET `/api/me/reading-calendar` | `reading.getReadingCalendar` | `ProfileView`; propuesto selector de rango en calendario | Sesión propia | `from/to` YYYY-MM-DD, inicio ≤ fin, máximo 366 días inclusivos; zona autoritativa | Hueco: controles de rango; consulta predeterminada ya existente |
| INT048 | GET `/api/me/works/:workId/progress` | `reading.getWorkProgress` | `useReading`, ficha y biblioteca | Sesión propia | Páginas de capítulos con total; cliente consume todas; no representa página exacta local | Existente; por verificar aislamiento de identidad y continuación |

## Infraestructura y documentación

| ID | Método y ruta | Servicio frontend / consumidor | Permiso y precondición | Estado |
| --- | --- | --- | --- | --- |
| INT049 | GET `/` | Sin cliente de producto; comprobación de infraestructura | Público | Por verificar en entorno; no exige pantalla |
| INT050 | GET `/health` | Sin cliente de producto; comprobación de salud | Público | Por verificar en entorno; no exige pantalla |
| INT051 | Middleware montado en `/api/docs` | Swagger UI; sin cliente de producto | Público | Documentación, no operación de producto; `app.use` no enumera un verbo contractual de negocio |

Los recursos internos que sirve el middleware Swagger no se convierten en operaciones de producto. INT051 registra el montaje explícito sin atribuirle un endpoint REST de negocio inventado. El inventario contiene 48 operaciones de producto, dos rutas GET de infraestructura y un montaje documental.

## Capacidades pendientes: sin URLs ni payloads remotos inventados

| Dependencia | Preparación frontend | Falta externa y condición de desbloqueo | Evidencia requerida |
| --- | --- | --- | --- |
| DEP-001 | `UsersTab` y tabla paginada propuesta; identidad, rol y sanción conocida/desconocida | Contrato de listado ADMIN con orden y continuación publicados y disponibles | Páginas, vacío/error, rechazo BASIC/EDITOR y privacidad |
| DEP-002 | Modal de cambio exclusivamente BASIC ↔ EDITOR para otras cuentas | Contrato de cambio de roles con concurrencia y trazabilidad; rechaza cuenta propia, destinatario ADMIN y promoción a ADMIN | Resultado confirmado, persistencia, rechazos directos, permisos actualizados |
| DEP-003 | Modal temporal/permanente, motivo, retirada/extensión; aviso al afectado | Operaciones de sanción y estado autoritativo; rechaza gestión de ADMIN, comprueba rol vigente y aplica restricción crear/responder/editar | Vencimiento, extensión futura, retirada, permanencia, privacidad del motivo y bloqueos reales; login/lectura/votos/reportes/eliminación propia conservados |
| DEP-004 | Tres campos y vistas independientes, conservación de persistidas y confirmación de reemplazo | Tercer campo, multipart/DTO definitivos y obligatoriedad de tres imágenes incluso en borrador; `cover`/`inpagecover` actuales no bastan | Crear/editar/recargar los tres destinos, reemplazo individual, faltantes, límites y conflicto |
| DEP-005 | Registro de propuestas documentales históricas sin exponer controles falsamente operativos | Perfil/avatar, consulta pública de usuario, etiquetas y mutaciones históricas no registradas requieren decisión de alcance y contrato | Incorporación explícita antes de añadir operación al inventario; no son fallos de frontend existente |
| DEP-006 | Acción y handler de eliminación de capítulo solo ADMIN | Corregir autorización actual del backend que permite EDITOR asignado; conservar versión y baja lógica | Rechazo directo EDITOR/BASIC/visitante; éxito ADMIN y conflicto por versión |
| DEP-007 | Consulta/asignación/revocación de obras para EDITOR, selector paginado y confirmación | Contratos ADMIN, rol vigente, duplicados/concurrencia, trazabilidad y pérdida real de acceso tras revocar o cambiar rol | Persistencia, rechazo directo, editor sin obras, duplicado, revocación y cambio de rol |

El listado visible no prueba asignación editorial: `work.repository.ts` permite al EDITOR consultar obras publicadas además de las asignadas. `includeDrafts=true` tampoco certifica que cada fila sea gestionable; no se deduce permiso de la presencia en pantalla ni se inventa un filtro de asignación. La autorización del servidor se vuelve a evaluar en cada mutación. Para ofrecer un listado exclusivamente asignado o indicadores verificables se necesita el dato contractual correspondiente de DEP-007.

La implementación normal de capacidades pendientes devuelve indisponibilidad por capacidad, no una lista vacía ni éxito local. Un proveedor de prueba aislado puede ejercitar su interfaz sin registrar contratos remotos ficticios. Al desbloquear una dependencia se incorpora el adaptador del contrato publicado y se actualizan filas y evidencias. La ausencia de servidor o credenciales afecta la validación real de operaciones existentes; no transforma huecos de frontend en dependencias resueltas.

### Preparación local de US2 — 2026-10-30

Las siguientes comprobaciones usan fixtures y no acreditan respuestas del backend, autorización real, auditoría ni persistencia:

| Dependencia | Evidencia simulada | Estado de integración |
| --- | --- | --- |
| DEP-001 | `UsersTab.test.tsx`, `user-admin.test.ts`: listado paginado, estado `unknown`, privacidad y capacidad ausente | Preparación frontend; falta contrato/listado real |
| DEP-002 | `admin-policy.test.ts`, `UsersTab.test.tsx`: política BASIC/EDITOR, rol propio/ADMIN protegido y rechazo local ante destinatario cuyo rol actualizado es ADMIN | Preparación frontend; falta contrato/permisos/persistencia |
| DEP-003 | `admin-validation.test.ts`, `zoned-date.test.ts`, `AuthRevalidation.test.tsx`: validación de fecha/motivo, zonas y sesión; hook de restricción preparado, integración de consumidor pendiente de T019–T023 de US1 | Preparación parcial; falta contrato y comprobación de servidor |
| DEP-007 | `admin-policy.test.ts`, `AssignmentsPanel.test.tsx`: solo EDITOR como destinatario, lectura actualizada antes de mutar, duplicado vigente no crea otra relación | Preparación frontend; falta contrato/permisos/persistencia |

La evidencia detallada está en [`validation.md`](../validation.md). DEP-001/002/007 tienen contrato y adaptación frontend, pero faltan recorridos reales; DEP-003 tiene contrato parcial sin adaptación/comprobación real completa.

## Evidencia futura por operación

Se crea una entrada por ID y variante utilizada al ejecutar las verificaciones; pueden añadirse varias entradas por rol/escenario. Las filas de alias señalan la evidencia compartida y justifican equivalencia, sin afirmar que se ejecutó una variante que no se llamó. No registrar tokens, contraseñas, correos privados ni identidad innecesaria de reporteros.

| ID / escenario | Entorno y versión frontend/backend | Identidad de prueba / rol sin credenciales | Fecha | Resultado positivo / evidencia | Resultado negativo / evidencia | Persistencia tras recarga | Clasificación |
| --- | --- | --- | --- | --- | --- | --- | --- |
| INT026–INT032 / US1 — pruebas frontend | Vitest local; frontend de esta rama; servicios simulados | BASIC simulado | Render/disclosure Markdown; crear, responder, editar, votar, reportar, tombstone, cursores, deduplicación, error, conflicto y restricción conocida por sanción | 30 pruebas en 6 archivos pasan; no se prueba persistencia con mocks | No aplica a mocks; persistencia del backend no verificada | Proveedor de prueba |
| INT026–INT032 / US1 — recorrido real | Entorno/backend no conectado en esta revisión | Pendiente | Pendiente | Pendiente | Pendiente | Por verificar en entorno real |

Para listados y consultas, persistencia se comprueba sobre un cambio relacionado cuando corresponda o se justifica «no aplica»; no se inventa una mutación. Las capacidades nuevas con proveedor de prueba no acreditan persistencia ni autorización real. Cada hueco frontend permanece pendiente hasta implementar y comprobar el recorrido; ningún E2E está aprobado por la existencia de esta matriz.

### Adaptación de contratos administrativos US2 — 2026-10-30

Backend de referencia: rama `dev`, revisión `c6a9f18a631db992e584d5a2d04fbf49745fef5c`. Esta evidencia acredita inspección de contratos/código y pruebas unitarias del cliente, no recorridos de servidor.

| Capacidad | Contrato consumido | Evidencia frontend | Verificación real |
| --- | --- | --- | --- |
| DEP-001 listado/detalle | GET `/api/admin/users`, GET `/api/admin/users/:userId`; cursor `{createdAt,id}`; búsqueda local en páginas cargadas | `user-admin.test.ts`: mapeo de DTO, continuación y sanción `unknown` | T042 pendiente |
| DEP-002 roles | GET detalle + PATCH `/api/admin/users/:userId/role` con `expectedUpdatedAt` | `user-admin.test.ts`, `UsersTab.test.tsx`: token CAS y políticas BASIC/EDITOR | T044 pendiente |
| DEP-007 asignaciones | GET cursor, PUT con `expectedVersion`, PATCH revocación; obras desde GET `/api/works` para personal | `user-admin.test.ts`, `AssignmentsPanel.test.tsx`: cursor, CAS, duplicado e historial | T048 pendiente |
| DEP-003 sanciones | GET/POST `/api/admin/users/:userId/comment-sanctions`, PUT `.../:sanctionId/revocation`; GET propio `/api/auth/me/comment-restriction`. Sin operación de extensión | Backend rechaza creación sancionada en código; frontend/gateway no adaptados a este contrato en esta rama | T045 pendiente de adaptar/validar el contrato parcial; T046 requiere extensión ausente y entorno real |

### Auditoría de consumidores US3 — 2026-10-30

La revisión cubrió INT001–INT048 contra los servicios y consumidores de esta rama. Los tests son unitarios con HTTP/identidades simulados; el estado “preparación frontend” no acredita permisos ni persistencia del servidor.

| Grupo de operaciones | Consumidores y cambios comprobados | Resultado / límite |
| --- | --- | --- |
| INT001–INT003 | `AuthView`, `AuthContext`, `ProtectedRoute`; registro BASIC preservado; 401 central, revalidación por foco/403 y descarte de respuestas tardías de otra identidad | Tests de sesión y roles pasan; recorrido real pendiente T065 |
| INT004–INT007 | `LatestChaptersPage`, `RankingsPage`, `CatalogView`, `WorksTab`; páginas acotadas, filtros, orden estable, total solo cuando el contrato lo entrega, deduplicación y reintento | Tests con 121 obras y continuación administrativa; INT007 retorna array sin total |
| INT008–INT025 | `WorksTab`, `ChaptersPanel`, `ChapterForm`, `PagesManager`, `TaxonomyTab`; expectedUpdatedAt/expectedVersion, decimales como texto, confirmación de reemplazo y recuperación 409 | Eliminación solo se habilita a ADMIN en UI; rechazo directo EDITOR sigue pendiente DEP-006/T066. Asignación editorial continúa `unknown` hasta DEP-007 |
| INT026–INT034 | `CommentSection`, `CommentItem`, `ReportsTab`; cursores, deduplicación, aislamiento por identidad/destino, borrador ante conflicto, resolución escrita | Los componentes mantienen lectura y operaciones existentes; transporte/privacidad real pendiente T065 |
| INT035–INT041 | `useWorkStats`, `ReaderView`, `useReading`; clave de evento estable por apertura, marcado manual separado, rango de valoración 0–5 por pasos de 0,5 | La paginación/cascada y la navegación anterior/siguiente permanecen en `ReaderView`; sin verificación real del servicio |
| INT042–INT048 | `LibraryContext`, `FavoritesView`, `ProfileView`, `SeriesDetail`, `ContinueReading`; total autoritativo, favoritos parciales `unknown`, continuación de historial/progreso, calendario validado y página exacta local con clave userId/guest | Fixtures cubren 41 favoritos/historial y 101 registros de progreso; persistencia y zona autoritativa requieren T065 |

Las variantes PUT/PATCH se mantienen como equivalentes contractuales registrados arriba: las pruebas de adaptador no afirman haber ejecutado ambas variantes. DEP-005 no se activa. INT018 queda pendiente de verificación directa hasta que DEP-006 corrija la autorización del servidor.
