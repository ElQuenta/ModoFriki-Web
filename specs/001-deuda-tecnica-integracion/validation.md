# Validación de US1 — comentarios y spoilers

**Fecha:** 2026-10-29  
**Rama:** `US1-comentarios-con-formato-y-spoilers`  
**Capa:** frontend local; las pruebas de comunidad usan servicios simulados.

## Resultado

- `npm run build`: correcto.
- `npm run lint`: correcto.
- Pruebas focalizadas: 6 archivos, 27 pruebas correctas. Cubren formato permitido, spoilers independientes y literales, URLs peligrosas, límite de 10 000 unidades UTF-16, preservación del borrador, paginación/deduplicación, doble envío, aislamiento por cuenta/destino, resultados tardíos, revisión vigente, conflicto 409 y comentarios eliminados con respuestas.
- `git diff --check`: correcto.

Estas pruebas acreditan comportamiento del frontend. No acreditan publicación, permisos ni persistencia del backend; no se ejecutó un recorrido E2E real en esta verificación.

## Pendiente

- Medir la latencia de preview indicada en T024 en Chromium con CPU 4x, cinco calentamientos y 30 muestras; todavía no se ha registrado p95.
- Completar el recorrido real de INT026–INT032 cuando haya un entorno de backend disponible y registrar publicación/recarga por separado.
- La restricción real de crear, responder y editar comentarios por sanción sigue dependiendo de DEP-003. El renderer y editor de US1 no dependen de ese contrato.

## Entorno y hooks

El hook local SessionStart se ejecutó y aportó el contexto del proyecto. El hook PostToolUse se invocó al cerrar la implementación y recordó build, lint y pruebas; las tres verificaciones finalizaron correctamente. El hook PreToolUse solo bloquea `git push`, acción que no se realizó.

La checklist `checklists/ux-datos.md` conserva sus 52 puntos sin revisar; no se modificó. El script de prerrequisitos de Spec Kit no pudo ejecutarse porque PowerShell tiene bloqueada la ejecución de scripts. No existe `.specify/extensions.yml`.
