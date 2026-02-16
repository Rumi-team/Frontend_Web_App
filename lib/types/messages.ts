export interface StyledSegment {
  text: string
  isHighlight: boolean
}

export interface ReceivedMessage {
  id: string
  timestamp: Date
  content: {
    type: "agent" | "user"
    text: string
  }
  styledSegments: StyledSegment[]
}
