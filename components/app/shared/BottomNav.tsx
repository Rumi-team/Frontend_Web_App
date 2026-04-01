"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSessionStore } from "@/store/sessionStore"
import { Phone, MessageSquare, Map, User, Settings } from "lucide-react"

const TABS = [
  { href: "/phone", label: "Phone", icon: Phone },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/path", label: "Path", icon: Map },
  { href: "/you", label: "You", icon: User },
  { href: "/preferences", label: "Settings", icon: Settings },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const isSessionActive = useSessionStore((s) => s.isSessionActive)

  if (isSessionActive) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 pb-[env(safe-area-inset-bottom)] bg-[#FAF8F3] dark:bg-[#1A1A1A]">
      <div className="flex items-center justify-around px-2 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-2.5 transition-colors min-w-0"
            >
              <div
                className={`flex h-10 w-14 items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-gray-900 dark:bg-gray-100" : ""
                }`}
              >
                <Icon
                  className={`h-6 w-6 ${
                    isActive
                      ? "text-white dark:text-gray-900"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </div>
              <span
                className={`text-xs ${
                  isActive
                    ? "font-bold text-gray-900 dark:text-gray-100"
                    : "font-medium text-gray-500 dark:text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
