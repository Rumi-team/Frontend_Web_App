import type { StyledSegment } from "@/lib/types/messages"

/**
 * Tool-call patterns that may leak from the agent's LLM output.
 * Ported from iOS Message.swift sanitization.
 */
const TOOL_CALL_PATTERNS = [
  /\(?\s*(?:`?\s*mark_program_step\s*`?\s*)+\(\s*\d+\s*\)\s*\)?/gi,
  /\(?\s*`?\s*generate_future_visualization\s*`?\s*\([^)]*\)\s*\)?/gi,
  /\(?\s*`?\s*select_program\s*`?\s*\([^)]*\)\s*\)?/gi,
]

const PUNCTUATION_ONLY = /^[()[\]{}.,:;]+$/

/**
 * Removes leaked tool-call syntax from agent transcript text.
 */
export function sanitizeAgentText(text: string): string {
  let sanitized = text

  for (const pattern of TOOL_CALL_PATTERNS) {
    sanitized = sanitized.replace(pattern, "")
  }

  // Drop lines that became punctuation-only after tool-call removal
  const lines = sanitized.split("\n").filter((line) => {
    const trimmed = line.trim()
    if (trimmed === "") return true
    return !PUNCTUATION_ONLY.test(trimmed)
  })

  sanitized = lines.join("\n")

  // Collapse 3+ consecutive newlines to 2
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n")

  return sanitized.trim()
}

/**
 * Parses markdown bold (**text**) into styled segments.
 * Ported from iOS Message.swift parseStyledText().
 */
export function parseStyledText(rawText: string): StyledSegment[] {
  const trimmed = rawText.trim()
  if (!trimmed) return []

  const segments: StyledSegment[] = []
  let remaining = trimmed

  while (remaining.length > 0) {
    const openIdx = remaining.indexOf("**")
    if (openIdx === -1) {
      // No more bold markers
      segments.push({ text: remaining, isHighlight: false })
      break
    }

    // Text before the opening **
    if (openIdx > 0) {
      segments.push({
        text: remaining.slice(0, openIdx),
        isHighlight: false,
      })
    }

    const afterOpen = remaining.slice(openIdx + 2)
    const closeIdx = afterOpen.indexOf("**")
    if (closeIdx === -1) {
      // No closing ** — treat the rest as plain text
      segments.push({
        text: remaining.slice(openIdx),
        isHighlight: false,
      })
      break
    }

    // Highlighted text between ** ... **
    const highlighted = afterOpen.slice(0, closeIdx)
    if (highlighted) {
      segments.push({ text: highlighted, isHighlight: true })
    }

    remaining = afterOpen.slice(closeIdx + 2)
  }

  return segments
}
