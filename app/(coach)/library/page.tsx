import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"
import {
  fetchSessionHistory,
  fetchUserJourneyStats,
} from "@/lib/queries/sessions"
import { JourneyStats } from "@/components/library/journey-stats"
import { SessionCard } from "@/components/library/session-card"
import { AssignmentsPanel } from "@/components/library/assignments-panel"
import { SessionRefresh } from "@/components/library/session-refresh"

export default async function LibraryPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/rumi")

  // Get provider_user_id from user_identities
  const serviceClient = createServerSupabaseClient()
  const { data: identity } = await serviceClient
    .from("user_identities")
    .select("provider_user_id")
    .eq("user_id", user.id)
    .single()

  const providerUserId =
    identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

  const [sessions, stats] = await Promise.all([
    fetchSessionHistory(providerUserId),
    fetchUserJourneyStats(providerUserId),
  ])

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
      <SessionRefresh />
      <h1 className="text-2xl font-bold text-white">Your Journey</h1>

      <JourneyStats stats={stats} />

      <AssignmentsPanel />

      {sessions.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-500">
            No sessions yet. Start your first coaching session!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <SessionCard key={session.session_id} session={session} />
          ))}
        </div>
      )}
    </div>
  )
}
