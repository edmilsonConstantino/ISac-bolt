// src/components/shared/LaunchGradesModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Save,
  Download,
  CheckCircle,
  AlertCircle,
  Search,
  X,
  Users,
  XCircle,
  Star,
  Edit3,
  BookOpen,
  GraduationCap,
  TrendingUp
} from "lucide-react";

interface StudentGrade {
  id: number;
  name: string;
  evaluation1: string;
  evaluation2: string;
  evaluation3: string;
  evaluation4: string;
  finalResult: string;
}

interface LaunchGradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  classInfo: {
    id: number;
    name: string;
    course: string;
  };
  readOnly?: boolean;
}

const MOCK_STUDENTS: StudentGrade[] = [
  { id: 1, name: "João Silva", evaluation1: "18", evaluation2: "17", evaluation3: "19", evaluation4: "18", finalResult: "18" },
  { id: 2, name: "Maria Santos", evaluation1: "16", evaluation2: "15", evaluation3: "17", evaluation4: "16", finalResult: "16" },
  { id: 3, name: "Pedro Costa", evaluation1: "14", evaluation2: "13", evaluation3: "15", evaluation4: "14", finalResult: "14" },
  { id: 4, name: "Ana Lopes", evaluation1: "19", evaluation2: "18", evaluation3: "20", evaluation4: "19", finalResult: "19" },
  { id: 5, name: "Carlos Mendes", evaluation1: "12", evaluation2: "11", evaluation3: "13", evaluation4: "12", finalResult: "12" },
  { id: 6, name: "Sofia Rodrigues", evaluation1: "17", evaluation2: "16", evaluation3: "18", evaluation4: "17", finalResult: "17" },
  { id: 7, name: "Bruno Alves", evaluation1: "15", evaluation2: "14", evaluation3: "16", evaluation4: "15", finalResult: "15" },
  { id: 8, name: "Inês Ferreira", evaluation1: "20", evaluation2: "19", evaluation3: "20", evaluation4: "20", finalResult: "20" },
];

export function LaunchGradesModal({
  isOpen,
  onClose,
  classInfo,
  readOnly = false
}: LaunchGradesModalProps) {
  const [students, setStudents] = useState<StudentGrade[]>(MOCK_STUDENTS);
  const [searchTerm, setSearchTerm] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGradeChange = (studentId: number, field: keyof StudentGrade, value: string) => {
    if (value !== "" && (!/^\d*\.?\d{0,1}$/.test(value) || Number(value) > 20)) {
      return;
    }
    setStudents(prev => prev.map(s =>
      s.id === studentId ? { ...s, [field]: value } : s
    ));
    setHasUnsavedChanges(true);
  };

  const calculateAverage = (student: StudentGrade): number => {
    const grades = [
      Number(student.evaluation1) || 0,
      Number(student.evaluation2) || 0,
      Number(student.evaluation3) || 0,
      Number(student.evaluation4) || 0
    ];
    return Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 10) / 10;
  };

  const handleSaveGrades = () => {
    toast.success("Notas salvas com sucesso!", {
      description: "As notas foram registradas no sistema."
    });
    setHasUnsavedChanges(false);
    setIsEditMode(false);
  };

  const handleCancelEditing = () => {
    if (hasUnsavedChanges) {
      const confirmCancel = window.confirm("Tem alterações não salvas. Deseja cancelar?");
      if (!confirmCancel) return;
    }
    setStudents(MOCK_STUDENTS);
    setIsEditMode(false);
    setHasUnsavedChanges(false);
  };

  const handleExportGrades = () => {
    const csvContent = [
      ["Nome", "1ª Avaliação", "2ª Avaliação", "3ª Avaliação", "4ª Avaliação", "Média", "Resultado Final", "Status"],
      ...students.map(s => {
        const avg = calculateAverage(s);
        const finalGrade = Number(s.finalResult) || avg;
        const status = finalGrade >= 10 ? "Aprovado" : "Reprovado";
        return [s.name, s.evaluation1 || "0", s.evaluation2 || "0", s.evaluation3 || "0", s.evaluation4 || "0", avg.toFixed(1), s.finalResult || avg.toFixed(1), status];
      })
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `notas_${classInfo.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    toast.success("Pautas exportadas com sucesso!");
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm("Tem alterações não salvas. Deseja sair?");
      if (!confirmClose) return;
    }
    setHasUnsavedChanges(false);
    onClose();
  };

  const getGradeColor = (grade: string): string => {
    const num = Number(grade);
    if (num >= 18) return "text-purple-600";
    if (num >= 14) return "text-green-600";
    if (num >= 10) return "text-blue-600";
    return "text-red-600";
  };

  const getGradeStatus = (grade: string): { label: string; class: string } => {
    const num = Number(grade);
    if (num >= 18) return { label: "Excelente", class: "bg-purple-50 text-purple-700 border-purple-200" };
    if (num >= 14) return { label: "Bom", class: "bg-green-50 text-green-700 border-green-200" };
    if (num >= 10) return { label: "Aprovado", class: "bg-blue-50 text-blue-700 border-blue-200" };
    return { label: "Reprovado", class: "bg-red-50 text-red-700 border-red-200" };
  };

  const stats = {
    total: students.length,
    approved: students.filter(s => Number(s.finalResult || calculateAverage(s)) >= 10).length,
    failed: students.filter(s => Number(s.finalResult || calculateAverage(s)) < 10).length,
    excellent: students.filter(s => Number(s.finalResult || calculateAverage(s)) >= 18).length,
    averageGrade: (students.reduce((sum, s) => sum + Number(s.finalResult || calculateAverage(s)), 0) / students.length).toFixed(1)
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* Compact Header */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-5 py-3 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-white/15 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <DialogHeader className="p-0">
                  <DialogTitle className="text-base font-bold text-white">
                    {readOnly ? 'Consulta de Notas' : 'Lançamento de Notas'}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-2 text-blue-200 text-xs mt-0.5">
                  <BookOpen className="h-3 w-3" />
                  <span>{classInfo.name}</span>
                  <span className="text-blue-300/40">|</span>
                  <span>{classInfo.course}</span>
                </div>
              </div>
            </div>

            {/* Inline Stats */}
            <div className="flex items-center gap-4 mr-8">
              <div className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-blue-200" />
                <span className="text-white font-bold text-sm">{stats.total}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-300" />
                <span className="text-white font-bold text-sm">{stats.approved}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-red-300" />
                <span className="text-white font-bold text-sm">{stats.failed}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-yellow-300" />
                <span className="text-white font-bold text-sm">{stats.excellent}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
                <TrendingUp className="h-3.5 w-3.5 text-orange-300" />
                <span className="text-white font-bold text-sm">{stats.averageGrade}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-2.5 border-b border-slate-200 bg-white flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar estudante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 border-slate-200 text-sm"
            />
          </div>

          {isEditMode && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 rounded-lg border border-orange-200">
              <Edit3 className="h-3 w-3 text-orange-500" />
              <span className="text-[11px] font-semibold text-orange-600">Editando</span>
            </div>
          )}

          {!isEditMode ? (
            <>
              {!readOnly && (
                <Button
                  onClick={() => setIsEditMode(true)}
                  className="bg-[#F5821F] hover:bg-[#E07318] text-white h-9 px-4 text-sm"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" />
                  Lançar Notas
                </Button>
              )}
              <Button
                onClick={handleExportGrades}
                variant="outline"
                className="h-9 px-3 border-slate-200 text-slate-600 text-sm"
              >
                <Download className="h-3.5 w-3.5 mr-1" />
                CSV
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={handleCancelEditing}
                variant="outline"
                className="h-9 px-4 border-slate-200 text-slate-600 text-sm"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancelar
              </Button>
              <Button
                onClick={handleSaveGrades}
                disabled={!hasUnsavedChanges}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 px-4 text-sm disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5 mr-1.5" />
                Salvar
              </Button>
            </>
          )}
        </div>

        {/* Grades Table - Maximum visibility */}
        <div className="flex-1 overflow-auto">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhum estudante encontrado</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-[220px]">
                    Estudante
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">
                    1ª Aval
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">
                    2ª Aval
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">
                    3ª Aval
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">
                    4ª Aval
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">
                    Média
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 py-3">
                    Final
                  </th>
                  <th className="text-center text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const average = calculateAverage(student);
                  const finalGrade = student.finalResult || average.toString();
                  const status = getGradeStatus(finalGrade);

                  return (
                    <tr
                      key={student.id}
                      className={`border-b border-slate-100 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                      } hover:bg-blue-50/30`}
                    >
                      {/* Student */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-white font-bold text-sm">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-slate-800">{student.name}</p>
                            <p className="text-[11px] text-slate-400">Nº {student.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* Evaluations 1-4 */}
                      {(["evaluation1", "evaluation2", "evaluation3", "evaluation4"] as const).map((field) => (
                        <td key={field} className="px-3 py-3 text-center">
                          {isEditMode ? (
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="—"
                              value={student[field]}
                              onChange={(e) => handleGradeChange(student.id, field, e.target.value)}
                              className={`text-center h-10 w-16 mx-auto text-base font-semibold border-2 rounded-lg focus:border-[#F5821F] focus:ring-1 focus:ring-[#F5821F]/20 ${getGradeColor(student[field])} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                            />
                          ) : (
                            <span className={`text-base font-bold ${getGradeColor(student[field])}`}>
                              {student[field] || "—"}
                            </span>
                          )}
                        </td>
                      ))}

                      {/* Average */}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block text-base font-bold px-3 py-1 rounded-lg bg-slate-100 ${getGradeColor(average.toString())}`}>
                          {average.toFixed(1)}
                        </span>
                      </td>

                      {/* Final */}
                      <td className="px-3 py-3 text-center">
                        {isEditMode ? (
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="—"
                            value={student.finalResult}
                            onChange={(e) => handleGradeChange(student.id, "finalResult", e.target.value)}
                            className={`text-center h-10 w-16 mx-auto text-base font-bold border-2 rounded-lg focus:border-[#F5821F] focus:ring-1 focus:ring-[#F5821F]/20 ${getGradeColor(student.finalResult)} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                          />
                        ) : (
                          <span className={`text-lg font-bold ${getGradeColor(student.finalResult)}`}>
                            {student.finalResult || "—"}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 text-center">
                        <Badge className={`${status.class} border text-[11px] px-2.5 py-0.5 font-semibold`}>
                          {status.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Minimal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">
              {filteredStudents.length} de {students.length} estudantes
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-2 text-[#F5821F] hover:text-[#E07318] font-medium"
                >
                  Limpar
                </button>
              )}
            </p>
            {hasUnsavedChanges && (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                <AlertCircle className="h-3 w-3" />
                <span className="font-medium">Não salvo</span>
              </div>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleClose}
            className="h-8 px-4 border-slate-200 text-sm"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
