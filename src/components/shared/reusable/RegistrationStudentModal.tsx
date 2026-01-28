// src/components/shared/RegistrationStudentModal.tsx

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  BookOpen,
  ChevronRight,
  DollarSign,
  FileText,
  Shield,
  Sparkles,
  User,
  Printer,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { Registration } from "./RegistrationList";

import courseService from "@/services/courseService";
import studentService from "@/services/studentService";
import classService from "@/services/classService";

import { StudentTab } from "../registration-student-modal/tabs/StudentTab";
import { CourseTab } from "../registration-student-modal/tabs/CourseTab";
import { PaymentTab } from "../registration-student-modal/tabs/PaymentTab";
import { CredentialsTab } from "../registration-student-modal/tabs/CredentialsTab";

import { generateCurrentPeriod } from "../registration-student-modal/utils/generateCurrentPeriod";
import { formatCurrency } from "../registration-student-modal/utils/formatCurrency";
import { generateStudentCode } from "../registration-student-modal/utils/generateStudentCode";
import { generateUsername } from "../registration-student-modal/utils/generateUsername";
import { generatePassword } from "../registration-student-modal/utils/generatePassword";

import type {
  RegistrationModalTab,
  RegistrationFormData,
  RegistrationFormErrors,
  Student,
  Course,
  ClassItem,
} from "../registration-student-modal/types/registrationModal.types";

interface RegistrationStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationData?: Registration | null;
  isEditing?: boolean;
  onSave: (registrationData: Partial<Registration>) => void;
  existingRegistrations?: Registration[];
}

const TABS: Array<{
  id: RegistrationModalTab;
  label: string;
  desc: string;
  icon: any;
}> = [
  { id: "student", label: "Estudante", desc: "Selecionar Aluno", icon: User },
  { id: "course", label: "Curso e Turma", desc: "Escolher Curso", icon: BookOpen },
  { id: "payment", label: "Pagamento", desc: "Valores e Status", icon: DollarSign },
  { id: "credentials", label: "Dados de Acesso", desc: "Credenciais do Sistema", icon: Shield },
];

const buildInitialFormData = (): RegistrationFormData => ({
  studentId: 0,
  studentName: "",
  studentCode: "",
  courseId: "",
  courseName: "",
  classId: undefined,
  className: "",
  period: generateCurrentPeriod(),
  enrollmentDate: new Date().toISOString().split("T")[0],
  status: "active",
  paymentStatus: "pending",
  enrollmentFee: 5000,
  monthlyFee: 2500,
  observations: "",
  username: "",
  password: "",
  registrationType: "new",
});

export function RegistrationStudentModal({
  isOpen,
  onClose,
  registrationData,
  isEditing = false,
  onSave,
  existingRegistrations = [],
}: RegistrationStudentModalProps) {
  const [activeTab, setActiveTab] = useState<RegistrationModalTab>("student");

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [showReceiptPrompt, setShowReceiptPrompt] = useState(false);

  const [formData, setFormData] = useState<RegistrationFormData>(buildInitialFormData);
  const [formErrors, setFormErrors] = useState<RegistrationFormErrors>({});

  // -----------------------------
  // Helpers
  // -----------------------------
  const onChangeField = <K extends keyof RegistrationFormData>(field: K, value: RegistrationFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const selectedStudent = useMemo(
    () => students.find((s) => s.id === formData.studentId),
    [students, formData.studentId]
  );

  const selectedCourse = useMemo(
    () => courses.find((c) => c.codigo === formData.courseId),
    [courses, formData.courseId]
  );

  const filteredClasses = useMemo(() => {
    if (!formData.courseId) return [];
    return classes.filter((c) => c.curso === formData.courseId);
  }, [classes, formData.courseId]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase().trim();
    return students.filter((s) => {
      // não listar o já selecionado
      if (formData.studentId && s.id === formData.studentId) return false;

      if (!query) return true;

      return (
        (s.name?.toLowerCase() || "").includes(query) ||
        (s.email?.toLowerCase() || "").includes(query) ||
        (s.enrollment_number?.toLowerCase() || "").includes(query)
      );
    });
  }, [students, studentSearch, formData.studentId]);

  // -----------------------------
  // Load base data (students/courses/classes)
  // -----------------------------
  useEffect(() => {
    const loadData = async () => {
      if (!isOpen) return;

      try {
        setIsLoadingStudents(true);
        setIsLoadingCourses(true);
        setIsLoadingClasses(true);

        const [studentsData, coursesData, classesData] = await Promise.all([
          studentService.getAll(),
          courseService.getAll(),
          classService.getAll(),
        ]);

        setStudents(studentsData);
        setCourses(coursesData);
        setClasses(classesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingCourses(false);
        setIsLoadingClasses(false);
      }
    };

    loadData();
  }, [isOpen]);

  // -----------------------------
  // Reset/open behavior
  // -----------------------------
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab("student");
    setStudentSearch("");
    setShowPassword(false);
    setFormErrors({});

    if (registrationData && isEditing) {
      // se vier do backend com campos em snake_case, ideal: mapear antes.
      // aqui estamos assumindo que registrationData já vem no formato esperado do formulário.
      setFormData(registrationData as any);
    } else {
      setFormData(buildInitialFormData());
    }
  }, [isOpen, registrationData, isEditing]);

  // -----------------------------
  // Select handlers
  // -----------------------------
  const handleSelectStudent = (student: Student) => {
    onChangeField("studentId", student.id);
    onChangeField("studentName", student.name || "");
    onChangeField("studentCode", student.enrollment_number || `MAT${student.id}`);

    // reset creds para regenerar
    onChangeField("username", "");
    onChangeField("password", "");
    setStudentSearch("");
  };

  const handleClearStudent = () => {
    onChangeField("studentId", 0);
    onChangeField("studentName", "");
    onChangeField("studentCode", "");
    onChangeField("username", "");
    onChangeField("password", "");
  };

  const handleSelectCourse = (course: Course) => {
    onChangeField("courseId", course.codigo);
    onChangeField("courseName", course.nome);

    onChangeField("monthlyFee", (course.mensalidade as any) || 2500);
    onChangeField("enrollmentFee", (course.taxa_matricula as any) || 5000);

    // reset turma ao trocar curso
    onChangeField("classId", undefined);
    onChangeField("className", "");
  };

  const handleSelectClass = (classItem: ClassItem) => {
    onChangeField("classId", classItem.id);
    onChangeField("className", classItem.nome);
  };

  // -----------------------------
  // Auto generate code + credentials when student+course are set
  // -----------------------------
  useEffect(() => {
    const run = async () => {
      const hasStudent = !!formData.studentId && !!formData.studentName;
      const hasCourse = !!formData.courseId && !!formData.courseName;
      if (!hasStudent || !hasCourse) return;

      try {
        const code = await generateStudentCode(formData.courseId, formData.courseName);
        setFormData((prev) => ({
          ...prev,
          studentCode: code,
          username: generateUsername(prev.studentName),
          password: generatePassword(),
        }));
      } catch (e) {
        console.error("Falha ao gerar credenciais:", e);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.studentId, formData.studentName, formData.courseId, formData.courseName]);

  // -----------------------------
  // Validation
  // -----------------------------
  const validateForm = (): boolean => {
    const errors: RegistrationFormErrors = {};

    if (!formData.registrationType) errors.registrationType = "Selecione o tipo de inscrição";
    if (!formData.studentId || formData.studentId === 0) errors.studentId = "Selecione um estudante";
    if (!formData.courseId) errors.courseId = "Selecione um curso";
    if (!formData.username?.trim()) errors.username = "Usuário é obrigatório";
    if (!formData.password?.trim()) errors.password = "Senha é obrigatória";
    if (!formData.period) errors.period = "Período é obrigatório";
    if (!formData.enrollmentDate) errors.enrollmentDate = "Data de matrícula é obrigatória";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAndNext = () => {
    if (activeTab === "student") {
      if (!formData.registrationType) {
        toast.error("Selecione o tipo de inscrição primeiro");
        return;
      }
      if (!formData.studentId || formData.studentId === 0) {
        toast.error("Selecione um estudante primeiro");
        return;
      }
    }

    if (activeTab === "course" && !formData.courseId) {
      toast.error("Selecione um curso primeiro");
      return;
    }

    if (activeTab === "payment") {
      if (!formData.enrollmentFee || Number(formData.enrollmentFee) <= 0) {
        toast.error("Defina a taxa de matrícula");
        return;
      }
      if (!formData.monthlyFee || Number(formData.monthlyFee) <= 0) {
        toast.error("Defina a mensalidade");
        return;
      }
    }

    const order: RegistrationModalTab[] = ["student", "course", "payment", "credentials"];
    const nextIndex = order.indexOf(activeTab) + 1;
    if (nextIndex < order.length) setActiveTab(order[nextIndex]);
  };

  // -----------------------------
  // Save
  // -----------------------------
  const handleSave = () => {
    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      setActiveTab("student");
      return;
    }

    // ✅ MANTER ESTE MAPEAMENTO (não remover!)
    const mappedData = {
      student_id: formData.studentId,
      course_id: formData.courseId,
      class_id: formData.classId || null,
      enrollment_number: formData.studentCode,
      period: formData.period,
      enrollment_date: formData.enrollmentDate,
      status: formData.status,
      payment_status: formData.paymentStatus,
      enrollment_fee: formData.enrollmentFee,
      monthly_fee: formData.monthlyFee,
      username: formData.username,
      password: formData.password,
      observations: formData.observations,
      registration_type: formData.registrationType,
    };

    console.log("📋 FormData ANTES do mapeamento:", formData);
    console.log("📤 Dados DEPOIS do mapeamento:", mappedData);

    onSave(mappedData as any);
    toast.success(isEditing ? "Matrícula atualizada!" : "Matrícula realizada com sucesso!");

    // Mostrar prompt de recibo após salvar
    setShowReceiptPrompt(true);
  };

  const handlePrintReceipt = () => {
    const receiptContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo de Matrícula - ${formData.studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #004B87; padding-bottom: 20px; }
          .header h1 { color: #004B87; margin: 0; font-size: 28px; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #004B87; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #F5821F; padding-bottom: 5px; }
          .info-row { display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee; }
          .info-row strong { color: #333; }
          .total { background: #f8f9fa; padding: 15px; margin-top: 20px; border-left: 4px solid #F5821F; }
          .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ISAC - Instituto Superior de Artes e Cultura</h1>
          <p>Recibo de Matrícula</p>
          <p>Data: ${new Date().toLocaleDateString('pt-PT')}</p>
        </div>

        <div class="section">
          <h2>Dados do Estudante</h2>
          <div class="info-row"><span><strong>Nome:</strong></span><span>${formData.studentName}</span></div>
          <div class="info-row"><span><strong>Código:</strong></span><span>${formData.studentCode}</span></div>
          <div class="info-row"><span><strong>Email:</strong></span><span>${formData.username}</span></div>
        </div>

        <div class="section">
          <h2>Dados do Curso</h2>
          <div class="info-row"><span><strong>Curso:</strong></span><span>${formData.courseName}</span></div>
          <div class="info-row"><span><strong>Turma:</strong></span><span>${formData.className || 'Não atribuída'}</span></div>
          <div class="info-row"><span><strong>Período:</strong></span><span>${formData.period}</span></div>
          <div class="info-row"><span><strong>Data de Matrícula:</strong></span><span>${new Date(formData.enrollmentDate).toLocaleDateString('pt-PT')}</span></div>
        </div>

        <div class="section">
          <h2>Dados Financeiros</h2>
          <div class="info-row"><span><strong>Taxa de Matrícula:</strong></span><span>${formatCurrency(formData.enrollmentFee)}</span></div>
          <div class="info-row"><span><strong>Mensalidade:</strong></span><span>${formatCurrency(formData.monthlyFee)}</span></div>
          <div class="total">
            <strong>Total a Pagar:</strong> ${formatCurrency(formData.enrollmentFee + formData.monthlyFee)}
          </div>
        </div>

        <div class="footer">
          <p>Este documento comprova a matrícula do estudante no curso indicado.</p>
          <p>Gerado em ${new Date().toLocaleString('pt-PT')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.print();
      toast.success("Recibo de matrícula gerado!");
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-white">
        <div className="flex h-[650px]">
          {/* SIDEBAR (por enquanto no pai) */}
          <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
            <div className="flex items-center gap-3 mb-12">
              <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                <FileText className="text-white h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none">Matrícula</h2>
                <span className="text-[10px] text-blue-200 uppercase tracking-widest">
                  {isEditing ? "Editar Matrícula" : "Nova Matrícula"}
                </span>
              </div>
            </div>

            <nav className="space-y-4 flex-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left group",
                    activeTab === tab.id
                      ? "bg-white/10 text-white ring-1 ring-[#F5821F]/30 shadow-xl"
                      : "text-blue-200/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      activeTab === tab.id
                        ? "bg-[#F5821F] text-white"
                        : "bg-[#003A6B] text-blue-300 group-hover:bg-[#003A6B]/80"
                    )}
                  >
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

          {/* CONTENT */}
          <div className="flex-1 flex flex-col">
            <header className="px-10 py-8 border-b border-slate-100">
              <DialogTitle className="text-2xl font-black text-slate-800 tracking-tight">
                {isEditing ? "Editar Matrícula" : "Nova Matrícula"}
              </DialogTitle>
              <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                <span>Gestão de Matrículas</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-[#F5821F] font-medium">{activeTab.toUpperCase()}</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar bg-slate-50/30">
              {activeTab === "student" && (
                <StudentTab
                  formData={formData}
                  formErrors={formErrors}
                  studentSearch={studentSearch}
                  onStudentSearchChange={setStudentSearch}
                  students={students}
                  filteredStudents={filteredStudents}
                  selectedStudent={selectedStudent}
                  isLoadingStudents={isLoadingStudents}
                  onSelectStudent={handleSelectStudent}
                  onClearStudent={handleClearStudent}
                  onChangeField={onChangeField}
                />
              )}

              {activeTab === "course" && (
                <CourseTab
                  formData={formData}
                  formErrors={formErrors}
                  courses={courses}
                  classes={classes}
                  filteredClasses={filteredClasses}
                  selectedCourse={selectedCourse}
                  isLoadingCourses={isLoadingCourses}
                  isLoadingClasses={isLoadingClasses}
                  existingRegistrations={existingRegistrations}
                  onSelectCourse={handleSelectCourse}
                  onSelectClass={handleSelectClass}
                  onChangeField={onChangeField}
                  formatCurrency={formatCurrency}
                />
              )}

              {activeTab === "payment" && (
                <PaymentTab
                  formData={formData}
                  onChangeField={onChangeField}
                  formatCurrency={formatCurrency}
                />
              )}

              {activeTab === "credentials" && (
                <CredentialsTab
                  formData={formData}
                  formErrors={formErrors}
                  showPassword={showPassword}
                  onToggleShowPassword={() => setShowPassword((v) => !v)}
                  onChangeField={onChangeField}
                  formatCurrency={formatCurrency}
                />
              )}
            </div>

            {/* FOOTER */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest"
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                {activeTab !== "credentials" ? (
                 <Button
  onClick={validateAndNext}
  className="bg-[#F5821F] text-white hover:bg-[#E07318] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-orange-200"
>
  Próximo Passo <ChevronRight className="h-4 w-4" />
</Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl shadow-orange-500/30"
                  >
                    {isEditing ? "Atualizar Matrícula" : "Matricular Estudante"}
                  </Button>
                )}
              </div>
            </footer>

            {/* FLOATING CHAT BUTTON */}
            <button
              onClick={() => setShowChatPrompt(true)}
              className="fixed bottom-6 right-6 h-14 w-14 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50"
              title="Enviar mensagem"
            >
              <MessageCircle className="h-6 w-6" />
            </button>

            {/* RECEIPT PROMPT MODAL */}
            {showReceiptPrompt && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
                  <div className="text-center mb-6">
                    <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Printer className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#004B87] mb-2">Matrícula Concluída!</h3>
                    <p className="text-slate-600">
                      Deseja imprimir o recibo de matrícula?
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowReceiptPrompt(false);
                        onClose();
                      }}
                      className="flex-1"
                    >
                      Não, Obrigado
                    </Button>
                    <Button
                      onClick={() => {
                        handlePrintReceipt();
                        setShowReceiptPrompt(false);
                        onClose();
                      }}
                      className="flex-1 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Sim, Imprimir
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* CHAT PROMPT MODAL */}
            {showChatPrompt && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold text-[#004B87] mb-4">Enviar Mensagem</h3>
                  <p className="text-slate-600 mb-6">
                    Deseja enviar uma mensagem de boas-vindas ao estudante <strong>{formData.studentName}</strong>?
                  </p>

                  <textarea
                    className="w-full h-32 p-3 border-2 border-slate-200 rounded-xl focus:border-[#F5821F] focus:outline-none resize-none mb-4"
                    placeholder="Digite sua mensagem aqui..."
                    defaultValue={`Olá ${formData.studentName},\n\nSeja bem-vindo(a) ao ISAC!\n\nSua matrícula foi realizada com sucesso no curso ${formData.courseName}.\n\nEstamos muito felizes em tê-lo(a) conosco!`}
                  />

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => setShowChatPrompt(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => {
                        toast.success("Mensagem enviada com sucesso!");
                        setShowChatPrompt(false);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
