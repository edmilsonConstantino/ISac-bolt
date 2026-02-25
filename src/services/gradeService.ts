import apiClient from './api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StudentGrade {
  id?: number;
  class_id: number;
  student_id: number;
  period_number: number;

  // Grade inputs (0-10 each)
  grade_teste1?: number | null;         // Teste 1 — 20%
  grade_teste2?: number | null;         // Teste 2 — 20%
  grade_exame_pratico?: number | null;  // Exame Prático — 30%
  grade_exame_teorico?: number | null;  // Exame Teórico — 30%

  // Calculated by backend (integer after half-up rounding)
  final_grade?: number | null;
  attendance?: number | null;

  // passed: raw >= 9.5 | failed: raw < 9.5
  status?: 'passed' | 'failed' | null;
  notes?: string | null;
  strengths?: string | null;
  improvements?: string | null;
  recommendations?: string | null;
  submitted_by?: number | null;

  // Joined fields
  student_name?: string;
  student_email?: string;
  class_name?: string;
  submitted_by_name?: string;

  created_at?: string;
  updated_at?: string;
}

export interface FinalizeResult {
  success: boolean;
  final_grade: number;
  avg_raw: number;
  attendance: number | null;
  level_status: 'awaiting_renewal' | 'failed';
  periods_used: number;
  message: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class GradeService {
  /**
   * Get all grades for a class (optionally filtered by period)
   */
  async getByClass(classId: number, period?: number): Promise<StudentGrade[]> {
    try {
      const params = new URLSearchParams({ class_id: String(classId) });
      if (period !== undefined) params.set('period', String(period));
      const response = await apiClient.get(`/api/grades.php?${params}`);
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error('Error fetching class grades:', error);
      return [];
    }
  }

  /**
   * Get all grades of a student in a specific class
   */
  async getByStudent(classId: number, studentId: number): Promise<StudentGrade[]> {
    try {
      const response = await apiClient.get(
        `/api/grades.php?class_id=${classId}&student_id=${studentId}`
      );
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error('Error fetching student grades:', error);
      return [];
    }
  }

  /**
   * Get all grades of a student across all classes
   */
  async getAllByStudent(studentId: number): Promise<StudentGrade[]> {
    try {
      const response = await apiClient.get(`/api/grades.php?student_id=${studentId}`);
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error('Error fetching all student grades:', error);
      return [];
    }
  }

  /**
   * Save or update grades for a student in a period (UPSERT)
   */
  async save(data: Partial<StudentGrade>): Promise<StudentGrade> {
    try {
      const response = await apiClient.post('/api/grades.php', data);
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error saving grades');
      }
      return response.data.data;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error saving grades';
      throw new Error(msg);
    }
  }

  /**
   * Finalize the level for a student in a class.
   * Calculates final_grade from all periods, updates student_level_progress.
   * Level transition requires average raw >= 9.8.
   */
  async finalizeLevel(classId: number, studentId: number): Promise<FinalizeResult> {
    try {
      const response = await apiClient.post('/api/grades.php?action=finalize_level', {
        class_id: classId,
        student_id: studentId,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error finalizing level');
      }
      return response.data as FinalizeResult;
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Error finalizing level';
      throw new Error(msg);
    }
  }

  /**
   * Helper: Get status label (PT)
   */
  getStatusLabel(status: StudentGrade['status']): string {
    const map: Record<string, string> = {
      passed: 'Aprovado',
      failed: 'Reprovado',
    };
    return status ? (map[status] ?? status) : '—';
  }

  /**
   * Helper: Get status color class (Tailwind)
   */
  getStatusColor(status: StudentGrade['status']): string {
    const map: Record<string, string> = {
      passed: 'text-emerald-600',
      failed: 'text-red-600',
    };
    return status ? (map[status] ?? 'text-slate-500') : 'text-slate-400';
  }

  /**
   * Helper: Get status badge classes (Tailwind)
   */
  getStatusBadge(status: StudentGrade['status']): string {
    const map: Record<string, string> = {
      passed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      failed: 'bg-red-100 text-red-700 border border-red-200',
    };
    return status ? (map[status] ?? 'bg-slate-100 text-slate-600 border border-slate-200') : '';
  }
}

export default new GradeService();
