// src/components/shared/CourseList.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  GraduationCap,
  Filter,
  Loader2,
  Download
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export function CourseList({
  courses,
  isLoading = false,
  onAddCourse,
  onEditCourse,
  onDeleteCourse
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
      'tecnico': 'Técnico',
      'tecnico_superior': 'Técnico Superior',
      'tecnico_profissional': 'Técnico Profissional',
      'curta_duracao': 'Curta Duração'
    };
    return labels[tipo] || tipo;
  };

  const getTipoCursoIcon = (tipo: string) => {
    const icons: Record<string, string> = {
      'tecnico': '📅',
      'tecnico_superior': '📚',
      'tecnico_profissional': '🎓',
      'curta_duracao': '⚡'
    };
    return icons[tipo] || '';
  };

  const getDuracaoText = (tipo: string, valor: number) => {
    if (tipo === 'tecnico_superior') {
      return `${valor} ${valor === 1 ? 'Ano' : 'Anos'}`;
    }
    return `${valor} ${valor === 1 ? 'Mês' : 'Meses'}`;
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.codigo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || course.tipo_curso === filterType;
    const matchesStatus = filterStatus === "all" || course.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: courses.length,
    ativos: courses.filter(c => c.status === 'ativo').length,
    inativos: courses.filter(c => c.status === 'inativo').length,
    receitaTotal: courses.reduce((sum, c) => sum + c.mensalidade, 0)
  };

  const handleExportCourses = () => {
    const csvContent = [
      ["ID", "Nome", "Código", "Categoria", "Tipo", "Duração", "Mensalidade", "Status"],
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

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-[#004B87] mb-2 flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              Gestão de Cursos
            </h2>
            <p className="text-sm text-[#004B87]/70">
              {stats.total} curso{stats.total !== 1 ? 's' : ''} cadastrado{stats.total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportCourses}
              variant="outline"
              className="border-2 border-slate-300 hover:border-slate-400"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button 
              onClick={onAddCourse}
              className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Curso
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Ativos</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.ativos}</p>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-700 font-medium">Inativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-700">{stats.inativos}</p>
          </div>

          <div className="bg-gradient-to-br from-[#004B87]/10 to-[#F5821F]/10 rounded-xl p-4 border-2 border-[#004B87]/20">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-[#004B87]" />
              <span className="text-xs text-[#004B87] font-medium">Receita Potencial</span>
            </div>
            <p className="text-xl font-bold bg-gradient-to-r from-[#004B87] to-[#F5821F] bg-clip-text text-transparent">
              {formatCurrency(stats.receitaTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome ou código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] text-base"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[200px] bg-white"
        >
          <option value="all">Todos os Tipos</option>
          <option value="tecnico">📅 Técnico</option>
          <option value="tecnico_superior">📚 Técnico Superior</option>
          <option value="tecnico_profissional">🎓 Técnico Profissional</option>
          <option value="curta_duracao">⚡ Curta Duração</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[160px] bg-white"
        >
          <option value="all">Todos os Status</option>
          <option value="ativo">✅ Ativos</option>
          <option value="inativo">❌ Inativos</option>
        </select>
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
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[#004B87]">
                {searchTerm || filterType !== "all" || filterStatus !== "all" 
                  ? "Nenhum curso encontrado"
                  : "Nenhum curso cadastrado"
                }
              </h3>
              <p className="text-sm text-slate-500 text-center mb-6">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando o primeiro curso da instituição"
                }
              </p>
              {!searchTerm && filterType === "all" && filterStatus === "all" && (
                <Button 
                  onClick={onAddCourse}
                  className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Curso
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
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
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Duração</span>
              </div>
              <div className="col-span-3">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Mensalidade</span>
              </div>
              <div className="col-span-1 text-right">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Ações</span>
              </div>
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
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-purple-600">
                            {course.niveis.length} níveis
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
                <div className="col-span-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-3 w-3 text-[#F5821F]" />
                      <span className="font-bold text-sm text-[#004B87]">{formatCurrency(course.mensalidade)}</span>
                    </div>
                    {course.permite_bolsa && (
                      <div className="text-xs text-[#F5821F] font-medium flex items-center gap-1">
                        🎓 Permite bolsa
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Column */}
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
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      {!isLoading && filteredCourses.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredCourses.length}</span> de{" "}
            <span className="font-semibold">{courses.length}</span> cursos
          </p>
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setFilterStatus("all");
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