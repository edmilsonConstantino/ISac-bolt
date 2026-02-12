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
  LayoutList,
  Key,
  CreditCard,
  CheckCircle2,
  XCircle,
  Download
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
                  className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-md overflow-hidden bg-white rounded-2xl"
                >
                  {/* Barra superior gradiente duplo */}
                  <div className="h-1.5 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]" />

                  <CardContent className="p-5">
                    {/* Header: avatar + nome + delete */}
                    <div className="flex items-start gap-3 mb-4">
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-base">
                            {getInitial(student.name)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                          student.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                        }`} />
                      </div>

                      {/* Nome + badge */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight mb-1" title={student.name || 'Sem nome'}>
                          {student.name || 'Sem nome'}
                        </h3>
                        <Badge
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border-0 ${
                            student.status === "active"
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {student.status === "active" ? "✓ Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      {/* Botão delete */}
                      {permissions.canDelete && onDeleteStudent && (
                        <button
                          onClick={() => onDeleteStudent(student.id)}
                          className="flex-shrink-0 h-7 w-7 rounded-lg bg-red-50 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-all duration-200"
                          title="Remover"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Dados do estudante */}
                    <div className="bg-slate-50 rounded-xl p-3 space-y-2.5 mb-4 border border-slate-100">
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                        <span className="truncate text-slate-600" title={student.email || 'Sem email'}>
                          {student.email || 'Sem email'}
                        </span>
                      </div>

                      {student.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                          <span className="text-slate-600">{student.phone}</span>
                        </div>
                      )}

                      {showClassInfo && (
                        <div className="flex items-center gap-2 text-xs">
                          <BookOpen className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                          <span className="font-medium text-slate-700 truncate" title={student.className || 'Sem turma'}>
                            {student.className || 'Sem turma'}
                          </span>
                        </div>
                      )}

                      {student.enrollmentDate && (
                        <>
                          <div className="h-px bg-slate-200" />
                          <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3 w-3 text-[#F5821F] flex-shrink-0" />
                            <span className="text-slate-600">
                              {new Date(student.enrollmentDate).toLocaleDateString('pt-MZ')}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Métricas (nota + presença) */}
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
                    <div className="flex gap-2">
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
              <div className="bg-slate-50 border-b-2 border-slate-200 px-6 py-4">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Estudante</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Status</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Contato</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Turma</span>
                  </div>
                  <div className="col-span-1 text-right">
                    <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Ações</span>
                  </div>
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
                        <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-bold text-base">
                            {getInitial(student.name)}
                          </span>
                        </div>
                        <div className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm ${
                          student.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                        }`} />
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
                          className="h-10 w-10 bg-[#004B87] hover:bg-[#003868] text-white rounded-lg shadow-md"
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