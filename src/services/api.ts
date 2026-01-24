// src/services/api.ts - ✅ VERSÃO CORRIGIDA
import axios, { AxiosInstance, AxiosError } from 'axios';

// ⚙️ URL base da sua API PHP
const API_BASE_URL = 'http://localhost/api-login';

// 🔧 Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // ✅
});

// 🔐 Interceptor de REQUEST - Adiciona token JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    
    // 🔍 DEBUG DETALHADO
    console.log('\n📡 === REQUEST INTERCEPTOR ===');
    console.log('URL:', config.url);
    console.log('Método:', config.method?.toUpperCase());
    console.log('🔐 Token no localStorage:', token ? 'SIM ✅' : 'NÃO ❌');
    
    if (token) {
      console.log('Token (30 chars):', token.substring(0, 30) + '...');
    } else {
      console.error('❌ PROBLEMA: Token não encontrado!');
      console.log('Conteúdo do localStorage:', Object.keys(localStorage));
    }
    
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Header Authorization adicionado');
    } else {
      console.warn('⚠️ Token NÃO foi adicionado ao header!');
      
      // Se for uma rota protegida, alertar
      if (config.url && !config.url.includes('login') && !config.url.includes('register')) {
        console.error('🚨 ALERTA: Requisição para rota protegida sem token!');
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Erro no request interceptor:', error);
    return Promise.reject(error);
  }
);

// ⚠️ Interceptor de RESPONSE - Trata erros 401
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ Response OK:', response.config.url, '- Status:', response.status);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    console.error('\n❌ === ERRO NA RESPOSTA ===');
    console.error('URL:', originalRequest?.url);
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.message);

    // Se erro 401 (não autorizado) e não for retry
    if (error.response?.status === 401 && !originalRequest?._retry) {
      console.log('🔄 Tentando renovar token...');
      originalRequest._retry = true;

      try {
        // Tentar renovar o token
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (!refreshToken) {
          console.error('❌ Refresh token não encontrado');
          throw new Error('Refresh token ausente');
        }
        
        console.log('📤 Enviando refresh token...');
        const response = await axios.post(`${API_BASE_URL}/auth/refresh.php`, {
          refresh_token: refreshToken,
        });

        const { access_token } = response.data;
        
        if (!access_token) {
          throw new Error('Novo access_token não recebido');
        }
        
        console.log('✅ Novo token recebido');
        localStorage.setItem('access_token', access_token);

        // Retry request original com novo token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        console.log('🔄 Reenviando requisição original...');
        
        return apiClient(originalRequest);
        
      } catch (refreshError: any) {
        console.error('❌ Falha ao renovar token:', refreshError.message);
        
        // Token inválido, fazer logout completo
        console.log('🚪 Fazendo logout e redirecionando...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        
        // Redirecionar para login
        window.location.href = '/login';
        
        return Promise.reject(refreshError);
      }
    }

    // Para outros erros, apenas rejeitar
    return Promise.reject(error);
  }
);

export default apiClient;