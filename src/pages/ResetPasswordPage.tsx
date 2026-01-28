import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Lock, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import authService from "@/services/authService";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Validacao de senha
  const hasMinLength = password.length >= 8;
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !isValid) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.resetPassword(token, password, confirmPassword);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao redefinir senha. O link pode ter expirado.");
    } finally {
      setIsLoading(false);
    }
  };

  // Token ausente
  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md overflow-hidden shadow-2xl border-0 bg-white">
          <div className="p-8 space-y-4 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-800">Link invalido</h2>
            <p className="text-slate-500 text-sm">
              O link de recuperacao e invalido ou esta incompleto.
              Solicite um novo link de recuperacao.
            </p>
            <Button
              onClick={() => navigate('/forgot-password')}
              className="w-full h-10 bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white font-semibold rounded-lg"
            >
              Solicitar novo link
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md overflow-hidden shadow-2xl border-0 bg-white">
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 bg-gradient-to-br from-[#0066B3] to-[#004B87] rounded-xl flex items-center justify-center">
                <img src="/image.png" alt="ISAC" className="h-6 w-6 object-contain" />
              </div>
              <span className="text-lg font-bold text-[#004B87]">ISAC</span>
            </div>
            <h2 className="text-2xl font-bold text-[#004B87]">
              Redefinir senha
            </h2>
            <p className="text-slate-500 text-sm">
              Escolha uma nova senha para a sua conta.
            </p>
          </div>

          {success ? (
            /* Sucesso */
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">
                      Senha alterada com sucesso
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      A sua senha foi actualizada. Faca login com a nova senha.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full h-10 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold rounded-lg"
              >
                Ir para o login
              </Button>
            </div>
          ) : (
            /* Formulario */
            <>
              {error && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nova senha */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Nova senha
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 pl-10 pr-10 text-sm border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                      disabled={isLoading}
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirmar senha */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-slate-700">
                    Confirmar senha
                  </Label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Repita a senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-10 pl-10 pr-3 text-sm border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {/* Indicadores de validacao */}
                {password.length > 0 && (
                  <div className="space-y-1 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-medium text-slate-600 mb-1.5">Requisitos da senha:</p>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={hasMinLength ? 'text-green-700' : 'text-slate-500'}>
                        Minimo 8 caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${hasLetter ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={hasLetter ? 'text-green-700' : 'text-slate-500'}>
                        Pelo menos uma letra
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className={`h-1.5 w-1.5 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={hasNumber ? 'text-green-700' : 'text-slate-500'}>
                        Pelo menos um numero
                      </span>
                    </div>
                    {confirmPassword.length > 0 && (
                      <div className="flex items-center gap-2 text-xs">
                        <div className={`h-1.5 w-1.5 rounded-full ${passwordsMatch ? 'bg-green-500' : 'bg-red-400'}`} />
                        <span className={passwordsMatch ? 'text-green-700' : 'text-red-500'}>
                          {passwordsMatch ? 'Senhas coincidem' : 'Senhas nao coincidem'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  disabled={isLoading || !isValid}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir senha"
                  )}
                </Button>
              </form>
            </>
          )}

          {/* Link voltar */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-[#004B87] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
