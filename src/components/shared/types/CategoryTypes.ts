/**
 * ============================================================
 * TYPES FOR COURSE CATEGORIES AND LEVELS
 * ============================================================
 * Defines interfaces for working with categories and levels
 *
 * NOTE: Backend uses English field names, frontend displays PT labels
 */

export interface Categoria {
  id: number;
  name: string;
  description?: string;
  has_levels: boolean;
  duration_months?: number | null;  // Default duration for courses in this category (can be overridden)
  level_type?: 'numbered' | 'named';
  predefined_levels?: string[];
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export interface NivelModulo {
  id: string;
  nome_modulo: string;
  codigo_modulo: string;
  carga_horaria: number;
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
  modulos?: NivelModulo[];
  status?: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

export interface CategoriaFormData {
  name: string;
  description?: string;
  has_levels: boolean;
  duration_months?: number | null;  // Default duration for courses in this category
  level_type?: 'numbered' | 'named';
  predefined_levels?: string[];
  status: 'active' | 'inactive';
}

export interface NivelFormData {
  nivel: number;
  nome: string;
  descricao?: string;
  duracao_meses: number;
  ordem: number;
  prerequisito_nivel_id?: number | null;
}
