# Contratos de interfaz y adaptación

**Estado**: Diseño de frontend; los nombres locales no son endpoints ni DTO nuevos del backend. Los contratos existentes se conservan según la [matriz](integration-matrix.md); capacidades pendientes según [integration-dependencies.md](../integration-dependencies.md).

## Canal de acceso

Pantallas → hooks o servicios del dominio → `src/lib/api.ts` → backend. `request` conserva Bearer, FormData sin Content-Type manual, query, abort, error central y 204. No duplicar fetch en componentes. Decodificar en servicios con Zod las nuevas fronteras de administración y medios cuando haya contrato; reutilizar el resolver Zod local en formularios.

Identidad: reutilizar GET `/auth/me` y AuthContext para una revalidación deduplicada al recuperar foco, antes de confirmar operaciones administrativas sensibles y después de un 403 protegido. No aplica al login rechazado. Capturar la identidad que inició la solicitud y descartar respuestas de otra sesión; un resultado obtenido antes de una nueva confirmación no evita la comprobación de esa confirmación. Mientras se revalida, deshabilitar confirmaciones sensibles. Si cambia el rol, actualizar acciones y comprobar de nuevo actor/destinatario; si falla por red/5xx, conservar borradores y permitir reintentar la consulta. Un 401 conserva la invalidación central. Nunca reintentar automáticamente la escritura que recibió 403; el servidor conserva autorización final y la consulta de restricciones de sanción sigue dependiendo de su contrato propio.

Límites existentes, contrastados con `../ModoFriki-Backend/docs/API.md` y sujetos a T003: valoración numérica de 0 a 5 en pasos de 0,5 (0 es válido; ausencia significa retirada y unknown falta de consulta); calendario `YYYY-MM-DD` con inicio no posterior al fin y máximo 366 días inclusivos en la zona de la cuenta; número de capítulo decimal no negativo con hasta nueve enteros y tres decimales, conservado como string sin redondeo. Definir mensajes asociados para cada rechazo y no confundir cero con valor ausente.

## Puertos administrativos locales

`UserAdminGateway` expone disponibilidad por operación y métodos locales: listar usuarios, cambiar rol de tercero BASIC/EDITOR, consultar/aplicar/extender/quitar sanción, consultar/asignar/revocar obras y consultar restricciones propias. Los argumentos usan UUID y modelos de [data-model.md](../data-model.md). El puerto de listado acepta tamaño deseado y continuación opaca propia del adaptador; no construye URLs ni mezcla un cursor comunitario con uno administrativo.

- Producción inicial: operaciones de DEP-001/002/003/007 indisponibles; devolver error tipado `CapabilityUnavailable` antes de HTTP. Sin lista demo, sin llamadas a rutas imaginadas, sin persistir roles/sanciones/asignaciones en localStorage.
- Pruebas: proveedor falso inyectado por props al límite de Usuarios y a sus formularios/estado de restricciones; sin un nuevo contexto global ni botón que active el proveedor en producción. Datos y errores de prueba viven en archivos de test.
- Al acordar contrato: implementar adaptador sobre `request`, validar UUID/enums/fechas/continuación y la respuesta antes de actualizar UI; habilitar solo operaciones implementadas. No habilitar por una variable pública que se interprete como permiso.
- Errores distintos: indisponibilidad conocida, red, sesión, permiso, conflicto, validación y respuesta inválida. Un 404 de una llamada real no se traduce automáticamente a capacidad inexistente.
- Concurrencia: las revisiones o precondiciones de estos métodos quedan condicionadas al contrato confirmado. No mandar un supuesto expectedRevision o timestamp a rutas aún no acordadas. La preparación simula conflicto en pruebas, no afirma que el servidor ya lo aplica.

Políticas del puerto: actor ADMIN; cambiar rol solo de otros BASIC/EDITOR a BASIC/EDITOR; ninguna mutación de sanciones sobre ADMIN; asignar/revocar solo destinatarios EDITOR; lectura del estado no concede escritura. Las validaciones de interfaz repiten política por usabilidad y nunca sustituyen al servidor. DEP-007 incluye dato inequívoco de asignación/capacidad para gestión de obras por EDITOR, que el listado actual no aporta.

## Editor y gramática Markdown

`CommentEditor` recibe fuente controlada, modo create/reply/edit, límite compartido, pending, restricción conocida y error. Emite cambio de fuente y confirmación; no guarda ni conoce HTTP. Barra: negrita, cursiva, tachado, enlace, cita, lista, código y spoiler. Operar sobre selección conservando caret/foco; el texto fuente sigue editable por teclado. Vista previa y comentario publicado usan `CommentMarkdown` con configuración idéntica.

Subconjunto: párrafos, saltos blandos, énfasis, fuerte, tachado `~~`, enlaces, citas, listas ordenadas/no ordenadas y código inline/fenced. No HTML arbitrario, imágenes, embeds, tablas, tareas interactivas ni notas al pie. Registrar solo extensiones selectivas de tachado (`micromark-extension-gfm-strikethrough` y `mdast-util-gfm-strikethrough`) y el plugin local de spoilers; no usar remark-gfm completo. Excluir imágenes del esquema/renderer sin solicitudes automáticas. Fuente con solo sintaxis que todavía contiene caracteres no blancos se trata conforme al contrato actual, sin inventar una validación de contenido visible que el servidor no exige.

Comentarios solo de texto: no incluir selector de archivos, subida de imágenes, aceptación de archivos pegados/arrastrados, previews de adjuntos ni detección de URL para cargar una imagen. Pegar texto sigue permitido. Una URL de imagen escrita sigue siendo texto o enlace explícito, sin descarga hasta una navegación voluntaria del lector. Si se escribe `![texto](url)` o HTML de imagen como texto, conservar y mostrar su fuente literal escapada sin crear imagen, interpretar HTML ni eliminarla silenciosamente. Aplicar la misma conversión a literal seguro a cualquier constructo fuera del subconjunto soportado, preservando la fuente original; no agregar funcionalidad de imágenes al editor. Las tres imágenes de obra pertenecen a otro flujo y no cambian este límite.

Spoiler: delimitador no escapado `||`, apertura/cierre dentro del mismo bloque inline; puede contener énfasis, enlaces y saltos blandos. No cruza párrafos, ítems de lista ni bloques; delimitadores literales en inlineCode/code. Sin anidamiento: el siguiente cierre válido termina el fragmento. `||||`, vacío y delimitadores sin pareja permanecen literales; un delimitador precedido por escape válido es literal. Casos con límites de énfasis/enlace incompatibles no deben crear estructura inválida: conservar como texto los delimitadores que no forman un contenedor válido. Definir estas reglas mediante fixtures de AST antes de conectar el renderer; no introducir búsqueda/reemplazo sobre HTML.

Canalización: micromark/from-markdown plugin local → mdast spoiler con hijos → HAST span marcador → esquema rehype-sanitize acotado → componente React Spoiler. El marcador solo se produce por el plugin y HTML del usuario no se interpreta. El esquema solo conserva propiedades necesarias; no admite estilos, manejadores, IDs arbitrarios ni clases aportadas por usuarios.

Enlaces: permitir `https:`, `http:` y rutas relativas internas validadas, bloquear `javascript:`, `data:`, esquemas desconocidos y URLs relativas a protocolo `//`. Conservar transformación segura de URL y aplicar política restrictiva, no una función permisiva. Enlaces externos con nueva pestaña requieren rel seguro. No convertir imágenes Markdown en descargas automáticas.

`Spoiler` usa un botón con nombre Revelar spoiler y estado expandido; texto oculto fuera del árbol accesible. Al revelar, botón y contenido son hermanos: ningún enlace interactivo dentro del botón. Varios fragmentos tienen estados separados. El estado se reinicia al cambiar fuente/comentario/destino y no se almacena como preferencia del usuario.

## Comentarios, conflictos y cargas

Toda solicitud de raíz/respuestas se acota por cuenta y destino; bloquear doble envío también de forma síncrona mientras se actualiza React. Carga adicional captura identidad/destino, ignora resoluciones obsoletas y deduplica por ID. Error adicional conserva páginas previas y ofrece reintento. Editar conserva fuente/baseRevision; 409 ofrece reconsulta y comparación manteniendo borrador. Releer mediante los listados existentes; no existe GET individual de comentario.

Votar/responder/reportar puede cambiar la revisión sin devolver una nueva revisión utilizable: invalidar la página correspondiente y releer antes de habilitar una edición con precondición. Los contadores optimistas se revierten o reconcilian al error; no incrementar revisiones localmente para usarlas como autoridad.

## Formularios y validación administrativa

Reutilizar React Hook Form + Zod + `zod-resolver.ts`; mantener errores asociados mediante id/aria-describedby, pending, confirmación y errores de servicio. `Field` necesita enlazar input, hint y error sin perder etiquetas. No instalar `@hookform/resolvers` para repetir funcionalidad existente.

Sanción: selector temporal/permanente, motivo requerido y fecha/hora solo en temporal; zona de cuenta visible. Permanente no envía vencimiento; extender exige vencimiento mayor al actual. Rechazar fechas inexistentes por zona y resolver ambigüedad mediante desfase visible. Al elegir permanente, limpiar fecha/hora/vencimiento y sus errores; al volver a temporal, exigir una fecha válida nueva, sin enviar campos incompatibles. La confirmación muestra tipo, destinatario e instante final cuando corresponda. Los máximos de motivo y esquemas remotos son condición de activación DEP-003, no valores inventados por este diseño.

Asignaciones: tabla/lista de obras vigentes por editor, selector de obra con búsqueda y continuación, confirmación de asignar/revocar. Sin descargar usuarios/catálogo completo para un select. No ofrecer destinatarios BASIC/ADMIN ni duplicados vigentes. Tras mutación invalidar consulta pertinente y capacidades; error conserva estado confirmado, no muestra éxito local.

Modal compartido: foco inicial útil, confinamiento Tab/Shift+Tab, retorno al origen y descripción accesible. Sin cambios locales, Escape, cierre exterior y Cancelar cierran. Con cambios locales, esas tres acciones sustituyen el contenido del mismo diálogo por «Descartar cambios» y «Seguir editando», sin otro modal; la segunda opción, incluido Escape en esa confirmación, vuelve al formulario con datos y foco conservados, y solo la primera descarta/cierra. Durante un envío, bloquear las tres formas de cierre y nuevas mutaciones hasta conocer el resultado; un fallo devuelve el formulario sin pérdida de datos, un éxito permite su cierre normal. En editores inline sin modal, Cancelar con cambios presenta la misma elección en el área del editor, sin diálogo apilado. Formato español y estilo mediante tokens actuales.

## Tres imágenes y lector

`WorkForm` gestiona slots independientes. Mostrar preview persistida y preview de selección; cancelar selección conserva la anterior. Validar tres medios incluso en borrador, tipo/tamaño local y suma de archivos. Selección inválida no se ignora. Confirmación de guardado identifica reemplazos; no purga Blob. El método de servicio rechaza guardar tres medios si DEP-004 no está disponible; nunca mapea dos slots al mismo campo remoto como simulación.

Detalle usa banner de ficha; lector obtiene el banner de capítulo de la obra y lo presenta antes de páginas, fuera de conteo y progreso, en ambos modos. Para contenido antiguo se permite fallback de presentación rotulado internamente como derivado; no satisface validación de persistencia.

## Paginación y estado privado

Tamaño de UI inicial 20, máximo de solicitud 100 donde lo permite el servicio. Conservar orden/filtros; cada cambio reinicia continuación y diferencia carga adicional de inicial. No aplicar `usePagination` local con un total inventado a cursores o usuarios de contrato pendiente. Registrar los datos anteriores de la misma cuenta y filtro; nunca mostrarlos como actuales después de cambiar identidad.

Favoritos: página y total reales separados de un mapa parcial de pertenencia conocida. `unknown` no significa false; usar progreso de obra para confirmar favorito y valoración. Una mutación actualiza/invalida el mapa de la cuenta actual y la página pertinente. Progreso local existente y votos ya incluyen usuario: conservar claves y fallback invitado, sin migrar datos antiguos al usuario que inicia sesión por accidente.

## Criterios de activación

Cada adaptador nuevo exige contrato publicado, política acordada, validación de payload y evidencia positiva/negativa real. La UI preparada se puede demostrar con tests aislados aun estando indisponible en uso normal. La matriz registra estos dos resultados por separado. Cambiar estilos o pasar build no acredita permisos, persistencia ni E2E.

Listado de usuarios, roles, sanciones y asignaciones tienen activación y evidencia independientes. Un contrato publicado puede adaptarse y verificarse aunque falten otros; si una mutación necesita seleccionar un sujeto, la UI necesita además una fuente de identidad confirmada, que puede inyectarse en tests y no se inventa en producción. La falta de ese consumidor no invalida una prueba directa del adaptador, pero el recorrido completo sigue pendiente. El cierre E2E de toda la feature exige finalmente todas las capacidades requeridas.
