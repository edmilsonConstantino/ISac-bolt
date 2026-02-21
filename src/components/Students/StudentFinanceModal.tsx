// src/components/Students/StudentFinanceModal.tsx
import {
  DollarSign, X, AlertTriangle, CheckCircle, Clock,
  Receipt, MessageCircle, CreditCard, Smartphone,
  Building, Banknote, Calendar, XCircle, HelpCircle,
  Phone, MapPin,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// ─── Types ────────────────────────────────────────────────────────────────────

type PaymentStatus =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'partial'
  | 'advance'
  | 'awaiting_confirmation'
  | 'cancelled';

interface Payment {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  method?: string;
  status: PaymentStatus;
  monthReference: string;
  description?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

interface StudentPaymentInfo {
  studentId: number;
  studentName: string;
  className: string;
  monthlyFee: number;
  currentBalance: number;
  totalPaid: number;
  totalDue: number;
  lastPaymentDate?: string;
  paymentHistory: Payment[];
  overduePayments: Payment[];
  advancePayments: unknown[];
  canMakePayments: boolean;
  canEditPayments: boolean;
  contactInfo: {
    whatsapp: string;
    email: string;
    hours: string;
    address: string;
  };
  paymentMethods: {
    name: string;
    description: string;
    icon: string;
  }[];
}

interface StudentFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentPaymentInfo: StudentPaymentInfo;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(n);

const fmtDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

const STATUS_CONFIG: Record<PaymentStatus, {
  label: string;
  Icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  textColor: string;
  badgeBg: string;
}> = {
  paid: {
    label: 'Pago',
    Icon: CheckCircle,
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-100',
  },
  pending: {
    label: 'Pendente',
    Icon: Clock,
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-100',
  },
  overdue: {
    label: 'Atrasado',
    Icon: AlertTriangle,
    iconColor: 'text-red-600',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100',
  },
  partial: {
    label: 'Parcial',
    Icon: Clock,
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    badgeBg: 'bg-orange-100',
  },
  advance: {
    label: 'Antecipado',
    Icon: CheckCircle,
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-100',
  },
  awaiting_confirmation: {
    label: 'Aguard. Confirm.',
    Icon: HelpCircle,
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    badgeBg: 'bg-violet-100',
  },
  cancelled: {
    label: 'Cancelado',
    Icon: XCircle,
    iconColor: 'text-slate-400',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-500',
    badgeBg: 'bg-slate-200',
  },
};

const getMethodIcon = (icon?: string) => {
  switch (icon) {
    case 'cash':   return <Banknote   className="h-4 w-4" />;
    case 'bank':   return <Building   className="h-4 w-4" />;
    case 'mobile': return <Smartphone className="h-4 w-4" />;
    case 'card':   return <CreditCard className="h-4 w-4" />;
    default:       return <DollarSign className="h-4 w-4" />;
  }
};

// ─── Component ────────────────────────────────────────────────────────────────

export function StudentFinanceModal({
  isOpen,
  onClose,
  studentPaymentInfo,
}: StudentFinanceModalProps) {

  const hasOverdue = studentPaymentInfo.overduePayments.length > 0;

  const nextPayment = studentPaymentInfo.paymentHistory
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const awaitingPayments = studentPaymentInfo.paymentHistory
    .filter(p => p.status === 'awaiting_confirmation');

  const handleContactFinance = () => {
    const msg = `Olá! Sou ${studentPaymentInfo.studentName}, estudante da turma ${studentPaymentInfo.className}. Gostaria de falar sobre a minha situação financeira.`;
    window.open(
      `https://wa.me/${studentPaymentInfo.contactInfo.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`,
      '_blank',
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* [&>button:first-child]:hidden hides the default shadcn close button */}
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[92vh] flex flex-col gap-0 [&>button:first-child]:hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#004B87] via-[#003868] to-[#004B87] px-5 pt-5 pb-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <DollarSign className="h-5 w-5 text-[#FF9933]" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">Situação Financeira</h2>
                <p className="text-blue-200 text-xs mt-0.5 truncate max-w-[200px]">
                  {studentPaymentInfo.studentName}
                  {studentPaymentInfo.className !== '—' && ` · ${studentPaymentInfo.className}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 mt-0.5"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          {/* Orange line */}
          <div className="mt-4 h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F] rounded-full" />
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1 bg-slate-50">
          <div className="p-4 space-y-4">

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-2xl p-3 text-center border ${
                studentPaymentInfo.currentBalance >= 0
                  ? 'bg-emerald-50 border-emerald-100'
                  : 'bg-red-50 border-red-100'
              }`}>
                <p className={`text-base font-bold truncate leading-tight ${
                  studentPaymentInfo.currentBalance >= 0 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {fmt(Math.abs(studentPaymentInfo.currentBalance))}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">
                  {studentPaymentInfo.currentBalance >= 0 ? 'Crédito' : 'Débito'}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-3 text-center border border-slate-100">
                <p className="text-base font-bold text-[#004B87] truncate leading-tight">
                  {fmt(studentPaymentInfo.monthlyFee)}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Mensalidade</p>
              </div>

              <div className={`rounded-2xl p-3 text-center border ${
                hasOverdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'
              }`}>
                <p className={`text-base font-bold leading-tight ${
                  hasOverdue ? 'text-red-700' : 'text-slate-400'
                }`}>
                  {studentPaymentInfo.overduePayments.length}
                </p>
                <p className="text-[10px] text-slate-500 mt-1">Em Atraso</p>
              </div>
            </div>

            {/* Next payment */}
            {nextPayment && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Próximo Vencimento
                </p>
                <div className="flex items-center gap-3">
                  <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    nextPayment.status === 'overdue' ? 'bg-red-50' : 'bg-amber-50'
                  }`}>
                    <Calendar className={`h-5 w-5 ${
                      nextPayment.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {nextPayment.description || nextPayment.monthReference}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Vence: {fmtDate(nextPayment.dueDate)}
                    </p>
                    {nextPayment.status === 'overdue' && (() => {
                      const days = Math.floor(
                        (Date.now() - new Date(nextPayment.dueDate).getTime()) / 86400000,
                      );
                      return (
                        <p className="text-[10px] text-red-500 font-semibold mt-0.5">
                          {days} dias em atraso
                        </p>
                      );
                    })()}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-slate-800">{fmt(nextPayment.amount)}</p>
                    <p className={`text-[10px] font-semibold mt-0.5 ${
                      nextPayment.status === 'overdue' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {nextPayment.status === 'overdue' ? 'Atrasado' : 'Pendente'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Overdue alert */}
            {hasOverdue && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-800">Pagamentos em Atraso</p>
                    <p className="text-xs text-red-600 mt-0.5">
                      {studentPaymentInfo.overduePayments.length} pagamento(s) ·{' '}
                      {fmt(studentPaymentInfo.overduePayments.reduce((s, p) => s + p.amount, 0))}
                    </p>
                  </div>
                  <button
                    onClick={handleContactFinance}
                    className="flex-shrink-0 px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors flex items-center gap-1"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Falar
                  </button>
                </div>
              </div>
            )}

            {/* Awaiting confirmation alert */}
            {awaitingPayments.length > 0 && (
              <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="h-4 w-4 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-violet-800">Comprovativo Enviado</p>
                    <p className="text-xs text-violet-600 mt-0.5">
                      {awaitingPayments.length} pagamento(s) aguardando confirmação
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* All good */}
            {!hasOverdue && studentPaymentInfo.paymentHistory.length > 0 && awaitingPayments.length === 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-800">Conta Regularizada!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">Sem pagamentos em atraso.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment history */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-slate-500" />
                <h3 className="text-sm font-semibold text-slate-800">Histórico de Pagamentos</h3>
                <span className="ml-auto text-[10px] text-slate-400 font-medium">
                  {studentPaymentInfo.paymentHistory.length} registos
                </span>
              </div>

              {studentPaymentInfo.paymentHistory.length === 0 ? (
                <div className="text-center py-10">
                  <Receipt className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Nenhum pagamento registado</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {studentPaymentInfo.paymentHistory.map((payment) => {
                    const cfg = STATUS_CONFIG[payment.status] ?? STATUS_CONFIG.pending;
                    const StatusIcon = cfg.Icon;
                    const daysOverdue = payment.status === 'overdue'
                      ? Math.floor((Date.now() - new Date(payment.dueDate).getTime()) / 86400000)
                      : null;

                    return (
                      <div key={payment.id} className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cfg.bgColor}`}>
                            <StatusIcon className={`h-4 w-4 ${cfg.iconColor}`} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-700 truncate">
                              {payment.monthReference}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {payment.status === 'paid' && payment.paidDate
                                ? `Pago em ${fmtDate(payment.paidDate)}`
                                : `Vence: ${fmtDate(payment.dueDate)}`}
                              {daysOverdue !== null && ` · ${daysOverdue}d atraso`}
                            </p>
                            {payment.receiptNumber && (
                              <p className="text-[10px] text-slate-300 font-mono mt-0.5">
                                Ref: {payment.receiptNumber}
                              </p>
                            )}
                            {payment.status === 'awaiting_confirmation' && (
                              <p className="text-[10px] text-violet-500 font-medium mt-0.5">
                                Comprovativo enviado — aguardando confirmação
                              </p>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                            <p className="text-sm font-bold text-slate-800">
                              {fmt(payment.amount)}
                            </p>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badgeBg} ${cfg.textColor}`}>
                              {cfg.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* How to pay */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Como Pagar
              </p>
              <div className="space-y-2">
                {studentPaymentInfo.paymentMethods.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                    <div className="h-8 w-8 bg-[#004B87]/10 rounded-lg flex items-center justify-center flex-shrink-0 text-[#004B87]">
                      {getMethodIcon(m.icon)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{m.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{m.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] font-bold text-[#F5821F] uppercase mb-1">Importante</p>
                <p className="text-xs text-amber-800">
                  Após pagar, envie o comprovativo via WhatsApp para confirmarmos rapidamente.
                </p>
              </div>
            </div>

            {/* Contact info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                Contacto do Financeiro
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700">WhatsApp</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {studentPaymentInfo.contactInfo.whatsapp}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
                  <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700">Presencial</p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {studentPaymentInfo.contactInfo.address}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {studentPaymentInfo.contactInfo.hours}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleContactFinance}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white font-semibold text-sm rounded-2xl hover:opacity-90 active:scale-[0.98] transition-all shadow-sm"
              >
                <MessageCircle className="h-4 w-4" />
                Falar no WhatsApp
              </button>
              <button
                onClick={onClose}
                className="px-5 py-3.5 bg-white border border-slate-200 text-slate-600 font-semibold text-sm rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all"
              >
                Fechar
              </button>
            </div>

            <div className="h-1" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
