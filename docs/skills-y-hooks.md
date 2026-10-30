# Skills y hooks de ModoFriki Web

Referencia de las skills de OpenCode y de los hooks de React que usa el frontend.
El objetivo es que cualquiera pueda saber qué existe, para qué sirve y dónde se
usa antes de crear algo nuevo.

## Skills

Las skills son instrucciones reutilizables que OpenCode carga bajo demanda. Viven
en `.opencode/skills/<nombre>/SKILL.md` y su `name` debe coincidir con el nombre
de la carpeta.

| Skill                | Ruta                                           | Cuándo se activa                                                | Cubre                                                              |
| -------------------- | ---------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------ |
| `modofriki-frontend` | `.opencode/skills/modofriki-frontend/SKILL.md` | Al crear o modificar pantallas, componentes, hooks o estilos.   | Arquitectura, stack, tokens, reglas de componentes, datos y rutas. |
| `modofriki-reader`   | `.opencode/skills/modofriki-reader/SKILL.md`   | Al tocar la vista de lectura, sus controles, atajos o progreso. | Modos de lectura, controles, atajos, persistencia y accesibilidad. |
| `modofriki-delivery` | `.opencode/skills/modofriki-delivery/SKILL.md` | Al cerrar un paso, verificar el proyecto o preparar commits.    | Definición de terminado, formato de commits y prohibición de push. |

### `modofriki-frontend`

Define cómo se construye la interfaz:

- React 19, Vite 8, TypeScript 6, Tailwind v4 y React Router v7.
- Tema oscuro con naranja como único acento; tokens en `src/styles/tokens.css`.
- Componentes pequeños, props tipadas, `cn()` para clases condicionales.
- Los datos pasan por `src/services/*` y `src/lib/api.ts`; no se usa `fetch`
  directo en componentes.
- Las consultas usan `useAsync` o los hooks de dominio.
- Las rutas y los roles están documentados en la propia skill y en
  `references/routes.md`.

### `modofriki-reader`

Define la experiencia del lector:

- Modo cascada y modo paginado.
- Barra superior, navegación entre capítulos, progreso, ancho y zoom.
- Atajos `←`/`A`, `→`/`D`, `F`, `M` y `Escape`.
- Progreso por serie en `localStorage` (`modofriki_progress`).
- El backend registra capítulos leídos; la página exacta se guarda localmente.
- Accesibilidad: `aria-label`, foco visible y respeto por
  `prefers-reduced-motion`.

### `modofriki-delivery`

Define el cierre de cada paso:

- Trabajar en la rama actual; nunca hacer `git push`.
- Revisar el diff, ejecutar `npm run build`, `npm run lint` y `npm run test:run`.
- Corregir errores antes de commitear.
- Commits convencionales en español:
  `tipo(alcance): descripción breve`.
- No modificar `ModoFriki-Backend` ni commitear `node_modules`, `dist` o `.env`
  reales.

### Plugin de seguridad

`.opencode/plugins/modofriki-guard.ts` registra un hook `execute.before` que
bloquea:

- `git push`
- comandos destructivos como `rm -rf`, `rmdir /s` o `format X:`
- edición de `ModoFriki-Backend`, `.git` y archivos `.env` reales

No es una skill ni un agente: es una capa de protección del harness.

## Hooks

Los 18 hooks viven en `src/hooks/`, se exportan con nombre y se importan con el
alias `@/hooks/<archivo>`. La mayoría de los hooks de datos se apoyan en
`useAsync`.

### Resumen

| Hook                      | Grupo           | Para qué sirve                                                               | Estado  |
| ------------------------- | --------------- | ---------------------------------------------------------------------------- | ------- |
| `useAsync`                | Infraestructura | Carga datos asíncronos por `key`, conserva datos previos y permite recargar. | Activo  |
| `useLocalStorage`         | Infraestructura | Estado sincronizado con `localStorage`.                                      | Activo  |
| `useDebounce`             | Infraestructura | Retrasa un valor para evitar búsquedas por cada tecla.                       | Activo  |
| `useClickOutside`         | Infraestructura | Detecta clics fuera de un elemento.                                          | Activo  |
| `useHotkeys`              | Infraestructura | Registra atajos de teclado normalizados.                                     | Activo  |
| `useLockBodyScroll`       | Infraestructura | Bloquea el scroll del body mientras hay un overlay.                          | Activo  |
| `useDocumentTitle`        | Infraestructura | Actualiza el título del documento.                                           | Activo  |
| `useScrollDirection`      | Infraestructura | Detecta dirección y desplazamiento del scroll.                               | Activo  |
| `usePrefersReducedMotion` | Infraestructura | Lee `prefers-reduced-motion`.                                                | Activo  |
| `useMediaQuery`           | Infraestructura | Evalúa una media query.                                                      | Sin uso |
| `useIntersectionObserver` | Infraestructura | Detecta cuando un elemento entra en viewport.                                | Sin uso |
| `usePagination`           | Infraestructura | Paginación local por cantidad de items.                                      | Sin uso |
| `useAuth`                 | Puente          | Acceso tipado a `AuthContext`.                                               | Activo  |
| `useLibrary`              | Puente          | Acceso tipado a `LibraryContext`.                                            | Activo  |
| `useUI`                   | Puente          | Acceso tipado a `UIContext`.                                                 | Activo  |
| `useCatalog`              | Dominio         | Consultas de obras, capítulos, géneros y tipos.                              | Activo  |
| `useReading`              | Dominio         | Estadísticas y progreso de lectura.                                          | Activo  |
| `useReaderSettings`       | Dominio         | Preferencias del lector persistidas.                                         | Activo  |

### Infraestructura

#### `useAsync`

**Archivo:** `src/hooks/useAsync.ts`

```ts
useAsync<T>(load: () => Promise<T>, key: string, enabled = true)
```

- Ejecuta `load` cuando cambia `key` o se llama a `reload()`.
- Conserva `data` anterior en `staleData` para evitar parpadeos.
- Devuelve `data`, `staleData`, `loading`, `error`, `reload` y `setData`.
- Con `enabled = false` no ejecuta la consulta; útil cuando falta sesión.
- Es la base de `useCatalog`, `useReading` y de las consultas directas.

Se usa en `CatalogView`, `RankingSection`, `WorksTab`, `ChaptersPanel`,
`PopularSection`, `ReportsTab`, `LatestChapters`, `HeroFeatured`, `ProfileView`,
`ContinueReading`, `CommentSection`, `CommandPalette` y `RankingsPage`.

#### `useLocalStorage`

**Archivo:** `src/hooks/useLocalStorage.ts`

```ts
useLocalStorage<T>(key: string, initialValue: T)
```

Devuelve `[value, setValue]` y escribe en `localStorage` mediante
`readStorage`/`writeStorage`. Se usa en `LibraryContext`, `UIContext` y
`useReaderSettings`.

#### `useDebounce`

**Archivo:** `src/hooks/useDebounce.ts`

```ts
useDebounce<T>(value: T, delay = 300): T
```

Retrasa la actualización del valor. Se usa en `CatalogView`, `WorksTab` y
`CommandPalette`.

#### `useClickOutside`

**Archivo:** `src/hooks/useClickOutside.ts`

```ts
useClickOutside<T extends HTMLElement>(onOutside: () => void)
```

Devuelve un `ref`; llama a `onOutside` al hacer clic o tocar fuera. Se usa en
`Header`.

#### `useHotkeys`

**Archivo:** `src/hooks/useHotkeys.ts`

```ts
useHotkeys(handlers: Record<string, (event: KeyboardEvent) => void>, enabled = true)
```

Normaliza `ctrl`/`meta` como `mod`, más `alt`, `shift` y la tecla. Ignora los
atajos sin `mod` cuando el foco está en un input, textarea o elemento editable.
Se usa en `AppShell` y `ReaderView`.

#### `useLockBodyScroll`

**Archivo:** `src/hooks/useLockBodyScroll.ts`

```ts
useLockBodyScroll(locked: boolean): void
```

Guarda el `overflow` previo del body, lo bloquea mientras `locked` sea `true` y
lo restaura al desmontar. Se usa en `MobileNav` y `ui/modal`.

#### `useDocumentTitle`

**Archivo:** `src/hooks/useDocumentTitle.ts`

```ts
useDocumentTitle(title: string): void
```

Aplica `"<título> — ModoFriki"` o `"ModoFriki"` si el título está vacío. Se usa
en las páginas.

#### `useScrollDirection`

**Archivo:** `src/hooks/useScrollDirection.ts`

```ts
useScrollDirection(): { direction: 'up' | 'down'; scrolled: boolean }
```

Detecta la dirección del scroll con un umbral de 8 px y marca `scrolled` cuando
se superan 12 px. Se usa en `Header`.

#### `usePrefersReducedMotion`

**Archivo:** `src/hooks/usePrefersReducedMotion.ts`

```ts
usePrefersReducedMotion(): boolean
```

Lee y escucha `(prefers-reduced-motion: reduce)`. Se usa en `HeroFeatured`.

#### `useMediaQuery`

**Archivo:** `src/hooks/useMediaQuery.ts`

```ts
useMediaQuery(query: string): boolean
```

Evalúa una media query y escucha cambios. **No tiene consumidores actuales.**

#### `useIntersectionObserver`

**Archivo:** `src/hooks/useIntersectionObserver.ts`

```ts
useIntersectionObserver<T extends HTMLElement>(options?)
```

Devuelve `{ ref, inView }` y deja de observar después de la primera intersección.
**No tiene consumidores actuales.**

#### `usePagination`

**Archivo:** `src/hooks/usePagination.ts`

```ts
usePagination(totalItems: number, pageSize = 9)
```

Devuelve página actual, total de páginas, rango `start`/`end` y acciones
`setPage`, `next`, `previous`. **No tiene consumidores actuales.**

### Puentes de contexto

#### `useAuth`

**Archivo:** `src/hooks/useAuth.ts`

Lee `AuthContext` y lanza un error si se usa fuera de `AuthProvider`. Expone
`user`, `loading`, `login`, `register` y `logout`. Se usa en `LibraryContext`,
`Header`, `MobileNav`, `PopularSection`, `ProfileView`, `ContinueReading`,
`SeriesDetail`, `AuthView`, `ProtectedRoute`, `AdminPage`, `CommentItem` y
`CommentSection`.

#### `useLibrary`

**Archivo:** `src/hooks/useLibrary.ts`

Lee `LibraryContext` y lanza un error si se usa fuera de `LibraryProvider`.
Gestiona favoritos y progreso de lectura. Se usa en `HeroFeatured`, `ProfileView`,
`ContinueReading`, `FavoritesView`, `ReaderView`, `Header`, `MobileNav` y
`SeriesDetail`.

#### `useUI`

**Archivo:** `src/hooks/useUI.ts`

Lee `UIContext` y lanza un error si se usa fuera de `UIProvider`. Expone el estado
y las acciones de la paleta de comandos, el menú móvil y el banner descartable.
Se usa en `AnnouncementBar`, `AppShell`, `MobileNav`, `Header` y
`CommandPalette`.

### Dominio

#### `useCatalog`

**Archivo:** `src/hooks/useCatalog.ts`

| Hook           | Firma                           | Comportamiento                           |
| -------------- | ------------------------------- | ---------------------------------------- |
| `useGenres`    | `useGenres()`                   | Lista géneros con caché de sesión.       |
| `useWorkTypes` | `useWorkTypes()`                | Lista tipos de obra con caché de sesión. |
| `useWork`      | `useWork(workId)`               | Carga una obra.                          |
| `useChapters`  | `useChapters(workId)`           | Carga capítulos en orden descendente.    |
| `useChapter`   | `useChapter(workId, chapterId)` | Carga un capítulo concreto.              |

`invalidateTaxonomy()` limpia las cachés de géneros y tipos; se llama después de
crear taxonomía en el panel de administración.

Se usa en `CatalogView`, `WorkForm`, `TaxonomyTab`, `ContinueReading`,
`ReaderPage`, `DetailPage` y `GenresPage`.

#### `useReading`

**Archivo:** `src/hooks/useReading.ts`

| Hook              | Firma                                      | Comportamiento                                                                                        |
| ----------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `useWorkStats`    | `useWorkStats(workId)`                     | Carga estadísticas públicas y registra la visita una sola vez por apertura.                           |
| `useWorkProgress` | `useWorkProgress(workId, onRatingChange?)` | Carga el progreso del usuario y expone `readIds`, `setRead` y `setScore` con actualización optimista. |

`useWorkProgress` requiere sesión: pasa `enabled = Boolean(user)` a `useAsync`.
Se usa en `SeriesDetail`.

#### `useReaderSettings`

**Archivo:** `src/hooks/useReaderSettings.ts`

```ts
useReaderSettings()
```

Devuelve `settings`, `setMode`, `setWidth`, `setZoom` y `reset`. Persiste en
`modofriki_reader` con estos valores por defecto:

```ts
{ mode: 'cascade', width: 'normal', zoom: 100 }
```

El zoom se limita a `70–140`. Se usa en `ProfileView` y `ReaderView`.

## Contextos detrás de los hooks puente

| Contexto         | Responsabilidad                                                                                             |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `AuthContext`    | Sesión, login, registro, logout y restauración con `getMe()`. Reacciona al evento `modofriki:unauthorized`. |
| `LibraryContext` | Favoritos contra la API con actualización optimista y rollback; progreso de lectura local por serie.        |
| `UIContext`      | Paleta de comandos, menú móvil y banner descartable.                                                        |

## Claves de `localStorage`

| Clave                | Contenido                                  |
| -------------------- | ------------------------------------------ |
| `modofriki_token`    | Token de autenticación.                    |
| `modofriki_progress` | Progreso de lectura por serie.             |
| `modofriki_reader`   | Preferencias del lector.                   |
| `modofriki_ui`       | Estado de la interfaz (banner descartado). |

## Convenciones para nuevos hooks

1. Un hook por archivo, exportado con nombre.
2. Si consulta la API, envuélvelo en `useAsync` con una `key` única.
3. Usa `enabled` para dependencias de sesión o parámetros opcionales.
4. Las mutaciones deben ser optimistas y revertir si la API falla.
5. Persiste con `useLocalStorage` y una clave `modofriki_*` declarada en
   `src/lib/constants.ts`.
6. No dejes hooks sin uso: si es temporal, documenta el motivo; si no, elimínalo.

## Verificación

```bash
npm run build
npm run lint
npm run test:run
```
