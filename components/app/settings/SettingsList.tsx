"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useSettingsStore } from "@/store/settingsStore"
import { useTheme } from "next-themes"
import {
  Mail, Users, Heart, Sparkles, MessageCircle, Image,
  Sun, Moon, LogOut, Trash2, ChevronRight, Lock
} from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"
import { EmergencyModal } from "./EmergencyModal"
import { ManageQuestsModal } from "./ManageQuestsModal"
import { CustomizeAIModal } from "./CustomizeAIModal"
import { AppearanceModal } from "./AppearanceModal"
import { HumanCoachModal } from "./HumanCoachModal"
import { DeleteAccountModal } from "./DeleteAccountModal"

interface SettingsRowProps {
  icon: React.ReactNode
  title: string
  description: string
  onClick?: () => void
  toggle?: boolean
  onToggle?: (val: boolean) => void
  danger?: boolean
  chevron?: boolean
}

function SettingsRow({ icon, title, description, onClick, toggle, onToggle, danger, chevron }: SettingsRowProps) {
  return (
    <button
      onClick={toggle !== undefined ? () => onToggle?.(!toggle) : onClick}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700"
    >
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-600 dark:text-red-400" : "text-gray-900 dark:text-gray-100"}`}>{title}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{description}</p>
      </div>
      {toggle !== undefined && (
        <div
          role="switch"
          aria-checked={toggle}
          aria-label={title}
          className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${toggle ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"}`}
        >
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${toggle ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </div>
      )}
      {chevron && (
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={danger ? "text-red-500" : "text-gray-400 dark:text-gray-500"}>{icon}</span>
          <ChevronRight className="h-4 w-4 text-gray-300 dark:text-gray-600" />
        </div>
      )}
      {!chevron && toggle === undefined && (
        <span className={danger ? "text-red-500" : "text-gray-400 dark:text-gray-500"}>{icon}</span>
      )}
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
      {title}
    </p>
  )
}

export function SettingsList() {
  const { signOut } = useAuth()
  const settings = useSettingsStore()
  const setField = useSettingsStore((s) => s.setField)
  const { setTheme } = useTheme()

  const [showFeedback, setShowFeedback] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showQuests, setShowQuests] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showAppearance, setShowAppearance] = useState(false)
  const [showHumanCoach, setShowHumanCoach] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)

  useEffect(() => {
    setTheme(settings.lightDark === "dark" ? "dark" : "light")
  }, [settings.lightDark, setTheme])

  function handleLightDarkToggle(isLight: boolean) {
    const mode = isLight ? "light" : "dark"
    setField("lightDark", mode)
    setTheme(mode)
  }

  return (
    <div className="min-h-dvh pb-24" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      <h1 className="px-6 pt-8 pb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      {/* App Feedback (iOS order) */}
      <SectionHeader title="App Feedback" />
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-gray-800/20">
        <SettingsRow icon={<Mail className="h-5 w-5" />} title="Send Feedback" description="Share ideas or report issues with the team" onClick={() => setShowFeedback(true)} />
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
        <SettingsRow icon={<Users className="h-5 w-5" />} title="Use the App Alongside Human Therapy" description="Work with a Rumi-verified licensed therapist" onClick={() => setShowHumanCoach(true)} chevron />
      </div>

      {/* Safety & Support */}
      <SectionHeader title="Safety & Support" />
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-gray-800/20">
        <SettingsRow icon={<Heart className="h-5 w-5" />} title="Emergency Resources" description="Crisis hotlines and support services" onClick={() => setShowEmergency(true)} />
      </div>

      {/* Personalization */}
      <SectionHeader title="Personalization" />
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-gray-800/20">
        <SettingsRow icon={<Sparkles className="h-5 w-5" />} title="Manage Quests" description="Choose your daily quests and reminders" onClick={() => setShowQuests(true)} chevron />
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
        <SettingsRow icon={<MessageCircle className="h-5 w-5" />} title="Customize your AI" description="Personalize your AI's style" onClick={() => setShowAI(true)} chevron />
      </div>

      {/* Privacy & Security */}
      <SectionHeader title="Privacy & Security" />
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-gray-800/20">
        <SettingsRow icon={<Lock className="h-5 w-5" />} title="App Lock" description="Require passcode to open Rumi" toggle={settings.appLock} onToggle={(val) => setField("appLock", val)} />
      </div>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-gray-800/20">
        <SettingsRow icon={<Image className="h-5 w-5" />} title="Background Image" description={settings.selectedTheme.replace(/_/g, " ")} onClick={() => setShowAppearance(true)} chevron />
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
        <SettingsRow icon={settings.lightDark === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />} title="Light/Dark Mode" description="Match your preference" toggle={settings.lightDark === "light"} onToggle={handleLightDarkToggle} />
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
        <SettingsRow icon={<Sparkles className="h-5 w-5" />} title="Home Screen Quote" description="Inspirational quote on the home screen" toggle={settings.homeScreenQuote} onToggle={(val) => setField("homeScreenQuote", val)} />
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
        <SettingsRow icon={<Sparkles className="h-5 w-5" />} title="Streak Celebration" description="Show celebration when your streak increases" toggle={settings.streakCelebration} onToggle={(val) => setField("streakCelebration", val)} />
      </div>

      {/* Account */}
      <SectionHeader title="Account" />
      <div className="mx-4 rounded-2xl bg-white dark:bg-gray-900 overflow-hidden shadow-sm dark:shadow-gray-800/20">
        <SettingsRow icon={<LogOut className="h-5 w-5" />} title="Log Out" description="Sign out of your account" onClick={signOut} />
        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />
        <SettingsRow icon={<Trash2 className="h-5 w-5" />} title="Delete Account" description="Permanently delete your account and data" onClick={() => setShowDeleteAccount(true)} danger />
      </div>

      {/* Modals */}
      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
      <EmergencyModal open={showEmergency} onOpenChange={setShowEmergency} />
      <ManageQuestsModal open={showQuests} onOpenChange={setShowQuests} />
      <CustomizeAIModal open={showAI} onOpenChange={setShowAI} />
      <AppearanceModal open={showAppearance} onOpenChange={setShowAppearance} />
      <HumanCoachModal open={showHumanCoach} onOpenChange={setShowHumanCoach} />
      <DeleteAccountModal open={showDeleteAccount} onOpenChange={setShowDeleteAccount} />
    </div>
  )
}
