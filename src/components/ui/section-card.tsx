// src/components/ui/section-card.tsx
// Primitivo reutilizável para secções em modais e dashboards.
// Elimina a repetição do padrão:
//   bg-white rounded-2xl border border-slate-100 shadow-sm + header colorido + área de conteúdo

import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

// ── Variantes de cor disponíveis ───────────────────────────────────────────
export type SectionVariant =
  | "navy"     // Azul ISAC   (#004B87)
  | "orange"   // Laranja ISAC (#F5821F)
  | "red"      // Vermelho (emergência, erros)
  | "green"    // Verde (finanças, sucesso)
  | "purple"   // Roxo (historial, actividades)
  | "amber"    // Âmbar (avisos)
  | "emerald"  // Esmeralda (estado activo, conta)
  | "slate"    // Cinzento neutro (observações, genérico)

const variantStyles: Record<SectionVariant, {
  header:     string
  iconBg:     string
  iconColor:  string
  titleColor: string
}> = {
  navy:    { header: "bg-blue-50/60",   iconBg: "bg-[#004B87]/10",  iconColor: "text-[#004B87]",  titleColor: "text-[#004B87]"  },
  orange:  { header: "bg-orange-50/60", iconBg: "bg-[#F5821F]/15",  iconColor: "text-[#F5821F]",  titleColor: "text-[#F5821F]"  },
  red:     { header: "bg-red-50/60",    iconBg: "bg-red-100",       iconColor: "text-red-500",     titleColor: "text-red-600"    },
  green:   { header: "bg-green-50/60",  iconBg: "bg-green-100",     iconColor: "text-green-600",   titleColor: "text-green-700"  },
  purple:  { header: "bg-purple-50/60", iconBg: "bg-purple-100",    iconColor: "text-purple-600",  titleColor: "text-purple-700" },
  amber:   { header: "bg-amber-50/60",  iconBg: "bg-amber-100",     iconColor: "text-amber-600",   titleColor: "text-amber-700"  },
  emerald: { header: "bg-slate-50/60",  iconBg: "bg-emerald-100",   iconColor: "text-emerald-600", titleColor: "text-slate-700"  },
  slate:   { header: "bg-slate-50/60",  iconBg: "bg-slate-100",     iconColor: "text-slate-500",   titleColor: "text-slate-600"  },
}

// ── Props ──────────────────────────────────────────────────────────────────
export interface SectionCardProps {
  /** Ícone Lucide exibido no header */
  icon: LucideIcon
  /** Título do header */
  title: string
  /** Variante de cor (default: "slate") */
  variant?: SectionVariant
  /** Classes Tailwind aplicadas à área de conteúdo (default: "p-5") */
  contentPadding?: string
  /** Elemento extra alinhado à direita no header (ex: botão de acção) */
  headerAction?: React.ReactNode
  /** Conteúdo da secção */
  children: React.ReactNode
  /** Classes extras para o wrapper externo */
  className?: string
}

// ── Componente ─────────────────────────────────────────────────────────────
export function SectionCard({
  icon: Icon,
  title,
  variant = "slate",
  contentPadding = "p-5",
  headerAction,
  children,
  className,
}: SectionCardProps) {
  const v = variantStyles[variant]

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between gap-2.5 px-5 py-3.5 border-b border-slate-100",
        v.header
      )}>
        <div className="flex items-center gap-2.5">
          <div className={cn("p-1.5 rounded-lg", v.iconBg)}>
            <Icon className={cn("h-4 w-4", v.iconColor)} />
          </div>
          <h4 className={cn("text-sm font-bold", v.titleColor)}>{title}</h4>
        </div>
        {headerAction && (
          <div className="flex-shrink-0">{headerAction}</div>
        )}
      </div>

      {/* Content */}
      <div className={contentPadding}>
        {children}
      </div>
    </div>
  )
}
