// src/components/shared/registration-student-modal/tabs/CourseTab.tsx
// ATUALIZADO: Tipo de matrícula determinado dinamicamente após selecionar curso

import { useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Sun,
  Sunset,
  Moon,
  UserPlus,
  RefreshCw,
  BookMarked,
  CheckCircle2,
  Info,
} from "lucide-react";
import type {
  ClassDTO,
  CourseDTO,
  RegistrationDTO,
  RegistrationFormData,
  RegistrationFormErrors,
  Turno,
} from "../types/registrationModal.types";

// Tipos de matrícula disponíveis
type RegistrationType = 'new' | 'renewal' | 'module';

interface RegistrationTypeOption {
  id: RegistrationType;
  label: string;
  description: string;
  icon: typeof UserPlus;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
}

interface CourseTabProps {
  // estado do form
  formData: RegistrationFormData;
  formErrors: RegistrationFormErrors;

  // dados
  courses: CourseDTO[];
  classes?: ClassDTO[]; // todas as turmas (para filtrar por turno)
  filteredClasses: ClassDTO[];
  existingRegistrations: RegistrationDTO[];

  // loading
  isLoadingCourses: boolean;
  isLoadingClasses?: boolean;

  // actions
  onSelectCourse: (course: CourseDTO) => void;
  onSelectClass: (classItem: ClassDTO) => void;

  // setters básicos (inputs)
  onChangeField: (field: keyof RegistrationFormData, value: any) => void;

  // utils
  formatCurrency: (value: number) => string;

  // Histórico do estudante no curso (para determinar tipo de matrícula)
  // Retorna: { hasHistory: boolean, hasFailedModules: boolean, failedModules?: string[] }
  getStudentCourseHistory?: (studentId: number, courseId: string) => {
    hasHistory: boolean;
    hasFailedModules: boolean;
    failedModules?: Array<{ id: string; nome: string }>;
  };

  // Se veio da inscrição (força tipo "new")
  isPreSelected?: boolean;
}

// Opções de turno
const TURNO_OPTIONS: { value: Turno; label: string; icon: typeof Sun; color: string }[] = [
  { value: "manha", label: "Manhã", icon: Sun, color: "from-yellow-400 to-orange-400" },
  { value: "tarde", label: "Tarde", icon: Sunset, color: "from-orange-400 to-red-400" },
  { value: "noite", label: "Noite", icon: Moon, color: "from-indigo-500 to-purple-600" },
];

// Opções de tipo de matrícula
const REGISTRATION_TYPES: RegistrationTypeOption[] = [
  {
    id: 'new',
    label: 'Novo Estudante',
    description: 'Primeira matrícula neste curso',
    icon: UserPlus,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    textColor: 'text-green-700'
  },
  {
    id: 'renewal',
    label: 'Renovação',
    description: 'Estudante já matriculado anteriormente',
    icon: RefreshCw,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700'
  },
  {
    id: 'module',
    label: 'Por Módulo',
    description: 'Matrícula em módulos específicos (reprovação)',
    icon: BookMarked,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700'
  },
];

export function CourseTab({
  formData,
  formErrors,
  courses,
  classes = [],
  filteredClasses,
  existingRegistrations,
  isLoadingCourses,
  isLoadingClasses,
  onSelectCourse,
  onSelectClass,
  onChangeField,
  formatCurrency,
  getStudentCourseHistory,
  isPreSelected = false,
}: CourseTabProps) {
  // Usar turno do formData (não mais local state)
  const selectedTurno = (formData.turno as Turno) || null;

  // ✅ FILTRAR CURSOS - Mostrar todos os cursos (não filtrar por matrícula ativa)
  // O sistema vai determinar o tipo de matrícula baseado no histórico
  const availableCourses = courses;

  // Determinar tipos de matrícula disponíveis baseado no histórico
  const availableRegistrationTypes = useMemo(() => {
    if (!formData.studentId || !formData.courseId) return [];

    // Se veio da inscrição, força tipo "new"
    if (isPreSelected) {
      return REGISTRATION_TYPES.filter(t => t.id === 'new');
    }

    // Verificar histórico do estudante no curso selecionado
    const history = getStudentCourseHistory?.(formData.studentId, formData.courseId);

    if (!history || !history.hasHistory) {
      // Primeira vez no curso - só pode ser "Novo"
      return REGISTRATION_TYPES.filter(t => t.id === 'new');
    }

    // Já tem histórico no curso
    const types: RegistrationTypeOption[] = [];

    // Sempre pode renovar se já tem histórico
    types.push(REGISTRATION_TYPES.find(t => t.id === 'renewal')!);

    // Se tem módulos reprovados, pode fazer matrícula por módulo
    if (history.hasFailedModules && history.failedModules && history.failedModules.length > 0) {
      types.push(REGISTRATION_TYPES.find(t => t.id === 'module')!);
    }

    return types;
  }, [formData.studentId, formData.courseId, getStudentCourseHistory, isPreSelected]);

  // Obter módulos reprovados para exibição
  const failedModules = useMemo(() => {
    if (!formData.studentId || !formData.courseId || !getStudentCourseHistory) return [];
    const history = getStudentCourseHistory(formData.studentId, formData.courseId);
    return history?.failedModules || [];
  }, [formData.studentId, formData.courseId, getStudentCourseHistory]);

  // Auto-selecionar tipo de matrícula quando só tem uma opção
  useEffect(() => {
    if (availableRegistrationTypes.length === 1 && !formData.registrationType) {
      onChangeField('registrationType', availableRegistrationTypes[0].id);
    }
  }, [availableRegistrationTypes, formData.registrationType, onChangeField]);

  // Filtrar turmas por curso E turno selecionado
  const turmasFiltradasPorTurno = useMemo(() => {
    if (!formData.courseId) return [];

    let turmasDoCurso = classes.filter((c) => c.curso === formData.courseId || (c as any).curso_id === formData.courseId);

    // Se turno selecionado, filtrar por turno
    if (selectedTurno) {
      turmasDoCurso = turmasDoCurso.filter((c) => c.turno === selectedTurno);
    }

    return turmasDoCurso;
  }, [classes, formData.courseId, selectedTurno]);

  // Handler para selecionar turno
  const handleSelectTurno = (turno: Turno) => {
    onChangeField("turno", turno);
    // Limpar turma selecionada ao mudar turno
    onChangeField("classId", undefined);
    onChangeField("className", "");
  };

  // Handler para selecionar tipo de matrícula
  const handleSelectRegistrationType = (type: RegistrationType) => {
    onChangeField('registrationType', type);
  };

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

      {/* Tipo de Matrícula (aparece após selecionar curso) */}
      {formData.courseId && availableRegistrationTypes.length > 0 && (
        <section>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
            Tipo de Matrícula <span className="text-red-500">*</span>
          </Label>

          {/* Info sobre o histórico */}
          {availableRegistrationTypes.length === 1 && availableRegistrationTypes[0].id === 'new' && !isPreSelected && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl mb-4 flex items-start gap-2">
              <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-700">
                Este estudante nunca foi matriculado neste curso. O tipo de matrícula é <strong>Novo Estudante</strong>.
              </p>
            </div>
          )}

          {availableRegistrationTypes.length > 1 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4 flex items-start gap-2">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-700">
                Este estudante já possui histórico neste curso. Escolha o tipo de matrícula adequado.
              </p>
            </div>
          )}

          <div className={cn(
            "grid gap-3",
            availableRegistrationTypes.length === 1 ? "grid-cols-1 max-w-md" : "grid-cols-1 md:grid-cols-2"
          )}>
            {availableRegistrationTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = formData.registrationType === type.id;

              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleSelectRegistrationType(type.id)}
                  disabled={availableRegistrationTypes.length === 1}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all duration-200 text-left group",
                    isSelected
                      ? `${type.borderColor} ${type.bgColor} shadow-lg`
                      : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md",
                    availableRegistrationTypes.length === 1 && "cursor-default"
                  )}
                >
                  {isSelected && (
                    <div className="absolute -top-2 -right-2">
                      <div className={`h-5 w-5 bg-gradient-to-br ${type.color} rounded-full flex items-center justify-center shadow-md`}>
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center transition-all",
                      isSelected
                        ? `bg-gradient-to-br ${type.color} shadow-md`
                        : "bg-slate-100 group-hover:bg-slate-200"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isSelected ? "text-white" : "text-slate-600"
                      )} />
                    </div>

                    <div className="flex-1">
                      <h3 className={cn(
                        "font-bold text-sm mb-0.5",
                        isSelected ? type.textColor : "text-slate-800"
                      )}>
                        {type.label}
                      </h3>
                      <p className={cn(
                        "text-xs leading-relaxed",
                        isSelected ? type.textColor : "text-slate-500"
                      )}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mostrar módulos reprovados se tipo for "module" */}
          {formData.registrationType === 'module' && failedModules.length > 0 && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <Label className="text-xs font-bold uppercase tracking-wider text-purple-700 mb-3 block">
                Módulos Disponíveis para Matrícula (Reprovados)
              </Label>
              <div className="space-y-2">
                {failedModules.map((mod) => (
                  <div key={mod.id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-purple-100">
                    <BookMarked className="h-4 w-4 text-purple-500" />
                    <span className="text-sm text-slate-700">{mod.nome}</span>
                    <span className="text-xs text-purple-500 font-mono ml-auto">{mod.id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Turno e Turma */}
      {formData.courseId && formData.registrationType ? (
        <>
          {/* Seleção de Turno */}
          <section>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
              Selecionar Turno <span className="text-red-500">*</span>
            </Label>

            <div className="grid grid-cols-3 gap-3">
              {TURNO_OPTIONS.map((turno) => {
                const Icon = turno.icon;
                return (
                  <button
                    key={turno.value}
                    onClick={() => handleSelectTurno(turno.value)}
                    type="button"
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all",
                      selectedTurno === turno.value
                        ? "border-[#004B87] bg-gradient-to-br " + turno.color + " text-white shadow-lg"
                        : "border-slate-200 bg-white hover:border-[#004B87]/50 text-slate-600"
                    )}
                  >
                    <Icon className={cn(
                      "h-8 w-8 mb-2",
                      selectedTurno === turno.value ? "text-white" : "text-slate-400"
                    )} />
                    <span className="text-sm font-bold">{turno.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Turma (aparece após selecionar turno) */}
          {selectedTurno && (
            <section>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
                Turma <span className="text-slate-400">(Opcional)</span>
              </Label>

              {isLoadingClasses ? (
                <div className="text-center py-8">
                  <p className="text-slate-500">Carregando turmas...</p>
                </div>
              ) : turmasFiltradasPorTurno.length > 0 ? (
                <div className="grid grid-cols-1 gap-2">
                  {turmasFiltradasPorTurno.map((classItem) => {
                    const capacity = classItem.capacity ?? 0;
                    const occupied = classItem.students ?? 0;
                    const available = capacity > 0 ? Math.max(0, capacity - occupied) : null;
                    const isFull = capacity > 0 && occupied >= capacity;
                    const fillPct = capacity > 0 ? Math.min(100, Math.round((occupied / capacity) * 100)) : 0;
                    const isAlmostFull = !isFull && fillPct >= 80;
                    const isSelected = formData.classId === classItem.id;

                    return (
                      <button
                        key={classItem.id}
                        onClick={() => !isFull && onSelectClass(classItem)}
                        type="button"
                        disabled={isFull}
                        className={cn(
                          "flex flex-col p-3 rounded-xl border-2 transition-all text-left w-full",
                          isFull
                            ? "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                            : isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm"
                        )}
                      >
                        {/* Linha principal */}
                        <div className="flex items-center gap-3 w-full">
                          <GraduationCap
                            className={cn(
                              "h-5 w-5 flex-shrink-0",
                              isFull ? "text-slate-300" : isSelected ? "text-blue-600" : "text-slate-400"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-semibold truncate",
                              isFull ? "text-slate-400" : "text-slate-700"
                            )}>
                              {classItem.nome}
                            </p>
                            <p className="text-xs text-slate-500">
                              {[classItem.codigo, classItem.dias_semana].filter(Boolean).join(' • ')}
                            </p>
                          </div>

                          {/* Badge de vagas */}
                          {capacity > 0 && (
                            <span className={cn(
                              "text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0",
                              isFull
                                ? "bg-red-100 text-red-600"
                                : isAlmostFull
                                ? "bg-amber-100 text-amber-700"
                                : "bg-emerald-100 text-emerald-700"
                            )}>
                              {isFull ? "Sem vagas" : `${available} vaga${available !== 1 ? 's' : ''}`}
                            </span>
                          )}
                        </div>

                        {/* Barra de capacidade */}
                        {capacity > 0 && (
                          <div className="mt-2 w-full">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                              <span>{occupied}/{capacity} alunos</span>
                              <span>{fillPct}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  isFull ? "bg-red-500" : isAlmostFull ? "bg-amber-400" : "bg-emerald-500"
                                )}
                                style={{ width: `${fillPct}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-xl">
                  Nenhuma turma disponível para o turno {selectedTurno === 'manha' ? 'da manhã' : selectedTurno === 'tarde' ? 'da tarde' : 'da noite'}
                </p>
              )}
            </section>
          )}
        </>
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
