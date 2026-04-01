"use client"

// Badge definitions matching the DB seed in DESIGN.md
const BADGES = [
  { id: "first_light", name: "First Light", icon: "🌟", description: "Complete your first session" },
  { id: "7_day_flame", name: "7-Day Flame", icon: "🔥", description: "7-day streak" },
  { id: "pattern_breaker", name: "Pattern Breaker", icon: "👁", description: "Complete Step 5" },
  { id: "identity_shift", name: "Identity Shift", icon: "🪞", description: "Complete Step 7" },
  { id: "the_declaration", name: "The Declaration", icon: "📜", description: "Complete Step 15" },
  { id: "transformer", name: "Transformer", icon: "👑", description: "Complete all 20 steps" },
  { id: "streak_master", name: "Streak Master", icon: "💎", description: "30-day streak" },
  { id: "deep_diver", name: "Deep Diver", icon: "🤿", description: "3+ exchanges on a deep step" },
] as const

interface BadgeGridProps {
  earnedBadgeIds?: string[]
}

export function BadgeGrid({ earnedBadgeIds = [] }: BadgeGridProps) {
  const earned = new Set(earnedBadgeIds)

  return (
    <div className="px-4">
      <h4
        className="text-base font-bold text-[#F5C518] mb-3"
        style={{ fontFamily: "var(--font-nunito, Nunito), sans-serif" }}
      >
        Badges
      </h4>
      <div className="grid grid-cols-4 gap-3">
        {BADGES.map((badge) => {
          const isEarned = earned.has(badge.id)
          return (
            <div
              key={badge.id}
              className="flex flex-col items-center gap-1"
              title={`${badge.name}: ${badge.description}`}
            >
              <div
                className={`w-16 h-16 rounded-[14px] flex items-center justify-center text-2xl transition-all ${
                  isEarned
                    ? "border-2 border-[#F5C518] bg-[#242424]"
                    : "border-2 border-gray-700 bg-[#1A1A1A] opacity-40"
                }`}
                style={isEarned ? { boxShadow: "0 0 12px rgba(245,197,24,0.3)" } : undefined}
              >
                {badge.icon}
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight ${
                isEarned ? "text-white" : "text-gray-600"
              }`}>
                {badge.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
