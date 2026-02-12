// src/services/financeService.ts
// Serviço unificado para operações financeiras

import {
  StudentFinanceResponse,
  RecordPaymentPayload,
  RecordPaymentResponse,
  PaymentPlanItem,
  PaymentTransaction
} from '@/types/finance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
  'Content-Type': 'application/json'
});

class FinanceService {
  // Buscar dados financeiros completos do estudante
  async getStudentFinance(studentId: number): Promise<StudentFinanceResponse> {
    const response = await fetch(`${API_URL}/student-finance.php?student_id=${studentId}`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erro ao carregar dados financeiros');
    }

    return data;
  }

  // Registrar pagamento
  async recordPayment(payload: RecordPaymentPayload): Promise<RecordPaymentResponse> {
    const response = await fetch(`${API_URL}/student-payments/create.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        student_id: payload.student_id,
        curso_id: payload.curso_id,
        amount_paid: payload.amount_paid,
        payment_type_id: this.getPaymentTypeId(payload.payment_method),
        paid_date: payload.paid_date,
        month_reference: payload.month_reference,
        observacoes: payload.observacoes
      })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erro ao registrar pagamento');
    }

    return data;
  }

  // Estornar pagamento
  async reversePayment(paymentId: number, reason?: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_URL}/student-payments/reverse.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ payment_id: paymentId, reason })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erro ao estornar pagamento');
    }

    return data;
  }

  // Gerar planos de pagamento para uma matrícula
  async generatePaymentPlans(registrationId: number): Promise<{ success: boolean; created: number }> {
    const response = await fetch(`${API_URL}/student-payment-plans/generate.php`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ registration_id: registrationId })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erro ao gerar planos de pagamento');
    }

    return data;
  }

  // Gerar planos para todas as matrículas
  async generateAllPaymentPlans(): Promise<{ success: boolean; created: number; errors: any[] }> {
    const response = await fetch(`${API_URL}/student-payment-plans/generate-all.php`, {
      method: 'POST',
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erro ao gerar planos');
    }

    return data;
  }

  // Buscar todos os planos (para dashboard)
  async getAllPlans(): Promise<PaymentPlanItem[]> {
    const response = await fetch(`${API_URL}/student-payment-plans/index.php`, {
      headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || 'Erro ao carregar planos');
    }

    return data.data || [];
  }

  // Helper para converter método de pagamento para ID
  private getPaymentTypeId(method: string): number {
    const map: Record<string, number> = {
      'cash': 1,
      'mpesa': 2,
      'transfer': 3,
      'card': 4,
      'other': 5
    };
    return map[method] || 1;
  }
}

export const financeService = new FinanceService();
export default financeService;
