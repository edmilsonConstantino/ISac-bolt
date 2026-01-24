/**
 * ============================================================
 * SERVIÇO DE NÍVEIS
 * ============================================================
 * Gerencia requisições à API de níveis de cursos
 */

import api from './api'; // ✅ USAR A INSTÂNCIA AXIOS CONFIGURADA
import { Nivel } from '@/types/CategoryTypes';

const nivelService = {
  /**
   * Listar níveis de um curso
   */
  async listarNiveisPorCurso(cursoId: number): Promise<Nivel[]> {
    try {
      const response = await api.get(`/api/niveis.php?curso_id=${cursoId}`);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erro ao buscar níveis');
    } catch (error: any) {
      console.error('Erro ao listar níveis:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao carregar níveis'
      );
    }
  },

  /**
   * Buscar nível por ID
   */
  async buscarNivelPorId(id: number): Promise<Nivel> {
    try {
      const response = await api.get(`/api/niveis.php?id=${id}`);
      
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0];
      }
      
      throw new Error('Nível não encontrado');
    } catch (error: any) {
      console.error('Erro ao buscar nível:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao buscar nível'
      );
    }
  },

  /**
   * Criar novo nível (admin only)
   */
  async criarNivel(nivel: Omit<Nivel, 'id'>): Promise<Nivel> {
    try {
      const response = await api.post('/api/niveis.php', nivel);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erro ao criar nível');
    } catch (error: any) {
      console.error('Erro ao criar nível:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao criar nível'
      );
    }
  },

  /**
   * Atualizar nível (admin only)
   */
  async atualizarNivel(id: number, nivel: Partial<Nivel>): Promise<void> {
    try {
      const response = await api.put('/api/niveis.php', {
        id,
        ...nivel
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atualizar nível');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar nível:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao atualizar nível'
      );
    }
  },

  /**
   * Deletar nível (admin only)
   */
  async deletarNivel(id: number): Promise<void> {
    try {
      const response = await api.delete('/api/niveis.php', {
        data: { id }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao deletar nível');
      }
    } catch (error: any) {
      console.error('Erro ao deletar nível:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao deletar nível'
      );
    }
  }
};

export default nivelService;