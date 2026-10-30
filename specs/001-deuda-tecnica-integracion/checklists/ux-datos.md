# Checklist de experiencia de usuario y validación de datos

**Purpose**: Revisar integridad, claridad, coherencia y cobertura de requisitos de UX y validación antes de implementar la integración.
**Created**: 2026-10-29
**Feature**: [spec.md](../spec.md)
**Profundidad**: Estándar, con prioridad en permisos, pérdida de datos, accesibilidad y contratos pendientes.
**Destinatario y momento**: Autor y revisor del diseño, antes de generar tareas y durante revisión documental.

**Note**: Checklist personalizado generado con `$speckit-checklist`; evalúa lo especificado, no el funcionamiento de código.
**Review Ownership**: El revisor es dueño de los marcadores. Solo marca `[x]` tras determinar que el criterio de calidad del requisito está satisfecho.
**Marker Semantics**: `[x]` significa requisito revisado y suficiente; no significa implementación completa ni prueba de aplicación aprobada. Los 40 ítems nuevos se dejan pendientes.

## Integridad de requisitos de experiencia

- [ ] CHK001 ¿Se definen los estados inicial, vacío, error, carga adicional e indisponibilidad para comentarios, usuarios, asignaciones y obras? [Completitud, Spec §FR-012, §FR-015; Contrato frontend §Paginación y estado privado]
- [ ] CHK002 ¿Están especificadas las acciones y diferencias entre crear, responder y editar con el editor compartido, incluida la vista previa? [Completitud, Spec §FR-001, §FR-002; Contrato frontend §Editor y gramática Markdown]
- [ ] CHK003 ¿Se define qué información recibe el sancionado sobre motivo, tipo, vencimiento y acciones que conserva? [Completitud, Spec §FR-008 a §FR-010, §FR-027]
- [ ] CHK004 ¿Se especifican selección de obra, consulta de asignaciones, duplicados y confirmación de revocación sin exigir descargar todo el catálogo? [Completitud, Spec §FR-025; Contrato frontend §Formularios y validación administrativa]
- [ ] CHK005 ¿Se distinguen las previews de los tres medios, el reemplazo individual y la conservación de imágenes existentes? [Completitud, Spec §FR-018 a §FR-021; Modelo §Obra y tres medios]
- [ ] CHK006 ¿Está definido el mensaje de indisponibilidad de guardado de obras mientras falta el tercer campo, preservando los recorridos independientes de consulta y lectura? [Completitud, Spec §Historia 4, escenario 6; Dependencia DEP-004]

## Claridad de interacción y terminología

- [ ] CHK007 ¿Se define cuándo se conserva, descarta o aísla un borrador al cambiar de cuenta, destino o modo de edición, sin atribuirlo a otra identidad? [Claridad, Spec §Edge Cases; Modelo §Comentario y borrador]
- [ ] CHK008 ¿Están descritos el estado independiente de cada spoiler y su reinicio al cambiar fuente, revisión o destino? [Claridad, Spec §FR-003; Contrato frontend §Editor y gramática Markdown]
- [ ] CHK009 ¿Los términos portada, banner de ficha y banner de capítulo evitan confusión con el banner general de plataforma y con páginas del lector? [Claridad, Spec §FR-020, §Edge Cases; Modelo §Obra y tres medios]
- [ ] CHK010 ¿Se distingue de forma inequívoca desconocido de Sin sanción, permiso desconocido de permitido y dato confirmado de fallback visual? [Claridad, Spec §FR-006, §FR-011, §FR-019; Modelo §Identidad y permisos]

## Cobertura de accesibilidad y presentación

- [ ] CHK011 ¿Se especifica la ocultación del texto del spoiler para tecnologías de asistencia y la relación accesible entre control y contenido revelado? [Cobertura, Spec §FR-003, §FR-022; Contrato frontend §Editor y gramática Markdown]
- [ ] CHK012 ¿Están documentados foco inicial, permanencia, retorno al origen y tratamiento de confirmaciones sin diálogos incompatibles? [Cobertura, Spec §FR-022, §FR-030; Contrato frontend §Formularios y validación administrativa]
- [ ] CHK013 ¿Se definen etiquetas, errores asociados, estado de envío y mensajes en español para todos los formularios nuevos? [Completitud, Spec §FR-015, §FR-022; Constitución §VII]
- [ ] CHK014 ¿Los criterios de móvil/escritorio, teclado, foco visible y movimiento reducido son verificables y coherentes con la identidad visual existente? [Medibilidad, Spec §FR-030, §SC-006]

## Integridad de validaciones de datos

- [ ] CHK015 ¿Se documentan fuente no vacía, unidad de cómputo, límite de 10 000 y tratamiento de Unicode sin normalización destructiva? [Claridad, Spec §FR-029; Modelo §Comentario y borrador]
- [ ] CHK016 ¿La sintaxis de spoilers cubre delimitadores vacíos, sin cierre, escapados, código y formato interno sin cambiar el alcance aprobado? [Cobertura, Spec §Edge Cases; Contrato frontend §Editor y gramática Markdown]
- [ ] CHK017 ¿Se especifican motivo obligatorio y límites pendientes de contrato, sin presentar máximos arbitrarios como reglas del servidor? [Completitud, Gap: límite de motivo condicionado a DEP-003; Modelo §Sanción de comentarios]
- [ ] CHK018 ¿Se definen fecha futura, extensión posterior al vencimiento, ausencia de vencimiento permanente y zona horaria visible? [Completitud, Spec §FR-008, §FR-009; Modelo §Sanción de comentarios]
- [ ] CHK019 ¿Están definidos formatos de imagen, límites individuales/acumulados y distinción entre validación previa y comprobación autoritativa del contenido? [Completitud, Spec §FR-021; Constitución §V; Dependencia DEP-004]
- [ ] CHK020 ¿Se documentan identificadores, roles, fechas, estados y continuación válidos en las nuevas fronteras, incluido el resultado cuando una respuesta tiene forma inválida? [Completitud, Spec §FR-014, §FR-015; Contrato frontend §Puertos administrativos locales]

## Consistencia de permisos, datos y reglas

- [ ] CHK021 ¿Los requisitos restringen de forma consistente los cambios de rol a terceros BASIC ↔ EDITOR y excluyen promoción, modificación de ADMIN y cambio propio? [Consistencia, Spec §FR-007; Dependencia DEP-002]
- [ ] CHK022 ¿La protección de ADMIN frente a aplicar, extender o quitar sanciones coincide entre requisitos, escenarios y dependencia contractual? [Consistencia, Spec §FR-008, §FR-009; Dependencia DEP-003]
- [ ] CHK023 ¿Se distingue sanción de comentarios de suspensión de cuenta y de revocación editorial, preservando los permisos no afectados? [Consistencia, Spec §FR-010, §Edge Cases; Modelo §Sanción de comentarios]
- [ ] CHK024 ¿Los requisitos combinan rol vigente y asignación activa sin inferir autorización por visibilidad de la obra o datos locales? [Consistencia, Spec §FR-025; Modelo §Identidad y permisos; Dependencia DEP-007]
- [ ] CHK025 ¿Se define que las tres imágenes obligatorias también aplican a borradores y que un fallback o archivo nuevo inválido no satisface un campo persistido? [Consistencia, Spec §FR-018, §Edge Cases; Modelo §Obra y tres medios]
- [ ] CHK026 ¿Se conservan las diferencias entre progreso local/remoto, voto local/confirmado, cursores y páginas con total sin atribuir garantías inexistentes? [Consistencia, Spec §FR-017, §FR-026; Modelo §Listas y estados de integración]

## Cobertura de errores, recuperación y límites

- [ ] CHK027 ¿Se especifica conservación de fuente y archivos ante rechazo, conflicto y fallo recuperable sin sobrescritura silenciosa? [Cobertura, Spec §Historia 1 escenario 5, §Historia 4 escenario 5; Contrato frontend §Comentarios, conflictos y cargas]
- [ ] CHK028 ¿Se define el alcance de confirmar o cancelar retirada, reemplazo y mutaciones administrativas, incluida la ausencia de cambios al cancelar? [Cobertura, Spec §FR-028; §Historia 2 escenario 16]
- [ ] CHK029 ¿Están documentados cambios de rol/sanción/asignación durante una edición y el rechazo de resultados tardíos de otra cuenta o destino? [Cobertura, Spec §Historia 2 escenarios 14 y 18; Contrato frontend §Comentarios, conflictos y cargas]
- [ ] CHK030 ¿Se contemplan fin de resultados, lote completo sin total, duplicados y fallo de continuación manteniendo los resultados previos? [Cobertura, Spec §FR-005, §FR-017; Contrato frontend §Paginación y estado privado]
- [ ] CHK031 ¿Se especifica cómo tratar vencimiento, reloj de cliente y horas inexistentes o ambiguas sin anunciar permisos restaurados sin confirmación? [Cobertura, Spec §Edge Cases; Modelo §Sanción de comentarios]
- [ ] CHK032 ¿Se distinguen rechazo de sesión, permiso, recurso oculto, respuesta inválida e indisponibilidad conocida sin éxito falso ni reintento de escritura injustificado? [Cobertura, Spec §FR-015; Contrato frontend §Canal de acceso, §Puertos administrativos locales]

## Calidad de criterios de aceptación

- [ ] CHK033 ¿Los criterios cubren obra/capítulo y comentario raíz/respuesta, valores límite y autor no disponible sin tratar respuestas como destino independiente? [Medibilidad, Spec §SC-001; §Historia 1]
- [ ] CHK034 ¿Los criterios separan controles de interfaz, persistencia y autorización del servidor, especialmente con proveedores de prueba? [Medibilidad, Spec §SC-002, §SC-008, §SC-009]
- [ ] CHK035 ¿Se define evidencia de resultado positivo, rechazo y persistencia por recorrido sin convertir fallos pendientes del frontend en dependencias externas? [Medibilidad, Spec §SC-003, §SC-004; Contrato de integración §Matriz de operaciones]
- [ ] CHK036 ¿Se vinculan los requisitos de accesibilidad, medios y regresiones de lectura con resultados observables y medidas explícitas? [Trazabilidad, Spec §SC-005, §SC-006, §SC-010]

## Dependencias, supuestos y lagunas de diseño

- [ ] CHK037 ¿Cada capacidad sin contrato tiene responsable, condición de activación y comportamiento de interfaz definido, sin rutas ni datos autoritativos inventados? [Dependencias, Spec §FR-012, §FR-014; Dependencias DEP-001 a DEP-007]
- [ ] CHK038 ¿Se diferencia la política aprobada de eliminación exclusiva de ADMIN de la autorización aún permitida a EDITOR por el backend actual? [Consistencia, Spec §FR-024; Dependencia DEP-006]
- [ ] CHK039 ¿Los objetivos de rendimiento y volumen diferidos tienen alcance y condiciones de medición en el plan, sin presentarse como resultados ya obtenidos? [Supuestos, Revisión R-14; Plan §Technical Context, §Validación y mediciones]
- [ ] CHK040 ¿Se documenta la trazabilidad administrativa y privacidad de motivos/datos personales sin añadir una bitácora local autoritativa ni pantalla fuera de alcance? [Dependencias, Spec §FR-027; Dependencias DEP-002, DEP-003, DEP-007]

## Notes

- Fuentes: [spec](../spec.md), [plan](../plan.md), [modelo](../data-model.md), [contrato de interfaz](../contracts/frontend-ui.md), [matriz de integración](../contracts/integration-matrix.md), [dependencias](../integration-dependencies.md), [revisión](../clarification-review.md) y [constitución](../../../.specify/memory/constitution.md).
- Este archivo cumple la solicitud previa de UX y validación interrumpida antes de planificación. No se evaluaron ni aprobaron sus ítems al generarlos.
- Los identificadores CHK001–CHK040 son únicos dentro de este checklist. Las referencias por título o requisito remiten a los documentos enlazados.
- Un ítem con Gap identifica una condición de calidad que debe revisar el responsable; no declara por sí solo incumplimiento ni agrega un requisito de producto aprobado.
- `$speckit-implement` lee el estado como puerta de entrada y no debe modificar marcadores. `requirements.md` conserva su ciclo separado de specify/clarify.
- Registrar evaluación y evidencia documental junto a cada ítem cuando el revisor la solicite. La generación del plan no aprueba automáticamente este checklist.

## Ampliación posterior al plan: claridad y recuperación de la experiencia

- [ ] CHK041 ¿Se especifica cómo las acciones de formato conservan selección y posición de escritura al alternar entre fuente y vista previa, sin afectar el acceso por teclado? [Claridad, Spec §FR-001, §FR-022; Contrato frontend §Editor y gramática Markdown]
- [ ] CHK042 ¿Están definidos la prioridad de errores de campo y de formulario y el modo de anunciar errores o cambios de estado sin trasladar el foco de forma inesperada? [Completitud, Gap: resumen y anuncio accesible de errores; Spec §FR-015, §FR-022; Constitución §VII]
- [ ] CHK043 ¿Se distinguen cierre por Escape, cierre exterior y cancelación explícita cuando hay cambios sin guardar o una operación pendiente, precisando qué datos se conservan? [Cobertura, Ambiguity: cierre con cambios sin guardar; Contrato frontend §Formularios y validación administrativa; Spec §FR-028]
- [ ] CHK044 ¿Se define la presentación de sintaxis Markdown fuera del subconjunto permitido para evitar pérdida silenciosa de texto o diferencias entre vista previa y publicación? [Claridad, Gap: presentación de sintaxis no admitida; Spec §FR-002, §FR-004; Contrato frontend §Editor y gramática Markdown]
- [ ] CHK045 ¿Están descritos texto alternativo, estado de error y recuperación ante una imagen persistida o preview que no puede mostrarse, distinguiendo ese fallo de la ausencia del medio obligatorio? [Cobertura, Gap: error de presentación de imagen; Spec §FR-019, §FR-021; Modelo §Obra y tres medios]
- [ ] CHK046 ¿Se precisa qué ocurre con fecha, hora y errores anteriores al alternar una sanción entre temporal y permanente, y qué valores aparecen en la confirmación final? [Claridad, Ambiguity: conservación o limpieza de fecha local; Spec §FR-008, §FR-009; Contrato frontend §Formularios y validación administrativa]

## Ampliación posterior al plan: precisión de validaciones y consistencia de datos

- [ ] CHK047 ¿Se documenta cómo presentar cantidad total de favoritos y pertenencia todavía desconocida de una obra, sin usar el tamaño de una página o colección parcial como respuesta global? [Consistencia, Spec §FR-017, §FR-026; Modelo §Listas y estados de integración; Contrato frontend §Paginación y estado privado]
- [ ] CHK048 ¿Se especifica la relación entre filtros, orden y continuación cuando cambia una consulta, evitando presentar resultados previos como si correspondieran a los filtros nuevos? [Cobertura, Spec §FR-017; Contrato frontend §Paginación y estado privado; Plan §Integración por área, apartado 4]
- [ ] CHK049 ¿Se definen formato, orden, extremos inclusivos y rango máximo permitido de las fechas del calendario, junto con la respuesta de validación para un rango inválido? [Completitud, Gap: límites del rango de calendario; Spec §Historia 3 escenario 2; Matriz de integración §INT047]
- [ ] CHK050 ¿Los requisitos de edición de capítulos y páginas conservan el número decimal como texto y describen límites de precisión, posiciones válidas y reordenamiento sin omisiones ni duplicados? [Consistencia, Gap: detalle de validación editorial; Constitución §III, §V; Matriz de integración §INT014, §INT017, §INT020, §INT021]
- [ ] CHK051 ¿Están explicitados rango, incrementos admitidos y distinción entre valoración cero, ausencia de valoración y estado desconocido en los requisitos del recorrido de valoración? [Claridad, Gap: dominio y estados de valoración; Spec §Historia 3 escenario 2; Matriz de integración §INT037, §INT038; Contrato frontend §Paginación y estado privado]
- [ ] CHK052 ¿Se distingue en los requisitos de edición parcial entre campo omitido, texto vacío, valor nulo y conservación de un valor persistido, sin atribuir reglas al contrato pendiente? [Claridad, Gap: semántica de entradas parciales; Spec §FR-016, §FR-019; Modelo §Obra y tres medios; Dependencia DEP-004]

## Notas de esta ampliación

- Fecha: 2026-10-29. Se anexan CHK041–CHK052 a los 40 ítems iniciales; total actual: 52. El contenido y los marcadores anteriores se conservan íntegros.
- Foco: experiencia de edición, mensajes y recuperación; precisión de fechas, estados desconocidos, medios, valoración y datos editoriales. Profundidad estándar; dirigido al autor y revisor de requisitos antes de implementar.
- Los doce ítems nuevos quedan sin marcar y sin evaluar. Gap y Ambiguity señalan aspectos que el revisor debe contrastar; no cambian por sí solos el spec, el alcance ni las reglas aprobadas.
- Las referencias §INT remiten a filas de la matriz enlazada en Notes; las fuentes restantes son el spec, plan, modelo, contrato de interfaz y constitución previamente enlazados.
