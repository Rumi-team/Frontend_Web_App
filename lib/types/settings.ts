export type ReminderFrequency = "off" | "daily" | "twice_daily" | "per_assignment"

export type PreferredChannel = "imessage" | "telegram" | "whatsapp" | "email" | "any"

export type ChannelName = "imessage" | "telegram" | "whatsapp" | "email" | "google_calendar"

export interface ChannelPreferences {
  id?: string
  provider_user_id: string
  user_id?: string

  // Channel toggles
  imessage_enabled: boolean
  telegram_enabled: boolean
  whatsapp_enabled: boolean
  google_calendar_enabled: boolean

  // Channel identifiers
  imessage_identifier: string | null
  telegram_chat_id: string | null
  whatsapp_identifier: string | null
  google_calendar_email: string | null
  email_enabled: boolean
  email_address: string | null

  // Reminder preferences
  reminder_frequency: ReminderFrequency
  quiet_hours_start: string // HH:MM
  quiet_hours_end: string // HH:MM
  timezone: string
  preferred_channel: PreferredChannel

  // Consent
  consent_given_at: string | null
  consent_text: string | null

  created_at?: string
  updated_at?: string
}
