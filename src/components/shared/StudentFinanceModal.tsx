// src/components/shared/StudentFinanceModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  CreditCard,
  X,
  GraduationCap,
  Receipt,
  Wallet,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { financeService } from "@/services/financeService";
import {
  StudentFinanceResponse,
  PaymentTransaction,
  formatCurrency,
  formatMonthReference,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "@/types/finance";

interface StudentFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: number | null;
  onPaymentRecorded?: () => void;
}

type Tab = "history" | "plans";

// Derives a human-readable label for a payment entry
function getPaymentLabel(payment: PaymentTransaction): string {
  const allocs = payment.allocations ?? [];

  if (allocs.length === 0) {
    // No allocations — advance / wallet credit
    if (payment.month_reference && /^\d{4}-\d{2}$/.test(payment.month_reference)) {
      return formatMonthReference(payment.month_reference);
    }
    return "Crédito / Adiantamento";
  }

  const types = [...new Set(allocs.map((a) => a.plan_type ?? ""))];
  const isMatricula = types.some((t) =>
    t.toLowerCase().includes("matricula") || t.toLowerCase().includes("inscri")
  );
  const isMensalidade = types.some((t) =>
    t === "mensalidade" || t === "monthly"
  );

  if (isMatricula && !isMensalidade) return "Taxa de Matrícula / Inscrição";
  if (isMatricula && isMensalidade)  return "Matrícula + Mensalidades";

  // mensalidade(s) only
  const months = allocs
    .filter((a) => a.month_reference && /^\d{4}-\d{2}$/.test(a.month_reference))
    .map((a) => formatMonthReference(a.month_reference));

  if (months.length === 0) return "Pagamento";
  if (months.length === 1) return months[0];
  if (months.length === 2) return months.join(" + ");
  return `${months[0]} + ${months.length - 1} mês(es)`;
}

function getPaymentIcon(payment: PaymentTransaction) {
  const allocs = payment.allocations ?? [];
  const types = allocs.map((a) => a.plan_type ?? "");
  if (types.some((t) => t.includes("matricula") || t.includes("inscri"))) {
    return <GraduationCap className="h-4 w-4 text-purple-600" />;
  }
  if (allocs.length === 0) {
    return <Wallet className="h-4 w-4 text-blue-600" />;
  }
  return <Receipt className="h-4 w-4 text-emerald-600" />;
}

function getPaymentIconBg(payment: PaymentTransaction) {
  const allocs = payment.allocations ?? [];
  const types = allocs.map((a) => a.plan_type ?? "");
  if (types.some((t) => t.includes("matricula") || t.includes("inscri"))) {
    return "bg-purple-50";
  }
  if (allocs.length === 0) return "bg-blue-50";
  return "bg-emerald-50";
}

export function StudentFinanceModal({
  isOpen,
  onClose,
  studentId,
  onPaymentRecorded: _onPaymentRecorded,
}: StudentFinanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<StudentFinanceResponse | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("history");

  useEffect(() => {
    if (isOpen && studentId) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, studentId]);

  const loadData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const response = await financeService.getStudentFinance(studentId);
      setData(response);
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) =>
    "MT " + new Intl.NumberFormat("pt-MZ", {}).format(n);

  const payments: PaymentTransaction[] = data?.recent_payments ?? [];
  const confirmedPayments = payments.filter((p) => p.status !== "void" && p.status !== "reversed");
  const hasOverdue = (data?.summary.overdue_count ?? 0) > 0;
  const grossPaid = data?.summary.gross_total_paid ?? data?.summary.total_paid ?? 0;
  const walletBalance = data?.summary.wallet_balance ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="p-0 max-w-lg max-h-[92vh] overflow-hidden flex flex-col [&>button]:hidden">

        {/* ── Gradient Header ─────────────────────────────────────────── */}
        <div className={`px-5 pt-5 pb-4 text-white flex-shrink-0 ${
          hasOverdue
            ? "bg-gradient-to-r from-red-500 to-red-600"
            : "bg-gradient-to-r from-[#004B87] via-[#003868] to-[#004B87]"
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-white/20 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0">
                {(data?.student.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold leading-tight">
                  {data?.student.name || "Histórico Financeiro"}
                </h2>
                {data?.course && (
                  <p className="text-xs text-white/70 mt-0.5">{data.course.name}</p>
                )}
                {data?.student.is_bolsista && (
                  <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-purple-500/30 text-purple-100 font-semibold px-2 py-0.5 rounded-full">
                    <GraduationCap className="h-3 w-3" /> Bolsista
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Summary chips */}
          {data && (
            <div className="mt-4 flex gap-2 flex-wrap">
              <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 min-w-0">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-300 flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-white/60 leading-none">Total Pago</p>
                  <p className="text-sm font-bold leading-tight">{fmt(grossPaid)}</p>
                </div>
              </div>
              {hasOverdue && (
                <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 min-w-0">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-300 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/60 leading-none">Em Atraso</p>
                    <p className="text-sm font-bold leading-tight">{fmt(data.summary.total_overdue)}</p>
                  </div>
                </div>
              )}
              {walletBalance > 0 && (
                <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 min-w-0">
                  <Wallet className="h-3.5 w-3.5 text-blue-300 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-white/60 leading-none">Crédito</p>
                    <p className="text-sm font-bold leading-tight">{fmt(walletBalance)}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Orange bottom accent */}
          <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F] -mx-5 mt-4" />
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex border-b border-slate-100 bg-white flex-shrink-0">
          {(["history", "plans"] as Tab[]).map((tab) => {
            const labels: Record<Tab, string> = { history: "Histórico", plans: "Parcelas" };
            const icons: Record<Tab, typeof Receipt> = { history: Receipt, plans: Calendar };
            const Icon = icons[tab];
            const isActive = activeTab === tab;
            const badge =
              tab === "plans" && (data?.summary.overdue_count ?? 0) > 0
                ? data!.summary.overdue_count
                : null;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-colors relative ${
                  isActive
                    ? "text-[#004B87]"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {labels[tab]}
                {badge !== null && (
                  <span className="h-4 px-1 bg-red-500 text-white text-[10px] rounded-full font-bold leading-4 min-w-[16px] text-center">
                    {badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#004B87] rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 overscroll-contain">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-[#004B87]" />
            </div>
          ) : !data ? (
            <div className="py-16 text-center text-slate-400">
              <DollarSign className="h-10 w-10 mx-auto mb-2 text-slate-200" />
              <p className="text-sm">Nenhum dado disponível</p>
            </div>
          ) : activeTab === "history" ? (
            /* ── Payment History ──────────────────────────────────────── */
            <div className="p-4 space-y-3">
              {confirmedPayments.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Nenhum pagamento registado</p>
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                    {confirmedPayments.length} pagamento(s) registado(s)
                  </p>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {confirmedPayments.map((payment, idx) => {
                      const label = getPaymentLabel(payment);
                      const iconBg = getPaymentIconBg(payment);
                      const icon = getPaymentIcon(payment);
                      const method =
                        PAYMENT_METHOD_LABELS[payment.payment_method as PaymentMethod] ||
                        payment.payment_type_name ||
                        payment.payment_method;
                      const isVoid = payment.status === "void" || payment.status === "reversed";

                      return (
                        <div
                          key={payment.id}
                          className={`flex items-center gap-3 px-4 py-3 ${
                            idx < confirmedPayments.length - 1 ? "border-b border-slate-50" : ""
                          } ${isVoid ? "opacity-50" : ""}`}
                        >
                          <div className={`h-9 w-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">{label}</p>
                            <p className="text-xs text-slate-400 truncate">
                              {method}
                              {payment.paid_date ? ` · ${payment.paid_date}` : ""}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-sm font-bold ${isVoid ? "line-through text-slate-400" : "text-slate-800"}`}>
                              {fmt(payment.amount_paid)}
                            </p>
                            {isVoid ? (
                              <p className="text-[10px] text-red-500 font-medium">Anulado</p>
                            ) : (
                              <p className="text-[10px] text-emerald-600 font-medium">Confirmado</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show void payments if any */}
                  {payments.filter(p => p.status === "void" || p.status === "reversed").length > 0 && (
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4 pt-3 pb-1">
                        Pagamentos Anulados
                      </p>
                      {payments
                        .filter((p) => p.status === "void" || p.status === "reversed")
                        .map((payment, idx, arr) => (
                          <div
                            key={payment.id}
                            className={`flex items-center gap-3 px-4 py-3 opacity-50 ${
                              idx < arr.length - 1 ? "border-b border-slate-50" : ""
                            }`}
                          >
                            <div className="h-9 w-9 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <X className="h-4 w-4 text-slate-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-500 line-through truncate">
                                {getPaymentLabel(payment)}
                              </p>
                              <p className="text-xs text-slate-400">{payment.paid_date}</p>
                            </div>
                            <p className="text-sm font-bold text-slate-400 line-through">
                              {fmt(payment.amount_paid)}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* ── Plans Tab ────────────────────────────────────────────── */
            <div className="p-4 space-y-2">
              {data.plans.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Calendar className="h-10 w-10 mx-auto mb-2 text-slate-200" />
                  <p className="text-sm">Nenhum plano de pagamento</p>
                  {!data.summary.class_started && (
                    <p className="text-xs text-slate-300 mt-1">
                      As parcelas aparecem quando a turma iniciar
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  {data.plans.map((plan, idx) => {
                    const statusConfig = {
                      paid:      { label: "Pago",     color: "text-emerald-600", bg: "bg-emerald-50", dot: "bg-emerald-500" },
                      overdue:   { label: "Em Atraso",color: "text-red-600",     bg: "bg-red-50",     dot: "bg-red-500"     },
                      partial:   { label: "Parcial",  color: "text-yellow-600",  bg: "bg-yellow-50",  dot: "bg-yellow-500"  },
                      pending:   { label: "Pendente", color: "text-slate-500",   bg: "bg-slate-50",   dot: "bg-slate-400"   },
                      exempt:    { label: "Isento",   color: "text-purple-600",  bg: "bg-purple-50",  dot: "bg-purple-500"  },
                      scheduled: { label: "Agendado", color: "text-blue-500",    bg: "bg-blue-50",    dot: "bg-blue-400"    },
                    }[plan.status] ?? { label: plan.status, color: "text-slate-500", bg: "bg-slate-50", dot: "bg-slate-300" };

                    return (
                      <div
                        key={plan.id}
                        className={`px-4 py-3 ${idx < data.plans.length - 1 ? "border-b border-slate-50" : ""}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 ${statusConfig.dot}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-700">
                                {plan.status === "exempt"
                                  ? "Mensalidade Isenta"
                                  : formatMonthReference(plan.month_reference)}
                              </p>
                              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                                {statusConfig.label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Vence: {plan.due_date}
                              {plan.days_overdue > 0 && ` · ${plan.days_overdue} dias em atraso`}
                              {plan.penalty_amount > 0 && ` · Multa: ${fmt(plan.penalty_amount)}`}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {plan.status === "exempt" ? (
                              <p className="text-sm font-bold text-purple-600">Isento</p>
                            ) : plan.status === "paid" ? (
                              <p className="text-sm font-bold text-emerald-600">{fmt(plan.paid_total)}</p>
                            ) : (
                              <>
                                <p className="text-sm font-bold text-slate-800">{fmt(plan.total_expected)}</p>
                                {plan.paid_total > 0 && (
                                  <p className="text-[10px] text-emerald-600">
                                    Pago: {fmt(plan.paid_total)}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setActiveTab(activeTab === "history" ? "plans" : "history")}
            className="flex items-center gap-1.5 text-xs text-[#004B87] font-semibold"
          >
            {activeTab === "history" ? (
              <><Calendar className="h-3.5 w-3.5" /> Ver Parcelas <ArrowRight className="h-3 w-3" /></>
            ) : (
              <><Receipt className="h-3.5 w-3.5" /> Ver Histórico <ArrowRight className="h-3 w-3" /></>
            )}
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full px-5"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default StudentFinanceModal;
