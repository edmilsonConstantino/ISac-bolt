import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  FileText,
  BookOpen,
  GraduationCap,
  Trophy,
  AlertCircle,
  Loader2,
  ChevronDown,
  Pen,
} from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle } from "@/components/ui/page-header";
import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ListFooter } from "@/components/ui/info-row";
import gradeService, { StudentGrade } from "@/services/gradeService";

/** @deprecated — kept for backward compatibility, no longer used */
export interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  course: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  status: string;
  observations?: string;
}

interface GradesListProps {
  classId?: number;
  /** @deprecated — ignored, data comes from classId */
  grades?: Grade[];
}

const PERIOD_LABEL: Record<number, string> = {
  1: "1º Bimestre", 2: "2º Bimestre", 3: "3º Bimestre", 4: "4º Bimestre",
};

export function GradesList({ classId }: GradesListProps) {
  const [grades, setGrades]           = useState<StudentGrade[]>([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [searchTerm, setSearchTerm]   = useState("");
  const [periodFilter, setPeriodFilter] = useState<number | "all">("all");

  useEffect(() => {
    if (!classId) return;
    setIsLoading(true);
    gradeService
      .getByClass(classId)
      .then(setGrades)
      .catch(() => setGrades([]))
      .finally(() => setIsLoading(false));
  }, [classId]);

  // Filter
  const filtered = grades.filter((g) => {
    const name = (g.student_name ?? "").toLowerCase();
    const matchSearch = !searchTerm || name.includes(searchTerm.toLowerCase());
    const matchPeriod = periodFilter === "all" || g.period_number === periodFilter;
    return matchSearch && matchPeriod;
  });

  // Stats
  const withGrades = grades.filter((g) => g.final_grade !== null);
  const approved   = withGrades.filter((g) => (g.final_grade ?? 0) >= 10).length;
  const failed     = withGrades.filter((g) => (g.final_grade ?? 0) < 10).length;
  const avgGrade   = withGrades.length
    ? withGrades.reduce((s, g) => s + Number(g.final_grade), 0) / withGrades.length
    : 0;

  const gradeColor = (v: number) =>
    v >= 10 ? "text-emerald-600" : v >= 8 ? "text-blue-600" : "text-red-600";

  const gradeBarColor = (v: number) =>
    v >= 10 ? "bg-emerald-500" : v >= 8 ? "bg-blue-500" : "bg-red-500";

  if (!classId) {
    return (
      <EmptyState
        icon={Award}
        title="Selecione uma turma"
        description="Escolha uma turma para visualizar as notas dos estudantes"
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-200/60">
        <PageHeader className="bg-transparent p-0 border-0 rounded-none mb-4">
          <div>
            <PageHeaderTitle icon={<Award className="h-7 w-7" />}>
              Notas da Turma
            </PageHeaderTitle>
            <PageHeaderSubtitle>
              {withGrades.length} nota{withGrades.length !== 1 ? "s" : ""} registada{withGrades.length !== 1 ? "s" : ""}
            </PageHeaderSubtitle>
          </div>
        </PageHeader>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-[#004B87]">{grades.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Registos</p>
          </div>
          <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
            <p className="text-2xl font-bold text-[#F5821F]">{avgGrade.toFixed(1)}</p>
            <p className="text-xs text-slate-500 mt-0.5">Média / 10</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 text-center">
            <p className="text-2xl font-bold text-emerald-700">{approved}</p>
            <p className="text-xs text-emerald-600 mt-0.5">Aprovados</p>
          </div>
          <div className="bg-red-50 rounded-xl p-3 border border-red-200 text-center">
            <p className="text-2xl font-bold text-red-700">{failed}</p>
            <p className="text-xs text-red-600 mt-0.5">Reprovados</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          placeholder="Buscar por estudante…"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <div className="relative">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="appearance-none w-full sm:w-auto bg-white border border-slate-200 rounded-xl
              text-sm text-slate-700 pl-3 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#004B87]/20
              focus:border-[#004B87] cursor-pointer"
          >
            <option value="all">Todos os Bimestres</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{PERIOD_LABEL[n]}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-7 w-7 text-[#004B87] animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!isLoading && filtered.length === 0 && (
        <EmptyState
          icon={Award}
          title="Sem notas registadas"
          description={searchTerm || periodFilter !== "all"
            ? "Tente ajustar os filtros"
            : "As notas aparecem após o professor as lançar"}
        />
      )}

      {/* Table */}
      {!isLoading && filtered.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3">Estudante</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Bimestre</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3 text-[#004B87]" />T1 <span className="text-slate-400">(20%)</span>
                    </div>
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <FileText className="h-3 w-3 text-[#0066B3]" />T2 <span className="text-slate-400">(20%)</span>
                    </div>
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <Pen className="h-3 w-3 text-emerald-600" />Ex.Prát. <span className="text-slate-400">(30%)</span>
                    </div>
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <BookOpen className="h-3 w-3 text-purple-600" />Ex.Teór. <span className="text-slate-400">(30%)</span>
                    </div>
                  </th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Final</th>
                  <th className="text-center text-xs font-semibold text-slate-500 px-3 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((g) => {
                  const fg  = g.final_grade !== null ? Number(g.final_grade) : null;
                  const initials = (g.student_name ?? "?")
                    .split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();

                  return (
                    <tr key={`${g.student_id}-${g.period_number}`} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#004B87] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{g.student_name ?? "—"}</p>
                            <p className="text-xs text-slate-400">{g.class_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-xs font-medium text-slate-500">
                          {PERIOD_LABEL[g.period_number] ?? `Bimestre ${g.period_number}`}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {g.grade_teste1 != null ? (
                          <div>
                            <div className="h-1.5 w-12 mx-auto bg-slate-100 rounded-full mb-1">
                              <div className={`h-full rounded-full ${gradeBarColor(Number(g.grade_teste1))}`}
                                style={{ width: `${(Number(g.grade_teste1) / 10) * 100}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${gradeColor(Number(g.grade_teste1))}`}>
                              {Number(g.grade_teste1).toFixed(1)}
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {g.grade_teste2 != null ? (
                          <div>
                            <div className="h-1.5 w-12 mx-auto bg-slate-100 rounded-full mb-1">
                              <div className={`h-full rounded-full ${gradeBarColor(Number(g.grade_teste2))}`}
                                style={{ width: `${(Number(g.grade_teste2) / 10) * 100}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${gradeColor(Number(g.grade_teste2))}`}>
                              {Number(g.grade_teste2).toFixed(1)}
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {g.grade_exame_pratico != null ? (
                          <div>
                            <div className="h-1.5 w-12 mx-auto bg-slate-100 rounded-full mb-1">
                              <div className={`h-full rounded-full ${gradeBarColor(Number(g.grade_exame_pratico))}`}
                                style={{ width: `${(Number(g.grade_exame_pratico) / 10) * 100}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${gradeColor(Number(g.grade_exame_pratico))}`}>
                              {Number(g.grade_exame_pratico).toFixed(1)}
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {g.grade_exame_teorico != null ? (
                          <div>
                            <div className="h-1.5 w-12 mx-auto bg-slate-100 rounded-full mb-1">
                              <div className={`h-full rounded-full ${gradeBarColor(Number(g.grade_exame_teorico))}`}
                                style={{ width: `${(Number(g.grade_exame_teorico) / 10) * 100}%` }} />
                            </div>
                            <span className={`text-sm font-bold ${gradeColor(Number(g.grade_exame_teorico))}`}>
                              {Number(g.grade_exame_teorico).toFixed(1)}
                            </span>
                          </div>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {fg !== null ? (
                          <span className={`text-lg font-bold ${gradeColor(fg)}`}>{fg}</span>
                        ) : <span className="text-slate-300 text-sm">—</span>}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {g.status === "passed" ? (
                          <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] gap-1">
                            <Trophy className="h-2.5 w-2.5" />Aprovado
                          </Badge>
                        ) : g.status === "failed" ? (
                          <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px] gap-1">
                            <AlertCircle className="h-2.5 w-2.5" />Reprovado
                          </Badge>
                        ) : (
                          <Badge className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px]">
                            <GraduationCap className="h-2.5 w-2.5 mr-0.5" />Em curso
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <ListFooter
          showing={filtered.length}
          total={grades.length}
          hasFilters={!!(searchTerm || periodFilter !== "all")}
          onClearFilters={() => {
            setSearchTerm("");
            setPeriodFilter("all");
          }}
        />
      )}
    </div>
  );
}
