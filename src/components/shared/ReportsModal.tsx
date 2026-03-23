// src/components/shared/ReportsModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DateInput } from "@/components/ui/date-input";
import { cn } from "@/lib/utils";
import classService, { Class } from "@/services/classService";
import teacherService, { Teacher } from "@/services/teacherService";
import studentService from "@/services/studentService";
import apiClient from "@/services/api";
import {
  BarChart3, Download, Users, BookOpen, DollarSign,
  Calendar, TrendingUp, Activity, Printer, ChevronRight,
  FileText, Loader2, AlertCircle, CheckCircle2, X
} from "lucide-react";

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateReport?: (reportType: string, filters: any) => void;
}

const REPORT_TYPES = [
  {
    id: "students-performance",
    title: "Desempenho dos Estudantes",
    description: "Notas, frequência e progressão",
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "financial",
    title: "Relatório Financeiro",
    description: "Pagamentos, inadimplência e receitas",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    id: "classes-overview",
    title: "Visão Geral das Turmas",
    description: "Ocupação e estatísticas por turma",
    icon: BookOpen,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "teachers-performance",
    title: "Performance dos Docentes",
    description: "Avaliação e estatísticas",
    icon: Activity,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    id: "attendance",
    title: "Relatório de Frequência",
    description: "Presença e faltas detalhadas",
    icon: Calendar,
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "enrollment-trends",
    title: "Tendências de Matrícula",
    description: "Crescimento e sazonalidade",
    icon: TrendingUp,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
];

type ReportRow = Record<string, string | number>;

interface ReportResult {
  title: string;
  columns: string[];
  rows: ReportRow[];
  summary?: { label: string; value: string | number }[];
}

export function ReportsModal({ isOpen, onClose, onGenerateReport }: ReportsModalProps) {
  const [selectedReport, setSelectedReport] = useState("financial");
  const [filters, setFilters] = useState({ startDate: "", endDate: "", classId: "", teacherId: "", status: "all" });

  // Dados reais
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(false);

  // Estado do relatório
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar turmas e professores reais ao abrir
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoadingFilters(true);
      try {
        const [cls, tch] = await Promise.all([
          classService.getAll(),
          teacherService.getAll(),
        ]);
        setClasses(cls);
        setTeachers(tch);
      } catch {
        // silencioso — não bloqueia o modal
      } finally {
        setLoadingFilters(false);
      }
    };
    load();
  }, [isOpen]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(v);

  const formatDate = (d: string) => {
    if (!d) return "–";
    try { return new Date(d).toLocaleDateString("pt-BR"); } catch { return d; }
  };

  const generateReport = async () => {
    setIsGenerating(true);
    setError(null);
    setReportResult(null);
    try {
      let result: ReportResult;

      switch (selectedReport) {
        case "financial": {
          const res = await apiClient.get("/api/student-payments/index.php");
          const payments: any[] = res.data.data || res.data || [];
          const filtered = payments.filter((p: any) => {
            if (filters.startDate && p.payment_date < filters.startDate) return false;
            if (filters.endDate && p.payment_date > filters.endDate) return false;
            if (filters.status !== "all") {
              if (filters.status === "active" && p.status !== "paid") return false;
              if (filters.status === "inactive" && p.status === "paid") return false;
            }
            return true;
          });
          const total = filtered.reduce((s: number, p: any) => s + Number(p.amount_paid || 0), 0);
          const pending = filtered.filter((p: any) => p.status === "pending").reduce((s: number, p: any) => s + Number(p.amount_paid || 0), 0);
          result = {
            title: "Relatório Financeiro",
            summary: [
              { label: "Total Arrecadado", value: formatCurrency(total) },
              { label: "Pendente", value: formatCurrency(pending) },
              { label: "Total de Pagamentos", value: filtered.length },
            ],
            columns: ["Estudante", "Valor", "Data", "Status", "Método"],
            rows: filtered.slice(0, 50).map((p: any) => ({
              "Estudante": p.student_name || `Est. #${p.student_id}`,
              "Valor": formatCurrency(Number(p.amount_paid || 0)),
              "Data": formatDate(p.payment_date),
              "Status": p.status === "paid" ? "Pago" : p.status === "pending" ? "Pendente" : p.status,
              "Método": p.payment_method || "–",
            })),
          };
          break;
        }

        case "students-performance": {
          const students = await studentService.getAll();
          const filtered = students.filter((s: any) => {
            if (filters.status === "active" && s.status !== "active") return false;
            if (filters.status === "inactive" && s.status === "active") return false;
            return true;
          });
          result = {
            title: "Desempenho dos Estudantes",
            summary: [
              { label: "Total de Estudantes", value: filtered.length },
              { label: "Activos", value: filtered.filter((s: any) => s.status === "active").length },
            ],
            columns: ["Nome", "Email", "Curso", "Status", "Data de Inscrição"],
            rows: filtered.slice(0, 50).map((s: any) => ({
              "Nome": s.name || s.nome || "–",
              "Email": s.email || "–",
              "Curso": s.course_name || s.curso || "–",
              "Status": s.status === "active" ? "Activo" : s.status === "inactive" ? "Inactivo" : s.status,
              "Data de Inscrição": formatDate(s.enrollment_date || s.created_at),
            })),
          };
          break;
        }

        case "classes-overview": {
          const allClasses = classes.length > 0 ? classes : await classService.getAll();
          const filtered = filters.teacherId
            ? allClasses.filter((c: any) => String(c.teacher_id) === filters.teacherId)
            : allClasses;
          const totalStudents = filtered.reduce((s: number, c: any) => s + Number(c.students || 0), 0);
          result = {
            title: "Visão Geral das Turmas",
            summary: [
              { label: "Total de Turmas", value: filtered.length },
              { label: "Total de Estudantes", value: totalStudents },
            ],
            columns: ["Turma", "Docente", "Estudantes", "Capacidade", "Status"],
            rows: filtered.map((c: any) => ({
              "Turma": c.name || "–",
              "Docente": c.teacher_name || "–",
              "Estudantes": c.students ?? 0,
              "Capacidade": c.capacity ?? "–",
              "Status": c.status === "active" ? "Activa" : c.status === "inactive" ? "Inactiva" : c.status || "–",
            })),
          };
          break;
        }

        case "teachers-performance": {
          const allTeachers = teachers.length > 0 ? teachers : await teacherService.getAll();
          const filtered = filters.status === "all"
            ? allTeachers
            : allTeachers.filter((t) => filters.status === "active" ? t.status === "ativo" : t.status !== "ativo");
          result = {
            title: "Performance dos Docentes",
            summary: [
              { label: "Total de Docentes", value: filtered.length },
              { label: "Activos", value: filtered.filter((t) => t.status === "ativo").length },
            ],
            columns: ["Nome", "Email", "Especialidade", "Contrato", "Status"],
            rows: filtered.map((t) => ({
              "Nome": t.nome || "–",
              "Email": t.email || "–",
              "Especialidade": t.especialidade || "–",
              "Contrato": t.tipo_contrato?.replace("_", " ") || "–",
              "Status": t.status === "ativo" ? "Activo" : "Inactivo",
            })),
          };
          break;
        }

        case "enrollment-trends": {
          const res = await apiClient.get("/api/matriculas.php");
          const regs: any[] = res.data.data || res.data || [];
          const filtered = regs.filter((r: any) => {
            if (filters.startDate && r.enrollment_date < filters.startDate) return false;
            if (filters.endDate && r.enrollment_date > filters.endDate) return false;
            return true;
          });
          result = {
            title: "Tendências de Matrícula",
            summary: [
              { label: "Total de Matrículas", value: filtered.length },
              { label: "Activas", value: filtered.filter((r: any) => r.status === "active").length },
            ],
            columns: ["Estudante", "Curso", "Turma", "Data", "Status"],
            rows: filtered.slice(0, 50).map((r: any) => ({
              "Estudante": r.student_name || `Est. #${r.student_id}`,
              "Curso": r.course_name || "–",
              "Turma": r.class_name || "–",
              "Data": formatDate(r.enrollment_date),
              "Status": r.status === "active" ? "Activa" : r.status,
            })),
          };
          break;
        }

        default: {
          result = {
            title: REPORT_TYPES.find(r => r.id === selectedReport)?.title || "Relatório",
            columns: ["Info"],
            rows: [{ "Info": "Relatório não implementado ainda." }],
          };
        }
      }

      setReportResult(result);
      if (onGenerateReport) onGenerateReport(selectedReport, filters);
    } catch (e: any) {
      setError("Erro ao gerar relatório. Verifique a conexão com o servidor.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!reportResult) return;
    const win = window.open("", "_blank");
    if (!win) return;
    const rows = reportResult.rows
      .map(row => `<tr>${reportResult.columns.map(c => `<td style="padding:8px 12px;border-bottom:1px solid #e2e8f0">${row[c] ?? "–"}</td>`).join("")}</tr>`)
      .join("");
    const summary = reportResult.summary
      ? reportResult.summary.map(s => `<div style="display:inline-block;margin:0 16px 8px 0;padding:8px 16px;background:#f1f5f9;border-radius:8px"><strong>${s.label}:</strong> ${s.value}</div>`).join("")
      : "";
    win.document.write(`
      <html><head><title>${reportResult.title}</title>
      <style>body{font-family:Arial,sans-serif;padding:32px;color:#1e293b}h1{color:#004B87}table{width:100%;border-collapse:collapse}th{background:#004B87;color:white;padding:10px 12px;text-align:left}tr:hover{background:#f8fafc}</style>
      </head><body>
      <h1>${reportResult.title}</h1>
      <p style="color:#64748b">Gerado em ${new Date().toLocaleString("pt-BR")} — Oxford School System</p>
      <div style="margin:16px 0">${summary}</div>
      <table><thead><tr>${reportResult.columns.map(c => `<th>${c}</th>`).join("")}</tr></thead><tbody>${rows}</tbody></table>
      </body></html>
    `);
    win.document.close();
    win.print();
  };

  const handleClose = () => {
    setReportResult(null);
    setError(null);
    setSelectedReport("financial");
    setFilters({ startDate: "", endDate: "", classId: "", teacherId: "", status: "all" });
    onClose();
  };

  const selectedType = REPORT_TYPES.find(r => r.id === selectedReport)!;
  const needsClass = ["students-performance", "classes-overview", "attendance"].includes(selectedReport);
  const needsTeacher = ["teachers-performance", "classes-overview"].includes(selectedReport);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        hideCloseButton
        className="max-w-5xl h-[85vh] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl flex flex-col"
      >
        <DialogTitle className="sr-only">Gerar Relatório</DialogTitle>

        <div className="flex h-full overflow-hidden">
          {/* ── Sidebar esquerda ── */}
          <div className="w-64 flex-shrink-0 bg-gradient-to-b from-[#004B87] to-[#003868] flex flex-col p-6 text-white">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BarChart3 className="text-white h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-base leading-none">Relatórios</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Oxford System</span>
              </div>
            </div>

            <p className="text-[11px] text-blue-300 uppercase tracking-widest font-semibold mb-3">Tipo de Relatório</p>
            <nav className="space-y-1 flex-1 overflow-y-auto">
              {REPORT_TYPES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelectedReport(r.id); setReportResult(null); setError(null); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left",
                    selectedReport === r.id
                      ? "bg-white/15 text-white ring-1 ring-white/20"
                      : "text-blue-200/70 hover:text-white hover:bg-white/8"
                  )}
                >
                  <div className={cn(
                    "p-1.5 rounded-lg flex-shrink-0",
                    selectedReport === r.id ? "bg-[#F5821F]" : "bg-white/10"
                  )}>
                    <r.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold leading-tight truncate">{r.title}</p>
                    <p className="text-[10px] opacity-60 truncate">{r.description}</p>
                  </div>
                  {selectedReport === r.id && <ChevronRight className="h-3 w-3 ml-auto flex-shrink-0" />}
                </button>
              ))}
            </nav>

            <button
              onClick={handleClose}
              className="mt-6 flex items-center gap-2 text-blue-200/60 hover:text-white text-xs transition-colors"
            >
              <X className="h-4 w-4" /> Fechar
            </button>
          </div>

          {/* ── Conteúdo direito ── */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {/* Header */}
            <div className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("p-2 rounded-xl", selectedType.bg)}>
                  <selectedType.icon className={cn("h-5 w-5", selectedType.color)} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedType.title}</h3>
                  <p className="text-xs text-slate-400">{selectedType.description}</p>
                </div>
              </div>
              {reportResult && (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-[#004B87] hover:bg-[#003868] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  <Printer className="h-4 w-4" /> Imprimir
                </button>
              )}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">

              {/* Filtros */}
              {!reportResult && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
                  <h4 className="font-bold text-slate-700 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#004B87]" /> Filtros
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data Inicial</label>
                      <DateInput
                        value={filters.startDate}
                        onChange={(val) => setFilters(prev => ({ ...prev, startDate: val }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Data Final</label>
                      <DateInput
                        value={filters.endDate}
                        onChange={(val) => setFilters(prev => ({ ...prev, endDate: val }))}
                      />
                    </div>

                    {needsClass && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Turma {loadingFilters && <span className="text-blue-400">(a carregar...)</span>}
                        </label>
                        <select
                          value={filters.classId}
                          onChange={(e) => setFilters(prev => ({ ...prev, classId: e.target.value }))}
                          className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-[#004B87] text-sm bg-white"
                        >
                          <option value="">Todas as turmas</option>
                          {classes.map(c => (
                            <option key={c.id} value={String(c.id)}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {needsTeacher && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Docente {loadingFilters && <span className="text-blue-400">(a carregar...)</span>}
                        </label>
                        <select
                          value={filters.teacherId}
                          onChange={(e) => setFilters(prev => ({ ...prev, teacherId: e.target.value }))}
                          className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-[#004B87] text-sm bg-white"
                        >
                          <option value="">Todos os docentes</option>
                          {teachers.map(t => (
                            <option key={t.id} value={String(t.id)}>{t.nome}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl outline-none focus:border-[#004B87] text-sm bg-white"
                      >
                        <option value="all">Todos</option>
                        <option value="active">Apenas Activos</option>
                        <option value="inactive">Apenas Inactivos</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Erro */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 text-red-700">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Resultados */}
              {reportResult && (
                <div className="space-y-4">
                  {/* Sumário */}
                  {reportResult.summary && (
                    <div className="grid grid-cols-3 gap-3">
                      {reportResult.summary.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 text-center">
                          <p className="text-xl font-bold text-[#004B87]">{s.value}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tabela */}
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                      <p className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {reportResult.rows.length} resultado(s)
                      </p>
                      <button
                        onClick={() => { setReportResult(null); setError(null); }}
                        className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        Refazer filtros
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            {reportResult.columns.map((col) => (
                              <th key={col} className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportResult.rows.length === 0 ? (
                            <tr>
                              <td colSpan={reportResult.columns.length} className="text-center py-10 text-slate-400">
                                Nenhum resultado encontrado para os filtros seleccionados.
                              </td>
                            </tr>
                          ) : (
                            reportResult.rows.map((row, i) => (
                              <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/60 transition-colors">
                                {reportResult.columns.map((col) => (
                                  <td key={col} className="px-5 py-3 text-slate-700">{row[col] ?? "–"}</td>
                                ))}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <div className="flex items-center gap-3">
                {reportResult && (
                  <button
                    onClick={() => { setReportResult(null); setError(null); }}
                    className="px-6 py-2.5 rounded-xl border-2 border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                  >
                    Novo Relatório
                  </button>
                )}
                {!reportResult && (
                  <button
                    onClick={generateReport}
                    disabled={isGenerating}
                    className="px-6 py-2.5 rounded-xl bg-[#004B87] hover:bg-[#003868] text-white font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-60"
                  >
                    {isGenerating ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> A gerar...</>
                    ) : (
                      <><Download className="h-4 w-4" /> Gerar Relatório</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
