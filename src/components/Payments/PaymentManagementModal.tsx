import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
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
  FileText,
  Calendar,
} from "lucide-react";

import studentFinanceService, {
  StudentPaymentInfo,
  PaymentMethod,
  PaymentStatus,
} from "@/services/studentFinanceService";

interface PaymentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  cursoId: string;
  registrationId?: number;
  onRecordPayment: (
    amount: number,
    method: PaymentMethod,
    monthReference: string,
    description?: string
  ) => Promise<void> | void;
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
  const [currentStep, setCurrentStep] = useState<"overview" | "record" | "history">("overview");

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

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!isOpen) return;

      setIsLoading(true);
      setLoadError(null);
      setPaymentInfo(null);

      try {
        const info = await studentFinanceService.getStudentFinance({
          student_id: studentId,
          curso_id: cursoId,
        });

        if (cancelled) return;

        setPaymentInfo(info);

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

  const balanceColor = useMemo(() => {
    if (!paymentInfo) return "text-gray-600";
    return paymentInfo.currentBalance >= 0 ? "text-green-600" : "text-red-600";
  }, [paymentInfo]);

  const BalanceIcon = useMemo(() => {
    if (!paymentInfo) return TrendingUp;
    return paymentInfo.currentBalance >= 0 ? TrendingUp : TrendingDown;
  }, [paymentInfo]);

  const handleRetry = async () => {
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
    await handleRetry();

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
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden p-0">
        <div className="flex h-[95vh]">
          {/* Sidebar */}
          <div className="w-80 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-6 flex flex-col">
            <div className="mb-8">
              <div className="bg-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-3">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-white text-2xl font-bold">Pagamentos</h2>
              <p className="text-blue-200 text-sm">GESTÃO FINANCEIRA</p>
            </div>

            {/* Student Info Card */}
            {paymentInfo && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {paymentInfo.studentName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm truncate">
                      {paymentInfo.studentName}
                    </div>
                    <div className="text-blue-200 text-xs">
                      {paymentInfo.className || "—"}
                    </div>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/20">
                  <div className="text-blue-200 text-xs mb-1">Mensalidade</div>
                  <div className="text-white font-bold">
                    {formatCurrency(paymentInfo.monthlyFee || 0)}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="flex-1 space-y-2">
              <button
                onClick={() => setCurrentStep("overview")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentStep === "overview"
                    ? "bg-white/20 text-white"
                    : "text-blue-200 hover:bg-white/10"
                }`}
              >
                <TrendingUp className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Resumo Financeiro</div>
                  <div className="text-xs opacity-75">Visão geral</div>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep("record")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentStep === "record"
                    ? "bg-white/20 text-white"
                    : "text-blue-200 hover:bg-white/10"
                }`}
              >
                <Plus className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Novo Pagamento</div>
                  <div className="text-xs opacity-75">Registrar</div>
                </div>
              </button>

              <button
                onClick={() => setCurrentStep("history")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  currentStep === "history"
                    ? "bg-white/20 text-white"
                    : "text-blue-200 hover:bg-white/10"
                }`}
              >
                <History className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium text-sm">Histórico</div>
                  <div className="text-xs opacity-75">Todos pagamentos</div>
                </div>
              </button>
            </nav>

            {/* Alert Box */}
            {paymentInfo && paymentInfo.overduePayments.length > 0 && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-red-200 font-semibold text-sm">IMPORTANTE</div>
                    <div className="text-red-100 text-xs mt-1">
                      {paymentInfo.overduePayments.length} pagamento(s) em atraso. 
                      Regularize para manter acesso aos serviços.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-1">
                    <span>Gestão de Pagamentos</span>
                    <span>›</span>
                    <span className="text-orange-600 font-medium">
                      {currentStep === "overview" && "RESUMO"}
                      {currentStep === "record" && "REGISTRAR"}
                      {currentStep === "history" && "HISTÓRICO"}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold">
                    {currentStep === "overview" && "Resumo Financeiro"}
                    {currentStep === "record" && "Registrar Pagamento"}
                    {currentStep === "history" && "Histórico de Pagamentos"}
                  </h1>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-blue-500 animate-pulse" />
                    <p className="text-lg font-medium text-gray-700">A carregar informações...</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Aguarde enquanto carregamos os dados de pagamento
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {!isLoading && loadError && (
                <div className="flex items-center justify-center h-full">
                  <Card className="max-w-md">
                    <CardContent className="p-8">
                      <div className="text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Erro ao Carregar Dados
                        </h3>
                        <p className="text-sm text-muted-foreground mb-6">{loadError}</p>
                        <div className="flex gap-3 justify-center">
                          <Button onClick={handleRetry}>Tentar Novamente</Button>
                          <Button variant="outline" onClick={onClose}>Fechar</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Content */}
              {!isLoading && !loadError && paymentInfo && (
                <>
                  {/* Overview Step */}
                  {currentStep === "overview" && (
                    <div className="space-y-6 max-w-6xl">
                      {/* Financial Summary Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="bg-blue-100 p-2 rounded-lg">
                                <BalanceIcon className="h-5 w-5 text-blue-600" />
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {paymentInfo.currentBalance >= 0 ? "Crédito" : "Débito"}
                              </Badge>
                            </div>
                            <div className={`text-3xl font-bold ${balanceColor} mb-1`}>
                              {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Saldo {paymentInfo.currentBalance >= 0 ? "Disponível" : "Devedor"}
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="bg-green-100 p-2 rounded-lg">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              </div>
                              <Badge variant="outline" className="text-xs text-green-700">
                                Pago
                              </Badge>
                            </div>
                            <div className="text-3xl font-bold text-green-600 mb-1">
                              {formatCurrency(paymentInfo.totalPaid)}
                            </div>
                            <div className="text-sm text-muted-foreground">Total Pago</div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="bg-orange-100 p-2 rounded-lg">
                                <Clock className="h-5 w-5 text-orange-600" />
                              </div>
                              <Badge variant="outline" className="text-xs text-orange-700">
                                Pendente
                              </Badge>
                            </div>
                            <div className="text-3xl font-bold text-orange-600 mb-1">
                              {formatCurrency(paymentInfo.totalDue)}
                            </div>
                            <div className="text-sm text-muted-foreground">Em Aberto</div>
                          </CardContent>
                        </Card>

                        <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <div className="bg-red-100 p-2 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                              </div>
                              <Badge variant="outline" className="text-xs text-red-700">
                                Atraso
                              </Badge>
                            </div>
                            <div className="text-3xl font-bold text-red-600 mb-1">
                              {paymentInfo.overduePayments.length}
                            </div>
                            <div className="text-sm text-muted-foreground">Meses em Atraso</div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Overdue Payments Alert */}
                      {paymentInfo.overduePayments.length > 0 && (
                        <Card className="border-l-4 border-red-500 bg-red-50">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="bg-red-100 p-3 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-red-900 mb-2">
                                  Pagamentos em Atraso ({paymentInfo.overduePayments.length})
                                </h3>
                                <div className="space-y-2">
                                  {paymentInfo.overduePayments.slice(0, 3).map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="flex items-center justify-between bg-white rounded-lg p-3"
                                    >
                                      <div>
                                        <div className="font-medium text-sm">
                                          {payment.monthReference}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Venceu em: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-bold text-red-600">
                                          {formatCurrency(payment.amount)}
                                        </div>
                                        {onUpdatePayment && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleMarkAsPaid(payment.id)}
                                            className="text-xs mt-1"
                                          >
                                            Marcar como pago
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {paymentInfo.overduePayments.length > 3 && (
                                  <Button
                                    variant="link"
                                    className="text-red-700 text-sm mt-2 p-0 h-auto"
                                    onClick={() => setCurrentStep("history")}
                                  >
                                    Ver todos ({paymentInfo.overduePayments.length})
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Advance Payments */}
                      {paymentInfo.advancePayments.length > 0 && (
                        <Card className="border-l-4 border-blue-500 bg-blue-50">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="bg-blue-100 p-3 rounded-lg">
                                <TrendingUp className="h-6 w-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">
                                  Pagamentos Antecipados ({paymentInfo.advancePayments.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {paymentInfo.advancePayments.map((payment) => (
                                    <div
                                      key={payment.id}
                                      className="bg-white rounded-lg p-3 flex items-center justify-between"
                                    >
                                      <div>
                                        <div className="font-medium text-sm">
                                          {payment.monthReference}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Vence: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                                        </div>
                                      </div>
                                      <div className="font-bold text-blue-600 text-sm">
                                        {formatCurrency(payment.amount)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Recent Payments */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5" />
                            Pagamentos Recentes
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {paymentInfo.paymentHistory.slice(0, 5).map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      payment.status === "paid"
                                        ? "bg-green-500"
                                        : payment.status === "overdue"
                                        ? "bg-red-500"
                                        : "bg-orange-500"
                                    }`}
                                  />
                                  <div>
                                    <div className="font-medium">{payment.monthReference}</div>
                                    {payment.description && (
                                      <div className="text-sm text-muted-foreground">
                                        {payment.description}
                                      </div>
                                    )}
                                    <div className="text-xs text-muted-foreground">
                                      Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <div className="font-bold">
                                      {formatCurrency(payment.amount)}
                                    </div>
                                    <Badge className={`${getStatusColor(payment.status)} text-xs`}>
                                      {getStatusText(payment.status)}
                                    </Badge>
                                  </div>
                                  {payment.receiptNumber && (
                                    <Button variant="ghost" size="sm">
                                      <Receipt className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                          {paymentInfo.paymentHistory.length > 5 && (
                            <Button
                              variant="outline"
                              className="w-full mt-4"
                              onClick={() => setCurrentStep("history")}
                            >
                              Ver Histórico Completo
                            </Button>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Record Payment Step */}
                  {currentStep === "record" && (
                    <div className="max-w-4xl space-y-6">
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                          <CardTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-blue-600" />
                            Registrar Novo Pagamento
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Preencha os dados do pagamento recebido do estudante
                          </p>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Amount */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Valor do Pagamento <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="number"
                                step="0.01"
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                placeholder="0.00"
                                className="text-lg font-semibold"
                              />
                              <div className="flex gap-2 flex-wrap">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={() => setPaymentAmount(String(paymentInfo.monthlyFee))}
                                  className="text-xs"
                                >
                                  Mensalidade Completa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={() => setPaymentAmount(String(paymentInfo.monthlyFee / 2))}
                                  className="text-xs"
                                >
                                  50% ({formatCurrency(paymentInfo.monthlyFee / 2)})
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  type="button"
                                  onClick={() =>
                                    setPaymentAmount(String(Math.abs(paymentInfo.currentBalance)))
                                  }
                                  className="text-xs"
                                  disabled={paymentInfo.currentBalance >= 0}
                                >
                                  Saldar Dívida
                                </Button>
                              </div>
                            </div>

                            {/* Month Reference */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Mês de Referência <span className="text-red-500">*</span>
                              </Label>
                              <Input
                                type="month"
                                value={monthReference}
                                onChange={(e) => setMonthReference(e.target.value)}
                                className="text-lg"
                              />
                              <p className="text-xs text-muted-foreground">
                                Selecione o mês ao qual este pagamento se refere
                              </p>
                            </div>

                            {/* Payment Method */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">
                                Método de Pagamento <span className="text-red-500">*</span>
                              </Label>
                              <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                className="w-full p-2.5 border rounded-md text-sm bg-white"
                              >
                                <option value="cash">💵 Dinheiro</option>
                                <option value="transfer">🏦 Transferência Bancária</option>
                                <option value="card">💳 Cartão de Débito/Crédito</option>
                                <option value="mpesa">📱 M-Pesa</option>
                                <option value="other">📋 Outro Método</option>
                              </select>
                            </div>

{/* Payment Date */}
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Data do Pagamento</Label>
                              <Input
                                type="date"
                                defaultValue={new Date().toISOString().split("T")[0]}
                                className="text-lg"
                              />
                              <p className="text-xs text-muted-foreground">
                                Data em que o pagamento foi recebido
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Observações <span className="text-muted-foreground">(Opcional)</span>
                            </Label>
                            <Textarea
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Ex: Pagamento em atraso referente ao mês anterior, desconto aplicado, etc..."
                              rows={3}
                              className="resize-none"
                            />
                          </div>

                          {/* Summary Box */}
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                                  Resumo do Pagamento
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Valor:</span>
                                    <span className="font-semibold">
                                      {formatCurrency(parseFloat(paymentAmount) || 0)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Mês de Referência:</span>
                                    <span className="font-semibold">
                                      {monthReference || "—"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Saldo Atual:</span>
                                    <span className={`font-semibold ${balanceColor}`}>
                                      {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                                      {paymentInfo.currentBalance >= 0 ? " (Crédito)" : " (Débito)"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-2 border-t border-blue-200">
                                    <span className="text-muted-foreground">Novo Saldo:</span>
                                    <span className={`font-bold ${
                                      (paymentInfo.currentBalance + (parseFloat(paymentAmount) || 0)) >= 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}>
                                      {formatCurrency(
                                        Math.abs(paymentInfo.currentBalance + (parseFloat(paymentAmount) || 0))
                                      )}
                                      {(paymentInfo.currentBalance + (parseFloat(paymentAmount) || 0)) >= 0
                                        ? " (Crédito)"
                                        : " (Débito)"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={handleRecordPayment}
                              className="flex-1"
                              disabled={!paymentAmount || !monthReference || parseFloat(paymentAmount) <= 0}
                            >
                              <Save className="h-4 w-4 mr-2" />
                              Registrar Pagamento
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setCurrentStep("overview")}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* History Step */}
                  {currentStep === "history" && (
                    <div className="max-w-6xl space-y-6">
                      <Card>
                        <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b">
                          <CardTitle className="flex items-center gap-2">
                            <History className="h-5 w-5 text-blue-600" />
                            Histórico Completo de Pagamentos
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Todos os pagamentos registrados para este estudante
                          </p>
                        </CardHeader>
                        <CardContent className="p-6">
                          <div className="space-y-3 max-h-[500px] overflow-y-auto">
                            {paymentInfo.paymentHistory.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-4 flex-1">
                                  <div
                                    className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                      payment.status === "paid"
                                        ? "bg-green-500"
                                        : payment.status === "overdue"
                                        ? "bg-red-500"
                                        : payment.status === "advance"
                                        ? "bg-blue-500"
                                        : "bg-orange-500"
                                    }`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="font-semibold">
                                        {payment.monthReference}
                                      </div>
                                      <Badge className={`${getStatusColor(payment.status)} text-xs`}>
                                        {getStatusText(payment.status)}
                                      </Badge>
                                    </div>
                                    {payment.description && (
                                      <div className="text-sm text-muted-foreground mb-1">
                                        {payment.description}
                                      </div>
                                    )}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-BR")}
                                      </span>
                                      {payment.paidDate && (
                                        <span className="flex items-center gap-1">
                                          <CheckCircle className="h-3 w-3" />
                                          Pago em: {new Date(payment.paidDate).toLocaleDateString("pt-BR")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <div>
                                    <div className="text-lg font-bold">
                                      {formatCurrency(payment.amount)}
                                    </div>
                                    {payment.paymentMethod && (
                                      <div className="text-xs text-muted-foreground">
                                        {payment.paymentMethod === "cash" && "💵 Dinheiro"}
                                        {payment.paymentMethod === "transfer" && "🏦 Transferência"}
                                        {payment.paymentMethod === "card" && "💳 Cartão"}
                                        {payment.paymentMethod === "mpesa" && "📱 M-Pesa"}
                                        {payment.paymentMethod === "other" && "📋 Outro"}
                                      </div>
                                    )}
                                  </div>
                                  {payment.receiptNumber && (
                                    <Button variant="ghost" size="sm" title="Ver Recibo">
                                      <Receipt className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {payment.status !== "paid" && onUpdatePayment && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleMarkAsPaid(payment.id)}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Marcar Pago
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}

                            {paymentInfo.paymentHistory.length === 0 && (
                              <div className="text-center py-12 text-muted-foreground">
                                <FileText className="h-16 w-16 mx-auto mb-3 opacity-50" />
                                <p className="text-lg font-medium">Nenhum pagamento registrado</p>
                                <p className="text-sm mt-1">
                                  Clique em "Novo Pagamento" para registrar o primeiro pagamento
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!isLoading && !loadError && paymentInfo && (
              <div className="border-t px-8 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Última atualização: {new Date().toLocaleString("pt-BR")}
                  </div>
                  <Button variant="outline" onClick={onClose}>
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}