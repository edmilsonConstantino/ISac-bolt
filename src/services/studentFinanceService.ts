// src/services/studentFinanceService.ts
import paymentPlanService, { StudentPaymentPlanRow } from "./paymentPlanService";
import PaymentService, { StudentPayment } from "./PaymentService";

export type PaymentMethod = "cash" | "transfer" | "card" | "mpesa" | "other";
export type PaymentStatus = "paid" | "pending" | "overdue" | "partial" | "advance";

export interface PaymentHistoryRow {
  id: number;
  monthReference: string; // YYYY-MM
  amount: number;
  status: PaymentStatus;
  paidDate?: string;
  dueDate: string;
  method?: PaymentMethod;
  receiptNumber?: string | null;
  description?: string | null;
}

export interface StudentPaymentInfo {
  studentId: number;
  studentName: string;
  className: string;

  monthlyFee: number;

  totalPaid: number;
  totalDue: number;
  currentBalance: number;

  overduePayments: PaymentHistoryRow[];
  advancePayments: PaymentHistoryRow[];
  paymentHistory: PaymentHistoryRow[];
}

// helper
function toMoney(n: any): number {
  const v = Number(n);
  return Number.isFinite(v) ? v : 0;
}

function computeStatusFromPlanRow(p: StudentPaymentPlanRow): PaymentStatus {
  // prefer computed_status (tua API calcula com multa)
  const st = (p.computed_status || p.status) as any;
  if (st === "paid") return "paid";
  if (st === "partial") return "partial";
  if (st === "overdue") return "overdue";
  return "pending";
}

/**
 * Monta StudentPaymentInfo a partir de:
 * - planos (obrigatórios) => base de dívida, atraso, multa etc.
 * - pagamentos => histórico
 */
const studentFinanceService = {
  async getStudentFinance(params: { student_id: number; curso_id: string }) : Promise<StudentPaymentInfo> {
    const [plans, payments] = await Promise.all([
      paymentPlanService.list({ student_id: params.student_id, curso_id: params.curso_id }),
      PaymentService.list({ student_id: params.student_id, curso_id: params.curso_id }),
    ]);

    // inferências básicas
    const studentName = plans[0]?.student_name || (payments[0] as any)?.student_name || "Estudante";
    const className = ""; // se quiseres, depois buscamos na tua turma/registration
    const monthlyFee = plans[0] ? toMoney(plans[0].amount_due) : 0;

    // total pago (somatório de pagamentos válidos)
    const totalPaid = payments.reduce((acc, p) => {
      if (p.status === "reversed") return acc;
      return acc + toMoney(p.amount_paid);
    }, 0);

    // total devido com multa (somatório do plano)
    const totalDueWithPenalty = plans.reduce((acc, pl) => {
      // tua API já manda total_due_with_penalty calculado
      return acc + toMoney((pl as any).total_due_with_penalty ?? pl.amount_due);
    }, 0);

    // total devido base (sem multa) para referência
    const totalDueBase = plans.reduce((acc, pl) => acc + toMoney(pl.amount_due), 0);

    // saldo: pago - devido (com multa)
    const currentBalance = totalPaid - totalDueWithPenalty;

    // histórico do plano (meses obrigatórios)
    const planHistory: PaymentHistoryRow[] = plans.map((pl) => {
      const status = computeStatusFromPlanRow(pl);

      return {
        id: pl.id,
        monthReference: pl.month_reference,
        amount: toMoney((pl as any).total_due_with_penalty ?? pl.amount_due),
        status,
        dueDate: pl.due_date,
        description: pl.observacoes || null,
      };
    });

    const overduePayments = planHistory.filter((x) => x.status === "overdue");
    // advance: meses que ainda nem vencem mas já pagos (pelo plano marcado paid com due_date no futuro)
    const today = new Date().toISOString().slice(0, 10);
    const advancePayments = planHistory.filter((x) => x.status === "paid" && x.dueDate > today);

    // histórico real de pagamentos (transações)
    const paymentTxHistory: PaymentHistoryRow[] = payments.map((p: any) => ({
      id: p.id,
      monthReference: p.month_reference,
      amount: toMoney(p.amount_paid),
      status: p.status === "partial" ? "partial" : "paid",
      paidDate: p.paid_date,
      dueDate: `${p.month_reference}-10`, // fallback (o plano tem o real)
      receiptNumber: p.receipt_number ?? null,
      description: p.observacoes ?? null,
    }));

    // merge: podes preferir mostrar "plano" como principal e "pagamentos" como lista separada.
    // Aqui deixo paymentHistory como PLANO (obrigação), e podes mostrar transações em outro tab.
    return {
      studentId: params.student_id,
      studentName,
      className,
      monthlyFee,

      totalPaid,
      totalDue: totalDueWithPenalty,
      currentBalance,

      overduePayments,
      advancePayments,
      paymentHistory: planHistory,
    };
  },
};

export default studentFinanceService;

export type { PaymentMethod, PaymentStatus };
export type { StudentPaymentInfo };
