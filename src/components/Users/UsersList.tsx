import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users,
  Search,
  Shield,
  User,
  GraduationCap,
  Calendar,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Key,
  Activity,
  UserPlus,
  Download,
  MoreHorizontal
} from "lucide-react";
import { Permission } from "@/types";
import { CreateUserModal } from "./CreateUserModal";
import { UserCredentialsModal } from "@/components/shared/UserCredentialsModal";
import { UserAccessHistoryModal } from "@/components/shared/UserAccessHistoryModal";
import { PageHeader, PageHeaderTitle, PageHeaderSubtitle, PageHeaderActions } from "@/components/ui/page-header";
import { SearchBar, FilterSelect } from "@/components/ui/search-bar";
import { EmptyState } from "@/components/ui/empty-state";
import { ListFooter } from "@/components/ui/info-row";
import { GradientButton } from "@/components/ui/gradient-button";

export interface SystemUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'academic_admin' | 'teacher' | 'student';
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

interface UsersListProps {
  users: SystemUser[];
  permissions: Permission;
  currentUserRole?: string;
  onViewUser?: (user: SystemUser) => void;
  onEditUser?: (user: SystemUser) => void;
  onDeleteUser?: (userId: number) => void;
  onCreateUser?: (userData: Partial<SystemUser>) => void;
  onUpdateUser?: (userId: number, userData: Partial<SystemUser>) => void;
}

export function UsersList({
  users,
  permissions,
  currentUserRole = 'admin',
  onViewUser,
  onEditUser,
  onDeleteUser,
  onCreateUser,
  onUpdateUser
}: UsersListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [createUserModal, setCreateUserModal] = useState(false);
  const [editUserModal, setEditUserModal] = useState<{ isOpen: boolean; user: SystemUser | null }>({
    isOpen: false,
    user: null
  });
  const [credentialsModal, setCredentialsModal] = useState<{ isOpen: boolean; user: SystemUser | null }>({
    isOpen: false,
    user: null
  });
  const [accessHistoryModal, setAccessHistoryModal] = useState<{ isOpen: boolean; user: SystemUser | null }>({
    isOpen: false,
    user: null
  });

  // Academic admin não deve ver super admins na lista
  const visibleUsers = currentUserRole === 'admin'
    ? users
    : users.filter(u => u.role !== 'admin');

  const filteredUsers = visibleUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: visibleUsers.length,
    admins: visibleUsers.filter(u => u.role === 'admin').length,
    academicAdmins: visibleUsers.filter(u => u.role === 'academic_admin').length,
    teachers: visibleUsers.filter(u => u.role === 'teacher').length,
    students: visibleUsers.filter(u => u.role === 'student').length,
    active: visibleUsers.filter(u => u.status === 'active').length,
    inactive: visibleUsers.filter(u => u.status === 'inactive').length
  };

  const getRoleInfo = (role: SystemUser['role']) => {
    const roleMap: Record<string, { label: string; color: string; icon: any; bgColor: string }> = {
      admin: {
        label: 'Super Admin',
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: Shield,
        bgColor: 'bg-red-50'
      },
      academic_admin: {
        label: 'Academic Admin',
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Shield,
        bgColor: 'bg-purple-50'
      },
      teacher: {
        label: 'Docente',
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: Users,
        bgColor: 'bg-blue-50'
      },
      student: {
        label: 'Estudante',
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: GraduationCap,
        bgColor: 'bg-green-50'
      }
    };
    return roleMap[role] || roleMap.student;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCreateUser = (userData: Partial<SystemUser>) => {
    if (onCreateUser) {
      onCreateUser(userData);
    }
    setCreateUserModal(false);
  };

  const handleEditUser = (user: SystemUser) => {
    setEditUserModal({ isOpen: true, user });
  };

  const handleUpdateUser = (userData: Partial<SystemUser>) => {
    if (editUserModal.user && onUpdateUser) {
      onUpdateUser(editUserModal.user.id, userData);
    }
    setEditUserModal({ isOpen: false, user: null });
  };

  const handleViewCredentials = (user: SystemUser) => {
    setCredentialsModal({ isOpen: true, user });
  };

  const handleViewAccessHistory = (user: SystemUser) => {
    setAccessHistoryModal({ isOpen: true, user });
  };

  const handleExportUsers = () => {
    const csvContent = [
      ["ID", "Nome", "Email", "Telefone", "Perfil", "Status", "Data de Criação", "Último Acesso"],
      ...filteredUsers.map(u => [
        u.id,
        u.name,
        u.email,
        u.phone || "",
        getRoleInfo(u.role).label,
        u.status === "active" ? "Ativo" : "Inativo",
        formatDate(u.createdAt),
        u.lastLogin ? formatDate(u.lastLogin) : "Nunca acessou"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <PageHeader className="mb-0">
        <div>
          <PageHeaderTitle icon={<Users className="h-8 w-8" />}>
            Gestão de Usuários
          </PageHeaderTitle>
          <PageHeaderSubtitle>
            {stats.total} usuário{stats.total !== 1 ? 's' : ''} no sistema
          </PageHeaderSubtitle>
        </div>

        <PageHeaderActions>
          {permissions.canExportData && (
            <Button
              onClick={handleExportUsers}
              variant="outline"
              className="border-2 border-slate-300 hover:border-slate-400"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          )}
          {permissions.canAdd && currentUserRole === 'admin' && (
            <GradientButton onClick={() => setCreateUserModal(true)}>
              <UserPlus className="h-5 w-5" />
              Novo Usuário
            </GradientButton>
          )}
        </PageHeaderActions>
      </PageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 -mt-2">
        <div className="bg-white rounded-xl p-4 border-2 border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-slate-600" />
            <span className="text-xs text-slate-600 font-medium">Total</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>

        {currentUserRole === 'admin' && (
          <div className="bg-red-50 rounded-xl p-4 border-2 border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-red-600" />
              <span className="text-xs text-red-700 font-medium">Admins</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{stats.admins}</p>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-xs text-blue-700 font-medium">Docentes</span>
          </div>
          <p className="text-2xl font-bold text-blue-700">{stats.teachers}</p>
        </div>

        <div className="bg-green-50 rounded-xl p-4 border-2 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="h-4 w-4 text-green-600" />
            <span className="text-xs text-green-700 font-medium">Estudantes</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{stats.students}</p>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 border-2 border-emerald-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span className="text-xs text-emerald-700 font-medium">Ativos</span>
          </div>
          <p className="text-2xl font-bold text-emerald-700">{stats.active}</p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-700 font-medium">Inativos</span>
          </div>
          <p className="text-2xl font-bold text-gray-700">{stats.inactive}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <SearchBar
          placeholder="Buscar por nome ou email..."
          value={searchTerm}
          onChange={setSearchTerm}
        />

        <FilterSelect
          value={roleFilter}
          onChange={(value) => setRoleFilter(value as any)}
          options={[
            { value: "all", label: "Todos os Perfis" },
            ...(currentUserRole === 'admin' ? [{ value: "admin", label: "\u{1F6E1}\uFE0F Super Admin" }] : []),
            { value: "academic_admin", label: "\u{1F4BC} Academic Admin" },
            { value: "teacher", label: "\u{1F468}\u200D\u{1F3EB} Docentes" },
            { value: "student", label: "\u{1F393} Estudantes" },
          ]}
          minWidth="160px"
        />

        <FilterSelect
          value={statusFilter}
          onChange={(value) => setStatusFilter(value as any)}
          options={[
            { value: "all", label: "Todos os Status" },
            { value: "active", label: "\u2705 Ativos" },
            { value: "inactive", label: "\u274C Inativos" },
          ]}
          minWidth="160px"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário encontrado"
          description="Tente ajustar os filtros de busca"
        />
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
          {/* Table Header */}
          <div className="bg-slate-50 border-b-2 border-slate-200 px-6 py-4">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Usuário</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Perfil</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Contato</span>
              </div>
              <div className="col-span-1">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Cadastro</span>
              </div>
              <div className="col-span-1">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Acesso</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-slate-700 font-bold text-sm uppercase tracking-wide">Ações</span>
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const roleInfo = getRoleInfo(user.role);
              const RoleIcon = roleInfo.icon;

              return (
                <div
                  key={user.id}
                  className="grid grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50/80 transition-colors"
                >
                  {/* User Column */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className={`h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      user.status === 'inactive' ? 'opacity-50 grayscale' : ''
                    }`}>
                      <span className="text-white font-bold text-lg">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-800 truncate">
                          {user.name}
                        </h3>
                        {user.status === 'inactive' && (
                          <Badge className="bg-gray-100 text-gray-600 border-0 text-[10px] px-1.5 py-0">
                            Inativo
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Role Column */}
                  <div className="col-span-2">
                    <Badge className={`${roleInfo.color} border text-xs font-semibold`}>
                      <RoleIcon className="h-3 w-3 mr-1.5" />
                      {roleInfo.label}
                    </Badge>
                  </div>

                  {/* Contact Column */}
                  <div className="col-span-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span className="truncate">{user.email.split('@')[0]}</span>
                      </div>
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Registration Date Column */}
                  <div className="col-span-1">
                    <span className="text-xs text-slate-600 font-medium">
                      {formatDate(user.createdAt)}
                    </span>
                  </div>

                  {/* Last Access Column */}
                  <div className="col-span-1">
                    {user.lastLogin ? (
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        <span>{formatDate(user.lastLogin)}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Nunca</span>
                    )}
                  </div>

                  {/* Actions Column */}
                  <div className="col-span-3 flex justify-end items-center gap-1.5">
                    <button
                      onClick={() => handleViewAccessHistory(user)}
                      className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 transition-all text-xs font-medium"
                      title="Histórico de Acesso"
                    >
                      <Activity className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">Histórico</span>
                    </button>

                    <button
                      onClick={() => handleViewCredentials(user)}
                      className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-orange-50 text-[#F5821F] hover:bg-orange-100 border border-orange-200 hover:border-orange-300 transition-all text-xs font-medium"
                      title="Credenciais / Resetar Senha"
                    >
                      <Key className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">Senha</span>
                    </button>

                    {permissions.canEdit && (
                      <button
                        onClick={() => handleEditUser(user)}
                        className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-blue-50 text-[#004B87] hover:bg-blue-100 border border-blue-200 hover:border-blue-300 transition-all text-xs font-medium"
                        title="Editar usuário"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span className="hidden xl:inline">Editar</span>
                      </button>
                    )}

                    {permissions.canDelete && user.role !== 'admin' && (
                      <button
                        onClick={() => onDeleteUser && onDeleteUser(user.id)}
                        className="group flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 border border-red-200 hover:border-red-300 transition-all text-xs font-medium"
                        title="Remover usuário"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {filteredUsers.length > 0 && (
        <ListFooter
          showing={filteredUsers.length}
          total={visibleUsers.length}
          hasFilters={!!(searchTerm || roleFilter !== 'all' || statusFilter !== 'all')}
          onClearFilters={() => {
            setSearchTerm("");
            setRoleFilter("all");
            setStatusFilter("all");
          }}
        />
      )}

      <CreateUserModal
        isOpen={createUserModal}
        onClose={() => setCreateUserModal(false)}
        onSave={handleCreateUser}
        isEditing={false}
        currentUserRole={currentUserRole}
      />

      <CreateUserModal
        isOpen={editUserModal.isOpen}
        onClose={() => setEditUserModal({ isOpen: false, user: null })}
        onSave={handleUpdateUser}
        userData={editUserModal.user}
        isEditing={true}
        currentUserRole={currentUserRole}
      />

      <UserCredentialsModal
        isOpen={credentialsModal.isOpen}
        onClose={() => setCredentialsModal({ isOpen: false, user: null })}
        user={credentialsModal.user}
        onResetPassword={(userId) => console.log("Reset password for user:", userId)}
      />

      <UserAccessHistoryModal
        isOpen={accessHistoryModal.isOpen}
        onClose={() => setAccessHistoryModal({ isOpen: false, user: null })}
        user={accessHistoryModal.user}
      />
    </div>
  );
}
