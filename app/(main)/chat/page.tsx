import { createSupabaseServerClient } from "@/lib/supabase-auth"
import { redirect } from "next/navigation"
import { OpenClawChat } from "@/components/coach/openclaw-chat"
import { MessageSquare } from "lucide-react"

export const metadata = {
  title: "Chat with Rumi",
  description: "Text coaching with Rumi",
}

export default async function ChatPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/")

  return (
    <div className="flex flex-col h-[calc(100dvh-120px)]" style={{ background: "var(--app-bg, #FAF8F3)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <div className="h-9 w-9 rounded-full bg-amber-500/20 dark:bg-yellow-500/20 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-amber-600 dark:text-yellow-400" />
        </div>
        <div>
          <h1 className="text-gray-900 dark:text-white font-semibold text-base">Chat with Rumi</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Text coaching</p>
        </div>
      </div>

      {/* Chat interface */}
      <OpenClawChat className="flex-1 min-h-0" />
    </div>
  )
}
