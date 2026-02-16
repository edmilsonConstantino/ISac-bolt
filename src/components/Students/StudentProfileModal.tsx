// src/components/Students/StudentProfileModal.tsx - USANDO ProfileModalBase

import { useState, useEffect } from "react";
import { ProfileModalBase, ProfileTab, PROFILE_MODAL_STYLES } from "@/components/shared/ProfileModalBase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
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
  User,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  BookOpen,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Activity,
  Lock,
  Key,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [activeTab, setActiveTab] = useState('perfil');

  // Mock data para desempenho
  const performanceData = {
    currentGrade: 8.5,
    attendance: 92,
    totalLessons: 48,
    attendedLessons: 44,
    monthlyFee: 2500,
    totalPaid: 25000,
    paymentStatus: 'up-to-date' as const
  };

  useEffect(() => {
    if (student && isOpen) {
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
      setIsEditing(false);
      setErrors({});
      setActiveTab('perfil');
    }
  }, [student, isOpen]);

  if (!student || !formData) return null;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Nome é obrigatório";
    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEdit = () => { setIsEditing(true); setErrors({}); };
  const handleCancel = () => {
    setIsEditing(false);
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
    setErrors({});
  };

  const handleSave = () => {
    if (!validateForm()) return;
    if (student) {
      const updatedStudent: Student = {
        ...student,
        ...formData
      };
      onSave(updatedStudent);
      setIsEditing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (newStatus: "active" | "inactive" | "suspended") => {
    if (isEditing) setFormData(prev => ({ ...prev, status: newStatus }));
  };

  const handlePasswordReset = () => {
    setPasswordError('');

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

  // ============================================================
  // DEFINIÇÃO DAS TABS
  // ============================================================
  const tabs: ProfileTab[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      color: PROFILE_MODAL_STYLES.tabs.blue,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Informações Pessoais */}
            <Card className="border-2 border-[#004B87]/20">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#004B87] text-sm">
                  <User className="h-4 w-4" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs text-slate-700 font-medium">
                    Nome Completo <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : "border-[#F5821F] focus:border-[#F5821F]"
                    )}
                  />
                  {errors.name && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.name}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs text-slate-700 font-medium">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={cn(
                        "h-9 text-sm pl-10",
                        !isEditing ? "bg-slate-50" : "border-[#F5821F] focus:border-[#F5821F]"
                      )}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.email}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs text-slate-700 font-medium">Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+258 84 000 0000"
                      disabled={!isEditing}
                      className={cn(
                        "h-9 text-sm pl-10",
                        !isEditing ? "bg-slate-50" : "border-[#F5821F] focus:border-[#F5821F]"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="birthDate" className="text-xs text-slate-700 font-medium">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : "border-[#F5821F] focus:border-[#F5821F]"
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs text-slate-700 font-medium">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={cn(
                        "h-9 text-sm pl-10",
                        !isEditing ? "bg-slate-50" : "border-[#F5821F] focus:border-[#F5821F]"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs text-slate-700 font-medium">Status</Label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      type="button"
                      variant={formData.status === "active" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("active")}
                      disabled={!isEditing}
                      className={cn(
                        "h-8 text-xs",
                        formData.status === "active"
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "border border-slate-200"
                      )}
                    >
                      Activo
                    </Button>

                    <Button
                      type="button"
                      variant={formData.status === "suspended" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("suspended")}
                      disabled={!isEditing}
                      className={cn(
                        "h-8 text-xs",
                        formData.status === "suspended"
                          ? "bg-amber-500 hover:bg-amber-600"
                          : "border border-slate-200"
                      )}
                    >
                      Suspenso
                    </Button>

                    <Button
                      type="button"
                      variant={formData.status === "inactive" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusChange("inactive")}
                      disabled={!isEditing}
                      className={cn(
                        "h-8 text-xs",
                        formData.status === "inactive"
                          ? "bg-slate-400 hover:bg-slate-500"
                          : "border border-slate-200"
                      )}
                    >
                      Inactivo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contatos de Emergência */}
            <Card className="border-2 border-red-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  Contatos de Emergência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="parentName" className="text-xs text-slate-700 font-medium">Nome do Responsável</Label>
                  <Input
                    id="parentName"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : "border-[#004B87] focus:border-[#004B87]"
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="parentPhone" className="text-xs text-slate-700 font-medium">Telefone do Responsável</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="parentPhone"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={cn(
                        "h-9 text-sm pl-10",
                        !isEditing ? "bg-slate-50" : "border-[#004B87] focus:border-[#004B87]"
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emergencyContact" className="text-xs text-slate-700 font-medium">Contato de Emergência</Label>
                  <Input
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : "border-[#004B87] focus:border-[#004B87]"
                    )}
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emergencyPhone" className="text-xs text-slate-700 font-medium">Telefone de Emergência</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={cn(
                        "h-9 text-sm pl-10",
                        !isEditing ? "bg-slate-50" : "border-[#004B87] focus:border-[#004B87]"
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados de Acesso */}
            <Card className="border-2 border-[#F5821F]/20 lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-[#F5821F] text-sm">
                  <Lock className="h-4 w-4" />
                  Dados de Acesso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-white border-2 border-[#F5821F]/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center">
                      <Key className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">Senha de Acesso</p>
                      <p className="text-xs text-slate-500">Última alteração: 15/02/2026</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowPasswordReset(true)}
                    variant="outline"
                    size="sm"
                    className="border-2 border-[#F5821F] text-[#F5821F] hover:bg-[#F5821F] hover:text-white h-8 text-xs"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Resetar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: 'academico',
      label: 'Acadêmico',
      icon: GraduationCap,
      color: PROFILE_MODAL_STYLES.tabs.orange,
      content: (
        <div className="space-y-4">
          <Card className="border-2 border-[#F5821F]/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#F5821F] text-sm">
                <GraduationCap className="h-4 w-4" />
                Informações Acadêmicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="level" className="text-xs text-slate-700 font-medium">Nível</Label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleSelectChange('level', value)}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : ""
                    )}>
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

                <div className="space-y-1">
                  <Label htmlFor="enrollmentDate" className="text-xs text-slate-700 font-medium">Data de Matrícula</Label>
                  <Input
                    id="enrollmentDate"
                    name="enrollmentDate"
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-sm",
                      !isEditing ? "bg-slate-50" : "border-[#004B87] focus:border-[#004B87]"
                    )}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-xs text-slate-700 font-medium">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleTextareaChange}
                  className={cn(
                    "text-sm h-20 resize-none",
                    !isEditing ? "bg-slate-50 border-slate-200" : "border-[#004B87] focus:border-[#004B87] focus:outline-none"
                  )}
                  disabled={!isEditing}
                />
              </div>
            </CardContent>
          </Card>

          {/* Turma Atual */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#004B87] text-sm">
                <BookOpen className="h-4 w-4" />
                Turma Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-white border-2 border-slate-200 rounded-lg text-center">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Turma</p>
                  <p className="font-bold text-sm text-[#004B87]">{student.className || 'N/A'}</p>
                </div>
                <div className="p-3 bg-white border-2 border-slate-200 rounded-lg text-center">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Horário</p>
                  <p className="font-semibold text-xs text-slate-700">Seg/Qua</p>
                  <p className="text-xs text-slate-500">14:00-15:30</p>
                </div>
                <div className="p-3 bg-white border-2 border-slate-200 rounded-lg text-center">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Sala</p>
                  <p className="font-bold text-lg text-[#004B87]">105</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações Financeiras */}
          <Card className="border-2 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600 text-sm">
                <DollarSign className="h-4 w-4" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-white border-2 border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(performanceData.monthlyFee)}
                </div>
                <div className="text-xs text-slate-600 font-medium mt-1">Mensalidade</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 border-2 border-green-200 rounded-lg">
                  <p className="text-xs text-green-700 font-semibold mb-1">Total Pago</p>
                  <p className="text-base font-bold text-green-600">
                    {formatCurrency(performanceData.totalPaid)}
                  </p>
                </div>
                <div className="p-3 border-2 border-slate-200 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold mb-1">Status</p>
                  <Badge className="bg-green-500 hover:bg-green-600 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" /> Em Dia
                  </Badge>
                </div>
              </div>

              {onViewPaymentDetails && (
                <Button
                  onClick={() => onViewPaymentDetails(student)}
                  className="w-full bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white h-9 text-sm"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Ver Histórico Completo
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: Activity,
      color: PROFILE_MODAL_STYLES.tabs.purple,
      content: (
        <Card className="border-2 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-600 text-sm">
              <Activity className="h-4 w-4" />
              Histórico de Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {performanceData.currentGrade.toFixed(1)}
                </div>
                <div className="text-xs text-green-700 font-medium mt-1">Nota Atual</div>
              </div>

              <div className="text-center p-4 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-lg">
                <div className="text-3xl font-bold text-white">
                  {performanceData.attendance}%
                </div>
                <div className="text-xs text-white/90 font-medium mt-1">Presença</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <span className="text-xs text-slate-600 font-medium">Aulas Assistidas</span>
                <span className="font-bold text-xs text-[#004B87]">
                  {performanceData.attendedLessons}/{performanceData.totalLessons}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <>
      <ProfileModalBase
        isOpen={isOpen}
        onClose={onClose}
        title={formData.name}
        headerIcon={User}
        status={formData.status}
        isEditing={isEditing}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        showEditButton={true}
      />

      {/* Password Reset Dialog */}
      <AlertDialog open={showPasswordReset} onOpenChange={setShowPasswordReset}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-xl flex items-center justify-center">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div>
                <AlertDialogTitle className="text-[#004B87]">Resetar Senha</AlertDialogTitle>
                <AlertDialogDescription className="text-xs">
                  Defina uma nova senha para {student?.name}
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-slate-700 font-semibold">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.password}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                  className="pl-10 pr-10 h-9 text-sm"
                  placeholder="Digite a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-xs text-slate-700 font-semibold">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="pl-10 pr-10 h-9 text-sm"
                  placeholder="Confirme a nova senha"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-slate-700"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {passwordError && (
              <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <p className="text-xs text-red-700">{passwordError}</p>
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
              className="text-xs h-9"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white text-xs h-9"
            >
              <Key className="h-3 w-3 mr-1" />
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
