import React, { useState } from "react";
import { Plus, Edit2, Trash2, BookMarked, AlertCircle, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Categoria, Nivel, NivelModulo } from '@/types/CategoryTypes';

interface Module {
  id: string;
  nome_modulo: string;
  codigo_modulo: string;
  carga_horaria: number;
}

interface CourseModulesTabProps {
  formData: any;
  categoriaSelecionada: Categoria | null;
  modules: Module[];
  setModules: React.Dispatch<React.SetStateAction<Module[]>>;
  niveis: Nivel[];
  setNiveis: React.Dispatch<React.SetStateAction<Nivel[]>>;
  qtdNiveis: number;
  setQtdNiveis: (val: number) => void;
  bulkDuracao: number;
  setBulkDuracao: (val: number) => void;
  isLoading: boolean;
}

export default function CourseModulesTab({
  formData,
  categoriaSelecionada,
  modules,
  setModules,
  niveis,
  setNiveis,
  qtdNiveis,
  setQtdNiveis,
  bulkDuracao,
  setBulkDuracao,
  isLoading,
}: CourseModulesTabProps) {

  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleFormData, setModuleFormData] = useState<Module>({
    id: '', nome_modulo: '', codigo_modulo: '', carga_horaria: 0
  });
  const [moduleErrors, setModuleErrors] = useState<Record<string, Record<string, string>>>({});

  const [expandedNivelId, setExpandedNivelId] = useState<number | null>(null);
  const [nivelModuloForm, setNivelModuloForm] = useState<NivelModulo>({
    id: '', nome_modulo: '', codigo_modulo: '', carga_horaria: 0
  });
  const [editingNivelModuloId, setEditingNivelModuloId] = useState<string | null>(null);

  // Funções auxiliares
  const gerarAbreviaturaCurso = (nome: string): string => {
    if (!nome.trim()) return 'CUR';
    const stopWords = ['de', 'da', 'do', 'e', 'em', 'com', 'para', 'a', 'o', 'as', 'os'];
    const words = nome.trim()
      .toUpperCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .split(' ')
      .filter(word => word.length > 0 && !stopWords.includes(word.toLowerCase()));

    if (words.length > 1) {
      return words.slice(0, 3).map(w => w[0]).join('');
    } else if (words.length === 1) {
      return words[0].substring(0, 3);
    }
    return 'CUR';
  };

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

  const getTotalCargaHoraria = () => {
    return modules.reduce((sum, module) => sum + module.carga_horaria, 0);
  };

  const getTotalDuracaoNiveis = () => {
    return niveis.reduce((sum, nivel) => sum + nivel.duracao_meses, 0);
  };

  // Gestão de níveis
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

  const aplicarDuracaoTodos = (duracao: number) => {
    if (duracao <= 0) return;
    setNiveis(prev => prev.map(n => ({ ...n, duracao_meses: duracao })));
    toast.success(`Duração de ${duracao} meses aplicada a todos os níveis`);
  };

  const handleInlineNivelChange = (nivelNum: number, field: keyof Nivel, value: string | number | null) => {
    setNiveis(prev => prev.map(n => n.nivel === nivelNum ? { ...n, [field]: value } : n));
  };

  const formatCurrencyShort = (n: number) =>
    new Intl.NumberFormat('pt-MZ', { style: 'currency', currency: 'MZN', maximumFractionDigits: 0 }).format(n);

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
    const nivelAtualizado = niveis.find(n => n.nivel === nivelNum);
    const modulosAtuais = nivelAtualizado?.modulos || [];
    const nextModulos = editingNivelModuloId ? modulosAtuais : [...modulosAtuais, nivelModuloForm];
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

  // Gestão de módulos gerais
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      
      {/* NÍVEIS (se categoria tem níveis) */}
      {formData.tem_niveis && (
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

          {/* Controles para níveis numerados */}
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

          {/* Controles para níveis nomeados */}
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

          {/* Tabela de níveis */}
          {niveis.length > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden">

              {/* Banner de preço geral (quando preco_por_nivel=false) */}
              {!formData.preco_por_nivel && formData.mensalidade > 0 && (
                <div className="px-3 py-2 bg-green-50 border-b border-green-200 flex items-center gap-2 text-xs text-green-700">
                  <span className="font-semibold">Mensalidade aplicada a todos os níveis:</span>
                  <span>{formatCurrencyShort(formData.mensalidade)}/mês</span>
                  <span className="text-green-500 italic ml-1">— taxa de matrícula definida por nível</span>
                </div>
              )}

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-600">
                    <th className="px-3 py-2 text-left font-semibold w-16">#</th>
                    <th className="px-3 py-2 text-left font-semibold">Nome</th>
                    <th className="px-3 py-2 text-left font-semibold w-28">Duração (meses)</th>
                    {formData.preco_por_nivel && (
                      <th className="px-3 py-2 text-left font-semibold w-32 text-amber-700">Mensalidade *</th>
                    )}
                    {formData.tem_niveis && (
                      <th className="px-3 py-2 text-left font-semibold w-28">Taxa Matr.</th>
                    )}
                    {formData.preco_por_nivel && (
                      <th className="px-3 py-2 text-left font-semibold w-36 text-slate-500">Total do Nível</th>
                    )}
                    <th className="px-3 py-2 text-center font-semibold w-28">Módulos</th>
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
                        {formData.preco_por_nivel && (
                          <td className="px-3 py-2">
                            <Input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*[.,]?[0-9]*"
                              value={nivel.mensalidade ?? ''}
                              onChange={(e) => {
                                const raw = e.target.value.replace(',', '.');
                                handleInlineNivelChange(
                                  nivel.nivel, 'mensalidade',
                                  raw === '' ? null : isNaN(Number(raw)) ? nivel.mensalidade : Number(raw)
                                );
                              }}
                              placeholder="Obrigatório"
                              className={cn(
                                "h-8 text-sm focus:ring-purple-500",
                                nivel.mensalidade == null
                                  ? "border-amber-300 focus:ring-amber-400"
                                  : "border-slate-200"
                              )}
                              disabled={isLoading}
                            />
                          </td>
                        )}
                        {formData.tem_niveis && (
                          <td className="px-3 py-2">
                            <Input
                              type="text"
                              inputMode="decimal"
                              pattern="[0-9]*[.,]?[0-9]*"
                              value={nivel.enrollment_fee ?? ''}
                              onChange={(e) => {
                                const raw = e.target.value.replace(',', '.');
                                handleInlineNivelChange(
                                  nivel.nivel, 'enrollment_fee',
                                  raw === '' ? null : isNaN(Number(raw)) ? nivel.enrollment_fee : Number(raw)
                                );
                              }}
                              placeholder="0 ou vazio"
                              className="h-8 text-sm border-slate-200 focus:ring-purple-500"
                              disabled={isLoading}
                            />
                          </td>
                        )}
                        {formData.preco_por_nivel && (
                          <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">
                            {nivel.mensalidade != null && nivel.duracao_meses > 0 ? (
                              <span>
                                {nivel.duracao_meses}×{formatCurrencyShort(nivel.mensalidade)}
                                {' + '}
                                {formatCurrencyShort(nivel.enrollment_fee ?? 0)}
                                {' = '}
                                <strong className="text-slate-700">
                                  {formatCurrencyShort(
                                    nivel.duracao_meses * nivel.mensalidade + (nivel.enrollment_fee ?? 0)
                                  )}
                                </strong>
                              </span>
                            ) : (
                              <span className="text-amber-500 italic">Sem preço</span>
                            )}
                          </td>
                        )}
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
                      {expandedNivelId === nivel.nivel && (
                        <tr>
                          <td colSpan={4 + (formData.tem_niveis ? 1 : 0) + (formData.preco_por_nivel ? 2 : 0)} className="p-0">
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

      {/* MÓDULOS GERAIS (quando não tem níveis) */}
      {!formData.tem_niveis && (
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

      {/* Aviso se não selecionou categoria */}
      {!categoriaSelecionada && (
        <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-2xl text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-yellow-600" />
          <p className="text-sm text-yellow-800 font-semibold">
            Selecione uma categoria na aba "Configurações" primeiro
          </p>
        </div>
      )}
    </div>
  );
}