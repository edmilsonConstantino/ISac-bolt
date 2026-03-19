import apiClient from './api';

export interface StudentGrade {
  id?: number;
  class_id: number;
  student_id: number;
  period_number: number;


  grade_teste1?: number | null;      
  grade_teste2?: number | null;     
  grade_exame_pratico?: number | null;  
  grade_exame_teorico?: number | null;


  final_grade?: number | null;
  attendance?: number | null;

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

  async getAllByStudent(studentId: number): Promise<StudentGrade[]> {
    try {
      const response = await apiClient.get(`/api/grades.php?student_id=${studentId}`);
      return response.data?.data ?? [];
    } catch (error: any) {
      console.error('Error fetching all student grades:', error);
      return [];
    }
  }


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

  getStatusLabel(status: StudentGrade['status']): string {
    const map: Record<string, string> = {
      passed: 'Aprovado',
      failed: 'Reprovado',
    };
    return status ? (map[status] ?? status) : '—';
  }


  getStatusColor(status: StudentGrade['status']): string {
    const map: Record<string, string> = {
      passed: 'text-emerald-600',
      failed: 'text-red-600',
    };
    return status ? (map[status] ?? 'text-slate-500') : 'text-slate-400';
  }


  getStatusBadge(status: StudentGrade['status']): string {
    const map: Record<string, string> = {
      passed: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      failed: 'bg-red-100 text-red-700 border border-red-200',
    };
    return status ? (map[status] ?? 'bg-slate-100 text-slate-600 border border-slate-200') : '';
  }
}

export default new GradeService();
