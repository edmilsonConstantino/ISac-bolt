import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UserPlus, User, Mail, Phone, Calendar, MapPin,
  GraduationCap, Award, Briefcase, BookOpen, Users,
  Shield, Key, Lock, X, AlertCircle, Sparkles,
  ChevronRight, CheckCircle2, Sun, Sunset, Moon
} from "lucide-react";
import teacherService, { CreateTeacherData } from "@/services/teacherService";
import courseService from "@/services/courseService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Class } from "../../types";

interface Course {
  id: number;
  codigo: string;
  nome: string;
  status: string;
}

interface CreateTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacherData: any) => void;
  availableClasses?: Class[];
}

export function CreateTeacherModal({
  isOpen,
  onClose,
  onSave,
  availableClasses = []
}: CreateTeacherModalProps) {

  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'contract' | 'turmas' | 'credentials'>('personal');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '' as 'M' | 'F' | '',
    birth_date: '',
    address: '',
    specialization: '',
    qualifications: '',
    experience: '',
    contractType: 'full-time',
    cursos: [] as string[],
    turnos: [] as string[],
    startDate: new Date().toISOString().split('T')[0],
    assignedClasses: [] as number[],
    emergencyContact1: '',
    emergencyContact2: '',
    notes: '',
  });

  const [courses, setCourses] = useState<Course[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar cursos ao abrir o modal
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const result = await courseService.getAll();
        // courseService.getAll() retorna Course[] directamente
        if (Array.isArray(result)) {
          setCourses(result.filter((c: Course) => c.status === 'ativo'));
        }
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
      }
    };
    loadCourses();
  }, []);

  // Gerar preview do username: TEACHXX.0001.ANO (XX = 1ª letra primeiro nome + 1ª letra último nome)
  const getUsernamePreview = () => {
    const name = formData.name.trim();
    const year = new Date().getFullYear();
    if (!name) return `TEACH??.0001.${year}`;
    const parts = name.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/\s+/).filter(Boolean);
    const first = (parts[0] || '').replace(/[^A-Z]/g, '').charAt(0);
    const last = parts.length > 1 ? (parts[parts.length - 1] || '').replace(/[^A-Z]/g, '').charAt(0) : '';
    const initials = (first + last).padEnd(2, 'X');
    return `TEACH${initials}.0001.${year}`;
  };

  const handleInputChange = (field: string, value: string | number | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleClassAssignment = (classId: number) => {
    setFormData(prev => ({
      ...prev,
      assignedClasses: prev.assignedClasses.includes(classId)
        ? prev.assignedClasses.filter(id => id !== classId)
        : [...prev.assignedClasses, classId]
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.qualifications.trim()) newErrors.qualifications = 'Qualificações são obrigatórias';
    if (!formData.experience.trim()) newErrors.experience = 'Experiência é obrigatória';
    if (!formData.startDate) newErrors.startDate = 'Data de início é obrigatória';

    if (formData.birth_date) {
      const year = new Date(formData.birth_date).getFullYear();
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        newErrors.birth_date = 'Data de nascimento inválida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      try {
        const teacherData: CreateTeacherData = {
          nome: formData.name,
          email: formData.email,
          telefone: formData.phone || undefined,
          genero: formData.gender || undefined,
          data_nascimento: formData.birth_date || undefined,
          endereco: formData.address || undefined,
          especialidade: formData.specialization || undefined,
          cursos: formData.cursos.length > 0 ? formData.cursos.join(',') : undefined,
          turnos: formData.turnos.length > 0 ? formData.turnos.join(',') : undefined,
          tipo_contrato: formData.contractType === 'full-time' ? 'tempo_integral' :
            formData.contractType === 'part-time' ? 'meio_periodo' :
              formData.contractType === 'freelance' ? 'freelancer' : 'substituto',
          data_inicio: formData.startDate,
          contato_emergencia: `${formData.emergencyContact1}${formData.emergencyContact2 ? ', ' + formData.emergencyContact2 : ''}` || undefined,
          observacoes: `${formData.qualifications}\n\n${formData.experience}\n\n${formData.notes}`.trim(),
          status: 'ativo'
        };

        console.log('📤 Enviando dados do docente:', teacherData);
        const response = await teacherService.create(teacherData);

        toast.success(response.message || "Docente cadastrado com sucesso!");
        onSave(formData);
        handleClose();

      } catch (error: any) {
        console.error("Erro ao criar docente:", error);
        if (error.field === 'email') {
          setErrors({ email: error.message });
          setActiveTab('personal');
        } else {
          toast.error(error.message || "Erro ao cadastrar docente");
        }
      }
    }
  };

  const handleClose = () => {
    setFormData({
      name: '', email: '', phone: '', gender: '' as 'M' | 'F' | '',
      birth_date: '',
      address: '', specialization: '', qualifications: '', experience: '',
      contractType: 'full-time', cursos: [], turnos: [],
      startDate: new Date().toISOString().split('T')[0],
      assignedClasses: [], emergencyContact1: '', emergencyContact2: '', notes: '',
    });
    setErrors({});
    setActiveTab('personal');
    onClose();
  };

  const validateAndNext = () => {
    const tabs: ('personal' | 'academic' | 'contract' | 'turmas' | 'credentials')[] = [
      'personal', 'academic', 'contract', 'turmas', 'credentials'
    ];
    const nextIndex = tabs.indexOf(activeTab) + 1;
    if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
  };

  // Filtrar turmas disponíveis com base nos cursos e turno selecionados
  // Exclui turmas que já têm docente atribuído
  const getFilteredClasses = () => {
    if (formData.cursos.length === 0 || formData.turnos.length === 0) return [];

    return availableClasses.filter(cls => {
      // Excluir turmas que já têm docente atribuído
      if (cls.teacher_id) return false;

      // Verificar se a turma é de algum dos cursos seleccionados
      const matchesCourse = formData.cursos.some(c => cls.curso === c || cls.code?.includes(c));

      // Verificar se o turno corresponde
      const turnoMap: Record<string, string> = {
        'manha': 'manha',
        'tarde': 'tarde',
        'noite': 'noite',
        'morning': 'manha',
        'afternoon': 'tarde',
        'evening': 'noite'
      };
      const classTurno = turnoMap[cls.schedule?.toLowerCase()] || cls.schedule;
      const matchesTurno = formData.turnos.includes('todos') || formData.turnos.includes(classTurno);

      return matchesCourse && matchesTurno;
    });
  };

  const toggleTurno = (turno: string) => {
    setFormData(prev => {
      let newTurnos: string[];
      if (turno === 'todos') {
        // Se seleccionar "todos", remove os outros
        newTurnos = prev.turnos.includes('todos') ? [] : ['todos'];
      } else {
        // Se seleccionar um turno específico, remove "todos" se estiver lá
        newTurnos = prev.turnos.filter(t => t !== 'todos');
        if (newTurnos.includes(turno)) {
          newTurnos = newTurnos.filter(t => t !== turno);
        } else {
          newTurnos = [...newTurnos, turno];
        }
      }
      return { ...prev, turnos: newTurnos };
    });
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
                <h2 className="font-bold text-lg leading-none">Docente</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">
                  Cadastro Completo
                </span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {[
                { id: 'personal', label: 'Dados Pessoais', icon: User, desc: 'Informações Básicas' },
                { id: 'academic', label: 'Acadêmico', icon: GraduationCap, desc: 'Qualificações' },
                { id: 'contract', label: 'Contratual', icon: Briefcase, desc: 'Contrato e Curso' },
                { id: 'turmas', label: 'Turmas', icon: Users, desc: 'Atribuir Turmas' },
                { id: 'credentials', label: 'Credenciais', icon: Shield, desc: 'Acesso ao Sistema' },
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

            <div className="mt-auto space-y-3">
              {/* Username preview em tempo real */}
              <div className="p-4 bg-white/10 border border-white/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-2 text-blue-200">
                  <Key className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Username Previsto</span>
                </div>
                <p className="font-mono text-white text-sm font-bold tracking-wide break-all">
                  {getUsernamePreview()}
                </p>
                {!formData.name.trim() && (
                  <p className="text-[10px] text-blue-300 mt-1">← Preencha o nome</p>
                )}
              </div>
              {/* Dica primeiro acesso */}
              <div className="p-3 bg-[#F5821F]/10 border border-[#F5821F]/20 rounded-2xl">
                <div className="flex items-center gap-2 mb-1 text-[#F5821F]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase">1º Acesso</span>
                </div>
                <p className="text-[10px] text-blue-100 leading-relaxed">
                  Senha inicial = username. O docente define a senha pessoal no primeiro login.
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT AREA */}
          <div className="flex-1 flex flex-col">
            <header className="px-10 py-8 border-b border-slate-100">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                Cadastrar Novo Docente
              </DialogTitle>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <span>Gestão de Professores</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#F5821F] font-medium">{activeTab.toUpperCase()}</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">

              {/* TAB: PERSONAL */}
              {activeTab === 'personal' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
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
                          placeholder="Nome completo do professor"
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

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Email <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                            <Input
                              type="email"
                              placeholder="professor@exemplo.com"
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

                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">Género</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => handleInputChange('gender', 'M')}
                              className={cn(
                                "h-12 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2",
                                formData.gender === 'M'
                                  ? "border-blue-500 bg-blue-50 text-blue-700"
                                  : "border-slate-200 hover:border-slate-300 text-slate-600"
                              )}
                            >
                              <User className="h-4 w-4" />
                              M
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInputChange('gender', 'F')}
                              className={cn(
                                "h-12 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2",
                                formData.gender === 'F'
                                  ? "border-pink-500 bg-pink-50 text-pink-700"
                                  : "border-slate-200 hover:border-slate-300 text-slate-600"
                              )}
                            >
                              <User className="h-4 w-4" />
                              F
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">Data de Nascimento</Label>
                          <div className="relative">
                            <Calendar className="absolute left-4 top-3 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                            <input
                              type="date"
                              value={formData.birth_date}
                              max={new Date().toISOString().split('T')[0]}
                              min="1900-01-01"
                              onChange={(e) => handleInputChange('birth_date', e.target.value)}
                              className={cn(
                                "w-full h-12 pl-11 pr-4 border-2 rounded-xl outline-none font-semibold text-slate-800",
                                "focus:ring-2 focus:ring-[#F5821F]/20 focus:border-[#F5821F] transition-all",
                                errors.birth_date ? "border-red-500 bg-red-50" : "border-slate-200 bg-white"
                              )}
                            />
                          </div>
                          {errors.birth_date && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.birth_date}
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

                  {/* Contatos de Emergência */}
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
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
                            value={formData.emergencyContact1}
                            onChange={(e) => handleInputChange('emergencyContact1', e.target.value)}
                            className="h-12 pl-11 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Contato 2</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="+258 85 000 0000"
                            value={formData.emergencyContact2}
                            onChange={(e) => handleInputChange('emergencyContact2', e.target.value)}
                            className="h-12 pl-11 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* TAB: ACADEMIC */}
              {activeTab === 'academic' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Formação Acadêmica</Label>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Especialização</Label>
                        <div className="relative">
                          <Award className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Ex: Matemática, Física, Literatura..."
                            value={formData.specialization}
                            onChange={(e) => handleInputChange('specialization', e.target.value)}
                            className="h-12 pl-11 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Qualificações <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          placeholder="Ex: Licenciatura em Letras - Inglês, Certificado TEFL, Mestrado..."
                          value={formData.qualifications}
                          onChange={(e) => handleInputChange('qualifications', e.target.value)}
                          rows={4}
                          className={cn("rounded-2xl resize-none", errors.qualifications && "border-red-500")}
                        />
                        {errors.qualifications && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.qualifications}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Experiência Profissional <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                          placeholder="Descreva a experiência profissional do docente..."
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          rows={4}
                          className={cn("rounded-2xl resize-none", errors.experience && "border-red-500")}
                        />
                        {errors.experience && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.experience}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Observações */}
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <Label className="font-bold text-slate-700">Observações Adicionais</Label>
                    <Textarea
                      placeholder="Informações adicionais sobre o docente..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      rows={4}
                      className="rounded-2xl resize-none"
                    />
                  </section>
                </div>
              )}

              {/* TAB: CONTRACT */}
              {activeTab === 'contract' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Informações Contratuais</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Tipo de Contrato</Label>
                        <select
                          value={formData.contractType}
                          onChange={(e) => handleInputChange('contractType', e.target.value)}
                          className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#F5821F]/20 outline-none"
                        >
                          <option value="full-time">Tempo Integral</option>
                          <option value="part-time">Meio Período</option>
                          <option value="freelance">Freelancer</option>
                          <option value="substitute">Substituto</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Data de Início <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className={cn("h-12 rounded-xl", errors.startDate && "border-red-500")}
                        />
                        {errors.startDate && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.startDate}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Curso e Turnos */}
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Leccionação</Label>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Curso(s) que vai Leccionar <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
                          {courses.map(course => {
                            const isSelected = formData.cursos.includes(course.codigo);
                            return (
                              <button
                                key={course.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => {
                                    const newCursos = isSelected
                                      ? prev.cursos.filter(c => c !== course.codigo)
                                      : [...prev.cursos, course.codigo];
                                    return { ...prev, cursos: newCursos, assignedClasses: [] };
                                  });
                                }}
                                className={cn(
                                  "h-11 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-sm px-3",
                                  isSelected
                                    ? "border-purple-500 bg-purple-50 text-purple-700"
                                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                                )}
                              >
                                <BookOpen className="h-4 w-4 flex-shrink-0" />
                                <span className="truncate">{course.nome}</span>
                              </button>
                            );
                          })}
                        </div>
                        {formData.cursos.length > 0 && (
                          <p className="text-xs text-purple-600 font-medium">
                            {formData.cursos.length} curso(s) seleccionado(s)
                          </p>
                        )}
                        {formData.cursos.length === 0 && (
                          <p className="text-xs text-slate-500">Seleccione pelo menos um curso</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Turnos de Leccionação <span className="text-red-500">*</span>
                        </Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { id: 'manha', label: 'Manhã', icon: Sun, color: 'amber' },
                            { id: 'tarde', label: 'Tarde', icon: Sunset, color: 'orange' },
                            { id: 'noite', label: 'Noite', icon: Moon, color: 'indigo' },
                            { id: 'todos', label: 'Todos', icon: CheckCircle2, color: 'green' },
                          ].map(turno => {
                            const isSelected = formData.turnos.includes(turno.id);
                            const Icon = turno.icon;
                            return (
                              <button
                                key={turno.id}
                                type="button"
                                onClick={() => toggleTurno(turno.id)}
                                className={cn(
                                  "h-11 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-sm",
                                  isSelected
                                    ? turno.color === 'amber' ? "border-amber-500 bg-amber-50 text-amber-700" :
                                      turno.color === 'orange' ? "border-orange-500 bg-orange-50 text-orange-700" :
                                      turno.color === 'indigo' ? "border-indigo-500 bg-indigo-50 text-indigo-700" :
                                      "border-green-500 bg-green-50 text-green-700"
                                    : "border-slate-200 hover:border-slate-300 text-slate-600"
                                )}
                              >
                                <Icon className="h-4 w-4" />
                                {turno.label}
                              </button>
                            );
                          })}
                        </div>
                        {formData.turnos.length === 0 && (
                          <p className="text-xs text-slate-500">Seleccione pelo menos um turno</p>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Resumo */}
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
                        <span className="text-sm text-slate-600">Email:</span>
                        <span className="text-sm font-semibold">{formData.email || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Especialização:</span>
                        <span className="text-sm font-semibold text-purple-600">{formData.specialization || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Tipo de Contrato:</span>
                        <span className="text-sm font-semibold">
                          {formData.contractType === 'full-time' ? 'Tempo Integral' :
                            formData.contractType === 'part-time' ? 'Meio Período' :
                              formData.contractType === 'freelance' ? 'Freelancer' : 'Substituto'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Curso(s):</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {formData.cursos.length > 0
                            ? formData.cursos.map(c => courses.find(co => co.codigo === c)?.nome || c).join(', ')
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Turnos:</span>
                        <span className="text-sm font-semibold text-amber-600">
                          {formData.turnos.length > 0
                            ? formData.turnos.map(t =>
                              t === 'manha' ? 'Manhã' :
                              t === 'tarde' ? 'Tarde' :
                              t === 'noite' ? 'Noite' : 'Todos'
                            ).join(', ')
                            : '-'
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: TURMAS */}
              {activeTab === 'turmas' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Users className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Atribuir Turmas ao Docente</Label>
                    </div>

                    {/* Aviso se curso ou turno não selecionados */}
                    {(formData.cursos.length === 0 || formData.turnos.length === 0) && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-amber-800">Seleccione o curso e turno primeiro</p>
                            <p className="text-xs text-amber-600 mt-1">
                              Volte à aba "Contratual" e seleccione o curso e os turnos em que o docente vai leccionar.
                              As turmas disponíveis serão filtradas automaticamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lista de turmas filtradas */}
                    {formData.cursos.length > 0 && formData.turnos.length > 0 && (
                      <>
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl mb-4">
                          <p className="text-xs text-blue-700">
                            A mostrar turmas do(s) curso(s) <strong>{formData.cursos.map(c => courses.find(co => co.codigo === c)?.nome || c).join(', ')}</strong>
                            {' '}no(s) turno(s): <strong>{formData.turnos.map(t =>
                              t === 'manha' ? 'Manhã' :
                              t === 'tarde' ? 'Tarde' :
                              t === 'noite' ? 'Noite' : 'Todos'
                            ).join(', ')}</strong>
                          </p>
                        </div>

                        {getFilteredClasses().length === 0 ? (
                          <div className="text-center py-12">
                            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-medium">Nenhuma turma disponível</p>
                            <p className="text-xs text-slate-400 mt-1">
                              Não existem turmas activas para o curso e turno(s) seleccionados
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {getFilteredClasses().map(cls => {
                              const isAssigned = formData.assignedClasses.includes(cls.id);
                              return (
                                <button
                                  key={cls.id}
                                  type="button"
                                  onClick={() => toggleClassAssignment(cls.id)}
                                  className={cn(
                                    "p-4 rounded-xl border-2 text-left transition-all",
                                    isAssigned
                                      ? "border-green-500 bg-green-50"
                                      : "border-slate-200 hover:border-slate-300"
                                  )}
                                >
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <p className={cn(
                                        "font-bold text-sm",
                                        isAssigned ? "text-green-700" : "text-slate-700"
                                      )}>
                                        {cls.name}
                                      </p>
                                      <p className="text-xs text-slate-500 mt-1">
                                        {cls.code || cls.curso} • {cls.students || 0} alunos
                                      </p>
                                      <p className="text-xs text-slate-400">
                                        {cls.schedule === 'manha' || cls.schedule === 'morning' ? 'Manhã' :
                                          cls.schedule === 'tarde' || cls.schedule === 'afternoon' ? 'Tarde' : 'Noite'}
                                        {cls.room && ` • Sala ${cls.room}`}
                                      </p>
                                    </div>
                                    <div className={cn(
                                      "h-6 w-6 rounded-full flex items-center justify-center",
                                      isAssigned ? "bg-green-500" : "bg-slate-200"
                                    )}>
                                      {isAssigned && <CheckCircle2 className="h-4 w-4 text-white" />}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {formData.assignedClasses.length > 0 && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                            <p className="text-xs text-green-700 font-semibold">
                              {formData.assignedClasses.length} turma(s) seleccionada(s)
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </section>
                </div>
              )}

              {/* TAB: CREDENTIALS */}
              {activeTab === 'credentials' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

                  {/* Header de confirmação */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-800">Cadastro Quase Completo!</h3>
                        <p className="text-sm text-green-600">Revise as credenciais antes de finalizar</p>
                      </div>
                    </div>
                  </div>

                  {/* Credenciais de acesso */}
                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-[#F5821F]/30 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-[#F5821F]/30">
                      <Shield className="h-5 w-5 text-[#F5821F]" />
                      <Label className="font-bold text-[#004B87] leading-none">Credenciais de Acesso</Label>
                    </div>

                    {/* Username gerado */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                      <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">
                        Nome de Utilizador (gerado automaticamente)
                      </p>
                      <div className="bg-white border-2 border-blue-300 rounded-lg px-4 py-2.5">
                        <span className="font-mono font-bold text-[#004B87] text-sm tracking-wide">
                          {getUsernamePreview()}
                        </span>
                      </div>
                      {!formData.name.trim() ? (
                        <p className="text-[10px] text-amber-600 mt-2 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Preencha o nome na aba "Dados Pessoais" para ver o username final
                        </p>
                      ) : (
                        <p className="text-[10px] text-blue-600 mt-2">
                          O número sequencial (.0001) será confirmado pelo sistema ao guardar
                        </p>
                      )}
                    </div>

                    {/* Aviso de primeiro acesso */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-amber-800 mb-1">Senha do Primeiro Acesso</p>
                          <p className="text-xs text-amber-700 leading-relaxed">
                            No <strong>primeiro login</strong>, o docente deverá usar o seu{' '}
                            <strong>username como senha</strong>. O sistema irá solicitar automaticamente
                            a definição de uma senha pessoal antes de aceder ao painel.
                          </p>
                          <div className="mt-3 bg-white border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2">
                            <Key className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
                            <p className="text-[11px] text-amber-800 font-mono">
                              Senha inicial = <strong>{getUsernamePreview()}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest"
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                {activeTab !== 'credentials' ? (
                <Button
  onClick={validateAndNext}
  className="bg-[#F5821F] text-white hover:bg-[#E07318] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-orange-200"
>
  Próximo Passo <ChevronRight className="h-4 w-4" />
</Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl shadow-orange-500/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Cadastrar Docente
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