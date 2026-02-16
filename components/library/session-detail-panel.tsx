import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionDetailPanelProps {
  icon: LucideIcon
  title: string
  children: React.ReactNode
  className?: string
}

export function SessionDetailPanel({
  icon: Icon,
  title,
  children,
  className,
}: SessionDetailPanelProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      <div className="text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  )
}
