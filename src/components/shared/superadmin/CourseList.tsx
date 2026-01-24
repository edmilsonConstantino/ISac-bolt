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
  Loader2
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Course {
  id?: number;
  nome: string;
  codigo: string;
  categoria_id?: number;        // ✨ ADICIONAR
  categoria?: Categoria;        // ✨ ADICIONAR
  tipo_curso?: 'tecnico' | 'tecnico_superior' | 'tecnico_profissional' | 'curta_duracao'; // manter
  duracao_valor: number;
  regime: 'laboral' | 'pos_laboral' | 'ambos';
  mensalidade: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  niveis?: Nivel[];             // ✨ ADICIONAR
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
      'tecnico': '📅 Técnico',
      'tecnico_superior': '📚 Técnico Superior',
      'tecnico_profissional': '🎓 Técnico Profissional',
      'curta_duracao': '⚡ Curta Duração'
    };
    return labels[tipo] || tipo;
  };

  const getRegimeLabel = (regime: string) => {
    const labels: Record<string, string> = {
      'laboral': '☀️ Laboral',
      'pos_laboral': '🌙 Pós-Laboral',
      'ambos': '🔄 Ambos'
    };
    return labels[regime] || regime;
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

  return (
    <div className="space-y-6">
      {/* Stats Cards - Cores ISAC */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2 border-[#004B87]/20 hover:border-[#004B87] transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#004B87]">
              Total de Cursos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#004B87]">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#F5821F]/20 hover:border-[#F5821F] transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#F5821F]">
              Cursos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#F5821F]">{stats.ativos}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-slate-300 hover:border-slate-400 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">
              Cursos Inativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-400">{stats.inativos}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#004B87]/30 bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 hover:border-[#004B87] transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-[#004B87]">
              Receita Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold bg-gradient-to-r from-[#004B87] to-[#F5821F] bg-clip-text text-transparent">
              {formatCurrency(stats.receitaTotal)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="shadow-lg border-2 border-[#004B87]/20">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#F5821F] to-[#FF9933] flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                Gestão de Cursos
              </CardTitle>
              <CardDescription className="mt-2">
                Gerencie todos os cursos oferecidos pela instituição
              </CardDescription>
            </div>
            <Button 
              onClick={onAddCourse}
              className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Curso
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#004B87]" />
              <Input
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 border-[#004B87]/30 focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="border-2 border-[#004B87]/30 focus:border-[#F5821F]">
                <SelectValue placeholder="Tipo de Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="tecnico">📅 Técnico</SelectItem>
                <SelectItem value="tecnico_superior">📚 Técnico Superior</SelectItem>
                <SelectItem value="tecnico_profissional">🎓 Técnico Profissional</SelectItem>
                <SelectItem value="curta_duracao">⚡ Curta Duração</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="border-2 border-[#004B87]/30 focus:border-[#F5821F]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">✅ Ativos</SelectItem>
                <SelectItem value="inativo">❌ Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-[#F5821F] mb-4" />
              <p className="text-[#004B87] font-medium">Carregando cursos...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 mx-auto text-[#004B87]/30 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-[#004B87]">
                {searchTerm || filterType !== "all" || filterStatus !== "all" 
                  ? "Nenhum curso encontrado"
                  : "Nenhum curso cadastrado"
                }
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando o primeiro curso da instituição"
                }
              </p>
              {!searchTerm && filterType === "all" && filterStatus === "all" && (
                <Button 
                  onClick={onAddCourse}
                  className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Curso
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-lg border-2 border-[#004B87]/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-[#004B87]/10 to-[#F5821F]/10 hover:from-[#004B87]/15 hover:to-[#F5821F]/15">
                    <TableHead className="font-bold text-[#004B87]">Curso</TableHead>
                    <TableHead className="font-bold text-[#004B87]">Tipo</TableHead>
                    <TableHead className="font-bold text-[#004B87]">Duração</TableHead>
                    <TableHead className="font-bold text-[#004B87]">Regime</TableHead>
                    <TableHead className="font-bold text-[#004B87]">Mensalidade</TableHead>
                    <TableHead className="font-bold text-[#004B87]">Status</TableHead>
                    <TableHead className="text-right font-bold text-[#004B87]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course, index) => (
                    <TableRow 
                      key={course.id}
                      className={`hover:bg-[#F5821F]/5 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <TableCell>
                        <div>
                          <div className="font-semibold text-[#004B87]">{course.nome}</div>
                          <div className="text-sm text-[#F5821F] font-medium">{course.codigo}</div>
                          <span className="text-xs text-slate-500">
                            {course.categoria?.nome || 'Sem categoria'}
                          </span>
                          {course.niveis && course.niveis.length > 0 && (
                            <span className="text-xs text-purple-600">
                              {course.niveis.length} níveis
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal border-[#004B87] text-[#004B87] bg-[#004B87]/5">
                          {getTipoCursoLabel(course.tipo_curso)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#F5821F]" />
                          <span className="text-slate-700 font-medium">{getDuracaoText(course.tipo_curso, course.duracao_valor)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-[#F5821F]/10 text-[#F5821F] border border-[#F5821F]/30">
                          {getRegimeLabel(course.regime)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-[#F5821F]" />
                          <span className="font-bold text-[#004B87]">{formatCurrency(course.mensalidade)}</span>
                        </div>
                        {course.permite_bolsa && (
                          <div className="text-xs text-[#F5821F] mt-1 font-medium flex items-center gap-1">
                            🎓 Permite bolsa
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={course.status === 'ativo' 
                            ? 'bg-[#F5821F] text-white border-[#F5821F] shadow-sm' 
                            : 'bg-slate-300 text-slate-700 border-slate-400'}
                        >
                          {course.status === 'ativo' ? '✓ Ativo' : '⏸ Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEditCourse(course)}
                            title="Editar curso"
                            className="hover:bg-[#004B87]/10 text-[#004B87]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => course.id && onDeleteCourse(course.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Desativar curso"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Results Count */}
          {!isLoading && filteredCourses.length > 0 && (
            <div className="text-sm text-[#004B87] font-medium text-center pt-4 border-t-2 border-[#F5821F]/20">
              Exibindo {filteredCourses.length} de {courses.length} curso(s)
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}