// src/components/AdminDashboard.tsx - CÓDIGO COMPLETO
import { useState, useEffect, useCallback } from "react";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { useAuthStore } from "@/store/authStore";
import studentService, { Student as APIStudent } from "@/services/studentService";
import classService, { Class as APIClass } from "@/services/classService";
import teacherService, { Teacher, CreateTeacherData } from "@/services/teacherService";
import courseService, { Course as APICourse } from "@/services/courseService";
import registrationService from '@/services/registrationService';
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccentStatCard } from "@/components/ui/stat-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { RegistrationStudentModal } from "./shared/reusable/RegistrationStudentModal";
import { EditRegistrationModal } from "./shared/reusable/EditRegistrationModal";
import { Input } from "@/components/ui/input";
import {
  Users, BookOpen, DollarSign, UserPlus, GraduationCap,
  LogOut, Shield, BarChart3, AlertTriangle, TrendingUp,
  FileText, MessageCircle, Copy, Key, CheckCircle, Zap, ArrowRightLeft
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

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
import nivelService from '@/services/nivelService';
import { CourseList } from "./shared/superadmin/CourseList";
import { RegistrationList, Registration } from "./shared/reusable/RegistrationList";
import { UsersList, SystemUser } from "@/components/Users/UsersList";
import userService from "@/services/userService";
import { GradesList } from "./shared/GradesList";
import { GradeManagementModal } from "./shared/GradeManagementModal";
import { LevelTransitionPanel } from "./shared/LevelTransitionPanel";
import { StudentPaymentDetailsModal } from "./Payments/StudentPaymentDetailsModal";
import { AdminSidebar, menuItems, AdminView } from "./shared/AdminSidebar";
import { InscriptionList } from "./shared/InscriptionList";
import { InscriptionStudentModal } from "./shared/InscriptionStudentModal";
import { PaymentsDashboard } from "./shared/PaymentsDashboard";
import { ClassSettingsModal } from "./Classes/ClassSettingsModal";
import { useSettingsData, GeneralSettings } from "@/hooks/useSettingsData";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";


// Types
// Types
import { Class as ClassType, Student as StudentType, Permission, PaymentMethod, User } from "../types";

interface AdminDashboardProps {
  onLogout?: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {

  const { openConfirm, dialogProps } = useConfirmDialog();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const checkAuth = useAuthStore((s) => s.checkAuth);
  const displayName = user ? user.nome : 'Admin';

  // ✅ Estados de navegação
  const [activeView, setActiveView] = useState<AdminView>(
    () => (sessionStorage.getItem("admin_active_view") as AdminView) || 'dashboard'
  );
  const persistView = (view: AdminView) => {
    sessionStorage.setItem("admin_active_view", view);
    setActiveView(view);
  };
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
  const [pendingTransitionsCount, setPendingTransitionsCount] = useState<number>(0);

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

  const [quickInscriptionModal, setQuickInscriptionModal] = useState(false);

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

  const [editRegModal, setEditRegModal] = useState<{ isOpen: boolean; registration: Registration | null }>({
    isOpen: false,
    registration: null,
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
    classData: null as Class | null,
    students: [] as Student[],
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
  const [selectedGradesClassId, setSelectedGradesClassId] = useState<number | undefined>(undefined);
  const [createdCredentials, setCreatedCredentials] = useState<{
    isOpen: boolean;
    username: string;
    password: string;
    name: string;
    role: string;
  }>({ isOpen: false, username: '', password: '', name: '', role: '' });

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

  // Carregar dados de usuários da API
  const loadUsers = async () => {
    try {
      const apiUsers = await userService.getAll();
      const mapped: SystemUser[] = apiUsers.map(u => ({
        id: u.id,
        name: u.nome,
        email: u.email || undefined,
        username: u.username || undefined,
        role: u.role,
        status: u.status,
        createdAt: u.created_at,
        lastLogin: u.last_login || undefined,
        avatar: u.avatar || undefined,
        sourceTable: u.source_table,
      }));
      setSystemUsers(mapped);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadUsers();
  }, [isAuthenticated]);

  // ✅ Carregar todos os dados em paralelo
  useEffect(() => {
    if (!isAuthenticated) return;
    const loadAllData = async () => {
      setIsLoadingStudents(true);
      setIsLoadingCourses(true);
      setIsLoadingClasses(true);
      setIsLoadingTeachers(true);
      try {
        // Todos os pedidos independentes em paralelo — muito mais rápido
        const [coursesData, classesData, teachersData, apiStudents, regsData] = await Promise.all([
          courseService.getAll(),
          classService.getAll(),
          teacherService.getAll(),
          studentService.getAll(),
          registrationService.getAll(),
        ]);

        // Cursos e turmas
        setCourses(coursesData);
        setClasses(classesData);

        // Professores
        const mappedTeachers = teachersData.map((t: Teacher) => ({
          id: t.id,
          name: t.nome,
          email: t.email,
          phone: t.telefone || '',
          genero: t.genero,
          classes: (t as Teacher & { turmas_count?: string }).turmas_count
            ? parseInt((t as Teacher & { turmas_count?: string }).turmas_count!)
            : 0,
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

        // Estudantes — usa classesData directamente (não o estado que ainda não actualizou)
        const mappedStudents = apiStudents.map((student: APIStudent) => {
          const studentClass = classesData.find((c: { curso: string }) => c.curso === student.curso_id);
          return {
            id: student.id,
            name: student.name || '',
            email: student.email || '',
            phone: student.phone || '',
            className: student.curso || 'Sem curso',
            courseId: student.curso_id || '',
            classId: studentClass?.id || 0,
            enrollmentDate: student.birth_date || new Date().toISOString().split('T')[0],
            status: student.status === 'ativo' ? 'active' : 'inactive',
            address: student.address || '',
            birthDate: student.birth_date || '',
            level: '',
            parentName: '',
            parentPhone: '',
            emergencyContact: student.emergency_contact_1 || '',
            emergencyPhone: student.emergency_contact_2 || '',
            notes: student.notes || ''
          };
        });
        setStudents(mappedStudents);

        // Matrículas — usa dados já disponíveis (sem depender do estado)
        const mappedRegistrations: Registration[] = regsData.map((reg: Record<string, unknown>) => {
          const regStudentId = reg.student_id as number;
          const regCourseId  = reg.course_id  as string;
          const regClassId   = reg.class_id   as number;
          const stud     = mappedStudents.find((s: { id: number }) => s.id === regStudentId);
          const course   = coursesData.find((c: { codigo: string }) => c.codigo === regCourseId);
          const classItem = classesData.find((c: { id: number }) => c.id === regClassId);
          return {
            id:             reg.id             as number,
            studentId:      regStudentId,
            studentName:    stud?.name || (reg.student_name as string) || 'Estudante não encontrado',
            studentCode:    reg.username       as string,
            courseId:       regCourseId,
            courseName:     course?.nome || (reg.course_name as string) || 'Curso não encontrado',
            classId:        regClassId,
            className:      classItem?.nome || (reg.class_name as string) || '',
            period:         reg.period         as string,
            enrollmentDate: reg.enrollment_date as string,
            status:         (reg.status        as string) || 'active',
            paymentStatus:  (reg.payment_status as string) || 'pending',
            enrollmentFee:  (reg.enrollment_fee as number) || 0,
            monthlyFee:     (reg.monthly_fee    as number) || 0,
            username:       (reg.username       as string) || '',
            password:       (reg.password       as string) || '',
            observations:   reg.observations    as string | undefined,
          };
        });
        setRegistrations(mappedRegistrations);

        // Transições pendentes (não crítico — em background)
        fetch('/api/level-transitions.php?action=count_pending', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }).then(r => r.json()).then(json => {
          if (json.success) setPendingTransitionsCount(json.count);
        }).catch(() => {});

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingCourses(false);
        setIsLoadingClasses(false);
        setIsLoadingTeachers(false);
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
  } catch (error) {
    console.error('Erro ao atualizar pagamento:', error);
    toast.error(error instanceof Error ? error.message : 'Erro ao atualizar pagamento');
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

  // 📥 CARREGAR PROFESSORES DO BANCO
  const loadTeachers = async () => {
    try {
      setIsLoadingTeachers(true);
      const teachers = await teacherService.getAll();
      const mappedTeachers = teachers.map((t: Teacher) => ({
        id: t.id,
        name: t.nome,
        email: t.email,
        phone: t.telefone || '',
        genero: t.genero,
        classes: (t as Teacher & { turmas_count?: string }).turmas_count
          ? parseInt((t as Teacher & { turmas_count?: string }).turmas_count!)
          : 0,
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
    } catch (error: any) {
      console.error('❌ Erro ao carregar professores:', error);
    } finally {
      setIsLoadingTeachers(false);
    }
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
        studentCode: reg.username,
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
  } finally {
    setIsLoadingRegistrations(false);
  }
};

  // ── Auto-refresh: volta ao tab ou a cada 60s ──────────────────────────
  const refreshAll = useCallback(() => {
    if (!isAuthenticated) return;
    loadUsers();
    loadCourses();
    loadClasses();
    loadRegistrations();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  useAutoRefresh(refreshAll, { interval: 60_000 });
  // ─────────────────────────────────────────────────────────────────────

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
  setEditRegModal({ isOpen: true, registration });
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

const handleDeleteRegistration = (registrationId: number) => {
  openConfirm(
    { title: "Cancelar Matrícula", message: "Tem certeza que deseja cancelar esta matrícula? Esta acção não pode ser desfeita.", confirmLabel: "Cancelar Matrícula", variant: "warning" },
    async () => {
      try {
        await registrationService.cancel(registrationId);
        toast.success("Matrícula cancelada com sucesso!");
        await loadRegistrations();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erro ao cancelar matrícula');
      }
    }
  );
};



  const handleViewTeacherProfile = (teacher: any) => {
    setSelectedTeacher(teacher);
    setIsTeacherProfileModalOpen(true);
  };

  const handleSaveTeacherProfile = async (updatedTeacher: any) => {
    try {
      // Map English status back to Portuguese for the backend
      const statusMap: Record<string, string> = { active: 'ativo', inactive: 'inativo', suspended: 'inativo' };
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
        status: statusMap[updatedTeacher.status] ?? 'ativo',
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
      await studentService.update({
        id: updatedStudent.id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        phone: updatedStudent.phone,
        birth_date: updatedStudent.birthDate,
        address: updatedStudent.address,
        status: updatedStudent.status === 'active' ? 'ativo' : 'inativo'
      });
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

  const handleResetStudentPassword = async (studentId: number, newPassword: string) => {
    try {
      await studentService.update({ id: studentId, password: newPassword });
      toast.success("Senha resetada. O estudante será obrigado a definir uma nova senha no próximo acesso.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao resetar senha";
      console.error("Erro ao resetar senha:", error);
      toast.error(msg);
    }
  };

  const handleLaunchGrades = (classItem: Class) => {
    setLaunchGradesModal({
      isOpen: true,
      classData: classItem,
      students: (classItem as Class & { students?: Student[] }).students || [],
    });
  };

  const handleCloseLaunchGrades = () => {
    setLaunchGradesModal({ isOpen: false, classData: null, students: [] });
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

  const handleDeleteTeacher = (teacherId: number) => {
    openConfirm(
      { title: "Remover Docente", message: "Tem certeza que deseja remover este docente? Esta acção não pode ser desfeita.", confirmLabel: "Remover" },
      async () => {
        try {
          await teacherService.delete(teacherId);
          setTeacherStats(prev => prev.filter(t => t.id !== teacherId));
          toast.success("Professor removido com sucesso!");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao remover professor");
        }
      }
    );
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
      // silently ignore load errors
    }
  };

  const handleManageClass = (classItem: Class) => {
    setClassSettingsModal({ isOpen: true, classData: classItem });
  };

  const handleCreateClass = () => {
    setClassModal({ isOpen: true, classData: null, isCreating: true });
  };

  const handleDeleteClass = (classId: number) => {
    openConfirm(
      { title: "Eliminar Turma", message: "Tem certeza que deseja eliminar esta turma? Esta acção é permanente e não pode ser desfeita.", confirmLabel: "Eliminar" },
      async () => {
        try {
          await classService.delete(classId);
          toast.success("Turma eliminada com sucesso!");
          await loadClasses();
          await loadCourses();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao eliminar turma");
        }
      }
    );
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

  const handleDeleteStudent = (studentId: number) => {
    openConfirm(
      { title: "Remover Estudante", message: "Tem certeza que deseja remover este estudante? Todos os dados associados serão afectados.", confirmLabel: "Remover" },
      async () => {
        try {
          await studentService.delete(studentId);
          deleteStudent(studentId);
          toast.success("Estudante removido com sucesso!");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao remover estudante");
        }
      }
    );
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
    courseId: student.curso_id || '',
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
      await loadTeachers();
      await loadUsers();
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
        const createdCourse = await courseService.create(courseData);
        // Save course levels with prices if the course has levels defined
        if (courseData.tem_niveis && courseData.niveis?.length) {
          await nivelService.saveNiveisForCourse(createdCourse.id!, courseData.niveis);
        }
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

  const handleDeleteCourse = (courseId: number) => {
    openConfirm(
      { title: "Desativar Curso", message: "Tem certeza que deseja desativar este curso? Deixará de estar disponível para novas matrículas.", confirmLabel: "Desativar", variant: "warning" },
      async () => {
        try {
          await courseService.delete(courseId);
          toast.success("Curso desativado com sucesso!");
          await loadCourses();
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Erro ao desativar curso");
        }
      }
    );
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
    setQuickInscriptionModal(true);
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
    return 'MT ' + new Intl.NumberFormat('pt-MZ', {
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
      setActiveView={persistView}
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
        <Tabs value={activeView} onValueChange={(v) => persistView(v as AdminView)} className="space-y-6">
          <TabsContent value="dashboard" className="space-y-6 mt-0">
            {/* Stats Grid - MELHORADO COM MAIS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {/* Turmas */}
              <div className="bg-white rounded-2xl border border-[#F5821F]/20 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-[#F5821F] rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Turmas</span>
                </div>
                <div className="text-3xl font-bold text-[#F5821F]">{stats.totalClasses}</div>
                <p className="text-xs text-slate-400 mt-1">Total de turmas</p>
              </div>

              {/* Receita Total */}
              <div className="bg-white rounded-2xl border border-[#004B87]/20 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Receita Total</span>
                </div>
                <div className="text-3xl font-bold text-[#004B87]">{formatCurrency(stats.totalRevenue)}</div>
                <p className="text-xs text-slate-400 mt-1">Arrecadado</p>
              </div>

              {/* Em Débito */}
              <div className="bg-white rounded-2xl border border-[#F5821F]/20 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-[#F5821F] rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Em Débito</span>
                </div>
                <div className="text-3xl font-bold text-[#F5821F]">{stats.studentsInDebt}</div>
                <p className="text-xs text-slate-400 mt-1">Estudantes devendo</p>
              </div>

              {/* Usuários */}
              <div className="bg-white rounded-2xl border border-[#004B87]/20 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Usuários</span>
                </div>
                <div className="text-3xl font-bold text-[#004B87]">{systemUsers.length}</div>
                <p className="text-xs text-slate-400 mt-1">Total no sistema</p>
              </div>

              {/* Transições Pendentes */}
              <button
                onClick={() => persistView('transitions')}
                className={`bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition-shadow text-left w-full ${
                  pendingTransitionsCount > 0
                    ? 'border-amber-300 hover:border-amber-400'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                    pendingTransitionsCount > 0 ? 'bg-amber-500' : 'bg-slate-400'
                  }`}>
                    <ArrowRightLeft className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-500 font-medium">Transições</span>
                </div>
                <div className={`text-3xl font-bold ${
                  pendingTransitionsCount > 0 ? 'text-amber-500' : 'text-slate-400'
                }`}>{pendingTransitionsCount}</div>
                <p className="text-xs text-slate-400 mt-1">Níveis pendentes</p>
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Ações Rápidas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <button
                  onClick={handleOpenCreateStudentModal}
                  className="group flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-[#F5821F] hover:bg-[#F5821F]/5 transition-all duration-200 text-left"
                >
                  <div className="h-10 w-10 bg-[#004B87]/10 group-hover:bg-[#F5821F]/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <UserPlus className="h-5 w-5 text-[#004B87] group-hover:text-[#F5821F] transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#F5821F] transition-colors duration-200">Cadastrar Estudante</p>
                    <p className="text-xs text-slate-400 group-hover:text-[#F5821F]/70 transition-colors duration-200">Novo aluno</p>
                  </div>
                </button>

                <button
                  onClick={() => setCreateTeacherModal(true)}
                  className="group flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-[#F5821F] hover:bg-[#F5821F]/5 transition-all duration-200 text-left"
                >
                  <div className="h-10 w-10 bg-[#004B87]/10 group-hover:bg-[#F5821F]/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <Users className="h-5 w-5 text-[#004B87] group-hover:text-[#F5821F] transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#F5821F] transition-colors duration-200">Adicionar Docente</p>
                    <p className="text-xs text-slate-400 group-hover:text-[#F5821F]/70 transition-colors duration-200">Novo professor</p>
                  </div>
                </button>

                <button
                  onClick={handleCreateClass}
                  className="group flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-[#F5821F] hover:bg-[#F5821F]/5 transition-all duration-200 text-left"
                >
                  <div className="h-10 w-10 bg-[#004B87]/10 group-hover:bg-[#F5821F]/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <BookOpen className="h-5 w-5 text-[#004B87] group-hover:text-[#F5821F] transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#F5821F] transition-colors duration-200">Criar Turma</p>
                    <p className="text-xs text-slate-400 group-hover:text-[#F5821F]/70 transition-colors duration-200">Nova turma</p>
                  </div>
                </button>

                <button
                  onClick={() => setReportsModal(true)}
                  className="group flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 hover:border-[#F5821F] hover:bg-[#F5821F]/5 transition-all duration-200 text-left"
                >
                  <div className="h-10 w-10 bg-[#004B87]/10 group-hover:bg-[#F5821F]/15 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <BarChart3 className="h-5 w-5 text-[#004B87] group-hover:text-[#F5821F] transition-colors duration-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-[#F5821F] transition-colors duration-200">Gerar Relatório</p>
                    <p className="text-xs text-slate-400 group-hover:text-[#F5821F]/70 transition-colors duration-200">Exportar dados</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-500 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">Visão Financeira</h3>
                    <p className="text-xs text-slate-400">Resumo e estatísticas gerais</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-[#004B87]/8 border border-[#004B87]/20 rounded-xl px-3 py-1.5">
                  <TrendingUp className="h-4 w-4 text-[#004B87]" />
                  <span className="text-xs font-semibold text-[#004B87]">Taxa: {paymentSummary.collectionRate.toFixed(1)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Left: Metrics */}
                <div className="lg:col-span-3 p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Receita Total — azul (positivo) */}
                    <div className="flex items-center gap-3 p-4 bg-[#004B87]/5 rounded-xl border border-[#004B87]/15">
                      <div className="h-10 w-10 bg-[#004B87] rounded-xl flex items-center justify-center flex-shrink-0">
                        <DollarSign className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Receita Total</p>
                        <p className="font-bold text-[#004B87]">{formatCurrency(paymentSummary.totalRevenue)}</p>
                      </div>
                    </div>

                    {/* Pendente — cinza (neutro) */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="h-10 w-10 bg-slate-400 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Pendente</p>
                        <p className="font-bold text-slate-600">{formatCurrency(paymentSummary.totalPending)}</p>
                      </div>
                    </div>

                    {/* Em Atraso — laranja (alerta) */}
                    <div className="flex items-center gap-3 p-4 bg-[#F5821F]/8 rounded-xl border border-[#F5821F]/20">
                      <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Em Atraso</p>
                        <p className="font-bold text-[#F5821F]">{formatCurrency(paymentSummary.totalOverdue)}</p>
                      </div>
                    </div>

                    {/* Antecipado — azul (positivo) */}
                    <div className="flex items-center gap-3 p-4 bg-[#004B87]/5 rounded-xl border border-[#004B87]/15">
                      <div className="h-10 w-10 bg-[#004B87] rounded-xl flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Antecipado</p>
                        <p className="font-bold text-[#004B87]">{formatCurrency(paymentSummary.totalAdvance)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-[#004B87]/5 rounded-xl border border-[#004B87]/15">
                      <p className="text-lg font-bold text-[#004B87]">{paymentSummary.studentsWithAdvance}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Com Crédito</p>
                    </div>
                    <div className="text-center p-3 bg-[#F5821F]/8 rounded-xl border border-[#F5821F]/20">
                      <p className="text-lg font-bold text-[#F5821F]">{paymentSummary.studentsInDebt}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Em Débito</p>
                    </div>
                    <div className="text-center p-3 bg-[#004B87]/5 rounded-xl border border-[#004B87]/15">
                      <p className="text-sm font-bold text-[#004B87] leading-tight">{formatCurrency(paymentSummary.averageMonthlyRevenue)}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Média/Mês</p>
                    </div>
                  </div>
                </div>

                {/* Right: Donut Chart */}
                <div className="lg:col-span-2 border-l border-slate-100 p-6 flex flex-col items-center justify-center">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Distribuição Financeira</p>
                  <p className="text-xs text-slate-400 mb-4">Visão geral dos valores</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Receita', value: Math.max(paymentSummary.totalRevenue, 0.01) },
                          { name: 'Pendente', value: Math.max(paymentSummary.totalPending, 0) },
                          { name: 'Em Atraso', value: Math.max(paymentSummary.totalOverdue, 0) },
                          { name: 'Antecipado', value: Math.max(paymentSummary.totalAdvance, 0) },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        <Cell fill="#004B87" />
                        <Cell fill="#94A3B8" />
                        <Cell fill="#F5821F" />
                        <Cell fill="#004B87" opacity={0.5} />
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number) => value <= 0.01 ? 'Sem dados' : formatCurrency(value)}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-2">
                    {[
                      { color: '#004B87', label: 'Receita' },
                      { color: '#94A3B8', label: 'Pendente' },
                      { color: '#F5821F', label: 'Em Atraso' },
                      { color: '#004B87', label: 'Antecipado', opacity: 0.5 },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color, opacity: 'opacity' in item ? (item.opacity as number) : 1 }} />
                        <span className="text-xs text-slate-500">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-0">
            <StudentList
              students={students}
              courses={courses}
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
              courses={courses}
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
                openConfirm(
                  { title: "Remover Utilizador", message: "Tem certeza que deseja remover este utilizador? O acesso ao sistema será revogado imediatamente.", confirmLabel: "Remover" },
                  async () => {
                    try {
                      await userService.delete(userId);
                      setSystemUsers(prev => prev.filter(u => u.id !== userId));
                      toast.success('Utilizador removido com sucesso!');
                    } catch (error) {
                      toast.error(error instanceof Error ? error.message : 'Erro ao remover utilizador');
                    }
                  }
                );
              }}
              onCreateUser={async (userData) => {
                try {
                  const userWithPassword = userData as Partial<SystemUser> & { password?: string };
                  const plainPassword = userWithPassword.password || '';
                  const result = await userService.create({
                    nome:      userData.name      || '',
                    email:     userData.email     || undefined,
                    phone:     userData.phone     || undefined,
                    bi_number: userData.bi_number || undefined,
                    senha:     plainPassword,
                    role:      userData.role      || 'admin',
                    status:    userData.status    || 'active',
                  });
                  if (result.data) {
                    const newUser: SystemUser = {
                      id: result.data.id,
                      name: result.data.nome,
                      email: result.data.email || undefined,
                      username: result.data.username || undefined,
                      role: result.data.role,
                      status: result.data.status,
                      createdAt: result.data.created_at,
                    };
                    setSystemUsers(prev => [...prev, newUser]);

                    // Mostrar credenciais ao utilizador
                    setCreatedCredentials({
                      isOpen: true,
                      username: result.data.username || '',
                      password: plainPassword,
                      name: result.data.nome,
                      role: result.data.role === 'admin' ? 'Super Admin' : 'Academic Admin',
                    });
                  }
                  toast.success('Usuário criado com sucesso!');
                } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : 'Erro ao criar usuário');
                }
              }}
              onUpdateUser={async (userId, userData) => {
                try {
                  const userWithPassword = userData as Partial<SystemUser> & { newPassword?: string };
                  const result = await userService.update({
                    id:        userId,
                    nome:      userData.name      || '',
                    email:     userData.email     || undefined,
                    phone:     userData.phone     || undefined,
                    bi_number: userData.bi_number || undefined,
                    role:      userData.role,
                    status:    userData.status,
                    senha:     userWithPassword.newPassword || undefined,
                  });
                  if (result.data) {
                    setSystemUsers(prev => prev.map(u =>
                      u.id === userId ? {
                        ...u,
                        name: result.data!.nome,
                        email: result.data!.email || undefined,
                        username: result.data!.username || undefined,
                        role: result.data!.role,
                        status: result.data!.status,
                      } : u
                    ));
                  }
                  toast.success('Usuário atualizado com sucesso!');
                } catch (error: unknown) {
                  toast.error(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
                }
              }}
            />
          </TabsContent>

          <TabsContent value="grades" className="mt-0">
            <GradesList classId={selectedGradesClassId} />
          </TabsContent>

          <TabsContent value="transitions" className="mt-0">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Level Transitions</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Manage student promotions, level repetitions and failures.
                </p>
              </div>
              <LevelTransitionPanel />
            </div>
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
        loadTeachers();
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

    <InscriptionStudentModal
      isOpen={quickInscriptionModal}
      onClose={() => setQuickInscriptionModal(false)}
      onSuccess={() => setQuickInscriptionModal(false)}
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
    />

    <StudentProfileModal
      isOpen={isStudentProfileModalOpen}
      onClose={handleCloseStudentProfileModal}
      student={selectedStudent}
      currentUserRole="admin"
      onSave={handleSaveStudentProfile}
      onViewPaymentDetails={handleViewPaymentDetails}
      onResetPassword={handleResetStudentPassword}
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

<EditRegistrationModal
  isOpen={editRegModal.isOpen}
  onClose={() => setEditRegModal({ isOpen: false, registration: null })}
  registration={editRegModal.registration}
  onSuccess={loadRegistrations}
/>

    {launchGradesModal.classData && (
      <GradeManagementModal
        isOpen={launchGradesModal.isOpen}
        onClose={handleCloseLaunchGrades}
        onSave={() => {}}
        classData={launchGradesModal.classData}
        students={launchGradesModal.students}
        onNavigateToTransitions={() => { handleCloseLaunchGrades(); setActiveView('transitions'); }}
      />
    )}

    <ConfirmDialog {...dialogProps} />

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

      {/* Modal de Credenciais do Usuário Criado */}
      <Dialog open={createdCredentials.isOpen} onOpenChange={(open) => {
        if (!open) setCreatedCredentials(prev => ({ ...prev, isOpen: false }));
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#004B87] flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Usuário Criado com Sucesso
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center">
              <p className="text-sm text-green-700 font-medium">
                {createdCredentials.name}
              </p>
              <Badge className="mt-1 bg-green-100 text-green-700 border-green-300">
                {createdCredentials.role}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5" />
                    Username / Login
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.username);
                      toast.success('Username copiado!');
                    }}
                    className="text-xs text-[#F5821F] hover:text-[#004B87] flex items-center gap-1 font-medium"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar
                  </button>
                </div>
                <p className="text-lg font-mono font-bold text-[#004B87]">
                  {createdCredentials.username}
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Senha
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdCredentials.password);
                      toast.success('Senha copiada!');
                    }}
                    className="text-xs text-[#F5821F] hover:text-[#004B87] flex items-center gap-1 font-medium"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar
                  </button>
                </div>
                <p className="text-lg font-mono font-bold text-slate-800">
                  {createdCredentials.password}
                </p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700 font-medium">
                Guarde estas credenciais em local seguro. A senha não poderá ser visualizada novamente após fechar esta janela.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                navigator.clipboard.writeText(
                  `Username: ${createdCredentials.username}\nSenha: ${createdCredentials.password}`
                );
                toast.success('Credenciais copiadas!');
              }}
              variant="outline"
              className="border-2"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Tudo
            </Button>
            <Button
              onClick={() => setCreatedCredentials(prev => ({ ...prev, isOpen: false }))}
              className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white"
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  </div>
);
}
