// src/components/LoginForm.tsx - COM SUPORTE A ACADEMIC_ADMIN E VERSÃO MOBILE
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Loader2, Mail, User, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const [identifier, setIdentifier] = useState(""); // ← Aceita username OU email
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error, clearError, mustChangePassword } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!identifier || !senha) return;

    clearError();

    try {
      const userProfile = await login({ identifier, senha });

      // Verificar se é primeiro acesso (deve definir nova senha)
      const isMustChange = useAuthStore.getState().mustChangePassword;
      if (isMustChange) {
        navigate('/set-password', { replace: true });
        return;
      }

      switch (userProfile) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'academic_admin':
          navigate('/academic-admin/dashboard', { replace: true });
          break;
        case 'docente':
          navigate('/teacher/dashboard', { replace: true });
          break;
        case 'aluno':
          navigate('/student/dashboard', { replace: true });
          break;
        default:
          navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      // Erro já é tratado pelo authStore (set error)
    }
  };

  const scrollToLogin = () => {
    const loginSection = document.getElementById('login-section');
    if (loginSection) {
      loginSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-50">
      
      {/* ========== MOBILE ========== */}
      <div className="md:hidden min-h-screen flex flex-col relative overflow-hidden">

        {/* Fundo azul — topo */}
        <div className="relative bg-gradient-to-br from-[#0066B3] via-[#004B87] to-[#003868] flex-shrink-0 pt-14 pb-32 px-6 overflow-hidden">
          {/* Decorativos */}
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#F5821F]/20 rounded-full blur-2xl"></div>
          <div className="absolute top-6 left-6 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-8 w-32 h-32 bg-[#F5821F]/10 rounded-full blur-2xl"></div>
          {/* Círculos decorativos subtis */}
          <div className="absolute top-4 right-16 w-4 h-4 border border-white/20 rounded-full"></div>
          <div className="absolute top-12 right-10 w-2 h-2 bg-[#F5821F]/60 rounded-full"></div>
          <div className="absolute bottom-16 left-10 w-3 h-3 border border-white/20 rounded-full"></div>

          <div className="relative z-10 text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-3xl blur-xl opacity-50"></div>
                <div className="relative h-28 w-28 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-4">
                  <img src="/image.png" alt="ISAC Logo" className="h-full w-full object-contain" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl font-black text-white tracking-tight mb-2">ISAC</h1>
            <p className="text-[#F5821F] font-bold text-base tracking-widest uppercase mb-1">O Futuro é Agora</p>
            <p className="text-white/70 text-sm font-light">Instituto Superior de Artes e Cultura</p>
          </div>
        </div>

        {/* Card do formulário — sobe por cima do fundo azul */}
        <div className="relative -mt-16 flex-1 bg-white rounded-t-[2rem] shadow-2xl px-6 pt-8 pb-10 z-10">
          {/* Handle visual */}
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-8"></div>

          <div className="space-y-2 mb-7">
            <h2 className="text-2xl font-black text-[#004B87]">Bem-vindo de volta</h2>
            <p className="text-slate-500 text-sm">Entre com as suas credenciais institucionais</p>
          </div>

          {error && (
            <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <Label htmlFor="email-mobile" className="text-sm font-semibold text-slate-700">Nome de Utilizador</Label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                <Input
                  id="email-mobile"
                  type="text"
                  placeholder="Username, email ou nº de matrícula"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-14 pl-12 pr-4 text-base bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-[#F5821F] focus:ring-4 focus:ring-[#F5821F]/10 transition-all"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha-mobile" className="text-sm font-semibold text-slate-700">Senha</Label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                <Input
                  id="senha-mobile"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="h-14 pl-12 pr-12 text-base bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-[#F5821F] focus:ring-4 focus:ring-[#F5821F]/10 transition-all"
                  disabled={isLoading}
                  autoComplete="current-password"
                  minLength={5}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#F5821F] transition-colors">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="button" onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#F5821F] font-semibold hover:text-[#E07318] transition-colors">
                Esqueceu a senha?
              </button>
            </div>

            <Button type="submit"
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-xl active:scale-[0.98] transition-all group"
              disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Entrando...</>
              ) : (
                <>Entrar <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-xs text-slate-400">
              Sistema exclusivo para <span className="font-semibold text-[#004B87]">membros</span> da <span className="font-semibold text-[#004B87]">instituição ISAC</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP: Layout ========== */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-6">
        <Card className="w-full max-w-5xl overflow-hidden shadow-2xl border-0 bg-white">
          <div className="grid md:grid-cols-[1fr_1.2fr]">

            {/* LADO ESQUERDO - LOGO */}
            <div className="relative bg-gradient-to-br from-[#0066B3] via-[#004B87] to-[#003868] p-12 flex items-center justify-center overflow-hidden min-h-[560px]">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[#F5821F]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl"></div>

              <div className="relative z-10 text-center space-y-8">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
                    <div className="relative h-48 w-48 bg-white rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-300 p-6">
                      <img src="/image.png" alt="ISAC Logo" className="h-full w-full object-contain" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h1 className="text-6xl font-black text-white tracking-tight">ISAC</h1>
                  <div className="space-y-2">
                    <p className="text-[#F5821F] font-bold text-xl tracking-widest uppercase">O Futuro é Agora</p>
                    <p className="text-white/80 text-base font-light">Instituto Superior de Artes e Cultura</p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="h-px w-16 bg-[#F5821F]/50"></div>
                  <div className="h-2 w-2 rounded-full bg-[#F5821F]"></div>
                  <div className="h-px w-16 bg-[#F5821F]/50"></div>
                </div>

                <p className="text-white/70 text-sm leading-relaxed max-w-xs mx-auto">
                  Sistema de gestão académica integrado para uma experiência educacional completa e eficiente.
                </p>
              </div>
            </div>

            {/* LADO DIREITO - FORMULÁRIO */}
            <div className="p-12 flex flex-col justify-center bg-white">
              <div className="w-full max-w-md mx-auto space-y-7">

                <div className="space-y-2">
                  <h2 className="text-4xl font-black text-[#004B87]">Bem-vindo</h2>
                  <p className="text-slate-500 text-base">Entre com suas credenciais institucionais</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                    <div className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Nome de Utilizador</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="Username, email ou nº de matrícula"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="h-14 pl-12 pr-4 text-base border-2 border-slate-200 rounded-xl focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="senha" className="text-sm font-semibold text-slate-700">Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                      <Input
                        id="senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="h-14 pl-12 pr-12 text-base border-2 border-slate-200 rounded-xl focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                        disabled={isLoading}
                        autoComplete="current-password"
                        minLength={5}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-sm text-[#F5821F] hover:text-[#004B87] font-semibold transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-14 text-base bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Entrando...</>
                    ) : (
                      <>Entrar <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" /></>
                    )}
                  </Button>
                </form>

                <div className="space-y-3 pt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="bg-white px-3 text-slate-400">Acesso Restrito</span>
                    </div>
                  </div>
                  <p className="text-xs text-center text-slate-500">
                    Sistema exclusivo para <span className="font-semibold text-[#004B87]">membros</span> da <span className="font-semibold text-[#004B87]">instituição ISAC</span>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}