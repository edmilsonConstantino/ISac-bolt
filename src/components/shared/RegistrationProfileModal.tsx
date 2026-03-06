// src/components/shared/RegistrationProfileModal.tsx
// Perfil completo de uma matrícula — mesmo estilo de ClassSettingsModal.

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  BookOpen, GraduationCap, Shield, DollarSign,
  X, CheckCircle, XCircle, Pause, Lock, Ban,
  AlertCircle, ChevronDown, ChevronUp, Loader2,
  Pencil, Save, User, Mail, Phone, CreditCard,
  Calendar, FileText, Info
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  RegistrationStatusActions,
  type RegistrationStatus
} from "./RegistrationStatusActions";
import { formatCurrency, formatMonthReference, PAYMENT_STATUS_LABELS } from "@/types/finance";

// ─── Types ───────────────────────────────────────────────────────────────────

type ActiveTab = 'info' | 'finance' | 'grades' | 'status';

interface RegDetails {
  id: number;
  student_id: number;
  student_name: string;
  student_email: string;
  student_phone: string | null;
  student_bi: string | null;
  student_username: string | null;
  student_gender: string | null;
  course_id: string;
  course_name: string;
  category_name: string | null;
  class_id: number | null;
  class_name: string | null;
  class_turno: string | null;
  class_start_date: string | null;
  nivel_id: number | null;
  nivel_number: number | null;
  nivel_name: string | null;
  enrollment_date: string;
  status: string;
  suspension_date: string | null;
  suspension_reason: string | null;
  enrollment_fee: number;
  monthly_fee: number;
  payment_status: string;
  is_bolsista: boolean;
  observations: string | null;
  created_at: string;
  updated_at: string;
}

interface GradeRow {
  id: number;
  period_number: number;
  grade_teste1: string | null;
  grade_teste2: string | null;
  grade_exame_pratico: string | null;
  grade_exame_teorico: string | null;
  final_grade: number | null;
  status: 'passed' | 'failed' | null;
}

interface PlanItem {
  id: number;
  month_reference: string;
  due_date: string;
  base_amount: number;
  total_expected: number;
  paid_total: number;
  remaining: number;
  penalty_amount: number;
  status: string;
}

interface FinanceData {
  summary: {
    total_expected: number;
    total_paid: number;
    total_pending: number;
    total_overdue: number;
    total_penalties: number;
    overdue_count: number;
    wallet_balance: number;
    class_started: boolean;
  };
  plans: PlanItem[];
  suspended_plans?: PlanItem[];
}

export interface RegistrationProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationId: number | null;
  onStatusChanged?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const API_URL = 'http://localhost/API-LOGIN/api';

const TABS: { id: ActiveTab; label: string; sub: string; icon: any }[] = [
  { id: 'info',    label: 'Informações', sub: 'Dados da Matrícula',    icon: BookOpen    },
  { id: 'finance', label: 'Financeiro',  sub: 'Situação Financeira',   icon: DollarSign  },
  { id: 'grades',  label: 'Notas',       sub: 'Avaliações',            icon: GraduationCap },
  { id: 'status',  label: 'Estado',      sub: 'Gerir Estado',          icon: Shield      },
];

const STATUS_DISPLAY: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  active:    { label: 'Activo',    color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  ativo:     { label: 'Activo',    color: 'text-green-700',  bg: 'bg-green-100',  icon: CheckCircle },
  suspended: { label: 'Suspenso',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
  suspenso:  { label: 'Suspenso',  color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
  trancado:  { label: 'Trancado',  color: 'text-blue-700',   bg: 'bg-blue-100',   icon: Lock },
  cancelled: { label: 'Cancelado', color: 'text-red-700',    bg: 'bg-red-100',    icon: Ban },
  cancelado: { label: 'Cancelado', color: 'text-red-700',    bg: 'bg-red-100',    icon: Ban },
  pending:   { label: 'Pendente',  color: 'text-slate-700',  bg: 'bg-slate-100',  icon: AlertCircle },
  completed: { label: 'Concluído', color: 'text-indigo-700', bg: 'bg-indigo-100', icon: CheckCircle },
};

const PLAN_STATUS_COLORS: Record<string, string> = {
  paid:      'bg-green-100 text-green-700',
  partial:   'bg-blue-100 text-blue-700',
  pending:   'bg-yellow-100 text-yellow-700',
  overdue:   'bg-red-100 text-red-700',
  exempt:    'bg-indigo-100 text-indigo-700',
  cancelled: 'bg-slate-100 text-slate-500',
  scheduled: 'bg-slate-100 text-slate-500',
};

function toActionStatus(status: string): RegistrationStatus {
  const map: Record<string, RegistrationStatus> = {
    active: 'ativo', ativo: 'ativo',
    suspended: 'suspenso', suspenso: 'suspenso',
    trancado: 'trancado',
    cancelled: 'cancelado', cancelado: 'cancelado',
    pending: 'ativo', completed: 'cancelado',
  };
  return map[status] ?? 'ativo';
}

function fmtDate(d: string | null | undefined): string {
  if (!d) return '---';
  return new Date(d).toLocaleDateString('pt-MZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RegistrationProfileModal({
  isOpen,
  onClose,
  registrationId,
  onStatusChanged
}: RegistrationProfileModalProps) {

  const [activeTab,          setActiveTab]          = useState<ActiveTab>('info');
  const [loadedTabs,         setLoadedTabs]          = useState<Set<ActiveTab>>(new Set());
  const [regDetails,         setRegDetails]          = useState<RegDetails | null>(null);
  const [financeData,        setFinanceData]         = useState<FinanceData | null>(null);
  const [gradesData,         setGradesData]          = useState<GradeRow[]>([]);
  const [isLoading,          setIsLoading]           = useState(false);
  const [tabLoading,         setTabLoading]          = useState(false);
  const [isEditing,          setIsEditing]           = useState(false);
  const [editObs,            setEditObs]             = useState('');
  const [isSavingObs,        setIsSavingObs]         = useState(false);
  const [suspendedCollapsed, setSuspendedCollapsed]  = useState(true);

  const getAuthHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
  });

  // ── Loaders ───────────────────────────────────────────────────────────────

  const loadRegDetails = useCallback(async () => {
    if (!registrationId) return;
    setIsLoading(true);
    try {
      const res  = await fetch(`${API_URL}/registrations/show.php?id=${registrationId}`, { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setRegDetails(data.data);
        setEditObs(data.data.observations ?? '');
      } else {
        toast.error(data.message || 'Erro ao carregar matrícula');
      }
    } catch {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  }, [registrationId]);

  const loadFinance = useCallback(async (reg: RegDetails) => {
    setTabLoading(true);
    try {
      const res  = await fetch(
        `${API_URL}/student-finance.php?student_id=${reg.student_id}&registration_id=${reg.id}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (data.success) {
        setFinanceData({ summary: data.summary, plans: data.plans ?? [], suspended_plans: data.suspended_plans ?? [] });
      } else {
        toast.error(data.message || 'Erro ao carregar dados financeiros');
      }
    } catch {
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setTabLoading(false);
    }
  }, []);

  const loadGrades = useCallback(async (reg: RegDetails) => {
    if (!reg.class_id) { setGradesData([]); return; }
    setTabLoading(true);
    try {
      const res  = await fetch(
        `${API_URL}/grades.php?student_id=${reg.student_id}&class_id=${reg.class_id}`,
        { headers: getAuthHeaders() }
      );
      const data = await res.json();
      if (data.success) setGradesData(data.data ?? []);
      else toast.error(data.message || 'Erro ao carregar notas');
    } catch {
      toast.error('Erro ao carregar notas');
    } finally {
      setTabLoading(false);
    }
  }, []);

  // ── On open ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (isOpen && registrationId) {
      setActiveTab('info');
      setLoadedTabs(new Set(['info']));
      setRegDetails(null);
      setFinanceData(null);
      setGradesData([]);
      setIsEditing(false);
      setSuspendedCollapsed(true);
      loadRegDetails();
    }
  }, [isOpen, registrationId]);

  // ── Tab switch ────────────────────────────────────────────────────────────

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (!regDetails || loadedTabs.has(tab)) return;
    setLoadedTabs(prev => new Set([...prev, tab]));
    if (tab === 'finance') loadFinance(regDetails);
    if (tab === 'grades')  loadGrades(regDetails);
  };

  // ── Save observations ─────────────────────────────────────────────────────

  const handleSaveObs = async () => {
    if (!regDetails) return;
    setIsSavingObs(true);
    try {
      const res  = await fetch(`${API_URL}/registrations.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ id: regDetails.id, observations: editObs })
      });
      const data = await res.json();
      if (data.success) {
        setRegDetails(prev => prev ? { ...prev, observations: editObs } : prev);
        setIsEditing(false);
        toast.success('Observações guardadas com sucesso');
      } else {
        toast.error(data.message || 'Erro ao guardar');
      }
    } catch {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSavingObs(false);
    }
  };

  // ── After status action ───────────────────────────────────────────────────

  const handleStatusChanged = async (newStatus: RegistrationStatus) => {
    setLoadedTabs(new Set(['info', 'status']));
    setFinanceData(null);
    setGradesData([]);
    await loadRegDetails();
    onStatusChanged?.();
  };

  if (!isOpen) return null;

  const statusInfo  = regDetails ? (STATUS_DISPLAY[regDetails.status] ?? STATUS_DISPLAY.active) : STATUS_DISPLAY.active;
  const StatusIcon  = statusInfo.icon;
  const activeTabMeta = TABS.find(t => t.id === activeTab)!;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[900px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh]">
        <DialogTitle className="sr-only">Perfil da Matrícula</DialogTitle>

        <div className="flex h-[80vh]">

          {/* ══════════════ SIDEBAR ══════════════ */}
          <div className="w-[240px] bg-gradient-to-b from-[#004B87] to-[#003366] flex flex-col flex-shrink-0">

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Perfil</h3>
                  <p className="text-blue-200 text-[10px] uppercase tracking-widest">Matrícula</p>
                </div>
              </div>

              <div className="bg-white/10 rounded-lg px-3 py-2 mt-3">
                {isLoading ? (
                  <div className="space-y-1.5">
                    <div className="h-3 bg-white/20 rounded animate-pulse w-3/4" />
                    <div className="h-2.5 bg-white/15 rounded animate-pulse w-1/2" />
                  </div>
                ) : (
                  <>
                    <p className="text-white text-xs font-bold truncate">
                      {regDetails?.student_name ?? '—'}
                    </p>
                    <p className="text-blue-200 text-[10px] font-mono truncate">
                      {regDetails?.course_id ?? '—'}
                    </p>
                  </>
                )}
              </div>

              {/* Status badge */}
              {!isLoading && regDetails && (
                <div className={cn(
                  "inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold",
                  statusInfo.bg, statusInfo.color
                )}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </div>
              )}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-1.5">
              {TABS.map(tab => {
                const Icon     = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-[#F5821F] text-white shadow-lg shadow-orange-900/30"
                        : "text-blue-100 hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{tab.label}</p>
                      <p className={cn("text-[10px]", isActive ? "text-orange-100" : "text-blue-300")}>
                        {tab.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Registration ID */}
            <div className="px-4 pb-4">
              <div className="bg-white/10 rounded-lg px-3 py-2 text-center">
                <p className="text-blue-300 text-[10px] uppercase tracking-wider">ID</p>
                <p className="text-white text-xs font-bold font-mono">
                  #{regDetails?.id ?? '—'}
                </p>
              </div>
            </div>
          </div>

          {/* ══════════════ CONTENT ══════════════ */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Top bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#004B87]">{activeTabMeta.label}</h2>
                <p className="text-xs text-slate-500">{activeTabMeta.sub}</p>
              </div>
              <div className="flex items-center gap-2">
                {/* Edit / Save buttons — only on Info tab */}
                {activeTab === 'info' && !isLoading && regDetails && (
                  isEditing ? (
                    <>
                      <button
                        onClick={() => { setIsEditing(false); setEditObs(regDetails.observations ?? ''); }}
                        className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveObs}
                        disabled={isSavingObs}
                        className="h-8 px-4 rounded-lg bg-[#F5821F] hover:bg-[#E07318] text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                      >
                        {isSavingObs
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <Save className="h-3.5 w-3.5" />
                        }
                        Guardar Alterações
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="h-8 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-600 flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  )
                )}
                <button
                  onClick={onClose}
                  className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

              {/* Global loading */}
              {isLoading && (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-[#004B87]" />
                </div>
              )}

              {!isLoading && (
                <>
                  {/* ══ ABA: INFORMAÇÕES ══ */}
                  {activeTab === 'info' && regDetails && (
                    <div className="space-y-6">

                      {/* Status badge */}
                      <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full", statusInfo.bg)}>
                        <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
                        <span className={cn("text-sm font-bold", statusInfo.color)}>{statusInfo.label}</span>
                      </div>

                      {/* Estudante */}
                      <section>
                        <SectionTitle icon={User} label="Estudante" />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoField label="Nome Completo"   value={regDetails.student_name}     icon={User}     />
                          <InfoField label="Email"           value={regDetails.student_email}    icon={Mail}     />
                          <InfoField label="Telefone"        value={regDetails.student_phone}    icon={Phone}    />
                          <InfoField label="Nº BI"           value={regDetails.student_bi}       icon={FileText} />
                          <InfoField label="Username"        value={regDetails.student_username} icon={FileText} mono />
                          <InfoField label="Género"          value={regDetails.student_gender}   icon={User}     />
                        </div>
                      </section>

                      {/* Académico */}
                      <section>
                        <SectionTitle icon={BookOpen} label="Académico" />
                        <div className="grid grid-cols-2 gap-4">
                          <InfoField label="Curso"           value={regDetails.course_name}      icon={BookOpen}     />
                          <InfoField label="Categoria"       value={regDetails.category_name}    icon={FileText}     />
                          <InfoField label="Turma"           value={regDetails.class_name}       icon={BookOpen}     />
                          <InfoField label="Turno"           value={regDetails.class_turno}      icon={Calendar}     />
                          {regDetails.nivel_name && (
                            <InfoField
                              label="Nível"
                              value={`${regDetails.nivel_number} — ${regDetails.nivel_name}`}
                              icon={GraduationCap}
                            />
                          )}
                          <InfoField label="Data de Matrícula" value={fmtDate(regDetails.enrollment_date)} icon={Calendar} />
                          {regDetails.suspension_date && (
                            <InfoField label="Data de Suspensão" value={fmtDate(regDetails.suspension_date)} icon={Calendar} />
                          )}
                        </div>
                        {regDetails.suspension_reason && (
                          <div className="mt-3 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                            <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider mb-1">
                              Motivo de Suspensão
                            </p>
                            <p className="text-sm text-yellow-800">{regDetails.suspension_reason}</p>
                          </div>
                        )}
                      </section>

                      {/* Financeiro */}
                      <section>
                        <SectionTitle icon={CreditCard} label="Financeiro Base" />
                        <div className="grid grid-cols-3 gap-4">
                          <InfoField label="Taxa de Matrícula" value={formatCurrency(regDetails.enrollment_fee)} icon={CreditCard} />
                          <InfoField label="Mensalidade"       value={formatCurrency(regDetails.monthly_fee)}    icon={CreditCard} />
                          <InfoField label="Bolsista"          value={regDetails.is_bolsista ? 'Sim' : 'Não'}   icon={FileText}   />
                        </div>
                      </section>

                      {/* Observações */}
                      <section>
                        <SectionTitle icon={Info} label="Observações" />
                        {isEditing ? (
                          <textarea
                            value={editObs}
                            onChange={e => setEditObs(e.target.value)}
                            placeholder="Observações sobre esta matrícula..."
                            className="w-full h-28 px-4 py-3 border-2 border-slate-200 rounded-xl text-sm resize-none focus:border-[#F5821F] focus:outline-none transition-colors"
                          />
                        ) : (
                          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-h-[70px]">
                            <p className="text-sm text-slate-700 whitespace-pre-line">
                              {regDetails.observations || <span className="text-slate-400 italic">Sem observações</span>}
                            </p>
                          </div>
                        )}
                      </section>
                    </div>
                  )}

                  {activeTab === 'info' && !regDetails && !isLoading && (
                    <Empty message="Matrícula não encontrada" />
                  )}

                  {/* ══ ABA: FINANCEIRO ══ */}
                  {activeTab === 'finance' && (
                    <>
                      {tabLoading && <TabLoader />}
                      {!tabLoading && financeData && (
                        <div className="space-y-6">
                          {/* Summary */}
                          <div className="grid grid-cols-4 gap-4">
                            <SummaryCard color="green"  label="Saldo Wallet" value={formatCurrency(financeData.summary.wallet_balance)} />
                            <SummaryCard color="yellow" label="Em Dívida"    value={formatCurrency(financeData.summary.total_pending)}  />
                            <SummaryCard color="red"    label="Em Atraso"    value={formatCurrency(financeData.summary.total_overdue)}  />
                            <SummaryCard color="blue"   label="Total Pago"   value={formatCurrency(financeData.summary.total_paid)}     />
                          </div>

                          {/* Active plans */}
                          {financeData.plans.length > 0 && (
                            <div>
                              <SectionTitle icon={CreditCard} label="Planos Activos" />
                              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-[10px] text-slate-500 font-bold uppercase">
                                      <th className="text-left px-4 py-3">Mês</th>
                                      <th className="text-left px-4 py-3">Vencimento</th>
                                      <th className="text-right px-4 py-3">Valor</th>
                                      <th className="text-right px-4 py-3">Pago</th>
                                      <th className="text-center px-4 py-3">Estado</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {financeData.plans.map(plan => (
                                      <tr key={plan.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                          {formatMonthReference(plan.month_reference)}
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{fmtDate(plan.due_date)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-800">
                                          {formatCurrency(plan.total_expected)}
                                          {plan.penalty_amount > 0 && (
                                            <span className="ml-1 text-red-500 text-[10px]">
                                              +{formatCurrency(plan.penalty_amount)}
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-4 py-3 text-right text-slate-500">
                                          {formatCurrency(plan.paid_total)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                          <span className={cn(
                                            "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                                            PLAN_STATUS_COLORS[plan.status] ?? 'bg-slate-100 text-slate-500'
                                          )}>
                                            {PAYMENT_STATUS_LABELS[plan.status as keyof typeof PAYMENT_STATUS_LABELS] ?? plan.status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Suspended plans */}
                          {financeData.suspended_plans && financeData.suspended_plans.length > 0 && (
                            <div>
                              <button
                                onClick={() => setSuspendedCollapsed(p => !p)}
                                className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition-colors mb-2"
                              >
                                {suspendedCollapsed
                                  ? <ChevronDown className="h-3.5 w-3.5" />
                                  : <ChevronUp   className="h-3.5 w-3.5" />
                                }
                                Histórico de Trancamento ({financeData.suspended_plans.length} plano(s))
                              </button>
                              {!suspendedCollapsed && (
                                <div className="bg-slate-100 rounded-xl border border-slate-200 overflow-hidden opacity-70">
                                  <table className="w-full text-sm">
                                    <thead className="bg-slate-200">
                                      <tr className="text-[10px] text-slate-500 font-bold uppercase">
                                        <th className="text-left px-4 py-2.5">Mês</th>
                                        <th className="text-left px-4 py-2.5">Vencimento</th>
                                        <th className="text-right px-4 py-2.5">Valor Base</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                      {financeData.suspended_plans.map(plan => (
                                        <tr key={plan.id}>
                                          <td className="px-4 py-2.5 text-slate-600">{formatMonthReference(plan.month_reference)}</td>
                                          <td className="px-4 py-2.5 text-slate-500">{fmtDate(plan.due_date)}</td>
                                          <td className="px-4 py-2.5 text-right text-slate-400 line-through">
                                            {formatCurrency(plan.base_amount)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )}

                          {financeData.plans.length === 0 && !financeData.suspended_plans?.length && (
                            <Empty message="Sem planos de pagamento para esta matrícula" />
                          )}
                        </div>
                      )}
                      {!tabLoading && !financeData && <Empty message="Dados financeiros não disponíveis" />}
                    </>
                  )}

                  {/* ══ ABA: NOTAS ══ */}
                  {activeTab === 'grades' && (
                    <>
                      {tabLoading && <TabLoader />}
                      {!tabLoading && !regDetails?.class_id && (
                        <Empty message="Esta matrícula não está associada a uma turma" />
                      )}
                      {!tabLoading && regDetails?.class_id && gradesData.length === 0 && (
                        <Empty message="Sem notas registadas para esta matrícula" />
                      )}
                      {!tabLoading && gradesData.length > 0 && (
                        <div>
                          <SectionTitle icon={GraduationCap} label="Avaliações por Nível" />
                          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-slate-50 border-b border-slate-200">
                                <tr className="text-[10px] text-slate-500 font-bold uppercase">
                                  <th className="text-left px-4 py-3">Nível</th>
                                  <th className="text-center px-3 py-3">T1 (20%)</th>
                                  <th className="text-center px-3 py-3">T2 (20%)</th>
                                  <th className="text-center px-3 py-3">Ex. Prático (30%)</th>
                                  <th className="text-center px-3 py-3">Ex. Teórico (30%)</th>
                                  <th className="text-center px-3 py-3">Média</th>
                                  <th className="text-center px-3 py-3">Estado</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {gradesData.map(row => (
                                  <tr key={row.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3 font-semibold text-slate-800">Nível {row.period_number}</td>
                                    <td className="px-3 py-3 text-center text-slate-600">{row.grade_teste1 ?? '—'}</td>
                                    <td className="px-3 py-3 text-center text-slate-600">{row.grade_teste2 ?? '—'}</td>
                                    <td className="px-3 py-3 text-center text-slate-600">{row.grade_exame_pratico ?? '—'}</td>
                                    <td className="px-3 py-3 text-center text-slate-600">{row.grade_exame_teorico ?? '—'}</td>
                                    <td className="px-3 py-3 text-center font-bold text-[#004B87]">
                                      {row.final_grade !== null ? row.final_grade : '—'}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                      {row.status ? (
                                        <span className={cn(
                                          "inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold",
                                          row.status === 'passed'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        )}>
                                          {row.status === 'passed' ? 'Aprovado' : 'Reprovado'}
                                        </span>
                                      ) : '—'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* ══ ABA: ESTADO ══ */}
                  {activeTab === 'status' && (
                    <>
                      {regDetails ? (
                        <div className="space-y-4">
                          {/* Current status card */}
                          <div className={cn("rounded-2xl p-5 border-2 flex items-center gap-4", statusInfo.bg, `border-${statusInfo.color.replace('text-', '')}/30`)}>
                            <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", statusInfo.bg)}>
                              <StatusIcon className={cn("h-6 w-6", statusInfo.color)} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estado Actual</p>
                              <p className={cn("text-xl font-bold", statusInfo.color)}>{statusInfo.label}</p>
                              {regDetails.suspension_date && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Desde {fmtDate(regDetails.suspension_date)}
                                </p>
                              )}
                            </div>
                          </div>

                          <RegistrationStatusActions
                            registrationId={regDetails.id}
                            currentStatus={toActionStatus(regDetails.status)}
                            studentName={regDetails.student_name}
                            studentUsername={regDetails.student_username ?? undefined}
                            onStatusChanged={handleStatusChanged}
                          />
                        </div>
                      ) : (
                        <Empty message="Carregando dados da matrícula..." />
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function InfoField({
  label, value, icon: Icon, mono, iconColor
}: {
  label: string;
  value: string | null | undefined;
  icon: any;
  mono?: boolean;
  iconColor?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn("h-3.5 w-3.5", iconColor ?? "text-slate-400")} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className={cn("text-sm font-semibold text-slate-800 pl-5", mono && "font-mono")}>
        {value || '---'}
      </p>
    </div>
  );
}

function SectionTitle({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-4 w-4 text-[#004B87]" />
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: 'green' | 'yellow' | 'red' | 'blue' }) {
  const c = {
    green:  { bg: 'bg-green-50',  border: 'border-green-200',  text: 'text-green-700'  },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
    red:    { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700'    },
    blue:   { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700'   },
  }[color];
  return (
    <div className={cn("rounded-xl border p-4", c.bg, c.border)}>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-lg font-bold", c.text)}>{value}</p>
    </div>
  );
}

function TabLoader() {
  return (
    <div className="flex items-center justify-center h-40">
      <Loader2 className="h-7 w-7 animate-spin text-[#004B87]" />
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-40 text-slate-400">
      <AlertCircle className="h-10 w-10 mb-3 text-slate-300" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
