# ModoFriki-Web Constitution

## Core Principles

### I. Publicar, descubrir y leer narrativa gráfica en español

MODO FRIKI es una plataforma web para publicar, descubrir y leer cómics, manga, manhwa
y manhua. El frontend DEBE servir a visitantes, lectores registrados, editores
autorizados y administradores mediante catálogo, ficha de obra, lector, biblioteca
personal, comunidad y panel de publicación.

Cada feature DEBE identificar la necesidad de esos usuarios y expresar criterios de
aceptación observables. La lectura del contenido publicado DEBE permitir acceso público
según el contrato vigente. Registrar una cuenta NO DEBE conceder permiso de publicación.
Los tipos de obra y géneros DEBEN proceder de las taxonomías del backend.

El programa de autores independientes de Bolivia y Latinoamérica, Friki+, publicidad,
pagos, acceso anticipado y reparto de ingresos son propuestas de negocio por validar.
Su incorporación requiere especificaciones propias y contratos acordados. Esta
constitución NO fija precios, porcentajes, exclusividad del catálogo ni promete
funcionalidades comerciales por aparecer en Obsidian.

### II. Evolución incremental del frontend existente

Antes de modificar código se DEBEN inspeccionar los scripts, configuración TypeScript,
router, providers, componentes, hooks, servicios y tipos afectados. Se DEBEN reutilizar
las convenciones y dependencias existentes, conservando TypeScript estricto.
NO se permite regenerar la aplicación ni sustituir configuraciones funcionales como
efecto lateral de una feature.

La base vigente es una SPA con React, Vite, React Router y Tailwind CSS. `app/` compone
la aplicación; `pages/` define pantallas; `components/` contiene UI y funcionalidades;
`hooks/` y `context/` coordinan comportamiento y estado; `services/` integra dominios;
`lib/` reúne infraestructura del cliente y `types/` contratos del frontend.

Una dependencia, proveedor de estado o abstracción nueva DEBE justificar qué problema
concreto no resuelven esas piezas. Migrar framework, reorganizar por features o introducir
caché global requiere una decisión documentada y una transición acotada. Las propuestas
de mejoras del vault NO autorizan una reescritura automática.

### III. Responsabilidades claras e integración por contratos

Las pantallas y componentes DEBEN delegar las operaciones remotas en los servicios de
dominio, directamente o mediante hooks/contextos. NO DEBEN duplicar `fetch`, autenticación
HTTP ni desempaquetado de respuestas. Los servicios DEBEN reutilizar `src/lib/api.ts`
y adaptar DTO a los tipos de presentación, como hacen `toSeries` y `toChapter`.
El cliente HTTP NO DEBE contener estado visual ni lógica propia de una pantalla.

Los contratos DEBEN contrastarse con `docs/API.md`, `openapi.yaml`, documentación de la
feature y código del backend. Se DEBEN conservar UUID, números decimales de capítulo
serializados como string, enums, campos opcionales, respuestas 204 y la paginación
específica de cada endpoint. Catálogo, biblioteca y comunidad NO comparten necesariamente
la misma forma de lista. NO se inventan endpoints, totales ni campos para completar una UI.

Un cambio incompatible DEBE acordarse entre frontend, backend y responsable del producto
antes de integrarse. Los tipos TypeScript NO validan una respuesta en ejecución;
si se necesita validación de una frontera, se DEBE definir y comprobar explícitamente.
Un fallo de API NO DEBE sustituirse silenciosamente por datos demo ni mostrarse como éxito.

### IV. Identidad vigente y publicación con autorización por recurso

El backend es la autoridad de identidad, estado de cuenta, rol y asignación de obras.
`AuthContext` y `ProtectedRoute` DEBEN reflejar esa identidad para controlar navegación
y acciones. Ocultar botones NO sustituye la autorización del servidor.
El registro público NO DEBE aceptar privilegios elegidos por el usuario.

- Visitantes pueden consultar y leer publicaciones. Las cuentas activas pueden gestionar
  su propia biblioteca, valorar, comentar, votar y reportar según contrato.
- `/favorites` y `/profile` requieren sesión; `/admin` requiere `ADMIN` o `EDITOR`.
- `EDITOR` solo puede gestionar recursos con asignación vigente. Entrar al panel NO
  concede control sobre cualquier obra ni moderación de comentarios ajenos.
- Crear obras y taxonomías, administrar permisos y resolver reportes corresponde a `ADMIN`.
  La existencia de un endpoint administrativo NO prueba que exista su pantalla.

Las operaciones personales DEBEN usar la identidad de sesión prevista por `/me`, sin
enviar un `userId` arbitrario como autorización. Una respuesta 401 con token DEBE invalidar
la sesión mediante el mecanismo central existente. Un 403 DEBE comunicar falta de permiso;
NO se reintenta con otra identidad ni se presenta como fallo de conectividad.
Durante la comprobación inicial de sesión NO se muestran datos privados como confirmados.

### V. Publicación multimedia coherente y protección frente a conflictos

El panel DEBE distinguir borrador/publicado de emisión/finalización de una obra.
Publicar una obra requiere portada; publicar un capítulo requiere páginas válidas y
una obra publicada. Las validaciones del formulario DEBEN acompañar estas reglas,
manteniendo al servidor como autoridad final.

Las subidas DEBEN pasar por los endpoints multipart del backend, reutilizando
`services/admin.ts`. El navegador NO DEBE recibir credenciales de Blob, operar bases
de datos ni ejecutar la limpieza del almacenamiento. Los campos, arrays serializados,
archivos repetidos y reordenamiento JSON DEBEN respetar el contrato vigente.

La validación previa DEBE reflejar los límites del backend: JPEG, PNG y WebP, 10 MiB
por archivo, 100 MiB por solicitud, 100 páginas por solicitud y 1000 por capítulo.
La comprobación de MIME en el navegador NO demuestra el contenido del archivo ni
reemplaza su validación en servidor. Una selección inválida DEBE explicarse antes de enviar.

Editar, retirar o reordenar DEBE enviar la precondición vigente correspondiente:
`expectedUpdatedAt`, `expectedVersion` o `expectedRevision`. Ante 409 se DEBE informar
del conflicto y permitir reconciliar con la versión actual; NO se sobrescribe
automáticamente ni se fabrica una versión para forzar la operación.
Las acciones de retirada o reemplazo DEBEN explicar su alcance y solicitar confirmación
en la interfaz. NO se promete purga física: el backend conserva bajas lógicas e historial.

### VI. Lectura continua, progreso honesto y actividad idempotente

El lector DEBE preservar los modos cascada y paginado, el orden de páginas del servidor,
los ajustes de lectura y la navegación entre capítulos disponibles. DEBE permitir
continuar la lectura sin perder la referencia de obra, capítulo y página.
Las cargas de imágenes DEBEN priorizar el contenido visible y diferir el restante
cuando corresponda, evitando descargar capítulos ajenos a la navegación solicitada.

Favoritos, estado leído, valoraciones, historial y rachas DEBEN tomar el backend como
fuente de verdad. La página exacta y los ajustes del lector se conservan localmente
en la implementación actual; NO se presentan como sincronizados entre dispositivos.
Un estado privado en memoria o almacenamiento NO DEBE mostrarse como perteneciente
a otra cuenta tras cambiar de sesión.

Las visitas y aperturas de capítulo DEBEN enviarse mediante POST explícitos con UUID
de idempotencia. Los reintentos de una misma operación DEBEN conservar su clave y destino;
un render o una consulta GET NO justifica fabricar un nuevo evento.
Los reintentos automáticos DEBEN ser acotados y reservarse a operaciones idempotentes
ante errores de red o servidor; NO se reintentan indiscriminadamente errores 4xx.

La deduplicación por usuario, capítulo y día local, así como zona horaria, rachas y
estadísticas, corresponde al backend. Marcar o desmarcar leído manualmente NO equivale
a registrar una apertura. Una apertura NO prueba lectura completa, tiempo dedicado ni
persona única. La UI NO DEBE reinterpretar esas métricas como ingresos verificables.
Rankings y recomendaciones DEBEN comunicar su criterio sin inventar puntuaciones.

### VII. Identidad visual consistente y acceso usable

La experiencia DEBE mantener la identidad oscura con acento naranja, Inter para texto
y Space Grotesk para títulos mediante `src/styles/tokens.css`. Colores, tipografía y
estados compartidos DEBEN reutilizar tokens y componentes de `components/ui/`;
NO se introducen valores visuales arbitrarios donde ya existe un token equivalente.
Los cambios globales de identidad requieren una decisión explícita de diseño.

Las pantallas afectadas DEBEN verificarse en móvil y escritorio, con lectura legible
y controles operables sin depender exclusivamente de hover o color. Controles con
iconos DEBEN tener nombre accesible; los campos DEBEN tener etiquetas y errores asociados.
La navegación por teclado DEBE conservar foco visible. Los diálogos DEBEN gestionar
entrada, permanencia y retorno de foco. Las animaciones DEBEN respetar movimiento reducido.

Toda consulta visible DEBE distinguir carga, vacío, error y éxito; los fallos recuperables
DEBEN ofrecer una acción útil. Las mutaciones DEBEN impedir envíos duplicados e indicar
su estado. Una actualización optimista DEBE revertirse o reconciliarse si falla.
Los mensajes de producto DEBEN estar en español y explicar la acción que puede realizar
el usuario, sin exponer detalles internos innecesarios.

### VIII. Comunidad moderada y datos del navegador tratados como no confiables

Comentarios, respuestas, votos y reportes DEBEN usar el contrato de comunidad y conservar
destino, jerarquía y cursores. Borrar un comentario NO DEBE eliminar sus descendientes
de la presentación; el nodo retirado conserva la continuidad del hilo.
Solo el autor puede editar su comentario; `ADMIN` puede moderar contenido ajeno y resolver
reportes con explicación. Resolver un reporte NO equivale a borrar el comentario.

El contenido de usuarios DEBE renderizarse como texto seguro. Si se incorpora Markdown
interpretado, DEBE sanitizarse y restringir protocolos de enlaces; NO se permite HTML
arbitrario mediante `dangerouslySetInnerHTML`. Las URLs y redirecciones recibidas del
usuario DEBEN validarse antes de usarse como destinos de navegación.

Tokens, contraseñas, cabeceras de autorización, correos privados y datos de reporteros
NO DEBEN aparecer en logs, mensajes públicos ni analítica. Las variables `VITE_*` son
públicas en el bundle y NO DEBEN contener secretos. `.env` NO se versiona.
La persistencia actual del token en `localStorage` NO ofrece protección frente a XSS;
cambiar a cookies u otro mecanismo requiere coordinación con el backend.

El almacenamiento local es una ayuda del dispositivo, nunca una prueba de permisos,
voto confirmado o identidad. Sus fallos DEBEN permitir continuar en memoria cuando sea
posible; las operaciones remotas NO se presentan como completadas por guardarse localmente.

### IX. Calidad proporcional al riesgo y evidencia verificable

Cada cambio DEBE aportar evidencia acorde con el comportamiento afectado. Permisos,
adaptadores de DTO, sesión, errores HTTP, precondiciones, reintentos y subidas requieren
verificación de casos positivos y negativos cuando se modifiquen. Los flujos de lector,
publicación y comunidad DEBEN comprobarse desde el comportamiento observable del usuario.

Se DEBEN reutilizar Vitest y Testing Library para pruebas automatizadas pertinentes,
simulando proveedores cuando se busque aislamiento. Una prueba con `fetch` simulado
NO demuestra integración real; una compilación NO demuestra corrección de permisos.
Cambios documentales o visuales menores NO requieren tests que reproduzcan su implementación.

Los scripts disponibles son `npm run build`, `npm run lint` y `npm run test:run` para
verificaciones no interactivas. Antes de integrar cambios de código se DEBEN ejecutar
los controles pertinentes y registrar resultados, fallos previos o limitaciones del entorno.
NO se declara probado, desplegado, accesible o integrado algo sin evidencia correspondiente.

## Contexto y restricciones del producto

- Stack observado: React 19, Vite 8, TypeScript 6 estricto, React Router 7 y Tailwind CSS 4;
  Lucide, Motion, Sonner, React Hook Form, Zod, Vitest y Testing Library. Las versiones
  efectivas se consultan en `package.json` y lockfile antes de cambiar dependencias.
- El backend separado usa Express/TypeScript, PostgreSQL/Prisma, MongoDB/Mongoose y
  Vercel Blob. El frontend consume su API; NO replica persistencia ni reglas autoritativas.
- `VITE_API_URL` configura el cliente; el fallback local actual es
  `http://localhost:3000/api`. Configurar esa URL NO prueba disponibilidad ni despliegue.
- Las rutas actuales usan IDs: `/series/:id/:slug?` y `/read/:workId/:chapterId`.
  Un slug NO sustituye al identificador del recurso. Los cambios de rutas DEBEN evaluar
  enlaces existentes y navegación de retorno.
- Vercel para frontend y Render para backend son la referencia de despliegue del vault.
  Su estado operativo, configuración SPA y conectividad DEBEN verificarse en una tarea
  de despliegue; esta constitución NO certifica un entorno publicado.
- El contenido publicado DEBE contar con autorización de titulares o licencia adecuada.
  Incorporar autores, clasificación por edad o monetización requiere especificar derechos,
  privacidad, moderación y responsabilidades, sin presuponer flujos existentes de consentimiento.

## Flujo de desarrollo y controles de calidad

1. **Comprender y especificar.** Inspeccionar la implementación y fuentes afectadas.
   Definir usuario, resultado, alcance, dependencias y criterios de aceptación.
   Separar comportamiento existente, deuda y propuestas.
2. **Planificar.** En el flujo Spec Kit, `spec.md`, `plan.md` y `tasks.md` DEBEN ser
   coherentes con esta constitución. El plan DEBE comprobar permisos, contratos, estados
   de UI, datos locales/remotos, accesibilidad y fallos aplicables antes de implementar.
3. **Implementar por alcance.** Reutilizar servicios, hooks, tipos, tokens y componentes.
   Acordar cambios de API antes de depender de ellos. NO ampliar una feature con
   refactorizaciones, migraciones de arquitectura o funciones comerciales no especificadas.
4. **Validar.** Ejecutar controles proporcionales al cambio. Los flujos sensibles DEBEN
   incluir denegación de permisos, sesión inválida, conflicto o fallo de subida según
   corresponda. Cambios visuales DEBEN revisarse en tamaños móvil y escritorio.
5. **Revisar e integrar.** Revisar cumplimiento constitucional y documentar qué cambió,
   qué se verificó y qué queda limitado. La documentación de comportamiento afectada DEBE
   actualizarse dentro de su tarea autorizada; corregir documentación NO autoriza cambiar
   permisos ni contratos de forma implícita.

## Governance

Esta constitución establece las reglas duraderas de ModoFriki-Web. DEBE interpretarse
con las instrucciones explícitas vigentes del usuario y las instrucciones aplicables
del repositorio. DEBE mantener compatibilidad con los principios compartidos del backend
sin trasladar al navegador sus responsabilidades de servidor.
DEBE, NO DEBE y NO se permite expresan requisitos comprobables.

Una enmienda DEBE documentar motivo, reglas afectadas, impacto en UX, contratos y datos,
validaciones y transición necesaria. El responsable del proyecto DEBE aprobar cambios
normativos antes de integrarlos. Cada revisión DEBE identificar incumplimientos y
corregirlos o registrar una excepción acotada y aprobada, con responsable y criterio
de cierre. La deuda existente NO autoriza ampliarla ni exige reescrituras fuera de alcance.

El versionado es semántico: MAJOR para eliminar o redefinir principios de forma
incompatible; MINOR para añadir principios o ampliar obligaciones compatibles;
PATCH para aclaraciones sin cambio de obligación. Cada enmienda DEBE actualizar versión
y fecha conservando la ratificación original. La versión 1.0.0 es la primera constitución,
redactada el 2026-10-29 a partir de la plantilla sin normas previamente ratificadas.

### Fuentes y resolución de discrepancias

Fuentes inspeccionadas el 2026-10-29:

- Este checkout: `package.json`, configuración, `src/app/`, `src/types/`, `src/lib/`,
  servicios, contextos, hooks, componentes del panel, comunidad y lector, y pruebas existentes.
- Backend local `../ModoFriki-Backend/`, rama `dev`, revisión
  `37ad3f36538cb09731356af5bc9c47dbcac84afe`, coincidente con la referencia remota consultada:
  [constitución del backend](https://github.com/ElQuenta/ModoFriki-Backend/blob/37ad3f36538cb09731356af5bc9c47dbcac84afe/.specify/memory/constitution.md),
  `AGENTS.md`, `docs/API.md` y documentación de features como contexto contractual.
- [ModoFriki-Obsidian](https://github.com/alanmcv/ModoFriki-Obsidian/tree/8cbd099705946a419deddb2571a535a9c5891cf0),
  revisión `8cbd099705946a419deddb2571a535a9c5891cf0`: arquitectura del frontend,
  publicación, lectura, roles, decisiones, propuestas de negocio y mejoras.

Para describir el estado actual se DEBEN contrastar documentos con código y contrato
específico vigente. Las notas históricas y propuestas NO enmiendan esta constitución.
Las contradicciones sobre permisos o compatibilidad DEBEN resolverse explícitamente
con el responsable del producto antes de alterar comportamiento y sincronizarse entre repositorios.

Discrepancias y límites conocidos:

- El frontend NO tiene carpeta `docs/` en este checkout. Su README describe mocks,
  autenticación demo y ausencia de panel; el código contiene API real y `/admin`.
  Las rutas del README también difieren del router. Esas descripciones NO delimitan
  el alcance actual ni convierten la cuenta demo documentada en credencial válida.
- Obsidian reserva borrar capítulos a `ADMIN`; la constitución del backend registra
  que los repositorios permiten bajas de obras y capítulos a `EDITOR` asignado.
  Esta discrepancia exige resolución contractual antes de cambiar esos permisos;
  la presente redacción NO introduce una restricción nueva ni amplía privilegios.
- La página exacta de lectura y el recuerdo del voto propio son locales al dispositivo.
  Las claves actuales de progreso y votos no incluyen identidad; cualquier cambio en
  esos flujos DEBE evaluar el aislamiento entre cuentas sin atribuir sincronización remota.
- Existe un archivo de pruebas de formato, además de configuración de Vitest y Testing
  Library. Su existencia NO demuestra cobertura de sesión, lector, panel o integración API.
- El panel limita actualmente su listado a 100 obras y algunos servicios acumulan páginas
  completas. Las tareas que amplíen esos listados DEBEN definir paginación y límites
  verificables; NO se promete escalabilidad ilimitada por usar endpoints paginados.
- Generación de tipos OpenAPI, carga diferida de rutas, caché, CI y mejoras de seguridad
  propuestas en el vault requieren comprobación o implementación específica.

Cada enmienda DEBE incluir un informe de impacto para revisión. El comentario HTML
inicial es material temporal y DEBE retirarse antes del commit. Las plantillas y comandos
dependientes leen esta constitución en ejecución; su actualización no forma parte de
esta redacción inicial.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
