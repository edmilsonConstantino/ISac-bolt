/**
 * ============================================================
 * TIPOS PARA CURSOS
 * ============================================================
 * Define as interfaces para trabalhar com cursos e módulos
 */

import { Categoria, Nivel } from '@/types/CategoryTypes';

export interface Module {
  id: string;
  nome_modulo: string;
  codigo_modulo: string;
  carga_horaria: number;
}

export interface Course {
  id?: number;
  nome: string;
  codigo: string;
  
  // ✨ NOVO - Categoria (substitui tipo_curso)
  categoria_id?: number;
  categoria?: Categoria; // objeto completo quando vier do backend
  
  // ⚠️ MANTER por compatibilidade (será removido futuramente)
  tipo_curso?: 'tecnico' | 'tecnico_superior' | 'tecnico_profissional' | 'curta_duracao';
  
  duracao_valor: number;
  regime: 'laboral' | 'pos_laboral' | 'ambos';
  mensalidade: number;
  taxa_matricula: number;
  propina_fixa: boolean;
  permite_bolsa: boolean;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  
  // Módulos (continua igual)
  modulos?: Module[];
  
  // ✨ NOVO - Níveis (para cursos com tem_niveis = true)
  niveis?: Nivel[];
  
  data_criacao?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CourseFormData extends Omit<Course, 'id' | 'data_criacao' | 'created_at' | 'updated_at'> {
  // Tipo auxiliar para formulários
}

export interface CourseWithRelations extends Course {
  // Quando precisar retornar curso com categoria e níveis populados
  categoria: Categoria;
  niveis: Nivel[];
  modulos: Module[];
}