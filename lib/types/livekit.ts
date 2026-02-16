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
}

export interface VisualizationImageData {
  period: string
  url: string
  prompt: string
}
