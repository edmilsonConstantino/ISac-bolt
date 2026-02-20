// src/components/shared/RegistrationSettingsModal.tsx
// Modal profissional para gestão de status de matrícula
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings, User, Mail, Phone, Calendar, CreditCard, BookOpen,
  CheckCircle, XCircle, Pause, Lock, AlertTriangle, X,
  Loader2, FileText, Clock, Ban
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ============ INTERFACES ============

interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  username?: string;
  bi_number?: string;
  status: string;
  registration_status?: string;
  enrollment_date?: string;
  course_name?: string;
  class_name?: string;
}

interface RegistrationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onStatusChanged: () => void;
}

type RegistrationStatus = 'ativo' | 'suspenso' | 'trancado' | 'cancelado';

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

// ============ COMPONENT ============

export function RegistrationSettingsModal({
  isOpen,
  onClose,
  student,
  onStatusChanged
}: RegistrationSettingsModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<RegistrationStatus>('ativo');
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    action: StatusAction | null;
    reason: string;
  }>({ isOpen: false, action: null, reason: '' });

  const API_URL = 'http://localhost/API-LOGIN/api';

  // Sync currentStatus with student data when modal opens
  useEffect(() => {
    if (student && isOpen) {
      const status = (student.registration_status || student.status || 'ativo') as RegistrationStatus;
      setCurrentStatus(status);
    }
  }, [student, isOpen]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Status actions configuration
  const statusActions: StatusAction[] = [
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
      confirmMessage: 'Tem certeza que deseja trancar esta matrícula? O estudante poderá reactivá-la no futuro.',
      requireReason: true
    },
    {
      status: 'cancelado',
      label: 'Cancelar Matrícula',
      description: 'Cancelamento definitivo. O estudante será removido da turma.',
      icon: Ban,
      color: 'red',
      confirmTitle: 'Cancelar Matrícula',
      confirmMessage: 'ATENÇÃO: Esta acção é definitiva! O estudante será removido da turma e perderá acesso ao sistema.',
      requireReason: true
    }
  ];

  // Get status info
  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      ativo: { label: 'Activo', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      active: { label: 'Activo', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      suspenso: { label: 'Suspenso', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
      suspended: { label: 'Suspenso', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
      trancado: { label: 'Trancado', color: 'text-blue-700', bg: 'bg-blue-100', icon: Lock },
      locked: { label: 'Trancado', color: 'text-blue-700', bg: 'bg-blue-100', icon: Lock },
      cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', icon: Ban },
      cancelled: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', icon: Ban },
      inativo: { label: 'Inactivo', color: 'text-slate-700', bg: 'bg-slate-100', icon: XCircle },
      inactive: { label: 'Inactivo', color: 'text-slate-700', bg: 'bg-slate-100', icon: XCircle },
    };
    return map[status] || map.ativo;
  };

  // Handle status change
  const handleChangeStatus = async () => {
    if (!student || !confirmModal.action) return;

    // Validate reason if required
    if (confirmModal.action.requireReason && !confirmModal.reason.trim()) {
      toast.error('Por favor, informe o motivo da alteração');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/students.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: student.id,
          registration_status: confirmModal.action.status,
          status_reason: confirmModal.reason,
          status_changed_at: new Date().toISOString()
        })
      });

      const result = await response.json();

      if (result.success) {
        const statusLabels: Record<string, string> = {
          ativo: 'reactivada',
          suspenso: 'suspensa',
          trancado: 'trancada',
          cancelado: 'cancelada'
        };
        toast.success(`Matrícula ${statusLabels[confirmModal.action.status]} com sucesso!`);
        setCurrentStatus(confirmModal.action.status);
        setConfirmModal({ isOpen: false, action: null, reason: '' });
        onStatusChanged();
      } else {
        toast.error(result.message || 'Erro ao alterar status da matrícula');
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  // Format date
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!student) return null;

  // Use currentStatus for display (updates immediately after change)
  const statusInfo = getStatusInfo(currentStatus);
  const StatusIcon = statusInfo.icon;

  // Filter actions based on current status
  const availableActions = statusActions.filter(action => action.status !== currentStatus);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose} modal={!confirmModal.isOpen}>
        <DialogContent
          className="max-w-[600px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl"
          style={confirmModal.isOpen ? { pointerEvents: 'none' } : undefined}
        >
          <DialogTitle className="sr-only">Configurações da Matrícula</DialogTitle>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Configurações da Matrícula</h2>
                  <p className="text-blue-200 text-sm">Gerir estado do estudante</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Student Info */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className={cn(
                "h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg",
                "bg-gradient-to-br from-[#004B87] to-[#0066B3]"
              )}>
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#004B87]">{student.name}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    {student.email}
                  </span>
                  {student.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {student.phone}
                    </span>
                  )}
                </div>
                {student.username && (
                  <p className="text-xs text-slate-500 mt-1 font-mono">
                    Username: {student.username}
                  </p>
                )}
              </div>
              <div className={cn("px-4 py-2 rounded-xl flex items-center gap-2", statusInfo.bg)}>
                <StatusIcon className={cn("h-5 w-5", statusInfo.color)} />
                <span className={cn("font-bold", statusInfo.color)}>{statusInfo.label}</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {student.course_name && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Curso</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{student.course_name}</p>
                </div>
              )}
              {student.class_name && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Turma</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{student.class_name}</p>
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Data Matrícula</p>
                <p className="text-sm font-semibold text-slate-700">{formatDate(student.enrollment_date)}</p>
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div className="p-6">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Alterar Estado da Matrícula
            </p>

            <div className="space-y-3">
              {availableActions.map(action => {
                const Icon = action.icon;
                const colorMap: Record<string, { bg: string; border: string; text: string; hover: string; iconBg: string }> = {
                  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', hover: 'hover:bg-green-100', iconBg: 'bg-green-100' },
                  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', hover: 'hover:bg-yellow-100', iconBg: 'bg-yellow-100' },
                  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', hover: 'hover:bg-blue-100', iconBg: 'bg-blue-100' },
                  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', hover: 'hover:bg-red-100', iconBg: 'bg-red-100' },
                };
                const c = colorMap[action.color];

                return (
                  <button
                    key={action.status}
                    onClick={() => setConfirmModal({ isOpen: true, action, reason: '' })}
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
            </div>

            {availableActions.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Ban className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">Não há acções disponíveis para este estado</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal via Portal */}
      {confirmModal.isOpen && confirmModal.action && createPortal(
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999, pointerEvents: 'auto' }}
          onClick={() => setConfirmModal({ isOpen: false, action: null, reason: '' })}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={cn(
              "px-6 py-5 text-white",
              confirmModal.action.color === 'green' && "bg-gradient-to-r from-green-500 to-green-600",
              confirmModal.action.color === 'yellow' && "bg-gradient-to-r from-yellow-500 to-yellow-600",
              confirmModal.action.color === 'blue' && "bg-gradient-to-r from-blue-500 to-blue-600",
              confirmModal.action.color === 'red' && "bg-gradient-to-r from-red-500 to-red-600"
            )}>
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
                <p className="font-bold text-lg text-[#004B87] text-center">{student.name}</p>
                {student.username && (
                  <p className="text-sm text-slate-500 text-center font-mono">{student.username}</p>
                )}
              </div>

              <p className="text-slate-600 text-center mb-4">
                {confirmModal.action.confirmMessage}
              </p>

              {/* Reason input */}
              {confirmModal.action.requireReason && (
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                    Motivo da Alteração *
                  </label>
                  <textarea
                    value={confirmModal.reason}
                    onChange={(e) => setConfirmModal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Informe o motivo desta alteração..."
                    className="w-full h-24 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm resize-none focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setConfirmModal({ isOpen: false, action: null, reason: '' })}
                  className="flex-1 h-12 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-bold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isSaving || (confirmModal.action.requireReason && !confirmModal.reason.trim())}
                  onClick={handleChangeStatus}
                  className={cn(
                    "flex-1 h-12 text-white font-bold rounded-lg flex items-center justify-center transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    confirmModal.action.color === 'green' && "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
                    confirmModal.action.color === 'yellow' && "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
                    confirmModal.action.color === 'blue' && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                    confirmModal.action.color === 'red' && "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
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
