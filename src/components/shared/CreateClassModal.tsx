// src/components/shared/CreateClassModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings, Users, BookOpen, Trash2,
  GraduationCap, Calendar, Clock, MapPin, Hash,
  Sparkles, ChevronRight, CheckCircle2, AlertCircle,
  Building, CheckCircle, Edit2, UserPlus,
  Sun, Sunset, Moon, Search, Loader2, X
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Class, Permission } from "../../types";
import courseService from '@/services/courseService';
import { SelectStudentModal } from './SelectStudentModal';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData?: Class | null;
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin';
  onSave: (classData: any) => void;
  onDelete?: (classId: number) => void;
  isCreating?: boolean;
}

export function ClassModal({ 
  isOpen, onClose, classData, permissions, currentUserRole, onSave, onDelete, isCreating = false
}: ClassModalProps) {
  
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'students' | 'details'>('basic');
  const [cursosDisponiveis, setCursosDisponiveis] = useState<any[]>([]);
  const [showAllCursos, setShowAllCursos] = useState(false);
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '',
    description: '',
    curso: '',
    code: '',
    schedule: 'manha',
    duration: '6',
    capacity: 30,
    start_date: '',
    end_date: '',
    room: '',
    status: 'active',
    students: 0
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSelectStudentModal, setShowSelectStudentModal] = useState(false);
  const [nomeEditavel, setNomeEditavel] = useState(false);

  // Estados para selecção de estudantes
  const [availableStudents, setAvailableStudents] = useState<any[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Carregar cursos disponíveis
  useEffect(() => {
    const loadCursos = async () => {
      try {
        const cursos = await courseService.getAll();
        const cursosFormatados = cursos.map(c => ({
          id: c.codigo,
          nome: c.nome,
          sigla: c.codigo,
          duracao: c.duracao_valor || c.duracao || 6
        }));
        setCursosDisponiveis(cursosFormatados);
      } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        toast.error('Erro ao carregar lista de cursos');
      }
    };

    if (isOpen) {
      loadCursos();
    }
  }, [isOpen]);

  // Auto-preencher duração quando curso é seleccionado
  useEffect(() => {
    if (formData.curso && cursosDisponiveis.length > 0) {
      const curso = cursosDisponiveis.find(c => c.id === formData.curso);
      if (curso && curso.duracao) {
        setFormData(prev => ({ ...prev, duration: curso.duracao.toString() }));
      }
    }
  }, [formData.curso, cursosDisponiveis]);

  // Gerar código da turma
  const gerarCodigoTurma = (cursoId: string) => {
    if (!cursoId) return '';
    const curso = cursosDisponiveis.find(c => c.id === cursoId);
    if (!curso) return '';
    const ano = new Date().getFullYear();
    const sequencial = Math.floor(Math.random() * 900) + 100;
    return `${curso.sigla}-${ano}-${sequencial}`;
  };

  // Gerar nome da turma automaticamente
  const gerarNomeTurma = (cursoId: string, turno: string) => {
    if (!cursoId) return '';
    const curso = cursosDisponiveis.find(c => c.id === cursoId);
    if (!curso) return '';

    const turnoTextos: Record<string, string> = {
      manha: 'MANHÃ',
      tarde: 'TARDE',
      noite: 'NOITE'
    };
    const turnoTexto = turnoTextos[turno] || 'MANHÃ';
    const sequencial = '01';

    return `${curso.nome.toUpperCase()} - ${turnoTexto} ${sequencial}`;
  };

  // Atualizar nome automaticamente quando curso ou turno mudar
  useEffect(() => {
    if (formData.curso && formData.schedule && isCreating && !nomeEditavel) {
      const nomeGerado = gerarNomeTurma(formData.curso, formData.schedule);
      setFormData(prev => ({ ...prev, name: nomeGerado }));
    }
  }, [formData.curso, formData.schedule, isCreating, nomeEditavel]);

  // Atualizar dados ao abrir
  useEffect(() => {
    if (classData) {
      setFormData(classData);
    } else if (isCreating) {
      setFormData({
        name: '',
        description: '',
        curso: '',
        code: '',
        schedule: 'manha',
        duration: '6',
        capacity: 30,
        start_date: '',
        end_date: '',
        room: '',
        status: 'active',
        students: 0
      });
    }
    setFormErrors({});
    setNomeEditavel(false);
    setActiveTab('basic');
    setShowAllCursos(false);
    // Reset student selection
    setAvailableStudents([]);
    setSelectedStudentIds([]);
    setStudentSearchTerm("");
  }, [classData, isCreating, isOpen]);

  // Carregar estudantes disponíveis quando entrar na aba de estudantes
  const loadAvailableStudents = async () => {
    if (!formData.curso || !formData.schedule) return;

    setIsLoadingStudents(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost/API-LOGIN/api/turmas.php?action=get_available_students_for_new_class&curso_id=${formData.curso}&turno=${formData.schedule}`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      const result = await response.json();
      if (result.success) {
        setAvailableStudents(result.data || []);
      } else {
        toast.error(result.message || 'Erro ao carregar estudantes');
      }
    } catch (error) {
      console.error('Erro ao carregar estudantes:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  // Carregar estudantes quando mudar para aba de estudantes
  useEffect(() => {
    if (activeTab === 'students' && isCreating && formData.curso && formData.schedule) {
      loadAvailableStudents();
    }
  }, [activeTab, formData.curso, formData.schedule, isCreating]);

  // Gerar código automaticamente
  useEffect(() => {
    if (formData.curso && isCreating) {
      const novoCodigo = gerarCodigoTurma(formData.curso);
      setFormData(prev => ({ ...prev, code: novoCodigo }));
    }
  }, [formData.curso, isCreating]);

  // Regerar name e code quando os cursos carregarem
  useEffect(() => {
    if (!isCreating) return;
    if (!formData.curso) return;
    if (cursosDisponiveis.length === 0) return;

    // garantir código
    const novoCodigo = gerarCodigoTurma(formData.curso);
    if (novoCodigo && formData.code !== novoCodigo) {
      setFormData(prev => ({ ...prev, code: novoCodigo }));
    }

    // garantir nome (se não estiver em modo editável)
    if (!nomeEditavel) {
      const nomeGerado = gerarNomeTurma(formData.curso, formData.schedule || 'manha');
      if (nomeGerado && formData.name !== nomeGerado) {
        setFormData(prev => ({ ...prev, name: nomeGerado }));
      }
    }
  }, [cursosDisponiveis, formData.curso, formData.schedule, isCreating, nomeEditavel]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  // Validação
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.curso) errors.curso = 'Selecione um curso';
    if (!formData.name?.trim()) errors.name = 'Nome da turma é obrigatório';
    if (!formData.code?.trim()) errors.code = 'Código da turma é obrigatório';
    if (!formData.start_date) errors.start_date = 'Data de início é obrigatória';
    if (!formData.duration) errors.duration = 'Duração é obrigatória';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salvar
  const handleSave = () => {
    if (validateForm()) {
      const duracaoMeses = formData.duration ?
        parseInt(formData.duration.toString().replace(/[^0-9]/g, '')) || 6 : 6;

      const dadosReact: Partial<Class> = {
        code: formData.code,
        name: formData.name,
        curso: formData.curso,          // <-- vem do seletor
        room: formData.room || undefined,
        capacity: formData.capacity || 30,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        description: formData.description || undefined,
        status: formData.status || 'active',
        duration: duracaoMeses.toString(),
        schedule: formData.schedule || 'manha',
        selectedStudentIds: selectedStudentIds.length > 0 ? selectedStudentIds : undefined
      };

      console.log('📤 Enviando (React shape) para onSave:', dadosReact);

      onSave(dadosReact);
      onClose();
    } else {
      console.error('❌ Validação falhou:', formErrors);
      toast.error('Preencha todos os campos obrigatórios');
    }
  };

  const handleDelete = () => {
    if (classData?.id && onDelete) {
      onDelete(classData.id);
      onClose();
    }
  };

  const validateAndNext = () => {
    if (activeTab === 'basic' && !formData.curso) {
      toast.error("Selecione um curso primeiro");
      return;
    }
    const tabs: ('basic' | 'schedule' | 'students' | 'details')[] = isCreating
      ? ['basic', 'schedule', 'students', 'details']
      : ['basic', 'schedule', 'details'];
    const nextIndex = tabs.indexOf(activeTab) + 1;
    if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
  };

  // Filtrar estudantes pela busca
  const filteredAvailableStudents = availableStudents.filter(student =>
    student.nome?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );

  // Toggle selecção de estudante
  const handleToggleStudent = (studentId: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Seleccionar/Desseleccionar todos
  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(filteredAvailableStudents.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const cursoSelecionado = cursosDisponiveis.find(c => c.id === formData.curso);
  const cursosExibidos = showAllCursos ? cursosDisponiveis : cursosDisponiveis.slice(0, 4);
  const temMaisCursos = cursosDisponiveis.length > 4;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[650px]">
          
          {/* SIDEBAR DE NAVEGAÇÃO */}
          <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <GraduationCap className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">Class Manager</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Setup Turma v2</span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {[
                { id: 'basic', label: 'Dados Principais', icon: BookOpen, desc: 'Curso e Identificação' },
                { id: 'schedule', label: 'Datas e Vagas', icon: Clock, desc: 'Cronograma e Limites' },
                ...(isCreating ? [{ id: 'students', label: 'Estudantes', icon: Users, desc: 'Seleccionar Alunos' }] : []),
                { id: 'details', label: 'Configurações', icon: Settings, desc: 'Sala e Observações' },
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
                O código da turma é gerado automaticamente baseado no curso selecionado.
              </p>
            </div>
          </div>

          {/* ÁREA DE CONTEÚDO */}
          <div className="flex-1 flex flex-col">
            <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                  {isCreating ? 'Criar Nova Turma' : 'Editar Turma'}
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <span>Gestão Acadêmica</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#F5821F] font-medium">{activeTab.toUpperCase()}</span>
                </div>
              </div>
              {!isCreating && permissions.canDelete && currentUserRole === 'admin' && (
                <Button variant="ghost" size="icon" onClick={handleDelete} className="rounded-full text-red-400 hover:bg-red-50">
                  <Trash2 className="h-5 w-5" />
                </Button>
              )}
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">
              
              {/* ABA: DADOS PRINCIPAIS */}
              {activeTab === 'basic' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <section>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
                      Selecione o Curso Base
                    </Label>
                    
                    {cursosDisponiveis.length === 0 ? (
                      <div className="text-center py-8 text-slate-500">
                        <p>Carregando cursos disponíveis...</p>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          {cursosExibidos.map((curso) => (
                            <button
                              key={curso.id}
                              onClick={() => handleInputChange('curso', curso.id)}
                              disabled={!permissions.canEdit}
                              className={cn(
                                "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                                formData.curso === curso.id 
                                  ? "border-[#F5821F] bg-orange-50 shadow-md ring-4 ring-[#F5821F]/10" 
                                  : "border-white bg-white hover:border-[#F5821F]/50 shadow-sm",
                                !permissions.canEdit && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <div className={cn(
                                "h-10 w-10 rounded-xl flex items-center justify-center mr-4",
                                formData.curso === curso.id ? "bg-[#F5821F] text-white" : "bg-slate-100 text-slate-400"
                              )}>
                                <BookOpen className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-700 leading-tight">{curso.nome}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">{curso.sigla}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        
                        {temMaisCursos && (
                          <button
                            type="button"
                            onClick={() => setShowAllCursos(!showAllCursos)}
                            className="w-full mt-3 px-4 py-2 rounded-lg border-2 border-slate-200 hover:border-[#F5821F] hover:bg-orange-50 text-sm font-medium text-slate-700 transition-all"
                          >
                            {showAllCursos ? '▲ Mostrar menos' : `▼ Ver todos (${cursosDisponiveis.length} cursos)`}
                          </button>
                        )}
                      </>
                    )}
                    
                    {formErrors.curso && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mt-2">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.curso}
                      </p>
                    )}
                  </section>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold ml-1">Código Único</Label>
                      <div className="relative group">
                        <Hash className="absolute left-4 top-3 h-4 w-4 text-[#F5821F] group-focus-within:text-[#F5821F] transition-colors" />
                        <Input 
                          value={formData.code || ''} 
                          readOnly 
                          className="pl-11 h-12 bg-orange-50 border-[#F5821F]/30 rounded-xl font-mono text-[#F5821F] font-bold focus:ring-[#F5821F]"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold ml-1">Turno de Aula</Label>
                      <div className="flex p-1 bg-slate-200/50 backdrop-blur rounded-xl h-12">
                        <button
                          onClick={() => handleInputChange('schedule', 'manha')}
                          disabled={!permissions.canEdit}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all",
                            formData.schedule === 'manha' ? "bg-gradient-to-r from-yellow-400 to-orange-400 shadow-md text-white" : "text-slate-500",
                            !permissions.canEdit && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Sun className="h-3 w-3" /> Manhã
                        </button>
                        <button
                          onClick={() => handleInputChange('schedule', 'tarde')}
                          disabled={!permissions.canEdit}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all",
                            formData.schedule === 'tarde' ? "bg-gradient-to-r from-orange-400 to-red-400 shadow-md text-white" : "text-slate-500",
                            !permissions.canEdit && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Sunset className="h-3 w-3" /> Tarde
                        </button>
                        <button
                          onClick={() => handleInputChange('schedule', 'noite')}
                          disabled={!permissions.canEdit}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all",
                            formData.schedule === 'noite' ? "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-md text-white" : "text-slate-500",
                            !permissions.canEdit && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Moon className="h-3 w-3" /> Noite
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Nome Gerado */}
                  {formData.name && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-[#F5821F]/30 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <Label className="text-[#F5821F] font-bold text-sm">
                          Nome da Turma {!nomeEditavel && '(Gerado Automaticamente)'}
                        </Label>
                        <button
                          type="button"
                          onClick={() => setNomeEditavel(!nomeEditavel)}
                          className="text-xs text-[#F5821F] hover:text-[#E07318] flex items-center gap-1 hover:bg-orange-100 px-2 py-1 rounded transition-colors"
                        >
                          <Edit2 className="h-3 w-3" />
                          {nomeEditavel ? 'Auto' : 'Editar'}
                        </button>
                      </div>
                      
                      {nomeEditavel ? (
                        <Input
                          value={formData.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Digite o nome personalizado da turma"
                          className="text-sm font-semibold text-[#004B87] border-2 border-[#F5821F]/40 focus:border-[#F5821F]"
                          disabled={!permissions.canEdit}
                        />
                      ) : (
                        <p className="text-lg font-bold text-[#004B87]">{formData.name}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ABA: DATAS E VAGAS */}
              {activeTab === 'schedule' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#F5821F]/10 text-[#F5821F] rounded-lg">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">Início das Aulas</Label>
                      </div>
                      <Input 
                        type="date" 
                        value={formData.start_date || ''} 
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        className="border-slate-100 bg-slate-50/50 h-12 rounded-xl focus:ring-[#F5821F] focus:border-[#F5821F]"
                        disabled={!permissions.canEdit}
                      />
                      {formErrors.start_date && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.start_date}
                        </p>
                      )}
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#004B87]/10 text-[#004B87] rounded-lg">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">Término (Opcional)</Label>
                      </div>
                      <Input 
                        type="date" 
                        value={formData.end_date || ''} 
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className="border-slate-100 bg-slate-50/50 h-12 rounded-xl focus:ring-[#004B87] focus:border-[#004B87]"
                        disabled={!permissions.canEdit}
                      />
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#F5821F]/10 text-[#F5821F] rounded-lg">
                          <Users className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">Vagas Totais</Label>
                      </div>
                      <Input
                        type="text"
                        inputMode="numeric"
                        value={formData.capacity || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          handleInputChange('capacity', val ? parseInt(val) : '');
                        }}
                        placeholder="30"
                        className="border-slate-100 bg-slate-50/50 h-12 rounded-xl focus:ring-[#F5821F] focus:border-[#F5821F] text-lg font-semibold"
                        disabled={!permissions.canEdit}
                      />
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#004B87]/10 text-[#004B87] rounded-lg">
                          <Clock className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">Duração (meses)</Label>
                      </div>
                      <Input
                        type="text"
                        value={formData.duration ? `${formData.duration} meses` : 'Seleccione um curso'}
                        readOnly
                        className="border-slate-100 bg-slate-100 h-12 rounded-xl text-lg font-semibold text-[#004B87] cursor-not-allowed"
                      />
                      <p className="text-xs text-slate-500">
                        A duração é definida pelo curso seleccionado
                      </p>
                    </div>
                  </div>

                  {currentUserRole === 'admin' && (
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-[#F5821F]/10 text-[#F5821F] rounded-lg">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">Status da Turma</Label>
                      </div>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-100 bg-slate-50/50 focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none appearance-none"
                        disabled={!permissions.canEdit}
                      >
                        <option value="active">✅ Ativa</option>
                        <option value="inactive">⏸ Inativa</option>
                        <option value="completed">✓ Concluída</option>
                      </select>
                    </div>
                  )}

                  <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    <p className="text-xs text-amber-700 leading-snug">
                      As turmas são criadas com status <strong>Ativo</strong> por padrão. Certifique-se de validar as datas antes de publicar no portal do aluno.
                    </p>
                  </div>
                </div>
              )}

              {/* ABA: ESTUDANTES (apenas criação) */}
              {activeTab === 'students' && isCreating && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  {/* Header com busca */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-[#004B87] to-[#0066BB] rounded-xl flex items-center justify-center">
                          <Users className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">Seleccionar Estudantes</h3>
                          <p className="text-xs text-slate-500">
                            Estudantes matriculados em {cursoSelecionado?.nome || 'este curso'} - Turno {formData.schedule === 'manha' ? 'Manhã' : formData.schedule === 'tarde' ? 'Tarde' : 'Noite'}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${
                        formData.schedule === 'manha' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        formData.schedule === 'tarde' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}>
                        {formData.schedule === 'manha' && <Sun className="h-3 w-3 mr-1" />}
                        {formData.schedule === 'tarde' && <Sunset className="h-3 w-3 mr-1" />}
                        {formData.schedule === 'noite' && <Moon className="h-3 w-3 mr-1" />}
                        {formData.schedule === 'manha' ? 'Manhã' : formData.schedule === 'tarde' ? 'Tarde' : 'Noite'}
                      </Badge>
                    </div>

                    {/* Barra de busca */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Buscar por nome ou email..."
                        className="pl-10 h-11 border-2 border-slate-200 focus:border-[#004B87]"
                      />
                    </div>

                    {/* Estatísticas e seleccionar todos */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {filteredAvailableStudents.length} disponíveis
                        </Badge>
                        {selectedStudentIds.length > 0 && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            {selectedStudentIds.length} seleccionados
                          </Badge>
                        )}
                      </div>
                      {filteredAvailableStudents.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id="select-all-students"
                            checked={selectedStudentIds.length === filteredAvailableStudents.length && filteredAvailableStudents.length > 0}
                            onCheckedChange={handleSelectAllStudents}
                          />
                          <label htmlFor="select-all-students" className="text-sm font-medium cursor-pointer">
                            Seleccionar todos
                          </label>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Lista de estudantes */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden max-h-[320px] overflow-y-auto">
                    {isLoadingStudents ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="h-10 w-10 text-[#004B87] animate-spin mb-3" />
                        <p className="text-slate-600">Carregando estudantes...</p>
                      </div>
                    ) : filteredAvailableStudents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 px-4">
                        <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <h4 className="font-semibold text-slate-600 mb-1">
                          {studentSearchTerm ? 'Nenhum estudante encontrado' : 'Nenhum estudante disponível'}
                        </h4>
                        <p className="text-xs text-slate-500 text-center">
                          {studentSearchTerm
                            ? 'Tente outro termo de busca'
                            : 'Não há estudantes matriculados neste curso e turno ainda'}
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {filteredAvailableStudents.map((student) => {
                          const isSelected = selectedStudentIds.includes(student.id);
                          return (
                            <div
                              key={student.id}
                              className={`flex items-center gap-4 p-4 cursor-pointer transition-all ${
                                isSelected ? 'bg-blue-50' : 'hover:bg-slate-50'
                              }`}
                              onClick={() => handleToggleStudent(student.id)}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleStudent(student.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <div className="h-10 w-10 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">
                                  {student.nome?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-[#004B87] truncate">{student.nome}</h4>
                                <p className="text-xs text-slate-500 truncate">{student.email}</p>
                              </div>
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                    <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <p className="text-xs text-blue-700 leading-snug">
                      Apenas estudantes que fizeram matrícula no curso <strong>{cursoSelecionado?.nome}</strong> com turno <strong>{formData.schedule === 'manha' ? 'Manhã' : formData.schedule === 'tarde' ? 'Tarde' : 'Noite'}</strong> são listados. Estudantes já em outras turmas deste curso não aparecem.
                    </p>
                  </div>
                </div>
              )}

              {/* ABA: CONFIGURAÇÕES */}
              {activeTab === 'details' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-semibold ml-1">Sala / Bloco</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3 h-4 w-4 text-[#F5821F]" />
                      <Input
                        placeholder="Ex: Bloco A - Sala 302"
                        value={formData.room || ''} 
                        onChange={(e) => handleInputChange('room', e.target.value)}
                        className="pl-11 h-12 bg-white border-slate-200 rounded-xl focus:ring-[#F5821F] focus:border-[#F5821F]"
                        disabled={!permissions.canEdit}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-slate-600 font-semibold ml-1">Descrição e Observações</Label>
                    <Textarea 
                      placeholder="Informações adicionais para os professores..."
                      className="min-h-[150px] bg-white border-slate-200 rounded-2xl p-4 resize-none focus:ring-[#F5821F] focus:border-[#F5821F]"
                      value={formData.description || ''}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      disabled={!permissions.canEdit}
                    />
                  </div>

                  {/* Resumo Final */}
                  <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#004B87] mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#F5821F]" />
                      Resumo da Turma
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Curso:</span>
                        <span className="text-sm font-semibold text-[#004B87]">
                          {cursoSelecionado?.nome || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Nome:</span>
                        <span className="text-sm font-semibold text-[#004B87]">{formData.name || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Código:</span>
                        <span className="text-sm font-mono font-semibold text-[#F5821F]">{formData.code || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Turno:</span>
                        <span className="text-sm font-semibold text-[#004B87]">
                          {formData.schedule === 'manha' && '☀️ Manhã'}
                          {formData.schedule === 'tarde' && '🌅 Tarde'}
                          {formData.schedule === 'noite' && '🌙 Noite'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Capacidade:</span>
                        <span className="text-sm font-semibold text-[#F5821F]">{formData.capacity} estudantes</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Duração:</span>
                        <span className="text-sm font-semibold text-[#004B87]">{formData.duration} meses</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Início:</span>
                        <span className="text-sm font-semibold text-[#004B87]">
                          {formData.start_date ? new Date(formData.start_date + 'T00:00:00').toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      {formData.room && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600">Sala:</span>
                          <span className="text-sm font-semibold text-[#004B87]">{formData.room}</span>
                        </div>
                      )}
                      {isCreating && selectedStudentIds.length > 0 && (
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200 mt-2">
                          <span className="text-sm text-slate-600">Estudantes a adicionar:</span>
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            {selectedStudentIds.length} seleccionados
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Gestão de Estudantes (apenas edição) */}
                  {!isCreating && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-green-900 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Gestão de Estudantes
                          </h3>
                          <p className="text-xs text-green-700 mt-1">
                            {formData.students || 0} de {formData.capacity || 0} vagas ocupadas
                          </p>
                        </div>
                        {permissions.canAdd && formData.curso && (
                          <Button 
                            size="sm"
                            className="bg-[#F5821F] hover:bg-[#E07318] text-white shadow-lg"
                            onClick={() => setShowSelectStudentModal(true)}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center shadow-md">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="text-2xl font-bold text-[#004B87]">{formData.students || 0}/{formData.capacity || 0}</p>
                          <div className="w-full bg-orange-100 h-2 rounded-full mt-1">
                            <div 
                              className="bg-[#F5821F] h-2 rounded-full transition-all"
                              style={{ width: `${((formData.students || 0) / (formData.capacity || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BARRA DE BOTÕES INFERIOR */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest">
                Descartar
              </Button>

              <div className="flex gap-3">
                {activeTab !== 'details' ? (
                  <Button
                    onClick={validateAndNext}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-orange-200"
                  >
                    Próximo Passo <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  permissions.canEdit && (
                      <Button
                        onClick={() => handleSave(false)}
                        className="bg-[#F5821F] text-white hover:bg-[#E07318] px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl shadow-orange-500/30"
                      >
                        <CheckCircle2 className="h-4 w-4" /> {isCreating ? 'Criar Turma' : 'Salvar'}
                      </Button>
                  )
                )}
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Seleção de Estudantes */}
      {!isCreating && showSelectStudentModal && classData?.id && formData.curso && (
        <SelectStudentModal
          isOpen={showSelectStudentModal}
          onClose={() => setShowSelectStudentModal(false)}
          turmaId={classData.id}
          cursoId={formData.curso}
          turno={formData.schedule}
          onStudentsAdded={() => {
            setShowSelectStudentModal(false);
            toast.success('Estudantes adicionados com sucesso!');
          }}
        />
      )}
    </Dialog>
  );
}