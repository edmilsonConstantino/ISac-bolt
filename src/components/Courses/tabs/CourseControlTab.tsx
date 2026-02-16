import React from "react";
import { Settings, Sparkles } from "lucide-react";
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
  data_criacao?: string;
}

interface CourseControlTabProps {
  formData: Course;
  setFormData: React.Dispatch<React.SetStateAction<Course>>;
  isEditing: boolean;
  isLoading: boolean;
  categoriaSelecionada: Categoria | null;
  modules: Module[];
  niveis: any[];
  getTotalCargaHoraria: () => number;
  getTotalDuracaoNiveis: () => number;
}

export default function CourseControlTab({
  formData,
  setFormData,
  isEditing,
  isLoading,
  categoriaSelecionada,
  modules,
  niveis,
  getTotalCargaHoraria,
  getTotalDuracaoNiveis,
}: CourseControlTabProps) {

  const handleChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
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
              {formData.tem_niveis && niveis.length > 0
                ? `${getTotalDuracaoNiveis()} meses (${niveis.length} níveis)`
                : `${formData.duracao_valor} meses`
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Modalidade:</span>
            <span className="text-sm font-semibold">
              {formData.modalidade === 'presencial' && '🏢 Presencial'}
              {formData.modalidade === 'online' && '🌐 Online'}
              {formData.modalidade === 'hibrido' && '🔄 Híbrido'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">
              {formData.tipo_cobranca === 'mensal' ? 'Mensalidade:' : 'Preço Total:'}
            </span>
            <span className="text-sm font-semibold text-green-600">
              {formData.tipo_cobranca === 'mensal'
                ? `${formatCurrency(formData.mensalidade)}/mês`
                : formatCurrency(formData.preco_total || 0)
              }
            </span>
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
  );
}