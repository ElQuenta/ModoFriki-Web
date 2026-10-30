---
name: corregir-frontend
description: Ejecuta las pruebas E2E del frontend ModoFriki con Playwright, corrige en la causa raíz los bugs del front que encuentre, vuelve a probar los casos afectados hasta que pasen y valida con lint, tests y build. No hace commit. Usar cuando el usuario pida corregir los fallos de las pruebas E2E/Playwright, arreglar los errores del frontend detectados o invoque /corregir-frontend.
argument-hint: "[casos opcionales: E2E-05 | B | todos]"
---

# Corregir el frontend: $ARGUMENTS

## 1. Rama y punto de partida
- `git status`: si hay cambios sin commit ajenos a esto, detente y pregunta.
- Si estás en `dev`, `main` o `qa`, crea `fix/e2e-<resumen>` desde `dev` (`git switch dev && git pull && git switch -c fix/e2e-...`).

## 2. Probar
Sigue los pasos 1 a 3 de `.claude/skills/probar-frontend/SKILL.md` (entorno + `tester-e2e`). Si no hay fallos, termina: "Nada que corregir".

## 3. Triage (con el reporte)
| Tipo | Qué haces |
| --- | --- |
| 🐛 Bug del front | Se corrige (paso 4) |
| 🔌 Bug del backend | **No** lo parchees en el front. Lístalo con la evidencia y recomienda `/corregir-backend` en el repo del backend |
| 🧪 Caso desactualizado | **No** toques `e2e/flows.md`. Lístalo con la evidencia: solo el usuario decide si se cambia el caso |
| ⚙️ Entorno | Arréglalo si está a tu alcance; si no, repórtalo |
| Duda | Pregunta antes de tocar nada |

Regla de oro: **nunca cambies un caso de prueba ni ocultes un error (try/catch vacío, silenciar la consola, saltarse el paso) para que algo pase**.

## 4. Corregir (tú)
Por cada bug del front (agrupa los que comparten causa):
1. Lee el componente completo y busca **todos** los usos de lo que vas a tocar (`Grep`). Corrige donde nace el problema, no solo donde se ve. Ejemplo: datos de demostración que quedaron hardcodeados se reemplazan por los datos reales de la API, no por otro valor fijo.
2. Haz el cambio mínimo y sigue el estilo del archivo (Prettier: `npm run format` solo sobre lo que tocaste si hace falta).
3. Re-prueba solo los casos afectados con `tester-e2e`.
4. Máximo **2 rondas** por bug. Si sigue fallando, márcalo como pendiente con lo intentado y sigue con el siguiente.

## 5. Verificación final
Todo esto con resultado real:
- `tester-e2e` con todos los casos (que no se haya roto otra cosa).
- `npm run lint`, `npm run test:run` y `npm run build`.
- Revisa tu propio diff (`git diff`) buscando código muerto, `console.log` olvidados y cambios fuera del alcance.

## 6. Cerrar y reportar (no hagas commit)
- Detén lo que levantaste (paso 4 de `/probar-frontend`).
- Resultado antes → después (X/Y casos).
- Por cada bug corregido: causa raíz, archivo:línea y el caso que ahora pasa.
- Bugs del backend, casos desactualizados, dudas y pendientes.
- Validaciones ejecutadas con su resultado real.
- Siguiente paso para el usuario: revisar `git diff` y, con su OK, `commit fix(e2e): …` y merge `--no-ff` a `dev`. **Nunca hagas commit, merge ni push sin ese OK.**
