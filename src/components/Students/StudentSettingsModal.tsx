// src/components/Students/StudentSettingsModal.tsx
// Painel de configurações/perfil do estudante

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  X, User, GraduationCap, Shield,
  Eye, EyeOff, Mail, Phone, MapPin,
  CreditCard, Key, BookOpen, Clock,
  CheckCircle2, AlertCircle, TrendingUp,
  Calendar, Hash, Loader2, Award,
} from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/services/api";
import { useAuthStore } from "@/store/authStore";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface StudentProfile {
  id: number;
  name: string;
  email: string;
  username: string;
  phone: string | null;
  birth_date: string | null;
  address: string | null;
  bi_number: string;
  gender: 'M' | 'F';
  enrollment_year: number | null;
  created_at: string;
  registrations: Array<{
    id: number;
    course_id: string;
    course_name: string;
    period: string;
    enrollment_date: string;
    status: string;
    monthly_fee: number;
    class_name: string | null;
  }>;
}

interface LevelProgress {
  id: number;
  level_id: number;
  level_name: string;
  level_number: number;
  level_order: number;
  course_id: number;
  course_name: string;
  course_code: string;
  class_name: string | null;
  status: 'in_progress' | 'awaiting_transition' | 'awaiting_renewal' | 'recovery' | 'passed' | 'failed' | 'withdrawn';
  final_grade: number | null;
  attempt: number;
  start_date: string | null;
  end_date: string | null;
  next_level_name: string | null;
}

type SettingsTab = "perfil" | "academico" | "seguranca";

interface StudentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_STATUS: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  in_progress:          { label: 'Em Curso',             color: 'bg-blue-100 text-blue-700 border-blue-200',     icon: TrendingUp     },
  awaiting_transition:  { label: 'Aguardando Promoção',  color: 'bg-cyan-100 text-cyan-700 border-cyan-200',     icon: Award          },
  awaiting_renewal:     { label: 'Aguardando Renovação', color: 'bg-amber-100 text-amber-700 border-amber-200',  icon: Clock          },
  recovery:             { label: 'Recuperação',           color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle  },
  passed:               { label: 'Aprovado',              color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  failed:               { label: 'Reprovado',             color: 'bg-red-100 text-red-700 border-red-200',       icon: AlertCircle    },
  withdrawn:            { label: 'Desistido',             color: 'bg-slate-100 text-slate-600 border-slate-200', icon: X              },
};

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('pt-MZ', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(value);
}

// ── Componente principal ───────────────────────────────────────────────────────

export function StudentSettingsModal({ isOpen, onClose, initialTab = "perfil" }: StudentSettingsModalProps) {
  const user = useAuthStore((s) => s.user);
  const studentId = user?.id;

  const [profile, setProfile]           = useState<StudentProfile | null>(null);
  const [levels, setLevels]             = useState<LevelProgress[]>([]);

  // Segurança — alterar senha
  const [currentPwd, setCurrentPwd]     = useState('');
  const [newPwd, setNewPwd]             = useState('');
  const [confirmPwd, setConfirmPwd]     = useState('');
  const [showCurrent, setShowCurrent]   = useState(false);
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [isSaving, setIsSaving]         = useState(false);

  // ── Carregar dados ao abrir ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !studentId) return;

    Promise.allSettled([
      apiClient.get(`/api/students.php?id=${studentId}`),
      apiClient.get(`/api/level-transitions.php?student_id=${studentId}`),
    ]).then(([profileRes, levelsRes]) => {
      if (profileRes.status === 'fulfilled') {
        setProfile(profileRes.value.data as StudentProfile);
      }
      if (levelsRes.status === 'fulfilled') {
        const data = levelsRes.value.data;
        setLevels(Array.isArray(data) ? data : (data?.data ?? []));
      }
    });

  }, [isOpen, studentId]);

  // ── Alterar senha ────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    if (!newPwd.trim()) { toast.error('A nova senha é obrigatória'); return; }
    if (newPwd.length < 6) { toast.error('A senha deve ter no mínimo 6 caracteres'); return; }
    if (newPwd !== confirmPwd) { toast.error('As senhas não coincidem'); return; }
    if (!currentPwd.trim()) { toast.error('A senha actual é obrigatória'); return; }
    if (newPwd === currentPwd) { toast.error('A nova senha não pode ser igual à senha atual'); return; }

    setIsSaving(true);
    try {
      const res = await apiClient.put('/api/change_password.php', {
        current_password: currentPwd,
        new_password:     newPwd,
        confirm_password: confirmPwd,
      });

      if ((res.data as { success: boolean }).success) {
        toast.success('Senha alterada com sucesso!');
        setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      } else {
        toast.error((res.data as { message?: string }).message || 'Erro ao alterar senha');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Erro ao alterar senha');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Matrícula activa
  const activeReg = profile?.registrations?.find(r => r.status === 'active')
    ?? profile?.registrations?.[0]
    ?? null;

  // Nível actual (in_progress ou mais recente)
  const currentLevel = levels.find(l => l.status === 'in_progress')
    ?? levels.find(l => l.status === 'awaiting_transition')
    ?? levels.find(l => l.status === 'awaiting_renewal')
    ?? levels.find(l => l.status === 'recovery')
    ?? null;

  const hasCourseWithLevels = levels.length > 0;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-6 py-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Perfil e Configurações</h2>
              <p className="text-xs text-blue-200">{(user as { nome?: string })?.nome || user?.username}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="flex-1 overflow-y-auto">
          <Tabs key={`${isOpen}-${initialTab}`} defaultValue={initialTab} className="h-full">

              {/* Tab list */}
              <div className="px-6 pt-4 border-b border-slate-100">
                <TabsList className="grid grid-cols-3 h-10 w-full">
                  <TabsTrigger value="perfil" className="flex items-center gap-1.5 text-xs">
                    <User className="h-3.5 w-3.5" /> Meu Perfil
                  </TabsTrigger>
                  <TabsTrigger value="academico" className="flex items-center gap-1.5 text-xs">
                    <GraduationCap className="h-3.5 w-3.5" /> Académico
                  </TabsTrigger>
                  <TabsTrigger value="seguranca" className="flex items-center gap-1.5 text-xs">
                    <Shield className="h-3.5 w-3.5" /> Segurança
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ══ TAB — PERFIL ══ */}
              <TabsContent value="perfil" className="p-6 space-y-5">

                {/* Avatar + nome */}
                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#004B87] to-[#0066B3] flex items-center justify-center text-white text-2xl font-bold shadow-md flex-shrink-0">
                    {profile?.name?.charAt(0).toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{profile?.name ?? '—'}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Key className="h-3 w-3 text-slate-400" />
                      <code className="text-xs text-slate-500 font-mono">{profile?.username ?? '—'}</code>
                    </div>
                    <Badge className="mt-1.5 text-[10px] bg-emerald-100 text-emerald-700 border border-emerald-200">
                      {profile?.gender === 'M' ? 'Masculino' : profile?.gender === 'F' ? 'Feminino' : '—'}
                    </Badge>
                  </div>
                </div>

                {/* Dados pessoais */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Dados Pessoais</h4>

                  <InfoRow icon={Mail}     label="Email"            value={profile?.email ?? '—'} />
                  <InfoRow icon={Phone}    label="Telefone"         value={profile?.phone ?? '—'} />
                  <InfoRow icon={CreditCard} label="Nº de BI"       value={profile?.bi_number ?? '—'} mono />
                  <InfoRow icon={Calendar} label="Data de Nascimento" value={formatDate(profile?.birth_date ?? null)} />
                  <InfoRow icon={MapPin}   label="Morada"           value={profile?.address ?? '—'} />
                </div>

                {/* Dados de acesso */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Acesso ao Sistema</h4>
                  <InfoRow icon={Key}  label="Username"          value={profile?.username ?? '—'} mono />
                  <InfoRow icon={Hash} label="Ano de Inscrição"  value={profile?.enrollment_year ? String(profile.enrollment_year) : '—'} />
                  <InfoRow icon={Calendar} label="Membro desde"  value={formatDate(profile?.created_at ?? null)} />
                </div>
              </TabsContent>

              {/* ══ TAB — ACADÉMICO ══ */}
              <TabsContent value="academico" className="p-6 space-y-5">

                {/* Matrícula actual */}
                {activeReg ? (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-[#004B87]" />
                      <span className="text-xs font-bold uppercase tracking-wider text-[#004B87]">Matrícula Activa</span>
                    </div>
                    <InfoRow icon={BookOpen}  label="Curso"            value={activeReg.course_name} />
                    <InfoRow icon={Hash}      label="Código do Curso"  value={activeReg.course_id} mono />
                    <InfoRow icon={Clock}     label="Período"          value={activeReg.period ?? '—'} />
                    <InfoRow icon={Calendar}  label="Data de Matrícula" value={formatDate(activeReg.enrollment_date)} />
                    <InfoRow icon={GraduationCap} label="Turma"        value={activeReg.class_name ?? '—'} />
                    <div className="flex items-center justify-between py-2 border-t border-blue-100 mt-2">
                      <span className="text-sm text-slate-500 flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5" /> Mensalidade
                      </span>
                      <span className="text-sm font-bold text-[#004B87]">{formatCurrency(activeReg.monthly_fee)}</span>
                    </div>
                  </div>
                ) : (
                  <EmptyState icon={BookOpen} message="Nenhuma matrícula activa encontrada." />
                )}

                {/* Progressão de níveis */}
                {hasCourseWithLevels && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                      <Award className="h-3.5 w-3.5" /> Progressão de Níveis
                    </h4>

                    {/* Nível actual em destaque */}
                    {currentLevel && (() => {
                      const s = LEVEL_STATUS[currentLevel.status];
                      const Icon = s?.icon ?? CheckCircle2;
                      return (
                        <div className="p-4 bg-gradient-to-br from-[#004B87]/5 to-blue-50 border-2 border-[#004B87]/20 rounded-xl">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs text-slate-400 mb-0.5">Nível Actual</p>
                              <p className="font-bold text-slate-800 text-base">{currentLevel.level_name}</p>
                              {currentLevel.class_name && (
                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                  <GraduationCap className="h-3 w-3" /> {currentLevel.class_name}
                                </p>
                              )}
                            </div>
                            <Badge className={`${s?.color} border text-xs flex items-center gap-1 flex-shrink-0`}>
                              <Icon className="h-3 w-3" /> {s?.label}
                            </Badge>
                          </div>
                          {currentLevel.final_grade !== null && (
                            <div className="mt-3 pt-3 border-t border-[#004B87]/10">
                              <p className="text-xs text-slate-500">Nota Final</p>
                              <p className={`text-2xl font-bold ${Number(currentLevel.final_grade) >= 7 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {Number(currentLevel.final_grade).toFixed(1)}
                              </p>
                            </div>
                          )}
                          {currentLevel.next_level_name && (
                            <p className="text-xs text-slate-400 mt-2">
                              Próximo nível: <span className="font-semibold text-slate-600">{currentLevel.next_level_name}</span>
                            </p>
                          )}
                        </div>
                      );
                    })()}

                    {/* Histórico de níveis */}
                    {levels.length > 1 && (
                      <div className="space-y-2">
                        <p className="text-xs text-slate-400 font-medium">Histórico</p>
                        {levels.filter(l => l !== currentLevel).map(l => {
                          const s = LEVEL_STATUS[l.status];
                          const Icon = s?.icon ?? CheckCircle2;
                          return (
                            <div key={l.id} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-100">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{l.level_name}</p>
                                {l.attempt > 1 && (
                                  <p className="text-[10px] text-slate-400">{l.attempt}ª tentativa</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {l.final_grade !== null && (
                                  <span className={`text-sm font-bold ${Number(l.final_grade) >= 7 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {Number(l.final_grade).toFixed(1)}
                                  </span>
                                )}
                                <Badge className={`${s?.color} border text-[10px] flex items-center gap-1`}>
                                  <Icon className="h-2.5 w-2.5" /> {s?.label}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {!hasCourseWithLevels && !activeReg && (
                  <EmptyState icon={GraduationCap} message="Sem informações académicas disponíveis." />
                )}
              </TabsContent>

              {/* ══ TAB — SEGURANÇA ══ */}
              <TabsContent value="seguranca" className="p-6 space-y-6">

                {/* Conta actual */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
                  <Key className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">A alterar senha da conta</p>
                    <p className="font-mono font-bold text-[#004B87] text-sm">{profile?.username ?? (user as {username?: string})?.username ?? '—'}</p>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                  <Shield className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    A sua senha deve ter pelo menos <strong>6 caracteres</strong>.
                    Use uma combinação de letras, números e símbolos para maior segurança.
                  </p>
                </div>

                {/* Formulário */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Alterar Senha</h4>

                  {/* Senha actual */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">Senha Actual</Label>
                    <div className="relative">
                      <Input
                        type={showCurrent ? 'text' : 'password'}
                        value={currentPwd}
                        onChange={e => setCurrentPwd(e.target.value)}
                        placeholder="Digite a sua senha actual"
                        className="h-11 pr-10 border-2 border-slate-200 focus:border-[#004B87] rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Nova senha */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        type={showNew ? 'text' : 'password'}
                        value={newPwd}
                        onChange={e => setNewPwd(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="h-11 pr-10 border-2 border-slate-200 focus:border-[#004B87] rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Indicador de força */}
                    {newPwd.length > 0 && (
                      <div className="space-y-1 mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                              newPwd.length >= i * 3
                                ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                                : 'bg-slate-100'
                            }`} />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {newPwd.length < 4 ? 'Fraca' : newPwd.length < 7 ? 'Razoável' : newPwd.length < 10 ? 'Boa' : 'Forte'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirmar nova senha */}
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        value={confirmPwd}
                        onChange={e => setConfirmPwd(e.target.value)}
                        placeholder="Repita a nova senha"
                        className={`h-11 pr-10 border-2 rounded-xl ${
                          confirmPwd && confirmPwd !== newPwd
                            ? 'border-red-400 focus:border-red-500'
                            : confirmPwd && confirmPwd === newPwd
                            ? 'border-emerald-400 focus:border-emerald-500'
                            : 'border-slate-200 focus:border-[#004B87]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmPwd && confirmPwd !== newPwd && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" /> As senhas não coincidem
                      </p>
                    )}
                    {confirmPwd && confirmPwd === newPwd && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> As senhas coincidem
                      </p>
                    )}
                  </div>
                </div>

                {/* Botão */}
                <Button
                  onClick={handleChangePassword}
                  disabled={isSaving}
                  className="w-full h-12 bg-gradient-to-r from-[#004B87] to-[#0066B3] hover:from-[#003868] hover:to-[#004B87] text-white font-bold rounded-xl shadow-lg"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Shield className="h-4 w-4 mr-2" />
                  )}
                  {isSaving ? 'A alterar...' : 'Alterar Senha'}
                </Button>
              </TabsContent>

            </Tabs>
        </div>

      </div>
    </div>
  );
}

// ── Sub-componentes simples ────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value, mono = false }: {
  icon: typeof Mail;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <span className="text-sm text-slate-500 flex items-center gap-1.5">
        <Icon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
        {label}
      </span>
      <span className={`text-sm font-semibold text-slate-700 max-w-[55%] text-right truncate ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function EmptyState({ icon: Icon, message }: { icon: typeof BookOpen; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-3">
        <Icon className="h-7 w-7 text-slate-300" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
