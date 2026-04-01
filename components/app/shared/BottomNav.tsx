"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSessionStore } from "@/store/sessionStore"
import { Home, Map, BookOpen, User } from "lucide-react"

const TABS = [
  { href: "/phone", label: "Home", icon: Home },
  { href: "/path", label: "Journey", icon: Map },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/you", label: "Profile", icon: User },
] as const

export function BottomNav() {
  const pathname = usePathname()
  const isSessionActive = useSessionStore((s) => s.isSessionActive)

  if (isSessionActive) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 pb-[env(safe-area-inset-bottom)] bg-[#1A1A1A]">
      <div className="flex items-center justify-around px-2 max-w-lg mx-auto">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href || pathname.startsWith(tab.href + "/")
          const Icon = tab.icon

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors ${
                isActive ? "text-[#F5C518]" : "text-gray-500"
              }`}
            >
              <div
                className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${
                  isActive ? "bg-[#F5C518]/10" : ""
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${isActive ? "text-[#F5C518]" : "text-gray-500"}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
              </div>
              <span className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}>
                {tab.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
