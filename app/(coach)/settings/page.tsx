"use client"

import { useEffect, useState } from "react"
import {
  getChannelPreferences,
  upsertChannelPreferences,
} from "@/app/actions/channel-preferences-actions"
import type {
  ChannelPreferences,
  ReminderFrequency,
  PreferredChannel,
} from "@/lib/types/settings"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircle,
  Send,
  Phone,
  Calendar,
  Bell,
  Save,
  Loader2,
  Mail,
} from "lucide-react"
import { toast } from "sonner"

const CONSENT_TEXT =
  "I agree to receive coaching reminders and assignment check-ins from Rumi via my selected messaging channels. I can disable this at any time."

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [consentGiven, setConsentGiven] = useState(false)

  const [prefs, setPrefs] = useState<Partial<ChannelPreferences>>({
    imessage_enabled: false,
    telegram_enabled: false,
    whatsapp_enabled: false,
    google_calendar_enabled: false,
    imessage_identifier: null,
    telegram_chat_id: null,
    whatsapp_identifier: null,
    google_calendar_email: null,
    email_enabled: false,
    email_address: null,
    reminder_frequency: "daily",
    quiet_hours_start: "22:00",
    quiet_hours_end: "08:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    preferred_channel: "telegram",
    consent_given_at: null,
    consent_text: null,
  })

  useEffect(() => {
    async function load() {
      const { data, error } = await getChannelPreferences()
      if (error) {
        toast.error("Failed to load preferences")
      }
      if (data) {
        setPrefs(data)
        setConsentGiven(!!data.consent_given_at)
      }
      setLoading(false)
    }
    load()
  }, [])

  function updatePref<K extends keyof ChannelPreferences>(
    key: K,
    value: ChannelPreferences[K]
  ) {
    setPrefs((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    const payload = { ...prefs }
    if (consentGiven && !prefs.consent_given_at) {
      payload.consent_given_at = new Date().toISOString()
      payload.consent_text = CONSENT_TEXT
    }
    const { error } = await upsertChannelPreferences(payload)
    if (error) {
      toast.error("Failed to save: " + error)
    } else {
      toast.success("Preferences saved")
      if (payload.consent_given_at) {
        setPrefs((prev) => ({
          ...prev,
          consent_given_at: payload.consent_given_at,
          consent_text: payload.consent_text,
        }))
      }
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  const anyChannelEnabled =
    prefs.imessage_enabled ||
    prefs.telegram_enabled ||
    prefs.whatsapp_enabled ||
    prefs.email_enabled ||
    prefs.google_calendar_enabled

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-xl font-semibold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Configure how Rumi sends you assignment reminders between sessions.
        </p>
      </div>

      {/* Consent Banner */}
      {!consentGiven && (
        <Card className="border-yellow-400/30 bg-yellow-400/5">
          <CardContent className="flex items-start gap-3 pt-6">
            <Bell className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div className="space-y-3">
              <p className="text-sm text-gray-300">{CONSENT_TEXT}</p>
              <Button
                size="sm"
                onClick={() => setConsentGiven(true)}
                className="bg-yellow-400 text-black hover:bg-yellow-300"
              >
                I Agree
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {consentGiven && prefs.consent_given_at && (
        <Badge
          variant="outline"
          className="border-green-800 text-green-400"
        >
          Consent given{" "}
          {new Date(prefs.consent_given_at).toLocaleDateString()}
        </Badge>
      )}

      {/* Channel Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-400">
          Messaging Channels
        </h2>

        {/* iMessage */}
        <Card className="border-gray-800 bg-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-400" />
              <CardTitle className="text-sm font-medium text-white">
                iMessage
              </CardTitle>
            </div>
            <Switch
              checked={prefs.imessage_enabled ?? false}
              onCheckedChange={(v) => updatePref("imessage_enabled", v)}
              disabled={!consentGiven}
            />
          </CardHeader>
          {prefs.imessage_enabled && (
            <CardContent className="pt-0">
              <Label className="text-xs text-gray-500">
                Phone number or Apple ID email
              </Label>
              <Input
                placeholder="+1 555-123-4567"
                value={prefs.imessage_identifier ?? ""}
                onChange={(e) =>
                  updatePref("imessage_identifier", e.target.value || null)
                }
                className="mt-1 border-gray-700 bg-gray-900 text-white"
              />
            </CardContent>
          )}
        </Card>

        {/* Telegram */}
        <Card className="border-gray-800 bg-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-400" />
              <CardTitle className="text-sm font-medium text-white">
                Telegram
              </CardTitle>
            </div>
            <Switch
              checked={prefs.telegram_enabled ?? false}
              onCheckedChange={(v) => updatePref("telegram_enabled", v)}
              disabled={!consentGiven}
            />
          </CardHeader>
          {prefs.telegram_enabled && (
            <CardContent className="pt-0">
              <Label className="text-xs text-gray-500">
                Chat ID or @username
              </Label>
              <Input
                placeholder="@username or 123456789"
                value={prefs.telegram_chat_id ?? ""}
                onChange={(e) =>
                  updatePref("telegram_chat_id", e.target.value || null)
                }
                className="mt-1 border-gray-700 bg-gray-900 text-white"
              />
            </CardContent>
          )}
        </Card>

        {/* WhatsApp */}
        <Card className="border-gray-800 bg-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-green-400" />
              <CardTitle className="text-sm font-medium text-white">
                WhatsApp
              </CardTitle>
            </div>
            <Switch
              checked={prefs.whatsapp_enabled ?? false}
              onCheckedChange={(v) => updatePref("whatsapp_enabled", v)}
              disabled={!consentGiven}
            />
          </CardHeader>
          {prefs.whatsapp_enabled && (
            <CardContent className="pt-0">
              <Label className="text-xs text-gray-500">Phone number</Label>
              <Input
                placeholder="+1 555-123-4567"
                value={prefs.whatsapp_identifier ?? ""}
                onChange={(e) =>
                  updatePref("whatsapp_identifier", e.target.value || null)
                }
                className="mt-1 border-gray-700 bg-gray-900 text-white"
              />
            </CardContent>
          )}
        </Card>

        {/* Email */}
        <Card className="border-gray-800 bg-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-orange-400" />
              <CardTitle className="text-sm font-medium text-white">
                Email
              </CardTitle>
            </div>
            <Switch
              checked={prefs.email_enabled ?? false}
              onCheckedChange={(v) => updatePref("email_enabled", v)}
              disabled={!consentGiven}
            />
          </CardHeader>
          {prefs.email_enabled && (
            <CardContent className="pt-0">
              <Label className="text-xs text-gray-500">Email address</Label>
              <Input
                placeholder="you@example.com"
                type="email"
                value={prefs.email_address ?? ""}
                onChange={(e) =>
                  updatePref("email_address", e.target.value || null)
                }
                className="mt-1 border-gray-700 bg-gray-900 text-white"
              />
            </CardContent>
          )}
        </Card>

        {/* Google Calendar */}
        <Card className="border-gray-800 bg-black">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-yellow-400" />
              <CardTitle className="text-sm font-medium text-white">
                Google Calendar
              </CardTitle>
            </div>
            <Switch
              checked={prefs.google_calendar_enabled ?? false}
              onCheckedChange={(v) =>
                updatePref("google_calendar_enabled", v)
              }
              disabled={!consentGiven}
            />
          </CardHeader>
          {prefs.google_calendar_enabled && (
            <CardContent className="pt-0">
              <Label className="text-xs text-gray-500">Gmail address</Label>
              <Input
                placeholder="you@gmail.com"
                value={prefs.google_calendar_email ?? ""}
                onChange={(e) =>
                  updatePref(
                    "google_calendar_email",
                    e.target.value || null
                  )
                }
                className="mt-1 border-gray-700 bg-gray-900 text-white"
              />
            </CardContent>
          )}
        </Card>
      </div>

      {/* Reminder Preferences */}
      <div className="space-y-4">
        <h2 className="text-sm font-medium text-gray-400">
          Reminder Preferences
        </h2>

        <Card className="border-gray-800 bg-black">
          <CardContent className="space-y-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-gray-500">Frequency</Label>
                <Select
                  value={prefs.reminder_frequency ?? "daily"}
                  onValueChange={(v) =>
                    updatePref(
                      "reminder_frequency",
                      v as ReminderFrequency
                    )
                  }
                >
                  <SelectTrigger className="mt-1 border-gray-700 bg-gray-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice_daily">Twice Daily</SelectItem>
                    <SelectItem value="per_assignment">
                      Per Assignment
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs text-gray-500">
                  Preferred Channel
                </Label>
                <Select
                  value={prefs.preferred_channel ?? "telegram"}
                  onValueChange={(v) =>
                    updatePref("preferred_channel", v as PreferredChannel)
                  }
                >
                  <SelectTrigger className="mt-1 border-gray-700 bg-gray-900 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="imessage">iMessage</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="any">Any Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs text-gray-500">
                  Quiet Hours Start
                </Label>
                <Input
                  type="time"
                  value={prefs.quiet_hours_start ?? "22:00"}
                  onChange={(e) =>
                    updatePref("quiet_hours_start", e.target.value)
                  }
                  className="mt-1 border-gray-700 bg-gray-900 text-white"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-500">
                  Quiet Hours End
                </Label>
                <Input
                  type="time"
                  value={prefs.quiet_hours_end ?? "08:00"}
                  onChange={(e) =>
                    updatePref("quiet_hours_end", e.target.value)
                  }
                  className="mt-1 border-gray-700 bg-gray-900 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs text-gray-500">Timezone</Label>
              <Input
                value={prefs.timezone ?? "America/Los_Angeles"}
                onChange={(e) => updatePref("timezone", e.target.value)}
                className="mt-1 border-gray-700 bg-gray-900 text-white"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={saving || (!consentGiven && anyChannelEnabled)}
        className="w-full bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50"
      >
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Save Preferences
      </Button>
    </div>
  )
}
