// src/components/shared/RegistrationStudentModal.tsx

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  BookOpen,
  ChevronRight,
  DollarSign,
  FileText,
  Sparkles,
  User,
  Printer,
  MessageCircle,
  CheckCircle2,
  ClipboardCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "./ConfirmModal";

import { Registration } from "./RegistrationList";

import apiClient from "@/services/api";
import courseService from "@/services/courseService";
import studentService from "@/services/studentService";
import classService from "@/services/classService";
import { useSettingsData } from "@/hooks/useSettingsData";

import { StudentTab } from "../registration-student-modal/tabs/StudentTab";
import { CourseTab } from "../registration-student-modal/tabs/CourseTab";
import { PaymentTab } from "../registration-student-modal/tabs/PaymentTab";
import { ConfirmationTab } from "../registration-student-modal/tabs/ConfirmationTab";
// Removido: CredentialsTab - credenciais são geradas na INSCRIÇÃO, não na matrícula

import { generateCurrentPeriod } from "../registration-student-modal/utils/generateCurrentPeriod";
import { formatCurrency } from "../registration-student-modal/utils/formatCurrency";
import { generateStudentCode } from "../registration-student-modal/utils/generateStudentCode";
// Removido: generateUsername e generatePassword - credenciais são geradas na INSCRIÇÃO

import type {
  RegistrationModalTab,
  RegistrationFormData,
  RegistrationFormErrors,
  NivelItem,
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
  preSelectedStudentId?: number | null;
}

// Removido: credentials tab - credenciais são geradas na INSCRIÇÃO, não na matrícula
const TABS: Array<{
  id: RegistrationModalTab;
  label: string;
  desc: string;
  icon: any;
}> = [
  { id: "student", label: "Estudante", desc: "Selecionar Aluno", icon: User },
  { id: "course", label: "Curso e Turma", desc: "Escolher Curso", icon: BookOpen },
  { id: "payment", label: "Valores", desc: "Taxas e Mensalidade", icon: DollarSign },
  { id: "confirmation", label: "Confirmação", desc: "Resumo e Pagamento", icon: ClipboardCheck },
];

// Removido: username e password - credenciais são geradas na INSCRIÇÃO, não na matrícula
const buildInitialFormData = (): RegistrationFormData => ({
  studentId: 0,
  studentName: "",
  studentCode: "",
  courseId: "",
  courseName: "",
  classId: undefined,
  className: "",
  turno: undefined, // ✅ Turno obrigatório para avançar
  period: generateCurrentPeriod(),
  enrollmentDate: new Date().toISOString().split("T")[0],
  status: "pending", // ✅ Pendente até pagar taxa obrigatória
  paymentStatus: "pending",
  enrollmentFee: 0,
  enrollmentFeeIsento: false,
  monthlyFee: 0,
  observations: "",
  registrationType: "new",
  // Campos de pagamento (ConfirmationTab)
  paidAmount: 0,
  paymentMethod: "cash",
  paymentReference: "",
  includeFirstMonth: false,
});

export function RegistrationStudentModal({
  isOpen,
  onClose,
  registrationData,
  isEditing = false,
  onSave,
  existingRegistrations = [],
  preSelectedStudentId,
}: RegistrationStudentModalProps) {
  const [activeTab, setActiveTab] = useState<RegistrationModalTab>("student");
  const { settings } = useSettingsData();

  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  const [niveis,          setNiveis]          = useState<NivelItem[]>([]);
  const [selectedNivel,   setSelectedNivel]   = useState<NivelItem | null>(null);
  const [isLoadingNiveis, setIsLoadingNiveis] = useState(false);

  const [studentSearch, setStudentSearch] = useState("");
  const [showChatPrompt, setShowChatPrompt] = useState(false);
  const [showReceiptPrompt, setShowReceiptPrompt] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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
    return classes.filter((c) => {
      if (c.curso !== formData.courseId) return false;
      if (selectedNivel && (c as Record<string, unknown>).nivel_id !== selectedNivel.id) return false;
      return true;
    });
  }, [classes, formData.courseId, selectedNivel]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.toLowerCase().trim();
    return students.filter((s) => {
      // não listar o já selecionado
      if (formData.studentId && s.id === formData.studentId) return false;

      if (!query) return true;

      return (
        (s.name?.toLowerCase() || "").includes(query) ||
        (s.email?.toLowerCase() || "").includes(query) ||
        (s.username?.toLowerCase() || "").includes(query)
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

        // classService returns fields in English (name, schedule, code, schedule_days).
        // CourseTab expects Portuguese field names (nome, turno, codigo, dias_semana).
        // Map here so CourseTab filters work correctly.
        const mappedClasses: ClassItem[] = (classesData as ClassItem[]).map((c) => ({
          id: c.id,
          nome: c.name ?? c.nome ?? '',
          codigo: c.code ?? c.codigo ?? null,
          dias_semana: c.schedule_days ?? c.dias_semana ?? null,
          curso: c.curso ?? null,
          turno: (c.schedule ?? c.turno ?? null) as ClassItem['turno'],
          capacity: c.capacity ?? null,
          students: c.students ?? null,
          nivel_id: (c as Record<string, unknown>).nivel_id ?? null,
        }));
        setClasses(mappedClasses);
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
    setFormErrors({});
    setNiveis([]);
    setSelectedNivel(null);

    if (registrationData && isEditing) {
      // se vier do backend com campos em snake_case, ideal: mapear antes.
      // aqui estamos assumindo que registrationData já vem no formato esperado do formulário.
      setFormData(registrationData as any);
    } else {
      // Se veio da inscrição, pré-selecionar "new" como tipo
      const initialData = buildInitialFormData();
      if (preSelectedStudentId) {
        initialData.registrationType = "new"; // Novo Estudante - Primeira Matrícula
      }
      setFormData(initialData);
    }
  }, [isOpen, registrationData, isEditing, preSelectedStudentId]);

  // -----------------------------
  // Pré-selecionar estudante quando vem da inscrição
  // -----------------------------
  useEffect(() => {
    if (!isOpen || !preSelectedStudentId || students.length === 0) return;

    // Encontrar o estudante pré-selecionado
    const student = students.find(s => s.id === preSelectedStudentId);
    if (student) {
      // Pré-selecionar o estudante automaticamente
      onChangeField("studentId", student.id);
      onChangeField("studentName", student.name || "");
      onChangeField("studentCode", student.username || `MAT${student.id}`);
      onChangeField("registrationType", "new"); // Primeira matrícula
    }
  }, [isOpen, preSelectedStudentId, students]);

  // -----------------------------
  // Select handlers
  // -----------------------------
  const handleSelectStudent = (student: Student) => {
    onChangeField("studentId", student.id);
    onChangeField("studentName", student.name || "");
    onChangeField("studentCode", student.username || `MAT${student.id}`);
    setStudentSearch("");
  };

  const handleClearStudent = () => {
    onChangeField("studentId", 0);
    onChangeField("studentName", "");
    onChangeField("studentCode", "");
  };

  const handleSelectCourse = async (course: Course) => {
    onChangeField("courseId", course.codigo);
    onChangeField("courseName", course.nome);

    onChangeField("monthlyFee", (course.mensalidade as any) || 2500);

    // Taxa de matrícula: lógica de prioridade
    // 1. Se curso é isento → SEMPRE isento (independente do global)
    // 2. Se definições globais estão activas + isento global → isento para todos
    // 3. Se definições globais estão activas → usar valor global
    // 4. Se definições globais desactivadas → usar valor do curso
    if (course.isento_matricula) {
      onChangeField("enrollmentFee", 0);
      onChangeField("enrollmentFeeIsento", true);
    } else if (settings.registrationFeeGlobalEnabled && settings.registrationFeeIsento) {
      onChangeField("enrollmentFee", 0);
      onChangeField("enrollmentFeeIsento", true);
    } else if (settings.registrationFeeGlobalEnabled) {
      onChangeField("enrollmentFee", settings.registrationFee || 0);
      onChangeField("enrollmentFeeIsento", false);
    } else {
      onChangeField("enrollmentFee", (course.taxa_matricula as any) || 0);
      onChangeField("enrollmentFeeIsento", false);
    }

    // reset turma e nível ao trocar curso
    onChangeField("classId", undefined);
    onChangeField("className", "");
    setSelectedNivel(null);
    setNiveis([]);

    // Se o curso tem níveis, buscar e auto-seleccionar o Nível 1
    // Usar Number() porque PHP retorna "0"/"1" (string), não boolean
    if (Number((course as Record<string, unknown>).tem_niveis) > 0) {
      setIsLoadingNiveis(true);
      try {
        // niveis.php filtra por curso_id numérico (cursos.id), não pelo codigo
        const cursoNumericId = (course as Record<string, unknown>).id ?? course.codigo;
        const res = await apiClient.get(`/api/niveis.php?curso_id=${cursoNumericId}`);
        const lista: NivelItem[] = ((res.data?.data || res.data || []) as NivelItem[])
          .slice()
          .sort((a, b) => a.nivel - b.nivel);
        setNiveis(lista);
        if (lista[0]) setSelectedNivel(lista[0]);
      } catch (e) {
        console.error('Erro ao buscar níveis:', e);
      } finally {
        setIsLoadingNiveis(false);
      }
    }
  };

  const handleSelectNivel = (nivel: NivelItem) => {
    setSelectedNivel(nivel);
    // Limpar turma ao mudar de nível (turma precisa corresponder ao nível)
    onChangeField("classId", undefined);
    onChangeField("className", "");

    // ── Mensalidade: vem sempre do nível (global settings não afetam mensalidade) ──
    const courseRaw = selectedCourse as Record<string, unknown>;
    const nivelMensalidade = Number(
      nivel.mensalidade ?? courseRaw?.mensalidade ?? 0
    );
    onChangeField("monthlyFee", nivelMensalidade);

    // ── Taxa de matrícula: respeita global settings ──
    if (!settings.registrationFeeGlobalEnabled) {
      // Sem override global → usar taxa do nível com fallback para o curso
      const nivelEnrollmentFee = Number(
        nivel.enrollment_fee ?? courseRaw?.taxa_matricula ?? 0
      );
      onChangeField("enrollmentFee", nivelEnrollmentFee);
      onChangeField("enrollmentFeeIsento", nivelEnrollmentFee === 0);
    }
    // Se global ativo → manter o valor já definido em handleSelectCourse (não alterar)
  };

  const handleSelectClass = (classItem: ClassItem) => {
    if (formData.classId === classItem.id) {
      // Já estava selecionada → desmarcar
      onChangeField("classId", undefined);
      onChangeField("className", "");
    } else {
      onChangeField("classId", classItem.id);
      onChangeField("className", classItem.nome);
    }
  };

  // O username (STUDXX.0001.ANO) é gerado automaticamente pelo backend.

  // -----------------------------
  // Validation
  // (Removida validação de username/password - credenciais são geradas na INSCRIÇÃO)
  // -----------------------------

  // Verificar se a taxa de matrícula foi paga (ou se é isento)
  const enrollmentFee = Number(formData.enrollmentFee || 0);
  const paidAmount = Number(formData.paidAmount || 0);
  const isEnrollmentIsento = formData.enrollmentFeeIsento === true || enrollmentFee === 0;
  const isEnrollmentPaid = isEnrollmentIsento || (paidAmount >= enrollmentFee && enrollmentFee > 0);

  const validateForm = (): boolean => {
    const errors: RegistrationFormErrors = {};

    if (!formData.registrationType) errors.registrationType = "Selecione o tipo de inscrição";
    if (!formData.studentId || formData.studentId === 0) errors.studentId = "Selecione um estudante";
    if (!formData.courseId) errors.courseId = "Selecione um curso";
    if (!formData.period) errors.period = "Período é obrigatório";
    if (!formData.enrollmentDate) errors.enrollmentDate = "Data de matrícula é obrigatória";

    // ✅ VALIDAÇÃO DE PAGAMENTO OBRIGATÓRIO
    if (!isEnrollmentPaid) {
      errors.payment = "A taxa de matrícula deve ser paga para confirmar a matrícula";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validação por tab - retorna mensagem de erro ou null se válido
  // ATUALIZADO: Tipo de matrícula e turno são obrigatórios no CourseTab
  const validateTab = (tabId: RegistrationModalTab): string | null => {
    switch (tabId) {
      case "student":
        // StudentTab: apenas seleção do estudante
        if (!formData.studentId || formData.studentId === 0) return "Selecione um estudante primeiro";
        return null;
      case "course":
        // CourseTab: curso + tipo de matrícula + turno (TODOS OBRIGATÓRIOS)
        if (!formData.courseId) return "Selecione um curso primeiro";
        if (!formData.registrationType) return "Selecione o tipo de matrícula";
        if (!formData.turno) return "Selecione o turno (manhã, tarde ou noite)";
        return null;
      case "payment":
        // 0 is a valid fee (means free). Only block if fee is null/undefined or negative.
        if (!formData.enrollmentFeeIsento && (formData.enrollmentFee == null || Number(formData.enrollmentFee) < 0)) return "Defina a taxa de matrícula";
        if (!formData.monthlyFee || Number(formData.monthlyFee) <= 0) return "Defina a mensalidade";
        return null;
      case "confirmation":
        return null;
      default:
        return null;
    }
  };

  // Verifica se pode navegar para um tab específico
  const canNavigateToTab = (targetTab: RegistrationModalTab): { allowed: boolean; error?: string } => {
    const tabOrder: RegistrationModalTab[] = ["student", "course", "payment", "confirmation"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const targetIndex = tabOrder.indexOf(targetTab);

    // Sempre pode voltar para tabs anteriores ou ficar no mesmo
    if (targetIndex <= currentIndex) {
      return { allowed: true };
    }

    // Para avançar, precisa validar todos os tabs anteriores ao destino
    for (let i = 0; i < targetIndex; i++) {
      const error = validateTab(tabOrder[i]);
      if (error) {
        return { allowed: false, error };
      }
    }

    return { allowed: true };
  };

  // Handler para clique no sidebar
  const handleTabClick = (tabId: RegistrationModalTab) => {
    const { allowed, error } = canNavigateToTab(tabId);
    if (allowed) {
      setActiveTab(tabId);
    } else if (error) {
      toast.error(error);
    }
  };

  const validateAndNext = () => {
    const error = validateTab(activeTab);
    if (error) {
      toast.error(error);
      return;
    }

    // Ordem dos tabs incluindo confirmation
    const order: RegistrationModalTab[] = ["student", "course", "payment", "confirmation"];
    const nextIndex = order.indexOf(activeTab) + 1;
    if (nextIndex < order.length) setActiveTab(order[nextIndex]);
  };

  // -----------------------------
  // Save
  // -----------------------------
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    // ✅ Verificar pagamento primeiro
    if (!isEnrollmentPaid) {
      toast.error("A taxa de matrícula deve ser paga para confirmar a matrícula");
      return;
    }

    if (!validateForm()) {
      toast.error("Preencha todos os campos obrigatórios");
      setActiveTab("student");
      return;
    }

    // ✅ Mapeamento para API
    // username é gerado automaticamente pelo backend
    const mappedData = {
      student_id: formData.studentId,
      course_id: formData.courseId,
      class_id: formData.classId || null,
      nivel_id: selectedNivel?.id ?? null,
      period: formData.period,
      enrollment_date: formData.enrollmentDate,
      // Pagamento já foi validado (isEnrollmentPaid=true) → matrícula activa
      status: isEnrollmentPaid ? 'active' : formData.status,
      payment_status: isEnrollmentPaid ? 'paid' : formData.paymentStatus,
      enrollment_fee: formData.enrollmentFee,
      monthly_fee: formData.monthlyFee,
      observations: formData.observations,
      registration_type: formData.registrationType,
      // Campos de pagamento (ConfirmationTab)
      paid_amount: formData.paidAmount || 0,
      payment_method: formData.paymentMethod || 'cash',
      payment_reference: formData.paymentReference || '',
      include_first_month: formData.includeFirstMonth || false,
    };

    console.log("📋 FormData ANTES do mapeamento:", formData);
    console.log("📤 Dados DEPOIS do mapeamento:", mappedData);

    setIsSaving(true);
    try {
      await onSave(mappedData as any);
      // Mostrar modal de sucesso após salvar (sem toast duplicado)
      setShowReceiptPrompt(true);
    } catch (error: any) {
      console.error("Erro ao salvar matrícula:", error);
      toast.error(error.message || "Erro ao salvar matrícula");
    } finally {
      setIsSaving(false);
    }
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
          <div class="info-row"><span><strong>Email:</strong></span><span>${selectedStudent?.email || '-'}</span></div>
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
    <Dialog open={isOpen} onOpenChange={() => setShowCancelConfirm(true)}>
      <DialogContent
        className="max-w-5xl p-0 overflow-hidden border-none shadow-2xl bg-white"
        preventOutsideClose={true}
        hideCloseButton={true}
      >
        {/* Botão X para fechar */}
        <button
          type="button"
          onClick={() => setShowCancelConfirm(true)}
          className="absolute top-4 right-4 z-50 flex items-center justify-center h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>

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
                  onClick={() => handleTabClick(tab.id)}
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
                  isPreSelected={Boolean(preSelectedStudentId)}
                />
              )}

              {activeTab === "course" && (
                <CourseTab
                  formData={formData}
                  formErrors={formErrors}
                  courses={courses}
                  classes={classes}
                  filteredClasses={filteredClasses}
                  isLoadingCourses={isLoadingCourses}
                  isLoadingClasses={isLoadingClasses}
                  isLoadingNiveis={isLoadingNiveis}
                  niveis={niveis}
                  selectedNivel={selectedNivel}
                  existingRegistrations={existingRegistrations}
                  onSelectCourse={handleSelectCourse}
                  onSelectNivel={handleSelectNivel}
                  onSelectClass={handleSelectClass}
                  onChangeField={onChangeField}
                  formatCurrency={formatCurrency}
                  isPreSelected={Boolean(preSelectedStudentId)}
                  getStudentCourseHistory={(studentId, courseId) => {
                    // Verificar histórico do estudante no curso
                    // Por enquanto, verifica nas existingRegistrations
                    const hasHistory = existingRegistrations.some(
                      (reg) => reg.studentId === studentId && reg.courseId === courseId
                    );

                    // TODO: Implementar API para buscar módulos reprovados
                    // Por enquanto, retorna sem módulos reprovados
                    return {
                      hasHistory,
                      hasFailedModules: false,
                      failedModules: [],
                    };
                  }}
                />
              )}

              {activeTab === "payment" && (
                <PaymentTab
                  formData={formData}
                  onChangeField={onChangeField}
                  formatCurrency={formatCurrency}
                />
              )}

              {activeTab === "confirmation" && (
                <ConfirmationTab
                  formData={formData}
                  onChangeField={onChangeField}
                  formatCurrency={formatCurrency}
                  selectedStudent={selectedStudent}
                  selectedCourse={selectedCourse}
                />
              )}
              {/* Removido: CredentialsTab - credenciais são geradas na INSCRIÇÃO */}
            </div>

            {/* FOOTER */}
            <footer className="px-10 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setShowCancelConfirm(true)}
                className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[11px] tracking-widest"
              >
                Cancelar
              </Button>

              <div className="flex gap-3">
                {activeTab !== "confirmation" ? (
                  <Button
                    onClick={validateAndNext}
                    className="bg-[#F5821F] text-white hover:bg-[#E07318] px-8 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-orange-200"
                  >
                    Próximo Passo <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <div className="flex flex-col items-end gap-2">
                    {/* Aviso de pagamento pendente */}
                    {!isEnrollmentPaid && (
                      <p className="text-xs text-red-500 font-medium">
                        ⚠️ Confirme o pagamento da taxa para finalizar
                      </p>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !isEnrollmentPaid}
                      className={cn(
                        "px-10 h-12 rounded-xl flex gap-2 font-bold transition-all active:scale-95 shadow-xl disabled:opacity-70 disabled:cursor-not-allowed",
                        isEnrollmentPaid
                          ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-green-500/30"
                          : "bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-slate-300/30"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          {isEditing ? "Atualizar Matrícula" : "Confirmar Matrícula"}
                        </>
                      )}
                    </Button>
                  </div>
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

            {/* RECEIPT PROMPT MODAL - SUCESSO DA MATRÍCULA */}
            {showReceiptPrompt && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-lg w-full">
                  {/* Header azul de sucesso */}
                  <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-8 py-6 text-white text-center">
                    <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-1">Matrícula Concluída!</h3>
                    <p className="text-blue-100 text-sm">O estudante foi matriculado com sucesso no curso <strong>{formData.courseName}</strong></p>
                  </div>

                  {/* Conteúdo */}
                  <div className="px-8 py-6">
                    {/* Resumo do estudante */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center text-white font-bold text-xl">
                          {formData.studentName?.charAt(0)?.toUpperCase() || 'E'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{formData.studentName}</h4>
                          <p className="text-sm text-slate-500">{formData.courseName}</p>
                          <p className="text-xs text-[#F5821F] font-mono">{formData.studentCode}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-600 text-center mb-6">
                      Deseja imprimir o recibo de matrícula agora?
                    </p>

                    {/* Botões */}
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowReceiptPrompt(false);
                          onClose();
                        }}
                        className="flex-1 h-12 border-2 border-slate-300 hover:border-slate-400"
                      >
                        Concluído
                      </Button>
                      <Button
                        onClick={() => {
                          handlePrintReceipt();
                          setShowReceiptPrompt(false);
                          onClose();
                        }}
                        className="flex-1 h-12 bg-gradient-to-r from-[#004B87] to-[#0066B3] hover:from-[#003A6B] hover:to-[#005599] text-white font-bold"
                      >
                        <Printer className="h-4 w-4 mr-2" />
                        Imprimir Recibo
                      </Button>
                    </div>
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

            {/* CANCEL CONFIRMATION MODAL */}
            <ConfirmModal
              isOpen={showCancelConfirm}
              onCancel={() => setShowCancelConfirm(false)}
              onConfirm={() => { setShowCancelConfirm(false); onClose(); }}
              variant="warning"
              title="Cancelar Matrícula"
              subtitle="Os dados não salvos serão perdidos"
              message="Tem certeza que deseja cancelar o processo de matrícula?"
              detail={formData.studentName ? `Estudante: ${formData.studentName}` : undefined}
              confirmLabel="Sim, Cancelar"
              cancelLabel="Não, Continuar"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
