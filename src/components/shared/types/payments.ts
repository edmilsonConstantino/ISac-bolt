// src/types/payments.ts

export type PaymentStatus = "paid" | "partial" | "reversed";

export type PlanStatus = "pending" | "paid" | "overdue" | "partial";

export type PaymentMethod =
  | "cash"
  | "transfer"
  | "card"
  | "mpesa"
  | "other";

export interface PaymentType {
  id: number;
  name: string;
  description?: string | null;
  is_active: 0 | 1;
  created_at?: string;
  updated_at?: string;
}

export interface StudentPayment {
  id: number;
  student_id: number;
  curso_id: string;

  // YYYY-MM
  month_reference: string;

  amount_paid: number;
  payment_type_id: number;

  status: PaymentStatus;
  paid_date: string; // YYYY-MM-DD

  receipt_number?: string | null;
  observacoes?: string | null;

  data_criacao?: string;
  data_atualizacao?: string;
}

export interface StudentPaymentPlan {
  id: number;
  student_id: number;
  curso_id: string;

  // YYYY-MM
  month_reference: string;

  due_date: string; // YYYY-MM-DD
  amount_due: number;

  status: PlanStatus;

  payment_id?: number | null;
  observacoes?: string | null;

  data_criacao?: string;
  data_atualizacao?: string;
}

export interface StudentPaymentInfo {
  studentId: number;
  studentName: string;
  className: string;

  // valores base
  monthlyFee: number;

  // resumo (calculado no backend ou frontend)
  totalPaid: number;
  totalDue: number;
  currentBalance: number;

  paymentHistory: StudentPayment[];
  overduePayments: StudentPaymentPlan[];
  advancePayments: StudentPayment[]; // opcional (se fores usar)
}
