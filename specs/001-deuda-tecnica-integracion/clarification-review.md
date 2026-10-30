# Revisión de contradicciones y lagunas del spec

**Fecha**: 2026-10-29
**Estado**: Aclaración completada: cinco preguntas respondidas e integradas. Los contratos y comprobaciones reales del backend siguen pendientes conforme al registro de dependencias.
**Especificación**: [spec.md](spec.md)

## Fuentes y criterio de lectura

- Constitución local: [.specify/memory/constitution.md](../../.specify/memory/constitution.md), versión 1.0.0. Prevalecen las instrucciones explícitas del usuario; las notas del vault no modifican por sí solas la constitución ni el contrato.
- Obsidian local: `../../../ModoFriki-Obsidian`, revisión `8cbd099705946a419deddb2571a535a9c5891cf0`, sin modificaciones al consultar. Se revisaron notas de dominio, decisiones y arquitectura pertinentes; se buscaron comentarios, sanciones, permisos e imágenes en el vault completo.
- Backend: inspección de autorización de catálogo y modelos de usuarios/asignaciones/auditoría, además del inventario de rutas contrastado durante specify. No se ejecutaron operaciones contra servidor real.
- Se distingue contradicción directa de laguna, decisión nueva autorizada, dependencia y detalle técnico diferible. La omisión de repetir una regla constitucional no es por sí sola una contradicción: la constitución sigue aplicando.

## Hallazgos iniciales y decisiones de producto

La tabla conserva el diagnóstico inicial; el cierre por hallazgo y su referencia en el spec se detallan al final de este documento.

| ID | Tipo / impacto | Evidencia contrastada | Consecuencia y tratamiento necesario |
| --- | --- | --- | --- |
| R-01 | Contradicción entre fuentes / alto | El backend autoriza a ADMIN o EDITOR asignado para retirar capítulos. `Dominio/Roles y permisos.md` y DEC-11 lo reservan a ADMIN; la constitución exige resolverlo explícitamente. | Resuelto en producto: respuesta A del usuario, solo ADMIN. Integrado en FR-024, SC-008, historia 3 y DEP-006. Pendiente la corrección externa del backend y su validación real; no cambia otros permisos. |
| R-02 | Laguna de autorización / alto | La redacción inicial de FR-007 ofrecía BASIC/EDITOR/ADMIN y remitía cambios propios y cuentas privilegiadas a reglas futuras. Constitución IV hace al servidor autoridad de permisos; DEC-06 exige rol actual en cada petición. | Resuelto: B ajustada por el usuario, solo cambios de otras cuentas entre BASIC y EDITOR; sin cambio propio, modificación de ADMIN ni promoción a ADMIN. Integrado en FR-007, historia 2, Edge Cases y DEP-002. Autorización real pendiente del contrato del backend. |
| R-03 | Laguna de moderación / alto | El alcance de FR-010 era un supuesto: crear, responder y editar, conservando votos y reportes. Cuenta de usuario y DEC-06 describen SUSPENDED como suspensión de cuenta con bloqueo de acceso. | Resuelto: respuesta A del usuario, impedir crear, responder y editar comentarios propios; conservar las demás acciones según permisos existentes. Integrado en FR-010, historia 2, Assumptions y DEP-003, distinguiendo expresamente sanción de comentarios y SUSPENDED. Aplicación real pendiente del backend. |
| R-04 | Laguna de alcance funcional / alto | Cambiar BASIC a EDITOR no asigna obras. Constitución IV, Asignación de editores y Flujo de publicación exigen asignación vigente, sin recorrido inicial de gestión en el spec. | Resuelto: respuesta A del usuario, incluir interfaz de consulta, asignación y revocación. Integrado en FR-025, historia 2, entidad Asignación editorial, SC-009 y DEP-007. Contrato y autorización reales pendientes del backend. |
| R-05 | Cambio autorizado y transición incompleta / alto | FR-018 e historia 4 requieren tres imágenes incluso en borradores; el usuario confirmó obligatoriedad. Constitución V solo exige portada para publicar, no prohíbe exigir más. Obsidian `Dominio/Flujo de publicación.md` permite crear borrador antes de subir portada y `Dominio/Páginas y portadas.md` solo describe portada y banner incap por obra. | No presentar el requisito de tres imágenes como prohibición constitucional ni volver a preguntar si son obligatorias. Registrar que sustituye el flujo antiguo de borrador sin imágenes. Mientras no exista el tercer campo, no afirmar guardado real de tres; especificar el estado bloqueado y conservar consulta y lectura existentes. |
| R-06 | Ambigüedad de terminología / medio | Obsidian `Dominio/Páginas y portadas.md` llama Banner general a una imagen de toda la plataforma; FR-020 define un banner por obra para su ficha, además del incap compartido por capítulos. | Normalizar como portada de obra, banner de ficha de obra y banner de capítulo de obra. El banner de ficha nuevo no es el banner general de plataforma; no ampliar alcance a administrar este último. Corrección editorial sin nueva decisión. |
| R-07 | Contradicción interna de cierre / alto | FR-013 exige completar recorridos de cada operación existente; SC-003 permite evidencia real o una dependencia explícita para cualquier operación existente. | El criterio puede permitir etiquetar como dependencia un fallo frontend de una operación ya disponible. Limitar la excepción a dependencias externas verificadas; fallos de integración del frontend siguen siendo trabajo pendiente. Separar preparación y aceptación E2E. Corrección coherente con la respuesta previa del usuario. |
| R-08 | Laguna de auditoría / medio | Obsidian `Dominio/Auditoría administrativa.md` y `Arquitectura/BD - Usuarios y roles.md` describen ROLE_CHANGED y actor/sujeto/fecha. El spec exige confirmar cambios pero no exige conservar trazabilidad administrativa ni registra su dependencia para sanciones. | Añadir trazabilidad como requisito del contrato pendiente de operaciones sensibles, sin crear un registro autoritativo en navegador ni exigir pantalla nueva de auditoría. La disponibilidad de tablas no demuestra rutas funcionales. |
| R-09 | Laguna de regresiones de lectura / medio | Historia 3 promete resultados persistidos tras recarga; Constitución VI y `Dominio/Flujo de lectura.md` separan progreso por capítulo remoto de página exacta y ajustes locales. FR-016 solo cubre idempotencia en general. | Evitar interpretar persistencia como sincronización remota de página exacta o voto propio. Preservar cascada/paginado, navegación, referencia de página e identidad al cambiar de cuenta. Marcar leído manualmente no suma apertura ni racha. Corrección derivada de reglas vigentes. |
| R-10 | Criterios negativos incompletos / medio | FR-015 menciona sesión y permisos sin fijar efectos. Constitución IV distingue 401 con token de 403; `Dominio/Estados de publicación.md` exige 404 público para recursos ocultos. | Añadir aceptación: invalidación central de sesión en 401, explicación de 403 sin reintento con otra identidad y ausencia de filtración de borradores ante 404. Revalidar permisos tras cambios sin fingir una nueva identidad. |
| R-11 | Laguna de confirmación / medio | FR-019 conserva/reemplaza imágenes pero no exige confirmación explícita del alcance del reemplazo; Constitución V la exige para retirar o reemplazar. FR-009 no describe confirmación de quitar/extender sanción. | Explicitar confirmación informada de retirada y reemplazo de medios y de mutaciones administrativas sensibles; cancelar no produce cambios remotos. No equivale a pedir aprobación al usuario para redactar el spec. |
| R-12 | Laguna de comunidad y privacidad / medio | `Dominio/Comentarios.md` fija 10 000 caracteres, contenido publicado y autor null; Constitución VIII protege datos de usuarios y reporteros. El spec habla de límite vigente y solo prueba jerarquía y carga. | Precisar límite de fuente, destino publicado, autor no disponible y privacidad de motivos/datos administrativos, además de no revelar texto de spoilers a tecnologías de asistencia antes de activarlos. No confundir ocultación visual con protección de secretos contra inspección del navegador. |
| R-13 | Ambigüedad en paginación / medio | FR-017 dice todos los listados; el backend devuelve listas acotadas de recomendaciones y taxonomías sin paginación, mientras comunidad usa cursores. Obsidian DEC-12 y Constitución III distinguen formas de lista. | Aplicar navegación adicional solo donde el contrato la ofrece; no inventar paginación o totales en conjuntos acotados. La tabla de usuarios queda sujeta al contrato pendiente, sin imponer un total inexistente. |
| R-14 | Cobertura no funcional y visual incompleta / bajo a medio | FR-022 cubre móvil, escritorio y teclado. Constitución VII y `Arquitectura/Frontend - Diseño visual.md` también exigen identidad visual, componentes existentes, permanencia del foco y movimiento reducido. No hay objetivo medible de carga del editor/listado. | Conservar esos requisitos heredados explícitamente en las verificaciones afectadas. Medidas de rendimiento y volumen de prueba se fijarán en el plan con evidencia, sin importar propuestas de caché, miniaturas o reestructuración del vault como alcance nuevo. |
| R-15 | Precisión insuficiente de aceptación / medio | SC-001 aplica todos los escenarios a obras, capítulos y respuestas, aunque una respuesta no es un destino independiente. SC-002 podría interpretarse como prueba de autorización real con proveedor simulado. | Definir matriz: obras y capítulos, comentario raíz y respuesta; separar resultado de controles de interfaz de autorización del servidor. Verificación del frontend preparado no cierra seguridad real del backend pendiente. |
| R-16 | Evaluación anterior demasiado concluyente / medio | Checklist declara 16/16 y lista para plan, pero R-01 a R-04 y R-07 afectan claridad y cierre. | Revalidar los marcadores de requisitos tras integrar respuestas; conservar notas existentes conforme al ciclo de clarify y reportar regresiones reales. No reutilizar el 16/16 inicial como prueba de ausencia de contradicciones. |

## Elementos ya compatibles

- Markdown seguro y enlaces restringidos desarrollan Constitución VIII; no requieren permitir HTML arbitrario.
- El banner incap compartido por capítulos concuerda con el vault y el contrato; no exige imagen nueva por capítulo.
- Separar resolver reportes, eliminar comentarios y sancionar usuarios concuerda con Constitución VIII y las notas de moderación.
- Preparar capacidades pendientes con un proveedor de prueba aislado y mostrar indisponibilidad en uso normal cumple la instrucción del usuario y las reglas de evidencia.
- No incorporar Friki+, pagos, autores, rediseño arquitectónico, caché global o miniaturas por aparecer en el vault preserva el alcance constitucional.
- Una exigencia adicional de imágenes no implica por sí sola enmendar la constitución: sí requiere coordinar el cambio incompatible del contrato antes de integrarlo.

## Estado del proceso

Se formularon cinco aclaraciones de producto, una por vez. Cada respuesta se incorporó al spec y se verificó incrementalmente. Las correcciones derivadas de la constitución y decisiones ya confirmadas se incorporaron sin requerir nuevas decisiones. Este registro no modifica la constitución, el vault ni el backend.

- Respuestas aceptadas: 5 de un máximo de 5. R-01 a R-04 y la protección de cuentas ADMIN frente a gestión de sanciones están resueltos en especificación; implementación y validación externas de DEP-006, DEP-002, DEP-003 y DEP-007 pendientes.
- Checklist revalidado tras la primera respuesta: 16/16 → 12/16. Regresiones: requisitos inequívocos, escenarios completos, alcance delimitado y criterios de aceptación de todos los requisitos. Corresponden a las decisiones aún pendientes de R-02 a R-04 y a las precisiones de cierre identificadas en la revisión. No hay elementos nuevos aprobados; las notas del checklist conservan la evaluación histórica inicial y este registro informa el estado actual.
- Checklist revalidado tras la segunda respuesta: 12/16 → 12/16; sin cambios de marcadores. Persisten las cuatro áreas abiertas por el alcance de sanciones, asignaciones y las precisiones de aceptación pendientes. Las restricciones de cambio de rol ya tienen escenarios positivos y negativos.
- Checklist revalidado tras la tercera respuesta: 12/16 → 12/16; sin cambios de marcadores. El alcance de sanciones ya está confirmado y tiene escenario de acciones conservadas; siguen pendientes la decisión sobre asignaciones y las precisiones de cierre y aceptación documentadas en la revisión.
- Checklist revalidado tras la cuarta respuesta: 12/16 → 13/16; alcance delimitado pasa a satisfecho. Siguen sin marcar requisitos inequívocos, todos los escenarios definidos y criterios de aceptación de todos los requisitos: falta precisar las cuentas destinatarias de sanciones. No hay nuevas regresiones.
- Precisiones derivadas de fuentes incorporadas sin nueva decisión: transición del tercer campo y diferenciación del banner general (R-05/R-06), cierre E2E sin convertir fallos de frontend en dependencias (R-07), trazabilidad administrativa (R-08), regresiones de lectura y privacidad entre cuentas (R-09), rechazos 401/403/404 (R-10), confirmaciones y cancelación (R-11), límite y autor no disponible (R-12), listas paginadas frente a conjuntos acotados (R-13), estilo/foco/movimiento reducido (parte de R-14) y matriz de comentarios frente a pruebas de autorización real (R-15). Los volúmenes y mediciones de rendimiento de R-14 se difieren al plan con evidencia.
- Quinta respuesta: solo BASIC y EDITOR pueden recibir sanciones desde el panel. FR-008/FR-009 y la historia 2 excluyen aplicar, extender o quitar sanciones de ADMIN; DEP-003 exige validar el rol vigente incluso ante cambios concurrentes.
- Checklist final: 13/16 → 16/16. Pasan a satisfechos requisitos inequívocos, escenarios completos y criterios de aceptación de todos los requisitos. Sin nuevas regresiones ni casillas pendientes. Balance de toda la sesión: 16/16 inicial → 16/16 final, con cuatro regresiones detectadas y corregidas durante la revisión. Las notas originales del checklist se conservaron según el ciclo de clarify; sus cantidades de requisitos y aclaraciones describen la versión inicial. Estado vigente: 30 requisitos, 10 criterios de éxito y cinco respuestas de esta revisión.
- Hooks: `.specify/extensions.yml` no existe; before_clarify y after_clarify no tienen acciones configuradas.
- Validación documental: integridad de referencias locales, identificadores únicos, cinco respuestas sin duplicados y coherencia de las políticas seleccionadas. No se ejecutaron pruebas de aplicación porque no se modificó código funcional.

## Cierre por hallazgo

| Hallazgo | Estado de especificación | Evidencia de cierre / trabajo posterior |
| --- | --- | --- |
| R-01 | Resuelto | FR-024, SC-008, historia 3 y DEP-006: solo ADMIN elimina capítulos; corrección real del backend pendiente. |
| R-02 | Resuelto | FR-007 e historia 2: otras cuentas solo BASIC ↔ EDITOR, sin cambios propios ni de ADMIN ni promociones a ADMIN; DEP-002. |
| R-03 | Resuelto | FR-008 a FR-010: sanción de comentarios independiente de SUSPENDED, con acciones y destinatarios confirmados; DEP-003. |
| R-04 | Resuelto | FR-025, SC-009 y DEP-007: consulta, asignación y revocación incluidas sin permiso implícito por cambiar rol. |
| R-05 | Resuelto como transición explícita | Historia 4, FR-018/FR-021 y DEP-004: tres imágenes obligatorias, guardado no disponible mientras falte soporte y consulta/lectura conservadas. |
| R-06 | Resuelto | Edge Cases distingue banner de ficha de obra de banner general de plataforma; FR-020 mantiene banner de capítulo compartido. |
| R-07 | Resuelto | SC-003 y escenario 10 de historia 3: un fallo frontend no sirve como dependencia para aprobar el cierre. |
| R-08 | Resuelto en requisitos | FR-027 y escenario 16 de historia 2; trazabilidad autoritativa incluida en DEP-002/DEP-003/DEP-007. Implementación del servidor pendiente. |
| R-09 | Resuelto | FR-026, SC-010 e historia 3: progreso remoto distinto de página local y separación de datos entre cuentas. |
| R-10 | Resuelto | FR-015 y escenario 9 de historia 3: efectos de 401/403/404 y protección de recursos ocultos. |
| R-11 | Resuelto | FR-028 y escenarios de confirmación/cancelación en historias 2 y 4. |
| R-12 | Resuelto | FR-027/FR-029, escenarios 7 a 9 de historia 1 y Edge Cases: límite, autor no disponible, privacidad y alcance real del spoiler. |
| R-13 | Resuelto | FR-017: respetar continuación solo donde existe, sin inventar totales ni paginación. |
| R-14 | Parcialmente diferido a planificación | FR-030 resuelve estilo, foco y movimiento reducido. Mediciones de rendimiento, volumen representativo y dimensionamiento se definen en plan con evidencia del contrato y entorno; no requieren cambiar política de producto. |
| R-15 | Resuelto | SC-001/SC-002: matriz de destinos por raíz/respuesta y pruebas de interfaz separadas de autorización real. |
| R-16 | Resuelto | Checklist revalidado incrementalmente, regresiones registradas y estado final 16/16; la calidad documental no equivale a implementación aprobada. |

## Cobertura final de clarify

| Categoría | Estado | Alcance |
| --- | --- | --- |
| Alcance funcional y comportamiento | Resuelto | Políticas de roles, sanciones, eliminación y asignaciones; exclusiones de producto explícitas. |
| Dominio y modelo de datos | Resuelto | Identidad, asignación y sanción separadas, transiciones y autoridad del servicio. Volúmenes técnicos pasan al plan. |
| Interacción y experiencia | Resuelto | Modal, teclado, estados, confirmación, cancelación y destinos de imágenes. |
| Atributos de calidad no funcionales | Diferido parcialmente | Seguridad, privacidad y accesibilidad explícitas; rendimiento, capacidad y recuperación operativa se dimensionan en plan sin afirmar garantías no medidas. |
| Integraciones y dependencias externas | Resuelto en alcance; contratos diferidos | DEP-001 a DEP-007 identifican disponibilidad, responsables y desbloqueo. Esquemas, versiones y disponibilidad real se contrastan durante plan y ejecución. |
| Casos límite y fallos | Resuelto | Conflictos, cambio de rol concurrente, vencimientos, errores de sesión/permisos, duplicados y archivos inválidos. Reintentos aplican las restricciones constitucionales vigentes. |
| Restricciones y compromisos | Claro | Frontend preparado sin desarrollar backend, sin reescritura arquitectónica ni importación automática de propuestas del vault. |
| Terminología y consistencia | Resuelto | ADMIN protegido, sanción distinta de suspensión, banner de ficha distinto del general, progreso local distinto del remoto. |
| Señales de finalización | Resuelto | SC-001 a SC-010 separan preparación, integración real y bloqueos externos acreditados. |
| Marcadores y otros | Claro | Sin marcadores de aclaración pendientes; cinco decisiones registradas una vez cada una. |

Recomendación: continuar con `$speckit-plan`. La planificación debe concretar los puntos técnicos diferidos y mantener visibles las dependencias externas. No se requiere otra ronda de aclaraciones de producto para estas cinco decisiones.

## Ajustes aprobados después de analyze

El usuario aprobó las seis propuestas de remediación y precisó que los comentarios son puro texto, sin subida de imágenes. Esta aprobación posterior no agrega preguntas a la sesión de cinco aclaraciones ni autoriza implementar código de aplicación.

| Hallazgo de analyze | Ajuste incorporado |
| --- | --- |
| I1 — Activaciones agrupadas | Cuatro parejas de adaptación/evidencia independientes en T041–T048: listado, roles, sanciones y asignaciones. Recuento vigente 83 tareas, con 12 condicionales. |
| U1 — Límites de validación | Contrato UI, modelo, plan, quickstart y tareas explicitan valoración 0–5/pasos 0,5, calendario de 366 días inclusivos y capítulo no negativo de nueve enteros/tres decimales como texto, sujetos al contraste T003. |
| U2 — Revalidación de identidad | FR-011 y T039: foco, confirmación sensible y 403 mediante identidad actual; pending bloquea confirmaciones, fallo recuperable conserva borradores y no se reintentan escrituras. |
| A1 — Cierre con cambios | FR-028 y contrato UI: cierre limpio, descarte/continuación en el mismo diálogo o área inline, y cierre bloqueado durante envío hasta conocer resultado. |
| A2 — Texto no soportado | FR-002 y contrato UI: comentarios solo de texto, sin subida/pegado/arrastre/carga de imágenes; constructos no soportados conservados como literal escapado igual en preview y publicación. Las imágenes de obra siguen en su propio flujo. |
| I2 — Recuento de checklist | Plan actualizado a 52 ítems UX/datos; sus marcadores permanecen sin evaluar. Las referencias previas a 40 en este informe son historial de la generación inicial. |

La renumeración de tareas está documentada en tasks.md y sus dependencias usan los identificadores vigentes. Los 30 FR y 10 SC se conservan; la cobertura documental no equivale a implementación ni a autorización real del backend.
