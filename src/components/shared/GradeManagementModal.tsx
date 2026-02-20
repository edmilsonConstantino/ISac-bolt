// src/components/shared/GradeManagementModal.tsx
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GraduationCap,
  Save,
  Users,
  Calculator,
  BookOpen,
  MessageSquare,
  Ear,
  PenTool,
  Eye,
  Star,
  TrendingUp,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRightCircle
} from "lucide-react";
import { Student, Class } from "../../types";
import gradeService from "@/services/gradeService";
import { toast } from "sonner";

interface StudentGrade {
  studentId: number;
  studentName: string;
  // Habilidades principais de inglês
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  grammar: number;
  vocabulary: number;
  pronunciation: number;
  // Avaliações específicas
  participation: number;
  homework: number;
  tests: number;
  projects: number;
  // Observações
  strengths: string;
  weaknesses: string;
  recommendations: string;
  // Nota final calculada
  finalGrade: number;
}

interface GradeManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (gradeData: { classId: number; period: string; grades: StudentGrade[] }) => void;
  classData: Class;
  students: Student[];
}

// Period key → numeric period_number for API
const PERIOD_NUMBER: Record<string, number> = {
  bimestre1: 1,
  bimestre2: 2,
  bimestre3: 3,
  bimestre4: 4,
  final:     5,
};

export function GradeManagementModal({
  isOpen,
  onClose,
  onSave,
  classData,
  students
}: GradeManagementModalProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('bimestre1');
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [isSaving, setIsSaving]   = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const periods = [
    { value: 'bimestre1', label: '1st Period' },
    { value: 'bimestre2', label: '2nd Period' },
    { value: 'bimestre3', label: '3rd Period' },
    { value: 'bimestre4', label: '4th Period' },
    { value: 'final',     label: 'Final Evaluation' }
  ];

  const skillsConfig = [
    { key: 'listening', label: 'Listening', icon: Ear, color: 'text-blue-600' },
    { key: 'speaking', label: 'Speaking', icon: MessageSquare, color: 'text-green-600' }, // ✅ Corrigido
    { key: 'reading', label: 'Reading', icon: Eye, color: 'text-purple-600' },
    { key: 'writing', label: 'Writing', icon: PenTool, color: 'text-orange-600' },
    { key: 'grammar', label: 'Grammar', icon: BookOpen, color: 'text-indigo-600' },
    { key: 'vocabulary', label: 'Vocabulary', icon: FileText, color: 'text-red-600' }
  ];

  const assessmentConfig = [
    { key: 'participation', label: 'Participação', weight: 20 },
    { key: 'homework', label: 'Lição de Casa', weight: 20 },
    { key: 'tests', label: 'Provas', weight: 40 },
    { key: 'projects', label: 'Projetos', weight: 20 }
  ];

  // Load grades from backend when modal opens or period changes
  useEffect(() => {
    if (!isOpen || !classData?.id || students.length === 0) return;

    const periodNum = PERIOD_NUMBER[selectedPeriod] ?? 1;
    setIsLoading(true);

    gradeService
      .getByClass(classData.id, periodNum)
      .then((apiGrades) => {
        setGrades(
          students.map((student) => {
            const api = apiGrades.find((g) => g.student_id === student.id);
            return {
              studentId:       student.id,
              studentName:     student.name,
              listening:       Number(api?.grade_listening     ?? 0),
              speaking:        Number(api?.grade_speaking      ?? 0),
              reading:         Number(api?.grade_reading       ?? 0),
              writing:         Number(api?.grade_writing       ?? 0),
              grammar:         Number(api?.grade_grammar       ?? 0),
              vocabulary:      Number(api?.grade_vocabulary    ?? 0),
              pronunciation:   Number(api?.grade_pronunciation ?? 0),
              participation:   Number(api?.grade_participation ?? 0),
              homework:        Number(api?.grade_homework      ?? 0),
              tests:           Number(api?.grade_tests         ?? 0),
              projects:        Number(api?.grade_projects      ?? 0),
              strengths:       api?.strengths       ?? '',
              weaknesses:      api?.improvements    ?? '',
              recommendations: api?.recommendations ?? '',
              finalGrade:      Number(api?.final_grade         ?? 0),
            };
          })
        );
      })
      .catch(() => {
        // Fallback: blank grades
        setGrades(
          students.map((student) => ({
            studentId: student.id, studentName: student.name,
            listening: 0, speaking: 0, reading: 0, writing: 0,
            grammar: 0, vocabulary: 0, pronunciation: 0,
            participation: 0, homework: 0, tests: 0, projects: 0,
            strengths: '', weaknesses: '', recommendations: '', finalGrade: 0,
          }))
        );
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, selectedPeriod, students, classData?.id]);

  const updateGrade = (studentId: number, field: keyof StudentGrade, value: number | string) => {
    setGrades(prev => prev.map(grade => {
      if (grade.studentId === studentId) {
        const updated = { ...grade, [field]: value };
        
        // Recalculate final grade if it's a numeric field
        if (typeof value === 'number') {
          updated.finalGrade = calculateFinalGrade(updated);
        }
        
        return updated;
      }
      return grade;
    }));
  };

  const calculateFinalGrade = (grade: StudentGrade): number => {
    // Calculate skills average (40% of final grade)
    const skillsAverage = (
      grade.listening + grade.speaking + grade.reading + 
      grade.writing + grade.grammar + grade.vocabulary + grade.pronunciation
    ) / 7;
    
    // Calculate assessments weighted average (60% of final grade)
    const assessmentAverage = (
      (grade.participation * 0.2) + 
      (grade.homework * 0.2) + 
      (grade.tests * 0.4) + 
      (grade.projects * 0.2)
    );
    
    // Final grade: 40% skills + 60% assessments
    return Number(((skillsAverage * 0.4) + (assessmentAverage * 0.6)).toFixed(1));
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 9) return 'text-green-600';
    if (grade >= 7) return 'text-yellow-600';
    if (grade >= 5) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeStatus = (grade: number) => {
    if (grade >= 7) return { label: 'Aprovado', color: 'bg-green-100 text-green-800' };
    if (grade >= 5) return { label: 'Recuperação', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Reprovado', color: 'bg-red-100 text-red-800' };
  };

  const handleSave = useCallback(async () => {
    if (!classData?.id) return;
    const periodNum = PERIOD_NUMBER[selectedPeriod] ?? 1;
    setIsSaving(true);
    try {
      await Promise.all(
        grades.map((grade) =>
          gradeService.save({
            class_id:            classData.id,
            student_id:          grade.studentId,
            period_number:       periodNum,
            grade_participation: grade.participation,
            grade_homework:      grade.homework,
            grade_tests:         grade.tests,
            grade_projects:      grade.projects,
            grade_listening:     grade.listening,
            grade_speaking:      grade.speaking,
            grade_reading:       grade.reading,
            grade_writing:       grade.writing,
            grade_grammar:       grade.grammar,
            grade_vocabulary:    grade.vocabulary,
            grade_pronunciation: grade.pronunciation,
            strengths:           grade.strengths       || null,
            improvements:        grade.weaknesses      || null,
            recommendations:     grade.recommendations || null,
          })
        )
      );
      toast.success('Grades saved successfully!');
      onSave({ classId: classData.id, period: selectedPeriod, grades });
    } catch (err: any) {
      toast.error(err.message || 'Error saving grades');
    } finally {
      setIsSaving(false);
    }
  }, [grades, classData, selectedPeriod, onSave]);

  const handleFinalizeLevel = useCallback(async (studentId: number, studentName: string) => {
    if (!classData?.id) return;
    setIsFinalizing(true);
    try {
      const result = await gradeService.finalizeLevel(classData.id, studentId);
      toast.success(
        `Level finalized for ${studentName}! Final: ${result.final_grade} — ${result.level_status.replace('_', ' ')}`
      );
    } catch (err: any) {
      toast.error(err.message || 'Error finalizing level');
    } finally {
      setIsFinalizing(false);
    }
  }, [classData]);

  const handleClose = () => {
    setGrades([]);
    setSelectedStudent(null);
    onClose();
  };

  const classAverage = grades.length > 0 
    ? (grades.reduce((sum, g) => sum + g.finalGrade, 0) / grades.length).toFixed(1)
    : '0.0';

  const selectedStudentGrade = selectedStudent 
    ? grades.find(g => g.studentId === selectedStudent)
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Lançar Notas - {classData.name}
              </DialogTitle>
              <DialogDescription>
                Gerencie as notas e avaliações dos estudantes da turma
              </DialogDescription>
            </div>
     
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Loading overlay */}
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading grades…</span>
            </div>
          )}

          {/* Period selector */}
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <Label>Período Avaliativo</Label>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-48 p-2 border rounded-md"
              >
                {periods.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-6 ml-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{students.length}</div>
                <div className="text-sm text-muted-foreground">Estudantes</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getGradeColor(Number(classAverage))}`}>
                  {classAverage}
                </div>
                <div className="text-sm text-muted-foreground">Média da Turma</div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="individual">Avaliação Individual</TabsTrigger>
              <TabsTrigger value="skills">Habilidades</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            {/* Visão Geral */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4">
                {grades.map((grade) => {
                  const status = getGradeStatus(grade.finalGrade);
                  return (
                    <Card key={grade.studentId} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{grade.studentName}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={status.color}>
                                  {status.label}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {/* Quick Grade Inputs */}
                            <div className="grid grid-cols-4 gap-2 text-center">
                              <div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={grade.tests}
                                  onChange={(e) => updateGrade(grade.studentId, 'tests', Number(e.target.value))}
                                  className="w-16 h-8 text-center text-sm"
                                />
                                <div className="text-xs text-muted-foreground mt-1">Provas</div>
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={grade.participation}
                                  onChange={(e) => updateGrade(grade.studentId, 'participation', Number(e.target.value))}
                                  className="w-16 h-8 text-center text-sm"
                                />
                                <div className="text-xs text-muted-foreground mt-1">Particip.</div>
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={grade.homework}
                                  onChange={(e) => updateGrade(grade.studentId, 'homework', Number(e.target.value))}
                                  className="w-16 h-8 text-center text-sm"
                                />
                                <div className="text-xs text-muted-foreground mt-1">Lição</div>
                              </div>
                              <div>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={grade.projects}
                                  onChange={(e) => updateGrade(grade.studentId, 'projects', Number(e.target.value))}
                                  className="w-16 h-8 text-center text-sm"
                                />
                                <div className="text-xs text-muted-foreground mt-1">Projetos</div>
                              </div>
                            </div>

                            <div className="text-center ml-4">
                              <div className={`text-2xl font-bold ${getGradeColor(grade.finalGrade)}`}>
                                {grade.finalGrade.toFixed(1)}
                              </div>
                              <div className="text-xs text-muted-foreground">Média Final</div>
                            </div>

                            <div className="flex flex-col gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedStudent(grade.studentId)}
                              >
                                Detalhes
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 text-xs"
                                disabled={isFinalizing}
                                onClick={() => handleFinalizeLevel(grade.studentId, grade.studentName)}
                              >
                                {isFinalizing
                                  ? <Loader2 className="h-3 w-3 animate-spin" />
                                  : <><ArrowRightCircle className="h-3 w-3 mr-1" />Finalize Level</>
                                }
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Avaliação Individual */}
            <TabsContent value="individual" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Lista de Estudantes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Selecionar Estudante</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="space-y-1">
                      {grades.map((grade) => (
                        <button
                          key={grade.studentId}
                          onClick={() => setSelectedStudent(grade.studentId)}
                          className={`w-full p-3 text-left hover:bg-muted/50 transition-colors ${
                            selectedStudent === grade.studentId ? 'bg-primary/10 border-r-2 border-primary' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{grade.studentName}</span>
                            <span className={`text-sm font-semibold ${getGradeColor(grade.finalGrade)}`}>
                              {grade.finalGrade.toFixed(1)}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Detalhes do Estudante Selecionado */}
                {selectedStudentGrade && (
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {selectedStudentGrade.studentName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Habilidades de Inglês */}
                        <div>
                          <h4 className="font-semibold mb-3">Habilidades de Inglês</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {skillsConfig.map((skill) => {
                              const IconComponent = skill.icon;
                              return (
                                <div key={skill.key} className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <IconComponent className={`h-4 w-4 ${skill.color}`} />
                                    {skill.label}
                                  </Label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={selectedStudentGrade[skill.key as keyof StudentGrade] as number}
                                    onChange={(e) => updateGrade(selectedStudentGrade.studentId, skill.key as keyof StudentGrade, Number(e.target.value))}
                                    className="text-center"
                                  />
                                </div>
                              );
                            })}
                            <div className="space-y-2">
                              <Label className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-pink-600" /> {/* ✅ Corrigido */}
                                Pronunciation
                              </Label>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={selectedStudentGrade.pronunciation}
                                onChange={(e) => updateGrade(selectedStudentGrade.studentId, 'pronunciation', Number(e.target.value))}
                                className="text-center"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Avaliações */}
                        <div>
                          <h4 className="font-semibold mb-3">Avaliações</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {assessmentConfig.map((assessment) => (
                              <div key={assessment.key} className="space-y-2">
                                <Label>
                                  {assessment.label} ({assessment.weight}%)
                                </Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.1"
                                  value={selectedStudentGrade[assessment.key as keyof StudentGrade] as number}
                                  onChange={(e) => updateGrade(selectedStudentGrade.studentId, assessment.key as keyof StudentGrade, Number(e.target.value))}
                                  className="text-center"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Observações */}
                        <div className="space-y-4">
                          <h4 className="font-semibold">Observações Pedagógicas</h4>
                          
                          <div className="space-y-2">
                            <Label>Pontos Fortes</Label>
                            <Textarea
                              value={selectedStudentGrade.strengths}
                              onChange={(e) => updateGrade(selectedStudentGrade.studentId, 'strengths', e.target.value)}
                              placeholder="Ex: Excelente pronúncia, participa ativamente das aulas..."
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Pontos a Melhorar</Label>
                            <Textarea
                              value={selectedStudentGrade.weaknesses}
                              onChange={(e) => updateGrade(selectedStudentGrade.studentId, 'weaknesses', e.target.value)}
                              placeholder="Ex: Precisa praticar mais grammar, timidez ao falar..."
                              rows={2}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Recomendações</Label>
                            <Textarea
                              value={selectedStudentGrade.recommendations}
                              onChange={(e) => updateGrade(selectedStudentGrade.studentId, 'recommendations', e.target.value)}
                              placeholder="Ex: Praticar conversação em casa, focar em exercícios de listening..."
                              rows={2}
                            />
                          </div>
                        </div>

                        {/* Nota Final */}
                        <Card className="bg-muted/20">
                          <CardContent className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <Calculator className="h-5 w-5" />
                              <span className="font-semibold">Nota Final</span>
                            </div>
                            <div className={`text-4xl font-bold ${getGradeColor(selectedStudentGrade.finalGrade)}`}>
                              {selectedStudentGrade.finalGrade.toFixed(1)}
                            </div>
                            <Badge className={getGradeStatus(selectedStudentGrade.finalGrade).color + ' mt-2'}>
                              {getGradeStatus(selectedStudentGrade.finalGrade).label}
                            </Badge>
                          </CardContent>
                        </Card>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Habilidades */}
            <TabsContent value="skills" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {skillsConfig.map((skill) => {
                  const IconComponent = skill.icon;
                  const skillAverage = grades.length > 0 
                    ? (grades.reduce((sum, g) => sum + (g[skill.key as keyof StudentGrade] as number), 0) / grades.length).toFixed(1)
                    : '0.0';
                  
                  return (
                    <Card key={skill.key}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <IconComponent className={`h-5 w-5 ${skill.color}`} />
                          {skill.label}
                          <span className={`ml-auto text-lg ${getGradeColor(Number(skillAverage))}`}>
                            {skillAverage}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {grades.map((grade) => (
                            <div key={grade.studentId} className="flex justify-between items-center">
                              <span className="text-sm">{grade.studentName}</span>
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={grade[skill.key as keyof StudentGrade] as number}
                                onChange={(e) => updateGrade(grade.studentId, skill.key as keyof StudentGrade, Number(e.target.value))}
                                className="w-20 h-8 text-center text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Relatórios */}
            <TabsContent value="reports" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Estatísticas da Turma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Média Geral:</span>
                        <span className={`font-semibold ${getGradeColor(Number(classAverage))}`}>
                          {classAverage}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Aprovados:</span>
                        <span className="font-semibold text-green-600">
                          {grades.filter(g => g.finalGrade >= 7).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Recuperação:</span>
                        <span className="font-semibold text-yellow-600">
                          {grades.filter(g => g.finalGrade >= 5 && g.finalGrade < 7).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Reprovados:</span>
                        <span className="font-semibold text-red-600">
                          {grades.filter(g => g.finalGrade < 5).length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Melhores Alunos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {grades
                        .sort((a, b) => b.finalGrade - a.finalGrade)
                        .slice(0, 5)
                        .map((grade, index) => (
                          <div key={grade.studentId} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                {index + 1}
                              </div>
                              <span className="text-sm">{grade.studentName}</span>
                            </div>
                            <span className={`font-semibold ${getGradeColor(grade.finalGrade)}`}>
                              {grade.finalGrade.toFixed(1)}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ações Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Exportar Notas
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Relatório Detalhado
                      </Button>
                      <Button variant="outline" className="w-full justify-start" size="sm">
                        <Star className="h-4 w-4 mr-2" />
                        Gerar Boletim
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={handleClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoading}>
            {isSaving
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</>
              : <><Save className="h-4 w-4 mr-2" />Save Period Grades</>
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}