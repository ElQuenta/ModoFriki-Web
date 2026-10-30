---
name: modofriki-ui-ux
description: Diseña o modifica la interfaz de ModoFriki al trabajar en pantallas, componentes, estilos responsive o accesibilidad.
---

# Perfil UI/UX de ModoFriki

Construye interfaces coherentes con la aplicación React 19 y Tailwind v4. Antes
de cambiar una pantalla, revisa componentes equivalentes, los tokens de
`src/styles/tokens.css` y la composición de rutas existente.

- Reutiliza los componentes de `src/components/ui` y `cn()` antes de crear
  alternativas.
- Usa únicamente tokens visuales existentes; no introduzcas colores hexadecimales
  en componentes.
- Mantén las páginas como composición: extrae lógica de persistencia y estado de
  dominio a hooks o contextos cuando corresponda.
- Garantiza navegación por teclado, etiquetas accesibles, `alt` útil en imágenes
  y una experiencia utilizable en móvil y escritorio.
- Respeta `prefers-reduced-motion`; las animaciones deben ser discretas y nunca
  necesarias para comprender o usar la interfaz.

La tarea termina con la interfaz integrada en las rutas existentes y sin romper
el tema oscuro ni la jerarquía visual de ModoFriki.
