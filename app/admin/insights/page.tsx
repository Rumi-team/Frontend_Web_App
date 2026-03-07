"use client"

import { useState } from "react"
import { Lightbulb, Plus, Trash2, Eye, EyeOff, Search, Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface Insight {
  id: string
  provider_user_id: string
  insight_text: string
  category: string
  added_by: string
  is_active: boolean
  last_injected_at: string | null
  created_at: string
}

const CATEGORIES = ["general", "pattern", "breakthrough", "resistance", "strategy", "assignment"] as const

export default function AdminInsightsPage() {
  const [userId, setUserId] = useState("")
  const [searchedId, setSearchedId] = useState("")
  const [insights, setInsights] = useState<Insight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newText, setNewText] = useState("")
  const [newCategory, setNewCategory] = useState<typeof CATEGORIES[number]>("general")
  const [adding, setAdding] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)

  async function fetchInsights() {
    if (!userId.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/insights?user_id=${encodeURIComponent(userId.trim())}`)
      if (res.status === 401 || res.status === 403) {
        setError("Access denied. You must be an admin to view this page.")
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to fetch insights")
        return
      }
      setInsights(data.insights ?? [])
      setSearchedId(userId.trim())
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  async function addInsight() {
    if (!newText.trim() || !searchedId) return
    setAdding(true)
    try {
      const res = await fetch("/api/admin/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider_user_id: searchedId,
          insight_text: newText.trim(),
          category: newCategory,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to add insight")
        return
      }
      setInsights((prev) => [data.insight, ...prev])
      setNewText("")
      setAddSuccess(true)
      setTimeout(() => setAddSuccess(false), 3000)
    } catch (err) {
      setError("Network error")
    } finally {
      setAdding(false)
    }
  }

  async function toggleActive(insight: Insight) {
    try {
      const res = await fetch(`/api/admin/insights/${insight.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !insight.is_active }),
      })
      const data = await res.json()
      if (res.ok) {
        setInsights((prev) => prev.map((i) => (i.id === insight.id ? data.insight : i)))
      }
    } catch {}
  }

  async function deleteInsight(id: string) {
    if (!confirm("Delete this insight permanently?")) return
    try {
      await fetch(`/api/admin/insights/${id}`, { method: "DELETE" })
      setInsights((prev) => prev.filter((i) => i.id !== id))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Lightbulb className="h-6 w-6 text-yellow-400" />
          <div>
            <h1 className="text-2xl font-bold text-white">Coach Insights</h1>
            <p className="text-gray-500 text-sm">Admin-authored observations injected into Rumi session prompts</p>
          </div>
        </div>

        {/* User search */}
        <div className="flex gap-3">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchInsights()}
            placeholder="Enter provider_user_id (e.g. 001713.abc...)"
            className="flex-1 h-12 px-4 rounded-xl bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-gray-600 focus:outline-none focus:border-yellow-500/40 text-sm"
          />
          <button
            onClick={fetchInsights}
            disabled={loading || !userId.trim()}
            className="h-12 px-5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm flex items-center gap-2 disabled:opacity-40 transition-all"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-red-400 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Add insight */}
        {searchedId && (
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
            <h2 className="text-yellow-400 font-semibold text-sm">Add Insight for {searchedId.slice(0, 30)}…</h2>

            <textarea
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              placeholder="E.g. User consistently deflects with humor when approaching vulnerability around family relationships."
              rows={3}
              className="w-full resize-none rounded-lg bg-white/[0.06] border border-white/[0.08] text-white placeholder:text-gray-600 px-3 py-2.5 text-sm focus:outline-none focus:border-yellow-500/40"
            />

            <div className="flex gap-3">
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as typeof CATEGORIES[number])}
                className="h-10 px-3 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-gray-900">
                    {c}
                  </option>
                ))}
              </select>

              <button
                onClick={addInsight}
                disabled={adding || !newText.trim()}
                className="flex-1 h-10 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                {adding ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : addSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Added!
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add Insight
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Insights list */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-gray-400 text-xs uppercase tracking-wider font-semibold">
              {insights.length} insight{insights.length !== 1 ? "s" : ""}
            </h2>
            {insights.map((ins) => (
              <div
                key={ins.id}
                className={`rounded-xl border p-4 space-y-2 transition-opacity ${
                  ins.is_active
                    ? "border-white/[0.08] bg-white/[0.02]"
                    : "border-white/[0.04] bg-white/[0.01] opacity-50"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-gray-200 text-sm leading-relaxed flex-1">{ins.insight_text}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(ins)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
                      title={ins.is_active ? "Deactivate" : "Activate"}
                    >
                      {ins.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteInsight(ins.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="capitalize text-yellow-500/70">{ins.category}</span>
                  <span>·</span>
                  <span>by {ins.added_by}</span>
                  <span>·</span>
                  <span>{new Date(ins.created_at).toLocaleDateString()}</span>
                  {ins.last_injected_at && (
                    <>
                      <span>·</span>
                      <span className="text-green-500/70">
                        injected {new Date(ins.last_injected_at).toLocaleDateString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {searchedId && insights.length === 0 && !loading && (
          <p className="text-center text-gray-600 text-sm py-8">
            No insights yet for this user. Add the first one above.
          </p>
        )}
      </div>
    </div>
  )
}
