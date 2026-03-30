"use client"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useSettingsStore } from "@/store/settingsStore"
import {
  Mail, Users, Heart, Sparkles, MessageCircle, Image,
  Sun, Moon, Lock, LogOut, Trash2, ChevronRight
} from "lucide-react"
import { FeedbackModal } from "./FeedbackModal"
import { EmergencyModal } from "./EmergencyModal"
import { ManageQuestsModal } from "./ManageQuestsModal"
import { CustomizeAIModal } from "./CustomizeAIModal"
import { AppearanceModal } from "./AppearanceModal"

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
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-gray-50 active:bg-gray-100"
    >
      <span className={danger ? "text-red-500" : "text-gray-400"}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-red-600" : "text-gray-900"}`}>{title}</p>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      {toggle !== undefined && (
        <div
          className={`relative h-6 w-11 rounded-full transition-colors ${toggle ? "bg-blue-500" : "bg-gray-200"}`}
        >
          <div
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${toggle ? "translate-x-[22px]" : "translate-x-0.5"}`}
          />
        </div>
      )}
      {chevron && <ChevronRight className="h-4 w-4 text-gray-300" />}
    </button>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider text-[#7B8F6B]">
      {title}
    </p>
  )
}

export function SettingsList() {
  const { signOut } = useAuth()
  const settings = useSettingsStore()
  const setField = useSettingsStore((s) => s.setField)

  const [showFeedback, setShowFeedback] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [showQuests, setShowQuests] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [showAppearance, setShowAppearance] = useState(false)

  return (
    <div className="min-h-dvh pb-24" style={{ background: "#FAF8F3" }}>
      <h1 className="px-6 pt-8 pb-2 text-3xl font-bold text-gray-900">Settings</h1>

      {/* App Feedback */}
      <SectionHeader title="App Feedback" />
      <div className="mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Mail className="h-5 w-5" />}
          title="Send Feedback"
          description="Share ideas or report issues with the team"
          onClick={() => setShowFeedback(true)}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<Users className="h-5 w-5" />}
          title="Use the App Alongside Human Therapy"
          description="Coming soon — we're building something special"
        />
      </div>

      {/* Safety & Support */}
      <SectionHeader title="Safety & Support" />
      <div className="mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Heart className="h-5 w-5" />}
          title="Emergency Resources"
          description="Crisis hotlines and support services"
          onClick={() => setShowEmergency(true)}
        />
      </div>

      {/* Personalization */}
      <SectionHeader title="Personalization" />
      <div className="mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Sparkles className="h-5 w-5" />}
          title="Manage Quests"
          description="Choose your daily quests and reminders"
          onClick={() => setShowQuests(true)}
          chevron
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<MessageCircle className="h-5 w-5" />}
          title="Customize your AI"
          description="Personalize your AI's style"
          onClick={() => setShowAI(true)}
          chevron
        />
      </div>

      {/* Appearance */}
      <SectionHeader title="Appearance" />
      <div className="mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Image className="h-5 w-5" />}
          title="Background Image"
          description={settings.selectedTheme.replace(/_/g, " ")}
          onClick={() => setShowAppearance(true)}
          chevron
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={settings.lightDark === "light" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          title="Light/Dark Mode"
          description="Match your preference"
          toggle={settings.lightDark === "light"}
          onToggle={(val) => setField("lightDark", val ? "light" : "dark")}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<Sparkles className="h-5 w-5" />}
          title="Particles"
          description="Floating visual effects in voice sessions"
          toggle={settings.particles}
          onToggle={(val) => setField("particles", val)}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<Sparkles className="h-5 w-5" />}
          title="Edge Glow"
          description="Screen edge glow responding to your voice"
          toggle={settings.edgeGlow}
          onToggle={(val) => setField("edgeGlow", val)}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<Sparkles className="h-5 w-5" />}
          title="Home Screen Quote"
          description="Inspirational quote on the home screen"
          toggle={settings.homeScreenQuote}
          onToggle={(val) => setField("homeScreenQuote", val)}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<Sparkles className="h-5 w-5" />}
          title="Streak Celebration"
          description="Show celebration when your streak increases"
          toggle={settings.streakCelebration}
          onToggle={(val) => setField("streakCelebration", val)}
        />
      </div>

      {/* Privacy & Security */}
      <SectionHeader title="Privacy & Security" />
      <div className="mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <SettingsRow
          icon={<Lock className="h-5 w-5" />}
          title="App Lock"
          description="Require passcode to open Rumi"
          toggle={settings.appLock}
          onToggle={(val) => setField("appLock", val)}
        />
      </div>

      {/* Account */}
      <SectionHeader title="Account" />
      <div className="mx-4 rounded-2xl bg-white overflow-hidden shadow-sm">
        <SettingsRow
          icon={<LogOut className="h-5 w-5" />}
          title="Log Out"
          description="Sign out of your account"
          onClick={signOut}
        />
        <div className="mx-4 border-t border-gray-100" />
        <SettingsRow
          icon={<Trash2 className="h-5 w-5" />}
          title="Delete Account"
          description="Permanently delete your account and data"
          danger
        />
      </div>

      {/* Modals */}
      <FeedbackModal open={showFeedback} onOpenChange={setShowFeedback} />
      <EmergencyModal open={showEmergency} onOpenChange={setShowEmergency} />
      <ManageQuestsModal open={showQuests} onOpenChange={setShowQuests} />
      <CustomizeAIModal open={showAI} onOpenChange={setShowAI} />
      <AppearanceModal open={showAppearance} onOpenChange={setShowAppearance} />
    </div>
  )
}
