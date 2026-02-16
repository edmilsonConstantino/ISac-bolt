// src/services/api.ts - Com refresh token silencioso e protecção contra race conditions
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'http://localhost/api-login';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// ============================================================
// Estado do refresh - protege contra race conditions
// ============================================================
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// ============================================================
// Interceptor de REQUEST - Adiciona token JWT
// ============================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Interceptor de RESPONSE - Refresh automático silencioso
// ============================================================
apiClient.interceptors.response.use(
  (response) => {
    // Se response.data for string, tentar parsear como JSON
    if (typeof response.data === 'string' && response.data.trim().startsWith('{')) {
      try {
        response.data = JSON.parse(response.data);
      } catch {
        // ignorar
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Só tratar 401 (token expirado/inválido)
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Se já é um retry, não tentar novamente
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    // Se é rota de auth (login/refresh), não fazer refresh
    const isAuthRoute = originalRequest.url && (
      originalRequest.url.includes('login') ||
      originalRequest.url.includes('refresh') ||
      originalRequest.url.includes('register')
    );
    if (isAuthRoute) {
      return Promise.reject(error);
    }

    // Se já estamos a fazer refresh, enfileirar esta requisição
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          },
          reject: (err: unknown) => {
            reject(err);
          },
        });
      });
    }

    // Marcar como a fazer refresh
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');

      if (!refreshToken) {
        throw new Error('Refresh token ausente');
      }

      // Chamar endpoint de refresh (usando axios directamente, não apiClient)
      const response = await axios.post(`${API_BASE_URL}/auth/refresh.php`, {
        refresh_token: refreshToken,
      });

      const tokenData = response.data.data ?? response.data;
      const { access_token, refresh_token: new_refresh_token } = tokenData;

      if (!access_token) {
        throw new Error('Novo access_token não recebido');
      }

      // Guardar novos tokens
      localStorage.setItem('access_token', access_token);
      if (new_refresh_token) {
        localStorage.setItem('refresh_token', new_refresh_token);
      }

      // Processar fila de requisições pendentes com o novo token
      processQueue(null, access_token);

      // Reenviar requisição original
      originalRequest.headers.Authorization = `Bearer ${access_token}`;
      return apiClient(originalRequest);

    } catch (refreshError) {
      // Refresh falhou - processar fila com erro
      processQueue(refreshError, null);

      // Limpar storage e redirecionar para login
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth-storage');

      window.location.href = '/login';

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
