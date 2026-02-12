// src/components/shared/StudentPaymentHistory.tsx
import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePaymentPlans, PaymentPlan } from "@/hooks/usePaymentPlans";
import {
  History,
  DollarSign,
  Calendar,
  Receipt,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Printer,
  RefreshCw,
  User,
  BookOpen,
  TrendingUp
} from "lucide-react";

interface StudentPaymentHistoryProps {
  studentId: number;
  studentName?: string;
  isOpen?: boolean;
  onClose?: () => void;
  asModal?: boolean;
}

// Formatar moeda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Formatar data
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Formatar mês de referência
const formatMonthRef = (monthRef: string) => {
  if (!monthRef) return '-';
  const [year, month] = monthRef.split('-');
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
};

function PaymentHistoryContent({
  studentId,
  studentName
}: {
  studentId: number;
  studentName?: string;
}) {
  const { plans, isLoading, fetchPlans, fetchPayments, payments } = usePaymentPlans({
    studentId,
    autoFetch: true
  });

  useEffect(() => {
    if (studentId) {
      fetchPlans({ studentId });
      fetchPayments({ studentId });
    }
  }, [studentId, fetchPlans, fetchPayments]);

  // Calcular resumo
  const summary = useMemo(() => {
    let totalPaid = 0;
    let totalPending = 0;
    let totalOverdue = 0;
    let totalPenalties = 0;

    plans.forEach(plan => {
      totalPaid += plan.total_paid;
      if (plan.computed_status === 'pending') {
        totalPending += plan.base_remaining;
      } else if (plan.computed_status === 'overdue') {
        totalOverdue += plan.base_remaining;
        totalPenalties += plan.penalty;
      }
    });

    return { totalPaid, totalPending, totalOverdue, totalPenalties };
  }, [plans]);

  const getStatusBadge = (plan: PaymentPlan) => {
    const status = plan.computed_status || plan.status;

    switch (status) {
      case 'paid':
        return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Pago</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Em Atraso</Badge>;
      case 'partial':
        return <Badge className="gap-1 bg-yellow-600"><Clock className="h-3 w-3" /> Parcial</Badge>;
      default:
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pendente</Badge>;
    }
  };

  const handleExport = () => {
    const csvContent = [
      ["Mês Ref", "Curso", "Vencimento", "Valor", "Multa", "Total", "Pago", "Status"],
      ...plans.map(p => [
        p.month_reference,
        p.course_name,
        p.due_date,
        p.amount_due,
        p.penalty,
        p.total_due_with_penalty,
        p.total_paid,
        p.computed_status
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `historico_pagamentos_${studentId}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-[#004B87] mb-4" />
        <p className="text-slate-600">A carregar histórico...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com nome do estudante */}
      {studentName && (
        <div className="flex items-center gap-3 pb-4 border-b">
          <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
            {studentName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#004B87]">{studentName}</h3>
            <p className="text-sm text-slate-500">Histórico de Pagamentos</p>
          </div>
        </div>
      )}

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Total Pago</span>
            </div>
            <p className="text-xl font-bold text-green-700">{formatCurrency(summary.totalPaid)}</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="text-xs font-medium text-yellow-700">Pendente</span>
            </div>
            <p className="text-xl font-bold text-yellow-700">{formatCurrency(summary.totalPending)}</p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-xs font-medium text-red-700">Em Atraso</span>
            </div>
            <p className="text-xl font-bold text-red-700">{formatCurrency(summary.totalOverdue)}</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Multas</span>
            </div>
            <p className="text-xl font-bold text-orange-700">{formatCurrency(summary.totalPenalties)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Botão de Export */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Lista de Pagamentos */}
      {plans.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600">Nenhum plano de pagamento encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {/* Cabeçalho da Tabela */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
              <div className="grid grid-cols-12 gap-2 p-3 text-xs font-bold text-slate-600 uppercase tracking-wide">
                <div className="col-span-2">Mês</div>
                <div className="col-span-2">Curso</div>
                <div className="col-span-2 text-center">Vencimento</div>
                <div className="col-span-1 text-center">Valor</div>
                <div className="col-span-1 text-center">Multa</div>
                <div className="col-span-1 text-center">Total</div>
                <div className="col-span-1 text-center">Pago</div>
                <div className="col-span-2 text-center">Status</div>
              </div>
            </div>

            {/* Linhas */}
            <div className="divide-y divide-slate-200 max-h-[400px] overflow-y-auto">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`grid grid-cols-12 gap-2 p-3 items-center hover:bg-slate-50 transition-colors text-sm ${
                    index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                  }`}
                >
                  <div className="col-span-2 font-medium text-slate-700">
                    {formatMonthRef(plan.month_reference)}
                  </div>

                  <div className="col-span-2 text-slate-600 truncate" title={plan.course_name}>
                    {plan.course_name}
                  </div>

                  <div className="col-span-2 text-center text-slate-500 text-xs">
                    {formatDate(plan.due_date)}
                  </div>

                  <div className="col-span-1 text-center font-medium text-slate-700">
                    {formatCurrency(plan.amount_due)}
                  </div>

                  <div className="col-span-1 text-center">
                    {plan.penalty > 0 ? (
                      <span className="font-medium text-red-600">+{formatCurrency(plan.penalty)}</span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </div>

                  <div className="col-span-1 text-center font-bold text-[#004B87]">
                    {formatCurrency(plan.total_due_with_penalty)}
                  </div>

                  <div className="col-span-1 text-center font-medium text-green-600">
                    {formatCurrency(plan.total_paid)}
                  </div>

                  <div className="col-span-2 flex justify-center">
                    {getStatusBadge(plan)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function StudentPaymentHistory({
  studentId,
  studentName,
  isOpen = true,
  onClose,
  asModal = false
}: StudentPaymentHistoryProps) {
  if (asModal && onClose) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#004B87]">
              <History className="h-5 w-5" />
              Histórico de Pagamentos
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <PaymentHistoryContent studentId={studentId} studentName={studentName} />
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Renderização inline (não como modal)
  return (
    <PaymentHistoryContent studentId={studentId} studentName={studentName} />
  );
}

export default StudentPaymentHistory;
