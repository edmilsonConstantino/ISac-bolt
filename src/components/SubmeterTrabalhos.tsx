import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, Calendar, Clock, CheckCircle, AlertCircle, File } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "pendente" | "submetido" | "avaliado" | "atrasado";
  grade?: number;
  submittedAt?: string;
  feedback?: string;
  maxGrade: number;
  subject: string;
}

export function SubmeterTrabalhos() {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Essay: My Future Plans",
      description: "Write a 300-word essay about your future plans using future tenses.",
      dueDate: "2024-02-15",
      status: "pendente",
      maxGrade: 20,
      subject: "Writing",
    },
    {
      id: "2",
      title: "Grammar Exercise: Past Perfect",
      description: "Complete the exercises on past perfect tense.",
      dueDate: "2024-02-10",
      status: "submetido",
      submittedAt: "2024-02-09",
      maxGrade: 10,
      subject: "Grammar",
    },
    {
      id: "3",
      title: "Presentation: Cultural Differences",
      description: "Prepare a 5-minute presentation about cultural differences.",
      dueDate: "2024-02-20",
      status: "avaliado",
      grade: 18,
      submittedAt: "2024-02-18",
      feedback: "Excellent presentation! Great use of vocabulary.",
      maxGrade: 20,
      subject: "Speaking",
    },
  ]);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const handleSubmit = () => {
    if (!selectedAssignment) return;
    
    if (!submissionText.trim() && (!selectedFiles || selectedFiles.length === 0)) {
      toast({
        title: "Erro",
        description: "Por favor, adicione texto ou anexe um arquivo.",
        variant: "destructive",
      });
      return;
    }

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === selectedAssignment.id
          ? {
              ...assignment,
              status: "submetido" as const,
              submittedAt: new Date().toISOString().split("T")[0],
            }
          : assignment
      )
    );

    toast({
      title: "Trabalho submetido",
      description: "Seu trabalho foi submetido com sucesso!",
    });

    setIsDialogOpen(false);
    setSubmissionText("");
    setSelectedFiles(null);
    setSelectedAssignment(null);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pendente: { className: "bg-warning text-warning-foreground", icon: Clock },
      submetido: { className: "bg-blue-500 text-white", icon: CheckCircle },
      avaliado: { className: "bg-success text-success-foreground", icon: CheckCircle },
      atrasado: { className: "bg-destructive text-destructive-foreground", icon: AlertCircle },
    };
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === "pendente" && new Date() > new Date(dueDate);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <FileText className="h-6 w-6" />
          Submeter Trabalhos
        </h2>
        <p className="text-muted-foreground">
          Visualize e submeta seus trabalhos acadêmicos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Pendentes</h3>
              <p className="text-2xl font-bold text-warning">
                {assignments.filter(a => a.status === "pendente").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Submetidos</h3>
              <p className="text-2xl font-bold text-blue-500">
                {assignments.filter(a => a.status === "submetido").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Avaliados</h3>
              <p className="text-2xl font-bold text-success">
                {assignments.filter(a => a.status === "avaliado").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meus Trabalhos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trabalho</TableHead>
                  <TableHead>Matéria</TableHead>
                  <TableHead>Data Limite</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Nota</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const statusInfo = getStatusBadge(assignment.status);
                  const StatusIcon = statusInfo.icon;
                  const overdue = isOverdue(assignment.dueDate, assignment.status);
                  
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{assignment.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {assignment.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{assignment.subject}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span className={overdue ? "text-destructive font-medium" : ""}>
                            {new Date(assignment.dueDate).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {overdue ? "Atrasado" : assignment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {assignment.grade !== undefined ? (
                          <span className="font-medium">
                            {assignment.grade}/{assignment.maxGrade}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {assignment.status === "pendente" && (
                          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedAssignment(assignment)}
                              >
                                <Upload className="h-3 w-3 mr-1" />
                                Submeter
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Submeter Trabalho</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">{selectedAssignment?.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedAssignment?.description}
                                  </p>
                                </div>
                                
                                <div>
                                  <Label htmlFor="submission">Texto da Submissão</Label>
                                  <Textarea
                                    id="submission"
                                    placeholder="Digite seu trabalho aqui..."
                                    value={submissionText}
                                    onChange={(e) => setSubmissionText(e.target.value)}
                                    rows={6}
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="files">Arquivos (opcional)</Label>
                                  <Input
                                    id="files"
                                    type="file"
                                    multiple
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.png"
                                    onChange={(e) => setSelectedFiles(e.target.files)}
                                  />
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Formatos aceitos: PDF, DOC, DOCX, TXT, JPG, PNG
                                  </p>
                                </div>

                                {selectedFiles && selectedFiles.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-sm font-medium">Arquivos selecionados:</p>
                                    {Array.from(selectedFiles).map((file, index) => (
                                      <div key={index} className="flex items-center gap-2 text-sm">
                                        <File className="h-4 w-4" />
                                        <span>{file.name}</span>
                                        <span className="text-muted-foreground">
                                          ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <Button 
                                  onClick={handleSubmit} 
                                  className="w-full"
                                  disabled={!submissionText.trim() && (!selectedFiles || selectedFiles.length === 0)}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Submeter Trabalho
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        
                        {assignment.feedback && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="ml-2">
                                Ver Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Feedback do Professor</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-medium">{assignment.title}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Nota: {assignment.grade}/{assignment.maxGrade}
                                  </p>
                                </div>
                                <div>
                                  <Label>Comentários:</Label>
                                  <p className="mt-2 p-3 bg-muted rounded-md">
                                    {assignment.feedback}
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}