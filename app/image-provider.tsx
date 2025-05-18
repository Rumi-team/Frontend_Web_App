import { getImageUrl } from "@/lib/get-storage-url"

export async function getSupabaseImages() {
  const rumiLogoUrl = await getImageUrl("images", "rumi_logo.png")
  const feelingAgentUrl = await getImageUrl("images", "feeling_agent.png")

  return {
    rumiLogoUrl: rumiLogoUrl || "/placeholder.svg",
    feelingAgentUrl: feelingAgentUrl || "/placeholder.svg",
  }
}
