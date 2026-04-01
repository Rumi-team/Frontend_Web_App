/**
 * Generate gender-matched avatar portraits for each Gemini voice persona.
 *
 * Uses gemini-3-pro-image-preview for AI image generation.
 * Requires: GOOGLE_API_KEY env var
 * Usage: npx tsx scripts/generate-avatars.ts
 *
 * Output: public/avatars/{voiceid}.png
 */

import * as fs from "fs"

const VOICES = [
  { id: "Gacrux", gender: "female", personality: "Warm, grounding, steady, present", color: "#34D399", style: "mature woman, warm earth tones" },
  { id: "Fenrir", gender: "male", personality: "Bold, direct, confident, action-oriented", color: "#EF4444", style: "strong confident man, bold warm tones" },
  { id: "Leda", gender: "female", personality: "Calm, steady, composed, reassuring", color: "#60A5FA", style: "serene young woman, cool blue tones" },
  { id: "Aoede", gender: "female", personality: "Lyrical, flowing, creative, expressive", color: "#EC4899", style: "artistic woman, pink and magenta tones" },
  { id: "Enceladus", gender: "male", personality: "Deep, resonant, wise, contemplative", color: "#8B5CF6", style: "thoughtful man, deep purple tones" },
  { id: "Erinome", gender: "female", personality: "Gentle, nurturing, patient, empathetic", color: "#F59E0B", style: "kind gentle woman, warm amber tones" },
  { id: "Algenib", gender: "male", personality: "Clear, focused, analytical, precise", color: "#06B6D4", style: "focused intelligent man, teal cyan tones" },
  { id: "Achernar", gender: "female", personality: "Bright, uplifting, optimistic, energizing", color: "#FFD41A", style: "bright cheerful woman, golden yellow tones" },
  { id: "Sulafat", gender: "female", personality: "Soft, reflective, thoughtful, introspective", color: "#FB923C", style: "reflective woman, soft orange tones" },
]

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error("Set GOOGLE_API_KEY or GEMINI_API_KEY env var")
  process.exit(1)
}

const BASE_PROMPT = `Create a stylized illustrated portrait avatar for an AI coaching app called Rumi.
The portrait should be:
- Circular composition (will be cropped to a circle)
- Warm, inviting, approachable
- Illustrated/artistic style (NOT photorealistic, NOT cartoon)
- Think modern digital illustration like Headspace or Calm app characters
- Simple clean background matching the character's color palette
- Shoulders-up portrait, looking slightly toward the viewer
- Diverse representation
- NO text, NO logos, NO UI elements
- High quality, suitable for a 56x56px to 120x120px avatar circle`

async function generateAvatar(voice: typeof VOICES[number]) {
  console.log(`Generating avatar for ${voice.id} (${voice.gender})...`)

  const prompt = `${BASE_PROMPT}

This character is a ${voice.gender} AI coaching persona named "${voice.id}".
Personality: ${voice.personality}
Visual style: ${voice.style}
The character should visually embody these traits through expression and composition.`

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: response.statusText } }))
    console.error(`  Failed: ${err.error?.message || response.status}`)
    return false
  }

  const data = await response.json()
  const imagePart = data.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string } }) =>
      p.inlineData?.mimeType?.startsWith("image/")
  )

  if (imagePart?.inlineData?.data) {
    const buffer = Buffer.from(imagePart.inlineData.data, "base64")
    const ext = imagePart.inlineData.mimeType.includes("png") ? "png" : "png"
    const outPath = `public/avatars/${voice.id.toLowerCase()}.${ext}`
    fs.writeFileSync(outPath, buffer)
    console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB)`)
    return true
  }

  console.error(`  No image in response for ${voice.id}`)
  return false
}

async function main() {
  console.log("Generating gender-matched avatar portraits for 9 Gemini personas...\n")
  fs.mkdirSync("public/avatars", { recursive: true })

  let success = 0
  for (const voice of VOICES) {
    try {
      if (await generateAvatar(voice)) success++
      // Rate limit: wait 2s between requests
      await new Promise((r) => setTimeout(r, 2000))
    } catch (err) {
      console.error(`Error generating ${voice.id}:`, err)
    }
  }

  console.log(`\nDone! ${success}/9 avatars generated. Check public/avatars/`)
}

main()
