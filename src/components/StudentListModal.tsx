// src/components/shared/StudentListModal.tsx - ✅ COM DADOS REAIS DA API
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  MessageSquare,
  Loader2,
  Settings,
  CheckCircle,
  Pause,
  Lock,
  Ban
} from "lucide-react";
import studentService from "@/services/studentService";
import { toast } from "sonner";
import { RegistrationSettingsModal } from "./shared/RegistrationSettingsModal";
import { cn } from "@/lib/utils";

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  enrollmentDate: string;
  grade?: number;
  status: "active" | "inactive";
  registration_status?: 'ativo' | 'suspenso' | 'trancado' | 'cancelado';
  attendance?: number;
  className?: string;
  username?: string;
  bi_number?: string;
  course_name?: string;
}

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  className: string;
  classId: number;
}

export function StudentListModal({ isOpen, onClose, className, classId }: StudentListModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsModal, setSettingsModal] = useState<{ isOpen: boolean; student: Student | null }>({
    isOpen: false,
    student: null
  });

  // ✅ Carregar estudantes reais quando o modal abrir
  useEffect(() => {
    if (isOpen && classId) {
      loadStudents();
    }
  }, [isOpen, classId]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      console.log('📚 Carregando estudantes da turma:', classId);

      // Buscar todos os estudantes
      const allStudents: any[] = await studentService.getAll();

      // Filtrar estudantes da turma específica
      const classStudents = allStudents.filter((student: any) =>
        student.turma_id === classId
      );

      // Mapear para o formato do componente
      const mappedStudents: Student[] = classStudents.map((student: any) => ({
        id: student.id,
        name: student.nome || student.name,
        email: student.email,
        phone: student.telefone || student.phone || 'Não informado',
        enrollmentDate: student.data_matricula || student.enrollment_date || new Date().toISOString(),
        grade: student.media_geral || 0,
        status: student.status === 'ativo' ? 'active' : 'inactive',
        registration_status: student.registration_status || (student.status === 'ativo' ? 'ativo' : 'inativo'),
        attendance: student.percentual_presenca || 0,
        className: className,
        username: student.username,
        bi_number: student.bi_number || student.numero_bi,
        course_name: student.curso_nome || student.course_name
      }));

      setStudents(mappedStudents);
      console.log('✅ Estudantes carregados:', mappedStudents.length);

    } catch (error) {
      console.error('❌ Erro ao carregar estudantes:', error);
      toast.error('Erro ao carregar estudantes da turma');
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceColor = (attendance: number = 0) => {
    if (attendance >= 90) return "text-green-600";
    if (attendance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: number = 0) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  // Get registration status badge info
  const getRegistrationStatusInfo = (status: string | undefined) => {
    const map: Record<string, { label: string; color: string; bg: string; icon: any }> = {
      ativo: { label: 'Activo', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      active: { label: 'Activo', color: 'text-green-700', bg: 'bg-green-100', icon: CheckCircle },
      suspenso: { label: 'Suspenso', color: 'text-yellow-700', bg: 'bg-yellow-100', icon: Pause },
      trancado: { label: 'Trancado', color: 'text-blue-700', bg: 'bg-blue-100', icon: Lock },
      cancelado: { label: 'Cancelado', color: 'text-red-700', bg: 'bg-red-100', icon: Ban },
      inactive: { label: 'Inactivo', color: 'text-slate-700', bg: 'bg-slate-100', icon: Ban },
    };
    return map[status || 'ativo'] || map.ativo;
  };

  const handleSendEmailToAll = () => {
    const activeStudents = students.filter(s => s.status === "active");
    const emails = activeStudents.map(s => s.email).join(', ');
    
    if (activeStudents.length === 0) {
      toast.error('Nenhum estudante ativo para enviar email');
      return;
    }
    
    // Abrir cliente de email padrão
    window.location.href = `mailto:${emails}?subject=Comunicado - ${className}`;
    toast.success(`Preparando email para ${activeStudents.length} estudantes`);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estudantes - {className}
          </DialogTitle>
          <DialogDescription>
            Lista completa dos estudantes matriculados nesta turma
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Carregando estudantes...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header com Stats */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Total: {students.length} estudantes
                </div>
                <div className="text-sm text-muted-foreground">
                  Ativos: {students.filter(s => s.status === "active").length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Inativos: {students.filter(s => s.status === "inactive").length}
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSendEmailToAll}
                disabled={students.filter(s => s.status === "active").length === 0}
              >
                <Mail className="h-4 w-4 mr-2" />
                Enviar Email para Todos
              </Button>
            </div>

            {/* Lista de Estudantes */}
            {students.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Nenhum estudante encontrado</h3>
                  <p className="text-sm text-muted-foreground">
                    Esta turma ainda não possui estudantes matriculados.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {students.map((student) => (
                  <Card key={student.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{student.name}</h3>
                              <Badge variant={student.status === "active" ? "default" : "destructive"}>
                                {student.status === "active" ? "Ativo" : "Inativo"}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {student.email}
                              </div>
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {student.phone}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Matrícula: {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          {/* Média */}
                          {student.grade !== undefined && student.grade > 0 && (
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getGradeColor(student.grade)}`}>
                                {student.grade.toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">Média</div>
                            </div>
                          )}
                          
                          {/* Presença */}
                          {student.attendance !== undefined && student.attendance > 0 && (
                            <div className="text-center">
                              <div className={`text-lg font-bold ${getAttendanceColor(student.attendance)}`}>
                                {student.attendance}%
                              </div>
                              <div className="text-xs text-muted-foreground">Presença</div>
                            </div>
                          )}
                          
                          {/* Ações */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.location.href = `mailto:${student.email}`}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Conversar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Ver perfil do estudante:', student.id);
                                toast.info('Funcionalidade em desenvolvimento');
                              }}
                            >
                              <BookOpen className="h-4 w-4 mr-1" />
                              Perfil
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSettingsModal({ isOpen: true, student })}
                              className="border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white"
                              title="Configurações da Matrícula"
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Modal de Configurações da Matrícula */}
    <RegistrationSettingsModal
      isOpen={settingsModal.isOpen}
      onClose={() => setSettingsModal({ isOpen: false, student: null })}
      student={settingsModal.student ? {
        id: settingsModal.student.id,
        name: settingsModal.student.name,
        email: settingsModal.student.email,
        phone: settingsModal.student.phone,
        username: settingsModal.student.username,
        bi_number: settingsModal.student.bi_number,
        status: settingsModal.student.status === 'active' ? 'ativo' : 'inativo',
        registration_status: settingsModal.student.registration_status,
        enrollment_date: settingsModal.student.enrollmentDate,
        course_name: settingsModal.student.course_name,
        class_name: settingsModal.student.className
      } : null}
      onStatusChanged={() => {
        loadStudents();
        setSettingsModal({ isOpen: false, student: null });
      }}
    />
    </>
  );
}