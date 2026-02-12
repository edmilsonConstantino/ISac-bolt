import * as React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderTitleProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderSubtitleProps {
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface PageHeaderActionsProps {
  children: React.ReactNode;
  className?: string;
}

function PageHeader({ children, className }: PageHeaderProps) {
  return (
    <div className={cn(
      "bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60",
      className
    )}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {children}
      </div>
    </div>
  )
}

function PageHeaderTitle({ icon, children, className }: PageHeaderTitleProps) {
  return (
    <h2 className={cn("text-3xl font-bold text-[#004B87] mb-2 flex items-center gap-3", className)}>
      {icon}
      {children}
    </h2>
  )
}

function PageHeaderSubtitle({ icon, children, className }: PageHeaderSubtitleProps) {
  return (
    <div className={cn("flex items-center gap-2 text-[#004B87]/70", className)}>
      {icon}
      <p className="text-sm">{children}</p>
    </div>
  )
}

function PageHeaderActions({ children, className }: PageHeaderActionsProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {children}
    </div>
  )
}

export { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions }
