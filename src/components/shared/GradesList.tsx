import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  TrendingUp,
  TrendingDown,
  Minus,
  BookOpen,
  GraduationCap,
  Star,
  Trophy,
  Target,
  AlertCircle
} from "lucide-react";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { SearchBar, FilterSelect } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ListFooter } from "@/components/ui/info-row";

export interface Grade {
  id: number;
  studentId: number;
  studentName: string;
  course: string;
  subject: string;
  grade: number;
  maxGrade: number;
  date: string;
  status: 'excellent' | 'good' | 'average' | 'below' | 'failed';
  observations?: string;
}

interface GradesListProps {
  grades: Grade[];
}

const MOCK_GRADES: Grade[] = [
  {
    id: 1,
    studentId: 1,
    studentName: "João Silva",
    course: "Engenharia Informática",
    subject: "Programação I",
    grade: 18.5,
    maxGrade: 20,
    date: "2025-01-20",
    status: "excellent"
  },
  {
    id: 2,
    studentId: 2,
    studentName: "Maria Santos",
    course: "Gestão de Empresas",
    subject: "Contabilidade",
    grade: 16,
    maxGrade: 20,
    date: "2025-01-20",
    status: "good"
  },
  {
    id: 3,
    studentId: 3,
    studentName: "Pedro Lopes",
    course: "Engenharia Informática",
    subject: "Algoritmos",
    grade: 14.5,
    maxGrade: 20,
    date: "2025-01-19",
    status: "good"
  },
  {
    id: 4,
    studentId: 4,
    studentName: "Ana Costa",
    course: "Marketing",
    subject: "Marketing Digital",
    grade: 12,
    maxGrade: 20,
    date: "2025-01-19",
    status: "average"
  },
  {
    id: 5,
    studentId: 5,
    studentName: "Carlos Mendes",
    course: "Engenharia Civil",
    subject: "Estruturas",
    grade: 9.5,
    maxGrade: 20,
    date: "2025-01-18",
    status: "below"
  },
  {
    id: 6,
    studentId: 6,
    studentName: "Sofia Rodrigues",
    course: "Direito",
    subject: "Direito Constitucional",
    grade: 19,
    maxGrade: 20,
    date: "2025-01-18",
    status: "excellent"
  },
  {
    id: 7,
    studentId: 7,
    studentName: "Bruno Alves",
    course: "Medicina",
    subject: "Anatomia",
    grade: 7.5,
    maxGrade: 20,
    date: "2025-01-17",
    status: "failed"
  },
  {
    id: 8,
    studentId: 8,
    studentName: "Inês Ferreira",
    course: "Arquitetura",
    subject: "Desenho Técnico",
    grade: 17.5,
    maxGrade: 20,
    date: "2025-01-17",
    status: "excellent"
  }
];

export function GradesList({ grades: providedGrades }: GradesListProps) {
  const grades = providedGrades.length > 0 ? providedGrades : MOCK_GRADES;

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Grade['status']>("all");

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grade.course.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || grade.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: grades.length,
    excellent: grades.filter(g => g.status === 'excellent').length,
    good: grades.filter(g => g.status === 'good').length,
    average: grades.filter(g => g.status === 'average').length,
    below: grades.filter(g => g.status === 'below').length,
    failed: grades.filter(g => g.status === 'failed').length,
    avgGrade: grades.reduce((sum, g) => sum + g.grade, 0) / grades.length || 0
  };

  const getStatusInfo = (status: Grade['status']) => {
    const statusMap = {
      excellent: {
        label: 'Excelente',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Trophy,
        trend: TrendingUp,
        trendColor: 'text-purple-600'
      },
      good: {
        label: 'Bom',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: Star,
        trend: TrendingUp,
        trendColor: 'text-green-600'
      },
      average: {
        label: 'Médio',
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Target,
        trend: Minus,
        trendColor: 'text-yellow-600'
      },
      below: {
        label: 'Abaixo',
        color: 'bg-orange-100 text-orange-700 border-orange-200',
        icon: AlertCircle,
        trend: TrendingDown,
        trendColor: 'text-orange-600'
      },
      failed: {
        label: 'Reprovado',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: AlertCircle,
        trend: TrendingDown,
        trendColor: 'text-red-600'
      }
    };
    return statusMap[status];
  };

  const getGradeColor = (grade: number, maxGrade: number) => {
    const percentage = (grade / maxGrade) * 100;
    if (percentage >= 90) return 'text-purple-600';
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const statusFilterOptions = [
    { value: "all", label: "Todos os Desempenhos" },
    { value: "excellent", label: "\u{1F3C6} Excelente" },
    { value: "good", label: "\u2B50 Bom" },
    { value: "average", label: "\u{1F3AF} Médio" },
    { value: "below", label: "\u26A0\uFE0F Abaixo" },
    { value: "failed", label: "\u274C Reprovado" }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-50 to-purple-50/30 rounded-2xl p-8 border border-slate-200/60">
        <PageHeader className="bg-transparent p-0 border-0 rounded-none mb-6">
          <div>
            <PageHeaderTitle icon={<Award className="h-8 w-8" />}>
              Gestão de Notas
            </PageHeaderTitle>
            <PageHeaderSubtitle>
              {stats.total} avaliação{stats.total !== 1 ? 'ões' : ''} registrada{stats.total !== 1 ? 's' : ''}
            </PageHeaderSubtitle>
          </div>

          <PageHeaderActions>
            <div className="bg-white rounded-xl px-6 py-3 border-2 border-[#F5821F]/20">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-[#F5821F]" />
                <div>
                  <p className="text-xs text-slate-500">Média Geral</p>
                  <p className="text-2xl font-bold text-[#004B87]">
                    {stats.avgGrade.toFixed(1)}<span className="text-sm text-slate-400">/20</span>
                  </p>
                </div>
              </div>
            </div>
          </PageHeaderActions>
        </PageHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 border-2 border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-slate-600" />
              <span className="text-xs text-slate-600 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-purple-700 font-medium">Excelente</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{stats.excellent}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-700 font-medium">Bom</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{stats.good}</p>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-yellow-600" />
              <span className="text-xs text-yellow-700 font-medium">Médio</span>
            </div>
            <p className="text-2xl font-bold text-yellow-700">{stats.average}</p>
          </div>

          <div className="bg-orange-50 rounded-xl p-4 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-700 font-medium">Abaixo</span>
            </div>
            <p className="text-2xl font-bold text-orange-700">{stats.below}</p>
          </div>

          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700 font-medium">Reprovados</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.failed}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar
          placeholder="Buscar por estudante, disciplina ou curso..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <FilterSelect
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as "all" | Grade['status'])}
          options={statusFilterOptions}
        />
      </div>

      {filteredGrades.length === 0 ? (
        <EmptyState
          icon={Award}
          title="Nenhuma nota encontrada"
          description="Tente ajustar os filtros de busca"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredGrades.map((grade) => {
            const statusInfo = getStatusInfo(grade.status);
            const StatusIcon = statusInfo.icon;
            const TrendIcon = statusInfo.trend;
            const percentage = ((grade.grade / grade.maxGrade) * 100).toFixed(0);

            return (
              <Card
                key={grade.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white"
              >
                <div className={`h-1.5 bg-gradient-to-r ${
                  grade.status === 'excellent' ? 'from-purple-500 to-purple-600' :
                  grade.status === 'good' ? 'from-green-500 to-green-600' :
                  grade.status === 'average' ? 'from-yellow-500 to-yellow-600' :
                  grade.status === 'below' ? 'from-orange-500 to-orange-600' :
                  'from-red-500 to-red-600'
                }`}></div>

                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-white font-bold text-lg">
                          {grade.studentName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-[#004B87] truncate" title={grade.studentName}>
                          {grade.studentName}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">{grade.course}</p>
                        <Badge className={`${statusInfo.color} border text-[10px] mt-1.5`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getGradeColor(grade.grade, grade.maxGrade)}`}>
                        {grade.grade}
                      </div>
                      <div className="text-xs text-slate-400">de {grade.maxGrade}</div>
                      <div className={`text-xs font-semibold ${statusInfo.trendColor} flex items-center gap-0.5 justify-end mt-1`}>
                        <TrendIcon className="h-3 w-3" />
                        {percentage}%
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-700 truncate" title={grade.subject}>
                          {grade.subject}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-4 w-4 text-green-600" />
                      </div>
                      <span className="text-slate-600 text-xs">
                        Avaliado em {formatDate(grade.date)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          grade.status === 'excellent' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                          grade.status === 'good' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          grade.status === 'average' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          grade.status === 'below' ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredGrades.length > 0 && (
        <ListFooter
          showing={filteredGrades.length}
          total={grades.length}
          hasFilters={!!(searchTerm || statusFilter !== 'all')}
          onClearFilters={() => {
            setSearchTerm("");
            setStatusFilter("all");
          }}
        />
      )}
    </div>
  );
}
