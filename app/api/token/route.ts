import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"
import { AccessToken } from "livekit-server-sdk"

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

    // 2. Verify access code redemption
    const serviceClient = createServerSupabaseClient()
    const { data: redemption } = await serviceClient
      .from("access_code_redemptions")
      .select("id")
      .eq("user_id", user.id)
      .single()

    if (!redemption) {
      return NextResponse.json(
        { error: "Access code required" },
        { status: 403 }
      )
    }

    // 3. Get user identity for provider_user_id
    const { data: identity } = await serviceClient
      .from("user_identities")
      .select("provider_user_id, email")
      .eq("user_id", user.id)
      .single()

    const providerUserId =
      identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

    // 4. Build room and participant details
    const body = await request.json().catch(() => ({}))
    const displayName =
      body.displayName ??
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      "User"
    const randomSuffix = Math.floor(1000 + Math.random() * 9000)
    const roomName = `voice-agent-${providerUserId}-${randomSuffix}`
    const participantName = providerUserId

    // Metadata uses iOS-compatible key names so the backend agent works unchanged
    const metadata = JSON.stringify({
      appleIdentifier: providerUserId,
      given_name: displayName,
    })

    // 5. Generate LiveKit access token
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

    // 6. Create the room via LiveKit Cloud sandbox API with agent dispatch
    // This mirrors the iOS SandboxPayload format
    const sandboxId = process.env.LIVEKIT_SANDBOX_ID
    if (sandboxId) {
      // Use LiveKit Cloud sandbox for room creation + agent dispatch
      const sandboxPayload = {
        room_name: roomName,
        participant_name: participantName,
        metadata: {
          appleIdentifier: providerUserId,
          given_name: displayName,
        },
        room_attributes: {
          appleIdentifier: providerUserId,
          given_name: displayName,
        },
        room_config: {
          agents: [{ agent_name: "rumi-voice-agent" }],
        },
      }

      const sandboxResponse = await fetch(
        "https://cloud-api.livekit.io/api/sandbox/connection-details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Sandbox-ID": sandboxId,
          },
          body: JSON.stringify(sandboxPayload),
        }
      )

      if (sandboxResponse.ok) {
        const sandboxDetails = await sandboxResponse.json()
        return NextResponse.json({
          serverUrl: sandboxDetails.serverUrl,
          roomName: sandboxDetails.roomName,
          participantName: sandboxDetails.participantName,
          participantToken: sandboxDetails.participantToken,
        })
      }

      console.error(
        "Sandbox API failed, falling back to direct token:",
        sandboxResponse.status
      )
    }

    // Fallback: return direct token (room created on connect)
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
