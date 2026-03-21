// src/components/shared/RegistrationStatusActions.tsx
// Reusable status action buttons for a registration.
// Used by: RegistrationSettingsModal, RegistrationProfileModal

import { useState } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle, Pause, Lock, Ban, AlertTriangle, Loader2, X
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

export type RegistrationStatus = 'ativo' | 'suspenso' | 'trancado' | 'cancelado';

interface StatusAction {
  status: RegistrationStatus;
  label: string;
  description: string;
  icon: any;
  color: 'green' | 'yellow' | 'blue' | 'red';
  confirmTitle: string;
  confirmMessage: string;
  requireReason: boolean;
}

export interface RegistrationStatusActionsProps {
  registrationId: number;
  currentStatus: RegistrationStatus | string;
  studentName: string;
  studentUsername?: string;
  /** Called after a successful status change so the parent can refresh data */
  onStatusChanged: (newStatus: RegistrationStatus) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

const ALL_ACTIONS: StatusAction[] = [
  {
    status: 'ativo',
    label: 'Reactivar Matrícula',
    description: 'O estudante volta a estar activo e pode frequentar as aulas normalmente',
    icon: CheckCircle,
    color: 'green',
    confirmTitle: 'Reactivar Matrícula',
    confirmMessage: 'Tem certeza que deseja reactivar esta matrícula? O estudante voltará a estar activo.',
    requireReason: false
  },
  {
    status: 'suspenso',
    label: 'Suspender Matrícula',
    description: 'Suspensão temporária por falta de pagamento ou decisão administrativa',
    icon: Pause,
    color: 'yellow',
    confirmTitle: 'Suspender Matrícula',
    confirmMessage: 'Tem certeza que deseja suspender esta matrícula? O estudante ficará temporariamente inactivo.',
    requireReason: true
  },
  {
    status: 'trancado',
    label: 'Trancar Matrícula',
    description: 'Trancamento a pedido do estudante. Pode ser reactivada posteriormente.',
    icon: Lock,
    color: 'blue',
    confirmTitle: 'Trancar Matrícula',
    confirmMessage: 'Tem certeza que deseja trancar esta matrícula? Os planos futuros serão cancelados.',
    requireReason: true
  },
  {
    status: 'cancelado',
    label: 'Cancelar Matrícula',
    description: 'Cancelamento definitivo. Liberta a vaga no curso.',
    icon: Ban,
    color: 'red',
    confirmTitle: 'Cancelar Matrícula',
    confirmMessage: 'ATENÇÃO: Esta acção é definitiva! O estudante será removido da turma.',
    requireReason: true
  }
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; hover: string; iconBg: string; grad: string }> = {
  green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700',  hover: 'hover:bg-green-100',  iconBg: 'bg-green-100',  grad: 'from-green-500 to-green-600'  },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', hover: 'hover:bg-yellow-100', iconBg: 'bg-yellow-100', grad: 'from-yellow-500 to-yellow-600' },
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   hover: 'hover:bg-blue-100',   iconBg: 'bg-blue-100',   grad: 'from-blue-500 to-blue-600'   },
  red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    hover: 'hover:bg-red-100',    iconBg: 'bg-red-100',    grad: 'from-red-500 to-red-600'    },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function RegistrationStatusActions({
  registrationId,
  currentStatus,
  studentName,
  studentUsername,
  onStatusChanged
}: RegistrationStatusActionsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: StatusAction | null;
    reason: string;
    restartDate: string;
  }>({ isOpen: false, action: null, reason: '', restartDate: '' });

  const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
  });

  // Show only actions that differ from current status
  const availableActions = ALL_ACTIONS.filter(a => a.status !== currentStatus);

  const handleChangeStatus = async () => {
    if (!confirmModal.action) return;

    const action = confirmModal.action.status;

    if (confirmModal.action.requireReason && action !== 'ativo' && !confirmModal.reason.trim()) {
      toast.error('Por favor, informe o motivo da alteração');
      return;
    }
    if (action === 'ativo' && !confirmModal.restartDate) {
      toast.error('Por favor, informe a data de retomada');
      return;
    }

    setIsSaving(true);
    try {
      let response: Response;

      if (action === 'suspenso' || action === 'trancado') {
        response = await fetch(`${API_URL}/registrations/suspend.php`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ registration_id: registrationId, reason: confirmModal.reason })
        });
      } else if (action === 'ativo') {
        response = await fetch(`${API_URL}/registrations/suspend.php`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ registration_id: registrationId, action: 'reactivate', restart_date: confirmModal.restartDate })
        });
      } else {
        response = await fetch(`${API_URL}/registrations.php`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ id: registrationId, status: 'cancelled', observations: confirmModal.reason || undefined })
        });
      }

      const result = await response.json();

      if (result.success) {
        const labels: Record<string, string> = { ativo: 'reactivada', suspenso: 'suspensa', trancado: 'trancada', cancelado: 'cancelada' };
        const extra = result.cancelled_plans_count !== undefined
          ? ` (${result.cancelled_plans_count} plano(s) suspenso(s))`
          : result.new_plans_count !== undefined
          ? ` (${result.new_plans_count} plano(s) gerado(s))`
          : '';
        toast.success(`Matrícula ${labels[action]} com sucesso!${extra}`);
        setConfirmModal({ isOpen: false, action: null, reason: '', restartDate: '' });
        onStatusChanged(action);
      } else {
        toast.error(result.message || 'Erro ao alterar status da matrícula');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        {availableActions.map(action => {
          const Icon = action.icon;
          const c = COLOR_MAP[action.color];
          return (
            <button
              key={action.status}
              onClick={() => setConfirmModal({ isOpen: true, action, reason: '', restartDate: '' })}
              disabled={isSaving}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                c.bg, c.border, c.hover,
                isSaving && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", c.iconBg)}>
                <Icon className={cn("h-6 w-6", c.text)} />
              </div>
              <div className="flex-1">
                <p className={cn("font-bold", c.text)}>{action.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{action.description}</p>
              </div>
            </button>
          );
        })}

        {availableActions.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Ban className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-sm">Não há acções disponíveis para este estado</p>
          </div>
        )}
      </div>

      {/* Confirmation Portal */}
      {confirmModal.isOpen && confirmModal.action && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setConfirmModal({ isOpen: false, action: null, reason: '', restartDate: '' })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn("px-6 py-5 text-white bg-gradient-to-r", COLOR_MAP[confirmModal.action.color].grad)}>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{confirmModal.action.confirmTitle}</h3>
                  <p className="text-white/80 text-sm">Confirmar alteração</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="font-bold text-lg text-[#004B87] text-center">{studentName}</p>
                {studentUsername && <p className="text-sm text-slate-500 text-center font-mono">{studentUsername}</p>}
              </div>

              <p className="text-slate-600 text-center mb-4">{confirmModal.action.confirmMessage}</p>

              {/* Restart date — reactivation only */}
              {confirmModal.action.status === 'ativo' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Data de Retomada *</label>
                  <input
                    type="date"
                    value={confirmModal.restartDate}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, restartDate: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Novos planos serão gerados a partir desta data (vencimento dia 10).</p>
                </div>
              )}

              {/* Reason — all except reactivate */}
              {confirmModal.action.requireReason && confirmModal.action.status !== 'ativo' && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Motivo da Alteração *</label>
                  <textarea
                    value={confirmModal.reason}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Informe o motivo desta alteração..."
                    className="w-full h-24 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm resize-none focus:border-[#F5821F] focus:outline-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setConfirmModal({ isOpen: false, action: null, reason: '', restartDate: '' })}
                  className="flex-1 h-12 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={
                    isSaving ||
                    (confirmModal.action.requireReason && confirmModal.action.status !== 'ativo' && !confirmModal.reason.trim()) ||
                    (confirmModal.action.status === 'ativo' && !confirmModal.restartDate)
                  }
                  onClick={handleChangeStatus}
                  className={cn(
                    "flex-1 h-12 text-white font-bold rounded-lg flex items-center justify-center transition-colors bg-gradient-to-r",
                    COLOR_MAP[confirmModal.action.color].grad,
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Sim, Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
