"use client"

const DAYS = ["M", "T", "W", "T", "F", "S", "S"]

interface StreakCalendarProps {
  /** Map of "YYYY-MM-DD" → number of activities completed that day (0-4) */
  activityMap: Record<string, number>
}

export function StreakCalendar({ activityMap }: StreakCalendarProps) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const today = now.toISOString().split("T")[0]

  const monthLabel = now.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  // Build calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDow = (firstDay.getDay() + 6) % 7 // 0=Mon

  const cells: { date: string; count: number; isToday: boolean }[] = []

  // Empty cells before first day
  for (let i = 0; i < startDow; i++) {
    cells.push({ date: "", count: -1, isToday: false })
  }

  // Day cells
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
    cells.push({
      date: dateStr,
      count: activityMap[dateStr] ?? 0,
      isToday: dateStr === today,
    })
  }

  return (
    <div className="rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200/60 dark:border-white/10">
        <span className="text-base">📅</span>
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{monthLabel}</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((d, i) => (
            <div key={i} className="text-center text-[10px] font-semibold text-gray-400 dark:text-gray-500 pb-1">
              {d}
            </div>
          ))}
          {cells.map((cell, i) => {
            if (cell.count === -1) {
              return <div key={i} />
            }

            const isFull = cell.count >= 4
            const isPartial = cell.count > 0 && cell.count < 4

            return (
              <div
                key={i}
                className={`aspect-square rounded-md transition-colors ${
                  isFull
                    ? "bg-amber-500 shadow-sm shadow-amber-300/20"
                    : isPartial
                      ? "bg-amber-100 dark:bg-amber-500/15 border border-amber-200/50 dark:border-amber-500/20"
                      : "bg-gray-50 dark:bg-white/5"
                } ${cell.isToday ? "ring-2 ring-amber-500 ring-offset-1 dark:ring-offset-gray-900" : ""}`}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
