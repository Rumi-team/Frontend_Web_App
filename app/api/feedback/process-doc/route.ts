/**
 * POST /api/feedback/process-doc
 *
 * Accepts a PDF or Word document upload, extracts text, calls Gemini
 * via Vertex AI to summarize it as session feedback, and returns the
 * result as plain text.
 *
 * Env vars:
 *   VERTEX_AI_SA_KEY  — base64-encoded GCP service account JSON (needs roles/aiplatform.user)
 *   GCP_PROJECT_ID    — GCP project ID (e.g. conversational-agent-471406)
 *
 * The VERTEX_AI_SA_KEY can be the same JSON as RETENTION_SA_KEY if that SA
 * already has Vertex AI permissions.
 */

import { NextRequest, NextResponse } from "next/server"
import * as mammoth from "mammoth"
import { GoogleAuth } from "google-auth-library"
import { createSupabaseServerClient } from "@/lib/supabase-auth"

export const maxDuration = 30

const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB
const GEMINI_MODEL = "gemini-2.0-flash-001"
const VERTEX_REGION = "us-central1"

const FEEDBACK_PROMPT =
  "This document is from a user sharing feedback about their coaching session. " +
  "Summarize the key feedback points in 2-4 concise sentences, written in first person as if the user is leaving a review. " +
  "Focus on what they found helpful, what could improve, and any specific thoughts. " +
  "Reply with only the summary text, no preamble."

let cachedAuth: GoogleAuth | null = null

async function getVertexToken(): Promise<string> {
  const saKeyB64 = process.env.VERTEX_AI_SA_KEY
  const projectId = process.env.GCP_PROJECT_ID

  if (!saKeyB64 || !projectId) {
    throw new Error("VERTEX_AI_SA_KEY or GCP_PROJECT_ID not set")
  }

  if (!cachedAuth) {
    const credentials = JSON.parse(
      Buffer.from(saKeyB64, "base64").toString("utf-8"),
    )
    cachedAuth = new GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    })
  }

  const token = await cachedAuth.getAccessToken()
  if (!token) throw new Error("Failed to obtain Vertex AI access token")
  return token
}

async function callGemini(parts: unknown[]): Promise<string> {
  const projectId = process.env.GCP_PROJECT_ID!
  const token = await getVertexToken()

  const url =
    `https://${VERTEX_REGION}-aiplatform.googleapis.com/v1` +
    `/projects/${projectId}/locations/${VERTEX_REGION}` +
    `/publishers/google/models/${GEMINI_MODEL}:generateContent`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { maxOutputTokens: 400, temperature: 0.2 },
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => "")
    throw new Error(`Vertex AI error: ${res.status} — ${err}`)
  }

  const data = (await res.json()) as {
    candidates: Array<{
      content: { parts: Array<{ text?: string }> }
    }>
  }

  return (
    data.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text ?? ""
  )
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: "File too large (max 5 MB)" },
        { status: 400 },
      )
    }

    const name = file.name.toLowerCase()
    let summary = ""

    if (name.endsWith(".pdf")) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString("base64")
      summary = await callGemini([
        { inline_data: { mime_type: "application/pdf", data: base64 } },
        { text: FEEDBACK_PROMPT },
      ])
    } else if (name.endsWith(".docx")) {
      const bytes = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ buffer: Buffer.from(bytes) })
      const text = result.value.trim()

      if (!text) {
        return NextResponse.json(
          { error: "Could not extract text from document" },
          { status: 422 },
        )
      }

      const truncated =
        text.length > 6000 ? text.slice(0, 6000) + "\n\n[...]" : text

      summary = await callGemini([
        {
          text:
            "This text is from a document a user uploaded to share feedback about their coaching session:\n\n" +
            truncated +
            "\n\n" +
            FEEDBACK_PROMPT,
        },
      ])
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or .docx document." },
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
