// src/components/shared/TeacherProfileModal.tsx
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  Clock, 
  Award,
  Edit,
  Save,
  X,
  Users,
  BookOpen,
  MapPin,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  email: string;
  classes: number;
  students: number;
  status: "active" | "inactive";
  phone?: string;
  specialization?: string;
  contractType?: string;
  experience?: string;
  qualifications?: string;
  salary?: number;
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
  onSave 
}: TeacherProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Teacher | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (teacher && isOpen) {
      setFormData({ ...teacher });
      setIsEditing(false);
      setErrors({});
    }
  }, [teacher, isOpen]);

  if (!teacher || !formData) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

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

  const handleEdit = () => {
    setIsEditing(true);
    setErrors({});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ ...teacher });
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    if (formData && onSave) {
      onSave(formData);
    }
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleStatusChange = (newStatus: "active" | "inactive") => {
    if (isEditing) {
      setFormData(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const formatSalary = (salary?: number) => {
    if (!salary) return "Não informado";
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(salary);
  };

  const getContractTypeLabel = (contractType?: string) => {
    const types: { [key: string]: string } = {
      'full-time': 'Integral',
      'part-time': 'Parcial', 
      'freelance': 'Freelancer',
      'substitute': 'Substituto'
    };
    return types[contractType || ''] || contractType || "Não informado";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <span>Perfil do Docente</span>
              {isEditing && (
                <Badge variant="secondary" className="ml-2">
                  <Edit className="h-3 w-3 mr-1" />
                  Editando
                </Badge>
              )}
            </div>

          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header com informações básicas */}
          <Card className="border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold truncate">{formData.name}</h3>
                    <Badge 
                      variant={formData.status === "active" ? "default" : "destructive"}
                      className="flex items-center gap-1"
                    >
                      {formData.status === "active" ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <AlertCircle className="h-3 w-3" />
                      )}
                      {formData.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{formData.phone}</span>
                      </div>
                    )}
                    {formData.specialization && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Award className="h-3 w-3" />
                        <span className="truncate">{formData.specialization}</span>
                      </div>
                    )}
                  </div>
                </div>
                {!isEditing && onSave && (
                  <Button onClick={handleEdit} className="flex-shrink-0">
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Perfil
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas em cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{formData.classes}</div>
                <div className="text-sm text-muted-foreground">Turmas</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{formData.students}</div>
                <div className="text-sm text-muted-foreground">Estudantes</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-purple-600">
                  {getContractTypeLabel(formData.contractType)}
                </div>
                <div className="text-sm text-muted-foreground">Contrato</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="text-center p-4">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-sm font-medium text-orange-600 truncate">
                  {formData.salary ? formatSalary(formData.salary) : "N/A"}
                </div>
                <div className="text-sm text-muted-foreground">Salário</div>
              </CardContent>
            </Card>
          </div>

          {/* Formulário principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Coluna 1 - Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="Digite o nome completo"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                    placeholder="exemplo@m007.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleInputChange}
                    placeholder="+258 84 000 0000"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contractType">Tipo de Contrato</Label>
                  {isEditing ? (
                    <select
                      name="contractType"
                      value={formData.contractType || ""}
                      onChange={(e) => handleSelectChange('contractType', e.target.value)}
                      className="w-full p-2 border rounded-md bg-background"
                    >
                      <option value="">Selecione...</option>
                      <option value="full-time">Integral</option>
                      <option value="part-time">Parcial</option>
                      <option value="freelance">Freelancer</option>
                      <option value="substitute">Substituto</option>
                    </select>
                  ) : (
                    <Input
                      value={getContractTypeLabel(formData.contractType)}
                      disabled
                      className="bg-muted"
                    />
                  )}
                </div>

                {isEditing && (
                  <div className="space-y-2">
                    <Label htmlFor="salary">Salário (MZN)</Label>
                    <Input
                      id="salary"
                      name="salary"
                      type="number"
                      value={formData.salary || ""}
                      onChange={(e) => setFormData(prev => prev ? { 
                        ...prev, 
                        salary: e.target.value ? Number(e.target.value) : undefined 
                      } : null)}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <Label>Status do Docente</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.status === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("active")}
                      disabled={!isEditing}
                      className="flex items-center gap-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      Ativo
                    </Button>
                    <Button
                      type="button"
                      variant={formData.status === "inactive" ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("inactive")}
                      disabled={!isEditing}
                      className="flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      Inativo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coluna 2 - Informações Acadêmicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Informações Acadêmicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Especializações</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization || ""}
                    onChange={handleInputChange}
                    placeholder="Ex: Business English, IELTS, Conversação"
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qualifications">Qualificações</Label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications || ""}
                    onChange={handleTextareaChange}
                    className={`w-full p-3 border rounded-md h-32 resize-none ${
                      !isEditing ? "bg-muted cursor-not-allowed" : ""
                    }`}
                    placeholder="Licenciatura, mestrado, certificações, cursos..."
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Experiência Profissional</Label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience || ""}
                    onChange={handleTextareaChange}
                    className={`w-full p-3 border rounded-md h-32 resize-none ${
                      !isEditing ? "bg-muted cursor-not-allowed" : ""
                    }`}
                    placeholder="Descreva a experiência profissional, anos de ensino, especialidades..."
                    disabled={!isEditing}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                <Save className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              {onSave && (
                <Button onClick={handleEdit} className="bg-primary hover:bg-primary/90">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}