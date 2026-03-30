"use client"

import { useRouter } from "next/navigation"
import { BreathingScreen } from "@/components/app/phone/BreathingScreen"

export default function SessionLoadingPage() {
  const router = useRouter()

  return (
    <BreathingScreen
      onComplete={() => router.replace("/phone/session/active")}
    />
  )
}
