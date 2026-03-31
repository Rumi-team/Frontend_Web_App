import { Sparkles, Sun, Moon, Heart, BookOpen, Brain, Wind } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface Quest {
  id: string
  title: string
  prompt: string
  time: string
  xp: number
  icon: LucideIcon
  color: string
}

export const ALL_QUESTS: Quest[] = [
  {
    id: "daily_affirmation",
    title: "Daily Affirmation",
    prompt: "Write an affirmation that feels true for you today. What do you want to believe about yourself?",
    time: "3:03 PM",
    xp: 5,
    icon: Sparkles,
    color: "#D4C896",
  },
  {
    id: "morning_intention",
    title: "Morning Check-in",
    prompt: "Start your day with intention. What are you focusing on today? What matters most?",
    time: "5:00 AM",
    xp: 50,
    icon: Sun,
    color: "#D4C896",
  },
  {
    id: "evening_reflection",
    title: "Evening Check-in",
    prompt: "How did today go? What did you learn about yourself? What would you do differently?",
    time: "8:00 PM",
    xp: 50,
    icon: Moon,
    color: "#C8D4D8",
  },
  {
    id: "gratitude_checkin",
    title: "Gratitude Practice",
    prompt: "Name three things you're grateful for right now. Why do they matter to you?",
    time: "12:00 PM",
    xp: 25,
    icon: Heart,
    color: "#D4C896",
  },
  {
    id: "weekly_review",
    title: "Weekly Growth Review",
    prompt: "Reflect on your coaching week. What shifted? What patterns did you notice? What's your intention for next week?",
    time: "Sunday",
    xp: 100,
    icon: BookOpen,
    color: "#D4C896",
  },
  {
    id: "coach_pick",
    title: "Coach's Pick",
    prompt: "Today's coaching insight: Use simple if-then plans to build better habits. 'If I feel X, then I will do Y.'",
    time: "3:01 PM",
    xp: 10,
    icon: Brain,
    color: "#E0D4E8",
  },
  {
    id: "guided_meditation",
    title: "Guided Meditation",
    prompt: "Take 2 minutes to center yourself. Close your eyes, breathe deeply, and notice what you feel without judgment.",
    time: "6:00 PM",
    xp: 50,
    icon: Wind,
    color: "#C8D4D8",
  },
]

export const DEFAULT_ACTIVE_QUESTS = [
  "daily_affirmation",
  "morning_intention",
  "evening_reflection",
]

export function getQuestById(id: string): Quest | undefined {
  return ALL_QUESTS.find((q) => q.id === id)
}
