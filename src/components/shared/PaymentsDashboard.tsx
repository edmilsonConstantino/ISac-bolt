// src/components/shared/PaymentsDashboard.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Search,
  DollarSign,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Users,
  ChevronRight,
  CreditCard,
  Calendar,
  Wallet,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Info,
  Ban,
  RefreshCw,
  Banknote,
  Hash,
  TrendingUp,
  FileText,
  X,
  Printer,
} from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle } from "@/components/ui/page-header";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { financeService } from "@/services/financeService";
import {
  StudentFinanceResponse,
  PaymentPlanItem,
  PaymentTransaction,
  PaymentMethod,
  formatCurrency,
  formatMonthReference,
  PAYMENT_METHOD_LABELS
} from "@/types/finance";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

interface StudentListItem {
  id: number;
  name: string;
  email: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PlanStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'paid':
      return <Badge className="bg-green-600 text-white shrink-0"><CheckCircle className="h-3 w-3 mr-1" />Pago</Badge>;
    case 'overdue':
      return <Badge variant="destructive" className="shrink-0"><AlertTriangle className="h-3 w-3 mr-1" />Atraso</Badge>;
    case 'partial':
      return <Badge className="bg-amber-500 text-white shrink-0"><Clock className="h-3 w-3 mr-1" />Parcial</Badge>;
    default:
      return <Badge variant="secondary" className="shrink-0"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
  }
}

function PaymentStatusBadge({ status }: { status: string }) {
  if (status === 'void' || status === 'reversed') {
    return <Badge variant="outline" className="text-slate-500 border-slate-400 shrink-0"><Ban className="h-3 w-3 mr-1" />Anulado</Badge>;
  }
  return <Badge className="bg-green-600 text-white shrink-0"><CheckCircle className="h-3 w-3 mr-1" />Confirmado</Badge>;
}

// ─── Component ───────────────────────────────────────────────────────────────

interface PaymentsDashboardProps {
  initialStudents?: StudentListItem[];
}

export function PaymentsDashboard({ initialStudents }: PaymentsDashboardProps) {
  const [students, setStudents] = useState<StudentListItem[]>(initialStudents ?? []);
  const [loadingStudents, setLoadingStudents] = useState(!initialStudents);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentFinance, setStudentFinance] = useState<StudentFinanceResponse | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);
  const [financeDialogOpen, setFinanceDialogOpen] = useState(false);

  // Track overdue status per student (populated on load)
  const [overdueMap, setOverdueMap] = useState<Record<number, boolean>>({});

  // ── Payment modal ──────────────────────────────────────────────────────────
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    plan: PaymentPlanItem | null;
    isAdvance: boolean;
  }>({ isOpen: false, plan: null, isAdvance: false });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    observacoes: '',
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // ── Void modal ─────────────────────────────────────────────────────────────
  const [voidModal, setVoidModal] = useState<{
    isOpen: boolean;
    payment: PaymentTransaction | null;
  }>({ isOpen: false, payment: null });

  const [voidReason, setVoidReason] = useState('');
  const [submittingVoid, setSubmittingVoid] = useState(false);

  const [rightTab, setRightTab] = useState<'calendar' | 'history'>('calendar');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchOverdueMap = async () => {
    try {
      const token = localStorage.getItem('access_token') || '';
      const resp = await fetch(`${API_URL}/student-finance.php?overdue_summary=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.success) setOverdueMap(data.data || {});
      }
    } catch { /* silent */ }
  };

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const [studentsResp, overdueResp] = await Promise.all([
        fetch(`${API_URL}/students.php`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_URL}/student-finance.php?overdue_summary=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);
      const data = await studentsResp.json();
      if (data.success) setStudents(data.data || []);
      if (overdueResp.ok) {
        const overdueData = await overdueResp.json();
        if (overdueData.success) setOverdueMap(overdueData.data || {});
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentFinance = useCallback(async (studentId: number) => {
    setLoadingFinance(true);
    try {
      const data = await financeService.getStudentFinance(studentId);
      setStudentFinance(data);
      setOverdueMap(prev => ({
        ...prev,
        [studentId]: (data.summary?.overdue_count ?? 0) > 0
      }));
    } catch {
      setStudentFinance(null);
    } finally {
      setLoadingFinance(false);
    }
  }, []);

  useEffect(() => {
    if (initialStudents) {
      fetchOverdueMap(); // estudantes já vieram do pai — só buscar overdue
    } else {
      fetchStudents();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Open finance dialog ────────────────────────────────────────────────────

  const openStudentFinance = (student: StudentListItem) => {
    setSelectedStudentId(student.id);
    setStudentFinance(null);
    setRightTab('calendar');
    setFinanceDialogOpen(true);
    fetchStudentFinance(student.id);
  };

  const closeFinanceDialog = () => {
    setFinanceDialogOpen(false);
    setSelectedStudentId(null);
    setStudentFinance(null);
    setSearchTerm("");
  };

  // ── Filtered students ──────────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  const overdueCount = Object.values(overdueMap).filter(Boolean).length;

  // ── Payment modal helpers ──────────────────────────────────────────────────

  const openPaymentModal = (plan: PaymentPlanItem) => {
    setPaymentForm({
      amount: plan.remaining,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      receipt_number: '',
      observacoes: '',
    });
    setPaymentModal({ isOpen: true, plan, isAdvance: false });
  };

  const openAdvanceModal = () => {
    setPaymentForm({
      amount: 0,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      receipt_number: '',
      observacoes: '',
    });
    setPaymentModal({ isOpen: true, plan: null, isAdvance: true });
  };

  const closePaymentModal = () =>
    setPaymentModal({ isOpen: false, plan: null, isAdvance: false });

  const handlePayment = async () => {
    if (!studentFinance?.course) return;
    if (paymentForm.amount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }
    setSubmittingPayment(true);
    try {
      const result = await financeService.recordPayment({
        student_id: studentFinance.student.id,
        curso_id: studentFinance.course.id,
        amount_paid: paymentForm.amount,
        payment_method: paymentForm.method,
        paid_date: paymentForm.date,
        receipt_number: paymentForm.receipt_number || undefined,
        observacoes: paymentForm.observacoes || undefined,
      });

      const msg = paymentModal.isAdvance
        ? `Crédito de ${formatCurrency(paymentForm.amount)} registado!`
        : `Pagamento de ${formatCurrency(paymentForm.amount)} confirmado! ${result.plans_fully_paid} parcela(s) liquidada(s).`;

      toast.success(msg);
      closePaymentModal();
      if (selectedStudentId) fetchStudentFinance(selectedStudentId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registar pagamento');
    } finally {
      setSubmittingPayment(false);
    }
  };

  // ── Void helpers ───────────────────────────────────────────────────────────

  const openVoidModal = (payment: PaymentTransaction) => {
    setVoidReason('');
    setVoidModal({ isOpen: true, payment });
  };

  const closeVoidModal = () => setVoidModal({ isOpen: false, payment: null });

  const handleVoidPayment = async () => {
    if (!voidModal.payment) return;
    setSubmittingVoid(true);
    try {
      await financeService.reversePayment(
        voidModal.payment.id,
        voidReason || 'Anulado pelo administrador'
      );
      toast.success('Pagamento anulado com sucesso.');
      closeVoidModal();
      if (selectedStudentId) fetchStudentFinance(selectedStudentId);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao anular pagamento');
    } finally {
      setSubmittingVoid(false);
    }
  };

  const summary = studentFinance?.summary;
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <PageHeader>
        <div className="flex items-center justify-between w-full">
          <div>
            <PageHeaderTitle icon={<DollarSign className="h-7 w-7 text-[#004B87]" />}>
              Gestão de Pagamentos
            </PageHeaderTitle>
            <PageHeaderSubtitle>
              Pesquise um estudante e clique para gerir os pagamentos
            </PageHeaderSubtitle>
          </div>
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <p className="text-xl font-bold text-[#004B87]">{students.length}</p>
              <p className="text-xs text-slate-500">Estudantes</p>
            </div>
            {overdueCount > 0 && (
              <div className="text-center px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xl font-bold text-red-600">{overdueCount}</p>
                <p className="text-xs text-slate-500">Em Atraso</p>
              </div>
            )}
          </div>
        </div>
      </PageHeader>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={fetchStudents}
          title="Actualizar lista"
        >
          <RefreshCw className={`h-4 w-4 ${loadingStudents ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ── Student List ────────────────────────────────────────────────────── */}
      <Card className="shadow-sm border border-slate-200">
        <CardContent className="p-0">

          {/* List header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#004B87]" />
              <span className="font-semibold text-[#004B87] text-sm">Estudantes</span>
              {!loadingStudents && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {filteredStudents.length}
                  {searchTerm ? ` de ${students.length}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          {loadingStudents ? (
            <div className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-3.5 flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-slate-200 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="h-7 w-28 bg-slate-100 rounded-lg shrink-0" />
                </div>
              ))}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-200" />
              <p className="text-sm font-medium text-slate-500">
                {searchTerm ? 'Nenhum estudante encontrado para essa pesquisa' : 'Nenhum estudante registado'}
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-2 text-xs text-[#F5821F] hover:underline"
                >
                  Limpar pesquisa
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredStudents.map((student) => {
                const hasOverdue = overdueMap[student.id];
                return (
                  <button
                    key={student.id}
                    onClick={() => openStudentFinance(student)}
                    className="w-full text-left px-4 py-3.5 hover:bg-slate-50 transition-colors group flex items-center gap-4"
                  >
                    {/* Avatar */}
                    <AvatarInitials name={student.name} size="md" shape="circle" />

                    {/* Name + email */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 group-hover:text-[#004B87] transition-colors truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{student.email}</p>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0 flex items-center gap-2">
                      {hasOverdue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                          <AlertTriangle className="h-3 w-3" />
                          Em Atraso
                        </span>
                      ) : overdueMap[student.id] === false ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium bg-green-50 text-green-600 px-2.5 py-1 rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          Em Dia
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[#F5821F] text-white px-3 py-1.5 rounded-lg shadow-sm group-hover:bg-[#E07318] transition-colors hidden sm:flex">
                        Ver pagamentos
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Finance Dialog ────────────────────────────────────────────────── */}
      <Dialog open={financeDialogOpen} onOpenChange={(open) => !open && closeFinanceDialog()}>
        <DialogContent className="max-w-2xl h-[88vh] overflow-hidden p-0 gap-0 rounded-2xl border-0 shadow-2xl flex flex-col">

          {/* ── Gradient Header ── */}
          <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-6 pt-5 pb-5 relative shrink-0">
            <div className="absolute inset-0 bg-black/5 rounded-t-2xl" />
            <div className="relative">

              {/* Top row: avatar + name + actions */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedStudent && (
                    <div className="h-11 w-11 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-base">
                        {selectedStudent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-white text-base leading-tight">
                      {selectedStudent?.name ?? '—'}
                    </h2>
                    <p className="text-blue-200 text-xs mt-0.5">
                      {loadingFinance
                        ? 'A carregar...'
                        : studentFinance?.course?.name ?? 'Sem matrícula activa'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!loadingFinance && studentFinance?.course && (
                    <Button
                      onClick={openAdvanceModal}
                      size="sm"
                      className="bg-[#F5821F] hover:bg-[#E07318] text-white border-0 h-8 px-3 text-xs font-semibold shadow-md"
                    >
                      <Wallet className="h-3.5 w-3.5 mr-1.5" />
                      Adicionar Crédito
                    </Button>
                  )}
                  <button
                    onClick={() => selectedStudentId && fetchStudentFinance(selectedStudentId)}
                    disabled={loadingFinance}
                    className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-colors disabled:opacity-50"
                    title="Actualizar"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-white ${loadingFinance ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Stats row — shown only when data is loaded */}
              {!loadingFinance && summary && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="h-3 w-3 text-blue-200" />
                      <span className="text-[10px] text-blue-200 font-medium uppercase tracking-wide">Crédito</span>
                    </div>
                    <p className={`text-sm font-bold leading-none ${summary.wallet_balance > 0 ? 'text-white' : 'text-white/60'}`}>
                      {formatCurrency(summary.wallet_balance)}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CheckCircle className="h-3 w-3 text-green-300" />
                      <span className="text-[10px] text-green-200 font-medium uppercase tracking-wide">Pago</span>
                    </div>
                    <p className="text-sm font-bold text-white leading-none">
                      {formatCurrency(summary.total_paid)}
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle className="h-3 w-3 text-red-300" />
                      <span className="text-[10px] text-red-200 font-medium uppercase tracking-wide">Atraso</span>
                    </div>
                    <p className={`text-sm font-bold leading-none ${summary.total_overdue > 0 ? 'text-red-300' : 'text-white/60'}`}>
                      {formatCurrency(summary.total_overdue)}
                    </p>
                    {summary.overdue_count > 0 && (
                      <p className="text-[10px] text-red-300/80 mt-0.5">{summary.overdue_count} parcela(s)</p>
                    )}
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 border border-white/20">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="h-3 w-3 text-orange-300" />
                      <span className="text-[10px] text-orange-200 font-medium uppercase tracking-wide">Multas</span>
                    </div>
                    <p className={`text-sm font-bold leading-none ${summary.total_penalties > 0 ? 'text-orange-300' : 'text-white/60'}`}>
                      {formatCurrency(summary.total_penalties)}
                    </p>
                  </div>
                </div>
              )}

              {/* Skeleton stats while loading */}
              {loadingFinance && (
                <div className="grid grid-cols-4 gap-2">
                  {[0,1,2,3].map(i => (
                    <div key={i} className="bg-white/10 rounded-xl px-3 py-2 border border-white/20 h-[52px] animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Body (scrollable) ── */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {!studentFinance ? (
              <div className="py-12 text-center px-6">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
                <p className="font-medium text-slate-600 mb-3">Erro ao carregar dados</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedStudentId && fetchStudentFinance(selectedStudentId)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
                </Button>
              </div>

            ) : !studentFinance.course ? (
              <div className="p-5">
                <NoEnrollmentView
                  studentFinance={studentFinance}
                  onVoid={openVoidModal}
                  onRefresh={() => selectedStudentId && fetchStudentFinance(selectedStudentId)}
                />
              </div>

            ) : (
              <div className="p-5 space-y-4">

                {/* Class info bar */}
                {studentFinance.class && (
                  <div className={`px-3 py-2.5 rounded-xl flex items-center justify-between text-sm border ${
                    summary?.class_concluded
                      ? 'bg-slate-50 border-slate-200'
                      : summary?.class_started
                        ? 'bg-green-50 border-green-200'
                        : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className={`h-4 w-4 ${
                        summary?.class_concluded ? 'text-slate-500'
                        : summary?.class_started ? 'text-green-600'
                        : 'text-amber-600'
                      }`} />
                      <span className="font-semibold text-slate-700">{studentFinance.class.name}</span>
                      {summary?.class_started && studentFinance.class.start_date && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-500 text-xs">Início: {formatDate(studentFinance.class.start_date)}</span>
                        </>
                      )}
                      {!summary?.class_started && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-amber-600 text-xs">Ainda não iniciou</span>
                        </>
                      )}
                    </div>
                    {summary?.class_concluded ? (
                      <Badge className="bg-slate-500 text-white text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />Concluída
                      </Badge>
                    ) : summary?.class_started ? (
                      <Badge className="bg-green-600 text-white text-xs">
                        <PlayCircle className="h-3 w-3 mr-1" />Em Andamento
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />Aguardando
                      </Badge>
                    )}
                  </div>
                )}

                {/* Tabs */}
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {/* Tab headers */}
                  <div className="flex bg-slate-50 border-b border-slate-200">
                    <button
                      onClick={() => setRightTab('calendar')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2 ${
                        rightTab === 'calendar'
                          ? 'border-[#004B87] text-[#004B87] bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
                      }`}
                    >
                      <Calendar className="h-4 w-4" />
                      Calendário
                      {studentFinance.plans.length > 0 && (
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                          rightTab === 'calendar' ? 'bg-[#004B87] text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {studentFinance.plans.length}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setRightTab('history')}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-all border-b-2 ${
                        rightTab === 'history'
                          ? 'border-[#F5821F] text-[#F5821F] bg-white'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-white/60'
                      }`}
                    >
                      <Receipt className="h-4 w-4" />
                      Histórico
                      {studentFinance.recent_payments.length > 0 && (
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                          rightTab === 'history' ? 'bg-[#F5821F] text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {studentFinance.recent_payments.length}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Calendar tab */}
                  {rightTab === 'calendar' && (
                    <div className="p-4 bg-white">
                      {!summary?.class_started ? (
                        <div className="py-8 text-center bg-amber-50 border border-amber-200 rounded-xl">
                          <Info className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                          {!studentFinance.class?.start_date ? (
                            <>
                              <p className="text-sm font-medium text-amber-700">Turma sem data de início definida</p>
                              <p className="text-xs text-amber-600 mt-1 max-w-xs mx-auto">
                                Após definida a data de início da turma, o calendário de pagamentos será gerado automaticamente.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-amber-700">Turma ainda não iniciou</p>
                              <p className="text-xs text-amber-600 mt-1 max-w-xs mx-auto">
                                Início previsto para <strong>{formatDate(studentFinance.class.start_date)}</strong>.
                              </p>
                            </>
                          )}
                        </div>
                      ) : studentFinance.plans.length === 0 && summary?.class_concluded ? (
                        <div className="py-8 text-center bg-slate-50 border border-slate-200 rounded-xl">
                          <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-sm font-medium text-slate-600">Turma concluída</p>
                          <p className="text-xs text-slate-400 mt-1">Todas as parcelas foram liquidadas.</p>
                        </div>
                      ) : studentFinance.plans.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-xl text-slate-500">
                          <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">Sem parcelas geradas</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {studentFinance.plans.map((plan) => (
                            <PlanRow key={plan.id} plan={plan} onPay={openPaymentModal} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* History tab */}
                  {rightTab === 'history' && (
                    <div className="p-4 bg-white">
                      {studentFinance.recent_payments.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-xl text-slate-500">
                          <Banknote className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                          <p className="text-sm">Nenhum pagamento registado</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {studentFinance.recent_payments.map((payment) => (
                            <PaymentRow key={payment.id} payment={payment} onVoid={openVoidModal} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer bar ── */}
          <div className="shrink-0 border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between rounded-b-2xl">
            <div className="flex items-center gap-2">
              {!loadingFinance && studentFinance?.course && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-[#004B87] hover:border-[#004B87]/30"
                  onClick={() => setRightTab(rightTab === 'calendar' ? 'history' : 'calendar')}
                >
                  {rightTab === 'calendar'
                    ? <><Receipt className="h-3.5 w-3.5" />Ver Histórico</>
                    : <><Calendar className="h-3.5 w-3.5" />Ver Calendário</>
                  }
                </Button>
              )}
              {!loadingFinance && selectedStudentId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs gap-1.5 text-slate-500 hover:text-[#004B87]"
                  onClick={() => fetchStudentFinance(selectedStudentId)}
                  disabled={loadingFinance}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Actualizar
                </Button>
              )}
            </div>
            <Button
              size="sm"
              className="h-8 px-4 text-xs font-semibold bg-[#004B87] hover:bg-[#003d6e] text-white gap-1.5"
              onClick={closeFinanceDialog}
            >
              <X className="h-3.5 w-3.5" />
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: Registar Pagamento ──────────────────────────────────────── */}
      <Dialog open={paymentModal.isOpen} onOpenChange={(open) => !open && closePaymentModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004B87]">
              {paymentModal.isAdvance
                ? <><Wallet className="h-5 w-5" />Adicionar Crédito</>
                : <><CreditCard className="h-5 w-5" />Registar Pagamento</>
              }
            </DialogTitle>
          </DialogHeader>

          {studentFinance?.course && (
            <div className="space-y-4">
              {/* Context info */}
              <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                <p className="text-xs text-slate-500">Estudante</p>
                <p className="font-semibold text-[#004B87]">{studentFinance.student.name}</p>
                <p className="text-xs text-slate-500">{studentFinance.course.name}</p>

                {paymentModal.isAdvance ? (
                  <div className="mt-2 flex items-start gap-1.5 p-2 bg-emerald-50 rounded text-xs text-emerald-700">
                    <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>O valor será alocado automaticamente às parcelas pendentes (FIFO). O excedente fica como crédito.</span>
                  </div>
                ) : paymentModal.plan ? (
                  <div className="mt-2 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-slate-500">Mês</p>
                      <p className="font-semibold">{formatMonthReference(paymentModal.plan.month_reference)}</p>
                      <p className="text-xs text-slate-500">Vence: {formatDate(paymentModal.plan.due_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Valor em dívida</p>
                      <p className="text-lg font-bold text-[#F5821F]">{formatCurrency(paymentModal.plan.remaining)}</p>
                    </div>
                  </div>
                ) : null}

                {paymentModal.plan?.penalty_amount && paymentModal.plan.penalty_amount > 0 && (
                  <div className="flex items-center gap-1.5 p-2 bg-red-50 rounded text-xs text-red-700">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    <span>Inclui multa de {formatCurrency(paymentModal.plan.penalty_amount)}</span>
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs font-medium text-slate-600">Valor Recebido (MT)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={paymentForm.amount || ''}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                  {paymentModal.plan && (
                    <button
                      type="button"
                      onClick={() => setPaymentForm(prev => ({ ...prev, amount: paymentModal.plan!.remaining }))}
                      className="text-xs text-[#F5821F] hover:underline mt-1"
                    >
                      Pagar valor total ({formatCurrency(paymentModal.plan.remaining)})
                    </button>
                  )}
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600">Método de Pagamento</Label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(v) => setPaymentForm(prev => ({ ...prev, method: v as PaymentMethod }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600">Data do Pagamento</Label>
                  <Input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, date: e.target.value }))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600">
                    <Hash className="h-3 w-3 inline mr-1" />
                    Nº Recibo (opcional)
                  </Label>
                  <Input
                    value={paymentForm.receipt_number}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, receipt_number: e.target.value }))}
                    placeholder="ex. REC-2026-001"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600">Observações (opcional)</Label>
                  <Input
                    value={paymentForm.observacoes}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Notas adicionais..."
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Partial payment warning */}
              {!paymentModal.isAdvance && paymentModal.plan &&
               paymentForm.amount > 0 &&
               paymentForm.amount < paymentModal.plan.remaining && (
                <div className="flex items-center gap-1.5 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Pagamento parcial — restará {formatCurrency(paymentModal.plan.remaining - paymentForm.amount)}
                </div>
              )}

              {/* Surplus wallet notice */}
              {paymentModal.plan &&
               paymentForm.amount > paymentModal.plan.remaining && (
                <div className="flex items-center gap-1.5 p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700">
                  <Wallet className="h-3.5 w-3.5 shrink-0" />
                  Excedente de {formatCurrency(paymentForm.amount - paymentModal.plan.remaining)} ficará como crédito
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={closePaymentModal}>
                  Cancelar
                </Button>
                <Button
                  className={`flex-1 ${paymentModal.isAdvance ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#F5821F] hover:bg-[#E07318]'}`}
                  onClick={handlePayment}
                  disabled={submittingPayment || paymentForm.amount <= 0}
                >
                  {submittingPayment
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />A processar...</>
                    : <><Receipt className="h-4 w-4 mr-2" />{paymentModal.isAdvance ? 'Adicionar Crédito' : 'Confirmar Pagamento'}</>
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Modal: Anular Pagamento ────────────────────────────────────────── */}
      <Dialog open={voidModal.isOpen} onOpenChange={(open) => !open && closeVoidModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Ban className="h-5 w-5" />
              Anular Pagamento
            </DialogTitle>
          </DialogHeader>

          {voidModal.payment && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                <p className="text-sm font-semibold text-red-700">
                  {formatCurrency(voidModal.payment.amount_paid)}
                </p>
                <p className="text-xs text-red-600">
                  {PAYMENT_METHOD_LABELS[voidModal.payment.payment_method as PaymentMethod] || voidModal.payment.payment_method}
                  {' · '}
                  {formatDate(voidModal.payment.paid_date)}
                </p>
                {voidModal.payment.receipt_number && (
                  <p className="text-xs text-red-600">Recibo: {voidModal.payment.receipt_number}</p>
                )}
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  Esta acção anulará o pagamento e reverterá as alocações. As parcelas voltarão ao estado anterior.
                  Esta acção <strong>não pode ser desfeita</strong>.
                </span>
              </div>

              <div>
                <Label className="text-xs font-medium text-slate-600">Motivo da Anulação</Label>
                <Input
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="ex. Pagamento em duplicado, erro de registo..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1" onClick={closeVoidModal}>
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleVoidPayment}
                  disabled={submittingVoid}
                >
                  {submittingVoid
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />A anular...</>
                    : <><Ban className="h-4 w-4 mr-2" />Anular Pagamento</>
                  }
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────



function PlanRow({ plan, onPay }: { plan: PaymentPlanItem; onPay: (p: PaymentPlanItem) => void }) {
  const isPaid = plan.status === 'paid';
  const isOverdue = plan.status === 'overdue';

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border-2 ${
      isOverdue ? 'border-red-200 bg-red-50' :
      isPaid    ? 'border-green-200 bg-green-50' :
      plan.status === 'partial' ? 'border-amber-200 bg-amber-50' :
      'border-slate-200 bg-white'
    }`}>
      <div className="flex items-center gap-3 min-w-0">
        {/* Month chip */}
        <div className="text-center min-w-[56px]">
          <p className={`font-bold text-sm leading-tight ${isOverdue ? 'text-red-700' : isPaid ? 'text-green-700' : 'text-[#004B87]'}`}>
            {formatMonthReference(plan.month_reference)}
          </p>
          <p className="text-[10px] text-slate-400">
            Vence {plan.due_date ? new Date(plan.due_date + 'T00:00:00').toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' }) : '—'}
          </p>
        </div>

        {/* Amounts */}
        <div className="min-w-0">
          <p className="text-sm">
            <span className="text-slate-600">Mensalidade: </span>
            <span className="font-medium">{formatCurrency(plan.base_amount)}</span>
          </p>
          {plan.penalty_amount > 0 && (
            <p className="text-xs text-red-600">
              + Multa: {formatCurrency(plan.penalty_amount)}
              {plan.days_overdue > 0 && <span className="text-slate-500"> ({plan.days_overdue}d atraso)</span>}
            </p>
          )}
          {plan.paid_total > 0 && (
            <p className="text-xs text-green-600">
              Pago: {formatCurrency(plan.paid_total)}
              {plan.remaining > 0 && <span className="text-slate-500"> · Em dívida: {formatCurrency(plan.remaining)}</span>}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <PlanStatusBadge status={plan.status} />
        {!isPaid && (
          <Button
            size="sm"
            onClick={() => onPay(plan)}
            className="bg-[#F5821F] hover:bg-[#E07318] text-white h-7 px-2.5 text-xs"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Pagar
          </Button>
        )}
      </div>
    </div>
  );
}

function printPaymentReceipt(payment: PaymentTransaction) {
  const methodLabel = PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] || payment.payment_method;
  const mensalidadeMonths = Array.from(new Set(
    (payment.allocations ?? []).filter(a => a.plan_type === 'mensalidade').map(a => a.month_reference)
  ));
  const allocationsHtml = mensalidadeMonths.length > 0
    ? mensalidadeMonths.map(m => `<span style="display:inline-block;background:#e8f0fb;color:#004B87;padding:2px 8px;border-radius:4px;margin:2px;font-size:12px;font-weight:600">${formatMonthReference(m)}</span>`).join('')
    : '';

  const html = `<!DOCTYPE html>
<html lang="pt">
<head>
  <meta charset="UTF-8" />
  <title>Recibo de Pagamento</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; display: flex; justify-content: center; padding: 32px 0; }
    .receipt { background: white; width: 420px; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
    .header { background: linear-gradient(135deg, #004B87, #0066B3); padding: 24px; text-align: center; }
    .logo-circle { width: 56px; height: 56px; border-radius: 50%; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.4); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; font-size: 22px; font-weight: 800; color: white; }
    .header h1 { color: white; font-size: 18px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.75); font-size: 11px; margin-top: 2px; }
    .amount-block { background: #f0f7ff; border-bottom: 2px dashed #d0e4f7; padding: 20px 24px; text-align: center; }
    .amount-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: .08em; font-weight: 600; }
    .amount-value { font-size: 32px; font-weight: 800; color: #004B87; margin: 4px 0 0; }
    .body { padding: 20px 24px; }
    .row { display: flex; justify-content: space-between; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
    .row:last-child { border-bottom: none; }
    .row-label { font-size: 12px; color: #94a3b8; font-weight: 500; }
    .row-value { font-size: 13px; color: #1e293b; font-weight: 600; text-align: right; max-width: 220px; }
    .months-section { margin: 12px 0 0; padding-top: 12px; border-top: 1px dashed #e2e8f0; }
    .months-label { font-size: 11px; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 6px; }
    .status-badge { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #16a34a; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; border: 1px solid #bbf7d0; }
    .void-badge { background: #f1f5f9; color: #64748b; border-color: #cbd5e1; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 24px; text-align: center; font-size: 10px; color: #94a3b8; }
    @media print { body { background: white; padding: 0; } .receipt { box-shadow: none; border-radius: 0; width: 100%; } }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <div class="logo-circle">I</div>
      <h1>ISAC</h1>
      <p>Instituto Superior de Artes e Cultura</p>
    </div>
    <div class="amount-block">
      <p class="amount-label">Valor Pago</p>
      <p class="amount-value">${formatCurrency(payment.amount_paid)}</p>
    </div>
    <div class="body">
      <div class="row">
        <span class="row-label">Estado</span>
        <span class="row-value">
          <span class="status-badge ${payment.status === 'void' || payment.status === 'reversed' ? 'void-badge' : ''}">
            ${payment.status === 'void' || payment.status === 'reversed' ? '✕ Anulado' : '✓ Confirmado'}
          </span>
        </span>
      </div>
      ${payment.receipt_number ? `<div class="row"><span class="row-label">Nº Recibo</span><span class="row-value">${payment.receipt_number}</span></div>` : ''}
      <div class="row"><span class="row-label">Método</span><span class="row-value">${methodLabel}</span></div>
      <div class="row"><span class="row-label">Data de Pagamento</span><span class="row-value">${formatDate(payment.paid_date)}</span></div>
      ${payment.payment_type_name ? `<div class="row"><span class="row-label">Tipo</span><span class="row-value">${payment.payment_type_name}</span></div>` : ''}
      ${payment.observacoes ? `<div class="row"><span class="row-label">Observações</span><span class="row-value">${payment.observacoes}</span></div>` : ''}
      ${allocationsHtml ? `<div class="months-section"><p class="months-label">Meses Cobertos</p><div>${allocationsHtml}</div></div>` : ''}
    </div>
    <div class="footer">
      Emitido em ${new Date().toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' })} · Sistema Académico ISAC
    </div>
  </div>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=520,height=700');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.print();
  }
}

function PaymentRow({
  payment,
  onVoid,
}: {
  payment: PaymentTransaction;
  onVoid: (p: PaymentTransaction) => void;
}) {
  const isVoid = payment.status === 'void' || payment.status === 'reversed';
  const methodLabel = PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] || payment.payment_method;

  return (
    <div className={`rounded-xl border-2 transition-all ${
      isVoid
        ? 'border-slate-200 bg-slate-50/80 opacity-70'
        : payment.is_advance
          ? 'border-emerald-200 bg-emerald-50/40'
          : 'border-slate-200 bg-white hover:border-[#004B87]/20 hover:shadow-sm'
    }`}>
      {/* Top row: type icon + amount + status */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
            isVoid ? 'bg-slate-200' :
            payment.is_advance ? 'bg-emerald-100' : 'bg-[#004B87]/10'
          }`}>
            {isVoid
              ? <Ban className="h-5 w-5 text-slate-500" />
              : payment.is_advance
                ? <Wallet className="h-5 w-5 text-emerald-600" />
                : <Banknote className="h-5 w-5 text-[#004B87]" />
            }
          </div>
          <div>
            <p className={`font-bold text-lg leading-tight ${isVoid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
              {formatCurrency(payment.amount_paid)}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {payment.is_advance ? 'Adiantamento / Crédito' : 'Pagamento de Mensalidade'}
            </p>
          </div>
        </div>
        <PaymentStatusBadge status={payment.status} />
      </div>

      {/* Detail grid */}
      <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2">
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Método</p>
          <p className="text-sm font-medium text-slate-700">{methodLabel}</p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Data</p>
          <p className="text-sm font-medium text-slate-700">{formatDate(payment.paid_date)}</p>
        </div>
        {payment.receipt_number && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Nº Recibo</p>
            <p className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              {payment.receipt_number}
            </p>
          </div>
        )}
        {payment.payment_type_name && (
          <div>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Tipo</p>
            <p className="text-sm font-medium text-slate-700">{payment.payment_type_name}</p>
          </div>
        )}
        {payment.observacoes && (
          <div className="col-span-2">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-0.5">Observações</p>
            <p className="text-sm text-slate-600">{payment.observacoes}</p>
          </div>
        )}
      </div>

      {/* Months covered — only mensalidade allocations, not taxa_matricula */}
      {(() => {
        const mensalidadeMonths = Array.from(new Set(
          (payment.allocations ?? [])
            .filter(a => a.plan_type === 'mensalidade')
            .map(a => a.month_reference)
        ));
        return mensalidadeMonths.length > 0 ? (
          <div className="px-4 pb-3">
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">Meses Cobertos</p>
            <div className="flex flex-wrap gap-1.5">
              {mensalidadeMonths.map((monthRef) => (
                <span
                  key={monthRef}
                  className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                    isVoid
                      ? 'bg-slate-100 text-slate-400'
                      : 'bg-[#004B87]/10 text-[#004B87]'
                  }`}
                >
                  {formatMonthReference(monthRef)}
                </span>
              ))}
            </div>
          </div>
        ) : null;
      })()}
      {payment.is_advance && !isVoid && (
        <div className="px-4 pb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">
            <Wallet className="h-3 w-3" />
            Crédito na conta do estudante
          </span>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center justify-end gap-2 px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 rounded-b-xl">
        {!isVoid && (
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-3 text-xs gap-1.5 border-slate-200 text-slate-600 hover:text-[#004B87] hover:border-[#004B87]/30"
            onClick={() => printPaymentReceipt(payment)}
          >
            <Printer className="h-3.5 w-3.5" />
            Imprimir Recibo
          </Button>
        )}
        {!isVoid && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-3 text-xs gap-1.5 text-red-400 hover:text-red-600 hover:bg-red-50"
            title="Anular pagamento"
            onClick={() => onVoid(payment)}
          >
            <Ban className="h-3.5 w-3.5" />
            Anular
          </Button>
        )}
        {isVoid && (
          <span className="text-xs text-slate-400 italic">Pagamento anulado</span>
        )}
      </div>
    </div>
  );
}

function NoEnrollmentView({
  studentFinance,
  onVoid,
  onRefresh,
}: {
  studentFinance: StudentFinanceResponse;
  onVoid: (p: PaymentTransaction) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          Este estudante não tem matrícula activa. Para registar pagamentos, matricule-o num curso primeiro.
        </span>
      </div>

      {studentFinance.recent_payments.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2 text-sm">
            <Receipt className="h-4 w-4 text-[#004B87]" />
            Histórico de Pagamentos Anteriores
          </h4>
          <div className="space-y-2">
            {studentFinance.recent_payments.map((payment) => (
              <PaymentRow key={payment.id} payment={payment} onVoid={onVoid} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
