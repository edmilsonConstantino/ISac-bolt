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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye,
  Search,
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
  currentUserRole: 'teacher' | 'admin';
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-50/60 via-slate-50 to-orange-50/40 rounded-xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#004B87] mb-2">Docentes</h2>
            <div className="flex items-center gap-2 text-[#004B87]/70">
              <Users className="h-4 w-4" />
              <p className="text-sm">
                {hasActiveFilters 
                  ? `${filteredTeachers.length} docente${filteredTeachers.length !== 1 ? 's' : ''} encontrado${filteredTeachers.length !== 1 ? 's' : ''}`
                  : `${teachers.length} docente${teachers.length !== 1 ? 's' : ''} no sistema`
                }
              </p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex gap-2">
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
              <Button 
                onClick={onAddTeacher}
                className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Docente
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="space-y-3">
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, email ou especialização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-2 border-slate-200 focus:border-[#F5821F]"
          />
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="suspended">Suspensos</option>
          </select>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
          >
            <option value="all">Todos os Contratos</option>
            <option value="full-time">Integral</option>
            <option value="part-time">Parcial</option>
            <option value="freelance">Freelancer</option>
            <option value="substitute">Substituto</option>
          </select>

          {/* NOVO: Filtro de Carga */}
          <select
            value={workloadFilter}
            onChange={(e) => setWorkloadFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
          >
            <option value="all">Toda Carga</option>
            <option value="no-classes">Sem Turmas</option>
            <option value="overloaded">Sobrecarregados</option>
          </select>

          {/* NOVO: Filtro de Alertas */}
          <select
            value={alertFilter}
            onChange={(e) => setAlertFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
          >
            <option value="all">Todos</option>
            <option value="with-alerts">Com Alertas</option>
          </select>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setContractFilter("all");
                setWorkloadFilter("all");
                setAlertFilter("all");
              }}
              className="text-[#F5821F] hover:text-[#004B87] ml-auto"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar Filtros
            </Button>
          )}
        </div>
      </div>

      {/* Lista de Cards */}
      {filteredTeachers.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum docente encontrado</h3>
              <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Não há docentes cadastrados no sistema"}
              </p>
              {permissions.canAdd && onAddTeacher && !searchTerm && (
                <Button 
                  onClick={onAddTeacher}
                  variant="outline"
                  className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Docente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => {
            const workloadStatus = getWorkloadStatus(teacher.weeklyHours);
            const teacherHasAlerts = hasAlerts(teacher);

            return (
              <Card 
                key={teacher.id} 
                className={`group hover:shadow-2xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white rounded-2xl ${
                  teacherHasAlerts ? 'ring-2 ring-amber-300' : ''
                }`}
              >
                {/* Barra superior gradiente */}
                <div className="h-1.5 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]" />
                
                <CardContent className="p-5">
                  {/* ALERTAS no topo (se existirem) */}
                  {teacherHasAlerts && (
                    <div className="mb-3 p-2.5 bg-amber-50 border-l-4 border-amber-400 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 space-y-0.5 leading-relaxed">
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
                  <div className="flex items-start gap-3 mb-4">
                    {/* Avatar */}
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
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight mb-1">
                        {teacher.name}
                      </h3>
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
                    </div>

                    {/* Botão delete */}
                    {permissions.canDelete && onDeleteTeacher && (
                      <button
                        onClick={() => onDeleteTeacher(teacher.id)}
                        className="flex-shrink-0 h-7 w-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200"
                        title="Desativar docente"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Informações de Contato */}
                  <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 mb-4 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                      <span className="truncate text-slate-600">{teacher.email}</span>
                    </div>

                    {teacher.phone && (
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                        <span className="text-slate-600">{teacher.phone}</span>
                      </div>
                    )}

                    {teacher.contractType && (
                      <div className="flex items-center gap-2 text-xs">
                        <Briefcase className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                        <span className="text-slate-600">{getContractTypeLabel(teacher.contractType)}</span>
                      </div>
                    )}

                    {teacher.specialization && (
                      <div className="flex items-center gap-2 text-xs">
                        <GraduationCap className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                        <span className="text-slate-600 truncate">{teacher.specialization}</span>
                      </div>
                    )}
                  </div>

                  {/* Curso e Turnos - COMPACTADO */}
                  {(teacher.cursos || teacher.turnos) && (
                    <div className="bg-purple-50 rounded-lg p-2 space-y-1.5 mb-3 border border-purple-100">
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
                    <div className="mb-3">
                      <div className={`flex items-center justify-between p-2 rounded-lg border ${workloadStatus.color}`}>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          <span className="text-[11px] font-semibold">{teacher.weeklyHours}h/sem</span>
                        </div>
                        <span className="text-[11px] font-bold">{workloadStatus.label}</span>
                      </div>
                    </div>
                  )}

                  {/* Estatísticas - MUITO MAIS COMPACTO */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className={`text-center py-1.5 px-2 rounded-lg border ${
                      teacher.classes === 0 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-blue-50 border-blue-100'
                    }`}>
                      <div className={`text-lg font-bold leading-none ${
                        teacher.classes === 0 ? 'text-red-600' : 'text-[#004B87]'
                      }`}>
                        {teacher.classes}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-medium">Turmas</div>
                    </div>

                    <div className="text-center py-1.5 px-2 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="text-lg font-bold text-emerald-600 leading-none">
                        {teacher.students}
                      </div>
                      <div className="text-[9px] text-slate-500 mt-0.5 font-medium">Estudantes</div>
                    </div>
                  </div>

                  {/* Última Atividade - COMPACTO */}
                  <div className="mb-3 flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg p-2 border border-slate-100">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Rodapé com Total */}
      {filteredTeachers.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredTeachers.length}</span> de{" "}
            <span className="font-semibold">{teachers.length}</span> docentes
          </p>
        </div>
      )}
    </div>
  );
}