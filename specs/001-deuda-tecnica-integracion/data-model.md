# Modelo de datos del frontend

**Fecha**: 2026-10-29. Derivado de [spec.md](spec.md), FR-001 a FR-030. Este documento define modelos de presentación, entradas y estados; no agrega tablas ni cambia persistencia del backend.

## Identidad y permisos

`User` conserva UUID, username, email privado, role BASIC/EDITOR/ADMIN, timezone IANA y createdAt. El estado de cuenta existente ACTIVE/SUSPENDED/DELETED no se reutiliza para sanciones de comentarios. La lista administrativa no necesita exponer correo: mínimo `id`, `username`, `role` y estado de sanción. Su DTO real queda pendiente de DEP-001.

Política de acciones locales (acompaña autorización en servidor):

| Actor / sujeto | Cambio de rol | Sanción | Asignaciones | Eliminar capítulo |
| --- | --- | --- | --- | --- |
| Visitante o BASIC | No | No | No | No |
| EDITOR | No | No | No | No, incluso con asignación |
| ADMIN sobre BASIC/EDITOR ajeno | Solo BASIC ↔ EDITOR | Crear/quitar/extender temporal | Solo sujeto EDITOR | Sí sobre capítulo autorizado |
| ADMIN sobre sí u otro ADMIN | No | Ninguna mutación | No como destinatario EDITOR | Su rol permite eliminación de capítulos |

Una obra pública visible no prueba asignación editorial. `managementAccess` se representa como `allowed | denied | unknown`, con origen en identidad/asignación confirmadas. `unknown` no se convierte en `allowed` por estar en una lista. El servicio actual carece de dato inequívoco de asignación para frontend; DEP-007 debe cubrirlo.

AuthContext distingue identidad confirmada de revalidating/error. GET `/auth/me` actualiza la identidad al recuperar foco, antes de confirmar una operación administrativa sensible y tras rechazo de permiso; peticiones deduplicadas por sesión y resultados tardíos descartados. Revalidating/error impide confirmar operaciones sensibles sin borrar borradores; 401 invalida sesión y 403 nunca reintenta automáticamente la escritura.

## Comentario y borrador

Se conserva el contrato actual `Comment`: id, author nullable, targetType WORK/CHAPTER, targetId, parentCommentId nullable, rootCommentId, bodyMarkdown nullable, status ACTIVE/DELETED, revision entera no negativa, createdAt, editedAt nullable y contadores de votos. Un nodo eliminado conserva relaciones y descendientes; su cuerpo no se recupera.

`CommentDraft`: `ownerScope` (usuario o guest), `targetType`, `targetId`, `parentCommentId?`, `commentId?`, `baseRevision?`, `source`, `mode` edición/preview y estado `idle | submitting | conflict | error`. Se mantiene en memoria del componente; al cambiar identidad/destino no se reutiliza como borrador de otra cuenta. No añadir persistencia de borradores en localStorage por defecto. Ante fallo dentro del mismo contexto conservar fuente; un resultado tardío de otro contexto no altera el actual.

Validación común: fuente de tipo string, al menos un carácter no blanco, máximo 10 000 unidades UTF-16 incluyendo delimitadores. No normalizar Unicode ni borrar espacios relevantes del código. El contador usa la misma medida que Joi/JavaScript; el servidor sigue validando. Crear raíz exige destino; responder exige padre, sin inventar o cambiar el destino heredado. Editar conserva `baseRevision` tomada al abrir, no una revisión calculada después de otras mutaciones.

El comentario contiene solo fuente textual: no File, adjunto ni referencia de imagen. No subir ni cargar imágenes por pegado, arrastre, sintaxis o URL; pegar texto es válido. La sintaxis no soportada se conserva en source y se representa como literal escapado idéntico en preview/publicación, sin solicitudes de imagen ni eliminación silenciosa.

Borrador de formulario: dirty compara datos locales con el estado inicial, incluido archivo seleccionado solo en formularios de obra. Sin dirty se puede cerrar; con dirty se solicita descartar o seguir editando en el mismo diálogo; pending impide cierre y error conserva datos. Cancelar edición inline aplica la misma elección en su propia área, sin modal apilado.

`CursorPage<Comment>` conserva items, hasMore y nextCursor `{createdAt,id}` o null. La clave de carga incluye identidad, destino, padre y orden admitido. Se fusiona por ID, manteniendo orden recibido y reemplazando revisión confirmada; no se ordena por índice de página ni se fabrican cursores.

## Spoiler

Nodo AST inline `spoiler` con hijos Markdown, rango de fuente y marcador interno limitado. La identidad visual combina comentario/destino, contenido o revisión y rango; `revealed` solo existe en la instancia de vista. Recargar o cambiar fuente lo reinicia. El texto oculto no está en el árbol accesible; el origen sigue siendo texto público recibido, no un secreto cifrado. La sintaxis detallada está en [frontend-ui.md](contracts/frontend-ui.md).

## Sanción de comentarios — modelo local, no DTO prometido

Consulta discriminada:

- `unknown`: no hay estado confirmado o capacidad de consulta.
- `none`: el servidor confirma ausencia de sanción activa.
- `active-temporary`: motivo, endsAt como instante ISO con zona/desfase explícito, identificador/revisión si el contrato los proporciona.
- `active-permanent`: motivo, sin endsAt.
- `expired` o `revoked`: estado histórico confirmado; no equivale a autorizar acciones si rol/sesión cambiaron.

Entrada local `SanctionInput`: sujeto UUID, motivo no blanco, tipo temporary/permanent; endsAt obligatorio solo para temporary y posterior al instante actual; extender exige endsAt posterior al anterior y al actual. No atribuir un límite de motivo al backend hasta acordarlo: DEP-003 debe fijar longitud y formato; el adaptador real no se activa sin esa regla. Los formularios preparados muestran obligación y validan no blanco; los límites definitivos provienen del contrato aprobado.

Transiciones: none/expired/revoked → active-temporary o active-permanent; active-temporary → active-temporary con vencimiento mayor o revoked; active-permanent → revoked. No añadir conversión directa temporal→permanente ni acortar una activa: quitar y crear otra con confirmación. Releer estado al vencer; el reloj del cliente no demuestra expiración autoritativa.

Solo sujetos BASIC/EDITOR admiten esas mutaciones. Si un cambio externo convierte al sujeto en ADMIN durante la confirmación, se rechaza y se reconsulta; un historial de sanción en ADMIN es solo lectura. Las restricciones impiden crear/responder/editar comentarios propios; no afectan login, lectura, votos, reportes, eliminación propia autorizada ni publicación editorial. No cambiar `User.status` ni revocar obras como efecto implícito.

Fecha de formulario: civil date + time + zona IANA visible, convertidas a instante. Hora inexistente se rechaza; hora ambigua requiere seleccionar desfase. `Intl` permite formatear y validar la ida/vuelta de la conversión; no se usa la zona implícita del navegador como la zona de cuenta.

## Asignación editorial — modelo local pendiente de transporte

Relación `WorkEditorAssignment`: workId, editorId, assignedAt, revokedAt nullable; actor y dato de revisión según contrato acordado. Solo ADMIN gestiona; solo EDITOR es destinatario. Un par vigente no se duplica. Revocar conserva historial y no retira contenido. Rol actual EDITOR y asignación vigente son condiciones conjuntas de autorización; pasar a EDITOR no crea ni reactiva asignaciones revocadas.

El backend decidirá cómo expresa concurrencia y registros históricos en su DTO. El frontend no asume que un descenso de rol borra relaciones ni que una promoción posterior reactiva una relación revocada. Ante cambio de rol refrescar capacidades; cualquier regla adicional de reactivación debe constar en DEP-007 antes de habilitar el adaptador.

## Obra y tres medios

Mantener `Series` y sus campos; añadir `detailBannerUrl` y `chapterBannerUrl` con información de medio persistido independiente. Puede conservarse `bannerUrl` como alias de presentación durante una transición acotada de consumidores, pero nunca como prueba de que hay un banner de ficha persistido.

Modelo local de cada slot: `persisted: {id,url} | null`, `selected: File | null`, `previewUrl: string | null`, `error?: string`. Slots cover, detailBanner y chapterBanner. Un slot es válido para guardar cuando tiene archivo nuevo válido o referencia persistida propia; una URL fallback visual no basta. Una selección nueva inválida bloquea aunque exista archivo anterior. Quitar selección revierte al persistido; no vacía un obligatorio.

DTO actual: `coverAsset` → cover; `incapBannerAsset` → chapterBanner. detailBanner queda null hasta contrato DEP-004, no se copia incap como si fuese persistido en ambos. `cover`/`inpagecover` conservan sus nombres remotos actuales; no se elige aún nombre de transporte del tercer campo.

JPEG/PNG/WebP; hasta 10 MiB por archivo y 100 MiB por solicitud. Validación local no prueba contenido binario; servidor verifica firma/contenido. Los tres campos se requieren incluso para DRAFT. Revocar object URLs al cambiar archivos/cerrar formulario. Banner de capítulo no es una página: no cambia número de página, orden, estadísticas ni progreso.

Obra mantiene expectedUpdatedAt; capítulo expectedVersion; comentario expectedRevision. No hay precondición de revisión en el DELETE actual de comentarios: no añadir un campo que su ruta no admite. Un conflicto preserva datos locales y exige reconciliación; las revisiones confirmadas sustituyen las previas.

## Listas y estados de integración

Límites del contrato vigente: score de valoración entre 0 y 5 inclusive y múltiplo de 0,5; ausencia de valoración distinta de score 0 y de unknown. Rango de calendario con fechas `YYYY-MM-DD`, from ≤ to y 366 días inclusivos como máximo en zona de cuenta. Chapter.number es string decimal no negativo, hasta nueve enteros y tres decimales, sin redondeo ni conversión destructiva. Recontrastar estos valores con servidor en T003 antes de implementar sus validaciones.

No unificar contratos incompatibles:

- Catálogo: array por page/limit, sin total. Lote completo permite solicitar el siguiente; lote corto indica fin observado, sin garantía de snapshot entre escrituras.
- Comunidad: items/hasMore/nextCursor, sin números de página ficticios.
- Biblioteca/discovery: items/total/page/limit, usando total autoritativo.
- Administración futura: puerto local con `items` y continuación discriminada; el adaptador convierte el contrato aprobado, no se obliga al backend a devolver un total.

`Availability`: available o unavailable con referencia DEP. La disponibilidad técnica no concede permisos. Estado de consulta: loading, success, empty, error, unavailable; mutación: idle, pending, success, rejected/conflict/error. Un error de formato de respuesta no produce success/empty. Claves de peticiones y mutaciones incluyen usuario/destino; al cambiar sesión se descartan resultados tardíos y se evita mezclar estado.

## Registro y evidencia

Cada operación tiene ID de integración, método/ruta existente o dependencia sin URL, consumidor, permiso, paginación y evidencia positiva/negativa/recarga. La evidencia es metadato de revisión, no analítica con credenciales o correos. Trazabilidad autoritativa de roles/asignaciones/sanciones corresponde al servidor; no se agrega una bitácora local que pretenda reemplazarla.
