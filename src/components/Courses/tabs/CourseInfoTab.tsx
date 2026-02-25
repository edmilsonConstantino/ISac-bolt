import React from "react";
import { Calendar, DollarSign, Hash, AlertCircle, Monitor, Wifi, Building, Info, Layers } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Categoria } from '@/types/CategoryTypes';

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
  modalidade: 'presencial' | 'online' | 'hibrido';
  tipo_cobranca: 'mensal' | 'preco_unico';
  mensalidade: number;
  preco_total?: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  isento_matricula?: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  modulos?: Module[];
}

interface CourseInfoTabProps {
  formData: Course;
  setFormData: React.Dispatch<React.SetStateAction<Course>>;
  errors: Record<string, string>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isEditing: boolean;
  isLoading: boolean;
  categorias: Categoria[];
  categoriaSelecionada: Categoria | null;
  setCategoriaSelecionada: (cat: Categoria | null) => void;
  qtdNiveis: number;
  setQtdNiveis: (val: number) => void;
  niveis: any[];
  setNiveis: (val: any[]) => void;
  setBulkDuracao: (val: number) => void;
  getTotalDuracaoNiveis: () => number;
}

export default function CourseInfoTab({
  formData,
  setFormData,
  errors,
  setErrors,
  isEditing,
  isLoading,
  categorias,
  categoriaSelecionada,
  setCategoriaSelecionada,
  qtdNiveis,
  setQtdNiveis,
  niveis,
  setNiveis,
  setBulkDuracao,
  getTotalDuracaoNiveis,
}: CourseInfoTabProps) {

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
    const random = Math.floor(Math.random() * 9000 + 1000); // 1000-9999
    return code ? `${code}-${year}-${random}` : '';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
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

                  const cat = categorias.find(c => c.id === categoriaId);
                  setCategoriaSelecionada(cat || null);

                  if (cat && !cat.has_levels) {
                    setNiveis([]);
                    setQtdNiveis(0);

                    // Auto-fill duration from category default (if available)
                    if (cat.duration_months && cat.duration_months > 0) {
                      handleChange('duracao_valor', cat.duration_months);
                      toast.info(
                        `Duração definida para ${cat.duration_months} meses (padrão da categoria). Pode editar se necessário.`,
                        { duration: 4000 }
                      );
                    }
                  } else if (cat && cat.has_levels) {
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

          {/* CHECKBOX INDEPENDENTE - CURSO POR NÍVEIS */}
          <div className="mt-4 p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="tem_niveis"
                  checked={formData.tem_niveis || false}
                  onCheckedChange={(checked) => {
                    handleChange('tem_niveis', checked);
                    if (!checked) {
                      setNiveis([]);
                      setQtdNiveis(0);
                      handleChange('preco_por_nivel', false);
                    }
                  }}
                  disabled={isLoading}
                />
                <Label htmlFor="tem_niveis" className="text-sm font-bold text-purple-800 cursor-pointer flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  Este curso é por níveis?
                </Label>
              </div>
            </div>
            <p className="text-xs text-purple-600/70 ml-8">
              {formData.tem_niveis
                ? 'O curso terá níveis (ex: Nível 1, Nível 2...). Configure-os na aba "Módulos".'
                : 'O curso terá duração única, sem divisão por níveis.'
              }
            </p>

            {/* PRICING MODE TOGGLE — só aparece quando tem_niveis=true */}
            {formData.tem_niveis && (
              <div className="ml-8 pt-2 border-t border-purple-100 space-y-2">
                <Label className="text-xs font-bold text-purple-700 flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  Modo de Precificação dos Níveis
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Preço Geral */}
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('preco_por_nivel', false);
                    }}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      !formData.preco_por_nivel
                        ? "border-green-500 bg-green-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                    disabled={isLoading}
                  >
                    <p className={cn("font-bold text-sm", !formData.preco_por_nivel ? "text-green-700" : "text-slate-600")}>
                      💰 Preço Geral
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Um preço único para todos os níveis</p>
                  </button>

                  {/* Preço por Nível */}
                  <button
                    type="button"
                    onClick={() => {
                      handleChange('preco_por_nivel', true);
                      handleChange('tipo_cobranca', 'mensal');
                    }}
                    className={cn(
                      "p-3 rounded-xl border-2 text-left transition-all",
                      formData.preco_por_nivel
                        ? "border-purple-500 bg-purple-50"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    )}
                    disabled={isLoading}
                  >
                    <p className={cn("font-bold text-sm", formData.preco_por_nivel ? "text-purple-700" : "text-slate-600")}>
                      📊 Preço por Nível
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Cada nível tem mensalidade e plano próprios</p>
                  </button>
                </div>
                {formData.preco_por_nivel && (
                  <p className="text-xs text-purple-600/80">
                    Define o preço de cada nível na aba "Módulos". Os valores abaixo servem de fallback para níveis sem preço definido.
                  </p>
                )}
              </div>
            )}
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
          {!formData.tem_niveis && (
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
              {/* Show info when category has default duration */}
              {categoriaSelecionada?.duration_months && categoriaSelecionada.duration_months > 0 && (
                <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
                  <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-600">
                    Duração padrão para <strong>{categoriaSelecionada.name}</strong>: {categoriaSelecionada.duration_months} meses.
                    <span className="text-blue-500"> Pode editar este valor se necessário.</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {formData.tem_niveis && categoriaSelecionada?.level_type !== 'named' && (
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

          {formData.tem_niveis && categoriaSelecionada?.level_type === 'named' && (
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
            <Label className="text-slate-600 font-semibold ml-1">Modalidade</Label>
            <Select
              value={formData.modalidade}
              onValueChange={(value: any) => handleChange('modalidade', value)}
              disabled={isLoading}
            >
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presencial">
                  <span className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Presencial
                  </span>
                </SelectItem>
                <SelectItem value="online">
                  <span className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    Online
                  </span>
                </SelectItem>
                <SelectItem value="hibrido">
                  <span className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Híbrido
                  </span>
                </SelectItem>
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

        {/* TIPO DE COBRANÇA — oculto quando preco_por_nivel=true (forçado mensal) */}
        {!(formData.tem_niveis && formData.preco_por_nivel) && (
          <div className="space-y-3">
            <Label className="text-slate-600 font-semibold ml-1">Tipo de Cobrança</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange('tipo_cobranca', 'mensal')}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  formData.tipo_cobranca === 'mensal'
                    ? "border-green-500 bg-green-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    formData.tipo_cobranca === 'mensal' ? "bg-green-500 text-white" : "bg-slate-100"
                  )}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "font-bold text-sm",
                      formData.tipo_cobranca === 'mensal' ? "text-green-700" : "text-slate-700"
                    )}>Mensal</p>
                    <p className="text-xs text-slate-500">Pagamento por mês</p>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChange('tipo_cobranca', 'preco_unico')}
                className={cn(
                  "p-4 rounded-xl border-2 text-left transition-all",
                  formData.tipo_cobranca === 'preco_unico'
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200 hover:border-slate-300"
                )}
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    formData.tipo_cobranca === 'preco_unico' ? "bg-blue-500 text-white" : "bg-slate-100"
                  )}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={cn(
                      "font-bold text-sm",
                      formData.tipo_cobranca === 'preco_unico' ? "text-blue-700" : "text-slate-700"
                    )}>Preço Único</p>
                    <p className="text-xs text-slate-500">Pagamento único total</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* MENSALIDADE — sempre visível quando mensal; muted quando preco_por_nivel=true (fallback) */}
          {(formData.tipo_cobranca === 'mensal' || (formData.tem_niveis && formData.preco_por_nivel)) && (
            <div className="space-y-2">
              <Label className={cn("font-semibold ml-1", formData.preco_por_nivel ? "text-slate-400" : "text-slate-600")}>
                {formData.preco_por_nivel
                  ? 'Mensalidade Padrão (fallback, MZN)'
                  : 'Mensalidade (MZN)'}
              </Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder={formData.preco_por_nivel ? 'Opcional — só se não definir por nível' : '0.00'}
                value={formData.mensalidade || ''}
                onChange={(e) => handleChange('mensalidade', parseFloat(e.target.value) || 0)}
                className={cn(
                  "h-12 rounded-xl",
                  errors.mensalidade && "border-red-500",
                  formData.preco_por_nivel && "border-dashed opacity-70"
                )}
                disabled={isLoading}
              />
              {formData.mensalidade > 0 && (
                <p className={cn("text-xs", formData.preco_por_nivel ? "text-slate-400" : "text-green-600")}>
                  {formatCurrency(formData.mensalidade)}/mês{formData.preco_por_nivel ? ' (fallback)' : ''}
                </p>
              )}
            </div>
          )}

          {/* PREÇO TOTAL — oculto quando preco_por_nivel=true */}
          {formData.tipo_cobranca === 'preco_unico' && !formData.preco_por_nivel && (
            <div className="space-y-2">
              <Label className="text-slate-600 font-semibold ml-1">Preço Total do Curso (MZN)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={formData.preco_total || ''}
                onChange={(e) => handleChange('preco_total', parseFloat(e.target.value) || 0)}
                className={cn("h-12 rounded-xl", errors.preco_total && "border-red-500")}
                disabled={isLoading}
              />
              {(formData.preco_total || 0) > 0 && (
                <p className="text-xs text-blue-600">{formatCurrency(formData.preco_total || 0)} (valor único)</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label className={cn("font-semibold ml-1", formData.tem_niveis ? "text-slate-400" : "text-slate-600")}>
              {formData.tem_niveis ? 'Taxa de Matrícula Padrão (Fallback, MZN)' : 'Taxa de Matrícula (MZN)'}
            </Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              placeholder={formData.tem_niveis ? 'Opcional — definida por nível em Módulos' : 'Insira o valor da taxa de matrícula'}
              value={formData.isento_matricula ? '' : (formData.taxa_matricula || '')}
              onChange={(e) => handleChange('taxa_matricula', parseFloat(e.target.value) || 0)}
              className={cn(
                "h-12 rounded-xl",
                errors.taxa_matricula && "border-red-500",
                formData.tem_niveis && "border-dashed opacity-70"
              )}
              disabled={isLoading || formData.isento_matricula}
            />
            {formData.tem_niveis && (
              <p className="text-xs text-slate-400">
                Cada nível define a sua taxa em "Módulos". Este valor é usado para níveis sem taxa definida.
              </p>
            )}
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
  );
}