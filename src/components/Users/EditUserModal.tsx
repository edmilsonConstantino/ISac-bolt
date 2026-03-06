// EditUserModal.tsx
// Modal de edição de usuário — estilo painel (sidebar + conteúdo)
// Segue o mesmo padrão do EditInscriptionModal / EditRegistrationModal

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  User, Lock, Shield, Briefcase, Eye, EyeOff,
  AlertCircle, CheckCircle2, Sparkles, Save, X,
  Mail, Key, Hash, Phone, CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { SystemUser } from "./UsersList";

type Section = 'profile' | 'security';

const SECTIONS: { id: Section; label: string; desc: string; icon: typeof User }[] = [
  { id: 'profile',  label: 'Perfil',    desc: 'Nome, tipo e estado',      icon: User },
  { id: 'security', label: 'Segurança', desc: 'Alterar senha (opcional)', icon: Lock },
];

const ROLES = [
  {
    id: 'admin',
    label: 'Super Admin',
    description: 'Acesso total ao sistema',
    icon: Shield,
    gradient: 'from-red-500 to-rose-600',
    bg: 'bg-red-50',
    border: 'border-red-400',
    text: 'text-red-700',
  },
  {
    id: 'academic_admin',
    label: 'Academic Admin',
    description: 'Gestão académica sem acesso total',
    icon: Briefcase,
    gradient: 'from-purple-500 to-violet-600',
    bg: 'bg-purple-50',
    border: 'border-purple-400',
    text: 'text-purple-700',
  },
];

const passwordStrength = (pw: string) => {
  if (!pw) return null;
  if (pw.length < 6)  return { label: 'Fraca',  color: 'bg-red-500',    width: 'w-1/3' };
  if (pw.length < 10) return { label: 'Média',  color: 'bg-yellow-500', width: 'w-2/3' };
  return               { label: 'Forte',  color: 'bg-emerald-500', width: 'w-full' };
};

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onSave: (userData: Partial<SystemUser>) => void;
}

export function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [activeSection, setActiveSection] = useState<Section>('profile');

  const [form, setForm] = useState({
    name:            '',
    phone:           '',
    bi_number:       '',
    role:            'admin' as string,
    status:          'active' as 'active' | 'inactive',
    password:        '',
    confirmPassword: '',
  });

  const [showPw,    setShowPw]    = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name:            user.name      || '',
        phone:           user.phone     || '',
        bi_number:       user.bi_number || '',
        role:            user.role      || 'admin',
        status:          user.status    || 'active',
        password:        '',
        confirmPassword: '',
      });
      setErrors({});
      setActiveSection('profile');
      setShowPw(false);
      setShowConf(false);
    }
  }, [isOpen, user]);

  const set = <K extends keyof typeof form>(field: K, value: typeof form[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório';
    if (form.phone && !/^\d{9}$/.test(form.phone)) e.phone = 'Telefone deve ter exactamente 9 dígitos';
    if (form.bi_number && !/^\d{12}[A-Z]$/i.test(form.bi_number.trim())) e.bi_number = 'Formato inválido (12 dígitos + 1 letra)';
    if (form.password) {
      if (form.password.length < 6) e.password = 'Mínimo 6 caracteres';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Senhas não coincidem';
    }
    setErrors(e);
    if (e.name || e.phone || e.bi_number) setActiveSection('profile');
    else if (e.password || e.confirmPassword) setActiveSection('security');
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const data: Partial<SystemUser> & { newPassword?: string } = {
      name:      form.name,
      phone:     form.phone     || undefined,
      bi_number: form.bi_number ? form.bi_number.toUpperCase() : undefined,
      role:      form.role as SystemUser['role'],
      status:    form.status,
    };
    if (form.password) data.newPassword = form.password;
    onSave(data);
    onClose();
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%';
    const pw = Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setForm(prev => ({ ...prev, password: pw, confirmPassword: pw }));
    toast.success('Senha gerada automaticamente');
  };

  if (!user) return null;

  const currentRole = ROLES.find(r => r.id === form.role);
  const pwStrength  = passwordStrength(form.password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[580px]">

          {/* ── SIDEBAR ──────────────────────────────────────────────── */}
          <div className="w-64 bg-[#004B87] flex flex-col text-white p-6 shrink-0">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-bold text-base leading-tight text-white">
                  Editar Usuário
                </DialogTitle>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5 leading-none">
                  #{user.id}
                </p>
              </div>
            </div>

            {/* Info do utilizador */}
            <div className="mb-6 space-y-3 bg-white/8 rounded-xl p-3 border border-white/10">
              {/* Avatar */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#F5821F] to-[#FF9933] flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white font-semibold truncate">{user.name}</p>
                  {user.username && (
                    <p className="text-[10px] text-blue-200 font-mono truncate">@{user.username}</p>
                  )}
                </div>
              </div>

              {user.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-blue-300 shrink-0" />
                  <span className="text-[11px] text-blue-100 truncate">{user.email}</span>
                </div>
              )}

              {user.username && (
                <div className="flex items-center gap-2">
                  <Key className="h-3 w-3 text-blue-300 shrink-0" />
                  <code className="text-[11px] text-blue-100 font-mono">{user.username}</code>
                </div>
              )}
            </div>

            {/* Navegação */}
            <nav className="space-y-2 flex-1">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                const hasError = (s.id === 'profile'   && errors.name) ||
                                 (s.id === 'security'  && (errors.password || errors.confirmPassword));
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSection(s.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-white/15 text-white ring-1 ring-[#F5821F]/40"
                        : "text-blue-200/70 hover:text-white hover:bg-white/8"
                    )}
                  >
                    <div className={cn(
                      "p-1.5 rounded-lg shrink-0",
                      isActive ? "bg-[#F5821F]" : "bg-[#003A6B]"
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight">{s.label}</p>
                      <p className="text-[10px] opacity-60 leading-tight truncate">{s.desc}</p>
                    </div>
                    {hasError && (
                      <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Role badge */}
            <div className="mt-auto pt-4 border-t border-white/10">
              <p className="text-[10px] text-blue-300 uppercase tracking-wider mb-1.5">Perfil actual</p>
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold",
                currentRole?.bg || 'bg-slate-100',
                currentRole?.text || 'text-slate-600'
              )}>
                {currentRole && <currentRole.icon className="h-3 w-3" />}
                {currentRole?.label || form.role}
              </span>
            </div>
          </div>

          {/* ── CONTEÚDO ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/40">

              {/* ── PERFIL ── */}
              {activeSection === 'profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#F5821F]" />
                    Dados do Perfil
                  </h3>

                  {/* Tipo de Usuário */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Tipo de Usuário <span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      {ROLES.map(role => {
                        const Icon = role.icon;
                        const selected = form.role === role.id;
                        return (
                          <button
                            key={role.id}
                            type="button"
                            onClick={() => set('role', role.id)}
                            className={cn(
                              "relative p-4 rounded-xl border-2 transition-all text-left",
                              selected
                                ? `${role.border} ${role.bg} shadow-md`
                                : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                          >
                            {selected && (
                              <div className="absolute -top-2 -right-2">
                                <div className={cn("h-5 w-5 bg-gradient-to-br rounded-full flex items-center justify-center", role.gradient)}>
                                  <CheckCircle2 className="h-3 w-3 text-white" />
                                </div>
                              </div>
                            )}
                            <div className="flex items-start gap-3">
                              <div className={cn(
                                "h-9 w-9 rounded-lg flex items-center justify-center shrink-0",
                                selected ? `bg-gradient-to-br ${role.gradient}` : "bg-slate-100"
                              )}>
                                <Icon className={cn("h-4 w-4", selected ? "text-white" : "text-slate-500")} />
                              </div>
                              <div>
                                <p className={cn("font-bold text-sm", selected ? role.text : "text-slate-800")}>
                                  {role.label}
                                </p>
                                <p className={cn("text-[11px] mt-0.5", selected ? role.text : "text-slate-500")}>
                                  {role.description}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Nome + Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Nome Completo" required error={errors.name}>
                      <Input
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Nome completo"
                        className={cn("h-11 rounded-xl", errors.name && "border-red-400 bg-red-50")}
                      />
                    </Field>

                    <Field label="Estado">
                      <select
                        value={form.status}
                        onChange={e => set('status', e.target.value as 'active' | 'inactive')}
                        className="w-full h-11 px-3 border border-input rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
                      >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                      </select>
                    </Field>
                  </div>

                  {/* Telefone + BI */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Número de Telefone" error={errors.phone}>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={form.phone}
                          maxLength={9}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                            set('phone', val);
                          }}
                          placeholder="9 dígitos"
                          className={cn("h-11 rounded-xl pl-9", errors.phone && "border-red-400 bg-red-50")}
                        />
                      </div>
                      {!errors.phone && (
                        <p className="text-[11px] text-slate-400">{form.phone.length}/9 dígitos</p>
                      )}
                    </Field>

                    <Field label="Número de BI" error={errors.bi_number}>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          value={form.bi_number}
                          maxLength={13}
                          onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 13);
                            set('bi_number', val);
                          }}
                          placeholder="110100123456P"
                          className={cn("h-11 rounded-xl pl-9 font-mono", errors.bi_number && "border-red-400 bg-red-50")}
                        />
                      </div>
                    </Field>
                  </div>

                  {/* Username read-only */}
                  {user.username && (
                    <Field label="Username">
                      <div className="flex items-center gap-2 h-11 rounded-xl bg-slate-100 border border-slate-200 px-4">
                        <Hash className="h-4 w-4 text-slate-400 shrink-0" />
                        <code className="text-sm font-mono text-[#004B87]">{user.username}</code>
                      </div>
                    </Field>
                  )}
                </div>
              )}

              {/* ── SEGURANÇA ── */}
              {activeSection === 'security' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-[#F5821F]" />
                    Segurança
                  </h3>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-700">
                      Deixe os campos de senha em branco se não deseja alterar a senha do utilizador.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Nova Senha (opcional)
                      </Label>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="flex items-center gap-1.5 text-xs text-[#F5821F] hover:text-[#004B87] font-semibold transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Gerar senha automática
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Nova Senha" error={errors.password}>
                        <div className="relative">
                          <Input
                            type={showPw ? 'text' : 'password'}
                            value={form.password}
                            onChange={e => set('password', e.target.value)}
                            placeholder="••••••••"
                            className={cn("h-11 rounded-xl pr-10", errors.password && "border-red-400 bg-red-50")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPw(!showPw)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>

                      <Field label="Confirmar Senha" error={errors.confirmPassword}>
                        <div className="relative">
                          <Input
                            type={showConf ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={e => set('confirmPassword', e.target.value)}
                            placeholder="••••••••"
                            className={cn("h-11 rounded-xl pr-10", errors.confirmPassword && "border-red-400 bg-red-50")}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConf(!showConf)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </Field>
                    </div>

                    {/* Indicador de força */}
                    {pwStrength && (
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">Força:</span>
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", pwStrength.color, pwStrength.width)} />
                        </div>
                        <span className={cn(
                          "text-xs font-bold",
                          pwStrength.color === 'bg-red-500'     && "text-red-600",
                          pwStrength.color === 'bg-yellow-500'  && "text-yellow-600",
                          pwStrength.color === 'bg-emerald-500' && "text-emerald-600"
                        )}>
                          {pwStrength.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER ────────────────────────────────────────────────── */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 font-bold gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>

              <Button
                onClick={handleSave}
                className="bg-[#F5821F] hover:bg-[#E07318] text-white px-8 h-11 rounded-xl font-bold gap-2 shadow-lg shadow-orange-200"
              >
                <Save className="h-4 w-4" />
                Guardar Alterações
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
