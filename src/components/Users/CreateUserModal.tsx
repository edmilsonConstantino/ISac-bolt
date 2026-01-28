import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Users,
  GraduationCap,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { SystemUser } from "./UsersList";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<SystemUser>) => void;
  userData?: SystemUser | null;
  isEditing?: boolean;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSave,
  userData,
  isEditing = false
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "student" as "admin" | "teacher" | "student",
    password: "",
    confirmPassword: "",
    status: "active" as "active" | "inactive"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && userData && isEditing) {
      setFormData({
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        role: userData.role,
        password: "",
        confirmPassword: "",
        status: userData.status
      });
    } else if (isOpen && !isEditing) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "student",
        password: "",
        confirmPassword: "",
        status: "active"
      });
    }
    setErrors({});
  }, [isOpen, userData, isEditing]);

  const roles = [
    {
      id: "admin",
      label: "Administrador",
      description: "Acesso total ao sistema",
      icon: Shield,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      textColor: "text-red-700"
    },
    {
      id: "teacher",
      label: "Docente",
      description: "Gerenciar turmas e estudantes",
      icon: Users,
      color: "from-blue-500 to-cyan-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-300",
      textColor: "text-blue-700"
    },
    {
      id: "student",
      label: "Estudante",
      description: "Acesso às informações acadêmicas",
      icon: GraduationCap,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      textColor: "text-green-700"
    }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter no mínimo 6 caracteres";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Confirme a senha";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    } else if (formData.password || formData.confirmPassword) {
      if (formData.password && formData.password.length < 6) {
        newErrors.password = "Senha deve ter no mínimo 6 caracteres";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast.error("Por favor, corrija os erros no formulário");
      return;
    }

    const dataToSave: Partial<SystemUser> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      role: formData.role,
      status: formData.status,
    };

    if (!isEditing && formData.password) {
      (dataToSave as any).password = formData.password;
    } else if (isEditing && formData.password) {
      (dataToSave as any).newPassword = formData.password;
    }

    onSave(dataToSave);
    onClose();
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$%";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password, confirmPassword: password });
    toast.success("Senha gerada automaticamente");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#004B87] flex items-center gap-2">
            <User className="h-6 w-6" />
            {isEditing ? "Editar Usuário" : "Criar Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 block">
              Tipo de Usuário <span className="text-red-500">*</span>
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = formData.role === role.id;

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: role.id as any })}
                    className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? `${role.borderColor} ${role.bgColor} shadow-lg`
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-2 -right-2">
                        <div className={`h-5 w-5 bg-gradient-to-br ${role.color} rounded-full flex items-center justify-center`}>
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isSelected ? `bg-gradient-to-br ${role.color}` : "bg-slate-100"
                      }`}>
                        <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-slate-600"}`} />
                      </div>

                      <div className="flex-1">
                        <h3 className={`font-bold text-sm ${isSelected ? role.textColor : "text-slate-800"}`}>
                          {role.label}
                        </h3>
                        <p className={`text-xs mt-0.5 ${isSelected ? role.textColor : "text-slate-500"}`}>
                          {role.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-500" />
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="Digite o nome completo"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`h-11 ${errors.name ? "border-red-500" : ""}`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                className={`h-11 ${errors.email ? "border-red-500" : ""}`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                Telefone
              </Label>
              <Input
                placeholder="+258 XX XXX XXXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="h-11"
              />
            </div>

            <div>
              <Label className="text-sm font-semibold text-slate-700 mb-2">
                Status
              </Label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full h-11 px-3 border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:outline-none"
              >
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
          </div>

          {(!isEditing || (isEditing && (formData.password || formData.confirmPassword))) && (
            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-700">
                  {isEditing ? "Alterar Senha (opcional)" : "Definir Senha"}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={generatePassword}
                  className="text-xs text-[#F5821F] hover:text-[#004B87] flex items-center gap-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Gerar Senha
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    {isEditing ? "Nova Senha" : "Senha"} {!isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite a senha"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        if (errors.password) setErrors({ ...errors, password: "" });
                      }}
                      className={`h-11 pr-10 ${errors.password ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-500" />
                    Confirmar Senha {!isEditing && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme a senha"
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: "" });
                      }}
                      className={`h-11 pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {formData.password && formData.password.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600">Força da senha:</span>
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          formData.password.length < 6
                            ? "w-1/3 bg-red-500"
                            : formData.password.length < 10
                            ? "w-2/3 bg-yellow-500"
                            : "w-full bg-green-500"
                        }`}
                      ></div>
                    </div>
                    <span
                      className={`font-semibold ${
                        formData.password.length < 6
                          ? "text-red-600"
                          : formData.password.length < 10
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {formData.password.length < 6 ? "Fraca" : formData.password.length < 10 ? "Média" : "Forte"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white"
          >
            {isEditing ? "Atualizar Usuário" : "Criar Usuário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
