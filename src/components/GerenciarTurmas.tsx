import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Edit, Trash2, Search, Calendar, Clock, User, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Class {
  id: string;
  name: string;
  level: string;
  teacher: string;
  schedule: string;
  startDate: string;
  endDate: string;
  maxStudents: number;
  currentStudents: number;
  status: "ativo" | "inativo" | "completo";
  description: string;
  room: string;
}

export function GerenciarTurmas() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([
    {
      id: "1",
      name: "Básico A1 - Manhã",
      level: "A1",
      teacher: "Prof. Maria Silva",
      schedule: "Seg, Qua, Sex - 08:00-10:00",
      startDate: "2024-02-01",
      endDate: "2024-05-31",
      maxStudents: 15,
      currentStudents: 12,
      status: "ativo",
      description: "Curso básico de inglês para iniciantes",
      room: "Sala 101",
    },
    {
      id: "2",
      name: "Intermediário B1 - Tarde",
      level: "B1",
      teacher: "Prof. João Santos",
      schedule: "Ter, Qui - 14:00-17:00",
      startDate: "2024-01-15",
      endDate: "2024-06-15",
      maxStudents: 12,
      currentStudents: 8,
      status: "ativo",
      description: "Curso intermediário com foco em conversação",
      room: "Sala 102",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    level: string;
    teacher: string;
    schedule: string;
    startDate: string;
    endDate: string;
    maxStudents: number;
    description: string;
    room: string;
    status: "ativo" | "inativo" | "completo";
  }>({
    name: "",
    level: "",
    teacher: "",
    schedule: "",
    startDate: "",
    endDate: "",
    maxStudents: 15,
    description: "",
    room: "",
    status: "ativo",
  });

  const teachers = [
    "Prof. Maria Silva",
    "Prof. João Santos",
    "Prof. Ana Costa",
    "Prof. Pedro Lima",
  ];

  const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];

  const filteredClasses = classes.filter((cls) =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setFormData({
      name: cls.name,
      level: cls.level,
      teacher: cls.teacher,
      schedule: cls.schedule,
      startDate: cls.startDate,
      endDate: cls.endDate,
      maxStudents: cls.maxStudents,
      description: cls.description,
      room: cls.room,
      status: cls.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingClass) {
      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === editingClass.id
            ? { ...cls, ...formData }
            : cls
        )
      );
      toast({
        title: "Turma atualizada",
        description: "Os dados da turma foram atualizados com sucesso.",
      });
    } else {
      const newClass: Class = {
        id: Date.now().toString(),
        ...formData,
        currentStudents: 0,
      };
      setClasses((prev) => [...prev, newClass]);
      toast({
        title: "Turma criada",
        description: "Nova turma foi criada com sucesso.",
      });
    }
    setIsDialogOpen(false);
    setEditingClass(null);
    setFormData({
      name: "",
      level: "",
      teacher: "",
      schedule: "",
      startDate: "",
      endDate: "",
      maxStudents: 15,
      description: "",
      room: "",
      status: "ativo",
    });
  };

  const handleDelete = (classId: string) => {
    setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    toast({
      title: "Turma removida",
      description: "A turma foi removida com sucesso.",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "bg-success text-success-foreground",
      inativo: "bg-muted text-muted-foreground",
      completo: "bg-warning text-warning-foreground",
    };
    return variants[status as keyof typeof variants] || variants.ativo;
  };

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 70) return "text-warning";
    return "text-success";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Gerenciar Turmas
          </h2>
          <p className="text-muted-foreground">
            Administre turmas, horários e professores
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingClass(null);
              setFormData({
                name: "",
                level: "",
                teacher: "",
                schedule: "",
                startDate: "",
                endDate: "",
                maxStudents: 15,
                description: "",
                room: "",
                status: "ativo",
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Editar Turma" : "Nova Turma"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome da Turma</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Básico A1 - Manhã"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Nível</Label>
                  <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map(level => (
                        <SelectItem key={level} value={level}>{level}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teacher">Professor</Label>
                  <Select value={formData.teacher} onValueChange={(value) => setFormData({ ...formData, teacher: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map(teacher => (
                        <SelectItem key={teacher} value={teacher}>{teacher}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="room">Sala</Label>
                  <Input
                    id="room"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="Ex: Sala 101"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="schedule">Horário</Label>
                <Input
                  id="schedule"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  placeholder="Ex: Seg, Qua, Sex - 08:00-10:00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxStudents">Máximo de Estudantes</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 15 })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="completo">Completo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Breve descrição da turma..."
                  rows={3}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingClass ? "Atualizar" : "Criar"} Turma
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Turmas Ativas</h3>
              <p className="text-2xl font-bold text-success">
                {classes.filter(c => c.status === "ativo").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Total de Estudantes</h3>
              <p className="text-2xl font-bold text-primary">
                {classes.reduce((acc, c) => acc + c.currentStudents, 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Professores Ativos</h3>
              <p className="text-2xl font-bold text-accent">
                {new Set(classes.map(c => c.teacher)).size}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, professor ou nível..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turma</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Estudantes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cls.name}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {cls.level}
                            </Badge>
                            <span className="text-xs">{cls.room}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {cls.teacher}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3" />
                        {cls.schedule}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        <div>
                          <div>{new Date(cls.startDate).toLocaleDateString("pt-BR")}</div>
                          <div className="text-xs text-muted-foreground">
                            até {new Date(cls.endDate).toLocaleDateString("pt-BR")}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getOccupancyColor(cls.currentStudents, cls.maxStudents)}`}>
                        {cls.currentStudents}/{cls.maxStudents}
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-current h-1.5 rounded-full transition-all"
                          style={{ width: `${(cls.currentStudents / cls.maxStudents) * 100}%` }}
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(cls.status)}>
                        {cls.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(cls)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(cls.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}