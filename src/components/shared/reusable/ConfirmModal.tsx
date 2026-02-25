// src/components/shared/reusable/ConfirmModal.tsx
// Reusable confirmation/warning modal — matches the matrícula cancel-confirm design.
// Used wherever the system needs to ask "are you sure?" before a destructive action.

import { AlertTriangle, Info, XCircle } from "lucide-react";

type Variant = "warning" | "danger" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  /** Called when the user clicks the confirm button */
  onConfirm: () => void;
  /** Called when the user clicks the cancel/back button */
  onCancel: () => void;
  title: string;
  /** Smaller text shown below the title inside the coloured header */
  subtitle?: string;
  /** Body message (sentence asking "are you sure?") */
  message?: string;
  /** Optional detail line shown below the message (e.g. student name) */
  detail?: string;
  /** Label for the confirm button — default "Sim, Confirmar" */
  confirmLabel?: string;
  /** Label for the cancel button — default "Não, Voltar" */
  cancelLabel?: string;
  /** Visual theme of the modal */
  variant?: Variant;
}

const VARIANT_STYLES: Record<Variant, {
  headerGradient: string;
  confirmGradient: string;
  confirmHover: string;
  iconBg: string;
  Icon: typeof AlertTriangle;
}> = {
  warning: {
    headerGradient: "from-amber-500 to-orange-500",
    confirmGradient: "from-amber-500 to-orange-500",
    confirmHover:   "hover:from-amber-600 hover:to-orange-600",
    iconBg:         "bg-white/20",
    Icon:           AlertTriangle,
  },
  danger: {
    headerGradient: "from-red-500 to-red-600",
    confirmGradient: "from-red-500 to-red-600",
    confirmHover:   "hover:from-red-600 hover:to-red-700",
    iconBg:         "bg-white/20",
    Icon:           XCircle,
  },
  info: {
    headerGradient: "from-[#004B87] to-[#0066B3]",
    confirmGradient: "from-[#004B87] to-[#0066B3]",
    confirmHover:   "hover:from-[#003868] hover:to-[#004B87]",
    iconBg:         "bg-white/15",
    Icon:           Info,
  },
};

export function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title,
  subtitle,
  message,
  detail,
  confirmLabel = "Sim, Confirmar",
  cancelLabel  = "Não, Voltar",
  variant      = "warning",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const styles = VARIANT_STYLES[variant];
  const { Icon } = styles;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Coloured header */}
        <div className={`bg-gradient-to-r ${styles.headerGradient} px-6 py-5 text-white`}>
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 ${styles.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
              <Icon className="h-7 w-7 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold leading-tight">{title}</h3>
              {subtitle && (
                <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {message && (
            <p className="text-slate-600 text-center mb-2">{message}</p>
          )}
          {detail && (
            <p className="text-slate-800 font-medium text-center mb-4">{detail}</p>
          )}
          {!message && !detail && <div className="mb-4" />}

          {/* Buttons */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={onCancel}
              className="flex-1 h-12 rounded-xl border-2 border-slate-300 hover:border-slate-400
                hover:bg-slate-50 font-bold text-slate-700 transition-colors text-sm"
            >
              {cancelLabel}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 h-12 rounded-xl bg-gradient-to-r ${styles.confirmGradient}
                ${styles.confirmHover} text-white font-bold transition-all text-sm shadow-sm`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
