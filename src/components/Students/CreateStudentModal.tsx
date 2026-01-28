import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  UserPlus, Mail, Phone, Calendar, MapPin, BookOpen,
  User, AlertCircle, Sparkles, ChevronRight, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// ✅ Interface ATUALIZADA - SEM curso_id
interface StudentFormData {
  name: string;
  email: string;
  phone?: string;
  bi_number: string;
  address?: string;
  gender: 'M' | 'F' | '';
  birth_date?: string;
  emergency_contact_1?: string;
  emergency_contact_2?: string;
  notes?: string;
  class_id?: number;
  enrollment_year: number;
  enrollment_number: string;
  status: 'ativo' | 'inativo';
  // ❌ REMOVIDO: curso_id
}

interface Class {
  id: number;
  name: string;
  schedule: string;
  teacher: string;
  students: number;
}

// ✅ Props ATUALIZADAS - SEM courseId e availableCourses
interface CreateStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: StudentFormData) => void;
  availableClasses: Class[];
  preSelectedClassId?: number;
  preSelectedClassName?: string;
  // ❌ REMOVIDO: courseId: string;
  // ❌ REMOVIDO: availableCourses: APICourse[];
}

export function CreateStudentModal({
  isOpen,
  onClose,
  onSave,
  availableClasses,
  preSelectedClassId,
  preSelectedClassName,
}: CreateStudentModalProps) {
  
  const [activeTab, setActiveTab] = useState<'personal' | 'contacts'>('personal');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bi_number: '',
    address: '',
    gender: '' as 'M' | 'F' | '',
    class_id: preSelectedClassId || 0,
    birthDay: '',
    birthMonth: '',
    birthYear: '',
    emergency_contact_1: '',
    emergency_contact_2: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (preSelectedClassId) {
      setFormData(prev => ({ ...prev, class_id: preSelectedClassId }));
    }
  }, [preSelectedClassId]);

  const isClassPreSelected = Boolean(preSelectedClassId && preSelectedClassName);
  const selectedClass = availableClasses.find(c => c.id === formData.class_id);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Gerar número de matrícula automaticamente
  const generateEnrollmentNumber = (): string => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    return `${year}${random}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Campos obrigatórios
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validação do BI (12 números + 1 letra)
    if (!formData.bi_number.trim()) {
      newErrors.bi_number = 'Número do BI é obrigatório';
    } else if (!/^\d{12}[A-Z]$/i.test(formData.bi_number.trim())) {
      newErrors.bi_number = 'BI inválido. Formato: 12 números + 1 letra (ex: 110100123456P)';
    }
    
    if (!formData.gender) newErrors.gender = 'Selecione o sexo';

    // Validação de data de nascimento (se preenchida)
    if (formData.birthDay || formData.birthMonth || formData.birthYear) {
      const day = parseInt(formData.birthDay);
      const month = parseInt(formData.birthMonth);
      const year = parseInt(formData.birthYear);

      if (!formData.birthDay || day < 1 || day > 31) {
        newErrors.birthDate = 'Dia inválido';
      }
      if (!formData.birthMonth || month < 1 || month > 12) {
        newErrors.birthDate = 'Mês inválido';
      }
      if (!formData.birthYear || year < 1900 || year > new Date().getFullYear()) {
        newErrors.birthDate = 'Ano inválido';
      }
    }

    // Validação de contatos de emergência (se preenchidos)
    if (formData.emergency_contact_1 && !/^\+?\d+$/.test(formData.emergency_contact_1.replace(/\s/g, ''))) {
      newErrors.emergency_contact_1 = 'Deve conter apenas números';
    }
    if (formData.emergency_contact_2 && !/^\+?\d+$/.test(formData.emergency_contact_2.replace(/\s/g, ''))) {
      newErrors.emergency_contact_2 = 'Deve conter apenas números';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        // Montar data de nascimento
        let birth_date = undefined;
        if (formData.birthDay && formData.birthMonth && formData.birthYear) {
          const day = formData.birthDay.padStart(2, '0');
          const month = formData.birthMonth.padStart(2, '0');
          birth_date = `${formData.birthYear}-${month}-${day}`;
        }

        // ✅ Dados formatados para API - SEM curso_id
        const studentData: StudentFormData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          bi_number: formData.bi_number.toUpperCase(),
          address: formData.address || undefined,
          gender: formData.gender as 'M' | 'F',
          birth_date,
          emergency_contact_1: formData.emergency_contact_1 || undefined,
          emergency_contact_2: formData.emergency_contact_2 || undefined,
          notes: formData.notes || undefined,
          class_id: formData.class_id > 0 ? formData.class_id : undefined,
          enrollment_number: generateEnrollmentNumber(),
          enrollment_year: new Date().getFullYear(),
          status: 'ativo'
          // ❌ REMOVIDO: curso_id
        };

        onSave(studentData);
        handleClose();

      } catch (error: any) {
        console.error("Erro ao criar estudante:", error);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '', email: '', phone: '', bi_number: '', address: '', gender: '',
      class_id: preSelectedClassId || 0,
      birthDay: '', birthMonth: '', birthYear: '',
      emergency_contact_1: '', emergency_contact_2: '', notes: ''
    });
    setErrors({});
    setActiveTab('personal');
    onClose();
  };

  const validateAndNext = () => {
    const tabs: ('personal' | 'contacts')[] = ['personal', 'contacts'];
    const nextIndex = tabs.indexOf(activeTab) + 1;
    if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[650px]">
          
          {/* SIDEBAR */}
          <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <UserPlus className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">Student Manager</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">
                  {isClassPreSelected ? `Turma: ${preSelectedClassName}` : 'Cadastro de Perfil'}
                </span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {[
                { id: 'personal', label: 'Dados Pessoais', icon: User, desc: 'Informações Básicas' },
                { id: 'contacts', label: 'Contatos', icon: Phone, desc: 'Emergência e Observações' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left group",
                    activeTab === tab.id 
                      ? "bg-white/10 text-white ring-1 ring-[#F5821F]/30 shadow-xl" 
                      : "text-blue-200/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    activeTab === tab.id ? "bg-[#F5821F] text-white" : "bg-[#003A6B] text-blue-300 group-hover:bg-[#003A6B]/80"
                  )}>
                    <tab.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{tab.label}</p>
                    <p className="text-[11px] opacity-60">{tab.desc}</p>
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-auto p-4 bg-[#F5821F]/10 border border-[#F5821F]/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-[#F5821F]">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Dica</span>
              </div>
              <p className="text-[11px] text-blue-100 leading-relaxed">
                O curso será selecionado posteriormente no processo de matrícula.
              </p>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 flex flex-col">
            <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                  {isClassPreSelected ? `Novo Estudante - ${preSelectedClassName}` : 'Cadastrar Perfil de Estudante'}
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <span>Cadastro de Perfil</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#F5821F] font-medium">{activeTab.toUpperCase()}</span>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">
              
              {/* TAB: PERSONAL */}
              {activeTab === 'personal' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  
                  {isClassPreSelected && selectedClass && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-2xl p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 text-lg">{selectedClass.name}</h4>
                          <p className="text-sm text-blue-700">
                            📅 {selectedClass.schedule} • 👨‍🏫 {selectedClass.teacher}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-[#F5821F]/10 text-[#F5821F] rounded-lg">
                        <User className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Identificação</Label>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Nome Completo <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="Nome completo do estudante"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={cn("h-12 rounded-xl", errors.name && "border-red-500")}
                        />
                        {errors.name && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Número do BI <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            placeholder="110100123456P"
                            value={formData.bi_number}
                            onChange={(e) => {
                              const value = e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 13);
                              handleInputChange('bi_number', value);
                            }}
                            maxLength={13}
                            className={cn("h-12 rounded-xl font-mono", errors.bi_number && "border-red-500")}
                          />
                          {errors.bi_number && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.bi_number}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Sexo <span className="text-red-500">*</span>
                          </Label>
                          <select
                            value={formData.gender}
                            onChange={(e) => handleInputChange('gender', e.target.value)}
                            className={cn(
                              "w-full h-12 px-4 border-2 rounded-xl outline-none focus:ring-2 focus:ring-[#F5821F]/20",
                              errors.gender ? "border-red-500" : "border-slate-200"
                            )}
                          >
                            <option value="">Selecione</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                          </select>
                          {errors.gender && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.gender}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="email@exemplo.com"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className={cn("h-12 pl-11 rounded-xl", errors.email && "border-red-500")}
                            />
                          </div>
                          {errors.email && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.email}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">Telefone</Label>
                          <div className="relative">
                            <Phone className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              placeholder="+258 84 123 4567"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="h-12 pl-11 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">Data de Nascimento</Label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-3 h-4 w-4 text-slate-400 z-10" />
                            <div className="flex items-center gap-1 border-2 border-slate-200 rounded-xl h-12 pl-11 pr-3">
                              <input
                                value={formData.birthDay}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                  handleInputChange('birthDay', value);
                                }}
                                placeholder="DD"
                                maxLength={2}
                                className="w-8 text-center outline-none bg-transparent"
                              />
                              <span className="text-slate-400 font-bold">/</span>
                              <input
                                value={formData.birthMonth}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 2);
                                  handleInputChange('birthMonth', value);
                                }}
                                placeholder="MM"
                                maxLength={2}
                                className="w-8 text-center outline-none bg-transparent"
                              />
                              <span className="text-slate-400 font-bold">/</span>
                              <input
                                value={formData.birthYear}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                  handleInputChange('birthYear', value);
                                }}
                                placeholder="AAAA"
                                maxLength={4}
                                className="w-14 text-center outline-none bg-transparent"
                              />
                            </div>
                          </div>
                          {errors.birthDate && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.birthDate}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">Endereço</Label>
                          <div className="relative">
                            <MapPin className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              placeholder="Endereço completo"
                              value={formData.address}
                              onChange={(e) => handleInputChange('address', e.target.value)}
                              className="h-12 pl-11 rounded-xl"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: CONTACTS */}
              {activeTab === 'contacts' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                        <Phone className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">
                        Contatos de Emergência <span className="text-slate-500">(Opcional)</span>
                      </Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Contato 1</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="+258 84 000 0000"
                            value={formData.emergency_contact_1}
                            onChange={(e) => handleInputChange('emergency_contact_1', e.target.value)}
                            className={cn("h-12 pl-11 rounded-xl", errors.emergency_contact_1 && "border-red-500")}
                          />
                        </div>
                        {errors.emergency_contact_1 && (
                          <p className="text-xs text-red-600">{errors.emergency_contact_1}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Contato 2</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="+258 85 000 0000"
                            value={formData.emergency_contact_2}
                            onChange={(e) => handleInputChange('emergency_contact_2', e.target.value)}
                            className={cn("h-12 pl-11 rounded-xl", errors.emergency_contact_2 && "border-red-500")}
                          />
                        </div>
                        {errors.emergency_contact_2 && (
                          <p className="text-xs text-red-600">{errors.emergency_contact_2}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold ml-1">Observações</Label>
                      <Textarea
                        placeholder="Informações adicionais sobre o estudante..."
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={6}
                        className="rounded-2xl resize-none"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#004B87] mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#F5821F]" />
                      Resumo do Cadastro
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Nome:</span>
                        <span className="text-sm font-semibold text-[#004B87]">{formData.name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">BI:</span>
                        <span className="text-sm font-mono font-semibold">{formData.bi_number || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Email:</span>
                        <span className="text-sm font-semibold">{formData.email || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Sexo:</span>
                        <span className="text-sm font-semibold">
                          {formData.gender === 'M' ? 'Masculino' : formData.gender === 'F' ? 'Feminino' : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button variant="ghost" onClick={handleClose} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest">
                Cancelar
              </Button>
              
              <div className="flex gap-3">
                {activeTab !== 'contacts' ? (
                  <Button 
                    onClick={validateAndNext}
                    className="bg-[#004B87] text-white hover:bg-[#003A6B] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    Próximo Passo <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSave}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl shadow-orange-500/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Cadastrar Perfil
                  </Button>
                )}
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}