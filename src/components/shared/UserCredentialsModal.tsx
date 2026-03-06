import { useState, useEffect, ComponentType } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ConfirmModal } from "@/components/shared/reusable/ConfirmModal";
import { toast } from "sonner";
import {
  Lock,
  Shield,
  Copy,
  RefreshCw,
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
import userService from "@/services/userService";

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
  const [lastAccess, setLastAccess] = useState<string | null>(null);
  const [loadingLastAccess, setLoadingLastAccess] = useState(false);

  // Busca o último acesso ao abrir — usa lastLogin do user object ou vai buscar ao access_logs
  useEffect(() => {
    if (!isOpen || !user) return;

    if (user.lastLogin) {
      setLastAccess(user.lastLogin);
      return;
    }

    setLoadingLastAccess(true);
    userService.getAccessLogs({
      user_id: user.id,
      user_type: user.role,
      status: 'success',
      limit: 1,
    })
      .then(response => {
        const latest = response.data[0];
        setLastAccess(latest?.created_at ?? null);
      })
      .catch(() => setLastAccess(null))
      .finally(() => setLoadingLastAccess(false));
  }, [isOpen, user]);

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
      if (user.role === 'student') {
        await apiClient.put('/api/students.php', { id: user.id, password: tempPassword });
      } else if (user.role === 'teacher') {
        await apiClient.put('/api/professores.php', { id: user.id, password: tempPassword });
      } else {
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
    setLastAccess(null);
    onClose();
  };

  const getRoleInfo = () => {
    const roles: Record<string, { label: string; icon: ComponentType<{ className?: string }> }> = {
      admin:          { label: "Super Admin",    icon: Shield      },
      academic_admin: { label: "Academic Admin", icon: Briefcase   },
      teacher:        { label: "Docente",        icon: Users       },
      student:        { label: "Estudante",      icon: GraduationCap },
    };
    return roles[user.role] || roles.student;
  };

  const roleInfo = getRoleInfo();
  const RoleIcon = roleInfo.icon;
  const hasFirstAccess = user.role === 'student' || user.role === 'teacher';

  return (
    <>
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-4 py-3 rounded-t-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white">
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-xl flex items-center justify-center font-black text-lg text-white shadow-lg shadow-orange-500/25">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#004B87] ${user.status === 'active' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-bold block leading-tight truncate">{user.name}</span>
                <span className="text-xs text-white/70 font-mono block mt-0.5 truncate">
                  {user.username || user.email || 'Sem identificador'}
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge className="bg-white/20 text-white border-white/30 text-[10px] px-1.5 py-0">
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {roleInfo.label}
                  </Badge>
                  <Badge className={`text-[10px] px-1.5 py-0 ${
                    user.status === 'active'
                      ? 'bg-emerald-400/25 text-emerald-100 border-emerald-400/40'
                      : 'bg-slate-400/25 text-slate-200 border-slate-400/40'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ── Corpo ───────────────────────────────────────────── */}
        <div className="px-3 py-2.5 space-y-2">

          {/* Credenciais */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004B87]/5 border-b border-slate-100">
              <Key className="h-3 w-3 text-[#004B87]" />
              <span className="text-[10px] font-bold text-[#004B87] uppercase tracking-wide">Credenciais de Acesso</span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between gap-2 px-3 py-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Mail className="h-3.5 w-3.5 text-[#004B87] flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">
                      {user.username ? 'Username / Login' : 'Email / Login'}
                    </p>
                    <p className="font-mono text-xs text-slate-800 truncate">
                      {user.username || user.email || 'N/A'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(user.username || user.email || '', user.username ? "Username" : "Email")}
                  className="h-6 px-2 text-[10px] text-slate-400 hover:text-[#004B87] hover:bg-blue-50 rounded flex items-center gap-1 flex-shrink-0 transition-colors"
                >
                  <Copy className="h-2.5 w-2.5" /> Copiar
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2">
                <Lock className="h-3.5 w-3.5 text-[#F5821F] flex-shrink-0" />
                <div>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">Senha</p>
                  <p className="font-mono text-xs text-slate-400 tracking-widest select-none">••••••••</p>
                </div>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-slate-100">
              <Shield className="h-3 w-3 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Segurança</span>
            </div>
            <p className="px-3 py-2 text-[11px] text-slate-500 leading-relaxed">
              Senhas cifradas — não visíveis.
              {hasFirstAccess
                ? " No reset, a senha temporária = username; utilizador define nova senha no 1.º acesso."
                : " No reset, a senha temporária = username."}
            </p>
          </div>

          {/* Sucesso */}
          {resetDone && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <p className="text-xs text-green-700">
                <strong>Senha redefinida.</strong> {user.name} deverá definir nova senha no próximo acesso.
              </p>
            </div>
          )}

          {/* Datas */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="h-2.5 w-2.5 text-slate-400" />
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">Criado em</span>
              </div>
              <p className="text-xs font-bold text-slate-700">
                {new Date(user.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })}
              </p>
            </div>
            <div className="bg-white rounded-lg px-3 py-2 border border-slate-100">
              <div className="flex items-center gap-1 mb-0.5">
                <Clock className="h-2.5 w-2.5 text-slate-400" />
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wide">Último acesso</span>
              </div>
              <p className="text-xs font-bold text-slate-700">
                {loadingLastAccess
                  ? <span className="text-slate-400 font-normal">A carregar...</span>
                  : lastAccess
                    ? new Date(lastAccess).toLocaleString("pt-PT", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                    : <span className="text-slate-400 font-normal">Nunca acessou</span>
                }
              </p>
            </div>
          </div>

        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="flex justify-end gap-2 p-3 border-t border-slate-200 bg-white">
          <Button variant="outline" onClick={handleClose}
            className="h-8 px-3 text-xs border border-slate-300"
          >
            Fechar
          </Button>
          {!resetDone && (
            <button
              onClick={() => setConfirmReset(true)}
              disabled={isResetting}
              className="h-8 px-3 text-xs rounded-lg bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-3 w-3" /> Resetar Senha
            </button>
          )}
        </div>

      </DialogContent>
    </Dialog>

    {/* ── Confirm Reset (overlay via ConfirmModal) ─────────── */}
    <ConfirmModal
      isOpen={confirmReset && !resetDone}
      variant="danger"
      title="Confirmar Redefinição"
      subtitle="Esta acção não pode ser desfeita"
      message={`A senha de "${user.name}" será redefinida para o username (${user.username || user.email}).${hasFirstAccess ? ' O utilizador será obrigado a definir uma nova senha no próximo acesso.' : ''}`}
      confirmLabel={isResetting ? "A redefinir..." : "Confirmar Reset"}
      cancelLabel="Cancelar"
      onConfirm={handleResetPassword}
      onCancel={() => setConfirmReset(false)}
    />
    </>
  );
}
