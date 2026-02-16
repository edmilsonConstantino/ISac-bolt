// src/components/shared/CourseList.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  GraduationCap,
  Loader2,
  Download,
  Eye
} from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { SearchBar, FilterSelect } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCard } from "@/components/ui/stat-card";
import { ListFooter } from "@/components/ui/info-row";
import { GradientButton } from "@/components/ui/gradient-button";

interface Categoria {
  id: number;
  nome: string;
}

interface Nivel {
  id: number;
  nome: string;
}

interface Course {
  id?: number;
  nome: string;
  codigo: string;
  categoria_id?: number;
  categoria?: Categoria;
  tipo_curso?: 'tecnico' | 'tecnico_superior' | 'tecnico_profissional' | 'curta_duracao';
  duracao_valor: number;
  mensalidade: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  niveis?: Nivel[];
  data_criacao?: string;
}

interface CourseListProps {
  courses: Course[];
  isLoading?: boolean;
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: number) => void;
  readOnly?: boolean;
  onViewCourse?: (course: Course) => void;
}

export function CourseList({
  courses,
  isLoading = false,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  readOnly = false,
  onViewCourse
}: CourseListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTipoCursoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'tecnico': 'T\u00e9cnico',
      'tecnico_superior': 'T\u00e9cnico Superior',
      'tecnico_profissional': 'T\u00e9cnico Profissional',
      'curta_duracao': 'Curta Dura\u00e7\u00e3o'
    };
    return labels[tipo] || tipo;
  };

  const getTipoCursoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'tecnico': '\u{1F4C5}',
      'tecnico_superior': '\u{1F4DA}',
      'tecnico_profissional': '\u{1F393}',
      'curta_duracao': '\u26A1'
    };
    return icons[tipo] || '';
  };

  const getDuracaoText = (tipo: string, valor: number) => {
    if (tipo === 'tecnico_superior') {
      return `${valor} ${valor === 1 ? 'Ano' : 'Anos'}`;
    }
    return `${valor} ${valor === 1 ? 'M\u00eas' : 'Meses'}`;
  };

  const safeCourses = Array.isArray(courses) ? courses : [];

  const filteredCourses = safeCourses.filter(course => {
    const matchesSearch =
      course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.codigo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || course.tipo_curso === filterType;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: safeCourses.length,
    ativos: safeCourses.filter(c => c.status === 'ativo').length,
    inativos: safeCourses.filter(c => c.status === 'inativo').length,
    receitaTotal: safeCourses.reduce((sum, c) => sum + c.mensalidade, 0)
  };

  const handleExportCourses = () => {
    const csvContent = [
      ["ID", "Nome", "C\u00f3digo", "Categoria", "Tipo", "Dura\u00e7\u00e3o", "Mensalidade", "Status"],
      ...filteredCourses.map(c => [
        c.id,
        c.nome,
        c.codigo,
        c.categoria?.nome || "Sem categoria",
        getTipoCursoLabel(c.tipo_curso || ''),
        getDuracaoText(c.tipo_curso || '', c.duracao_valor),
        formatCurrency(c.mensalidade),
        c.status === "ativo" ? "Ativo" : "Inativo"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `cursos_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const hasActiveFilters = searchTerm !== "" || filterType !== "all" || filterStatus !== "all";

  const typeFilterOptions = [
    { value: "all", label: "Todos os Tipos" },
    { value: "tecnico", label: "\u{1F4C5} T\u00e9cnico" },
    { value: "tecnico_superior", label: "\u{1F4DA} T\u00e9cnico Superior" },
    { value: "tecnico_profissional", label: "\u{1F393} T\u00e9cnico Profissional" },
    { value: "curta_duracao", label: "\u26A1 Curta Dura\u00e7\u00e3o" },
  ];

  const statusFilterOptions = [
    { value: "all", label: "Todos os Status" },
    { value: "ativo", label: "\u2705 Ativos" },
    { value: "inativo", label: "\u274C Inativos" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <PageHeader>
        <div>
          <PageHeaderTitle icon={<BookOpen className="h-8 w-8" />}>
            Gest\u00e3o de Cursos
          </PageHeaderTitle>
          <PageHeaderSubtitle>
            {stats.total} curso{stats.total !== 1 ? 's' : ''} cadastrado{stats.total !== 1 ? 's' : ''}
          </PageHeaderSubtitle>
        </div>

        <PageHeaderActions>
          <Button
            onClick={handleExportCourses}
            variant="outline"
            className="border-2 border-slate-300 hover:border-slate-400"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          {!readOnly && (
            <GradientButton onClick={onAddCourse}>
              <Plus className="h-5 w-5" />
              Novo Curso
            </GradientButton>
          )}
        </PageHeaderActions>
      </PageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="Total" value={stats.total} color="slate" />
        <StatCard icon={GraduationCap} label="Ativos" value={stats.ativos} color="green" />
        <StatCard icon={BookOpen} label="Inativos" value={stats.inativos} color="gray" />
        <StatCard icon={DollarSign} label="Receita Potencial" value={formatCurrency(stats.receitaTotal)} color="brand" gradientText />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar
          placeholder="Buscar por nome ou c\u00f3digo..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <FilterSelect
          value={filterType}
          onChange={setFilterType}
          options={typeFilterOptions}
          minWidth="200px"
        />

        <FilterSelect
          value={filterStatus}
          onChange={setFilterStatus}
          options={statusFilterOptions}
          minWidth="160px"
        />
      </div>

      {/* Loading State */}
      {isLoading ? (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-[#F5821F] mb-4" />
              <p className="text-[#004B87] font-medium">Carregando cursos...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredCourses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={hasActiveFilters ? "Nenhum curso encontrado" : "Nenhum curso cadastrado"}
          description={hasActiveFilters
            ? "Tente ajustar os filtros de busca"
            : "Comece adicionando o primeiro curso da institui\u00e7\u00e3o"
          }
          action={!hasActiveFilters && !readOnly ? (
            <GradientButton onClick={onAddCourse}>
              <Plus className="h-4 w-4" />
              Adicionar Primeiro Curso
            </GradientButton>
          ) : undefined}
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {/* Table Header */}
          <div className="bg-slate-50 border-b-2 border-slate-200 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Curso</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Tipo</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Dura\u00e7\u00e3o</span>
              </div>
              <div className={readOnly && !onViewCourse ? "col-span-4" : "col-span-3"}>
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Mensalidade</span>
              </div>
              {(!readOnly || onViewCourse) && (
                <div className="col-span-1 text-right">
                  <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">{readOnly ? 'Detalhes' : 'A\u00e7\u00f5es'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/80 transition-colors"
              >
                {/* Course Column */}
                <div className="col-span-4 flex items-center gap-3">
                  <div className={`h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                    course.status === 'inativo' ? 'opacity-50 grayscale' : ''
                  }`}>
                    <span className="text-white font-bold text-lg">
                      {course.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-800 truncate">
                        {course.nome}
                      </h3>
                      {course.status === 'inativo' && (
                        <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] px-1.5 py-0">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#F5821F] font-medium">{course.codigo}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-500">
                        {course.categoria?.nome || 'Sem categoria'}
                      </span>
                      {course.niveis && course.niveis.length > 0 && (
                        <>
                          <span className="text-xs text-slate-400">{'\u2022'}</span>
                          <span className="text-xs text-purple-600">
                            {course.niveis.length} niveis
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Type Column */}
                <div className="col-span-2">
                  <Badge className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
                    <span className="mr-1.5">{getTipoCursoIcon(course.tipo_curso || '')}</span>
                    {getTipoCursoLabel(course.tipo_curso || '')}
                  </Badge>
                </div>

                {/* Duration Column */}
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <Calendar className="h-3 w-3 text-slate-400" />
                    <span className="font-medium">{getDuracaoText(course.tipo_curso || '', course.duracao_valor)}</span>
                  </div>
                </div>

                {/* Price Column */}
                <div className={readOnly && !onViewCourse ? "col-span-4" : "col-span-3"}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-[#F5821F]" />
                      <span className="font-bold text-sm text-[#004B87]">{formatCurrency(course.mensalidade)}</span>
                    </div>
                    {course.permite_bolsa && (
                      <div className="text-xs text-[#F5821F] font-medium flex items-center gap-1">
                        {'\u{1F393}'} Permite bolsa
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Column */}
                {!readOnly ? (
                  <div className="col-span-1 flex justify-end items-center gap-2">
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-[#004B87] hover:bg-[#003868] text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                      onClick={() => onEditCourse(course)}
                      title="Editar curso"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => course.id && onDeleteCourse(course.id)}
                      className="h-10 w-10 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg border border-red-200 hover:border-red-300 transition-all"
                      title="Desativar curso"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : onViewCourse && (
                  <div className="col-span-1 flex justify-end items-center">
                    <Button
                      size="icon"
                      className="h-10 w-10 bg-[#004B87] hover:bg-[#003868] text-white rounded-lg shadow-sm hover:shadow-md transition-all"
                      onClick={() => onViewCourse(course)}
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && filteredCourses.length > 0 && (
        <ListFooter
          showing={filteredCourses.length}
          total={safeCourses.length}
          hasFilters={hasActiveFilters}
          onClearFilters={() => {
            setSearchTerm("");
            setFilterType("all");
            setFilterStatus("all");
          }}
        />
      )}
    </div>
  );
}
