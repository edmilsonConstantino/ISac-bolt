// src/components/shared/registration-student-modal/tabs/PaymentTab.tsx

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Calendar, CalendarDays, CreditCard, DollarSign, Info, Sparkles, Clock, GraduationCap } from "lucide-react";
import type {
  NivelItem,
  CourseItem,
  RegistrationFormData,
  RegistrationStatus,
} from "../types/registrationModal.types";

type RetroPolicy = "from_entry" | "retroactive";

interface PaymentTabProps {
  formData: RegistrationFormData;
  onChangeField: (field: keyof RegistrationFormData, value: unknown) => void;
  formatCurrency: (value: number) => string;
  selectedNivel?: NivelItem | null;
  selectedCourse?: CourseItem | null;
  /** Data de início da turma YYYY-MM-DD (turma.data_inicio) */
  classStartDate?: string;
  /** Data da matrícula YYYY-MM-DD (formData.enrollmentDate) */
  enrollmentDate?: string;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d ?? 1);
}

function monthStart(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function fmtMonthLong(d: Date): string {
  return d.toLocaleDateString("pt-PT", { month: "long", year: "numeric" });
}

function fmtDateShort(d: Date): string {
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" });
}

export function PaymentTab({
  formData,
  onChangeField,
  formatCurrency,
  selectedNivel,
  selectedCourse,
  classStartDate,
  enrollmentDate,
}: PaymentTabProps) {
  const [retroPolicy, setRetroPolicy] = useState<RetroPolicy>("from_entry");

  const isBolsista    = Boolean(formData.isBolsista);
  const bolsaTipo     = (formData.bolsaTipo     ?? "total") as "total" | "parcial" | "custom";
  const bolsaMotivo   = (formData.bolsaMotivo   ?? "merit") as "merit" | "institutional" | "social";
  const bolsaDesconto = Number(formData.bolsaDesconto ?? 100);
  const enrollmentFee = Number(formData.enrollmentFee ?? 0);
  const monthlyFee    = Number(formData.monthlyFee ?? 0);

  // Effective discount pct (0 when not bolsista)
  const discountPct = isBolsista
    ? (bolsaTipo === "total" ? 100 : bolsaTipo === "parcial" ? 50 : Math.max(0, Math.min(100, bolsaDesconto)))
    : 0;
  const effectiveMonthly = Math.max(0, Math.round(monthlyFee * (1 - discountPct / 100) * 100) / 100);

  // ── Duração em meses ────────────────────────────────────────────────────
  // Cursos com níveis → duracao_meses do nível
  // Cursos sem níveis → duracao_valor do curso (campo do backend)
  const duracao = useMemo<number>(() => {
    const raw = selectedCourse as Record<string, unknown> | null | undefined;
    if (Number(raw?.tem_niveis) > 0) {
      return Number(selectedNivel?.duracao_meses ?? 0);
    }
    return Number(raw?.duracao_valor ?? raw?.duracao_meses ?? 0);
  }, [selectedNivel, selectedCourse]);

  // ── Turma já iniciou? (data_inicio <= hoje) ──────────────────────────────
  const classHasStarted = useMemo<boolean>(() => {
    if (!classStartDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parseDate(classStartDate) <= today;
  }, [classStartDate]);

  // ── Entrada tardia? ──────────────────────────────────────────────────────
  const isLateEntry = useMemo<boolean>(() => {
    if (!classStartDate || !enrollmentDate) return false;
    return parseDate(enrollmentDate) > parseDate(classStartDate);
  }, [classStartDate, enrollmentDate]);

  // ── Gerar meses do calendário ────────────────────────────────────────────
  const months = useMemo(() => {
    if (!classStartDate || duracao === 0) return [];

    const base: Date =
      retroPolicy === "retroactive" || !enrollmentDate
        ? monthStart(parseDate(classStartDate))
        : monthStart(parseDate(enrollmentDate));

    const enrollBase = enrollmentDate
      ? monthStart(parseDate(enrollmentDate))
      : null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const started = parseDate(classStartDate) <= today;

    return Array.from({ length: duracao }, (_, i) => {
      const ms = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const due = new Date(ms.getFullYear(), ms.getMonth(), 10);
      const isRetro =
        retroPolicy === "retroactive" && enrollBase !== null && ms < enrollBase;

      // Se a turma ainda não iniciou → todos os meses são "previsão"
      // Se já iniciou → pendente / atraso conforme a data
      const expectedStatus: "scheduled" | "pending" | "overdue" = !started
        ? "scheduled"
        : isRetro && due < today
          ? "overdue"
          : "pending";

      return {
        index: i + 1,
        monthStart: ms,
        dueDate: due,
        monthLabel: fmtMonthLong(ms),
        dueDateLabel: fmtDateShort(due),
        amount: monthlyFee,
        isRetro,
        expectedStatus,
      };
    });
  }, [classStartDate, enrollmentDate, duracao, monthlyFee, retroPolicy]);

  // ── Total do curso ──────────────────────────────────────────────────────
  // Bolsista → mensalidades isentas (amount_due = 0); apenas taxa de matrícula é cobrada
  const totalCurso = useMemo(() => {
    const fee = formData.enrollmentFeeIsento ? 0 : enrollmentFee;
    return fee + effectiveMonthly * duracao;
  }, [enrollmentFee, effectiveMonthly, duracao, formData.enrollmentFeeIsento]);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

      {/* ── Valores: Taxa + Mensalidade ──────────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Taxa de Matrícula */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-[#F5821F] rounded-lg">
              <CreditCard className="h-5 w-5" />
            </div>
            <Label className="font-bold text-slate-700 leading-none">
              Taxa de Matrícula (MZN)
            </Label>
          </div>

          {formData.enrollmentFeeIsento ? (
            <div className="h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center px-4">
              <span className="text-amber-700 font-bold">Isento</span>
            </div>
          ) : (
            <>
              <div className="h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center px-4">
                <span className="text-lg font-bold text-[#F5821F]">
                  {formatCurrency(enrollmentFee)}
                </span>
              </div>
              <p className="text-xs text-slate-500">Valor definido no curso (não editável)</p>
            </>
          )}
        </div>

        {/* Mensalidade */}
        <div className={cn(
          "p-6 bg-white rounded-3xl border shadow-sm space-y-4 transition-all",
          isBolsista ? "border-purple-200 bg-purple-50/40" : "border-slate-100"
        )}>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn("p-2 rounded-lg", isBolsista ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700")}>
              <DollarSign className="h-5 w-5" />
            </div>
            <Label className="font-bold text-slate-700 leading-none">
              Mensalidade (MZN)
            </Label>
          </div>

          {isBolsista ? (
            <div className="rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-between px-4 h-12">
              <span className="text-purple-700 font-bold">
                {discountPct >= 100 ? "Isento" : `${formatCurrency(effectiveMonthly)} (−${discountPct}%)`}
              </span>
              {discountPct < 100 && (
                <span className="text-sm text-purple-400 line-through">{formatCurrency(monthlyFee)}</span>
              )}
            </div>
          ) : (
            <div className="h-12 rounded-xl bg-green-50 border border-green-200 flex items-center px-4">
              <span className="text-lg font-bold text-green-700">
                {formatCurrency(monthlyFee)}
              </span>
            </div>
          )}
          <p className="text-xs text-slate-500">
            {isBolsista
              ? discountPct >= 100
                ? "Mensalidade isenta por bolsa total"
                : `Desconto de ${discountPct}% por bolsa de estudo`
              : monthlyFee > 0
                ? `${formatCurrency(monthlyFee)}/mês · ${duracao > 0 ? `${duracao} meses` : "duração não definida"}`
                : "Valor definido no curso (não editável)"}
          </p>
        </div>
      </div>

      {/* ── Bolsa de Estudo ───────────────────────────────────────────── */}
      <div className={cn(
        "rounded-2xl border-2 transition-all overflow-hidden",
        isBolsista ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-white"
      )}>
        {/* Toggle row */}
        <div
          className="flex items-center justify-between p-4 cursor-pointer select-none"
          onClick={() => onChangeField("isBolsista", !isBolsista)}
        >
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", isBolsista ? "bg-purple-200 text-purple-700" : "bg-slate-100 text-slate-500")}>
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Estudante Bolsista</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isBolsista ? "Bolsa activa — configure o tipo e motivo abaixo" : "Activar para aplicar bolsa de estudo nesta matrícula"}
              </p>
            </div>
          </div>
          <div className={cn("relative w-11 h-6 rounded-full transition-colors shrink-0", isBolsista ? "bg-purple-500" : "bg-slate-200")}>
            <div className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all", isBolsista ? "left-5" : "left-0.5")} />
          </div>
        </div>

        {/* Sub-fields — only when bolsista active */}
        {isBolsista && (
          <div className="px-4 pb-4 space-y-4 border-t border-purple-200 pt-4">

            {/* Tipo de Bolsa */}
            <div>
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Tipo de Bolsa</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "total",   label: "Total",   sub: "100% isento" },
                  { value: "parcial", label: "Parcial",  sub: "50% desconto" },
                  { value: "custom",  label: "Personalizado", sub: "% à escolha" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeField("bolsaTipo", opt.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      bolsaTipo === opt.value
                        ? "border-purple-500 bg-purple-100"
                        : "border-slate-200 bg-white hover:border-purple-300"
                    )}
                  >
                    <p className={cn("text-xs font-bold", bolsaTipo === opt.value ? "text-purple-800" : "text-slate-700")}>{opt.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {/* Custom discount input */}
              {bolsaTipo === "custom" && (
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-slate-600 font-medium whitespace-nowrap">Desconto %</label>
                  <input
                    type="number"
                    min={1}
                    max={99}
                    value={bolsaDesconto}
                    onChange={e => onChangeField("bolsaDesconto", Math.max(1, Math.min(99, Number(e.target.value))))}
                    className="w-20 h-8 px-2 text-sm border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                  />
                  <span className="text-xs text-slate-500">→ paga {formatCurrency(effectiveMonthly)}/mês</span>
                </div>
              )}
            </div>

            {/* Motivo */}
            <div>
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">Motivo da Bolsa</p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "merit",         label: "Mérito",        sub: "Desempenho académico" },
                  { value: "institutional", label: "Institucional",  sub: "Parceria institucional" },
                  { value: "social",        label: "Social",         sub: "Carência económica" },
                ] as const).map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChangeField("bolsaMotivo", opt.value)}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      bolsaMotivo === opt.value
                        ? "border-purple-500 bg-purple-100"
                        : "border-slate-200 bg-white hover:border-purple-300"
                    )}
                  >
                    <p className={cn("text-xs font-bold", bolsaMotivo === opt.value ? "text-purple-800" : "text-slate-700")}>{opt.label}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Calendário de Pagamentos ─────────────────────────────────── */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Header do calendário */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Calendário de Pagamentos</h3>
              <p className="text-xs text-slate-400">
                {duracao > 0
                  ? `${duracao} mensalidades · vencimento todo dia 10`
                  : "Selecione um curso com duração definida"}
              </p>
            </div>
          </div>

          {/* Toggle retroativo — visível apenas quando há entrada tardia */}
          {isLateEntry && (
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setRetroPolicy("from_entry")}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-all font-medium",
                  retroPolicy === "from_entry"
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                ◉ A partir do mês de entrada
              </button>
              <button
                type="button"
                onClick={() => setRetroPolicy("retroactive")}
                className={cn(
                  "text-xs px-3 py-1.5 rounded-lg border transition-all font-medium",
                  retroPolicy === "retroactive"
                    ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                ⚠ Cobrar retroativos
              </button>
            </div>
          )}
        </div>

        {/* Banner: turma ainda não iniciou */}
        {classStartDate && !classHasStarted && (
          <div className="mx-4 mt-4 mb-0 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-amber-700">
                Turma inicia em {fmtDateShort(parseDate(classStartDate))} — calendário em modo de previsão
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Os planos de pagamento só são criados quando a turma iniciar.
                Qualquer valor pago agora fica como <strong>crédito (saldo)</strong> e é aplicado automaticamente no 1.º mês.
              </p>
            </div>
          </div>
        )}

        {/* Corpo: estados de erro / vazio / tabela */}
        {!classStartDate ? (
          /* Turma sem data de início */
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="h-12 w-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-blue-400" />
            </div>
            <p className="text-sm font-semibold text-slate-600 mb-1">
              Turma sem data de início definida
            </p>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              O calendário será gerado quando a data de início da turma for definida.
              Pagamentos feitos antes do início ficam registados como crédito (saldo).
            </p>
          </div>

        ) : duracao === 0 ? (
          /* Duração desconhecida */
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">
              {selectedCourse
                ? "A duração do curso não está configurada."
                : "Selecione um curso para ver o calendário."}
            </p>
          </div>

        ) : (
          /* Tabela de parcelas */
          <div className="divide-y divide-slate-50">

            {/* Cabeçalho da tabela */}
            <div className="grid grid-cols-[1fr_150px_130px_90px] items-center gap-2 px-6 py-2 bg-slate-50">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Parcela</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Vencimento</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Valor</span>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-right">Estado</span>
            </div>

            {/* Linha: Taxa de matrícula */}
            <div className="grid grid-cols-[1fr_150px_130px_90px] items-center gap-2 px-6 py-3 bg-orange-50/30">
              <span className="text-sm font-medium text-slate-700">Taxa de Matrícula</span>
              <span className="text-xs text-slate-500">
                {enrollmentDate ? fmtDateShort(parseDate(enrollmentDate)) : "—"}
              </span>
              <span className="text-sm font-bold text-[#F5821F] text-right">
                {formData.enrollmentFeeIsento ? "Isento" : formatCurrency(enrollmentFee)}
              </span>
              <span className="text-xs text-slate-400 text-right">Único</span>
            </div>

            {/* Linhas: mensalidades */}
            {months.map((m) => (
              <div
                key={m.index}
                className={cn(
                  "grid grid-cols-[1fr_150px_130px_90px] items-center gap-2 px-6 py-3 transition-colors hover:bg-slate-50/60",
                  m.isRetro && "bg-amber-50/40"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm text-slate-700 truncate capitalize">{m.monthLabel}</span>
                  {m.isRetro && (
                    <span className="shrink-0 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold whitespace-nowrap">
                      Retroativo ⚠
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 whitespace-nowrap">{m.dueDateLabel}</span>
                <span className={cn(
                  "text-sm font-semibold text-right",
                  isBolsista ? "text-purple-600" : "text-green-700"
                )}>
                  {isBolsista
                    ? discountPct >= 100 ? "Isento" : formatCurrency(effectiveMonthly)
                    : formatCurrency(m.amount)}
                </span>
                <span className={cn(
                  "text-xs text-right font-medium",
                  m.expectedStatus === "overdue"   ? "text-red-500" :
                  m.expectedStatus === "scheduled" ? "text-blue-400 italic" :
                  "text-slate-400"
                )}>
                  {m.expectedStatus === "overdue"   ? "Atraso ⚠" :
                   m.expectedStatus === "scheduled" ? "Previsto" :
                   "Pendente"}
                </span>
              </div>
            ))}

            {/* Linha de total */}
            <div className="grid grid-cols-[1fr_150px_130px_90px] items-center gap-2 px-6 py-4 bg-gradient-to-r from-[#004B87]/5 to-transparent">
              <span className="text-sm font-bold text-slate-700">Total do Curso</span>
              <span className="text-xs text-slate-400">
                {duracao + (formData.enrollmentFeeIsento ? 0 : 1)} parcelas
              </span>
              <span className="text-base font-black text-[#004B87] text-right">
                {formatCurrency(totalCurso)}
              </span>
              <span />
            </div>
          </div>
        )}
      </div>

      {/* ── Status da matrícula ──────────────────────────────────────── */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <Label className="font-bold text-slate-700">Status da Matrícula</Label>
        <select
          value={(formData.status ?? "active") as RegistrationStatus}
          onChange={(e) => onChangeField("status", e.target.value as RegistrationStatus)}
          className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
        >
          <option value="active">✅ Matriculado (Ativo)</option>
          <option value="suspended">⏸ Trancado</option>
          <option value="cancelled">❌ Cancelado</option>
          <option value="completed">🏆 Concluído</option>
        </select>
      </div>

      {/* ── Resumo rápido ────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-[#004B87] mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#F5821F]" />
          Resumo da Matrícula
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Estudante:</span>
            <span className="text-sm font-semibold text-[#004B87]">{formData.studentName || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Curso:</span>
            <span className="text-sm font-semibold text-purple-600">{formData.courseName || "—"}</span>
          </div>
          {formData.className && (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Turma:</span>
              <span className="text-sm font-semibold text-blue-600">{formData.className}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Período:</span>
            <span className="text-sm font-semibold text-[#F5821F]">{formData.period || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Duração:</span>
            <span className="text-sm font-semibold text-slate-700">
              {duracao > 0 ? `${duracao} meses` : "Não definida"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Taxa de Matrícula:</span>
            <span className={`text-sm font-semibold ${formData.enrollmentFeeIsento ? "text-amber-600" : "text-orange-600"}`}>
              {formData.enrollmentFeeIsento ? "Isento" : formatCurrency(enrollmentFee)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">Mensalidade:</span>
            {isBolsista ? (
              <span className="flex items-center gap-2">
                <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Bolsista</span>
                <span className="text-sm font-semibold text-purple-600 line-through">{formatCurrency(monthlyFee)}/mês</span>
              </span>
            ) : (
              <span className="text-sm font-semibold text-green-600">{formatCurrency(monthlyFee)}/mês</span>
            )}
          </div>
          <div className="border-t border-slate-200 pt-3 flex justify-between">
            <span className="text-sm font-bold text-slate-700">Total do Curso:</span>
            <span className="text-sm font-black text-[#004B87]">{formatCurrency(totalCurso)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
