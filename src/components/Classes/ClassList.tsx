// src/components/shared/ClassList.tsx - VERSÃO CORRIGIDA E ALINHADA COM O BANCO
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
  X
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

  const totalStudents = classes.reduce((acc, c) => acc + getClassStudents(c), 0);

  return (
    <div className="space-y-6">
      {/* Header Section - Estilo Moderno */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60">
        <h2 className="text-3xl font-bold text-[#004B87] mb-2">
          {currentUserRole === 'teacher' ? 'Minhas Turmas' : 'Turmas'}
        </h2>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Total de Turmas */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-600">Total de Turmas</p>
              <p className="text-2xl font-bold text-[#004B87]">{classes.length}</p>
            </div>
          </div>

          {/* Total de Estudantes */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-600">Total de Estudantes</p>
              <p className="text-2xl font-bold text-[#0066B3]">{totalStudents}</p>
            </div>
          </div>

          {/* Turmas Ativas */}
          <div className="bg-white rounded-lg p-3 shadow-sm border border-slate-100 flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-slate-600">Turmas Ativas</p>
              <p className="text-2xl font-bold text-green-600">
                {classes.filter(c => normalizeStatus(c.status) === 'active').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros - Estilo Moderno */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, código, professor ou disciplina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] text-base"
          />
        </div>

        {/* Filtro Semestre */}
        <select 
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[150px] bg-white"
        >
          <option value="all">Todos os Semestres</option>
          <option value="1">1º Semestre</option>
          <option value="2">2º Semestre</option>
        </select>

        {/* Filtro Status */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[150px] bg-white"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativa</option>
          <option value="inactive">Inativa</option>
          <option value="completed">Concluída</option>
        </select>

        {/* Botão Criar Nova */}
        {permissions.canAdd && currentUserRole !== 'teacher' && (
          <Button 
            onClick={onCreateClass}
            className="h-12 px-6 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white rounded-xl shadow-md min-w-[120px]"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Nova Turma
          </Button>
        )}
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
                  variant="outline"
                  className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Criar Primeira Turma
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  {/* Cabeçalho com Avatar e Ações */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="relative">
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

                      {/* Nome e Status */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight">
                          {displayName}
                        </h3>
                        {code && (
                          <p className="text-[10px] text-slate-500 truncate">{code}</p>
                        )}
                        <Badge 
                          variant={getStatusColor(classItem.status || 'ativa')}
                          className="text-[10px] mt-1 h-5"
                        >
                          {getStatusText(classItem.status || 'ativa')}
                        </Badge>
                      </div>
                    </div>

                    {/* Botão de Configurações */}
                    {permissions.canEdit && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#004B87] border-2 border-slate-200 hover:border-[#004B87] transition-all duration-200"
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

                  {/* Botões de Ação */}
                  <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                    {/* Ver Estudantes */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs justify-start border-2 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white transition-all"
                      onClick={() => onViewStudents(classItem)}
                    >
                      <Eye className="h-3 w-3 mr-2" />
                      Ver Estudantes
                    </Button>

                    {/* Linha com 2 botões */}
                    <div className="flex gap-1.5">
                      {/* Gerenciar */}
                      {permissions.canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 text-xs border-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                          onClick={() => onManageClass(classItem)}
                        >
                          <Settings className="h-3 w-3 mr-1" />
                          Gerenciar
                        </Button>
                      )}

                      {/* Toggle Status */}
                      {onToggleClassStatus && classItem.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-8 px-3 text-xs border-2 transition-all ${
                            status === "active" 
                              ? "border-red-300 text-red-600 hover:bg-red-50" 
                              : "border-green-300 text-green-600 hover:bg-green-50"
                          }`}
                          onClick={() => onToggleClassStatus(classItem.id!)}
                          title={status === "active" ? "Desativar turma" : "Ativar turma"}
                        >
                          {status === "active" ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>

                    {/* Adicionar Estudantes */}
                    {permissions.canAdd && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs justify-start border-2 border-green-300 text-green-600 hover:bg-green-50"
                        onClick={() => onAddStudentToClass(classItem)}
                      >
                        <UserPlus className="h-3 w-3 mr-2" />
                        Adicionar Estudantes
                      </Button>
                    )}

                    {/* Lançar Notas - Professor e Admin */}
                    {(currentUserRole === 'teacher' || currentUserRole === 'admin') && onLaunchGrades && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full h-8 text-xs justify-start border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
                        onClick={() => onLaunchGrades(classItem)}
                      >
                        <BookOpen className="h-3 w-3 mr-2" />
                        Lançar Notas
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
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredClasses.length}</span> de{" "}
            <span className="font-semibold">{classes.length}</span> turmas
          </p>
        </div>
      )}
    </div>
  );
}