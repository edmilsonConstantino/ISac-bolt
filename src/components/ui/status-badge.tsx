import * as React from "react"
import { cn } from "@/lib/utils"
import { Badge } from "./badge"

type StatusType = "active" | "inactive" | "completed" | "paid" | "pending" | "overdue" | "advance" | "credit";

const statusConfig: Record<StatusType, { bg: string; text: string; label: string }> = {
  active:    { bg: "bg-emerald-100", text: "text-emerald-700", label: "Activo" },
  inactive:  { bg: "bg-slate-100",   text: "text-slate-500",   label: "Inactivo" },
  completed: { bg: "bg-blue-100",    text: "text-blue-700",    label: "Concluída" },
  paid:      { bg: "bg-green-100",   text: "text-green-800",   label: "Pago" },
  pending:   { bg: "bg-yellow-100",  text: "text-yellow-800",  label: "Pendente" },
  overdue:   { bg: "bg-red-100",     text: "text-red-800",     label: "Em Atraso" },
  advance:   { bg: "bg-blue-100",    text: "text-blue-800",    label: "Adiantado" },
  credit:    { bg: "bg-blue-100",    text: "text-blue-800",    label: "Com Crédito" },
};

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  icon?: React.ReactNode;
  showCheck?: boolean;
  className?: string;
}

function StatusBadge({ status, label, icon, showCheck = false, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.active;
  const displayLabel = label || config.label;

  return (
    <Badge
      className={cn(
        "text-[10px] px-2 py-0.5 rounded-full font-semibold border-0",
        config.bg,
        config.text,
        className
      )}
    >
      {icon}
      {showCheck && status === "active" && "✓ "}
      {displayLabel}
    </Badge>
  )
}

// Normalizar status do backend (pt/en) para StatusType
function normalizeStatus(status?: string): StatusType {
  switch (status?.toLowerCase()) {
    case 'active': case 'ativa': case 'ativo': case 'activo':
      return 'active';
    case 'inactive': case 'inativa': case 'inativo': case 'inactivo':
      return 'inactive';
    case 'completed': case 'concluída': case 'concluido': case 'concluida':
      return 'completed';
    case 'paid': case 'pago':
      return 'paid';
    case 'pending': case 'pendente':
      return 'pending';
    case 'overdue': case 'atrasado': case 'em atraso':
      return 'overdue';
    case 'advance': case 'adiantado':
      return 'advance';
    case 'credit':
      return 'credit';
    default:
      return 'active';
  }
}

// Texto traduzido para exibição
function getStatusLabel(status?: string): string {
  const normalized = normalizeStatus(status);
  return statusConfig[normalized].label;
}

export { StatusBadge, normalizeStatus, getStatusLabel }
export type { StatusType }
