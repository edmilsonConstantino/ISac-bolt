// src/components/shared/PaymentsDashboard.tsx
import { useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
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
  Info,
  Ban,
  RefreshCw,
  Banknote,
  Hash,
  TrendingUp,
  FileText,
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

export function PaymentsDashboard() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentFinance, setStudentFinance] = useState<StudentFinanceResponse | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

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

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const response = await fetch(`${API_URL}/students.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStudents(data.data || []);
      } else {
        toast.error(data.message || 'Erro ao carregar estudantes');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao conectar com o servidor');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentFinance = useCallback(async (studentId: number) => {
    setLoadingFinance(true);
    try {
      const data = await financeService.getStudentFinance(studentId);
      setStudentFinance(data);
      // Cache overdue status for the student list indicator
      setOverdueMap(prev => ({
        ...prev,
        [studentId]: (data.summary?.overdue_count ?? 0) > 0
      }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar dados financeiros');
      setStudentFinance(null);
    } finally {
      setLoadingFinance(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentFinance(selectedStudentId);
    } else {
      setStudentFinance(null);
    }
  }, [selectedStudentId, fetchStudentFinance]);

  // ── Filtered students ──────────────────────────────────────────────────────

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader>
        <div>
          <PageHeaderTitle icon={<DollarSign className="h-7 w-7 text-[#004B87]" />}>
            Gestão de Pagamentos
          </PageHeaderTitle>
          <PageHeaderSubtitle>
            Seleccione um estudante para ver e gerir os pagamentos
          </PageHeaderSubtitle>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Lista de Estudantes ─────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#004B87]" />
                  <h3 className="font-semibold text-[#004B87]">Estudantes</h3>
                  <span className="text-xs text-slate-500">({students.length})</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-[#004B87]"
                  onClick={fetchStudents}
                  title="Actualizar lista"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar estudante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>

              {loadingStudents ? (
                <div className="py-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#004B87]" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-sm">
                  Nenhum estudante encontrado
                </div>
              ) : (
                <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
                  {filteredStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                        selectedStudentId === student.id
                          ? 'border-[#F5821F] bg-orange-50'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <AvatarInitials name={student.name} size="sm" shape="circle" />
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-slate-800 truncate">{student.name}</p>
                            <p className="text-xs text-slate-500 truncate">{student.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {overdueMap[student.id] && (
                            <span title="Tem prestações em atraso">
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            </span>
                          )}
                          <ChevronRight className="h-4 w-4 text-slate-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Painel de Detalhe ───────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          {!selectedStudentId ? (
            /* Empty state */
            <Card className="shadow-lg border-0">
              <CardContent className="py-20 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-200" />
                <h3 className="font-medium text-slate-500 mb-1">Nenhum estudante seleccionado</h3>
                <p className="text-sm text-slate-400">
                  Clique num estudante para ver e gerir os pagamentos
                </p>
              </CardContent>
            </Card>

          ) : loadingFinance ? (
            <Card className="shadow-lg border-0">
              <CardContent className="py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#004B87]" />
                <p className="mt-3 text-slate-500 text-sm">A carregar dados financeiros...</p>
              </CardContent>
            </Card>

          ) : !studentFinance ? (
            /* Error / no data */
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center">
                <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-yellow-500" />
                <p className="font-medium text-slate-600 mb-2">Erro ao carregar dados</p>
                <Button variant="outline" size="sm" onClick={() => fetchStudentFinance(selectedStudentId)}>
                  <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
                </Button>
              </CardContent>
            </Card>

          ) : !studentFinance.course ? (
            /* Student without active enrollment */
            <NoEnrollmentView
              studentFinance={studentFinance}
              onVoid={openVoidModal}
              onRefresh={() => fetchStudentFinance(selectedStudentId)}
            />

          ) : (
            /* ── Full finance view ── */
            <div className="space-y-4">
              {/* Student header */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AvatarInitials name={studentFinance.student.name} size="lg" />
                      <div>
                        <h3 className="font-bold text-lg text-[#004B87] leading-tight">
                          {studentFinance.student.name}
                        </h3>
                        <p className="text-sm text-slate-500">
                          {studentFinance.course.name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-slate-400"
                        title="Actualizar"
                        onClick={() => fetchStudentFinance(selectedStudentId)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        onClick={openAdvanceModal}
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <Wallet className="h-4 w-4 mr-1.5" />
                        Adicionar Crédito
                      </Button>
                    </div>
                  </div>

                  {/* Class info bar */}
                  {studentFinance.class && (
                    <div className={`mt-3 px-3 py-2 rounded-lg flex items-center justify-between text-sm ${
                      summary?.class_started
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-amber-50 border border-amber-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <GraduationCap className={`h-4 w-4 ${summary?.class_started ? 'text-green-600' : 'text-amber-600'}`} />
                        <span className="font-medium">{studentFinance.class.name}</span>
                        <span className="text-slate-500">·</span>
                        <span className="text-slate-600">
                          {summary?.class_started
                            ? `Início: ${formatDate(studentFinance.class.start_date)}`
                            : 'Turma ainda não iniciou'}
                        </span>
                      </div>
                      {summary?.class_started ? (
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
                </CardContent>
              </Card>

              {/* Summary cards */}
              {summary && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <SummaryCard
                    label="Crédito"
                    value={formatCurrency(summary.wallet_balance)}
                    icon={<Wallet className="h-4 w-4" />}
                    color={summary.wallet_balance > 0 ? 'blue' : 'slate'}
                  />
                  <SummaryCard
                    label="Total Pago"
                    value={formatCurrency(summary.total_paid)}
                    icon={<CheckCircle className="h-4 w-4" />}
                    color="green"
                  />
                  <SummaryCard
                    label="Em Atraso"
                    value={formatCurrency(summary.total_overdue)}
                    icon={<AlertTriangle className="h-4 w-4" />}
                    color={summary.total_overdue > 0 ? 'red' : 'slate'}
                    sub={summary.overdue_count > 0 ? `${summary.overdue_count} parcela(s)` : undefined}
                  />
                  <SummaryCard
                    label="Multas"
                    value={formatCurrency(summary.total_penalties)}
                    icon={<TrendingUp className="h-4 w-4" />}
                    color={summary.total_penalties > 0 ? 'orange' : 'slate'}
                  />
                </div>
              )}

              {/* Plans list */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#004B87]" />
                    Calendário de Pagamentos
                    {studentFinance.plans.length > 0 && (
                      <span className="text-xs text-slate-400 font-normal ml-1">
                        ({studentFinance.plans.length} parcelas)
                      </span>
                    )}
                  </h4>

                  {!summary?.class_started ? (
                    <div className="py-6 text-center bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="h-7 w-7 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium text-blue-700">Turma ainda não iniciou</p>
                      <p className="text-xs text-blue-600 mt-1 max-w-xs mx-auto">
                        Os meses de pagamento serão gerados ao iniciar a turma.
                        Pode registar crédito que será alocado automaticamente.
                      </p>
                    </div>
                  ) : studentFinance.plans.length === 0 ? (
                    <div className="py-6 text-center bg-slate-50 rounded-lg text-slate-500">
                      <Receipt className="h-7 w-7 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Sem parcelas geradas</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {studentFinance.plans.map((plan) => (
                        <PlanRow
                          key={plan.id}
                          plan={plan}
                          onPay={openPaymentModal}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment history */}
              <Card className="shadow-lg border-0">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-[#004B87]" />
                    Histórico de Pagamentos
                    {studentFinance.recent_payments.length > 0 && (
                      <span className="text-xs text-slate-400 font-normal ml-1">
                        (últimos {studentFinance.recent_payments.length})
                      </span>
                    )}
                  </h4>

                  {studentFinance.recent_payments.length === 0 ? (
                    <div className="py-6 text-center bg-slate-50 rounded-lg text-slate-500">
                      <Banknote className="h-7 w-7 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Nenhum pagamento registado</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                      {studentFinance.recent_payments.map((payment) => (
                        <PaymentRow
                          key={payment.id}
                          payment={payment}
                          onVoid={openVoidModal}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

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
                  <Label className="text-xs font-medium text-slate-600">Valor Recebido (MZN)</Label>
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

function SummaryCard({
  label, value, icon, color, sub
}: {
  label: string;
  value: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange' | 'slate';
  sub?: string;
}) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   val: 'text-blue-700' },
    green:  { bg: 'bg-green-50',  icon: 'text-green-600',  val: 'text-green-700' },
    red:    { bg: 'bg-red-50',    icon: 'text-red-600',    val: 'text-red-700' },
    orange: { bg: 'bg-orange-50', icon: 'text-orange-600', val: 'text-orange-700' },
    slate:  { bg: 'bg-slate-50',  icon: 'text-slate-400',  val: 'text-slate-600' },
  };
  const c = colors[color];
  return (
    <div className={`${c.bg} rounded-xl p-3 text-center`}>
      <div className={`${c.icon} flex justify-center mb-1`}>{icon}</div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p className={`font-bold text-sm ${c.val} leading-tight`}>{value}</p>
      {sub && <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>}
    </div>
  );
}

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

function PaymentRow({
  payment,
  onVoid,
}: {
  payment: PaymentTransaction;
  onVoid: (p: PaymentTransaction) => void;
}) {
  const isVoid = payment.status === 'void' || payment.status === 'reversed';

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${isVoid ? 'border-slate-200 bg-slate-50 opacity-70' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 ${
          isVoid ? 'bg-slate-200' :
          payment.is_advance ? 'bg-emerald-100' : 'bg-blue-100'
        }`}>
          {isVoid
            ? <Ban className="h-4 w-4 text-slate-500" />
            : payment.is_advance
              ? <Wallet className="h-4 w-4 text-emerald-600" />
              : <Banknote className="h-4 w-4 text-blue-600" />
          }
        </div>

        <div className="min-w-0">
          <p className={`font-semibold text-sm ${isVoid ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {formatCurrency(payment.amount_paid)}
          </p>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-500">
              {PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] || payment.payment_method}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500">{formatDate(payment.paid_date)}</span>
            {payment.receipt_number && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 flex items-center gap-0.5">
                  <FileText className="h-3 w-3" />{payment.receipt_number}
                </span>
              </>
            )}
            {payment.payment_type_name && (
              <>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-400">{payment.payment_type_name}</span>
              </>
            )}
          </div>
          {payment.observacoes && (
            <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{payment.observacoes}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <PaymentStatusBadge status={payment.status} />
        {!isVoid && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
            title="Anular pagamento"
            onClick={() => onVoid(payment)}
          >
            <Ban className="h-3.5 w-3.5" />
          </Button>
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
      {/* Header */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarInitials name={studentFinance.student.name} size="lg" />
              <div>
                <h3 className="font-bold text-lg text-[#004B87]">{studentFinance.student.name}</h3>
                <p className="text-sm text-slate-500">{studentFinance.student.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Este estudante não tem matrícula activa. Para registar pagamentos, matricule-o num curso primeiro.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Show payment history if any (from previous courses) */}
      {studentFinance.recent_payments.length > 0 && (
        <Card className="shadow-lg border-0">
          <CardContent className="p-4">
            <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#004B87]" />
              Histórico de Pagamentos Anteriores
            </h4>
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {studentFinance.recent_payments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} onVoid={onVoid} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PaymentsDashboard;
