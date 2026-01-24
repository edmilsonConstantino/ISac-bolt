// src/components/shared/registration-student-modal/types/registrationModal.types.ts

import { Registration } from "@/components/shared/RegistrationList";

import type { LucideIcon } from "lucide-react";
/** Tabs disponíveis no modal */
export type RegistrationTab = "student" | "course" | "payment" | "credentials";

/** Erros de formulário */
export type FormErrors = Record<string, string>;

/** Status (ajusta se o teu backend usa outros valores) */
export type RegistrationStatus = "active" | "suspended" | "cancelled" | "completed";
export type PaymentStatus = "paid" | "pending" | "overdue";




/** Estrutura mínima do estudante que o modal precisa */
export interface StudentItem {
  id: number;
  name: string;
  email: string;
  phone?: string | null;

  enrollment_number?: string | null;

  // credenciais (podem vir nulas/undefined)
  username?: string | null;
  password?: string | null;

  // legacy (se existir no teu retorno)
  curso?: string | null;

  // outros campos que podem aparecer
  [key: string]: unknown;
}

/** Estrutura mínima do curso que o modal precisa */
export interface CourseItem {
  codigo: string;
  nome: string;
  mensalidade?: number | null;
  taxa_matricula?: number | null;

  [key: string]: unknown;
}

/** Estrutura mínima da turma que o modal precisa */
export interface ClassItem {
  id: number;
  nome: string;
  codigo?: string | null;

  // no teu código original: classes.filter(c => c.curso === formData.courseId)
  curso: string;

  dias_semana?: string | null;

  [key: string]: unknown;
}

/**
 * FormData do modal (usa os campos que já existem no teu Registration)
 * Aqui a ideia é: manter compatível com o que já tens.
 */
export type RegistrationFormData = Partial<Registration>;

/** Payload que o modal manda no onSave */
export type RegistrationSavePayload = Partial<Registration> & {
  student_id: number;
  course_id: string;
  enrollment_number: string;
  period: string;
  enrollment_date: string;
  class_id?: number | null;

  // credenciais só entram quando for primeira matrícula
  username?: string;
  password?: string;
};

/** Props do modal pai */
export interface RegistrationStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData?: Registration | null;
  isEditing?: boolean;
  onSave: (registrationData: RegistrationSavePayload) => void;
  existingRegistrations?: Registration[];
}

/** Props base para cada Tab */
export interface BaseTabProps {
  formData: RegistrationFormData;
  formErrors: FormErrors;
  onChange: (field: string, value: unknown) => void;
}

/** StudentTab */
export interface StudentTabProps extends BaseTabProps {
  students: StudentItem[];
  selectedStudent?: StudentItem;
  studentSearch: string;
  setStudentSearch: (value: string) => void;
  isLoadingStudents: boolean;

  onSelectStudent: (student: StudentItem) => void;
  onClearStudent: () => void;

  /** lista já filtrada (pra manter StudentTab mais “burro”) */
  filteredStudents: StudentItem[];
}

/** CourseTab */
export interface CourseTabProps extends BaseTabProps {
  courses: CourseItem[];
  classes: ClassItem[];
  filteredClasses: ClassItem[];
  isLoadingCourses: boolean;

  onSelectCourse: (course: CourseItem) => void;
  onSelectClass: (classItem: ClassItem) => void;

  /** util */
  formatCurrency: (value: number) => string;

  /** para filtrar cursos (evitar matrícula duplicada) */
  existingRegistrations: Registration[];
}

/** PaymentTab */
export interface PaymentTabProps extends BaseTabProps {
  formatCurrency: (value: number) => string;
}

/** CredentialsTab */
export interface CredentialsTabProps extends BaseTabProps {
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;

  /** quando true, username/password devem ficar readonly */
  credentialsReadonly: boolean;
}


export type RegistrationTabKey = "student" | "course" | "payment" | "credentials";

export interface SidebarTabItem {
  id: RegistrationTabKey;
  label: string;
  desc: string;
  icon: LucideIcon;
}

export interface CourseDTO {
  codigo: string;
  nome: string;
  mensalidade?: number | null;
  taxa_matricula?: number | null;
}

export interface ClassDTO {
  id: number;
  nome: string;
  codigo?: string | null;
  dias_semana?: string | null;
  curso?: string | null; // se no teu backend for "curso"
}

export interface RegistrationDTO {
  studentId: number;
  courseId: string;
  period: string;
  status: "active" | "suspended" | "cancelled" | "completed";
}

export type RegistrationFormErrors = Record<string, string>;

