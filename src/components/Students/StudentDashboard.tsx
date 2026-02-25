// src/components/Students/StudentDashboard.tsx
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Home, BookOpen, DollarSign, User, Users,
  LogOut, Bell, GraduationCap, Trophy, Clock,
  Star, HelpCircle, Settings, AlertTriangle,
  CheckCircle, ChevronRight, Calendar, Loader2,
  CreditCard, Receipt, Phone, MapPin, Shield,
  TrendingUp, Zap, Layers,
} from "lucide-react";

// ── Student progress (level progression) types ──────────────────────────────
interface CurrentLevel {
  id: number;
  level_id: number;
  level_number: number;
  level_name: string;
  course_id: number;
  course_name: string;
  status: 'in_progress' | 'awaiting_renewal' | 'recovery' | 'passed' | 'failed' | 'withdrawn';
  attempt: number;
  start_date: string | null;
  end_date: string | null;
  final_grade: number | null;
  class_name: string | null;
  next_level_id: number | null;
  next_level_name: string | null;
  next_level_number: number | null;
}

interface LevelHistory {
  level_number: number;
  level_name: string;
  status: string;
  final_grade: number | null;
  attempt: number;
  start_date: string | null;
  end_date: string | null;
}

interface StudentProgress {
  success: boolean;
  current_level: CurrentLevel | null;
  history: LevelHistory[];
  total_levels: number;
  levels_passed: number;
  progress_percent: number;
  course_id: number | null;
  course_name: string | null;
}

import { useStudentData } from "@/hooks/useData";
import { usePaymentData } from "@/hooks/usePaymentData";
import { StudentFinanceModal } from "@/components/Students/StudentFinanceModal";
import { useAuthStore } from "@/store/authStore";
import classService, { Class as ServiceClass } from "@/services/classService";
import gradeService, { StudentGrade } from "@/services/gradeService";
import registrationService from "@/services/registrationService";
import { StudentSettingsModal } from "@/components/Students/StudentSettingsModal";

type Tab = "home" | "grades" | "class" | "finance" | "profile";

interface StudentDashboardProps {
  onLogout?: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);

  const currentStudentId = user?.id ?? undefined;
  const { getStudentById }              = useStudentData();
  const { getStudentReadOnlyInfo }      = usePaymentData();

  const [activeTab, setActiveTab]           = useState<Tab>(
    () => (sessionStorage.getItem("student_active_tab") as Tab) || "home"
  );
  const persistTab = (tab: Tab) => {
    sessionStorage.setItem("student_active_tab", tab);
    setActiveTab(tab);
  };
  const [paymentModal, setPaymentModal]     = useState(false);
  const [settingsModal, setSettingsModal]   = useState(false);
  const [settingsTab, setSettingsTab]       = useState<"perfil" | "academico" | "seguranca">("perfil");
  const [studentClass, setStudentClass]     = useState<ServiceClass | null>(null);
  const [studentGrades, setStudentGrades]   = useState<StudentGrade[]>([]);
  const [gradesLoading, setGradesLoading]   = useState(false);
  const [monthlyFee, setMonthlyFee]         = useState<number>(0);
  const [courseNames, setCourseNames]       = useState<string[]>([]);
  const [expandedPeriod, setExpandedPeriod] = useState<number | null>(null);
  const [levelProgress, setLevelProgress]   = useState<StudentProgress | null>(null);

  // ── Load data ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentStudentId) return;
    classService.getByStudent(currentStudentId).then((classes) => {
      if (classes.length > 0) setStudentClass(classes[0]);
    });
    registrationService.getByStudent(currentStudentId).then((regs) => {
      const active = regs.find((r) => r.status === "active");
      if (active) setMonthlyFee(Number(active.monthly_fee || 0));
      const names = regs
        .filter((r) => r.status === "active" && r.course_name)
        .map((r) => r.course_name as string);
      if (names.length > 0) setCourseNames(names);
    }).catch(() => {});
  }, [currentStudentId]);

  useEffect(() => {
    if (!studentClass?.id || !currentStudentId) return;
    setGradesLoading(true);
    gradeService
      .getByStudent(studentClass.id, currentStudentId)
      .then((data) => {
        setStudentGrades(data);
        if (data.length > 0) {
          setExpandedPeriod(Math.max(...data.map((g) => g.period_number)));
        }
      })
      .finally(() => setGradesLoading(false));
  }, [studentClass?.id, currentStudentId]);

  // Fetch academic level progression
  useEffect(() => {
    if (!currentStudentId) return;
    fetch(`/api/student-progress.php?student_id=${currentStudentId}`)
      .then((r) => r.json())
      .then((data: StudentProgress) => {
        if (data.success && (data.current_level || data.history.length > 0)) {
          setLevelProgress(data);
        }
      })
      .catch(() => {/* silently ignore — portal works without progress data */});
  }, [currentStudentId]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const studentData = currentStudentId ? getStudentById(currentStudentId) : null;

  const firstName  = user ? (user.nome || "").trim().split(/\s+/)[0] || user.username || "Estudante" : "Visitante";
  const fullName   = user ? (user.nome || "").trim() || user.username || "Estudante" : "Visitante";

  const paymentInfo = getStudentReadOnlyInfo(currentStudentId ?? 0, fullName, "—");
  const hasOverdue  = paymentInfo.overduePayments.length > 0;

  const gradesWithFinal = studentGrades.filter((g) => g.final_grade !== null);
  const averageGrade    = gradesWithFinal.length
    ? (gradesWithFinal.reduce((s, g) => s + Number(g.final_grade), 0) / gradesWithFinal.length).toFixed(1)
    : null;

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(n);

  const gradeColor = (v: number) =>
    v >= 10 ? "text-emerald-600" : v >= 8 ? "text-blue-600" : "text-red-600";

  const gradeBarColor = (v: number) =>
    v >= 10 ? "bg-emerald-500" : v >= 8 ? "bg-blue-500" : "bg-red-500";

  const scheduleLabel = (s?: string) =>
    s === "manha" ? "Manhã" : s === "tarde" ? "Tarde" : s === "noite" ? "Noite" : s ?? "—";

  const statusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const map: Record<string, { label: string; cls: string }> = {
      passed: { label: "Aprovado",  cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
      failed: { label: "Reprovado", cls: "bg-red-100 text-red-700 border-red-200"             },
    };
    return map[status] ?? null;
  };

  const PERIOD_LABEL: Record<number, string> = {
    1: "1º Bimestre", 2: "2º Bimestre", 3: "3º Bimestre", 4: "4º Bimestre",
  };

  const openSettings = (tab: "perfil" | "academico" | "seguranca" = "perfil") => {
    setSettingsTab(tab);
    setSettingsModal(true);
  };

  // ── Bottom nav tabs ───────────────────────────────────────────────────────────
  const NAV: { id: Tab; icon: typeof Home; label: string }[] = [
    { id: "home",    icon: Home,       label: "Início"  },
    { id: "grades",  icon: Trophy,     label: "Notas"   },
    { id: "class",   icon: Users,      label: "Turma"   },
    { id: "finance", icon: DollarSign, label: "Finanças"},
    { id: "profile", icon: User,       label: "Perfil"  },
  ];

  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* ── Fixed Header ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#004B87] via-[#003868] to-[#004B87] border-b border-blue-900/50 shadow-2xl">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-xl blur-md opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1 transform group-hover:scale-105 transition-transform duration-300">
                <img src="/image.png" alt="ISAC" className="h-full w-full object-contain" />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] bg-clip-text text-transparent leading-none">ISAC</h1>
              <p className="text-[11px] text-slate-300 font-medium tracking-wide leading-none mt-0.5">Portal do Estudante</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => persistTab("finance")}
              className="relative h-9 w-9 bg-[#003868] hover:bg-[#002850] rounded-lg flex items-center justify-center transition-colors"
            >
              <Bell className="h-4 w-4 text-slate-200" />
              {hasOverdue && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {paymentInfo.overduePayments.length}
                </span>
              )}
            </button>
            <button
              onClick={async () => { try { await logout(); if (onLogout) onLogout(); } catch (e) { console.error(e); } }}
              className="h-9 w-9 bg-[#003868] hover:bg-red-600/20 rounded-lg flex items-center justify-center text-slate-200 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Linha laranja em baixo */}
        <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]" />
      </header>

      {/* Spacer */}
      <div className="h-[66px]" />

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <main className="flex-1 pb-20 max-w-2xl mx-auto w-full">

        {/* ══ HOME ══════════════════════════════════════════════════════════════ */}
        {activeTab === "home" && (
          <div className="space-y-4 p-4">

            {/* Welcome card */}
            <div className="bg-gradient-to-r from-[#3B5998] via-[#5B7BB8] to-[#E07B5F] rounded-2xl shadow-lg overflow-hidden">
              {/* Top: greeting + avatar */}
              <div className="flex items-start justify-between px-5 pt-5 pb-3">
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider mb-0.5">Portal do Estudante</p>
                  <h2 className="text-2xl font-bold text-white leading-tight">
                    Bem-vindo, {firstName}!
                  </h2>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-inner flex-shrink-0">
                  {firstName.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Info chips row */}
              <div className="flex items-center gap-2 px-5 pb-4 flex-wrap">
                {courseNames.length > 0 && (
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5">
                    <GraduationCap className="h-3.5 w-3.5 text-[#FF9933] flex-shrink-0" />
                    <span className="text-white text-xs font-semibold">{courseNames.join(" · ")}</span>
                  </div>
                )}
                {studentClass?.name && (
                  <div className="flex items-center gap-1.5 bg-white/15 rounded-lg px-2.5 py-1.5">
                    <Star className="h-3.5 w-3.5 text-[#FF9933] flex-shrink-0" />
                    <span className="text-white text-xs font-semibold">{studentClass.name}</span>
                  </div>
                )}
                {studentClass?.schedule && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1.5">
                    <span className="text-white/80 text-xs">{scheduleLabel(studentClass.schedule)}</span>
                  </div>
                )}
              </div>

              {/* Progress bar — full width at the bottom */}
              <div className="bg-black/10 px-5 py-3">
                <div className="flex justify-between text-xs text-white/80 mb-2">
                  <span className="font-medium">Progresso Geral</span>
                  <span className="font-bold text-white">
                    {studentData?.grade != null ? Math.round(Number(studentData.grade) * 10) : 0}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${studentData?.grade != null ? Math.round(Number(studentData.grade) * 10) : 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Overdue alert */}
            {hasOverdue && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-red-800 text-sm">Pagamentos em atraso</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    {paymentInfo.overduePayments.length} pagamento(s) —{" "}
                    {fmt(paymentInfo.overduePayments.reduce((s, p) => s + p.amount, 0))}
                  </p>
                </div>
                <button
                  onClick={() => persistTab("finance")}
                  className="h-8 px-3 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors flex-shrink-0"
                >
                  Ver
                </button>
              </div>
            )}

            {/* ── Minha Turma Card ──────────────────────────────── */}
            {studentClass ? (
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-[#004B87] rounded-lg flex items-center justify-center">
                      <Users className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">Minha Turma</p>
                  </div>
                  <button
                    onClick={() => persistTab("class")}
                    className="text-xs text-[#004B87] font-semibold flex items-center gap-1 hover:underline"
                  >
                    Ver detalhes <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-800">{studentClass.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                      Activa
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    {levelProgress?.current_level && (
                      <span className="text-xs text-slate-500">
                        <span className="font-semibold text-purple-700">Nível {levelProgress.current_level.level_number}</span>
                        {" · "}{levelProgress.current_level.level_name}
                      </span>
                    )}
                    {studentClass.schedule && (
                      <span className="text-xs text-slate-500">
                        Turno: <span className="font-medium text-slate-700">{scheduleLabel(studentClass.schedule)}</span>
                      </span>
                    )}
                    {studentClass.teacher_name && (
                      <span className="text-xs text-slate-500">
                        Prof. <span className="font-medium text-slate-700">{studentClass.teacher_name}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-2xl border border-slate-100 p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Users className="h-5 w-5 text-slate-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Turma não atribuída</p>
                  <p className="text-xs text-slate-400 mt-0.5">Contacte a secretaria para mais informações</p>
                </div>
              </div>
            )}

            {/* ── Academic Level Progress Card ──────────────────────────────── */}
            {levelProgress && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Layers className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">Percurso Académico</p>
                  </div>
                  {levelProgress.course_name && (
                    <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 rounded-full px-2 py-0.5">
                      {levelProgress.course_name}
                    </span>
                  )}
                </div>

                {/* Awaiting renewal notice */}
                {levelProgress.current_level?.status === 'awaiting_renewal' && (
                  <div className="mx-4 mb-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-800">
                        Parabéns! Aprovado no Nível {levelProgress.current_level.level_number}
                        {levelProgress.current_level.final_grade != null
                          ? ` — Nota: ${Number(levelProgress.current_level.final_grade).toFixed(1)}`
                          : ''}
                      </p>
                      {levelProgress.current_level.next_level_name && (
                        <p className="text-xs text-emerald-700 mt-0.5">
                          Dirija-se à secretaria para renovar a sua matrícula
                          {' '}e iniciar {levelProgress.current_level.next_level_name}.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress bar (level-based) */}
                {levelProgress.total_levels > 0 && (
                  <div className="px-4 pb-3">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                      <span>{levelProgress.levels_passed} de {levelProgress.total_levels} níveis concluídos</span>
                      <span className="font-bold text-purple-700">{levelProgress.progress_percent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${levelProgress.progress_percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Level timeline */}
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {/* History rows */}
                  {levelProgress.history.map((h) => {
                    const isPassed    = h.status === 'passed';
                    const isFailed    = h.status === 'failed';
                    const isWithdrawn = h.status === 'withdrawn';
                    return (
                      <div key={`${h.level_number}-${h.attempt}`} className="flex items-center gap-3 px-4 py-2.5">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                          isPassed    ? 'bg-emerald-100 text-emerald-700'
                          : isFailed  ? 'bg-red-100 text-red-600'
                          : isWithdrawn ? 'bg-slate-100 text-slate-400'
                          : 'bg-slate-100 text-slate-500'
                        }`}>
                          {h.level_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold ${isPassed ? 'text-slate-700' : 'text-slate-400'}`}>
                            {h.level_name}
                            {h.attempt > 1 && <span className="ml-1 text-[10px] text-slate-400">({h.attempt}ª tent.)</span>}
                          </p>
                        </div>
                        {isPassed && h.final_grade != null && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {Number(h.final_grade).toFixed(1)}
                          </span>
                        )}
                        <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                          isPassed    ? 'bg-emerald-100 text-emerald-700'
                          : isFailed  ? 'bg-red-100 text-red-600'
                          : isWithdrawn ? 'bg-slate-100 text-slate-500'
                          : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isPassed ? '✓ Aprovado' : isFailed ? '✗ Reprovado' : isWithdrawn ? 'Desistiu' : h.status}
                        </span>
                      </div>
                    );
                  })}

                  {/* Current level row */}
                  {levelProgress.current_level && (
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-purple-50/50">
                      <div className="h-6 w-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                        {levelProgress.current_level.level_number}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-purple-800">
                          {levelProgress.current_level.level_name}
                          {levelProgress.current_level.class_name && (
                            <span className="ml-1 text-[10px] text-slate-400 font-normal">
                              · {levelProgress.current_level.class_name}
                            </span>
                          )}
                        </p>
                      </div>
                      <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                        levelProgress.current_level.status === 'awaiting_renewal'
                          ? 'bg-emerald-100 text-emerald-700'
                          : levelProgress.current_level.status === 'recovery'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {levelProgress.current_level.status === 'awaiting_renewal' ? '✓ Pronto p/ renovar'
                          : levelProgress.current_level.status === 'recovery' ? 'Recuperação'
                          : 'Em curso'}
                      </span>
                    </div>
                  )}

                  {/* Future levels placeholder */}
                  {levelProgress.total_levels > levelProgress.levels_passed + (levelProgress.current_level ? 1 : 0) && (
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] text-slate-300 font-bold">…</span>
                      </div>
                      <p className="text-xs text-slate-400 italic">
                        {levelProgress.total_levels - levelProgress.levels_passed - (levelProgress.current_level ? 1 : 0)} nível(eis) por completar
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">Ações Rápidas</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Financeiro", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50", action: () => persistTab("finance") },
                  { label: "Suporte",    icon: HelpCircle, color: "text-purple-600",  bg: "bg-purple-50",  action: () => window.open("https://wa.me/258840000000", "_blank") },
                  { label: "Perfil",     icon: Settings,   color: "text-[#004B87]",   bg: "bg-blue-50",    action: () => openSettings("perfil") },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.label}
                      onClick={a.action}
                      className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
                    >
                      <div className={`h-10 w-10 ${a.bg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`h-5 w-5 ${a.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent grades preview */}
            {studentGrades.length > 0 && (
              <div>
                <div className="flex items-center justify-between px-1 mb-3">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Últimas Notas</p>
                  <button onClick={() => persistTab("grades")} className="text-xs text-[#004B87] font-semibold flex items-center gap-1">
                    Ver todas <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-2">
                  {studentGrades
                    .slice()
                    .sort((a, b) => b.period_number - a.period_number)
                    .slice(0, 2)
                    .map((g) => {
                      const fg = Number(g.final_grade ?? 0);
                      const sb = statusBadge(g.status);
                      return (
                        <div
                          key={g.period_number}
                          className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-4"
                        >
                          <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                            fg >= 10 ? "bg-emerald-50" : "bg-red-50"
                          }`}>
                            <span className={gradeColor(fg)}>
                              {g.final_grade !== null ? Number(g.final_grade) : "—"}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 text-sm">
                              {PERIOD_LABEL[g.period_number] ?? `Bimestre ${g.period_number}`}
                            </p>
                            {(g.grade_teste1 != null || g.grade_teste2 != null) && (
                              <p className="text-xs text-slate-400 mt-0.5">
                                T1: {g.grade_teste1 ?? "—"} · T2: {g.grade_teste2 ?? "—"}
                              </p>
                            )}
                          </div>
                          {sb && (
                            <Badge className={`${sb.cls} border text-[10px] flex-shrink-0`}>{sb.label}</Badge>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Academic summary */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 bg-[#004B87] rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-3.5 w-3.5 text-white" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">Resumo Académico</p>
              </div>
              <div className="space-y-2">
                {[
                  { label: "Turno",        value: scheduleLabel(studentClass?.schedule) },
                  { label: "Presença",     value: `${studentData?.attendance ?? "—"}%`  },
                  { label: "Média",        value: averageGrade ?? "—"                   },
                  { label: "Mensalidade",  value: fmt(monthlyFee)                       },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                    <span className="text-xs text-slate-500">{row.label}</span>
                    <span className="text-xs font-bold text-slate-700">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ GRADES ════════════════════════════════════════════════════════════ */}
        {activeTab === "grades" && (
          <div className="space-y-4 p-4">

            {/* Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="h-5 w-5" />
                <h2 className="text-lg font-bold">Minhas Notas</h2>
              </div>
              <p className="text-amber-100 text-sm">{studentClass?.name ?? "Sem turma atribuída"}</p>
              {averageGrade && (
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-4xl font-bold">{averageGrade}</span>
                  <span className="text-amber-200 text-sm">/ 10</span>
                  <Badge className={`ml-2 border text-xs ${
                    Number(averageGrade) >= 10
                      ? "bg-emerald-500/30 text-white border-emerald-300"
                      : "bg-red-500/30 text-white border-red-300"
                  }`}>
                    {Number(averageGrade) >= 10 ? "Aprovado" : "Reprovado"}
                  </Badge>
                </div>
              )}
            </div>

            {/* No class */}
            {!studentClass && (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <Trophy className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">Sem turma atribuída</p>
                <p className="text-xs text-slate-400 mt-1">As suas notas aparecem quando for matriculado numa turma</p>
              </div>
            )}

            {/* Loading */}
            {studentClass && gradesLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-7 w-7 text-amber-500 animate-spin" />
              </div>
            )}

            {/* No grades yet — show 4 placeholder bimester cards */}
            {studentClass && !gradesLoading && studentGrades.length === 0 && (
              <div className="space-y-3">
                {([1, 2, 3, 4] as const).map((num) => (
                  <div key={num} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-4">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xl font-bold text-slate-300">—</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm">
                          {PERIOD_LABEL[num]}
                        </p>
                        <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-400">
                          Aguardando lançamento
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-slate-100 p-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                        Notas do Bimestre
                      </p>
                      <div className="space-y-3">
                        {([
                          { label: "Teste 1",       weight: "20%" },
                          { label: "Teste 2",       weight: "20%" },
                          { label: "Exame Prático", weight: "30%" },
                          { label: "Exame Teórico", weight: "30%" },
                        ]).map((item) => (
                          <div key={item.label} className="flex items-center gap-2.5">
                            <span className="text-xs text-slate-400 w-28 flex-shrink-0">{item.label}</span>
                            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden" />
                            <span className="text-xs font-bold w-8 text-right flex-shrink-0 text-slate-300">—</span>
                            <span className="text-[10px] text-slate-300 w-7 flex-shrink-0">{item.weight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Grade cards — collapsible per period */}
            {!gradesLoading && studentGrades.length > 0 && (
              <div className="space-y-3">
                {studentGrades
                  .slice()
                  .sort((a, b) => a.period_number - b.period_number)
                  .map((g) => {
                    const fg    = Number(g.final_grade ?? 0);
                    const isExp = expandedPeriod === g.period_number;
                    const sb    = statusBadge(g.status);
                    const hasGrades = g.grade_teste1 != null || g.grade_teste2 != null
                      || g.grade_exame_pratico != null || g.grade_exame_teorico != null;

                    return (
                      <div key={g.period_number} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                        {/* Collapsible header */}
                        <button
                          onClick={() => setExpandedPeriod(isExp ? null : g.period_number)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                        >
                          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                            fg >= 10 ? "bg-emerald-100" : "bg-red-100"
                          }`}>
                            <span className={`text-xl font-bold ${gradeColor(fg)}`}>
                              {g.final_grade !== null ? Number(g.final_grade) : "—"}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <p className="font-semibold text-slate-800 text-sm">
                              {PERIOD_LABEL[g.period_number] ?? `Bimestre ${g.period_number}`}
                            </p>
                            {sb && (
                              <Badge className={`${sb.cls} border text-[10px] mt-1.5 inline-flex`}>{sb.label}</Badge>
                            )}
                          </div>

                          <ChevronRight className={`h-4 w-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${isExp ? "rotate-90" : ""}`} />
                        </button>

                        {/* Expanded detail */}
                        {isExp && (
                          <div className="border-t border-slate-100 p-4 space-y-5">

                            {/* 4 grade fields */}
                            {hasGrades && (
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
                                  Notas do Bimestre
                                </p>
                                <div className="space-y-3">
                                  {([
                                    { label: "Teste 1",       value: g.grade_teste1,        weight: "20%" },
                                    { label: "Teste 2",       value: g.grade_teste2,        weight: "20%" },
                                    { label: "Exame Prático", value: g.grade_exame_pratico, weight: "30%" },
                                    { label: "Exame Teórico", value: g.grade_exame_teorico, weight: "30%" },
                                  ] as { label: string; value: number | null | undefined; weight: string }[])
                                    .filter((i) => i.value != null)
                                    .map((item) => {
                                      const v = Number(item.value);
                                      return (
                                        <div key={item.label} className="flex items-center gap-2.5">
                                          <span className="text-xs text-slate-600 w-28 flex-shrink-0">{item.label}</span>
                                          <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all ${gradeBarColor(v)}`}
                                              style={{ width: `${(v / 10) * 100}%` }}
                                            />
                                          </div>
                                          <span className={`text-xs font-bold w-8 text-right flex-shrink-0 ${gradeColor(v)}`}>
                                            {v.toFixed(1)}
                                          </span>
                                          <span className="text-[10px] text-slate-400 w-7 flex-shrink-0">{item.weight}</span>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            )}

                            {/* Attendance */}
                            {g.attendance != null && (
                              <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Frequência</p>
                                <div className="flex items-center gap-3">
                                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                  <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${Number(g.attendance) >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                                      style={{ width: `${Math.min(Number(g.attendance), 100)}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-bold w-10 text-right flex-shrink-0 ${Number(g.attendance) >= 75 ? "text-emerald-600" : "text-red-600"}`}>
                                    {Number(g.attendance).toFixed(0)}%
                                  </span>
                                </div>
                                {Number(g.attendance) < 75 && (
                                  <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3" /> Frequência abaixo do mínimo (75%)
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Teacher feedback */}
                            {(g.strengths || g.improvements) && (
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Feedback do Professor</p>
                                {g.strengths && (
                                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Pontos Fortes</p>
                                    <p className="text-xs text-slate-700">{g.strengths}</p>
                                  </div>
                                )}
                                {g.improvements && (
                                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <p className="text-[10px] font-bold text-amber-600 uppercase mb-1">A Melhorar</p>
                                    <p className="text-xs text-slate-700">{g.improvements}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* ══ CLASS ═════════════════════════════════════════════════════════════ */}
        {activeTab === "class" && (
          <div className="space-y-4 p-4">

            {/* Header */}
            <div className="bg-gradient-to-r from-[#004B87] to-[#5B7BB8] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5" />
                <h2 className="text-lg font-bold">Minha Turma</h2>
              </div>
              <p className="text-blue-200 text-sm">Horários e informações da turma</p>
            </div>

            {!studentClass ? (
              <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                <Users className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500 font-medium text-sm">Sem turma atribuída</p>
                <p className="text-xs text-slate-400 mt-1">Contacte a secretaria para mais informações</p>
              </div>
            ) : (
              <>
                {/* Class card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800">{studentClass.name}</h3>
                      {studentClass.curso && (
                        <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {studentClass.curso}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 flex-shrink-0">
                      Activa
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    {([
                      { icon: Clock,      label: "Turno",    value: scheduleLabel(studentClass.schedule)           },
                      { icon: Calendar,   label: "Dias",     value: studentClass.schedule_days ?? "—"              },
                      { icon: Clock,      label: "Horário",  value: studentClass.start_time && studentClass.end_time
                          ? `${studentClass.start_time} – ${studentClass.end_time}`
                          : studentClass.start_time ?? "—"                                                          },
                      { icon: Layers,     label: "Nível",    value: levelProgress?.current_level
                          ? `Nível ${levelProgress.current_level.level_number} — ${levelProgress.current_level.level_name}`
                          : "—"                                                                                      },
                      { icon: TrendingUp, label: "Professor",value: studentClass.teacher_name ?? "A atribuir"     },
                    ] as { icon: typeof Clock; label: string; value: string }[]).map((row) => {
                      const Icon = row.icon;
                      return (
                        <div key={row.label} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                          <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Icon className="h-4 w-4 text-slate-500" />
                          </div>
                          <span className="text-sm text-slate-500 flex-1">{row.label}</span>
                          <span className="text-sm font-semibold text-slate-800 text-right max-w-[55%] truncate">{row.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Schedule visual */}
                {studentClass.schedule_days && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Horário Semanal</p>
                    <div className="flex gap-2 flex-wrap">
                      {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => {
                        const active = studentClass.schedule_days?.toLowerCase().includes(day.toLowerCase()) ||
                          (day === "Seg" && /segunda|seg\b/i.test(studentClass.schedule_days ?? "")) ||
                          (day === "Ter" && /terça|ter\b/i.test(studentClass.schedule_days ?? "")) ||
                          (day === "Qua" && /quarta|qua\b/i.test(studentClass.schedule_days ?? "")) ||
                          (day === "Qui" && /quinta|qui\b/i.test(studentClass.schedule_days ?? "")) ||
                          (day === "Sex" && /sexta|sex\b/i.test(studentClass.schedule_days ?? "")) ||
                          (day === "Sáb" && /sábado|sab\b/i.test(studentClass.schedule_days ?? ""));
                        return (
                          <div key={day} className={`h-10 w-12 rounded-xl flex items-center justify-center text-xs font-semibold transition-colors ${
                            active ? "bg-[#004B87] text-white shadow-sm" : "bg-slate-100 text-slate-400"
                          }`}>
                            {day}
                          </div>
                        );
                      })}
                    </div>
                    {studentClass.start_time && (
                      <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {studentClass.start_time}{studentClass.end_time ? ` – ${studentClass.end_time}` : ""}
                        {" · "}{scheduleLabel(studentClass.schedule)}
                      </p>
                    )}
                  </div>
                )}

                {/* Contact */}
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">Contactos</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => window.open("https://wa.me/258840000000", "_blank")}
                      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
                    >
                      <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Secretaria</p>
                        <p className="text-[10px] text-slate-400">WhatsApp</p>
                      </div>
                    </button>
                    <button
                      onClick={() => openSettings("perfil")}
                      className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
                    >
                      <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Settings className="h-5 w-5 text-[#004B87]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">Configurações</p>
                        <p className="text-[10px] text-slate-400">Perfil e senha</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ FINANCE ═══════════════════════════════════════════════════════════ */}
        {activeTab === "finance" && (
          <div className="space-y-4 p-4">

            {/* Header */}
            <div className={`rounded-2xl p-5 text-white shadow-lg ${
              hasOverdue ? "bg-gradient-to-r from-red-500 to-red-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-5 w-5" />
                <h2 className="text-lg font-bold">Situação Financeira</h2>
              </div>
              <p className={`text-sm ${hasOverdue ? "text-red-100" : "text-emerald-100"}`}>
                {hasOverdue
                  ? `${paymentInfo.overduePayments.length} pagamento(s) em atraso`
                  : "Tudo em dia! Conta regularizada."}
              </p>
              <div className="mt-3">
                <span className="text-3xl font-bold">{fmt(Math.abs(paymentInfo.currentBalance))}</span>
                <span className={`text-xs ml-2 ${hasOverdue ? "text-red-200" : "text-emerald-200"}`}>
                  {paymentInfo.currentBalance >= 0 ? "crédito disponível" : "em débito"}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-xs text-slate-500">Total Pago</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{fmt(paymentInfo.totalPaid)}</p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 bg-blue-50 rounded-xl flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs text-slate-500">Mensalidade</span>
                </div>
                <p className="text-lg font-bold text-slate-800">{fmt(monthlyFee)}</p>
              </div>
            </div>

            {/* Payment history */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-slate-500" />
                  <h3 className="font-semibold text-slate-800 text-sm">Histórico de Pagamentos</h3>
                </div>
              </div>
              <div className="divide-y divide-slate-50">
                {paymentInfo.paymentHistory.length === 0 ? (
                  <p className="text-center text-sm text-slate-400 py-8">Nenhum pagamento registado</p>
                ) : (
                  paymentInfo.paymentHistory.slice(0, 5).map((payment) => (
                    <div key={payment.id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        payment.status === "paid" ? "bg-emerald-50" :
                        payment.status === "overdue" ? "bg-red-50" : "bg-amber-50"
                      }`}>
                        {payment.status === "paid"
                          ? <CheckCircle className="h-4 w-4 text-emerald-600" />
                          : payment.status === "overdue"
                          ? <AlertTriangle className="h-4 w-4 text-red-600" />
                          : <Clock className="h-4 w-4 text-amber-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700 truncate">{payment.monthReference}</p>
                        <p className="text-xs text-slate-400 truncate">{payment.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-slate-800">{fmt(payment.amount)}</p>
                        <p className={`text-[10px] font-medium ${
                          payment.status === "paid" ? "text-emerald-600" :
                          payment.status === "overdue" ? "text-red-600" : "text-amber-600"
                        }`}>
                          {payment.status === "paid" ? "Pago" : payment.status === "overdue" ? "Atrasado" : "Pendente"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4">
                <button
                  onClick={() => setPaymentModal(true)}
                  className="w-full py-3 rounded-xl border-2 border-[#004B87]/20 text-[#004B87] text-sm font-semibold hover:bg-[#004B87] hover:text-white transition-all"
                >
                  Ver Histórico Completo
                </button>
              </div>
            </div>

            {/* Payment methods */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Como Pagar</p>
              <div className="space-y-2">
                {[
                  { icon: Phone,      label: "M-Pesa / E-Mola",       desc: "Carteira móvel",            color: "text-green-600", bg: "bg-green-50"  },
                  { icon: CreditCard, label: "Transferência Bancária", desc: "Para conta ISAC",           color: "text-blue-600",  bg: "bg-blue-50"   },
                  { icon: MapPin,     label: "Pagamento Presencial",   desc: "Na secretaria da escola",   color: "text-purple-600",bg: "bg-purple-50" },
                ].map((m) => {
                  const Icon = m.icon;
                  return (
                    <div key={m.label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                      <div className={`h-8 w-8 ${m.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-4 w-4 ${m.color}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">{m.label}</p>
                        <p className="text-xs text-slate-400">{m.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ══ PROFILE ═══════════════════════════════════════════════════════════ */}
        {activeTab === "profile" && (
          <div className="space-y-4 p-4">

            {/* Avatar card */}
            <div className="bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-inner">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">{fullName}</h2>
                  <p className="text-blue-200 text-sm font-mono">@{user?.username ?? "—"}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className="bg-white/20 text-white border-white/30 border text-[10px]">
                      <GraduationCap className="h-3 w-3 mr-1" /> Estudante
                    </Badge>
                    {courseNames[0] && (
                      <Badge className="bg-white/20 text-white border-white/30 border text-[10px]">
                        {courseNames[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Academic info */}
            {(courseNames.length > 0 || studentClass) && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informação Académica</p>
                <div className="space-y-1">
                  {courseNames.map((name, i) => (
                    <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50">
                      <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-4 w-4 text-[#004B87]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">Curso</p>
                        <p className="text-sm font-semibold text-slate-700 truncate">{name}</p>
                      </div>
                    </div>
                  ))}
                  {studentClass && (
                    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50">
                      <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">Turma</p>
                        <p className="text-sm font-semibold text-slate-700">{studentClass.name}</p>
                      </div>
                    </div>
                  )}
                  {levelProgress?.current_level && (
                    <div className="flex items-center gap-3 py-2.5">
                      <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Layers className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">Nível Actual</p>
                        <p className="text-sm font-semibold text-slate-700">
                          Nível {levelProgress.current_level.level_number} — {levelProgress.current_level.level_name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings menu */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1 mb-3">Conta & Configurações</p>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {[
                  { icon: User,          label: "Meu Perfil", desc: "Ver e editar dados pessoais", color: "text-[#004B87]",   bg: "bg-blue-50",   action: () => openSettings("perfil")                              },
                  { icon: Shield,        label: "Segurança",  desc: "Alterar senha da conta",      color: "text-amber-600",  bg: "bg-amber-50",  action: () => openSettings("seguranca")                           },
                  { icon: GraduationCap, label: "Académico",  desc: "Níveis e progressão",         color: "text-purple-600", bg: "bg-purple-50", action: () => openSettings("academico")                           },
                  { icon: HelpCircle,    label: "Suporte",    desc: "Falar com a secretaria",      color: "text-green-600",  bg: "bg-green-50",  action: () => window.open("https://wa.me/258840000000", "_blank") },
                ].map((item, idx, arr) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      onClick={item.action}
                      className={`w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 active:bg-slate-100 transition-colors text-left ${
                        idx < arr.length - 1 ? "border-b border-slate-100" : ""
                      }`}
                    >
                      <div className={`h-10 w-10 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                        <p className="text-xs text-slate-400">{item.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* App info */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#004B87] rounded-xl flex items-center justify-center p-1.5">
                  <img src="/image.png" alt="ISAC" className="h-full w-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">ISAC Portal</p>
                  <p className="text-xs text-slate-400">Versão 1.0 · 2026</p>
                </div>
              </div>
              <Zap className="h-4 w-4 text-slate-300" />
            </div>

            {/* Logout */}
            <button
              onClick={async () => { try { await logout(); if (onLogout) onLogout(); } catch (e) { console.error(e); } }}
              className="w-full flex items-center justify-center gap-2 py-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 font-semibold text-sm hover:bg-red-100 active:bg-red-200 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Terminar Sessão
            </button>

            <div className="h-2" />
          </div>
        )}

      </main>

      {/* ── Bottom Navigation ─────────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl">
        <div className="max-w-2xl mx-auto">
          <div className="flex">
            {NAV.map((tab) => {
              const Icon     = tab.icon;
              const isActive = activeTab === tab.id;
              const hasAlert = tab.id === "finance" && hasOverdue;
              return (
                <button
                  key={tab.id}
                  onClick={() => persistTab(tab.id)}
                  className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative transition-colors ${
                    isActive ? "text-[#004B87]" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {hasAlert && (
                    <span className="absolute top-2.5 right-[calc(50%-10px)] h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
                  )}
                  <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`text-[10px] transition-all ${isActive ? "font-bold text-[#004B87]" : "font-medium"}`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-[#004B87] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Modals ────────────────────────────────────────────────────────────── */}
      <StudentFinanceModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        studentPaymentInfo={paymentInfo}
      />
      <StudentSettingsModal
        isOpen={settingsModal}
        initialTab={settingsTab}
        onClose={() => { setSettingsModal(false); setSettingsTab("perfil"); }}
      />
    </div>
  );
}
