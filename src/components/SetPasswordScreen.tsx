import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, ShieldCheck, ShieldAlert } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import apiClient from "@/services/api";
import { cn } from "@/lib/utils";

export function SetPasswordScreen() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { user, clearMustChangePassword, resetContext } = useAuthStore();
  const navigate = useNavigate();

  const role = user?.role ?? '';
  const username = user?.username ?? '';
  const isAdminReset = resetContext === 'admin_reset';

  // Regras de validação da senha
  const rules = [
    { label: "Mínimo 6 caracteres", ok: newPassword.length >= 6 },
    { label: "As senhas coincidem", ok: newPassword.length > 0 && newPassword === confirmPassword },
  ];
  const allOk = rules.every(r => r.ok);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allOk) return;
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiClient.put("/api/change_password.php", {
        new_password: newPassword,
        confirm_password: confirmPassword,
        is_first_access: true,
      });

      if (response.data?.success) {
        setSuccess(true);
        clearMustChangePassword();

        // Redirecionar para o dashboard correto após 2 segundos
        setTimeout(() => {
          switch (role) {
            case 'admin':       navigate('/admin/dashboard', { replace: true }); break;
            case 'academic_admin': navigate('/academic-admin/dashboard', { replace: true }); break;
            case 'docente':     navigate('/teacher/dashboard', { replace: true }); break;
            case 'aluno':       navigate('/student/dashboard', { replace: true }); break;
            default:            navigate('/dashboard', { replace: true });
          }
        }, 2000);
      } else {
        setError(response.data?.message || "Erro ao definir senha. Tente novamente.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Erro ao definir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#004B87] to-[#003A6B] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">Senha Definida com Sucesso!</h2>
          <p className="text-slate-500">A sua senha foi guardada em segurança. A redirecionar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#004B87] to-[#003A6B] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full">

        {/* Header */}
        {isAdminReset ? (
          <div className="bg-gradient-to-r from-[#7C2D12] to-[#C2410C] px-8 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="h-8 w-8 text-orange-300" />
            </div>
            <h1 className="text-2xl font-black mb-1">Redefinição de Senha</h1>
            <p className="text-orange-200 text-sm">
              Olá, <span className="font-bold text-white">{user?.nome || username}</span>
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] px-8 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-[#F5821F]" />
            </div>
            <h1 className="text-2xl font-black mb-1">Primeiro Acesso</h1>
            <p className="text-blue-200 text-sm">
              Bem-vindo, <span className="font-bold text-white">{user?.nome || username}</span>!
            </p>
          </div>
        )}

        {/* Body */}
        <div className="px-8 py-8">
          {isAdminReset ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-800 leading-relaxed">
                  <strong>Alerta de Segurança:</strong> Detectámos que a sua senha foi resetada pelo administrador.
                  Por motivos de segurança, é necessário que defina uma nova senha pessoal para continuar a aceder ao sistema.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <p className="text-[13px] text-amber-800 leading-relaxed">
                Detectámos que este é o seu <strong>primeiro acesso</strong> ao sistema.
                Por segurança, defina agora a sua senha pessoal.
              </p>
            </div>
          )}

          {/* Username info */}
          <div className="bg-slate-50 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
            <Lock className="h-4 w-4 text-slate-400 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">O seu username</p>
              <p className="font-mono font-bold text-[#004B87]">{username}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nova senha */}
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="h-12 rounded-xl pr-12 font-mono"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar senha */}
            <div className="space-y-2">
              <Label className="font-semibold text-slate-700">Confirmar Senha</Label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={cn(
                    "h-12 rounded-xl pr-12 font-mono",
                    confirmPassword && newPassword !== confirmPassword && "border-red-400 bg-red-50"
                  )}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Indicadores de validação */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5">
                {rules.map((rule) => (
                  <div key={rule.label} className="flex items-center gap-2 text-[12px]">
                    <CheckCircle2
                      className={cn("h-3.5 w-3.5 flex-shrink-0", rule.ok ? "text-green-500" : "text-slate-300")}
                    />
                    <span className={rule.ok ? "text-green-700" : "text-slate-400"}>{rule.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!allOk || isLoading}
              className="w-full h-12 bg-[#F5821F] hover:bg-[#E07318] text-white rounded-xl font-bold text-base disabled:opacity-50 shadow-lg shadow-orange-500/20"
            >
              {isLoading ? "A guardar..." : isAdminReset ? "Definir Nova Senha" : "Definir Senha e Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
