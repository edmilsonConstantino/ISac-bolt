// src/services/authService.ts - VERSÃO COM DEBUG
import apiClient from './api';

export interface LoginCredentials {
  identifier: string; // ← Aceita username OU email
  senha: string;
}

export interface User {
  id: number;
  nome: string;
  email: string;
  username?: string;
  role: string;
  created_at: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

class AuthService {
  /**
   * 🔐 Fazer login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('\n🔄 === INICIANDO LOGIN ===');
      console.log('📧 Identifier:', credentials.identifier);
      console.log('🔒 Senha fornecida:', credentials.senha ? 'SIM' : 'NÃO');
      
      const response = await apiClient.post<LoginResponse>('/auth/login.php', {
        identifier: credentials.identifier, // ← Pode ser username OU email
        senha: credentials.senha
      });
      
      console.log('\n📦 === RESPOSTA DA API ===');
      console.log('Status:', response.status);
      console.log('Resposta completa:', JSON.stringify(response.data, null, 2));
      
      // Verificar estrutura da resposta
      console.log('\n🔍 === ANÁLISE DA ESTRUTURA ===');
      console.log('response.data existe?', response.data !== undefined);
      console.log('response.data.success:', response.data.success);
      console.log('response.data.data existe?', response.data.data !== undefined);
      
      if (response.data.data) {
        console.log('response.data.data.access_token existe?', response.data.data.access_token !== undefined);
        console.log('response.data.data.user existe?', response.data.data.user !== undefined);
      }
      
      // Tentar acessar de diferentes formas (compatibilidade)
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let user: User | undefined;
      
      // Formato 1: { success, data: { access_token, user, ... } }
      if (response.data.data?.access_token) {
        console.log('\n✅ Formato detectado: response.data.data.access_token');
        accessToken = response.data.data.access_token;
        refreshToken = response.data.data.refresh_token;
        user = response.data.data.user;
      }
      // Formato 2: { success, access_token, user, ... } (direto)
      else if ((response.data as any).access_token) {
        console.log('\n✅ Formato detectado: response.data.access_token (direto)');
        accessToken = (response.data as any).access_token;
        refreshToken = (response.data as any).refresh_token;
        user = (response.data as any).user;
      }
      
      if (!accessToken) {
        console.error('\n❌ Token não encontrado na resposta!');
        console.error('Estrutura recebida:', Object.keys(response.data));
        throw new Error('Token não encontrado na resposta do servidor');
      }
      
      console.log('\n🔐 === SALVANDO TOKENS ===');
      console.log('Token (50 primeiros chars):', accessToken.substring(0, 50) + '...');
      console.log('User:', user?.nome, '(', user?.email, ')');
      
      // Salvar no localStorage
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(user));
      
      console.log('\n✅ === VERIFICAÇÃO DE SALVAMENTO ===');
      console.log('Token salvo no localStorage?', localStorage.getItem('access_token') !== null);
      console.log('Token recuperado:', localStorage.getItem('access_token')?.substring(0, 50) + '...');
      console.log('User salvo?', localStorage.getItem('user') !== null);
      
      return response.data;
      
    } catch (error: any) {
      console.error('\n❌ === ERRO NO LOGIN ===');
      console.error('Tipo de erro:', error.constructor.name);
      console.error('Mensagem:', error.message);
      
      if (error.response) {
        console.error('Status HTTP:', error.response.status);
        console.error('Dados da resposta:', error.response.data);
      }
      
      throw new Error(error.response?.data?.message || 'Erro ao fazer login');
    }
  }

  /**
   * Fazer logout (revoga tokens no backend antes de limpar localStorage)
   */
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await apiClient.post('/auth/logout.php');
      }
    } catch (error) {
      // Mesmo com erro no backend, limpar localStorage
      console.error('Erro ao revogar tokens no backend:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');
    }
  }

  /**
   * Solicitar recuperacao de senha
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/forgot-password.php', { email });
    return response.data;
  }

  /**
   * Redefinir senha com token
   */
  async resetPassword(token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post('/auth/reset-password.php', {
      token,
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  }

  /**
   * ✅ Verificar se está autenticado
   */
  isAuthenticated(): boolean {
    const hasToken = !!localStorage.getItem('access_token');
    console.log('🔍 isAuthenticated:', hasToken ? 'SIM' : 'NÃO');
    return hasToken;
  }

  /**
   * 👤 Obter usuário atual
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('❌ Erro ao parsear usuário do localStorage');
        return null;
      }
    }
    return null;
  }

  /**
   * 🔑 Verificar se é admin
   */
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }

  /**
   * 🎫 Obter token de acesso
   */
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export default new AuthService();