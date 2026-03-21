import * as React from "react"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border-0", className)}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#F5821F]/5 via-white to-[#004B87]/5" />

      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#F5821F]/6" />
      <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#004B87]/6" />

      <div className="relative flex flex-col items-center justify-center py-16 px-8 text-center">
        {/* Icon container */}
        <div className="relative mb-6">
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-[#F5821F]/15 to-[#004B87]/10 flex items-center justify-center shadow-inner rotate-3">
            <Icon className="h-11 w-11 text-[#F5821F]/70 -rotate-3" />
          </div>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-[#F5821F] to-[#e06b10] shadow-md" />
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-slate-700 mb-2 tracking-tight">{title}</h3>
        {description && (
          <p className="text-sm text-slate-400 max-w-xs leading-relaxed mb-8">
            {description}
          </p>
        )}

        {/* Action */}
        {action && (
          <div className="mt-2">
            {action}
          </div>
        )}
      </div>
    </div>
  )
}

export { EmptyState }
