// src/components/shared/StudentModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  MessageSquare,
  Eye,
  X,
  Download,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  GraduationCap,
} from "lucide-react";
import { Student, Permission } from "../../types";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  classId: number;
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin' | 'academic_admin';
  onSendEmailToAll?: () => void;
  onChatWithStudent?: (student: Student) => void;
  onViewStudentProfile?: (student: Student) => void;
}

export function StudentModal({
  isOpen,
  onClose,
  students,
  className,
  classId,
  permissions,
  currentUserRole,
  onSendEmailToAll,
  onChatWithStudent,
  onViewStudentProfile
}: StudentModalProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const getGradeColor = (grade: number) => {
    if (grade >= 14) return "text-green-600";
    if (grade >= 10) return "text-blue-600";
    return "text-red-600";
  };

  const getGradeStatus = (grade: number) => {
    if (grade >= 18) return { label: "Excelente", class: "bg-purple-100 text-purple-700 border-purple-200" };
    if (grade >= 14) return { label: "Bom", class: "bg-green-100 text-green-700 border-green-200" };
    if (grade >= 10) return { label: "Aprovado", class: "bg-blue-100 text-blue-700 border-blue-200" };
    return { label: "Reprovado", class: "bg-red-100 text-red-700 border-red-200" };
  };

  const activeStudents = students.filter(s => s.status === "active");
  const inactiveStudents = students.filter(s => s.status === "inactive");

  const averageGrade = students.length > 0
    ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length)
    : 0;

  const averageAttendance = students.length > 0
    ? Math.round(students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length)
    : 0;

  const filteredStudents = students.filter(student => {
    const matchesSearch =
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const hasFilters = searchTerm !== "" || statusFilter !== "all";

  const handleExport = () => {
    const headers = ['Nome', 'Email', 'Telefone', 'Status', 'Média', 'Presença'];
    const rows = filteredStudents.map(s => [
      s.name || '',
      s.email || '',
      s.phone || '',
      s.status === 'active' ? 'Ativo' : 'Inativo',
      s.grade?.toFixed(1) || '0',
      s.attendance ? `${s.attendance}%` : '-'
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `estudantes_${className.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden rounded-2xl border-0 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-6 pt-6 pb-8 relative">
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Estudantes da Turma
              </DialogTitle>
              <p className="text-blue-200 text-sm mt-1">{className}</p>
            </DialogHeader>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3 mt-5">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Users className="h-3 w-3 text-blue-200" />
                  <span className="text-[10px] text-blue-200 font-medium uppercase">Total</span>
                </div>
                <p className="text-xl font-bold text-white">{students.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle className="h-3 w-3 text-green-300" />
                  <span className="text-[10px] text-green-200 font-medium uppercase">Ativos</span>
                </div>
                <p className="text-xl font-bold text-white">{activeStudents.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <XCircle className="h-3 w-3 text-red-300" />
                  <span className="text-[10px] text-red-200 font-medium uppercase">Inativos</span>
                </div>
                <p className="text-xl font-bold text-white">{inactiveStudents.length}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <TrendingUp className="h-3 w-3 text-yellow-300" />
                  <span className="text-[10px] text-yellow-200 font-medium uppercase">Média</span>
                </div>
                <p className="text-xl font-bold text-white">{averageGrade.toFixed(1)}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <Calendar className="h-3 w-3 text-purple-300" />
                  <span className="text-[10px] text-purple-200 font-medium uppercase">Presença</span>
                </div>
                <p className="text-xl font-bold text-white">{averageAttendance}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="px-6 -mt-3 relative z-10">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-3 flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar estudante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 border-slate-200 text-sm"
              />
            </div>
            <div className="flex gap-1.5">
              {[
                { value: "all" as const, label: "Todos" },
                { value: "active" as const, label: "Ativos" },
                { value: "inactive" as const, label: "Inativos" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={`px-3 h-9 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === opt.value
                      ? "bg-[#004B87] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="h-9 px-3 border-slate-200 text-slate-600"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Nenhum estudante encontrado</p>
              <p className="text-sm text-slate-400 mt-1">
                {searchTerm ? "Tente ajustar a busca" : "Não há estudantes nesta turma"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredStudents.map((student) => {
                const isActive = student.status === "active";
                const gradeStatus = getGradeStatus(student.grade);

                return (
                  <div
                    key={student.id}
                    className={`rounded-xl p-4 border-2 transition-all hover:shadow-md ${
                      isActive
                        ? "bg-white border-slate-200 hover:border-[#004B87]/30"
                        : "bg-slate-50/50 border-slate-200 opacity-75"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shadow-sm ${
                          isActive
                            ? "bg-gradient-to-br from-[#004B87] to-[#0066B3]"
                            : "bg-gradient-to-br from-slate-400 to-slate-500"
                        }`}>
                          <span className="text-white font-bold text-base">
                            {student.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                          isActive ? "bg-emerald-500" : "bg-slate-300"
                        }`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-sm text-slate-800 truncate">
                            {student.name || 'Sem nome'}
                          </h4>
                          <Badge className={`text-[10px] px-1.5 py-0 border ${
                            isActive
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : "bg-slate-100 text-slate-500 border-slate-200"
                          }`}>
                            {isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email || '-'}
                          </span>
                          {student.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </span>
                          )}
                          {student.enrollmentDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(student.enrollmentDate).toLocaleDateString('pt-MZ')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Grade */}
                      <div className="flex items-center gap-3">
                        <div className="text-center px-3">
                          <div className={`text-lg font-bold ${getGradeColor(student.grade)}`}>
                            {student.grade?.toFixed(1) || '0.0'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">Média</div>
                        </div>

                        {student.attendance !== undefined && (
                          <div className="text-center px-3 border-l border-slate-200">
                            <div className={`text-lg font-bold ${
                              (student.attendance || 0) >= 75 ? "text-emerald-600" : "text-red-600"
                            }`}>
                              {student.attendance}%
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">Presença</div>
                          </div>
                        )}

                        <Badge className={`${gradeStatus.class} border text-[10px] px-2 py-0.5 font-semibold ml-1`}>
                          {gradeStatus.label}
                        </Badge>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1.5 ml-2">
                        {currentUserRole === 'teacher' && onChatWithStudent && (
                          <button
                            onClick={() => onChatWithStudent(student)}
                            className="h-8 px-2.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all text-xs font-medium flex items-center gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {permissions.canViewDetails && onViewStudentProfile && (
                          <button
                            onClick={() => onViewStudentProfile(student)}
                            className="h-8 px-2.5 rounded-lg bg-blue-50 text-[#004B87] hover:bg-blue-100 border border-blue-200 transition-all text-xs font-medium flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Perfil</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            {filteredStudents.length} de {students.length} estudantes
            {hasFilters && (
              <button
                onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                className="ml-2 text-[#F5821F] hover:text-[#E07318] font-medium"
              >
                Limpar filtros
              </button>
            )}
          </p>
          <Button
            variant="outline"
            onClick={onClose}
            className="h-9 px-5 border-2 border-slate-200 hover:border-slate-300 font-medium text-sm"
          >
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
