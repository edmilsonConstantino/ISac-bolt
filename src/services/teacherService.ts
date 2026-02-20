// src/services/teacherService.ts
import apiClient from './api';
import { ApiResponse } from './authService';

export interface Teacher {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  genero?: 'M' | 'F';
  especialidade?: string;
  data_nascimento?: string;
  endereco?: string;
  cursos?: string;
  turnos?: string;
  tipo_contrato: 'tempo_integral' | 'meio_periodo' | 'freelancer' | 'substituto';
  data_inicio: string;
  contato_emergencia?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo';
  data_criacao?: string;
  data_atualizacao?: string;
}

export interface CreateTeacherData {
  nome: string;
  email: string;
  username?: string;
  password?: string;
  telefone?: string;
  genero?: string;
  especialidade?: string;
  data_nascimento?: string;
  endereco?: string;
  cursos?: string;
  turnos?: string;
  tipo_contrato: string;
  data_inicio: string;
  contato_emergencia?: string;
  observacoes?: string;
  status?: string;
}

class TeacherService {
  /**
   * Listar todos os professores
   */
  async getAll(): Promise<Teacher[]> {
    try {
      const response = await apiClient.get<ApiResponse<Teacher[]>>('/api/professores.php');
      return response.data.data || [];
    } catch (error: any) {
      console.error('Erro ao buscar professores:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar professores');
    }
  }

  /**
   * Buscar professor por ID
   */
  async getById(id: number): Promise<Teacher> {
    try {
      const response = await apiClient.get<ApiResponse<Teacher[]>>(`/api/professores.php?id=${id}`);
      const teachers = response.data.data || [];
      
      if (teachers.length === 0) {
        throw new Error('Professor não encontrado');
      }
      
      return teachers[0];
    } catch (error: any) {
      console.error('Erro ao buscar professor:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar professor');
    }
  }

  /**
   * Criar novo professor (apenas Admin)
   */
  async create(teacherData: CreateTeacherData): Promise<{ success: boolean; message: string; id?: number }> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/api/professores.php', teacherData);
      return {
        success: response.data.success,
        message: response.data.message || 'Professor criado com sucesso',
        id: response.data.data?.id
      };
    } catch (error: any) {
      console.error('Erro ao criar professor:', error);
      const errData = error.response?.data;
      const err: any = new Error(errData?.message || 'Erro ao criar professor');
      if (errData?.field) err.field = errData.field;
      throw err;
    }
  }

  /**
   * Atualizar professor (apenas Admin)
   */
  async update(id: number, teacherData: Partial<CreateTeacherData>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put<ApiResponse<any>>('/api/professores.php', {
        id,
        ...teacherData
      });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Professor atualizado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao atualizar professor:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar professor');
    }
  }

  /**
   * Deletar professor (apenas Admin)
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<ApiResponse<any>>('/api/professores.php', {
        data: { id }
      });
      
      return {
        success: response.data.success,
        message: response.data.message || 'Professor deletado com sucesso'
      };
    } catch (error: any) {
      console.error('Erro ao deletar professor:', error);
      throw new Error(error.response?.data?.message || 'Erro ao deletar professor');
    }
  }
}

export default new TeacherService();