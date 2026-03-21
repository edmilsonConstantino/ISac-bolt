// src/components/shared/LevelTransitionPanel.tsx
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowRightCircle,
  RefreshCw,
  Loader2,
  Users,
  TrendingUp,
  AlertTriangle,
  XCircle,
  RotateCcw,
  ClipboardCheck,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import levelTransitionService, {
  StudentLevelProgress,
  NextLevelClass,
} from "@/services/levelTransitionService";
import courseService, { Course } from "@/services/courseService";
import nivelService from "@/services/nivelService";
import { Nivel } from "@/types/CategoryTypes";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActionType = "renovar" | "confirmar" | "promote" | "fail" | "repeat";

interface PendingAction {
  type: ActionType;
  student: StudentLevelProgress;
}

function defaultPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}/${now.getMonth() < 6 ? "1" : "2"}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LevelTransitionPanel() {
  const [courses, setCourses]                       = useState<Course[]>([]);
  const [levels, setLevels]                         = useState<Nivel[]>([]);
  const [selectedCourseId, setSelectedCourseId]     = useState<number | null>(null);
  const [selectedLevelId, setSelectedLevelId]       = useState<number | null>(null);

  const [transitions, setTransitions]               = useState<StudentLevelProgress[]>([]);
  const [nextLevelClasses, setNextLevelClasses]     = useState<NextLevelClass[]>([]);

  const [isLoading, setIsLoading]                   = useState(false);
  const [actionLoading, setActionLoading]           = useState(false);

  const [pendingAction, setPendingAction]           = useState<PendingAction | null>(null);

  // Confirm renewal fields
  const [destClassId, setDestClassId]               = useState<number | null>(null);
  const [paymentStatus, setPaymentStatus]           = useState<"paid" | "pending">("pending");

  // Renovar dialog fields
  const [renovarPeriod, setRenovarPeriod]           = useState("");
  const [renovarEnrollFee, setRenovarEnrollFee]     = useState<number>(0);
  const [renovarMonthlyFee, setRenovarMonthlyFee]   = useState<number>(0);

  // ── Load courses with levels ───────────────────────────────────────────────
  useEffect(() => {
    courseService.getAll().then((all) => {
      setCourses(all.filter((c) => c.tem_niveis));
    });
  }, []);

  // ── Load levels when course changes ───────────────────────────────────────
  useEffect(() => {
    if (!selectedCourseId) {
      setLevels([]);
      setSelectedLevelId(null);
      return;
    }
    nivelService
      .listarNiveisPorCurso(selectedCourseId)
      .then((ls) => {
        setLevels(ls);
        setSelectedLevelId(null);
      })
      .catch(() => setLevels([]));
  }, [selectedCourseId]);

  // ── Load transitions when level selected ──────────────────────────────────
  const loadTransitions = useCallback(async () => {
    if (!selectedLevelId) return;
    setIsLoading(true);
    try {
      const result = await levelTransitionService.getAwaiting(selectedLevelId);
      setTransitions(result.data);
      setNextLevelClasses(result.next_level_classes);
    } catch {
      toast.error("Error loading students");
    } finally {
      setIsLoading(false);
    }
  }, [selectedLevelId]);

  useEffect(() => {
    loadTransitions();
  }, [loadTransitions]);

  // ── Open dialog ────────────────────────────────────────────────────────────
  const openAction = (type: ActionType, student: StudentLevelProgress) => {
    setDestClassId(null);
    setPaymentStatus("pending");
    setRenovarPeriod(defaultPeriod());
    setRenovarEnrollFee(0);
    setRenovarMonthlyFee(0);
    setPendingAction({ type, student });
  };

  // ── Execute action ─────────────────────────────────────────────────────────
  const executeAction = async () => {
    if (!pendingAction) return;
    const { type, student } = pendingAction;
    setActionLoading(true);

    try {
      if (type === "renovar") {
        const result = await levelTransitionService.renovar(
          student.student_id,
          student.level_id,
          {
            period:         renovarPeriod || defaultPeriod(),
            enrollment_fee: renovarEnrollFee,
            monthly_fee:    renovarMonthlyFee,
          }
        );
        if (result.already_exists) {
          toast.info(`Renewal already pending: ${result.enrollment_number}`);
        } else {
          toast.success(
            `Renewal created for ${student.student_name}! #${result.enrollment_number}`
          );
        }

      } else if (type === "confirmar") {
        if (!pendingAction.student.pending_registration_id) {
          toast.error("No pending registration found.");
          return;
        }
        const result = await levelTransitionService.confirmarRenovacao(
          pendingAction.student.pending_registration_id,
          destClassId!,
          { payment_status: paymentStatus }
        );
        toast.success(result.message);

      } else if (type === "promote") {
        const result = await levelTransitionService.promote(
          student.student_id,
          student.level_id,
          destClassId ?? undefined
        );
        toast.success(result.message);

      } else if (type === "fail") {
        await levelTransitionService.fail(student.student_id, student.level_id);
        toast.success(`${student.student_name} marked as failed.`);

      } else if (type === "repeat") {
        const r = await levelTransitionService.repeat(
          student.student_id,
          student.level_id
        );
        toast.success(`${student.student_name} enrolled for attempt #${r.attempt}.`);
      }

      setPendingAction(null);
      await loadTransitions();

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────
  const gradeColor = (g: number | null) => {
    if (g === null) return "text-slate-400";
    if (g >= 7)  return "text-emerald-600";
    if (g >= 5)  return "text-amber-600";
    return "text-red-600";
  };

  // Split students into groups
  const renewalEligible = transitions.filter(
    (t) => t.status === "awaiting_renewal" && !t.pending_registration_id
  );
  const renewalPending = transitions.filter(
    (t) => t.status === "awaiting_renewal" && !!t.pending_registration_id
  );
  const recoveryStudents = transitions.filter(
    (t) => t.status === "recovery"
  );

  const canConfirm = !!destClassId;

  // ─── Student card ─────────────────────────────────────────────────────────
  const StudentCard = ({
    s,
    borderColor,
    actions,
  }: {
    s: StudentLevelProgress;
    borderColor: string;
    actions: React.ReactNode;
  }) => (
    <Card
      key={`${s.student_id}-${s.id}`}
      className="shadow-sm border-l-4"
      style={{ borderLeftColor: borderColor }}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Info */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#004B87]/10 flex items-center justify-center text-[#004B87] font-bold text-sm">
              {s.student_name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="font-semibold truncate">{s.student_name}</p>
              <p className="text-xs text-slate-500 truncate">{s.student_email}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs ${levelTransitionService.getStatusBadge(s.status)}`}>
                  {levelTransitionService.getStatusLabel(s.status)}
                </Badge>
                {s.attempt > 1 && (
                  <span className="text-xs text-slate-400">Tentativa #{s.attempt}</span>
                )}
              </div>
            </div>
          </div>

          {/* Grade + next level + actions */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${gradeColor(s.final_grade)}`}>
                {s.final_grade !== null ? Number(s.final_grade).toFixed(1) : "—"}
              </div>
              <div className="text-xs text-slate-400">Nota Final</div>
            </div>

            {s.level_name && (
              <div className="text-center hidden sm:block">
                <div className="text-sm font-medium text-slate-700">{s.level_name}</div>
                <div className="text-xs text-slate-400">Nível Actual</div>
              </div>
            )}

            {s.next_level_name && (
              <div className="text-center hidden sm:block">
                <div className="flex items-center gap-1 text-sm font-medium text-[#004B87]">
                  <ArrowRightCircle className="h-4 w-4" />
                  {s.next_level_name}
                </div>
                <div className="text-xs text-slate-400">Próximo Nível</div>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">{actions}</div>
          </div>
        </div>

        {/* Pending enrollment tag */}
        {s.pending_registration_id && s.pending_enrollment_number && (
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>
              Renovação pendente: <strong>{s.pending_enrollment_number}</strong>
              {s.pending_period && <> — período {s.pending_period}</>}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  // ─── Section header ────────────────────────────────────────────────────────
  const SectionHeader = ({
    label,
    count,
    bgColor,
    textColor,
    borderColor: bc,
  }: {
    label: string;
    count: number;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }) => (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${bgColor} ${borderColor}`}>
      <span className={`text-sm font-bold ${textColor}`}>{label}</span>
      <span className={`text-xs rounded-full px-2 py-0.5 font-black ${textColor} bg-white/60`}>
        {count}
      </span>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Curso</label>
          <Select
            value={selectedCourseId ? String(selectedCourseId) : ""}
            onValueChange={(v) => setSelectedCourseId(Number(v))}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Seleccionar curso…" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Nível</label>
          <Select
            value={selectedLevelId ? String(selectedLevelId) : ""}
            onValueChange={(v) => setSelectedLevelId(Number(v))}
            disabled={!levels.length}
          >
            <SelectTrigger className="w-56">
              <SelectValue placeholder={levels.length ? "Seleccionar nível…" : "Seleccione um curso primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {levels.map((l) => (
                <SelectItem key={l.id} value={String(l.id)}>{l.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          onClick={loadTransitions}
          disabled={!selectedLevelId || isLoading}
          className="self-end"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          <span className="ml-2">Actualizar</span>
        </Button>
      </div>

      {/* ── Progress flow stepper ────────────────────────────────────────── */}
      {selectedLevelId && !isLoading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Fluxo de Progressão</p>
          <div className="flex items-center gap-1 flex-wrap">
            {/* Step 1 */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              renewalEligible.length > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'
            }`}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Aprovado
              {renewalEligible.length > 0 && (
                <span className="bg-emerald-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-black ml-0.5">
                  {renewalEligible.length}
                </span>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
            {/* Step 2 */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
              renewalPending.length > 0 ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
            }`}>
              <Clock className="h-3.5 w-3.5" />
              Renovação Criada
              {renewalPending.length > 0 && (
                <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-black ml-0.5">
                  {renewalPending.length}
                </span>
              )}
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
            {/* Step 3 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400">
              <ClipboardCheck className="h-3.5 w-3.5" />
              Confirmado
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
            {/* Step 4 */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-400">
              <TrendingUp className="h-3.5 w-3.5" />
              Activo no Próximo Nível
            </div>
            {recoveryStudents.length > 0 && (
              <>
                <span className="text-slate-300 text-xs mx-1">·</span>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-100 text-orange-700">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Recuperação
                  <span className="bg-orange-600 text-white rounded-full px-1.5 py-0.5 text-[10px] font-black ml-0.5">
                    {recoveryStudents.length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : !selectedLevelId ? (
        <Card>
          <CardContent className="py-14 text-center text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Seleccione um curso e um nível para ver os estudantes.</p>
          </CardContent>
        </Card>
      ) : transitions.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center text-slate-400">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>Nenhum estudante aguarda acção neste nível.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* ── Section 1: Eligible for renewal ─────────────────────────── */}
          {renewalEligible.length > 0 && (
            <div className="space-y-3">
              <SectionHeader
                label="Elegíveis para Renovação"
                count={renewalEligible.length}
                bgColor="bg-emerald-50"
                textColor="text-emerald-700"
                borderColor="border-emerald-200"
              />
              {renewalEligible.map((s) => (
                <StudentCard
                  key={`${s.student_id}-${s.id}`}
                  s={s}
                  borderColor="#10b981"
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => openAction("renovar", s)}
                      >
                        <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                        Renovar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => openAction("fail", s)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reprovar
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}

          {/* ── Section 2: Pending confirmation ─────────────────────────── */}
          {renewalPending.length > 0 && (
            <div className="space-y-3">
              <SectionHeader
                label="Aguardam Confirmação"
                count={renewalPending.length}
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-200"
              />
              {renewalPending.map((s) => (
                <StudentCard
                  key={`${s.student_id}-${s.id}`}
                  s={s}
                  borderColor="#3b82f6"
                  actions={
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => openAction("confirmar", s)}
                    >
                      <ClipboardCheck className="h-3.5 w-3.5 mr-1" />
                      Confirmar
                    </Button>
                  }
                />
              ))}
            </div>
          )}

          {/* ── Section 3: Recovery ─────────────────────────────────────── */}
          {recoveryStudents.length > 0 && (
            <div className="space-y-3">
              <SectionHeader
                label="Recuperação"
                count={recoveryStudents.length}
                bgColor="bg-orange-50"
                textColor="text-orange-700"
                borderColor="border-orange-200"
              />
              {recoveryStudents.map((s) => (
                <StudentCard
                  key={`${s.student_id}-${s.id}`}
                  s={s}
                  borderColor="#f97316"
                  actions={
                    <>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => openAction("promote", s)}
                      >
                        <TrendingUp className="h-3.5 w-3.5 mr-1" />
                        Promover
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-amber-600 border-amber-300 hover:bg-amber-50"
                        onClick={() => openAction("repeat", s)}
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Repetir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => openAction("fail", s)}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />
                        Reprovar
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────────────────────────── */}
      {pendingAction && (
        <Dialog open onOpenChange={() => !actionLoading && setPendingAction(null)}>
          <DialogContent className="max-w-md">

            {/* ── Renovar dialog ─────────────────────────────────────────── */}
            {pendingAction.type === "renovar" && (
              <>
                <DialogHeader>
                  <DialogTitle>Criar Renovação de Matrícula</DialogTitle>
                  <DialogDescription>
                    Criar matrícula pendente para{" "}
                    <strong>{pendingAction.student.student_name}</strong> no{" "}
                    <strong>
                      {pendingAction.student.next_level_name ?? "próximo nível"}
                    </strong>
                    .
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">
                      Período <span className="text-slate-400 font-normal">(ex: 2026/2)</span>
                    </label>
                    <Input
                      value={renovarPeriod}
                      onChange={(e) => setRenovarPeriod(e.target.value)}
                      placeholder={defaultPeriod()}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Taxa de Inscrição (MT)</label>
                      <Input
                        type="number"
                        min="0"
                        value={renovarEnrollFee}
                        onChange={(e) => setRenovarEnrollFee(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium">Mensalidade (MT)</label>
                      <Input
                        type="number"
                        min="0"
                        value={renovarMonthlyFee}
                        onChange={(e) => setRenovarMonthlyFee(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Será criada uma matrícula <strong>pendente</strong>. A turma será
                      atribuída e confirmada numa etapa seguinte.
                    </span>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPendingAction(null)} disabled={actionLoading}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Criar Renovação
                  </Button>
                </DialogFooter>
              </>
            )}

            {/* ── Confirmar dialog ───────────────────────────────────────── */}
            {pendingAction.type === "confirmar" && (
              <>
                <DialogHeader>
                  <DialogTitle>Confirmar Renovação</DialogTitle>
                  <DialogDescription>
                    Atribuir turma e confirmar a renovação de{" "}
                    <strong>{pendingAction.student.student_name}</strong>.
                    {pendingAction.student.pending_enrollment_number && (
                      <> Matrícula: <strong>{pendingAction.student.pending_enrollment_number}</strong></>
                    )}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">
                      Turma de Destino <span className="text-red-500">*</span>
                    </label>
                    {nextLevelClasses.length > 0 ? (
                      <Select
                        value={destClassId ? String(destClassId) : ""}
                        onValueChange={(v) => setDestClassId(Number(v))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Escolher turma…" />
                        </SelectTrigger>
                        <SelectContent>
                          {nextLevelClasses.map((nc) => (
                            <SelectItem key={nc.class_id} value={String(nc.class_id)}>
                              {nc.class_name} — {nc.vagas_ocupadas}/{nc.capacidade_maxima} estudantes
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-slate-500 italic">
                        Nenhuma turma disponível para o próximo nível. Crie uma turma primeiro.
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Estado do Pagamento</label>
                    <Select
                      value={paymentStatus}
                      onValueChange={(v) => setPaymentStatus(v as "paid" | "pending")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPendingAction(null)} disabled={actionLoading}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={actionLoading || !canConfirm}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirmar e Inscrever
                  </Button>
                </DialogFooter>
              </>
            )}

            {/* ── Promote dialog (recovery only) ─────────────────────────── */}
            {pendingAction.type === "promote" && (
              <>
                <DialogHeader>
                  <DialogTitle>Promover Estudante</DialogTitle>
                  <DialogDescription>
                    Promover directamente{" "}
                    <strong>{pendingAction.student.student_name}</strong> para o{" "}
                    <strong>{pendingAction.student.next_level_name ?? "próximo nível"}</strong>.
                  </DialogDescription>
                </DialogHeader>

                {nextLevelClasses.length > 0 && (
                  <div className="space-y-1.5 py-2">
                    <label className="text-sm font-medium">
                      Turma de destino{" "}
                      <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <Select
                      value={destClassId ? String(destClassId) : ""}
                      onValueChange={(v) => setDestClassId(v ? Number(v) : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sem turma atribuída" />
                      </SelectTrigger>
                      <SelectContent>
                        {nextLevelClasses.map((nc) => (
                          <SelectItem key={nc.class_id} value={String(nc.class_id)}>
                            {nc.class_name} — {nc.vagas_ocupadas}/{nc.capacidade_maxima} estudantes
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPendingAction(null)} disabled={actionLoading}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={actionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirmar
                  </Button>
                </DialogFooter>
              </>
            )}

            {/* ── Fail / Repeat dialogs ─────────────────────────────────── */}
            {(pendingAction.type === "fail" || pendingAction.type === "repeat") && (
              <>
                <DialogHeader>
                  <DialogTitle>
                    {pendingAction.type === "fail" ? "Confirmar Reprovação" : "Repetir Nível"}
                  </DialogTitle>
                  <DialogDescription>
                    {pendingAction.type === "fail"
                      ? `Marcar ${pendingAction.student.student_name} como reprovado em ${pendingAction.student.level_name}?`
                      : `Inscrever ${pendingAction.student.student_name} para repetir ${pendingAction.student.level_name}?`}
                  </DialogDescription>
                </DialogHeader>

                {pendingAction.type === "fail" && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      O progresso do estudante neste nível será encerrado como reprovado.
                      Poderá ainda inscrevê-lo para repetir o nível.
                    </span>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={() => setPendingAction(null)} disabled={actionLoading}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={executeAction}
                    disabled={actionLoading}
                    className={
                      pendingAction.type === "fail"
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-amber-600 hover:bg-amber-700 text-white"
                    }
                  >
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirmar
                  </Button>
                </DialogFooter>
              </>
            )}

          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
