// src/components/shared/StudentModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Star,
  X,
  Download,
  FileText
} from "lucide-react";
import { Student, Permission } from "../../types";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  className: string;
  classId: number;
  permissions: Permission;
  currentUserRole: 'teacher' | 'admin';
  onSendEmailToAll?: () => void;
  onChatWithStudent?: (student: Student) => void;
  onViewStudentProfile?: (student: Student) => void;
}

export function StudentModal({ 
  isOpen, 
  onClose, 
  students, 
  className, 
  classId,
  permissions,
  currentUserRole,
  onSendEmailToAll,
  onChatWithStudent,
  onViewStudentProfile
}: StudentModalProps) {
  
  const getAttendanceColor = (attendance?: number) => {
    if (!attendance) return "text-muted-foreground";
    if (attendance >= 90) return "text-green-600";
    if (attendance >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return "text-green-600";
    if (grade >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const activeStudents = students.filter(s => s.status === "active");
  const inactiveStudents = students.filter(s => s.status === "inactive");
  
  const averageGrade = students.length > 0 
    ? (students.reduce((sum, s) => sum + s.grade, 0) / students.length).toFixed(1)
    : "0.0";

  const averageAttendance = students.length > 0 
    ? Math.round(students.reduce((sum, s) => sum + (s.attendance || 0), 0) / students.length)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Estudantes - {className}
              </DialogTitle>
              <DialogDescription>
                Lista completa dos estudantes matriculados nesta turma
              </DialogDescription>
            </div>
            {/* <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button> */}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Stats Header */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-muted/20 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{students.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{activeStudents.length}</div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{inactiveStudents.length}</div>
              <div className="text-sm text-muted-foreground">Inativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-oxford-gold">{averageGrade}</div>
              <div className="text-sm text-muted-foreground">Média Geral</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{averageAttendance}%</div>
              <div className="text-sm text-muted-foreground">Presença Média</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {onSendEmailToAll && students.length > 0 && (
                <Button variant="outline" onClick={onSendEmailToAll}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email para Todos
                </Button>
              )}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar Lista
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Exibindo {students.length} estudantes
            </div>
          </div>

          {/* Students List */}
          {students.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-40">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Nenhum estudante encontrado</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Não há estudantes matriculados nesta turma ainda.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Active Students */}
              {activeStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                    Estudantes Ativos ({activeStudents.length})
                  </h3>
                  <div className="space-y-3">
                    {activeStudents.map((student) => (
                      <Card key={student.id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{student.name}</h4>
                                  <Badge variant="default" className="bg-green-100 text-green-800">
                                    Ativo
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {student.email}
                                  </div>
                                  {student.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {student.phone}
                                    </div>
                                  )}
                                  {student.enrollmentDate && (
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Matrícula: {new Date(student.enrollmentDate).toLocaleDateString('pt-BR')}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getGradeColor(student.grade)}`}>
                                  {student.grade}
                                </div>
                                <div className="text-xs text-muted-foreground">Média</div>
                              </div>
                              
                              {student.attendance && (
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getAttendanceColor(student.attendance)}`}>
                                    {student.attendance}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">Presença</div>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                {currentUserRole === 'teacher' && onChatWithStudent && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onChatWithStudent(student)}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    Conversar
                                  </Button>
                                )}
                                {permissions.canViewDetails && onViewStudentProfile && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onViewStudentProfile(student)}
                                    
                                  >
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    Perfil
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Inactive Students */}
              {inactiveStudents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                    Estudantes Inativos ({inactiveStudents.length})
                  </h3>
                  <div className="space-y-3">
                    {inactiveStudents.map((student) => (
                      <Card key={student.id} className="shadow-sm opacity-75">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-muted/50 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold text-muted-foreground">{student.name}</h4>
                                  <Badge variant="destructive">
                                    Inativo
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {student.email}
                                  </div>
                                  {student.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {student.phone}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-6">
                              <div className="text-center">
                                <div className={`text-lg font-bold ${getGradeColor(student.grade)}`}>
                                  {student.grade}
                                </div>
                                <div className="text-xs text-muted-foreground">Média</div>
                              </div>
                              
                              {student.attendance && (
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${getAttendanceColor(student.attendance)}`}>
                                    {student.attendance}%
                                  </div>
                                  <div className="text-xs text-muted-foreground">Presença</div>
                                </div>
                              )}
                              
                              <div className="flex gap-2">
                                {permissions.canViewDetails && onViewStudentProfile && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => onViewStudentProfile(student)}
                                  >
                                    <BookOpen className="h-4 w-4 mr-1" />
                                    Perfil
                                  </Button>
                                )}
                                {currentUserRole === 'admin' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-green-600 hover:text-green-600"
                                  >
                                    Reativar
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions Footer */}
          {students.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {permissions.canAdd && (
                    <Button variant="outline" size="sm">
                      <Users className="h-4 w-4 mr-2" />
                      Adicionar Estudante
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Lista
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4 mr-2" />
                    Relatório de Notas
                  </Button>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Relatório de Presença
                  </Button>
                  {onSendEmailToAll && (
                    <Button variant="outline" size="sm" onClick={onSendEmailToAll}>
                      <Mail className="h-4 w-4 mr-2" />
                      Email em Grupo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}