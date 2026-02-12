import * as React from "react"
import { cn } from "@/lib/utils"
import { Input } from "./input"
import { Search } from "lucide-react"

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function SearchBar({ placeholder = "Buscar...", value, onChange, className }: SearchBarProps) {
  return (
    <div className={cn("relative flex-1", className)}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] text-base"
      />
    </div>
  )
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
  minWidth?: string;
}

function FilterSelect({ value, onChange, options, className, minWidth = "180px" }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 bg-white",
        className
      )}
      style={{ minWidth }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}

interface ViewToggleProps {
  view: "grid" | "list";
  onChange: (view: "grid" | "list") => void;
  gridLabel?: string;
  listLabel?: string;
  gridIcon?: React.ReactNode;
  listIcon?: React.ReactNode;
  className?: string;
}

function ViewToggle({ view, onChange, gridLabel = "Grelha", listLabel = "Lista", gridIcon, listIcon, className }: ViewToggleProps) {
  return (
    <div className={cn("flex border-2 border-slate-200 rounded-xl overflow-hidden bg-white", className)}>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "px-4 h-12 flex items-center gap-2 transition-colors",
          view === "grid" ? "bg-[#F5821F] text-white" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        {gridIcon}
        <span className="text-sm font-medium">{gridLabel}</span>
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "px-4 h-12 flex items-center gap-2 transition-colors border-l-2 border-slate-200",
          view === "list" ? "bg-[#F5821F] text-white" : "text-slate-600 hover:bg-slate-50"
        )}
      >
        {listIcon}
        <span className="text-sm font-medium">{listLabel}</span>
      </button>
    </div>
  )
}

export { SearchBar, FilterSelect, ViewToggle }
