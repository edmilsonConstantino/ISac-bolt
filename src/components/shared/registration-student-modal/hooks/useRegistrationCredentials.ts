// src/components/shared/registration-student-modal/hooks/useRegistrationCredentials.ts

import { useEffect, useState } from "react";

import studentService from "@/services/studentService";

import { generateStudentCode } from "../utils/generateStudentCode";
import { generatePassword } from "../utils/generatePassword";

import type { RegistrationFormData } from "../types/registrationModal.types";

interface Params {
  formData: RegistrationFormData;
  setFormData: React.Dispatch<React.SetStateAction<RegistrationFormData>>;
}

export function useRegistrationCredentials({ formData, setFormData }: Params) {
  const [showPassword, setShowPassword] = useState(false);
  const [credentialsReadonly, setCredentialsReadonly] = useState(false);

  useEffect(() => {
    const checkAndGenerateCredentials = async () => {
      // Só roda quando tiver estudante + curso
      if (!formData.studentId || !formData.courseId || !formData.courseName) return;

      try {
        // 1) Sempre gerar o studentCode (é do registro de matrícula)
        const studentCode = await generateStudentCode(formData.courseId, formData.courseName);

        // 2) Buscar estudante para ver se já tem credenciais
        const student = await studentService.getById(formData.studentId);

        const hasUsername = !!student?.username;

        if (hasUsername) {
          // Usar credenciais existentes
          setFormData((prev) => ({
            ...prev,
            studentCode,
            username: student.username,
            password: "********", // não mostrar senha real
          }));
          setCredentialsReadonly(true);
          return;
        }

        // Primeira matrícula: username será gerado pela API (STD###), só gerar password
        const password = generatePassword();

        setFormData((prev) => ({
          ...prev,
          studentCode,
          username: '',
          password,
        }));

        setCredentialsReadonly(false);

      } catch (error) {
        console.error("Erro ao verificar/gerar credenciais:", error);
      }
    };

    checkAndGenerateCredentials();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.studentId, formData.courseId, formData.courseName]);

  return {
    showPassword,
    setShowPassword,
    credentialsReadonly,
    setCredentialsReadonly,
  };
}
