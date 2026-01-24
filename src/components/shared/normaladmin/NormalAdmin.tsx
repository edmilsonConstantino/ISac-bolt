// src/components/shared/reusable/NormalAdmin.tsx
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import studentService, { Student as APIStudent } from "@/services/studentService";
import teacherService, { Teacher, CreateTeacherData } from "@/services/teacherService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Users, BookOpen, DollarSign, Settings, GraduationCap,
  LogOut, UserCog, BarChart3, AlertTriangle, TrendingUp,
  UserPlus, ChevronLeft, ChevronRight, Home
} from "lucide-react";

// Import dos componentes compartilhados
import { ClassList } from "../TeacherComponents/ClassList";
import { StudentList } from "../StudentList";
import { TeacherList } from "../TeacherList";
import { PaymentList } from "../superadmin/PaymentList";
import { ClassModal } from "../CreateClassModal";
import { StudentModal } from "../StudentModal";
import { CreateStudentModal } from "../CreateStudentModal";
import { CreateTeacherModal } from "../CreateTeacherModal";
import { ReportsModal } from "../ReportsModal";
import { PaymentManagementModal } from "../superadmin/PaymentManagementModal";
import { TeacherProfileModal } from "../TeacherProfileModal";
import { StudentProfileModal } from "../StudentProfileModal";

// Types
import { Class, Student, Permission, PaymentMethod } from "../../../types";

interface NormalAdminProps {
  onLogout?: () => void;
}

export function NormalAdmin({ onLogout }: NormalAdminProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const displayName = user ? user.nome : 'Academic Admin';

  // ✅ Estados de navegação
  const [activeView, setActiveView] = useState<'dashboard' | 'students' | 'teachers' | 'classes' | 'payments'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Estados de dados
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherStats, setTeacherStats] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  // Estados de loading
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  // Estados de modais
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

  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);

  // Menu items para sidebar
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'students', label: 'Estudantes', icon: GraduationCap },
    { id: 'teachers', label: 'Docentes', icon: Users },
    { id: 'classes', label: 'Turmas', icon: BookOpen },
    { id: 'payments', label: 'Pagamentos', icon: DollarSign },
  ];

  // Verificar autenticação
  useEffect(() => {
    console.log('🔍 NormalAdmin montado - verificando autenticação...');
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, redirecionando...');
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Carregar dados da API
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadAllData = async () => {
      try {
        setIsLoadingTeachers(true);
        const teachers = await teacherService.getAll();
        const mappedTeachers = teachers.map((t: Teacher) => ({
          id: t.id,
          name: t.nome,
          email: t.email,
          phone: t.telefone || '',
          classes: 0,
          students: 0,
          status: t.status === 'ativo' ? 'active' : 'inactive',
          specialization: t.especialidade || '',
          contractType: t.tipo_contrato === 'tempo_integral' ? 'full-time' :
            t.tipo_contrato === 'meio_periodo' ? 'part-time' :
              t.tipo_contrato === 'freelancer' ? 'freelancer' : 'substitute',
          experience: t.observacoes || '',
          qualifications: t.observacoes || '',
          salary: t.salario || 0
        }));
        setTeacherStats(mappedTeachers);

        setIsLoadingStudents(true);
        const apiStudents = await studentService.getAll();
        const mappedStudents = apiStudents.map((student: APIStudent) => ({
          id: student.id,
          name: student.nome,
          email: student.email,
          phone: student.telefone || '',
          className: student.curso || 'Sem turma',
          enrollmentDate: student.data_nascimento || new Date().toISOString(),
          status: student.status === 'ativo' ? 'active' : 'inactive',
          address: student.endereco || '',
          birthDate: student.data_nascimento || '',
          level: '',
          parentName: '',
          parentPhone: '',
          emergencyContact: '',
          emergencyPhone: '',
          notes: ''
        }));
        setStudents(mappedStudents);

      } catch (error: any) {
        console.error("❌ Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoadingTeachers(false);
        setIsLoadingStudents(false);
      }
    };

    loadAllData();
  }, [isAuthenticated]);

  // Funções auxiliares
  const addStudent = (student: Omit<Student, 'id'> | Student) => {
    if ('id' in student) {
      setStudents(prev => [...prev, student]);
    } else {
      setStudents(prev => [...prev, { ...student, id: Date.now() }]);
    }
  };

  const updateStudent = (id: number, data: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  };

  const deleteStudent = (id: number) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const getStudentsByClass = (classId: number) => {
    return students.filter(s => s.classId === classId);
  };

  const addClass = (classData: Omit<Class, 'id'>) => {
    setClasses(prev => [...prev, { ...classData, id: Date.now() }]);
  };

  const updateClass = (id: number, data: Partial<Class>) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteClass = (id: number) => {
    setClasses(prev => prev.filter(c => c.id !== id));
  };

  const getStudentPaymentInfo = (studentId: number, name: string, className: string) => {
    return {
      studentId,
      studentName: name,
      className,
      monthlyFee: 2500,
      totalPaid: 0,
      currentBalance: 0,
      overduePayments: [],
      lastPaymentDate: null
    };
  };

  const getPaymentSummary = () => {
    return {
      totalRevenue: 0,
      totalPending: 0,
      totalOverdue: 0,
      totalAdvance: 0,
      studentsInDebt: 0,
      studentsWithAdvance: 0,
      averageMonthlyRevenue: 0,
      collectionRate: 0
    };
  };

  const recordPayment = (studentId: number, amount: number, monthRef: string, method: PaymentMethod, desc?: string) => {
    console.log('Registrar pagamento:', { studentId, amount, monthRef, method, desc });
    toast.success('Pagamento registrado!');
  };

  const updatePayment = (paymentId: number, data: any) => {
    console.log('Atualizar pagamento:', { paymentId, data });
    toast.success('Pagamento atualizado!');
  };

  const academicAdminPermissions: Permission = {
    canEdit: true,
    canDelete: true,
    canAdd: true,
    canViewDetails: true,
    canManageUsers: true,
    canViewReports: true,
    canExportData: true,
    canSendEmails: true
  };

  const paymentSummary = getPaymentSummary();

  const stats = {
    totalStudents: students.length,
    totalTeachers: teacherStats.length,
    totalClasses: classes.length,
    totalRevenue: paymentSummary.totalRevenue,
    pendingPayments: paymentSummary.totalPending + paymentSummary.totalOverdue,
    studentsInDebt: paymentSummary.studentsInDebt,
    collectionRate: paymentSummary.collectionRate
  };

  // Handlers
  const handleViewTeacherProfile = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherProfileModalOpen(true);
  };

  const handleSaveTeacherProfile = async (updatedTeacher: any) => {
    try {
      const updateData: Partial<CreateTeacherData> = {
        nome: updatedTeacher.name,
        email: updatedTeacher.email,
        telefone: updatedTeacher.phone,
        especialidade: updatedTeacher.specialization,
        tipo_contrato: updatedTeacher.contractType === 'full-time' ? 'tempo_integral' :
          updatedTeacher.contractType === 'part-time' ? 'meio_periodo' :
            updatedTeacher.contractType === 'freelance' ? 'freelancer' : 'substituto',
        salario: updatedTeacher.salary,
        observacoes: `${updatedTeacher.qualifications}\n\n${updatedTeacher.experience}`.trim()
      };

      await teacherService.update(updatedTeacher.id, updateData);
      setTeacherStats(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
      toast.success("Perfil atualizado com sucesso!");
      setIsTeacherProfileModalOpen(false);
      setSelectedTeacher(null);
    } catch (error: any) {
      console.error("Erro ao atualizar professor:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    }
  };

  const handleCloseTeacherProfileModal = () => {
    setIsTeacherProfileModalOpen(false);
    setSelectedTeacher(null);
  };

  const handleViewStudentProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsStudentProfileModalOpen(true);
  };

  const handleSaveStudentProfile = async (updatedStudent: Student) => {
    try {
      const updateData = {
        nome: updatedStudent.name,
        email: updatedStudent.email,
        telefone: updatedStudent.phone,
        data_nascimento: updatedStudent.birthDate,
        endereco: updatedStudent.address,
        status: updatedStudent.status === 'active' ? 'ativo' : 'inativo'
      };

      await studentService.update(updatedStudent.id, updateData);
      updateStudent(updatedStudent.id, updatedStudent);
      toast.success("Perfil atualizado com sucesso!");
      setIsStudentProfileModalOpen(false);
      setSelectedStudent(null);
    } catch (error: any) {
      console.error("Erro ao atualizar estudante:", error);
      toast.error(error.message || "Erro ao atualizar perfil");
    }
  };

  const handleCloseStudentProfileModal = () => {
    setIsStudentProfileModalOpen(false);
    setSelectedStudent(null);
  };

  const handleToggleTeacherStatus = (teacherId: number) => {
    setTeacherStats(prev => prev.map(t =>
      t.id === teacherId ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t
    ));
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (confirm("Tem certeza que deseja remover este docente?")) {
      try {
        await teacherService.delete(teacherId);
        setTeacherStats(prev => prev.filter(t => t.id !== teacherId));
        toast.success("Professor removido com sucesso!");
      } catch (error: any) {
        console.error("Erro ao deletar professor:", error);
        toast.error(error.message || "Erro ao remover professor");
      }
    }
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
    setClassModal({ isOpen: true, classData: classItem, isCreating: false });
  };

  const handleCreateClass = () => {
    setClassModal({ isOpen: true, classData: null, isCreating: true });
  };

  const handleDeleteClass = (classId: number) => {
    if (confirm("Tem certeza que deseja deletar esta turma?")) {
      deleteClass(classId);
    }
  };

  const handleSaveClass = (classData: Partial<Class>) => {
    if (classModal.isCreating) {
      addClass({ ...classData, students: 0, teacher: "A designar", teacherId: 0 } as Omit<Class, 'id'>);
    } else if (classModal.classData?.id) {
      updateClass(classModal.classData.id, classData);
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (confirm("Tem certeza que deseja remover este estudante?")) {
      try {
        await studentService.delete(studentId);
        deleteStudent(studentId);
        toast.success("Estudante removido com sucesso!");
      } catch (error: any) {
        console.error("Erro ao deletar estudante:", error);
        toast.error(error.message || "Erro ao remover estudante");
      }
    }
  };

  const handleSendEmailToAll = () => {
    console.log("Admin enviando email para todos os estudantes");
  };

  const handleCreateStudent = async (studentData: Omit<Student, 'id'>) => {
    try {
      await studentService.getAll();
      addStudent(studentData);
      toast.success("Estudante cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar lista de estudantes:", error);
      toast.error("Erro ao atualizar lista");
    }
  };

  const handleCreateTeacher = async (teacherData: any) => {
    try {
      const teachers = await teacherService.getAll();
      const mappedTeachers = teachers.map((t: Teacher) => ({
        id: t.id,
        name: t.nome,
        email: t.email,
        phone: t.telefone || '',
        classes: 0,
        students: 0,
        status: t.status === 'ativo' ? 'active' : 'inactive',
        specialization: t.especialidade || '',
        contractType: t.tipo_contrato === 'tempo_integral' ? 'full-time' :
          t.tipo_contrato === 'meio_periodo' ? 'part-time' :
            t.tipo_contrato === 'freelancer' ? 'freelancer' : 'substitute',
        experience: t.observacoes || '',
        qualifications: t.observacoes || '',
        salary: t.salario || 0
      }));
      setTeacherStats(mappedTeachers);
      toast.success("Professor cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar lista de professores:", error);
      toast.error("Erro ao atualizar lista");
    }
  };

  const handleGenerateReport = (reportType: string, filters: any) => {
    console.log("Gerando relatório:", reportType, "com filtros:", filters);
  };

  const handleAddStudentToClass = (classItem: Class) => {
    setCreateStudentModal({
      isOpen: true,
      preSelectedClassId: classItem.id,
      preSelectedClassName: classItem.name
    });
  };

  const handleOpenCreateStudentModal = () => {
    setCreateStudentModal({ isOpen: true, preSelectedClassId: 0, preSelectedClassName: "" });
  };

  const handleOpenPaymentModal = (studentId: number) => {
    setPaymentModal({ isOpen: true, studentId });
  };

  const handleRecordPayment = (amount: number, method: PaymentMethod, monthReference: string, description?: string) => {
    recordPayment(paymentModal.studentId, amount, monthReference, method, description);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
      {/* ========== SIDEBAR LATERAL ========== */}
      <aside
        className={`${
          isSidebarOpen ? 'w-72' : 'w-20'
        } bg-gradient-to-b from-[#004B87] via-[#003868] to-[#002850] text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl relative z-50`}
      >
        {/* Logo e Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-xl blur-md opacity-75"></div>
                <div className="relative h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                  <img src="/image.png" alt="ISAC" className="h-full w-full object-contain" />
                </div>
              </div>
              {isSidebarOpen && (
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] bg-clip-text text-transparent">
                    ISAC
                  </h1>
                  <p className="text-xs text-slate-300">Direção Académica</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-white/10">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="h-10 w-10 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0">
              {displayName.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{displayName}</p>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <UserCog className="h-3 w-3" />
                  <span>Academic Admin</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white shadow-lg'
                      : 'text-slate-200 hover:bg-white/10'
                  } ${!isSidebarOpen && 'justify-center'}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {isSidebarOpen && (
                    <span className="font-medium text-sm">{item.label}</span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-white/10 space-y-2">
          <button
            onClick={async () => {
              try {
                await logout();
                if (onLogout) onLogout();
              } catch (e) {
                console.error('Logout falhou', e);
              }
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-300 hover:bg-red-500/20 transition-colors ${
              !isSidebarOpen && 'justify-center'
            }`}
          >
            <LogOut className="h-5 w-5" />
            {isSidebarOpen && <span className="text-sm">Sair</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </aside>

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Gerencie estudantes, docentes e turmas da instituição
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-emerald-700 font-medium">Online</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
            <TabsContent value="dashboard" className="space-y-6 mt-0">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
                      <GraduationCap className="h-4 w-4 text-blue-500" />
                      Estudantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">{stats.totalStudents}</div>
                    <p className="text-xs text-slate-500 mt-1">Total matriculados</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
                      <Users className="h-4 w-4 text-purple-500" />
                      Docentes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">{stats.totalTeachers}</div>
                    <p className="text-xs text-slate-500 mt-1">Total de professores</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      Receita Total
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-slate-500 mt-1">Arrecadado</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2 text-slate-600">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Em Débito
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">{stats.studentsInDebt}</div>
                    <p className="text-xs text-slate-500 mt-1">Estudantes devendo</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Button variant="outline" className="w-full justify-start h-12 border-2 hover:border-blue-500 hover:bg-blue-50" onClick={handleOpenCreateStudentModal}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Cadastrar Estudante
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 border-2 hover:border-purple-500 hover:bg-purple-50" onClick={() => setCreateTeacherModal(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Adicionar Docente
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 border-2 hover:border-orange-500 hover:bg-orange-50" onClick={handleCreateClass}>
                      <BookOpen className="h-4 w-4 mr-2" />
                      Criar Turma
                    </Button>
                    <Button variant="outline" className="w-full justify-start h-12 border-2 hover:border-green-500 hover:bg-green-50" onClick={() => setReportsModal(true)}>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Gerar Relatório
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      Resumo Financeiro
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Receita Total</span>
                        <span className="font-bold text-green-600">{formatCurrency(paymentSummary.totalRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Pendente</span>
                        <span className="font-bold text-yellow-600">{formatCurrency(paymentSummary.totalPending)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Em Atraso</span>
                        <span className="font-bold text-red-600">{formatCurrency(paymentSummary.totalOverdue)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Antecipado</span>
                        <span className="font-bold text-blue-600">{formatCurrency(paymentSummary.totalAdvance)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      Estatísticas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Receita Média Mensal</span>
                        <span className="font-bold text-blue-600">{formatCurrency(paymentSummary.averageMonthlyRevenue)}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Estudantes com Crédito</span>
                        <span className="font-bold text-purple-600">{paymentSummary.studentsWithAdvance}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Estudantes em Débito</span>
                        <span className="font-bold text-red-600">{paymentSummary.studentsInDebt}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-slate-700">Taxa de Cobrança</span>
                        <span className="font-bold text-green-600">{paymentSummary.collectionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="mt-0">
              <StudentList
                students={students}
                permissions={academicAdminPermissions}
                currentUserRole="academic_admin"
                showClassInfo={true}
                onDeleteStudent={handleDeleteStudent}
                onSendEmailToAll={handleSendEmailToAll}
                onViewStudentProfile={handleViewStudentProfile}
                onAddStudent={handleOpenCreateStudentModal}
              />
            </TabsContent>

            <TabsContent value="teachers" className="mt-0">
              <TeacherList
                teachers={teacherStats}
                permissions={academicAdminPermissions}
                currentUserRole="academic_admin"
                onViewTeacherProfile={handleViewTeacherProfile}
                onDeleteTeacher={handleDeleteTeacher}
                onToggleTeacherStatus={handleToggleTeacherStatus}
                onAddTeacher={() => setCreateTeacherModal(true)}
              />
            </TabsContent>

            <TabsContent value="classes" className="mt-0">
              <ClassList
                classes={classes}
                permissions={academicAdminPermissions}
                currentUserRole="academic_admin"
                onViewStudents={handleViewStudents}
                onManageClass={handleManageClass}
                onCreateClass={handleCreateClass}
                onDeleteClass={handleDeleteClass}
                onAddStudentToClass={handleAddStudentToClass}
                onAddStudent={handleOpenCreateStudentModal}
              />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <PaymentList
                students={students}
                onOpenPaymentModal={handleOpenPaymentModal}
                formatCurrency={formatCurrency}
                getStudentPaymentInfo={getStudentPaymentInfo}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* ========== TODOS OS MODAIS ========== */}
      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ ...studentModal, isOpen: false })}
        students={studentModal.students}
        className={studentModal.className}
        classId={studentModal.classId}
        permissions={academicAdminPermissions}
        currentUserRole="academic_admin"
        onSendEmailToAll={handleSendEmailToAll}
        onViewStudentProfile={handleViewStudentProfile}
        onAddStudent={() => handleAddStudentToClass({ id: studentModal.classId, name: studentModal.className } as Class)}
      />

      <ClassModal
        isOpen={classModal.isOpen}
        onClose={() => setClassModal({ ...classModal, isOpen: false })}
        classData={classModal.classData}
        permissions={academicAdminPermissions}
        currentUserRole="academic_admin"
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        isCreating={classModal.isCreating}
      />

      <CreateStudentModal
        isOpen={createStudentModal.isOpen}
        onClose={() => setCreateStudentModal({ isOpen: false, preSelectedClassId: 0, preSelectedClassName: "" })}
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

      {paymentModal.isOpen && paymentModal.studentId > 0 && (
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

      <TeacherProfileModal
        isOpen={isTeacherProfileModalOpen}
        onClose={handleCloseTeacherProfileModal}
        teacher={selectedTeacher}
        onSave={handleSaveTeacherProfile}
      />

      <StudentProfileModal
        isOpen={isStudentProfileModalOpen}
        onClose={handleCloseStudentProfileModal}
        student={selectedStudent}
        currentUserRole="academic_admin"
        onSave={handleSaveStudentProfile}
      />
    </div>
  );
}