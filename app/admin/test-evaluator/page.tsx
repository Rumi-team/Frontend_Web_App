"use client"

import { useEffect, useState } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase-auth-browser"
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FlaskConical,
} from "lucide-react"

interface TestResult {
  id: string
  session_id: string
  provider_user_id: string
  transformation_level: number
  engagement_level: number
  resistance_level: number
  depth_of_insight: number
  emotional_openness: number
  phase_completion_quality: number
  strategy_used: string | null
  pacing_recommendation: string | null
  evaluation_summary: string | null
  evaluated_at: string
}

interface TestPersona {
  name: string
  prefix: string
  validates: string
  expectedCheck: (result: TestResult) => boolean
  expectedDescription: string
}

const TEST_PERSONAS: TestPersona[] = [
  {
    name: "Cooperative",
    prefix: "test_cooperative",
    validates: "Layer 1 eval quality",
    expectedCheck: (r) => r.transformation_level >= 5,
    expectedDescription: "transformation >= 5",
  },
  {
    name: "Resistant",
    prefix: "test_resistant",
    validates: "Layer 2 strategy selection",
    expectedCheck: (r) => r.strategy_used === "gentle_inquiry",
    expectedDescription: "gentle_inquiry selected",
  },
  {
    name: "Plateau",
    prefix: "test_plateau",
    validates: "Layer 2 plateau detection",
    expectedCheck: (r) =>
      r.strategy_used !== null && r.strategy_used !== "gentle_inquiry",
    expectedDescription: "strategy switch",
  },
  {
    name: "Breakthrough",
    prefix: "test_breakthrough",
    validates: "Layer 1 transformation scoring",
    expectedCheck: (r) => r.transformation_level >= 7,
    expectedDescription: "transformation >= 7",
  },
  {
    name: "Unclear Input",
    prefix: "test_unclear",
    validates: "Guardrails",
    expectedCheck: (r) => r.engagement_level <= 5,
    expectedDescription: "Low engagement (clarifying, not congratulating)",
  },
]

export default function TestEvaluatorPage() {
  const [results, setResults] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      const supabase = createSupabaseBrowserClient()
      const { data, error } = await supabase
        .from("session_evaluations")
        .select("*")
        .like("provider_user_id", "test_%")
        .order("evaluated_at", { ascending: false })
        .limit(50)

      if (!error && data) {
        setResults(data as TestResult[])
      }
      setLoading(false)
    }
    fetchResults()
  }, [])

  function getResultForPersona(persona: TestPersona): TestResult | null {
    return (
      results.find((r) => r.provider_user_id.startsWith(persona.prefix)) ?? null
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <div>
        <div className="flex items-center gap-3">
          <FlaskConical className="h-6 w-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Test Evaluator</h1>
        </div>
        <p className="mt-2 text-sm text-gray-400">
          Automated test results for 5 coaching personas. Each validates a
          specific layer of the reinforcement agent.
        </p>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
        </div>
      ) : (
        <div className="space-y-4">
          {TEST_PERSONAS.map((persona) => {
            const result = getResultForPersona(persona)
            const passed = result ? persona.expectedCheck(result) : null

            return (
              <div
                key={persona.name}
                className="rounded-xl border border-gray-800 p-5"
                style={{ background: "rgba(255,255,255,0.02)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-white">
                        {persona.name}
                      </h3>
                      {passed === true && (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      )}
                      {passed === false && (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                      {passed === null && (
                        <AlertTriangle className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Validates: {persona.validates}
                    </p>
                    <p className="text-xs text-gray-600">
                      Expected: {persona.expectedDescription}
                    </p>
                  </div>

                  {result && (
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        passed
                          ? "bg-green-400/10 text-green-400"
                          : "bg-red-400/10 text-red-400"
                      }`}
                    >
                      {passed ? "PASS" : "FAIL"}
                    </span>
                  )}

                  {!result && (
                    <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-500">
                      NO DATA
                    </span>
                  )}
                </div>

                {result && (
                  <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                    <ScoreCell label="Transform" value={result.transformation_level} highlight />
                    <ScoreCell label="Engage" value={result.engagement_level} />
                    <ScoreCell label="Resist" value={result.resistance_level} />
                    <ScoreCell label="Depth" value={result.depth_of_insight} />
                    <ScoreCell label="Open" value={result.emotional_openness} />
                    <ScoreCell label="Quality" value={result.phase_completion_quality} />
                  </div>
                )}

                {result?.strategy_used && (
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs"
                      style={{
                        background: "rgba(250,204,21,0.1)",
                        color: "#facc15",
                      }}
                    >
                      {result.strategy_used.replace(/_/g, " ")}
                    </span>
                    {result.pacing_recommendation && (
                      <span className="text-xs text-gray-500">
                        Pacing: {result.pacing_recommendation}
                      </span>
                    )}
                  </div>
                )}

                {result?.evaluation_summary && (
                  <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                    {result.evaluation_summary}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ScoreCell({
  label,
  value,
  highlight,
}: {
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div className="rounded-lg bg-gray-900/50 p-2 text-center">
      <p
        className={`text-lg font-bold ${
          highlight ? "text-yellow-400" : "text-white"
        }`}
      >
        {value}
      </p>
      <p className="text-[9px] text-gray-500">{label}</p>
    </div>
  )
}
