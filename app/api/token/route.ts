import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"
import { AccessToken, RoomServiceClient, AgentDispatchClient } from "livekit-server-sdk"
import { trackEvent } from "@/lib/retention/client"

const AGENT_NAME = "rumi-voice-agent"

export async function POST(request: Request) {
  try {
    // 1. Validate Supabase auth session
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Get user identity + parse request body in parallel
    const serviceClient = createServerSupabaseClient()
    const [{ data: identity }, body] = await Promise.all([
      serviceClient
        .from("user_identities")
        .select("provider_user_id, email")
        .eq("user_id", user.id)
        .single(),
      request.json().catch(() => ({})),
    ])

    const providerUserId =
      identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

    // 3. Build room and participant details
    const displayName =
      body.displayName ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "User"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const roomName = `voice-agent-${providerUserId}-${randomSuffix}`
    const participantName = providerUserId

    // Metadata uses iOS-compatible key names so the backend agent works unchanged.
    // client_platform is used by the agent to select the correct Vertex AI app_name
    // (rumi_web_app vs rumi_ios_app) for memory scoping.
    const metadata = JSON.stringify({
      appleIdentifier: providerUserId,
      given_name: displayName,
      client_platform: "web",
      client_timezone: body.timezone ?? "UTC",
      teaching_mode: body.teaching_mode ?? true,
      voice_persona_id: body.voice_persona_id ?? "",
    })

    // 4. Generate LiveKit access token
    const livekitUrl = process.env.LIVEKIT_URL!
    const apiKey = process.env.LIVEKIT_API_KEY!
    const apiSecret = process.env.LIVEKIT_API_SECRET!

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      name: displayName,
      metadata,
    })

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const participantToken = await at.toJwt()

    // 5. Create room + dispatch agent via LiveKit Server SDK
    // Convert ws/wss URL to https for API calls
    const httpUrl = livekitUrl.replace(/^ws(s)?:\/\//, "https://")

    const roomSvc = new RoomServiceClient(httpUrl, apiKey, apiSecret)
    const dispatchSvc = new AgentDispatchClient(httpUrl, apiKey, apiSecret)

    // Create room with attributes so the agent can read metadata
    await roomSvc.createRoom({
      name: roomName,
      metadata: metadata,
    })

    // Explicitly dispatch agent to the room
    await dispatchSvc.createDispatch(roomName, AGENT_NAME, {
      metadata: metadata,
    })

    console.log(`Room created + agent dispatched: ${roomName}`)

    // Fire session_start event for retention tracking (fire-and-forget)
    trackEvent(providerUserId, "session_start", { source: "web", room: roomName })

    return NextResponse.json({
      serverUrl: livekitUrl,
      roomName,
      participantName,
      participantToken,
    })
  } catch (error) {
    console.error("Token generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    )
  }
}
