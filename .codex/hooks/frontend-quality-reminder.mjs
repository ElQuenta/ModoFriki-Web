async function readInput() {
  const chunks = []
  for await (const chunk of process.stdin) chunks.push(chunk)

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
  } catch {
    return {}
  }
}

const input = await readInput()
const command = typeof input.tool_input?.command === "string" ? input.tool_input.command : ""
const touchesFrontendSource = /(?:^|[\\/])src[\\/][^\r\n]*\.(?:ts|tsx)\b/i.test(command)

if (touchesFrontendSource) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext:
          "Cambio frontend detectado: revisa tipado, accesibilidad y pruebas relevantes. Ejecuta build, lint y tests al completar la tarea; este hook no los ejecuta automaticamente."
      }
    })
  )
}
