// src/components/AdminDashboard.tsx - CÓDIGO COMPLETO
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import studentService, { Student as APIStudent } from "@/services/studentService";
import classService, { Class as APIClass } from "@/services/classService";
import teacherService, { Teacher, CreateTeacherData } from "@/services/teacherService";
import courseService, { Course as APICourse } from "@/services/courseService";
import registrationService from '@/services/registrationService';
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccentStatCard } from "@/components/ui/stat-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { RegistrationStudentModal } from "./shared/reusable/RegistrationStudentModal";
import { Input } from "@/components/ui/input";
import {
  Users, BookOpen, DollarSign, UserPlus, GraduationCap,
  LogOut, Shield, BarChart3, AlertTriangle, TrendingUp,
  FileText, MessageCircle
} from "lucide-react";

// Import dos componentes compartilhados
import { ClassList } from "./Classes/ClassList";
import { StudentList } from "./Students/StudentList";
import { TeacherList } from "./Teachers/TeacherList";
import { AdminTopBar } from "./shared/AdminTopBar";
import { PaymentList } from "./Payments/PaymentList";
import { ClassModal } from "./shared/CreateClassModal";
import { StudentModal } from "./Students/StudentModal";
import { CreateStudentModal } from "./Students/CreateStudentModal";
import { CreateTeacherModal } from "./Teachers/CreateTeacherModal";
import { SelectStudentModal } from "./shared/SelectStudentModal";
import { ReportsModal } from "./shared/ReportsModal";
import { PaymentManagementModal } from "./Payments/PaymentManagementModal";
import { GeneralSettingsModal } from "./shared/GeneralSettingsModal";
import { TeacherProfileModal } from "./Teachers/TeacherProfileModal";
import { StudentProfileModal } from "./Students/StudentProfileModal";
import CreateCourseModal from '@/components/Courses/CreateCourseModal';
import { CourseList } from "./shared/superadmin/CourseList";
import { RegistrationList, Registration } from "./shared/reusable/RegistrationList";
import { UsersList, SystemUser } from "@/components/Users/UsersList";
import { GradesList, Grade } from "./shared/GradesList";
import { LaunchGradesModal } from "./shared/LaunchGradesModal";
import { StudentPaymentDetailsModal } from "./Payments/StudentPaymentDetailsModal";
import { AdminSidebar, menuItems, AdminView } from "./shared/AdminSidebar";
import { InscriptionList } from "./shared/InscriptionList";
import { PaymentsDashboard } from "./shared/PaymentsDashboard";
import { ClassSettingsModal } from "./Classes/ClassSettingsModal";
import { useSettingsData, GeneralSettings } from "@/hooks/useSettingsData";


// Types
// Types
import { Class as ClassType, Student as StudentType, Permission, PaymentMethod, User } from "../types";

interface AdminDashboardProps {
  onLogout?: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const displayName = user ? user.nome : 'Admin';

  // ✅ Estados de navegação
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // ✅ Estados de dados REAIS
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teacherStats, setTeacherStats] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const { settings, saveSettings: persistSettings } = useSettingsData();
  const [courses, setCourses] = useState<APICourse[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

  // Estados de loading
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

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

  const [classSettingsModal, setClassSettingsModal] = useState({
    isOpen: false,
    classData: null as any
  });

  const [createStudentModal, setCreateStudentModal] = useState({
    isOpen: false,
    preSelectedClassId: 0,
    preSelectedClassName: ""
  });

  const [selectStudentModal, setSelectStudentModal] = useState({
    isOpen: false,
    turmaId: 0,
    cursoId: '',
    turno: ''
  });

  const [createTeacherModal, setCreateTeacherModal] = useState(false);
  const [reportsModal, setReportsModal] = useState(false);
  const [generalSettingsModal, setGeneralSettingsModal] = useState(false);

  const [createCourseModal, setCreateCourseModal] = useState({
    isOpen: false,
    courseData: null as APICourse | null,
    isEditing: false
  });

  const [registrationModal, setRegistrationModal] = useState({
  isOpen: false,
  registrationData: null as Registration | null,
  isEditing: false,
  preSelectedStudentId: null as number | null
});

  const [paymentModal, setPaymentModal] = useState({
    isOpen: false,
    studentId: 0
  });

  const [selectedTeacher, setSelectedTeacher] = useState<any | null>(null);
  const [isTeacherProfileModalOpen, setIsTeacherProfileModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isStudentProfileModalOpen, setIsStudentProfileModalOpen] = useState(false);

  const [launchGradesModal, setLaunchGradesModal] = useState({
    isOpen: false,
    classInfo: null as { id: number; name: string; course: string } | null
  });

  const [paymentDetailsModal, setPaymentDetailsModal] = useState({
    isOpen: false,
    studentInfo: null as Student | null
  });

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  // Estados para filtros
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Estados para usuários e notas
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [gradesData, setGradesData] = useState<Grade[]>([]);

  // ✅ Verificar autenticação ao montar
  useEffect(() => {
    console.log('🔍 AdminDashboard montado - verificando autenticação...');
    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('❌ Usuário não autenticado, redirecionando...');
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // 🆕 Carregar dados de usuários fictícios
  useEffect(() => {
    if (!isAuthenticated) return;

    const mockUsers: SystemUser[] = [
      { id: 1, name: "Admin ISAC", email: "admin@isac.ac.mz", role: "admin", status: "active", createdAt: "2024-01-15", lastLogin: "2025-01-25" },
      { id: 2, name: "João Silva", email: "joao.silva@isac.ac.mz", role: "teacher", status: "active", createdAt: "2024-02-20", lastLogin: "2025-01-24", phone: "+258 84 123 4567" },
      { id: 3, name: "Maria Santos", email: "maria.santos@isac.ac.mz", role: "teacher", status: "active", createdAt: "2024-03-10", lastLogin: "2025-01-23", phone: "+258 85 234 5678" },
      { id: 4, name: "Pedro Costa", email: "pedro.costa@estudante.isac.ac.mz", role: "student", status: "active", createdAt: "2024-09-01", lastLogin: "2025-01-25", phone: "+258 86 345 6789" },
      { id: 5, name: "Ana Lopes", email: "ana.lopes@estudante.isac.ac.mz", role: "student", status: "active", createdAt: "2024-09-01", lastLogin: "2025-01-24", phone: "+258 87 456 7890" },
      { id: 6, name: "Carlos Mendes", email: "carlos.mendes@estudante.isac.ac.mz", role: "student", status: "inactive", createdAt: "2024-09-01", phone: "+258 84 567 8901" },
    ];

    setSystemUsers(mockUsers);
  }, [isAuthenticated]);

  // ✅ Carregar dados da API
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadAllData = async () => {
  try {
    // 1. Carregar cursos PRIMEIRO
    await loadCourses();
    
    // 2. Carregar turmas (dependem de cursos)
    await loadClasses();
    
    // 3. Carregar professores
    setIsLoadingTeachers(true);
    const teachers = await teacherService.getAll();
    const mappedTeachers = teachers.map((t: Teacher) => ({
      id: t.id,
      name: t.nome,
      email: t.email,
      phone: t.telefone || '',
      genero: t.genero,
      classes: 0,
      students: 0,
      status: t.status === 'ativo' ? 'active' : 'inactive',
      specialization: t.especialidade || '',
      contractType: t.tipo_contrato === 'tempo_integral' ? 'full-time' :
        t.tipo_contrato === 'meio_periodo' ? 'part-time' :
          t.tipo_contrato === 'freelancer' ? 'freelancer' : 'substitute',
      cursos: t.cursos || '',
      turnos: t.turnos || '',
      experience: t.observacoes || '',
      qualifications: t.observacoes || ''
    }));
    setTeacherStats(mappedTeachers);


    // 4. Carregar estudantes (dependem de turmas já carregadas)
// 4. Carregar estudantes (dependem de turmas já carregadas)
// 4. Carregar estudantes (dependem de turmas já carregadas)
setIsLoadingStudents(true);
const apiStudents = await studentService.getAll();

console.log('📚 Estudantes carregados da API:', apiStudents);
console.log('📚 TOTAL DE ESTUDANTES:', apiStudents.length);
console.log('📚 PRIMEIRO ESTUDANTE (estrutura):', apiStudents[0]);

const mappedStudents = apiStudents.map((student: APIStudent) => {
  const studentClass = classes.find(c => c.curso === student.curso_id);
  
  return {
    id: student.id,
    name: student.name || '',                    // ✅ API retorna 'name'
    email: student.email || '',
    phone: student.phone || '',                  // ✅ API retorna 'phone'
    className: student.curso || 'Sem curso',
    classId: studentClass?.id || 0,
    enrollmentDate: student.birth_date || new Date().toISOString().split('T')[0], // ✅ API retorna 'birth_date'
    status: student.status === 'ativo' ? 'active' : 'inactive',
    address: student.address || '',              // ✅ API retorna 'address'
    birthDate: student.birth_date || '',         // ✅ API retorna 'birth_date'
    level: '',
    parentName: '',
    parentPhone: '',
    emergencyContact: student.emergency_contact_1 || '', // ✅ API retorna 'emergency_contact_1'
    emergencyPhone: student.emergency_contact_2 || '',   // ✅ API retorna 'emergency_contact_2'
    notes: student.notes || ''                   // ✅ API retorna 'notes'
  };
});

setStudents(mappedStudents);
console.log('✅ Estudantes mapeados:', mappedStudents.length);

    // 5. 🆕 CARREGAR MATRÍCULAS (dependem de cursos, turmas e estudantes)
    await loadRegistrations();
    
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

  // ✅ Funções auxiliares para manipular dados localmente
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

 // CONTINUAÇÃO DA PARTE 1/2...

  // ✅ Funções de pagamento
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

 const updatePayment = async (paymentId: number, data: any) => {
  try {
    // TODO: Implementar chamada à API quando disponível
    // await paymentService.update(paymentId, data);
    
    setPayments(prev => prev.map(p => 
      p.id === paymentId ? { ...p, ...data } : p
    ));
    
    toast.success('Pagamento atualizado!');
  } catch (error: any) {
    console.error('Erro ao atualizar pagamento:', error);
    toast.error('Erro ao atualizar pagamento');
  }
};  

  // ✅ Funções de configurações
  const handleSaveSettings = async (newSettings: GeneralSettings) => {
    try {
      await persistSettings(newSettings);
      toast.success('Configurações salvas!');
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      toast.error("Erro ao salvar configurações");
    }
  };

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

  const paymentSummary = getPaymentSummary();

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

  // 📥 CARREGAR TURMAS DO BANCO
  const loadClasses = async () => {
    try {
      setIsLoadingClasses(true);
      console.log('📥 Carregando turmas do banco...');
      const data = await classService.getAll();
      console.log('✅ Turmas carregadas:', data.length, data);
      setClasses(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar turmas:', error);
      toast.error('Erro ao carregar turmas');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // 📥 CARREGAR CURSOS DO BANCO
  const loadCourses = async () => {
    try {
      setIsLoadingCourses(true);
      console.log('📥 Carregando cursos do banco...');
      const data = await courseService.getAll();
      console.log('✅ Cursos carregados:', data.length, data);
      setCourses(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar cursos:', error);
      toast.error('Erro ao carregar cursos');
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // 📥 CARREGAR MATRÍCULAS DO BANCO
const loadRegistrations = async () => {
  try {
    setIsLoadingRegistrations(true);
    console.log('📥 Carregando matrículas do banco...');
    const data = await registrationService.getAll();
    console.log('✅ Matrículas carregadas da API:', data);
    
    // ✅ MAPEAR de INGLÊS (API) para PORTUGUÊS (estado local)
    const mappedRegistrations: Registration[] = data.map((reg: any) => {
      // Buscar nome do estudante
      const student = students.find(s => s.id === reg.student_id);
      const studentName = student?.name || reg.student_name || 'Estudante não encontrado';
      
      // Buscar nome do curso
      const course = courses.find(c => c.codigo === reg.course_id);
      const courseName = course?.nome || reg.course_name || 'Curso não encontrado';
      
      // Buscar nome da turma
      const classItem = classes.find(c => c.id === reg.class_id);
      const className = classItem?.nome || reg.class_name || '';
      
      return {
        id: reg.id,
        studentId: reg.student_id,
        studentName: studentName,
        studentCode: reg.enrollment_number,
        courseId: reg.course_id,
        courseName: courseName,
        classId: reg.class_id,
        className: className,
        period: reg.period,
        enrollmentDate: reg.enrollment_date,
        status: reg.status || 'active',
        paymentStatus: reg.payment_status || 'pending',
        enrollmentFee: reg.enrollment_fee || 0,
        monthlyFee: reg.monthly_fee || 0,
        username: reg.username || '',        // ✅ ADICIONAR
        password: reg.password || '',        // ✅ ADICIONAR
        observations: reg.observations
      };
    });

    setRegistrations(mappedRegistrations);
    console.log('✅ Matrículas mapeadas:', mappedRegistrations.length);

  } catch (error: any) {
    console.error('❌ Erro ao carregar matrículas:', error);
    toast.error('Erro ao carregar matrículas');
  } finally {
    setIsLoadingRegistrations(false);
  }
};

const handleAddRegistration = () => {
  console.log('Abrindo modal de matrícula');
  setRegistrationModal({
    isOpen: true,
    registrationData: null,
    isEditing: false
  });
};
const handleViewRegistration = (registration: Registration) => {
  console.log('Visualizando matrícula:', registration);
  setRegistrationModal({
    isOpen: true,
    registrationData: registration,
    isEditing: false
  });
};

const handleEditRegistration = (registration: Registration) => {
  console.log('Editando matrícula:', registration);
  setRegistrationModal({
    isOpen: true,
    registrationData: registration,
    isEditing: true
  });
};

const handleSaveRegistration = async (registrationData: any) => {
  try {
    console.log('💾 Salvando matrícula (dados da API em inglês):', registrationData);

    if (registrationModal.isEditing && registrationModal.registrationData?.id) {
      // ✅ EDITAR matrícula existente
      await registrationService.update(registrationModal.registrationData.id, registrationData);
      toast.success('Matrícula atualizada com sucesso!');
    } else {
      // ✅ Enviar direto, já está em inglês
      console.log('📤 Enviando para API:', registrationData);
      const result = await registrationService.create(registrationData);
      console.log('✅ API retornou:', result);

      // ✅ GERAR PLANO DE PAGAMENTOS AUTOMATICAMENTE
      if (result && result.id) {
        try {
          const token = localStorage.getItem('auth_token');
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost/api-login/api';

          const planResponse = await fetch(`${API_URL}/student-payment-plans/generate.php`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ registration_id: result.id })
          });

          const planResult = await planResponse.json();

          if (planResult.success) {
            console.log('✅ Plano de pagamentos gerado:', planResult);
          } else {
            console.warn('⚠️ Não foi possível gerar plano de pagamentos:', planResult.message);
          }
        } catch (planError) {
          console.warn('⚠️ Erro ao gerar plano de pagamentos (matrícula criada):', planError);
        }
      }
    }

    // ✅ RECARREGAR LISTA DO BANCO
    await loadRegistrations();

    // ✅ NÃO fechar o modal aqui - deixar o RegistrationStudentModal mostrar
    // o modal de sucesso primeiro e fechar quando o usuário clicar

  } catch (error: any) {
    console.error('❌ Erro ao salvar matrícula:', error);
    console.error('❌ Dados enviados:', registrationData);
    toast.error(error.message || 'Erro ao salvar matrícula');
    throw error; // Re-throw para que o modal saiba que houve erro
  }
};

const handleDeleteRegistration = async (registrationId: number) => {
  if (confirm("Tem certeza que deseja cancelar esta matrícula?")) {
    try {
      await registrationService.cancel(registrationId);
      toast.success("Matrícula cancelada com sucesso!");
      
      // ✅ RECARREGAR LISTA DO BANCO
      await loadRegistrations();
      
    } catch (error: any) {
      console.error('❌ Erro ao cancelar matrícula:', error);
      toast.error('Erro ao cancelar matrícula');
    }
  }
};



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
        cursos: updatedTeacher.cursos,
        turnos: updatedTeacher.turnos,
        genero: updatedTeacher.genero,
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

  const handleLaunchGrades = (classItem: Class) => {
    setLaunchGradesModal({
      isOpen: true,
      classInfo: {
        id: classItem.id,
        name: classItem.nome || classItem.name || 'Turma',
        course: classItem.disciplina || classItem.subject || 'Curso'
      }
    });
  };

  const handleCloseLaunchGrades = () => {
    setLaunchGradesModal({ isOpen: false, classInfo: null });
  };

  const handleViewPaymentDetails = (student: Student) => {
    setPaymentDetailsModal({
      isOpen: true,
      studentInfo: student
    });
  };

  const handleClosePaymentDetails = () => {
    setPaymentDetailsModal({ isOpen: false, studentInfo: null });
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
    setClassSettingsModal({ isOpen: true, classData: classItem });
  };

  const handleCreateClass = () => {
    setClassModal({ isOpen: true, classData: null, isCreating: true });
  };

  const handleDeleteClass = async (classId: number) => {
    if (confirm("Tem certeza que deseja deletar esta turma?")) {
      try {
        console.log('🗑️ Deletando turma:', classId);
        await classService.delete(classId);
        toast.success("Turma deletada com sucesso!");
        await loadClasses();
        await loadCourses();
      } catch (error: any) {
        console.error('❌ Erro ao deletar:', error);
        toast.error(error.message || "Erro ao deletar turma");
      }
    }
  };

  const handleSaveClass = async (classData: Partial<APIClass>) => {
    try {
      console.log('💾 handleSaveClass chamado:', { isCreating: classModal.isCreating, classData });

      if (classModal.isCreating) {
        console.log('📤 Criando turma via API...', classData);
        const novaTurma = await classService.create(classData);
        console.log('✅ Turma criada:', novaTurma);
        toast.success("Turma criada com sucesso!");
      } else if (classModal.classData?.id) {
        console.log('📤 Atualizando turma via API...', classData);
        const turmaAtualizada = await classService.update(classModal.classData.id, classData);
        console.log('✅ Turma atualizada:', turmaAtualizada);
        toast.success("Turma atualizada com sucesso!");
      }

      await loadClasses();
      setClassModal({ isOpen: false, classData: null, isCreating: false });

    } catch (error: any) {
      console.error('❌ Erro ao salvar turma:', error);
      console.error('❌ Detalhes do erro:', error.response?.data);
      toast.error(error.message || "Erro ao salvar turma");
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

const handleCreateStudent = async (studentData: any) => {
  try {
    console.log('📤 Criando estudante:', studentData);
    
    // ✅ CHAMAR A API PARA CRIAR O ESTUDANTE
    const result = await studentService.create(studentData);
    
    console.log('✅ Estudante criado:', result);
    toast.success("Estudante cadastrado com sucesso!");
    
    // ✅ RECARREGAR A LISTA ATUALIZADA DO BANCO
    setIsLoadingStudents(true);
    const apiStudents = await studentService.getAll();
    
    // ✅ MAPEAMENTO CORRIGIDO - Campos em INGLÊS
const mappedStudents = apiStudents.map((student: APIStudent) => {
  const studentClass = classes.find(c => c.curso === student.curso_id);
  
  return {
    id: student.id,
    name: student.name || '',                    // ✅ API: name
    email: student.email || '',
    phone: student.phone || '',                  // ✅ API: phone
    className: student.curso || 'Sem curso',
    classId: studentClass?.id || 0,
    enrollmentDate: student.birth_date || new Date().toISOString().split('T')[0], // ✅ API: birth_date
    status: student.status === 'ativo' ? 'active' : 'inactive',
    address: student.address || '',              // ✅ API: address
    birthDate: student.birth_date || '',         // ✅ API: birth_date
    level: '',
    parentName: '',
    parentPhone: '',
    emergencyContact: student.emergency_contact_1 || '', // ✅ API: emergency_contact_1
    emergencyPhone: student.emergency_contact_2 || '',   // ✅ API: emergency_contact_2
    notes: student.notes || ''                   // ✅ API: notes
  };
});
    
    setStudents(mappedStudents);
    console.log('✅ Lista de estudantes atualizada');
    
  } catch (error: any) {
    console.error("❌ Erro ao criar estudante:", error);
    toast.error(error.message || "Erro ao criar estudante");
  } finally {
    setIsLoadingStudents(false);
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
        genero: t.genero,
        classes: 0,
        students: 0,
        status: t.status === 'ativo' ? 'active' : 'inactive',
        specialization: t.especialidade || '',
        contractType: t.tipo_contrato === 'tempo_integral' ? 'full-time' :
          t.tipo_contrato === 'meio_periodo' ? 'part-time' :
            t.tipo_contrato === 'freelancer' ? 'freelancer' : 'substitute',
        cursos: t.cursos || '',
        turnos: t.turnos || '',
        experience: t.observacoes || '',
        qualifications: t.observacoes || ''
      }));
      setTeacherStats(mappedTeachers);
      toast.success("Professor cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao atualizar lista de professores:", error);
      toast.error("Erro ao atualizar lista");
    }
  };

  const handleCreateCourse = async (courseData: APICourse) => {
    try {
      console.log('📤 Criando curso:', courseData);

      if (createCourseModal.isEditing && createCourseModal.courseData?.id) {
        await courseService.update(createCourseModal.courseData.id, courseData);
        toast.success("Curso atualizado com sucesso!");
      } else {
        await courseService.create(courseData);
        toast.success("Curso cadastrado com sucesso!");
      }

      await loadCourses();
    } catch (error: any) {
      console.error('❌ Erro ao salvar curso:', error);
      toast.error(error.message || "Erro ao salvar curso");
      throw error;
    }
  };

  const handleEditCourse = (course: APICourse) => {
    setCreateCourseModal({
      isOpen: true,
      courseData: course,
      isEditing: true
    });
  };

  const handleDeleteCourse = async (courseId: number) => {
    if (confirm("Tem certeza que deseja desativar este curso?")) {
      try {
        console.log('🗑️ Deletando curso:', courseId);
        await courseService.delete(courseId);
        toast.success("Curso desativado com sucesso!");
        await loadCourses();
      } catch (error: any) {
        console.error('❌ Erro ao deletar curso:', error);
        toast.error(error.message || "Erro ao deletar curso");
      }
    }
  };

  const handleGenerateReport = (reportType: string, filters: any) => {
    console.log("Gerando relatório:", reportType, "com filtros:", filters);
  };

  const handleAddStudentToClass = (classItem: Class) => {
    console.log('🎯 Abrindo SelectStudentModal para turma:', classItem);
    setSelectStudentModal({
      isOpen: true,
      turmaId: classItem.id || 0,
      cursoId: classItem.curso || '',
      turno: classItem.schedule || ''
    });
  };

  const handleOpenCreateStudentModal = () => {
    setCreateStudentModal({ isOpen: true, preSelectedClassId: 0, preSelectedClassName: "" });
  };

  const handleOpenPaymentModal = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      toast.error("Estudante não encontrado");
      return;
    }

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

  if (!isAuthenticated) {
    return null;
  }

 
  return (

  <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 overflow-hidden">
    {/* ========== SIDEBAR LATERAL ========== */}
    <AdminSidebar
      activeView={activeView}
      setActiveView={setActiveView}
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      onOpenSettings={() => setGeneralSettingsModal(true)}
      userName={user?.nome}
      userEmail={user?.email}
    />

    {/* ========== MAIN CONTENT ========== */}
    <main className="flex-1 overflow-y-auto">
      <AdminTopBar
  activeView={activeView}
  displayName={displayName}
  userRole={user?.role}
  onLogout={async () => {
    try {
      await logout();
      if (onLogout) onLogout();
    } catch (e) {
      console.error('Logout falhou', e);
    }
  }}
/>


      {/* Dashboard Content */}
      <div className="p-8">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="space-y-6">
          <TabsContent value="dashboard" className="space-y-6 mt-0">
            {/* Stats Grid - MELHORADO COM MAIS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AccentStatCard icon={GraduationCap} label="Estudantes" value={stats.totalStudents} subtitle="Total matriculados" color="blue" />
              <AccentStatCard icon={Users} label="Docentes" value={stats.totalTeachers} subtitle="Total de professores" color="purple" />
              <AccentStatCard icon={BookOpen} label="Turmas" value={stats.totalClasses} subtitle="Total de turmas" color="orange" />
              <AccentStatCard icon={FileText} label="Matrículas" value={registrations.length} subtitle="Matrículas ativas" color="cyan" />
              <AccentStatCard icon={DollarSign} label="Receita Total" value={formatCurrency(stats.totalRevenue)} subtitle="Arrecadado" color="green" />
              <AccentStatCard icon={AlertTriangle} label="Em Débito" value={stats.studentsInDebt} subtitle="Estudantes devendo" color="red" />
              <AccentStatCard icon={Shield} label="Usuários" value={systemUsers.length} subtitle="Total no sistema" color="pink" />
              <AccentStatCard icon={BarChart3} label="Taxa de Aprovação" value="87%" subtitle="Média geral" color="indigo" />
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
              permissions={adminPermissions}
              currentUserRole="admin"
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
              permissions={adminPermissions}
              currentUserRole="admin"
              onViewTeacherProfile={handleViewTeacherProfile}
              onDeleteTeacher={handleDeleteTeacher}
              onToggleTeacherStatus={handleToggleTeacherStatus}
              onAddTeacher={() => setCreateTeacherModal(true)}
            />
          </TabsContent>

          <TabsContent value="classes" className="mt-0">
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
              onLaunchGrades={handleLaunchGrades}
            />
          </TabsContent>

          <TabsContent value="courses" className="mt-0">
            <CourseList
              courses={courses}
              isLoading={isLoadingCourses}
              onAddCourse={() => setCreateCourseModal({ isOpen: true, courseData: null, isEditing: false })}
              onEditCourse={handleEditCourse}
              onDeleteCourse={handleDeleteCourse}
            />
          </TabsContent>

<TabsContent value="registrations" className="mt-0">
  <RegistrationList
    registrations={registrations}
    permissions={adminPermissions}
    currentUserRole="admin"
    onViewRegistration={handleViewRegistration}
    onEditRegistration={handleEditRegistration}
    onDeleteRegistration={handleDeleteRegistration}
    onAddRegistration={handleAddRegistration}
    onViewStudentProfile={(studentId) => {
      const student = students.find(s => s.id === studentId);
      if (student) {
        handleViewStudentProfile(student);
      }
    }}
  />
</TabsContent>

          <TabsContent value="inscriptions" className="mt-0">
            <InscriptionList
              onProceedToRegistration={(studentId) => {
                // Abrir modal de matrícula com estudante pré-selecionado
                setRegistrationModal({
                  isOpen: true,
                  registrationData: null,
                  isEditing: false,
                  preSelectedStudentId: studentId
                });
              }}
            />
          </TabsContent>

          <TabsContent value="payments" className="mt-0">
            <PaymentsDashboard />
          </TabsContent>

          <TabsContent value="users" className="mt-0">
            <UsersList
              users={systemUsers}
              permissions={adminPermissions}
              onViewUser={(user) => console.log('Ver usuário:', user)}
              onEditUser={(user) => console.log('Editar usuário:', user)}
              onDeleteUser={(userId) => {
                if (confirm('Tem certeza que deseja remover este usuário?')) {
                  setSystemUsers(prev => prev.filter(u => u.id !== userId));
                  toast.success('Usuário removido com sucesso!');
                }
              }}
              onCreateUser={(userData) => {
                const newUser: SystemUser = {
                  id: Date.now(),
                  name: userData.name || '',
                  email: userData.email || '',
                  phone: userData.phone,
                  role: userData.role || 'student',
                  status: userData.status || 'active',
                  createdAt: new Date().toISOString(),
                };
                setSystemUsers(prev => [...prev, newUser]);
                toast.success('Usuário criado com sucesso!');
              }}
              onUpdateUser={(userId, userData) => {
                setSystemUsers(prev => prev.map(u =>
                  u.id === userId ? { ...u, ...userData } : u
                ));
                toast.success('Usuário atualizado com sucesso!');
              }}
            />
          </TabsContent>

          <TabsContent value="grades" className="mt-0">
            <GradesList grades={gradesData} />
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
      permissions={adminPermissions}
      currentUserRole="admin"
      onSendEmailToAll={handleSendEmailToAll}
      onViewStudentProfile={handleViewStudentProfile}
      onAddStudent={() => handleAddStudentToClass({ id: studentModal.classId, name: studentModal.className } as Class)}
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

    <ClassSettingsModal
      isOpen={classSettingsModal.isOpen}
      onClose={() => setClassSettingsModal({ isOpen: false, classData: null })}
      classData={classSettingsModal.classData}
      currentUserRole="admin"
      onClassUpdated={() => {
        loadClasses();
        loadCourses();
      }}
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
      availableClasses={classes}
    />

    <ReportsModal
      isOpen={reportsModal}
      onClose={() => setReportsModal(false)}
      onGenerateReport={handleGenerateReport}
    />

    {paymentModal.isOpen && paymentModal.studentId > 0 && (
      <PaymentManagementModal
        isOpen={paymentModal.isOpen}
        onClose={() => setPaymentModal({ isOpen: false, studentId: 0 })}
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
      availableClasses={classes}
    />

    <StudentProfileModal
      isOpen={isStudentProfileModalOpen}
      onClose={handleCloseStudentProfileModal}
      student={selectedStudent}
      currentUserRole="admin"
      onSave={handleSaveStudentProfile}
      onViewPaymentDetails={handleViewPaymentDetails}
    />

    <GeneralSettingsModal
      isOpen={generalSettingsModal}
      onClose={() => setGeneralSettingsModal(false)}
      onSave={handleSaveSettings}
      currentSettings={settings}
    />

    <SelectStudentModal
      isOpen={selectStudentModal.isOpen}
      onClose={() => setSelectStudentModal({ isOpen: false, turmaId: 0, cursoId: '', turno: '' })}
      turmaId={selectStudentModal.turmaId}
      cursoId={selectStudentModal.cursoId}
      turno={selectStudentModal.turno}
      onStudentsAdded={() => {
        setSelectStudentModal({ isOpen: false, turmaId: 0, cursoId: '', turno: '' });
        toast.success('Estudantes adicionados com sucesso!');
        loadClasses();
      }}
    />

    <CreateCourseModal
      isOpen={createCourseModal.isOpen}
      onClose={() => setCreateCourseModal({ isOpen: false, courseData: null, isEditing: false })}
      onSave={handleCreateCourse}
      courseData={createCourseModal.courseData}
      isEditing={createCourseModal.isEditing}
/>


<RegistrationStudentModal
  isOpen={registrationModal.isOpen}
  onClose={() => setRegistrationModal({ isOpen: false, registrationData: null, isEditing: false, preSelectedStudentId: null })}
  registrationData={registrationModal.registrationData}
  isEditing={registrationModal.isEditing}
  onSave={handleSaveRegistration}
  existingRegistrations={registrations}
  preSelectedStudentId={registrationModal.preSelectedStudentId}
/>

    {launchGradesModal.classInfo && (
      <LaunchGradesModal
        isOpen={launchGradesModal.isOpen}
        onClose={handleCloseLaunchGrades}
        classInfo={launchGradesModal.classInfo}
      />
    )}

    {/* FLOATING CHAT BUTTON */}
    <GradientButton
      onClick={() => setShowChatModal(true)}
      className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl hover:scale-110 active:scale-95 z-50"
      title="Mensagens"
    >
      <MessageCircle className="h-7 w-7" />
    </GradientButton>

    {/* CHAT MODAL */}
    {showChatModal && (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full">
          <h3 className="text-2xl font-bold text-[#004B87] mb-4">Enviar Mensagem</h3>
          <p className="text-slate-600 mb-6">
            Envie uma mensagem para os usuários do sistema
          </p>

          <textarea
            className="w-full h-40 p-4 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] focus:outline-none resize-none mb-4 text-sm"
            placeholder="Digite sua mensagem aqui..."
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
          />

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowChatModal(false);
                setChatMessage("");
              }}
              className="flex-1"
            >
              Cancelar
            </Button>
            <GradientButton
              onClick={() => {
                if (chatMessage.trim()) {
                  toast.success("Mensagem enviada com sucesso!");
                  setShowChatModal(false);
                  setChatMessage("");
                } else {
                  toast.error("Digite uma mensagem");
                }
              }}
              className="flex-1"
            >
              Enviar
            </GradientButton>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
