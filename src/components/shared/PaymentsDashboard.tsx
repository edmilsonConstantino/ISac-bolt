// src/components/shared/PaymentsDashboard.tsx
import { useState, useEffect, useMemo } from "react";
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
  Info
} from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle } from "@/components/ui/page-header";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { financeService } from "@/services/financeService";
import {
  StudentFinanceResponse,
  PaymentPlanItem,
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

export function PaymentsDashboard() {
  const [students, setStudents] = useState<StudentListItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [studentFinance, setStudentFinance] = useState<StudentFinanceResponse | null>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  // Modal de pagamento
  const [paymentModal, setPaymentModal] = useState<{
    isOpen: boolean;
    plan: PaymentPlanItem | null;
    isAdvance: boolean;
  }>({ isOpen: false, plan: null, isAdvance: false });

  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [submittingPayment, setSubmittingPayment] = useState(false);

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
        toast.error('Erro ao carregar estudantes');
      }
    } catch {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentFinance = async (studentId: number) => {
    setLoadingFinance(true);
    try {
      const data = await financeService.getStudentFinance(studentId);
      setStudentFinance(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar dados financeiros');
      setStudentFinance(null);
    } finally {
      setLoadingFinance(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudentId) {
      fetchStudentFinance(selectedStudentId);
    } else {
      setStudentFinance(null);
    }
  }, [selectedStudentId]);

  const filteredStudents = useMemo(() => {
    if (!searchTerm) return students;
    const term = searchTerm.toLowerCase();
    return students.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term)
    );
  }, [students, searchTerm]);

  // Abrir modal para pagar parcela específica
  const openPaymentModal = (plan: PaymentPlanItem) => {
    setPaymentForm({
      amount: plan.remaining,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setPaymentModal({ isOpen: true, plan, isAdvance: false });
  };

  // Abrir modal para registar crédito/adiantamento
  const openAdvanceModal = () => {
    setPaymentForm({
      amount: 0,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setPaymentModal({ isOpen: true, plan: null, isAdvance: true });
  };

  const handlePayment = async () => {
    if (!studentFinance) return;

    if (paymentForm.amount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    setSubmittingPayment(true);
    try {
      await financeService.recordPayment({
        student_id: studentFinance.student.id,
        curso_id: studentFinance.course?.id || '',
        amount_paid: paymentForm.amount,
        payment_method: paymentForm.method,
        paid_date: paymentForm.date,
        alloc_mode: paymentModal.isAdvance ? 'oldest_first' : 'single_month',
        month_reference: paymentModal.plan?.month_reference,
        observacoes: paymentForm.observacoes || (paymentModal.isAdvance ? 'Adiantamento/Crédito' : undefined)
      });

      toast.success(paymentModal.isAdvance ? 'Crédito registado com sucesso!' : 'Pagamento registado com sucesso!');
      setPaymentModal({ isOpen: false, plan: null, isAdvance: false });

      if (selectedStudentId) {
        fetchStudentFinance(selectedStudentId);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registar pagamento');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Atraso</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Parcial</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>;
    }
  };

  const summary = useMemo(() => {
    if (!studentFinance) return null;
    return studentFinance.summary;
  }, [studentFinance]);

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
        {/* Lista de Estudantes */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-[#004B87]" />
                <h3 className="font-semibold text-[#004B87]">Estudantes</h3>
                <span className="text-xs text-slate-500">({students.length})</span>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
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
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`p-3 rounded-lg cursor-pointer transition-all border-2 ${
                        selectedStudentId === student.id
                          ? 'border-[#F5821F] bg-orange-50'
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AvatarInitials name={student.name} size="sm" shape="circle" />
                          <div>
                            <p className="font-medium text-sm text-slate-800">{student.name}</p>
                            <p className="text-xs text-slate-500">{student.email}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Estudante */}
        <div className="lg:col-span-2">
          {!selectedStudentId ? (
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <h3 className="font-medium text-slate-600 mb-2">Seleccione um Estudante</h3>
                <p className="text-sm text-slate-400">
                  Clique num estudante para ver os pagamentos
                </p>
              </CardContent>
            </Card>
          ) : loadingFinance ? (
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#004B87]" />
                <p className="mt-2 text-slate-600">A carregar...</p>
              </CardContent>
            </Card>
          ) : !studentFinance || !studentFinance.course ? (
            <Card className="shadow-lg border-0">
              <CardContent className="py-16 text-center text-slate-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p>Estudante sem matrícula activa</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg border-0">
              <CardContent className="p-4">
                {/* Header do estudante */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    <AvatarInitials name={studentFinance.student.name} size="lg" />
                    <div>
                      <h3 className="font-bold text-lg text-[#004B87]">
                        {studentFinance.student.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {studentFinance.course.name}
                      </p>
                    </div>
                  </div>
                  {/* Botão para adicionar crédito */}
                  <Button
                    onClick={openAdvanceModal}
                    variant="outline"
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    <Wallet className="h-4 w-4 mr-1" />
                    Adicionar Crédito
                  </Button>
                </div>

                {/* Info da Turma */}
                {studentFinance.class && (
                  <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
                    summary?.class_started ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <GraduationCap className={`h-5 w-5 ${summary?.class_started ? 'text-green-600' : 'text-yellow-600'}`} />
                      <div>
                        <p className="font-medium text-sm">{studentFinance.class.name}</p>
                        <p className="text-xs text-slate-600">
                          {summary?.class_started ? (
                            <>Turma em andamento • Início: {studentFinance.class.start_date}</>
                          ) : (
                            <>Turma não iniciada • Aguardando início das aulas</>
                          )}
                        </p>
                      </div>
                    </div>
                    {summary?.class_started ? (
                      <Badge className="bg-green-600"><PlayCircle className="h-3 w-3 mr-1" /> Em Andamento</Badge>
                    ) : (
                      <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Aguardando</Badge>
                    )}
                  </div>
                )}

                {/* Resumo financeiro com Crédito */}
                {summary && (
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {/* Crédito/Saldo */}
                    <div className={`text-center p-2 rounded-lg ${summary.wallet_balance > 0 ? 'bg-blue-50' : 'bg-slate-50'}`}>
                      <Wallet className={`h-4 w-4 mx-auto mb-1 ${summary.wallet_balance > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                      <p className="text-xs text-slate-600">Crédito</p>
                      <p className={`font-bold text-sm ${summary.wallet_balance > 0 ? 'text-blue-700' : 'text-slate-500'}`}>
                        {formatCurrency(summary.wallet_balance)}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-600">Pago</p>
                      <p className="font-bold text-green-700 text-sm">{formatCurrency(summary.total_paid)}</p>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 rounded-lg">
                      <p className="text-xs text-yellow-600">Pendente</p>
                      <p className="font-bold text-yellow-700 text-sm">{formatCurrency(summary.total_pending)}</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-xs text-red-600">Em Atraso</p>
                      <p className="font-bold text-red-700 text-sm">{formatCurrency(summary.total_overdue)}</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                      <p className="text-xs text-orange-600">Multas</p>
                      <p className="font-bold text-orange-700 text-sm">{formatCurrency(summary.total_penalties)}</p>
                    </div>
                  </div>
                )}

                {/* Lista de meses de pagamento */}
                <div className="mb-4">
                  <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Meses de Pagamento
                  </h4>

                  {!summary?.class_started ? (
                    <div className="py-6 text-center bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium text-blue-700">Turma ainda não iniciou</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Os meses de pagamento serão gerados automaticamente quando a turma iniciar.
                        <br />Pode registar pagamentos adiantados que serão usados como crédito.
                      </p>
                    </div>
                  ) : studentFinance.plans.length === 0 ? (
                    <div className="py-6 text-center text-slate-500 bg-slate-50 rounded-lg">
                      <Receipt className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">Nenhum mês de pagamento</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {studentFinance.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-3 rounded-lg border-2 ${
                            plan.status === 'overdue' ? 'border-red-200 bg-red-50' :
                            plan.status === 'paid' ? 'border-green-200 bg-green-50' :
                            plan.status === 'partial' ? 'border-yellow-200 bg-yellow-50' :
                            'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center min-w-[70px]">
                                <p className="text-xs text-slate-500">Mês</p>
                                <p className="font-bold text-[#004B87]">
                                  {formatMonthReference(plan.month_reference)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm">
                                  Mensalidade: <span className="font-medium">{formatCurrency(plan.base_amount)}</span>
                                </p>
                                {plan.penalty_amount > 0 && (
                                  <p className="text-xs text-red-600">
                                    + Multa: {formatCurrency(plan.penalty_amount)}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500">
                                  Total: <span className="font-semibold">{formatCurrency(plan.total_expected)}</span>
                                  {plan.paid_total > 0 && (
                                    <span className="text-green-600"> (Pago: {formatCurrency(plan.paid_total)})</span>
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {getStatusBadge(plan.status)}
                              {plan.status !== 'paid' && (
                                <Button
                                  size="sm"
                                  onClick={() => openPaymentModal(plan)}
                                  className="bg-[#F5821F] hover:bg-[#E07318] h-8"
                                >
                                  <CreditCard className="h-3 w-3 mr-1" />
                                  Pagar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagamentos realizados */}
                {studentFinance.recent_payments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Pagamentos Realizados
                    </h4>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto">
                      {studentFinance.recent_payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-3 rounded-lg border bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              payment.is_advance ? 'bg-blue-100' : 'bg-green-100'
                            }`}>
                              {payment.is_advance ? (
                                <Wallet className="h-5 w-5 text-blue-600" />
                              ) : (
                                <CreditCard className="h-5 w-5 text-green-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount_paid)}</p>
                              <p className="text-xs text-slate-500">
                                {payment.is_advance ? (
                                  <span className="text-blue-600">Crédito/Adiantamento</span>
                                ) : (
                                  <>{formatMonthReference(payment.month_reference)}</>
                                )}
                                {' • '}
                                {PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] || payment.payment_method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">{payment.paid_date}</p>
                            <Badge variant={payment.status === 'paid' || payment.status === 'confirmed' ? 'default' : 'destructive'} className="text-[10px]">
                              {payment.status === 'paid' || payment.status === 'confirmed' ? 'Confirmado' : 'Estornado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Modal de Pagamento */}
      <Dialog open={paymentModal.isOpen} onOpenChange={(open) => !open && setPaymentModal({ isOpen: false, plan: null, isAdvance: false })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004B87]">
              {paymentModal.isAdvance ? (
                <>
                  <Wallet className="h-5 w-5" />
                  Adicionar Crédito
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Registar Pagamento
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {studentFinance && (
            <div className="space-y-4">
              {/* Info */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-sm text-slate-500">Estudante</p>
                <p className="font-semibold text-[#004B87]">{studentFinance.student.name}</p>

                {paymentModal.isAdvance ? (
                  <div className="mt-2 p-2 bg-blue-100 rounded text-xs text-blue-700">
                    <Info className="h-3 w-3 inline mr-1" />
                    O crédito será usado automaticamente para pagar mensalidades quando a turma iniciar
                  </div>
                ) : paymentModal.plan && (
                  <div className="flex justify-between mt-2">
                    <div>
                      <p className="text-xs text-slate-500">Mês de Referência</p>
                      <p className="font-bold">{formatMonthReference(paymentModal.plan.month_reference)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Valor a Pagar</p>
                      <p className="font-bold text-lg text-[#F5821F]">{formatCurrency(paymentModal.plan.remaining)}</p>
                    </div>
                  </div>
                )}

                {paymentModal.plan?.penalty_amount && paymentModal.plan.penalty_amount > 0 && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                    Inclui multa de {formatCurrency(paymentModal.plan.penalty_amount)}
                  </div>
                )}
              </div>

              {/* Formulário */}
              <div className="space-y-3">
                <div>
                  <Label>Valor (MZN)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      amount: parseFloat(e.target.value) || 0
                    }))}
                  />
                  {paymentModal.plan && (
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      className="text-xs p-0 h-auto"
                      onClick={() => setPaymentForm(prev => ({ ...prev, amount: paymentModal.plan!.remaining }))}
                    >
                      Pagar valor total ({formatCurrency(paymentModal.plan.remaining)})
                    </Button>
                  )}
                </div>

                <div>
                  <Label>Método de Pagamento</Label>
                  <Select
                    value={paymentForm.method}
                    onValueChange={(value) => setPaymentForm(prev => ({
                      ...prev,
                      method: value as PaymentMethod
                    }))}
                  >
                    <SelectTrigger>
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
                  <Label>Data do Pagamento</Label>
                  <Input
                    type="date"
                    value={paymentForm.date}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      date: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <Label>Observações (opcional)</Label>
                  <Input
                    value={paymentForm.observacoes}
                    onChange={(e) => setPaymentForm(prev => ({
                      ...prev,
                      observacoes: e.target.value
                    }))}
                    placeholder="Referência, notas..."
                  />
                </div>
              </div>

              {/* Preview */}
              {!paymentModal.isAdvance && paymentModal.plan && paymentForm.amount > 0 && paymentForm.amount < paymentModal.plan.remaining && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  Pagamento parcial. Restará {formatCurrency(paymentModal.plan.remaining - paymentForm.amount)}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setPaymentModal({ isOpen: false, plan: null, isAdvance: false })}>
                  Cancelar
                </Button>
                <Button
                  className={`flex-1 ${paymentModal.isAdvance ? 'bg-blue-600 hover:bg-blue-700' : 'bg-[#F5821F] hover:bg-[#E07318]'}`}
                  onClick={handlePayment}
                  disabled={submittingPayment || paymentForm.amount <= 0}
                >
                  {submittingPayment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      {paymentModal.isAdvance ? 'Adicionar Crédito' : 'Confirmar Pagamento'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PaymentsDashboard;
