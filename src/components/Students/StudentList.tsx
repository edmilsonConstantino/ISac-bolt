// src/components/shared/StudentList.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Grid3x3,
  LayoutList,
  Download,
  X,
  CheckCircle,
  XCircle,
  GraduationCap,
} from "lucide-react";
import { Student, Permission } from "../../types";

// Componentes reutilizáveis
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { SearchBar, ViewToggle } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { EntityCard, EntityCardHeader, EntityCardTitle, EntityCardActions, EntityCardGrid } from "@/components/ui/entity-card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { InfoRow, InfoPanel, ListFooter } from "@/components/ui/info-row";
import { GradientButton } from "@/components/ui/gradient-button";

interface StudentListProps {
  students: Student[];
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin' | 'academic_admin';
  showClassInfo?: boolean;
  onViewStudent?: (student: Student) => void;
  onEditStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: number) => void;
  onAddStudent?: () => void;
  onViewStudentProfile?: (student: Student) => void;
  onSendEmailToAll?: () => void;
}

export function StudentList({
  students,
  permissions,
  currentUserRole,
  showClassInfo = true,
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onAddStudent,
  onViewStudentProfile,
  onSendEmailToAll
}: StudentListProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.className?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || student.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    inactive: students.filter(s => s.status === 'inactive').length,
  };

  const exportToCSV = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Turma', 'Média', 'Presença', 'Data Matrícula'];
    const rows = filteredStudents.map(s => [
      s.name || '',
      s.email || '',
      s.phone || '',
      s.status === 'active' ? 'Ativo' : 'Inativo',
      s.className || '',
      s.grade ? s.grade.toFixed(1) : '',
      s.attendance ? `${s.attendance}%` : '',
      s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString('pt-MZ') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `estudantes_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader className="from-blue-50/60 via-slate-50 to-orange-50/40 rounded-xl p-6 shadow-sm">
        <div>
          <PageHeaderTitle className="text-2xl gap-0">
            {currentUserRole === 'teacher' ? 'Meus Estudantes' : 'Estudantes'}
          </PageHeaderTitle>
          <PageHeaderSubtitle icon={<Users className="h-4 w-4" />}>
            {hasActiveFilters
              ? `${filteredStudents.length} estudante${filteredStudents.length !== 1 ? 's' : ''} encontrado${filteredStudents.length !== 1 ? 's' : ''}`
              : `${students.length} estudante${students.length !== 1 ? 's' : ''} no sistema`
            }
          </PageHeaderSubtitle>
        </div>

        <PageHeaderActions>
          <Button
            onClick={exportToCSV}
            variant="outline"
            className="border-2 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>

          {permissions.canAdd && onAddStudent && (
            <GradientButton onClick={onAddStudent}>
              <UserPlus className="h-5 w-5 mr-2" />
              Novo Estudante
            </GradientButton>
          )}
        </PageHeaderActions>
      </PageHeader>

      {/* Barra de Pesquisa */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchBar
            placeholder="Buscar por nome, email ou turma..."
            value={searchTerm}
            onChange={setSearchTerm}
          />

          <ViewToggle
            view={viewMode}
            onChange={setViewMode}
            gridIcon={<Grid3x3 className="h-4 w-4" />}
            listIcon={<LayoutList className="h-4 w-4" />}
          />
        </div>

        {/* Filtros por botões */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "Todos", count: stats.total },
            { value: "active", label: "Ativos", count: stats.active },
            { value: "inactive", label: "Inativos", count: stats.inactive },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setStatusFilter(btn.value)}
              className={`h-10 px-5 rounded-lg text-sm font-medium border-2 transition-all ${
                statusFilter === btn.value
                  ? btn.value === "all"
                    ? "bg-[#004B87] text-white border-[#004B87] shadow-md"
                    : btn.value === "active"
                    ? "bg-emerald-500 text-white border-emerald-500 shadow-md"
                    : "bg-slate-500 text-white border-slate-500 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              {btn.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                statusFilter === btn.value ? "bg-white/20" : "bg-slate-100"
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

      {/* Estado Vazio */}
      {filteredStudents.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum estudante encontrado"
          description={searchTerm ? "Tente ajustar os filtros de busca" : "Não há estudantes cadastrados"}
          action={
            permissions.canAdd && onAddStudent && !searchTerm ? (
              <Button
                onClick={onAddStudent}
                variant="outline"
                className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Estudante
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          {/* VISUALIZAÇÃO EM GRELHA */}
          {viewMode === "grid" && (
            <EntityCardGrid>
              {filteredStudents.map((student) => (
                <EntityCard key={student.id}>
                  <EntityCardHeader
                    action={
                      permissions.canDelete && onDeleteStudent ? (
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="flex-shrink-0 h-7 w-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      ) : undefined
                    }
                  >
                    <AvatarInitials
                      name={student.name}
                      size="lg"
                      shape="rounded"
                      status={student.status === "active" ? "active" : "inactive"}
                    />

                    <EntityCardTitle
                      title={student.name || 'Sem nome'}
                      badge={
                        <StatusBadge
                          status={student.status === "active" ? "active" : "inactive"}
                          showCheck
                        />
                      }
                    />
                  </EntityCardHeader>

                  {/* Dados do estudante */}
                  <InfoPanel className="mb-4">
                    <InfoRow icon={<Mail className="h-3 w-3" />}>
                      {student.email || 'Sem email'}
                    </InfoRow>

                    {student.phone && (
                      <InfoRow icon={<Phone className="h-3 w-3" />}>
                        {student.phone}
                      </InfoRow>
                    )}

                    {showClassInfo && (
                      <InfoRow icon={<BookOpen className="h-3 w-3" />}>
                        <span className="font-medium text-slate-700">{student.className || 'Sem curso'}</span>
                      </InfoRow>
                    )}

                    {student.enrollmentDate && (
                      <>
                        <div className="h-px bg-slate-200" />
                        <InfoRow icon={<Calendar className="h-3 w-3" />}>
                          {new Date(student.enrollmentDate).toLocaleDateString('pt-MZ')}
                        </InfoRow>
                      </>
                    )}
                  </InfoPanel>

                  {/* Métricas */}
                  {(student.grade || student.attendance) && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {student.grade && (
                        <div className="text-center p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="text-xl font-bold text-[#004B87]">{student.grade.toFixed(1)}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Média</div>
                        </div>
                      )}
                      {student.attendance && (
                        <div className="text-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                          <div className="text-xl font-bold text-emerald-600">{student.attendance}%</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Presença</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões de ação */}
                  <EntityCardActions>
                    {permissions.canViewDetails && (onViewStudent || onViewStudentProfile) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs border-2 border-[#004B87]/20 text-[#004B87] hover:bg-[#004B87] hover:text-white hover:border-[#004B87] transition-all font-semibold rounded-xl"
                        onClick={() => {
                          if (onViewStudentProfile) onViewStudentProfile(student);
                          else if (onViewStudent) onViewStudent(student);
                        }}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        Ver Perfil
                      </Button>
                    )}

                    {permissions.canEdit && onEditStudent && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 text-xs border-2 border-[#F5821F]/30 text-[#F5821F] hover:bg-[#F5821F] hover:text-white hover:border-[#F5821F] transition-all font-semibold rounded-xl"
                        onClick={() => onEditStudent(student)}
                      >
                        <Edit className="h-3.5 w-3.5 mr-1.5" />
                        Editar
                      </Button>
                    )}
                  </EntityCardActions>
                </EntityCard>
              ))}
            </EntityCardGrid>
          )}

          {/* VISUALIZAÇÃO EM LISTA */}
          {viewMode === "list" && (
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
              {/* Table Header */}
              <div className="bg-slate-50 border-b-2 border-slate-200 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Estudante</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Status</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Contato</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Turma</span>
                  </div>
                  <div className="col-span-3 text-right">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Ações</span>
                  </div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/80 transition-colors"
                  >
                    {/* Student */}
                    <div className="col-span-3 flex items-center gap-3">
                      <AvatarInitials
                        name={student.name}
                        size="lg"
                        shape="rounded"
                        status={student.status === "active" ? "active" : "inactive"}
                      />
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 truncate" title={student.name || 'Sem nome'}>
                          {student.name || 'Sem nome'}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{student.email || 'Sem email'}</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Badge className={`text-xs font-semibold border ${
                        student.status === "active"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}>
                        {student.status === "active" ? (
                          <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>
                        ) : (
                          <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
                        )}
                      </Badge>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span className="truncate">{student.email?.split('@')[0] || '-'}</span>
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{student.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Class */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-sm text-slate-700 font-medium truncate" title={student.className || 'Sem turma'}>
                          {student.className || 'Sem turma'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-3 flex justify-end items-center gap-1.5">
                      {permissions.canViewDetails && (onViewStudent || onViewStudentProfile) && (
                        <button
                          onClick={() => {
                            if (onViewStudentProfile) onViewStudentProfile(student);
                            else if (onViewStudent) onViewStudent(student);
                          }}
                          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-blue-50 text-[#004B87] hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-all text-xs font-medium"
                          title="Ver perfil"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Perfil</span>
                        </button>
                      )}

                      {permissions.canEdit && onEditStudent && (
                        <button
                          onClick={() => onEditStudent(student)}
                          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-orange-50 text-[#F5821F] hover:bg-orange-100 border border-orange-200 hover:border-orange-300 transition-all text-xs font-medium"
                          title="Editar estudante"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          <span className="hidden xl:inline">Editar</span>
                        </button>
                      )}

                      {permissions.canDelete && onDeleteStudent && (
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all text-xs font-medium"
                          title="Remover estudante"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Rodapé */}
      {filteredStudents.length > 0 && (
        <ListFooter
          showing={filteredStudents.length}
          total={students.length}
          hasFilters={hasActiveFilters}
          onClearFilters={clearAllFilters}
        />
      )}
    </div>
  );
}
