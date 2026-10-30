# Plan de pruebas E2E — ModoFriki Web

Casos que ejecuta el subagente `tester-e2e` con el MCP de Playwright (`/probar-frontend`). Son la **fuente de verdad** de qué se prueba: si cambias una pantalla, actualiza su caso en el mismo PR.

## Datos (fixtures del backend, `ModoFriki-Backend/postman/fixtures/test-data.sql`)

| Dato | Valor |
| --- | --- |
| Front | `http://localhost:5173` (`npm run dev:e2e`) |
| Lector (BASIC) | `lector.test@modofriki.local` / `ModoFriki-Test-2026` |
| Admin | `admin.test@modofriki.local` / `ModoFriki-Test-2026` |
| Obra publicada | "Obra de Prueba" · `/series/66666666-6666-4666-8666-666666666666` · 2 capítulos (cap. 1 con 2 páginas) |
| Capítulo 1 | `/read/66666666-6666-4666-8666-666666666666/77777777-7777-4777-8777-777777777771` |
| Obra en borrador | `/series/66666666-6666-4666-8666-666666666667` (no debe verse) |

## Reglas que aplican a TODOS los casos

- **Consola:** cualquier `console.error` o excepción no capturada = ❌, salvo los 4xx que el caso marca como esperados.
- **Red:** cualquier respuesta 5xx de `localhost:3000` = ❌. Un 4xx solo es válido si el caso lo espera.
- **Pantallas de error:** "Algo salió mal" en un caso que no lo espera = ❌.
- Identifica los elementos por **rol y nombre accesible** (lo que muestra `browser_snapshot`), nunca por clases CSS.
- Antes de cada caso con sesión, empieza desde una sesión limpia (`Cerrar sesión` o una nueva pestaña aislada).
- Si un paso no se puede ejecutar (elemento que no existe), el caso es ❌ con el snapshot como evidencia. No improvises otro camino.

---

## A. Navegación pública (anónimo)

### E2E-01 · Inicio carga con datos reales
1. Abre `/`.
2. **Esperado:** región "Series destacadas" con heading "Obra de Prueba"; sección "Últimos capítulos" con al menos un artículo y links "Cap. 1 · El comienzo" y "Cap. 2 · La continuación"; secciones "Tendencias de hoy" y "Populares ahora" visibles.

### E2E-02 · Enlaces del encabezado y del anuncio
1. Desde `/`, haz clic en cada link de "Navegación principal": Inicio, Catálogo, Rankings, Géneros.
2. Vuelve a `/` y haz clic en el link del anuncio superior ("Leer ahora").
3. **Esperado:** cada link lleva a una página que carga su contenido (sin "Algo salió mal" ni 404). El anuncio lleva a una ficha que existe.

### E2E-03 · Catálogo: búsqueda
1. Abre `/series`. **Esperado:** texto "1 resultado" y artículo "Obra de Prueba".
2. Escribe `Prueba` en "Buscar series". **Esperado:** sigue "Obra de Prueba".
3. Escribe `zzzz-no-existe`. **Esperado:** ningún artículo, "0 resultados" y heading "No encontramos nada con esos filtros".

### E2E-04 · Catálogo: filtros
1. En `/series`, elige "Acción" en "Filtrar por género". **Esperado:** "Obra de Prueba" visible y la URL refleja el filtro.
2. Pulsa el botón de tipo "Manhwa". **Esperado:** "Obra de Prueba" visible.
3. Cambia "Ordenar resultados" a "Más visitadas". **Esperado:** la lista se recarga sin errores.

### E2E-05 · Ficha de obra
1. Abre `/series/66666666-6666-4666-8666-666666666666`.
2. **Esperado:** heading nivel 1 "Obra de Prueba"; "Sinopsis" con su texto; "Capítulos" con "2 capítulos disponibles"; links "Empezar a leer" y "Último capítulo"; "Ficha técnica" con Tipo "Manhwa"; heading "Comentarios (N)".

### E2E-06 · Obra en borrador no es pública
1. Abre `/series/66666666-6666-4666-8666-666666666667`.
2. **Esperado:** heading "No encontramos esta serie" y link "Volver al catálogo". (404 de `/api/works/...` esperado.)

### E2E-07 · Lector
1. Desde la ficha, pulsa "Empezar a leer".
2. **Esperado:** URL `/read/.../77777777-7777-4777-8777-777777777771`; imágenes "Página 1 del capítulo 1" y "Página 2 del capítulo 1" visibles y cargadas (`naturalWidth > 0`).
3. Comprueba que existen los controles "Volver a la serie", "Cambiar modo de lectura", "Página anterior" y "Página siguiente".
4. Pulsa el link "Capítulo siguiente: 2". **Esperado:** se muestra "Página 1 del capítulo 2".

### E2E-08 · Ruta inexistente
1. Abre `/esta-ruta-no-existe`.
2. **Esperado:** "404" y heading "Te perdiste en otra dimensión" con link "Volver al inicio".

### E2E-09 · Rutas protegidas sin sesión
1. Abre `/favorites`, luego `/profile` y luego `/admin`.
2. **Esperado:** cada una redirige a `/login?next=<ruta>`.

---

## B. Autenticación

### E2E-10 · Login con contraseña incorrecta
1. En `/login`, escribe el correo del lector y `incorrecta123`, y pulsa "Entrar".
2. **Esperado:** sigue en `/login` con el alert "El correo o la contraseña no son correctos." (401 de `/api/auth/login` esperado.)

### E2E-11 · Validación del formulario de registro
1. En `/register`, escribe usuario `ab`, un correo inválido `no-es-correo` y la contraseña `123`, y pulsa "Crear cuenta".
2. **Esperado:** un alert de validación (por ejemplo "Tu usuario debe tener al menos 3 caracteres."); no se hace `POST /api/auth/register` (compruébalo con `browser_network_requests`).

### E2E-12 · Registro de usuario nuevo
1. En `/register`, completa usuario `e2e_<timestamp>`, correo `e2e_<timestamp>@modofriki.local` y contraseña `Password-Test-123`, y pulsa "Crear cuenta".
2. **Esperado:** sale de `/register` con la sesión iniciada: el encabezado muestra un botón con el nombre de usuario en lugar de "Entrar".

### E2E-13 · Login y redirección a `next`
1. Abre `/favorites` (redirige a login) e inicia sesión como lector.
2. **Esperado:** vuelve a `/favorites`, y el encabezado muestra el botón "lector_test".

### E2E-14 · Cerrar sesión
1. Con sesión de lector, abre el menú "lector_test" y elige "Cerrar sesión".
2. **Esperado:** el encabezado vuelve a mostrar "Entrar". `/favorites` vuelve a redirigir a login.

---

## C. Biblioteca y lectura (lector)

### E2E-15 · Favoritos
1. Inicia sesión como lector y abre la ficha de "Obra de Prueba".
2. Anota n del link "Favoritos (n)" del encabezado. Si el botón de la ficha dice "En favoritos", quítala antes con ese botón.
3. Pulsa "Favorito". **Esperado:** el botón pasa a "En favoritos" y el link a "Favoritos (n+1)".
4. Abre `/favorites`. **Esperado:** artículo "Obra de Prueba".
5. Pulsa "Quitar Obra de Prueba de favoritos". **Esperado:** desaparece y el contador vuelve a n.

### E2E-16 · Valoración
1. En la ficha, pulsa "Valorar con 4 estrellas".
2. Recarga la página. **Esperado:** la valoración 4 persiste ("Puntuación exacta" = 4.0).
3. Deja la valoración como estaba (o elige "—").

### E2E-17 · Marcar capítulo como leído
1. En la ficha, anota "X de 2 capítulos leídos" y pulsa el botón del capítulo 1 ("Marcar el capítulo 1 como leído" o "… como no leído", según su estado).
2. **Esperado:** el contador cambia en 1 y el cambio persiste tras recargar.
3. Pulsa de nuevo para dejarlo como estaba.

### E2E-18 · Comentarios
1. En la ficha, escribe `Comentario E2E <timestamp>` en "Escribe un comentario" y pulsa "Publicar".
2. **Esperado:** el comentario aparece con autor "lector_test" y botones "Votar a favor", "Votar en contra", "Responder", "Editar" y "Eliminar".
3. Pulsa "Editar", cambia el texto y guarda. **Esperado:** se ve el texto nuevo.
4. Pulsa "Eliminar" y confirma el diálogo. **Esperado:** el comentario queda como eliminado o desaparece, sin errores.

---

## D. Roles

### E2E-19 · Admin bloqueado para BASIC
1. Con sesión de lector, abre `/admin`.
2. **Esperado:** heading "No tienes permiso" y link "Volver al inicio".

### E2E-20 · Panel de administración (ADMIN)
1. Inicia sesión como admin y abre `/admin`.
2. **Esperado:** heading "Panel" y tablist "Secciones del panel" con las pestañas "Obras", "Taxonomía" y "Reportes". En "Obras" aparecen "Obra de Prueba" y "Obra Borrador".
3. Abre cada pestaña. **Esperado:** cada una muestra datos o un estado vacío, sin errores.
**No crees, edites ni borres obras**: las subidas usan Vercel Blob.

---

## E. Responsive

### E2E-21 · Móvil (390×844)
1. Cambia el viewport a 390×844 (`browser_resize`) y abre `/`.
2. **Esperado:** no hay scroll horizontal (`document.documentElement.scrollWidth <= 390`); el botón "Abrir menú" abre la navigation "Navegación móvil" y su link "Catálogo" lleva a `/series`.
3. Abre la ficha y el lector. **Esperado:** se pueden usar sin elementos cortados.
4. Restaura el viewport a 1280×800.
