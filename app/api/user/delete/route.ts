import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

export async function POST() {
  // Step 1: Verify the authenticated user via cookie-based session
  const authClient = await createSupabaseServerClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Step 2: Use service role client for privileged operations
  const admin = createServerSupabaseClient()

  // Step 3: Delete all user data in a single transaction via RPC
  const { error: rpcError } = await admin.rpc("delete_user_cascade", {
    target_user_id: user.id,
  })

  if (rpcError) {
    console.error("delete_user_cascade failed:", rpcError)
    return NextResponse.json(
      { error: "Failed to delete account data. Please try again." },
      { status: 500 }
    )
  }

  // Step 4: Delete the auth user (only after data cascade succeeds)
  const { error: authError } = await admin.auth.admin.deleteUser(user.id)

  if (authError) {
    console.error("auth.admin.deleteUser failed:", authError)
    // Data is already deleted but auth user persists — log for manual cleanup
    return NextResponse.json(
      { error: "Account data deleted but auth removal failed. Contact support." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
