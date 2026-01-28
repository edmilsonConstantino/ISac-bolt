import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Receipt,
  CreditCard
} from "lucide-react";

interface MonthPayment {
  month: string;
  dueDate: string;
  amount: number;
  status: "paid" | "pending" | "overdue";
  paidDate?: string;
  fine?: number;
}

interface StudentPaymentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    id: number;
    name: string;
    course: string;
    enrollmentDate: string;
  };
}

const MOCK_MONTHS: MonthPayment[] = [
  { month: "Janeiro 2025", dueDate: "2025-01-10", amount: 2500, status: "paid", paidDate: "2025-01-08" },
  { month: "Fevereiro 2025", dueDate: "2025-02-10", amount: 2500, status: "overdue", fine: 250 },
  { month: "Março 2025", dueDate: "2025-03-10", amount: 2500, status: "pending" },
  { month: "Abril 2025", dueDate: "2025-04-10", amount: 2500, status: "pending" },
  { month: "Maio 2025", dueDate: "2025-05-10", amount: 2500, status: "pending" },
  { month: "Junho 2025", dueDate: "2025-06-10", amount: 2500, status: "pending" },
  { month: "Julho 2025", dueDate: "2025-07-10", amount: 2500, status: "pending" },
  { month: "Agosto 2025", dueDate: "2025-08-10", amount: 2500, status: "pending" },
  { month: "Setembro 2025", dueDate: "2025-09-10", amount: 2500, status: "pending" },
  { month: "Outubro 2025", dueDate: "2025-10-10", amount: 2500, status: "pending" },
  { month: "Novembro 2025", dueDate: "2025-11-10", amount: 2500, status: "pending" },
  { month: "Dezembro 2025", dueDate: "2025-12-10", amount: 2500, status: "pending" },
];

export function StudentPaymentDetailsModal({
  isOpen,
  onClose,
  student
}: StudentPaymentDetailsModalProps) {
  const [payments] = useState<MonthPayment[]>(MOCK_MONTHS);
  const [selectedMonth, setSelectedMonth] = useState<MonthPayment | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");

  const totalPaid = payments.filter(p => p.status === "paid").reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0);
  const totalFines = payments.filter(p => p.status === "overdue").reduce((sum, p) => sum + (p.fine || 0), 0);

  const currentBalance = totalPaid - (payments.filter(p => p.status === "paid").length * 2500);
  const debt = totalOverdue + totalFines;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getStatusInfo = (status: MonthPayment['status']) => {
    const statusMap = {
      paid: {
        label: 'Pago',
        icon: CheckCircle,
        color: 'bg-green-500',
        textColor: 'text-green-700',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-300'
      },
      pending: {
        label: 'Pendente',
        icon: Clock,
        color: 'bg-yellow-500',
        textColor: 'text-yellow-700',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-300'
      },
      overdue: {
        label: 'Atrasado',
        icon: XCircle,
        color: 'bg-red-500',
        textColor: 'text-red-700',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-300'
      }
    };
    return statusMap[status];
  };

  const handlePayment = () => {
    if (!selectedMonth) return;
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      toast.error("Insira um valor válido");
      return;
    }

    toast.success(`Pagamento de ${formatCurrency(Number(paymentAmount))} registrado!`);
    setSelectedMonth(null);
    setPaymentAmount("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#004B87] flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Detalhes de Pagamento - {student.name}
          </DialogTitle>
          <p className="text-sm text-slate-600">Curso: {student.course}</p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-xs text-blue-700 font-semibold uppercase">Saldo Atual</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">{formatCurrency(currentBalance)}</p>
              <p className="text-xs text-blue-600 mt-1">
                {currentBalance > 0 ? "Adiantado" : currentBalance < 0 ? "Devendo" : "Em dia"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-xs text-green-700 font-semibold uppercase">Total Pago</span>
              </div>
              <p className="text-3xl font-bold text-green-700">{formatCurrency(totalPaid)}</p>
              <p className="text-xs text-green-600 mt-1">
                {payments.filter(p => p.status === "paid").length} meses
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-5 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                <span className="text-xs text-red-700 font-semibold uppercase">Dívida Total</span>
              </div>
              <p className="text-3xl font-bold text-red-700">{formatCurrency(debt)}</p>
              <p className="text-xs text-red-600 mt-1">
                {payments.filter(p => p.status === "overdue").length} meses atrasados
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-5 border-2 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span className="text-xs text-orange-700 font-semibold uppercase">Multas</span>
              </div>
              <p className="text-3xl font-bold text-orange-700">{formatCurrency(totalFines)}</p>
              <p className="text-xs text-orange-600 mt-1">Total de multas</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#F5821F]" />
              Grelha de Pagamentos por Mês
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {payments.map((payment, index) => {
                const statusInfo = getStatusInfo(payment.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={index}
                    className={`relative rounded-xl p-4 border-2 ${statusInfo.borderColor} ${statusInfo.bgColor} hover:shadow-lg transition-all cursor-pointer`}
                    onClick={() => setSelectedMonth(payment)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className={`font-bold text-sm ${statusInfo.textColor} mb-1`}>
                          {payment.month}
                        </h4>
                        <p className="text-xs text-slate-600">
                          Vencimento: {new Date(payment.dueDate).toLocaleDateString("pt-PT")}
                        </p>
                      </div>
                      <div className={`h-10 w-10 rounded-lg ${statusInfo.color} flex items-center justify-center`}>
                        <StatusIcon className="h-5 w-5 text-white" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Valor:</span>
                        <span className={`font-bold ${statusInfo.textColor}`}>
                          {formatCurrency(payment.amount)}
                        </span>
                      </div>

                      {payment.fine && payment.fine > 0 && (
                        <div className="flex justify-between items-center p-2 bg-red-100 rounded">
                          <span className="text-xs text-red-700 font-semibold">Multa:</span>
                          <span className="font-bold text-red-700">
                            {formatCurrency(payment.fine)}
                          </span>
                        </div>
                      )}

                      {payment.paidDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Pago em:</span>
                          <span className="text-xs font-semibold text-green-700">
                            {new Date(payment.paidDate).toLocaleDateString("pt-PT")}
                          </span>
                        </div>
                      )}

                      <Badge className={`w-full justify-center ${statusInfo.color} text-white border-0`}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedMonth && selectedMonth.status !== "paid" && (
            <div className="bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Registrar Pagamento - {selectedMonth.month}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <Label className="text-white mb-2">Valor da Mensalidade</Label>
                  <div className="bg-white/10 p-3 rounded-lg">
                    <p className="text-2xl font-bold">{formatCurrency(selectedMonth.amount)}</p>
                  </div>
                </div>

                {selectedMonth.fine && selectedMonth.fine > 0 && (
                  <div>
                    <Label className="text-white mb-2">Multa</Label>
                    <div className="bg-red-500/20 p-3 rounded-lg border border-red-400">
                      <p className="text-2xl font-bold text-red-200">{formatCurrency(selectedMonth.fine)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-white mb-2">Valor a Pagar</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="bg-white text-slate-800 h-12 text-lg font-semibold"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handlePayment}
                    className="flex-1 bg-[#F5821F] hover:bg-[#E07318] text-white h-12 text-base font-bold"
                  >
                    <Receipt className="h-5 w-5 mr-2" />
                    Registrar Pagamento
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedMonth(null);
                      setPaymentAmount("");
                    }}
                    variant="ghost"
                    className="h-12 text-white hover:bg-white/10"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200">
          <Button variant="ghost" onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
