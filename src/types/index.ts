// src/types/index.ts
// ============================
// ARQUIVO CENTRAL DE TIPOS
// ============================
// Este arquivo centraliza todas as interfaces e tipos TypeScript
// para serem importados em qualquer lugar do projeto

// ============================
// TIPOS DE USUÁRIO
// ============================
export type UserRole = 'teacher' | 'admin' | 'student';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  lastLogin?: string;
}

// ============================
// TIPOS DE TURMA
// ============================
export interface Class {
  id: number;
  name: string;
  code?: string;
  curso?: string;           // ID do curso (ex: 'INF', 'CONT')
  schedule: string;         // turno: 'manha' | 'tarde' | 'noite'
  schedule_days?: string;   // dias da semana
  students: number;
  capacity?: number;
  teacher?: string;
  teacher_id?: number;
  teacherId?: number;
  status: 'active' | 'inactive' | 'completed';
  description?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
  startDate?: string;
  endDate?: string;
  room?: string;
  level?: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  createdAt?: string;
  updatedAt?: string;
  selectedStudentIds?: number[]; // IDs dos estudantes a adicionar (criação)
}

// ============================
// TIPOS DE ESTUDANTE
// ============================
export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  classId: number;
  className: string;
  courseId?: string;   // código do curso (curso_id)
  grade: number;
  status: 'active' | 'inactive' | 'graduated' | 'dropped';
  attendance?: number;
  enrollmentDate?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  avatar?: string;
}

// ============================
// TIPOS DE TRABALHOS/ATIVIDADES
// ============================
export type AssignmentType = 'essay' | 'exercise' | 'presentation' | 'exam' | 'project' | 'quiz';

export interface Assignment {
  id: number;
  title: string;
  description?: string;
  type: AssignmentType;
  class: string;
  classId: number;
  dueDate: string;
  submissions: number;
  total: number;
  maxScore?: number;
  instructions?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
  authorId: number;
}

// ============================
// TIPOS DE AVISOS
// ============================
export type AnnouncementPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: AnnouncementPriority;
  classId?: number; // Se for null, é um aviso geral
  authorId: number;
  targetAudience: 'students' | 'teachers' | 'all';
  isActive: boolean;
  expiresAt?: string;
  attachments?: string[];
}

// ============================
// TIPOS DE PERMISSÕES
// ============================
export interface Permission {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canViewDetails: boolean;
  canManageUsers?: boolean;
  canViewReports?: boolean;
  canExportData?: boolean;
  canSendEmails?: boolean;
  canManageGrades?: boolean;
}

// ============================
// TIPOS DE ESTATÍSTICAS
// ============================
export interface DashboardStats {
  totalClasses: number;
  totalStudents: number;
  pendingAssignments: number;
  nextClass?: string;
  averageGrade?: number;
  attendanceRate?: number;
}

export interface AdminStats extends DashboardStats {
  totalTeachers: number;
  inactiveStudents: number;
  completedClasses: number;
  monthlyEnrollments: number;
}

// ============================
// TIPOS DE MATERIAIS
// ============================
export type MaterialType = 'pdf' | 'video' | 'audio' | 'image' | 'document' | 'link';

export interface Material {
  id: number;
  title: string;
  description?: string;
  type: MaterialType;
  url: string;
  filename?: string;
  size?: number;
  classId?: number; // Se for null, é material geral
  uploadedBy: number;
  uploadedAt: string;
  isPublic: boolean;
  downloadCount: number;
  tags?: string[];
}

// ============================
// TIPOS DE CALENDÁRIO
// ============================
export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  classId?: number;
  type: 'class' | 'exam' | 'holiday' | 'meeting' | 'event';
  location?: string;
  attendees?: number[];
  isRecurring: boolean;
  recurrenceRule?: string;
}

// ============================
// TIPOS DE FORMULÁRIOS/MODAIS
// ============================
export interface ModalState<T = any> {
  isOpen: boolean;
  data?: T;
  isCreating?: boolean;
  mode?: 'view' | 'edit' | 'create';
}

export interface FormValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

// ============================
// TIPOS DE API/DADOS
// ============================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedData<T = any> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// ============================
// TIPOS DE FILTROS
// ============================
export interface StudentFilter {
  status?: Student['status'];
  classId?: number;
  gradeMin?: number;
  gradeMax?: number;
  attendanceMin?: number;
  search?: string;
}

export interface ClassFilter {
  status?: Class['status'];
  teacherId?: number;
  level?: Class['level'];
  search?: string;
}

// ============================
// TIPOS DE CONFIGURAÇÕES
// ============================
export interface AppSettings {
  schoolName: string;
  schoolLogo?: string;
  academicYear: string;
  semester: 'first' | 'second';
  gradeScale: {
    min: number;
    max: number;
    passingGrade: number;
  };
  attendanceRequirement: number; // Porcentagem mínima
  emailNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
}


// UNION TYPES puTEIS

export type EntityStatus = 'active' | 'inactive';
export type SortDirection = 'asc' | 'desc';
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// TIPOS DE CONTEXTO/ESTADO GLOBAL

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: Permission;
}

export interface AppState {
  currentUser: User | null;
  selectedClass: Class | null;
  notifications: Announcement[];
  settings: AppSettings;
  theme: 'light' | 'dark' | 'system';
}


// TIPOS DE PAGAMENTO

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'advance' | 'awaiting_confirmation' | 'cancelled';
export type PaymentMethod = 'cash' | 'transfer' | 'card' | 'mpesa' | 'other';

export interface Payment {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  method?: PaymentMethod;
  status: PaymentStatus;
  monthReference: string; // Ex: "2024-02", "2024-03"
  description?: string;
  receiptNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentPaymentInfo {
  studentId: number;
  studentName: string;
  className: string;
  monthlyFee: number;
  currentBalance: number; // Saldo atual (negativo = dívida, positivo = crédito)
  totalPaid: number;
  totalDue: number;
  lastPaymentDate?: string;
  paymentHistory: Payment[];
  overduePayments: Payment[];
  advancePayments: Payment[];
}

export interface PaymentSummary {
  totalRevenue: number;
  totalPending: number;
  totalOverdue: number;
  totalAdvance: number;
  studentsInDebt: number;
  studentsWithAdvance: number;
  averageMonthlyRevenue: number;
  collectionRate: number; // Percentual de cobrança
}

// ============================
// EXTENSÃO DO TIPO STUDENT
// ============================
export interface StudentWithPayments extends Student {
  monthlyFee: number;
  currentBalance: number;
  lastPaymentDate?: string;
  paymentStatus: PaymentStatus;
  overdueMonths: number;
  advanceMonths: number;
}