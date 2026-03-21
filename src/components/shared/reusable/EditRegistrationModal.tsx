// EditRegistrationModal.tsx
// Modal de edição de matrícula — estilo painel (sidebar + conteúdo), igual ao EditInscriptionModal

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  BookOpen, DollarSign, FileText, Save, X, Loader2,
  AlertCircle, User, Calendar, GraduationCap, Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import registrationService from "@/services/registrationService";
import type { Registration } from "./RegistrationList";

// ── Tipos locais ─────────────────────────────────────────────────────────────
type StatusValue      = 'active' | 'pending' | 'suspended' | 'cancelled' | 'completed';
type PaymentStatusVal = 'paid'   | 'pending' | 'overdue';
type Section          = 'enrollment' | 'financial' | 'notes';

interface EditRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  registration: Registration | null;
  onSuccess: () => void;
}

const SECTIONS: { id: Section; label: string; desc: string; icon: typeof BookOpen }[] = [
  { id: 'enrollment', label: 'Matrícula',   desc: 'Status e dados gerais',          icon: BookOpen },
  { id: 'financial',  label: 'Financeiro',  desc: 'Estado de pagamento e taxas',    icon: DollarSign },
  { id: 'notes',      label: 'Observações', desc: 'Notas internas da matrícula',    icon: FileText },
];

const STATUS_OPTIONS: { value: StatusValue; label: string; color: string }[] = [
  { value: 'active',    label: 'Activa',     color: 'text-emerald-700 bg-emerald-50' },
  { value: 'pending',   label: 'Pendente',   color: 'text-amber-700   bg-amber-50'   },
  { value: 'suspended', label: 'Suspensa',   color: 'text-orange-700  bg-orange-50'  },
  { value: 'cancelled', label: 'Cancelada',  color: 'text-red-700     bg-red-50'     },
  { value: 'completed', label: 'Concluída',  color: 'text-blue-700    bg-blue-50'    },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatusVal; label: string }[] = [
  { value: 'paid',    label: 'Pago'       },
  { value: 'pending', label: 'Pendente'   },
  { value: 'overdue', label: 'Em atraso'  },
];

const formatCurrency = (v?: number) =>
  v == null ? '—' : 'MT ' + new Intl.NumberFormat('pt-MZ').format(v);

const formatDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Componente principal ─────────────────────────────────────────────────────
export function EditRegistrationModal({ isOpen, onClose, registration, onSuccess }: EditRegistrationModalProps) {
  const [activeSection, setActiveSection] = useState<Section>('enrollment');
  const [isSaving, setIsSaving]           = useState(false);

  const [form, setForm] = useState({
    status:         'pending'  as StatusValue,
    payment_status: 'pending'  as PaymentStatusVal,
    observations:   '',
  });

  // Pre-popular quando abre
  useEffect(() => {
    if (isOpen && registration) {
      setForm({
        status:         (registration.status         || 'pending')  as StatusValue,
        payment_status: (registration.paymentStatus  || 'pending')  as PaymentStatusVal,
        observations:   registration.observations    || '',
      });
      setActiveSection('enrollment');
    }
  }, [isOpen, registration]);

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    if (!registration) return;
    setIsSaving(true);
    try {
      await registrationService.update(registration.id, {
        status:         form.status,
        paymentStatus:  form.payment_status,
        observations:   form.observations || undefined,
      } as any);
      toast.success('Matrícula actualizada com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao guardar matrícula');
    } finally {
      setIsSaving(false);
    }
  };

  if (!registration) return null;

  const currentStatusOption = STATUS_OPTIONS.find(o => o.value === form.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[600px]">

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <div className="w-64 bg-[#004B87] flex flex-col text-white p-6 shrink-0">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-bold text-base leading-tight text-white">
                  Editar Matrícula
                </DialogTitle>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5 leading-none">
                  #{registration.id}
                </p>
              </div>
            </div>

            {/* Info do estudante + curso */}
            <div className="mb-6 space-y-3 bg-white/8 rounded-xl p-3 border border-white/10">
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <span className="text-xs text-white font-semibold leading-tight truncate">
                  {registration.studentName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <span className="text-xs text-blue-100 leading-tight truncate">
                  {registration.courseName}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                <span className="text-xs text-blue-100">
                  {formatDate(registration.enrollmentDate)}
                </span>
              </div>
              {registration.className && (
                <div className="flex items-center gap-2">
                  <Tag className="h-3.5 w-3.5 text-blue-300 shrink-0" />
                  <span className="text-xs text-blue-100 truncate">{registration.className}</span>
                </div>
              )}
            </div>

            {/* Navegação */}
            <nav className="space-y-2 flex-1">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-white/15 text-white ring-1 ring-[#F5821F]/40"
                        : "text-blue-200/70 hover:text-white hover:bg-white/8"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      isActive ? "bg-[#F5821F]" : "bg-[#003A6B]"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{s.label}</p>
                      <p className="text-[10px] opacity-60 leading-tight truncate">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Badge de status actual */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <p className="text-[10px] text-blue-300 uppercase tracking-wider mb-1.5">Estado actual</p>
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold",
                currentStatusOption?.color || 'text-slate-600 bg-slate-100'
              )}>
                {currentStatusOption?.label || form.status}
              </span>
            </div>
          </div>

          {/* ── CONTEÚDO ────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/40">

              {/* ── MATRÍCULA ── */}
              {activeSection === 'enrollment' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#F5821F]" />
                    Dados da Matrícula
                  </h3>

                  {/* Informações somente leitura */}
                  <div className="grid grid-cols-2 gap-4">
                    <ReadField label="Período">
                      {registration.period || '—'}
                    </ReadField>
                    <ReadField label="Tipo de Matrícula">
                      {{ new: 'Nova', renewal: 'Renovação', transfer: 'Transferência' }[registration.registrationType || 'new'] || 'Nova'}
                    </ReadField>
                    <ReadField label="Turma">
                      {registration.className || '—'}
                    </ReadField>
                    <ReadField label="Data de Matrícula">
                      {formatDate(registration.enrollmentDate)}
                    </ReadField>
                  </div>

                  {/* Status — editável */}
                  <Field label="Estado da Matrícula">
                    <select
                      value={form.status}
                      onChange={e => set('status', e.target.value as StatusValue)}
                      className="w-full h-11 px-3 border border-input rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
                    >
                      {STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Alterar para <strong>Cancelada</strong> ou <strong>Suspensa</strong> liberta o lugar no curso.
                    </p>
                  </Field>
                </div>
              )}

              {/* ── FINANCEIRO ── */}
              {activeSection === 'financial' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-[#F5821F]" />
                    Informação Financeira
                  </h3>

                  {/* Taxas — leitura */}
                  <div className="grid grid-cols-2 gap-4">
                    <ReadField label="Taxa de Matrícula">
                      {formatCurrency(registration.enrollmentFee)}
                    </ReadField>
                    <ReadField label="Mensalidade">
                      {formatCurrency(registration.monthlyFee)}
                    </ReadField>
                  </div>

                  {/* Estado de pagamento — editável */}
                  <Field label="Estado de Pagamento">
                    <select
                      value={form.payment_status}
                      onChange={e => set('payment_status', e.target.value as PaymentStatusVal)}
                      className="w-full h-11 px-3 border border-input rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
                    >
                      {PAYMENT_STATUS_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Para gerir pagamentos individuais, utilize o módulo financeiro do estudante.
                    </p>
                  </Field>

                  {/* Aviso */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      As taxas de matrícula e mensalidade são definidas pelo curso e não podem ser
                      alteradas aqui. Para ajustes, contacte a administração.
                    </p>
                  </div>
                </div>
              )}

              {/* ── OBSERVAÇÕES ── */}
              {activeSection === 'notes' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#F5821F]" />
                    Observações
                  </h3>

                  <Field label="Notas internas">
                    <Textarea
                      value={form.observations}
                      onChange={e => set('observations', e.target.value)}
                      placeholder="Observações adicionais sobre esta matrícula…"
                      rows={6}
                      className="rounded-xl resize-none"
                    />
                  </Field>

                  <p className="text-xs text-slate-400">
                    Estas notas são visíveis apenas para os administradores do sistema.
                  </p>
                </div>
              )}
            </div>

            {/* ── FOOTER ──────────────────────────────────────────────────── */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 font-bold gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#F5821F] hover:bg-[#E07318] text-white px-8 h-11 rounded-xl font-bold gap-2 shadow-lg shadow-orange-200"
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
                ) : (
                  <><Save className="h-4 w-4" /> Guardar Alterações</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}

function ReadField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</Label>
      <div className="h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center px-4">
        <span className="text-sm text-slate-600">{children}</span>
      </div>
    </div>
  );
}
