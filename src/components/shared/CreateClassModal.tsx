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
  Building, CheckCircle, Edit2, UserPlus
} from "lucide-react";
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
  
  const [activeTab, setActiveTab] = useState<'basic' | 'schedule' | 'details'>('basic');
  const [cursosDisponiveis, setCursosDisponiveis] = useState<any[]>([]);
  const [showAllCursos, setShowAllCursos] = useState(false);
  const [formData, setFormData] = useState<Partial<Class>>({
    name: '',
    description: '',
    curso: '',
    code: '',
    schedule: 'laboral',
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

  // Carregar cursos disponíveis
  useEffect(() => {
    const loadCursos = async () => {
      try {
        const cursos = await courseService.getAll();
        const cursosFormatados = cursos.map(c => ({
          id: c.codigo,
          nome: c.nome,
          sigla: c.codigo
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
    
    const turnoTexto = turno === 'laboral' ? 'LABORAL' : 'PÓS-LABORAL';
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
        schedule: 'laboral',
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
  }, [classData, isCreating, isOpen]);

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
      const nomeGerado = gerarNomeTurma(formData.curso, formData.schedule || 'laboral');
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
        schedule: formData.schedule || 'laboral'
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
    const tabs: ('basic' | 'schedule' | 'details')[] = ['basic', 'schedule', 'details'];
    const nextIndex = tabs.indexOf(activeTab) + 1;
    if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
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
                          onClick={() => handleInputChange('schedule', 'laboral')}
                          disabled={!permissions.canEdit}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all",
                            formData.schedule === 'laboral' ? "bg-[#F5821F] shadow-md text-white" : "text-slate-500",
                            !permissions.canEdit && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <Clock className="h-3 w-3" /> Laboral
                        </button>
                        <button 
                          onClick={() => handleInputChange('schedule', 'pos_laboral')}
                          disabled={!permissions.canEdit}
                          className={cn(
                            "flex-1 flex items-center justify-center gap-2 text-xs font-bold rounded-lg transition-all",
                            formData.schedule === 'pos_laboral' ? "bg-[#F5821F] shadow-md text-white" : "text-slate-500",
                            !permissions.canEdit && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          Pós-Laboral
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
                        <Label className="font-bold text-slate-700 leading-none">Início do Semestre</Label>
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
                        type="number" 
                        value={formData.capacity || ''} 
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                        min="1"
                        max="100"
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
                        type="number" 
                        value={formData.duration || ''} 
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        min="1"
                        max="48"
                        placeholder="6"
                        className="border-slate-100 bg-slate-50/50 h-12 rounded-xl focus:ring-[#004B87] focus:border-[#004B87] text-lg font-semibold"
                        disabled={!permissions.canEdit}
                      />
                      {formErrors.duration && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.duration}
                        </p>
                      )}
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
                          {formData.schedule === 'laboral' ? '☀️ Laboral' : '🌙 Pós-Laboral'}
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
                    className="bg-[#004B87] text-white hover:bg-[#003A6B] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    Próximo Passo <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  permissions.canEdit && (
                    <Button 
                      onClick={handleSave}
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
          onStudentsAdded={() => {
            setShowSelectStudentModal(false);
            toast.success('Estudantes adicionados com sucesso!');
          }}
        />
      )}
    </Dialog>
  );
}