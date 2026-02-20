// src/components/Teachers/TeacherProfileModal.tsx - USANDO ProfileModalBase

import React, { useState, useEffect } from "react";
import { ProfileModalBase, ProfileTab, PROFILE_MODAL_STYLES } from "@/components/shared/ProfileModalBase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Users,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Activity,
  Clock,
  X,
} from "lucide-react";
import courseService from "@/services/courseService";
import classService from "@/services/classService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Course {
  id: number;
  codigo: string;
  nome: string;
  status: string;
}

interface AssignedClass {
  id: number;
  name: string;
  code?: string;
  curso?: string;
  schedule?: string;
  students?: number;
  room?: string;
  teacher_id?: number;
  teacherId?: number;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  classes: number;
  students: number;
  status: "active" | "inactive" | "suspended";
  phone?: string;
  genero?: 'M' | 'F';
  specialization?: string;
  contractType?: string;
  cursos?: string;
  turnos?: string;
  experience?: string;
  qualifications?: string;
  lastActivity?: string;
  activityLog?: {
    id: string;
    action: string;
    date: string;
    details: string;
    type?: 'login' | 'update' | 'assignment' | 'other';
  }[];
}

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave?: (updatedTeacher: Teacher) => void;
}

export function TeacherProfileModal({
  isOpen,
  onClose,
  teacher,
  onSave,
}: TeacherProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Teacher | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<AssignedClass[]>([]);
  const [allClasses, setAllClasses] = useState<AssignedClass[]>([]);
  const [showAssignClasses, setShowAssignClasses] = useState(false);
  const [activeTab, setActiveTab] = useState<'perfil' | 'turmas' | 'historico'>('perfil');
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (teacher && isOpen) {
      setFormData({ ...teacher });
      setIsEditing(false);
      setErrors({});
      setShowAssignClasses(false);
      setActiveTab('perfil');
      loadCourses();
      loadTeacherClasses(teacher.id);
      loadAllClasses();
    }
  }, [teacher, isOpen]);

  const loadCourses = async () => {
    try {
      const result = await courseService.getAll();
      if (Array.isArray(result)) {
        setCourses(result.filter((c: Course) => c.status === 'ativo'));
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const loadTeacherClasses = async (teacherId: number) => {
    try {
      setLoadingClasses(true);
      const classes = await classService.getByTeacher(teacherId);
      setTeacherClasses(classes.map(cls => ({
        id: cls.id!,
        name: cls.name,
        code: cls.code,
        curso: cls.curso,
        schedule: cls.schedule,
        students: cls.students,
        room: cls.room,
        teacher_id: cls.teacher_id ?? undefined,
      })));
    } catch (error) {
      console.error('Erro ao carregar turmas do docente:', error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const loadAllClasses = async () => {
    try {
      const classes = await classService.getAll();
      setAllClasses(classes.map(cls => ({
        id: cls.id!,
        name: cls.name,
        code: cls.code,
        curso: cls.curso,
        schedule: cls.schedule,
        students: cls.students,
        room: cls.room,
        teacher_id: cls.teacher_id ?? undefined,
      })));
    } catch (error) {
      console.error('Erro ao carregar todas as turmas:', error);
    }
  };

  if (!teacher || !formData) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Telefone inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => { setIsEditing(true); setErrors({}); };
  const handleCancel = () => { setIsEditing(false); setFormData({ ...teacher }); setErrors({}); };

  const handleSave = () => {
    if (!validateForm()) return;
    if (formData && onSave) onSave(formData);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleStatusChange = (newStatus: "active" | "inactive" | "suspended") => {
    if (isEditing) setFormData(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const toggleCurso = (codigo: string) => {
    if (!isEditing) return;
    setFormData(prev => {
      if (!prev) return null;
      const currentCursos = prev.cursos ? prev.cursos.split(',').filter(c => c.trim()) : [];
      const newCursos = currentCursos.includes(codigo)
        ? currentCursos.filter(c => c !== codigo)
        : [...currentCursos, codigo];
      return { ...prev, cursos: newCursos.join(',') };
    });
  };

  const toggleTurno = (turno: string) => {
    if (!isEditing) return;
    setFormData(prev => {
      if (!prev) return null;
      const currentTurnos = prev.turnos ? prev.turnos.split(',').filter(t => t.trim()) : [];
      let newTurnos: string[];
      if (turno === 'todos') {
        newTurnos = currentTurnos.includes('todos') ? [] : ['todos'];
      } else {
        newTurnos = currentTurnos.filter(t => t !== 'todos');
        newTurnos = newTurnos.includes(turno)
          ? newTurnos.filter(t => t !== turno)
          : [...newTurnos, turno];
      }
      return { ...prev, turnos: newTurnos.join(',') };
    });
  };

  const handleUnassignClass = async (classId: number) => {
    try {
      await classService.assignTeacher(classId, null);
      setTeacherClasses(prev => prev.filter(c => c.id !== classId));
      toast.success("Turma desatribuída com sucesso");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao desatribuir turma";
      toast.error(msg);
    }
  };

  const handleAssignClass = async (classId: number) => {
    try {
      await classService.assignTeacher(classId, teacher.id);
      const cls = allClasses.find(c => c.id === classId);
      if (cls) setTeacherClasses(prev => [...prev, cls]);
      toast.success("Turma atribuída com sucesso");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao atribuir turma";
      toast.error(msg);
    }
  };

  const getContractTypeLabel = (contractType?: string) => {
    const types: Record<string, string> = {
      'full-time': 'Integral', 'part-time': 'Parcial',
      'freelance': 'Freelancer', 'substitute': 'Substituto'
    };
    return types[contractType || ''] || contractType || "N/A";
  };

  const getTurnoLabel = (t: string) => {
    const map: Record<string, string> = {
      'manha': 'Manhã',
      'tarde': 'Tarde',
      'noite': 'Noite',
      'todos': 'Todos'
    };
    return map[t.trim()] || t;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const getLastActivityLabel = (lastActivity?: string) => {
    if (!lastActivity) return 'Sem atividade registrada';
    try {
      const now = new Date();
      const activityDate = new Date(lastActivity);
      const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / 86400000);
      if (diffDays === 0) return 'Ativo hoje';
      if (diffDays === 1) return 'Ativo há 1 dia';
      if (diffDays < 7) return `Ativo há ${diffDays} dias`;
      if (diffDays < 30) return `Ativo há ${Math.floor(diffDays / 7)} semanas`;
      return `Ativo há ${Math.floor(diffDays / 30)} meses`;
    } catch {
      return 'Data inválida';
    }
  };

  const getActivityIcon = (type?: string) => {
    switch (type) {
      case 'login': return '🔑';
      case 'update': return '✏️';
      case 'assignment': return '📚';
      default: return '📋';
    }
  };

  const getActivityColor = (type?: string) => {
    switch (type) {
      case 'login': return 'border-green-400 bg-green-50';
      case 'update': return 'border-purple-400 bg-purple-50';
      case 'assignment': return 'border-blue-400 bg-blue-50';
      default: return 'border-slate-400 bg-slate-50';
    }
  };

  const cursosArray = formData.cursos ? formData.cursos.split(',').filter(c => c.trim()) : [];
  const turnosArray = formData.turnos ? formData.turnos.split(',').filter(t => t.trim()) : [];

  const getAvailableToAssign = () => {
    const assignedIds = teacherClasses.map(c => c.id);
    return allClasses.filter(cls => {
      if (assignedIds.includes(cls.id)) return false;
      if (cls.teacher_id && cls.teacher_id !== teacher.id) return false;
      const matchesCourse = cursosArray.length === 0 || cursosArray.some(c => cls.curso === c || cls.code?.includes(c));
      const matchesTurno = turnosArray.length === 0 || turnosArray.includes('todos') || turnosArray.includes(cls.schedule);
      return matchesCourse && matchesTurno;
    });
  };

  // ============================================================
  // DEFINIR AS TABS
  // ============================================================
  const tabs: ProfileTab[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      color: PROFILE_MODAL_STYLES.tabs.blue,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Informações Pessoais */}
            <Card className={PROFILE_MODAL_STYLES.card.blue}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#004B87] text-sm">
                  <User className="h-4 w-4" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs text-slate-700 font-medium">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : PROFILE_MODAL_STYLES.input.orange
                    )}
                  />
                  {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs text-slate-700 font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : PROFILE_MODAL_STYLES.input.orange
                    )}
                  />
                  {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs text-slate-700 font-medium">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="+258 84 000 0000"
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : PROFILE_MODAL_STYLES.input.orange
                    )}
                  />
                  {errors.phone && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Tipo de Contrato</Label>
                  {isEditing ? (
                    <select
                      name="contractType"
                      value={formData.contractType || ""}
                      onChange={(e) => handleSelectChange('contractType', e.target.value)}
                      className="w-full h-9 px-3 text-sm border-2 border-[#F5821F] rounded-lg bg-white focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      <option value="full-time">Integral</option>
                      <option value="part-time">Parcial</option>
                      <option value="freelance">Freelancer</option>
                      <option value="substitute">Substituto</option>
                    </select>
                  ) : (
                    <Input value={getContractTypeLabel(formData.contractType)} disabled className="h-9 text-sm bg-slate-50" />
                  )}
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs text-slate-700 font-medium">Status</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      type="button"
                      variant={formData.status === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("active")}
                      disabled={!isEditing}
                      className={cn(
                        "h-8 text-xs",
                        formData.status === "active"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "border border-slate-200"
                      )}
                    >
                      Activo
                    </Button>

                    <Button
                      type="button"
                      variant={formData.status === "suspended" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("suspended")}
                      disabled={!isEditing}
                      className={cn(
                        "h-8 text-xs",
                        formData.status === "suspended"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "border border-slate-200"
                      )}
                    >
                      Suspenso
                    </Button>

                    <Button
                      type="button"
                      variant={formData.status === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("inactive")}
                      disabled={!isEditing}
                      className={cn(
                        "h-8 text-xs",
                        formData.status === "inactive"
                          ? "bg-slate-400 hover:bg-slate-500"
                          : "border border-slate-200"
                      )}
                    >
                      Inactivo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Informações Acadêmicas */}
            <Card className={PROFILE_MODAL_STYLES.card.orange}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#F5821F] text-sm">
                  <GraduationCap className="h-4 w-4" />
                  Informações Acadêmicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Especializações</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Business English, IELTS"
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : PROFILE_MODAL_STYLES.input.blue
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Qualificações</Label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications || ""}
                    onChange={handleTextareaChange}
                    className={cn(
                      "w-full p-2 text-sm border rounded-lg h-20 resize-none",
                      !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87] focus:border-[#004B87] focus:outline-none"
                    )}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs text-slate-700 font-medium">Experiência</Label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience || ""}
                    onChange={handleTextareaChange}
                    className={cn(
                      "w-full p-2 text-sm border rounded-lg h-20 resize-none",
                      !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87] focus:border-[#004B87] focus:outline-none"
                    )}
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cursos e Turnos */}
            <Card className="border-2 border-slate-200 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#004B87] text-sm">
                  <BookOpen className="h-4 w-4" />
                  Cursos e Turnos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label className="text-xs text-slate-700 font-medium">Cursos que Lecciona</Label>
                  {isEditing ? (
                    <div className="grid grid-cols-3 gap-2">
                      {courses.map(course => {
                        const isSelected = cursosArray.includes(course.codigo);
                        return (
                          <button
                            key={course.id}
                            type="button"
                            onClick={() => toggleCurso(course.codigo)}
                            className={cn(
                              "h-8 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-1 text-xs px-2",
                              isSelected
                                ? "border-[#F5821F] bg-orange-50 text-[#F5821F]"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                            )}
                          >
                            <BookOpen className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{course.nome}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {cursosArray.length > 0 ? cursosArray.map(c => (
                        <Badge key={c} className="bg-orange-100 text-orange-800 border border-orange-200 px-2 py-0.5 text-xs">
                          {courses.find(co => co.codigo === c)?.nome || c}
                        </Badge>
                      )) : (
                        <span className="text-xs text-slate-400">Nenhum curso atribuído</span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-xs text-slate-700 font-medium">Turnos de Leccionação</Label>
                  {isEditing ? (
                    <div className="grid grid-cols-4 gap-2">
                      {([
                        { id: 'manha', label: 'Manhã', icon: Sun, color: 'amber' },
                        { id: 'tarde', label: 'Tarde', icon: Sunset, color: 'orange' },
                        { id: 'noite', label: 'Noite', icon: Moon, color: 'indigo' },
                        { id: 'todos', label: 'Todos', icon: CheckCircle2, color: 'emerald' },
                      ]).map(turno => {
                        const isSelected = turnosArray.includes(turno.id);
                        const Icon = turno.icon;
                        return (
                          <button
                            key={turno.id}
                            type="button"
                            onClick={() => toggleTurno(turno.id)}
                            className={cn(
                              "h-8 rounded-lg border-2 font-medium transition-all flex items-center justify-center gap-1 text-xs",
                              isSelected
                                ? turno.color === 'amber' ? "border-amber-500 bg-amber-50 text-amber-700" :
                                  turno.color === 'orange' ? "border-orange-500 bg-orange-50 text-orange-700" :
                                  turno.color === 'indigo' ? "border-indigo-500 bg-indigo-50 text-indigo-700" :
                                  "border-emerald-500 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 hover:border-slate-300 text-slate-600"
                            )}
                          >
                            <Icon className="h-3 w-3" /> {turno.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {turnosArray.length > 0 ? turnosArray.map(t => (
                        <Badge key={t} className={cn("px-2 py-0.5 border text-xs",
                          t === 'manha' ? "bg-amber-100 text-amber-800 border-amber-200" :
                          t === 'tarde' ? "bg-orange-100 text-orange-800 border-orange-200" :
                          t === 'noite' ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
                          "bg-emerald-100 text-emerald-800 border-emerald-200"
                        )}>
                          {getTurnoLabel(t)}
                        </Badge>
                      )) : (
                        <span className="text-xs text-slate-400">Nenhum turno definido</span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'turmas',
      label: `Turmas (${teacherClasses.length})`,
      icon: Users,
      color: PROFILE_MODAL_STYLES.tabs.orange,
      content: (
        <Card className={PROFILE_MODAL_STYLES.card.orange}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#F5821F] text-sm">
                <Users className="h-4 w-4" />
                Turmas Atribuídas ({teacherClasses.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignClasses(!showAssignClasses)}
                className="border border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white text-xs h-8"
              >
                {showAssignClasses ? 'Fechar' : '+ Atribuir'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {teacherClasses.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500">Nenhuma turma atribuída</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {teacherClasses.map(cls => (
                  <div key={cls.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-semibold text-xs text-blue-800">{cls.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {cls.code || cls.curso}
                        {cls.schedule && ` • ${getTurnoLabel(cls.schedule)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:bg-red-100"
                      onClick={() => handleUnassignClass(cls.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {showAssignClasses && (
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                <p className="text-xs text-slate-600 font-medium mb-2">Turmas disponíveis:</p>
                {getAvailableToAssign().length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-3">
                    Nenhuma turma disponível
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                    {getAvailableToAssign().map(cls => (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => handleAssignClass(cls.id)}
                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all text-left"
                      >
                        <div>
                          <p className="font-semibold text-xs text-slate-700">{cls.name}</p>
                          <p className="text-[10px] text-slate-500">
                            {cls.code || cls.curso}
                          </p>
                        </div>
                        <CheckCircle className="h-3 w-3 text-green-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: Activity,
      color: 'purple-500',
      content: (
        <Card className={PROFILE_MODAL_STYLES.card.purple}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-600 text-sm">
                <Activity className="h-4 w-4" />
                Histórico de Atividades
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Última Atividade</p>
                <p className="text-xs font-semibold text-purple-600">
                  {getLastActivityLabel(formData.lastActivity)}
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {/* Resumo de Acesso */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-slate-600 font-medium">Último Acesso</span>
                </div>
                <p className="text-sm font-bold text-green-700">
                  {formData.lastActivity ? formatDate(formData.lastActivity) : 'Nunca'}
                </p>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-slate-600 font-medium">Total de Atividades</span>
                </div>
                <p className="text-sm font-bold text-blue-700">
                  {formData.activityLog?.length || 0} registros
                </p>
              </div>
            </div>

            {/* Log de Atividades */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {(!formData.activityLog || formData.activityLog.length === 0) ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">Nenhuma atividade registrada</p>
                  <p className="text-xs text-slate-400 mt-1">
                    As atividades do docente aparecerão aqui
                  </p>
                </div>
              ) : (
                formData.activityLog.map(log => (
                  <div
                    key={log.id}
                    className={cn(
                      "flex items-start gap-3 p-3 border-l-4 rounded-lg transition-all hover:shadow-sm",
                      getActivityColor(log.type)
                    )}
                  >
                    <span className="text-xl">{getActivityIcon(log.type)}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                        <span className="text-xs text-slate-400 whitespace-nowrap">
                          {formatDate(log.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  // ============================================================
  // USAR O COMPONENTE BASE
  // ============================================================
  return (
    <ProfileModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={formData.name}
      headerIcon={User}
      status={formData.status}
      isEditing={isEditing}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as 'perfil' | 'turmas' | 'historico')}
      showEditButton={!!onSave}
    />
  );
}
