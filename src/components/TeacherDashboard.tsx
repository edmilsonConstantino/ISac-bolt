
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Users, 
  FileText, 
  Upload, 
  Calendar,
  LogOut,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Bell,
  Plus,
  CheckSquare,
  TrendingUp
} from "lucide-react";


import { ClassList } from "./shared/ClassList";
import { StudentList } from "./shared/StudentList";
import { ClassModal } from "./shared/ClassModal";
import { StudentModal } from "./shared/StudentModal";
import { CreateAssignmentModal } from "./shared/CreateAssignmentModal";
import { AttendanceModal } from "./shared/AttendanceModal";
import { AnnouncementModal } from "./shared/AnnouncementModal";
import { UploadMaterialModal } from "./shared/UploadMaterialModal";
import { GradeManagementModal } from "./shared/GradeManagementModal";


import { useClassData, useStudentData, useAssignmentData } from "../hooks/useData";
import { Class, Student, Permission } from "../types";

interface TeacherDashboardProps {
  onLogout?: () => void;
}

export function TeacherDashboard({ onLogout }: TeacherDashboardProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const displayName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : 'Docente';
  const teacherId = user?.id ?? 0;

  // Hooks de dados
  const { classes, addClass, updateClass } = useClassData();
  const { students, getStudentsByClass } = useStudentData();
  const { assignments, addAssignment } = useAssignmentData();


  const [studentModal, setStudentModal] = useState({
    isOpen: false,
    className: "",
    classId: 0,
    students: [] as Student[]
  });

  const [classModal, setClassModal] = useState({
    isOpen: false,
    classData: null as Class | null,
    isCreating: false
  });

 
  const [createAssignmentModal, setCreateAssignmentModal] = useState(false);
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [uploadMaterialModal, setUploadMaterialModal] = useState(false);

  // Estado para o modal de notas
  const [gradeModal, setGradeModal] = useState({
    isOpen: false,
    classData: null as Class | null,
    students: [] as Student[]
  });

  // Permitoes do professor (modificado: não pode criar turmas)
  const teacherPermissions: Permission = {
    canEdit: true,
    canDelete: false,
    canAdd: true, 
    canViewDetails: true
  };


  const classPermissions: Permission = {
    canEdit: true,
    canDelete: false,
    canAdd: false, 
    canViewDetails: true
  };

  // Estatísticas do dashboard
  const dashboardStats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, c) => sum + c.students, 0),
    pendingAssignments: assignments.reduce((sum, a) => sum + (a.total - a.submissions), 0),
    nextClass: "Business English"
  };

  // Funções para os modais existentes
  const handleViewStudents = (classItem: Class) => {
    const classStudents = getStudentsByClass(classItem.id);
    setStudentModal({
      isOpen: true,
      className: classItem.name,
      classId: classItem.id,
      students: classStudents
    });
  };

  const handleManageClass = (classItem: Class) => {
    setClassModal({
      isOpen: true,
      classData: classItem,
      isCreating: false
    });
  };

  // Função para adicionar estudante à turma específica
  const handleAddStudentToClass = (classItem: Class) => {
    // Implementar modal para adicionar estudante à turma específica
    console.log("Adicionando estudante à turma:", classItem.name);
  };

  const handleSaveClass = (classData: Partial<Class>) => {
    if (classModal.classData?.id) {
      updateClass(classModal.classData.id, classData);
    }
  };

  // Função para lançar notas
  const handleLaunchGrades = (classItem: Class) => {
    const classStudents = getStudentsByClass(classItem.id);
    setGradeModal({
      isOpen: true,
      classData: classItem,
      students: classStudents
    });
  };

  // Função para salvar notas
  const handleSaveGrades = (gradeData: any) => {
    console.log("Notas salvas:", gradeData);
  };

  const handleSendEmailToAll = () => {
    console.log("Enviando email para todos os estudantes");
  };

  const handleChatWithStudent = (student: Student) => {
    console.log("Iniciando conversa com:", student.name);
  };

  const handleViewStudentProfile = (student: Student) => {
    console.log("Visualizando perfil de:", student.name);
  };

  // Funções para as ações rápidas (removidas: gradeAssignments, scheduleClass, viewReports)
  const handleCreateAssignment = (assignmentData: any) => {
    addAssignment(assignmentData);
    console.log("Nova atividade criada:", assignmentData);
  };

  const handleSaveAttendance = (attendanceData: any) => {
    console.log("Presença salva:", attendanceData);
  };

  const handleCreateAnnouncement = (announcementData: any) => {
    console.log("Novo aviso criado:", announcementData);
  };

  const handleUploadMaterial = (materialData: any) => {
    console.log("Material enviado:", materialData);
  };

  const handleMessageStudents = () => {
    console.log("Abrindo sistema de mensagens");
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">M007 Oxford</h1>
                <p className="text-sm text-muted-foreground">Portal do Docente</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium">{displayName}</p>
                <p className="text-sm text-muted-foreground">Docente</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  try {
                    await logout();
                    if (onLogout) onLogout();
                  } catch (e) {
                    console.error('Logout falhou', e);
                  }
                }}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Bem-vindo, {displayName}!</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-oxford-gold" />
              <span className="font-medium">{dashboardStats.totalClasses} Turmas Ativas</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-medium">{dashboardStats.totalStudents} Estudantes</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Turmas</span>
            </TabsTrigger>
            <TabsTrigger value="students" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Estudantes</span>
            </TabsTrigger>
            <TabsTrigger value="assignments" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Trabalhos</span>
            </TabsTrigger>
            <TabsTrigger value="materials" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Materiais</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Turmas Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">{dashboardStats.totalClasses}</div>
                  <p className="text-sm text-muted-foreground">Turmas sendo lecionadas</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5 text-oxford-gold" />
                    Total Estudantes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-oxford-gold">{dashboardStats.totalStudents}</div>
                  <p className="text-sm text-muted-foreground">Estudantes matriculados</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-warning" />
                    Trabalhos Criados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-warning">{assignments.length}</div>
                  <p className="text-sm text-muted-foreground">Total de trabalhos</p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-success" />
                    Próxima Aula
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{dashboardStats.nextClass}</div>
                  <p className="text-sm text-muted-foreground">Segunda, 14:00</p>
                </CardContent>
              </Card>
            </div>

            {}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Resumo Semanal */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Resumo da Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Aulas ministradas</span>
                      <span className="font-semibold text-primary">12</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Trabalhos criados</span>
                      <span className="font-semibold text-green-600">8</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Presença média</span>
                      <span className="font-semibold text-blue-600">92%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Materiais enviados</span>
                      <span className="font-semibold text-oxford-gold">5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ações Rápidas - Removidas: Corrigir, Agendar Aula, Relatórios */}
              <Card className="shadow-elegant">
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>Tarefas frequentes do dia a dia</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setCreateAssignmentModal(true)}
                    >
                      <Plus className="h-5 w-5 text-primary" />
                      <span className="text-xs">Criar Trabalho</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setAttendanceModal(true)}
                    >
                      <CheckSquare className="h-5 w-5 text-green-600" />
                      <span className="text-xs">Marcar Presença</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setAnnouncementModal(true)}
                    >
                      <Bell className="h-5 w-5 text-oxford-gold" />
                      <span className="text-xs">Criar Aviso</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={() => setUploadMaterialModal(true)}
                    >
                      <Upload className="h-5 w-5 text-blue-600" />
                      <span className="text-xs">Upload Material</span>
                    </Button>

                    {/* <Button 
                      variant="outline" 
                      className="h-auto p-3 flex flex-col items-center gap-2"
                      onClick={handleMessageStudents}
                    >
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <span className="text-xs">Mensagens</span>
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Próximas Aulas */}
            <Card className="shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Próximas Aulas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Business English - A2</div>
                        <div className="text-sm text-muted-foreground">Segunda-feira, 14:00 - 15:30</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Sala 105</div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Conversation - B1</div>
                        <div className="text-sm text-muted-foreground">Terça-feira, 16:00 - 17:30</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Sala 203</div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <div>
                        <div className="font-medium">Advanced Grammar - C1</div>
                        <div className="text-sm text-muted-foreground">Sexta-feira, 10:00 - 12:00</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">Sala 301</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <ClassList
              classes={classes}
              permissions={classPermissions}
              currentUserRole="teacher"
              onViewStudents={handleViewStudents}
              onManageClass={handleManageClass}
              onCreateClass={() => {}}
              onLaunchGrades={handleLaunchGrades}
              onDeleteClass={() => {}}
              onAddStudentToClass={handleAddStudentToClass}
            />
          </TabsContent>

          <TabsContent value="students" className="space-y-6">
            <StudentList
              students={students}
              permissions={teacherPermissions}
              currentUserRole="teacher"
              showClassInfo={true}
              onSendEmailToAll={handleSendEmailToAll}
            />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Trabalhos e Atividades</h3>
              <Button variant="oxford" onClick={() => setCreateAssignmentModal(true)}>
                <FileText className="h-4 w-4 mr-2" />
                Criar Trabalho
              </Button>
            </div>

            <div className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="shadow-elegant">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>{assignment.class}</CardDescription>
                      </div>
                      <Badge variant="outline">
                        Prazo: {new Date(assignment.dueDate).toLocaleDateString('pt-BR')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">
                            {assignment.submissions}
                          </div>
                          <div className="text-xs text-muted-foreground">Entregues</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-muted-foreground">
                            {assignment.total}
                          </div>
                          <div className="text-xs text-muted-foreground">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-warning">
                            {assignment.total - assignment.submissions}
                          </div>
                          <div className="text-xs text-muted-foreground">Pendentes</div>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Button variant="outline" size="sm">
                          Ver Entregas
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="materials" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Materiais de Ensino</h3>
              <Button variant="oxford" onClick={() => setUploadMaterialModal(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="shadow-elegant border-dashed border-2 border-muted-foreground/25 hover:border-primary transition-colors cursor-pointer" onClick={() => setUploadMaterialModal(true)}>
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload de Áudio</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Envie arquivos de áudio para suas turmas
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant border-dashed border-2 border-muted-foreground/25 hover:border-primary transition-colors cursor-pointer" onClick={() => setUploadMaterialModal(true)}>
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload de Vídeo</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Envie vídeos educativos
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-elegant border-dashed border-2 border-muted-foreground/25 hover:border-primary transition-colors cursor-pointer" onClick={() => setUploadMaterialModal(true)}>
                <CardContent className="flex flex-col items-center justify-center h-40">
                  <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">Upload de Documentos</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    PDFs, exercícios e materiais escritos
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modais */}
      <StudentModal
        isOpen={studentModal.isOpen}
        onClose={() => setStudentModal({ ...studentModal, isOpen: false })}
        students={studentModal.students}
        className={studentModal.className}
        classId={studentModal.classId}
        permissions={teacherPermissions}
        currentUserRole="teacher"
        onSendEmailToAll={handleSendEmailToAll}
        onChatWithStudent={handleChatWithStudent}
        onViewStudentProfile={handleViewStudentProfile}
      />

      <ClassModal
        isOpen={classModal.isOpen}
        onClose={() => setClassModal({ ...classModal, isOpen: false })}
        classData={classModal.classData}
        permissions={teacherPermissions}
        currentUserRole="teacher"
        onSave={handleSaveClass}
        isCreating={false} // Professor nunca pode criar turmas
      />

        <CreateAssignmentModal
        isOpen={createAssignmentModal}
        onClose={() => setCreateAssignmentModal(false)}
        onSave={handleCreateAssignment}
        availableClasses={classes}
          teacherId={teacherId}
      />

      <AttendanceModal
        isOpen={attendanceModal}
        onClose={() => setAttendanceModal(false)}
        onSave={handleSaveAttendance}
        availableClasses={classes}
        getStudentsByClass={getStudentsByClass}
      />

  <AnnouncementModal
        isOpen={announcementModal}
        onClose={() => setAnnouncementModal(false)}
        onSave={handleCreateAnnouncement}
        availableClasses={classes}
  teacherId={teacherId}
      />

      <UploadMaterialModal
        isOpen={uploadMaterialModal}
        onClose={() => setUploadMaterialModal(false)}
        onSave={handleUploadMaterial}
        availableClasses={classes}
        teacherId={teacherId}
      />

      {gradeModal.classData && (
        <GradeManagementModal
          isOpen={gradeModal.isOpen}
          onClose={() => setGradeModal({ ...gradeModal, isOpen: false })}
          onSave={handleSaveGrades}
          classData={gradeModal.classData}
          students={gradeModal.students}
        />
      )}
    </div>
  );
}