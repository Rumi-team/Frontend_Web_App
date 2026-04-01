"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "sonner"
import { useAuth } from "@/components/auth-provider"
import { cancelPendingSave } from "@/store/settingsStore"
import { AlertTriangle } from "lucide-react"

interface DeleteAccountModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteAccountModal({ open, onOpenChange }: DeleteAccountModalProps) {
  const { signOut } = useAuth()
  const [step, setStep] = useState<"warning" | "confirm">("warning")
  const [confirmText, setConfirmText] = useState("")
  const [deleting, setDeleting] = useState(false)

  function handleClose(val: boolean) {
    onOpenChange(val)
    if (!val) {
      setStep("warning")
      setConfirmText("")
    }
  }

  async function handleDelete() {
    if (confirmText !== "DELETE" || deleting) return
    setDeleting(true)

    // Cancel any pending settings save to prevent race condition
    cancelPendingSave()

    try {
      const res = await fetch("/api/user/delete", { method: "POST" })
      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Failed to delete account.")
        setDeleting(false)
        return
      }

      // Clear local storage
      if (typeof window !== "undefined") {
        localStorage.removeItem("rumi-settings")
        localStorage.removeItem("rumi-user-progress")
      }

      // Sign out and redirect to account-deleted page
      await signOut()
      window.location.href = "/account-deleted"
    } catch {
      toast.error("Something went wrong. Please try again.")
      setDeleting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white dark:bg-gray-900">
        <SheetHeader>
          <div className="flex items-center gap-3 mt-2">
            <AlertTriangle className="h-7 w-7 text-red-500" />
            <SheetTitle className="text-xl text-gray-900 dark:text-gray-100">
              Delete Account
            </SheetTitle>
          </div>
        </SheetHeader>

        {step === "warning" ? (
          <div className="mt-6 space-y-5">
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                This will permanently delete your account and all your data, including:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-400">
                <li>All coaching sessions and summaries</li>
                <li>Your progress, streaks, and evaluations</li>
                <li>Personalization settings and preferences</li>
                <li>Feedback and coach insights</li>
              </ul>
              <p className="mt-3 text-sm font-semibold text-red-800 dark:text-red-300">
                This action cannot be undone.
              </p>
            </div>

            <button
              onClick={() => setStep("confirm")}
              className="w-full rounded-full bg-red-600 py-3.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
            >
              I understand, continue
            </button>

            <button
              onClick={() => handleClose(false)}
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Never mind, keep my account
            </button>
          </div>
        ) : (
          <div className="mt-6 space-y-5">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Type <span className="font-bold text-gray-900 dark:text-gray-100">DELETE</span> below to confirm permanent account deletion.
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE to confirm"
              aria-label="Type DELETE to confirm account deletion"
              className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 text-sm text-gray-900 dark:text-gray-100 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
              autoComplete="off"
            />

            <button
              onClick={handleDelete}
              disabled={confirmText !== "DELETE" || deleting}
              className="w-full rounded-full bg-red-600 py-3.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-40 transition-all"
            >
              {deleting ? "Deleting account..." : "Permanently delete my account"}
            </button>

            <button
              onClick={() => { setStep("warning"); setConfirmText("") }}
              className="w-full rounded-full border border-gray-200 dark:border-gray-700 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Go back
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
