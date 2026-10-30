# Guía de validación de la integración

**Alcance**: Guía de verificación de la implementación frontend actual. Las pruebas con fixtures verifican comportamiento local; no prueban permisos, persistencia ni integración real. Referencias: [plan](plan.md), [modelo](data-model.md), [interfaz](contracts/frontend-ui.md), [matriz de operaciones](contracts/integration-matrix.md) y [evidencia](validation.md).

## Preparación

1. Usar un entorno de pruebas con versión de Node/npm compatible con los paquetes del proyecto y dependencias instaladas desde el lockfile. Desde la raíz del frontend:

   ```powershell
   npm ci
   ```

2. La implementación fija estas dependencias de ejecución en `package.json`: `react-markdown@10.1.0`, `rehype-sanitize@6.0.0`, `micromark-extension-gfm-strikethrough@2.1.0` y `mdast-util-gfm-strikethrough@2.0.1`. El lockfile determina el árbol resuelto. Los plugins de spoilers son locales; no se incorporó un editor pesado ni otro cliente HTTP/formulario/framework de tests.
3. Configurar localmente `VITE_API_URL` según `.env.example`, sin versionar `.env` ni exponer secretos. El valor de referencia es `http://localhost:3000/api`.
4. Para integración real, disponer del backend de pruebas y sus almacenes configurados por su responsable. El backend tiene `npm run dev`; ejecutarlo en su propio repositorio solo con su configuración de entorno preparada. No hace falta correr migraciones, seeds o limpieza para validar el frontend y esta guía no los autoriza ni inventa comandos de aprovisionamiento.
5. Disponer de cuentas de prueba ADMIN, BASIC, EDITOR asignado y EDITOR no asignado. No incluir sus credenciales en documentos o logs. Las acciones con datos usan exclusivamente el entorno y contenido de prueba previstos.
6. Datos mínimos de pruebas aisladas: 121 obras para superar el truncado histórico de 100; 41 raíces y 41 respuestas en un hilo; 41 favoritos y >40 elementos de historial; capítulo de 101 páginas. Para controles de límites usar fixtures de tamaño/100/1000, sin descargar o publicar masivamente archivos reales. Para el recorrido real se prepara contenido controlado mediante operaciones existentes, coordinado con el responsable del entorno.

## Estado previo de capacidades

Consultar [integration-dependencies.md](integration-dependencies.md). Usuarios, roles, sanciones y asignaciones no tienen rutas registradas en el backend inspeccionado. El tercer medio tampoco existe en su contrato y la autorización de eliminar capítulos aún necesita corrección.

- Con DEP pendiente: es válido demostrar interfaz con proveedor falso en pruebas aisladas; en uso normal se ve indisponibilidad y no se envían llamadas inventadas ni se muestra una tabla demo.
- Con DEP resuelta: contrastar ruta/esquemas/errores actuales y habilitar su adaptador por operación. Registrar revisión del backend y entorno utilizados.
- Un backend desconectado no es prueba de que una capacidad no exista: es fallo de conectividad de lo que debería estar disponible.
- Activar y verificar listado, roles, sanciones y asignaciones por separado. Para la prueba directa de un adaptador usar identidades confirmadas del entorno; si falta una fuente de selección de sujetos en UI, mantener pendiente solo ese recorrido, sin inventar filas ni esperar contratos ajenos para probar las operaciones disponibles.

## Comprobaciones automatizadas

Desde la raíz del frontend, después de los cambios de implementación:

```powershell
npm run build
npm run lint
npm run test:run
```

La implementación ya incluye tests de parser/sanitización, comentarios y spoilers, administración y políticas, paginación y biblioteca, lector, medios editoriales, modales, formularios y manejo de errores. Consultar `tasks.md` y `validation.md` para el resultado actual; un fixture simulado no acredita servidor real.

La suite pertinente debe incluir parser y sanitización con fixtures de fuente máxima; fuente vacía y Unicode suplementario; formulario de fechas en zona de cuenta/DST; adaptadores, políticas y error de respuesta; spoiler oculto para tecnologías de asistencia y teclado; foco de modal; doble envío; cambios de identidad/destino durante solicitudes; conflicto con borrador conservado; no HTTP en capacidades pendientes. Inyectar el proveedor administrativo solo en tests. Una prueba con transporte simulado se registra como tal y no valida permisos reales.

## Sesión manual y recorrido público

```powershell
npm run dev -- --host 127.0.0.1
```

Abrir la URL que informe Vite. En visitante recorrer inicio, catálogo, tipos/géneros, rankings y novedades paginadas, ficha y lector de obra publicada. Alcanzar más de 100 obras en el panel de pruebas como ADMIN y varias páginas en rankings/novedades; el home puede conservar una muestra con enlace al listado. Los conjuntos acotados no exigen un total inventado. Ocultar contenido debe producir 404 público sin revelar datos.

En el lector comprobar ambos modos, capítulo anterior/siguiente, página exacta local y ajustes. El banner de capítulo está antes del contenido y no suma una página ni cambia el progreso. Abrir ficha/capítulo registra los POST previstos; reintentar la misma apertura conserva su idempotencyKey. Marcar leído manualmente no registra apertura ni racha.

## Comentarios y spoilers

Con una cuenta activa y destino publicado:

1. Escribir un comentario raíz con negrita, cursiva, tachado, cita, listas, enlace y código; alternar preview y publicar, recargar y comparar. Repetir como respuesta y edición en obra y capítulo.
2. Incluir `||primer secreto|| y ||**segundo secreto**||`. Ambos empiezan ocultos; revelar uno por teclado conserva el otro. El contenido oculto no se anuncia a lector de pantalla. No hay controles interactivos anidados y cambiar la fuente reinicia la revelación.
3. Incluir delimitador escapado, vacío/sin cierre, saltos blandos y `||` dentro de código; los casos literales siguen el contrato de gramática. HTML o enlace peligroso no ejecuta contenido ni abre protocolo prohibido.
   Los comentarios son solo texto: no existe selector ni aceptación de archivos pegados/arrastrados, subida o preview de imágenes, ni descarga automática por URL. Pegar texto funciona. Escribir `![texto](url)` o HTML de imagen conserva la fuente como literal escapado idéntico en preview/publicación; no crea una imagen ni elimina la fuente silenciosamente.
4. Probar límite exacto 10 000 y exceso 10 001 unidades UTF-16 con fixtures, incluidos emojis. El contador y la validación coinciden con servidor; el borrador no se corta ni se pierde al error.
5. Recorrer más de una página de raíces y respuestas sin duplicados ni mezcla al cambiar destino/cuenta; un fallo adicional conserva lo ya recibido. Eliminar raíz conserva descendientes y autor ausente se identifica como no disponible.
6. Con dos sesiones de prueba provocar un conflicto de edición del mismo comentario. El 409 conserva fuente local; recuperar versión actual por el listado permite comparar y reintentar explícitamente. Votar/reportar/responder no fabrica una revisión para forzar edición.

## Usuarios, roles y asignaciones

Primero validar estos recorridos mediante tests de componente con proveedor inyectado. En uso normal, mientras falten DEP-001/002/007, Usuarios informa indisponibilidad sin éxito de mutaciones ni peticiones a rutas supuestas.

Cuando exista adaptador real, ADMIN consulta páginas de usuarios y cambia otro BASIC a EDITOR y viceversa. No hay opción ADMIN como destino, cambio de rol propio ni modificación del rol de otro ADMIN. Intentos directos rechazados por el servicio son evidencia aparte de la ausencia de controles. Refrescar sesión/permisos del afectado sin fabricar identidad.

ADMIN consulta obras asignadas, asigna a EDITOR y revoca una vigente con confirmación. El duplicado no crea otra relación. El rol EDITOR solo no asigna obras y la visibilidad de una publicación no demuestra permiso para gestionarla. Un EDITOR no asignado, una revocación o pérdida de rol impide el siguiente guardado según el servicio. Verificar historial de auditoría por el mecanismo del backend acordado; no añadir una pantalla o bitácora local como sustituto.

Con dos sesiones de prueba, cambiar el rol de la cuenta afectada y recuperar foco en su aplicación; repetir justo antes de confirmar una operación sensible y tras un 403. GET `/auth/me` debe revalidar por sesión sin solicitudes duplicadas en curso; durante la consulta no se confirman operaciones sensibles. El rol recibido actualiza acciones; fallo recuperable conserva borradores y permite reconsultar, 401 mantiene salida central y no se reintenta automáticamente la escritura rechazada. No atribuir una sanción a campos que el contrato actual de identidad no devuelve.

## Sanciones

El frontend adapta las rutas publicadas de sanciones y consulta propia en DEP-003. Validar el cliente con pruebas locales, sin declarar persistencia, permisos ni restricciones reales del servidor. La extensión permanece deshabilitada porque no existe endpoint; T046 requiere entorno integrado.

Tras activarla con contrato aprobado:

1. ADMIN aplica temporal con motivo y fecha/hora futura en la zona visible a BASIC/EDITOR; el estado se mantiene al recargar. Fecha pasada y extensión que no supera el vencimiento se rechazan con explicación.
2. El afectado no puede crear, responder ni editar, también mediante intento directo. Conserva login, lectura, votos, reportes y eliminación propia autorizada; no cambia a SUSPENDED ni pierde asignaciones editoriales por esta sanción.
3. Extender temporal conserva el nuevo vencimiento tras recarga; quitarla restaura estado según servidor. Al vencer, consultar estado autoritativo antes de anunciar permiso restaurado.
4. Permanente no tiene fecha y no ofrece Extender; se puede quitar con confirmación. Cancelar no altera estado.
5. ADMIN propio/ajeno no admite aplicar, extender o quitar sanciones. Si cambia el rol del destinatario durante un modal abierto, no se confirma con el rol anterior.
6. Cubrir hora inexistente y ambigua con zonas de prueba en fixture; no usar el reloj del navegador como autoridad de vencimiento. Motivo y datos administrativos solo son visibles para afectados/autorizados.

## Tres imágenes y edición editorial

El formulario envía los medios por los campos publicados `cover`, `banner` e `inpagecover` y mapea `coverAsset`, `bannerAsset` e `incapBannerAsset` de forma independiente. La UI exige los tres incluso para borradores; el backend exige los tres al publicar, pero permite borradores incompletos. Revisar que esta diferencia siga siendo la regla aprobada. En entorno integrado crear/editar una obra de prueba, recargar cada destino, reemplazar solo uno y provocar un conflicto; las pruebas de servicio no acreditan persistencia real.

Con contrato acordado, crear obra de prueba con tres imágenes distintas y confirmar tarjetas/ficha/inicio de capítulos tras recarga. Guardar un borrador también exige tres. Editar sin seleccionar nuevos archivos conserva imágenes; reemplazar una mantiene las otras y requiere confirmación informada. Selección inválida bloquea aunque haya persistida previa; cancelar selección conserva esta última. Una obra antigua incompleta sigue consultable y exige completar campos en siguiente guardado.

Probar rechazo de archivo excesivo/incorrecto y conflicto de updatedAt; no se anuncia guardado exitoso ni purga de medios. Páginas de capítulo conservan expectedVersion y confirmación de reemplazo/retirada; conflicto no sobrescribe orden actual. Solo ADMIN dispone de eliminación de capítulo en interfaz. Su rechazo real para EDITOR se acredita únicamente al resolver DEP-006; el servidor actual aún la permite.

## Biblioteca, perfil y aislamiento

Recorrer favoritos, valoración y retirada, leído/desmarcado, historial, calendario con rango válido y progreso por capítulo. Total de favoritos usa respuesta autoritativa, no tamaño de una página o mapa parcial. Obra no consultada tiene pertenencia desconocida, no falso confirmado. Separar página exacta local de progreso remoto y cambios manuales de eventos de apertura.

Límites exactos a contrastar en T003: valoración de 0 a 5 inclusive en pasos de 0,5, con cero válido y ausencia/unknown distintos; calendario YYYY-MM-DD con inicio ≤ fin y hasta 366 días inclusivos en zona de cuenta; capítulo no negativo de hasta nueve enteros y tres decimales como string, sin redondeo. Cubrir extremos válidos y exceso/incremento inválido sin alterar datos confirmados.

Cambiar entre dos cuentas y visitante mientras hay solicitudes en curso: no heredar favoritos, progreso, votos, sanciones o borradores de otra identidad. Un 401 protegido invalida la sesión por mecanismo central; 403 explica permiso sin cambiar de cuenta; error recuperable no produce datos demo ni éxito falso.

## Accesibilidad y medición

Recorrer por teclado editor, spoiler, tabla y formularios, sin perder foco ni depender de hover/color. Los modales conservan foco y lo devuelven al origen; etiquetas y errores están asociados. Revisar 360/1280 px, desplazamiento local de tabla y reduced motion.

Probar Escape/cierre exterior/Cancelar con formulario limpio (cierra), con cambios (elección Descartar cambios/Seguir editando en el mismo diálogo) y durante envío (no cierra hasta conocer resultado). Escape en la elección vuelve al formulario con datos/foco; fallo de envío conserva datos. Cancelar edición inline con cambios usa la misma elección en su área. No hay modales apilados ni pérdida silenciosa de fuente o archivos seleccionados en el formulario de obra.

Para medir Markdown ejecutar build de producción y preview:

```powershell
npm run build
npm run preview -- --host 127.0.0.1
```

Registrar equipo, navegador Chromium estable y throttling CPU 4x. Usar 5 calentamientos y 30 muestras de fuentes de 10 000 unidades, incluidas muchas marcas sin cierre. Medir transformación+preview después de pausa de 150 ms; objetivo p95 ≤100 ms. No incluir espera de red ni declarar que una medición local prueba capacidad de servidor. Conservar resultados reales y optimizar parser si no cumple.

## Evidencia y criterio de cierre

Completar la plantilla de evidencia de [integration-matrix.md](contracts/integration-matrix.md) por operación: entorno/revisión, capa simulada o real, resultado positivo, caso negativo y persistencia tras recarga cuando aplica. Sin secretos ni datos privados innecesarios.

Estados válidos: preparación verificada de interfaz, integración real verificada, pendiente de implementar, o bloqueada por DEP externa con evidencia. Una integración frontend incompleta no puede renombrarse dependencia para aprobarla. No declarar E2E de administración, permisos o tres medios hasta que exista servidor compatible y los escenarios reales pasen. La revisión de requisitos del [checklist UX/datos](checklists/ux-datos.md) tiene su ciclo independiente y sus marcadores corresponden al revisor.
