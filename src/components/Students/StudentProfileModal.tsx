// src/components/shared/StudentProfileModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  BookOpen,
  Save,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Edit,
  Lock,
  Key,
  Eye,
  EyeOff
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
  onResetPassword?: (studentId: number, newPassword: string) => void;
}

export function StudentProfileModal({
  isOpen,
  onClose,
  student,
  currentUserRole,
  onSave,
  onToggleStatus,
  onViewPaymentDetails,
  onResetPassword
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

  const [performanceData] = useState({
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

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState("pessoal");
  const [hasChanges, setHasChanges] = useState(false);

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
      setHasChanges(false);
      setIsEditing(false);
    }
  }, [student]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (student) {
      const updatedStudent: Student = {
        ...student,
        ...formData
      };
      onSave(updatedStudent);
      setHasChanges(false);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
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
    setHasChanges(false);
    setIsEditing(false);
  };

  const handlePasswordReset = () => {
    setPasswordError('');
    
    // Validações
    if (!passwordData.password || !passwordData.confirmPassword) {
      setPasswordError('Preencha ambos os campos de senha');
      return;
    }

    if (passwordData.password.length < 6) {
      setPasswordError('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    if (passwordData.password !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      return;
    }

    // Resetar senha
    if (student?.id && onResetPassword) {
      onResetPassword(student.id, passwordData.password);
      setShowPasswordReset(false);
      setPasswordData({ password: '', confirmPassword: '' });
      setPasswordError('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'suspended': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  if (!student) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" onInteractOutside={(e) => e.preventDefault()}>
          {/* CABEÇALHO FIXO COM COR AZUL */}
          <DialogHeader className="pb-4 border-b bg-gradient-to-r from-[#004B87] to-[#0066B3] -mx-6 -mt-6 px-6 pt-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-sm border border-white/30">
                <User className="h-5 w-5 text-white" />
              </div>
             
              <div>
                <DialogTitle className="text-xl text-white">{formData.name}</DialogTitle>
                
                <DialogDescription className="text-white/80">
                  Perfil completo do estudante
                </DialogDescription>
              </div>
               <Badge className={`${getStatusColor(formData.status)} border`}>
                {getStatusText(formData.status)}
              </Badge>
            </div>

            {hasChanges && (
              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-yellow-50 text-yellow-700 border border-yellow-200">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Alterações não salvas
                </Badge>
              </div>
            )}
          </DialogHeader>

          {/* CONTEÚDO SCROLLÁVEL */}
          <div className="flex-1 overflow-y-auto px-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5 mb-4">
                <TabsTrigger value="pessoal" className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">Pessoal</span>
                </TabsTrigger>
                <TabsTrigger value="academico" className="flex items-center gap-1">
                  <GraduationCap className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">Acadêmico</span>
                </TabsTrigger>
                <TabsTrigger value="financeiro" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">Financeiro</span>
                </TabsTrigger>
                <TabsTrigger value="desempenho" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">Desempenho</span>
                </TabsTrigger>
                <TabsTrigger value="emergencia" className="flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span className="hidden sm:inline text-xs">Emergência</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto pr-2">
                {/* Tab: Informações Pessoais */}
                <TabsContent value="pessoal" className="space-y-6 mt-0">
                  {/* Dados de Acesso */}
                  <Card className="border-2 border-[#F5821F]/30 bg-gradient-to-br from-orange-50/50 to-white">
                    <CardHeader className="bg-gradient-to-r from-[#F5821F]/10 to-transparent border-b-2 border-[#F5821F]/20">
                      <CardTitle className="flex items-center gap-2 text-[#F5821F]">
                        <Lock className="h-5 w-5" />
                        Dados de Acesso
                      </CardTitle>
                      <CardDescription>
                        Gerencie as credenciais de acesso do estudante
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center shadow-sm">
                            <Key className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">Senha de Acesso</p>
                            <p className="text-sm text-slate-500">Última alteração: {new Date().toLocaleDateString('pt-BR')}</p>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowPasswordReset(true)}
                          variant="outline"
                          className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white transition-colors"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Resetar Senha
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Informações Pessoais */}
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <User className="h-5 w-5" />
                        Informações Pessoais
                      </CardTitle>
                      <CardDescription>
                        Dados básicos do estudante
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-700 font-semibold">Nome Completo</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            disabled={!isEditing}
                            className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-slate-700 font-semibold">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              disabled={!isEditing}
                              className="pl-10 border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-slate-700 font-semibold">Telefone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              disabled={!isEditing}
                              className="pl-10 border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="birthDate" className="text-slate-700 font-semibold">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => handleInputChange('birthDate', e.target.value)}
                            disabled={!isEditing}
                            className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address" className="text-slate-700 font-semibold">Endereço</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            disabled={!isEditing}
                            className="pl-10 border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Acadêmico */}
                <TabsContent value="academico" className="space-y-6 mt-0">
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <GraduationCap className="h-5 w-5" />
                        Informações Acadêmicas
                      </CardTitle>
                      <CardDescription>
                        Dados escolares e turma
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="level" className="text-slate-700 font-semibold">Nível</Label>
                          <Select 
                            value={formData.level} 
                            onValueChange={(value) => handleInputChange('level', value)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700">
                              <SelectValue placeholder="Selecionar nível" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A1">A1 - Básico</SelectItem>
                              <SelectItem value="A2">A2 - Elementar</SelectItem>
                              <SelectItem value="B1">B1 - Intermediário</SelectItem>
                              <SelectItem value="B2">B2 - Intermediário Superior</SelectItem>
                              <SelectItem value="C1">C1 - Avançado</SelectItem>
                              <SelectItem value="C2">C2 - Proficiência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="enrollmentDate" className="text-slate-700 font-semibold">Data de Matrícula</Label>
                          <Input
                            id="enrollmentDate"
                            type="date"
                            value={formData.enrollmentDate}
                            onChange={(e) => handleInputChange('enrollmentDate', e.target.value)}
                            disabled={!isEditing}
                            className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status" className="text-slate-700 font-semibold">Status</Label>
                          <Select 
                            value={formData.status} 
                            onValueChange={(value) => handleInputChange('status', value)}
                            disabled={!isEditing}
                          >
                            <SelectTrigger className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                              <SelectItem value="suspended">Suspenso</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="notes" className="text-slate-700 font-semibold">Observações</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => handleInputChange('notes', e.target.value)}
                          placeholder="Observações sobre o estudante..."
                          rows={3}
                          disabled={!isEditing}
                          className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Turma Atual */}
                  <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b-2 border-blue-200">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <BookOpen className="h-5 w-5" />
                        Turma Atual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-4 bg-white border-2 border-slate-200 rounded-xl text-center">
                          <p className="text-xs text-slate-600 font-semibold mb-1">Turma</p>
                          <p className="font-bold text-lg text-[#004B87]">{student.className}</p>
                        </div>
                        <div className="p-4 bg-white border-2 border-slate-200 rounded-xl text-center">
                          <p className="text-xs text-slate-600 font-semibold mb-1">Horário</p>
                          <p className="font-semibold text-sm text-slate-700">Seg/Qua</p>
                          <p className="text-xs text-slate-500">14:00-15:30</p>
                        </div>
                        <div className="p-4 bg-white border-2 border-slate-200 rounded-xl text-center">
                          <p className="text-xs text-slate-600 font-semibold mb-1">Sala</p>
                          <p className="font-bold text-2xl text-[#004B87]">105</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Financeiro */}
                <TabsContent value="financeiro" className="space-y-6 mt-0">
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <DollarSign className="h-5 w-5" />
                        Informações Financeiras
                      </CardTitle>
                      <CardDescription>
                        Status de pagamentos e mensalidades
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="text-center p-6 bg-gradient-to-br from-[#004B87]/10 to-[#F5821F]/10 border-2 border-[#004B87]/20 rounded-xl">
                        <div className="text-3xl font-bold bg-gradient-to-r from-[#004B87] to-[#F5821F] bg-clip-text text-transparent">
                          {formatCurrency(performanceData.monthlyFee)}
                        </div>
                        <div className="text-sm text-slate-600 font-medium mt-1">Mensalidade</div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                          <p className="text-sm text-green-700 font-semibold mb-1">Total Pago</p>
                          <p className="text-xl font-bold text-green-600">
                            {formatCurrency(performanceData.totalPaid)}
                          </p>
                        </div>
                        <div className="p-4 border-2 border-slate-200 rounded-xl">
                          <p className="text-sm text-slate-600 font-semibold mb-1">Status</p>
                          <Badge className={performanceData.paymentStatus === 'up-to-date' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                            {performanceData.paymentStatus === 'up-to-date' ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Em Dia</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> Em Atraso</>
                            )}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                          <span className="text-sm text-slate-600 font-medium">Último Pagamento</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(performanceData.lastPayment).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-xl">
                          <span className="text-sm text-slate-600 font-medium">Próximo Vencimento</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(performanceData.nextPaymentDue).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      {onViewPaymentDetails && (
                        <Button
                          onClick={() => onViewPaymentDetails(student)}
                          className="w-full bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white shadow-md"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Ver Histórico Completo
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Desempenho */}
                <TabsContent value="desempenho" className="space-y-6 mt-0">
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <TrendingUp className="h-5 w-5" />
                        Resumo de Performance
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-6 bg-green-50 border-2 border-green-200 rounded-xl shadow-sm">
                          <div className="text-4xl font-bold text-green-600">
                            {performanceData.currentGrade.toFixed(1)}
                          </div>
                          <div className="text-sm text-green-700 font-medium mt-1">Nota Atual</div>
                        </div>

                        <div className="text-center p-6 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl shadow-sm">
                          <div className="text-4xl font-bold text-white">
                            {performanceData.attendance}%
                          </div>
                          <div className="text-sm text-white/90 font-medium mt-1">Presença</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <span className="text-sm text-slate-600 font-medium">Aulas Assistidas</span>
                          <span className="font-bold text-[#004B87]">
                            {performanceData.attendedLessons}/{performanceData.totalLessons}
                          </span>
                        </div>
                        <div className="flex justify-between p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                          <span className="text-sm text-slate-600 font-medium">Trabalhos Entregues</span>
                          <span className="font-bold text-[#004B87]">
                            {performanceData.assignmentsSubmitted}/{performanceData.totalAssignments}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notas */}
                  <Card className="border-2 border-slate-200">
                    <CardHeader className="bg-slate-50 border-b-2 border-slate-200">
                      <CardTitle className="flex items-center gap-2 text-[#004B87]">
                        <Award className="h-5 w-5" />
                        Avaliações
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-6">
                      <div className="flex justify-between items-center p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">1ª Avaliação</p>
                          <p className="text-xs text-slate-500">15/01/2025</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">17.5</p>
                          <p className="text-xs text-slate-500">de 20</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-green-50 border-2 border-green-200 rounded-xl">
                        <div>
                          <p className="font-semibold text-slate-800">2ª Avaliação</p>
                          <p className="text-xs text-slate-500">22/01/2025</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">18.0</p>
                          <p className="text-xs text-slate-500">de 20</p>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl opacity-60">
                        <div>
                          <p className="font-semibold text-slate-800">3ª Avaliação</p>
                          <p className="text-xs text-slate-500">05/02/2025</p>
                        </div>
                        <Badge variant="outline" className="border-slate-300">Pendente</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tab: Emergência */}
                <TabsContent value="emergencia" className="space-y-6 mt-0">
                  <Card className="border-2 border-red-200">
                    <CardHeader className="bg-red-50 border-b-2 border-red-200">
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="h-5 w-5" />
                        Contatos de Emergência
                      </CardTitle>
                      <CardDescription>
                        Informações para situações de emergência
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="parentName" className="text-slate-700 font-semibold">Nome do Responsável</Label>
                          <Input
                            id="parentName"
                            value={formData.parentName}
                            onChange={(e) => handleInputChange('parentName', e.target.value)}
                            disabled={!isEditing}
                            className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="parentPhone" className="text-slate-700 font-semibold">Telefone do Responsável</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="parentPhone"
                              value={formData.parentPhone}
                              onChange={(e) => handleInputChange('parentPhone', e.target.value)}
                              disabled={!isEditing}
                              className="pl-10 border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyContact" className="text-slate-700 font-semibold">Contato de Emergência</Label>
                          <Input
                            id="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                            disabled={!isEditing}
                            className="border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="emergencyPhone" className="text-slate-700 font-semibold">Telefone de Emergência</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="emergencyPhone"
                              value={formData.emergencyPhone}
                              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                              disabled={!isEditing}
                              className="pl-10 border-2 border-slate-200 disabled:bg-slate-50 disabled:text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-red-900 text-sm">Informação Importante</p>
                            <p className="text-red-700 text-sm mt-1">
                              Mantenha estes contatos sempre atualizados. Em caso de emergência, 
                              eles serão contatados imediatamente.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* FOOTER FIXO COM BOTÕES */}
          <div className="flex items-center justify-between pt-4 border-t bg-white -mx-6 -mb-6 px-6 pb-6 rounded-b-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {hasChanges ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Existem alterações não salvas</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Perfil está atualizado</span>
                </>
              )}
            </div>
            
            <div className="flex gap-3">
              {!isEditing ? (
                <>
                  <Button 
                    onClick={onClose}
                    variant="outline"
                    className="border-2 border-slate-300"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Fechar
                  </Button>
                  <Button 
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Informações
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancelEdit} className="border-2 border-slate-300">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className="bg-gradient-to-r from-[#004B87] to-[#0066B3] hover:from-[#003666] hover:to-[#004B87] text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <AlertDialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-xl flex items-center justify-center shadow-sm">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-[#004B87]">Resetar Senha</AlertDialogTitle>
                <AlertDialogDescription>
                  Defina uma nova senha para {student?.name}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10 border-2 border-slate-200"
                  placeholder="Digite a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700 font-semibold">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10 pr-10 border-2 border-slate-200"
                  placeholder="Confirme a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-slate-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-xs text-slate-600">
                ℹ️ A senha deve ter no mínimo 6 caracteres
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setPasswordData({ password: '', confirmPassword: '' });
                setPasswordError('');
              }}
              className="border-2 border-slate-300"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
            >
              <Key className="h-4 w-4 mr-2" />
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}