import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Loader2 } from "lucide-react";
import apiClient from "@/services/api";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setErrors({});
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Senha actual é obrigatória";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "Nova senha é obrigatória";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Mínimo 6 caracteres";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirme a nova senha";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "A nova senha deve ser diferente da actual";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await apiClient.put('/api/change_password.php', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword,
      });

      if (response.data.success) {
        toast.success("Senha alterada com sucesso!");
        handleClose();
      } else {
        toast.error(response.data.message || "Erro ao alterar senha");
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err.response?.data?.message || "Erro ao alterar senha";
      if (message.includes("incorreta")) {
        setErrors({ currentPassword: "Senha actual incorreta" });
      } else {
        toast.error(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStrength = () => {
    const len = formData.newPassword.length;
    if (len === 0) return null;
    if (len < 6) return { label: "Fraca", color: "bg-red-500", width: "w-1/3", text: "text-red-600" };
    if (len < 10) return { label: "Média", color: "bg-yellow-500", width: "w-2/3", text: "text-yellow-600" };
    return { label: "Forte", color: "bg-green-500", width: "w-full", text: "text-green-600" };
  };

  const strength = getStrength();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#004B87] flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Alterar Senha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Senha Actual */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              Senha Actual <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Digite a senha actual"
                value={formData.currentPassword}
                onChange={(e) => {
                  setFormData({ ...formData, currentPassword: e.target.value });
                  if (errors.currentPassword) setErrors({ ...errors, currentPassword: "" });
                }}
                className={`h-11 pr-10 ${errors.currentPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.currentPassword}
              </p>
            )}
          </div>

          <div className="h-px bg-slate-200" />

          {/* Nova Senha */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              Nova Senha <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="Digite a nova senha"
                value={formData.newPassword}
                onChange={(e) => {
                  setFormData({ ...formData, newPassword: e.target.value });
                  if (errors.newPassword) setErrors({ ...errors, newPassword: "" });
                }}
                className={`h-11 pr-10 ${errors.newPassword ? "border-red-500" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.newPassword}
              </p>
            )}
            {strength && (
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="text-slate-500">Força:</span>
                <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${strength.color} ${strength.width}`} />
                </div>
                <span className={`font-semibold ${strength.text}`}>{strength.label}</span>
              </div>
            )}
          </div>

          {/* Confirmar Nova Senha */}
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4 text-slate-500" />
              Confirmar Nova Senha <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirme a nova senha"
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

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-gradient-to-r from-[#004B87] to-[#0066B3] hover:from-[#003868] hover:to-[#004B87] text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Alterando...
              </>
            ) : (
              "Alterar Senha"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
