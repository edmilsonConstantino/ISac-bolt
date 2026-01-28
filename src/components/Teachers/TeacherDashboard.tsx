import { useState } from "react";
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
  Menu,
  X
} from "lucide-react";
import { StudentList } from "@/components/Students/StudentList";
import { ClassModal } from "@/components/shared/CreateClassModal";
import { StudentModal } from "@/components/Students/StudentModal";
import { CreateAssignmentModal } from "@/components/shared/CreateAssignmentModal";
import { AttendanceModal } from "@/components/shared/AttendanceModal";
import { AnnouncementModal } from "@/components/shared/AnnouncementModal";
import { UploadMaterialModal } from "@/components/shared/UploadMaterialModal";
import { GradeManagementModal } from "@/components/shared/GradeManagementModal";
import { ClassList } from "@/components/Classes/ClassList";
import { useClassData, useStudentData, useAssignmentData } from "@/hooks/useData";
import { Class, Student, Permission } from "@/types";

interface TeacherDashboardProps {
  onLogout?: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Docente'
    : 'Docente';
  
  const teacherId = user?.id ?? 0;
  
  const { classes, addClass, updateClass } = useClassData();
  const { students, getStudentsByClass } = useStudentData();
  const { assignments, addAssignment } = useAssignmentData();
  
  // Estado para controlar o menu mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  
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
  const [generalSettingsModal, setGeneralSettingsModal] = useState(false);
  
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
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
    pendingAssignments: assignments.reduce((sum, a) => sum + (a.total - a.submissions), 0),
    nextClass: "Business English"
  };
  
  const handleViewStudents = (classItem: Class) => {
    const classStudents = getStudentsByClass(classItem.id);
    setStudentModal({
      isOpen: true,
      className: classItem.name,
      classId: classItem.id,
      students: classStudents
    });
  };
  
  const handleManageClass = (classItem: Class) => {
    setClassModal({
      isOpen: true,
      classData: classItem,
      isCreating: false
    });
  };
  
  const handleSaveClass = (classData: Partial<Class>) => {
    if (classModal.classData?.id) {
      updateClass(classModal.classData.id, classData);
    }
  };
  
  const handleLaunchGrades = (classItem: Class) => {
    const classStudents = getStudentsByClass(classItem.id);
    setGradeModal({
      isOpen: true,
      classData: classItem,
      students: classStudents
    });
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

  // Função para mudar de tab e fechar menu mobile
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setIsMobileMenuOpen(false);
  };
  
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
                onClick={() => setGeneralSettingsModal(true)}
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

            {/* Mobile: Hamburger Menu */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-10 w-10 rounded-lg bg-[#003868] hover:bg-[#002850] text-white"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]"></div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 top-[65px]"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div className={`lg:hidden fixed top-[65px] right-0 h-[calc(100vh-65px)] w-72 bg-gradient-to-b from-[#004B87] to-[#003868] shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 space-y-6">
          {/* Perfil Mobile */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10">
            <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center font-bold text-white shadow-md">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{displayName}</p>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Docente
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-2">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "dashboard" 
                  ? 'bg-[#F5821F] text-white' 
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => handleTabChange("classes")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "classes" 
                  ? 'bg-[#F5821F] text-white' 
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              <span className="font-medium">Turmas</span>
            </button>

            <button
              onClick={() => handleTabChange("students")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "students" 
                  ? 'bg-[#F5821F] text-white' 
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Estudantes</span>
            </button>

            <button
              onClick={() => handleTabChange("assignments")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "assignments" 
                  ? 'bg-[#F5821F] text-white' 
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Trabalhos</span>
            </button>

            <button
              onClick={() => handleTabChange("materials")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "materials" 
                  ? 'bg-[#F5821F] text-white' 
                  : 'text-slate-200 hover:bg-white/10'
              }`}
            >
              <Upload className="h-5 w-5" />
              <span className="font-medium">Materiais</span>
            </button>
          </nav>

          {/* Menu Footer */}
          <div className="pt-6 border-t border-white/10 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start text-slate-200 hover:bg-white/10 hover:text-white"
              onClick={() => {
                setGeneralSettingsModal(true);
                setIsMobileMenuOpen(false);
              }}
            >
              <Settings className="h-4 w-4 mr-3" />
              Configurações
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start text-red-400 hover:bg-red-500/20 hover:text-red-300"
              onClick={async () => {
                try {
                  await logout();
                  if (onLogout) onLogout();
                } catch (e) {
                  console.error('Logout falhou', e);
                }
              }}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sair
            </Button>
          </div>
        </div>
      </div>

      {/* Espaçador para compensar o header fixed */}
      <div className="h-[65px] lg:h-[85px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Welcome Section */}
        <div className="mb-6 lg:mb-8 bg-gradient-to-r from-[#3B5998] via-[#5B7BB8] to-[#E07B5F] rounded-xl lg:rounded-2xl p-6 lg:p-8 shadow-lg">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            Painel Do {displayName}!
          </h2>
          <p className="text-white/90 text-sm">
            Gerencie estudantes, turmas e atividades de forma eficiente. 
          </p>
        </div>

        {/* Botões de Acesso Rápido - Mobile Only */}
        <div className="lg:hidden flex gap-3 mb-6">
          <Button
            onClick={() => handleTabChange("classes")}
            className="flex-1 bg-[#004B87] hover:bg-[#003868] text-white h-12 text-base font-semibold rounded-lg shadow-md"
          >
            <BookOpen className="h-5 w-5 mr-2" />
            Turmas
          </Button>

          <Button
            onClick={() => handleTabChange("students")}
            className="flex-1 bg-[#F5821F] hover:bg-[#E07020] text-white h-12 text-base font-semibold rounded-lg shadow-md"
          >
            <Users className="h-5 w-5 mr-2" />
            Estudantes
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Desktop Tabs */}
          <TabsList className="hidden lg:grid w-full grid-cols-5 h-auto p-1">
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
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <BookOpen className="h-4 lg:h-5 w-4 lg:w-5 text-blue-600" />
                    Turmas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-blue-600">{dashboardStats.totalClasses}</div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Turmas sendo lecionadas</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <Users className="h-4 lg:h-5 w-4 lg:w-5 text-orange-500" />
                    Total Estudantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-orange-500">{dashboardStats.totalStudents}</div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Estudantes matriculados</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <FileText className="h-4 lg:h-5 w-4 lg:w-5 text-yellow-600" />
                    Trabalhos Criados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl lg:text-3xl font-bold text-yellow-600">{assignments.length}</div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Total de trabalhos</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base lg:text-lg flex items-center gap-2">
                    <Calendar className="h-4 lg:h-5 w-4 lg:w-5 text-green-600" />
                    Próxima Aula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-base lg:text-lg font-semibold">{dashboardStats.nextClass}</div>
                  <p className="text-xs lg:text-sm text-muted-foreground">Segunda, 14:00</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                    <TrendingUp className="h-5 w-5" />
                    Resumo da Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Aulas ministradas</span>
                      <span className="font-semibold text-blue-600">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Trabalhos criados</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Presença média</span>
                      <span className="font-semibold text-blue-600">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Materiais enviados</span>
                      <span className="font-semibold text-orange-500">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">Ações Rápidas</CardTitle>
                  <CardDescription className="text-xs lg:text-sm">Tarefas frequentes do dia a dia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setCreateAssignmentModal(true)}
                    >
                      <Plus className="h-5 w-5 text-blue-600" />
                      <span className="text-xs">Criar Trabalho</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setAttendanceModal(true)}
                    >
                      <CheckSquare className="h-5 w-5 text-green-600" />
                      <span className="text-xs">Marcar Presença</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setAnnouncementModal(true)}
                    >
                      <Bell className="h-5 w-5 text-orange-500" />
                      <span className="text-xs">Criar Aviso</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setUploadMaterialModal(true)}
                    >
                      <Upload className="h-5 w-5 text-blue-600" />
                      <span className="text-xs">Upload Material</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassList 
              onViewStudents={handleViewStudents}
              onViewDetails={handleManageClass}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentList
              students={students}
              permissions={teacherPermissions}
              currentUserRole="teacher"
              showClassInfo={true}
              onSendEmailToAll={handleSendEmailToAll}
            />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold">Trabalhos e Atividades</h3>
              <Button 
                variant="outline" 
                onClick={() => setCreateAssignmentModal(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto"
              >
                <FileText className="h-4 w-4 mr-2" />
                Criar Trabalho
              </Button>
            </div>
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                      <div>
                        <CardTitle className="text-base lg:text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="text-xs lg:text-sm">{assignment.class}</CardDescription>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        Prazo: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="text-center">
                          <div className="text-xl lg:text-2xl font-bold text-blue-600">
                            {assignment.submissions}
                          </div>
                          <div className="text-xs text-muted-foreground">Entregues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl lg:text-2xl font-bold text-muted-foreground">
                            {assignment.total}
                          </div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl lg:text-2xl font-bold text-yellow-600">
                            {assignment.total - assignment.submissions}
                          </div>
                          <div className="text-xs text-muted-foreground">Pendentes</div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Ver Entregas
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="text-lg font-semibold">Materiais de Ensino</h3>
              <Button 
                variant="outline" 
                onClick={() => setUploadMaterialModal(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 w-full sm:w-auto"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              <Card 
                className="shadow-elegant border-dashed border-2 border-muted-foreground/25 hover:border-blue-600 transition-colors cursor-pointer" 
                onClick={() => setUploadMaterialModal(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload de Áudio</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Envie arquivos de áudio para suas turmas
                  </p>
                </CardContent>
              </Card>
              <Card 
                className="shadow-elegant border-dashed border-2 border-muted-foreground/25 hover:border-blue-600 transition-colors cursor-pointer" 
                onClick={() => setUploadMaterialModal(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload de Vídeo</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Envie vídeos educativos
                  </p>
                </CardContent>
              </Card>
              <Card 
                className="shadow-elegant border-dashed border-2 border-muted-foreground/25 hover:border-blue-600 transition-colors cursor-pointer" 
                onClick={() => setUploadMaterialModal(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload de Documentos</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    PDFs, exercícios e materiais escritos
                  </p>
                </CardContent>
              </Card>
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
        availableClasses={classes}
        teacherId={teacherId}
      />
      
      <AttendanceModal
        isOpen={attendanceModal}
        onClose={() => setAttendanceModal(false)}
        onSave={handleSaveAttendance}
        availableClasses={classes}
        getStudentsByClass={getStudentsByClass}
      />
      
      <AnnouncementModal
        isOpen={announcementModal}
        onClose={() => setAnnouncementModal(false)}
        onSave={handleCreateAnnouncement}
        availableClasses={classes}
        teacherId={teacherId}
      />
      
      <UploadMaterialModal
        isOpen={uploadMaterialModal}
        onClose={() => setUploadMaterialModal(false)}
        onSave={handleUploadMaterial}
        availableClasses={classes}
        teacherId={teacherId}
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
    </div>
  );
}