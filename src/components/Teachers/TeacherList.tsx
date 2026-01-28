// src/components/shared/TeacherList.tsx - VERSÃO MODERNA E PROFISSIONAL
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
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  GraduationCap,
  CheckCircle,
  X,
  Briefcase
} from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  email: string;
  phone?: string;
  classes: number;
  students: number;
  status: 'active' | 'inactive';
  specialization?: string;
  contractType?: 'full-time' | 'part-time' | 'freelance' | 'substitute';
  experience?: string;
  qualifications?: string;
  salary?: number;
}

interface Permission {
  canEdit: boolean;
  canDelete: boolean;
  canAdd: boolean;
  canViewDetails: boolean;
}

interface TeacherListProps {
  teachers: Teacher[];
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin';
  onViewTeacherProfile?: (teacher: Teacher) => void;
  onEditTeacher?: (teacher: Teacher) => void;
  onDeleteTeacher?: (teacherId: number) => void;
  onToggleTeacherStatus?: (teacherId: number) => void;
  onAddTeacher?: () => void;
}

export function TeacherList({ 
  teachers, 
  permissions, 
  currentUserRole,
  onViewTeacherProfile,
  onEditTeacher,
  onDeleteTeacher,
  onToggleTeacherStatus,
  onAddTeacher
}: TeacherListProps) {

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [contractFilter, setContractFilter] = useState<string>("all");

  // Formatar moeda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  // Traduzir tipo de contrato
  const getContractTypeLabel = (type?: string) => {
    switch(type) {
      case 'full-time': return 'Integral';
      case 'part-time': return 'Parcial';
      case 'freelance': return 'Freelancer';
      case 'substitute': return 'Substituto';
      default: return 'N/A';
    }
  };

  // Filtrar docentes
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teacher.specialization && teacher.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || teacher.status === statusFilter;
    const matchesContract = contractFilter === "all" || teacher.contractType === contractFilter;
    return matchesSearch && matchesStatus && matchesContract;
  });

  // Verificar se há filtros ativos
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || contractFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header Section - Estilo Card com cores ISAC */}
      <div className="bg-gradient-to-br from-blue-50/60 via-slate-50 to-orange-50/40 rounded-xl p-6 border border-slate-200/60 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#004B87] mb-2">Docentes</h2>
            <div className="flex items-center gap-2 text-[#004B87]/70">
              <Users className="h-4 w-4" />
              <p className="text-sm">
                {hasActiveFilters 
                  ? `${filteredTeachers.length} docente${filteredTeachers.length !== 1 ? 's' : ''} encontrado${filteredTeachers.length !== 1 ? 's' : ''}`
                  : `${teachers.length} docente${teachers.length !== 1 ? 's' : ''} no sistema`
                }
              </p>
            </div>
          </div>
          
          {/* Ações */}
          <div className="flex gap-2">
            {permissions.canAdd && onAddTeacher && (
              <Button 
                onClick={onAddTeacher}
                className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Docente
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        {/* Campo de Busca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Buscar por nome, email ou especialização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 border-2 border-slate-200 focus:border-[#F5821F]"
          />
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>

          <select
            value={contractFilter}
            onChange={(e) => setContractFilter(e.target.value)}
            className="px-4 py-2 border-2 border-slate-200 rounded-lg text-sm focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
          >
            <option value="all">Todos os Contratos</option>
            <option value="full-time">Integral</option>
            <option value="part-time">Parcial</option>
            <option value="freelance">Freelancer</option>
            <option value="substitute">Substituto</option>
          </select>

          <Button variant="outline" className="border-2 border-slate-200">
            <Filter className="h-4 w-4 mr-2" />
            Mais Filtros
          </Button>
        </div>
      </div>

      {/* Lista de Cards */}
      {filteredTeachers.length === 0 ? (
        <Card className="shadow-lg border-0">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center justify-center">
              <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Nenhum docente encontrado</h3>
              <p className="text-sm text-slate-500 text-center mb-6 max-w-sm">
                {searchTerm ? "Tente ajustar os filtros de busca" : "Não há docentes cadastrados no sistema"}
              </p>
              {permissions.canAdd && onAddTeacher && !searchTerm && (
                <Button 
                  onClick={onAddTeacher}
                  variant="outline"
                  className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Docente
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <Card 
              key={teacher.id} 
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
                        <span className="text-white font-bold text-base">
                          {teacher.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      {/* Status Badge */}
                      <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                        teacher.status === "active" ? "bg-green-500" : "bg-red-500"
                      }`}></div>
                    </div>

                    {/* Nome e Status */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-[#004B87] truncate leading-tight">
                        {teacher.name}
                      </h3>
                      <Badge 
                        variant={teacher.status === "active" ? "default" : "destructive"}
                        className="text-[10px] mt-1 h-5"
                      >
                        {teacher.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>

                  {/* Botão de Deletar */}
                  {permissions.canDelete && onDeleteTeacher && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8 rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 border-2 border-red-200 hover:border-red-300 transition-all duration-200"
                      onClick={() => onDeleteTeacher(teacher.id)}
                      title="Remover docente"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Informações de Contato - Estilizadas */}
                <div className="space-y-1.5 mb-3 bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="h-3 w-3 text-[#004B87]" />
                    </div>
                    <span className="truncate text-slate-700">{teacher.email}</span>
                  </div>

                  {teacher.phone && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-3 w-3 text-[#004B87]" />
                      </div>
                      <span className="text-slate-700">{teacher.phone}</span>
                    </div>
                  )}

                  {teacher.specialization && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="h-3 w-3 text-[#004B87]" />
                      </div>
                      <span className="font-medium text-slate-700 truncate">{teacher.specialization}</span>
                    </div>
                  )}

                  {teacher.contractType && (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-6 w-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Briefcase className="h-3 w-3 text-[#004B87]" />
                      </div>
                      <span className="text-slate-700">{getContractTypeLabel(teacher.contractType)}</span>
                    </div>
                  )}
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-[#004B87]">
                      {teacher.classes}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Turmas</div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {teacher.students}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Estudantes</div>
                  </div>
                </div>

                {/* Salário (se houver) */}
                {teacher.salary && teacher.salary > 0 && (
                  <div className="text-center p-2 bg-orange-50 rounded-lg mb-3 border border-orange-200">
                    <div className="text-sm font-bold text-[#F5821F]">
                      {formatCurrency(teacher.salary)}
                    </div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Salário Mensal</div>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-2 pt-2.5 border-t border-slate-100">
                  {permissions.canViewDetails && onViewTeacherProfile && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 h-8 text-xs border-2 border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white transition-all"
                      onClick={() => onViewTeacherProfile(teacher)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver Perfil
                    </Button>
                  )}

                  {onToggleTeacherStatus && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`h-8 px-3 text-xs border-2 transition-all ${
                        teacher.status === "active" 
                          ? "border-red-300 text-red-600 hover:bg-red-50" 
                          : "border-green-300 text-green-600 hover:bg-green-50"
                      }`}
                      onClick={() => onToggleTeacherStatus(teacher.id)}
                      title={teacher.status === "active" ? "Desativar docente" : "Ativar docente"}
                    >
                      {teacher.status === "active" ? (
                        <X className="h-3 w-3" />
                      ) : (
                        <CheckCircle className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Rodapé com Total */}
      {filteredTeachers.length > 0 && (
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold">{filteredTeachers.length}</span> de{" "}
            <span className="font-semibold">{teachers.length}</span> docentes
          </p>
          {(searchTerm || statusFilter !== "all" || contractFilter !== "all") && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setContractFilter("all");
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