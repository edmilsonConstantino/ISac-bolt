// src/components/Courses/CourseProfileModal.tsx - Modal de visualização para Academic Admin
// Usa ProfileModalBase para consistência visual com Teacher e Student modals

import { useState, useEffect } from "react";
import { ProfileModalBase, ProfileTab, PROFILE_MODAL_STYLES } from "@/components/shared/ProfileModalBase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Hash,
  Layers,
  Calendar,
  Building,
  Wifi,
  Monitor,
  DollarSign,
  GraduationCap,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react";
import { Categoria } from '@/types/CategoryTypes';

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
  regime?: 'laboral' | 'pos_laboral' | 'ambos';
  modalidade?: 'presencial' | 'online' | 'hibrido';
  tipo_cobranca?: 'mensal' | 'preco_unico';
  mensalidade: number;
  preco_total?: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  isento_matricula?: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  niveis?: { id: number; nome: string; duracao_meses?: number }[];
  modulos?: { id: string; nome_modulo: string; codigo_modulo: string; carga_horaria: number }[];
  data_criacao?: string;
}

interface CourseProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course | null;
}

export default function CourseProfileModal({
  isOpen,
  onClose,
  course,
}: CourseProfileModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
    }
  }, [isOpen]);

  if (!course) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getModalidadeInfo = (modalidade?: string) => {
    switch (modalidade) {
      case 'presencial': return { label: 'Presencial', icon: Building, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'online': return { label: 'Online', icon: Wifi, color: 'text-green-600 bg-green-50 border-green-200' };
      case 'hibrido': return { label: 'Híbrido', icon: Monitor, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      default: return { label: 'N/A', icon: Building, color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
  };

  const getRegimeLabel = (regime?: string) => {
    switch (regime) {
      case 'laboral': return 'Laboral';
      case 'pos_laboral': return 'Pós-Laboral';
      case 'ambos': return 'Laboral e Pós-Laboral';
      default: return 'N/A';
    }
  };

  const getTipoCursoLabel = (tipo?: string) => {
    switch (tipo) {
      case 'tecnico': return 'Técnico';
      case 'tecnico_superior': return 'Técnico Superior';
      case 'tecnico_profissional': return 'Técnico Profissional';
      case 'curta_duracao': return 'Curta Duração';
      default: return 'N/A';
    }
  };

  const modalidadeInfo = getModalidadeInfo(course.modalidade);
  const ModalidadeIcon = modalidadeInfo.icon;

  // ============================================================
  // DEFINIÇÃO DAS TABS
  // ============================================================
  const tabs: ProfileTab[] = [
    {
      id: 'info',
      label: 'Informações',
      icon: BookOpen,
      color: PROFILE_MODAL_STYLES.tabs.blue,
      content: (
        <div className="space-y-4">
          {/* Identificação do Curso */}
          <Card className={PROFILE_MODAL_STYLES.card.blue}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${PROFILE_MODAL_STYLES.cardTitle.blue}`}>
                <BookOpen className="h-4 w-4" />
                Identificação do Curso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Nome do Curso</p>
                  <p className="text-sm font-bold text-slate-800">{course.nome}</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-[#F5821F]/20">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Código</p>
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-[#F5821F]" />
                    <p className="text-sm font-bold font-mono text-[#F5821F]">{course.codigo}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Categoria</p>
                  <p className="text-sm font-semibold text-slate-700">{course.categoria?.name || 'Sem categoria'}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Tipo de Curso</p>
                  <p className="text-sm font-semibold text-slate-700">{getTipoCursoLabel(course.tipo_curso)}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Status</p>
                <Badge className={course.status === 'ativo' ? 'bg-emerald-500' : 'bg-slate-400'}>
                  {course.status === 'ativo' ? '✓ Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Regime e Duração */}
          <Card className={PROFILE_MODAL_STYLES.card.blue}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${PROFILE_MODAL_STYLES.cardTitle.blue}`}>
                <Calendar className="h-4 w-4" />
                Regime e Duração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                  <Calendar className="h-5 w-5 text-[#004B87] mx-auto mb-1" />
                  <p className="text-[10px] text-slate-600 font-semibold mb-1">Duração</p>
                  <p className="text-lg font-bold text-[#004B87]">{course.duracao_valor}</p>
                  <p className="text-[10px] text-slate-500">Meses</p>
                </div>
                <div className={`p-3 border-2 rounded-lg text-center ${modalidadeInfo.color}`}>
                  <ModalidadeIcon className="h-5 w-5 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-600 font-semibold mb-1">Modalidade</p>
                  <p className="text-sm font-bold">{modalidadeInfo.label}</p>
                </div>
                <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-lg text-center">
                  <GraduationCap className="h-5 w-5 text-slate-600 mx-auto mb-1" />
                  <p className="text-[10px] text-slate-600 font-semibold mb-1">Regime</p>
                  <p className="text-sm font-bold text-slate-700">{getRegimeLabel(course.regime)}</p>
                </div>
              </div>

              {/* Níveis */}
              {course.tem_niveis && (
                <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="h-4 w-4 text-purple-600" />
                    <p className="text-xs font-bold text-purple-700">Curso por Níveis</p>
                  </div>
                  {course.niveis && course.niveis.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {course.niveis.map((nivel, i) => (
                        <Badge key={i} variant="outline" className="border-purple-300 text-purple-700 text-xs">
                          {nivel.nome} {nivel.duracao_meses ? `(${nivel.duracao_meses}m)` : ''}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-purple-600">{course.qtd_niveis || 0} nível(is) configurado(s)</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'financeiro',
      label: 'Financeiro',
      icon: DollarSign,
      color: PROFILE_MODAL_STYLES.tabs.green,
      content: (
        <div className="space-y-4">
          {/* Valor Principal */}
          <Card className={PROFILE_MODAL_STYLES.card.green}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${PROFILE_MODAL_STYLES.cardTitle.green}`}>
                <DollarSign className="h-4 w-4" />
                Valores do Curso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tipo de Cobrança */}
              <div className="p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg text-center">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">
                  {course.tipo_cobranca === 'preco_unico' ? 'Preço Único' : 'Mensalidade'}
                </p>
                <div className="text-3xl font-bold text-green-600">
                  {course.tipo_cobranca === 'preco_unico'
                    ? formatCurrency(course.preco_total || 0)
                    : formatCurrency(course.mensalidade)
                  }
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {course.tipo_cobranca === 'preco_unico' ? 'Valor total do curso' : 'Por mês'}
                </p>
              </div>

              {/* Taxa de Matrícula */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-orange-50 border-2 border-[#F5821F]/20 rounded-lg">
                  <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-1">Taxa de Matrícula</p>
                  {course.isento_matricula ? (
                    <Badge className="bg-amber-500 text-xs">Isento</Badge>
                  ) : (
                    <p className="text-lg font-bold text-[#F5821F]">{formatCurrency(course.taxa_matricula)}</p>
                  )}
                </div>
                <div className="p-3 bg-slate-50 border-2 border-slate-200 rounded-lg">
                  <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-wider mb-1">Tipo de Cobrança</p>
                  <p className="text-sm font-bold text-slate-700">
                    {course.tipo_cobranca === 'preco_unico' ? 'Preço Único' : 'Mensal'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Configurações Financeiras */}
          <Card className={PROFILE_MODAL_STYLES.card.neutral}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center gap-2 ${PROFILE_MODAL_STYLES.cardTitle.blue}`}>
                <Info className="h-4 w-4" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200">
                  {course.propina_fixa ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Propina Fixa</p>
                    <p className="text-[10px] text-slate-500">
                      {course.propina_fixa ? 'Valor não varia' : 'Valor pode variar'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-slate-200">
                  {course.permite_bolsa ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Permite Bolsa</p>
                    <p className="text-[10px] text-slate-500">
                      {course.permite_bolsa ? 'Aceita bolsistas' : 'Sem bolsas'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Estimativa mensal (para preço único) */}
              {course.tipo_cobranca === 'mensal' && course.duracao_valor > 0 && (
                <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">Custo total estimado:</span>{' '}
                    <span className="text-[#004B87] font-bold">
                      {formatCurrency(course.mensalidade * course.duracao_valor)}
                    </span>
                    {' '}({course.duracao_valor} meses x {formatCurrency(course.mensalidade)})
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          {course.observacoes && (
            <Card className={PROFILE_MODAL_STYLES.card.neutral}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-slate-600 text-sm">
                  <Info className="h-4 w-4" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{course.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )
    }
  ];

  return (
    <ProfileModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={course.nome}
      headerIcon={BookOpen}
      headerSubtitle={`${course.codigo} • ${course.categoria?.name || 'Sem categoria'}`}
      customBadge={
        <Badge className={course.status === 'ativo' ? 'bg-emerald-500 text-[10px] px-2 py-0.5 border-0' : 'bg-slate-400 text-[10px] px-2 py-0.5 border-0'}>
          {course.status === 'ativo' ? '✓ Activo' : 'Inactivo'}
        </Badge>
      }
      isEditing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab)}
      showEditButton={false}
    />
  );
}
