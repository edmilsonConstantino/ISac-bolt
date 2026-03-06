// src/types/finance.ts
// Tipos unificados para o sistema financeiro

export type PaymentStatus = 'pending' | 'overdue' | 'partial' | 'paid' | 'exempt';
export type PaymentMethod = 'cash' | 'mpesa' | 'transfer' | 'card' | 'other';
export type TransactionStatus = 'paid' | 'confirmed' | 'reversed' | 'void';

// Parcela/Plano de pagamento (o que o estudante DEVE pagar)
export interface PaymentPlanItem {
  id: number;
  student_id: number;
  curso_id: string;
  month_reference: string; // YYYY-MM
  due_date: string; // YYYY-MM-DD
  base_amount: number; // mensalidade base
  discount_amount: number;
  penalty_amount: number; // calculado pelo backend
  total_expected: number; // base - discount + penalty
  paid_total: number; // quanto já foi pago
  remaining: number; // total_expected - paid_total
  status: PaymentStatus;
  days_overdue: number;
}

// Transação de pagamento (o que o estudante PAGOU)
export interface PaymentTransaction {
  id: number;
  student_id: number;
  curso_id: string;
  month_reference: string; // YYYY-MM
  amount_paid: number;
  payment_method: PaymentMethod;
  payment_type_name?: string;
  paid_date: string;
  receipt_number: string | null;
  observacoes: string | null;
  status: TransactionStatus;
  is_advance?: boolean; // true se é crédito/adiantamento
  created_at: string;
  allocations?: PaymentAllocation[];
}

// Alocação (liga pagamento à parcela)
export interface PaymentAllocation {
  id: number;
  payment_id: number;
  plan_id: number;
  month_reference: string;
  amount_allocated: number;
}

// Resposta da API de finanças do estudante
export interface StudentFinanceResponse {
  success: boolean;
  student: {
    id: number;
    name: string;
    email: string;
    is_bolsista?: boolean;
  };
  course: {
    id: string;
    name: string;
    monthly_fee: number;
    duration_months: number;
  } | null;
  class: {
    id: number;
    name: string;
    status: string;
    start_date: string | null;
  } | null;
  summary: {
    total_expected: number;
    total_paid: number;
    total_pending: number;
    total_overdue: number;
    total_penalties: number;
    overdue_count: number;
    wallet_balance: number; // crédito disponível
    class_started: boolean;
  };
  plans: PaymentPlanItem[];
  recent_payments: PaymentTransaction[];
  penalty_config?: PenaltyConfig;
}

// Configuração de multas retornada pela API
export interface PenaltyConfig {
  enabled: boolean;
  step1_day: number;
  step1_percent: number;
  step2_day: number;
  step2_percent: number;
}

// Alias para compatibilidade
export type PenaltySettings = PenaltyConfig;

// Payload para registrar pagamento (FIFO automático no backend)
export interface RecordPaymentPayload {
  student_id: number;
  curso_id: string;
  amount_paid: number;
  payment_method: PaymentMethod;
  paid_date: string;
  receipt_number?: string;
  observacoes?: string;
  is_enrollment_fee?: boolean;
}

// Resposta ao registrar pagamento (nova API FIFO)
export interface RecordPaymentResponse {
  success: boolean;
  payment_id: number;
  student_id: number;
  curso_id: string;
  amount_paid: number;
  allocated_plans: {
    plan_id: number;
    due_date: string;
    amount_due: number;
    already_paid: number;
    allocated_now: number;
    plan_status: PaymentStatus;
  }[];
  plans_covered: number;
  plans_fully_paid: number;
  wallet_contribution: number;
  message?: string;
}

// Labels para UI
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Numerário',
  mpesa: 'M-Pesa',
  transfer: 'Transferência',
  card: 'Cartão',
  other: 'Outro'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendente',
  overdue: 'Em Atraso',
  partial: 'Parcial',
  paid: 'Pago',
  exempt: 'Isento'
};

// Helpers
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(amount);
};

export const formatMonthReference = (monthRef: string): string => {
  if (!monthRef) return '-';
  const [year, month] = monthRef.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]} ${year}`;
};
