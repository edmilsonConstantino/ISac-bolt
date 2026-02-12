import { useState, useEffect, useCallback } from 'react';
import paymentService from '../services/paymentService';

interface Student {
  id: string;
  name: string;
  email: string;
}

interface PaymentPlan {
  id: string;
  studentId: string;
  planName: string;
  totalAmount: number;
  installments: number;
  status: string;
  createdAt: string;
}

export const usePayments = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [paymentPlans, setPaymentPlans] = useState<PaymentPlan[]>([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Carregar estudantes
  const fetchStudents = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const data = await paymentService.getStudentsForPayment(filters);
      setStudents(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar estudantes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar planos de um estudante
  const fetchPaymentPlans = useCallback(async (studentId: string) => {
    setLoading(true);
    try {
      const data = await paymentService.getPaymentPlans(studentId);
      setPaymentPlans(data);
      setSelectedStudentId(studentId);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar planos de pagamento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Gerar novo plano
  const generatePlan = useCallback(async (studentId: string, planData: any) => {
    setLoading(true);
    try {
      const newPlan = await paymentService.generatePaymentPlan(studentId, planData);
      setPaymentPlans([...paymentPlans, newPlan]);
      setError(null);
      return newPlan;
    } catch (err) {
      setError('Erro ao gerar plano de pagamento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [paymentPlans]);

  // Carregar todos os pagamentos
  const fetchAllPayments = useCallback(async (filters?: any) => {
    setLoading(true);
    try {
      const data = await paymentService.getAllPayments(filters);
      setPayments(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar pagamentos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchAllPayments();
  }, [fetchStudents, fetchAllPayments]);

  return {
    students,
    paymentPlans,
    payments,
    loading,
    error,
    selectedStudentId,
    fetchStudents,
    fetchPaymentPlans,
    generatePlan,
    fetchAllPayments,
  };
};
