// src/App.tsx - COM ACADEMIC_ADMIN E SEGURANÇA REFORÇADA

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { StudentDashboard } from "@/components/Students/StudentDashboard";
import { TeacherDashboard } from "@/components/Teachers/TeacherDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { NormalAdmin } from "@/components/shared/normaladmin/NormalAdmin";
import { SetPasswordScreen } from "@/components/SetPasswordScreen";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

const queryClient = new QueryClient();

// ✅ Tipos de perfil permitidos
type UserRole = 'admin' | 'academic_admin' | 'docente' | 'aluno';

// ✅ Componente de proteção de rotas COM MÚLTIPLOS ROLES
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, isLoading, user, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  // ✅ Verificar autenticação ao montar o componente
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
      setIsChecking(false);
    };
    verifyAuth();
  }, [checkAuth]);

  // ✅ Mostra loading enquanto verifica autenticação
  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }
  
  // ✅ Redireciona para login se não autenticado
  if (!isAuthenticated || !user) {
    console.warn('🚫 Acesso negado: Usuário não autenticado');
    return <Navigate to="/login" replace />;
  }

  // ✅ Verifica se o role do usuário está permitido
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.profile || user.role;
    
    if (!allowedRoles.includes(userRole as UserRole)) {
      console.warn(`🚫 Acesso negado: Role "${userRole}" não autorizado. Roles permitidos:`, allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }
  
  return <>{children}</>;
}

// ✅ Componente para redirecionar baseado no perfil
function ProfileRedirect() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.profile || user.role;
      
      console.log('🔀 Redirecionando usuário com role:', userRole);
      
      switch (userRole) {
        case 'aluno':
          navigate('/student/dashboard', { replace: true });
          break;
        case 'docente':
          navigate('/teacher/dashboard', { replace: true });
          break;
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'academic_admin':
          navigate('/academic-admin/dashboard', { replace: true });
          break;
        default:
          console.warn('⚠️ Role desconhecido:', userRole);
          navigate('/unauthorized', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, isLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground font-medium">Redirecionando...</p>
      </div>
    </div>
  );
}

// ✅ Página de não autorizado - MELHORADA
function Unauthorized() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-slate-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-slate-600 mb-6">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador se achar que isto é um erro.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Fazer Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ Componente principal
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* ========== ROTAS PÚBLICAS ========== */}
          <Route path="/login" element={<Index />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/set-password" element={<SetPasswordScreen />} />
          
          {/* ========== DASHBOARD DO ALUNO ========== */}
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['aluno']}>
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== DASHBOARD DO DOCENTE ========== */}
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['docente']}>
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== DASHBOARD DO SUPER ADMIN ========== */}
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== DASHBOARD DO ACADEMIC ADMIN ========== */}
          <Route 
            path="/academic-admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['academic_admin']}>
                <NormalAdmin />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== DASHBOARD GENÉRICO (AUTO-REDIRECT) ========== */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <ProfileRedirect />
              </ProtectedRoute>
            } 
          />
          
          {/* ========== 404 - CATCH ALL ========== */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;