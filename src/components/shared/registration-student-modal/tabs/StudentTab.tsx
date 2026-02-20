// src/components/shared/registration-student-modal/tabs/StudentTab.tsx
// ATUALIZADO: Tipo de matrícula agora é determinado APÓS selecionar curso (no CourseTab)

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Search,
  User,
} from "lucide-react";
import type {
  RegistrationFormData,
  RegistrationFormErrors,
  StudentDTO,
} from "../types/registrationModal.types";

interface StudentTabProps {
  // estado do form
  formData: RegistrationFormData;
  formErrors: RegistrationFormErrors;

  // dados
  students: StudentDTO[];
  selectedStudent?: StudentDTO | null;

  // busca / loading
  studentSearch: string;
  onStudentSearchChange: (value: string) => void;
  isLoadingStudents: boolean;

  // ações
  onSelectStudent: (student: StudentDTO) => void;
  onClearStudent: () => void;
  onChangeField: (field: keyof RegistrationFormData, value: any) => void;

  // lista já filtrada
  filteredStudents: StudentDTO[];

  // estudante pré-selecionado (vindo da inscrição)
  isPreSelected?: boolean;
}

export function StudentTab({
  formData,
  formErrors,
  students,
  selectedStudent,
  studentSearch,
  onStudentSearchChange,
  isLoadingStudents,
  onSelectStudent,
  onClearStudent,
  onChangeField,
  filteredStudents,
  isPreSelected = false,
}: StudentTabProps) {
  const hasSelected = Boolean(formData.studentId && formData.studentId > 0 && selectedStudent);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Header informativo */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <p className="text-sm text-blue-700">
          <strong>Passo 1:</strong> Selecione o estudante que deseja matricular. O tipo de matrícula será determinado automaticamente após escolher o curso.
        </p>
      </div>

      {/* Estudante Selecionado */}
      {hasSelected ? (
        <SelectedStudentCard
          student={selectedStudent!}
          studentCode={formData.studentCode || ""}
          onClear={onClearStudent}
          isPreSelected={isPreSelected}
        />
      ) : (
        <div>
          {/* Busca */}
          <section>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
              Buscar Estudante <span className="text-red-500">*</span>
            </Label>

            <div className="relative mb-4">
              <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Digite o nome, email ou código do estudante..."
                value={studentSearch}
                onChange={(e) => onStudentSearchChange(e.target.value)}
                className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F]"
              />
            </div>

            {formErrors.studentId && (
              <p className="text-xs text-red-600 flex items-center gap-1 mb-3">
                <AlertCircle className="h-3 w-3" />
                {formErrors.studentId}
              </p>
            )}

            {/* Lista */}
            {isLoadingStudents ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-[#F5821F] border-t-transparent rounded-full mx-auto mb-3"></div>
                <p className="text-slate-500">Carregando estudantes...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {filteredStudents.slice(0, 10).map((student) => (
                  <button
                    key={student.id}
                    onClick={() => onSelectStudent(student)}
                    className="w-full group"
                    type="button"
                  >
                    <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-[#F5821F] hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 shadow-sm hover:shadow-md">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="h-14 w-14 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <span className="text-white font-bold text-xl">
                            {(student.name?.charAt(0) || "E").toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <h3 className="font-bold text-base text-slate-800 truncate group-hover:text-[#004B87] transition-colors">
                          {student.name}
                        </h3>
                        <p className="text-sm text-slate-500 truncate mt-0.5">
                          {student.email}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                            {student.username || `MAT${student.id}`}
                          </span>

                          {/* curso legado - opcional */}
                          {student.curso && (
                            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                              {student.curso}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-[#F5821F] transition-colors">
                          <GraduationCap className="h-5 w-5 text-[#F5821F] group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </button>
                ))}

                {filteredStudents.length > 10 && (
                  <p className="text-xs text-center text-slate-400 py-2">
                    Mostrando 10 de {filteredStudents.length} estudantes. Refine sua busca.
                  </p>
                )}
              </div>
            ) : (
              <EmptyStudentsState hasQuery={Boolean(studentSearch)} />
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SelectedStudentCard({
  student,
  studentCode,
  onClear,
  isPreSelected = false,
}: {
  student: StudentDTO;
  studentCode: string;
  onClear: () => void;
  isPreSelected?: boolean;
}) {
  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-2xl p-6 shadow-lg">
        {/* Badge */}
        <div className="absolute -top-3 left-6 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          ESTUDANTE SELECIONADO
        </div>

        <div className="flex items-center gap-5 mt-2">
          {/* Avatar grande */}
          <div className="relative flex-shrink-0">
            <div className="h-20 w-20 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-3xl">
                {(student.name?.charAt(0) || "E").toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-3 w-3 text-white" />
            </div>
          </div>

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-[#004B87] mb-1 truncate">
              {student.name}
            </h3>
            <p className="text-sm text-slate-600 truncate mb-2">📧 {student.email}</p>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono bg-white px-3 py-1 rounded-lg text-[#004B87] font-semibold border border-slate-200">
                {studentCode}
              </span>

              {student.phone && (
                <span className="text-xs text-slate-500">📱 {student.phone}</span>
              )}
            </div>
          </div>

          {/* Trocar - esconder se pré-selecionado */}
          {!isPreSelected && (
            <button
              type="button"
              onClick={onClear}
              className="flex-shrink-0 px-4 py-2 bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-xl text-xs font-semibold transition-all"
            >
              Trocar
            </button>
          )}
          {isPreSelected && (
            <div className="flex-shrink-0 px-4 py-2 bg-blue-50 border-2 border-blue-200 text-blue-600 rounded-xl text-xs font-semibold">
              Da Inscrição
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyStudentsState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="text-center py-16">
      <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <User className="h-10 w-10 text-slate-300" />
      </div>

      <p className="text-sm text-slate-500 font-medium mb-1">
        {hasQuery ? "Nenhum estudante encontrado" : "Digite para buscar estudantes"}
      </p>

      <p className="text-xs text-slate-400">
        {hasQuery ? "Tente buscar por nome, email ou código" : "Comece digitando o nome ou email do estudante"}
      </p>
    </div>
  );
}
