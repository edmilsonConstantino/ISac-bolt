// src/components/StudentDashboard.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  MessageCircle,
  Trophy,
  Clock,
  Star,
  LogOut,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
  HelpCircle,
  Settings,
  GraduationCap,
  Zap,
  Bell
} from "lucide-react";

import { useStudentData } from "@/hooks/useData";
import { usePaymentData } from "@/hooks/usePaymentData";
import { StudentFinanceModal } from "@/components/Students/StudentFinanceModal";
import { useAuthStore } from "@/store/authStore";
import classService, { Class as ServiceClass } from "@/services/classService";
import gradeService, { StudentGrade } from "@/services/gradeService";

interface StudentDashboardProps {
  onLogout?: () => void;
}

export function StudentDashboard({ onLogout }: StudentDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const currentStudentId = user?.id ?? undefined;
  const { getStudentById } = useStudentData();
  const { getStudentReadOnlyInfo, recordPayment } = usePaymentData();

  const [paymentModal, setPaymentModal]       = useState(false);
  const [studentClass, setStudentClass]       = useState<ServiceClass | null>(null);
  const [studentGrades, setStudentGrades]     = useState<StudentGrade[]>([]);
  const [gradesLoading, setGradesLoading]     = useState(false);

  useEffect(() => {
    if (!currentStudentId) return;
    classService.getByStudent(currentStudentId).then(classes => {
      if (classes.length > 0) setStudentClass(classes[0]);
    });
  }, [currentStudentId]);

  useEffect(() => {
    if (!studentClass?.id || !currentStudentId) return;
    setGradesLoading(true);
    gradeService.getByStudent(studentClass.id, currentStudentId)
      .then(setStudentGrades)
      .finally(() => setGradesLoading(false));
  }, [studentClass?.id, currentStudentId]);

  const studentData = currentStudentId ? getStudentById(currentStudentId) : null;
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username
    : 'Visitante';

  const paymentInfo = getStudentReadOnlyInfo(
    currentStudentId ?? 0,
    displayName,
    studentData?.level ?? '—'
  );

  const PERIOD_LABEL: Record<number, string> = {
    1: '1st Period', 2: '2nd Period', 3: '3rd Period', 4: '4th Period', 5: 'Final'
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(amount);

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-emerald-600";
    if (grade >= 7) return "text-amber-600";
    return "text-red-600";
  };

  const getGradeBg = (grade: number) => {
    if (grade >= 9) return "bg-emerald-50 border-emerald-200";
    if (grade >= 7) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  };

  const getPaymentStatusColor = () => {
    if (paymentInfo.overduePayments.length > 0) return "text-red-600";
    if (paymentInfo.currentBalance > 0) return "text-emerald-600";
    return "text-emerald-600";
  };

  const getPaymentStatusText = () => {
    if (paymentInfo.overduePayments.length > 0) return "Em Atraso";
    if (paymentInfo.currentBalance > 0) return "Com Crédito";
    return "Em Dia";
  };

  const gradesWithFinal  = studentGrades.filter(g => g.final_grade !== null);
  const averageGrade = gradesWithFinal.length
    ? (gradesWithFinal.reduce((s, g) => s + Number(g.final_grade), 0) / gradesWithFinal.length).toFixed(1)
    : '—';

  const quickActions = [
    { id: 'payment', label: 'Ver Situação Financeira', icon: DollarSign,  color: 'text-emerald-600', bg: 'hover:bg-emerald-50 hover:border-emerald-400' },
    { id: 'support', label: 'Falar com Suporte',       icon: HelpCircle,  color: 'text-purple-600',  bg: 'hover:bg-purple-50 hover:border-purple-400'  },
    { id: 'profile', label: 'Atualizar Perfil',         icon: Settings,    color: 'text-[#004B87]',   bg: 'hover:bg-blue-50 hover:border-[#004B87]'     },
  ];

  const handleQuickAction = (actionId: string) => {
    if (actionId === 'payment') setPaymentModal(true);
    if (actionId === 'support') window.open('https://wa.me/258840000000', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">

      {/* ── Header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#004B87] via-[#003868] to-[#004B87] backdrop-blur-lg bg-opacity-95 border-b border-blue-900/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">

            {/* Logo */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-xl lg:rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-10 w-10 lg:h-12 lg:w-12 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 p-1">
                  <img src="/image.png" alt="ISAC Logo" className="h-full w-full object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] bg-clip-text text-transparent">ISAC</h1>
                <p className="text-xs lg:text-sm text-slate-300 font-medium tracking-wide">Portal do Estudante</p>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Status Online */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#003868] rounded-full border border-emerald-500/30">
                <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-white font-medium">Online</span>
              </div>

              <button className="relative h-9 w-9 bg-[#003868] hover:bg-[#002850] rounded-lg flex items-center justify-center transition-colors">
                <Bell className="h-4 w-4 text-slate-200" />
                {paymentInfo.overduePayments.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {paymentInfo.overduePayments.length}
                  </span>
                )}
              </button>

              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-[#003868] rounded-lg hover:bg-[#002850] transition-colors cursor-pointer">
                <div className="h-9 w-9 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white text-sm leading-tight truncate max-w-[140px]">{displayName}</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" />
                    Estudante
                  </p>
                </div>
              </div>

              <button
                onClick={async () => { try { await logout(); if (onLogout) onLogout(); } catch (e) { console.error(e); } }}
                className="h-9 w-9 bg-[#003868] hover:bg-red-600/20 rounded-lg flex items-center justify-center text-slate-200 hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]"></div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[65px] lg:h-[85px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* ── Welcome Banner ── */}
        <div className="mb-6 lg:mb-8 bg-gradient-to-r from-[#3B5998] via-[#5B7BB8] to-[#E07B5F] rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-1">
              Bem-vindo, {displayName}!
            </h2>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#FF9933]" />
              <span className="text-white/90 text-sm">
                Turma: <span className="font-semibold">{studentClass?.name ?? studentData?.level ?? '—'}</span>
              </span>
            </div>
          </div>
          <div className="sm:w-64">
            <div className="flex justify-between text-xs text-white/80 mb-1.5">
              <span>Progresso Geral</span>
              <span className="font-semibold text-white">{studentData?.progress ?? 0}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] h-2.5 rounded-full transition-all"
                style={{ width: `${studentData?.progress ?? 0}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="dashboard" className="space-y-5">
          <TabsList className="grid w-full grid-cols-4 h-auto p-1">
            {[
              { value: 'dashboard', label: 'Dashboard',  icon: BarChart3     },
              { value: 'finance',   label: 'Financeiro', icon: DollarSign    },
              { value: 'grades',    label: 'Notas',      icon: Trophy        },
              { value: 'ai-chat',   label: 'IA Chat',    icon: MessageCircle },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* ══════════════════════════════
              TAB — DASHBOARD
          ══════════════════════════════ */}
          <TabsContent value="dashboard" className="space-y-5">

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Média */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:border-[#004B87]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Média Geral</span>
                  <div className="h-9 w-9 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#004B87]">{averageGrade}</p>
                <p className="text-xs text-emerald-600 font-medium mt-1">Excelente desempenho!</p>
              </div>

              {/* Financeiro */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Situação Financeira</span>
                  <div className="h-9 w-9 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                  </div>
                </div>
                <p className={`text-2xl font-bold ${getPaymentStatusColor()}`}>
                  {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">{getPaymentStatusText()}</p>
              </div>

              {/* Turma */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm hover:border-[#004B87]/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Minha Turma</span>
                  <div className="h-9 w-9 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center">
                    <Clock className="h-4 w-4 text-[#004B87]" />
                  </div>
                </div>
                <p className="text-lg font-bold text-slate-800 truncate">
                  {studentClass?.name ?? '—'}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {studentClass?.schedule_days
                    ? `${studentClass.schedule_days} · ${studentClass.start_time ?? ''}`
                    : studentClass ? 'Ver horário na secretaria' : 'Nenhuma turma atribuída'}
                </p>
              </div>

              {/* Pendências */}
              <div className={`border-2 rounded-2xl p-5 shadow-sm transition-colors ${
                paymentInfo.overduePayments.length > 0
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white border-slate-100 hover:border-emerald-300'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pendências</span>
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center ${
                    paymentInfo.overduePayments.length > 0 ? 'bg-red-100 border-red-300' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <FileText className={`h-4 w-4 ${paymentInfo.overduePayments.length > 0 ? 'text-red-500' : 'text-slate-400'}`} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${paymentInfo.overduePayments.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {paymentInfo.overduePayments.length}
                </p>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {paymentInfo.overduePayments.length > 0 ? 'Pagamentos atrasados' : 'Tudo em dia!'}
                </p>
              </div>
            </div>

            {/* Resumo + Ações Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Resumo Acadêmico */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">Resumo Académico</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Turma',           value: studentClass?.name ?? '—',             color: 'text-[#004B87]'  },
                    { label: 'Presença',        value: `${studentData?.attendance ?? '—'}%`,  color: 'text-emerald-600' },
                    { label: 'Média Actual',    value: averageGrade,                           color: 'text-[#004B87]'  },
                    { label: 'Progresso',       value: `${studentData?.progress ?? 0}%`,       color: 'text-blue-600'   },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-white border-2 border-slate-100 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-8 w-8 bg-[#F5821F] rounded-lg flex items-center justify-center">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-800">Ações Rápidas</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4 ml-10">Acesso rápido às funcionalidades essenciais</p>
                <div className="space-y-2.5">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 border-2 border-slate-100 rounded-xl text-left text-sm font-medium text-slate-700 transition-all ${action.bg}`}
                      >
                        <Icon className={`h-5 w-5 flex-shrink-0 ${action.color}`} />
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Alertas */}
            {paymentInfo.overduePayments.length > 0 && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-red-100 border border-red-300 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-800 text-sm">Atenção: Pagamentos em Atraso</h4>
                  <p className="text-xs text-red-600 mt-0.5">
                    {paymentInfo.overduePayments.length} pagamento(s) em atraso — Total: {formatCurrency(paymentInfo.overduePayments.reduce((s, p) => s + p.amount, 0))}
                  </p>
                </div>
                <Button onClick={() => setPaymentModal(true)} className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-4 rounded-xl">
                  Ver Detalhes
                </Button>
              </div>
            )}

            {paymentInfo.currentBalance > 0 && paymentInfo.overduePayments.length === 0 && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-10 w-10 bg-emerald-100 border border-emerald-300 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-emerald-800 text-sm">Parabéns! Tem créditos disponíveis</h4>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Saldo positivo de {formatCurrency(paymentInfo.currentBalance)} em pagamentos antecipados.
                  </p>
                </div>
                <Button onClick={() => setPaymentModal(true)} variant="outline" className="border-emerald-300 text-emerald-700 text-xs h-9 px-4 rounded-xl hover:bg-emerald-100">
                  Ver Histórico
                </Button>
              </div>
            )}
          </TabsContent>

          {/* ══════════════════════════════
              TAB — FINANCEIRO
          ══════════════════════════════ */}
          <TabsContent value="finance" className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Saldo Actual',
                  value: formatCurrency(Math.abs(paymentInfo.currentBalance)),
                  sub: paymentInfo.currentBalance >= 0 ? 'Crédito disponível' : 'Valor em débito',
                  icon: paymentInfo.currentBalance >= 0 ? TrendingUp : TrendingDown,
                  color: paymentInfo.currentBalance >= 0 ? 'text-emerald-600' : 'text-red-600',
                  bg: paymentInfo.currentBalance >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
                  iconBg: paymentInfo.currentBalance >= 0 ? 'bg-emerald-100 border-emerald-300' : 'bg-red-100 border-red-300',
                },
                {
                  label: 'Total Pago',
                  value: formatCurrency(paymentInfo.totalPaid),
                  sub: 'Pagamentos realizados',
                  icon: CheckCircle,
                  color: 'text-emerald-600',
                  bg: 'bg-white border-slate-100',
                  iconBg: 'bg-emerald-50 border-emerald-200',
                },
                {
                  label: 'Mensalidade',
                  value: formatCurrency(paymentInfo.monthlyFee),
                  sub: 'Valor mensal',
                  icon: CreditCard,
                  color: 'text-[#004B87]',
                  bg: 'bg-white border-slate-100',
                  iconBg: 'bg-blue-50 border-blue-200',
                },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`border-2 rounded-2xl p-5 shadow-sm ${card.bg}`}>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.label}</span>
                      <div className={`h-9 w-9 border rounded-xl flex items-center justify-center ${card.iconBg}`}>
                        <Icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                    </div>
                    <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{card.sub}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center">
                  <Receipt className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Últimos Pagamentos</h3>
                  <p className="text-xs text-slate-400">Histórico recente de pagamentos</p>
                </div>
              </div>
              <div className="p-5 space-y-2">
                {paymentInfo.paymentHistory.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{payment.monthReference} — {formatCurrency(payment.amount)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{payment.description}</p>
                    </div>
                    <Badge className={
                      payment.status === 'paid'    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      payment.status === 'overdue' ? 'bg-red-100 text-red-700 border border-red-200'             :
                      payment.status === 'advance' ? 'bg-blue-100 text-blue-700 border border-blue-200'           :
                                                     'bg-amber-100 text-amber-700 border border-amber-200'
                    }>
                      {payment.status === 'paid' ? 'Pago' : payment.status === 'overdue' ? 'Em Atraso' : payment.status === 'advance' ? 'Antecipado' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
                {paymentInfo.paymentHistory.length === 0 && (
                  <p className="text-center text-sm text-slate-400 py-6">Nenhum pagamento registado</p>
                )}
              </div>
              <div className="px-5 pb-5">
                <Button onClick={() => setPaymentModal(true)} variant="outline" className="w-full border-2 border-[#004B87]/20 text-[#004B87] hover:bg-[#004B87] hover:text-white rounded-xl transition-all">
                  Ver Histórico Completo
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════
              TAB — NOTAS
          ══════════════════════════════ */}
          <TabsContent value="grades" className="space-y-4">
            <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">My Grades</h3>
                    <p className="text-xs text-slate-400">
                      {studentClass ? studentClass.name : 'No class assigned'}
                    </p>
                  </div>
                </div>
                <div className="bg-[#004B87] text-white text-sm font-bold px-3 py-1 rounded-lg">
                  Average: {averageGrade}
                </div>
              </div>

              <div className="p-5">
                {/* No class */}
                {!studentClass && (
                  <div className="py-10 text-center text-slate-400">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">You are not assigned to any class yet.</p>
                  </div>
                )}

                {/* Loading */}
                {studentClass && gradesLoading && (
                  <div className="py-10 flex justify-center">
                    <div className="h-6 w-6 border-2 border-[#004B87]/30 border-t-[#004B87] rounded-full animate-spin" />
                  </div>
                )}

                {/* No grades yet */}
                {studentClass && !gradesLoading && studentGrades.length === 0 && (
                  <div className="py-10 text-center text-slate-400">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No grades recorded yet.</p>
                  </div>
                )}

                {/* Grades by period */}
                {!gradesLoading && studentGrades.length > 0 && (
                  <div className="space-y-4">
                    {studentGrades
                      .slice()
                      .sort((a, b) => a.period_number - b.period_number)
                      .map((g) => {
                        const fg = Number(g.final_grade ?? 0);
                        return (
                          <div
                            key={g.id ?? g.period_number}
                            className={`border-2 rounded-xl p-4 ${getGradeBg(fg)}`}
                          >
                            {/* Period header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <div className={`h-3 w-3 rounded-full ${
                                  fg >= 7 ? 'bg-emerald-500' : fg >= 5 ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                                <span className="font-semibold text-slate-800 text-sm">
                                  {PERIOD_LABEL[g.period_number] ?? `Period ${g.period_number}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-2xl font-bold ${getGradeColor(fg)}`}>
                                  {g.final_grade !== null ? Number(g.final_grade).toFixed(1) : '—'}
                                </span>
                                {g.status && (
                                  <Badge className={gradeService.getStatusBadge(g.status)}>
                                    {gradeService.getStatusLabel(g.status)}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Sub-grades */}
                            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-slate-600">
                              {g.components_grade !== null && (
                                <span>Assessments: <strong>{Number(g.components_grade).toFixed(1)}</strong></span>
                              )}
                              {g.skills_grade !== null && (
                                <span>Skills: <strong>{Number(g.skills_grade).toFixed(1)}</strong></span>
                              )}
                              {g.attendance !== null && (
                                <span>Attendance: <strong>{g.attendance}%</strong></span>
                              )}
                            </div>

                            {/* Notes */}
                            {g.strengths && (
                              <div className="mt-2 pt-2 border-t border-white/60 text-xs text-slate-600">
                                <span className="font-semibold">Strengths: </span>{g.strengths}
                              </div>
                            )}
                            {g.improvements && (
                              <div className="mt-1 text-xs text-slate-600">
                                <span className="font-semibold">To improve: </span>{g.improvements}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ══════════════════════════════
              TAB — IA CHAT
          ══════════════════════════════ */}
          <TabsContent value="ai-chat" className="space-y-4">
            <div className="bg-white border-2 border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <div className="h-8 w-8 bg-gradient-to-br from-[#004B87] to-[#F5821F] rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">IA Assistant — Oxford English Coach</h3>
                  <p className="text-xs text-slate-400">Pratique inglês com a nossa IA</p>
                </div>
              </div>
              <div className="p-5">
                <div className="h-80 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-[#004B87] to-[#F5821F] rounded-2xl flex items-center justify-center shadow-lg">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-700">Chat IA em Desenvolvimento</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-xs">
                      Em breve poderá conversar com a nossa IA para praticar inglês e tirar dúvidas!
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-6 py-2.5 bg-[#004B87]/10 border-2 border-[#004B87]/20 rounded-xl text-[#004B87] text-sm font-semibold opacity-50 cursor-not-allowed"
                  >
                    Iniciar Chat (Em breve)
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* Modal Financeiro */}
      <StudentFinanceModal
        isOpen={paymentModal}
        onClose={() => setPaymentModal(false)}
        studentPaymentInfo={paymentInfo}
      />
    </div>
  );
}
