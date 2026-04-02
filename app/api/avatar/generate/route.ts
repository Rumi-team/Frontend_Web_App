import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"

// Allowlists for input validation (prevent prompt injection)
const VALID_GENDERS = ["male", "female", "non-binary", "neutral", ""]
const VALID_SKIN_TONES = [
  "#FFDFC4", "#F0C8A0", "#D4A574", "#C68642",
  "#A0522D", "#8B4513", "#654321", "#3B2219",
]
const VALID_EXPRESSIONS = ["determined", "curious", "calm", "bold"]

export async function POST(request: Request) {
  // Auth check
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "Avatar generation is not configured" },
      { status: 503 }
    )
  }

  let body: { gender?: string; skinTone?: string; expression?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { gender = "neutral", skinTone = "#D4A574", expression = "determined" } = body

  // Validate inputs against allowlists
  if (!VALID_GENDERS.includes(gender)) {
    return NextResponse.json({ error: "Invalid gender value" }, { status: 400 })
  }
  if (!VALID_SKIN_TONES.includes(skinTone)) {
    return NextResponse.json({ error: "Invalid skin tone value" }, { status: 400 })
  }
  if (!VALID_EXPRESSIONS.includes(expression)) {
    return NextResponse.json({ error: "Invalid expression value" }, { status: 400 })
  }

  // Map skin tone hex to a descriptive name for the prompt
  const toneIndex = VALID_SKIN_TONES.indexOf(skinTone)
  const toneNames = ["very light", "light", "light medium", "medium", "medium dark", "dark", "very dark", "deep dark"]
  const toneName = toneNames[toneIndex] || "medium"

  const expressionMap: Record<string, string> = {
    determined: "a determined, confident expression",
    curious: "a curious, thoughtful expression",
    calm: "a calm, peaceful expression",
    bold: "a bold, energetic expression",
  }

  const genderDesc = gender === "non-binary" ? "person" : gender === "neutral" ? "person" : `${gender} person`

  const prompt = `Create a friendly, warm, Pixar-style portrait avatar of a ${genderDesc} with ${toneName} skin tone and ${expressionMap[expression] || "a friendly expression"}. The style should be rounded, colorful, and approachable like a modern app mascot. Clean solid background, no text, head and shoulders only, centered composition.`

  // Try available Gemini models for image generation
  const models = [
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
  ]

  for (const model of models) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseModalities: ["IMAGE"],
            },
          }),
        }
      )

      clearTimeout(timeout)

      if (!response.ok) continue

      const data = await response.json()
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: { mimeType: string } }) =>
          p.inlineData?.mimeType?.startsWith("image/")
      )

      if (imagePart?.inlineData) {
        return NextResponse.json({
          image: `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`,
        })
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return NextResponse.json(
          { error: "Avatar generation timed out. Please try again." },
          { status: 504 }
        )
      }
      continue
    }
  }

  return NextResponse.json(
    { error: "Avatar generation is temporarily unavailable. Please try again or use a preset avatar." },
    { status: 503 }
  )
}
