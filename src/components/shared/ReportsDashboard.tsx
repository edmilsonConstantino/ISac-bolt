// src/components/shared/ReportsDashboard.tsx
import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, DollarSign, AlertTriangle,
  Users, ClipboardList, Loader2, RefreshCw, FileText,
  CheckCircle, Calendar,
} from "lucide-react";
import { ReportsModal } from "./ReportsModal";

interface FinancialKpis {
  today:                  { revenue: number; payment_count: number };
  this_month:             { revenue: number; payment_count: number };
  this_year:              { revenue: number; payment_count: number };
  overdue:                { total_amount: number; student_count: number };
  enrollments_this_month: number;
  students_total:         number;
}

const fmt = (n: number) =>
  "MT " + new Intl.NumberFormat("pt-MZ", { minimumFractionDigits: 2 }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `MT ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `MT ${(n / 1_000).toFixed(1)}K`;
  return fmt(n);
};

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

function KpiCard({ label, value, sub, icon, color, bg, border }: KpiCardProps) {
  return (
    <div className={`bg-white rounded-2xl border-2 ${border} shadow-sm p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        <div className={`h-9 w-9 ${bg} rounded-xl flex items-center justify-center`}>
          <div className={color}>{icon}</div>
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function handleGenerateReport(_type: string, _filters: any) {
  // Placeholder — the ReportsModal handles its own data fetching
}

export function ReportsDashboard() {
  const [kpis, setKpis]               = useState<FinancialKpis | null>(null);
  const [loading, setLoading]         = useState(true);
  const [reportsModal, setReportsModal] = useState(false);
  const [lastUpdated, setLastUpdated]  = useState<Date | null>(null);

  const loadKpis = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const res  = await fetch("/api/reports.php?type=financial_kpis", {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setKpis(data);
        setLastUpdated(new Date());
      }
    } catch {
      // silently ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadKpis(); }, []);

  const today = new Date().toLocaleDateString("pt-MZ", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center shadow-md">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#004B87]">Relatórios e Estatísticas</h1>
            <p className="text-xs text-slate-400 capitalize">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-xs text-slate-400">
              Actualizado: {lastUpdated.toLocaleTimeString("pt-MZ", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <button
            onClick={loadKpis}
            disabled={loading}
            className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-[#004B87] transition-colors"
            title="Actualizar"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !kpis ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#004B87]" />
        </div>
      ) : kpis ? (
        <>
          {/* ── KPI Cards ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              label="Arrecadado Hoje"
              value={fmtShort(kpis.today.revenue)}
              sub={`${kpis.today.payment_count} pagamento(s)`}
              icon={<DollarSign className="h-5 w-5" />}
              color="text-emerald-600"
              bg="bg-emerald-50"
              border="border-emerald-100"
            />
            <KpiCard
              label="Este Mês"
              value={fmtShort(kpis.this_month.revenue)}
              sub={`${kpis.this_month.payment_count} pagamento(s)`}
              icon={<Calendar className="h-5 w-5" />}
              color="text-blue-600"
              bg="bg-blue-50"
              border="border-blue-100"
            />
            <KpiCard
              label="Este Ano"
              value={fmtShort(kpis.this_year.revenue)}
              sub={`${kpis.this_year.payment_count} pagamento(s)`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="text-[#004B87]"
              bg="bg-blue-50"
              border="border-blue-100"
            />
            <KpiCard
              label="Em Atraso"
              value={fmtShort(kpis.overdue.total_amount)}
              sub={`${kpis.overdue.student_count} estudante(s)`}
              icon={<AlertTriangle className="h-5 w-5" />}
              color={kpis.overdue.total_amount > 0 ? "text-red-600" : "text-slate-400"}
              bg={kpis.overdue.total_amount > 0 ? "bg-red-50" : "bg-slate-50"}
              border={kpis.overdue.total_amount > 0 ? "border-red-100" : "border-slate-100"}
            />
          </div>

          {/* ── Operational Stats ───────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Visão Geral Operacional
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{kpis.enrollments_this_month}</p>
                  <p className="text-xs text-slate-400">Matrículas este mês</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">{kpis.students_total}</p>
                  <p className="text-xs text-slate-400">Total de estudantes</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-800">
                    {fmt(kpis.this_month.revenue)}
                  </p>
                  <p className="text-xs text-slate-400">Total exacto este mês</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Detailed Reports Button ─────────────────────────────── */}
          <div className="bg-gradient-to-r from-[#004B87] via-[#003868] to-[#004B87] rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-white">
              <FileText className="h-6 w-6 text-[#F5821F]" />
              <div>
                <p className="font-bold">Relatórios Detalhados</p>
                <p className="text-xs text-blue-200">Desempenho, frequência, tendências de matrícula e mais</p>
              </div>
            </div>
            <button
              onClick={() => setReportsModal(true)}
              className="px-5 py-2.5 bg-[#F5821F] hover:bg-[#E07318] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 flex-shrink-0"
            >
              <BarChart3 className="h-4 w-4" />
              Ver Relatórios
            </button>
          </div>
        </>
      ) : (
        <div className="py-20 text-center text-slate-400">
          <BarChart3 className="h-10 w-10 mx-auto mb-2 text-slate-200" />
          <p>Não foi possível carregar os dados</p>
          <button onClick={loadKpis} className="mt-3 text-sm text-[#004B87] underline">
            Tentar novamente
          </button>
        </div>
      )}

      {/* ── Reports Modal ────────────────────────────────────────── */}
      <ReportsModal
        isOpen={reportsModal}
        onClose={() => setReportsModal(false)}
        onGenerateReport={handleGenerateReport}
      />
    </div>
  );
}
