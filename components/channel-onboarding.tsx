"use client"

import { useState } from "react"
import Image from "next/image"
import { upsertChannelPreferences } from "@/app/actions/channel-preferences-actions"
import type { PreferredChannel } from "@/lib/types/settings"
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  Shield,
  Loader2,
  Clock,
} from "lucide-react"

interface ChannelOnboardingProps {
  onComplete: () => void
}

/* ─── Channel definitions ─── */
const CHANNELS = [
  {
    key: "imessage" as const,
    label: "iMessage",
    description: "Receive reminders via iMessage on your iPhone or Mac",
    icon: MessageCircle,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    enableKey: "imessage_enabled" as const,
    identifierKey: "imessage_identifier" as const,
    identifierLabel: "Phone number or Apple ID email",
    placeholder: "+1 555-123-4567",
    inputType: "tel" as const,
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    description: "Get check-ins through your Telegram account",
    icon: Send,
    color: "text-sky-400",
    bgColor: "bg-sky-400/10",
    borderColor: "border-sky-400/30",
    enableKey: "telegram_enabled" as const,
    identifierKey: "telegram_chat_id" as const,
    identifierLabel: "Telegram username or chat ID",
    placeholder: "@username",
    inputType: "text" as const,
  },
  {
    key: "whatsapp" as const,
    label: "WhatsApp",
    description: "Receive reminders on WhatsApp",
    icon: Phone,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    enableKey: "whatsapp_enabled" as const,
    identifierKey: "whatsapp_identifier" as const,
    identifierLabel: "WhatsApp phone number",
    placeholder: "+1 555-123-4567",
    inputType: "tel" as const,
  },
  {
    key: "email" as const,
    label: "Email",
    description: "Get gentle reminders in your inbox",
    icon: Mail,
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
    borderColor: "border-orange-400/30",
    enableKey: "email_enabled" as const,
    identifierKey: "email_address" as const,
    identifierLabel: "Email address",
    placeholder: "you@example.com",
    inputType: "email" as const,
  },
  {
    key: "google_calendar" as const,
    label: "Google Calendar",
    description: "Add assignment deadlines to your Google Calendar",
    icon: Calendar,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    enableKey: "google_calendar_enabled" as const,
    identifierKey: "google_calendar_email" as const,
    identifierLabel: "Gmail address",
    placeholder: "you@gmail.com",
    inputType: "email" as const,
  },
] as const

type Step = "channels" | "details" | "frequency"

const CONSENT_TEXT =
  "I agree to receive coaching reminders and assignment check-ins from Rumi via my selected messaging channels. I can disable this at any time."

export function ChannelOnboarding({ onComplete }: ChannelOnboardingProps) {
  const [step, setStep] = useState<Step>("channels")
  const [saving, setSaving] = useState(false)

  // Selected channels
  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Identifiers for each channel
  const [identifiers, setIdentifiers] = useState<Record<string, string>>({})

  // Frequency
  const [frequency, setFrequency] = useState<string>("daily")
  const [preferredChannel, setPreferredChannel] = useState<string>("any")

  function toggleChannel(key: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function setIdentifier(key: string, value: string) {
    setIdentifiers((prev) => ({ ...prev, [key]: value }))
  }

  const selectedChannels = CHANNELS.filter((c) => selected.has(c.key))
  const allIdentifiersFilled = selectedChannels.every(
    (c) => (identifiers[c.identifierKey] ?? "").trim().length > 0
  )

  async function handleFinish() {
    setSaving(true)

    // Build the preferences payload
    const payload: Record<string, any> = {
      consent_given_at: new Date().toISOString(),
      consent_text: CONSENT_TEXT,
      reminder_frequency: frequency,
      preferred_channel: preferredChannel as PreferredChannel,
      quiet_hours_start: "22:00",
      quiet_hours_end: "08:00",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    }

    // Set enabled flags and identifiers
    for (const ch of CHANNELS) {
      const isSelected = selected.has(ch.key)
      payload[ch.enableKey] = isSelected
      payload[ch.identifierKey] = isSelected
        ? identifiers[ch.identifierKey] || null
        : null
    }

    await upsertChannelPreferences(payload)
    setSaving(false)
    onComplete()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-black overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-yellow-500/[0.04] blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image
            src="/rumi_logo.png"
            alt="Rumi"
            width={303}
            height={101}
            className="mx-auto h-12 w-auto mb-6"
          />
        </div>

        {/* Step 1: Choose channels */}
        {step === "channels" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Stay on track between sessions
              </h1>
              <p className="text-gray-400 text-sm leading-relaxed">
                Rumi can send you gentle reminders about your assignments.
                Choose how you&apos;d like to be reached.
              </p>
            </div>

            {/* Privacy notice */}
            <div className="flex items-start gap-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3">
              <Shield className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Your contact info is only used for coaching reminders and is
                never shared with third parties.
              </p>
            </div>

            {/* Channel list */}
            <div className="space-y-2.5">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon
                const isSelected = selected.has(ch.key)
                return (
                  <button
                    key={ch.key}
                    onClick={() => toggleChannel(ch.key)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                      isSelected
                        ? `${ch.borderColor} bg-white/[0.04]`
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${ch.bgColor} shrink-0`}
                    >
                      <Icon className={`h-5 w-5 ${ch.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {ch.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {ch.description}
                      </p>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-yellow-400 bg-yellow-400"
                          : "border-gray-600"
                      }`}
                    >
                      {isSelected && (
                        <svg
                          className="h-3 w-3 text-black"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  if (selected.size > 0) {
                    setStep("details")
                  } else {
                    // Skip — save empty prefs to mark onboarding complete
                    handleFinish()
                  }
                }}
                disabled={saving}
                className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-base hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : selected.size > 0 ? (
                  <span className="flex items-center justify-center gap-1.5">
                    Continue <ChevronRight className="h-4 w-4" />
                  </span>
                ) : (
                  "Skip for now"
                )}
              </button>
              {selected.size > 0 && (
                <button
                  onClick={() => {
                    setSelected(new Set())
                    handleFinish()
                  }}
                  disabled={saving}
                  className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
                >
                  Skip for now
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Contact details */}
        {step === "details" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">
                Your contact details
              </h1>
              <p className="text-gray-400 text-sm">
                Enter the details for your selected channels.
              </p>
            </div>

            <div className="space-y-4">
              {selectedChannels.map((ch) => {
                const Icon = ch.icon
                return (
                  <div
                    key={ch.key}
                    className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${ch.color}`} />
                      <span className="text-sm font-medium text-white">
                        {ch.label}
                      </span>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">
                        {ch.identifierLabel}
                      </label>
                      <input
                        type={ch.inputType}
                        placeholder={ch.placeholder}
                        value={identifiers[ch.identifierKey] ?? ""}
                        onChange={(e) =>
                          setIdentifier(ch.identifierKey, e.target.value)
                        }
                        className="w-full h-12 mt-1 px-4 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-all"
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                onClick={() => setStep("frequency")}
                disabled={!allIdentifiersFilled}
                className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-base hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
              >
                <span className="flex items-center justify-center gap-1.5">
                  Continue <ChevronRight className="h-4 w-4" />
                </span>
              </button>
              <button
                onClick={() => setStep("channels")}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Frequency preference */}
        {step === "frequency" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-white">
                How often should Rumi check in?
              </h1>
              <p className="text-gray-400 text-sm">
                You can always change this later in Settings.
              </p>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  value: "per_assignment",
                  label: "Per assignment",
                  desc: "One reminder for each assignment from your session",
                },
                {
                  value: "daily",
                  label: "Once a day",
                  desc: "A single daily digest of your active assignments",
                },
                {
                  value: "twice_daily",
                  label: "Twice a day",
                  desc: "Morning and evening check-ins",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFrequency(opt.value)}
                  className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all ${
                    frequency === opt.value
                      ? "border-yellow-400/40 bg-yellow-400/5"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <Clock
                    className={`h-5 w-5 shrink-0 ${
                      frequency === opt.value
                        ? "text-yellow-400"
                        : "text-gray-600"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">
                      {opt.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                      frequency === opt.value
                        ? "border-yellow-400 bg-yellow-400"
                        : "border-gray-600"
                    }`}
                  >
                    {frequency === opt.value && (
                      <div className="h-2 w-2 rounded-full bg-black" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Preferred channel (if multiple selected) */}
            {selectedChannels.length > 1 && (
              <div className="space-y-2">
                <label className="text-xs text-gray-500">
                  Preferred channel
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedChannels.map((ch) => {
                    const Icon = ch.icon
                    return (
                      <button
                        key={ch.key}
                        onClick={() => setPreferredChannel(ch.key)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          preferredChannel === ch.key
                            ? `${ch.borderColor} bg-white/[0.06] text-white`
                            : "border-white/[0.06] text-gray-400 hover:text-white"
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${ch.color}`} />
                        {ch.label}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => setPreferredChannel("any")}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                      preferredChannel === "any"
                        ? "border-yellow-400/40 bg-white/[0.06] text-white"
                        : "border-white/[0.06] text-gray-400 hover:text-white"
                    }`}
                  >
                    Any available
                  </button>
                </div>
              </div>
            )}

            {/* Consent + Save */}
            <div className="space-y-3 pt-2">
              <p className="text-[11px] text-gray-600 leading-relaxed text-center px-4">
                By continuing, you agree to receive coaching reminders from Rumi
                via your selected channels. You can disable this anytime in
                Settings.
              </p>
              <button
                onClick={handleFinish}
                disabled={saving}
                className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold text-base hover:from-yellow-400 hover:to-amber-400 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  "Start my journey"
                )}
              </button>
              <button
                onClick={() => setStep("details")}
                className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors py-2"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {(["channels", "details", "frequency"] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all ${
                step === s
                  ? "w-6 bg-yellow-400"
                  : "w-1.5 bg-gray-700"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
