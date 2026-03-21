/**
 * POST /api/feedback/process-doc
 *
 * Accepts a PDF or Word document upload, extracts text, calls Claude
 * to summarize it as session feedback, and returns the result as plain text.
 *
 * Env vars: ANTHROPIC_API_KEY
 */

import { NextRequest, NextResponse } from "next/server"
import * as mammoth from "mammoth"

export const maxDuration = 30

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB

async function callClaude(prompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`Claude API error: ${res.status} — ${err}`)
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>
  }
  return data.content.find((b) => b.type === "text")?.text ?? ""
}

async function callClaudeWithPdf(
  pdfBase64: string,
  mediaType: string,
): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set")

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "pdfs-2024-09-25",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: { type: "base64", media_type: mediaType, data: pdfBase64 },
            },
            {
              type: "text",
              text: "This document is from a user sharing feedback about their coaching session. Summarize the key feedback points in 2-4 concise sentences, written in first person as if the user is leaving a review. Focus on what they found helpful, what could improve, and any specific thoughts. Reply with only the summary text, no preamble.",
            },
          ],
        },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`Claude API error: ${res.status} — ${err}`)
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>
  }
  return data.content.find((b) => b.type === "text")?.text ?? ""
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: "File too large (max 5 MB)" }, { status: 400 })
    }

    const name = file.name.toLowerCase()
    let summary = ""

    if (name.endsWith(".pdf")) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      summary = await callClaudeWithPdf(base64, "application/pdf")
    } else if (name.endsWith(".docx") || name.endsWith(".doc")) {
      const bytes = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
      const text = result.value.trim()

      if (!text) {
        return NextResponse.json({ error: "Could not extract text from document" }, { status: 422 })
      }

      const truncated = text.length > 6000 ? text.slice(0, 6000) + "\n\n[...]" : text
      summary = await callClaude(
        `This text is from a document a user uploaded to share feedback about their coaching session:\n\n${truncated}\n\nSummarize the key feedback points in 2-4 concise sentences, written in first person as if the user is leaving a review. Focus on what they found helpful, what could improve, and any specific thoughts. Reply with only the summary text, no preamble.`,
      )
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or Word document." },
        { status: 400 },
      )
    }

    return NextResponse.json({ text: summary })
  } catch (err) {
    console.error("[process-doc] Error:", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 },
    )
  }
}
