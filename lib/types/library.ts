export interface SessionSummary {
  session_id: string
  topic: string
  image_url: string | null
  session_started_at: string
  duration_minutes: number
  message_count: number
  summary: string | null
  key_moment: string | null
  suggestions: string | null
  resilience_delta: number
  depth_score: number
  phase_quality: number | null
  engagement_level: number | null
  assignments_text: string | null
  platform: string
}

export interface UserJourneyStats {
  totalSessions: number
  transformationScore: number
  previousScore: number | null
  streakDays: number
  lastVisitDate: string | null
}

export interface TransformationData {
  overall_score: number | null
  avg_transformation: number | null
  peak_transformation_level: number | null
  peak_transformation_moment: string | null
  assignments_given: number | null
  assignments_completed: number | null
  completion_rate: number | null
}

export interface CommitmentData {
  what: string
  when: string | null
  status: string | null
  created_at: string | null
}

export interface UserStateResponse {
  transformation: TransformationData | null
  commitments: CommitmentData[] | null
}

export interface SessionEvaluation {
  id: string
  session_id: string
  phase_completion_quality: number
  depth_of_insight: number
  resistance_level: number
  engagement_level: number
  emotional_openness: number
  transformation_level: number
  transformation_moment: string | null
  evaluation_summary: string | null
  strengths: string[] | null
  growth_areas: string[] | null
  recommended_assignments: unknown[] | null
  follow_up_focus: string | null
  coaching_approach_next: string | null
}
