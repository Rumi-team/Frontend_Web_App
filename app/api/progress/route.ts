import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { createServerSupabaseClient } from "@/lib/supabase"

// Step names for all 20 steps (must match STEP_NAMES in agent.py)
const STEP_NAMES = [
  // Day 1: REVEAL (Steps 1-5)
  "The Invitation",
  "Your Invisible Filter",
  "The Water You Swim In",
  "Fact vs Story",
  "The Secret Payoff",
  // Day 2: DISMANTLE (Steps 6-10)
  "A New Kind of Possible",
  "Who You Decided to Be",
  "The Power of Seeing",
  "Your Relationship with Fear",
  "The Childhood Decision",
  // Day 3: TRANSFORM (Steps 11-15)
  "Completing the Past",
  "Standing in Nothing",
  "Words Create Worlds",
  "Create from Nothing",
  "Your Declaration",
  // Day 4: SUSTAIN (Steps 16-20)
  "Living the Transformation",
  "Catching the Old Pattern",
  "Breakdowns to Breakthroughs",
  "What You Can Now See",
  "Sharing Your Transformation",
]

const SECTION_TITLES = [
  "Seeing How You Listen",
  "Your Patterns",
  "Choosing Your Response",
  "Experience Your New Life",
]

interface StepInfo {
  number: number
  concept: string
  status: "completed" | "current" | "locked"
  taught: boolean
  deferred: boolean
  isMilestone: boolean
}

interface SectionInfo {
  day: number
  title: string
  status: "completed" | "active" | "locked"
  steps: StepInfo[]
}

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const serviceClient = createServerSupabaseClient()

    // Resolve provider_user_id (same pattern as /api/token)
    const { data: identity } = await serviceClient
      .from("user_identities")
      .select("provider_user_id")
      .eq("user_id", user.id)
      .single()

    const providerUserId =
      identity?.provider_user_id ?? user.identities?.[0]?.id ?? user.id

    // Read user_state from Supabase
    const { data: stateRow } = await serviceClient
      .from("user_state")
      .select("state")
      .eq("provider_user_id", providerUserId)
      .single()

    // Handle possibly double-encoded JSON string (same pattern as use-library-data)
    let state = stateRow?.state || {}
    if (typeof state === "string") {
      try {
        state = JSON.parse(state)
      } catch {
        state = {}
      }
    }
    const program = state.program || {}

    const currentStep: number = program.current_step || 0
    const dayCompleted: number = program.day_completed || 0
    const currentDay: number = program.current_day || 1
    const deferredSteps: Array<{ step: number }> = program.deferred_steps || []
    const taughtConcepts: string[] = program.taught_concepts || []

    const deferredSet = new Set(deferredSteps.map((d) => d.step))

    // Build sections (4 days x 5 steps)
    const sections: SectionInfo[] = []

    for (let day = 1; day <= 4; day++) {
      const stepStart = (day - 1) * 5 + 1
      const stepEnd = day * 5

      let sectionStatus: "completed" | "active" | "locked"
      if (day <= dayCompleted) {
        sectionStatus = "completed"
      } else if (day === currentDay) {
        sectionStatus = "active"
      } else {
        sectionStatus = "locked"
      }

      const steps: StepInfo[] = []
      for (let s = stepStart; s <= stepEnd; s++) {
        let stepStatus: "completed" | "current" | "locked"
        if (s <= currentStep) {
          stepStatus = "completed"
        } else if (s === currentStep + 1 && sectionStatus !== "locked") {
          stepStatus = "current"
        } else {
          stepStatus = "locked"
        }

        steps.push({
          number: s,
          concept: STEP_NAMES[s - 1] || `Step ${s}`,
          status: stepStatus,
          taught: taughtConcepts.includes(STEP_NAMES[s - 1] || ""),
          deferred: deferredSet.has(s),
          isMilestone: s % 5 === 0,
        })
      }

      sections.push({
        day,
        title: SECTION_TITLES[day - 1] || `Day ${day}`,
        status: sectionStatus,
        steps,
      })
    }

    return NextResponse.json({
      sections,
      currentStep,
      currentDay,
      dayCompleted,
      totalSteps: 20,
    })
  } catch (err) {
    console.error("Progress API error:", err)
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    )
  }
}
