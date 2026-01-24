// src/services/PaymentService.ts
import api from "./api";

export type StudentPaymentStatus = "paid" | "partial" | "reversed";

export interface StudentPayment {
  id: number;
  student_id: number;
  curso_id: string;
  month_reference: string; // YYYY-MM
  amount_paid: number;
  payment_type_id: number;
  status: StudentPaymentStatus;
  paid_date: string; // YYYY-MM-DD
  receipt_number: string | null;
  observacoes: string | null;
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface CreateStudentPaymentPayload {
  // podes mandar OU registration_id, OU student_id + curso_id
  registration_id?: number;

  student_id?: number;
  curso_id?: string;

  // mensalidade: envia month_reference
  month_reference?: string; // YYYY-MM

  amount_paid: number;
  payment_type_id: number;

  paid_date?: string; // YYYY-MM-DD
  receipt_number?: string | null;
  observacoes?: string | null;

  // flags do teu create.php
  is_enrollment_fee?: boolean;      // matrícula (apenas 1x)
  monthly_plan_apply?: boolean;     // força update do plano
}

export interface CreatePaymentResponse {
  success: boolean;
  message?: string;
  payment_id?: number;

  student_id?: number;
  curso_id?: string;
  month_reference?: string;
  status?: "paid" | "partial";

  error?: string;
}

export interface ListPaymentsResponse {
  success: boolean;
  total?: number;
  data: StudentPayment[];
  message?: string;
  error?: string;
}

type ListParams = {
  student_id?: number;
  curso_id?: string;
  month_reference?: string; // YYYY-MM
  registration_id?: number;
  status?: StudentPaymentStatus;
};

const PaymentService = {
  // LISTAR pagamentos
  async list(params?: ListParams): Promise<StudentPayment[]> {
    const res = await api.get<ListPaymentsResponse>("/student-payments/index.php", {
      params,
    });

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to fetch payments");
    }

    return res.data.data || [];
  },

  // CRIAR pagamento (mensalidade ou matrícula)
  async create(payload: CreateStudentPaymentPayload): Promise<CreatePaymentResponse> {
    const res = await api.post<CreatePaymentResponse>("/student-payments/create.php", payload);

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to create payment");
    }

    return res.data;
  },

  // ATUALIZAR status do pagamento (ex: reversed)
  async updateStatus(paymentId: number, status: StudentPaymentStatus): Promise<{ success: boolean; message?: string }> {
    const res = await api.post<{ success: boolean; message?: string; error?: string }>(
      "/student-payments/update-status.php",
      { id: paymentId, status }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to update payment status");
    }

    return res.data;
  },

  // DELETE (se o teu delete.php usa soft delete ou remove)
  async delete(paymentId: number): Promise<{ success: boolean; message?: string }> {
    const res = await api.post<{ success: boolean; message?: string; error?: string }>(
      "/student-payments/delete.php",
      { id: paymentId }
    );

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Failed to delete payment");
    }

    return res.data;
  },
};

export default PaymentService;
