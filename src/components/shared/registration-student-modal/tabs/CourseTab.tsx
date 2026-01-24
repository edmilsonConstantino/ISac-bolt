// src/components/shared/registration-student-modal/tabs/CourseTab.tsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
} from "lucide-react";
import type {
  ClassDTO,
  CourseDTO,
  RegistrationDTO,
  RegistrationFormData,
  RegistrationFormErrors,
} from "../types/registrationModal.types";

interface CourseTabProps {
  // estado do form
  formData: RegistrationFormData;
  formErrors: RegistrationFormErrors;

  // dados
  courses: CourseDTO[];
  filteredClasses: ClassDTO[];
  existingRegistrations: RegistrationDTO[];

  // loading
  isLoadingCourses: boolean;

  // actions
  onSelectCourse: (course: CourseDTO) => void;
  onSelectClass: (classItem: ClassDTO) => void;

  // setters básicos (inputs)
  onChangeField: (field: keyof RegistrationFormData, value: any) => void;

  // utils
  formatCurrency: (value: number) => string;
}

export function CourseTab({
  formData,
  formErrors,
  courses,
  filteredClasses,
  existingRegistrations,
  isLoadingCourses,
  onSelectCourse,
  onSelectClass,
  onChangeField,
  formatCurrency,
}: CourseTabProps) {
  // ✅ FILTRAR CURSOS - Remover cursos onde estudante já está matriculado
  const availableCourses = courses.filter((course) => {
    // Se não selecionou estudante ou período, mostrar todos
    if (!formData.studentId || !formData.period) return true;

    // Verificar se estudante JÁ está matriculado neste curso neste período
    const alreadyEnrolled = existingRegistrations.some(
      (reg) =>
        reg.studentId === formData.studentId &&
        reg.courseId === course.codigo &&
        reg.period === formData.period &&
        (reg.status === "active" || reg.status === "suspended")
    );

    // ❌ NÃO mostrar se já matriculado
    return !alreadyEnrolled;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Seleção de Curso */}
      <section>
        <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
          Selecionar Curso <span className="text-red-500">*</span>
        </Label>

        {formErrors.courseId && (
          <p className="text-xs text-red-600 flex items-center gap-1 mb-3">
            <AlertCircle className="h-3 w-3" />
            {formErrors.courseId}
          </p>
        )}

        {isLoadingCourses ? (
          <div className="text-center py-8">
            <p className="text-slate-500">Carregando cursos...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
            {availableCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-sm text-slate-500 font-medium mb-1">
                  Nenhum curso disponível
                </p>
                <p className="text-xs text-slate-400">
                  {formData.studentName} já está matriculado em todos os cursos
                  para o período {formData.period}
                </p>
              </div>
            ) : (
              availableCourses.map((course) => (
                <button
                  key={course.codigo}
                  onClick={() => onSelectCourse(course)}
                  type="button"
                  className={cn(
                    "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                    formData.courseId === course.codigo
                      ? "border-[#F5821F] bg-orange-50 shadow-md ring-4 ring-[#F5821F]/10"
                      : "border-white bg-white hover:border-[#F5821F]/50 shadow-sm"
                  )}
                >
                  <div
                    className={cn(
                      "h-12 w-12 rounded-xl flex items-center justify-center mr-4",
                      formData.courseId === course.codigo
                        ? "bg-[#F5821F] text-white"
                        : "bg-slate-100 text-slate-400"
                    )}
                  >
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-700 leading-tight">
                      {course.nome}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      {course.codigo} • {formatCurrency(course.mensalidade || 0)}
                      /mês
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* Turma (Opcional) */}
      {formData.courseId ? (
        <section>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
            Turma <span className="text-slate-400">(Opcional)</span>
          </Label>

          {filteredClasses.length > 0 ? (
            <div className="grid grid-cols-1 gap-2">
              {filteredClasses.map((classItem) => (
                <button
                  key={classItem.id}
                  onClick={() => onSelectClass(classItem)}
                  type="button"
                  className={cn(
                    "flex items-center p-3 rounded-xl border-2 transition-all text-left",
                    formData.classId === classItem.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300"
                  )}
                >
                  <GraduationCap
                    className={cn(
                      "h-5 w-5 mr-3",
                      formData.classId === classItem.id
                        ? "text-blue-600"
                        : "text-slate-400"
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-700">
                      {classItem.nome}
                    </p>
                    <p className="text-xs text-slate-500">
                      {classItem.codigo} • {classItem.dias_semana}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-xl">
              Nenhuma turma disponível para este curso
            </p>
          )}
        </section>
      ) : null}

      {/* Período e Data */}
      <div className="grid grid-cols-2 gap-6">
        {/* Período */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Calendar className="h-5 w-5" />
            </div>
            <Label className="font-bold text-slate-700 leading-none">
              Período Letivo <span className="text-red-500">*</span>
            </Label>
          </div>

          <Input
            placeholder="Ex: 2025/1"
            value={formData.period || ""}
            onChange={(e) => onChangeField("period", e.target.value)}
            className={cn(
              "h-12 rounded-xl text-center font-bold text-lg",
              formErrors.period && "border-red-500"
            )}
          />

          {formErrors.period && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {formErrors.period}
            </p>
          )}
        </div>

        {/* Data */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <Clock className="h-5 w-5" />
            </div>
            <Label className="font-bold text-slate-700 leading-none">
              Data de Matrícula <span className="text-red-500">*</span>
            </Label>
          </div>

          <Input
            type="date"
            value={formData.enrollmentDate || ""}
            onChange={(e) => onChangeField("enrollmentDate", e.target.value)}
            className={cn(
              "h-12 rounded-xl",
              formErrors.enrollmentDate && "border-red-500"
            )}
          />

          {formErrors.enrollmentDate && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {formErrors.enrollmentDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
