// src/components/shared/registration-student-modal/hooks/useRegistrationData.ts

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import studentService from "@/services/studentService";
import courseService from "@/services/courseService";
import classService from "@/services/classService";

import type {
  StudentItem,
  CourseItem,
  ClassItem,
} from "../types/registrationModal.types";

interface Params {
  isOpen: boolean;
  courseId?: string;
}

export function useRegistrationData({ isOpen, courseId }: Params) {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  /**
   * 🔹 Carregar dados quando o modal abrir
   */
  useEffect(() => {
    if (!isOpen) return;

    const loadAll = async () => {
      try {
        setIsLoadingStudents(true);
        setIsLoadingCourses(true);
        setIsLoadingClasses(true);

        const [studentsData, coursesData, classesData] = await Promise.all([
          studentService.getAll(),
          courseService.getAll(),
          classService.getAll(),
        ]);

        setStudents(studentsData || []);
        setCourses(coursesData || []);
        setClasses(classesData || []);
      } catch (error) {
        console.error("Erro ao carregar dados da matrícula:", error);
        toast.error("Erro ao carregar dados da matrícula");
      } finally {
        setIsLoadingStudents(false);
        setIsLoadingCourses(false);
        setIsLoadingClasses(false);
      }
    };

    loadAll();
  }, [isOpen]);

  /**
   * 🔹 Turmas filtradas pelo curso selecionado
   */
  const filteredClasses = useMemo(() => {
    if (!courseId) return [];
    return classes.filter((c) => c.curso === courseId);
  }, [classes, courseId]);

  return {
    students,
    courses,
    classes,
    filteredClasses,

    isLoadingStudents,
    isLoadingCourses,
    isLoadingClasses,
  };
}
