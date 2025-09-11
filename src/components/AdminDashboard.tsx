// src/components/AdminDashboard.tsx (Atualizado com Modal de Perfil do Estudante)
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeacherProfileModal } from "./shared/TeacherProfileModal";
import { StudentProfileModal } from "./shared/StudentProfileModal";


import { Input } from "@/components/ui/input";
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Settings,
  UserPlus,
  GraduationCap,
  LogOut,
  Shield,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Edit,
  Search,
  CreditCard,
  Receipt,
  Calendar,
  Eye,
  Trash2,
  Mail,
  Phone,
  X
} from "lucide-react";

// Import dos componentes compartilhados
import { ClassList } from "./shared/ClassList";
import { StudentList } from "./shared/StudentList";
import { ClassModal } from "./shared/ClassModal";
import { StudentModal } from "./shared/StudentModal";
import { CreateStudentModal } from "./shared/CreateStudentModal";
import { CreateTeacherModal } from "./shared/CreateTeacherModal";
import { ReportsModal } from "./shared/ReportsModal";
import { PaymentManagementModal } from "./shared/PaymentManagementModal";
import { GeneralSettingsModal } from "./shared/GeneralSettingsModal";


// Import dos hooks de dados
import { useClassData, useStudentData, useUserData } from "../hooks/useData";
import { usePaymentData } from "../hooks/usePaymentData";
import { Class, Student, Permission, PaymentMethod, User } from "../types";
import { useSettingsData } from "@/hooks/UseSettingsData";

interface AdminDashboardProps {
  onLogout?: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Admin';
  const adminId = user?.id ?? 0;

  // Hooks de dados
  const { classes, addClass, updateClass, deleteClass } = useClassData();
  const { students, addStudent, deleteStudent, getStudentsByClass, updateStudent } = useStudentData();
  const { users } = useUserData();
  const { 
    payments, 
    getStudentPaymentInfo, 
    getPaymentSummary, 
    recordPayment, 
    updatePayment,
    markAsOverdue 
  } = usePaymentData();


  const { 
  settings, 
  saveSettings, 
  resetSettings, 
  isLoading: settingsLoading 
} = useSettingsData();

  // Estados para controlar os modais existentes
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

  // Estados para os novos modais
  const [createStudentModal, setCreateStudentModal] = useState({
    isOpen: false,
    preSelectedClassId: 0,
    preSelectedClassName: ""
  });
  const [createTeacherModal, setCreateTeacherModal] = useState(false);
  const [reportsModal, setReportsModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    studentId: 0
  });

  // Estados para o modal de perfil do docente
  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);

  // Estados para o modal de perfil do estudante
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);

  // Estados para filtros e pesquisa
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Dados específicos do admin
  const teachers = users.filter(u => u.role === 'teacher');
  const paymentSummary = getPaymentSummary();
  

  //estado de configracoes
  const [generalSettingsModal, setGeneralSettingsModal] = useState(false);
  //
  const handleSaveSettings = async (newSettings: any) => {
  try {
    const success = await saveSettings(newSettings);
    if (success) {
      console.log("Configurações salvas com sucesso!");
      // Aqui você pode adicionar um toast de sucesso se tiver
    }
  } catch (error) {
    console.error("Erro ao salvar configurações:", error);
    // Aqui você pode adicionar um toast de erro se tiver
  }
};

  const [teacherStats, setTeacherStats] = useState([
    { 
      id: 1, 
      name: "Prof. Maria Santos", 
      email: "maria.santos@m007.com", 
      classes: 3, 
      students: 45, 
      status: "active" as const,
      phone: "+258 84 123 4567",
      specialization: "Business English, IELTS",
      contractType: "full-time",
      experience: "5 anos de experiência em ensino de inglês empresarial",
      qualifications: "Licenciatura em Letras - Inglês, Certificado TEFL",
      salary: 25000
    },
    { 
      id: 2, 
      name: "Prof. João Pedro", 
      email: "joao.pedro@m007.com", 
      classes: 2, 
      students: 28, 
      status: "active" as const,
      phone: "+258 84 987 6543",
      specialization: "Conversation, Grammar",
      contractType: "part-time",
      experience: "3 anos focado em conversação",
      qualifications: "Licenciatura em Inglês, Cambridge Certificate",
      salary: 15000
    },
    { 
      id: 3, 
      name: "Prof. Ana Silva", 
      email: "ana.silva@m007.com", 
      classes: 4, 
      students: 52, 
      status: "active" as const,
      phone: "+258 84 555 7890",
      specialization: "Advanced Grammar, Academic English",
      contractType: "full-time",
      experience: "8 anos de experiência acadêmica",
      qualifications: "Mestrado em Linguística Aplicada, Certificado CELTA",
      salary: 30000
    },
    { 
      id: 4, 
      name: "Prof. Carlos Lima", 
      email: "carlos.lima@m007.com", 
      classes: 1, 
      students: 15, 
      status: "inactive" as const,
      phone: "+258 84 111 2233",
      specialization: "General English",
      contractType: "freelance",
      experience: "2 anos de ensino geral",
      qualifications: "Licenciatura em Letras",
      salary: 8000
    },
  ]);

  // Permissões do administrador
  const adminPermissions: Permission = {
    canEdit: true,
    canDelete: true,
    canAdd: true,
    canViewDetails: true,
    canManageUsers: true,
    canViewReports: true,
    canExportData: true,
    canSendEmails: true
  };

  // Estatísticas do dashboard
  const stats = {
    totalStudents: students.length,
    totalTeachers: teacherStats.length,
    totalClasses: classes.length,
    totalRevenue: paymentSummary.totalRevenue,
    pendingPayments: paymentSummary.totalPending + paymentSummary.totalOverdue,
    studentsInDebt: paymentSummary.studentsInDebt,
    collectionRate: paymentSummary.collectionRate
  };

  // Funções para gerenciar docentes
  const handleViewTeacherProfile = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherProfileModalOpen(true);
  };

  const handleSaveTeacherProfile = (updatedTeacher: any) => {
    setTeacherStats(prev => 
      prev.map(teacher => 
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher
      )
    );
    console.log("Perfil do professor atualizado:", updatedTeacher);
    setIsTeacherProfileModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleCloseTeacherProfileModal = () => {
    setIsTeacherProfileModalOpen(false);
    setSelectedTeacher(null);
  };

  // Funções para gerenciar estudantes
  const handleViewStudentProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentProfileModalOpen(true);
  };

  const handleSaveStudentProfile = (updatedStudent: Student) => {
    // Atualizar o estudante usando o hook
    updateStudent(updatedStudent.id, updatedStudent);
    console.log("Perfil do estudante atualizado:", updatedStudent);
    setIsStudentProfileModalOpen(false);
    setSelectedStudent(null);
  };

  const handleCloseStudentProfileModal = () => {
    setIsStudentProfileModalOpen(false);
    setSelectedStudent(null);
  };

  const handleToggleTeacherStatus = (teacherId: number) => {
    setTeacherStats(prev => prev.map(teacher => 
      teacher.id === teacherId 
        ? { ...teacher, status: teacher.status === "active" ? "inactive" : "active" }
        : teacher
    ));
  };

  const handleDeleteTeacher = (teacherId: number) => {
    if (confirm("Tem certeza que deseja remover este docente? Esta ação não pode ser desfeita.")) {
      setTeacherStats(prev => prev.filter(teacher => teacher.id !== teacherId));
    }
  };

  // Funções para gerenciar modais existentes
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

  const handleCreateClass = () => {
    setClassModal({
      isOpen: true,
      classData: null,
      isCreating: true
    });
  };

  const handleDeleteClass = (classId: number) => {
    if (confirm("Tem certeza que deseja deletar esta turma? Esta ação não pode ser desfeita.")) {
      deleteClass(classId);
    }
  };

  const handleSaveClass = (classData: Partial<Class>) => {
    if (classModal.isCreating) {
      addClass({
        ...classData,
        students: 0,
        teacher: "A designar",
        teacherId: 0
      } as Omit<Class, 'id'>);
    } else if (classModal.classData?.id) {
      updateClass(classModal.classData.id, classData);
    }
  };

  const handleDeleteStudent = (studentId: number) => {
    if (confirm("Tem certeza que deseja remover este estudante?")) {
      deleteStudent(studentId);
    }
  };

  const handleSendEmailToAll = () => {
    console.log("Admin enviando email para todos os estudantes");
  };

  // Funções para criação
  const handleCreateStudent = (studentData: Omit<Student, 'id'>) => {
    addStudent(studentData);
    console.log("Novo estudante criado:", studentData);
  };

  const handleCreateTeacher = (teacherData: Omit<User, 'id'> & { 
    specializations: string[];
    experience: string;
    qualifications: string;
    salary?: number;
    contractType: string;
  }) => {
    const newTeacher = {
      id: Date.now(),
      name: teacherData.name,
      email: teacherData.email,
      classes: 0,
      students: 0,
      status: "active" as const,
      phone: teacherData.phone,
      specialization: teacherData.specializations.join(", "),
      experience: teacherData.experience,
      qualifications: teacherData.qualifications,
      salary: teacherData.salary || 0,
      contractType: teacherData.contractType
    };
    
    setTeacherStats(prev => [...prev, newTeacher]);
    console.log("Novo professor criado:", newTeacher);
  };

  const handleGenerateReport = (reportType: string, filters: any) => {
    console.log("Gerando relatório:", reportType, "com filtros:", filters);
  };

  // Adicionar estudante a uma turma específica
  const handleAddStudentToClass = (classItem: Class) => {
    setCreateStudentModal({
      isOpen: true,
      preSelectedClassId: classItem.id,
      preSelectedClassName: classItem.name
    });
  };

  // Abrir modal geral de criação de estudante
  const handleOpenCreateStudentModal = () => {
    setCreateStudentModal({
      isOpen: true,
      preSelectedClassId: 0,
      preSelectedClassName: ""
    });
  };

  // Funções de pagamento
  const handleOpenPaymentModal = (studentId: number) => {
    setPaymentModal({
      isOpen: true,
      studentId
    });
  };

  const handleRecordPayment = (amount: number, method: PaymentMethod, monthReference: string, description?: string) => {
    recordPayment(paymentModal.studentId, amount, monthReference, method, description);
  };

  const handleValidatePayment = (studentId: number, paymentId: number) => {
    updatePayment(paymentId, { 
      status: 'paid',
      paidDate: new Date().toISOString().split('T')[0]
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  // Filtrar estudantes por pagamentos
  const getFilteredStudents = () => {
    let filtered = students.filter(student => 
      student.name.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      student.className.toLowerCase().includes(paymentSearch.toLowerCase())
    );

    if (paymentFilter === 'overdue') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.overduePayments.length > 0;
      });
    } else if (paymentFilter === 'advance') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.currentBalance > 0;
      });
    } else if (paymentFilter === 'debt') {
      filtered = filtered.filter(student => {
        const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
        return paymentInfo.currentBalance < 0;
      });
    }

    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">M007 Oxford</h1>
                <p className="text-sm text-muted-foreground">Portal Administrativo</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium">{displayName}</p>
                <p className="text-sm text-muted-foreground">Super Admin</p>
              </div>
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
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Painel Administrativo</h2>
          <p className="text-muted-foreground">Gerencie estudantes, docentes, turmas e pagamentos da instituição</p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Estudantes</span>
            </TabsTrigger>
            <TabsTrigger value="teachers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Docentes</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Turmas</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Pagamentos</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    Estudantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{stats.totalStudents}</div>
                  <p className="text-sm text-muted-foreground">Total matriculados</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Docentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{stats.totalTeachers}</div>
                  <p className="text-sm text-muted-foreground">Total de professores</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Receita Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                  <p className="text-sm text-muted-foreground">Arrecadado</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Em Débito
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{stats.studentsInDebt}</div>
                  <p className="text-sm text-muted-foreground">Estudantes devendo</p>
                </CardContent>
              </Card>
            </div>

            {/* Cards de Resumo Financeiro */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Resumo Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Receita Total</span>
                      <span className="font-semibold text-green-600">{formatCurrency(paymentSummary.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pendente</span>
                      <span className="font-semibold text-yellow-600">{formatCurrency(paymentSummary.totalPending)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Em Atraso</span>
                      <span className="font-semibold text-red-600">{formatCurrency(paymentSummary.totalOverdue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Antecipado</span>
                      <span className="font-semibold text-blue-600">{formatCurrency(paymentSummary.totalAdvance)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estatísticas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Receita Média Mensal</span>
                      <span className="font-semibold text-primary">{formatCurrency(paymentSummary.averageMonthlyRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estudantes com Crédito</span>
                      <span className="font-semibold text-blue-600">{paymentSummary.studentsWithAdvance}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Estudantes em Débito</span>
                      <span className="font-semibold text-red-600">{paymentSummary.studentsInDebt}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Taxa de Cobrança</span>
                      <span className="font-semibold text-green-600">{paymentSummary.collectionRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleOpenCreateStudentModal}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar Estudante
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setCreateTeacherModal(true)}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Adicionar Docente
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={handleCreateClass}
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Criar Turma
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => setReportsModal(true)}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gerenciar Estudantes</h3>
              <Button 
                variant="oxford"
                onClick={handleOpenCreateStudentModal}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Estudante
              </Button>
            </div>
            <StudentList
              students={students}
              permissions={adminPermissions}
              currentUserRole="admin"
              showClassInfo={true}
              onDeleteStudent={handleDeleteStudent}
              onSendEmailToAll={handleSendEmailToAll}
              onViewStudentProfile={handleViewStudentProfile}
              onAddStudent={handleOpenCreateStudentModal}
            />
          </TabsContent>

          <TabsContent value="teachers" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Gerenciar Docentes</h3>
              <Button 
                variant="oxford"
                onClick={() => setCreateTeacherModal(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Docente
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teacherStats.map((teacher) => (
                <Card key={teacher.id} className="shadow-elegant hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg leading-tight truncate">{teacher.name}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{teacher.email}</span>
                          </CardDescription>
                          {teacher.specialization && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <GraduationCap className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{teacher.specialization}</span>
                            </p>
                          )}
                          {teacher.phone && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Phone className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{teacher.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewTeacherProfile(teacher)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                          title="Ver Perfil Completo"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1"
                          title="Remover Docente"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {/* Badge de Status */}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={teacher.status === "active" ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {teacher.status === "active" ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {teacher.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                        {teacher.contractType && (
                          <Badge variant="outline" className="text-xs">
                            {teacher.contractType === 'full-time' ? 'Integral' : 
                             teacher.contractType === 'part-time' ? 'Parcial' : 
                             teacher.contractType === 'freelance' ? 'Freelancer' : 'Substituto'}
                          </Badge>
                        )}
                      </div>

                      {/* Estatísticas em cards pequenos */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-3 bg-blue-50 rounded-md">
                          <div className="text-lg font-bold text-blue-600">{teacher.classes}</div>
                          <div className="text-xs text-muted-foreground">Turmas</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-md">
                          <div className="text-lg font-bold text-green-600">{teacher.students}</div>
                          <div className="text-xs text-muted-foreground">Estudantes</div>
                        </div>
                      </div>

                      {/* Salário se disponível */}
                      {teacher.salary && teacher.salary > 0 && (
                        <div className="text-center p-2 bg-orange-50 rounded-md">
                          <div className="text-sm font-medium text-orange-600">
                            {formatCurrency(teacher.salary)}
                          </div>
                          <div className="text-xs text-muted-foreground">Salário</div>
                        </div>
                      )}

                      {/* Botões de ação */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleViewTeacherProfile(teacher)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Perfil
                        </Button>
                        <Button 
                          variant={teacher.status === "active" ? "secondary" : "default"}
                          size="sm"
                          onClick={() => handleToggleTeacherStatus(teacher.id)}
                          title={teacher.status === "active" ? "Desativar docente" : "Ativar docente"}
                          className="px-3"
                        >
                          {teacher.status === "active" ? (
                            <X className="h-3 w-3" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mensagem quando não há docentes */}
            {teacherStats.length === 0 && (
              <Card className="shadow-elegant">
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum docente cadastrado</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Adicione docentes para começar a gerenciar o corpo docente.
                  </p>
                  <Button onClick={() => setCreateTeacherModal(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar Primeiro Docente
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassList
              classes={classes}
              permissions={adminPermissions}
              currentUserRole="admin"
              onViewStudents={handleViewStudents}
              onManageClass={handleManageClass}
              onCreateClass={handleCreateClass}
              onDeleteClass={handleDeleteClass}
              onAddStudentToClass={handleAddStudentToClass}
              onAddStudent={handleOpenCreateStudentModal}
            />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h3 className="text-lg font-semibold">Controle de Pagamentos</h3>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar estudante..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="overdue">Em Atraso</option>
                  <option value="debt">Com Dívida</option>
                  <option value="advance">Com Crédito</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {getFilteredStudents().map((student) => {
                const paymentInfo = getStudentPaymentInfo(student.id, student.name, student.className);
                const balanceColor = paymentInfo.currentBalance >= 0 ? 'text-green-600' : 'text-red-600';
                const statusColor = paymentInfo.overduePayments.length > 0 ? 'destructive' : 
                                  paymentInfo.currentBalance > 0 ? 'default' : 'secondary';
                const statusText = paymentInfo.overduePayments.length > 0 ? 'Em Atraso' :
                                 paymentInfo.currentBalance > 0 ? 'Com Crédito' : 'Regular';

                return (
                  <Card key={student.id} className="shadow-elegant">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`h-4 w-4 rounded-full ${
                            paymentInfo.overduePayments.length > 0 ? 'bg-red-500' : 
                            paymentInfo.currentBalance > 0 ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Turma: {student.className}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Mensalidade: {formatCurrency(paymentInfo.monthlyFee)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className={`text-lg font-bold ${balanceColor}`}>
                              {formatCurrency(Math.abs(paymentInfo.currentBalance))}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {paymentInfo.currentBalance >= 0 ? 'Crédito' : 'Dívida'}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-green-600">
                              {formatCurrency(paymentInfo.totalPaid)}
                            </div>
                            <div className="text-xs text-muted-foreground">Pago</div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-lg font-bold text-red-600">
                              {paymentInfo.overduePayments.length}
                            </div>
                            <div className="text-xs text-muted-foreground">Meses Atrasados</div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant={statusColor}>
                              {statusText}
                            </Badge>
                            {paymentInfo.lastPaymentDate && (
                              <div className="text-xs text-muted-foreground">
                                Último: {new Date(paymentInfo.lastPaymentDate).toLocaleDateString('pt-BR')}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenPaymentModal(student.id)}
                            >
                              <DollarSign className="h-4 w-4 mr-1" />
                              Gerenciar
                            </Button>
                            
                            {paymentInfo.overduePayments.length > 0 && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleValidatePayment(student.id, paymentInfo.overduePayments[0].id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Validar
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {paymentInfo.overduePayments.length > 0 && (
                        <div className="mt-3 p-2 bg-red-50 border-l-4 border-red-500 rounded">
                          <div className="text-sm text-red-800">
                            <strong>Atenção:</strong> {paymentInfo.overduePayments.length} pagamento(s) em atraso.
                            Total em atraso: {formatCurrency(paymentInfo.overduePayments.reduce((sum, p) => sum + p.amount, 0))}
                          </div>
                        </div>
                      )}
                      
                      {paymentInfo.currentBalance > 0 && (
                        <div className="mt-3 p-2 bg-blue-50 border-l-4 border-blue-500 rounded">
                          <div className="text-sm text-blue-800">
                            <strong>Crédito:</strong> Estudante possui {formatCurrency(paymentInfo.currentBalance)} em pagamentos antecipados.
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {getFilteredStudents().length === 0 && (
              <Card className="shadow-elegant">
                <CardContent className="text-center py-8">
                  <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum estudante encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Tente ajustar os filtros de pesquisa.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                  <CardDescription>Configurações gerais do M007 Oxford</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                 <Button 
  variant="outline" 
  className="w-full justify-start"
  onClick={() => setGeneralSettingsModal(true)}
>
  <Settings className="h-4 w-4 mr-2" />
  Configurações Gerais
</Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Configurar Valores
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Segurança do Sistema
                  </Button>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Backup e Relatórios</CardTitle>
                  <CardDescription>Gerenciar dados e relatórios</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setReportsModal(true)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Relatórios Financeiros
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Receipt className="h-4 w-4 mr-2" />
                    Exportar Pagamentos
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Logs do Sistema
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analytics Avançado
                  </Button>
                </CardContent>
              </Card>
              {/* Modal de Configurações Gerais */}
<GeneralSettingsModal
  isOpen={generalSettingsModal}
  onClose={() => setGeneralSettingsModal(false)}
  onSave={handleSaveSettings}
  currentSettings={settings}
/>
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
        permissions={adminPermissions}
        currentUserRole="admin"
        onSendEmailToAll={handleSendEmailToAll}
        onViewStudentProfile={handleViewStudentProfile}
        onAddStudent={() => handleAddStudentToClass({ 
          id: studentModal.classId, 
          name: studentModal.className 
        } as Class)}
      />

      <ClassModal
        isOpen={classModal.isOpen}
        onClose={() => setClassModal({ ...classModal, isOpen: false })}
        classData={classModal.classData}
        permissions={adminPermissions}
        currentUserRole="admin"
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        isCreating={classModal.isCreating}
      />

      <CreateStudentModal
        isOpen={createStudentModal.isOpen}
        onClose={() => setCreateStudentModal({ 
          isOpen: false, 
          preSelectedClassId: 0, 
          preSelectedClassName: "" 
        })}
        onSave={handleCreateStudent}
        availableClasses={classes}
        preSelectedClassId={createStudentModal.preSelectedClassId}
        preSelectedClassName={createStudentModal.preSelectedClassName}
      />

      <CreateTeacherModal
        isOpen={createTeacherModal}
        onClose={() => setCreateTeacherModal(false)}
        onSave={handleCreateTeacher}
      />

      <ReportsModal
        isOpen={reportsModal}
        onClose={() => setReportsModal(false)}
        onGenerateReport={handleGenerateReport}
      />

      {/* Modal de Gerenciamento de Pagamentos */}
      {paymentModal.isOpen && (
        <PaymentManagementModal
          isOpen={paymentModal.isOpen}
          onClose={() => setPaymentModal({ ...paymentModal, isOpen: false })}
          studentPaymentInfo={getStudentPaymentInfo(
            paymentModal.studentId,
            students.find(s => s.id === paymentModal.studentId)?.name || '',
            students.find(s => s.id === paymentModal.studentId)?.className || ''
          )}
          onRecordPayment={handleRecordPayment}
          onUpdatePayment={updatePayment}
        />
      )}

      {/* Modal de Perfil do Docente */}
      <TeacherProfileModal
        isOpen={isTeacherProfileModalOpen}
        onClose={handleCloseTeacherProfileModal}
        teacher={selectedTeacher}
        onSave={handleSaveTeacherProfile}
      />

      {/* Modal de Perfil do Estudante */}
      <StudentProfileModal
        isOpen={isStudentProfileModalOpen}
        onClose={handleCloseStudentProfileModal}
        student={selectedStudent}
        currentUserRole="admin"
        onSave={handleSaveStudentProfile}
      />
    </div>
  );
}