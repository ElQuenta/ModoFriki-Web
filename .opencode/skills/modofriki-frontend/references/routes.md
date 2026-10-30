# Rutas de ModoFriki

| Ruta                       | Página         | Descripción                                                   |
| -------------------------- | -------------- | ------------------------------------------------------------- |
| `/`                        | Home           | Hero, continuar leyendo, novedades y rankings.                |
| `/series`                  | Catálogo       | Búsqueda, filtros y paginación.                               |
| `/series/:id/:slug?`       | Detalle        | Ficha, capítulos y comentarios.                               |
| `/read/:workId/:chapterId` | Lector         | Modo cascada/paginado y progreso.                             |
| `/genres`                  | Géneros        | Géneros y tags.                                               |
| `/rankings`                | Rankings       | Obras mejor valoradas.                                        |
| `/favorites`               | Favoritos      | Biblioteca personal; requiere sesión.                         |
| `/profile`                 | Perfil         | Historial y preferencias; requiere sesión.                    |
| `/admin`                   | Administración | Obras, taxonomía y reportes; requiere rol `ADMIN` o `EDITOR`. |
| `/login`                   | Login          | Autenticación.                                                |
| `/register`                | Registro       | Creación de cuenta.                                           |
| `*`                        | 404            | Página no encontrada.                                         |

El lector oculta el header y el footer para maximizar el área de lectura.
