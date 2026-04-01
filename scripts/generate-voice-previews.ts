/**
 * Generate voice preview MP3s for each Gemini voice persona.
 *
 * Uses Gemini 2.5 Flash TTS model with native voice support.
 * Requires: GOOGLE_API_KEY or GEMINI_API_KEY env var
 * Usage: npx tsx scripts/generate-voice-previews.ts
 *
 * Output: public/audio/personas/{VoiceId}.mp3
 */

import * as fs from "fs"

const VOICES = [
  { id: "Gacrux", text: "Welcome. I'm right here with you. Whatever's going on, let's sit with it together. What's present for you?" },
  { id: "Fenrir", text: "Let's get to it. What's the one thing that, if you tackled it today, would change everything?" },
  { id: "Leda", text: "Good to have you here. Let's take this step by step. What would you like to focus on?" },
  { id: "Aoede", text: "Hello, beautiful soul. There's something poetic about choosing to grow. What's stirring in you today?" },
  { id: "Enceladus", text: "Take a moment. The answers you're looking for are already closer than you think. What's on your mind?" },
  { id: "Erinome", text: "Hi there. It's good to see you. Whatever you're carrying today, you don't have to carry it alone." },
  { id: "Algenib", text: "Let's think clearly about this. What's the real challenge, and what does the evidence tell you?" },
  { id: "Achernar", text: "Hey! I'm so glad you showed up. Today has so much potential. What are we working on?" },
  { id: "Sulafat", text: "Take a breath. Sometimes the quietest moments hold the deepest insights. What's been on your mind lately?" },
]

const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY
if (!API_KEY) {
  console.error("Set GOOGLE_API_KEY or GEMINI_API_KEY env var")
  process.exit(1)
}

async function generatePreview(voice: { id: string; text: string }) {
  console.log(`Generating preview for ${voice.id}...`)

  // Try Gemini 2.5 Flash TTS (supports native voice output)
  const models = [
    "gemini-2.5-flash-preview-tts",
    "gemini-2.0-flash-exp",
    "gemini-2.0-flash",
  ]

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: voice.text }],
            }],
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: voice.id },
                },
              },
            },
          }),
        }
      )

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: { message: response.statusText } }))
        console.log(`  ${model}: ${err.error?.message || "failed"}`)
        continue
      }

      const data = await response.json()
      const audioPart = data.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: { mimeType: string } }) =>
          p.inlineData?.mimeType?.startsWith("audio/")
      )

      if (audioPart?.inlineData?.data) {
        const buffer = Buffer.from(audioPart.inlineData.data, "base64")
        const outPath = `public/audio/personas/${voice.id}.mp3`
        fs.writeFileSync(outPath, buffer)
        console.log(`  Saved: ${outPath} (${(buffer.length / 1024).toFixed(1)} KB) via ${model}`)
        return true
      }

      console.log(`  ${model}: no audio in response`)
    } catch (err) {
      console.log(`  ${model}: ${err instanceof Error ? err.message : "error"}`)
    }
  }

  console.log(`  All models failed for ${voice.id}`)
  return false
}

async function main() {
  console.log("Generating voice previews for 8 Gemini personas...\n")

  fs.mkdirSync("public/audio/personas", { recursive: true })

  let success = 0
  for (const voice of VOICES) {
    if (await generatePreview(voice)) success++
  }

  console.log(`\nDone! ${success}/8 generated. Check public/audio/personas/`)

  if (success === 0) {
    console.log("\nTroubleshooting:")
    console.log("1. Enable 'Generative Language API' at https://console.cloud.google.com/apis")
    console.log("2. Or enable 'Cloud Text-to-Speech API' for the standard TTS endpoint")
    console.log("3. Make sure your API key has access to audio generation models")
  }
}

main()
