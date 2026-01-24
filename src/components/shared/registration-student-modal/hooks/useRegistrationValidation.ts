// src/components/shared/registration-student-modal/hooks/useRegistrationValidation.ts

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type {
  ActiveTab,
  RegistrationFormData,
  RegistrationFormErrors,
} from "../types/registrationModal.types";

interface Params {
  formData: RegistrationFormData;
  activeTab: ActiveTab;
  setActiveTab: React.Dispatch<React.SetStateAction<ActiveTab>>;
  credentialsReadonly: boolean;
}

export function useRegistrationValidation({
  formData,
  activeTab,
  setActiveTab,
  credentialsReadonly,
}: Params) {
  const [formErrors, setFormErrors] = useState<RegistrationFormErrors>({});

  const clearFieldError = useCallback((field: keyof RegistrationFormErrors) => {
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateForm = useCallback((): boolean => {
    const errors: RegistrationFormErrors = {};

    if (!formData.studentId || formData.studentId === 0) {
      errors.studentId = "Selecione um estudante";
    }

    if (!formData.courseId) {
      errors.courseId = "Selecione um curso";
    }

    if (!formData.period?.trim()) {
      errors.period = "Período é obrigatório";
    }

    if (!formData.enrollmentDate) {
      errors.enrollmentDate = "Data de matrícula é obrigatória";
    }

    // ✅ Credenciais: só valida se NÃO for readonly
    if (!credentialsReadonly) {
      if (!formData.username?.trim()) {
        errors.username = "Usuário é obrigatório";
      }
      if (!formData.password?.trim()) {
        errors.password = "Senha é obrigatória";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [
    credentialsReadonly,
    formData.courseId,
    formData.enrollmentDate,
    formData.password,
    formData.period,
    formData.studentId,
    formData.username,
  ]);

  const validateAndNext = useCallback(() => {
    // Validações por aba (fluxo step-by-step)
    if (activeTab === "student" && (!formData.studentId || formData.studentId === 0)) {
      toast.error("Selecione um estudante primeiro");
      setFormErrors((prev) => ({ ...prev, studentId: "Selecione um estudante" }));
      return;
    }

    if (activeTab === "course" && !formData.courseId) {
      toast.error("Selecione um curso primeiro");
      setFormErrors((prev) => ({ ...prev, courseId: "Selecione um curso" }));
      return;
    }

    if (activeTab === "payment") {
      if (!formData.enrollmentFee || formData.enrollmentFee <= 0) {
        toast.error("Defina a taxa de matrícula");
        setActiveTab("payment");
        return;
      }
      if (!formData.monthlyFee || formData.monthlyFee <= 0) {
        toast.error("Defina a mensalidade");
        setActiveTab("payment");
        return;
      }
    }

    const tabs: ActiveTab[] = ["student", "course", "payment", "credentials"];
    const nextIndex = tabs.indexOf(activeTab) + 1;

    if (nextIndex < tabs.length) {
      setActiveTab(tabs[nextIndex]);
    }
  }, [
    activeTab,
    formData.courseId,
    formData.enrollmentFee,
    formData.monthlyFee,
    formData.studentId,
    setActiveTab,
  ]);

  const resetErrors = useCallback(() => setFormErrors({}), []);

  const hasErrors = useMemo(() => Object.keys(formErrors).length > 0, [formErrors]);

  return {
    formErrors,
    setFormErrors,
    hasErrors,
    resetErrors,
    clearFieldError,
    validateForm,
    validateAndNext,
  };
}
