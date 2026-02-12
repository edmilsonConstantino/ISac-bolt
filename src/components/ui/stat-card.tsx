import * as React from "react"
import { cn } from "@/lib/utils"
import { type LucideIcon } from "lucide-react"

type StatCardColor = "slate" | "green" | "gray" | "blue" | "red" | "orange" | "purple" | "cyan" | "pink" | "indigo" | "brand";

const colorMap: Record<StatCardColor, { bg: string; border: string; icon: string; text: string }> = {
  slate:  { bg: "bg-white",       border: "border-slate-100",   icon: "text-slate-600",  text: "text-slate-800" },
  green:  { bg: "bg-green-50",    border: "border-green-200",   icon: "text-green-600",  text: "text-green-700" },
  gray:   { bg: "bg-gray-50",     border: "border-gray-200",    icon: "text-gray-600",   text: "text-gray-700" },
  blue:   { bg: "bg-blue-50",     border: "border-blue-200",    icon: "text-blue-600",   text: "text-blue-700" },
  red:    { bg: "bg-red-50",      border: "border-red-200",     icon: "text-red-600",    text: "text-red-700" },
  orange: { bg: "bg-orange-50",   border: "border-orange-200",  icon: "text-orange-600", text: "text-orange-700" },
  purple: { bg: "bg-purple-50",   border: "border-purple-200",  icon: "text-purple-600", text: "text-purple-700" },
  cyan:   { bg: "bg-cyan-50",     border: "border-cyan-200",    icon: "text-cyan-600",   text: "text-cyan-700" },
  pink:   { bg: "bg-pink-50",     border: "border-pink-200",    icon: "text-pink-600",   text: "text-pink-700" },
  indigo: { bg: "bg-indigo-50",   border: "border-indigo-200",  icon: "text-indigo-600", text: "text-indigo-700" },
  brand:  { bg: "bg-gradient-to-br from-[#004B87]/10 to-[#F5821F]/10", border: "border-[#004B87]/20", icon: "text-[#004B87]", text: "" },
};

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  color?: StatCardColor;
  className?: string;
  gradientText?: boolean;
}

function StatCard({ icon: Icon, label, value, color = "slate", className, gradientText = false }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <div className={cn(
      "rounded-xl p-4 border-2",
      colors.bg,
      colors.border,
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", colors.icon)} />
        <span className={cn("text-xs font-medium", color === "brand" ? "text-[#004B87]" : colors.icon.replace("text-", "text-").replace("-600", "-700"))}>{label}</span>
      </div>
      <p className={cn(
        "text-2xl font-bold",
        gradientText
          ? "bg-gradient-to-r from-[#004B87] to-[#F5821F] bg-clip-text text-transparent"
          : colors.text
      )}>
        {value}
      </p>
    </div>
  )
}

// Variante com borda lateral (usada nos dashboards)
type AccentCardColor = "blue" | "green" | "orange" | "purple" | "cyan" | "red" | "pink" | "indigo";

const accentColorMap: Record<AccentCardColor, { border: string; icon: string; value: string }> = {
  blue:   { border: "border-l-blue-500",   icon: "text-blue-500",   value: "text-blue-600" },
  green:  { border: "border-l-green-500",  icon: "text-green-500",  value: "text-green-600" },
  orange: { border: "border-l-orange-500", icon: "text-orange-500", value: "text-orange-600" },
  purple: { border: "border-l-purple-500", icon: "text-purple-500", value: "text-purple-600" },
  cyan:   { border: "border-l-cyan-500",   icon: "text-cyan-500",   value: "text-cyan-600" },
  red:    { border: "border-l-red-500",    icon: "text-red-500",    value: "text-red-600" },
  pink:   { border: "border-l-pink-500",   icon: "text-pink-500",   value: "text-pink-600" },
  indigo: { border: "border-l-indigo-500", icon: "text-indigo-500", value: "text-indigo-600" },
};

interface AccentStatCardProps {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
  subtitle?: string;
  color?: AccentCardColor;
  className?: string;
}

function AccentStatCard({ icon: Icon, label, value, subtitle, color = "blue", className }: AccentStatCardProps) {
  const colors = accentColorMap[color];

  return (
    <div className={cn(
      "bg-white rounded-lg border border-slate-200 shadow-lg hover:shadow-xl transition-all hover:scale-105 duration-300 border-l-4 p-4",
      colors.border,
      className
    )}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", colors.icon)} />
        <span className="text-sm text-slate-600 font-medium">{label}</span>
      </div>
      <div className={cn("text-3xl font-bold", colors.value)}>{value}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  )
}

export { StatCard, AccentStatCard }
export type { StatCardColor, AccentCardColor }
