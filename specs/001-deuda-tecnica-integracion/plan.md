# Implementation Plan: Comunidad, administración e integración completa del frontend

**Branch**: `dev` (rama Git actual) | **Feature**: `001-deuda-tecnica-integracion` | **Date**: 2026-10-29 | **Spec**: [spec.md](spec.md)

**Input**: Especificación aclarada y petición de reutilizar las librerías actuales, incorporando nuevas solo cuando sean necesarias. `setup-plan` identifica la feature como 001-deuda-tecnica-integracion; no se creó ni cambió la rama Git.

## Summary

Extender la aplicación existente para comentarios Markdown con spoilers, Usuarios con roles/sanciones/asignaciones y tres medios independientes de obra. Completar los recorridos existentes, especialmente paginación, estados y recuperación, conservando lector y datos privados por cuenta. La implementación se divide entre capacidades realmente disponibles y preparación aislada de dependencias del backend; no se desarrolla backend en esta feature.

Se conservan React, Router, Hook Form, Zod, el cliente HTTP y UI compartida. Las cuatro nuevas dependencias de ejecución previstas son react-markdown, rehype-sanitize, micromark-extension-gfm-strikethrough y mdast-util-gfm-strikethrough para interpretar de forma segura solo el formato aprobado; la extensión de spoilers será local. Los tipos de AST usados se declaran como dependencias directas de desarrollo. Instalación y actualización de lockfile pertenecen a la implementación, después de comprobar compatibilidad; este plan no modifica paquetes.

## Technical Context

**Language/Version**: TypeScript 6.0.3 estricto, ESM, React/React DOM 19.3.1 resueltos en lockfile; target ES2023.

**Primary Dependencies**: Vite 8.3.4, Router 7.18.4, Tailwind 4.3.3, React Hook Form 7.90.0, Zod 4.6.7; Lucide, Motion y Sonner existentes. Nuevas propuestas: react-markdown 10.1.0, rehype-sanitize 6.0.0, micromark-extension-gfm-strikethrough 2.1.0 y mdast-util-gfm-strikethrough 2.0.1, sujetas a comprobación de compatibilidad/publicación al instalar. Tipos AST detallados en research.md.

**Storage**: Backend remoto como autoridad de identidad, catálogo, comunidad y biblioteca; referencias de medios externas. LocalStorage solo conserva token y ayudas existentes del dispositivo con aislamiento por cuenta. Sin nuevas bases, migraciones, secretos ni credenciales de Blob en frontend.

**Testing**: Vitest 5.0.5, Testing Library 16.3.3 y jsdom existentes; fixtures de AST y servicios, componentes con proveedor falso inyectado y escenarios reales guiados. No añadir Playwright/MSW ni otro framework para esta fase. Una prueba simulada no acredita E2E.

**Target Platform**: SPA en navegadores modernos de escritorio y móvil, anchos de referencia 360/1280 px, teclado y tecnologías de asistencia. Entorno local Vite y backend configurable mediante VITE_API_URL.

**Project Type**: Frontend web existente; backend separado de solo consulta para contratos.

**Performance Goals**: Objetivos de ingeniería, aún no medidos: p95 de transformación+preview Markdown ≤100 ms tras pausa de entrada de 150 ms para fuentes de 10 000 unidades UTF-16 en Chromium estable de escritorio con throttling CPU 4x; entrada de texto no bloqueada por esperar preview. Medir build de producción, registrar versión de navegador/equipo, 5 calentamientos y 30 muestras. No atribuir este umbral al tiempo de red. Sin promesa de latencia de servidor o usuarios concurrentes no medidos.

**Constraints**: Comentarios ≤10 000 unidades UTF-16; imágenes JPEG/PNG/WebP ≤10 MiB individual y 100 MiB por solicitud; 100 páginas de archivo por solicitud y 1000 por capítulo. Paginación de UI 20, solicitudes ≤100 donde lo permite contrato; cursores originales de comunidad. Ninguna ruta, total, asignación o estado de cuenta inventados.

**Scale/Scope**: 4 historias, 30 requisitos y 10 criterios de éxito; todos los métodos/rutas de producto registrados se desglosan en la matriz. Volumen de verificación: 121 obras, 41 raíces y 41 respuestas en un hilo, 41 favoritos e historial >40; capítulo de 101 páginas y validaciones de límites 100/1000 en fixtures. Son datos de prueba controlados, no estimaciones de tráfico ni autorización para generar contenido en producción.

## Constitution Check

*Puerta previa a investigación y revisión posterior al diseño.*

| Principio | Evaluación previa | Resolución posterior al diseño |
| --- | --- | --- |
| I — Valor y alcance | Pasa: actores y aceptación definidos | Pasa: sin pagos, autores ni monetización añadidos |
| II — Evolución incremental | Pasa: aplicación y dependencias inspeccionadas | Pasa: servicios/hook/UI actuales, sin migración de arquitectura; parser nuevo justificado |
| III — Contratos | Pasa condicionado a mantener bloqueos explícitos | Pasa para preparación: puertos locales, adaptadores pendientes sin HTTP inventado; activación real requiere contratos DEP-001/002/003/004/007 |
| IV — Identidad y permisos | Discrepancia de eliminación resuelta por usuario | Pasa para diseño: política de ADMIN exclusivo explícita; servidor actual pendiente DEP-006; visibilidad no prueba asignación |
| V — Medios y conflictos | Cambio explícito de tres imágenes obligatorio autorizado | Pasa para diseño: guardado bloqueado hasta DEP-004, precondiciones conservadas, confirmación de reemplazo; sin purga física |
| VI — Lectura y actividad | Pasa: separar remoto/local | Pasa: banner fuera de páginas, claves por cuenta, eventos idempotentes conservados |
| VII — Diseño y acceso | Pasa: tokens y componentes reutilizados | Pasa: mejorar modal compartido y etiquetas; teclado, foco y movimiento reducido medibles |
| VIII — Comunidad y privacidad | Pasa: sanitización obligatoria | Pasa: parser AST, HTML deshabilitado, enlaces restringidos, sin nueva autoridad local |
| IX — Evidencia | Pasa: comprobaciones proporcionales definidas | Pasa: capas unitarias/UI/real separadas, evidencia por operación sin declarar pruebas aún no ejecutadas |

No hay violación constitucional que requiera excepción. Una dependencia pendiente es un bloqueo de activación de su capacidad real, no permiso para implementar un contrato incompatible. La constitución no se modifica. El checklist personalizado UX/datos es propiedad del revisor y no se marca aprobado por generar el plan.

## Project Structure

### Documentation (this feature)

```text
specs/001-deuda-tecnica-integracion/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── integration-dependencies.md
├── clarification-review.md
├── contracts/
│   ├── frontend-ui.md
│   └── integration-matrix.md
└── checklists/
    ├── requirements.md
    └── ux-datos.md
```

`tasks.md` será generado por `$speckit-tasks`; no se crea en esta fase.

### Source Code (repository root)

```text
src/
├── pages/                 # AdminPage y RankingsPage actuales; LatestChaptersPage propuesta
├── components/
│   ├── detail/            # CommentSection/CommentItem; CommentEditor/CommentMarkdown/Spoiler nuevos
│   ├── admin/             # WorkForm/ChaptersPanel/PagesManager; UsersTab y formularios nuevos
│   ├── reader/            # ReaderView: banner separado de páginas
│   ├── profile/           # ProfileView: rango de calendario y continuación
│   └── ui/                # modal, confirm-dialog, campos y estados existentes
├── hooks/                 # useAsync y hooks de dominio, conservados y extendidos
├── context/               # AuthContext y LibraryContext existentes
├── services/              # dominios existentes; user-admin.ts como puerto nuevo acotado
├── lib/                   # api/storage existentes; markdown y fechas como helpers acotados
├── types/                 # contratos de presentación y administración
└── test/                  # setup existente; fixtures/proveedores solo de prueba
```

**Structure Decision**: Mantener las carpetas vigentes. Archivos nuevos solo para renderer/editor compartidos, plugin spoiler, políticas/puerto administrativo y pruebas de comportamiento. No reorganizar por features ni crear una capa de repositorios en navegador.

## Integración por área

### 1. Comunidad y Markdown

Extraer editor controlado único para crear, responder y editar; conservar fuente y baseRevision. Renderer común para preview/publicado con canalización de research.md y gramática de contracts/frontend-ui.md. Deduplicar raíces/respuestas sin romper cursores ni descendientes eliminados. Claves y peticiones adicionales se acotan por usuario, obra/capítulo y padre; una respuesta tardía no actualiza otro contexto.

Los comentarios admiten solo texto: no hay subida, pegado ni arrastre de archivos/imágenes ni carga automática de medios por URL. La sintaxis no soportada escrita como fuente, incluida una imagen Markdown o HTML, se conserva como literal escapado idéntico en preview/publicación, sin eliminar texto ni crear una imagen. Pegar texto y escribir enlaces explícitos siguen permitidos. Las tres imágenes de obra son otro flujo.

Corregir incrementos locales de revisión en votos/respuestas/reportes: recuperar revisión autoritativa mediante listados existentes antes de editar. No inventar GET individual de comentario. Diferenciar conflicto, validación y falta de permiso; conservar texto frente a fallo y ofrecer reconciliación. Aplicar restricción de sanción cuando el estado autoritativo esté disponible; mientras DEP-003 falte, no afirmar su aplicación real ni bloquear todo comentario existente por un estado desconocido.

### 2. Administración preparada y permisos

Añadir pestaña Usuarios exclusiva ADMIN; tabla por páginas, cambio de rol BASIC ↔ EDITOR de terceros, sanción temporal/permanente y gestión de obras del EDITOR. ADMIN es consulta, no destino de rol ni de mutación de sanción. Usar Hook Form/Zod y modal/confirmación compartidos. La capacidad técnica disponible y el permiso del actor son condiciones distintas.

Implementar puerto local inyectable con adaptador normal indisponible por operación mientras falte contrato; ningún endpoint ni ejemplo demo en uso normal. Proveedor falso únicamente en tests para construir y demostrar recorridos. Al activar adaptador real, validar DTO y reflejar resultados confirmados, actualizar consultas y comprobar rol/estado/asignación vigentes frente a concurrencia.

Cada capacidad administrativa tiene pareja independiente de adaptación y verificación real: listado, roles, sanciones y asignaciones. La ausencia de un contrato no bloquea los otros; el consumidor UI necesita una identidad/obra confirmada antes de mutar, sin inventar datos para completar el recorrido. Compartir un archivo requiere serializar ediciones, no agrupar disponibilidad de servicios.

Reutilizar AuthContext y GET `/auth/me` al recuperar foco, antes de confirmar operaciones administrativas sensibles y tras un 403 protegido. Deduplicar por sesión, descartar respuestas de otra identidad, deshabilitar confirmación mientras se revalida y conservar borradores si falla la consulta. El rol recibido actualiza acciones; 401 mantiene invalidación central y la escritura rechazada nunca se reintenta automáticamente. Los estados de sanción siguen su contrato propio, no se inventan en `/auth/me`.

Restringir eliminar capítulo a ADMIN tanto en botón como handler de frontend. DEP-006 conserva la corrección del servidor como requisito externo. Para EDITOR no derivar permiso de aparecer en catálogo: el listado actual contiene también obras públicas. Consultar asignación/capacidad solo con contrato DEP-007; mantener gestión desconocida deshabilitada hasta poder confirmarla. No fabricar filtros del servidor.

### 3. Obras e imágenes

Separar slots portada/banner ficha/banner capítulo. Remapear el DTO actual para que incap sea banner de capítulo, sin duplicarlo como medio persistido de ficha. Mantener fallback visual de contenido antiguo separado de validación. Validar tres slots incluso DRAFT; mostrar previews, conservar sin resubir y confirmar cada reemplazo al guardar. El nuevo campo multipart depende de DEP-004 y no se elige por conjetura.

Bloquear únicamente guardado de obra que requiere el contrato de tres imágenes hasta que exista; explicar indisponibilidad y conservar consulta/lectura. Banner de capítulo al inicio del lector sin cambiar numeración, página exacta o evento de lectura. Las subidas siguen servicios/admin.ts y precondiciones, sin limpiar Blob desde frontend.

### 4. Recorridos existentes y listas

La matriz documenta todos los métodos, consumidores y faltantes. Corregir paginación real de WorksTab y Rankings, evitar recargar todo el catálogo al pedir el siguiente lote y completar novedades paginadas con enlace desde inicio. Conservar las muestras acotadas de home explícitas. Perfil incorpora selección de rango válido de calendario e historial con recuperación incremental.

Exponer primitivas paginadas en servicios de biblioteca/capítulos/progreso donde el contrato permite continuación. Conservar agregación acotada solo si un recorrido la necesita de verdad (p. ej. navegación de capítulos), con avance incremental, protección de error y sin truncado. El mapa parcial de favoritos no equivale a la biblioteca completa: usar total real y estado de pertenencia conocido/unknown por obra, con progreso propio como consulta autoritativa. No cambiar preferencias ni estado local aislado ya funcional.

Validaciones explícitas del contrato existente: valoración 0–5 inclusive con pasos de 0,5 (0 distinto de ausencia y unknown); calendario con fechas YYYY-MM-DD, inicio ≤ fin y máximo 366 días inclusivos en zona de cuenta; capítulo decimal no negativo de hasta nueve enteros y tres decimales, conservado como string sin redondeo. T003 vuelve a contrastarlas antes de implementar; no son límites de los contratos administrativos pendientes.

### 5. Accesibilidad y validación compartidas

Mejorar modal existente (foco inicial, confinamiento, retorno, IDs/descripción) y Field (etiqueta/errores asociados), sin añadir kit UI. Un único diálogo activo por acción. Teclado completo, foco visible y reduced motion con tokens actuales. Helpers de fecha aislados resuelven instante y zona de cuenta sin librería adicional; rechazan hora inexistente y exigen desfase ante ambigüedad.

Regla de cierre: sin cambios, Escape/cierre exterior/Cancelar cierran; con cambios ofrecen Descartar cambios o Seguir editando dentro del mismo diálogo. Escape en esa confirmación vuelve al formulario con datos/foco conservados. Durante envío impedir cierre hasta conocer resultado; error conserva datos. Cancelar un editor inline aplica la elección en su propia área, sin modal apilado.

No copiar límites de motivo de reportes a sanciones; el contrato pendiente fija el máximo antes de activar transporte real. Zod valida nuevas fronteras en servicios, no mediante casts en componentes. 401/403/404 mantienen tratamiento central; 429/red/5xx distinguen error recuperable de capacidad no implementada.

## Secuencia de implementación y dependencias

| Etapa | Resultado revisable | Dependencia / salida |
| --- | --- | --- |
| A — Base verificable | Captura de estado inicial, mapa de consumidores, políticas puras y accesibilidad modal/campos | Sin backend nuevo; build/lint/tests y fixtures de permisos |
| B — Comentarios | Dependencias Markdown fijadas, plugin, renderer y editor único, carga robusta y conflictos | Contrato actual permite Markdown almacenado; sanciones reales aún DEP-003 |
| C — Integración disponible | Paginación, novedades, calendario, progreso/favoritos y regresiones del lector | Endpoints existentes y entorno real de prueba para evidencia E2E |
| D — Administración preparada | Usuarios, roles, sanciones y asignaciones con proveedor tipado y tests aislados; indisponibilidad normal | DEP-001/002/003/007 para activar HTTP real; eliminación ADMIN en frontend sin esperar DEP-006 |
| E — Tres medios preparados | Slots y destinos separados, previews, validación y confirmación | Guardado real bloqueado por DEP-004; lectura sigue operativa |
| F — Activación y cierre real | Adaptación y verificación independientes para listado, roles, sanciones y asignaciones; matriz por operación | Cada pareja avanza al resolverse su propia DEP/entorno; el cierre E2E global exige todas las capacidades requeridas |

Se pueden desarrollar B/C y preparación D/E con independencia de que el servidor publique sus contratos. No se ejecutan cambios del backend ni se ocultan sus bloqueos. `$speckit-tasks` deberá dividir por archivo y separar trabajo implementable de activaciones externas.

## Validación y mediciones

- Pruebas unitarias: AST spoilers/código/escapes, sanitización y URLs; límites UTF-16; fechas y zona; políticas de rol/sanción/asignación; adaptación de listas y medios; bloqueo explícito de operaciones ausentes.
- Pruebas de componentes con Testing Library: editor/preview, spoilers independientes por teclado, modal/foco, error de formulario asociado, cambio de identidad/destino con respuesta tardía, confirmación cancelada, conflicto conservando borrador y proveedor de administración inyectado.
- Pruebas de servicios/cliente cuando se toquen: JSON/FormData/204, 401/403/404/409, respuesta inválida, señal abort, límites de archivo y no invocar HTTP para capacidad pendiente. Sin reintento de escrituras no idempotentes.
- Integración real: [quickstart.md](quickstart.md) y matriz por operación; cuentas de prueba con roles/asignaciones distintos y contenido controlado. Registrar entorno, resultado y límites; no volcar contraseñas/tokens/correos en evidencia.
- Rendimiento: producir 30 mediciones de fuente máxima, frases con muchos delimitadores y texto sin cierres; registrar p95. Reutilizar un parseo por fuente para preview/publicado, memoización solo local y preview diferido; si el umbral falla, optimizar el plugin antes de proponer otra dependencia.
- Regresión: capítulos de más de 100 páginas en datos controlados, avanzar por más de 100 obras, más de una página de comentarios/favoritos/historial, navegación anterior/siguiente, ambos modos de lectura, cambio de cuenta sin mezcla de progreso/votos/favoritos.
- Comandos existentes obligatorios al cambiar código: `npm run build`, `npm run lint`, `npm run test:run`. Este plan no declara resultados de esos comandos ni permisos reales probados.

## Riesgos y límites de activación

| Riesgo | Tratamiento |
| --- | --- |
| Parser spoiler rompe Markdown interno o precedencia de pipes | Extensión sintáctica y fixtures antes de UI; solo extensiones selectivas de tachado, sin registrar tablas GFM |
| Solo blur expone spoilers a lector de pantalla | Ocultación semántica y disclosure nativo, sin enlaces dentro de botón |
| Backend no publica nuevas rutas/tercer medio | Preparación aislada y adaptador indisponible; DEP visible, sin éxito falso |
| Visibilidad de obra se confunde con asignación | Estado unknown y contrato DEP-007 antes de habilitar gestión dependiente |
| Revisiones inventadas fuerzan edición | Relectura e invalidación tras mutaciones; baseRevision congelada y 409 explícito |
| Favoritos parciales se presentan como totalidad | Total remoto y pertenencia triestado por cuenta separados de página |
| Lista cambia entre páginas sin snapshot | Deduplicación, orden del servidor y reconsulta; no prometer snapshot ni total inexistente |
| Fecha local se convierte con zona equivocada | Zona explícita e ida/vuelta de Intl, casos DST y reloj cliente no autoritativo |

## Complexity Tracking

Sin excepciones constitucionales. Cuatro paquetes runtime nuevos y tipos directos de AST se justifican en investigación; tabla, formularios, modales, HTTP, fechas y pruebas reutilizan las piezas actuales. No se agregan infraestructuras que el alcance no necesita.

## Resultado de la fase de diseño

Investigación cerrada y contratos locales definidos. La preparación puede avanzar sin endpoints nuevos; E2E depende de los contratos y entorno documentados. El checklist UX/datos contiene 52 ítems sin evaluar y conserva su revisión separada. `tasks.md` contiene 83 tareas (13 paralelizables y 12 condicionales), con activación/evidencia por capacidad. Los seis ajustes de analyze fueron aprobados por el usuario e incorporados; revisar coherencia documental antes de implementar.
