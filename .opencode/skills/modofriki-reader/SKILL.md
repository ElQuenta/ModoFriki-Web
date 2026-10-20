---
name: ModoFriki Reader
description: Reglas de experiencia para el lector de cómics de ModoFriki. Úsalo al implementar o modificar la vista de lectura, sus controles, atajos o progreso.
---

# ModoFriki Reader

## Objetivo

Lectura cómoda, rápida y sin distracciones. El lector ocupa toda la pantalla y
oculta header, footer y anuncios.

## Modos

- **Cascada:** todas las páginas se apilan verticalmente. Ideal para móvil.
- **Paginado:** una página a la vez, con navegación anterior/siguiente.

## Controles

- Barra superior con título, capítulo, selector de modo y ajustes.
- Navegación inferior entre capítulos.
- Barra de progreso fina en la parte superior.
- Ajustes: ancho de lectura y zoom.
- Botón para volver al detalle de la serie.

## Atajos

| Tecla | Acción |
| --- | --- |
| `←` / `A` | Página o capítulo anterior |
| `→` / `D` | Página o capítulo siguiente |
| `F` | Pantalla completa |
| `Escape` | Salir de pantalla completa o cerrar ajustes |
| `M` | Cambiar modo de lectura |

## Persistencia

- Guarda el progreso en `localStorage` con la clave `modofriki_progress`.
- El progreso se guarda por serie: capítulo, página y porcentaje.
- Muestra "Continuar leyendo" en la home cuando exista progreso.

## Accesibilidad

- Controles con `aria-label`.
- Foco visible.
- No bloquear el scroll cuando el lector está en modo cascada.
- Respetar `prefers-reduced-motion`.
