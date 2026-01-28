import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Printer,
  X,
  Calendar,
  CreditCard
} from "lucide-react";

interface MonthPayment {
  month: string;
  monthNumber: number;
  amount: number;
  status: "paid" | "pending" | "overdue";
  paidDate?: string;
  fine?: number;
}

interface StudentPaymentData {
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  monthlyFee: number;
  totalPaid: number;
  totalDebt: number;
  advanceBalance: number;
  totalFines: number;
  payments: MonthPayment[];
}

interface StudentPaymentManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentData: StudentPaymentData;
  onSavePayment: (data: any) => void;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function StudentPaymentManagementModal({
  isOpen,
  onClose,
  studentData,
  onSavePayment
}: StudentPaymentManagementModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [fineAmount, setFineAmount] = useState("");

  const handlePayment = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    const payment = studentData.payments[monthIndex];
    setPaymentAmount(payment.amount.toString());
    setFineAmount(payment.fine?.toString() || "0");
    setActiveTab("payment");
  };

  const handleSavePayment = () => {
    if (!selectedMonth) return;

    const data = {
      studentId: studentData.studentId,
      month: selectedMonth,
      amount: parseFloat(paymentAmount),
      fine: parseFloat(fineAmount) || 0,
      paidDate: new Date().toISOString().split('T')[0]
    };

    onSavePayment(data);
    toast.success("Pagamento registrado com sucesso!");
    handlePrintReceipt();
  };

  const handlePrintReceipt = () => {
    const monthName = MONTHS[selectedMonth || 0];
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Pagamento - ${studentData.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #004B87; padding-bottom: 20px; }
          .header h1 { color: #004B87; margin: 0; font-size: 28px; }
          .info { margin: 20px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          .label { font-weight: bold; color: #004B87; }
          .value { color: #333; }
          .total { background: #F5821F; color: white; padding: 15px; margin-top: 20px; font-size: 20px; text-align: center; }
          .footer { text-align: center; margin-top: 40px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>RECIBO DE PAGAMENTO</h1>
          <p>Sistema Acadêmico ISAC</p>
        </div>
        <div class="info">
          <div class="info-row">
            <span class="label">Estudante:</span>
            <span class="value">${studentData.studentName}</span>
          </div>
          <div class="info-row">
            <span class="label">Curso:</span>
            <span class="value">${studentData.courseName}</span>
          </div>
          <div class="info-row">
            <span class="label">Mês de Referência:</span>
            <span class="value">${monthName}</span>
          </div>
          <div class="info-row">
            <span class="label">Valor:</span>
            <span class="value">${parseFloat(paymentAmount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
          </div>
          ${parseFloat(fineAmount) > 0 ? `
          <div class="info-row">
            <span class="label">Multa:</span>
            <span class="value">${parseFloat(fineAmount).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}</span>
          </div>
          ` : ''}
          <div class="info-row">
            <span class="label">Data do Pagamento:</span>
            <span class="value">${new Date().toLocaleDateString('pt-AO')}</span>
          </div>
        </div>
        <div class="total">
          Total Pago: ${(parseFloat(paymentAmount) + parseFloat(fineAmount)).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
        </div>
        <div class="footer">
          <p>Este documento é um comprovante de pagamento</p>
          <p>Emitido em ${new Date().toLocaleDateString('pt-AO')} às ${new Date().toLocaleTimeString('pt-AO')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-green-100 text-green-800 border-green-300";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "overdue": return "bg-red-100 text-red-800 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid": return <CheckCircle className="h-4 w-4" />;
      case "pending": return <Clock className="h-4 w-4" />;
      case "overdue": return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "paid": return "Pago";
      case "pending": return "Pendente";
      case "overdue": return "Em Atraso";
      default: return status;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* HEADER */}
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 bg-gradient-to-r from-[#004B87] to-[#0066B3]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Gerenciar Pagamentos
                </DialogTitle>
                <p className="text-sm text-blue-100 mt-1">
                  {studentData.studentName} • {studentData.courseName}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </DialogHeader>

          {/* CONTENT */}
          <div className="flex-1 overflow-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="overview" className="text-sm font-medium">
                  Visão Geral
                </TabsTrigger>
                <TabsTrigger value="months" className="text-sm font-medium">
                  Meses de Pagamento
                </TabsTrigger>
              </TabsList>

              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Total Pago */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Total Pago</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {studentData.totalPaid.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </p>
                  </div>

                  {/* Dívida Total */}
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">Dívida Total</span>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {studentData.totalDebt.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </p>
                  </div>

                  {/* Saldo Adiantamento */}
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700">Saldo Adiantamento</span>
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900">
                      {studentData.advanceBalance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </p>
                  </div>

                  {/* Multas */}
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4 hover:shadow-lg transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-orange-700">Multas</span>
                      <AlertCircle className="h-5 w-5 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-orange-900">
                      {studentData.totalFines.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </p>
                  </div>
                </div>

                {/* Course Info */}
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#004B87] mb-4">Informações do Curso</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Curso</p>
                      <p className="text-base font-semibold text-slate-900">{studentData.courseName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Mensalidade</p>
                      <p className="text-base font-semibold text-slate-900">
                        {studentData.monthlyFee.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* MONTHS TAB */}
              <TabsContent value="months" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentData.payments.map((payment, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-4 transition-all hover:shadow-lg ${
                        payment.status === "paid" ? "bg-green-50 border-green-300" :
                        payment.status === "pending" ? "bg-yellow-50 border-yellow-300" :
                        "bg-red-50 border-red-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-slate-600" />
                          <span className="font-semibold text-slate-900">{payment.month}</span>
                        </div>
                        <Badge className={`${getStatusColor(payment.status)} border text-xs px-2 py-1`}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(payment.status)}
                            {getStatusText(payment.status)}
                          </span>
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Valor:</span>
                          <span className="font-semibold text-slate-900">
                            {payment.amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                          </span>
                        </div>
                        {payment.fine && payment.fine > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-orange-600">Multa:</span>
                            <span className="font-semibold text-orange-700">
                              {payment.fine.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                            </span>
                          </div>
                        )}
                        {payment.paidDate && (
                          <div className="flex justify-between text-xs text-slate-500">
                            <span>Pago em:</span>
                            <span>{new Date(payment.paidDate).toLocaleDateString('pt-AO')}</span>
                          </div>
                        )}
                      </div>

                      {payment.status !== "paid" && (
                        <Button
                          onClick={() => handlePayment(index)}
                          className="w-full bg-[#F5821F] hover:bg-[#E07318] text-white h-9 text-sm"
                        >
                          <CreditCard className="h-3 w-3 mr-2" />
                          Pagar Agora
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* PAYMENT TAB (Hidden, used when clicking Pay) */}
              <TabsContent value="payment" className="space-y-4 mt-4">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#004B87] mb-6">
                    Registrar Pagamento - {selectedMonth !== null ? MONTHS[selectedMonth] : ""}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Valor do Pagamento (AOA)
                      </label>
                      <Input
                        type="number"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="h-12 text-lg font-semibold"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-2 block">
                        Multa (AOA)
                      </label>
                      <Input
                        type="number"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        className="h-12 text-lg font-semibold"
                        placeholder="0.00"
                      />
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-700 font-medium">Total a Pagar</p>
                      <p className="text-3xl font-bold text-blue-900 mt-1">
                        {(parseFloat(paymentAmount || "0") + parseFloat(fineAmount || "0")).toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                      </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab("months")}
                        className="flex-1 h-12"
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSavePayment}
                        className="flex-1 h-12 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-bold"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Confirmar e Imprimir
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
