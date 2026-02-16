import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertTriangle,
  Key,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Users
} from "lucide-react";
import { SystemUser } from "../Users/UsersList";

interface UserCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: SystemUser | null;
  onResetPassword?: (userId: number) => void;
}

export function UserCredentialsModal({
  isOpen,
  onClose,
  user,
  onResetPassword
}: UserCredentialsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!user) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a area de transferencia`);
  };

  const handleResetPassword = () => {
    if (confirm(`Tem certeza que deseja resetar a senha de ${user.name}?`)) {
      setIsResetting(true);
      if (onResetPassword) {
        onResetPassword(user.id);
      }
      setTimeout(() => {
        setIsResetting(false);
        toast.success("Senha resetada com sucesso. Nova senha enviada por email.");
      }, 1500);
    }
  };

  const getRoleInfo = () => {
    const roles: Record<string, { label: string; icon: any; gradient: string; badgeClass: string }> = {
      admin: {
        label: "Super Admin",
        icon: Shield,
        gradient: "from-red-500 to-rose-600",
        badgeClass: "bg-red-100 text-red-700 border-red-200"
      },
      academic_admin: {
        label: "Academic Admin",
        icon: Briefcase,
        gradient: "from-purple-500 to-violet-600",
        badgeClass: "bg-purple-100 text-purple-700 border-purple-200"
      },
      teacher: {
        label: "Docente",
        icon: Users,
        gradient: "from-blue-500 to-cyan-600",
        badgeClass: "bg-blue-100 text-blue-700 border-blue-200"
      },
      student: {
        label: "Estudante",
        icon: GraduationCap,
        gradient: "from-green-500 to-emerald-600",
        badgeClass: "bg-green-100 text-green-700 border-green-200"
      }
    };
    return roles[user.role] || roles.student;
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${roleInfo.gradient} px-6 pt-6 pb-8 relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                Credenciais de Acesso
              </DialogTitle>
            </DialogHeader>

            {/* User card */}
            <div className="mt-4 flex items-center gap-4">
              <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <span className="text-white font-bold text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
                <p className="text-white/80 text-sm truncate">{user.email}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {roleInfo.label}
                  </Badge>
                  <Badge className={`text-xs ${
                    user.status === "active"
                      ? "bg-green-400/30 text-green-100 border-green-400/40"
                      : "bg-gray-400/30 text-gray-200 border-gray-400/40"
                  }`}>
                    {user.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 -mt-3 space-y-4">
          {/* Email field */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="h-7 w-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                </div>
                Email / Login
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(user.email, "Email")}
                className="h-7 px-2.5 text-xs text-slate-500 hover:text-[#004B87] hover:bg-blue-50"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="font-mono text-sm bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800">
              {user.email}
            </div>
          </div>

          {/* Password field */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="h-7 w-7 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Lock className="h-3.5 w-3.5 text-[#F5821F]" />
                </div>
                Senha
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="h-7 px-2.5 text-xs text-slate-500 hover:text-[#004B87] hover:bg-blue-50"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    Ocultar
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    Mostrar
                  </>
                )}
              </Button>
            </div>
            <div className="font-mono text-sm bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800 tracking-widest">
              {showPassword ? "********" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            </div>
          </div>

          {/* Security notice */}
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-amber-800 mb-0.5">Seguranca</h4>
                <p className="text-xs text-amber-700 leading-relaxed">
                  As senhas sao criptografadas e nao podem ser visualizadas. Ao resetar, uma nova senha sera enviada para o email do usuario.
                </p>
              </div>
            </div>
          </div>

          {/* Access info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Criado em</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {new Date(user.createdAt).toLocaleDateString("pt-PT", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric"
                })}
              </p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Ultimo acesso</span>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    })
                  : "Nunca acessou"}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 border-2 border-slate-200 hover:border-slate-300 font-medium"
            >
              Fechar
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isResetting}
              className="flex-1 h-11 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-medium shadow-md hover:shadow-lg transition-all"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resetar Senha
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
