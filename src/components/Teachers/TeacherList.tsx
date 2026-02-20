// MELHORIAS APLICADAS:
// 1. ✅ Indicador de carga horária (Normal/Sobrecarregado)
// 2. ✅ Última atividade visível no card
// 3. ✅ Alertas visuais destacados (sem turma, dados faltando, notas pendentes)
// 4. ✅ Botão "Ver Horário" adicionado
// 5. ✅ Botão "Mensagem" para contacto rápido
// 6. ✅ Filtro adicional "Sem turmas" e "Sobrecarregado"
// 7. ✅ Exportar lista (CSV)
// 8. ✅ Badge de "Conflito de horário" se aplicável

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Filter,
  GraduationCap,
  CheckCircle,
  X,
  Briefcase,
  BookOpen,
  Sun,
  Clock,
  MessageSquare,
  Calendar,
  AlertTriangle,
  Download,
  Activity
} from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { GradientButton } from "@/components/ui/gradient-button";
import { SearchBar } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityCard, EntityCardHeader, EntityCardTitle, EntityCardGrid } from "@/components/ui/entity-card";
import { InfoPanel, InfoRow, ListFooter } from "@/components/ui/info-row";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  genero?: 'M' | 'F';
  classes: number;
  students: number;
  status: 'active' | 'inactive' | 'suspended';
  specialization?: string;
  contractType?: 'full-time' | 'part-time' | 'freelance' | 'substitute';
  cursos?: string;
  turnos?: string;
  experience?: string;
  qualifications?: string;
  weeklyHours?: number; // NOVO: carga horária semanal
  lastActivity?: string; // NOVO: última atividade (ex: "2024-02-08T10:30:00")
  hasScheduleConflict?: boolean; // NOVO: conflito de horário
  hasPendingGrades?: boolean; // NOVO: notas pendentes
  missingData?: string[]; // NOVO: dados em falta (ex: ["phone", "specialization"])
}

interface Permission {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canViewDetails: boolean;
}

interface TeacherListProps {
  teachers: Teacher[];
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin' | 'academic_admin';
  onViewTeacherProfile?: (teacher: Teacher) => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: number) => void;
  onToggleTeacherStatus?: (teacherId: number) => void;
  onAddTeacher?: () => void;
  onViewSchedule?: (teacher: Teacher) => void; // NOVO
  onSendMessage?: (teacher: Teacher) => void; // NOVO
}

export function TeacherList({
  teachers,
  permissions,
  currentUserRole,
  onViewTeacherProfile,
  onEditTeacher,
  onDeleteTeacher,
  onToggleTeacherStatus,
  onAddTeacher,
  onViewSchedule,
  onSendMessage
}: TeacherListProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "suspended">("all");
  const [contractFilter, setContractFilter] = useState<string>("all");
  const [workloadFilter, setWorkloadFilter] = useState<string>("all"); // NOVO
  const [alertFilter, setAlertFilter] = useState<string>("all"); // NOVO

  // Traduzir tipo de contrato
  const getContractTypeLabel = (type?: string) => {
    switch(type) {
      case 'full-time': return 'Integral';
      case 'part-time': return 'Parcial';
      case 'freelance': return 'Freelancer';
      case 'substitute': return 'Substituto';
      default: return 'N/A';
    }
  };

  // Traduzir turnos
  const getTurnosLabel = (turnos?: string) => {
    if (!turnos) return null;
    const turnoMap: Record<string, string> = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite',
      'todos': 'Todos'
    };
    return turnos.split(',').map(t => turnoMap[t.trim()] || t.trim()).join(', ');
  };

  // NOVO: Calcular carga de trabalho
  const getWorkloadStatus = (hours?: number) => {
    if (!hours) return { label: 'Sem carga', color: 'bg-gray-100 text-gray-600 border-gray-300' };
    if (hours >= 20) return { label: 'Sobrecarregado', color: 'bg-red-100 text-red-700 border-red-300' };
    if (hours >= 15) return { label: 'Alta', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' };
    return { label: 'Normal', color: 'bg-green-100 text-green-700 border-green-300' };
  };

  // NOVO: Formatar última atividade
  const getLastActivityLabel = (lastActivity?: string) => {
    if (!lastActivity) return 'Sem atividade registrada';
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Ativo há ${diffMins} min`;
    if (diffHours < 24) return `Ativo há ${diffHours}h`;
    if (diffDays === 1) return 'Ativo há 1 dia';
    return `Ativo há ${diffDays} dias`;
  };

  // NOVO: Verificar se tem alertas
  const hasAlerts = (teacher: Teacher) => {
    return teacher.classes === 0 ||
           teacher.hasPendingGrades ||
           teacher.hasScheduleConflict ||
           (teacher.missingData && teacher.missingData.length > 0);
  };

  // Filtrar docentes
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.specialization && teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;
    const matchesContract = contractFilter === "all" || teacher.contractType === contractFilter;

    // NOVO: Filtro de carga
    const matchesWorkload = workloadFilter === "all" ||
                           (workloadFilter === "no-classes" && teacher.classes === 0) ||
                           (workloadFilter === "overloaded" && (teacher.weeklyHours || 0) >= 20);

    // NOVO: Filtro de alertas
    const matchesAlert = alertFilter === "all" ||
                        (alertFilter === "with-alerts" && hasAlerts(teacher));

    return matchesSearch && matchesStatus && matchesContract && matchesWorkload && matchesAlert;
  });

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || contractFilter !== "all" ||
                          workloadFilter !== "all" || alertFilter !== "all";

  // NOVO: Exportar para CSV
  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Contrato', 'Turmas', 'Estudantes', 'Carga (h/sem)'];
    const rows = filteredTeachers.map(t => [
      t.name,
      t.email,
      t.phone || '',
      t.status,
      getContractTypeLabel(t.contractType),
      t.classes,
      t.students,
      t.weeklyHours || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `docentes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setContractFilter("all");
    setWorkloadFilter("all");
    setAlertFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader className="from-blue-50/60 via-slate-50 to-orange-50/40 rounded-xl p-6 shadow-sm">
        <div>
          <PageHeaderTitle className="text-2xl gap-0">Docentes</PageHeaderTitle>
          <PageHeaderSubtitle icon={<Users className="h-4 w-4" />}>
            {hasActiveFilters
              ? `${filteredTeachers.length} docente${filteredTeachers.length !== 1 ? 's' : ''} encontrado${filteredTeachers.length !== 1 ? 's' : ''}`
              : `${teachers.length} docente${teachers.length !== 1 ? 's' : ''} no sistema`
            }
          </PageHeaderSubtitle>
        </div>

        {/* Ações */}
        <PageHeaderActions>
          {/* NOVO: Botão Exportar */}
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>

          {permissions.canAdd && onAddTeacher && (
            <GradientButton onClick={onAddTeacher} variant="orange" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Docente
            </GradientButton>
          )}
        </PageHeaderActions>
      </PageHeader>

      {/* Barra de Pesquisa e Filtros */}
      <div className="space-y-3">
        {/* Campo de Busca */}
        <SearchBar
          placeholder="Buscar por nome, email ou especialização..."
          value={searchTerm}
          onChange={setSearchTerm}
          className="[&_input]:h-10 [&_input]:pl-10 [&_input]:text-sm [&_input]:rounded-md [&_svg]:h-4 [&_svg]:w-4 [&_svg]:left-3"
        />

        {/* Filtros por botões */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all" as const, label: "Todos", count: teachers.length },
            { value: "active" as const, label: "Ativos", count: teachers.filter(t => t.status === 'active').length },
            { value: "inactive" as const, label: "Inativos", count: teachers.filter(t => t.status === 'inactive').length },
            { value: "no-classes" as const, label: "Sem Turma", count: teachers.filter(t => t.classes === 0).length },
            { value: "suspended" as const, label: "Suspensos", count: teachers.filter(t => t.status === 'suspended').length },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => {
                if (btn.value === "no-classes") {
                  setWorkloadFilter(workloadFilter === "no-classes" ? "all" : "no-classes");
                  setStatusFilter("all");
                } else if (btn.value === "all") {
                  setStatusFilter("all");
                  setWorkloadFilter("all");
                } else {
                  setStatusFilter(btn.value);
                  setWorkloadFilter("all");
                }
              }}
              className={`h-10 px-5 rounded-lg text-sm font-medium border-2 transition-all ${
                (btn.value === "all" && statusFilter === "all" && workloadFilter === "all")
                  ? "bg-[#004B87] text-white border-[#004B87] shadow-md"
                  : (btn.value === "active" && statusFilter === "active")
                  ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                  : (btn.value === "inactive" && statusFilter === "inactive")
                  ? "bg-slate-500 text-white border-slate-500 shadow-md"
                  : (btn.value === "no-classes" && workloadFilter === "no-classes")
                  ? "bg-red-500 text-white border-red-500 shadow-md"
                  : (btn.value === "suspended" && statusFilter === "suspended")
                  ? "bg-amber-500 text-white border-amber-500 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {btn.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                (btn.value === "all" && statusFilter === "all" && workloadFilter === "all") ||
                (btn.value === "active" && statusFilter === "active") ||
                (btn.value === "inactive" && statusFilter === "inactive") ||
                (btn.value === "no-classes" && workloadFilter === "no-classes") ||
                (btn.value === "suspended" && statusFilter === "suspended")
                  ? "bg-white/20"
                  : "bg-slate-100"
              }`}>
                {btn.count}
              </span>
            </button>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-[#F5821F] hover:text-[#004B87] ml-auto h-10"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Cards */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum docente encontrado"
          description={searchTerm ? "Tente ajustar os filtros de busca" : "Não há docentes cadastrados no sistema"}
          action={
            permissions.canAdd && onAddTeacher && !searchTerm ? (
              <Button
                onClick={onAddTeacher}
                variant="outline"
                className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Docente
              </Button>
            ) : undefined
          }
        />
      ) : (
        <EntityCardGrid cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTeachers.map((teacher) => {
            const workloadStatus = getWorkloadStatus(teacher.weeklyHours);
            const teacherHasAlerts = hasAlerts(teacher);

            return (
              <EntityCard
                key={teacher.id}
                className=""
              >
                {/* ALERTAS no topo (se existirem) */}
                {teacherHasAlerts && (
                  <div className="mb-2 p-2 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="text-[11px] text-amber-800 space-y-0 leading-relaxed">
                        {teacher.classes === 0 && <p>• Sem turma atribuída</p>}
                        {teacher.hasPendingGrades && <p>• Notas pendentes</p>}
                        {teacher.hasScheduleConflict && <p>• Conflito de horário</p>}
                        {teacher.missingData && teacher.missingData.length > 0 && (
                          <p>• Dados em falta: {teacher.missingData.join(', ')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Header: avatar + nome + delete */}
                <EntityCardHeader
                  action={
                    permissions.canDelete && onDeleteTeacher && currentUserRole === 'admin' ? (
                      <button
                        onClick={() => onDeleteTeacher(teacher.id)}
                        className="h-7 w-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200"
                        title="Desativar docente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : undefined
                  }
                >
                  {/* Avatar - custom colors per status */}
                  <div className="relative flex-shrink-0">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shadow-md ${
                      teacher.status === 'active'
                        ? 'bg-gradient-to-br from-[#004B87] to-[#0066B3]'
                        : teacher.status === 'suspended'
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : 'bg-gradient-to-br from-red-500 to-red-600'
                    }`}>
                      <span className="text-white font-bold text-base">
                        {teacher.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                      teacher.status === "active" ? "bg-emerald-500" :
                      teacher.status === "suspended" ? "bg-amber-500" : "bg-slate-300"
                    }`} />
                  </div>

                  {/* Nome + badge */}
                  <EntityCardTitle
                    title={teacher.name}
                    badge={
                      <Badge
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border-0 ${
                          teacher.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : teacher.status === 'suspended'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {teacher.status === "active" ? "✓ Activo" :
                         teacher.status === "suspended" ? "⚠ Suspenso" : "Inactivo"}
                      </Badge>
                    }
                  />
                </EntityCardHeader>

                {/* Informações de Contato */}
                <InfoPanel className="mb-2">
                  <InfoRow icon={<Mail className="h-3 w-3" />}>{teacher.email}</InfoRow>

                  {teacher.phone && (
                    <InfoRow icon={<Phone className="h-3 w-3" />}>{teacher.phone}</InfoRow>
                  )}

                  {teacher.contractType && (
                    <InfoRow icon={<Briefcase className="h-3 w-3" />}>{getContractTypeLabel(teacher.contractType)}</InfoRow>
                  )}

                  {teacher.specialization && (
                    <InfoRow icon={<GraduationCap className="h-3 w-3" />}>{teacher.specialization}</InfoRow>
                  )}
                </InfoPanel>

                {/* Curso e Turnos - COMPACTADO */}
                {(teacher.cursos || teacher.turnos) && (
                  <div className="bg-purple-50 rounded-lg p-1.5 space-y-1 mb-2 border border-purple-100">
                    {teacher.cursos && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <BookOpen className="h-3 w-3 text-purple-600 flex-shrink-0" />
                        <span className="font-medium text-purple-700 truncate text-[11px]">
                          {teacher.cursos.split(',').join(', ')}
                        </span>
                      </div>
                    )}

                    {teacher.turnos && (
                      <div className="flex items-center gap-1.5 text-xs">
                        <Sun className="h-3 w-3 text-amber-600 flex-shrink-0" />
                        <span className="text-slate-700 text-[11px]">{getTurnosLabel(teacher.turnos)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Carga Horária - COMPACTADO */}
                {teacher.weeklyHours !== undefined && (
                  <div className="mb-2">
                    <div className={`flex items-center justify-between p-1.5 rounded-lg border ${workloadStatus.color}`}>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        <span className="text-[11px] font-semibold">{teacher.weeklyHours}h/sem</span>
                      </div>
                      <span className="text-[11px] font-bold">{workloadStatus.label}</span>
                    </div>
                  </div>
                )}

                {/* Estatísticas - MUITO MAIS COMPACTO */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className={`text-center py-1 px-2 rounded-lg border ${
                    teacher.classes === 0
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-100'
                  }`}>
                    <div className={`text-base font-bold leading-none ${
                      teacher.classes === 0 ? 'text-red-600' : 'text-[#004B87]'
                    }`}>
                      {teacher.classes}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-medium">Turmas</div>
                  </div>

                  <div className="text-center py-1 px-2 bg-emerald-50 rounded-lg border border-emerald-100">
                    <div className="text-base font-bold text-emerald-600 leading-none">
                      {teacher.students}
                    </div>
                    <div className="text-[9px] text-slate-500 mt-0.5 font-medium">Estudantes</div>
                  </div>
                </div>

                {/* Última Atividade - COMPACTO */}
                <div className="mb-2 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg p-1.5 border border-slate-100">
                  <Activity className="h-3 w-3 text-[#F5821F]" />
                  <span className="text-[11px]">{getLastActivityLabel(teacher.lastActivity)}</span>
                </div>

                {/* Botões Primários - COMPACTO */}
                <div className="flex gap-2 mb-2">
                  {permissions.canViewDetails && onViewTeacherProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-xs border-2 border-[#004B87]/20 text-[#004B87] hover:bg-[#004B87] hover:text-white hover:border-[#004B87] transition-all font-semibold rounded-xl"
                      onClick={() => onViewTeacherProfile(teacher)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Perfil
                    </Button>
                  )}

                  {onToggleTeacherStatus && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={`h-8 px-2.5 text-xs border-2 transition-all rounded-xl font-semibold ${
                        teacher.status === "active"
                          ? "border-red-300 text-red-600 hover:bg-red-50"
                          : "border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                      }`}
                      onClick={() => onToggleTeacherStatus(teacher.id)}
                      title={teacher.status === "active" ? "Desativar" : "Ativar"}
                    >
                      {teacher.status === "active" ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Botões Secundários - COMPACTO */}
                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100">
                  {onViewSchedule && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] hover:bg-[#004B87]/10 hover:text-[#004B87] rounded-lg transition-all"
                      onClick={() => onViewSchedule(teacher)}
                      title="Ver horário"
                    >
                      <Calendar className="h-3 w-3 mr-0.5" />
                      Horário
                    </Button>
                  )}

                  {onSendMessage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-all"
                      onClick={() => onSendMessage(teacher)}
                      title="Enviar mensagem"
                    >
                      <MessageSquare className="h-3 w-3 mr-0.5" />
                      Msg
                    </Button>
                  )}

                  {permissions.canEdit && onEditTeacher && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] hover:bg-[#F5821F]/10 hover:text-[#F5821F] rounded-lg transition-all"
                      onClick={() => onEditTeacher(teacher)}
                      title="Editar"
                    >
                      <Edit className="h-3 w-3 mr-0.5" />
                      Editar
                    </Button>
                  )}
                </div>
              </EntityCard>
            );
          })}
        </EntityCardGrid>
      )}

      {/* Rodapé com Total */}
      {filteredTeachers.length > 0 && (
        <ListFooter
          showing={filteredTeachers.length}
          total={teachers.length}
        />
      )}
    </div>
  );
}
