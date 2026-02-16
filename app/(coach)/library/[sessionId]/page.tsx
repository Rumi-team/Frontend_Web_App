import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  fetchSessionById,
  fetchSessionEvaluation,
} from "@/lib/queries/sessions"
import { SessionDetailPanel } from "@/components/library/session-detail-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  BookOpen,
  Lightbulb,
  ClipboardList,
  CheckCircle,
  Clock,
  TrendingUp,
  Activity,
  Star,
  Zap,
} from "lucide-react"

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function SessionDetailPage({ params }: Props) {
  const { sessionId } = await params
  const [session, evaluation] = await Promise.all([
    fetchSessionById(sessionId),
    fetchSessionEvaluation(sessionId),
  ])

  if (!session) notFound()

  const date = new Date(session.session_started_at)
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
      {/* Back nav */}
      <Link href="/library">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white -ml-2"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Library
        </Button>
      </Link>

      {/* Hero image */}
      {session.image_url && (
        <div className="relative h-48 sm:h-64 w-full rounded-xl overflow-hidden">
          <Image
            src={session.image_url}
            alt={session.topic}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      {/* Title and date */}
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white">{session.topic}</h1>
        <p className="text-sm text-gray-500">{formattedDate}</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex items-center gap-2 p-3">
            <Clock className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-white">
                {session.duration_minutes}m
              </p>
              <p className="text-[10px] text-gray-500">Duration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex items-center gap-2 p-3">
            <TrendingUp className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-white">
                {session.resilience_delta > 0 ? "+" : ""}
                {session.resilience_delta}
              </p>
              <p className="text-[10px] text-gray-500">Resilience</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="flex items-center gap-2 p-3">
            <Activity className="h-4 w-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-white">
                {session.depth_score}/10
              </p>
              <p className="text-[10px] text-gray-500">Depth</p>
            </div>
          </CardContent>
        </Card>

        {session.phase_quality !== null && (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="flex items-center gap-2 p-3">
              <Star className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-white">
                  {session.phase_quality}/10
                </p>
                <p className="text-[10px] text-gray-500">Quality</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Evaluation metrics */}
      {evaluation && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3 text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {evaluation.transformation_level}/10
              </p>
              <p className="text-[10px] text-gray-500">Transformation</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-medium text-white">
                {evaluation.engagement_level}/10
              </p>
              <p className="text-[10px] text-gray-500">Engagement</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-3 text-center">
              <p className="text-lg font-medium text-white">
                {evaluation.emotional_openness}/10
              </p>
              <p className="text-[10px] text-gray-500">Openness</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transformation moment */}
      {evaluation?.transformation_moment && (
        <Card className="bg-yellow-400/5 border-yellow-400/20">
          <CardContent className="p-4 flex items-start gap-3">
            <Zap className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-yellow-400 mb-1">
                Transformation Moment
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {evaluation.transformation_moment}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content sections */}
      <div className="space-y-6">
        {session.summary && (
          <SessionDetailPanel icon={BookOpen} title="Summary">
            {session.summary}
          </SessionDetailPanel>
        )}

        {session.key_moment && (
          <SessionDetailPanel icon={Lightbulb} title="Key Moment">
            {session.key_moment}
          </SessionDetailPanel>
        )}

        {session.suggestions && (
          <SessionDetailPanel icon={ClipboardList} title="Suggestions">
            {session.suggestions}
          </SessionDetailPanel>
        )}

        {session.assignments_text && (
          <SessionDetailPanel icon={CheckCircle} title="Assignments">
            {session.assignments_text}
          </SessionDetailPanel>
        )}
      </div>
    </div>
  )
}
