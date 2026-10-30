# Registro de integración y dependencias

**Fecha**: 2026-10-29
**Feature**: [spec.md](spec.md)

## Evidencia y límites

Backend inspeccionado: `../ModoFriki-Backend`, rama `dev`, revisión `37ad3f36538cb09731356af5bc9c47dbcac84afe`, árbol limpio al consultar. Se leyeron `AGENTS.md`, `docs/API.md`, `src/app.ts` y los cinco módulos de rutas registrados. `openapi.yaml` está presente; la planificación debe contrastar sus esquemas con los controladores, validaciones y servicios antes de fijar contratos de consumo. No se consultó un servidor en ejecución ni se verificó disponibilidad remota.

Frontend inspeccionado: servicios de auth, catálogo, administración, comunidad, descubrimiento y lectura; tipos, comentarios, formulario de obra y panel. Hay integración existente; no se presupone que haya que rehacerla. El README contiene descripciones históricas de mocks que no coinciden con el código.

Los estados siguientes indican existencia en código, no pruebas E2E aprobadas. Durante planificación se desglosará cada combinación método/ruta en una fila de seguimiento con consumidor concreto, permiso, estado y evidencia; implementar deberá completarla. PUT y PATCH equivalentes pueden compartir recorrido y prueba de la variante usada, dejando la equivalencia documentada.

## Inventario inicial de operaciones existentes

Todas las rutas de esta tabla llevan prefijo `/api`. Las operaciones indicadas existen en rutas registradas y tienen servicios frontend de dominio; falta auditar y completar sus recorridos y verificar el servidor real.

| Dominio | Método y ruta | Recorrido que debe consumirlo | Permiso esperado |
| --- | --- | --- | --- |
| Identidad | POST `/auth/register`, POST `/auth/login`, GET `/auth/me` | Registro, acceso y recuperación de sesión | Público para acceso; sesión propia para identidad |
| Descubrimiento | GET `/chapters/latest` | Inicio y novedades paginadas | Público |
| Descubrimiento | GET `/works/popular` | Rankings por período e inicio | Público |
| Descubrimiento | GET `/works/recommended` | Recomendaciones con su criterio visible | Público con identidad opcional |
| Catálogo | GET `/works`, GET `/works/:workId` | Catálogo paginado, ficha y selección administrativa | Público; borradores según autorización |
| Catálogo | GET `/works/:workId/chapters`, GET `/works/:workId/chapters/:chapterId` | Lista de capítulos, lector y edición | Público; borradores según autorización |
| Taxonomía | GET `/work-types`, GET `/genres` | Filtros, géneros y formularios | Público |
| Publicación | POST `/works` | Crear obra | ADMIN |
| Publicación | PUT/PATCH `/works/:workId`, DELETE `/works/:workId` | Editar y retirar obra | ADMIN o EDITOR asignado |
| Publicación | POST `/works/:workId/chapters` | Crear capítulo | ADMIN o EDITOR asignado |
| Publicación | PUT/PATCH `/works/:workId/chapters/:chapterId` | Editar capítulo | ADMIN o EDITOR asignado |
| Publicación | DELETE `/works/:workId/chapters/:chapterId` | Retirar capítulo | Política objetivo: solo ADMIN. Backend actual también admite EDITOR asignado; corrección pendiente DEP-006 |
| Publicación | PUT, POST, PATCH `/works/:workId/chapters/:chapterId/pages` | Reemplazar, insertar y reordenar páginas | ADMIN o EDITOR asignado |
| Taxonomía | POST `/work-types`, POST `/genres` | Crear tipo y género desde el panel | ADMIN |
| Comunidad | GET `/comments` | Comentarios de obra/capítulo y respuestas, por cursores | Público con identidad opcional |
| Comunidad | POST `/comments` | Publicar comentario o respuesta | Cuenta activa; sanción futura según DEP-003 |
| Comunidad | PATCH `/comments/:id` | Editar comentario propio | Autor; sanción futura según DEP-003 |
| Comunidad | DELETE `/comments/:id` | Eliminar comentario conservando descendientes | Autor o ADMIN |
| Comunidad | PUT, DELETE `/comments/:id/vote` | Emitir, cambiar y retirar voto | Cuenta activa |
| Comunidad | POST `/comments/:id/reports` | Reportar comentario | Cuenta activa |
| Moderación | GET `/comment-reports`, PATCH `/comment-reports/:id` | Consultar y resolver/descartar reportes | ADMIN |
| Actividad | POST `/works/:workId/visits`, GET `/works/:workId/stats` | Apertura de ficha y estadísticas de obra | Público con identidad opcional al registrar |
| Actividad | POST `/chapters/:chapterId/read-events` | Apertura de capítulo sin duplicar reintentos | Público con identidad opcional |
| Biblioteca | PUT, DELETE `/me/read-chapters/:chapterId` | Marcar y desmarcar leído | Sesión propia |
| Biblioteca | GET `/me/favorites`, PUT y DELETE `/me/favorites/:workId` | Biblioteca paginada y alternar favorito | Sesión propia |
| Valoración | PUT, DELETE `/works/:workId/rating` | Valorar y retirar valoración | Sesión propia |
| Actividad | GET `/me/reading-history` | Historial paginado con enlaces para continuar | Sesión propia |
| Actividad | GET `/me/reading-stats` | Resumen de lectura y rachas | Sesión propia |
| Actividad | GET `/me/reading-calendar` | Calendario con rango de fechas válido | Sesión propia |
| Progreso | GET `/me/works/:workId/progress` | Estado personal de obra y capítulos | Sesión propia |

`/`, `/health` y `/api/docs` son infraestructura/documentación y no necesitan controles de producto. No se duplica un control por alias de método. Los permisos deben volver a comprobarse con los servicios durante el plan. El usuario resolvió la discrepancia de retirada de capítulos: solo ADMIN puede eliminarlos. Esta entrega prepara la restricción en frontend y registra en DEP-006 el cambio necesario en backend, sin implementarlo ni atribuirle garantías inexistentes.

## Dependencias pendientes del backend

### Revisión de contratos administrativos — 2026-10-30

Se contrastaron `../ModoFriki-Backend/docs/API.md`, `openapi.yaml`, `src/routes/admin.routes.ts`, controladores y servicios del backend en `dev` (revisión `6d3a989`). DEP-001, DEP-002 y DEP-007 cuentan con contrato publicado y rutas registradas; el cliente web las adapta en esta rama. DEP-003 sigue sin operaciones de sanciones ni estado propio. La presencia de contratos no equivale a verificación en un servidor de prueba: no se levantó ni se consultó el entorno.

El listado administrativo ofrece cursor `{createdAt,id}`, no búsqueda. La UI filtra las páginas ya cargadas y permite continuar; para verificar un sujeto se usa el GET de detalle. El listado de obras seleccionables reutiliza el contrato vigente `GET /works` con `includeDrafts=true` en sesión de personal. Los cambios de rol usan `updatedAt` como CAS y asignaciones usan `version`; para reasignar una relación revocada se envía su versión histórica, no la versión inicial `0`.

### Revisión de contratos administrativos — 2026-10-30

Se contrastaron `../ModoFriki-Backend/docs/API.md`, `openapi.yaml`, `src/routes/admin.routes.ts`, controladores y servicios del backend en `dev` (revisión `6d3a989`). DEP-001, DEP-002 y DEP-007 cuentan con contrato publicado y rutas registradas; el cliente web las adapta en esta rama. DEP-003 sigue sin operaciones de sanciones ni estado propio. La presencia de contratos no equivale a verificación en un servidor de prueba: no se levantó ni se consultó el entorno.

El listado administrativo ofrece cursor `{createdAt,id}`, no búsqueda. La UI filtra las páginas ya cargadas y permite continuar; para verificar un sujeto se usa el GET de detalle. El listado de obras seleccionables reutiliza el contrato vigente `GET /works` con `includeDrafts=true` en sesión de personal. Los cambios de rol usan `updatedAt` como CAS y asignaciones usan `version`; para reasignar una relación revocada se envía su versión histórica, no la versión inicial `0`.

### DEP-001 — Listado administrativo de usuarios

- **Estado (revisión 2026-10-30)**: Publicado y registrado: GET `/api/admin/users` y GET `/api/admin/users/:userId`; cursor/DTO documentados en `../ModoFriki-Backend/docs/API.md` y `openapi.yaml`. El frontend adapta ambos en `src/services/user-admin.ts`; el servidor real sigue pendiente de prueba.
- **Afecta**: FR-006, FR-012, FR-014; historia 2.
- **Responsable de resolución**: Backend; frontend consume el contrato acordado.
- **Necesario**: Ruta y permiso ADMIN, identidad y rol visibles, estado de sanción, forma de paginación y continuación, orden estable y errores. No se fija una URL propuesta como si existiera.
- **Desbloqueo**: Contrato publicado y ruta disponible; probar páginas sin duplicados, carga/vacío/error y denegación a BASIC/EDITOR.

### DEP-002 — Cambio de roles

- **Estado (revisión 2026-10-30)**: Publicado y registrado: PATCH `/api/admin/users/:userId/role` con precondición `expectedUpdatedAt`; el frontend obtiene el token vigente por GET de detalle. Contrato en `docs/API.md`, `openapi.yaml` y `src/routes/admin.routes.ts`; persistencia/permisos reales pendientes.
- **Afecta**: FR-007, FR-011, FR-012; historia 2.
- **Responsable de resolución**: Backend.
- **Política aclarada**: Solo ADMIN puede cambiar otras cuentas entre BASIC y EDITOR. No puede cambiar su propio rol, modificar el rol de ninguna cuenta ADMIN ni promover cuentas a ADMIN. No se añade un mecanismo alternativo de gestión de ADMIN en esta feature.
- **Necesario**: Operación y respuesta confirmada que hagan cumplir esa política, tratamiento de concurrencia y efecto del cambio sobre las sesiones del usuario afectado. ADMIN puede figurar en las respuestas de consulta, pero no es un destino válido de esta operación. Exigir trazabilidad autoritativa del actor, destinatario, fecha y rol anterior/nuevo; la existencia de AdminAuditEvent no demuestra que haya una operación implementada que lo registre.
- **Desbloqueo**: Contrato acordado y casos reales de BASIC a EDITOR y EDITOR a BASIC; rechazo de cambio propio, cambio de otra cuenta ADMIN e intento de promover a ADMIN; actualización de permisos del afectado. No fabricar privilegios en almacenamiento local.

### DEP-003 — Sanciones de comentarios y estado del afectado

- **Estado**: No se encontraron operaciones de sanción. Resolver reportes ya existe y no equivale a sancionar.
- **Afecta**: FR-008 a FR-012; historia 2.
- **Responsable de resolución**: Backend, con confirmación del alcance de moderación por producto.
- **Necesario**: Consultar sanción vigente, crear temporal/permanente, retirar y extender temporal; motivo, instante de vencimiento y distinción entre estado activo, vencido o retirado. Confirmar cómo recibe su estado el usuario afectado y qué error identifica una sanción al comentar.
- **Regla de producto confirmada**: Respuesta A del usuario: impedir crear, responder y editar comentarios propios; conservar lectura, login, votos, reportes y permiso existente de eliminar comentarios propios, sin retirada automática de comentarios previos. Es una sanción de comentarios independiente del estado SUSPENDED de la cuenta; no se debe reutilizar este estado para implementarla. Backend debe aplicar la restricción, no solo la interfaz.
- **Destinatarios confirmados**: Solo BASIC y EDITOR. No se admite aplicar, extender ni quitar sanciones de cuentas ADMIN desde el panel, incluida la cuenta propia; un estado histórico puede consultarse sin dar permiso para modificarlo. Se debe comprobar el rol vigente también si cambia mientras un modal está abierto.
- **Necesario además**: Semántica de vencimiento y concurrencia entre administradores conforme a esas restricciones. Registrar autoritativamente actor, destinatario, fecha, motivo y cambio de sanción; restringir consulta del motivo al afectado y al administrador autorizado. Los nombres y cuerpos de operaciones quedan pendientes; no se inventan endpoints.
- **Desbloqueo**: Probar temporal, permanente, retirada, extensión y vencimiento contra servidor real; rechazar intentos directos de crear, responder y editar durante sanción. Verificar que la sanción por sí sola no impide login, lectura, votos, reportes o eliminación propia autorizada, ni cambia la cuenta a SUSPENDED.
- **Rechazos de administración**: Verificar denegación para actores BASIC/EDITOR y destinatarios ADMIN, incluida la cuenta propia; repetir ante cambio concurrente del rol del destinatario. La preparación visual no acredita esos rechazos en servidor.

### DEP-004 — Tres imágenes independientes de obra

- **Estado**: Solo existen archivos `cover` e `inpagecover`; el detalle devuelve `coverAsset` e `incapBannerAsset`. El segundo es la imagen inicial compartida por capítulos. Frontend lo usa también como `bannerUrl` de ficha, por lo que hoy no existen tres campos independientes.
- **Afecta**: FR-018 a FR-021; historia 4.
- **Responsable de resolución**: Backend para contrato y persistencia; frontend para formulario y destinos visuales.
- **Necesario**: Tercer campo persistido para banner de ficha, nombre definitivo de multipart y DTO, conservación/reemplazo independiente, respuesta de errores y tratamiento de obras antiguas. Mantener el significado del banner de capítulo existente.
- **Cambio de validación**: El contrato actual permite borradores sin imágenes y exige portada para publicar; la especificación exige las tres al crear y guardar, incluso borradores. El plan debe registrar este cambio explícito y coordinarlo, sin modificar la constitución silenciosamente ni implementar el backend en esta entrega.
- **Transición**: Hasta disponer del tercer campo, la preparación de este flujo impide enviar el guardado de obras y explica su indisponibilidad; se conservan consulta y lectura. No se envían tres imágenes a campos de dos ni se declara exitosa una operación parcial. El banner de ficha nuevo no es el banner general de plataforma descrito en el vault.
- **Límites actuales de referencia**: JPEG, PNG o WebP, 10 MiB por imagen, 100 MiB por solicitud; servidor valida contenido. Confirmar que el tercer campo siga esos límites.
- **Desbloqueo**: Crear/editar con tres imágenes y recargar cada destino; comprobar reemplazo de solo una, conservación de las otras, validación de faltantes y conflicto de edición.

### DEP-005 — Operaciones históricas no registradas

- **Estado**: `docs/API.md` incluye propuestas que no figuran en los routers actuales, entre ellas consulta pública de usuario, edición de perfil y avatar, etiquetas y algunas mutaciones de taxonomía. La identidad actual sí está disponible mediante `/auth/me`.
- **Afecta**: FR-013, FR-014; historia 3.
- **Responsable de resolución**: Backend/producto para decidir si esos contratos pasan a ser capacidades vigentes.
- **Tratamiento**: Registrar cada discrepancia al desglosar el inventario; no crear llamadas a rutas inexistentes ni prometer esas capacidades como parte operativa del cierre actual. Preparar una pantalla nueva para cada propuesta histórica no es requisito de esta entrega.
- **Desbloqueo**: Contrato y ruta disponibles, decisión explícita de incorporarla y actualización de su recorrido y evidencias.

### DEP-006 — Eliminación de capítulos exclusiva de ADMIN

- **Estado**: Política aclarada por el usuario el 2026-10-29: opción A, solo ADMIN. Coincide con `Dominio/Roles y permisos.md` y DEC-11 del vault. El backend actual también autoriza a EDITOR asignado para retirar capítulos, por lo que la contradicción contractual aún requiere corrección.
- **Afecta**: FR-024, SC-008; historia 3, escenarios 6 y 7.
- **Responsable de resolución**: Backend para corregir autorización; frontend para restringir la acción y comprobar su presentación. No se implementa el backend en esta entrega.
- **Necesario**: Rechazo de DELETE de capítulo para EDITOR incluso con asignación vigente; conservar la operación de ADMIN, baja lógica y precondición de versión. No se alteran por esta decisión creación, edición, gestión de páginas ni retirada de obras.
- **Desbloqueo**: Con contrato y servidor corregidos, verificar rechazo directo de EDITOR, falta de acceso de BASIC/visitante y retirada de ADMIN con versión vigente; verificar además conflicto por versión desactualizada. Una prueba de ocultación del botón no demuestra autorización real.

### DEP-007 — Gestión de asignaciones editoriales

- **Estado (revisión 2026-10-30)**: Publicado y registrado: GET `/api/admin/users/:userId/work-assignments`, PUT asignación y PATCH revocación con `expectedVersion`. El frontend adapta lectura, asignación y revocación; la selección de obras usa el listado editorial existente. Persistencia/autorización real pendiente.
- **Afecta**: FR-012, FR-025, FR-027 y FR-028; historia 2, escenarios 12 a 16; SC-009.
- **Responsable de resolución**: Backend para operaciones, autorización y trazabilidad; frontend para consulta, selección y confirmación de asignar/revocar.
- **Necesario**: Contratos exclusivos ADMIN para consultar asignaciones vigentes, asignar y revocar por obra y editor; paginación o continuación cuando corresponda, respuesta confirmada, validación de rol EDITOR y tratamiento de duplicados y concurrencia. No se proponen URLs como si estuvieran implementadas.
- **Reglas**: El rol EDITOR no asigna obras por sí solo; acceder requiere rol vigente y asignación no revocada. Cambiar de rol no crea ni reactiva asignaciones revocadas. Revocar conserva historial y no borra la obra ni sus capítulos. Una sanción de comentarios no revoca asignaciones ni impide publicación editorial por sí sola.
- **Trazabilidad**: Conservar actor, editor afectado, obra, acción y fecha de asignación/revocación mediante el servicio autoritativo; no crear una bitácora autoritativa local ni exigir pantalla nueva de auditoría.
- **Desbloqueo**: Comprobar consulta, asignación, duplicado sin nueva relación, revocación, rol no EDITOR, cuenta sin permiso, edición tras revocación y edición tras pérdida del rol. Verificar resultados persistidos tras recarga y rechazo directo del acceso no autorizado contra servidor real.

## Reglas para preparación y verificación

- El trabajo de esta invocación produce especificación y registro; no implementa pantallas ni modifica el backend.
- La implementación posterior debe poder demostrar los estados de las capacidades pendientes con un proveedor de prueba aislado del uso normal. Las pruebas de interfaz no certifican persistencia, permisos o vencimiento reales.
- Con backend pendiente, la interfaz indica indisponibilidad; no consulta URLs inventadas ni guarda sanciones o roles como si fueran autoritativos.
- Cada operación existente se audita desde su servicio hasta el control o pantalla que la usa y su resultado tras recarga. La falta de total en listas de catálogo no autoriza inventarlo. Los cursores de comunidad no se convierten en números de página ficticios.
- La evidencia final por operación debe contener entorno, identidad/rol de prueba, resultado positivo, caso negativo aplicable y persistencia tras recarga. No se incluyen credenciales ni datos personales innecesarios.
- La disponibilidad de entorno y credenciales de prueba es un prerrequisito de validación real, no de redacción ni de preparación del frontend. Si falta, registrar la limitación sin declarar E2E aprobado.
- El registro de una dependencia exige evidencia de falta externa, no un fallo o recorrido incompleto del frontend. La preparación de asignaciones, roles o sanciones no acredita seguridad real del servidor.
- Listado de usuarios, roles, sanciones y asignaciones tienen adaptación y evidencia independientes: cada una avanza cuando existe su propio contrato/entorno, sin esperar las demás. Si un recorrido necesita selección de sujetos u obras, se registra esa fuente confirmada como dependencia del consumidor UI, no como prohibición de verificar directamente un adaptador disponible.
- GET `/auth/me` se reutiliza para revalidar identidad al foco, antes de confirmar una operación administrativa sensible y tras 403, sin inventar campos nuevos de sanción. Mientras se revalida se impiden confirmaciones sensibles, un fallo recuperable conserva borradores y una escritura rechazada no se reintenta automáticamente.
- El plan debe preservar separación de página exacta local y progreso remoto por capítulo, identidad de los datos entre cuentas, estilo visual y componentes existentes, foco de modales y movimiento reducido. Fijará volúmenes y mediciones de rendimiento con evidencia sin incorporar las propuestas de arquitectura del vault como alcance automático.
