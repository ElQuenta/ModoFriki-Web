# Feature Specification: Deuda técnica de comunidad, administración e integración

**Feature Branch**: `dev` (rama actual; sin hook de creación de rama configurado)

**Created**: 2026-10-29

**Status**: Draft

**Input**: Comentarios con editor y visualización Markdown y spoilers; gestión administrativa de usuarios, roles y sanciones; pantallas y operaciones conectadas de extremo a extremo; tres imágenes obligatorias por obra. Preparar el frontend y registrar las dependencias pendientes del backend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Escribir y leer comentarios con formato y spoilers (Priority: P1)

Como lector quiero escribir, previsualizar y leer comentarios con formato en obras y capítulos, y decidir cuándo revelar un spoiler, manteniendo respuestas y acciones de comunidad.

**Why this priority**: Permite conversar sobre la historia sin revelar involuntariamente contenido a otros lectores.

**Independent Test**: Publicar un comentario con formato y dos spoilers, recargar y revelar solo uno; repetir en comentarios de capítulo y respuestas.

**Acceptance Scenarios**:

1. **Given** una cuenta habilitada, **When** escribe o edita un comentario con negrita, cursiva, tachado, enlaces, citas, listas o código, **Then** puede previsualizarlo y, tras guardar y recargar, ve el mismo formato y contenido.
2. **Given** un comentario con `||esto es un secreto||` y otro spoiler, **When** se muestra inicialmente, **Then** ambos fragmentos aparecen ofuscados y su texto no es anunciado por lectores de pantalla hasta revelarlos.
3. **Given** dos spoilers ocultos, **When** activa uno con clic, Enter o Espacio, **Then** solo ese fragmento se revela; volver a cargar la vista los oculta nuevamente.
4. **Given** varias páginas de comentarios y respuestas, **When** solicita más, **Then** conserva el hilo, no duplica comentarios y distingue carga, fin de resultados y error con reintento.
5. **Given** un error al publicar o conflicto al editar, **When** falla el guardado, **Then** conserva el borrador y explica cómo reintentar o recuperar la versión vigente sin sobrescribirla silenciosamente.
6. **Given** un comentario eliminado con respuestas, **When** consulta el hilo, **Then** las respuestas siguen accesibles bajo un indicador de comentario eliminado.
7. **Given** un comentario con autor no disponible, **When** se muestra el hilo, **Then** conserva el contenido permitido y sus relaciones sin inventar la identidad del autor ni restaurar texto eliminado.
8. **Given** texto vacío, 10 000 caracteres o 10 001 caracteres de fuente, **When** lo escribe o edita, **Then** se rechazan vacío y exceso, se admite el límite exacto y la vista previa coincide con el contenido guardado. Un destino oculto o no publicado no admite nuevos comentarios.
9. **Given** HTML, enlaces peligrosos, código y delimitadores incompletos, **When** se previsualizan o publican, **Then** no se ejecuta contenido, se restringen enlaces y se aplican los casos literales descritos en Edge Cases; votos y reportes conservan sus permisos y errores vigentes.

---

### User Story 2 - Administrar roles y sanciones de comentarios (Priority: P1)

Como administrador quiero consultar usuarios por páginas, ver su rol y sanción vigente, cambiar roles, asignar o revocar obras a editores y gestionar restricciones para comentar mediante un modal.

**Why this priority**: Ofrece control operativo de comunidad y evita confundir la resolución de reportes con la sanción de una cuenta.

**Independent Test**: Con un proveedor de prueba, recorrer usuarios paginados, cambiar roles, asignar y revocar obras y aplicar, extender y retirar sanciones. Repetir con el servicio real cuando esté disponible, registrando esa comprobación por separado.

**Acceptance Scenarios**:

1. **Given** una sesión de administrador, **When** abre Usuarios, **Then** ve una tabla paginada con identidad, rol y estado de sanción, sin descargar el listado completo ni inventar un total.
2. **Given** un usuario BASIC o EDITOR distinto del administrador actuante, **When** confirma el cambio entre BASIC y EDITOR, **Then** se muestra el rol devuelto por el servicio; un rechazo conserva el valor confirmado anterior y muestra un error.
3. **Given** un usuario BASIC o EDITOR sin sanción activa, **When** abre Sancionar, **Then** puede elegir temporal con fecha y hora límite futuras o permanente sin vencimiento, introducir un motivo obligatorio y confirmar.
4. **Given** una sanción temporal activa de BASIC o EDITOR, **When** abre su gestión, **Then** ve el vencimiento y puede quitarla o extenderla a una fecha posterior al vencimiento actual.
5. **Given** una sanción permanente activa de BASIC o EDITOR, **When** abre su gestión, **Then** ve Permanente y puede quitarla; no aparece Extender.
6. **Given** una sanción confirmada, **When** su destinatario intenta crear un comentario o respuesta, o editar uno propio, **Then** se informa la restricción y su vencimiento o permanencia; puede continuar consultando y leyendo contenido.
7. **Given** un visitante, lector o editor, **When** intenta acceder a gestión de usuarios, **Then** no dispone de esas funciones ni puede realizar sus operaciones.
8. **Given** que el servicio de usuarios o sanciones todavía no existe, **When** abre la sección, **Then** se informa que no está disponible y ninguna operación se presenta como guardada.
9. **Given** la cuenta propia o cualquier cuenta ADMIN, **When** el administrador consulta su fila, **Then** puede ver el rol pero no cambiarlo; ADMIN tampoco aparece como rol de destino para BASIC o EDITOR.
10. **Given** un intento de cambiar el rol propio, modificar una cuenta ADMIN o promover una cuenta a ADMIN, **When** se comprueba el contrato de cambio de roles, **Then** la política objetivo exige rechazo del servidor; hasta disponer de ese contrato solo puede verificarse la restricción de interfaz y queda pendiente la autorización real.
11. **Given** una cuenta activa con sanción de comentarios vigente, **When** inicia sesión, lee, vota o reporta un comentario disponible, **Then** la sanción por sí sola no impide esas acciones; crear comentarios, responder y editar comentarios propios sigue bloqueado. La sanción tampoco retira el permiso del autor de eliminar sus propios comentarios según el contrato existente.
12. **Given** un ADMIN y una cuenta EDITOR, **When** abre sus obras asignadas, **Then** consulta las asignaciones vigentes y puede buscar o recorrer obras accesibles para asignar una o confirmar la revocación de una existente, sin descargar todo el catálogo.
13. **Given** una asignación confirmada por el servicio, **When** el EDITOR consulta su panel, **Then** puede gestionar esa obra según su rol; cambiar BASIC a EDITOR por sí solo no asigna ninguna obra.
14. **Given** una asignación revocada o una cuenta que dejó de ser EDITOR, **When** intenta guardar cambios en una obra antes accesible, **Then** no conserva permisos derivados de datos locales; se informa el rechazo y se permite recuperar su trabajo sin anunciar un guardado exitoso.
15. **Given** una asignación ya vigente, un rechazo o una capacidad de asignación ausente, **When** intenta asignar o revocar, **Then** no crea duplicados ni muestra éxito falso; conserva el estado confirmado e informa cómo continuar.
16. **Given** una mutación administrativa sensible, **When** la confirma, **Then** puede identificar usuario, obra o sanción afectados y el alcance antes de enviarla; cancelar no produce cambios remotos. La aceptación real exige trazabilidad del actor, destinatario, acción y fecha en el servicio.
17. **Given** cualquier cuenta ADMIN, incluida la propia, **When** consulta su fila o intenta gestionar su sanción, **Then** no puede aplicar, extender ni quitar sanciones desde el panel; la política objetivo exige el mismo rechazo en el servicio y la lectura del estado no concede permiso para modificarlo.
18. **Given** que el destinatario cambió a ADMIN mientras había un modal de sanción abierto, **When** se intenta confirmar, **Then** no se fuerza la operación con el estado anterior; se actualiza la identidad y se explica que la cuenta está protegida. Este rechazo real se verifica cuando esté disponible DEP-003.

---

### User Story 3 - Completar recorridos con información persistida (Priority: P1)

Como visitante, lector o personal autorizado quiero que las pantallas permitan completar sus operaciones y recuperen el resultado guardado al recargar.

**Why this priority**: Una llamada preparada no resuelve un recorrido si faltan sus controles, pantallas o actualización del resultado.

**Independent Test**: Ejecutar la matriz de recorridos del registro de integración con cuentas y contenido de prueba, confirmar resultados tras recarga y registrar las operaciones bloqueadas por capacidades pendientes.

**Acceptance Scenarios**:

1. **Given** un visitante, **When** navega inicio, catálogo, géneros, rankings, ficha y lector, **Then** consulta contenido real y puede registrarse e iniciar sesión sin datos de demostración.
2. **Given** una cuenta activa, **When** gestiona favoritos, valoración, leído, historial, calendario o progreso, **Then** dispone de los controles y vistas correspondientes y recupera los resultados persistidos tras recargar.
3. **Given** personal autorizado, **When** gestiona obras, capítulos, páginas, taxonomías o reportes, **Then** puede completar cada operación disponible, incluida la navegación a resultados posteriores a la primera página.
4. **Given** una operación que falla por conexión, sesión, permisos, conflicto o validación, **When** se muestra su resultado, **Then** comunica el estado correcto y ofrece recuperación cuando corresponde, sin simular éxito.
5. **Given** una operación documental ausente del servicio actual, **When** se prepara la integración, **Then** queda registrada como dependencia y no se ofrece como funcionalidad operativa.
6. **Given** un EDITOR con una obra asignada, **When** gestiona sus capítulos, **Then** puede crearlos y editarlos según contrato, pero no dispone de la acción de eliminar; la política objetivo exige que el servidor también rechace su intento directo de eliminación.
7. **Given** un ADMIN y un capítulo eliminable, **When** confirma su retirada con la versión vigente, **Then** el servicio aplica la baja lógica; un conflicto conserva la versión actual sin forzar la operación.
8. **Given** un lector que alterna modos cascada y paginado, **When** navega y recarga, **Then** conserva los ajustes y referencia local de lectura según el comportamiento vigente, sin presentar la página exacta como sincronizada entre dispositivos.
9. **Given** una operación protegida, **When** el servicio rechaza la sesión con 401, deniega permiso con 403 o no encuentra un recurso público con 404, **Then** se invalida centralmente la sesión en el primer caso, se explica la falta de permiso sin cambiar de identidad en el segundo y no se revela contenido oculto en el tercero.
10. **Given** una operación existente sin dependencia externa comprobada, **When** su recorrido está incompleto o falla por integración del frontend, **Then** sigue pendiente de implementación; no puede clasificarse como bloqueada para darla por terminada.

---

### User Story 4 - Gestionar tres imágenes independientes por obra (Priority: P2)

Como publicador autorizado quiero gestionar portada, banner de ficha y banner de capítulo como imágenes distintas, obligatorias para guardar una obra.

**Why this priority**: Completa la presentación editorial sin confundir ubicaciones con propósitos distintos.

**Independent Test**: Crear una obra con tres imágenes distinguibles, comprobar sus destinos tras recarga, reemplazar solo una y verificar la conservación de las otras; validar una obra antigua incompleta.

**Acceptance Scenarios**:

1. **Given** una obra nueva o antigua sin alguna imagen, **When** intenta guardar, incluso como borrador, **Then** se indica qué imagen falta y no se confirma hasta completar las tres.
2. **Given** una obra completa, **When** edita sin seleccionar archivos nuevos, **Then** conserva las imágenes y puede guardar sin volver a subirlas.
3. **Given** una obra completa, **When** reemplaza una imagen y guarda, **Then** actualiza solo esa imagen y conserva las demás.
4. **Given** una obra con tres imágenes, **When** consulta tarjetas, ficha y capítulos, **Then** ve portada en tarjetas, banner en ficha y banner de capítulo al inicio de la lectura de sus capítulos.
5. **Given** un archivo inválido o error de guardado, **When** intenta enviar, **Then** se explica la causa sin anunciar una actualización exitosa.
6. **Given** que el servicio aún admite dos imágenes, **When** se prepara la edición de tres, **Then** se explica que el guardado de obras está pendiente del soporte de la tercera imagen y se impide enviarlo; se conservan consulta y lectura, sin descartar ni reutilizar silenciosamente imágenes.
7. **Given** una imagen persistida que se reemplazará, **When** confirma el guardado, **Then** se identifica cuál será reemplazada; cancelar no modifica la obra ni promete borrar físicamente el archivo anterior.

### Edge Cases

- Spoilers vacíos o delimitadores sin cerrar se muestran como texto literal; bloques de código conservan `||` como texto literal.
- Múltiples spoilers, saltos de línea y formato dentro de spoilers conservan la ocultación inicial; el formato mal cerrado no oculta el resto del hilo.
- HTML, contenido ejecutable y enlaces con protocolos peligrosos no ejecutan código ni abren destinos inseguros en vista previa o contenido publicado.
- Comentarios vacíos o con más de 10 000 caracteres de texto fuente, incluidos delimitadores de formato, se rechazan con explicación. Un fallo conserva el texto escrito.
- Cambiar de obra, capítulo o cuenta durante una carga no mezcla comentarios ni datos privados de destinos o usuarios anteriores.
- La doble confirmación no duplica mutaciones; fallar al cargar más conserva las páginas ya obtenidas.
- Una sanción temporal vencida se distingue de una activa; al vencer, se consulta el estado autoritativo antes de anunciar que ya se puede comentar.
- El modal identifica fecha, hora y zona; una fecha pasada o extensión que no supera el vencimiento actual no se puede confirmar.
- Convertir una sanción temporal activa en permanente o reducir su duración queda fuera del flujo directo; se puede quitar y aplicar una nueva con confirmación.
- No se cambia el rol propio ni el de ninguna cuenta ADMIN, incluido el último administrador. No se permite promover a ADMIN desde este panel. Estas restricciones deben aplicarse también en el contrato pendiente del servidor; no se introduce otro mecanismo para administrar cuentas ADMIN en esta feature.
- Ninguna cuenta ADMIN, incluida la propia, admite aplicar, extender o quitar sanciones desde este panel; una sanción histórica sobre una cuenta que ahora es ADMIN puede consultarse, sin habilitar su modificación. Se valida el rol vigente antes de confirmar, también si cambió durante la edición.
- Obras antiguas incompletas siguen consultables; su siguiente guardado exige las tres imágenes. Un fallback visual no cuenta como campo independiente persistido.
- Una selección nueva inválida no se ignora aunque exista una imagen anterior válida. Cancelar la selección conserva la persistida; no se permite vaciar un campo obligatorio.
- Una asignación requiere una cuenta con rol EDITOR; el rol actual y la asignación vigente son condiciones conjuntas, nunca permisos deducidos de una caché. Cambiar el rol no crea asignaciones ni reactiva asignaciones revocadas.
- La sanción de comentarios no revoca por sí sola las asignaciones editoriales ni el permiso de publicar obras o capítulos; son dominios de autorización distintos.
- El banner de ficha de obra es distinto del banner general de plataforma mencionado en Obsidian; gestionar este último queda fuera del alcance.
- El autor no disponible se muestra sin identidad inventada y el texto eliminado no se restaura. Solo se permite comentar sobre destinos publicados y accesibles.
- Un spoiler evita revelación accidental en la interfaz; no constituye protección de secretos frente a quien inspecciona el contenido recibido en el navegador.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El sistema DEBE ofrecer el mismo editor para crear, responder y editar comentarios propios en obras y capítulos, con controles de formato, vista previa y conservación del texto ante errores.
- **FR-002**: Los comentarios DEBEN admitir solo texto con negrita, cursiva, tachado, enlaces, citas, listas, código en línea, bloques de código y spoilers `||`; el texto simple antiguo DEBE seguir siendo legible. No admiten subida, pegado ni arrastre de archivos o imágenes, incrustaciones ni carga automática de imágenes por URL. La fuente textual no soportada, incluida sintaxis de imagen u HTML escrito como texto, DEBE conservarse y mostrarse como texto literal seguro, con la misma regla en preview y publicación.
- **FR-003**: Cada spoiler DEBE empezar oculto y revelarse independientemente con clic o teclado, sin anunciar su contenido oculto a tecnologías de asistencia. La vista previa DEBE aplicar las mismas reglas.
- **FR-004**: El contenido de usuarios DEBE visualizarse de forma segura tanto en vista previa como publicado, sin ejecución de contenido ni navegación a protocolos peligrosos.
- **FR-005**: La carga de comentarios y respuestas DEBE conservar jerarquía, orden y continuación del servicio, evitar duplicados y permitir reintentar sin perder resultados; votos, reportes y eliminación DEBEN seguir disponibles según permisos.
- **FR-006**: Solo administradores DEBEN acceder a la tabla paginada de usuarios y cambios de roles o sanciones. La tabla DEBE mostrar identidad, rol y estado de sanción; desconocido no equivale a Sin sanción.
- **FR-007**: Solo ADMIN DEBE cambiar roles de otras cuentas entre BASIC y EDITOR, con confirmación y resultado confirmado por el servicio. NO DEBE cambiar su propio rol, modificar el rol de ninguna cuenta ADMIN ni promover cuentas a ADMIN. El rol ADMIN se muestra como dato de consulta y no como opción de destino. El contrato pendiente DEBE aplicar las mismas restricciones; ocultar controles no acredita autorización real.
- **FR-008**: Solo ADMIN DEBE poder aplicar sanciones a cuentas BASIC o EDITOR. El modal DEBE permitir sanción temporal con fecha y hora límite futuras o permanente sin vencimiento, e incluir un motivo obligatorio antes de confirmar. NO DEBE permitir sancionar ninguna cuenta ADMIN, incluida la propia; el contrato pendiente DEBE aplicar esta protección al rol vigente.
- **FR-009**: La gestión DEBE mostrar tipo y vencimiento de la sanción vigente. Solo para destinatarios BASIC o EDITOR DEBE permitir quitar cualquier sanción activa y extender las temporales a un vencimiento posterior al actual. NO DEBE permitir aplicar, extender ni quitar sanciones de cuentas ADMIN desde este panel; un estado histórico consultable no concede permiso de modificación.
- **FR-010**: La sanción de comentarios DEBE impedir crear comentarios, responder y editar comentarios propios, y explicar al afectado su vigencia temporal o permanente. NO DEBE por sí sola bloquear inicio de sesión, lectura, votos, reportes ni eliminación de comentarios propios según permisos existentes, ni retirar automáticamente comentarios anteriores. Esta sanción es independiente de la suspensión de cuenta: no se implementa cambiando su estado a SUSPENDED. El servidor DEBE aplicar la restricción; su garantía real queda pendiente de DEP-003.
- **FR-011**: La interfaz DEBE refrescar rol y sanción tras cada operación confirmada; vencimientos, permisos y restricciones reales DEBEN proceder del servicio autoritativo. La identidad DEBE revalidarse al recuperar el foco, antes de confirmar una operación administrativa sensible y tras un rechazo de permisos. Durante esa revalidación no se confirman operaciones sensibles; un rol actualizado cambia las acciones disponibles y un fallo recuperable conserva borradores sin presentar permisos como confirmados. La revalidación no reintenta automáticamente la escritura rechazada.
- **FR-012**: Las capacidades pendientes de usuarios, roles, sanciones y asignaciones editoriales DEBEN contar con pantallas y comportamiento preparados y dependencias registradas, sin desarrollar el backend, inventar contratos ni simular persistencia en uso normal.
- **FR-013**: Se DEBEN completar controles y vistas para cada operación de producto existente: acceso e identidad, descubrimiento y catálogo, ficha y lectura, biblioteca y actividad, comunidad, publicación, taxonomías y reportes. Una llamada preparada sin uso desde su recorrido no cuenta como integrada.
- **FR-014**: Cada operación DEBE vincularse a pantalla, permiso, disponibilidad y evidencia de verificación en un inventario contrastado con el backend; cada capacidad pendiente DEBE tener condición de desbloqueo.
- **FR-015**: Las pantallas DEBEN distinguir carga, vacío, error y éxito, impedir confirmaciones duplicadas y ofrecer recuperación ante sesión inválida, permiso denegado, conflicto, fallo de conexión o validación. Una respuesta 401 con token DEBE invalidar centralmente la sesión; un 403 DEBE explicar falta de permiso sin reintentar con otra identidad; un 404 público NO DEBE revelar recursos ocultos.
- **FR-016**: Las mutaciones DEBEN conservar la protección contra conflictos prevista por el servicio y comprobar persistencia tras recarga; reintentar una misma acción no DEBE duplicar sus eventos de actividad.
- **FR-017**: Los listados cuyo contrato ofrece paginación DEBEN permitir alcanzar resultados posteriores a la primera página respetando límites y forma de continuación de cada dominio, sin inventar totales ni truncar silenciosamente resultados disponibles. Los conjuntos acotados sin continuación, como taxonomías y recomendaciones actuales, no requieren paginación inventada.
- **FR-018**: Crear o guardar cambios de una obra DEBE exigir portada, banner de ficha y banner de capítulo independientes, incluso en borradores; cada campo admite una imagen persistida válida o un archivo nuevo válido.
- **FR-019**: El formulario DEBE identificar y previsualizar las tres imágenes, explicar cuáles faltan y conservar cada existente si no se reemplaza expresamente.
- **FR-020**: La portada DEBE usarse en tarjetas/listados; el banner en ficha; y el banner de capítulo compartido por la obra al inicio de sus capítulos. No se exige uno distinto por capítulo.
- **FR-021**: Las imágenes DEBEN validarse antes de enviar según formatos y límites vigentes; errores y resultados guardados DEBEN proceder del servicio. El tercer campo exige compatibilidad confirmada antes de anunciar integración real.
- **FR-022**: Los recorridos afectados DEBEN funcionar en móvil y escritorio, con textos en español, etiquetas, foco visible y modales operables con teclado que devuelvan el foco al control de origen.
- **FR-023**: La entrega DEBE distinguir funcionalidades verificadas contra el servicio real, verificadas con proveedor de prueba y bloqueadas; una simulación no acredita funcionamiento real de extremo a extremo.
- **FR-024**: Solo ADMIN DEBE poder eliminar capítulos. EDITOR, aunque tenga asignada la obra, NO DEBE disponer de esa acción. El frontend DEBE restringirla y registrar como dependencia la corrección del permiso actual del backend; no se declara garantizada la denegación en servidor hasta comprobarla contra el servicio corregido. Este cambio no modifica los demás permisos de obra o capítulo.
- **FR-025**: Solo ADMIN DEBE poder consultar, asignar y revocar obras a cuentas EDITOR desde el panel, con selección de obra y confirmación del destinatario y alcance. Cambiar BASIC a EDITOR NO DEBE asignar obras automáticamente; una asignación vigente NO DEBE duplicarse. Tras revocar, el editor NO DEBE conservar acceso de gestión por datos locales. Los contratos y la garantía real de autorización quedan pendientes de DEP-007.
- **FR-026**: La integración DEBE preservar modos cascada y paginado, navegación de capítulos y referencia local de página y ajustes. El progreso remoto por capítulo DEBE distinguirse de la página exacta local y del recuerdo local del voto propio; ningún dato personal local DEBE mostrarse como perteneciente a otra cuenta. Marcar leído manualmente NO DEBE registrar una apertura ni sumar una racha.
- **FR-027**: Los cambios de roles, asignaciones y sanciones DEBEN exigir trazabilidad autoritativa de actor, destinatario, acción y fecha, y valores anterior/nuevo cuando corresponda. La preparación de frontend registra esta dependencia sin crear una bitácora autoritativa local ni añadir una pantalla de auditoría. Motivos de sanción se muestran al afectado y al administrador autorizado; datos de reporteros, correos privados y credenciales NO DEBEN exponerse en vistas públicas, logs o analítica.
- **FR-028**: Retirar contenido, reemplazar imágenes de obra y aplicar, extender o quitar sanciones o asignaciones DEBE requerir confirmación informada del alcance. Cancelar NO DEBE producir cambios remotos; no se promete purga física de recursos retirados. En formularios sin cambios, Escape, cierre exterior o Cancelar cierran; con cambios sin guardar presentan «Descartar cambios» o «Seguir editando» dentro del mismo diálogo, sin apilar modales. Durante un envío se impide cerrar hasta conocer su resultado; un fallo conserva datos locales.
- **FR-029**: Los comentarios DEBEN tener texto fuente no vacío de hasta 10 000 caracteres, conservar destino publicado y accesible y admitir autor no disponible sin inventar identidad. El editor y la vista publicada DEBEN aplicar el mismo límite y reglas de contenido.
- **FR-030**: Las pantallas afectadas DEBEN conservar la identidad oscura con acento naranja, tipografías y componentes compartidos del proyecto; los modales DEBEN mantener el foco durante su apertura y las animaciones respetar movimiento reducido.

### Key Entities *(include if feature involves data)*

- **Comentario**: Texto fuente, autor, destino, jerarquía, revisión y estado; conserva votos y reportes asociados.
- **Spoiler**: Fragmento con contenido oculto y estado de revelación independiente y temporal en la vista del lector.
- **Usuario administrable**: Identidad, rol autoritativo y estado de sanción; aparece en un conjunto paginado restringido a administradores.
- **Sanción de comentarios**: Usuario, motivo, tipo temporal o permanente, vencimiento cuando corresponde y estado vigente, retirado o vencido.
- **Asignación editorial**: Relación entre obra y EDITOR, con fecha de asignación y revocación cuando corresponde; el estado vigente se combina con el rol actual para autorizar gestión.
- **Trazabilidad administrativa**: Actor, destinatario, acción, fecha y cambio efectuado; la conserva el servicio autoritativo, sin exigir una pantalla nueva de consulta en esta entrega.
- **Obra e imágenes**: Obra con portada, banner de ficha y banner de capítulo independientes, datos editoriales y referencia vigente para evitar perder cambios concurrentes.
- **Registro de integración**: Operación, recorrido, permiso, disponibilidad del servicio, dependencia pendiente y evidencia de validación.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: El 100 % de los escenarios aplicables de comentarios pasa en la matriz obra/capítulo por comentario raíz/respuesta; revelar uno de dos spoilers deja el otro oculto en todos los casos comprobados. Se incluyen texto vacío, 10 000 caracteres válidos, 10 001 rechazados y autor no disponible.
- **SC-002**: El 100 % de los casos administrativos de interfaz definidos —consulta paginada, roles, asignación, revocación y sanción temporal, permanente, retirada y extensión— pasa con proveedor de prueba, incluidos el bloqueo de gestión de sanciones de ADMIN y su cambio de rol durante un modal abierto. La denegación de controles no se presenta como prueba de autorización real del servidor, que requiere ejecución separada.
- **SC-003**: El 100 % de las operaciones de producto existentes queda asociado a un recorrido accesible y evidencia real de ejecución, salvo una dependencia externa identificada y comprobada en el registro. Un fallo o recorrido incompleto del frontend sigue siendo trabajo pendiente y no puede convertirse en dependencia para aprobar el cierre. Las capacidades nuevas bloqueadas requieren evidencia de preparación separada del cierre E2E.
- **SC-004**: En los recorridos no bloqueados, todas las modificaciones confirmadas se recuperan tras recarga y cada operación sensible incluye un caso de éxito y uno de rechazo o error.
- **SC-005**: El 100 % de los guardados con una imagen faltante se rechaza antes de confirmar; al reemplazar una sola imagen de una obra completa se conservan las otras dos.
- **SC-006**: Edición, revelación de spoilers y gestión administrativa pueden completarse solo con teclado; a anchos de 360 y 1280 píxeles sus controles siguen accesibles, permitiendo desplazamiento local de tablas.
- **SC-007**: Ningún escenario comprobado de error o capacidad no disponible muestra confirmación falsa, elimina el borrador o sustituye datos reales por datos de demostración.
- **SC-008**: En el 100 % de los casos de interfaz comprobados, EDITOR carece de la acción de eliminar capítulos y ADMIN dispone de ella según estado del recurso. La aceptación real de autorización exige además rechazo del intento directo de EDITOR y retirada confirmada por ADMIN contra el backend corregido.
- **SC-009**: La matriz de asignaciones cubre consulta, asignación, duplicado, revocación, editor sin obras y pérdida de acceso por revocación o cambio de rol. Todos pasan en preparación de interfaz; el cierre real exige que el servicio persista los resultados y rechace operaciones de cuentas sin permiso.
- **SC-010**: Las verificaciones de regresión incluyen modos de lectura, cambio de cuenta sin mezcla de datos personales, marcado leído sin evento de apertura, rechazo de sesión o permiso y cancelación sin mutaciones. Todas conservan el comportamiento exigido por la constitución.

## Assumptions

- Se reutilizan identidad y BASIC/EDITOR/ADMIN; se prepara gestión de asignaciones conforme a FR-025 sin conceder permisos implícitos por cambiar de rol. La eliminación de capítulos se reserva a ADMIN conforme a FR-024; los demás permisos de contenido se conservan. Corregir autorización y desarrollar contratos del backend queda fuera de esta entrega de frontend.
- Se adopta el Markdown básico propuesto antes de las aclaraciones. No incluye paridad completa con Discord, menciones, emojis personalizados, adjuntos ni edición colaborativa.
- «Loader más completo» significa visualización del formato y carga progresiva robusta de comentarios y respuestas; no incorpora búsqueda ni clasificación nueva.
- El motivo de sanción se requiere para explicar la restricción. El usuario confirmó que se impide crear, responder y editar comentarios propios; las demás acciones conservan los permisos existentes. Se distingue de la suspensión de cuenta y el backend debe aplicar este alcance antes de activarlo realmente.
- El modal identifica su zona horaria: inicialmente la de la cuenta administradora, con America/La_Paz como fallback. Se conserva el instante exacto al cambiar de zona.
- Las tres imágenes son obligatorias al crear y editar, y se conservan sin resubir cuando existen. Esta regla sustituye para esta feature la posibilidad actual de guardar borradores sin imágenes; el plan debe registrar el cambio de validación y su dependencia contractual.
- El banner de capítulo pertenece a la obra y se comparte entre capítulos, como en el comportamiento actual. No incluye recorte avanzado, migración masiva ni borrado físico de imágenes.
- «Todas las operaciones» comprende las capacidades de producto realmente registradas en el backend consultado. Rutas equivalentes no requieren duplicar controles; salud y documentación no necesitan pantallas de producto.
- Propuestas documentales sin implementación, como edición de perfil y avatar, se registran como dependencias. No se incluyen desarrollo del backend, despliegue, pagos ni funciones comerciales.
- Se puede completar el frontend preparado y la integración disponible, pero cerrar de extremo a extremo usuarios, sanciones, asignaciones y tres imágenes, además de garantizar eliminación de capítulos solo por ADMIN, depende de los servicios pendientes del registro adjunto. Las asignaciones no incorporan un programa de autores ni funciones comerciales.

## Clarifications

### Session 2026-10-29

- Sanciones: temporales o permanentes en modal; mostrar estado; quitar o extender si no es permanente. Preparar el frontend y registrar dependencias del backend.
- Integración: completar también las pantallas y conectar cada operación para funcionar de extremo a extremo.
- Imágenes: las tres son obligatorias y el flujo debe ser similar al actual.
- Q: ¿Quién debe poder eliminar capítulos: únicamente ADMIN o también EDITOR cuando tenga asignada la obra? → A: Solo ADMIN. Preparar esa restricción en frontend y registrar la corrección pendiente del backend.
- Q: ¿Qué cambios de rol debe poder realizar un ADMIN sobre su propia cuenta y sobre otros administradores? → A: Opción B ajustada: no puede cambiar su propio rol ni el de otros administradores y tampoco puede promover cuentas a ADMIN; solo puede cambiar otras cuentas entre BASIC y EDITOR.
- Q: ¿Qué acciones debe impedir una sanción de comentarios? → A: Opción A: crear comentarios, responder y editar comentarios propios. Se conservan acceso a la cuenta, lectura, votos y reportes.
- Q: ¿Incluimos en esta entrega la interfaz para asignar y revocar obras a los EDITOR? → A: Opción A: preparar también asignación y revocación de obras y registrar sus dependencias pendientes del backend.
- Q: ¿Las sanciones de comentarios pueden aplicarse también a cuentas ADMIN? → A: Opción A: solo BASIC y EDITOR pueden recibir sanciones desde el panel; las cuentas ADMIN quedan protegidas.
- Ajustes aprobados tras analyze: activar/verificar capacidades por operación; explicitar límites de valoración, calendario y capítulo; revalidar identidad en foco/confirmación/403; confirmar descarte de cambios sin apilar modales; actualizar recuentos. Los comentarios son solo texto, sin subida ni carga de imágenes; la fuente no soportada se conserva como literal seguro.

## Dependencies & Scope

El [registro de integración y dependencias](integration-dependencies.md) recoge evidencia del checkout local del backend, inventario de recorridos y contratos pendientes. Es un insumo de planificación, no una afirmación de implementación ni disponibilidad del entorno.

La [revisión de contradicciones y lagunas](clarification-review.md) documenta el contraste con la constitución y el vault local de Obsidian, las cinco decisiones aceptadas y los puntos técnicos diferidos a planificación.

La preparación se verifica con un proveedor de prueba aislado. La aceptación de persistencia, permisos, vencimientos, asignaciones y tres imágenes contra el servicio real queda pendiente hasta resolver sus dependencias, sin presentar esa limitación como cierre de extremo a extremo. Se conserva la constitución vigente: los cambios contractuales y reglas aclaradas se coordinan antes de integrarse; este documento no enmienda la constitución ni acredita cambios en el backend.
