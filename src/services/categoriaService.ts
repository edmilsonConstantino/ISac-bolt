/**
 * ============================================================
 * SERVIÇO DE CATEGORIAS
 * ============================================================
 * Gerencia requisições à API de categorias de cursos
 */

import api from './api'; // ✅ USAR A INSTÂNCIA AXIOS CONFIGURADA
import { Categoria } from '@/types/CategoryTypes';

const categoriaService = {
  /**
   * Listar todas categorias ativas
   */
  async listarCategorias(): Promise<Categoria[]> {
    try {
      const response = await api.get('/api/categorias.php');
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erro ao buscar categorias');
    } catch (error: any) {
      console.error('Erro ao listar categorias:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao carregar categorias'
      );
    }
  },

  /**
   * Buscar categoria por ID
   */
  async buscarCategoriaPorId(id: number): Promise<Categoria> {
    try {
      const response = await api.get(`/api/categorias.php?id=${id}`);
      
      if (response.data.success && response.data.data.length > 0) {
        return response.data.data[0];
      }
      
      throw new Error('Categoria não encontrada');
    } catch (error: any) {
      console.error('Erro ao buscar categoria:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao buscar categoria'
      );
    }
  },

  /**
   * Criar nova categoria (admin only)
   */
  async criarCategoria(categoria: Omit<Categoria, 'id'>): Promise<Categoria> {
    try {
      const response = await api.post('/api/categorias.php', categoria);
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erro ao criar categoria');
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao criar categoria'
      );
    }
  },

  /**
   * Atualizar categoria (admin only)
   */
  async atualizarCategoria(id: number, categoria: Partial<Categoria>): Promise<Categoria> {
    try {
      const response = await api.put('/api/categorias.php', {
        id,
        ...categoria
      });
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Erro ao atualizar categoria');
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao atualizar categoria'
      );
    }
  },

  /**
   * Deletar categoria (admin only)
   */
  async deletarCategoria(id: number): Promise<void> {
    try {
      const response = await api.delete('/api/categorias.php', {
        data: { id }
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao deletar categoria');
      }
    } catch (error: any) {
      console.error('Erro ao deletar categoria:', error);
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Erro ao deletar categoria'
      );
    }
  }
};

export default categoriaService;