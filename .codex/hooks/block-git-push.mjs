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
const isGitPush = /\bgit(?:\s+(?:-[^\s]+|--[^\s]+|[^\s]+))*\s+push\b/i.test(command)

if (isGitPush) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "git push esta bloqueado en este proyecto. El push lo realiza el usuario."
      }
    })
  )
}
