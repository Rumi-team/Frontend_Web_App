"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSessionStore } from "@/store/sessionStore"
import { Phone, MessageSquare, BookOpen, User, Settings } from "lucide-react"

const TABS = [
  { href: "/phone", label: "Phone", icon: Phone },
  { href: "/text", label: "Chat", icon: MessageSquare },
  { href: "/content", label: "Content", icon: BookOpen },
  { href: "/you", label: "You", icon: User },
  { href: "/preferences", label: "Settings", icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const isSessionActive = useSessionStore((s) => s.isSessionActive)

  if (isSessionActive) return null

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t border-gray-200/60 px-2 pb-[env(safe-area-inset-bottom)]"
      style={{ background: "#FAF8F3" }}
    >
      {TABS.map((tab) => {
        const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
        const Icon = tab.icon

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 ${
              isActive ? "text-gray-900" : "text-gray-400"
            }`}
          >
            <div
              className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                isActive ? "bg-gray-800" : ""
              }`}
            >
              <Icon
                className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`}
                strokeWidth={isActive ? 2.5 : 1.5}
              />
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
