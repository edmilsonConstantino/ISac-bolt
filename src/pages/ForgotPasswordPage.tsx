import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import authService from "@/services/authService";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError(null);

    try {
      await authService.forgotPassword(email);
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao processar pedido. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

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
              Recuperar senha
            </h2>
            <p className="text-slate-500 text-sm">
              Introduza o email associado a sua conta para receber as instrucoes de recuperacao.
            </p>
          </div>

          {sent ? (
            /* Mensagem de sucesso */
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-800 font-medium text-sm">
                      Email enviado com sucesso
                    </p>
                    <p className="text-green-700 text-xs mt-1">
                      Se o email estiver registado, recebera instrucoes para recuperar a sua senha.
                      Verifique tambem a pasta de spam.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => navigate('/login')}
                className="w-full h-10 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold rounded-lg"
              >
                Voltar ao login
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
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email institucional
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@isac.ac.mz"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 pl-10 pr-3 text-sm border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                      disabled={isLoading}
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 text-sm bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar instrucoes"
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
