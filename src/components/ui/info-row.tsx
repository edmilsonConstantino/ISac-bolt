import * as React from "react"
import { cn } from "@/lib/utils"

interface InfoRowProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function InfoRow({ icon, children, className }: InfoRowProps) {
  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className="text-[#F5821F] flex-shrink-0">{icon}</span>
      <span className="truncate text-slate-600">{children}</span>
    </div>
  )
}

interface InfoPanelProps {
  children: React.ReactNode;
  className?: string;
}

function InfoPanel({ children, className }: InfoPanelProps) {
  return (
    <div className={cn("bg-slate-50 rounded-xl p-3 space-y-2.5 border border-slate-100", className)}>
      {children}
    </div>
  )
}

interface ListFooterProps {
  showing: number;
  total: number;
  onClearFilters?: () => void;
  hasFilters?: boolean;
  className?: string;
}

function ListFooter({ showing, total, onClearFilters, hasFilters = false, className }: ListFooterProps) {
  return (
    <div className={cn("flex justify-between items-center pt-4 border-t border-slate-200", className)}>
      <p className="text-sm text-slate-600">
        Mostrando <span className="font-semibold">{showing}</span> de{" "}
        <span className="font-semibold">{total}</span>
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="text-sm text-[#F5821F] hover:text-[#004B87] font-medium transition-colors"
        >
          Limpar Filtros
        </button>
      )}
    </div>
  )
}

export { InfoRow, InfoPanel, ListFooter }
