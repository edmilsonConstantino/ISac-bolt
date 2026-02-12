// src/components/shared/StudentFinanceModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  DollarSign,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Calendar,
  CreditCard,
  TrendingUp,
  X,
  FileText
} from "lucide-react";
import { financeService } from "@/services/financeService";
import {
  StudentFinanceResponse,
  PaymentPlanItem,
  PaymentMethod,
  formatCurrency,
  formatMonthReference,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS
} from "@/types/finance";

interface StudentFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  onPaymentRecorded?: () => void;
}

export function StudentFinanceModal({
  isOpen,
  onClose,
  studentId,
  onPaymentRecorded
}: StudentFinanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudentFinanceResponse | null>(null);
  const [activeTab, setActiveTab] = useState("summary");

  // Estado do modal de pagamento
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanItem | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    observacoes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Carregar dados do estudante
  useEffect(() => {
    if (isOpen && studentId) {
      loadData();
    }
  }, [isOpen, studentId]);

  const loadData = async () => {
    if (!studentId) return;

    setLoading(true);
    try {
      const response = await financeService.getStudentFinance(studentId);
      setData(response);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (plan: PaymentPlanItem) => {
    setSelectedPlan(plan);
    setPaymentForm({
      amount: plan.remaining,
      method: 'cash',
      date: new Date().toISOString().split('T')[0],
      observacoes: ''
    });
    setPaymentModalOpen(true);
  };

  const handleRecordPayment = async () => {
    if (!data || !selectedPlan) return;

    if (paymentForm.amount <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    setSubmitting(true);
    try {
      await financeService.recordPayment({
        student_id: data.student.id,
        curso_id: selectedPlan.curso_id,
        amount_paid: paymentForm.amount,
        payment_method: paymentForm.method,
        paid_date: paymentForm.date,
        alloc_mode: 'single_month',
        month_reference: selectedPlan.month_reference,
        observacoes: paymentForm.observacoes || undefined
      });

      toast.success('Pagamento registado com sucesso!');
      setPaymentModalOpen(false);
      setSelectedPlan(null);
      await loadData();
      onPaymentRecorded?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao registar pagamento');
    } finally {
      setSubmitting(false);
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004B87]">
              <DollarSign className="h-5 w-5" />
              {data?.student.name || 'Finanças do Estudante'}
            </DialogTitle>
          </DialogHeader>

          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#004B87]" />
              <p className="mt-2 text-slate-600">A carregar...</p>
            </div>
          ) : !data ? (
            <div className="py-12 text-center text-slate-500">
              Nenhum dado disponível
            </div>
          ) : (
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Cabeçalho com info do curso */}
              {data.course && (
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Curso</p>
                      <p className="font-semibold text-[#004B87]">{data.course.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Mensalidade</p>
                      <p className="font-bold text-[#F5821F]">{formatCurrency(data.course.monthly_fee)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Duração</p>
                      <p className="font-semibold">{data.course.duration_months} meses</p>
                    </div>
                  </div>
                </div>
              )}

              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="summary">Resumo</TabsTrigger>
                  <TabsTrigger value="plans">
                    Parcelas
                    {data.summary.overdue_count > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                        {data.summary.overdue_count}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="payments">Pagamentos</TabsTrigger>
                </TabsList>

                {/* Tab: Resumo */}
                <TabsContent value="summary" className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <Card className="border-green-200">
                      <CardContent className="p-3 text-center">
                        <CheckCircle className="h-5 w-5 mx-auto text-green-600 mb-1" />
                        <p className="text-xs text-slate-500">Total Pago</p>
                        <p className="font-bold text-green-700">{formatCurrency(data.summary.total_paid)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-yellow-200">
                      <CardContent className="p-3 text-center">
                        <Clock className="h-5 w-5 mx-auto text-yellow-600 mb-1" />
                        <p className="text-xs text-slate-500">Pendente</p>
                        <p className="font-bold text-yellow-700">{formatCurrency(data.summary.total_pending)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-red-200">
                      <CardContent className="p-3 text-center">
                        <AlertTriangle className="h-5 w-5 mx-auto text-red-600 mb-1" />
                        <p className="text-xs text-slate-500">Em Atraso</p>
                        <p className="font-bold text-red-700">{formatCurrency(data.summary.total_overdue)}</p>
                      </CardContent>
                    </Card>
                    <Card className="border-orange-200">
                      <CardContent className="p-3 text-center">
                        <TrendingUp className="h-5 w-5 mx-auto text-orange-600 mb-1" />
                        <p className="text-xs text-slate-500">Multas</p>
                        <p className="font-bold text-orange-700">{formatCurrency(data.summary.total_penalties)}</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Info de multas */}
                  {data.penalty_config?.enabled && (
                    <Card className="border-orange-200 bg-orange-50">
                      <CardContent className="p-3">
                        <p className="text-sm font-medium text-orange-800">Política de Multas</p>
                        <ul className="text-xs text-orange-700 mt-1">
                          <li>• Após dia {data.penalty_config.step1_day}: +{data.penalty_config.step1_percent}%</li>
                          <li>• Após dia {data.penalty_config.step2_day}: +{data.penalty_config.step2_percent}% adicional</li>
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Tab: Parcelas */}
                <TabsContent value="plans" className="flex-1 overflow-y-auto">
                  {data.plans.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p>Nenhum plano de pagamento</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.plans.map((plan) => (
                        <div
                          key={plan.id}
                          className={`p-3 rounded-lg border-2 ${
                            plan.status === 'overdue' ? 'border-red-200 bg-red-50' :
                            plan.status === 'paid' ? 'border-green-200 bg-green-50' :
                            'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-center min-w-[70px]">
                                <p className="text-xs text-slate-500">Mês</p>
                                <p className="font-bold text-[#004B87]">
                                  {formatMonthReference(plan.month_reference)}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm">
                                  Base: <span className="font-medium">{formatCurrency(plan.base_amount)}</span>
                                </p>
                                {plan.penalty_amount > 0 && (
                                  <p className="text-xs text-red-600">
                                    Multa: +{formatCurrency(plan.penalty_amount)}
                                    {plan.days_overdue > 0 && ` (${plan.days_overdue} dias)`}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="text-xs text-slate-500">Total</p>
                                <p className="font-bold">{formatCurrency(plan.total_expected)}</p>
                              </div>
                              {plan.paid_total > 0 && (
                                <div className="text-right">
                                  <p className="text-xs text-slate-500">Pago</p>
                                  <p className="font-medium text-green-600">{formatCurrency(plan.paid_total)}</p>
                                </div>
                              )}
                              {getStatusBadge(plan.status)}
                              {plan.status !== 'paid' && (
                                <Button
                                  size="sm"
                                  onClick={() => openPaymentModal(plan)}
                                  className="bg-[#F5821F] hover:bg-[#E07318] h-8"
                                >
                                  <Receipt className="h-3 w-3 mr-1" />
                                  Pagar
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Tab: Pagamentos */}
                <TabsContent value="payments" className="flex-1 overflow-y-auto">
                  {data.recent_payments.length === 0 ? (
                    <div className="py-8 text-center text-slate-500">
                      <CreditCard className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p>Nenhum pagamento registado</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.recent_payments.map((payment) => (
                        <div
                          key={payment.id}
                          className="p-3 rounded-lg border bg-white flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                              <CreditCard className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount_paid)}</p>
                              <p className="text-xs text-slate-500">
                                {formatMonthReference(payment.month_reference)} • {PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] || payment.payment_method}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">{payment.paid_date}</p>
                            <Badge variant={payment.status === 'confirmed' ? 'default' : 'destructive'} className="text-[10px]">
                              {payment.status === 'confirmed' ? 'Confirmado' : 'Estornado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t mt-4">
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sub-modal: Registrar Pagamento */}
      <Dialog open={paymentModalOpen} onOpenChange={(open) => !open && setPaymentModalOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004B87]">
              <Receipt className="h-5 w-5" />
              Registar Pagamento
            </DialogTitle>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4">
              {/* Info da parcela */}
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-slate-500">Mês de Referência</p>
                    <p className="font-bold text-[#004B87]">{formatMonthReference(selectedPlan.month_reference)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Restante</p>
                    <p className="font-bold text-lg text-[#F5821F]">{formatCurrency(selectedPlan.remaining)}</p>
                  </div>
                </div>
                {selectedPlan.penalty_amount > 0 && (
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                    Inclui multa de {formatCurrency(selectedPlan.penalty_amount)}
                  </div>
                )}
              </div>

              {/* Formulário */}
              <div className="space-y-3">
                <div>
                  <Label>Valor a Pagar (MZN)</Label>
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
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-xs p-0 h-auto"
                    onClick={() => setPaymentForm(prev => ({ ...prev, amount: selectedPlan.remaining }))}
                  >
                    Pagar valor total ({formatCurrency(selectedPlan.remaining)})
                  </Button>
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
                    placeholder="Notas adicionais..."
                  />
                </div>
              </div>

              {/* Preview */}
              {paymentForm.amount > 0 && paymentForm.amount < selectedPlan.remaining && (
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                  Pagamento parcial. Restará {formatCurrency(selectedPlan.remaining - paymentForm.amount)}
                </div>
              )}

              {/* Botões */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setPaymentModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-[#F5821F] hover:bg-[#E07318]"
                  onClick={handleRecordPayment}
                  disabled={submitting || paymentForm.amount <= 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      A processar...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Confirmar Pagamento
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default StudentFinanceModal;
