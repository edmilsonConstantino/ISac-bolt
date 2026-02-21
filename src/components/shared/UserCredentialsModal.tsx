import { useState, ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Lock,
  Shield,
  Copy,
  RefreshCw,
  AlertTriangle,
  Key,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Users,
  ShieldAlert,
  CheckCircle2,
  Mail,
} from "lucide-react";
import { SystemUser } from "../Users/UsersList";
import apiClient from "@/services/api";

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
  const [isResetting, setIsResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  if (!user) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  const handleResetPassword = async () => {
    const tempPassword = user.username || user.email || '';
    if (!tempPassword) {
      toast.error("Não foi possível determinar a senha temporária.");
      return;
    }

    setIsResetting(true);
    try {
      // Chamar API conforme o tipo de utilizador
      if (user.role === 'student') {
        await apiClient.put('/api/students.php', { id: user.id, password: tempPassword });
      } else if (user.role === 'teacher') {
        await apiClient.put('/api/professores.php', { id: user.id, password: tempPassword });
      } else {
        // admin / academic_admin
        await apiClient.put('/api/users.php', { id: user.id, senha: tempPassword });
      }

      if (onResetPassword) onResetPassword(user.id);
      setResetDone(true);
      setConfirmReset(false);
      toast.success("Senha redefinida. O utilizador terá de definir uma nova senha no próximo acesso.");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao redefinir senha";
      toast.error(msg);
    } finally {
      setIsResetting(false);
    }
  };

  const handleClose = () => {
    setConfirmReset(false);
    setResetDone(false);
    onClose();
  };

  const getRoleInfo = () => {
    const roles: Record<string, { label: string; icon: ComponentType<{ className?: string }>; gradient: string }> = {
      admin: {
        label: "Super Admin",
        icon: Shield,
        gradient: "from-red-500 to-rose-600",
      },
      academic_admin: {
        label: "Academic Admin",
        icon: Briefcase,
        gradient: "from-purple-500 to-violet-600",
      },
      teacher: {
        label: "Docente",
        icon: Users,
        gradient: "from-blue-500 to-cyan-600",
      },
      student: {
        label: "Estudante",
        icon: GraduationCap,
        gradient: "from-green-500 to-emerald-600",
      }
    };
    return roles[user.role] || roles.student;
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;
  const hasFirstAccess = user.role === 'student' || user.role === 'teacher';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className={`bg-gradient-to-r ${roleInfo.gradient} px-6 pt-6 pb-8 relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
                <Key className="h-5 w-5" />
                Credenciais de Acesso
              </DialogTitle>
            </DialogHeader>

            <div className="mt-4 flex items-center gap-4">
              <div className="h-14 w-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <span className="text-white font-bold text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white truncate">{user.name}</h3>
                <p className="text-white/80 text-sm truncate">{user.username || user.email || 'Sem identificador'}</p>
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
          {/* Username / Login */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <div className="h-7 w-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-blue-600" />
                </div>
                {user.username ? 'Username / Login' : 'Email / Login'}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(user.username || user.email || '', user.username ? "Username" : "Email")}
                className="h-7 px-2.5 text-xs text-slate-500 hover:text-[#004B87] hover:bg-blue-50"
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
            <div className="font-mono text-sm bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-800">
              {user.username || user.email || 'N/A'}
            </div>
          </div>

          {/* Password — criptografada, não visualizável */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
              <div className="h-7 w-7 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="h-3.5 w-3.5 text-[#F5821F]" />
              </div>
              Senha
            </div>
            <div className="font-mono text-sm bg-slate-50 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-400 tracking-widest select-none">
              ••••••••••••
            </div>
          </div>

          {/* Security notice */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-0.5">Segurança</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  As senhas são cifradas e não podem ser visualizadas.
                  {hasFirstAccess
                    ? " Ao resetar, a senha temporária será o username. No próximo acesso, o utilizador será obrigado a definir uma nova senha pessoal."
                    : " Ao resetar, a senha temporária será o username do utilizador."}
                </p>
              </div>
            </div>
          </div>

          {/* Confirmation panel — shown when confirmReset is true */}
          {confirmReset && !resetDone && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <div className="flex items-start gap-3 mb-3">
                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-0.5">Confirmar redefinição de senha</p>
                  <p className="text-xs text-red-700 leading-relaxed">
                    A senha de <strong>{user.name}</strong> será redefinida para o seu username
                    {" "}<span className="font-mono font-bold">({user.username || user.email})</span>.
                    {hasFirstAccess && " O utilizador será obrigado a definir uma nova senha no próximo acesso ao sistema."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 h-9 text-xs border-red-200 text-red-600 hover:bg-red-100"
                  disabled={isResetting}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleResetPassword}
                  disabled={isResetting}
                  className="flex-1 h-9 text-xs bg-red-600 hover:bg-red-700 text-white"
                >
                  {isResetting ? (
                    <><RefreshCw className="h-3 w-3 mr-1.5 animate-spin" />A redefinir...</>
                  ) : (
                    "Confirmar Reset"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Success state */}
          {resetDone && (
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 leading-relaxed">
                Senha redefinida com sucesso. No próximo acesso, <strong>{user.name}</strong>{" "}
                {hasFirstAccess
                  ? "será solicitado a definir uma nova senha pessoal."
                  : "deverá usar o username como senha."}
              </p>
            </div>
          )}

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
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wide">Último acesso</span>
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
          <div className="flex gap-3 pt-1">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 border-2 border-slate-200 hover:border-slate-300 font-medium"
            >
              Fechar
            </Button>
            {!resetDone && (
              <Button
                onClick={() => setConfirmReset(true)}
                disabled={isResetting || confirmReset}
                className="flex-1 h-11 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Resetar Senha
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
