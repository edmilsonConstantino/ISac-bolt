// src/components/shared/RegistrationSettingsModal.tsx
// Modal for managing registration status — delegates to RegistrationStatusActions.
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Settings, Mail, Phone, CheckCircle, XCircle,
  Pause, Lock, X, FileText, Ban
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RegistrationStatusActions,
  type RegistrationStatus
} from "./RegistrationStatusActions";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  registrationId?: number | null;
  onStatusChanged: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  ativo:     { label: 'Activo',    color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  active:    { label: 'Activo',    color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  suspenso:  { label: 'Suspenso',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
  suspended: { label: 'Suspenso',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
  trancado:  { label: 'Trancado',  color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Lock },
  locked:    { label: 'Trancado',  color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Lock },
  cancelado: { label: 'Cancelado', color: 'text-red-700',    bg: 'bg-red-100',    icon: Ban },
  cancelled: { label: 'Cancelado', color: 'text-red-700',    bg: 'bg-red-100',    icon: Ban },
  inativo:   { label: 'Inactivo',  color: 'text-slate-700',  bg: 'bg-slate-100',  icon: XCircle },
  inactive:  { label: 'Inactivo',  color: 'text-slate-700',  bg: 'bg-slate-100',  icon: XCircle },
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '---';
  return new Date(dateStr).toLocaleDateString('pt-MZ', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

// ─── Component ────────────────────────────────────────────────────────────────

export function RegistrationSettingsModal({
  isOpen,
  onClose,
  student,
  registrationId,
  onStatusChanged
}: RegistrationSettingsModalProps) {
  const [currentStatus, setCurrentStatus] = useState<RegistrationStatus>('ativo');

  useEffect(() => {
    if (student && isOpen) {
      const s = (student.registration_status || student.status || 'ativo') as RegistrationStatus;
      setCurrentStatus(s);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const statusInfo = STATUS_MAP[currentStatus] ?? STATUS_MAP.ativo;
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
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
            <div className="h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg bg-gradient-to-br from-[#004B87] to-[#0066B3]">
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
          {registrationId ? (
            <RegistrationStatusActions
              registrationId={registrationId}
              currentStatus={currentStatus}
              studentName={student.name}
              studentUsername={student.username}
              onStatusChanged={(newStatus) => {
                setCurrentStatus(newStatus);
                onStatusChanged();
              }}
            />
          ) : (
            <div className="text-center py-8 text-slate-500">
              <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">ID da matrícula não encontrado</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
