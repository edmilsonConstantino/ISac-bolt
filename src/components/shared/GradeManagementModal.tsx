// src/components/shared/GradeManagementModal.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Save,
  Users,
  Calculator,
  BookOpen,
  Star,
  TrendingUp,
  FileText,
  Loader2,
  X,
  ChevronDown,
  BarChart2,
  ClipboardList,
  Pen,
  AlertTriangle,
  CheckCircle2,
  Pencil,
} from "lucide-react";
import { Student, Class } from "../../types";
import gradeService from "@/services/gradeService";
import classService from "@/services/classService";
import { toast } from "sonner";

interface StudentGrade {
  studentId: number;
  studentName: string;
  teste1: number;
  teste2: number;
  examePratico: number;
  exameTeórico: number;
  finalGrade: number;
}

interface GradeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gradeData: { classId: number; period: string; grades: StudentGrade[] }) => void;
  classData: Class;
  students: Student[];
}

const PERIOD_NUMBER: Record<string, number> = {
  bimestre1: 1,
  bimestre2: 2,
  bimestre3: 3,
  bimestre4: 4,
};

const TABS = [
  { id: "overview",   label: "Visão Geral",  Icon: BarChart2     },
  { id: "individual", label: "Individual",   Icon: Users         },
  { id: "reports",    label: "Relatórios",   Icon: ClipboardList },
];

const GRADES_CONFIG = [
  { key: "teste1",       label: "Teste 1",       weight: 20, icon: FileText, color: "#004B87" },
  { key: "teste2",       label: "Teste 2",       weight: 20, icon: FileText, color: "#0066B3" },
  { key: "examePratico", label: "Exame Prático", weight: 30, icon: Pen,      color: "#059669" },
  { key: "exameTeórico", label: "Exame Teórico", weight: 30, icon: BookOpen, color: "#7C3AED" },
];

// ── Defined OUTSIDE the modal so React never remounts it on re-render ────────
function GradeInput({
  value, onChange, className = ""
}: { value: number; onChange: (v: number) => void; className?: string }) {
  const [local, setLocal] = useState(String(value));
  const skipSyncRef = useRef(false);

  // Sync incoming value (e.g. period change loads new data) but not while user is typing
  useEffect(() => {
    if (!skipSyncRef.current) {
      setLocal(String(value));
    }
  }, [value]);

  return (
    <input
      type="number"
      min="0"
      max="20"
      step="0.1"
      value={local}
      onChange={(e) => {
        skipSyncRef.current = true;
        setLocal(e.target.value);
        const num = parseFloat(e.target.value);
        if (!isNaN(num)) onChange(Math.min(num, 20));
      }}
      onBlur={(e) => {
        skipSyncRef.current = false;
        const num = parseFloat(e.target.value);
        if (isNaN(num) || e.target.value === "") {
          setLocal("0");
          onChange(0);
        } else {
          const clamped = Math.min(Math.max(num, 0), 20);
          setLocal(String(clamped));
          onChange(clamped);
        }
      }}
      className={`border border-slate-200 rounded-xl text-center text-sm font-semibold
        focus:outline-none focus:ring-2 focus:ring-[#004B87]/30 focus:border-[#004B87]
        bg-slate-50 hover:bg-white transition-colors
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
        ${className}`}
    />
  );
}

export function GradeManagementModal({
  isOpen,
  onClose,
  onSave,
  classData,
  students
}: GradeManagementModalProps) {
  const [activeTab, setActiveTab]             = useState("overview");
  const [selectedPeriod, setSelectedPeriod]   = useState("bimestre1");
  const [grades, setGrades]                   = useState<StudentGrade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isSaving, setIsSaving]               = useState(false);
  const [isLoading, setIsLoading]             = useState(false);
  const [isEditMode, setIsEditMode]           = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedPeriodLabel, setSavedPeriodLabel] = useState("");

  const periods = [
    { value: "bimestre1", label: "1º Bimestre" },
    { value: "bimestre2", label: "2º Bimestre" },
    { value: "bimestre3", label: "3º Bimestre" },
    { value: "bimestre4", label: "4º Bimestre" },
  ];

  // ── Calculate final grade (integer half-up) ──────────────────────────────
  const calculateFinalGrade = (g: StudentGrade): number => {
    const raw = g.teste1 * 0.2 + g.teste2 * 0.2 + g.examePratico * 0.3 + g.exameTeórico * 0.3;
    return Math.round(raw);
  };

  // ── Reset edit mode when period or modal changes ─────────────────────────
  useEffect(() => { setIsEditMode(false); }, [selectedPeriod, isOpen]);

  // ── Load students + grades from backend ──────────────────────────────────
  useEffect(() => {
    if (!isOpen || !classData?.id) return;
    const periodNum = PERIOD_NUMBER[selectedPeriod] ?? 1;
    setIsLoading(true);

    const getStudentList: Promise<Student[]> =
      students.length > 0
        ? Promise.resolve(students)
        : classService.getClassStudents(classData.id).then((apiStudents: any[]) =>
            apiStudents.map((s: any) => ({
              id: s.id,
              name: s.nome || s.name || "—",
              email: s.email || "",
              phone: s.telefone || "",
              classId: classData.id,
              className: classData.name,
              grade: 0, attendance: 0,
              status: "active" as const,
              enrollmentDate: "",
            }))
          );

    getStudentList
      .then((resolvedStudents) =>
        gradeService.getByClass(classData.id, periodNum).then((apiGrades) => {
          setGrades(
            resolvedStudents.map((student) => {
              const api = apiGrades.find((g) => g.student_id === student.id);
              const row: StudentGrade = {
                studentId:    student.id,
                studentName:  student.name,
                teste1:       Number(api?.grade_teste1        ?? 0),
                teste2:       Number(api?.grade_teste2        ?? 0),
                examePratico: Number(api?.grade_exame_pratico ?? 0),
                exameTeórico: Number(api?.grade_exame_teorico ?? 0),
                finalGrade:   0,
              };
              row.finalGrade = calculateFinalGrade(row);
              return row;
            })
          );
        })
      )
      .catch(() => setGrades([]))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedPeriod, classData?.id]);

  const updateGrade = (studentId: number, field: keyof StudentGrade, value: number) => {
    setGrades((prev) =>
      prev.map((grade) => {
        if (grade.studentId !== studentId) return grade;
        const updated = { ...grade, [field]: value };
        updated.finalGrade = calculateFinalGrade(updated);
        return updated;
      })
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getGradeColor = (g: number) => {
    if (g >= 14) return "#059669";
    if (g >= 10) return "#D97706";
    return "#DC2626";
  };

  const getGradeStatus = (finalGrade: number) => {
    const passed = finalGrade >= 10;
    return passed
      ? { label: "Aprovado",  bg: "#DCFCE7", text: "#166534" }
      : { label: "Reprovado", bg: "#FEE2E2", text: "#991B1B" };
  };

  const handleSave = useCallback(async () => {
    if (!classData?.id) return;
    const periodNum = PERIOD_NUMBER[selectedPeriod] ?? 1;
    setIsSaving(true);
    try {
      await Promise.all(
        grades.map((grade) =>
          gradeService.save({
            class_id:            classData.id,
            student_id:          grade.studentId,
            period_number:       periodNum,
            grade_teste1:        grade.teste1,
            grade_teste2:        grade.teste2,
            grade_exame_pratico: grade.examePratico,
            grade_exame_teorico: grade.exameTeórico,
            strengths:           null,
            improvements:        null,
            recommendations:     null,
          })
        )
      );
      onSave({ classId: classData.id, period: selectedPeriod, grades });

      // Auto-finalize level when saving the 4th bimestre
      if (selectedPeriod === "bimestre4") {
        await Promise.allSettled(
          grades.map((grade) => gradeService.finalizeLevel(classData.id, grade.studentId))
        );
      }

      // Show success modal (with warning only for bimestre1)
      setSavedPeriodLabel(periods.find((p) => p.value === selectedPeriod)?.label ?? "");
      setIsEditMode(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar notas");
    } finally {
      setIsSaving(false);
    }
  }, [grades, classData, selectedPeriod, onSave]);

  const handleClose = () => {
    setGrades([]);
    setSelectedStudent(null);
    setActiveTab("overview");
    setIsEditMode(false);
    setShowSuccessModal(false);
    onClose();
  };

  const classAverage = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.finalGrade, 0) / grades.length).toFixed(1)
    : "0.0";

  const selectedStudentGrade = selectedStudent
    ? grades.find((g) => g.studentId === selectedStudent)
    : null;

  const approved = grades.filter((g) => g.finalGrade >= 10).length;
  const failed   = grades.filter((g) => g.finalGrade < 10).length;

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-5xl h-[88vh] overflow-hidden p-0 rounded-2xl
        border-0 shadow-2xl [&>button:first-child]:hidden flex flex-col">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#003868] text-white flex-shrink-0">
          <div className="px-4 pt-3 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F5821F] flex items-center justify-center shadow-lg flex-shrink-0">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold leading-tight">Lançar Notas</h2>
                  <p className="text-blue-200 text-xs mt-0.5">
                    {classData?.name} · {grades.length} estudante{grades.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Stats inline */}
              <div className="flex items-center gap-2 mx-3">
                {[
                  { label: "Média",      value: classAverage, color: "text-[#FF9933]"   },
                  { label: "Aprovados",  value: approved,     color: "text-emerald-300" },
                  { label: "Reprovados", value: failed,       color: "text-red-300"     },
                ].map((s) => (
                  <div key={s.label} className="bg-white/10 rounded-lg px-2.5 py-1 text-center min-w-[50px]">
                    <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                    <div className="text-blue-300 text-[10px]">{s.label}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="h-3.5 w-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* Orange accent line */}
          <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]" />

          {/* Period selector row */}
          <div className="px-4 py-2 flex items-center justify-between gap-4">
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="appearance-none bg-white/15 hover:bg-white/20 border border-white/20
                  text-white text-sm font-semibold rounded-xl pl-3 pr-8 py-1.5
                  focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer"
              >
                {periods.map((p) => (
                  <option key={p.value} value={p.value} className="text-slate-800 bg-white">
                    {p.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/70 pointer-events-none" />
            </div>

            {isLoading && (
              <div className="flex items-center gap-1.5 text-blue-200 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Carregando…</span>
              </div>
            )}
          </div>

          {/* Tab bar */}
          <div className="px-4 flex gap-1 pb-0">
            {TABS.map((tab) => {
              const Icon = tab.Icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-xl transition-all
                    ${active
                      ? "bg-slate-50 text-[#004B87]"
                      : "text-blue-200 hover:text-white hover:bg-white/10"
                    }`}
                >
                  <Icon className="h-3 w-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 min-h-0">

          {/* ── Overview Tab — Grid Layout ── */}
          {activeTab === "overview" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

              {/* Column header row */}
              <div className="grid items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-2.5"
                style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 64px 92px" }}>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estudante</div>
                {GRADES_CONFIG.map((cfg) => {
                  const Icon = cfg.icon;
                  return (
                    <div key={cfg.key} className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-0.5">
                        <Icon className="h-3 w-3" style={{ color: cfg.color }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-300">{cfg.weight}%</div>
                    </div>
                  );
                })}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Nota</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</div>
              </div>

              {/* Student rows */}
              {grades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                    <Users className="h-6 w-6 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400">Nenhum estudante encontrado</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {grades.map((grade) => {
                    const status   = getGradeStatus(grade.finalGrade);
                    const initials = grade.studentName
                      .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

                    return (
                      <div
                        key={grade.studentId}
                        className="grid items-center gap-2 px-4 py-2.5 hover:bg-slate-50/60 transition-colors"
                        style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 64px 92px" }}
                      >
                        {/* Student */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#004B87] flex items-center justify-center
                            text-white text-xs font-bold flex-shrink-0 shadow-sm">
                            {initials}
                          </div>
                          <button
                            onClick={() => { setSelectedStudent(grade.studentId); setActiveTab("individual"); }}
                            className="text-sm font-semibold text-slate-800 truncate text-left hover:text-[#004B87] transition-colors"
                          >
                            {grade.studentName}
                          </button>
                        </div>

                        {/* Grade cells — input when editing, text when read-only */}
                        {GRADES_CONFIG.map((cfg) => (
                          <div key={cfg.key} className="text-center">
                            {isEditMode ? (
                              <GradeInput
                                value={grade[cfg.key as keyof StudentGrade] as number}
                                onChange={(v) => updateGrade(grade.studentId, cfg.key as keyof StudentGrade, v)}
                                className="w-full h-9"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-slate-700">
                                {(grade[cfg.key as keyof StudentGrade] as number).toFixed(1)}
                              </span>
                            )}
                          </div>
                        ))}

                        {/* Final grade */}
                        <div className="text-center">
                          <span className="text-base font-bold" style={{ color: getGradeColor(grade.finalGrade) }}>
                            {grade.finalGrade}
                          </span>
                        </div>

                        {/* Status badge */}
                        <div className="text-center">
                          <span
                            className="text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap"
                            style={{ background: status.bg, color: status.text }}
                          >
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Individual Tab ── */}
          {activeTab === "individual" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Student list */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-700 text-sm">Selecionar Estudante</h3>
                </div>
                <div className="divide-y divide-slate-50">
                  {grades.map((grade) => {
                    const active = selectedStudent === grade.studentId;
                    return (
                      <button
                        key={grade.studentId}
                        onClick={() => setSelectedStudent(grade.studentId)}
                        className={`w-full px-4 py-3 text-left flex items-center justify-between
                          transition-colors hover:bg-slate-50 ${active ? "bg-[#004B87]/5 border-l-2 border-[#004B87]" : ""}`}
                      >
                        <span className={`text-sm font-medium ${active ? "text-[#004B87]" : "text-slate-700"}`}>
                          {grade.studentName}
                        </span>
                        <span className="text-sm font-bold" style={{ color: getGradeColor(grade.finalGrade) }}>
                          {grade.finalGrade}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Student detail */}
              {selectedStudentGrade ? (
                <div className="lg:col-span-2 space-y-4">
                  {/* Header card */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#004B87] flex items-center justify-center text-white font-bold text-base shadow-sm">
                        {selectedStudentGrade.studentName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{selectedStudentGrade.studentName}</div>
                        <div className="text-sm text-slate-400">Avaliação por bimestre</div>
                      </div>
                      <div className="ml-auto text-center">
                        <div className="text-3xl font-bold" style={{ color: getGradeColor(selectedStudentGrade.finalGrade) }}>
                          {selectedStudentGrade.finalGrade}
                        </div>
                        <div
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            background: getGradeStatus(selectedStudentGrade.finalGrade).bg,
                            color:      getGradeStatus(selectedStudentGrade.finalGrade).text,
                          }}
                        >
                          {getGradeStatus(selectedStudentGrade.finalGrade).label}
                        </div>
                      </div>
                    </div>

                    {/* Grade inputs / read-only values */}
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                      Notas do Bimestre
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {GRADES_CONFIG.map((cfg) => {
                        const Icon = cfg.icon;
                        const val = selectedStudentGrade[cfg.key as keyof StudentGrade] as number;
                        return (
                          <div key={cfg.key} className="space-y-1.5">
                            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                              <Icon className="h-3.5 w-3.5" style={{ color: cfg.color }} />
                              {cfg.label}
                              <span className="text-slate-400 font-normal">({cfg.weight}%)</span>
                            </label>
                            {isEditMode ? (
                              <GradeInput
                                value={val}
                                onChange={(v) => updateGrade(selectedStudentGrade.studentId, cfg.key as keyof StudentGrade, v)}
                                className="w-full h-10"
                              />
                            ) : (
                              <div className="h-10 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center">
                                <span className="text-sm font-bold text-slate-700">{val.toFixed(1)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Final grade summary */}
                  <div
                    className="rounded-2xl p-4 text-center"
                    style={{ background: getGradeStatus(selectedStudentGrade.finalGrade).bg }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Calculator className="h-4 w-4" style={{ color: getGradeStatus(selectedStudentGrade.finalGrade).text }} />
                      <span className="text-sm font-semibold" style={{ color: getGradeStatus(selectedStudentGrade.finalGrade).text }}>
                        Nota Final Calculada
                      </span>
                    </div>
                    <div className="text-5xl font-bold" style={{ color: getGradeColor(selectedStudentGrade.finalGrade) }}>
                      {selectedStudentGrade.finalGrade}
                    </div>
                    <div className="text-xs mt-1" style={{ color: getGradeStatus(selectedStudentGrade.finalGrade).text }}>
                      T1×20% + T2×20% + Ex.Prát.×30% + Ex.Teór.×30%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="lg:col-span-2 flex items-center justify-center bg-white rounded-2xl border border-slate-100 shadow-sm p-12">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-[#004B87]/10 flex items-center justify-center mx-auto mb-3">
                      <Users className="h-8 w-8 text-[#004B87]" />
                    </div>
                    <div className="text-slate-500 text-sm">Selecione um estudante para ver os detalhes</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Reports Tab ── */}
          {activeTab === "reports" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Média Geral",  value: classAverage,        color: getGradeColor(Number(classAverage)), bg: "#EFF6FF" },
                  { label: "Estudantes",   value: `${grades.length}`,  color: "#004B87",  bg: "#DBEAFE" },
                  { label: "Aprovados",    value: `${approved}`,        color: "#059669",  bg: "#DCFCE7" },
                  { label: "Reprovados",   value: `${failed}`,          color: "#DC2626",  bg: "#FEE2E2" },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl p-4 text-center" style={{ background: s.bg }}>
                    <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top students */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#F5821F]/15 flex items-center justify-center">
                      <Star className="h-3.5 w-3.5 text-[#F5821F]" />
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">Melhores Alunos</span>
                  </div>
                  <div className="space-y-2">
                    {[...grades]
                      .sort((a, b) => b.finalGrade - a.finalGrade)
                      .slice(0, 5)
                      .map((grade, index) => (
                        <div key={grade.studentId} className="flex items-center gap-3">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: index === 0 ? "#F5821F" : index === 1 ? "#94A3B8" : "#B45309",
                              color: "white",
                            }}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm text-slate-700 flex-1 truncate">{grade.studentName}</span>
                          <span className="text-sm font-bold" style={{ color: getGradeColor(grade.finalGrade) }}>
                            {grade.finalGrade}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Médias por campo */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-[#004B87]/10 flex items-center justify-center">
                      <TrendingUp className="h-3.5 w-3.5 text-[#004B87]" />
                    </div>
                    <span className="font-semibold text-slate-700 text-sm">Médias por Campo</span>
                  </div>
                  <div className="space-y-3">
                    {GRADES_CONFIG.map((cfg) => {
                      const Icon = cfg.icon;
                      const avg = grades.length > 0
                        ? grades.reduce((sum, g) => sum + (g[cfg.key as keyof StudentGrade] as number), 0) / grades.length
                        : 0;
                      return (
                        <div key={cfg.key} className="flex items-center gap-2">
                          <Icon className="h-4 w-4 flex-shrink-0" style={{ color: cfg.color }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between text-xs text-slate-500 mb-0.5">
                              <span>{cfg.label} ({cfg.weight}%)</span>
                              <span className="font-bold" style={{ color: getGradeColor(avg) }}>{avg.toFixed(1)}</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full">
                              <div
                                className="h-1.5 rounded-full"
                                style={{ width: `${(avg / 20) * 100}%`, background: cfg.color }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {periods.find((p) => p.value === selectedPeriod)?.label} · {grades.length} estudante{grades.length !== 1 ? "s" : ""}
            <span className="ml-2 text-slate-300">· Nota máx.: 20 · Mínimo aprovação: 10</span>
            {selectedPeriod === "bimestre4" && (
              <span className="ml-2 text-amber-400 font-medium">· Nível finalizado ao guardar</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium
                hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Fechar
            </button>
            {!isEditMode ? (
              <button
                onClick={() => setIsEditMode(true)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#F5821F] hover:bg-[#e06a10]
                  text-white text-sm font-semibold transition-colors shadow-sm"
              >
                <Pencil className="h-4 w-4" />
                Editar Notas
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving || isLoading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#004B87] hover:bg-[#003868]
                  text-white text-sm font-semibold transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSaving
                  ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando…</>
                  : <><Save className="h-4 w-4" />Salvar Notas</>
                }
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* ── Success Modal ── */}
    <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
      <DialogContent className="w-[95vw] max-w-sm p-0 overflow-hidden rounded-2xl flex flex-col gap-0 [&>button]:hidden border-0 shadow-2xl">
        {/* Green header */}
        <div className="bg-gradient-to-r from-[#059669] to-[#047857] px-5 py-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-white font-bold text-base">Notas guardadas!</h3>
          <p className="text-green-100 text-xs mt-1">{savedPeriodLabel} · {classData?.name}</p>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]" />

        <div className="bg-slate-50 px-5 py-4 space-y-3">
          {/* Warning — always shown */}
          <div className="flex items-start gap-3 p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
            <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-800 mb-0.5">Atenção aos Prazos</p>
              <p className="text-[11px] text-amber-700 leading-relaxed">
                Respeite os prazos de lançamento das <strong>avaliações</strong> estabelecidos pela instituição.
                Notas lançadas fora do prazo podem não ser consideradas.
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-500 text-center">
            As notas foram registadas com sucesso no sistema.
          </p>
        </div>

        <div className="bg-white border-t border-slate-100 px-5 py-3 flex justify-center">
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-6 py-2 rounded-xl text-sm font-bold text-white
              bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46]
              shadow-md transition-all"
          >
            Entendido
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </>
  );
}
