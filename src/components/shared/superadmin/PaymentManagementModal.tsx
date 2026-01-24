import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Receipt,
  History,
  Plus,
} from "lucide-react";

// ✅ novo: modal busca sozinho
import studentFinanceService, {
  StudentPaymentInfo,
  PaymentMethod,
  PaymentStatus,
} from "@/services/studentFinanceService";

interface PaymentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;

  // ✅ agora só isso
  studentId: number;
  cursoId: string;

  // opcional (se quiseres filtrar por matrícula específica no futuro)
  registrationId?: number;

  // mantém callbacks (o pai chama create payment etc.)
  onRecordPayment: (
    amount: number,
    method: PaymentMethod,
    monthReference: string,
    description?: string
  ) => Promise<void> | void;

  // opcional (se tiveres endpoint de update-status)
  onUpdatePayment?: (planOrPaymentId: number, newStatus: PaymentStatus) => Promise<void> | void;
}

export function PaymentManagementModal({
  isOpen,
  onClose,
  studentId,
  cursoId,
  registrationId,
  onRecordPayment,
  onUpdatePayment,
}: PaymentManagementModalProps) {
  const [paymentInfo, setPaymentInfo] = useState<StudentPaymentInfo | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [monthReference, setMonthReference] = useState("");
  const [description, setDescription] = useState("");

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(amount);

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-orange-100 text-orange-800";
      case "advance":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return "Pago";
      case "pending":
        return "Pendente";
      case "overdue":
        return "Em Atraso";
      case "partial":
        return "Parcial";
      case "advance":
        return "Antecipado";
      default:
        return status;
    }
  };

  const getMethodText = (method?: PaymentMethod) => {
    switch (method) {
      case "cash":
        return "Dinheiro";
      case "transfer":
        return "Transferência";
      case "card":
        return "Cartão";
      case "mpesa":
        return "M-Pesa";
      case "other":
        return "Outro";
      default:
        return "N/A";
    }
  };

  // ✅ carrega dados quando abrir
  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isOpen) return;

      setIsLoading(true);
      setLoadError(null);
      setPaymentInfo(null);

      try {
        // hoje studentFinanceService só aceita student_id + curso_id
        // (registrationId deixamos para depois, se quiseres filtrar no backend também)
        const info = await studentFinanceService.getStudentFinance({
          student_id: studentId,
          curso_id: cursoId,
        });

        if (cancelled) return;

        setPaymentInfo(info);

        // defaults do form
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        setMonthReference(currentMonth);
        setPaymentAmount(String(info.monthlyFee || ""));
        setDescription("");
        setPaymentMethod("cash");
      } catch (err: any) {
        if (cancelled) return;
        setLoadError(err?.message || "Falha ao carregar dados de pagamento");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, studentId, cursoId, registrationId]);

  // UI helpers
  const balanceColor = useMemo(() => {
    if (!paymentInfo) return "text-gray-600";
    return paymentInfo.currentBalance >= 0 ? "text-green-600" : "text-red-600";
  }, [paymentInfo]);

  const BalanceIcon = useMemo(() => {
    if (!paymentInfo) return TrendingUp;
    return paymentInfo.currentBalance >= 0 ? TrendingUp : TrendingDown;
  }, [paymentInfo]);

  const handleRetry = async () => {
    // simples: reabre a mesma lógica (trigger effect)
    // aqui chamamos diretamente para não depender do state
    setIsLoading(true);
    setLoadError(null);

    try {
      const info = await studentFinanceService.getStudentFinance({
        student_id: studentId,
        curso_id: cursoId,
      });
      setPaymentInfo(info);

      const now = new Date();
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      setMonthReference(currentMonth);
      setPaymentAmount(String(info.monthlyFee || ""));
      setDescription("");
      setPaymentMethod("cash");
    } catch (err: any) {
      setLoadError(err?.message || "Falha ao carregar dados de pagamento");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!paymentInfo) return;

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) return;
    if (!monthReference) return;

    await onRecordPayment(amount, paymentMethod, monthReference, description || undefined);

    // ✅ depois de gravar pagamento, recarrega o modal para refletir total/planos/atrasos
    await handleRetry();

    // reset
    setPaymentAmount(String(paymentInfo.monthlyFee || ""));
    setDescription("");
  };

  const handleMarkAsPaid = async (id: number) => {
    if (!onUpdatePayment) return;
    await onUpdatePayment(id, "paid");
    await handleRetry();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Gerenciar Pagamentos
                {paymentInfo ? ` - ${paymentInfo.studentName}` : ""}
              </DialogTitle>

              <DialogDescription>
                {paymentInfo ? (
                  <>
                    Turma: {paymentInfo.className || "—"} | Mensalidade:{" "}
                    {formatCurrency(paymentInfo.monthlyFee || 0)}
                  </>
                ) : (
                  <>Carregando informações do estudante...</>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ✅ LOADING */}
        {isLoading && (
          <div className="py-10 text-center text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2" />
            <p>A carregar pagamentos e plano...</p>
          </div>
        )}

        {/* ✅ ERROR */}
        {!isLoading && loadError && (
          <div className="py-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                  <div className="flex-1">
                    <div className="font-semibold text-red-700">Falha ao carregar</div>
                    <div className="text-sm text-muted-foreground mt-1">{loadError}</div>

                    <div className="mt-4 flex gap-2">
                      <Button onClick={handleRetry}>Tentar novamente</Button>
                      <Button variant="outline" onClick={onClose}>
                        Fechar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ✅ CONTENT */}
        {!isLoading && !loadError && paymentInfo && (
          <>
            <div className="space-y-6">
              {/* Resumo Financeiro */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div
                      className={`text-2xl font-bold ${balanceColor} flex items-center justify-center gap-1`}
                    >
                      <BalanceIcon className="h-5 w-5" />
                      {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {paymentInfo.currentBalance >= 0 ? "Crédito" : "Dívida"}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(paymentInfo.totalPaid)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Pago</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {formatCurrency(paymentInfo.totalDue)}
                    </div>
                    <div className="text-sm text-muted-foreground">Em Aberto</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {paymentInfo.overduePayments.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Meses em Atraso</div>
                  </CardContent>
                </Card>
              </div>

              <Tabs defaultValue="record" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="record">Registrar Pagamento</TabsTrigger>
                  <TabsTrigger value="history">Plano / Meses</TabsTrigger>
                  <TabsTrigger value="overdue">Em Atraso</TabsTrigger>
                  <TabsTrigger value="advance">Antecipados</TabsTrigger>
                </TabsList>

                {/* Registrar Pagamento */}
                <TabsContent value="record" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5" />
                        Registrar Novo Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Valor do Pagamento</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mês de Referência</Label>
                          <Input
                            type="month"
                            value={monthReference}
                            onChange={(e) => setMonthReference(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Método de Pagamento</Label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="cash">Dinheiro</option>
                            <option value="transfer">Transferência Bancária</option>
                            <option value="card">Cartão</option>
                            <option value="mpesa">M-Pesa</option>
                            <option value="other">Outro</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label>Ações Rápidas</Label>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPaymentAmount(String(paymentInfo.monthlyFee))}
                            >
                              Mensalidade Completa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setPaymentAmount(String(paymentInfo.monthlyFee / 2))}
                            >
                              Meio Pagamento
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Observações (Opcional)</Label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Ex: Pagamento em atraso referente ao mês anterior..."
                          rows={2}
                        />
                      </div>

                      <Button onClick={handleRecordPayment} className="w-full">
                        <Save className="h-4 w-4 mr-2" />
                        Registrar Pagamento de {formatCurrency(parseFloat(paymentAmount) || 0)}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Plano / Meses */}
                <TabsContent value="history" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Plano de Pagamento (meses obrigatórios)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {paymentInfo.paymentHistory.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex flex-col">
                              <div className="font-medium">
                                {payment.monthReference} - {formatCurrency(payment.amount)}
                              </div>

                              {payment.description && (
                                <div className="text-sm text-muted-foreground">{payment.description}</div>
                              )}

                              <div className="text-xs text-muted-foreground">
                                Vencimento:{" "}
                                {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(payment.status)}>
                                {getStatusText(payment.status)}
                              </Badge>

                              {payment.receiptNumber && (
                                <Button variant="ghost" size="sm">
                                  <Receipt className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Atraso */}
                <TabsContent value="overdue" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Pagamentos em Atraso ({paymentInfo.overduePayments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paymentInfo.overduePayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-red-800">
                                {payment.monthReference} - {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-sm text-red-600">
                                Venceu em:{" "}
                                {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                              </div>
                            </div>

                            {onUpdatePayment ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMarkAsPaid(payment.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Marcar como Pago
                              </Button>
                            ) : null}
                          </div>
                        ))}

                        {paymentInfo.overduePayments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                            <p>Nenhum pagamento em atraso!</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Antecipado */}
                <TabsContent value="advance" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        Pagamentos Antecipados ({paymentInfo.advancePayments.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {paymentInfo.advancePayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium text-blue-800">
                                {payment.monthReference} - {formatCurrency(payment.amount)}
                              </div>
                              <div className="text-sm text-blue-600">
                                Vencimento:{" "}
                                {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                              </div>
                            </div>

                            <Badge className="bg-blue-100 text-blue-800">Antecipado</Badge>
                          </div>
                        ))}

                        {paymentInfo.advancePayments.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground">
                            <Clock className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                            <p>Nenhum pagamento antecipado.</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
