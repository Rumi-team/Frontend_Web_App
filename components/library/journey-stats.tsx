import { Card, CardContent } from "@/components/ui/card"
import type { UserJourneyStats } from "@/lib/types/library"

interface JourneyStatsProps {
  stats: UserJourneyStats
}

function ScoreArc({ score }: { score: number }) {
  const radius = 36
  const circumference = 2 * Math.PI * radius
  const progress = (score / 100) * circumference

  return (
    <div className="relative h-24 w-24">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#1f2937"
          strokeWidth="6"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#facc15"
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold text-white">{score}</span>
      </div>
    </div>
  )
}

export function JourneyStats({ stats }: JourneyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <span className="text-3xl font-bold text-white">
            {stats.totalSessions}
          </span>
          <span className="text-xs text-gray-400 mt-1">Sessions</span>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <ScoreArc score={stats.transformationScore} />
          <span className="text-xs text-gray-400 mt-1">Transformation</span>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="flex flex-col items-center justify-center p-4">
          <span className="text-3xl font-bold text-white">
            {stats.streakDays}
          </span>
          <span className="text-xs text-gray-400 mt-1">Day Streak</span>
        </CardContent>
      </Card>
    </div>
  )
}
