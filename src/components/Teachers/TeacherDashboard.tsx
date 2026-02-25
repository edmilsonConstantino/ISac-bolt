import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  FileText,
  Upload,
  Calendar,
  LogOut,
  GraduationCap,
  BarChart3,
  Bell,
  Plus,
  CheckSquare,
  TrendingUp,
  Settings,
  Lock,
  Loader2,
  Clock,
  MapPin,
  ChevronRight
} from "lucide-react";
import { StudentList } from "@/components/Students/StudentList";
import { ClassModal } from "@/components/shared/CreateClassModal";
import { StudentModal } from "@/components/Students/StudentModal";
import { CreateAssignmentModal } from "@/components/shared/CreateAssignmentModal";
import { AttendanceModal } from "@/components/shared/AttendanceModal";
import { AnnouncementModal } from "@/components/shared/AnnouncementModal";
import { UploadMaterialModal } from "@/components/shared/UploadMaterialModal";
import { GradeManagementModal } from "@/components/shared/GradeManagementModal";
import { ChangePasswordModal } from "@/components/shared/ChangePasswordModal";
import { ClassList } from "@/components/Classes/ClassList";
import { useAssignmentData } from "@/hooks/useData";
import { Class, Student, Permission } from "@/types";
import classService, { Class as ServiceClass } from "@/services/classService";
import { toast } from "sonner";

interface TeacherDashboardProps {
  onLogout?: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  
  const displayName = user
    ? (user.nome || '').trim() ||
      `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
      user.username || 'Docente'
    : 'Docente';
  const firstName = displayName.split(/\s+/)[0];
  
  const teacherId = user?.id ?? 0;

  const { assignments, addAssignment } = useAssignmentData();

  // Dados reais da API
  const [teacherClasses, setTeacherClasses] = useState<ServiceClass[]>([]);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [changePasswordModal, setChangePasswordModal] = useState(false);

  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("teacher_active_tab") || "dashboard"
  );
  const persistTab = (tab: string) => {
    sessionStorage.setItem("teacher_active_tab", tab);
    setActiveTab(tab);
  };

  // Carregar turmas do professor da API
  useEffect(() => {
    if (!teacherId) return;
    const loadTeacherClasses = async () => {
      setIsLoadingClasses(true);
      try {
        const classes = await classService.getByTeacher(teacherId);
        setTeacherClasses(classes);

        // Carregar estudantes de todas as turmas
        setIsLoadingStudents(true);
        const studentsMap: Student[] = [];
        for (const cls of classes) {
          if (!cls.id) continue;
          try {
            const classStudents = await classService.getClassStudents(cls.id);
            classStudents.forEach((s: Record<string, unknown>) => {
              if (!studentsMap.find(st => st.id === (s.id as number))) {
                studentsMap.push({
                  id: s.id as number,
                  name: (s.nome || s.name || '') as string,
                  email: (s.email || '') as string,
                  phone: (s.telefone || s.phone || '') as string,
                  classId: cls.id!,
                  className: cls.name,
                  grade: Number(s.nota_final) || 0,
                  attendance: Number(s.frequencia) || 0,
                  status: ((s.status as string) === 'ativo' ? 'active' : 'inactive') as Student['status'],
                  enrollmentDate: (s.data_matricula || '') as string
                });
              }
            });
          } catch {
            // Silently skip classes with no students
          }
        }
        setAllStudents(studentsMap);
      } catch (error) {
        console.error('Erro ao carregar turmas:', error);
      } finally {
        setIsLoadingClasses(false);
        setIsLoadingStudents(false);
      }
    };
    loadTeacherClasses();
  }, [teacherId]);
  
  const [studentModal, setStudentModal] = useState({
    isOpen: false,
    className: "",
    classId: 0,
    students: [] as Student[]
  });
  
  const [classModal, setClassModal] = useState({
    isOpen: false,
    classData: null as Class | null,
    isCreating: false
  });
  
  const [createAssignmentModal, setCreateAssignmentModal] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [uploadMaterialModal, setUploadMaterialModal] = useState(false);
  const [gradeModal, setGradeModal] = useState({
    isOpen: false,
    classData: null as Class | null,
    students: [] as Student[]
  });
  
  const teacherPermissions: Permission = {
    canEdit: true,
    canDelete: false,
    canAdd: true,
    canViewDetails: true
  };
  
  const dashboardStats = {
    totalClasses: teacherClasses.length,
    totalStudents: allStudents.length,
    pendingAssignments: assignments.reduce((sum, a) => sum + (a.total - a.submissions), 0),
    nextClass: teacherClasses.length > 0 ? teacherClasses[0].name : "Nenhuma"
  };
  
  const handleViewStudents = async (classItem: Class) => {
    try {
      const apiStudents = await classService.getClassStudents(classItem.id!);
      const mappedStudents: Student[] = apiStudents.map((s: any) => ({
        id: s.id,
        name: s.nome || s.name || '',
        email: s.email || '',
        phone: s.telefone || s.phone || '',
        classId: classItem.id!,
        className: classItem.name,
        grade: Number(s.nota_final) || 0,
        attendance: Number(s.frequencia) || 0,
        status: (s.status === 'ativo' ? 'active' : 'inactive') as Student['status'],
        enrollmentDate: s.data_matricula || ''
      }));
      setStudentModal({
        isOpen: true,
        className: classItem.name,
        classId: classItem.id!,
        students: mappedStudents
      });
    } catch {
      toast.error('Erro ao carregar estudantes da turma');
    }
  };
  
  const handleManageClass = (classItem: Class) => {
    setClassModal({
      isOpen: true,
      classData: classItem,
      isCreating: false
    });
  };
  
  const handleSaveClass = async (classData: Partial<Class>) => {
    if (classModal.classData?.id) {
      try {
        await classService.update(classModal.classData.id, classData as ServiceClass);
        // Recarregar turmas
        const updated = await classService.getByTeacher(teacherId);
        setTeacherClasses(updated);
        toast.success('Turma atualizada com sucesso!');
      } catch {
        toast.error('Erro ao atualizar turma');
      }
    }
  };
  
  const handleLaunchGrades = async (classItem: Class) => {
    try {
      const apiStudents = await classService.getClassStudents(classItem.id!);
      const mapped: Student[] = apiStudents.map((s: Record<string, unknown>) => ({
        id: s.id as number,
        name: (s.nome || s.name || '') as string,
        email: (s.email || '') as string,
        phone: (s.telefone || '') as string,
        classId: classItem.id!,
        className: classItem.name,
        grade: Number(s.nota_final) || 0,
        attendance: Number(s.frequencia) || 0,
        status: ((s.status as string) === 'ativo' ? 'active' : 'inactive') as Student['status'],
        enrollmentDate: (s.data_matricula || '') as string
      }));
      setGradeModal({
        isOpen: true,
        classData: classItem,
        students: mapped
      });
    } catch {
      toast.error('Erro ao carregar estudantes');
    }
  };
  
  const handleSaveGrades = (gradeData: any) => {
    console.log("Notas salvas:", gradeData);
  };
  
  const handleSendEmailToAll = () => {
    console.log("Enviando email para todos os estudantes");
  };
  
  const handleChatWithStudent = (student: Student) => {
    console.log("Iniciando conversa com:", student.name);
  };
  
  const handleViewStudentProfile = (student: Student) => {
    console.log("Visualizando perfil de:", student.name);
  };
  
  const handleCreateAssignment = (assignmentData: any) => {
    addAssignment(assignmentData);
    console.log("Nova atividade criada:", assignmentData);
  };
  
  const handleSaveAttendance = (attendanceData: any) => {
    console.log("Presença salva:", attendanceData);
  };
  
  const handleCreateAnnouncement = (announcementData: any) => {
    console.log("Novo aviso criado:", announcementData);
  };
  
  const handleUploadMaterial = (materialData: any) => {
    console.log("Material enviado:", materialData);
  };

  const scheduleLabel = (s?: string) =>
    s === "manha" ? "Manhã" : s === "tarde" ? "Tarde" : s === "noite" ? "Noite" : s ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header estilizado - Responsivo */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#004B87] via-[#003868] to-[#004B87] backdrop-blur-lg bg-opacity-95 border-b border-blue-900/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Logo e Título */}
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-xl lg:rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative h-10 w-10 lg:h-12 lg:w-12 bg-white rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300 p-1">
                  <img src="/image.png" alt="ISAC Logo" className="h-full w-full object-contain" />
                </div>
              </div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] bg-clip-text text-transparent">ISAC</h1>
                <p className="text-xs lg:text-sm text-slate-300 font-medium tracking-wide">Portal do Docente</p>
              </div>
            </div>
            
            {/* Desktop: Status + Configurações + Usuário + Logout */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Status Online */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#003868] rounded-full border border-emerald-500/30">
                <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                <span className="text-xs text-white font-medium">Online</span>
              </div>
              
              {/* Botão Configurações */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => persistTab('settings')}
                className="h-9 w-9 rounded-lg bg-[#003868] hover:bg-[#002850] text-slate-200 hover:text-white transition-colors"
                title="Configurações do Sistema"
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              {/* Perfil do Usuário */}
              <div className="flex items-center gap-3 px-3 py-1.5 bg-[#003868] rounded-lg hover:bg-[#002850] transition-colors cursor-pointer">
                <div className="h-9 w-9 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center font-bold text-white shadow-md text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white text-sm leading-tight">{displayName}</p>
                  <p className="text-xs text-slate-300 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Docente
                  </p>
                </div>
              </div>
              
              {/* Botão Logout */}
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    await logout();
                    if (onLogout) onLogout();
                  } catch (e) {
                    console.error('Logout falhou', e);
                  }
                }}
                className="h-9 w-9 rounded-lg bg-[#003868] hover:bg-red-600/20 text-slate-200 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile: Logout */}
            <div className="lg:hidden flex items-center gap-2">
              <button
                onClick={async () => { try { await logout(); if (onLogout) onLogout(); } catch (e) { console.error(e); } }}
                className="h-9 w-9 bg-[#003868] hover:bg-red-600/20 rounded-lg flex items-center justify-center text-slate-200 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]"></div>
      </header>


      {/* Espaçador para compensar o header fixed */}
      <div className="h-[66px] lg:h-[85px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8 pb-20 lg:pb-8">
        {/* Welcome Section — desktop */}
        <div className="hidden lg:block mb-8 bg-gradient-to-r from-[#3B5998] via-[#5B7BB8] to-[#E07B5F] rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-white mb-2">
            Painel do Docente
          </h2>
          <p className="text-white/90 text-sm">
            Olá, {displayName}! Gerencie estudantes, turmas e atividades de forma eficiente.
          </p>
        </div>


        <Tabs value={activeTab} onValueChange={persistTab} className="space-y-6">
          {/* Desktop Tabs */}
          <TabsList className="hidden lg:grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>Turmas</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Estudantes</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Trabalhos</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span>Materiais</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span>Definições</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 lg:space-y-6">

            {/* Mobile: merged welcome + section header (only on Início tab) */}
            <div className="lg:hidden bg-gradient-to-r from-[#3B5998] via-[#5B7BB8] to-[#E07B5F] rounded-2xl p-5 shadow-lg flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white leading-tight">
                  Olá, {firstName}!
                </h2>
                <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#FF9933]" />
                  {dashboardStats.totalClasses} turma(s) · {dashboardStats.totalStudents} estudante(s)
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl font-bold text-white shadow-inner">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            {/* Stats — 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              {[
                { icon: BookOpen,  label: "Turmas Ativas",     value: dashboardStats.totalClasses,  sub: "Turmas a leccionar", color: "text-[#004B87]",   bg: "bg-blue-50",    border: "border-l-[#004B87]"  },
                { icon: Users,     label: "Total Estudantes",  value: dashboardStats.totalStudents, sub: "Matriculados",       color: "text-[#F5821F]",   bg: "bg-orange-50",  border: "border-l-[#F5821F]"  },
                { icon: FileText,  label: "Trabalhos",         value: assignments.length,           sub: "Criados",            color: "text-amber-600",   bg: "bg-amber-50",   border: "border-l-amber-500"  },
                { icon: Calendar,  label: "Próxima Aula",      value: dashboardStats.nextClass,     sub: "Turma agendada",     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-l-emerald-500" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className={`bg-white rounded-2xl border border-slate-100 border-l-4 ${stat.border} shadow-sm p-4 lg:p-5`}>
                    <div className={`h-8 w-8 ${stat.bg} rounded-xl flex items-center justify-center mb-3 lg:hidden`}>
                      <Icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div className={`hidden lg:flex items-center gap-2 mb-2 text-base font-semibold`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      {stat.label}
                    </div>
                    <div className={`text-2xl lg:text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                    <p className="text-xs text-slate-500 mt-0.5">{stat.sub}</p>
                    <p className="text-[10px] text-slate-400 lg:hidden mt-0.5">{stat.label}</p>
                  </div>
                );
              })}
            </div>

            {/* ── Minhas Turmas Preview ── */}
            {!isLoadingClasses && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 bg-[#004B87] rounded-lg flex items-center justify-center">
                      <BookOpen className="h-3.5 w-3.5 text-white" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">Minhas Turmas</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-50 text-[#004B87] rounded-full">
                      {teacherClasses.length}
                    </span>
                  </div>
                  {teacherClasses.length > 0 && (
                    <button
                      onClick={() => persistTab('classes')}
                      className="text-xs text-[#004B87] font-semibold flex items-center gap-1 hover:underline"
                    >
                      Ver todas <ChevronRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {teacherClasses.length === 0 ? (
                  <div className="px-4 pb-4 flex items-center gap-3 border-t border-slate-50 pt-3">
                    <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="h-4 w-4 text-slate-300" />
                    </div>
                    <p className="text-sm text-slate-400">Nenhuma turma atribuída ainda</p>
                  </div>
                ) : (
                  <div className="border-t border-slate-100 divide-y divide-slate-50">
                    {teacherClasses.slice(0, 3).map((cls) => (
                      <div key={cls.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-[#004B87]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{cls.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {typeof cls.students === 'number'
                              ? `${cls.students} estudante${cls.students !== 1 ? 's' : ''}`
                              : ''}
                            {cls.schedule ? ` · ${scheduleLabel(cls.schedule)}` : ''}
                          </p>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                          cls.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : cls.status === 'completed'
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {cls.status === 'active' ? 'Ativa' : cls.status === 'completed' ? 'Concluída' : 'Inativa'}
                        </span>
                      </div>
                    ))}
                    {teacherClasses.length > 3 && (
                      <button
                        onClick={() => persistTab('classes')}
                        className="w-full px-4 py-3 text-xs text-[#004B87] font-semibold text-center hover:bg-blue-50 transition-colors"
                      >
                        +{teacherClasses.length - 3} turma(s) adicional(is)
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Resumo da semana */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 bg-[#004B87] rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm lg:text-base">Resumo da Semana</p>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Aulas ministradas",   value: "12", color: "text-[#004B87]"   },
                    { label: "Trabalhos criados",   value: "8",  color: "text-emerald-600" },
                    { label: "Presença média",       value: "92%",color: "text-[#004B87]"   },
                    { label: "Materiais enviados",   value: "5",  color: "text-[#F5821F]"   },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                      <span className="text-sm text-slate-500">{row.label}</span>
                      <span className={`text-sm font-bold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ações Rápidas */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:p-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ações Rápidas</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Criar Trabalho",   Icon: Plus,        color: "text-[#004B87]", bg: "bg-blue-50",    action: () => setCreateAssignmentModal(true) },
                    { label: "Marcar Presença",  Icon: CheckSquare, color: "text-emerald-600",bg: "bg-emerald-50",action: () => setAttendanceModal(true) },
                    { label: "Criar Aviso",       Icon: Bell,        color: "text-[#F5821F]", bg: "bg-orange-50",  action: () => setAnnouncementModal(true) },
                    { label: "Upload Material",  Icon: Upload,      color: "text-purple-600", bg: "bg-purple-50",  action: () => setUploadMaterialModal(true) },
                  ].map((a) => (
                    <button
                      key={a.label}
                      onClick={a.action}
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md active:scale-95 transition-all"
                    >
                      <div className={`h-10 w-10 ${a.bg} rounded-xl flex items-center justify-center`}>
                        <a.Icon className={`h-5 w-5 ${a.color}`} />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4 lg:space-y-6">
            {/* Mobile: gradient section header */}
            <div className="lg:hidden bg-gradient-to-r from-[#004B87] to-[#0066B3] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-5 w-5" />
                <h2 className="text-lg font-bold">Minhas Turmas</h2>
              </div>
              <p className="text-blue-200 text-sm">{dashboardStats.totalClasses} turma(s) atribuída(s)</p>
            </div>

            {isLoadingClasses ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#004B87] mb-3" />
                <p className="text-slate-500">Carregando turmas...</p>
              </div>
            ) : teacherClasses.length === 0 ? (
              <Card className="shadow-elegant">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <BookOpen className="h-12 w-12 text-slate-300 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-1">Nenhuma turma atribuída</h3>
                  <p className="text-sm text-slate-400">Você ainda não possui turmas associadas ao seu perfil.</p>
                </CardContent>
              </Card>
            ) : (
              <ClassList
                classes={teacherClasses as unknown as Class[]}
                permissions={teacherPermissions}
                currentUserRole="teacher"
                onViewStudents={handleViewStudents}
                onManageClass={handleManageClass}
                onCreateClass={() => {}}
                onAddStudentToClass={() => {}}
                onLaunchGrades={handleLaunchGrades}
              />
            )}
          </TabsContent>

          <TabsContent value="students" className="space-y-4 lg:space-y-6">
            {/* Mobile: gradient section header */}
            <div className="lg:hidden bg-gradient-to-r from-[#004B87] to-[#0066B3] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-5 w-5" />
                <h2 className="text-lg font-bold">Estudantes</h2>
              </div>
              <p className="text-blue-200 text-sm">{dashboardStats.totalStudents} estudante(s) nas suas turmas</p>
            </div>

            {isLoadingStudents ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-[#004B87] mb-3" />
                <p className="text-slate-500">Carregando estudantes...</p>
              </div>
            ) : (
              <StudentList
                students={allStudents}
                permissions={teacherPermissions}
                currentUserRole="teacher"
                showClassInfo={true}
                onSendEmailToAll={handleSendEmailToAll}
              />
            )}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4 lg:space-y-6">

            {/* Mobile: gradient section header + create button */}
            <div className="lg:hidden bg-gradient-to-r from-amber-500 to-[#F5821F] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="h-5 w-5" />
                    <h2 className="text-lg font-bold">Trabalhos</h2>
                  </div>
                  <p className="text-amber-100 text-sm">{assignments.length} trabalho(s) criado(s)</p>
                </div>
                <button
                  onClick={() => setCreateAssignmentModal(true)}
                  className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Desktop: header + button */}
            <div className="hidden lg:flex justify-between items-center">
              <h3 className="text-lg font-semibold">Trabalhos e Atividades</h3>
              <Button
                variant="outline"
                onClick={() => setCreateAssignmentModal(true)}
                className="bg-[#004B87] hover:bg-[#003868] text-white border-0"
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar Trabalho
              </Button>
            </div>

            {/* Assignment cards */}
            <div className="space-y-3">
              {assignments.map((assignment) => {
                const pct = assignment.total > 0 ? Math.round((assignment.submissions / assignment.total) * 100) : 0;
                return (
                  <div key={assignment.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    {/* Card header */}
                    <div className="px-4 pt-4 pb-3 border-b border-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 text-sm truncate">{assignment.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate">{assignment.class}</p>
                        </div>
                        <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-full">
                          Prazo: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                    {/* Stats row */}
                    <div className="px-4 py-3 flex items-center gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="text-center">
                          <p className="text-xl font-bold text-[#004B87]">{assignment.submissions}</p>
                          <p className="text-[10px] text-slate-400">Entregues</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-slate-400">{assignment.total}</p>
                          <p className="text-[10px] text-slate-400">Total</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-bold text-[#F5821F]">{assignment.total - assignment.submissions}</p>
                          <p className="text-[10px] text-slate-400">Pendentes</p>
                        </div>
                        {/* Progress bar */}
                        <div className="flex-1 hidden sm:block">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-[#004B87] to-[#F5821F] h-2 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 text-right">{pct}% entregues</p>
                        </div>
                      </div>
                      <button className="flex-shrink-0 px-3 py-2 rounded-xl border-2 border-[#004B87]/20 text-[#004B87] text-xs font-semibold hover:bg-[#004B87] hover:text-white transition-all">
                        Ver Entregas
                      </button>
                    </div>
                  </div>
                );
              })}

              {assignments.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                  <FileText className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium text-sm">Sem trabalhos criados</p>
                  <button
                    onClick={() => setCreateAssignmentModal(true)}
                    className="mt-4 px-4 py-2 bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-opacity"
                  >
                    Criar primeiro trabalho
                  </button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 lg:space-y-6">

            {/* Mobile: gradient section header */}
            <div className="lg:hidden bg-gradient-to-r from-purple-600 to-[#004B87] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className="h-5 w-5" />
                    <h2 className="text-lg font-bold">Materiais</h2>
                  </div>
                  <p className="text-purple-200 text-sm">Envie conteúdos para as suas turmas</p>
                </div>
                <button
                  onClick={() => setUploadMaterialModal(true)}
                  className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Plus className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Desktop: header + button */}
            <div className="hidden lg:flex justify-between items-center">
              <h3 className="text-lg font-semibold">Materiais de Ensino</h3>
              <Button
                variant="outline"
                onClick={() => setUploadMaterialModal(true)}
                className="bg-[#004B87] hover:bg-[#003868] text-white border-0"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-6">
              {[
                { label: "Upload de Áudio",      desc: "Arquivos de áudio para as turmas",    icon: Upload, color: "text-purple-600", bg: "bg-purple-50" },
                { label: "Upload de Vídeo",      desc: "Vídeos educativos",                   icon: Upload, color: "text-[#004B87]",  bg: "bg-blue-50"   },
                { label: "Upload de Documentos", desc: "PDFs, exercícios e materiais escritos",icon: Upload, color: "text-[#F5821F]",  bg: "bg-orange-50" },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => setUploadMaterialModal(true)}
                  className="bg-white rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#004B87] hover:shadow-md active:scale-[0.98] transition-all p-6 flex flex-col items-center gap-3 text-center"
                >
                  <div className={`h-14 w-14 ${m.bg} rounded-2xl flex items-center justify-center`}>
                    <m.icon className={`h-7 w-7 ${m.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{m.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{m.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 lg:space-y-6">

            {/* Mobile: gradient section header */}
            <div className="lg:hidden bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-2xl p-5 text-white shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {firstName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-bold">{displayName}</p>
                  <p className="text-blue-200 text-xs font-mono">@{user?.username}</p>
                  <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 bg-white/20 rounded-full border border-white/30">
                    Docente
                  </span>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              {/* Desktop: title */}
              <h3 className="hidden lg:flex items-center gap-2 text-lg font-semibold mb-4">
                <Settings className="h-5 w-5 text-[#004B87]" />
                Definições da Conta
              </h3>

              {/* Perfil */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 bg-[#004B87] rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-3.5 w-3.5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">Informações do Perfil</p>
                </div>
                <div className="space-y-1">
                  {[
                    { label: "Nome",     value: displayName },
                    { label: "Email",    value: user?.email || 'N/A' },
                    { label: "Username", value: user?.username || 'N/A' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between py-2.5 border-b border-slate-50 last:border-0">
                      <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">{row.label}</span>
                      <span className="text-xs font-semibold text-slate-800 text-right max-w-[60%] truncate">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2.5">
                    <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Perfil</span>
                    <Badge className="bg-[#004B87]/10 text-[#004B87] border-[#004B87]/20 text-[10px]">Docente</Badge>
                  </div>
                </div>
              </div>

              {/* Informações Académicas */}
              {teacherClasses.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mb-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-7 w-7 bg-[#F5821F]/10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-3.5 w-3.5 text-[#F5821F]" />
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">Informações Académicas</p>
                    <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 bg-[#004B87]/10 text-[#004B87] rounded-full">
                      {teacherClasses.length} turma{teacherClasses.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {teacherClasses.map((cls) => (
                      <div key={cls.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{cls.name}</p>
                            {cls.curso && (
                              <p className="text-xs text-slate-500 mt-0.5">Curso: <span className="font-medium text-slate-700">{cls.curso}</span></p>
                            )}
                          </div>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${
                            cls.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                            cls.status === 'completed' ? 'bg-slate-200 text-slate-600' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {cls.status === 'active' ? 'Ativa' : cls.status === 'completed' ? 'Concluída' : 'Inativa'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {cls.schedule && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Calendar className="h-3 w-3 text-[#004B87]" />
                              <span>{cls.schedule}</span>
                            </div>
                          )}
                          {(cls.start_time || cls.end_time) && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock className="h-3 w-3 text-[#F5821F]" />
                              <span>{cls.start_time ?? "—"} – {cls.end_time ?? "—"}</span>
                            </div>
                          )}
                          {cls.semester && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <BookOpen className="h-3 w-3 text-purple-500" />
                              <span>{cls.semester}</span>
                            </div>
                          )}
                          {cls.room && (
                            <div className="flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              <span>Sala {cls.room}</span>
                            </div>
                          )}
                        </div>
                        {typeof cls.students === 'number' && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                            <Users className="h-3 w-3 text-[#004B87]" />
                            <span><span className="font-semibold text-[#004B87]">{cls.students}</span> estudante{cls.students !== 1 ? "s" : ""} matriculado{cls.students !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Segurança */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-7 w-7 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Lock className="h-3.5 w-3.5 text-[#F5821F]" />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm">Segurança</p>
                </div>
                <div className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">Alterar Senha</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Recomendamos alterar a senha periodicamente
                    </p>
                  </div>
                  <button
                    onClick={() => setChangePasswordModal(true)}
                    className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white text-sm font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Alterar
                  </button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ ...studentModal, isOpen: false })}
        students={studentModal.students}
        className={studentModal.className}
        classId={studentModal.classId}
        permissions={teacherPermissions}
        currentUserRole="teacher"
        onSendEmailToAll={handleSendEmailToAll}
        onChatWithStudent={handleChatWithStudent}
        onViewStudentProfile={handleViewStudentProfile}
      />
      
      <ClassModal
        isOpen={classModal.isOpen}
        onClose={() => setClassModal({ ...classModal, isOpen: false })}
        classData={classModal.classData}
        permissions={teacherPermissions}
        currentUserRole="teacher"
        onSave={handleSaveClass}
        isCreating={false}
      />
      
      <CreateAssignmentModal
        isOpen={createAssignmentModal}
        onClose={() => setCreateAssignmentModal(false)}
        onSave={handleCreateAssignment}
        availableClasses={teacherClasses as unknown as Class[]}
        teacherId={teacherId}
      />

      <AttendanceModal
        isOpen={attendanceModal}
        onClose={() => setAttendanceModal(false)}
        onSave={handleSaveAttendance}
        availableClasses={teacherClasses as unknown as Class[]}
        getStudentsByClass={(classId: number) => allStudents.filter(s => s.classId === classId)}
      />

      <AnnouncementModal
        isOpen={announcementModal}
        onClose={() => setAnnouncementModal(false)}
        onSave={handleCreateAnnouncement}
        availableClasses={teacherClasses as unknown as Class[]}
        teacherId={teacherId}
      />

      <UploadMaterialModal
        isOpen={uploadMaterialModal}
        onClose={() => setUploadMaterialModal(false)}
        onSave={handleUploadMaterial}
        availableClasses={teacherClasses as unknown as Class[]}
        teacherId={teacherId}
      />

      <ChangePasswordModal
        isOpen={changePasswordModal}
        onClose={() => setChangePasswordModal(false)}
      />
      
      {gradeModal.classData && (
        <GradeManagementModal
          isOpen={gradeModal.isOpen}
          onClose={() => setGradeModal({ ...gradeModal, isOpen: false })}
          onSave={handleSaveGrades}
          classData={gradeModal.classData}
          students={gradeModal.students}
        />
      )}

      {/* ── Bottom Navigation (mobile only) ─────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-2xl">
        <div className="flex">
          {([
            { id: "dashboard",   Icon: BarChart3,  label: "Início"      },
            { id: "classes",     Icon: BookOpen,   label: "Turmas"      },
            { id: "students",    Icon: Users,      label: "Estudantes"  },
            { id: "assignments", Icon: FileText,   label: "Trabalhos"   },
            { id: "settings",    Icon: Settings,   label: "Definições"  },
          ] as { id: string; Icon: React.ElementType; label: string }[]).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => persistTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 relative transition-colors ${
                  isActive ? "text-[#004B87]" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <tab.Icon
                  className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`}
                  strokeWidth={isActive ? 2.5 : 1.5}
                />
                <span className={`text-[10px] transition-all ${isActive ? "font-bold text-[#004B87]" : "font-medium"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-[#004B87] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}