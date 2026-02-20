// src/components/Classes/ClassSettingsModal.tsx
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BookOpen, GraduationCap, Shield, ClipboardList,
  X, Sun, Sunset, Moon, Clock, MapPin, Users,
  Calendar, Hash, CheckCircle, XCircle, Pause,
  Trophy, AlertTriangle, Lock, Unlock, Save,
  ChevronDown, Loader2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import teacherService from "@/services/teacherService";

// ============ INTERFACES ============

interface GradePeriod {
  id?: number;
  turma_id: number;
  period_number: number;
  start_date: string;
  end_date: string;
  is_locked: number;
  status?: 'open' | 'closed' | 'scheduled' | 'locked';
}

interface Teacher {
  id: number;
  nome: string;
  email: string;
  especialidade?: string;
  status: string;
}

interface ClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
  currentUserRole: 'admin' | 'academic_admin' | 'teacher';
  onClassUpdated: () => void;
}

// ============ COMPONENT ============

export function ClassSettingsModal({
  isOpen,
  onClose,
  classData,
  currentUserRole,
  onClassUpdated
}: ClassSettingsModalProps) {

  const [activeTab, setActiveTab] = useState<'info' | 'teacher' | 'status' | 'grades'>('info');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [gradePeriods, setGradePeriods] = useState<GradePeriod[]>([]);
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingPeriods, setIsLoadingPeriods] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    isOpen: boolean;
    targetStatus: string;
    title: string;
    message: string;
    color: 'green' | 'yellow' | 'blue' | 'red';
  } | null>(null);
  const [showTeacherSelect, setShowTeacherSelect] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string>('ativo');

  const isAdmin = currentUserRole === 'admin';
  const API_URL = 'http://localhost/API-LOGIN/api';

  // ============ DATA LOADING ============

  useEffect(() => {
    if (isOpen && classData) {
      setActiveTab('info');
      setSelectedTeacherId(classData.professor_id || classData.teacher_id || null);
      setStatusConfirmModal(null);
      setShowTeacherSelect(false);
      // Inicializar status local
      const normalizeStatus = (s: string) => {
        const map: Record<string, string> = { active: 'ativo', inactive: 'inativo', completed: 'concluido' };
        return map[s] || s || 'ativo';
      };
      setCurrentStatus(normalizeStatus(classData.status || ''));
      loadGradePeriods();
    }
  }, [isOpen, classData]);

  useEffect(() => {
    if (isOpen && teachers.length === 0) {
      loadTeachers();
    }
  }, [isOpen, teachers.length]);

  useEffect(() => {
    if (activeTab === 'teacher' && isAdmin && teachers.length === 0) {
      loadTeachers();
    }
  }, [activeTab]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const loadTeachers = async () => {
    setIsLoadingTeachers(true);
    try {
      const data = await teacherService.getAll();
      setTeachers(data.filter((t: any) => t.status === 'ativo'));
    } catch (error) {
      console.error('Erro ao carregar professores:', error);
    } finally {
      setIsLoadingTeachers(false);
    }
  };

  const loadGradePeriods = async () => {
    if (!classData?.id) return;
    setIsLoadingPeriods(true);
    try {
      const response = await fetch(
        `${API_URL}/turmas.php?action=get_grade_periods&turma_id=${classData.id}`,
        { headers: getAuthHeaders() }
      );
      const result = await response.json();
      if (result.success) {
        setGradePeriods(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar períodos de notas:', error);
    } finally {
      setIsLoadingPeriods(false);
    }
  };

  // ============ ACTIONS ============

  const handleChangeTeacher = async () => {
    if (!selectedTeacherId || !classData?.id) return;
    setIsSaving(true);
    try {
      const nd = getNormalizedData();
      const response = await fetch(`${API_URL}/turmas.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: nd.id,
          codigo: nd.codigo,
          nome: nd.nome,
          professor_id: selectedTeacherId,
          semestre: nd.semestre,
          ano_letivo: nd.ano_letivo,
          duracao_meses: nd.duracao_meses,
          capacidade_maxima: nd.capacidade_maxima,
          sala: nd.sala,
          dias_semana: nd.dias_semana,
          turno: nd.turno,
          horario_inicio: nd.horario_inicio,
          horario_fim: nd.horario_fim,
          data_inicio: nd.data_inicio,
          data_fim: nd.data_fim,
          carga_horaria: nd.carga_horaria,
          creditos: nd.creditos,
          observacoes: nd.observacoes,
          status: nd.status
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Docente alterado com sucesso!');
        setShowTeacherSelect(false);
        onClassUpdated();
      } else {
        toast.error(result.message || 'Erro ao alterar docente');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeStatus = async (newStatus: string) => {
    if (!classData?.id) return;
    setIsSaving(true);
    try {
      const nd = getNormalizedData();
      const response = await fetch(`${API_URL}/turmas.php`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: nd.id,
          codigo: nd.codigo,
          nome: nd.nome,
          professor_id: nd.professor_id,
          semestre: nd.semestre,
          ano_letivo: nd.ano_letivo,
          duracao_meses: nd.duracao_meses,
          capacidade_maxima: nd.capacidade_maxima,
          sala: nd.sala,
          dias_semana: nd.dias_semana,
          turno: nd.turno,
          horario_inicio: nd.horario_inicio,
          horario_fim: nd.horario_fim,
          data_inicio: nd.data_inicio,
          data_fim: nd.data_fim,
          carga_horaria: nd.carga_horaria,
          creditos: nd.creditos,
          observacoes: nd.observacoes,
          status: newStatus
        })
      });
      const result = await response.json();
      if (result.success) {
        const statusLabels: Record<string, string> = {
          ativo: 'activada', inativo: 'suspensa', concluido: 'concluída', cancelado: 'cancelada'
        };
        toast.success(`Turma ${statusLabels[newStatus] || newStatus} com sucesso!`);
        setCurrentStatus(newStatus); // Actualizar estado local imediatamente
        setStatusConfirmModal(null);
        onClassUpdated();
      } else {
        toast.error(result.message || 'Erro ao alterar status');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGradePeriods = async () => {
    if (!classData?.id) return;

    const validPeriods = gradePeriods.filter(p => p.start_date && p.end_date);
    if (validPeriods.length === 0) {
      toast.error('Configure pelo menos um período de avaliação');
      return;
    }

    // Validar datas
    for (const p of validPeriods) {
      if (p.start_date > p.end_date) {
        toast.error(`${p.period_number}ª Avaliação: data de início deve ser antes da data de fim`);
        return;
      }
    }

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/turmas.php?action=save_grade_periods`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          turma_id: classData.id,
          periods: validPeriods.map(p => ({
            period_number: p.period_number,
            start_date: p.start_date,
            end_date: p.end_date,
            is_locked: p.is_locked || 0
          }))
        })
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || 'Períodos guardados!');
        loadGradePeriods();
      } else {
        toast.error(result.message || 'Erro ao guardar períodos');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsSaving(false);
    }
  };

  const updatePeriod = (periodNumber: number, field: string, value: any) => {
    setGradePeriods(prev => {
      const existing = prev.find(p => p.period_number === periodNumber);
      if (existing) {
        return prev.map(p => p.period_number === periodNumber ? { ...p, [field]: value } : p);
      } else {
        return [...prev, {
          turma_id: classData?.id,
          period_number: periodNumber,
          start_date: '',
          end_date: '',
          is_locked: 0,
          [field]: value
        }];
      }
    });
  };

  // ============ HELPERS ============

  // Normalize classData to Portuguese field names for API calls
  const getNormalizedData = () => ({
    id: classData.id,
    codigo: classData.codigo || classData.code || '',
    nome: classData.nome || classData.name || '',
    curso_id: classData.curso_id || classData.curso || '',
    turno: classData.turno || classData.schedule || 'manha',
    horario_inicio: classData.horario_inicio || classData.start_time || '',
    horario_fim: classData.horario_fim || classData.end_time || '',
    sala: classData.sala || classData.room || '',
    vagas_ocupadas: classData.vagas_ocupadas || classData.students || 0,
    capacidade_maxima: classData.capacidade_maxima || classData.capacity || 30,
    ano_letivo: classData.ano_letivo || new Date().getFullYear(),
    data_inicio: classData.data_inicio || classData.start_date || '',
    data_fim: classData.data_fim || classData.end_date || '',
    professor_id: classData.professor_id || classData.teacher_id || null,
    professor_nome: classData.professor_nome || classData.teacher_name || '',
    observacoes: classData.observacoes || classData.description || '',
    status: (() => {
      const s = classData.status || 'ativo';
      const map: Record<string, string> = { active: 'ativo', inactive: 'inativo', completed: 'concluido' };
      return map[s] || s;
    })(),
    semestre: classData.semestre || '',
    duracao_meses: classData.duracao_meses || classData.duration || 0,
    carga_horaria: classData.carga_horaria || '',
    creditos: classData.creditos || 0,
    dias_semana: classData.dias_semana || classData.schedule_days || '',
  });

  const getTurnoInfo = (turno: string) => {
    const map: Record<string, { label: string; icon: any; color: string }> = {
      manha: { label: 'Manhã', icon: Sun, color: 'text-amber-500' },
      tarde: { label: 'Tarde', icon: Sunset, color: 'text-orange-500' },
      noite: { label: 'Noite', icon: Moon, color: 'text-indigo-500' }
    };
    return map[turno] || map.manha;
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      ativo: { label: 'Activa', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      inativo: { label: 'Suspensa', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
      concluido: { label: 'Concluída', color: 'text-blue-700', bg: 'bg-blue-100', icon: Trophy },
      cancelado: { label: 'Cancelada', color: 'text-red-700', bg: 'bg-red-100', icon: XCircle }
    };
    return map[status] || map.ativo;
  };

  const getPeriodStatus = (period: GradePeriod | undefined) => {
    if (!period || !period.start_date || !period.end_date) {
      return { label: 'Não configurado', color: 'text-slate-500', bg: 'bg-slate-100', icon: Clock };
    }
    if (period.is_locked) {
      return { label: 'Bloqueado', color: 'text-red-700', bg: 'bg-red-100', icon: Lock };
    }
    const today = new Date().toISOString().split('T')[0];
    if (today < period.start_date) {
      return { label: 'Agendado', color: 'text-blue-700', bg: 'bg-blue-100', icon: Calendar };
    }
    if (today >= period.start_date && today <= period.end_date) {
      return { label: 'Aberto', color: 'text-green-700', bg: 'bg-green-100', icon: Unlock };
    }
    return { label: 'Fechado', color: 'text-red-700', bg: 'bg-red-100', icon: Lock };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-MZ', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  if (!classData) return null;

  // ============ NORMALIZE DATA ============
  // classService.mapAPIToReact() returns English field names,
  // raw API returns Portuguese. Handle both.
  const normalizeStatus = (s: string) => {
    const map: Record<string, string> = { active: 'ativo', inactive: 'inativo', completed: 'concluido' };
    return map[s] || s || 'ativo';
  };

  const d = {
    id: classData.id,
    codigo: classData.codigo || classData.code || '',
    nome: classData.nome || classData.name || '',
    curso_id: classData.curso_id || classData.curso || '',
    turno: classData.turno || classData.schedule || 'manha',
    horario_inicio: classData.horario_inicio || classData.start_time || '',
    horario_fim: classData.horario_fim || classData.end_time || '',
    sala: classData.sala || classData.room || '',
    vagas_ocupadas: classData.vagas_ocupadas || classData.students || 0,
    capacidade_maxima: classData.capacidade_maxima || classData.capacity || 30,
    ano_letivo: classData.ano_letivo || new Date().getFullYear(),
    data_inicio: classData.data_inicio || classData.start_date || '',
    data_fim: classData.data_fim || classData.end_date || '',
    professor_id: classData.professor_id || classData.teacher_id || null,
    professor_nome: classData.professor_nome || classData.teacher_name || '',
    observacoes: classData.observacoes || classData.description || '',
    status: normalizeStatus(classData.status || ''),
    semestre: classData.semestre || '',
    duracao_meses: classData.duracao_meses || classData.duration || 0,
    carga_horaria: classData.carga_horaria || '',
    creditos: classData.creditos || 0,
    dias_semana: classData.dias_semana || classData.schedule_days || '',
  };

  const currentTeacher = teachers.find(t => t.id === (selectedTeacherId || d.professor_id));

  const turno = getTurnoInfo(d.turno);
  const statusInfo = getStatusInfo(currentStatus);
  const StatusIcon = statusInfo.icon;
  const TurnoIcon = turno.icon;

  // ============ TABS CONFIG ============

  const tabs = [
    { id: 'info' as const, label: 'Informações', sub: 'Dados da Turma', icon: BookOpen },
    { id: 'teacher' as const, label: 'Docente', sub: 'Professor Atribuído', icon: GraduationCap },
    { id: 'status' as const, label: 'Status', sub: 'Estado da Turma', icon: Shield },
    { id: 'grades' as const, label: 'Notas', sub: 'Períodos de Avaliação', icon: ClipboardList },
  ];

  // ============ RENDER ============

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose} modal={!statusConfirmModal?.isOpen}>
      <DialogContent
        className="max-w-[900px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh]"
        style={statusConfirmModal?.isOpen ? { pointerEvents: 'none' } : undefined}
      >
        <DialogTitle className="sr-only">Configurações da Turma</DialogTitle>

        <div className="flex h-[80vh]">
          {/* ====== SIDEBAR ====== */}
          <div className="w-[240px] bg-gradient-to-b from-[#004B87] to-[#003366] flex flex-col flex-shrink-0">
            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 bg-white/15 rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Configurações</h3>
                  <p className="text-blue-200 text-[10px] uppercase tracking-widest">Turma</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-lg px-3 py-2 mt-3">
                <p className="text-white text-xs font-bold truncate">{d.nome}</p>
                <p className="text-blue-200 text-[10px] font-mono">{d.codigo}</p>
              </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-1.5">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-[#F5821F] text-white shadow-lg shadow-orange-900/30"
                        : "text-blue-100 hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{tab.label}</p>
                      <p className={cn("text-[10px]", isActive ? "text-orange-100" : "text-blue-300")}>
                        {tab.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Role indicator */}
            <div className="px-4 pb-4">
              <div className={cn(
                "rounded-lg px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wider",
                isAdmin
                  ? "bg-green-500/20 text-green-200 border border-green-400/30"
                  : "bg-yellow-500/20 text-yellow-200 border border-yellow-400/30"
              )}>
                {isAdmin ? 'Super Admin' : 'Admin Académico'}
              </div>
            </div>
          </div>

          {/* ====== CONTENT ====== */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#004B87]">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-xs text-slate-500">
                  {tabs.find(t => t.id === activeTab)?.sub}
                </p>
              </div>
              <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto px-8 py-6">

              {/* ====== ABA 1: INFORMAÇÕES ====== */}
              {activeTab === 'info' && (
                <div className="space-y-6">
                  {/* Status badge */}
                  <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full", statusInfo.bg)}>
                    <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
                    <span className={cn("text-sm font-bold", statusInfo.color)}>{statusInfo.label}</span>
                  </div>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <InfoField label="Código" value={d.codigo} icon={Hash} />
                    <InfoField label="Nome" value={d.nome} icon={BookOpen} />
                    <InfoField label="Curso" value={d.curso_id} icon={GraduationCap} />
                    <InfoField
                      label="Turno"
                      value={turno.label}
                      icon={TurnoIcon}
                      iconColor={turno.color}
                    />
                    <InfoField
                      label="Horário"
                      value={`${d.horario_inicio?.substring(0, 5) || '--:--'} - ${d.horario_fim?.substring(0, 5) || '--:--'}`}
                      icon={Clock}
                    />
                    <InfoField label="Sala" value={d.sala || 'Não definida'} icon={MapPin} />
                    <InfoField
                      label="Capacidade"
                      value={`${d.vagas_ocupadas} / ${d.capacidade_maxima} alunos`}
                      icon={Users}
                    />
                    <InfoField
                      label="Ano Lectivo"
                      value={d.ano_letivo?.toString()}
                      icon={Calendar}
                    />
                    <InfoField
                      label="Início das Aulas"
                      value={formatDate(d.data_inicio)}
                      icon={Calendar}
                    />
                    <InfoField
                      label="Fim das Aulas"
                      value={formatDate(d.data_fim)}
                      icon={Calendar}
                    />
                  </div>

                  {d.observacoes && (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-2">Observações</p>
                      <p className="text-sm text-slate-700">{d.observacoes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ====== ABA 2: DOCENTE ====== */}
              {activeTab === 'teacher' && (
                <div className="space-y-6">
                  {/* Docente actual */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                    <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-4">Docente Actual</p>
                    {d.professor_nome || d.professor_id ? (
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-xl">
                            {(d.professor_nome || currentTeacher?.nome || 'P').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[#004B87]">
                            {d.professor_nome || currentTeacher?.nome || `Professor ID: ${d.professor_id}`}
                          </h3>
                          {currentTeacher && (
                            <>
                              <p className="text-sm text-slate-500">{currentTeacher.email}</p>
                              {currentTeacher.especialidade && (
                                <Badge className="mt-1 bg-blue-100 text-blue-700 border-0 text-[10px]">
                                  {currentTeacher.especialidade}
                                </Badge>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <GraduationCap className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-500 text-sm">Nenhum docente atribuído</p>
                      </div>
                    )}
                  </div>

                  {/* Trocar docente - apenas admin */}
                  {isAdmin && (
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                        Trocar Docente
                      </p>

                      {!showTeacherSelect ? (
                        <Button
                          onClick={() => {
                            setShowTeacherSelect(true);
                            if (teachers.length === 0) loadTeachers();
                          }}
                          variant="outline"
                          className="w-full h-12 border-2 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white font-bold"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Seleccionar Novo Docente
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          {isLoadingTeachers ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="h-6 w-6 animate-spin text-[#004B87]" />
                            </div>
                          ) : (
                            <>
                              <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-xl p-2">
                                {teachers.map(teacher => (
                                  <button
                                    key={teacher.id}
                                    onClick={() => setSelectedTeacherId(teacher.id)}
                                    className={cn(
                                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-left",
                                      selectedTeacherId === teacher.id
                                        ? "bg-[#004B87] text-white"
                                        : "hover:bg-slate-50 text-slate-700"
                                    )}
                                  >
                                    <div className={cn(
                                      "h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0",
                                      selectedTeacherId === teacher.id
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 text-slate-600"
                                    )}>
                                      {teacher.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm truncate">{teacher.nome}</p>
                                      <p className={cn("text-[10px] truncate",
                                        selectedTeacherId === teacher.id ? "text-blue-200" : "text-slate-400"
                                      )}>
                                        {teacher.especialidade || teacher.email}
                                      </p>
                                    </div>
                                    {selectedTeacherId === teacher.id && (
                                      <CheckCircle className="h-5 w-5 text-green-300 flex-shrink-0" />
                                    )}
                                  </button>
                                ))}
                                {teachers.length === 0 && (
                                  <p className="text-center py-4 text-slate-400 text-sm">Nenhum professor activo encontrado</p>
                                )}
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setShowTeacherSelect(false);
                                    setSelectedTeacherId(d.professor_id || null);
                                  }}
                                  className="flex-1"
                                >
                                  Cancelar
                                </Button>
                                <Button
                                  onClick={handleChangeTeacher}
                                  disabled={!selectedTeacherId || selectedTeacherId === d.professor_id || isSaving}
                                  className="flex-1 bg-[#004B87] hover:bg-[#003A6B] text-white"
                                >
                                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                  Confirmar Troca
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!isAdmin && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Apenas o Super Admin pode alterar o docente da turma.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ====== ABA 3: STATUS ====== */}
              {activeTab === 'status' && (
                <div className="space-y-6">
                  {/* Status actual */}
                  <div className={cn("rounded-2xl p-6 border-2", statusInfo.bg, `border-current/20`)}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70">Status Actual</p>
                    <div className="flex items-center gap-3">
                      <StatusIcon className={cn("h-8 w-8", statusInfo.color)} />
                      <h3 className={cn("text-2xl font-bold", statusInfo.color)}>{statusInfo.label}</h3>
                    </div>
                  </div>

                  {/* Acções de status - apenas admin */}
                  {isAdmin ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alterar Status</p>

                      {currentStatus !== 'ativo' && (
                        <StatusButton
                          label="Activar Turma"
                          description="A turma volta a estar activa e operacional"
                          icon={CheckCircle}
                          color="green"
                          onClick={() => setStatusConfirmModal({
                            isOpen: true,
                            targetStatus: 'ativo',
                            title: 'Activar Turma',
                            message: 'Tem certeza que deseja activar esta turma? A turma voltará a estar activa e operacional.',
                            color: 'green'
                          })}
                          disabled={isSaving}
                        />
                      )}
                      {currentStatus !== 'inativo' && (
                        <StatusButton
                          label="Suspender Turma"
                          description="A turma fica temporariamente suspensa. Pode ser reactivada depois."
                          icon={Pause}
                          color="yellow"
                          onClick={() => setStatusConfirmModal({
                            isOpen: true,
                            targetStatus: 'inativo',
                            title: 'Suspender Turma',
                            message: 'Tem certeza que deseja suspender esta turma? A turma ficará temporariamente suspensa, mas pode ser reactivada depois.',
                            color: 'yellow'
                          })}
                          disabled={isSaving}
                        />
                      )}
                      {currentStatus !== 'concluido' && (
                        <StatusButton
                          label="Declarar Concluída"
                          description="A turma terminou o seu ciclo lectivo com sucesso"
                          icon={Trophy}
                          color="blue"
                          onClick={() => setStatusConfirmModal({
                            isOpen: true,
                            targetStatus: 'concluido',
                            title: 'Declarar Turma como Concluída',
                            message: 'Tem certeza que deseja declarar esta turma como concluída? Isto indica que a turma terminou o seu ciclo lectivo com sucesso.',
                            color: 'blue'
                          })}
                          disabled={isSaving}
                        />
                      )}
                      {currentStatus !== 'cancelado' && (
                        <StatusButton
                          label="Cancelar Turma"
                          description="A turma é cancelada definitivamente"
                          icon={XCircle}
                          color="red"
                          onClick={() => setStatusConfirmModal({
                            isOpen: true,
                            targetStatus: 'cancelado',
                            title: 'Cancelar Turma',
                            message: 'Tem certeza que deseja cancelar esta turma? Esta acção é definitiva e os estudantes matriculados podem ser afectados.',
                            color: 'red'
                          })}
                          disabled={isSaving}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Apenas o Super Admin pode alterar o status da turma.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ====== ABA 4: NOTAS ====== */}
              {activeTab === 'grades' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">Períodos de Avaliação</h3>
                      <p className="text-xs text-slate-500">
                        {isAdmin
                          ? 'Defina os períodos em que os docentes podem lançar notas'
                          : 'Visualize os períodos de lançamento de notas'}
                      </p>
                    </div>
                    {isLoadingPeriods && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
                  </div>

                  {/* 4 period cards */}
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(num => {
                      const period = gradePeriods.find(p => p.period_number === num);
                      const pStatus = getPeriodStatus(period);
                      const PIcon = pStatus.icon;

                      return (
                        <div key={num} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                          {/* Period header */}
                          <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">{num}</span>
                              </div>
                              <h4 className="font-bold text-sm text-slate-800">{num}ª Avaliação</h4>
                            </div>
                            <div className={cn("flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", pStatus.bg)}>
                              <PIcon className={cn("h-3.5 w-3.5", pStatus.color)} />
                              <span className={pStatus.color}>{pStatus.label}</span>
                            </div>
                          </div>

                          {/* Period body */}
                          <div className="p-5">
                            {isAdmin ? (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                                    Data de Início
                                  </label>
                                  <input
                                    type="date"
                                    value={period?.start_date || ''}
                                    onChange={e => updatePeriod(num, 'start_date', e.target.value)}
                                    className="w-full h-10 px-3 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                                    Data Limite
                                  </label>
                                  <input
                                    type="date"
                                    value={period?.end_date || ''}
                                    onChange={e => updatePeriod(num, 'end_date', e.target.value)}
                                    className="w-full h-10 px-3 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Início</p>
                                  <p className="text-sm font-semibold text-slate-700 mt-1">
                                    {formatDate(period?.start_date || '')}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Data Limite</p>
                                  <p className="text-sm font-semibold text-slate-700 mt-1">
                                    {formatDate(period?.end_date || '')}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Lock toggle - admin only */}
                            {isAdmin && period?.start_date && period?.end_date && (
                              <div className="mt-4 pt-3 border-t border-slate-100">
                                <button
                                  onClick={() => updatePeriod(num, 'is_locked', period?.is_locked ? 0 : 1)}
                                  className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                                    period?.is_locked
                                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                                      : "bg-green-100 text-green-700 hover:bg-green-200"
                                  )}
                                >
                                  {period?.is_locked
                                    ? <><Lock className="h-3.5 w-3.5" /> Bloqueado - Clique para desbloquear</>
                                    : <><Unlock className="h-3.5 w-3.5" /> Desbloqueado - Clique para bloquear</>
                                  }
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save button - admin only */}
                  {isAdmin && (
                    <Button
                      onClick={handleSaveGradePeriods}
                      disabled={isSaving}
                      className="w-full h-12 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-bold rounded-xl shadow-lg"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                      Guardar Períodos de Avaliação
                    </Button>
                  )}

                  {!isAdmin && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                      <p className="text-xs text-yellow-700 flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        Apenas o Super Admin pode configurar os períodos de lançamento de notas.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    {/* ====== MODAL DE CONFIRMAÇÃO DE STATUS (via Portal) ====== */}
    {statusConfirmModal?.isOpen && createPortal(
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        style={{ zIndex: 99999, pointerEvents: 'auto' }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setStatusConfirmModal(null);
        }}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full animate-in zoom-in-95 duration-200"
          style={{ pointerEvents: 'auto' }}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={cn(
            "px-6 py-5 text-white",
            statusConfirmModal.color === 'green' && "bg-gradient-to-r from-green-500 to-green-600",
            statusConfirmModal.color === 'yellow' && "bg-gradient-to-r from-yellow-500 to-yellow-600",
            statusConfirmModal.color === 'blue' && "bg-gradient-to-r from-blue-500 to-blue-600",
            statusConfirmModal.color === 'red' && "bg-gradient-to-r from-red-500 to-red-600"
          )}>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{statusConfirmModal.title}</h3>
                <p className="text-white/80 text-sm">Confirmar alteração de status</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6">
            <div className="bg-slate-50 rounded-xl p-4 mb-4">
              <p className="font-bold text-lg text-[#004B87] text-center">{d.nome}</p>
              <p className="text-sm text-slate-500 text-center">{d.codigo}</p>
            </div>

            <p className="text-slate-600 text-center mb-6">
              {statusConfirmModal.message}
            </p>

            {/* Botões - usando elementos nativos para garantir eventos */}
            <div className="flex gap-3" style={{ pointerEvents: 'auto' }}>
              <button
                type="button"
                disabled={isSaving}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setStatusConfirmModal(null);
                }}
                className="flex-1 h-12 border-2 border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-bold rounded-lg transition-colors"
                style={{ pointerEvents: 'auto' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isSaving}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleChangeStatus(statusConfirmModal.targetStatus);
                  setStatusConfirmModal(null);
                }}
                className={cn(
                  "flex-1 h-12 text-white font-bold rounded-lg flex items-center justify-center transition-colors",
                  statusConfirmModal.color === 'green' && "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
                  statusConfirmModal.color === 'yellow' && "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700",
                  statusConfirmModal.color === 'blue' && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                  statusConfirmModal.color === 'red' && "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                )}
                style={{ pointerEvents: 'auto' }}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Sim, Confirmar
              </button>
            </div>
          </div>
        </div>
      </div>,
      document.body
    )}
    </>
  );
}

// ============ SUB-COMPONENTS ============

function InfoField({ label, value, icon: Icon, iconColor }: {
  label: string;
  value: string;
  icon: any;
  iconColor?: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn("h-3.5 w-3.5", iconColor || "text-slate-400")} />
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-slate-800 pl-5">{value || '---'}</p>
    </div>
  );
}

function StatusButton({ label, description, icon: Icon, color, onClick, disabled }: {
  label: string;
  description: string;
  icon: any;
  color: string;
  onClick: () => void;
  disabled: boolean;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string; hover: string; iconColor: string }> = {
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', hover: 'hover:bg-green-100', iconColor: 'text-green-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', hover: 'hover:bg-yellow-100', iconColor: 'text-yellow-600' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', hover: 'hover:bg-blue-100', iconColor: 'text-blue-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', hover: 'hover:bg-red-100', iconColor: 'text-red-600' },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
        c.bg, c.border, c.hover,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", c.bg)}>
        <Icon className={cn("h-5 w-5", c.iconColor)} />
      </div>
      <div>
        <p className={cn("font-bold text-sm", c.text)}>{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </button>
  );
}
