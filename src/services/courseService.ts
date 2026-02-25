// src/services/courseService.ts
import apiClient from '@/services/api';
import { Nivel } from '@/types/CategoryTypes';

export interface Course {
  id?: number;
  nome: string;
  codigo: string;
  tipo_curso: 'tecnico' | 'tecnico_superior' | 'tecnico_profissional' | 'curta_duracao';
  duracao_valor: number;
  regime: 'laboral' | 'pos_laboral' | 'ambos';
  tem_niveis?: boolean;
  preco_por_nivel?: boolean;
  usar_taxa_padrao?: boolean;
  mensalidade: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  niveis?: Nivel[];
  data_criacao?: string;
  data_atualizacao?: string;
}

class CourseService {
  /**
   * 📋 Listar todos os cursos
   */
  async getAll(): Promise<Course[]> {
    try {
      console.log('📤 Buscando todos os cursos...');
      const response = await apiClient.get('/api/cursos.php');
      
      // A API retorna { success: true, data: [...] }
      const cursos = response.data.data || response.data || [];
      
      console.log('✅ Cursos recebidos:', cursos.length);
      console.log('📊 Dados:', cursos);
      return cursos;
    } catch (error: any) {
      console.error('❌ Erro ao buscar cursos:', error);
      console.error('❌ Resposta:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao buscar cursos');
    }
  }

  /**
   * 🔍 Buscar curso por ID
   */
  async getById(id: number): Promise<Course> {
    try {
      console.log('📤 Buscando curso ID:', id);
      // 🔧 CORRIGIDO: parêntese em vez de backtick
      const response = await apiClient.get(`/api/cursos.php?id=${id}`);
      
      // A API retorna { success: true, data: [{curso}] }
      const curso = response.data.data?.[0] || response.data[0];
      
      console.log('✅ Curso encontrado:', curso);
      return curso;
    } catch (error: any) {
      console.error('❌ Erro ao buscar curso:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar curso');
    }
  }

  /**
   * ➕ Criar novo curso
   */
  async create(courseData: Course): Promise<Course> {
    try {
      console.log('📤 Criando curso:', courseData);
      const response = await apiClient.post('/api/cursos.php', courseData);
      
      // A API retorna { success: true, message: "...", data: {curso} }
      console.log('✅ Curso criado:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao criar curso:', error);
      console.error('❌ Resposta:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao criar curso');
    }
  }

  /**
   * ✏️ Atualizar curso
   */
  async update(id: number, courseData: Partial<Course>): Promise<Course> {
    try {
      console.log('📤 Atualizando curso ID:', id, courseData);
      const response = await apiClient.put('/api/cursos.php', { id, ...courseData });
      
      // A API retorna { success: true, message: "...", data: {curso} }
      console.log('✅ Curso atualizado:', response.data);
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('❌ Erro ao atualizar curso:', error);
      console.error('❌ Resposta:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar curso');
    }
  }


  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ Deletando curso ID:', id);
      const response = await apiClient.delete('/api/cursos.php', { data: { id } });
      
      console.log('✅ Curso deletado:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao deletar curso:', error);
      console.error('❌ Resposta:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao deletar curso');
    }
  }
}

export default new CourseService();