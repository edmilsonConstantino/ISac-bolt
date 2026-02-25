// src/components/GerenciarTurmas.tsx - VERSÃO CORRIGIDA
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
import { useClassData } from "@/hooks/useClassData";

export function GerenciarTurmas() {
  const { toast } = useToast();
  const { classes, loading, error, addClass, updateClass, deleteClass, refetch } = useClassData();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    disciplina: "",
    professor_id: null as number | null,
    semestre: "",
    ano_letivo: new Date().getFullYear(),
    duracao_meses: 6,
    capacidade_maxima: 30,
    sala: "",
    dias_semana: [] as string[],
    horario_inicio: "",
    horario_fim: "",
    data_inicio: "",
    data_fim: "",
    carga_horaria: null as number | null,
    creditos: null as number | null,
    observacoes: "",
    status: "ativo" as "ativo" | "inativo" | "finalizado" | "cancelado",
  });

  const filteredClasses = classes.filter((cls) =>
    cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cls.teacher_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.disciplina?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      codigo: cls.codigo || "",
      nome: cls.name || cls.nome || "",
      disciplina: cls.disciplina || "",
      professor_id: cls.professor_id || null,
      semestre: cls.semestre || "",
      ano_letivo: cls.ano_letivo || new Date().getFullYear(),
      duracao_meses: cls.duracao_meses || 6,
      capacidade_maxima: cls.max_students || cls.capacidade_maxima || 30,
      sala: cls.sala || "",
      dias_semana: cls.dias_semana ? cls.dias_semana.split(',') : [],
      horario_inicio: cls.horario_inicio || "",
      horario_fim: cls.horario_fim || "",
      data_inicio: cls.data_inicio || "",
      data_fim: cls.data_fim || "",
      carga_horaria: cls.carga_horaria || null,
      creditos: cls.creditos || null,
      observacoes: cls.description || cls.observacoes || "",
      status: cls.status || "ativo",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      codigo: "",
      nome: "",
      disciplina: "",
      professor_id: null,
      semestre: "",
      ano_letivo: new Date().getFullYear(),
      duracao_meses: 6,
      capacidade_maxima: 30,
      sala: "",
      dias_semana: [],
      horario_inicio: "",
      horario_fim: "",
      data_inicio: "",
      data_fim: "",
      carga_horaria: null,
      creditos: null,
      observacoes: "",
      status: "ativo",
    });
  };

  const handleSave = async () => {
    // ✅ VALIDAÇÕES DETALHADAS
    console.log('🔍 Validando formulário...', formData);

    if (!formData.codigo || !formData.nome || !formData.disciplina || !formData.duracao_meses) {
      toast({
        title: "❌ Campos obrigatórios",
        description: "Preencha: Código, Nome, Disciplina e Duração",
        variant: "destructive",
      });
      return;
    }

    if (formData.dias_semana.length === 0) {
      toast({
        title: "❌ Dias da semana",
        description: "Selecione pelo menos um dia da semana",
        variant: "destructive",
      });
      return;
    }

    if (!formData.horario_inicio || !formData.horario_fim) {
      toast({
        title: "❌ Horários obrigatórios",
        description: "Preencha horário de início e fim",
        variant: "destructive",
      });
      return;
    }

    if (formData.data_fim && formData.data_inicio &&
      new Date(formData.data_fim) <= new Date(formData.data_inicio)) {
      toast({
        title: "❌ Datas inválidas",
        description: "A data de fim deve ser posterior à data de início",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('📤 Enviando dados para API...', formData);

      if (editingClass) {
        await updateClass(editingClass.id, formData);
        toast({
          title: "✅ Turma atualizada",
          description: "Os dados da turma foram atualizados com sucesso.",
        });
      } else {
        await addClass(formData);
        toast({
          title: "✅ Turma criada",
          description: "Nova turma foi criada com sucesso.",
        });
      }

      setIsDialogOpen(false);
      setEditingClass(null);
      resetForm();
      refetch();
      
    } catch (error: any) {
      console.error("❌ Erro ao salvar turma:", error);
      console.error("Detalhes:", error.response?.data);
      
      toast({
        title: "❌ Erro ao salvar",
        description: error.response?.data?.message || error.message || "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (classId: number) => {
    if (!confirm("Tem certeza que deseja remover esta turma?")) return;

    try {
      await deleteClass(classId);
      toast({
        title: "✅ Turma removida",
        description: "A turma foi removida com sucesso.",
      });
      refetch();
    } catch (error: any) {
      toast({
        title: "❌ Erro",
        description: error.response?.data?.message || "Erro ao remover turma",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ativo: "bg-green-500 text-white",
      inativo: "bg-gray-500 text-white",
      finalizado: "bg-blue-500 text-white",
      cancelado: "bg-red-500 text-white",
    };
    return variants[status as keyof typeof variants] || variants.ativo;
  };

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
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
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Editar Turma" : "Nova Turma"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Código e Nome */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="codigo">Código da Turma *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    placeholder="Ex: TUR001"
                  />
                </div>
                <div>
                  <Label htmlFor="nome">Nome da Turma *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Ex: Básico A1 - Manhã"
                  />
                </div>
              </div>

              {/* Disciplina e Sala */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="disciplina">Disciplina *</Label>
                  <Input
                    id="disciplina"
                    value={formData.disciplina}
                    onChange={(e) => setFormData({ ...formData, disciplina: e.target.value })}
                    placeholder="Ex: Inglês Básico"
                  />
                </div>
                <div>
                  <Label htmlFor="sala">Sala</Label>
                  <Input
                    id="sala"
                    value={formData.sala}
                    onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                    placeholder="Ex: Sala 101"
                  />
                </div>
              </div>

              {/* Semestre e Ano */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input
                    id="semestre"
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                    placeholder="Ex: 1º Semestre"
                  />
                </div>
                <div>
                  <Label htmlFor="ano_letivo">Ano Letivo</Label>
                  <Input
                    id="ano_letivo"
                    type="number"
                    value={formData.ano_letivo}
                    onChange={(e) => setFormData({ ...formData, ano_letivo: parseInt(e.target.value) || new Date().getFullYear() })}
                  />
                </div>
              </div>

              {/* Dias da Semana */}
              <div>
                <Label>Dias da Semana *</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map(dia => (
                    <Button
                      key={dia}
                      type="button"
                      variant={formData.dias_semana.includes(dia) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const newDias = formData.dias_semana.includes(dia)
                          ? formData.dias_semana.filter(d => d !== dia)
                          : [...formData.dias_semana, dia];
                        setFormData({ ...formData, dias_semana: newDias });
                      }}
                    >
                      {dia.charAt(0).toUpperCase() + dia.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="horario_inicio">Horário Início *</Label>
                  <Input
                    id="horario_inicio"
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="horario_fim">Horário Fim *</Label>
                  <Input
                    id="horario_fim"
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                  />
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              {/* Duração, Capacidade e Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duracao_meses">Duração (meses) *</Label>
                  <Input
                    id="duracao_meses"
                    type="number"
                    min="1"
                    value={formData.duracao_meses}
                    onChange={(e) => setFormData({ ...formData, duracao_meses: parseInt(e.target.value) || 6 })}
                  />
                </div>
                <div>
                  <Label htmlFor="capacidade_maxima">Capacidade</Label>
                  <Input
                    id="capacidade_maxima"
                    type="number"
                    min="1"
                    value={formData.capacidade_maxima}
                    onChange={(e) => setFormData({ ...formData, capacidade_maxima: parseInt(e.target.value) || 30 })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Carga Horária e Créditos */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carga_horaria">Carga Horária (h)</Label>
                  <Input
                    id="carga_horaria"
                    type="number"
                    value={formData.carga_horaria || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      carga_horaria: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="Ex: 60"
                  />
                </div>
                <div>
                  <Label htmlFor="creditos">Créditos</Label>
                  <Input
                    id="creditos"
                    type="number"
                    value={formData.creditos || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      creditos: e.target.value ? parseInt(e.target.value) : null
                    })}
                    placeholder="Ex: 4"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>

              {/* Botão Salvar */}
              <Button onClick={handleSave} className="w-full" disabled={loading}>
                {loading ? 'Salvando...' : (editingClass ? "Atualizar" : "Criar")} Turma
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Turmas Ativas</h3>
              <p className="text-2xl font-bold text-green-600">
                {classes.filter(c => c.status === "ativo").length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Total de Estudantes</h3>
              <p className="text-2xl font-bold text-blue-600">
                {classes.reduce((acc, c) => acc + (c.students_count || 0), 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Professores Ativos</h3>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(classes.map(c => c.teacher_name).filter(Boolean)).size}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Turmas */}
      <Card>
        <CardHeader>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, professor ou código..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead>Professor</TableHead>
                  <TableHead>Horário</TableHead>
                  <TableHead>Estudantes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClasses.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>
                      <Badge variant="outline">{cls.codigo}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{cls.name || cls.nome}</p>
                          {(cls as Record<string, unknown>).nivel_numero && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 whitespace-nowrap">
                              N{String((cls as Record<string, unknown>).nivel_numero)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cls.disciplina}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {cls.teacher_name || 'Sem professor'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {cls.horario_inicio?.substring(0, 5)} - {cls.horario_fim?.substring(0, 5)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-medium ${getOccupancyColor(cls.students_count || 0, cls.max_students || cls.capacidade_maxima || 30)}`}>
                        {cls.students_count || 0}/{cls.max_students || cls.capacidade_maxima || 30}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(cls.status || 'ativo')}>
                        {cls.status || 'ativo'}
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
                          className="text-red-600 hover:text-red-700"
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