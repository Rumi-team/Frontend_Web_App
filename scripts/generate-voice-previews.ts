/**
 * Generate voice preview MP3s for each Gemini voice persona.
 *
 * Requires: GEMINI_API_KEY env var
 * Usage: npx tsx scripts/generate-voice-previews.ts
 *
 * Each voice says a short coaching intro that matches its personality.
 * Output: public/audio/personas/{VoiceId}.mp3
 */

const VOICES = [
  { id: "Puck", text: "Hey! I'm so glad you're here. Let's make today count, what's on your mind?" },
  { id: "Charon", text: "Welcome. Take a breath. I'm here to help you think things through, at your own pace." },
  { id: "Kore", text: "Hi there. It's good to see you. Whatever you're carrying today, you don't have to carry it alone." },
  { id: "Fenrir", text: "Let's get to it. What's the one thing that, if you tackled it today, would change everything?" },
  { id: "Aoede", text: "Hello, beautiful soul. There's something poetic about choosing to grow. What's stirring in you today?" },
  { id: "Leda", text: "Good to have you here. Let's take this step by step. What would you like to focus on?" },
  { id: "Orus", text: "Welcome. The fact that you're here says something about who you're becoming. What's present for you?" },
  { id: "Zephyr", text: "Hey friend! Life's a journey and you just showed up for another chapter. What's up?" },
]

async function generatePreview(voice: { id: string; text: string }) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY not set")

  console.log(`Generating preview for ${voice.id}...`)

  // Use Gemini TTS endpoint
  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text: voice.text },
        voice: {
          languageCode: "en-US",
          name: `en-US-${voice.id}`,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 1.0,
          pitch: 0,
        },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    console.error(`Failed for ${voice.id}: ${error}`)
    // Try Gemini Live API format instead
    console.log(`Trying alternative API for ${voice.id}...`)
    return generateWithGeminiLive(voice, apiKey)
  }

  const data = await response.json()
  if (data.audioContent) {
    const buffer = Buffer.from(data.audioContent, "base64")
    const fs = await import("fs")
    const outPath = `public/audio/personas/${voice.id}.mp3`
    fs.writeFileSync(outPath, buffer)
    console.log(`  Saved: ${outPath} (${buffer.length} bytes)`)
  }
}

async function generateWithGeminiLive(
  voice: { id: string; text: string },
  apiKey: string
) {
  // Gemini 2.0 Flash with audio output
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Say the following in a warm, coaching voice as ${voice.id}: "${voice.text}"`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: voice.id,
              },
            },
          },
        },
      }),
    }
  )

  if (!response.ok) {
    console.error(`  Alternative API also failed for ${voice.id}: ${await response.text()}`)
    return
  }

  const data = await response.json()
  const audioPart = data.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { mimeType: string } }) => p.inlineData?.mimeType?.startsWith("audio/")
  )

  if (audioPart?.inlineData?.data) {
    const buffer = Buffer.from(audioPart.inlineData.data, "base64")
    const fs = await import("fs")
    const outPath = `public/audio/personas/${voice.id}.mp3`
    fs.writeFileSync(outPath, buffer)
    console.log(`  Saved: ${outPath} (${buffer.length} bytes)`)
  } else {
    console.error(`  No audio in response for ${voice.id}`)
  }
}

async function main() {
  console.log("Generating voice previews for 8 Gemini personas...\n")

  for (const voice of VOICES) {
    try {
      await generatePreview(voice)
    } catch (err) {
      console.error(`Error generating ${voice.id}:`, err)
    }
  }

  console.log("\nDone! Check public/audio/personas/")
}

main()
