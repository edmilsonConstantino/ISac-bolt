import { useState, useEffect } from "react";
import { X, BookOpen, DollarSign, Calendar, Info, Save, Loader2, Plus, Edit2, Trash2, BookMarked, Settings, Hash, Sparkles, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Categoria, Nivel } from '@/types/CategoryTypes';
import categoriaService from '@/services/categoriaService';

interface Module {
  id: string;
  nome_modulo: string;
  codigo_modulo: string;
  carga_horaria: number;
}

interface Course {
  id?: number;
  nome: string;
  codigo: string;
  categoria_id?: number;        // ✨ NOVO
  categoria?: Categoria;        // ✨ NOVO
  tipo_curso?: 'tecnico' | 'tecnico_superior' | 'tecnico_profissional' | 'curta_duracao'; // manter
  duracao_valor: number;
  regime: 'laboral' | 'pos_laboral' | 'ambos';
  mensalidade: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  modulos?: Module[];
  niveis?: Nivel[];             // ✨ NOVO
  data_criacao?: string;
}

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (courseData: Course) => Promise<void>;
  courseData?: Course | null;
  isEditing?: boolean;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSave,
  courseData,
  isEditing = false
}: CreateCourseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [moduleErrors, setModuleErrors] = useState<Record<string, Record<string, string>>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'modulos' | 'controle'>('info');

  // Estado para módulos
  const [modules, setModules] = useState<Module[]>([]);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [moduleFormData, setModuleFormData] = useState<Module>({
    id: '',
    nome_modulo: '',
    codigo_modulo: '',
    carga_horaria: 0
  });

  // ADICIONAR DEPOIS DOS ESTADOS EXISTENTES (antes do formData):
  // ✨ NOVOS ESTADOS PARA CATEGORIAS E NÍVEIS
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [editingNivelId, setEditingNivelId] = useState<number | null>(null);
  const [showNivelForm, setShowNivelForm] = useState(false);
  const [nivelFormData, setNivelFormData] = useState<Nivel>({
    nivel: 1,
    nome: '',
    descricao: '',
    duracao_meses: 4,
    ordem: 1,
    prerequisito_nivel_id: null
  });

  const [formData, setFormData] = useState<Course>({
    nome: '',
    codigo: '',
    categoria_id: undefined,     // ✨ ADICIONAR
    tipo_curso: '' as any,
    duracao_valor: 0,
    regime: 'laboral',
    mensalidade: 0,
    taxa_matricula: 0,
    propina_fixa: true,
    permite_bolsa: true,
    status: 'ativo',
    observacoes: '',
    modulos: [],
    niveis: []                   // ✨ ADICIONAR
  });

  useEffect(() => {
    if (isEditing && courseData) {
      setFormData(courseData);
      setModules(courseData.modulos || []);
      setNiveis(courseData.niveis || []);              // ✨ ADICIONAR
      
      // ✨ ADICIONAR - Setar categoria selecionada
      if (courseData.categoria) {
        setCategoriaSelecionada(courseData.categoria);
      }
    } else {
      setFormData({
        nome: '',
        codigo: '',
        categoria_id: undefined,                       // ✨ ADICIONAR
        tipo_curso: '' as any,
        duracao_valor: 0,
        regime: 'laboral',
        mensalidade: 0,
        taxa_matricula: 0,
        propina_fixa: true,
        permite_bolsa: true,
        status: 'ativo',
        observacoes: '',
        modulos: [],
        niveis: []                                     // ✨ ADICIONAR
      });
      setModules([]);
      setNiveis([]);                                   // ✨ ADICIONAR
      setCategoriaSelecionada(null);                   // ✨ ADICIONAR
    }
    setErrors({});
    setModuleErrors({});
    setShowModuleForm(false);
    setEditingModuleId(null);
    setShowNivelForm(false);                          // ✨ ADICIONAR
    setEditingNivelId(null);                          // ✨ ADICIONAR
    setActiveTab('info');
  }, [isEditing, courseData, isOpen]);

  // Função para gerar código automaticamente
  const generateCourseCode = (nome: string): string => {
    if (!nome.trim()) return '';
    const stopWords = ['de', 'da', 'do', 'e', 'em', 'com', 'para', 'a', 'o', 'as', 'os'];
    const words = nome.trim()
      .toUpperCase()
      .split(' ')
      .filter(word => word.length > 0 && !stopWords.includes(word.toLowerCase()));
    
    let code = '';
    if (words.length > 1) {
      code = words.slice(0, 3).map(w => w[0]).join('');
    } else if (words.length === 1) {
      code = words[0].substring(0, 3);
    }
    
    const year = new Date().getFullYear();
    return code ? `${code}-${year}` : '';
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome do curso é obrigatório';
    if (!formData.codigo.trim()) newErrors.codigo = 'Código do curso é obrigatório';
    else if (formData.codigo.length < 3) newErrors.codigo = 'Código deve ter no mínimo 3 caracteres';
    
    // ✅ VALIDAR categoria_id ao invés de tipo_curso
    if (!formData.categoria_id) newErrors.categoria_id = 'Selecione a categoria do curso';
    
    // ✅ VALIDAR duração apenas se categoria NÃO tem níveis
    if (!categoriaSelecionada?.tem_niveis && formData.duracao_valor <= 0) {
      newErrors.duracao_valor = 'Duração deve ser maior que 0';
    }
    
    if (formData.mensalidade < 0) newErrors.mensalidade = 'Mensalidade não pode ser negativa';
    if (formData.taxa_matricula < 0) newErrors.taxa_matricula = 'Taxa de matrícula não pode ser negativa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateModule = (module: Module): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!module.nome_modulo.trim()) errors.nome_modulo = 'Nome do módulo é obrigatório';
    if (!module.codigo_modulo.trim()) errors.codigo_modulo = 'Código do módulo é obrigatório';
    else if (module.codigo_modulo.length < 3) errors.codigo_modulo = 'Código deve ter no mínimo 3 caracteres';
    
    const duplicateCode = modules.find(m => m.codigo_modulo === module.codigo_modulo && m.id !== module.id);
    if (duplicateCode) errors.codigo_modulo = 'Este código já está sendo usado por outro módulo';
    if (module.carga_horaria <= 0) errors.carga_horaria = 'Carga horária deve ser maior que 0';

    return errors;
  };

  const handleAddModule = () => {
    setModuleFormData({
      id: Date.now().toString(),
      nome_modulo: '',
      codigo_modulo: '',
      carga_horaria: 0
    });
    setEditingModuleId(null);
    setShowModuleForm(true);
    setModuleErrors({});
  };

  const handleEditModule = (module: Module) => {
    setModuleFormData(module);
    setEditingModuleId(module.id);
    setShowModuleForm(true);
    setModuleErrors({});
  };

  const handleSaveModule = () => {
    const errors = validateModule(moduleFormData);
    
    if (Object.keys(errors).length > 0) {
      setModuleErrors({ [moduleFormData.id]: errors });
      toast.error('Preencha todos os campos do módulo corretamente');
      return;
    }

    if (editingModuleId) {
      setModules(prev => prev.map(m => m.id === editingModuleId ? moduleFormData : m));
      toast.success('Módulo atualizado!');
    } else {
      setModules(prev => [...prev, moduleFormData]);
      toast.success('Módulo adicionado!');
    }

    setShowModuleForm(false);
    setModuleFormData({ id: '', nome_modulo: '', codigo_modulo: '', carga_horaria: 0 });
    setModuleErrors({});
  };

  const handleCancelModule = () => {
    setShowModuleForm(false);
    setEditingModuleId(null);
    setModuleFormData({ id: '', nome_modulo: '', codigo_modulo: '', carga_horaria: 0 });
    setModuleErrors({});
  };

  const handleDeleteModule = (moduleId: string) => {
    setModules(prev => prev.filter(m => m.id !== moduleId));
    toast.success('Módulo removido!');
  };

  // ============================================================
  // ✨ NOVAS FUNÇÕES PARA NÍVEIS
  // ============================================================

  const handleAddNivel = () => {
    const proximoNivel = niveis.length + 1;
    setNivelFormData({
      nivel: proximoNivel,
      nome: `Nível ${proximoNivel}`,
      descricao: '',
      duracao_meses: 4,
      ordem: proximoNivel,
      prerequisito_nivel_id: niveis.length > 0 ? niveis[niveis.length - 1].id : null
    });
    setEditingNivelId(null);
    setShowNivelForm(true);
  };

  const handleEditNivel = (nivel: Nivel) => {
    setNivelFormData(nivel);
    setEditingNivelId(nivel.id || null);
    setShowNivelForm(true);
  };

  const handleSaveNivel = () => {
    if (!nivelFormData.nome.trim()) {
      toast.error('Nome do nível é obrigatório');
      return;
    }

    if (nivelFormData.duracao_meses <= 0) {
      toast.error('Duração deve ser maior que 0');
      return;
    }

    if (editingNivelId) {
      setNiveis(prev => prev.map(n => (n.id || n.nivel) === editingNivelId ? nivelFormData : n));
      toast.success('Nível atualizado!');
    } else {
      const novoNivel = { ...nivelFormData, id: Date.now() };
      setNiveis(prev => [...prev, novoNivel]);
      toast.success('Nível adicionado!');
    }

    setShowNivelForm(false);
    setNivelFormData({
      nivel: 1,
      nome: '',
      descricao: '',
      duracao_meses: 4,
      ordem: 1,
      prerequisito_nivel_id: null
    });
  };

  const handleCancelNivel = () => {
    setShowNivelForm(false);
    setEditingNivelId(null);
    setNivelFormData({
      nivel: 1,
      nome: '',
      descricao: '',
      duracao_meses: 4,
      ordem: 1,
      prerequisito_nivel_id: null
    });
  };

  const handleDeleteNivel = (nivelId: number) => {
    setNiveis(prev => prev.filter(n => (n.id || n.nivel) !== nivelId));
    toast.success('Nível removido!');
  };

  const handleNivelChange = (field: keyof Nivel, value: any) => {
    setNivelFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getTotalCargaHoraria = () => {
    return modules.reduce((sum, module) => sum + module.carga_horaria, 0);
  };

  const getTotalDuracaoNiveis = () => {
    return niveis.reduce((sum, nivel) => sum + nivel.duracao_meses, 0);
  };

  const validateAndNext = () => {
    if (activeTab === 'info' && !validateForm()) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }
    const tabs: ('info' | 'modulos' | 'controle')[] = ['info', 'modulos', 'controle'];
    const nextIndex = tabs.indexOf(activeTab) + 1;
    if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
  };

  // ✨ NOVA FUNÇÃO - Carregar categorias
  const carregarCategorias = async () => {
    try {
      const result = await categoriaService.listarCategorias();
      setCategorias(result);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  useEffect(() => {
    // MODIFICAR O useEffect EXISTENTE
    if (isEditing && courseData) {
      setFormData(courseData);
      setModules(courseData.modulos || []);
      setNiveis(courseData.niveis || []);              // ✨ ADICIONAR
      
      // ✨ ADICIONAR - Setar categoria selecionada
      if (courseData.categoria) {
        setCategoriaSelecionada(courseData.categoria);
      }
    } else {
      setFormData({
        nome: '',
        codigo: '',
        categoria_id: undefined,                       // ✨ ADICIONAR
        tipo_curso: '' as any,
        duracao_valor: 0,
        regime: 'laboral',
        mensalidade: 0,
        taxa_matricula: 0,
        propina_fixa: true,
        permite_bolsa: true,
        status: 'ativo',
        observacoes: '',
        modulos: [],
        niveis: []                                     // ✨ ADICIONAR
      });
      setModules([]);
      setNiveis([]);                                   // ✨ ADICIONAR
      setCategoriaSelecionada(null);                   // ✨ ADICIONAR
    }
    setErrors({});
    setModuleErrors({});
    setShowModuleForm(false);
    setEditingModuleId(null);
    setShowNivelForm(false);                          // ✨ ADICIONAR
    setEditingNivelId(null);                          // ✨ ADICIONAR
    setActiveTab('info');
  }, [isEditing, courseData, isOpen]);

  // ✨ NOVO useEffect - Carregar categorias quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarCategorias();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
      setActiveTab('info');
      return;
    }

    setIsLoading(true);
    try {
      const courseWithModules = { 
        ...formData, 
        modulos: modules,
        niveis: niveis        // ✨ ADICIONAR
      };
      await onSave(courseWithModules);
      toast.success(isEditing ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar curso:', error);
      toast.error(error.message || 'Erro ao salvar curso');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleModuleChange = (field: keyof Module, value: any) => {
    setModuleFormData(prev => ({ ...prev, [field]: value }));
    if (moduleErrors[moduleFormData.id]?.[field]) {
      setModuleErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[moduleFormData.id]) {
          delete newErrors[moduleFormData.id][field];
        }
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[650px]">
          
          {/* SIDEBAR DE NAVEGAÇÃO */}
          <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <BookOpen className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">Course Manager</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Gestão de Cursos</span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {[
                { id: 'info', label: 'Configurações', icon: Settings, desc: 'Dados e Financeiro' },
                { id: 'modulos', label: 'Módulos', icon: BookMarked, desc: 'Grade Curricular' },
                { id: 'controle', label: 'Controle', icon: Info, desc: 'Status e Observações' },
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
                O código do curso é gerado automaticamente baseado no nome.
              </p>
            </div>
          </div>

          {/* ÁREA DE CONTEÚDO */}
          <div className="flex-1 flex flex-col">
            <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                  {isEditing ? 'Editar Curso' : 'Criar Novo Curso'}
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <span>Gestão Acadêmica</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#F5821F] font-medium">{activeTab.toUpperCase()}</span>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">
              
              {/* ABA: CONFIGURAÇÕES */}
              {activeTab === 'info' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  
                  {/* IDENTIFICAÇÃO */}
                  <section>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
                      Identificação do Curso
                    </Label>
                    
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Nome do Curso <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          placeholder="Ex: Técnico em Informática"
                          value={formData.nome}
                          onChange={(e) => {
                            const newNome = e.target.value;
                            handleChange('nome', newNome);
                            if (!isEditing) {
                              const generatedCode = generateCourseCode(newNome);
                              handleChange('codigo', generatedCode);
                            }
                          }}
                          className={cn(
                            "h-12 bg-white border-slate-200 rounded-xl focus:ring-[#F5821F] focus:border-[#F5821F]",
                            errors.nome && "border-red-500"
                          )}
                          disabled={isLoading}
                        />
                        {errors.nome && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {errors.nome}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Código do Curso <span className="text-red-500">*</span>
                          </Label>
                          <div className="relative group">
                            <Hash className="absolute left-4 top-3 h-4 w-4 text-[#F5821F]" />
                            <Input
                              placeholder="Ex: INF-2025"
                              value={formData.codigo}
                              onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
                              className={cn(
                                "pl-11 h-12 bg-orange-50 border-[#F5821F]/30 rounded-xl font-mono text-[#F5821F] font-bold focus:ring-[#F5821F]",
                                errors.codigo && "border-red-500"
                              )}
                              disabled={isLoading}
                            />
                          </div>
                          {errors.codigo && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.codigo}
                            </p>
                          )}
                          {!isEditing && (
                            <p className="text-xs text-slate-500">✨ Gerado automaticamente (editável)</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Categoria do Curso <span className="text-red-500">*</span>
                          </Label>
                          <Select
                            value={formData.categoria_id?.toString()}
                            onValueChange={(value) => {
                              const categoriaId = parseInt(value);
                              handleChange('categoria_id', categoriaId);
                              
                              // Encontrar categoria selecionada
                              const cat = categorias.find(c => c.id === categoriaId);
                              setCategoriaSelecionada(cat || null);
                              
                              // Limpar níveis se categoria não tem níveis
                              if (cat && !cat.tem_niveis) {
                                setNiveis([]);
                              }
                            }}
                            disabled={isLoading}
                          >
                            <SelectTrigger className={cn("h-12 rounded-xl", errors.categoria_id && "border-red-500")}>
                              <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                              {categorias.map(cat => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                  {cat.nome} {cat.tem_niveis && '📊 (com níveis)'}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.categoria_id && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.categoria_id}
                            </p>
                          )}
                          {categoriaSelecionada && (
                            <p className="text-xs text-slate-500">
                              {categoriaSelecionada.tem_niveis 
                                ? '✨ Esta categoria permite criar níveis (ex: Nível 1, 2, 3...)'
                                : '📌 Curso sem níveis - duração única'
                              }
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* REGIME E DURAÇÃO */}
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Regime e Duração</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* MOSTRAR DURAÇÃO APENAS SE CATEGORIA NÃO TEM NÍVEIS */}
                      {!categoriaSelecionada?.tem_niveis && (
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Duração (meses)
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={formData.duracao_valor || ''}
                            onChange={(e) => handleChange('duracao_valor', parseInt(e.target.value) || 0)}
                            className={cn("h-12 rounded-xl", errors.duracao_valor && "border-red-500")}
                            disabled={isLoading}
                          />
                          {errors.duracao_valor && (
                            <p className="text-xs text-red-600">{errors.duracao_valor}</p>
                          )}
                        </div>
                      )}

                      {/* MOSTRAR TOTAL DE DURAÇÃO SE TEM NIVEIS */}
                      {categoriaSelecionada?.tem_niveis && niveis.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Duração Total
                          </Label>
                          <Input
                            value={`${getTotalDuracaoNiveis()} meses (${niveis.length} níveis)`}
                            disabled
                            className="h-12 bg-purple-50 text-purple-700 font-semibold rounded-xl"
                          />
                          <p className="text-xs text-purple-600">
                            Calculado automaticamente com base nos níveis
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Regime</Label>
                        <Select
                          value={formData.regime}
                          onValueChange={(value: any) => handleChange('regime', value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="laboral">☀️ Laboral</SelectItem>
                            <SelectItem value="pos_laboral">🌙 Pós-Laboral</SelectItem>
                            <SelectItem value="ambos">🔄 Ambos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </section>

                  {/* FINANCEIRO */}
                  <section className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Informação Financeira</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Mensalidade (MZN)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.mensalidade || ''}
                          onChange={(e) => handleChange('mensalidade', parseFloat(e.target.value) || 0)}
                          className={cn("h-12 rounded-xl", errors.mensalidade && "border-red-500")}
                          disabled={isLoading}
                        />
                        {formData.mensalidade > 0 && (
                          <p className="text-xs text-green-600">{formatCurrency(formData.mensalidade)}/mês</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Taxa de Matrícula (MZN)</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.taxa_matricula || ''}
                          onChange={(e) => handleChange('taxa_matricula', parseFloat(e.target.value) || 0)}
                          className={cn("h-12 rounded-xl", errors.taxa_matricula && "border-red-500")}
                          disabled={isLoading}
                        />
                        {formData.taxa_matricula > 0 && (
                          <p className="text-xs text-green-600">{formatCurrency(formData.taxa_matricula)}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="propina_fixa"
                          checked={formData.propina_fixa}
                          onCheckedChange={(checked) => handleChange('propina_fixa', checked)}
                          disabled={isLoading}
                        />
                        <Label htmlFor="propina_fixa" className="text-sm font-medium cursor-pointer">
                          Propina Fixa
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="permite_bolsa"
                          checked={formData.permite_bolsa}
                          onCheckedChange={(checked) => handleChange('permite_bolsa', checked)}
                          disabled={isLoading}
                        />
                        <Label htmlFor="permite_bolsa" className="text-sm font-medium cursor-pointer">
                          Permite Bolsa
                        </Label>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* ABA: MÓDULOS */}
              {activeTab === 'modulos' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  
                  {/* ============================================ */}
                  {/* SEÇÃO DE NÍVEIS (SE CATEGORIA TEM NÍVEIS)   */}
                  {/* ============================================ */}
                  {categoriaSelecionada?.tem_niveis && (
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                            <BookMarked className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-700">Níveis do Curso</h3>
                            {niveis.length > 0 && (
                              <span className="text-xs text-purple-600">
                                {niveis.length} {niveis.length === 1 ? 'nível' : 'níveis'} • {getTotalDuracaoNiveis()} meses totais
                              </span>
                            )}
                          </div>
                        </div>
                        {!showNivelForm && (
                          <Button
                            size="sm"
                            onClick={handleAddNivel}
                            disabled={isLoading}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Adicionar Nível
                          </Button>
                        )}
                      </div>

                      {/* FORMULÁRIO DE NÍVEL */}
                      {showNivelForm && (
                        <div className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-200 space-y-4 mb-4">
                          <h4 className="font-semibold text-purple-800">
                            {editingNivelId ? 'Editar Nível' : 'Novo Nível'}
                          </h4>

                          <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-3 gap-4">
                              <Input
                                type="number"
                                min="1"
                                placeholder="Nº Nível"
                                value={nivelFormData.nivel || ''}
                                onChange={(e) => handleNivelChange('nivel', parseInt(e.target.value) || 1)}
                              />
                              <Input
                                placeholder="Nome (ex: Básico)"
                                value={nivelFormData.nome}
                                onChange={(e) => handleNivelChange('nome', e.target.value)}
                                className="col-span-2"
                              />
                            </div>

                            <Textarea
                              placeholder="Descrição do nível (opcional)"
                              value={nivelFormData.descricao || ''}
                              onChange={(e) => handleNivelChange('descricao', e.target.value)}
                              rows={2}
                              className="resize-none"
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-600">Duração (meses)</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={nivelFormData.duracao_meses || ''}
                                  onChange={(e) => handleNivelChange('duracao_meses', parseInt(e.target.value) || 4)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-xs text-slate-600">Ordem de Execução</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={nivelFormData.ordem || ''}
                                  onChange={(e) => handleNivelChange('ordem', parseInt(e.target.value) || 1)}
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleCancelNivel}>
                              Cancelar
                            </Button>
                            <Button size="sm" onClick={handleSaveNivel} className="bg-purple-600 hover:bg-purple-700">
                              <Save className="h-4 w-4 mr-1" />
                              {editingNivelId ? 'Atualizar' : 'Adicionar'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* LISTA DE NÍVEIS */}
                      {niveis.length > 0 ? (
                        <div className="space-y-2">
                          {niveis.map((nivel) => (
                            <div
                              key={nivel.id || nivel.nivel}
                              className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-purple-300 transition-colors"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                                      Nível {nivel.nivel}
                                    </span>
                                    <h4 className="font-semibold text-slate-800">{nivel.nome}</h4>
                                  </div>
                                  {nivel.descricao && (
                                    <p className="text-sm text-slate-600 mt-1">{nivel.descricao}</p>
                                  )}
                                  <p className="text-sm text-slate-600 mt-2">
                                    ⏱️ {nivel.duracao_meses} meses • Ordem: {nivel.ordem}
                                  </p>
                                </div>
                                {!showNivelForm && (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEditNivel(nivel)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Edit2 className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleDeleteNivel(nivel.id || nivel.nivel)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : !showNivelForm && (
                        <div className="text-center py-12 text-slate-400">
                          <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">Nenhum nível adicionado</p>
                          <p className="text-xs mt-1">Clique em "Adicionar Nível" para começar</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ============================================ */}
                  {/* SEÇÃO DE MÓDULOS (MANTÉM IGUAL)             */}
                  {/* ============================================ */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                          <BookMarked className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-700">Módulos do Curso</h3>
                          {modules.length > 0 && (
                            <span className="text-xs text-blue-600">
                              {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} • {getTotalCargaHoraria()}h totais
                            </span>
                          )}
                        </div>
                      </div>
                      {!showModuleForm && (
                        <Button
                          size="sm"
                          onClick={handleAddModule}
                          disabled={isLoading}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Adicionar
                        </Button>
                      )}
                    </div>

                    {/* FORMULÁRIO DE MÓDULO (MANTÉM IGUAL) */}
                    {showModuleForm && (
                      <div className="p-4 bg-blue-50 rounded-2xl border-2 border-blue-200 space-y-4 mb-4">
                        <h4 className="font-semibold text-blue-800">
                          {editingModuleId ? 'Editar Módulo' : 'Novo Módulo'}
                        </h4>

                        <div className="grid grid-cols-1 gap-4">
                          <Input
                            placeholder="Nome do Módulo"
                            value={moduleFormData.nome_modulo}
                            onChange={(e) => handleModuleChange('nome_modulo', e.target.value)}
                            className={cn(moduleErrors[moduleFormData.id]?.nome_modulo && "border-red-500")}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <Input
                              placeholder="Código (ex: MOD-01)"
                              value={moduleFormData.codigo_modulo}
                              onChange={(e) => handleModuleChange('codigo_modulo', e.target.value.toUpperCase())}
                              className={cn(moduleErrors[moduleFormData.id]?.codigo_modulo && "border-red-500")}
                            />
                            
                            <Input
                              type="number"
                              min="0"
                              placeholder="Carga Horária (h)"
                              value={moduleFormData.carga_horaria || ''}
                              onChange={(e) => handleModuleChange('carga_horaria', parseInt(e.target.value) || 0)}
                              className={cn(moduleErrors[moduleFormData.id]?.carga_horaria && "border-red-500")}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={handleCancelModule}>
                            Cancelar
                          </Button>
                          <Button size="sm" onClick={handleSaveModule} className="bg-blue-600 hover:bg-blue-700">
                            <Save className="h-4 w-4 mr-1" />
                            {editingModuleId ? 'Atualizar' : 'Adicionar'}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* LISTA DE MÓDULOS (MANTÉM IGUAL) */}
                    {modules.length > 0 ? (
                      <div className="space-y-2">
                        {modules.map((module) => (
                          <div
                            key={module.id}
                            className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-slate-800">{module.nome_modulo}</h4>
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">
                                    {module.codigo_modulo}
                                  </span>
                                </div>
                                <p className="text-sm text-slate-600 mt-1">
                                  ⏱️ {module.carga_horaria}h
                                </p>
                              </div>
                              {!showModuleForm && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleEditModule(module)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit2 className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteModule(module.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : !showModuleForm && (
                      <div className="text-center py-12 text-slate-400">
                        <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Nenhum módulo adicionado</p>
                      </div>
                    )}
                  </div>

                  {/* AVISO SE NÃO SELECIONOU CATEGORIA */}
                  {!categoriaSelecionada && (
                    <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl text-center">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
                      <p className="text-sm text-yellow-800 font-semibold">
                        Selecione uma categoria na aba "Configurações" primeiro
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ABA: CONTROLE */}
              {activeTab === 'controle' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                        <Settings className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-slate-700 leading-none">Estado e Controle</Label>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">Status do Curso</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: any) => handleChange('status', value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativo">
                              <span className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                Ativo
                              </span>
                            </SelectItem>
                            <SelectItem value="inativo">
                              <span className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                Inativo
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {isEditing && formData.data_criacao && (
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">Data de Criação</Label>
                          <Input
                            value={new Date(formData.data_criacao).toLocaleDateString('pt-MZ')}
                            disabled
                            className="h-12 bg-slate-100 rounded-xl"
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-600 font-semibold ml-1">Observações</Label>
                      <Textarea
                        placeholder="Informações adicionais sobre o curso..."
                        value={formData.observacoes}
                        onChange={(e) => handleChange('observacoes', e.target.value)}
                        rows={6}
                        className="rounded-2xl resize-none"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Resumo */}
                  <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#004B87] mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#F5821F]" />
                      Resumo do Curso
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Nome:</span>
                        <span className="text-sm font-semibold text-[#004B87]">{formData.nome || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Código:</span>
                        <span className="text-sm font-mono font-semibold text-[#F5821F]">{formData.codigo || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Categoria:</span>
                        <span className="text-sm font-semibold text-[#004B87]">
                          {categoriaSelecionada?.nome || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Duração:</span>
                        <span className="text-sm font-semibold">
                          {categoriaSelecionada?.tem_niveis && niveis.length > 0
                            ? `${getTotalDuracaoNiveis()} meses (${niveis.length} níveis)`
                            : `${formData.duracao_valor} meses`
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Mensalidade:</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(formData.mensalidade)}</span>
                      </div>
                      {niveis.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Níveis:</span>
                          <span className="text-sm font-semibold text-purple-600">
                            {niveis.length} níveis ({getTotalDuracaoNiveis()} meses)
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Módulos:</span>
                        <span className="text-sm font-semibold text-purple-600">{modules.length} módulos ({getTotalCargaHoraria()}h)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER COM BOTÕES */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest">
                Cancelar
              </Button>
              
              <div className="flex gap-3">
                {activeTab !== 'controle' ? (
                  <Button 
                    onClick={validateAndNext}
                    className="bg-[#004B87] text-white hover:bg-[#003A6B] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    Próximo Passo <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl shadow-orange-500/30"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        {isEditing ? 'Atualizar Curso' : 'Criar Curso'}
                      </>
                    )}
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