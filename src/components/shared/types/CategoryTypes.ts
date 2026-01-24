/**
 * ============================================================
 * TIPOS PARA CATEGORIAS E NÍVEIS DE CURSOS
 * ============================================================
 * Define as interfaces para trabalhar com categorias e níveis
 */

export interface Categoria {
  id: number;
  nome: string;
  descricao?: string;
  tem_niveis: boolean;
  status: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

export interface Nivel {
  id?: number;
  curso_id?: number;
  nivel: number;
  nome: string;
  descricao?: string;
  duracao_meses: number;
  ordem: number;
  prerequisito_nivel_id?: number | null;
  status?: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaFormData {
  nome: string;
  descricao?: string;
  tem_niveis: boolean;
  status: 'ativo' | 'inativo';
}

export interface NivelFormData {
  nivel: number;
  nome: string;
  descricao?: string;
  duracao_meses: number;
  ordem: number;
  prerequisito_nivel_id?: number | null;
}