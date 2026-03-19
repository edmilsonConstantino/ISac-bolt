// src/components/ui/confirm-dialog.tsx
import { AlertTriangle, Trash2, XCircle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const styles = {
    danger: {
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      confirmBtn: "bg-red-600 hover:bg-red-700 text-white",
      Icon: Trash2,
    },
    warning: {
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      confirmBtn: "bg-amber-500 hover:bg-amber-600 text-white",
      Icon: AlertTriangle,
    },
    info: {
      iconBg: "bg-[#004B87]/10",
      iconColor: "text-[#004B87]",
      confirmBtn: "bg-[#004B87] hover:bg-[#003868] text-white",
      Icon: XCircle,
    },
  }[variant];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm p-0 overflow-hidden rounded-2xl border-0 shadow-2xl [&>button]:hidden">
        {/* Top colour strip */}
        <div className={`h-1.5 w-full ${
          variant === "danger" ? "bg-red-500" :
          variant === "warning" ? "bg-amber-400" :
          "bg-[#004B87]"
        }`} />

        <div className="px-6 pt-5 pb-6 space-y-4">
          {/* Icon + title */}
          <div className="flex items-start gap-4">
            <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBg}`}>
              <styles.Icon className={`h-5 w-5 ${styles.iconColor}`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">{title}</h3>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">{message}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50"
              onClick={onCancel}
              disabled={isLoading}
            >
              {cancelLabel}
            </Button>
            <Button
              className={`flex-1 font-semibold ${styles.confirmBtn}`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? "A processar..." : confirmLabel}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage confirm dialog state
import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  variant?: ConfirmVariant;
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: ConfirmVariant;
    isLoading: boolean;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirmar",
    variant: "danger",
    isLoading: false,
    onConfirm: () => {},
  });

  const openConfirm = useCallback((options: ConfirmOptions, onConfirm: () => void | Promise<void>) => {
    setState({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmLabel: options.confirmLabel ?? "Confirmar",
      variant: options.variant ?? "danger",
      isLoading: false,
      onConfirm,
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      await state.onConfirm();
    } finally {
      setState((prev) => ({ ...prev, isOpen: false, isLoading: false }));
    }
  }, [state]);

  const handleCancel = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const dialogProps = {
    isOpen: state.isOpen,
    title: state.title,
    message: state.message,
    confirmLabel: state.confirmLabel,
    variant: state.variant,
    isLoading: state.isLoading,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { openConfirm, dialogProps };
}
