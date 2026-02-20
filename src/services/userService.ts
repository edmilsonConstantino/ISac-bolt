// src/services/userService.ts
import apiClient from './api';
import { ApiResponse } from './authService';

export interface SystemUserAPI {
  id: number;
  nome: string;
  email?: string;
  username?: string;
  role: 'admin' | 'academic_admin' | 'teacher' | 'student';
  avatar?: string;
  status: 'active' | 'inactive';
  last_login?: string;
  created_at: string;
  updated_at?: string;
  source_table?: 'users' | 'professores' | 'students';
}

export interface CreateUserData {
  nome: string;
  email?: string;
  senha: string;
  role: string;
  avatar?: string;
  status?: string;
}

export interface UpdateUserData {
  id: number;
  nome: string;
  email?: string;
  role?: string;
  avatar?: string;
  status?: string;
  senha?: string;
}

export interface AccessLog {
  id: number;
  user_id: number;
  user_type: string;
  user_table: string;
  action: 'login' | 'logout' | 'login_failed';
  ip_address: string;
  user_agent?: string;
  device: string;
  browser: string;
  status: 'success' | 'failed';
  details?: string;
  created_at: string;
}

export interface AccessLogStats {
  total_access: number;
  successful: number;
  failed: number;
  unique_ips: number;
}

export interface AccessLogResponse {
  success: boolean;
  data: AccessLog[];
  stats: AccessLogStats;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

class UserService {
  async getAll(): Promise<SystemUserAPI[]> {
    try {
      const response = await apiClient.get<ApiResponse<SystemUserAPI[]>>('/api/users.php');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuários');
    }
  }

  async getById(id: number): Promise<SystemUserAPI> {
    try {
      const response = await apiClient.get<ApiResponse<SystemUserAPI[]>>(`/api/users.php?id=${id}`);
      const users = response.data.data || [];
      if (users.length === 0) {
        throw new Error('Usuário não encontrado');
      }
      return users[0];
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar usuário');
    }
  }

  async create(userData: CreateUserData): Promise<{ success: boolean; message: string; data?: SystemUserAPI }> {
    try {
      const response = await apiClient.post<ApiResponse<SystemUserAPI>>('/api/users.php', userData);
      return {
        success: response.data.success,
        message: response.data.message || 'Usuário criado com sucesso',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao criar usuário');
    }
  }

  async update(userData: UpdateUserData): Promise<{ success: boolean; message: string; data?: SystemUserAPI }> {
    try {
      const response = await apiClient.put<ApiResponse<SystemUserAPI>>('/api/users.php', userData);
      return {
        success: response.data.success,
        message: response.data.message || 'Usuário atualizado com sucesso',
        data: response.data.data
      };
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar usuário');
    }
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>('/api/users.php', {
        data: { id }
      });
      return {
        success: response.data.success,
        message: response.data.message || 'Usuário removido com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao remover usuário:', error);
      throw new Error(error.response?.data?.message || 'Erro ao remover usuário');
    }
  }

  async getAccessLogs(params: {
    user_id?: number;
    user_type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<AccessLogResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.user_id) queryParams.set('user_id', String(params.user_id));
      if (params.user_type) queryParams.set('user_type', String(params.user_type));
      if (params.status) queryParams.set('status', params.status);
      if (params.limit) queryParams.set('limit', String(params.limit));
      if (params.offset) queryParams.set('offset', String(params.offset));

      const url = `/api/access_logs.php${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const response = await apiClient.get<AccessLogResponse>(url);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao buscar logs de acesso:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar logs de acesso');
    }
  }
}

export default new UserService();
