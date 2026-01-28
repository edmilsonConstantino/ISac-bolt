// src/components/shared/StudentProfileModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  FileText,
  Save,
  Edit,
  UserCheck,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Student } from "../../types";

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  currentUserRole: 'admin' | 'teacher';
  onSave: (updatedStudent: Student) => void;
  onToggleStatus?: (studentId: number) => void;
  onViewPaymentDetails?: (student: Student) => void;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  currentUserRole,
  onSave,
  onToggleStatus,
  onViewPaymentDetails
}: StudentProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    birthDate: '',
    parentName: '',
    parentPhone: '',
    emergencyContact: '',
    emergencyPhone: '',
    notes: '',
    level: '',
    enrollmentDate: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });

  // Dados simulados de desempenho (em um app real, viriam de props ou hooks)
  const [performanceData, setPerformanceData] = useState({
    currentGrade: 8.5,
    attendance: 92,
    totalLessons: 48,
    attendedLessons: 44,
    assignmentsSubmitted: 15,
    totalAssignments: 18,
    lastPayment: '2024-01-15',
    paymentStatus: 'up-to-date' as 'up-to-date' | 'overdue' | 'advance',
    monthlyFee: 2500,
    totalPaid: 25000,
    nextPaymentDue: '2024-02-15'
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        birthDate: student.birthDate || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        notes: student.notes || '',
        level: student.level || '',
        enrollmentDate: student.enrollmentDate || '',
        status: student.status || 'active'
      });
    }
  }, [student]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    if (student) {
      const updatedStudent: Student = {
        ...student,
        ...formData
      };
      onSave(updatedStudent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        birthDate: student.birthDate || '',
        parentName: student.parentName || '',
        parentPhone: student.parentPhone || '',
        emergencyContact: student.emergencyContact || '',
        emergencyPhone: student.emergencyPhone || '',
        notes: student.notes || '',
        level: student.level || '',
        enrollmentDate: student.enrollmentDate || '',
        status: student.status || 'active'
      });
    }
    setIsEditing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      default: return 'Desconhecido';
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-3">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Perfil do Estudante</h2>
                <p className="text-white/80">Informações detalhadas e desempenho</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-white hover:bg-white/20"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Principal - Informações Pessoais */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informações Básicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border">{formData.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {formData.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          {formData.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="birthDate">Data de Nascimento</Label>
                      {isEditing ? (
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {formData.birthDate ? new Date(formData.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Endereço</Label>
                    {isEditing ? (
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        className="mt-1"
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {formData.address || 'Não informado'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Informações Acadêmicas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Informações Acadêmicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="level">Nível</Label>
                      {isEditing ? (
                        <select
                          id="level"
                          value={formData.level}
                          onChange={(e) => handleInputChange('level', e.target.value)}
                          className="mt-1 w-full p-2 border rounded-md"
                        >
                          <option value="">Selecionar nível</option>
                          <option value="A1">A1 - Básico</option>
                          <option value="A2">A2 - Elementar</option>
                          <option value="B1">B1 - Intermediário</option>
                          <option value="B2">B2 - Intermediário Superior</option>
                          <option value="C1">C1 - Avançado</option>
                          <option value="C2">C2 - Proficiência</option>
                        </select>
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          {formData.level || 'Não definido'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="enrollmentDate">Data de Matrícula</Label>
                      {isEditing ? (
                        <Input
                          id="enrollmentDate"
                          type="date"
                          value={formData.enrollmentDate}
                          onChange={(e) => handleInputChange('enrollmentDate', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border">
                          {formData.enrollmentDate ? new Date(formData.enrollmentDate).toLocaleDateString('pt-BR') : 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="status">Status</Label>
                      {isEditing ? (
                        <select
                          id="status"
                          value={formData.status}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="mt-1 w-full p-2 border rounded-md"
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                          <option value="suspended">Suspenso</option>
                        </select>
                      ) : (
                        <div className="mt-1">
                          <Badge className={getStatusColor(formData.status)}>
                            {getStatusText(formData.status)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    {isEditing ? (
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        className="mt-1 min-h-[80px]"
                        placeholder="Observações sobre o estudante..."
                      />
                    ) : (
                      <p className="mt-1 p-2 bg-gray-50 rounded border min-h-[80px]">
                        {formData.notes || 'Nenhuma observação registrada'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Notas e Avaliações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Notas e Avaliações
                  </CardTitle>
                  <CardDescription>Histórico de desempenho nas avaliações</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {/* 1ª Avaliação */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">1ª</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Primeira Avaliação</p>
                          <p className="text-xs text-slate-500">Realizada em 15/01/2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">17.5</p>
                        <p className="text-xs text-slate-500">de 20</p>
                      </div>
                    </div>

                    {/* 2ª Avaliação */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">2ª</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Segunda Avaliação</p>
                          <p className="text-xs text-slate-500">Realizada em 22/01/2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">18.0</p>
                        <p className="text-xs text-slate-500">de 20</p>
                      </div>
                    </div>

                    {/* 3ª Avaliação */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">3ª</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Terceira Avaliação</p>
                          <p className="text-xs text-slate-500">Prevista para 05/02/2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          Pendente
                        </Badge>
                      </div>
                    </div>

                    {/* 4ª Avaliação */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">4ª</span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-800">Quarta Avaliação</p>
                          <p className="text-xs text-slate-500">Prevista para 15/02/2025</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          Pendente
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Média Geral */}
                  <div className="mt-4 p-4 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-white" />
                        <div>
                          <p className="text-white/80 text-xs font-medium">Média Atual</p>
                          <p className="text-white text-sm">Baseada em 2 avaliações</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold text-white">17.8</p>
                        <Badge className="bg-white/20 text-white border-0 mt-1">
                          Excelente
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contatos de Emergência */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Contatos de Emergência
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="parentName">Nome do Responsável</Label>
                      {isEditing ? (
                        <Input
                          id="parentName"
                          value={formData.parentName}
                          onChange={(e) => handleInputChange('parentName', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border">
                          {formData.parentName || 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="parentPhone">Telefone do Responsável</Label>
                      {isEditing ? (
                        <Input
                          id="parentPhone"
                          value={formData.parentPhone}
                          onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border">
                          {formData.parentPhone || 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border">
                          {formData.emergencyContact || 'Não informado'}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                      {isEditing ? (
                        <Input
                          id="emergencyPhone"
                          value={formData.emergencyPhone}
                          onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-2 bg-gray-50 rounded border">
                          {formData.emergencyPhone || 'Não informado'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                  {/* Footer com botões de ação */}
        {isEditing && (
          <div className="border-t p-4 bg-gray-50 flex justify-end gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="flex items-center gap-2">
              <Save className="h-8 w-4" />
              Salvar Alterações
            </Button>
          </div>
        )}
              </Card>
            </div>

            {/* Coluna Lateral - Performance e Status */}
            <div className="space-y-6">
              {/* Resumo de Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {performanceData.currentGrade.toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Nota Atual</div>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {performanceData.attendance}%
                    </div>
                    <div className="text-sm text-muted-foreground">Presença</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Aulas</span>
                      <span className="font-medium">
                        {performanceData.attendedLessons}/{performanceData.totalLessons}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Trabalhos</span>
                      <span className="font-medium">
                        {performanceData.assignmentsSubmitted}/{performanceData.totalAssignments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Status Financeiro */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Status Financeiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-lg font-bold text-orange-600">
                      {formatCurrency(performanceData.monthlyFee)}
                    </div>
                    <div className="text-sm text-muted-foreground">Mensalidade</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Pago</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(performanceData.totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Último Pagamento</span>
                      <span className="font-medium">
                        {new Date(performanceData.lastPayment).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Próximo Vencimento</span>
                      <span className="font-medium">
                        {new Date(performanceData.nextPaymentDue).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Badge
                      variant={performanceData.paymentStatus === 'up-to-date' ? 'default' : 'destructive'}
                      className="flex items-center gap-1 w-fit mx-auto"
                    >
                      {performanceData.paymentStatus === 'up-to-date' ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <Clock className="h-3 w-3" />
                      )}
                      {performanceData.paymentStatus === 'up-to-date' ? 'Em Dia' :
                       performanceData.paymentStatus === 'overdue' ? 'Em Atraso' : 'Antecipado'}
                    </Badge>
                  </div>

                  {onViewPaymentDetails && (
                    <Button
                      onClick={() => onViewPaymentDetails(student)}
                      className="w-full bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white mt-4"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Ver Detalhes de Pagamento
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Informações da Turma */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Turma Atual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="font-semibold text-lg">{student.className}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Horário: Segunda e Quarta, 14:00-15:30
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Sala: 105
                    </div>
                  </div>

                  
                </CardContent>
              </Card>

              
            </div>
          </div>
          
        </div>

      
      </div>
    </div>
  );
}