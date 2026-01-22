// src/components/shared/RegistrationStudentModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText, User, BookOpen, DollarSign, Calendar,
  Sparkles, ChevronRight, CheckCircle2, AlertCircle,
  Search, GraduationCap, Clock, CreditCard, Hash,
  Shield, Key, Lock, X
} from "lucide-react";
import { Registration } from "./RegistrationList";
import courseService from '@/services/courseService';
import studentService from '@/services/studentService';
import classService from '@/services/classService';
import registrationService from '@/services/registrationService';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";

interface RegistrationStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData?: Registration | null;
  isEditing?: boolean;
  onSave: (registrationData: Partial<Registration>) => void;
  existingRegistrations?: Registration[];
}

export function RegistrationStudentModal({
  isOpen,
  onClose,
  registrationData,
  isEditing = false,
  onSave,
  existingRegistrations = [] // ✅ ADD THIS PARAMETER
}: RegistrationStudentModalProps) {

  const [activeTab, setActiveTab] = useState<'student' | 'credentials' | 'course' | 'payment'>('student');

  // Dados disponíveis
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<any[]>([]);

  // Estados de busca
  const [studentSearch, setStudentSearch] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [formData, setFormData] = useState<Partial<Registration>>({
    studentId: 0,
    studentName: '',
    studentCode: '',
    courseId: '',
    courseName: '',
    classId: undefined,
    className: '',
    period: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: 'active',
    paymentStatus: 'pending',
    enrollmentFee: 0,
    monthlyFee: 0,
    observations: '',
    usuario: '',
    senha: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Carregar dados disponíveis
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      try {
        // Carregar estudantes
        setIsLoadingStudents(true);
        const studentsData = await studentService.getAll();
        setStudents(studentsData);

        // Carregar cursos
        setIsLoadingCourses(true);
        const coursesData = await courseService.getAll();
        setCourses(coursesData);

        // Carregar turmas
        setIsLoadingClasses(true);
        const classesData = await classService.getAll();
        setClasses(classesData);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingCourses(false);
        setIsLoadingClasses(false);
      }
    };

    loadData();
  }, [isOpen]);

  // Atualizar dados ao abrir
  useEffect(() => {
    if (registrationData && isEditing) {
      setFormData(registrationData);
    } else {
      setFormData({
        studentId: 0,
        studentName: '',
        studentCode: '',
        courseId: '',
        courseName: '',
        classId: undefined,
        className: '',
        period: generateCurrentPeriod(),
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: 'active',
        paymentStatus: 'pending',
        enrollmentFee: 5000,
        monthlyFee: 2500,
        observations: '',
        usuario: '',  // Explicitly reset to empty
        senha: ''     // Explicitly reset to empty
      });
    }
    setFormErrors({});
    setActiveTab('student');
    setStudentSearch('');
  }, [registrationData, isEditing, isOpen]);

  // Filtrar turmas quando curso mudar
  useEffect(() => {
    if (formData.courseId) {
      const turmasDoCurso = classes.filter(c => c.curso === formData.courseId);
      setFilteredClasses(turmasDoCurso);
    } else {
      setFilteredClasses([]);
    }
  }, [formData.courseId, classes]);
  // Gerar período atual (ex: 2025/1)
  const generateCurrentPeriod = () => {
    const year = new Date().getFullYear();
    const month = new Date().getMonth() + 1;
    const semester = month <= 6 ? '1' : '2';
    return `${year}/${semester}`;
  };

  //o que adicionei
  const filteredStudents = students.filter(student => {
    // 1. Se este estudante já foi selecionado, não mostrar na lista
    if (formData.studentId && student.id === formData.studentId) {
      return false;
    }
    
    // 2. Filtros de busca normais
    return (
      (student.name?.toLowerCase() || '').includes(studentSearch.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(studentSearch.toLowerCase()) ||
      (student.enrollment_number?.toLowerCase() || '').includes(studentSearch.toLowerCase())
    );
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSelectStudent = (student: any) => {
    handleInputChange('studentId', student.id);
    handleInputChange('studentName', student.name || '');  // Changed from student.nome
    handleInputChange('studentCode', student.numero_matricula || `MAT${student.id}`);
    handleInputChange('usuario', '');  // Reset credenciais
    handleInputChange('senha', '');    // Reset credenciais
    setStudentSearch('');
  };

  const handleSelectCourse = (course: any) => {
    handleInputChange('courseId', course.codigo);
    handleInputChange('courseName', course.nome);
    handleInputChange('monthlyFee', course.mensalidade || 2500);
    handleInputChange('enrollmentFee', course.taxa_matricula || 5000);
    handleInputChange('classId', undefined); // Reset turma ao trocar curso
    handleInputChange('className', '');
  };

  const handleSelectClass = (classItem: any) => {
    handleInputChange('classId', classItem.id);
    handleInputChange('className', classItem.nome);
  };

  // Validação
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.studentId || formData.studentId === 0) {
      errors.studentId = 'Selecione um estudante';
    }
    if (!formData.courseId) {
      errors.courseId = 'Selecione um curso';
    }
    if (!formData.usuario?.trim()) {
      errors.usuario = 'Usuário é obrigatório';
    }
    if (!formData.senha?.trim()) {
      errors.senha = 'Senha é obrigatória';
    }
    if (!formData.period) {
      errors.period = 'Período é obrigatório';
    }
    if (!formData.enrollmentDate) {
      errors.enrollmentDate = 'Data de matrícula é obrigatória';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Salvar
  const handleSave = () => {
    if (validateForm()) {
      // ✅ MAPEAR campos do frontend (português) para backend (inglês)
      const mappedData = {
        student_id: formData.studentId,
        course_id: formData.courseId,
        class_id: formData.classId || null,
        enrollment_number: formData.studentCode, // ✅ studentCode → enrollment_number
        period: formData.period,
        enrollment_date: formData.enrollmentDate,
        status: formData.status,
        payment_status: formData.paymentStatus,
        enrollment_fee: formData.enrollmentFee,
        monthly_fee: formData.monthlyFee,
        username: formData.usuario, // ✅ usuario → username
        password: formData.senha,   // ✅ senha → password
        observations: formData.observations
      };
      
      console.log('💾 Dados mapeados para API (inglês):', mappedData);
      onSave(mappedData);
      toast.success(isEditing ? 'Matrícula atualizada!' : 'Matrícula realizada com sucesso!');
      onClose();
    } else {
      console.error('❌ Validação falhou:', formErrors);
      toast.error('Preencha todos os campos obrigatórios');
      setActiveTab('student');
    }
  };

  const validateAndNext = () => {
    // Validações por aba
    if (activeTab === 'student' && (!formData.studentId || formData.studentId === 0)) {
      toast.error("Selecione um estudante primeiro");
      return;
    }
    
    if (activeTab === 'course' && !formData.courseId) {
      toast.error("Selecione um curso primeiro");
      return;
    }
    
    if (activeTab === 'payment') {
      // Validar que valores foram definidos
      if (!formData.enrollmentFee || formData.enrollmentFee <= 0) {
        toast.error("Defina a taxa de matrícula");
        return;
      }
      if (!formData.monthlyFee || formData.monthlyFee <= 0) {
        toast.error("Defina a mensalidade");
        return;
      }
    }

    const tabs: ('student' | 'course' | 'payment' | 'credentials')[] = [
      'student', 
      'course', 
      'payment', 
      'credentials'
    ];
    
    const nextIndex = tabs.indexOf(activeTab) + 1;
    if (nextIndex < tabs.length) setActiveTab(tabs[nextIndex]);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN',
      minimumFractionDigits: 0
    }).format(value);
  };

  const selectedCourse = courses.find(c => c.codigo === formData.courseId);
  const selectedStudent = students.find(s => s.id === formData.studentId);

  // Gerar código do estudante
  const generateStudentCode = async (courseCode: string, courseName: string) => {
    try {
      // 1. Pegar iniciais do curso
      const courseInitials = courseName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 4); // Máximo 4 letras
    
      // 2. Buscar próximo número sequencial
      const { next_number } = await registrationService.getCountByCourse(courseCode);
    
      // 3. Formatar número com zeros à esquerda (4 dígitos)
      const sequentialNumber = next_number.toString().padStart(4, '0');
    
      // 4. Ano atual
      const currentYear = new Date().getFullYear();
    
      // 5. Gerar código final: INFG.0001.2026
      const studentCode = `${courseInitials}.${sequentialNumber}.${currentYear}`;
    
      return studentCode;
    
    } catch (error) {
      console.error('Erro ao gerar código do estudante:', error);
      // Fallback: gerar código simples
      const year = new Date().getFullYear();
      const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
      return `EST.${random}.${year}`;
    }
  };

  // Gerar credenciais e código ao selecionar estudante e curso
  useEffect(() => {
    const generateData = async () => {
      // ✅ Só gerar se tiver estudante E curso selecionados
      if (formData.studentId && formData.studentName && formData.courseId && formData.courseName) {
        
        // 🔢 GERAR CÓDIGO DO ESTUDANTE
        const studentCode = await generateStudentCode(formData.courseId, formData.courseName);
        
        // 🔐 GERAR CREDENCIAIS
        const generateUsername = (name: string) => {
          const names = name.toLowerCase().trim().split(' ');
          const firstName = names[0];
          const lastName = names[names.length - 1];
          return `${firstName}.${lastName}`.replace(/[^a-z.]/g, '');
        };

        const generatePassword = () => {
          return Math.random().toString(36).slice(-8) + Math.random().toString(10).slice(-2);
        };

        // ✅ Atualizar formData com código e credenciais
        setFormData(prev => ({
          ...prev,
          studentCode: studentCode,
          usuario: generateUsername(formData.studentName),
          senha: generatePassword()
        }));
        
        console.log('✅ Código gerado:', studentCode);
      }
    };
    
    generateData();
  }, [formData.studentId, formData.studentName, formData.courseId, formData.courseName]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[650px]">

          {/* SIDEBAR DE NAVEGAÇÃO */}
          <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FileText className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">Matrícula</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">
                  {isEditing ? 'Editar Matrícula' : 'Nova Matrícula'}
                </span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {[
                { id: 'student', label: 'Estudante', icon: User, desc: 'Selecionar Aluno' },
                { id: 'course', label: 'Curso e Turma', icon: BookOpen, desc: 'Escolher Curso' },
                { id: 'payment', label: 'Pagamento', icon: DollarSign, desc: 'Valores e Status' },
                { id: 'credentials', label: 'Dados de Acesso', icon: Shield, desc: 'Credenciais do Sistema' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left group",
                    activeTab === tab.id
                      ? "bg-white/10 text-white ring-1 ring-[#F5821F]/30 shadow-xl"
                      : "text-blue-200/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg transition-colors",
                    activeTab === tab.id ? "bg-[#F5821F] text-white" : "bg-[#003A6B] text-blue-300 group-hover:bg-[#003A6B]/80"
                  )}>
                    <tab.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">{tab.label}</p>
                    <p className="text-[11px] opacity-60">{tab.desc}</p>
                  </div>
                </button>
              ))}
            </nav>

            <div className="mt-auto p-4 bg-[#F5821F]/10 border border-[#F5821F]/20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-[#F5821F]">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold uppercase">Importante</span>
              </div>
              <p className="text-[11px] text-blue-100 leading-relaxed">
                O estudante deve estar previamente cadastrado no sistema.
              </p>
            </div>
          </div>

          {/* ÁREA DE CONTEÚDO */}
          <div className="flex-1 flex flex-col">
            <header className="px-10 py-8 border-b border-slate-100">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                {isEditing ? 'Editar Matrícula' : 'Nova Matrícula'}
              </DialogTitle>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <span>Gestão de Matrículas</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#F5821F] font-medium">{activeTab.toUpperCase()}</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">

              {/* ABA: ESTUDANTE */}
              {activeTab === 'student' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">


                 {/* Estudante Selecionado */}
{formData.studentId && formData.studentId > 0 && selectedStudent ? (
  <div className="relative">
    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-2xl p-6 shadow-lg">
      {/* Badge de Confirmação */}
      <div className="absolute -top-3 left-6 bg-green-500 text-white px-4 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
        <CheckCircle2 className="h-3 w-3" />
        ESTUDANTE SELECIONADO
      </div>
      
      <div className="flex items-center gap-5 mt-2">
        {/* Avatar Grande */}
        <div className="relative flex-shrink-0">
          <div className="h-20 w-20 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-2xl flex items-center justify-center shadow-xl">
            <span className="text-white font-bold text-3xl">
              {selectedStudent.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-green-500 border-4 border-white rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-3 w-3 text-white" />
          </div>
        </div>

        {/* Informações */}
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-[#004B87] mb-1 truncate">
            {selectedStudent.name}
          </h3>
          <p className="text-sm text-slate-600 truncate mb-2">
            📧 {selectedStudent.email}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-white px-3 py-1 rounded-lg text-[#004B87] font-semibold border border-slate-200">
              {formData.studentCode}
            </span>
            {selectedStudent.phone && (
              <span className="text-xs text-slate-500">
                📱 {selectedStudent.phone}
              </span>
            )}
          </div>
        </div>

        {/* Botão Trocar */}
        <button
          onClick={() => {
            handleInputChange('studentId', 0);
            handleInputChange('studentName', '');
            handleInputChange('studentCode', '');
          }}
          className="flex-shrink-0 px-4 py-2 bg-white border-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 rounded-xl text-xs font-semibold transition-all"
        >
          Trocar
        </button>
      </div>
    </div>
  </div>
) : (
  <>
    {/* Busca de Estudante */}
    <section>
      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
        Buscar Estudante <span className="text-red-500">*</span>
      </Label>

      <div className="relative mb-4">
        <Search className="absolute left-4 top-3 h-5 w-5 text-slate-400" />
        <Input
          placeholder="Digite o nome, email ou código do estudante..."
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          className="pl-12 h-12 border-2 border-slate-200 rounded-xl focus:border-[#F5821F]"
        />
      </div>

      {formErrors.studentId && (
        <p className="text-xs text-red-600 flex items-center gap-1 mb-3">
          <AlertCircle className="h-3 w-3" />
          {formErrors.studentId}
        </p>
      )}

     {/* Lista de Estudantes */}
{isLoadingStudents ? (
  <div className="text-center py-8">
    <div className="animate-spin h-8 w-8 border-4 border-[#F5821F] border-t-transparent rounded-full mx-auto mb-3"></div>
    <p className="text-slate-500">Carregando estudantes...</p>
  </div>
) : filteredStudents.length > 0 ? (
  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
    {filteredStudents.slice(0, 10).map((student) => (
      <button
        key={student.id}
        onClick={() => handleSelectStudent(student)}
        className="w-full group"
      >
        <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-slate-100 bg-white hover:border-[#F5821F] hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 transition-all duration-200 shadow-sm hover:shadow-md">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="h-14 w-14 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-xl">
                {student.name.charAt(0).toUpperCase()}
{student.name}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-bold text-base text-slate-800 truncate group-hover:text-[#004B87] transition-colors">
              {student.name}
            </h3>
            <p className="text-sm text-slate-500 truncate mt-0.5">
              {student.email}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                {student.enrollment_number || `MAT${student.id}`}
              </span>
              {student.curso && (
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">
                  {student.curso}
                </span>
              )}
            </div>
          </div>

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-[#F5821F] transition-colors">
              <GraduationCap className="h-5 w-5 text-[#F5821F] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </button>
    ))}
    
    {filteredStudents.length > 10 && (
      <p className="text-xs text-center text-slate-400 py-2">
        Mostrando 10 de {filteredStudents.length} estudantes. Refine sua busca.
      </p>
    )}
  </div>
) : (
  <div className="text-center py-16">
    <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <User className="h-10 w-10 text-slate-300" />
    </div>
    <p className="text-sm text-slate-500 font-medium mb-1">
      {studentSearch 
        ? 'Nenhum estudante encontrado' 
        : 'Digite para buscar estudantes'
      }
    </p>
    <p className="text-xs text-slate-400">
      {studentSearch 
        ? 'Tente buscar por nome, email ou código' 
        : 'Comece digitando o nome ou email do estudante'
      }
    </p>
  </div>
)}
                      </section>
                    </>
                  )}
                </div>
              )}
              {activeTab === 'course' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">

                  {/* Seleção de Curso */}
                  <section>
                    <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
                      Selecionar Curso <span className="text-red-500">*</span>
                    </Label>

                    {formErrors.courseId && (
                      <p className="text-xs text-red-600 flex items-center gap-1 mb-3">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.courseId}
                      </p>
                    )}

                    {isLoadingCourses ? (
                      <div className="text-center py-8">
                        <p className="text-slate-500">Carregando cursos...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto">
                        {(() => {
                          // ✅ FILTRAR CURSOS - Remover cursos onde estudante já está matriculado
                          const availableCourses = courses.filter(course => {
                            // Se não selecionou estudante ou período, mostrar todos
                            if (!formData.studentId || !formData.period) {
                              return true;
                            }
                            
                            // Verificar se estudante JÁ está matriculado neste curso neste período
                            const alreadyEnrolled = existingRegistrations.some(reg => 
                              reg.studentId === formData.studentId && 
                              reg.courseId === course.codigo &&
                              reg.period === formData.period &&
                              (reg.status === 'active' || reg.status === 'suspended')
                            );
                            
                            // ❌ NÃO mostrar se já matriculado
                            return !alreadyEnrolled;
                          });

                          // Se não há cursos disponíveis
                          if (availableCourses.length === 0) {
                            return (
                              <div className="text-center py-16">
                                <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                  <BookOpen className="h-10 w-10 text-slate-300" />
                                </div>
                                <p className="text-sm text-slate-500 font-medium mb-1">
                                  Nenhum curso disponível
                                </p>
                                <p className="text-xs text-slate-400">
                                  {formData.studentName} já está matriculado em todos os cursos para o período {formData.period}
                                </p>
                              </div>
                            );
                          }

                          // Mostrar cursos disponíveis
                          return availableCourses.map((course) => (
                            <button
                              key={course.codigo}
                              onClick={() => handleSelectCourse(course)}
                              className={cn(
                                "flex items-center p-4 rounded-2xl border-2 transition-all text-left",
                                formData.courseId === course.codigo
                                  ? "border-[#F5821F] bg-orange-50 shadow-md ring-4 ring-[#F5821F]/10"
                                  : "border-white bg-white hover:border-[#F5821F]/50 shadow-sm"
                              )}
                            >
                              <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center mr-4",
                                formData.courseId === course.codigo
                                  ? "bg-[#F5821F] text-white"
                                  : "bg-slate-100 text-slate-400"
                              )}>
                                <BookOpen className="h-6 w-6" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-slate-700 leading-tight">
                                  {course.nome}
                                </p>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                  {course.codigo} • {formatCurrency(course.mensalidade || 0)}/mês
                                </p>
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    )}
                  </section>

                  {/* Turma (Opcional) */}
                  {formData.courseId && (
                    <section>
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
                        Turma <span className="text-slate-400">(Opcional)</span>
                      </Label>

                      {filteredClasses.length > 0 ? (
                        <div className="grid grid-cols-1 gap-2">
                          {filteredClasses.map((classItem) => (
                            <button
                              key={classItem.id}
                              onClick={() => handleSelectClass(classItem)}
                              className={cn(
                                "flex items-center p-3 rounded-xl border-2 transition-all text-left",
                                formData.classId === classItem.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-slate-200 bg-white hover:border-blue-300"
                              )}
                            >
                              <GraduationCap className={cn(
                                "h-5 w-5 mr-3",
                                formData.classId === classItem.id ? "text-blue-600" : "text-slate-400"
                              )} />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-700">
                                  {classItem.nome}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {classItem.codigo} • {classItem.dias_semana}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 text-center py-6 bg-slate-50 rounded-xl">
                          Nenhuma turma disponível para este curso
                        </p>
                      )}
                    </section>
                  )}

                  {/* Período e Data */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">
                          Período Letivo <span className="text-red-500">*</span>
                        </Label>
                      </div>
                      <Input
                        placeholder="Ex: 2025/1"
                        value={formData.period || ''}
                        onChange={(e) => handleInputChange('period', e.target.value)}
                        className={cn(
                          "h-12 rounded-xl text-center font-bold text-lg",
                          formErrors.period && "border-red-500"
                        )}
                      />
                      {formErrors.period && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.period}
                        </p>
                      )}
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                          <Clock className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">
                          Data de Matrícula <span className="text-red-500">*</span>
                        </Label>
                      </div>
                      <Input
                        type="date"
                        value={formData.enrollmentDate || ''}
                        onChange={(e) => handleInputChange('enrollmentDate', e.target.value)}
                        className={cn(
                          "h-12 rounded-xl",
                          formErrors.enrollmentDate && "border-red-500"
                        )}
                      />
                      {formErrors.enrollmentDate && (
                        <p className="text-xs text-red-600 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.enrollmentDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ABA: PAGAMENTO */}
              {activeTab === 'payment' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">

                  {/* Valores */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 text-[#F5821F] rounded-lg">
                          <CreditCard className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">
                          Taxa de Matrícula (MZN)
                        </Label>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.enrollmentFee || ''}
                        onChange={(e) => handleInputChange('enrollmentFee', parseFloat(e.target.value) || 0)}
                        className="h-12 rounded-xl text-lg font-bold"
                      />
                      {formData.enrollmentFee && formData.enrollmentFee > 0 && (
                        <p className="text-sm text-[#F5821F] font-semibold">
                          {formatCurrency(formData.enrollmentFee)}
                        </p>
                      )}
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <Label className="font-bold text-slate-700 leading-none">
                          Mensalidade (MZN)
                        </Label>
                      </div>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.monthlyFee || ''}
                        onChange={(e) => handleInputChange('monthlyFee', parseFloat(e.target.value) || 0)}
                        className="h-12 rounded-xl text-lg font-bold"
                      />
                      {formData.monthlyFee && formData.monthlyFee > 0 && (
                        <p className="text-sm text-green-600 font-semibold">
                          {formatCurrency(formData.monthlyFee)}/mês
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <Label className="font-bold text-slate-700">Status da Matrícula</Label>
                      <select
                        value={formData.status || 'active'}
                        onChange={(e) => handleInputChange('status', e.target.value as any)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
                      >
                        <option value="active">✅ Matriculado (Ativo)</option>
                        <option value="suspended">⏸ Trancado</option>
                        <option value="cancelled">❌ Cancelado</option>
                        <option value="completed">🏆 Concluído</option>
                      </select>
                    </div>

                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                      <Label className="font-bold text-slate-700">Status do Pagamento</Label>
                      <select
                        value={formData.paymentStatus || 'pending'}
                        onChange={(e) => handleInputChange('paymentStatus', e.target.value as any)}
                        className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
                      >
                        <option value="paid">💰 Pago</option>
                        <option value="pending">⏳ Pendente</option>
                        <option value="overdue">⚠️ Atrasado</option>
                      </select>
                    </div>
                  </div>

                  {/* Observações */}
                  <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <Label className="font-bold text-slate-700">Observações</Label>
                    <Textarea
                      placeholder="Informações adicionais sobre a matrícula..."
                      value={formData.observations || ''}
                      onChange={(e) => handleInputChange('observations', e.target.value)}
                      rows={4}
                      className="rounded-2xl resize-none"
                    />
                  </div>

                  {/* Resumo */}
                  <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-[#004B87] mb-4 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#F5821F]" />
                      Resumo da Matrícula
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Estudante:</span>
                        <span className="text-sm font-semibold text-[#004B87]">
                          {formData.studentName || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Curso:</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {formData.courseName || '-'}
                        </span>
                      </div>
                      {formData.className && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Turma:</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {formData.className}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Período:</span>
                        <span className="text-sm font-semibold text-[#F5821F]">
                          {formData.period || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Taxa de Matrícula:</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {formatCurrency(formData.enrollmentFee || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Mensalidade:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(formData.monthlyFee || 0)}/mês
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ABA: CREDENCIAIS - AGORA É A ÚLTIMA */}
              {activeTab === 'credentials' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                
                  {/* Banner de Sucesso */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-400 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-green-800">
                          Matrícula Pronta para Finalizar!
                        </h3>
                        <p className="text-sm text-green-600">
                          Revise as credenciais geradas antes de confirmar
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card de Credenciais */}
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-[#F5821F]/30 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#F5821F] text-white rounded-lg">
                        <Shield className="h-5 w-5" />
                      </div>
                      <Label className="font-bold text-[#004B87] leading-none">
                        Credenciais de Acesso ao Sistema
                      </Label>
                    </div>

                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-blue-800">
                          As credenciais foram geradas automaticamente. Você pode editá-las se necessário antes de finalizar.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Código do Estudante - READ ONLY com destaque */}
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Código do Estudante <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Hash className="absolute left-4 top-3 h-4 w-4 text-green-600" />
                          <Input
                            value={formData.studentCode || ''}
                            readOnly
                            className="h-12 pl-11 rounded-xl font-mono font-bold text-base bg-green-50 border-2 border-green-300 text-green-700"
                          />
                        </div>
                        {formData.studentCode && (
                          <p className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Código gerado automaticamente
                          </p>
                        )}
                      </div>

                      {/* Usuário - EDITÁVEL */}
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Usuário <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <User className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="usuario.estudante"
                            value={formData.usuario || ''}
                            onChange={(e) => handleInputChange('usuario', e.target.value)}
                            className={cn(
                              "h-12 pl-11 rounded-xl",
                              formErrors.usuario && "border-red-500"
                            )}
                          />
                        </div>
                        {formErrors.usuario && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.usuario}
                          </p>
                        )}
                      </div>

                      {/* Senha - EDITÁVEL */}
                      <div className="space-y-2">
                        <Label className="text-slate-600 font-semibold ml-1">
                          Senha <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Key className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.senha || ''}
                            onChange={(e) => handleInputChange('senha', e.target.value)}
                            className={cn(
                              "h-12 pl-11 pr-10 rounded-xl",
                              formErrors.senha && "border-red-500"
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <X className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          </button>
                        </div>
                        {formErrors.senha && (
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {formErrors.senha}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Preview Visual das Credenciais */}
                    {formData.usuario && formData.senha && formData.studentCode && (
                      <div className="mt-6 p-5 bg-white border-2 border-[#F5821F]/30 rounded-xl shadow-md">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="h-4 w-4 text-[#F5821F]" />
                          <p className="text-sm font-bold text-slate-700">
                            Resumo das Credenciais
                          </p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                            <span className="text-xs text-slate-600 font-medium">Código:</span>
                            <span className="text-sm font-mono font-bold text-purple-700">
                              {formData.studentCode}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                            <span className="text-xs text-slate-600 font-medium">Usuário:</span>
                            <span className="text-sm font-mono font-bold text-[#004B87]">
                              {formData.usuario}
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                            <span className="text-xs text-slate-600 font-medium">Senha:</span>
                            <span className="text-sm font-mono font-bold text-[#F5821F]">
                              {showPassword ? formData.senha : '••••••••'}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Resumo COMPLETO da Matrícula */}
                  <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/30 rounded-2xl p-6">
                    <h3 className="text-base font-bold text-[#004B87] mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#F5821F]" />
                      Resumo Completo da Matrícula
                    </h3>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Estudante:</span>
                        <span className="text-sm font-semibold text-[#004B87]">
                          {formData.studentName || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Código:</span>
                        <span className="text-sm font-semibold font-mono text-purple-600">
                          {formData.studentCode || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Curso:</span>
                        <span className="text-sm font-semibold font-mono text-purple-600">
                          {formData.courseName || '-'}
                        </span>
                      </div>
                      {formData.className && (
                        <div className="flex justify-between">
                          <span className="text-sm text-slate-600">Turma:</span>
                          <span className="text-sm font-semibold text-blue-600">
                            {formData.className}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Período:</span>
                        <span className="text-sm font-semibold text-[#F5821F]">
                          {formData.period || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Data:</span>
                        <span className="text-sm font-semibold text-slate-700">
                          {formData.enrollmentDate ? new Date(formData.enrollmentDate).toLocaleDateString('pt-BR') : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Taxa Matrícula:</span>
                        <span className="text-sm font-semibold text-orange-600">
                          {formatCurrency(formData.enrollmentFee || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600">Mensalidade:</span>
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(formData.monthlyFee || 0)}/mês
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FOOTER COM BOTÕES */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest"
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                {activeTab !== 'credentials' ? (
                  <Button
                    onClick={validateAndNext}
                    className="bg-[#004B87] text-white hover:bg-[#003A6B] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-200"
                  >
                    Próximo Passo <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl shadow-orange-500/30"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isEditing ? 'Atualizar Matrícula' : 'Matricular Estudante'}
                  </Button>
                )}
              </div>
            </footer>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}