import React, { useState, useEffect } from "react";
import { X, BookOpen, Loader2, Sparkles, ChevronRight, CheckCircle2, Settings, BookMarked, Info, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Categoria, Nivel } from '@/types/CategoryTypes';
import categoriaService from '@/services/categoriaService';
import courseService from '@/services/courseService';

// Importar as tabs
import CourseInfoTab from './tabs/CourseInfoTab';
import CourseModulesTab from './tabs/CourseModulesTab';
import CourseControlTab from './tabs/CourseControlTab';

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
  preco_por_nivel?: boolean;
  qtd_niveis?: number;
  duracao_valor: number;
  regime: 'laboral' | 'pos_laboral' | 'ambos';
  // Novos campos
  modalidade: 'presencial' | 'online' | 'hibrido';
  tipo_cobranca: 'mensal' | 'preco_unico';
  mensalidade: number;       // Usado quando tipo_cobranca = 'mensal'
  preco_total?: number;      // Usado quando tipo_cobranca = 'preco_unico'
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
  readOnly?: boolean;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSave,
  courseData,
  isEditing = false,
  readOnly = false
}: CreateCourseModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'info' | 'modulos' | 'controle'>('info');
  // Modo de visualização: quando isEditing=true, começa em modo readOnly e o utilizador clica "Editar" para habilitar
  const [viewMode, setViewMode] = useState(false);
  // Estados principais
  const [existingCourses, setExistingCourses] = useState<{ nome: string }[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<Categoria | null>(null);
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [qtdNiveis, setQtdNiveis] = useState<number>(0);
  const [bulkDuracao, setBulkDuracao] = useState<number>(4);

  const [formData, setFormData] = useState<Course>({
    nome: '',
    codigo: '',
    categoria_id: undefined,
    tipo_curso: undefined,
    duracao_valor: 0,
    regime: 'laboral',
    modalidade: 'presencial',
    tipo_cobranca: 'mensal',
    mensalidade: 0,
    preco_total: 0,
    taxa_matricula: 0,
    propina_fixa: true,
    permite_bolsa: true,
    status: 'ativo',
    observacoes: '',
    modulos: [],
    niveis: [],
    preco_por_nivel: false,
  });

  // Inicializar dados quando modal abrir
  useEffect(() => {
    if (isEditing && courseData) {
      // Merge courseData com valores padrão para campos que a API não retorna
      setFormData({
        nome: courseData.nome || '',
        codigo: courseData.codigo || '',
        categoria_id: courseData.categoria_id || undefined,
        tipo_curso: courseData.tipo_curso || 'tecnico' as Course['tipo_curso'],
        duracao_valor: courseData.duracao_valor || 0,
        regime: courseData.regime || 'laboral',
        modalidade: courseData.modalidade || 'presencial',
        tipo_cobranca: courseData.tipo_cobranca || (courseData.mensalidade > 0 ? 'mensal' : 'preco_unico'),
        mensalidade: courseData.mensalidade || 0,
        preco_total: courseData.preco_total || 0,
        taxa_matricula: courseData.taxa_matricula || 0,
        propina_fixa: courseData.propina_fixa ?? true,
        permite_bolsa: courseData.permite_bolsa ?? true,
        status: courseData.status || 'ativo',
        observacoes: courseData.observacoes || '',
        modulos: courseData.modulos || [],
        niveis: courseData.niveis || [],
        tem_niveis: courseData.tem_niveis || false,
        preco_por_nivel: courseData.preco_por_nivel ?? false,
        qtd_niveis: courseData.qtd_niveis || 0,
      });
      setModules(courseData.modulos || []);
      const existingNiveis = courseData.niveis || [];
      setNiveis(existingNiveis);
      setQtdNiveis(existingNiveis.length);
      // Iniciar em modo de visualização quando está editando
      setViewMode(true);

      if (courseData.categoria) {
        setCategoriaSelecionada(courseData.categoria);
      }
    } else {
      setFormData({
        nome: '',
        codigo: '',
        categoria_id: undefined,
        tipo_curso: undefined,
        duracao_valor: 0,
        regime: 'laboral',
        modalidade: 'presencial',
        tipo_cobranca: 'mensal',
        mensalidade: 0,
        preco_total: 0,
        taxa_matricula: 0,
        propina_fixa: true,
        permite_bolsa: true,
        status: 'ativo',
        observacoes: '',
        modulos: [],
        niveis: [],
        preco_por_nivel: false,
      });
      setModules([]);
      setNiveis([]);
      setQtdNiveis(0);
      setBulkDuracao(4);
      setCategoriaSelecionada(null);
      setViewMode(false);
    }
    setErrors({});
    setActiveTab('info');
  }, [isEditing, courseData, isOpen]);

  // Carregar categorias
  const carregarCategorias = async () => {
    try {
      const result = await categoriaService.listarCategorias();
      setCategorias(result);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };

  const carregarCursosExistentes = async () => {
    try {
      const result = await courseService.getAll();
      const courses = Array.isArray(result) ? result : [];
      setExistingCourses(courses.map((c: { nome: string }) => ({ nome: c.nome })));
    } catch {
      setExistingCourses([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      carregarCategorias();
      carregarCursosExistentes();
    }
  }, [isOpen]);

  // Funções auxiliares
  const getTotalCargaHoraria = () => {
    return modules.reduce((sum, module) => sum + module.carga_horaria, 0);
  };

  const getTotalDuracaoNiveis = () => {
    return niveis.reduce((sum, nivel) => sum + nivel.duracao_meses, 0);
  };

  // Validação
  const validateForm = (finalSubmit = false): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do curso é obrigatório';
    } else if (!isEditing && existingCourses.some(c => c.nome.toLowerCase().trim() === formData.nome.toLowerCase().trim())) {
      newErrors.nome = 'Já existe um curso com este nome. Por favor, escolha outro nome.';
    }
    if (!formData.codigo.trim()) newErrors.codigo = 'Código do curso é obrigatório';
    else if (formData.codigo.length < 3) newErrors.codigo = 'Código deve ter no mínimo 3 caracteres';

    if (!formData.categoria_id) newErrors.categoria_id = 'Selecione a categoria do curso';

    if (formData.tem_niveis) {
      if (categoriaSelecionada?.level_type === 'named') {
        if (finalSubmit && niveis.length === 0) {
          newErrors.qtd_niveis = 'Seleccione pelo menos um nível na aba "Módulos"';
        }
      } else {
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

    // Validação de valores financeiros baseada no tipo de cobrança
    if (formData.tipo_cobranca === 'mensal') {
      if (formData.mensalidade < 0) newErrors.mensalidade = 'Mensalidade não pode ser negativa';
    } else if (formData.tipo_cobranca === 'preco_unico') {
      if ((formData.preco_total || 0) < 0) newErrors.preco_total = 'Preço total não pode ser negativo';
    }
    if (formData.taxa_matricula < 0) newErrors.taxa_matricula = 'Taxa de matrícula não pode ser negativa';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const handleSubmit = async () => {
    if (!validateForm(true)) {
      toast.error('Preencha todos os campos obrigatórios corretamente');
      setActiveTab('info');
      return;
    }

    setIsLoading(true);
    try {
      const temNiveis = formData.tem_niveis || false;
      const courseWithModules = {
        ...formData,
        modulos: modules,
        tem_niveis: temNiveis,
        qtd_niveis: temNiveis ? qtdNiveis : undefined,
        niveis: temNiveis ? niveis : [],
        duracao_valor: temNiveis ? getTotalDuracaoNiveis() : formData.duracao_valor,
        taxa_matricula: formData.taxa_matricula
      };
      await onSave(courseWithModules);
      toast.success(isEditing ? 'Curso atualizado com sucesso!' : 'Curso criado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
      const message = error instanceof Error ? error.message : 'Erro ao salvar curso';
      if (message.toLowerCase().includes('código') || message.toLowerCase().includes('codigo')) {
        setErrors({ codigo: message });
        setActiveTab('info');
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("p-0 overflow-hidden border-none shadow-2xl bg-white transition-all duration-300", activeTab === 'modulos' ? "max-w-7xl" : "max-w-5xl")}>
        <div className="flex h-[650px]">
          
          {/* SIDEBAR DE NAVEGAÇÃO */}
          <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
            <div className="flex items-center gap-3 mb-12">
              <BookOpen className="h-6 w-6 text-[#F5821F]" />
              <div>
                <h2 className="font-bold text-lg leading-none">Course Manager</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Gestão de Cursos</span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {(
                [
                  { id: 'info', label: 'Configurações', icon: Settings, desc: 'Dados e Financeiro' },
                  { id: 'modulos', label: 'Módulos', icon: BookMarked, desc: 'Grade Curricular' },
                  { id: 'controle', label: 'Controle', icon: Info, desc: 'Status e Observações' },
                ] as { id: 'info' | 'modulos' | 'controle'; label: string; icon: typeof Settings; desc: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                  {viewMode ? 'Detalhes do Curso' : isEditing ? 'Editar Curso' : 'Criar Novo Curso'}
                </DialogTitle>
                <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                  <span>Gestão Acadêmica</span>
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-[#F5821F] font-medium">
                    {viewMode ? formData.nome || 'CURSO' : activeTab.toUpperCase()}
                  </span>
                </div>
              </div>
              {viewMode && (
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                    formData.status === 'ativo'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {formData.status === 'ativo' ? '✓ Activo' : 'Inactivo'}
                  </span>
                </div>
              )}
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">
              <div className={viewMode ? 'pointer-events-none opacity-90' : ''}>
              {activeTab === 'info' && (
                <CourseInfoTab
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  setErrors={setErrors}
                  isEditing={isEditing}
                  isLoading={isLoading}
                  categorias={categorias}
                  categoriaSelecionada={categoriaSelecionada}
                  setCategoriaSelecionada={setCategoriaSelecionada}
                  qtdNiveis={qtdNiveis}
                  setQtdNiveis={setQtdNiveis}
                  niveis={niveis}
                  setNiveis={setNiveis}
                  setBulkDuracao={setBulkDuracao}
                  getTotalDuracaoNiveis={getTotalDuracaoNiveis}
                />
              )}

              {activeTab === 'modulos' && (
                <CourseModulesTab
                  formData={formData}
                  categoriaSelecionada={categoriaSelecionada}
                  modules={modules}
                  setModules={setModules}
                  niveis={niveis}
                  setNiveis={setNiveis}
                  qtdNiveis={qtdNiveis}
                  setQtdNiveis={setQtdNiveis}
                  bulkDuracao={bulkDuracao}
                  setBulkDuracao={setBulkDuracao}
                  isLoading={isLoading}
                />
              )}

              {activeTab === 'controle' && (
                <CourseControlTab
                  formData={formData}
                  setFormData={setFormData}
                  isEditing={isEditing}
                  isLoading={isLoading}
                  categoriaSelecionada={categoriaSelecionada}
                  modules={modules}
                  niveis={niveis}
                  getTotalCargaHoraria={getTotalCargaHoraria}
                  getTotalDuracaoNiveis={getTotalDuracaoNiveis}
                />
              )}
              </div>
            </div>

            {/* FOOTER COM BOTÕES */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button variant="ghost" onClick={onClose} disabled={isLoading} className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest">
                {viewMode ? 'Fechar' : 'Cancelar'}
              </Button>

              {viewMode ? (
                /* Modo visualização - botão Editar */
                <Button
                  onClick={() => setViewMode(false)}
                  className="bg-[#004B87] text-white hover:bg-[#003868] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
                >
                  <Edit className="h-4 w-4" />
                  Editar Curso
                </Button>
              ) : (
                /* Modo edição/criação */
                <div className="flex gap-3">
                  {isEditing && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        // Voltar ao modo visualização e restaurar dados originais
                        if (courseData) {
                          setFormData({
                            nome: courseData.nome || '',
                            codigo: courseData.codigo || '',
                            categoria_id: courseData.categoria_id || undefined,
                            tipo_curso: courseData.tipo_curso || 'tecnico' as Course['tipo_curso'],
                            duracao_valor: courseData.duracao_valor || 0,
                            regime: courseData.regime || 'laboral',
                            modalidade: courseData.modalidade || 'presencial',
                            tipo_cobranca: courseData.tipo_cobranca || (courseData.mensalidade > 0 ? 'mensal' : 'preco_unico'),
                            mensalidade: courseData.mensalidade || 0,
                            preco_total: courseData.preco_total || 0,
                            taxa_matricula: courseData.taxa_matricula || 0,
                            propina_fixa: courseData.propina_fixa ?? true,
                            permite_bolsa: courseData.permite_bolsa ?? true,
                            status: courseData.status || 'ativo',
                            observacoes: courseData.observacoes || '',
                            modulos: courseData.modulos || [],
                            niveis: courseData.niveis || [],
                            tem_niveis: courseData.tem_niveis || false,
                            qtd_niveis: courseData.qtd_niveis || 0,
                          });
                        }
                        setViewMode(true);
                        setErrors({});
                      }}
                      className="text-slate-500 hover:text-slate-700 font-bold uppercase text-[11px] tracking-widest"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancelar Edição
                    </Button>
                  )}
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
              )}
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}