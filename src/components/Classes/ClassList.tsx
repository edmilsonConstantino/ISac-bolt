// src/components/shared/ClassList.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  BookOpen, 
  UserPlus,
  Eye,
  Settings,
  Trash2,
  Clock,
  MapPin,
  GraduationCap,
  Search,
  CheckCircle,
  XCircle,
  Award,
  Download
} from "lucide-react";

// 🔥 INTERFACE ALINHADA COM O BANCO DE DADOS
interface Class {
  // Campos do banco
  id?: number;
  codigo?: string;
  nome?: string;
  disciplina?: string;
  professor_id?: number;
  professor_nome?: string;
  semestre?: string;
  ano_letivo?: number;
  duracao_meses?: number;
  capacidade_maxima?: number;
  sala?: string;
  dias_semana?: string;
  horario_inicio?: string;
  horario_fim?: string;
  data_inicio?: string;
  data_fim?: string;
  carga_horaria?: string;
  creditos?: number;
  observacoes?: string;
  status?: string;
  vagas_ocupadas?: number;
  data_criacao?: string;
  data_atualizacao?: string;
  
  // Campos do frontend (compatibilidade)
  name?: string;
  teacher?: string;
  schedule?: string;
  students?: number;
  maxStudents?: number;
  room?: string;
  subject?: string;
  semester?: string;
}

interface Permission {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canViewDetails: boolean;
}

interface ClassListProps {
  classes: Class[];
  permissions: Permission;
  currentUserRole: string;
  onViewStudents: (classItem: Class) => void;
  onManageClass: (classItem: Class) => void;
  onCreateClass: () => void;
  onDeleteClass?: (classId: number) => void;
  onAddStudentToClass: (classItem: Class) => void;
  onLaunchGrades?: (classItem: Class) => void;
  onToggleClassStatus?: (classId: number) => void;
}

export function ClassList({
  classes,
  permissions,
  currentUserRole,
  onViewStudents,
  onManageClass,
  onCreateClass,
  onDeleteClass,
  onAddStudentToClass,
  onLaunchGrades,
  onToggleClassStatus
}: ClassListProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "completed">("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");

  // 🔥 FUNÇÕES AUXILIARES PARA NORMALIZAR DADOS DO BANCO
  const getClassDisplayName = (classItem: Class): string => {
    return classItem.nome || classItem.name || 'Sem nome';
  };

  const getClassTeacher = (classItem: Class): string => {
    return classItem.professor_nome || classItem.teacher || 'Não atribuído';
  };

  const getClassSchedule = (classItem: Class): string => {
    if (classItem.schedule) return classItem.schedule;
    if (classItem.dias_semana && classItem.horario_inicio) {
      return `${classItem.dias_semana} ${classItem.horario_inicio}`;
    }
    return 'Não definido';
  };

  const getClassRoom = (classItem: Class): string => {
    return classItem.sala || classItem.room || '';
  };

  const getClassSubject = (classItem: Class): string => {
    return classItem.disciplina || classItem.subject || '';
  };

  const getClassStudents = (classItem: Class): number => {
    return classItem.vagas_ocupadas || classItem.students || 0;
  };

  const getClassMaxStudents = (classItem: Class): number => {
    return classItem.capacidade_maxima || classItem.maxStudents || 30;
  };

  const getClassCode = (classItem: Class): string => {
    return classItem.codigo || '';
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ativa':
      case 'ativo':
        return 'default';
      case 'inactive':
      case 'inativa':
      case 'inativo':
        return 'secondary';
      case 'completed':
      case 'concluída':
      case 'concluido':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ativa':
      case 'ativo':
        return 'Ativa';
      case 'inactive':
      case 'inativa':
      case 'inativo':
        return 'Inativa';
      case 'completed':
      case 'concluída':
      case 'concluido':
        return 'Concluída';
      default:
        return 'Ativa';
    }
  };

  const normalizeStatus = (status?: string): 'active' | 'inactive' | 'completed' => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ativa':
      case 'ativo':
        return 'active';
      case 'inactive':
      case 'inativa':
      case 'inativo':
        return 'inactive';
      case 'completed':
      case 'concluída':
      case 'concluido':
        return 'completed';
      default:
        return 'active';
    }
  };

  // 🔥 FILTRO CORRIGIDO - PROTEÇÃO CONTRA UNDEFINED
  const filteredClasses = classes.filter(classItem => {
    // Obter valores normalizados
    const name = getClassDisplayName(classItem).toLowerCase();
    const teacher = getClassTeacher(classItem).toLowerCase();
    const room = getClassRoom(classItem).toLowerCase();
    const subject = getClassSubject(classItem).toLowerCase();
    const code = getClassCode(classItem).toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = !search || 
                         name.includes(search) ||
                         teacher.includes(search) ||
                         room.includes(search) ||
                         subject.includes(search) ||
                         code.includes(search);

    const matchesStatus = statusFilter === "all" || normalizeStatus(classItem.status) === statusFilter;
    
    const matchesSemester = semesterFilter === "all" || 
                           classItem.semestre === semesterFilter ||
                           classItem.semester === semesterFilter;

    return matchesSearch && matchesStatus && matchesSemester;
  });

  const stats = {
    total: classes.length,
    active: classes.filter(c => normalizeStatus(c.status) === 'active').length,
    inactive: classes.filter(c => normalizeStatus(c.status) === 'inactive').length,
    completed: classes.filter(c => normalizeStatus(c.status) === 'completed').length,
    totalStudents: classes.reduce((acc, c) => acc + getClassStudents(c), 0)
  };

  const handleExportClasses = () => {
    const csvContent = [
      ["ID", "Código", "Nome", "Professor", "Semestre", "Horário", "Sala", "Estudantes", "Capacidade", "Status"],
      ...filteredClasses.map(c => [
        c.id,
        getClassCode(c),
        getClassDisplayName(c),
        getClassTeacher(c),
        c.semestre || c.semester || "",
        getClassSchedule(c),
        getClassRoom(c),
        getClassStudents(c),
        getClassMaxStudents(c),
        getStatusText(c.status || 'ativa')
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `turmas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#004B87] mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              {currentUserRole === 'teacher' ? 'Minhas Turmas' : 'Gestão de Turmas'}
            </h2>
            <p className="text-sm text-[#004B87]/70">
              {stats.total} turma{stats.total !== 1 ? 's' : ''} cadastrada{stats.total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportClasses}
              variant="outline"
              className="border-2 border-slate-300 hover:border-slate-400"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            {permissions.canAdd && currentUserRole !== 'teacher' && (
              <Button 
                onClick={onCreateClass}
                className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Nova Turma
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Ativas</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-700 font-medium">Inativas</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">{stats.inactive}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-700 font-medium">Concluídas</span>
            </div>
            <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-br from-[#004B87]/10 to-[#F5821F]/10 rounded-xl p-4 border-2 border-[#004B87]/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-[#004B87]" />
              <span className="text-xs text-[#004B87] font-medium">Estudantes</span>
            </div>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#004B87] to-[#F5821F] bg-clip-text text-transparent">
              {stats.totalStudents}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, código, professor ou disciplina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] text-base"
          />
        </div>

        <select 
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[180px] bg-white"
        >
          <option value="all">Todos os Semestres</option>
          <option value="1">1º Semestre</option>
          <option value="2">2º Semestre</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[160px] bg-white"
        >
          <option value="all">Todos os Status</option>
          <option value="active">✅ Ativas</option>
          <option value="inactive">❌ Inativas</option>
          <option value="completed">🏆 Concluídas</option>
        </select>
      </div>

      {/* Lista de Cards */}
      {filteredClasses.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {currentUserRole === 'teacher' 
                  ? 'Nenhuma turma atribuída' 
                  : 'Nenhuma turma encontrada'
                }
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
                {searchTerm 
                  ? "Tente ajustar os filtros de busca" 
                  : currentUserRole === 'teacher' 
                    ? 'Você ainda não possui turmas atribuídas. Entre em contato com a administração.'
                    : 'Não há turmas cadastradas no sistema'
                }
              </p>
              {permissions.canAdd && currentUserRole !== 'teacher' && !searchTerm && (
                <Button 
                  onClick={onCreateClass}
                  className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Criar Primeira Turma
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredClasses.map((classItem) => {
            const displayName = getClassDisplayName(classItem);
            const teacher = getClassTeacher(classItem);
            const schedule = getClassSchedule(classItem);
            const room = getClassRoom(classItem);
            const students = getClassStudents(classItem);
            const maxStudents = getClassMaxStudents(classItem);
            const code = getClassCode(classItem);
            const status = normalizeStatus(classItem.status);

            return (
              <Card 
                key={classItem.id} 
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white"
              >
                {/* Header do Card com Gradiente */}
                <div className="h-2 bg-gradient-to-r from-[#004B87] to-[#0066B3]"></div>
                
                <CardContent className="p-4">
                  {/* Cabeçalho com Avatar e Ações - CORRIGIDO */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="h-11 w-11 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center shadow-lg">
                          <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        {/* Status Badge */}
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          status === "active" 
                            ? "bg-green-500" 
                            : status === "completed"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}></div>
                      </div>

                      {/* Nome e Status - Com truncate forçado */}
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight" title={displayName}>
                          {displayName}
                        </h3>
                        {code && (
                          <p className="text-[10px] text-slate-500 truncate" title={code}>{code}</p>
                        )}
                        <Badge 
                          variant={getStatusColor(classItem.status || 'ativa')}
                          className="text-[10px] mt-1 h-5"
                        >
                          {getStatusText(classItem.status || 'ativa')}
                        </Badge>
                      </div>
                    </div>

                    {/* Botão de Configurações - SEMPRE FIXO */}
                    {permissions.canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#004B87] border-2 border-slate-200 hover:border-[#004B87] transition-all duration-200"
                        onClick={() => onManageClass(classItem)}
                        title="Configurações da turma"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>

                  {/* Informações - Estilizadas */}
                  <div className="space-y-1.5 mb-3 bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-3 w-3 text-[#004B87]" />
                      </div>
                      <span className="text-slate-700 truncate">{teacher}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-3 w-3 text-[#004B87]" />
                      </div>
                      <span className="text-slate-700">{schedule}</span>
                    </div>

                    {room && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-3 w-3 text-[#004B87]" />
                        </div>
                        <span className="text-slate-700">{room}</span>
                      </div>
                    )}
                  </div>

                  {/* Estatísticas de Estudantes */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-slate-600">Estudantes</span>
                      <span className="text-xs font-semibold text-[#004B87]">
                        {students}/{maxStudents}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#004B87] to-[#0066B3] transition-all duration-300"
                        style={{ width: `${Math.min((students / maxStudents) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botões de Ação - LAYOUT REORGANIZADO */}
                  <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                    {/* Primeira linha: Ver Estudantes + Adicionar Estudantes */}
                    <div className="flex gap-1.5">
                      {/* Ver Estudantes */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-[11px] justify-center border-2 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white transition-all font-medium px-2"
                        onClick={() => onViewStudents(classItem)}
                        title="Ver lista de estudantes"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                        <span className="truncate">Ver Alunos</span>
                      </Button>

                      {/* Adicionar Estudantes */}
                      {permissions.canAdd && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-9 text-[11px] justify-center border-2 border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 transition-all font-medium px-2"
                          onClick={() => onAddStudentToClass(classItem)}
                          title="Adicionar novos estudantes"
                        >
                          <UserPlus className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                          <span className="truncate">Adicionar</span>
                        </Button>
                      )}
                    </div>

                    {/* Segunda linha: Lançar/Ver Notas */}
                    {(currentUserRole === 'teacher' || currentUserRole === 'admin' || currentUserRole === 'academic_admin') && onLaunchGrades && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-9 text-[11px] justify-center border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white transition-all font-medium px-2"
                        onClick={() => onLaunchGrades(classItem)}
                        title={currentUserRole === 'academic_admin' ? "Ver notas dos alunos" : "Lançar notas dos alunos"}
                      >
                        <BookOpen className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span className="truncate">{currentUserRole === 'academic_admin' ? 'Ver Notas' : 'Lançar Notas'}</span>
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
      {filteredClasses.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredClasses.length}</span> de{" "}
            <span className="font-semibold">{classes.length}</span> turmas
          </p>
          {(searchTerm || statusFilter !== 'all' || semesterFilter !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSemesterFilter("all");
              }}
              className="text-[#F5821F] hover:text-[#004B87]"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}
    </div>
  );
}