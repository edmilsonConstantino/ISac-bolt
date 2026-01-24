// src/services/paymentPlanService.ts
import api from "./api"; // usa o mesmo axios instance que você já usa nos outros services

export type PaymentPlanStatus = "pending" | "paid" | "overdue" | "partial";

export interface StudentPaymentPlanRow {
  id: number;
  student_id: number;
  student_name: string;
  curso_id: string;
  course_name: string;
  month_reference: string; // YYYY-MM
  due_date: string;        // YYYY-MM-DD
  amount_due: number;

  status: PaymentPlanStatus;          // status salvo na BD
  computed_status: PaymentPlanStatus; // status calculado pela API

  payment_id: number | null;
  observacoes: string | null;

  // calculados
  total_paid: number;
  base_remaining: number;
  penalty: number;
  total_due_with_penalty: number;
  days_overdue: number;
  today: string; // YYYY-MM-DD
}

export interface PaymentPlanListResponse {
  success: boolean;
  total: number;
  data: StudentPaymentPlanRow[];
  message?: string;
  error?: string;
}

type ListParams = {
  student_id: number;
  curso_id: string;
  status?: PaymentPlanStatus;
  month_reference?: string; // YYYY-MM
  registration_id?: number;
};

const paymentPlanService = {
  async list(params: ListParams): Promise<StudentPaymentPlanRow[]> {
    const res = await api.get<PaymentPlanListResponse>(
      "/api/student-payment-plans/index.php",
      { params }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch payment plans");
    }

    return res.data.data || [];
  },
};

export default paymentPlanService;
