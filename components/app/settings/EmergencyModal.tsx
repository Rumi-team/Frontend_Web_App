"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Phone, MessageSquare, Heart } from "lucide-react"

interface EmergencyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RESOURCES = [
  { label: "Call 988", href: "tel:988", description: "Suicide & Crisis Lifeline", icon: Phone, color: "bg-red-50 text-red-700" },
  { label: "Text 741741", href: "sms:741741", description: "Crisis Text Line", icon: MessageSquare, color: "bg-blue-50 text-blue-700" },
  { label: "Call 911", href: "tel:911", description: "Emergency Services", icon: Phone, color: "bg-red-50 text-red-700" },
  { label: "Domestic Violence", href: "tel:18007997233", description: "National Hotline", icon: Heart, color: "bg-purple-50 text-purple-700" },
  { label: "Crisis Text Line", href: "sms:741741&body=HELLO", description: "Text HELLO to 741741", icon: MessageSquare, color: "bg-blue-50 text-blue-700" },
  { label: "NAMI Helpline", href: "tel:18009506264", description: "1-800-950-NAMI", icon: Phone, color: "bg-green-50 text-green-700" },
]

export function EmergencyModal({ open, onOpenChange }: EmergencyModalProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl bg-white max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Emergency Resources</SheetTitle>
        </SheetHeader>
        <p className="mt-2 text-xs text-gray-500">
          If you are in immediate danger, call 911. These resources are available 24/7.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {RESOURCES.map((r) => {
            const Icon = r.icon
            return (
              <a
                key={r.label}
                href={r.href}
                className={`flex flex-col items-center gap-2 rounded-2xl p-4 ${r.color} transition-transform active:scale-95`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-sm font-semibold text-center">{r.label}</span>
                <span className="text-xs opacity-70 text-center">{r.description}</span>
              </a>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
