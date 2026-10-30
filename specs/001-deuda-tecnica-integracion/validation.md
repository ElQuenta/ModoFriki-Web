# Evidencia de validación

**Revisión:** preparación frontend de US2
**Fecha:** 2026-10-30
**Alcance:** frontend y fixtures aislados. No se usó un backend compatible ni se acreditan permisos, auditoría o persistencia reales.

## Verificación local

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Build de producción | Correcto | `npm run build` (TypeScript y Vite) |
| Lint | Correcto | `npm.cmd run lint` (ESLint, sin errores ni warnings) |
| Pruebas focalizadas US2 | 38/38 correctas, 7 archivos | `admin-policy`, `admin-validation`, `zoned-date`, `user-admin`, `AuthRevalidation`, `UsersTab` y `AssignmentsPanel` |
| Peticiones a capacidades no publicadas | Ninguna | `user-admin.test.ts`: operaciones rechazadas con `CapabilityUnavailable` antes de HTTP |

Las pruebas de componentes usan un gateway falso inyectado explícitamente. Ese resultado solo demuestra comportamiento de frontend bajo fixtures.

## Evidencia simulada por dependencia

| Dependencia | Preparación comprobada | Estado real |
| --- | --- | --- |
| DEP-001 listado | Página/continuación opaca en el puerto, estados de indisponibilidad y `unknown` distinto de `none`; tabla sin correo ni total inventado | Pendiente de contrato y servidor |
| DEP-002 roles | Política BASIC ↔ EDITOR, protecciones de cuenta propia/ADMIN, confirmación de UI y relectura del rol del destinatario | Pendiente de contrato, permisos y persistencia reales |
| DEP-003 sanciones | Validación de motivo/instantes, horas inexistentes/ambiguas, formularios temporal/permanente y hook local de consulta de restricción preparado | Pendiente de contrato, autorización, vencimiento y bloqueo real |
| DEP-007 asignaciones | Puerto y panel de consulta/búsqueda/continuación con confirmación, detección previa de duplicado y revocación separada | Pendiente de contrato, autorización y persistencia reales |
| Revalidación de sesión | Foco, deduplicación en curso, cambio de rol, respuesta tardía de otra sesión, 403 y fallo recuperable | Preparación frontend verificada; no acredita roles guardados en servidor |

## Limitaciones pendientes

- El gateway de producción declara indisponibles listado, cambios de rol, sanciones y asignaciones; no usa rutas ni DTO supuestos. La interfaz no contiene filas de demostración.
- No se verificaron cambios tras recarga, rechazos directos del servidor, trazabilidad, reglas de vencimiento ni persistencia de asignaciones. Corresponden a DEP-001/002/003/007 y a las tareas condicionales T041–T048.
- El estado `unknown` no se presenta como ausencia confirmada de sanción y no bloquea todos los comentarios. Las restricciones reales requieren DEP-003.
- La integración del hook con `CommentSection` y `CommentItem` (T038) se pospone hasta que los cambios T019–T023 de US1 estén presentes en `dev`, según la dependencia explícita del spec.
- La revisión del checklist UX/datos sigue siendo responsabilidad del revisor y no se altera en esta implementación.

---

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
