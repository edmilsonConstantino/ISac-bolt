import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "./card"

interface EntityCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

function EntityCard({ children, className, onClick }: EntityCardProps) {
  return (
    <Card
      className={cn(
        "group hover:shadow-2xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white rounded-2xl",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="h-1 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]" />
      <CardContent className="p-4">
        {children}
      </CardContent>
    </Card>
  )
}

interface EntityCardHeaderProps {
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

function EntityCardHeader({ children, action, className }: EntityCardHeaderProps) {
  return (
    <div className={cn("flex items-start gap-3 mb-2.5", className)}>
      {children}
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

interface EntityCardTitleProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
}

function EntityCardTitle({ title, subtitle, badge, className }: EntityCardTitleProps) {
  return (
    <div className={cn("flex-1 min-w-0", className)}>
      <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight mb-1" title={title}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-[10px] text-slate-500 truncate" title={subtitle}>{subtitle}</p>
      )}
      {badge}
    </div>
  )
}

interface EntityCardActionsProps {
  children: React.ReactNode;
  className?: string;
}

function EntityCardActions({ children, className }: EntityCardActionsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {children}
    </div>
  )
}

interface EntityCardGridProps {
  children: React.ReactNode;
  cols?: string;
  className?: string;
}

function EntityCardGrid({ children, cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", className }: EntityCardGridProps) {
  return (
    <div className={cn("grid gap-4", cols, className)}>
      {children}
    </div>
  )
}

export { EntityCard, EntityCardHeader, EntityCardTitle, EntityCardActions, EntityCardGrid }
