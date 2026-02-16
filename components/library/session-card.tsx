import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock } from "lucide-react"
import type { SessionSummary } from "@/lib/types/library"

interface SessionCardProps {
  session: SessionSummary
}

export function SessionCard({ session }: SessionCardProps) {
  const date = new Date(session.session_started_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Link href={`/library/${session.session_id}`}>
      <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all cursor-pointer overflow-hidden group">
        {session.image_url && (
          <div className="relative h-36 w-full overflow-hidden">
            <Image
              src={session.image_url}
              alt={session.topic}
              fill
              className="object-cover group-hover:scale-105 transition-transform"
              unoptimized
            />
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{formattedDate}</span>
            {session.platform === "web" && (
              <Badge
                variant="secondary"
                className="text-[10px] bg-gray-800 text-gray-400"
              >
                Web
              </Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-white line-clamp-2">
            {session.topic}
          </h3>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {session.duration_minutes}m
            </span>
            {session.phase_quality !== null && (
              <span>Quality: {session.phase_quality}/10</span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
