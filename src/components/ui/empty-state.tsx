import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"
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
    <Card className={cn("shadow-lg border-0", className)}>
      <CardContent className="pt-12 pb-12">
        <div className="flex flex-col items-center justify-center">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Icon className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          {description && (
            <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
              {description}
            </p>
          )}
          {action}
        </div>
      </CardContent>
    </Card>
  )
}

export { EmptyState }
