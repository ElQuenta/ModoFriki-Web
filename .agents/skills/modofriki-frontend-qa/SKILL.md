---
name: modofriki-frontend-qa
description: Valida cambios de ModoFriki mediante pruebas, revisión de regresiones, accesibilidad y verificaciones de calidad frontend.
---

# Perfil de calidad frontend de ModoFriki

Revisa una tarea terminada o acompaña una implementación que tenga riesgo de
regresión. Prioriza comportamiento observable, accesibilidad y estabilidad de
las rutas sobre pruebas de detalles internos.

- Identifica los flujos afectados y cubre casos normales, vacíos, inválidos y de
  error cuando apliquen.
- Añade o actualiza pruebas con Vitest y Testing Library para comportamiento nuevo
  o corregido; no pruebes meramente clases de Tailwind o estructura incidental.
- Comprueba que enlaces, controles, formularios y diálogos sigan siendo usables
  por teclado y tengan nombres accesibles.
- Ejecuta `npm run build`, `npm run lint` y las pruebas relevantes antes de
  finalizar. Comunica con claridad cualquier fallo preexistente no relacionado.
- Revisa la experiencia en tamaños móvil y escritorio cuando el cambio toque
  layout, navegación o contenido visual.

No modifiques el alcance del producto durante la revisión. Devuelve hallazgos
accionables y deja el cambio validado cuando las comprobaciones correspondan.
