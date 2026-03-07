import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"
import { OpenClawChat } from "@/components/coach/openclaw-chat"
import { MemoryPanel } from "@/components/coach/memory-panel"
import { MessageSquare, Brain } from "lucide-react"

export const metadata = {
  title: "Chat with Rumi",
  description: "Text coaching with Rumi — continue your transformation between voice sessions",
}

export default async function ChatPage() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/")

  return (
    <div className="flex h-[calc(100vh-57px)] bg-black overflow-hidden">
      {/* Left: Chat */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-white/[0.06]">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
          <div className="h-9 w-9 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <MessageSquare className="h-4 w-4 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-base">Chat with Rumi</h1>
            <p className="text-gray-500 text-xs">Text coaching · between sessions</p>
          </div>
        </div>

        {/* Chat interface */}
        <OpenClawChat className="flex-1 min-h-0" />
      </div>

      {/* Right: Memory Panel */}
      <div className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/[0.06]">
          <Brain className="h-4 w-4 text-yellow-400" />
          <h2 className="text-white font-semibold text-sm">Your Memory</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <MemoryPanel />
        </div>
      </div>
    </div>
  )
}
