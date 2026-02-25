// src/components/shared/ClassList.tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  UserPlus,
  Eye,
  Settings,
  Clock,
  MapPin,
  GraduationCap,
  CheckCircle,
  XCircle,
  Award,
  Download
} from "lucide-react";

// Componentes reutilizáveis
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { SearchBar, FilterSelect } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityCard, EntityCardHeader, EntityCardTitle, EntityCardGrid } from "@/components/ui/entity-card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge, normalizeStatus, getStatusLabel } from "@/components/ui/status-badge";
import { InfoRow, InfoPanel, ListFooter } from "@/components/ui/info-row";
import { StatCard } from "@/components/ui/stat-card";
import { GradientButton } from "@/components/ui/gradient-button";

interface Class {
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
  name?: string;
  teacher?: string;
  schedule?: string;
  students?: number;
  maxStudents?: number;
  room?: string;
  subject?: string;
  semester?: string;
  // campos de curso (vindos do JOIN em turmas.php / classService)
  curso?: string;       // código do curso (mapeado pelo classService)
  curso_nome?: string;  // nome completo do curso
  curso_codigo?: string;
  curso_id?: number;
}

interface Permission {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canViewDetails: boolean;
}

interface ClassListProps {
  classes: Class[];
  courses?: { codigo: string; nome: string }[];
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
  courses: coursesProp = [],
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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");

  // Funções auxiliares para normalizar dados do banco
  const getClassDisplayName = (c: Class) => c.nome || c.name || 'Sem nome';
  const getClassTeacher = (c: Class) => c.professor_nome || c.teacher || 'Não atribuído';
  const getClassSchedule = (c: Class) => {
    if (c.schedule) return c.schedule;
    if (c.dias_semana && c.horario_inicio) return `${c.dias_semana} ${c.horario_inicio}`;
    return 'Não definido';
  };
  const getClassRoom = (c: Class) => c.sala || c.room || '';
  const getClassSubject = (c: Class) => c.disciplina || c.subject || '';
  const getClassStudents = (c: Class) => c.vagas_ocupadas || c.students || 0;
  const getClassMaxStudents = (c: Class) => c.capacidade_maxima || c.maxStudents || 30;
  const getClassCode = (c: Class) => c.codigo || '';

  const getClassStatus = (c: Class) => {
    const s = normalizeStatus(c.status);
    // normalizeStatus returns StatusType, map to 'active' | 'inactive' | 'completed'
    if (s === 'active') return 'active' as const;
    if (s === 'inactive') return 'inactive' as const;
    return 'completed' as const;
  };

  // Mapa de codigo → nome usando a lista de cursos do pai (fallback para curso_nome do JOIN, depois para o código)
  const courseNameMap = new Map(coursesProp.map(c => [c.codigo, c.nome]));

  // Cursos únicos presentes nas turmas (para os botões de filtro)
  const uniqueCourses = Array.from(
    new Map(
      classes
        .filter(c => c.curso)
        .map(c => [
          c.curso,
          { codigo: c.curso!, nome: courseNameMap.get(c.curso!) || c.curso_nome || c.curso! }
        ])
    ).values()
  ).sort((a, b) => a.nome.localeCompare(b.nome));

  const filteredClasses = classes.filter(classItem => {
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

    const matchesStatus = statusFilter === "all" || getClassStatus(classItem) === statusFilter;

    const matchesSemester = semesterFilter === "all" ||
      classItem.semestre === semesterFilter ||
      classItem.semester === semesterFilter;

    const matchesCourse = courseFilter === "all" || classItem.curso === courseFilter;

    return matchesSearch && matchesStatus && matchesSemester && matchesCourse;
  });

  const stats = {
    total: classes.length,
    active: classes.filter(c => getClassStatus(c) === 'active').length,
    inactive: classes.filter(c => getClassStatus(c) === 'inactive').length,
    completed: classes.filter(c => getClassStatus(c) === 'completed').length,
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
        getStatusLabel(c.status)
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `turmas_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const statusOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "active", label: "Ativas" },
    { value: "inactive", label: "Inativas" },
    { value: "completed", label: "Concluídas" },
  ];

  const semesterOptions = [
    { value: "all", label: "Todos os Semestres" },
    { value: "1", label: "1º Semestre" },
    { value: "2", label: "2º Semestre" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader>
        <div>
          <PageHeaderTitle icon={<BookOpen className="h-8 w-8" />}>
            {currentUserRole === 'teacher' ? 'Minhas Turmas' : 'Gestão de Turmas'}
          </PageHeaderTitle>
          <PageHeaderSubtitle>
            {stats.total} turma{stats.total !== 1 ? 's' : ''} cadastrada{stats.total !== 1 ? 's' : ''}
          </PageHeaderSubtitle>
        </div>

        <PageHeaderActions>
          <Button
            onClick={handleExportClasses}
            variant="outline"
            className="border-2 border-slate-300 hover:border-slate-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {permissions.canAdd && currentUserRole !== 'teacher' && (
            <GradientButton onClick={onCreateClass}>
              <BookOpen className="h-5 w-5 mr-2" />
              Nova Turma
            </GradientButton>
          )}
        </PageHeaderActions>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard icon={BookOpen} label="Total" value={stats.total} color="slate" />
        <StatCard icon={CheckCircle} label="Ativas" value={stats.active} color="green" />
        <StatCard icon={XCircle} label="Inativas" value={stats.inactive} color="gray" />
        <StatCard icon={Award} label="Concluídas" value={stats.completed} color="blue" />
        <StatCard icon={Users} label="Estudantes" value={stats.totalStudents} color="brand" gradientText />
      </div>

      {/* Filtro rápido por curso */}
      {uniqueCourses.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCourseFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
              courseFilter === "all"
                ? "bg-[#004B87] text-white border-[#004B87] shadow-sm"
                : "bg-white text-slate-500 border-slate-200 hover:border-[#004B87] hover:text-[#004B87]"
            )}
          >
            Todos
          </button>
          {uniqueCourses.map(course => {
            const words = course.nome.trim().split(/\s+/);
            const label = course.nome.trim().length > 16
              ? words.map((w, i) => i === 0 ? w : (w[0]?.toUpperCase() ?? "") + ".").join(" ")
              : course.nome.trim();
            return (
              <button
                key={course.codigo}
                onClick={() => setCourseFilter(courseFilter === course.codigo ? "all" : course.codigo)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap",
                  courseFilter === course.codigo
                    ? "bg-[#004B87] text-white border-[#004B87] shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-[#004B87] hover:text-[#004B87]"
                )}
                title={course.nome}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar
          placeholder="Buscar por nome, código, professor ou disciplina..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <FilterSelect
          value={semesterFilter}
          onChange={setSemesterFilter}
          options={semesterOptions}
        />

        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={statusOptions}
          minWidth="160px"
        />
      </div>

      {/* Lista de Cards */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={currentUserRole === 'teacher' ? 'Nenhuma turma atribuída' : 'Nenhuma turma encontrada'}
          description={
            searchTerm
              ? "Tente ajustar os filtros de busca"
              : currentUserRole === 'teacher'
                ? 'Você ainda não possui turmas atribuídas. Entre em contato com a administração.'
                : 'Não há turmas cadastradas no sistema'
          }
          action={
            permissions.canAdd && currentUserRole !== 'teacher' && !searchTerm ? (
              <GradientButton onClick={onCreateClass}>
                <BookOpen className="h-4 w-4 mr-2" />
                Criar Primeira Turma
              </GradientButton>
            ) : undefined
          }
        />
      ) : (
        <EntityCardGrid>
          {filteredClasses.map((classItem) => {
            const displayName = getClassDisplayName(classItem);
            const teacher = getClassTeacher(classItem);
            const schedule = getClassSchedule(classItem);
            const room = getClassRoom(classItem);
            const students = getClassStudents(classItem);
            const maxStudents = getClassMaxStudents(classItem);
            const code = getClassCode(classItem);
            const status = getClassStatus(classItem);

            return (
              <EntityCard key={classItem.id}>
                <EntityCardHeader
                  action={
                    permissions.canEdit ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-[#004B87] border-2 border-slate-200 hover:border-[#004B87] transition-all duration-200"
                        onClick={() => onManageClass(classItem)}
                        title="Configurações da turma"
                      >
                        <Settings className="h-3.5 w-3.5" />
                      </Button>
                    ) : undefined
                  }
                >
                  <AvatarInitials
                    icon={<BookOpen className="h-5 w-5" />}
                    size="md"
                    shape="circle"
                    status={status}
                  />

                  <EntityCardTitle
                    title={displayName}
                    subtitle={code || undefined}
                    badge={
                      <StatusBadge
                        status={status}
                        label={getStatusLabel(classItem.status)}
                        className="mt-1"
                      />
                    }
                  />
                </EntityCardHeader>

                {/* Informações */}
                <InfoPanel className="mb-3">
                  <InfoRow icon={<GraduationCap className="h-3 w-3" />}>
                    {teacher}
                  </InfoRow>

                  <InfoRow icon={<Clock className="h-3 w-3" />}>
                    {schedule}
                  </InfoRow>

                  {room && (
                    <InfoRow icon={<MapPin className="h-3 w-3" />}>
                      {room}
                    </InfoRow>
                  )}
                </InfoPanel>

                {/* Barra de estudantes */}
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
                    />
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="space-y-1.5 pt-2.5 border-t border-slate-100">
                  <div className="flex gap-1.5">
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
              </EntityCard>
            );
          })}
        </EntityCardGrid>
      )}

      {/* Rodapé */}
      {filteredClasses.length > 0 && (
        <ListFooter
          showing={filteredClasses.length}
          total={classes.length}
          hasFilters={!!searchTerm || statusFilter !== 'all' || semesterFilter !== 'all'}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
            setSemesterFilter("all");
          }}
        />
      )}
    </div>
  );
}
