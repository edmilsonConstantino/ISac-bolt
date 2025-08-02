import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Plus, Edit, Lock, Unlock, Search, Mail, Phone, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  class: string;
  status: "ativo" | "bloqueado" | "pendente";
  paymentStatus: "pago" | "pendente" | "atrasado";
  lastPayment: string;
  registrationDate: string;
}

export function GerenciarEstudantes() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      name: "Ana Silva",
      email: "ana@email.com",
      phone: "+244 912 345 678",
      class: "Básico A1",
      status: "ativo",
      paymentStatus: "pago",
      lastPayment: "2024-01-15",
      registrationDate: "2023-09-01",
    },
    {
      id: "2",
      name: "João Santos",
      email: "joao@email.com",
      phone: "+244 923 456 789",
      class: "Intermediário B1",
      status: "bloqueado",
      paymentStatus: "atrasado",
      lastPayment: "2023-11-20",
      registrationDate: "2023-08-15",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    class: string;
    status: "ativo" | "bloqueado" | "pendente";
  }>({
    name: "",
    email: "",
    phone: "",
    class: "",
    status: "ativo",
  });

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      class: student.class,
      status: student.status,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.class) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? { ...s, ...formData }
            : s
        )
      );
      toast({
        title: "Estudante atualizado",
        description: "Os dados do estudante foram atualizados com sucesso.",
      });
    } else {
      const newStudent: Student = {
        id: Date.now().toString(),
        ...formData,
        paymentStatus: "pendente",
        lastPayment: "-",
        registrationDate: new Date().toISOString().split("T")[0],
      };
      setStudents((prev) => [...prev, newStudent]);
      toast({
        title: "Estudante criado",
        description: "Novo estudante foi adicionado com sucesso.",
      });
    }
    setIsDialogOpen(false);
    setEditingStudent(null);
    setFormData({ name: "", email: "", phone: "", class: "", status: "ativo" });
  };

  const toggleStatus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, status: s.status === "ativo" ? "bloqueado" : "ativo" }
          : s
      )
    );
    toast({
      title: "Status alterado",
      description: "O status do estudante foi alterado com sucesso.",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "bg-success text-success-foreground",
      bloqueado: "bg-destructive text-destructive-foreground",
      pendente: "bg-warning text-warning-foreground",
    };
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  const getPaymentBadge = (status: string) => {
    const variants = {
      pago: "bg-success text-success-foreground",
      pendente: "bg-warning text-warning-foreground",
      atrasado: "bg-destructive text-destructive-foreground",
    };
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Gerenciar Estudantes
          </h2>
          <p className="text-muted-foreground">
            Administre estudantes, status e pagamentos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingStudent(null);
              setFormData({ name: "", email: "", phone: "", class: "", status: "ativo" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Estudante
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingStudent ? "Editar Estudante" : "Novo Estudante"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do estudante"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+244 912 345 678"
                />
              </div>
              <div>
                <Label htmlFor="class">Turma</Label>
                <Select value={formData.class} onValueChange={(value) => setFormData({ ...formData, class: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Básico A1">Básico A1</SelectItem>
                    <SelectItem value="Básico A2">Básico A2</SelectItem>
                    <SelectItem value="Intermediário B1">Intermediário B1</SelectItem>
                    <SelectItem value="Intermediário B2">Intermediário B2</SelectItem>
                    <SelectItem value="Avançado C1">Avançado C1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingStudent ? "Atualizar" : "Criar"} Estudante
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou turma..."
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
                  <TableHead>Estudante</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Último Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {student.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {student.phone}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.class}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(student.status)}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentBadge(student.paymentStatus)}>
                        {student.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {student.lastPayment}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(student.id)}
                          className={student.status === "bloqueado" ? "text-success" : "text-destructive"}
                        >
                          {student.status === "bloqueado" ? 
                            <Unlock className="h-3 w-3" /> : 
                            <Lock className="h-3 w-3" />
                          }
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