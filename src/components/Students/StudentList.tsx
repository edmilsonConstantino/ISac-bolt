// src/components/shared/StudentList.tsx - VERSÃO CORRIGIDA
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
  BookOpen,
  Edit,
  Trash2,
  Eye,
  Search,
  Calendar,
  Grid3x3,
  LayoutList
} from "lucide-react";
import { Student, Permission } from "../../types";

interface StudentListProps {
  students: Student[];
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin';
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
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // ✅ PROTEÇÃO CONTRA CAMPOS UNDEFINED
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.className?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // ✅ FUNÇÃO AUXILIAR PARA PEGAR INICIAL DO NOME
  const getInitial = (name: string | undefined) => {
    if (!name || name.length === 0) return '?';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-8 border border-slate-200/60">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-[#004B87] mb-2">
              {currentUserRole === 'teacher' ? 'Meus Estudantes' : 'Estudantes'}
            </h2>
            <div className="flex items-center gap-2 text-[#004B87]/70">
              <Users className="h-5 w-5" />
              <p className="text-sm">
                {students.length} estudante{students.length !== 1 ? 's' : ''} no sistema
              </p>
            </div>
          </div>

          {permissions.canAdd && onAddStudent && (
            <Button 
              onClick={onAddStudent}
              className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md h-12 px-6"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Novo Estudante
            </Button>
          )}
        </div>
      </div>

      {/* Barra de Pesquisa e Controles */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Buscar por nome, email ou turma..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] text-base"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 h-12 border-2 border-slate-200 rounded-xl text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20 min-w-[180px] bg-white"
        >
          <option value="all">Todos os Status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>

        {/* Toggle Grid/Lista */}
        <div className="flex border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 h-12 flex items-center gap-2 transition-colors ${
              viewMode === "grid" 
                ? "bg-[#F5821F] text-white" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Grid3x3 className="h-4 w-4" />
            <span className="text-sm font-medium">Grelha</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 h-12 flex items-center gap-2 transition-colors border-l-2 border-slate-200 ${
              viewMode === "list" 
                ? "bg-[#F5821F] text-white" 
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <LayoutList className="h-4 w-4" />
            <span className="text-sm font-medium">Lista</span>
          </button>
        </div>
      </div>

      {/* Estado Vazio */}
      {filteredStudents.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum estudante encontrado</h3>
              <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Não há estudantes cadastrados"}
              </p>
              {permissions.canAdd && onAddStudent && !searchTerm && (
                <Button 
                  onClick={onAddStudent}
                  variant="outline"
                  className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Estudante
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* VISUALIZAÇÃO EM GRELHA (Cards Compactos) */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map((student) => (
                <Card 
                  key={student.id} 
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white"
                >
                  <div className="h-2 bg-gradient-to-r from-[#004B87] to-[#0066B3]"></div>
                  
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {getInitial(student.name)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          student.status === "active" ? "bg-green-500" : "bg-red-500"
                        }`}></div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight" title={student.name || 'Sem nome'}>
                          {student.name || 'Sem nome'}
                        </h3>
                        <Badge 
                          variant={student.status === "active" ? "default" : "destructive"}
                          className="text-[10px] mt-1 h-5"
                        >
                          {student.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-3 bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="h-6 w-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-3 w-3 text-[#F5821F]" />
                        </div>
                        <span className="truncate text-slate-700" title={student.email || 'Sem email'}>
                          {student.email || 'Sem email'}
                        </span>
                      </div>

                      {student.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-6 w-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Phone className="h-3 w-3 text-[#F5821F]" />
                          </div>
                          <span className="text-slate-700">{student.phone}</span>
                        </div>
                      )}

                      {showClassInfo && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-6 w-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-3 w-3 text-[#F5821F]" />
                          </div>
                          <span className="font-medium text-slate-700 truncate" title={student.className || 'Sem turma'}>
                            {student.className || 'Sem turma'}
                          </span>
                        </div>
                      )}

                      {student.enrollmentDate && (
                        <div className="flex items-center gap-2 text-xs">
                          <div className="h-6 w-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-3 w-3 text-[#F5821F]" />
                          </div>
                          <span className="text-[10px] text-slate-600">
                            Matrícula: {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                    </div>

                    {(student.grade || student.attendance) && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {student.grade && (
                          <div className="text-center p-2 bg-blue-50 rounded-lg">
                            <div className="text-xl font-bold text-[#004B87]">
                              {student.grade.toFixed(1)}
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">Média</div>
                          </div>
                        )}
                        
                        {student.attendance && (
                          <div className="text-center p-2 bg-green-50 rounded-lg">
                            <div className="text-xl font-bold text-green-600">
                              {student.attendance}%
                            </div>
                            <div className="text-[10px] text-slate-600 mt-0.5">Presença</div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2.5 border-t border-slate-100">
                      {permissions.canViewDetails && (onViewStudent || onViewStudentProfile) && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1 h-9 text-xs border-2 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white transition-all"
                          onClick={() => {
                            if (onViewStudentProfile) {
                              onViewStudentProfile(student);
                            } else if (onViewStudent) {
                              onViewStudent(student);
                            }
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
                          className="flex-1 h-9 text-xs border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white transition-all"
                          onClick={() => onEditStudent(student)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" />
                          Editar
                        </Button>
                      )}

                      {permissions.canDelete && onDeleteStudent && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-9 w-9 border-2 border-red-200 text-red-500 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                          onClick={() => onDeleteStudent(student.id)}
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* VISUALIZAÇÃO EM LISTA (Tabela) */}
          {viewMode === "list" && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
              {/* Header da Tabela */}
              <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white px-6 py-4">
                <div className="grid grid-cols-12 gap-4 items-center font-semibold text-sm">
                  <div className="col-span-4">Estudante</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-3">Contato</div>
                  <div className="col-span-2">Turma</div>
                  <div className="col-span-1 text-right">Ações</div>
                </div>
              </div>

              {/* Linhas da Tabela */}
              <div className="divide-y divide-slate-100">
                {filteredStudents.map((student) => (
                  <div 
                    key={student.id}
                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 transition-colors"
                  >
                    {/* Estudante */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-lg">
                            {getInitial(student.name)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                          student.status === "active" ? "bg-green-500" : "bg-red-500"
                        }`}></div>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm text-slate-800 truncate" title={student.name || 'Sem nome'}>
                          {student.name || 'Sem nome'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {student.className || 'Sem turma'}
                        </p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Badge 
                        variant={student.status === "active" ? "default" : "destructive"}
                        className="bg-green-500 text-white text-xs"
                      >
                        ✓ {student.status === "active" ? "Em Dia" : "Inativo"}
                      </Badge>
                    </div>

                    {/* Contato */}
                    <div className="col-span-3">
                      <div className="text-sm text-slate-600 space-y-1">
                        <div className="truncate" title={student.email || 'Sem email'}>
                          {student.email || 'Sem email'}
                        </div>
                        {student.phone && (
                          <div className="text-xs text-slate-500">{student.phone}</div>
                        )}
                      </div>
                    </div>

                    {/* Turma */}
                    <div className="col-span-2">
                      <span className="text-sm text-slate-700 font-medium truncate block" title={student.className || 'Sem turma'}>
                        {student.className || 'Sem turma'}
                      </span>
                    </div>

                    {/* Ações */}
                    <div className="col-span-1 flex justify-end gap-2">
                      {permissions.canViewDetails && (onViewStudent || onViewStudentProfile) && (
                        <Button 
                          size="icon"
                          className="h-10 w-10 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white rounded-lg shadow-md"
                          onClick={() => {
                            if (onViewStudentProfile) onViewStudentProfile(student);
                            else if (onViewStudent) onViewStudent(student);
                          }}
                          title="Ver perfil"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}

                      {permissions.canEdit && onEditStudent && (
                        <Button 
                          size="icon"
                          className="h-10 w-10 bg-[#004B87] hover:bg-[#003868] text-white rounded-lg shadow-md"
                          onClick={() => onEditStudent(student)}
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {permissions.canDelete && onDeleteStudent && (
                        <Button 
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 text-red-500 hover:bg-red-50 rounded-lg"
                          onClick={() => onDeleteStudent(student.id)}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredStudents.length}</span> de{" "}
            <span className="font-semibold">{students.length}</span> estudantes
          </p>
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
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