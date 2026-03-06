// src/components/Students/StudentProfileModal.tsx - USANDO ProfileModalBase

import { useState, useEffect } from "react";
import { ProfileModalBase, ProfileTab, PROFILE_MODAL_STYLES } from "@/components/shared/ProfileModalBase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SectionCard } from "@/components/ui/section-card";
import {
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  BookOpen,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Activity,
  Lock,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Student } from "../../types";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  currentUserRole: 'admin' | 'teacher';
  onSave: (updatedStudent: Student) => void;
  onToggleStatus?: (studentId: number) => void;
  onViewPaymentDetails?: (student: Student) => void;
  onResetPassword?: (studentId: number, newPassword: string) => void;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  currentUserRole,
  onSave,
  onToggleStatus,
  onViewPaymentDetails,
  onResetPassword
}: StudentProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    parentName: '',
    parentPhone: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    level: '',
    enrollmentDate: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState('perfil');

  // Mock data para desempenho
  const performanceData = {
    currentGrade: 8.5,
    attendance: 92,
    totalLessons: 48,
    attendedLessons: 44,
    monthlyFee: 2500,
    totalPaid: 25000,
    paymentStatus: 'up-to-date' as const
  };

  useEffect(() => {
    if (student && isOpen) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        birthDate: student.birthDate || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        notes: student.notes || '',
        level: student.level || '',
        enrollmentDate: student.enrollmentDate || '',
        status: student.status || 'active'
      });
      setIsEditing(false);
      setErrors({});
      setActiveTab('perfil');
    }
  }, [student, isOpen]);

  if (!student || !formData) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit   = () => { setIsEditing(true); setErrors({}); };
  const handleCancel = () => {
    setIsEditing(false);
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        birthDate: student.birthDate || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        notes: student.notes || '',
        level: student.level || '',
        enrollmentDate: student.enrollmentDate || '',
        status: student.status || 'active'
      });
    }
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (student) {
      onSave({ ...student, ...formData });
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (newStatus: "active" | "inactive" | "suspended") => {
    if (isEditing) setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handlePasswordReset = () => {
    setPasswordError('');
    if (!passwordData.password || !passwordData.confirmPassword) {
      setPasswordError('Preencha ambos os campos de senha');
      return;
    }
    if (passwordData.password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      return;
    }
    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }
    if (student?.id && onResetPassword) {
      onResetPassword(student.id, passwordData.password);
      setShowPasswordReset(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setPasswordError('');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN' }).format(amount);

  // ============================================================
  // DEFINIÇÃO DAS TABS
  // ============================================================
  const tabs: ProfileTab[] = [

    // ── PERFIL ────────────────────────────────────────────────
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      color: PROFILE_MODAL_STYLES.tabs.blue,
      content: (
        <div className="space-y-5">

          {/* Cartão de identidade */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#004B87] to-[#0066B3] p-5 text-white shadow-lg">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute right-4 top-10 h-20 w-20 rounded-full bg-white/5" />
            <div className="relative flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#F5821F] to-[#FF9933] flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/30">
                  {formData.name?.charAt(0)?.toUpperCase() || 'E'}
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#004B87]",
                  formData.status === 'active' ? 'bg-emerald-400' :
                  formData.status === 'suspended' ? 'bg-amber-400' : 'bg-slate-400'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold leading-tight truncate">{formData.name || '—'}</h3>
                <p className="text-sm text-white/70 truncate mt-0.5">{formData.email || '—'}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
                    formData.status === 'active'
                      ? 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30'
                      : formData.status === 'suspended'
                        ? 'bg-amber-400/20 text-amber-200 border-amber-400/30'
                        : 'bg-slate-400/20 text-slate-300 border-slate-400/30'
                  )}>
                    {formData.status === 'active' ? '✓ Activo' :
                     formData.status === 'suspended' ? '⚠ Suspenso' : 'Inactivo'}
                  </span>
                  {student.username && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-white/80 border border-white/20">
                      {student.username}
                    </span>
                  )}
                  {student.phone && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-white/10 text-white/80 border border-white/20">
                      <Phone className="h-3 w-3" />{student.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <SectionCard icon={User} title="Informações Pessoais" variant="navy" contentPadding="p-5 space-y-3.5">

              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Nome Completo <span className="text-red-500 normal-case">*</span>
                </Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn("h-10 text-sm rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#F5821F]/50 focus:border-[#F5821F] focus:ring-[#F5821F]/20")}
                />
                {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Email <span className="text-red-500 normal-case">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn("h-10 text-sm pl-9 rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#F5821F]/50 focus:border-[#F5821F] focus:ring-[#F5821F]/20")}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange}
                      placeholder="+258 84 000 0000" disabled={!isEditing}
                      className={cn("h-10 text-sm pl-9 rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#F5821F]/50 focus:border-[#F5821F]")}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="birthDate" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nascimento</Label>
                  <Input id="birthDate" name="birthDate" type="date" value={formData.birthDate} onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn("h-10 text-sm rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#F5821F]/50 focus:border-[#F5821F]")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="address" name="address" value={formData.address} onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn("h-10 text-sm pl-9 rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#F5821F]/50 focus:border-[#F5821F]")}
                  />
                </div>
              </div>

            </SectionCard>

            <SectionCard icon={AlertCircle} title="Contactos de Emergência" variant="red" contentPadding="p-5 space-y-3.5">

              <div className="space-y-1.5">
                <Label htmlFor="parentName" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nome do Responsável</Label>
                <Input id="parentName" name="parentName" value={formData.parentName} onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn("h-10 text-sm rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87]/50 focus:border-[#004B87]")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="parentPhone" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Telefone do Responsável</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="parentPhone" name="parentPhone" value={formData.parentPhone} onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn("h-10 text-sm pl-9 rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87]/50 focus:border-[#004B87]")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyContact" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Contato de Emergência</Label>
                <Input id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange}
                  disabled={!isEditing}
                  className={cn("h-10 text-sm rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87]/50 focus:border-[#004B87]")}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emergencyPhone" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Telefone de Emergência</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input id="emergencyPhone" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn("h-10 text-sm pl-9 rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87]/50 focus:border-[#004B87]")}
                  />
                </div>
              </div>

            </SectionCard>
          </div>

          {/* Estado + Acesso */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <SectionCard icon={CheckCircle} title="Estado da Conta" variant="emerald">
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: 'active',    label: 'Activo',   activeClass: 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-200', inactiveClass: 'border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600' },
                  { value: 'suspended', label: 'Suspenso', activeClass: 'bg-amber-500 text-white border-amber-500 shadow-amber-200',       inactiveClass: 'border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-600'   },
                  { value: 'inactive',  label: 'Inactivo', activeClass: 'bg-slate-500 text-white border-slate-500 shadow-slate-200',       inactiveClass: 'border-slate-200 text-slate-500 hover:border-slate-400'                       },
                ] as const).map((s) => (
                  <button key={s.value} type="button"
                    onClick={() => handleStatusChange(s.value)}
                    disabled={!isEditing}
                    className={cn(
                      "py-2.5 rounded-xl border-2 text-xs font-bold transition-all shadow-sm",
                      formData.status === s.value ? s.activeClass + ' shadow' : s.inactiveClass,
                      !isEditing && 'opacity-70 cursor-default'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              icon={Lock}
              title="Dados de Acesso"
              variant="orange"
              headerAction={
                <Button onClick={() => setShowPasswordReset(true)} variant="outline" size="sm"
                  className="h-8 text-xs border-2 border-[#F5821F]/50 text-[#F5821F] hover:bg-[#F5821F] hover:text-white rounded-lg transition-all"
                >
                  <Lock className="h-3 w-3 mr-1" /> Resetar
                </Button>
              }
            >
              <div className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-orange-50 to-white rounded-xl border border-[#F5821F]/15">
                <div className="h-10 w-10 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-xl flex items-center justify-center shadow-sm flex-shrink-0">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">Utilizador</p>
                  <p className="text-xs text-slate-400 font-mono">{student.username || '—'}</p>
                </div>
              </div>
            </SectionCard>

          </div>
        </div>
      )
    },

    // ── ACADÉMICO ─────────────────────────────────────────────
    {
      id: 'academico',
      label: 'Académico',
      icon: GraduationCap,
      color: PROFILE_MODAL_STYLES.tabs.orange,
      content: (
        <div className="space-y-5">

          <SectionCard icon={GraduationCap} title="Informações Académicas" variant="orange" contentPadding="p-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="level" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nível</Label>
                <Select value={formData.level} onValueChange={(v) => handleSelectChange('level', v)} disabled={!isEditing}>
                  <SelectTrigger className={cn("h-10 text-sm rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "")}>
                    <SelectValue placeholder="Selecionar nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 — Básico</SelectItem>
                    <SelectItem value="A2">A2 — Elementar</SelectItem>
                    <SelectItem value="B1">B1 — Intermédio</SelectItem>
                    <SelectItem value="B2">B2 — Intermédio Superior</SelectItem>
                    <SelectItem value="C1">C1 — Avançado</SelectItem>
                    <SelectItem value="C2">C2 — Proficiência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="enrollmentDate" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Data de Matrícula</Label>
                <Input id="enrollmentDate" name="enrollmentDate" type="date" value={formData.enrollmentDate}
                  onChange={handleInputChange} disabled={!isEditing}
                  className={cn("h-10 text-sm rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87]/50 focus:border-[#004B87]")}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Observações</Label>
              <Textarea id="notes" name="notes" value={formData.notes} onChange={handleTextareaChange}
                disabled={!isEditing} rows={3}
                className={cn("text-sm resize-none rounded-xl", !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87]/50 focus:border-[#004B87]")}
              />
            </div>

          </SectionCard>

          <SectionCard icon={BookOpen} title="Turma Actual" variant="navy">
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Turma',   value: student.className || 'N/A' },
                { label: 'Horário', value: 'Seg/Qua' },
                { label: 'Sala',    value: '105' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 text-center gap-1">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                  <p className="font-bold text-base text-[#004B87]">{item.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={DollarSign} title="Resumo Financeiro" variant="green" contentPadding="p-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100 text-center gap-1">
                <p className="text-[11px] font-semibold text-green-500 uppercase tracking-wider">Mensalidade</p>
                <p className="text-xl font-black text-green-700">{formatCurrency(performanceData.monthlyFee)}</p>
              </div>
              <div className="flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 text-center gap-1">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Pago</p>
                <p className="text-xl font-black text-[#004B87]">{formatCurrency(performanceData.totalPaid)}</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <span className="text-sm font-semibold text-green-700">Situação financeira</span>
              <Badge className="bg-green-500 hover:bg-green-600 text-xs gap-1">
                <CheckCircle className="h-3 w-3" /> Em Dia
              </Badge>
            </div>

            {onViewPaymentDetails && (
              <button
                onClick={() => onViewPaymentDetails(student)}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
              >
                <DollarSign className="h-4 w-4" />
                Ver Histórico Completo
              </button>
            )}

          </SectionCard>

        </div>
      )
    },

    // ── HISTÓRICO ─────────────────────────────────────────────
    {
      id: 'historico',
      label: 'Histórico',
      icon: Activity,
      color: PROFILE_MODAL_STYLES.tabs.purple,
      content: (
        <div className="space-y-5">

          <SectionCard icon={Activity} title="Desempenho Académico" variant="purple" contentPadding="p-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100 text-center gap-1">
                <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Nota Actual</p>
                <p className="text-3xl font-black text-purple-700">{performanceData.currentGrade.toFixed(1)}</p>
                <p className="text-[10px] text-purple-500">em 20 pontos</p>
              </div>
              <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl text-center gap-1 shadow-md shadow-blue-900/15">
                <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wider">Presença</p>
                <p className="text-3xl font-black text-white">{performanceData.attendance}%</p>
                <p className="text-[10px] text-white/60">assistência geral</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-4 py-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-[#004B87]/10 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-4 w-4 text-[#004B87]" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Aulas Assistidas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base text-[#004B87]">{performanceData.attendedLessons}</span>
                <span className="text-slate-400 text-sm">/</span>
                <span className="font-semibold text-sm text-slate-500">{performanceData.totalLessons}</span>
                <span className="text-xs text-slate-400 ml-1">aulas</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Taxa de Presença</span>
                <span className="text-xs font-bold text-[#004B87]">{performanceData.attendance}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#004B87] to-[#0066B3] rounded-full transition-all"
                  style={{ width: `${performanceData.attendance}%` }}
                />
              </div>
            </div>

          </SectionCard>

          {formData.notes && (
            <SectionCard icon={BookOpen} title="Observações do Perfil" variant="slate">
              <p className="text-sm text-slate-600 leading-relaxed">{formData.notes}</p>
            </SectionCard>
          )}

        </div>
      )
    }
  ];

  return (
    <>
      <ProfileModalBase
        isOpen={isOpen}
        onClose={onClose}
        title={formData.name}
        headerIcon={User}
        status={formData.status}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        showEditButton={true}
      />

      {/* ============================================================ */}
      {/* MODAL DE RESET DE SENHA                                       */}
      {/* ============================================================ */}
      <AlertDialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <AlertDialogContent className="max-w-md p-0 overflow-hidden gap-0">

          {/* Gradient Header */}
          <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] p-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25 flex-shrink-0">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-white font-bold text-base leading-tight m-0 p-0">
                  Resetar Senha
                </AlertDialogTitle>
                <AlertDialogDescription className="text-white/70 text-xs mt-0.5">
                  Nova senha para <span className="font-semibold text-white/90">{student?.name}</span>
                </AlertDialogDescription>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-5 space-y-4 bg-slate-50/40">

            <SectionCard icon={Key} title="Nova Senha de Acesso" variant="orange" contentPadding="p-4 space-y-3">

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={passwordData.password}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                    className="h-10 text-sm pl-9 pr-10 rounded-xl border-[#F5821F]/50 focus:border-[#F5821F]"
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="h-10 text-sm pl-9 pr-10 rounded-xl border-[#F5821F]/50 focus:border-[#F5821F]"
                    placeholder="Repetir senha"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 transition-colors">
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600">{passwordError}</p>
                </div>
              )}

            </SectionCard>

            <SectionCard icon={AlertCircle} title="Atenção" variant="amber" contentPadding="p-4">
              <p className="text-xs text-amber-700 leading-relaxed">
                O estudante fará login com a senha temporária e será obrigado a criar uma nova senha pessoal antes de aceder ao sistema.
              </p>
            </SectionCard>

          </div>

          {/* Footer */}
          <AlertDialogFooter className="px-5 py-4 bg-white border-t border-slate-200 sm:space-x-0 gap-2">
            <AlertDialogCancel
              onClick={() => {
                setPasswordData({ password: '', confirmPassword: '' });
                setPasswordError('');
              }}
              className="h-9 px-4 text-sm border border-slate-300 rounded-lg mt-0"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              className="h-9 px-5 text-sm rounded-lg bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold border-0"
            >
              <Key className="h-3.5 w-3.5 mr-1.5" /> Confirmar Reset
            </AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
