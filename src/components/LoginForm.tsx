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
      
      {/* ========== MOBILE: Hero Section ========== */}
      <div className="md:hidden min-h-screen relative bg-gradient-to-br from-[#0066B3] via-[#004B87] to-[#003868] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5821F]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-6 px-6 max-w-sm">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-3xl blur-xl opacity-40"></div>
              
              <div className="relative h-40 w-40 bg-white rounded-3xl flex items-center justify-center shadow-2xl p-6">
                <img 
                  src="/image.png" 
                  alt="ISAC Logo" 
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-white tracking-tight">
              ISAC
            </h1>
            <div className="space-y-2">
              <p className="text-[#F5821F] font-bold text-xl tracking-wide uppercase">
                O Futuro é Agora
              </p>
              <p className="text-white/90 text-base font-light">
                Instituto Superior de Artes e Cultura
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <div className="h-px w-16 bg-[#F5821F]/50"></div>
            <div className="h-2 w-2 rounded-full bg-[#F5821F]"></div>
            <div className="h-px w-16 bg-[#F5821F]/50"></div>
          </div>

          <p className="text-white/80 text-sm leading-relaxed px-4">
            Sistema de gestão acadêmica integrado para uma experiência educacional completa e eficiente.
          </p>

          {/* Botão Acessar */}
          <button
            onClick={scrollToLogin}
            className="mt-8 w-full max-w-xs mx-auto bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-bold py-4 px-8 rounded-xl shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            <span className="text-lg tracking-wide">Acessar</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* ========== MOBILE: Login Section ========== */}
      <div id="login-section" className="md:hidden min-h-screen bg-white p-6 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto space-y-6">
          
          {/* Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-[#004B87]">
              Bem-vindo
            </h2>
            <p className="text-slate-500 text-sm">
              Entre com suas credenciais institucionais
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo Identificação - Mobile */}
            <div className="space-y-2">
              <Label htmlFor="email-mobile" className="text-sm font-semibold text-[#004B87]">
                Nome de Utilizador
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#F5821F] transition-colors duration-300" />
                </div>
                <Input
                  id="email-mobile"
                  type="text"
                  placeholder="Username, email ou nº de matrícula"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="h-14 pl-12 pr-4 text-base bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#F5821F] focus:ring-4 focus:ring-[#F5821F]/10 transition-all duration-300 placeholder:text-slate-400"
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Campo Senha - Mobile */}
            <div className="space-y-2">
              <Label htmlFor="senha-mobile" className="text-sm font-semibold text-[#004B87]">
                Senha
              </Label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#F5821F] transition-colors duration-300" />
                </div>
                <Input
                  id="senha-mobile"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  className="h-14 pl-12 pr-14 text-base bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:border-[#F5821F] focus:ring-4 focus:ring-[#F5821F]/10 transition-all duration-300"
                  disabled={isLoading}
                  autoComplete="current-password"
                  minLength={5}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-[#F5821F] transition-colors duration-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#F5821F] hover:text-[#E07318] font-semibold transition-colors duration-300"
              >
                Esqueceu a senha?
              </button>
            </div>

            {/* Botão de Login - Mobile */}
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group mt-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="tracking-wide">Entrando...</span>
                </>
              ) : (
                <>
                  <span className="tracking-wide">Entrar</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>
          </form>

          <div className="pt-4 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">
                  Acesso Restrito
                </span>
              </div>
            </div>
            
            <p className="text-xs text-center text-slate-500 leading-relaxed px-2">
              Sistema exclusivo para membros da instituição ISAC
            </p>
          </div>

          {/* Card de Teste - Mobile */}
          <div className="mt-4 p-4 bg-gradient-to-br from-slate-50 to-slate-100/50 border-2 border-dashed border-slate-200 rounded-xl">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="h-1.5 w-1.5 rounded-full bg-[#F5821F]"></div>
              <p className="text-xs text-center text-slate-600 font-bold tracking-wide">
                CREDENCIAIS DE TESTE
              </p>
              <div className="h-1.5 w-1.5 rounded-full bg-[#F5821F]"></div>
            </div>
            
            {/* Super Admin */}
            <div className="text-xs font-mono bg-white p-3 rounded-lg border-2 border-blue-100 space-y-1.5 mb-2.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <p className="text-[10px] text-blue-700 font-bold tracking-wide">SUPER ADMIN</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold text-[#004B87]">admin@example.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Senha:</span>
                <span className="font-bold text-[#004B87]">8456@</span>
              </div>
            </div>

            {/* Academic Admin */}
            <div className="text-xs font-mono bg-white p-3 rounded-lg border-2 border-emerald-100 space-y-1.5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                <p className="text-[10px] text-emerald-700 font-bold tracking-wide">ACADEMIC ADMIN</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Email:</span>
                <span className="font-bold text-emerald-700">academic@isac.ac.mz</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Senha:</span>
                <span className="font-bold text-emerald-700">8456@</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== DESKTOP: Layout Original ========== */}
      <div className="hidden md:flex min-h-screen items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-4xl overflow-hidden shadow-2xl border-0 bg-white">
          <div className="grid md:grid-cols-2">
            
            {/* DESKTOP: LADO ESQUERDO - LOGO */}
            <div className="relative bg-gradient-to-br from-[#0066B3] via-[#004B87] to-[#003868] p-8 flex items-center justify-center overflow-hidden min-h-[420px]">
              <div className="absolute top-0 right-0 w-52 h-52 bg-[#F5821F]/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 text-center space-y-5 max-w-sm">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                    
                    <div className="relative h-36 w-36 bg-white rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-105 transition-all duration-300 p-5">
                      <img 
                        src="/image.png" 
                        alt="ISAC Logo" 
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h1 className="text-5xl font-bold text-white tracking-tight">
                    ISAC
                  </h1>
                  <div className="space-y-1.5">
                    <p className="text-[#F5821F] font-bold text-lg tracking-wide uppercase">
                      O Futuro é Agora
                    </p>
                    <p className="text-white/90 text-sm font-light">
                      Instituto Superior de Artes e Cultura
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2.5 pt-2">
                  <div className="h-px w-12 bg-[#F5821F]/50"></div>
                  <div className="h-1.5 w-1.5 rounded-full bg-[#F5821F]"></div>
                  <div className="h-px w-12 bg-[#F5821F]/50"></div>
                </div>

                <p className="text-white/80 text-xs leading-relaxed px-3">
                  Sistema de gestão acadêmica integrado para uma experiência educacional completa e eficiente.
                </p>
              </div>
            </div>

            {/* DESKTOP: LADO DIREITO - FORMULÁRIO */}
            <div className="p-7 md:p-8 flex flex-col justify-center bg-white">
              <div className="w-full max-w-sm mx-auto space-y-5">
                
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold text-[#004B87]">
                    Bem-vindo
                  </h2>
                  <p className="text-slate-600 text-xs">
                    Entre com suas credenciais institucionais
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg animate-shake">
                    <div className="flex items-start gap-2.5">
                      <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">!</span>
                      </div>
                      <p className="text-red-700 text-xs font-medium">{error}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Campo Identificação - Desktop */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">
                      Nome de Utilizador
                    </Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="Username, email ou nº de matrícula"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                        className="h-10 pl-10 pr-3 text-sm border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                        disabled={isLoading}
                        autoComplete="username"
                      />
                    </div>
                  </div>

                  {/* Campo Senha - Desktop */}
                  <div className="space-y-1.5">
                    <Label htmlFor="senha" className="text-xs font-semibold text-slate-700">
                      Senha
                    </Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#F5821F] transition-colors" />
                      <Input
                        id="senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                        className="h-10 pl-10 pr-10 text-sm border-2 border-slate-200 rounded-lg focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/20 transition-all duration-300"
                        disabled={isLoading}
                        autoComplete="current-password"
                        minLength={5}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs text-[#F5821F] hover:text-[#004B87] font-medium transition-colors"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>

                  {/* Botão de Login - Desktop */}
                  <Button 
                    type="submit" 
                    className="w-full h-10 text-sm bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 group" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Entrar
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="pt-3 space-y-2.5">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px]">
                      <span className="bg-white px-2 text-slate-400">
                        Acesso Restrito
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-[10px] text-center text-slate-500 leading-tight">
                    Sistema exclusivo para membros da instituição ISAC
                  </p>
                </div>

                {/* Card de Teste - Desktop */}
                <div className="mt-3 p-2.5 bg-slate-50 border border-dashed border-slate-200 rounded-lg">
                  <p className="text-[10px] text-center text-slate-600 mb-2 font-semibold">
                    🧪 Credenciais de Teste
                  </p>
                  
                  {/* Super Admin */}
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-slate-200 space-y-0.5 mb-2">
                    <p className="text-[9px] text-blue-600 font-bold mb-1">SUPER ADMIN</p>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-[#004B87]">admin@example.com</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Senha:</span>
                      <span className="font-semibold text-[#004B87]">8456@</span>
                    </div>
                  </div>

                  {/* Academic Admin */}
                  <div className="text-[10px] font-mono bg-white p-2 rounded border border-emerald-200 space-y-0.5">
                    <p className="text-[9px] text-emerald-600 font-bold mb-1">ACADEMIC ADMIN</p>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email:</span>
                      <span className="font-semibold text-emerald-700">academic@isac.ac.mz</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Senha:</span>
                      <span className="font-semibold text-emerald-700">8456@</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}