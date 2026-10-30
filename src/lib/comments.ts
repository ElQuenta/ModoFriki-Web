export const COMMENT_SOURCE_MAX_LENGTH = 10_000

export function validateCommentSource(source: string) {
  if (!source.trim()) return 'Escribe un comentario antes de publicarlo.'
  if (source.length > COMMENT_SOURCE_MAX_LENGTH)
    return `El comentario no puede superar ${COMMENT_SOURCE_MAX_LENGTH.toLocaleString('es-ES')} caracteres.`
  return undefined
}

