// src/hooks/usePaymentPlans.ts
import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

// Helper para obter token do localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token') || '';
};

// Interfaces para os dados da API
export interface PaymentPlan {
  id: number;
  student_id: number;
  student_name: string;
  curso_id: string;
  course_name: string;
  month_reference: string;
  due_date: string;
  amount_due: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  computed_status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_id: number | null;
  observacoes: string | null;
  data_criacao: string;
  data_atualizacao: string;
  // Campos calculados
  total_paid: number;
  base_remaining: number;
  penalty: number;
  total_due_with_penalty: number;
  days_overdue: number;
}

export interface PaymentRecord {
  id: number;
  student_id: number;
  curso_id: string;
  month_reference: string;
  amount_paid: number;
  payment_type_id: number;
  status: 'paid' | 'partial' | 'reversed';
  paid_date: string;
  receipt_number: string | null;
  observacoes: string | null;
}

export interface CourseFee {
  id: number | null;
  curso_id: string;
  curso_nome: string;
  curso_sigla: string;
  matricula_valor: number;
  mensalidade_valor: number;
  meses_total: number;
  ativo: boolean;
  configured: boolean;
}

export interface PaymentSummary {
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  totalPenalties: number;
  countPending: number;
  countPaid: number;
  countOverdue: number;
}

interface UsePaymentPlansOptions {
  studentId?: number;
  cursoId?: string;
  status?: 'pending' | 'paid' | 'overdue' | 'partial';
  registrationId?: number;
  autoFetch?: boolean;
}

export const usePaymentPlans = (options: UsePaymentPlansOptions = {}) => {
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [courseFees, setCourseFees] = useState<CourseFee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { studentId, cursoId, status, registrationId, autoFetch = true } = options;

  // Fetch payment plans
  const fetchPlans = useCallback(async (filters?: {
    studentId?: number;
    cursoId?: string;
    status?: string;
    registrationId?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const f = filters || { studentId, cursoId, status, registrationId };

      if (f.studentId) params.append('student_id', f.studentId.toString());
      if (f.cursoId) params.append('curso_id', f.cursoId);
      if (f.status) params.append('status', f.status);
      if (f.registrationId) params.append('registration_id', f.registrationId.toString());

      const url = `${API_URL}/student-payment-plans/index.php${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPlans(data.data || []);
        return data.data || [];
      } else {
        throw new Error(data.message || 'Erro ao carregar planos de pagamento');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar planos de pagamento';
      setError(message);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [studentId, cursoId, status, registrationId]);

  // Fetch payments (transactions)
  const fetchPayments = useCallback(async (filters?: {
    studentId?: number;
    cursoId?: string;
    monthReference?: string;
  }) => {
    try {
      const params = new URLSearchParams();
      if (filters?.studentId) params.append('student_id', filters.studentId.toString());
      if (filters?.cursoId) params.append('curso_id', filters.cursoId);
      if (filters?.monthReference) params.append('month_reference', filters.monthReference);

      const url = `${API_URL}/student-payments/index.php${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setPayments(data.data || []);
        return data.data || [];
      } else {
        throw new Error(data.message || 'Erro ao carregar pagamentos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos');
      return [];
    }
  }, []);

  // Fetch course fees
  const fetchCourseFees = useCallback(async (cursoId?: string) => {
    try {
      const url = cursoId
        ? `${API_URL}/course-fees.php?curso_id=${cursoId}`
        : `${API_URL}/course-fees.php`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        if (cursoId) {
          return data.data;
        }
        setCourseFees(data.data || []);
        return data.data || [];
      } else {
        throw new Error(data.message || 'Erro ao carregar taxas');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar taxas dos cursos');
      return [];
    }
  }, []);

  // Record a payment
  const recordPayment = useCallback(async (paymentData: {
    student_id: number;
    curso_id: string;
    month_reference: string;
    amount_paid: number;
    payment_type_id: number;
    paid_date?: string;
    observacoes?: string;
  }) => {
    try {
      const response = await fetch(`${API_URL}/student-payments/create.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...paymentData,
          paid_date: paymentData.paid_date || new Date().toISOString().split('T')[0]
        })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh plans after payment
        await fetchPlans();
        return { success: true, data };
      } else {
        throw new Error(data.message || 'Erro ao registar pagamento');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: message };
    }
  }, [fetchPlans]);

  // Generate payment plan for a registration
  const generatePlan = useCallback(async (registrationId: number) => {
    try {
      const response = await fetch(`${API_URL}/student-payment-plans/generate.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ registration_id: registrationId })
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data };
      } else {
        throw new Error(data.message || 'Erro ao gerar plano de pagamentos');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: message };
    }
  }, []);

  // Update course fees
  const updateCourseFees = useCallback(async (feeData: {
    curso_id: string;
    matricula_valor: number;
    mensalidade_valor: number;
    meses_total: number;
    ativo?: boolean;
  }) => {
    try {
      const response = await fetch(`${API_URL}/course-fees.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feeData)
      });

      const data = await response.json();

      if (data.success) {
        await fetchCourseFees();
        return { success: true, data };
      } else {
        throw new Error(data.message || 'Erro ao actualizar taxas');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      return { success: false, error: message };
    }
  }, [fetchCourseFees]);

  // Calculate summary from plans
  const getSummary = useCallback((): PaymentSummary => {
    const summary: PaymentSummary = {
      totalPending: 0,
      totalPaid: 0,
      totalOverdue: 0,
      totalPenalties: 0,
      countPending: 0,
      countPaid: 0,
      countOverdue: 0
    };

    plans.forEach(plan => {
      const computedStatus = plan.computed_status || plan.status;

      switch (computedStatus) {
        case 'paid':
          summary.totalPaid += plan.total_paid;
          summary.countPaid++;
          break;
        case 'pending':
          summary.totalPending += plan.base_remaining;
          summary.countPending++;
          break;
        case 'overdue':
          summary.totalOverdue += plan.base_remaining;
          summary.totalPenalties += plan.penalty;
          summary.countOverdue++;
          break;
        case 'partial':
          summary.totalPaid += plan.total_paid;
          summary.totalPending += plan.base_remaining;
          summary.countPending++;
          break;
      }
    });

    return summary;
  }, [plans]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch && getAuthToken()) {
      fetchPlans();
    }
  }, [autoFetch, fetchPlans]);

  return {
    // State
    plans,
    payments,
    courseFees,
    isLoading,
    error,

    // Actions
    fetchPlans,
    fetchPayments,
    fetchCourseFees,
    recordPayment,
    generatePlan,
    updateCourseFees,

    // Computed
    getSummary,

    // Refresh all data
    refresh: fetchPlans
  };
};

export default usePaymentPlans;
