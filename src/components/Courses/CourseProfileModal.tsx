// src/components/Courses/CourseProfileModal.tsx - Modal de visualização para Academic Admin
// Usa ProfileModalBase para consistência visual com Teacher e Student modals

import { useState, useEffect } from "react";
import { ProfileModalBase, ProfileTab, PROFILE_MODAL_STYLES } from "@/components/shared/ProfileModalBase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Edit2,
  Save,
  X,
  Plus,
} from "lucide-react";
import { Categoria, Nivel } from '@/types/CategoryTypes';
import nivelService from '@/services/nivelService';
import { toast } from "sonner";

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
  niveis?: Nivel[];
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

  // Level management state
  const [niveis, setNiveis] = useState<Nivel[]>([]);
  const [editingNivelId, setEditingNivelId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Nivel>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNivel, setNewNivel] = useState<Partial<Nivel>>({ nome: '', duracao_meses: 4, mensalidade: null, enrollment_fee: null });
  const [savingNivel, setSavingNivel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('info');
      setEditingNivelId(null);
      setShowAddForm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && course?.id && course.tem_niveis) {
      nivelService.listarNiveisPorCurso(course.id)
        .then(setNiveis)
        .catch(() => {});
    }
  }, [isOpen, course?.id, course?.tem_niveis]);

  const handleStartEdit = (nivel: Nivel) => {
    setEditingNivelId(nivel.id!);
    setEditForm({ nome: nivel.nome, duracao_meses: nivel.duracao_meses, mensalidade: nivel.mensalidade, enrollment_fee: nivel.enrollment_fee });
  };

  const handleSaveEdit = async (nivelId: number) => {
    setSavingNivel(true);
    try {
      await nivelService.atualizarNivel(nivelId, editForm);
      setNiveis(prev => prev.map(n => n.id === nivelId ? { ...n, ...editForm } : n));
      setEditingNivelId(null);
      toast.success('Nível atualizado!');
    } catch {
      toast.error('Erro ao atualizar nível');
    } finally {
      setSavingNivel(false);
    }
  };

  const handleAddNivel = async () => {
    if (!newNivel.nome?.trim() || !course?.id) return;
    setSavingNivel(true);
    try {
      const lastNivel = niveis[niveis.length - 1];
      const created = await nivelService.criarNivel({
        curso_id:              course.id,
        nivel:                 (lastNivel?.nivel ?? 0) + 1,
        nome:                  newNivel.nome,
        duracao_meses:         newNivel.duracao_meses ?? 4,
        ordem:                 (lastNivel?.ordem ?? 0) + 1,
        prerequisito_nivel_id: lastNivel?.id ?? null,
        mensalidade:           newNivel.mensalidade ?? null,
        enrollment_fee:        newNivel.enrollment_fee ?? null,
        status:                'ativo',
      });
      setNiveis(prev => [...prev, created]);
      setNewNivel({ nome: '', duracao_meses: 4, mensalidade: null, enrollment_fee: null });
      setShowAddForm(false);
      toast.success('Nível adicionado!');
    } catch {
      toast.error('Erro ao adicionar nível');
    } finally {
      setSavingNivel(false);
    }
  };

  const handleDeactivateNivel = async (nivelId: number) => {
    setSavingNivel(true);
    try {
      await nivelService.deletarNivel(nivelId);
      setNiveis(prev => prev.filter(n => n.id !== nivelId));
      toast.success('Nível desactivado!');
    } catch {
      toast.error('Erro ao desactivar nível');
    } finally {
      setSavingNivel(false);
    }
  };

  const formatCurrencyShort = (val: number | null | undefined) =>
    val != null ? new Intl.NumberFormat('pt-MZ', { minimumFractionDigits: 0 }).format(val) + ' Kz' : '—';

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
    },
    // Níveis tab — only for courses with levels
    ...(course.tem_niveis ? [{
      id: 'niveis',
      label: 'Níveis',
      icon: Layers,
      color: PROFILE_MODAL_STYLES.tabs.blue,
      content: (
        <div className="space-y-4">
          <Card className={PROFILE_MODAL_STYLES.card.blue}>
            <CardHeader className="pb-3">
              <CardTitle className={`flex items-center justify-between ${PROFILE_MODAL_STYLES.cardTitle.blue}`}>
                <span className="flex items-center gap-2 text-sm">
                  <Layers className="h-4 w-4" />
                  Níveis do Curso
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddForm(v => !v)}
                  className="h-7 text-xs border-[#004B87] text-[#004B87] hover:bg-blue-50"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo Nível
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Add form */}
              {showAddForm && (
                <div className="p-3 bg-blue-50 border-b border-blue-200 grid grid-cols-5 gap-2 items-end">
                  <div className="col-span-2">
                    <p className="text-[10px] text-slate-500 font-semibold mb-1">Nome</p>
                    <Input
                      value={newNivel.nome ?? ''}
                      onChange={e => setNewNivel(p => ({ ...p, nome: e.target.value }))}
                      placeholder="Ex: Avançado"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold mb-1">Meses</p>
                    <Input type="number" min="1" value={newNivel.duracao_meses ?? ''} onChange={e => setNewNivel(p => ({ ...p, duracao_meses: Number(e.target.value) }))} className="h-8 text-sm" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold mb-1">Mensalidade</p>
                    <Input type="number" min="0" value={newNivel.mensalidade ?? ''} onChange={e => setNewNivel(p => ({ ...p, mensalidade: e.target.value === '' ? null : Number(e.target.value) }))} placeholder="Padrão" className="h-8 text-sm" />
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={handleAddNivel} disabled={savingNivel || !newNivel.nome?.trim()} className="h-8 bg-[#004B87] hover:bg-[#003868] text-xs">
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)} className="h-8 text-xs">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
              {/* Levels table */}
              {niveis.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">#</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Nome</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Meses</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Mensalidade</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Taxa Matr.</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Acções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {niveis.map(nivel => (
                      <tr key={nivel.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-2">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">{nivel.nivel}</span>
                        </td>
                        {editingNivelId === nivel.id ? (
                          <>
                            <td className="px-3 py-2"><Input value={editForm.nome ?? ''} onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} className="h-7 text-xs" /></td>
                            <td className="px-3 py-2"><Input type="number" min="1" value={editForm.duracao_meses ?? ''} onChange={e => setEditForm(p => ({ ...p, duracao_meses: Number(e.target.value) }))} className="h-7 text-xs w-16" /></td>
                            <td className="px-3 py-2"><Input type="number" min="0" value={editForm.mensalidade ?? ''} onChange={e => setEditForm(p => ({ ...p, mensalidade: e.target.value === '' ? null : Number(e.target.value) }))} placeholder="Padrão" className="h-7 text-xs w-24" /></td>
                            <td className="px-3 py-2"><Input type="number" min="0" value={editForm.enrollment_fee ?? ''} onChange={e => setEditForm(p => ({ ...p, enrollment_fee: e.target.value === '' ? null : Number(e.target.value) }))} placeholder="0" className="h-7 text-xs w-24" /></td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button size="sm" onClick={() => handleSaveEdit(nivel.id!)} disabled={savingNivel} className="h-7 w-7 p-0 bg-green-600 hover:bg-green-700"><Save className="h-3 w-3" /></Button>
                                <Button size="sm" variant="outline" onClick={() => setEditingNivelId(null)} className="h-7 w-7 p-0"><X className="h-3 w-3" /></Button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-3 py-2 text-sm font-semibold text-slate-700">{nivel.nome}</td>
                            <td className="px-3 py-2 text-sm text-slate-600">{nivel.duracao_meses}m</td>
                            <td className="px-3 py-2 text-sm text-slate-600">
                              {nivel.mensalidade != null ? formatCurrencyShort(nivel.mensalidade) : <span className="text-xs text-slate-400 italic">Padrão do curso</span>}
                            </td>
                            <td className="px-3 py-2 text-sm text-slate-600">
                              {nivel.enrollment_fee != null ? formatCurrencyShort(nivel.enrollment_fee) : <span className="text-xs text-slate-400 italic">Padrão do curso</span>}
                            </td>
                            <td className="px-3 py-2 text-right">
                              <div className="flex gap-1 justify-end">
                                <Button size="sm" variant="outline" onClick={() => handleStartEdit(nivel)} className="h-7 w-7 p-0 border-blue-200 text-blue-600 hover:bg-blue-50"><Edit2 className="h-3 w-3" /></Button>
                                <Button size="sm" variant="outline" onClick={() => handleDeactivateNivel(nivel.id!)} disabled={savingNivel} className="h-7 w-7 p-0 border-red-200 text-red-500 hover:bg-red-50"><X className="h-3 w-3" /></Button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-400 text-sm">
                  Nenhum nível configurado. Clique em "Novo Nível" para adicionar.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    } as ProfileTab] : [])
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
