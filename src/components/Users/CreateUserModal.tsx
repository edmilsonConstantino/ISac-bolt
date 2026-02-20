import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  User,
  Lock,
  Shield,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Hash
} from "lucide-react";
import { SystemUser } from "./UsersList";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Partial<SystemUser>) => void;
  userData?: SystemUser | null;
  isEditing?: boolean;
  currentUserRole?: string;
}

export function CreateUserModal({
  isOpen,
  onClose,
  onSave,
  userData,
  isEditing = false,
  currentUserRole = 'admin'
}: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    role: "admin" as string,
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
        role: userData.role,
        password: "",
        confirmPassword: "",
        status: userData.status
      });
    } else if (isOpen && !isEditing) {
      setFormData({
        name: "",
        role: "admin",
        password: "",
        confirmPassword: "",
        status: "active"
      });
    }
    setErrors({});
  }, [isOpen, userData, isEditing]);

  // Apenas Super Admin e Academic Admin podem ser criados aqui.
  // Docentes são criados via "Criar Docente" e Estudantes via "Inscrição".
  const roles = [
    {
      id: "admin",
      label: "Super Admin",
      description: "Acesso total ao sistema",
      icon: Shield,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-300",
      textColor: "text-red-700",
      usernamePrefix: "SPADN"
    },
    {
      id: "academic_admin",
      label: "Academic Admin",
      description: "Gestão académica sem acesso total",
      icon: Briefcase,
      color: "from-purple-500 to-violet-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      textColor: "text-purple-700",
      usernamePrefix: "ACADN"
    }
  ];

  const getUsernamePreview = () => {
    const selectedRole = roles.find(r => r.id === formData.role);
    if (!selectedRole) return "";

    const name = formData.name.trim().toUpperCase();
    const parts = name.split(/\s+/).filter(Boolean);

    let initials = "";
    if (parts.length > 0) {
      const firstTwo = parts[0].replace(/[^A-Z]/g, "").substring(0, 2);
      const lastInitial = parts.length > 1
        ? parts[parts.length - 1].replace(/[^A-Z]/g, "").substring(0, 1)
        : "";
      initials = firstTwo + lastInitial;
    }

    if (initials.length < 2) {
      initials = initials.padEnd(2, "X");
    }

    return `${selectedRole.usernamePrefix}${initials}0001`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

          {/* Username preview */}
          {!isEditing && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Username Gerado Automaticamente</span>
              </div>
              <p className="text-lg font-mono font-bold text-[#004B87]">
                {getUsernamePreview()}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Formato: {formData.role === 'admin' ? 'SPADN' : 'ACADN'} + 2 primeiras letras do nome + 1ª letra do apelido + número sequencial. O número real será atribuído pelo sistema.
              </p>
            </div>
          )}

          {isEditing && userData?.username && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Hash className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">Username</span>
              </div>
              <p className="text-lg font-mono font-bold text-[#004B87]">
                {userData.username}
              </p>
            </div>
          )}

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
