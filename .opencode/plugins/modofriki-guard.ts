import { Plugin } from "@opencode/plugin"

const PUSH = /\bgit\s+push\b/i
const DESTRUCTIVE = /\b(rm\s+-rf|rmdir\s+\/s|format\s+[a-z]:)\b/i
const BLOCKED_PATHS = ["modofrikibackend", ".git", ".env"]

function inputPath(input: unknown): string {
  if (!input || typeof input !== "object") return ""
  const record = input as Record<string, unknown>
  const value = record.filePath ?? record.path ?? record.file_path
  return typeof value === "string" ? value.replaceAll("\\", "/").toLowerCase() : ""
}

export default Plugin.define({
  id: "modofriki.guard",
  async setup(ctx) {
    await ctx.tool.hook("execute.before", (event) => {
      if (event.tool === "shell") {
        const command = String((event.input as { command?: string }).command ?? "")
        if (PUSH.test(command)) {
          throw new Error("ModoFriki guard: git push está deshabilitado. El push lo hace el usuario.")
        }
        if (DESTRUCTIVE.test(command)) {
          throw new Error("ModoFriki guard: comando destructivo bloqueado.")
        }
      }

      if (event.tool === "edit" || event.tool === "write") {
        const path = inputPath(event.input)
        if (path.includes("modofrikibackend")) {
          throw new Error("ModoFriki guard: el backend está fuera del alcance de esta fase.")
        }
        if (path.includes("/.git/") || path.endsWith("/.git")) {
          throw new Error("ModoFriki guard: no se edita el directorio .git.")
        }
        const envFile = path.split("/").pop() ?? ""
        if (envFile === ".env" || (envFile.startsWith(".env.") && envFile !== ".env.example")) {
          throw new Error("ModoFriki guard: no se editan archivos de entorno reales.")
        }
      }
    })
  },
})
