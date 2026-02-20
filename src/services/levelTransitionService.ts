import apiClient from './api';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const e = error as Record<string, unknown>;
    const msg =
      (e['response'] as Record<string, unknown> | undefined)?.['data']
        ? ((e['response'] as Record<string, unknown>)['data'] as Record<string, unknown>)?.['message']
        : e['message'];
    if (typeof msg === 'string' && msg) return msg;
  }
  return fallback;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type LevelProgressStatus =
  | 'in_progress'
  | 'awaiting_transition'
  | 'awaiting_renewal'
  | 'recovery'
  | 'passed'
  | 'failed'
  | 'withdrawn';

export interface StudentLevelProgress {
  id: number;
  student_id: number;
  level_id: number;
  class_id: number | null;
  attempt: number;
  status: LevelProgressStatus;
  final_grade: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;

  // Joined from API
  student_name?: string;
  student_email?: string;
  student_username?: string;
  level_name?: string;
  level_number?: number;
  level_order?: number;
  course_id?: number;
  course_name?: string;
  course_code?: string;
  class_name?: string;
  next_level_id?: number | null;
  next_level_name?: string | null;
  next_level_number?: number | null;

  // Pending renewal registration (null = not yet renewed)
  pending_registration_id?: number | null;
  pending_enrollment_number?: string | null;
  pending_period?: string | null;
}

export interface NextLevelClass {
  id: number;
  nome: string;
  nivel: number;
  class_id: number;
  class_name: string;
  turno: string;
  vagas_ocupadas: number;
  capacidade_maxima: number;
}

export interface TransitionsResponse {
  success: boolean;
  data: StudentLevelProgress[];
  total: number;
  next_level_classes: NextLevelClass[];
}

export interface RenovarResult {
  success: boolean;
  message: string;
  enrollment_number?: string;
  registration_id?: number;
  next_level_id?: number;
  next_level_name?: string;
  already_exists?: boolean;
}

// ─── Service ──────────────────────────────────────────────────────────────────

class LevelTransitionService {
  /**
   * Get students awaiting renewal/recovery at a specific level.
   * Default filter: awaiting_renewal + recovery.
   */
  async getAwaiting(levelId: number, status?: LevelProgressStatus): Promise<TransitionsResponse> {
    try {
      const params = new URLSearchParams({ level_id: String(levelId) });
      if (status) params.set('status', status);
      const response = await apiClient.get(`/api/level-transitions.php?${params}`);
      return response.data;
    } catch (error: unknown) {
      console.error('Error fetching awaiting transitions:', error);
      return { success: false, data: [], total: 0, next_level_classes: [] };
    }
  }

  /**
   * Get full progress history of a student (all levels, all attempts).
   */
  async getStudentHistory(studentId: number): Promise<StudentLevelProgress[]> {
    try {
      const response = await apiClient.get(`/api/level-transitions.php?student_id=${studentId}`);
      return response.data?.data ?? [];
    } catch (error: unknown) {
      console.error('Error fetching student level history:', error);
      return [];
    }
  }

  /**
   * Start tracking a student's progress at a level (when they join a class).
   */
  async start(studentId: number, levelId: number, classId?: number): Promise<void> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=start', {
        student_id: studentId,
        level_id: levelId,
        class_id: classId ?? null,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error starting level progress');
      }
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error starting level'));
    }
  }

  /**
   * Step 1 of level renewal: creates a PENDING registration for the next level.
   * The student must have status='awaiting_renewal' for the given level.
   * No student_level_progress is created yet — only a pending registration.
   */
  async renovar(
    studentId: number,
    levelId: number,
    options?: {
      period?: string;
      enrollment_fee?: number;
      monthly_fee?: number;
    }
  ): Promise<RenovarResult> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=renovar', {
        student_id:     studentId,
        level_id:       levelId,
        period:         options?.period,
        enrollment_fee: options?.enrollment_fee ?? 0,
        monthly_fee:    options?.monthly_fee ?? 0,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error creating renewal');
      }
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error creating renewal'));
    }
  }

  /**
   * Step 2 of level renewal: activates the pending registration and places the
   * student in the destination class. Creates student_level_progress for next level.
   */
  async confirmarRenovacao(
    registrationId: number,
    turmaDestinoId: number,
    options?: { payment_status?: 'paid' | 'pending' }
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=confirmar_renovacao', {
        registration_id:  registrationId,
        turma_destino_id: turmaDestinoId,
        payment_status:   options?.payment_status ?? 'pending',
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error confirming renewal');
      }
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error confirming renewal'));
    }
  }

  /**
   * Direct promote (skips renewal step) — for recovery cases where admin decides
   * the student can advance without going through the full renewal flow.
   */
  async promote(studentId: number, levelId: number, destClassId?: number): Promise<{ message: string; next_level?: string; course_completed?: boolean }> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=promote', {
        student_id:    studentId,
        level_id:      levelId,
        dest_class_id: destClassId ?? null,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error promoting student');
      }
      return response.data;
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error promoting student'));
    }
  }

  /**
   * Mark a student as failed (close current attempt).
   */
  async fail(studentId: number, levelId: number): Promise<void> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=fail', {
        student_id: studentId,
        level_id: levelId,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error marking as failed');
      }
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error'));
    }
  }

  /**
   * Enroll student to repeat the level (creates attempt + 1).
   */
  async repeat(studentId: number, levelId: number, classId?: number): Promise<{ attempt: number }> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=repeat', {
        student_id: studentId,
        level_id: levelId,
        class_id: classId ?? null,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error repeating level');
      }
      return { attempt: response.data.attempt };
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error'));
    }
  }

  /**
   * Mark student as withdrawn from the level.
   */
  async withdraw(studentId: number, levelId: number): Promise<void> {
    try {
      const response = await apiClient.post('/api/level-transitions.php?action=withdraw', {
        student_id: studentId,
        level_id: levelId,
      });
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Error marking withdrawal');
      }
    } catch (error: unknown) {
      throw new Error(extractMessage(error, 'Error'));
    }
  }

  // ─── Status helpers ──────────────────────────────────────────────────────

  getStatusLabel(status: LevelProgressStatus): string {
    const map: Record<LevelProgressStatus, string> = {
      in_progress:         'In Progress',
      awaiting_transition: 'Awaiting Promotion',
      awaiting_renewal:    'Awaiting Renewal',
      recovery:            'Recovery',
      passed:              'Passed',
      failed:              'Failed',
      withdrawn:           'Withdrawn',
    };
    return map[status] ?? status;
  }

  getStatusBadge(status: LevelProgressStatus): string {
    const map: Record<LevelProgressStatus, string> = {
      in_progress:         'bg-blue-100 text-blue-700 border border-blue-200',
      awaiting_transition: 'bg-amber-100 text-amber-700 border border-amber-200',
      awaiting_renewal:    'bg-emerald-100 text-emerald-700 border border-emerald-200',
      recovery:            'bg-orange-100 text-orange-700 border border-orange-200',
      passed:              'bg-emerald-100 text-emerald-700 border border-emerald-200',
      failed:              'bg-red-100 text-red-700 border border-red-200',
      withdrawn:           'bg-slate-100 text-slate-600 border border-slate-200',
    };
    return map[status] ?? 'bg-slate-100 text-slate-600 border border-slate-200';
  }
}

export default new LevelTransitionService();
