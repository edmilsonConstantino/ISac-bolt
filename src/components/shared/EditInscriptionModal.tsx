// EditInscriptionModal.tsx
// Modal de edição de inscrição — estilo painel de informações (sidebar + conteúdo)

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  User, Phone, Mail, CreditCard, Calendar, MapPin,
  GraduationCap, Key, AlertCircle, Save, X, Loader2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface EditInscriptionStudentData {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  bi_number: string;
  address?: string;
  gender?: 'M' | 'F' | '';
  birth_date?: string;
  emergency_contact_1?: string;
  emergency_contact_2?: string;
  notes?: string;
  is_bolsista?: number | boolean;
  username?: string;
}

interface EditInscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: EditInscriptionStudentData | null;
  onSuccess: () => void;
}

type Section = 'personal' | 'contacts' | 'bolsa' | 'credentials';

const SECTIONS: { id: Section; label: string; desc: string; icon: typeof User }[] = [
  { id: 'personal',     label: 'Dados Pessoais', desc: 'Nome, BI, Género, Nascimento', icon: User },
  { id: 'contacts',     label: 'Contactos',      desc: 'Email, Telefone, Endereço',    icon: Phone },
  { id: 'bolsa',        label: 'Bolsa',           desc: 'Condição e Observações',       icon: GraduationCap },
  { id: 'credentials',  label: 'Credenciais',     desc: 'Acesso ao Portal',             icon: Key },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

export function EditInscriptionModal({ isOpen, onClose, student, onSuccess }: EditInscriptionModalProps) {
  const [activeSection, setActiveSection] = useState<Section>('personal');
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    bi_number: '',
    address: '',
    gender: '' as 'M' | 'F' | '',
    birth_date: '',
    emergency_contact_1: '',
    emergency_contact_2: '',
    notes: '',
    is_bolsista: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-popular quando abre
  useEffect(() => {
    if (isOpen && student) {
      setForm({
        name:                  student.name || '',
        email:                 student.email || '',
        phone:                 student.phone || '',
        bi_number:             student.bi_number || '',
        address:               student.address || '',
        gender:                (student.gender || '') as 'M' | 'F' | '',
        birth_date:            (student.birth_date || '').split('T')[0].split(' ')[0],
        emergency_contact_1:   student.emergency_contact_1 || '',
        emergency_contact_2:   student.emergency_contact_2 || '',
        notes:                 student.notes || '',
        is_bolsista:           Boolean(student.is_bolsista),
      });
      setErrors({});
      setActiveSection('personal');
    }
  }, [isOpen, student]);

  const set = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())       e.name      = 'Nome é obrigatório';
    if (!form.bi_number.trim())  e.bi_number = 'BI é obrigatório';
    else if (!/^\d{12}[A-Z]$/i.test(form.bi_number.trim())) e.bi_number = 'Formato inválido (12 dígitos + 1 letra)';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email inválido';
    if (form.phone && !/^\d{9}$/.test(form.phone)) e.phone = 'Telefone deve ter exactamente 9 dígitos';
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.name || e.bi_number || e.gender) setActiveSection('personal');
      else if (e.email) setActiveSection('contacts');
    }
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!student || !validate()) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/students.php?id=${student.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name:                form.name,
          email:               form.email || undefined,
          phone:               form.phone || undefined,
          bi_number:           form.bi_number.toUpperCase(),
          address:             form.address || undefined,
          gender:              form.gender || undefined,
          birth_date:          form.birth_date || undefined,
          emergency_contact_1: form.emergency_contact_1 || undefined,
          emergency_contact_2: form.emergency_contact_2 || undefined,
          notes:               form.notes || undefined,
          is_bolsista:         form.is_bolsista ? 1 : 0,
        }),
      });
      const result = await res.json();
      if (result.success === false) throw new Error(result.message || 'Erro ao guardar');
      toast.success('Inscrição actualizada com sucesso!');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[620px]">

          {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
          <div className="w-64 bg-[#004B87] flex flex-col text-white p-6 shrink-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="font-bold text-base leading-tight text-white">
                  Editar Inscrição
                </DialogTitle>
                <p className="text-[10px] text-blue-200 uppercase tracking-widest mt-0.5 leading-none">
                  {student.name.split(' ')[0]}
                </p>
              </div>
            </div>

            {/* Navegação */}
            <nav className="space-y-2 flex-1">
              {SECTIONS.map(s => {
                const Icon = s.icon;
                const isActive = activeSection === s.id;
                const hasError = (s.id === 'personal' && (errors.name || errors.bi_number)) ||
                                 (s.id === 'contacts' && errors.email);
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

            {/* Bolsista badge */}
            {form.is_bolsista && (
              <div className="mt-auto pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 px-1">
                  <GraduationCap className="h-4 w-4 text-purple-300 shrink-0" />
                  <span className="text-xs text-purple-200 font-semibold">Estudante Bolsista</span>
                </div>
              </div>
            )}
          </div>

          {/* ── CONTEÚDO ────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/40">

              {/* ── DADOS PESSOAIS ── */}
              {activeSection === 'personal' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-[#F5821F]" />
                    Dados Pessoais
                  </h3>

                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Nome Completo" required error={errors.name}>
                      <Input
                        value={form.name}
                        onChange={e => set('name', e.target.value)}
                        placeholder="Nome completo do estudante"
                        className={cn("h-11 rounded-xl", errors.name && "border-red-400 bg-red-50")}
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Número de BI" required error={errors.bi_number}>
                        <Input
                          value={form.bi_number}
                          onChange={e => set('bi_number', e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 13))}
                          placeholder="110100123456P"
                          className={cn("h-11 rounded-xl font-mono", errors.bi_number && "border-red-400 bg-red-50")}
                        />
                      </Field>

                      <Field label="Género">
                        <select
                          value={form.gender}
                          onChange={e => set('gender', e.target.value as 'M' | 'F' | '')}
                          className="w-full h-11 px-3 border border-input rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
                        >
                          <option value="">Seleccionar…</option>
                          <option value="M">Masculino</option>
                          <option value="F">Feminino</option>
                        </select>
                      </Field>
                    </div>

                    <Field label="Data de Nascimento">
                      <Input
                        type="date"
                        value={form.birth_date}
                        onChange={e => set('birth_date', e.target.value)}
                        className="h-11 rounded-xl"
                      />
                    </Field>
                  </div>
                </div>
              )}

              {/* ── CONTACTOS ── */}
              {activeSection === 'contacts' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-[#F5821F]" />
                    Contactos
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Email" error={errors.email}>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={e => set('email', e.target.value)}
                        placeholder="email@exemplo.com"
                        className={cn("h-11 rounded-xl", errors.email && "border-red-400 bg-red-50")}
                      />
                    </Field>
                    <Field label="Telefone" error={errors.phone}>
                      <Input
                        value={form.phone}
                        maxLength={9}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                          set('phone', val);
                        }}
                        placeholder="9 dígitos (ex: 841234567)"
                        className={cn("h-11 rounded-xl", errors.phone && "border-red-400 bg-red-50")}
                      />
                      {!errors.phone && (
                        <p className="text-[11px] text-slate-400">{form.phone.length}/9 dígitos</p>
                      )}
                    </Field>
                  </div>

                  <Field label="Endereço">
                    <Input
                      value={form.address}
                      onChange={e => set('address', e.target.value)}
                      placeholder="Bairro, cidade, província"
                      className="h-11 rounded-xl"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Contacto de Emergência 1">
                      <Input
                        value={form.emergency_contact_1}
                        maxLength={9}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                          set('emergency_contact_1', val);
                        }}
                        placeholder="9 dígitos"
                        className="h-11 rounded-xl"
                      />
                      <p className="text-[11px] text-slate-400">{form.emergency_contact_1.length}/9 dígitos</p>
                    </Field>
                    <Field label="Contacto de Emergência 2">
                      <Input
                        value={form.emergency_contact_2}
                        maxLength={9}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                          set('emergency_contact_2', val);
                        }}
                        placeholder="9 dígitos"
                        className="h-11 rounded-xl"
                      />
                      <p className="text-[11px] text-slate-400">{form.emergency_contact_2.length}/9 dígitos</p>
                    </Field>
                  </div>
                </div>
              )}

              {/* ── BOLSA ── */}
              {activeSection === 'bolsa' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#F5821F]" />
                    Condição de Bolsa
                  </h3>

                  {/* Toggle bolsista — bidirecional na edição */}
                  <div
                    onClick={() => set('is_bolsista', !form.is_bolsista)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all select-none",
                      form.is_bolsista
                        ? "border-purple-400 bg-purple-50 hover:border-purple-500"
                        : "border-slate-200 bg-white hover:border-purple-300"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        form.is_bolsista ? "bg-purple-200 text-purple-700" : "bg-slate-100 text-slate-500"
                      )}>
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm", form.is_bolsista ? "text-purple-800" : "text-slate-700")}>
                          Estudante Bolsista
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {form.is_bolsista
                            ? "Bolsa activa — mensalidades isentas. Clique para remover."
                            : "Isento de mensalidades — paga apenas inscrição e taxa de matrícula"}
                        </p>
                      </div>
                    </div>
                    {/* Switch visual */}
                    <div className={cn(
                      "relative w-12 h-6 rounded-full transition-colors shrink-0",
                      form.is_bolsista ? "bg-purple-500" : "bg-slate-300"
                    )}>
                      <div className={cn(
                        "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all",
                        form.is_bolsista ? "left-7" : "left-1"
                      )} />
                    </div>
                  </div>

                  {/* Observações */}
                  <Field label="Observações">
                    <Textarea
                      value={form.notes}
                      onChange={e => set('notes', e.target.value)}
                      placeholder="Informações adicionais sobre o estudante…"
                      rows={4}
                      className="rounded-xl resize-none"
                    />
                  </Field>
                </div>
              )}

              {/* ── CREDENCIAIS (read-only) ── */}
              {activeSection === 'credentials' && (
                <div className="space-y-5 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                    <Key className="h-4 w-4 text-[#F5821F]" />
                    Credenciais de Acesso
                  </h3>

                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-700">
                      As credenciais de acesso são geradas automaticamente e não podem ser alteradas aqui.
                      Para redefinir a senha, utilize a funcionalidade de gestão de utilizadores.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Username">
                      <div className="h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center px-4">
                        <span className="font-mono text-sm text-slate-600">{student.username || '—'}</span>
                      </div>
                    </Field>
                    <Field label="Senha">
                      <div className="h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center px-4">
                        <span className="text-sm text-slate-400 italic">Protegida</span>
                      </div>
                    </Field>
                  </div>
                </div>
              )}
            </div>

            {/* ── FOOTER ──────────────────────────────────────────────── */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={onClose}
                disabled={isSaving}
                className="text-slate-400 hover:text-slate-600 font-bold gap-2"
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#F5821F] hover:bg-[#E07318] text-white px-8 h-11 rounded-xl font-bold gap-2 shadow-lg shadow-orange-200"
              >
                {isSaving ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</>
                ) : (
                  <><Save className="h-4 w-4" /> Guardar Alterações</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Helper: campo com label + erro ──────────────────────────────────────────
function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
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
