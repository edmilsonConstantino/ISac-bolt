// src/components/shared/TeacherProfileModal.tsx - VERSÃO PROFISSIONAL COM 7 TABS
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Phone,
  Mail,
  GraduationCap,
  Clock,
  Award,
  Edit,
  Save,
  X,
  Users,
  BookOpen,
  Sun,
  Sunset,
  Moon,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Calendar,
  FileText,
  Download,
  Upload,
  Activity,
  BarChart3,
  AlertTriangle,
  TrendingUp,
  ClipboardList
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
  // NOVOS CAMPOS PROFISSIONAIS
  weeklyHours?: number;
  lastActivity?: string;
  hasScheduleConflict?: boolean;
  hasPendingGrades?: boolean;
  missingData?: string[];
  documents?: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadDate: string;
  }[];
  contractStartDate?: string;
  contractEndDate?: string;
  administrativeNotes?: string;
  activityLog?: {
    id: string;
    action: string;
    date: string;
    details: string;
  }[];
}

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave?: (updatedTeacher: Teacher) => void;
  availableClasses?: any[];
}

export function TeacherProfileModal({
  isOpen,
  onClose,
  teacher,
  onSave,
  availableClasses = []
}: TeacherProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Teacher | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [teacherClasses, setTeacherClasses] = useState<AssignedClass[]>([]);
  const [showAssignClasses, setShowAssignClasses] = useState(false);
  const [activeTab, setActiveTab] = useState<'resumo' | 'turmas' | 'horario' | 'avaliacoes' | 'presencas' | 'contrato' | 'historico'>('resumo');

  useEffect(() => {
    if (teacher && isOpen) {
      setFormData({ ...teacher });
      setIsEditing(false);
      setErrors({});
      setShowAssignClasses(false);
      setActiveTab('resumo');
      loadCourses();
      loadTeacherClasses(teacher.id);
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

  const loadTeacherClasses = (teacherId: number) => {
    const assigned = availableClasses.filter(
      cls => cls.teacher_id === teacherId || cls.teacherId === teacherId
    );
    setTeacherClasses(assigned);
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
      await classService.update(classId, { teacher_id: null } as any);
      setTeacherClasses(prev => prev.filter(c => c.id !== classId));
      toast.success("Turma desatribuída com sucesso");
    } catch (error) {
      toast.error("Erro ao desatribuir turma");
    }
  };

  const handleAssignClass = async (classId: number) => {
    try {
      await classService.update(classId, { teacher_id: teacher.id } as any);
      const cls = availableClasses.find(c => c.id === classId);
      if (cls) setTeacherClasses(prev => [...prev, cls]);
      toast.success("Turma atribuída com sucesso");
    } catch (error) {
      toast.error("Erro ao atribuir turma");
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
    const map: Record<string, string> = { 'manha': 'Manhã', 'tarde': 'Tarde', 'noite': 'Noite', 'todos': 'Todos' };
    return map[t.trim()] || t;
  };

  const getWorkloadStatus = (hours?: number) => {
    if (!hours) return { label: 'Sem carga', color: 'bg-gray-100 text-gray-600' };
    if (hours >= 20) return { label: 'Sobrecarregado', color: 'bg-red-100 text-red-700' };
    if (hours >= 15) return { label: 'Alta', color: 'bg-yellow-100 text-yellow-700' };
    return { label: 'Normal', color: 'bg-green-100 text-green-700' };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-PT');
  };

  const getLastActivityLabel = (lastActivity?: string) => {
    if (!lastActivity) return 'Sem atividade registrada';
    const now = new Date();
    const activityDate = new Date(lastActivity);
    const diffDays = Math.floor((now.getTime() - activityDate.getTime()) / 86400000);
    if (diffDays === 0) return 'Ativo hoje';
    if (diffDays === 1) return 'Ativo há 1 dia';
    return `Ativo há ${diffDays} dias`;
  };

  const cursosArray = formData.cursos ? formData.cursos.split(',').filter(c => c.trim()) : [];
  const turnosArray = formData.turnos ? formData.turnos.split(',').filter(t => t.trim()) : [];
  const workloadStatus = getWorkloadStatus(formData.weeklyHours);

  const getAvailableToAssign = () => {
    const assignedIds = teacherClasses.map(c => c.id);
    return availableClasses.filter(cls => {
      if (assignedIds.includes(cls.id)) return false;
      if (cls.teacher_id && cls.teacher_id !== teacher.id) return false;
      const matchesCourse = cursosArray.length === 0 || cursosArray.some(c => cls.curso === c || cls.code?.includes(c));
      const matchesTurno = turnosArray.length === 0 || turnosArray.includes('todos') || turnosArray.includes(cls.schedule);
      return matchesCourse && matchesTurno;
    });
  };

  // Mock data para demonstração (em produção virá da API)
  const mockSchedule = [
    { day: 'Segunda', time: '08:00-10:00', class: 'TI-2026', room: 'A101', conflict: false },
    { day: 'Segunda', time: '10:00-12:00', class: 'TI-2025', room: 'A102', conflict: false },
    { day: 'Terça', time: '08:00-10:00', class: 'TI-2026', room: 'A101', conflict: true },
    { day: 'Terça', time: '08:00-10:00', class: 'GI-2025', room: 'B201', conflict: true },
  ];

  const mockGradesProgress = [
    { turma: 'TI-2026', modulo: 'Módulo 1', teste: 100, trabalho: 100, exame: 100 },
    { turma: 'TI-2026', modulo: 'Módulo 2', teste: 80, trabalho: 60, exame: 0 },
    { turma: 'TI-2025', modulo: 'Módulo 1', teste: 100, trabalho: 100, exame: 100 },
  ];

  const mockAttendance = [
    { turma: 'TI-2026', presencas: 45, faltas: 3, pendencias: 0 },
    { turma: 'TI-2025', presencas: 38, faltas: 2, pendencias: 1 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] p-0 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#004B87] via-[#0066B3] to-[#F5821F] p-5 rounded-t-lg flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold block">{formData.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn(
                      "text-[10px] px-2 py-0.5 border-0",
                      formData.status === 'active' ? 'bg-emerald-500' : 
                      formData.status === 'suspended' ? 'bg-amber-500' : 'bg-slate-400'
                    )}>
                      {formData.status === "active" ? "✓ Activo" : 
                       formData.status === "suspended" ? "⚠ Suspenso" : "Inactivo"}
                    </Badge>
                    {isEditing && (
                      <Badge className="bg-white/90 text-[#004B87] text-[10px] px-2 py-0.5">
                        <Edit className="h-3 w-3 mr-1" /> Editando
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="h-9 w-9 rounded-lg bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-4 gap-3 px-6 py-3 bg-gradient-to-br from-slate-50 to-blue-50/30 border-b flex-shrink-0">
          <div className="text-center">
            <div className="text-xl font-bold text-[#004B87]">{teacherClasses.length}</div>
            <div className="text-[10px] text-slate-600 font-medium">Turmas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-600">{formData.students}</div>
            <div className="text-[10px] text-slate-600 font-medium">Estudantes</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-[#F5821F]">{formData.weeklyHours || 0}h</div>
            <div className="text-[10px] text-slate-600 font-medium">Carga Semanal</div>
          </div>
          <div className="text-center">
            <div className={cn(
              "inline-block px-2.5 py-1 rounded-full text-[10px] font-bold",
              workloadStatus.color
            )}>
              {workloadStatus.label}
            </div>
          </div>
        </div>

        {/* Tabs - NOVO DESIGN ORGANIZADO */}
        <div className="bg-gradient-to-br from-[#F5F5DC] to-[#FAF0E6] border-b-2 border-slate-200 px-6 py-4 flex-shrink-0">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="w-full h-auto bg-transparent p-0 gap-3 justify-start flex-wrap">
              <TabsTrigger 
                value="resumo" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <User className="h-4 w-4" />
                Resumo
              </TabsTrigger>
              
              <TabsTrigger 
                value="turmas" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <Users className="h-4 w-4" />
                Turmas
              </TabsTrigger>
              
              <TabsTrigger 
                value="horario" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <Calendar className="h-4 w-4" />
                Horário
              </TabsTrigger>
              
              <TabsTrigger 
                value="avaliacoes" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <BarChart3 className="h-4 w-4" />
                Avaliações
              </TabsTrigger>
              
              <TabsTrigger 
                value="presencas" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <ClipboardList className="h-4 w-4" />
                Presenças
              </TabsTrigger>
              
              <TabsTrigger 
                value="contrato" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <FileText className="h-4 w-4" />
                Contrato
              </TabsTrigger>
              
              <TabsTrigger 
                value="historico" 
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-transparent data-[state=active]:border-[#004B87] data-[state=active]:bg-white data-[state=active]:text-[#004B87] data-[state=active]:shadow-md hover:bg-white/50 transition-all text-slate-600 font-medium"
              >
                <Activity className="h-4 w-4" />
                Histórico
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              {/* TAB 1: RESUMO */}
              <TabsContent value="resumo" className="mt-0 space-y-6">
                {/* Stats Card no topo */}
                <div className="grid grid-cols-4 gap-4">
                  <Card className="border-2 border-[#004B87]/20">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-[#004B87]">{teacherClasses.length}</div>
                      <div className="text-xs text-slate-600 font-medium mt-1">Turmas</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-emerald-500/20">
                    <CardContent className="pt-4 text-center">
                      <div className="text-2xl font-bold text-emerald-600">{formData.students}</div>
                      <div className="text-xs text-slate-600 font-medium mt-1">Estudantes</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-[#F5821F]/20">
                    <CardContent className="pt-4 text-center">
                      <div className="text-xl font-bold text-[#F5821F]">{formData.weeklyHours || 0}h</div>
                      <div className="text-xs text-slate-600 font-medium mt-1">Carga Semanal</div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-slate-200">
                    <CardContent className="pt-4 text-center">
                      <div className={cn(
                        "inline-block px-3 py-1.5 rounded-full text-xs font-bold",
                        workloadStatus.color
                      )}>
                        {workloadStatus.label}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Resto do conteúdo do resumo */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Informações Pessoais */}
                  <Card className="border-0 shadow-lg">
                    <div className="h-1 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]"></div>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <div className="h-8 w-8 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-lg flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        Informações Pessoais
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-slate-700 font-medium">
                          Nome Completo <span className="text-red-500">*</span>
                        </Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange}
                          disabled={!isEditing}
                          className={cn(
                            "h-11",
                            !isEditing 
                              ? "bg-slate-50 border-slate-200" 
                              : "border-2 focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20"
                          )} />
                        {errors.name && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-slate-700 font-medium">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange}
                          disabled={!isEditing}
                          className={cn(
                            "h-11",
                            !isEditing 
                              ? "bg-slate-50 border-slate-200" 
                              : "border-2 focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20"
                          )} />
                        {errors.email && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-slate-700 font-medium">Telefone</Label>
                        <Input id="phone" name="phone" value={formData.phone || ""} onChange={handleInputChange}
                          placeholder="+258 84 000 0000" disabled={!isEditing}
                          className={cn(
                            "h-11",
                            !isEditing 
                              ? "bg-slate-50 border-slate-200" 
                              : "border-2 focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20"
                          )} />
                        {errors.phone && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.phone}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Tipo de Contrato</Label>
                        {isEditing ? (
                          <select name="contractType" value={formData.contractType || ""}
                            onChange={(e) => handleSelectChange('contractType', e.target.value)}
                            className="w-full h-11 px-3 border-2 rounded-lg bg-white focus:border-[#F5821F] focus:outline-none">
                            <option value="">Selecione...</option>
                            <option value="full-time">Integral</option>
                            <option value="part-time">Parcial</option>
                            <option value="freelance">Freelancer</option>
                            <option value="substitute">Substituto</option>
                          </select>
                        ) : (
                          <Input value={getContractTypeLabel(formData.contractType)} disabled className="h-11 bg-slate-50 border-slate-200" />
                        )}
                      </div>

                      <div className="space-y-3 pt-2">
                        <Label className="text-slate-700 font-medium">Status do Docente</Label>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            type="button" 
                            variant={formData.status === "active" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleStatusChange("active")} 
                            disabled={!isEditing}
                            className={cn(
                              "h-10",
                              formData.status === "active" 
                                ? "bg-emerald-600 hover:bg-emerald-700 border-0" 
                                : "border-2 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Activo
                          </Button>
                          
                          <Button 
                            type="button" 
                            variant={formData.status === "suspended" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleStatusChange("suspended")} 
                            disabled={!isEditing}
                            className={cn(
                              "h-10",
                              formData.status === "suspended" 
                                ? "bg-amber-500 hover:bg-amber-600 border-0" 
                                : "border-2 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" /> Suspenso
                          </Button>
                          
                          <Button 
                            type="button" 
                            variant={formData.status === "inactive" ? "default" : "outline"} 
                            size="sm"
                            onClick={() => handleStatusChange("inactive")} 
                            disabled={!isEditing}
                            className={cn(
                              "h-10",
                              formData.status === "inactive" 
                                ? "bg-slate-400 hover:bg-slate-500 border-0" 
                                : "border-2 border-slate-200 hover:bg-slate-50"
                            )}
                          >
                            <X className="h-4 w-4 mr-2" /> Inactivo
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações Acadêmicas */}
                  <Card className="border-0 shadow-lg">
                    <div className="h-1 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]"></div>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <div className="h-8 w-8 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center">
                          <GraduationCap className="h-4 w-4 text-white" />
                        </div>
                        Informações Acadêmicas
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Especializações</Label>
                        <Input id="specialization" name="specialization" value={formData.specialization || ""}
                          onChange={handleInputChange} placeholder="Ex: Business English, IELTS" disabled={!isEditing}
                          className={cn(
                            "h-11",
                            !isEditing 
                              ? "bg-slate-50 border-slate-200" 
                              : "border-2 focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20"
                          )} />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Qualificações</Label>
                        <textarea id="qualifications" name="qualifications" value={formData.qualifications || ""}
                          onChange={handleTextareaChange}
                          className={cn(
                            "w-full p-3 border-2 rounded-lg h-32 resize-none",
                            !isEditing ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                              : "focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
                          )} disabled={!isEditing} />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Experiência Profissional</Label>
                        <textarea id="experience" name="experience" value={formData.experience || ""}
                          onChange={handleTextareaChange}
                          className={cn(
                            "w-full p-3 border-2 rounded-lg h-32 resize-none",
                            !isEditing ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                              : "focus:border-[#F5821F] focus:outline-none focus:ring-2 focus:ring-[#F5821F]/20"
                          )} disabled={!isEditing} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cursos e Turnos */}
                  <Card className="border-0 shadow-lg lg:col-span-2">
                    <div className="h-1 bg-gradient-to-r from-[#004B87] via-[#F5821F] to-[#FF9933]"></div>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <div className="h-8 w-8 bg-purple-600 rounded-lg flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-white" />
                        </div>
                        Cursos e Turnos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Curso(s) que Lecciona</Label>
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
                                    "h-10 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-xs px-2",
                                    isSelected
                                      ? "border-[#F5821F] bg-orange-50 text-[#F5821F]"
                                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                                  )}
                                >
                                  <BookOpen className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span className="truncate">{course.nome}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {cursosArray.length > 0 ? cursosArray.map(c => (
                              <Badge key={c} className="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {courses.find(co => co.codigo === c)?.nome || c}
                              </Badge>
                            )) : (
                              <span className="text-sm text-slate-400">Nenhum curso atribuído</span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Turnos de Leccionação</Label>
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
                                <button key={turno.id} type="button" onClick={() => toggleTurno(turno.id)}
                                  className={cn(
                                    "h-10 rounded-xl border-2 font-semibold transition-all flex items-center justify-center gap-2 text-xs",
                                    isSelected
                                      ? turno.color === 'amber' ? "border-amber-500 bg-amber-50 text-amber-700" :
                                        turno.color === 'orange' ? "border-orange-500 bg-orange-50 text-orange-700" :
                                        turno.color === 'indigo' ? "border-indigo-500 bg-indigo-50 text-indigo-700" :
                                        "border-emerald-500 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 hover:border-slate-300 text-slate-600"
                                  )}>
                                  <Icon className="h-3.5 w-3.5" /> {turno.label}
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {turnosArray.length > 0 ? turnosArray.map(t => (
                              <Badge key={t} className={cn("px-3 py-1 border",
                                t === 'manha' ? "bg-amber-100 text-amber-800 border-amber-200" :
                                t === 'tarde' ? "bg-orange-100 text-orange-800 border-orange-200" :
                                t === 'noite' ? "bg-indigo-100 text-indigo-800 border-indigo-200" :
                                "bg-emerald-100 text-emerald-800 border-emerald-200"
                              )}>
                                {getTurnoLabel(t)}
                              </Badge>
                            )) : (
                              <span className="text-sm text-slate-400">Nenhum turno definido</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* TAB 2: TURMAS */}
              <TabsContent value="turmas" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[#004B87]">
                        <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-4 w-4 text-blue-700" />
                        </div>
                        Turmas Atribuídas ({teacherClasses.length})
                      </div>
                      <Button variant="outline" size="sm"
                        onClick={() => setShowAssignClasses(!showAssignClasses)}
                        className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white text-xs">
                        {showAssignClasses ? 'Fechar' : '+ Atribuir Turma'}
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teacherClasses.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                        <p className="text-sm text-slate-500">Nenhuma turma atribuída</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {teacherClasses.map(cls => (
                          <div key={cls.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200 hover:shadow-md transition-shadow">
                            <div>
                              <p className="font-semibold text-sm text-blue-800">{cls.name}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                {cls.code || cls.curso}
                                {cls.schedule && ` • ${getTurnoLabel(cls.schedule)}`}
                                {cls.students !== undefined && ` • ${cls.students} alunos`}
                                {cls.room && ` • Sala ${cls.room}`}
                              </p>
                            </div>
                            <Button variant="ghost" size="icon"
                              className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-700"
                              onClick={() => handleUnassignClass(cls.id)} title="Desatribuir turma">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {showAssignClasses && (
                      <div className="mt-4 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <p className="text-xs text-slate-600 font-semibold mb-3">
                          Turmas disponíveis (filtradas pelos cursos e turnos do docente):
                        </p>
                        {getAvailableToAssign().length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-4">
                            Nenhuma turma disponível para os cursos/turnos seleccionados
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto">
                            {getAvailableToAssign().map(cls => (
                              <button key={cls.id} type="button" onClick={() => handleAssignClass(cls.id)}
                                className="flex items-center justify-between p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-green-400 hover:bg-green-50 transition-all text-left">
                                <div>
                                  <p className="font-semibold text-sm text-slate-700">{cls.name}</p>
                                  <p className="text-xs text-slate-500">
                                    {cls.code || cls.curso}
                                    {cls.schedule && ` • ${getTurnoLabel(cls.schedule)}`}
                                  </p>
                                </div>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 3: HORÁRIO */}
              <TabsContent value="horario" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#004B87]">
                      <Calendar className="h-5 w-5" />
                      Horário Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-slate-100">
                            <th className="border p-2 text-xs font-semibold">Horário</th>
                            <th className="border p-2 text-xs font-semibold">Segunda</th>
                            <th className="border p-2 text-xs font-semibold">Terça</th>
                            <th className="border p-2 text-xs font-semibold">Quarta</th>
                            <th className="border p-2 text-xs font-semibold">Quinta</th>
                            <th className="border p-2 text-xs font-semibold">Sexta</th>
                            <th className="border p-2 text-xs font-semibold">Sábado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['08:00-10:00', '10:00-12:00', '14:00-16:00', '16:00-18:00'].map(time => (
                            <tr key={time}>
                              <td className="border p-2 text-xs font-medium bg-slate-50">{time}</td>
                              {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => {
                                const schedule = mockSchedule.find(s => s.day === day && s.time === time);
                                return (
                                  <td key={day} className={`border p-2 ${schedule?.conflict ? 'bg-red-100 border-2 border-red-500' : schedule ? 'bg-blue-50' : ''}`}>
                                    {schedule && (
                                      <div className="text-xs">
                                        <p className="font-semibold">{schedule.class}</p>
                                        <p className="text-slate-600">Sala {schedule.room}</p>
                                        {schedule.conflict && (
                                          <p className="text-red-600 font-bold mt-1">⚠️ CONFLITO</p>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {formData.hasScheduleConflict && (
                      <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-red-800">Conflitos de Horário Detectados</p>
                            <p className="text-xs text-red-700 mt-1">Este docente tem turmas no mesmo horário. Revise as atribuições.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 4: AVALIAÇÕES */}
              <TabsContent value="avaliacoes" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-green-500 to-green-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#004B87]">
                      <BarChart3 className="h-5 w-5" />
                      Progresso de Lançamento de Notas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mockGradesProgress.map((prog, idx) => (
                      <div key={idx} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">{prog.turma}</p>
                            <p className="text-xs text-slate-500">{prog.modulo}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Progresso Total</p>
                            <p className="text-lg font-bold text-green-600">
                              {Math.round((prog.teste + prog.trabalho + prog.exame) / 3)}%
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div className={`p-3 rounded-lg ${prog.teste === 100 ? 'bg-green-100' : prog.teste > 0 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                            <p className="text-xs text-slate-600 mb-1">Testes</p>
                            <p className={`text-xl font-bold ${prog.teste === 100 ? 'text-green-700' : prog.teste > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                              {prog.teste}%
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${prog.trabalho === 100 ? 'bg-green-100' : prog.trabalho > 0 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                            <p className="text-xs text-slate-600 mb-1">Trabalhos</p>
                            <p className={`text-xl font-bold ${prog.trabalho === 100 ? 'text-green-700' : prog.trabalho > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                              {prog.trabalho}%
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${prog.exame === 100 ? 'bg-green-100' : prog.exame > 0 ? 'bg-yellow-100' : 'bg-red-100'}`}>
                            <p className="text-xs text-slate-600 mb-1">Exames</p>
                            <p className={`text-xl font-bold ${prog.exame === 100 ? 'text-green-700' : prog.exame > 0 ? 'text-yellow-700' : 'text-red-700'}`}>
                              {prog.exame}%
                            </p>
                          </div>
                        </div>
                        {(prog.teste < 100 || prog.trabalho < 100 || prog.exame < 100) && (
                          <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 rounded text-xs text-red-700">
                            ⚠️ Notas pendentes neste módulo
                          </div>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 5: PRESENÇAS */}
              <TabsContent value="presencas" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#004B87]">
                      <ClipboardList className="h-5 w-5" />
                      Registro de Presenças
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockAttendance.map((att, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                        <div>
                          <p className="font-semibold text-sm">{att.turma}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <span className="flex items-center gap-1">
                              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                              {att.presencas} presenças
                            </span>
                            <span className="flex items-center gap-1">
                              <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                              {att.faltas} faltas
                            </span>
                            {att.pendencias > 0 && (
                              <span className="flex items-center gap-1 text-orange-600 font-semibold">
                                <AlertTriangle className="h-3 w-3" />
                                {att.pendencias} pendente(s)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">
                            {Math.round((att.presencas / (att.presencas + att.faltas)) * 100)}%
                          </p>
                          <p className="text-xs text-slate-500">Taxa presença</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 6: CONTRATO */}
              <TabsContent value="contrato" className="mt-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-0 shadow-lg">
                    <div className="h-1 bg-gradient-to-r from-orange-500 to-orange-600"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <FileText className="h-5 w-5" />
                        Informações do Contrato
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs text-slate-500">Tipo de Contrato</Label>
                        <p className="font-semibold">{getContractTypeLabel(formData.contractType)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Data de Início</Label>
                        <p className="font-semibold">{formatDate(formData.contractStartDate)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500">Data de Término</Label>
                        <p className="font-semibold">{formatDate(formData.contractEndDate)}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-slate-500 mb-2 block">Observações Administrativas</Label>
                        <textarea 
                          value={formData.administrativeNotes || "Sem observações"}
                          readOnly={!isEditing}
                          onChange={(e) => setFormData(prev => prev ? {...prev, administrativeNotes: e.target.value} : null)}
                          className={`w-full p-3 border-2 rounded-lg h-32 resize-none text-sm ${
                            !isEditing ? "bg-slate-50 border-slate-200" : "border-[#F5821F]"
                          }`}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#004B87]">
                          <FileText className="h-5 w-5" />
                          Documentos Anexados
                        </div>
                        <Button variant="outline" size="sm" className="text-xs">
                          <Upload className="h-3 w-3 mr-1" />
                          Carregar
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(!formData.documents || formData.documents.length === 0) ? (
                        <div className="text-center py-8">
                          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm text-slate-500">Nenhum documento anexado</p>
                        </div>
                      ) : (
                        formData.documents.map(doc => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{doc.name}</p>
                                <p className="text-xs text-slate-500">Carregado: {formatDate(doc.uploadDate)}</p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* TAB 7: HISTÓRICO */}
              <TabsContent value="historico" className="mt-0">
                <Card className="border-0 shadow-lg">
                  <div className="h-1 bg-gradient-to-r from-gray-500 to-gray-600"></div>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#004B87]">
                      <Activity className="h-5 w-5" />
                      Histórico de Atividades
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(!formData.activityLog || formData.activityLog.length === 0) ? (
                        <div className="text-center py-8">
                          <Activity className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                          <p className="text-sm text-slate-500">Nenhuma atividade registrada</p>
                        </div>
                      ) : (
                        formData.activityLog.map(log => (
                          <div key={log.id} className="flex items-start gap-3 p-3 border-l-4 border-blue-400 bg-blue-50 rounded">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-blue-900">{log.action}</p>
                              <p className="text-xs text-slate-600 mt-1">{log.details}</p>
                              <p className="text-xs text-slate-400 mt-1">{formatDate(log.date)}</p>
                            </div>
                          </div>
                        ))
                      )}
                      {/* Adicionar atividade exemplo se vazio */}
                      {!formData.activityLog && (
                        <>
                          <div className="flex items-start gap-3 p-3 border-l-4 border-green-400 bg-green-50 rounded">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-green-900">Login no sistema</p>
                              <p className="text-xs text-slate-600 mt-1">Acesso via web</p>
                              <p className="text-xs text-slate-400 mt-1">{getLastActivityLabel(formData.lastActivity)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 border-l-4 border-purple-400 bg-purple-50 rounded">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-purple-900">Perfil atualizado</p>
                              <p className="text-xs text-slate-600 mt-1">Informações pessoais modificadas</p>
                              <p className="text-xs text-slate-400 mt-1">Há 3 dias</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 border-l-4 border-blue-400 bg-blue-50 rounded">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-blue-900">Turma atribuída</p>
                              <p className="text-xs text-slate-600 mt-1">Atribuído à turma TI-2026</p>
                              <p className="text-xs text-slate-400 mt-1">Há 5 dias</p>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50/50 flex-shrink-0">
          {isEditing ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                className="h-10 px-6 border-2 border-slate-300 hover:bg-slate-100"
              >
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                className="h-10 px-6 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md"
              >
                <Save className="h-4 w-4 mr-2" /> Guardar
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="h-10 px-6 border-2 border-slate-300 hover:bg-slate-100"
              >
                Fechar
              </Button>
              {onSave && (
                <Button 
                  onClick={handleEdit}
                  className="h-10 px-6 bg-gradient-to-r from-[#004B87] to-[#0066B3] hover:from-[#003868] hover:to-[#005099] text-white shadow-md"
                >
                  <Edit className="h-4 w-4 mr-2" /> Editar
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}