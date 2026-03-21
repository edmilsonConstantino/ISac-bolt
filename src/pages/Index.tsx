// src/pages/Index.tsx - VERSÃO CORRIGIDA
import { useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {

    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erro de autenticação",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // ✅ Mostra loading apenas se estiver carregando E não autenticado
  // Se estiver autenticado, o redirecionamento acima já aconteceu
  if (isAuthenticated) {
    return null;
  }

  // ✅ Se não estiver autenticado e não estiver carregando, mostra o formulário de login
  return <LoginForm />;
};

export default Index;