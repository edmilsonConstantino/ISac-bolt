// src/components/shared/registration-student-modal/utils/generateStudentCode.ts

import registrationService from "@/services/registrationService";

export interface GenerateStudentCodeParams {
  courseId: string;   // ex: "INF"
  courseName: string; // ex: "Informática de Gestão"
}

export interface GenerateStudentCodeResult {
  studentCode: string;     // ex: "IDG.0001.2026"
  courseInitials: string;  // ex: "IDG"
  sequentialNumber: string; // ex: "0001"
  year: number;            // ex: 2026
}

/**
 * Gera código do estudante (enrollment_number / studentCode) no padrão:
 *   SIGLA.0001.ANO
 *
 * Regras:
 * - SIGLA: iniciais do courseName (máx 4 letras)
 * - Número: vem do endpoint getCountByCourse(courseId) => { next_number }
 * - Pad: 4 dígitos
 */
export async function generateStudentCode(
  params: GenerateStudentCodeParams
): Promise<GenerateStudentCodeResult> {
  const { courseId, courseName } = params;

  const courseInitials = buildCourseInitials(courseName);
  const year = new Date().getFullYear();

  try {
    const res = await registrationService.getCountByCourse(courseId);

    // backend esperado: { next_number: number }
    const nextNumber = Number(res?.next_number ?? 1);

    const sequentialNumber = String(isNaN(nextNumber) ? 1 : nextNumber).padStart(4, "0");
    const studentCode = `${courseInitials}.${sequentialNumber}.${year}`;

    return { studentCode, courseInitials, sequentialNumber, year };
  } catch (error) {
    // fallback seguro se API falhar
    const sequentialNumber = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
    const studentCode = `${courseInitials}.${sequentialNumber}.${year}`;

    return { studentCode, courseInitials, sequentialNumber, year };
  }
}

function buildCourseInitials(courseName: string): string {
  const clean = (courseName || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");

  if (!clean) return "EST";

  // pega a primeira letra de cada palavra
  const initials = clean
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .replace(/[^A-Z]/g, "")
    .slice(0, 4);

  return initials || "EST";
}
