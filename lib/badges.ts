/**
 * Badge trigger system — checks conditions and awards badges.
 * Matches badge definitions seeded in the DB (20260401000001_gamification_tables.sql).
 */

import { createBrowserSupabaseClient } from "@/lib/supabase-browser"

export interface BadgeTriggerContext {
  userId: string
  currentStep: number
  streak: number
  sessionsCompleted: number
  deepStepExchanges?: number // exchanges on steps 5, 7, 10, 12
}

interface BadgeCheck {
  id: string
  check: (ctx: BadgeTriggerContext) => boolean
}

const BADGE_CHECKS: BadgeCheck[] = [
  {
    id: "first_light",
    check: (ctx) => ctx.sessionsCompleted >= 1,
  },
  {
    id: "7_day_flame",
    check: (ctx) => ctx.streak >= 7,
  },
  {
    id: "pattern_breaker",
    check: (ctx) => ctx.currentStep >= 5,
  },
  {
    id: "identity_shift",
    check: (ctx) => ctx.currentStep >= 7,
  },
  {
    id: "the_declaration",
    check: (ctx) => ctx.currentStep >= 15,
  },
  {
    id: "transformer",
    check: (ctx) => ctx.currentStep >= 20,
  },
  {
    id: "streak_master",
    check: (ctx) => ctx.streak >= 30,
  },
  {
    id: "deep_diver",
    check: (ctx) => (ctx.deepStepExchanges ?? 0) >= 3,
  },
]

/**
 * Check all badge conditions and award any newly earned badges.
 * Returns the list of newly awarded badge IDs (empty if none).
 */
export async function checkAndAwardBadges(
  ctx: BadgeTriggerContext
): Promise<string[]> {
  const supabase = createBrowserSupabaseClient()

  // Get already-earned badges
  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", ctx.userId)

  const earnedSet = new Set((earned ?? []).map((b) => b.badge_id))

  // Check each badge
  const newBadges: string[] = []
  for (const badge of BADGE_CHECKS) {
    if (earnedSet.has(badge.id)) continue
    if (!badge.check(ctx)) continue

    // Award the badge
    const { error } = await supabase.from("user_badges").insert({
      user_id: ctx.userId,
      badge_id: badge.id,
    })

    if (!error) {
      newBadges.push(badge.id)
    }
  }

  return newBadges
}

/**
 * Fetch all earned badge IDs for a user.
 */
export async function getEarnedBadges(userId: string): Promise<string[]> {
  const supabase = createBrowserSupabaseClient()
  const { data } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId)

  return (data ?? []).map((b) => b.badge_id)
}
