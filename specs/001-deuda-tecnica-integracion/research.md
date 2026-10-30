# Investigación y decisiones

**Fecha**: 2026-10-29. Fuentes locales: `package.json`, `package-lock.json`, `src/lib/api.ts`, `src/lib/zod-resolver.ts`, contextos, servicios y componentes afectados; backend y Obsidian referenciados en [integration-dependencies.md](integration-dependencies.md) y [clarification-review.md](clarification-review.md). Investigación paralela de Markdown y auditoría de consumidores, ambas sin editar código.

## R1 — Reutilizar la aplicación y sus dependencias

- **Decisión**: Conservar React/Router, servicios por dominio, `request`, React Hook Form, Zod y el resolver local, componentes UI, Lucide, Motion y Sonner. No añadir otro cliente HTTP, gestor de estado, librería de formularios, editor visual, tabla ni framework de pruebas.
- **Evidencia**: Lockfile: React/React DOM 19.3.1, Router 7.18.4, TypeScript 6.0.3, Vite 8.3.4, Tailwind 4.3.3, React Hook Form 7.90.0, Zod 4.6.7, Vitest 5.0.5 y Testing Library 16.3.3. Distinguir versiones resueltas de rangos del manifiesto; no cambiar rangos de otras dependencias.
- **Motivo**: Esas piezas ya resuelven composición, entradas, validación y consultas. La deuda exige completar recorridos y políticas, no migrar arquitectura.
- **Alternativas descartadas**: TanStack Query/Table, Redux, un editor WYSIWYG y una biblioteca nueva de fechas o componentes, por alcance y coste innecesarios.

## R2 — Markdown seguro y extensión de spoilers

- **Decisión**: Añadir cuatro dependencias de ejecución: `react-markdown`, `rehype-sanitize`, `micromark-extension-gfm-strikethrough` y `mdast-util-gfm-strikethrough`; mantener editor de texto con barra de acciones propia y vista previa común al comentario publicado. Versiones observadas en manifiestos oficiales: 10.1.0, 6.0.0, 2.1.0 y 2.0.1 respectivamente. En implementación comprobar publicación, compatibilidad y avisos; fijarlas y actualizar lockfile. Esta fase no instala paquetes.
- **Motivo**: No existe parser Markdown entre las librerías actuales. React Markdown produce elementos React; las dos extensiones selectivas aportan tachado; sanitización explícita cumple la constitución. No añadir `rehype-raw` ni inyectar HTML. `remark-gfm` se evaluó y descartó porque no tiene switches públicos para desactivar tablas/tareas/autolinks ajenos al alcance.
- **Diseño**: Extensión local `remarkSpoilers` usando los puntos de extensión micromark/from-markdown. Contenedor inline `spoiler` con hijos Markdown, marcador HAST limitado y renderer React. Permitir saltos blandos, excluir código, respetar escapes y conservar delimitadores vacíos/sin cierre como literales. El esquema de sanitización solo admite etiquetas del subconjunto contratado y el marcador generado por el plugin. Ver [contrato de interfaz](contracts/frontend-ui.md).
- **Tipos**: Declarar dependencias directas de desarrollo para los tipos importados: `@types/mdast`, `@types/hast`, `micromark-util-types`, `mdast-util-from-markdown` y `unified`. Usar importaciones `type`; no depender accidentalmente del hoisting de transitivas. No añadir paquetes utilitarios de recorrido si una función local sobre AST basta.
- **Registro selectivo**: Un plugin local añade `gfmStrikethrough({singleTilde:false})` a `processor.data().micromarkExtensions` y `gfmStrikethroughFromMarkdown()` a `fromMarkdownExtensions`, junto con la extensión local de spoilers. No registrar extensiones de tablas/tareas; los pipes no adquieren precedencia de tabla.
- **Resolver local**: Adoptar el patrón público de resolución de eventos delimitadores de la extensión de tachado para el spoiler, conservando eventos interiores de formato/código. No hacer cirugía de source offsets que falle con entidades/escapes. Arrays y funciones locales evitan añadir utilidades de ejecución; si la implementación importa una utilidad runtime externa, debe justificarla y declararla directamente, nunca aprovecharla como transitive no declarada.
- **Alternativas descartadas**: Regex sobre HTML o texto aislado (rompe formato anidado, escapes y código), MDX (ejecución fuera de alcance), parser propio de Markdown completo, editor pesado y paquete GFM completo sin controles selectivos. Los comentarios son solo texto, sin adjuntos ni subida/pegado/arrastre/carga de imágenes; sintaxis no soportada se convierte a fuente literal escapada antes de renderizar, preservándola igual en preview/publicación y sin solicitudes de imagen.
- **Fuentes primarias**: [React Markdown](https://github.com/remarkjs/react-markdown), [manifiesto](https://github.com/remarkjs/react-markdown/blob/main/package.json), [remark-gfm evaluado](https://github.com/remarkjs/remark-gfm), [registro de extensiones](https://github.com/remarkjs/remark-gfm/blob/main/lib/index.js), [extensión sintáctica de tachado](https://github.com/micromark/micromark-extension-gfm-strikethrough), [extensión mdast de tachado](https://github.com/syntax-tree/mdast-util-gfm-strikethrough), [rehype-sanitize](https://github.com/rehypejs/rehype-sanitize), [micromark](https://github.com/micromark/micromark#extending-markdown), [mdast-util-from-markdown](https://github.com/syntax-tree/mdast-util-from-markdown).

## R3 — Spoiler accesible y modal compartido

- **Decisión**: `Spoiler` oculta sus hijos del árbol accesible hasta revelación, usa botón nativo con `aria-expanded`, etiqueta en español y foco visible. Los enlaces del fragmento revelado son hermanos del botón, nunca controles anidados. Estado por fragmento y revisión/destino, reiniciado al cambiar contenido. No basta `blur` o color.
- **Reutilización**: Extender `components/ui/modal.tsx` para foco inicial, Tab/Shift+Tab, retorno al origen, etiqueta/descripción enlazadas y restauración al desmontar. El modal actual solo cierra por Escape y bloquea scroll; no satisface aún todo el contrato de foco. Usar el modal existente con una sola confirmación activa; no apilar trampas de foco.
- **Motivo**: Comportamiento compartido por roles, sanciones, asignaciones y medios. No requiere biblioteca adicional de diálogos.
- **Fuentes primarias**: [Disclosure W3C](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/), más los requisitos constitucionales VII y FR-022/FR-030.

## R4 — Capacidades pendientes con fallo explícito

- **Decisión**: Definir puertos TypeScript de administración y disponibilidad por operación. El adaptador de producción de usuarios/roles/sanciones/asignaciones responde indisponible sin hacer HTTP hasta tener contratos acordados. Las pruebas inyectan un proveedor falso en los componentes afectados; no se expone una cuenta demo ni se persiste autoridad en navegador. No añadir un proveedor global de estado.
- **Motivo**: DEP-001/002/003/007 no tienen rutas registradas. No se interpreta cualquier 404/403/503 como una capacidad pendiente ni se prueba disponibilidad enviando escrituras. Se distingue indisponibilidad configurada de fallo operativo de una operación implementada.
- **Alternativas descartadas**: Endpoints supuestos, flags públicos que conceden permiso, mocks que se activan automáticamente en producción, y suspensión SUSPENDED para sancionar comentarios.
- **Validación**: Zod valida entradas de los formularios y las nuevas respuestas cuando exista adaptador real. Las pantallas no confían en casts TypeScript; un payload inválido es error de contrato, no lista vacía ni éxito.
- **Activación independiente aprobada**: Separar adaptación y evidencia de listado, roles, sanciones y asignaciones; no esperar contratos ajenos. Una UI sin fuente confirmada para seleccionar sujeto sigue pendiente aunque el adaptador pueda probarse directamente.

## R5 — Paginación y evidencia de consumidor

- **Decisión**: Listados exhaustivos de 20 elementos por página; comentarios y respuestas por lotes de 20 con cursores. Catálogo no tiene total: se ofrece siguiente si el lote está completo, admitiendo una página final vacía con retorno, sin inventar total. Biblioteca/discovery usan total real. Taxonomías/recomendaciones acotadas no reciben paginación ficticia.
- **Hallazgos**: `WorksTab` aumenta límite hasta 100 y después trunca; rankings pide solo 50; `listAllFavorites`, `listChapters` y `getWorkProgress` acumulan páginas. Pasar a consultas por página y controles explícitos donde el usuario debe alcanzar todos los resultados. La home puede conservar muestras rotuladas y enlazar a recorridos exhaustivos; añadir novedades paginadas si no hay consumidor para continuar.
- **Biblioteca**: Separar la página de favoritos de la pertenencia conocida por obra. No reemplazar el conjunto completo por una página y llamar a su longitud total global. La ficha obtiene favorito/valoración/progreso de la consulta de progreso propia. Distinguir desconocido de falso y mantener resultados por cuenta.
- **Alternativas descartadas**: Descargar todos los usuarios/obras, asumir el mismo sobre paginado o incorporar caché global para resolver una deuda de continuación.

## R6 — Autoridad de rol, asignación y revisiones

- **Decisión**: La política de producto es la aclarada: roles BASIC ↔ EDITOR de terceros; ADMIN protegido; sanciones solo BASIC/EDITOR; eliminación de capítulos solo ADMIN. Autorización final en servidor; DEP-006 registra que hoy aún permite eliminar a EDITOR asignado.
- **Hallazgo**: Listar obras con `includeDrafts=true` no equivale a listar solo asignadas: el backend también devuelve publicaciones públicas. No inferir gestión permitida por visibilidad o por el rol. DEP-007 debe proporcionar asignación/capacidad vigente; mientras sea desconocida, deshabilitar acciones editoriales que dependan de probarla y explicar la limitación sin inventar asignaciones. ADMIN conserva sus permisos existentes.
- **Revisiones**: No fabricar `expectedRevision = revision + 1` después de votos, respuestas o reportes. El código actual lo hace en `CommentItem`. Cuando la respuesta no devuelve revisión confirmada, invalidar y releer la página del comentario antes de editar. Congelar revisión al iniciar edición; un 409 conserva borrador y requiere reconciliación explícita. No cambiar una precondición para forzar escritura.
- **Datos ya aislados**: La implementación actual sí usa claves de voto `userId:commentId` y progreso `scope:seriesId`. Conservarlo y probar cambio de cuenta; esas observaciones actualizan el diagnóstico histórico de la constitución, sin enmendar sus reglas.
- **Revalidación aprobada**: GET `/auth/me` al recuperar foco, antes de confirmar operación administrativa sensible y después de 403; deduplicar por sesión, bloquear confirmaciones mientras se consulta y conservar borradores ante fallo recuperable. No reintentar escrituras rechazadas ni asumir campos de sanción no disponibles en la respuesta actual.
- **Cierre aprobado**: Sin cambios se puede cerrar; con cambios ofrecer Descartar cambios/Seguir editando en el mismo diálogo o área inline, sin apilar modales; durante envío impedir cierre hasta conocer resultado. Error conserva datos.

## R7 — Tres medios y transición

- **Decisión**: Modelo de presentación con portada, banner de ficha y banner de capítulo distintos. `coverAsset` e `incapBannerAsset` son los únicos medios actuales. El nuevo nombre de transporte no se inventa: queda en DEP-004. El fallback visual de una obra antigua nunca satisface un campo persistido.
- **Transición**: Preparar tres entradas y previews, conservar archivos existentes y reemplazar solo el elegido. Mientras falte el contrato del tercer campo, impedir guardar obras y mostrar indisponibilidad de esa operación; consulta, lectura y otras operaciones independientes siguen disponibles. No prometer E2E de tres medios sobre dos campos.
- **Motivo**: Requisito explícito de tres imágenes obligatorias incluso en borradores. Validación MIME/tamaño previa acompaña a comprobación de contenido en servidor. No cargar credenciales de Blob ni limpiar almacenamiento desde navegador.

## R8 — Fechas, límites y recuperación

- **Decisión**: Reutilizar `Date`/`Intl` para fecha/hora y mostrar zona IANA de la cuenta administradora, fallback America/La_Paz. Convertir la hora civil seleccionada a instante mediante helper aislado con conversión de ida y vuelta; nunca `new Date(datetimeLocal)` suponiendo que el navegador usa la zona de cuenta. Rechazar horas inexistentes; si hay dos instantes válidos por cambio de hora, pedir elegir el desfase explícito. Sin dependencia de fechas nueva.
- **Validación**: Motivo obligatorio no blanco; su máximo de transporte queda pendiente del contrato, no se copia sin evidencia el límite de reportes. Fuente Markdown se conserva sin normalización destructiva y se cuenta en unidades UTF-16, coherente con JavaScript/Joi y controles actuales; espacios solos no son comentario. No cortar pares sustitutos.
- **Recuperación**: Preservar borrador ante fallos y conflictos; cancelar confirmaciones no muta; 401 central, 403 no cambia identidad, 404 no revela borradores, 429 no dispara reintentos de escritura. Los reintentos de red/5xx solo usan el helper existente en operaciones idempotentes con clave estable.

## Resultado de investigación

Decisiones técnicas cerradas para preparar frontend. Las ausencias de contratos se representan como dependencias externas conocidas, no como supuestos resueltos por inventar rutas. Las ramas exactas y esquemas del servidor se vuelven a contrastar al activar cada adaptador. No se instalaron librerías ni se ejecutaron pruebas E2E en esta fase documental.
