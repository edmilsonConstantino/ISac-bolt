import React, { useState, useEffect } from "react";
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
import { Categoria, Nivel, NivelModulo } from '@/types/CategoryTypes';
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
  categoria_id?: number;
  categoria?: Categoria;
  tipo_curso?: 'tecnico' | 'tecnico_superior' | 'tecnico_profissional' | 'curta_duracao';
  tem_niveis?: boolean;
  qtd_niveis?: number;
  duracao_valor: number;
  regime: 'laboral' | 'pos_laboral' | 'ambos';
  mensalidade: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  isento_matricula?: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  modulos?: Module[];
  niveis?: Nivel[];
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

  // Estados para categorias e níveis
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [qtdNiveis, setQtdNiveis] = useState<number>(0);
  const [bulkDuracao, setBulkDuracao] = useState<number>(4);
  const [expandedNivelId, setExpandedNivelId] = useState<number | null>(null);
  const [nivelModuloForm, setNivelModuloForm] = useState<NivelModulo>({
    id: '', nome_modulo: '', codigo_modulo: '', carga_horaria: 0
  });
  const [editingNivelModuloId, setEditingNivelModuloId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Course>({
    nome: '',
    codigo: '',
    categoria_id: undefined,
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
    niveis: []
  });

  useEffect(() => {
    if (isEditing && courseData) {
      setFormData(courseData);
      setModules(courseData.modulos || []);
      const existingNiveis = courseData.niveis || [];
      setNiveis(existingNiveis);
      setQtdNiveis(existingNiveis.length);

      if (courseData.categoria) {
        setCategoriaSelecionada(courseData.categoria);
      }
    } else {
      setFormData({
        nome: '',
        codigo: '',
        categoria_id: undefined,
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
        niveis: []
      });
      setModules([]);
      setNiveis([]);
      setQtdNiveis(0);
      setBulkDuracao(4);
      setCategoriaSelecionada(null);
    }
    setErrors({});
    setModuleErrors({});
    setShowModuleForm(false);
    setEditingModuleId(null);
    setActiveTab('info');
  }, [isEditing, courseData, isOpen]);

  // Gerar abreviatura do nome do curso (ex: "Inglês" → "ING", "Programação Web" → "PW")
  const gerarAbreviaturaCurso = (nome: string): string => {
    if (!nome.trim()) return 'CUR';
    const stopWords = ['de', 'da', 'do', 'e', 'em', 'com', 'para', 'a', 'o', 'as', 'os'];
    const words = nome.trim()
      .toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos
      .split(' ')
      .filter(word => word.length > 0 && !stopWords.includes(word.toLowerCase()));

    if (words.length > 1) {
      return words.slice(0, 3).map(w => w[0]).join('');
    } else if (words.length === 1) {
      return words[0].substring(0, 3);
    }
    return 'CUR';
  };

  // Gerar código do módulo:
  // Numerado: ABBREV_N{nivel}_M{seq} (ex: ING_N1_M1)
  // Nomeado:  ABBREV_ABBREVNIVEL_M{seq} (ex: INF_BAS_M1)
  const gerarCodigoModulo = (nivelNum: number, modulosExistentes: NivelModulo[]): string => {
    const abbrev = gerarAbreviaturaCurso(formData.nome);
    const nextSeq = modulosExistentes.length + 1;
    if (categoriaSelecionada?.level_type === 'named') {
      const nivel = niveis.find(n => n.nivel === nivelNum);
      const nivelAbbrev = nivel ? gerarAbreviaturaCurso(nivel.nome) : `N${nivelNum}`;
      return `${abbrev}_${nivelAbbrev}_M${nextSeq}`;
    }
    return `${abbrev}_N${nivelNum}_M${nextSeq}`;
  };

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

  const validateForm = (finalSubmit = false): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome do curso é obrigatório';
    if (!formData.codigo.trim()) newErrors.codigo = 'Código do curso é obrigatório';
    else if (formData.codigo.length < 3) newErrors.codigo = 'Código deve ter no mínimo 3 caracteres';

    if (!formData.categoria_id) newErrors.categoria_id = 'Selecione a categoria do curso';

    if (categoriaSelecionada?.has_levels) {
      if (categoriaSelecionada.level_type === 'named') {
        // Níveis nomeados: basta seleccionar pelo menos 1 no submit final
        if (finalSubmit && niveis.length === 0) {
          newErrors.qtd_niveis = 'Seleccione pelo menos um nível na aba "Módulos"';
        }
      } else {
        // Níveis numerados: precisa da quantidade
        if (qtdNiveis <= 0) {
          newErrors.qtd_niveis = 'Informe a quantidade de níveis';
        } else if (finalSubmit && niveis.length === 0) {
          newErrors.qtd_niveis = 'Gere os níveis na aba "Módulos"';
        } else if (finalSubmit && niveis.length !== qtdNiveis) {
          newErrors.qtd_niveis = `Esperado ${qtdNiveis} níveis, mas existem ${niveis.length}. Regenere os níveis.`;
        }
      }
    } else {
      if (formData.duracao_valor <= 0) {
        newErrors.duracao_valor = 'Duração deve ser maior que 0';
      }
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
  // FUNÇÕES PARA NÍVEIS
  // ============================================================

  // Gerar/sincronizar níveis com base na quantidade
  const gerarNiveis = (quantidade: number) => {
    if (quantidade <= 0) {
      setNiveis([]);
      return;
    }

    setNiveis(prev => {
      const novos: Nivel[] = [];
      for (let i = 1; i <= quantidade; i++) {
        const existente = prev.find(n => n.nivel === i);
        if (existente) {
          novos.push({ ...existente, ordem: i });
        } else {
          novos.push({
            id: Date.now() + i,
            nivel: i,
            nome: `Nível ${i}`,
            descricao: '',
            duracao_meses: bulkDuracao,
            ordem: i,
            prerequisito_nivel_id: i > 1 ? (novos[i - 2]?.id || null) : null
          });
        }
      }
      return novos;
    });
  };

  // Aplicar duração a todos os níveis
  const aplicarDuracaoTodos = (duracao: number) => {
    if (duracao <= 0) return;
    setNiveis(prev => prev.map(n => ({ ...n, duracao_meses: duracao })));
    toast.success(`Duração de ${duracao} meses aplicada a todos os níveis`);
  };

  // Editar nível inline (direto na tabela)
  const handleInlineNivelChange = (nivelNum: number, field: keyof Nivel, value: string | number | null) => {
    setNiveis(prev => prev.map(n => n.nivel === nivelNum ? { ...n, [field]: value } : n));
  };

  // Módulos por nível
  const toggleNivelModulos = (nivelNum: number) => {
    const isOpening = expandedNivelId !== nivelNum;
    setExpandedNivelId(prev => prev === nivelNum ? null : nivelNum);
    if (isOpening) {
      const nivel = niveis.find(n => n.nivel === nivelNum);
      const codigo = gerarCodigoModulo(nivelNum, nivel?.modulos || []);
      setNivelModuloForm({ id: Date.now().toString(), nome_modulo: '', codigo_modulo: codigo, carga_horaria: 0 });
    } else {
      setNivelModuloForm({ id: '', nome_modulo: '', codigo_modulo: '', carga_horaria: 0 });
    }
    setEditingNivelModuloId(null);
  };

  const handleAddNivelModulo = (nivelNum: number) => {
    const nivel = niveis.find(n => n.nivel === nivelNum);
    const modulosExistentes = nivel?.modulos || [];
    const codigo = gerarCodigoModulo(nivelNum, modulosExistentes);
    setNivelModuloForm({ id: Date.now().toString(), nome_modulo: '', codigo_modulo: codigo, carga_horaria: 0 });
    setEditingNivelModuloId(null);
  };

  const handleSaveNivelModulo = (nivelNum: number) => {
    if (!nivelModuloForm.nome_modulo.trim()) {
      toast.error('Nome do módulo é obrigatório');
      return;
    }
    if (nivelModuloForm.carga_horaria <= 0) {
      toast.error('Carga horária deve ser maior que 0');
      return;
    }

    setNiveis(prev => prev.map(n => {
      if (n.nivel !== nivelNum) return n;
      const modulos = n.modulos || [];
      if (editingNivelModuloId) {
        return { ...n, modulos: modulos.map(m => m.id === editingNivelModuloId ? nivelModuloForm : m) };
      }
      return { ...n, modulos: [...modulos, nivelModuloForm] };
    }));

    toast.success(editingNivelModuloId ? 'Módulo atualizado!' : 'Módulo adicionado!');
    // Calcular próximo código automaticamente (precisa contar após a adição)
    const nivelAtualizado = niveis.find(n => n.nivel === nivelNum);
    const modulosAtuais = nivelAtualizado?.modulos || [];
    const nextModulos = editingNivelModuloId
      ? modulosAtuais
      : [...modulosAtuais, nivelModuloForm];
    const nextCodigo = gerarCodigoModulo(nivelNum, nextModulos);
    setNivelModuloForm({ id: Date.now().toString(), nome_modulo: '', codigo_modulo: nextCodigo, carga_horaria: 0 });
    setEditingNivelModuloId(null);
  };

  const handleEditNivelModulo = (modulo: NivelModulo) => {
    setNivelModuloForm(modulo);
    setEditingNivelModuloId(modulo.id);
  };

  const handleDeleteNivelModulo = (nivelNum: number, moduloId: string) => {
    setNiveis(prev => prev.map(n => {
      if (n.nivel !== nivelNum) return n;
      return { ...n, modulos: (n.modulos || []).filter(m => m.id !== moduloId) };
    }));
    toast.success('Módulo removido!');
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

  const carregarCategorias = async () => {
    try {
      const result = await categoriaService.listarCategorias();
      setCategorias(result);
    } catch (error: any) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  // Carregar categorias quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarCategorias();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!validateForm(true)) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
      setActiveTab('info');
      return;
    }

    setIsLoading(true);
    try {
      const temNiveis = categoriaSelecionada?.has_levels || false;
      const courseWithModules = {
        ...formData,
        modulos: modules,
        tem_niveis: temNiveis,
        qtd_niveis: temNiveis ? qtdNiveis : undefined,
        niveis: temNiveis ? niveis : [],
        duracao_valor: temNiveis ? getTotalDuracaoNiveis() : formData.duracao_valor
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
                              
                              // Limpar níveis e quantidade ao trocar de categoria
                              if (cat && !cat.has_levels) {
                                setNiveis([]);
                                setQtdNiveis(0);
                              } else if (cat && cat.has_levels) {
                                // Nova categoria com níveis: reset se categoria mudou
                                if (categoriaSelecionada?.id !== cat.id) {
                                  setNiveis([]);
                                  setQtdNiveis(0);
                                  setBulkDuracao(4);
                                }
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
                                  {cat.name} {cat.has_levels && '📊 (com níveis)'}
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
                              {categoriaSelecionada.has_levels
                                ? categoriaSelecionada.level_type === 'named'
                                  ? `Esta categoria tem níveis: ${categoriaSelecionada.predefined_levels?.join(', ') || ''}`
                                  : 'Esta categoria permite criar níveis (ex: Nível 1, 2, 3...)'
                                : 'Curso sem níveis - duração única'
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
                      {/* DURAÇÃO FIXA - apenas se categoria NÃO tem níveis */}
                      {!categoriaSelecionada?.has_levels && (
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

                      {/* QUANTIDADE DE NÍVEIS - apenas se categoria TEM níveis NUMERADOS */}
                      {categoriaSelecionada?.has_levels && categoriaSelecionada?.level_type !== 'named' && (
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Quantidade de Níveis <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            max="20"
                            value={qtdNiveis || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setQtdNiveis(val);
                              if (errors.qtd_niveis) {
                                setErrors(prev => {
                                  const n = { ...prev };
                                  delete n.qtd_niveis;
                                  return n;
                                });
                              }
                            }}
                            placeholder="Ex: 5"
                            className={cn("h-12 rounded-xl", errors.qtd_niveis && "border-red-500")}
                            disabled={isLoading}
                          />
                          {errors.qtd_niveis && (
                            <p className="text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              {errors.qtd_niveis}
                            </p>
                          )}
                          {niveis.length > 0 && (
                            <p className="text-xs text-purple-600">
                              {niveis.length} {niveis.length === 1 ? 'nível' : 'níveis'} gerados - {getTotalDuracaoNiveis()} meses totais
                            </p>
                          )}
                          {niveis.length === 0 && qtdNiveis > 0 && (
                            <p className="text-xs text-slate-500">
                              Gere os níveis na aba "Módulos"
                            </p>
                          )}
                        </div>
                      )}

                      {/* NÍVEIS NOMEADOS (ex: Básico / Avançado) */}
                      {categoriaSelecionada?.has_levels && categoriaSelecionada?.level_type === 'named' && (
                        <div className="space-y-2">
                          <Label className="text-slate-600 font-semibold ml-1">
                            Níveis Disponíveis
                          </Label>
                          <p className="text-xs text-purple-600">
                            {categoriaSelecionada.predefined_levels?.join(', ')}
                          </p>
                          {niveis.length > 0 && (
                            <p className="text-xs text-purple-600">
                              {niveis.length} {niveis.length === 1 ? 'nível' : 'níveis'} - {getTotalDuracaoNiveis()} meses totais
                            </p>
                          )}
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
                          value={formData.isento_matricula ? 0 : (formData.taxa_matricula || '')}
                          onChange={(e) => handleChange('taxa_matricula', parseFloat(e.target.value) || 0)}
                          className={cn("h-12 rounded-xl", errors.taxa_matricula && "border-red-500")}
                          disabled={isLoading || formData.isento_matricula}
                        />
                        <div className="flex items-center space-x-2 mt-1">
                          <Checkbox
                            id="isento_matricula"
                            checked={formData.isento_matricula || false}
                            onCheckedChange={(checked) => {
                              handleChange('isento_matricula', checked);
                              if (checked) handleChange('taxa_matricula', 0);
                            }}
                            disabled={isLoading}
                          />
                          <Label htmlFor="isento_matricula" className="text-sm text-slate-500 cursor-pointer">
                            Isento (não paga taxa de matrícula)
                          </Label>
                        </div>
                        {!formData.isento_matricula && formData.taxa_matricula > 0 && (
                          <p className="text-xs text-green-600">{formatCurrency(formData.taxa_matricula)}</p>
                        )}
                        {formData.isento_matricula && (
                          <p className="text-xs text-amber-600 font-medium">Isento de taxa de matrícula</p>
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
                  {categoriaSelecionada?.has_levels && (
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                          <BookMarked className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-700">Níveis do Curso</h3>
                          {niveis.length > 0 && (
                            <span className="text-xs text-purple-600">
                              {niveis.length} {niveis.length === 1 ? 'nível' : 'níveis'} &bull; {getTotalDuracaoNiveis()} meses totais
                            </span>
                          )}
                        </div>
                      </div>

                      {/* CONTROLES NUMERADOS: Quantidade + Gerar + Duração em massa */}
                      {categoriaSelecionada?.level_type !== 'named' && (
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-4 mb-4">
                        <div className="grid grid-cols-3 gap-4 items-end">
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-purple-800">Quantidade de Níveis</Label>
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={qtdNiveis || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '');
                                setQtdNiveis(val ? parseInt(val) : 0);
                              }}
                              placeholder="Ex: 5"
                              className="h-10 border-purple-300 focus:ring-purple-500"
                              disabled={isLoading}
                            />
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (qtdNiveis <= 0) {
                                toast.error('Informe a quantidade de níveis');
                                return;
                              }
                              if (qtdNiveis > 20) {
                                toast.error('Máximo de 20 níveis permitido');
                                return;
                              }
                              gerarNiveis(qtdNiveis);
                              toast.success(`${qtdNiveis} ${qtdNiveis === 1 ? 'nível gerado' : 'níveis gerados'}`);
                            }}
                            disabled={isLoading || qtdNiveis <= 0}
                            className="bg-purple-600 hover:bg-purple-700 h-10"
                          >
                            <Sparkles className="h-4 w-4 mr-1" />
                            Gerar Níveis
                          </Button>
                          <div className="space-y-2">
                            <Label className="text-xs font-semibold text-purple-800">Duração padrão (meses)</Label>
                            <div className="flex gap-2">
                              <Input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                value={bulkDuracao || ''}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\D/g, '');
                                  setBulkDuracao(val ? parseInt(val) : 0);
                                }}
                                className="h-10 border-purple-300 focus:ring-purple-500"
                                disabled={isLoading}
                              />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => aplicarDuracaoTodos(bulkDuracao)}
                                disabled={isLoading || niveis.length === 0}
                                className="h-10 border-purple-300 text-purple-700 hover:bg-purple-100 whitespace-nowrap"
                              >
                                Aplicar a todos
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                      )}

                      {/* CONTROLES NOMEADOS: Seleccionar nível predefinido + duração */}
                      {categoriaSelecionada?.level_type === 'named' && categoriaSelecionada.predefined_levels && (
                      <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-4 mb-4">
                        <Label className="text-xs font-semibold text-purple-800">
                          Seleccione os níveis e defina a duração
                        </Label>
                        <div className="space-y-3">
                          {categoriaSelecionada.predefined_levels.map((nomeNivel, idx) => {
                            const nivelExistente = niveis.find(n => n.nome === nomeNivel);
                            const isActive = !!nivelExistente;
                            return (
                              <div key={nomeNivel} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-purple-100">
                                <Checkbox
                                  id={`nivel-pred-${idx}`}
                                  checked={isActive}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      const novoNivel: Nivel = {
                                        id: Date.now() + idx,
                                        nivel: idx + 1,
                                        nome: nomeNivel,
                                        descricao: '',
                                        duracao_meses: 4,
                                        ordem: idx + 1,
                                        prerequisito_nivel_id: idx > 0 ? (niveis.find(n => n.ordem === idx)?.id || null) : null
                                      };
                                      setNiveis(prev => [...prev, novoNivel].sort((a, b) => a.ordem - b.ordem));
                                      setQtdNiveis(prev => prev + 1);
                                    } else {
                                      setNiveis(prev => prev.filter(n => n.nome !== nomeNivel));
                                      setQtdNiveis(prev => Math.max(0, prev - 1));
                                    }
                                  }}
                                  disabled={isLoading}
                                />
                                <Label htmlFor={`nivel-pred-${idx}`} className="text-sm font-semibold text-purple-800 cursor-pointer min-w-[100px]">
                                  {nomeNivel}
                                </Label>
                                {isActive && (
                                  <div className="flex items-center gap-2 ml-auto">
                                    <Label className="text-xs text-slate-500">Duração (meses):</Label>
                                    <Input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      value={nivelExistente?.duracao_meses || ''}
                                      onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        handleInlineNivelChange(nivelExistente!.nivel, 'duracao_meses', val ? parseInt(val) : 0);
                                      }}
                                      className="h-8 w-20 text-sm border-purple-300 focus:ring-purple-500"
                                      disabled={isLoading}
                                    />
                                  </div>
                                )}
                                {!isActive && (
                                  <span className="text-xs text-slate-400 ml-auto">Não seleccionado</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        {niveis.length > 0 && (
                          <p className="text-xs text-purple-600 font-semibold">
                            Total: {getTotalDuracaoNiveis()} meses ({niveis.length} {niveis.length === 1 ? 'nível' : 'níveis'})
                          </p>
                        )}
                      </div>
                      )}

                      {/* TABELA INLINE DE NÍVEIS */}
                      {niveis.length > 0 ? (
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="bg-slate-100 text-slate-600">
                                <th className="px-3 py-2 text-left font-semibold w-16">#</th>
                                <th className="px-3 py-2 text-left font-semibold">Nome</th>
                                <th className="px-3 py-2 text-left font-semibold w-36">Duração (meses)</th>
                                <th className="px-3 py-2 text-center font-semibold w-32">Módulos</th>
                              </tr>
                            </thead>
                            <tbody>
                              {niveis.map((nivel) => (
                                <React.Fragment key={nivel.id || nivel.nivel}>
                                  <tr className="border-t border-slate-100 hover:bg-purple-50/50 transition-colors">
                                    <td className="px-3 py-2">
                                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">
                                        {nivel.nivel}
                                      </span>
                                    </td>
                                    <td className="px-3 py-2">
                                      <Input
                                        value={nivel.nome}
                                        onChange={(e) => handleInlineNivelChange(nivel.nivel, 'nome', e.target.value)}
                                        className="h-8 text-sm border-slate-200 focus:ring-purple-500"
                                        disabled={isLoading}
                                      />
                                    </td>
                                    <td className="px-3 py-2">
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={nivel.duracao_meses || ''}
                                        onChange={(e) => {
                                          const val = e.target.value.replace(/\D/g, '');
                                          handleInlineNivelChange(nivel.nivel, 'duracao_meses', val ? parseInt(val) : 0);
                                        }}
                                        className="h-8 text-sm border-slate-200 focus:ring-purple-500"
                                        disabled={isLoading}
                                      />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                      <Button
                                        size="sm"
                                        variant={expandedNivelId === nivel.nivel ? "default" : "outline"}
                                        onClick={() => toggleNivelModulos(nivel.nivel)}
                                        className={cn(
                                          "h-8 text-xs",
                                          expandedNivelId === nivel.nivel
                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                            : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                        )}
                                        disabled={isLoading}
                                      >
                                        <Plus className="h-3 w-3 mr-1" />
                                        {(nivel.modulos?.length || 0) > 0 ? `${nivel.modulos?.length} Mód.` : 'Módulos'}
                                      </Button>
                                    </td>
                                  </tr>
                                  {/* MÓDULOS DO NÍVEL (expandido inline) */}
                                  {expandedNivelId === nivel.nivel && (
                                    <tr>
                                      <td colSpan={4} className="p-0">
                                        <div className="p-4 bg-blue-50 border-y-2 border-blue-200">
                                          <div className="flex items-center justify-between mb-3">
                                            <h4 className="text-sm font-bold text-blue-800">
                                              Módulos do {nivel.nome}
                                            </h4>
                                            <Button
                                              size="sm"
                                              onClick={() => handleAddNivelModulo(nivel.nivel)}
                                              className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                              disabled={isLoading}
                                            >
                                              <Plus className="h-3 w-3 mr-1" />
                                              Novo Módulo
                                            </Button>
                                          </div>

                                          {/* Lista de módulos existentes */}
                                          {(nivel.modulos || []).length > 0 && (
                                            <div className="space-y-2 mb-3">
                                              {nivel.modulos!.map((mod) => (
                                                <div key={mod.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100">
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">{mod.codigo_modulo}</span>
                                                    <span className="text-sm text-slate-700">{mod.nome_modulo}</span>
                                                    <span className="text-xs text-slate-500">{mod.carga_horaria}h</span>
                                                  </div>
                                                  <div className="flex gap-1">
                                                    <Button size="sm" variant="ghost" onClick={() => handleEditNivelModulo(mod)} className="h-6 w-6 p-0">
                                                      <Edit2 className="h-3 w-3 text-blue-600" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={() => handleDeleteNivelModulo(nivel.nivel, mod.id)} className="h-6 w-6 p-0">
                                                      <Trash2 className="h-3 w-3 text-red-500" />
                                                    </Button>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          )}

                                          {/* Formulário de módulo */}
                                          <div className="p-3 bg-white rounded-xl border border-blue-200 space-y-3">
                                            <Input
                                              placeholder="Nome do Módulo"
                                              value={nivelModuloForm.nome_modulo}
                                              onChange={(e) => setNivelModuloForm(prev => ({ ...prev, nome_modulo: e.target.value }))}
                                              className="h-8 text-sm"
                                              disabled={isLoading}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                              <Input
                                                placeholder="Código auto-gerado"
                                                value={nivelModuloForm.codigo_modulo}
                                                className="h-8 text-sm bg-slate-50 font-mono text-slate-600"
                                                readOnly
                                              />
                                              <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                placeholder="Carga Horária (h)"
                                                value={nivelModuloForm.carga_horaria || ''}
                                                onChange={(e) => {
                                                  const val = e.target.value.replace(/\D/g, '');
                                                  setNivelModuloForm(prev => ({ ...prev, carga_horaria: val ? parseInt(val) : 0 }));
                                                }}
                                                className="h-8 text-sm"
                                                disabled={isLoading}
                                              />
                                            </div>
                                            <div className="flex justify-end">
                                              <Button
                                                size="sm"
                                                onClick={() => handleSaveNivelModulo(nivel.nivel)}
                                                className="h-7 text-xs bg-blue-600 hover:bg-blue-700"
                                                disabled={isLoading}
                                              >
                                                <Save className="h-3 w-3 mr-1" />
                                                {editingNivelModuloId ? 'Atualizar' : 'Adicionar'}
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                          <div className="px-4 py-2 bg-purple-50 border-t border-slate-200 flex justify-between items-center">
                            <span className="text-xs text-purple-700 font-semibold">
                              Total: {getTotalDuracaoNiveis()} meses
                            </span>
                            <span className="text-xs text-slate-500">
                              Edite directamente na tabela
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400">
                          <BookMarked className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">Nenhum nível gerado</p>
                          <p className="text-xs mt-1">Defina a quantidade e clique em "Gerar Níveis"</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ============================================ */}
                  {/* MÓDULOS GERAIS (apenas quando NÃO tem níveis) */}
                  {/* ============================================ */}
                  {!categoriaSelecionada?.has_levels && (
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
                  )}

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
                          {categoriaSelecionada?.name || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Duração:</span>
                        <span className="text-sm font-semibold">
                          {categoriaSelecionada?.has_levels && niveis.length > 0
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
  className="bg-[#F5821F] text-white hover:bg-[#E07318] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-orange-200"
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