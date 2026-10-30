import { readFile } from "node:fs/promises"

async function readInput() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
  } catch {
    return {}
  }
}

await readInput()

const additionalContext = [
  "ModoFriki-Web: React 19, Vite 8 y TypeScript 6.",
  "El frontend consume la API real configurada en VITE_API_URL; conserva contratos y servicios existentes.",
  "Rutas clave: /, /series, /series/:id/:slug?, /read/:workId/:chapterId, /favorites, /profile, /admin, /login y /register.",
  "Antes de cerrar cambios relevantes, ejecuta npm run build, npm run lint y las pruebas pertinentes.",
  "Perfiles disponibles: modofriki-ui-ux (interfaz), modofriki-integration (datos y estado) y modofriki-frontend-qa (calidad).",
  "La unica accion bloqueada por politica local es git push."
].join("\n")

console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext
    }
  })
)
