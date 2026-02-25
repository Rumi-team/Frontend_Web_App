export type ConnectionState = "disconnected" | "connecting" | "connected"

export interface ConnectionDetails {
  serverUrl: string
  roomName: string
  participantName: string
  participantToken: string
}

export type SessionControlAction =
  | "show_program_selection"
  | "program_selected"
  | "step_progress"
  | "program_complete"
  | "show_journey_orb"
  | "show_future_visualization"
  | "greeting_started"
  | "session_bootstrap"
  | "end_conversation"
  | "session_save_progress"
  | "session_gate_status"
  | "day_complete"

export interface SessionControlMessage {
  type: "session_control"
  action: SessionControlAction
  programs?: string[]
  program?: string
  step?: number
  step_name?: string
  total_steps?: number
  images?: VisualizationImageData[]
  farewell?: string
  reason?: string
  progress?: number
  stage?: string
  // Session gating fields
  current_day?: number
  is_locked?: boolean
  cooldown_remaining_hours?: number
  unlock_at?: string
  allowed_step_min?: number
  allowed_step_max?: number
  total_days?: number
  day?: number               // Which day completed (day_complete)
  cooldown_hours?: number    // Cooldown duration (day_complete)
  next_unlock_at?: string    // When next day unlocks (day_complete)
}

export interface VisualizationImageData {
  period: string
  url: string
  prompt: string
}
