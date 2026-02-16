// src/services/classService.ts - VERSÃO COM MAPEAMENTO
import apiClient from './api';

// Interface do React (frontend)
export interface Class {
  id?: number;
  code?: string; // codigoTurma do modal
  name: string;
  description?: string;
  subject?: string;
  teacher_id?: number | null;
  teacher_name?: string;
  semester?: string;
  capacity: number;
  students?: number;
  room?: string;
  schedule?: string;
  schedule_days?: string;
  start_time?: string;
  end_time?: string;
  start_date?: string;
  end_date?: string;
  duration?: string; // "6 meses"
  status?: 'active' | 'inactive' | 'completed';
  created_at?: string;
  updated_at?: string;
}

// Interface da API PHP (backend em português)
interface TurmaAPI {
  id?: number;
  codigo: string;
  nome: string;
  disciplina: string;
  professor_id?: number | null;
  semestre?: string;
  ano_letivo: number;
  duracao_meses: number;
  capacidade_maxima: number;
  vagas_ocupadas?: number;
  sala?: string;
  dias_semana: string; // "segunda,quarta,sexta"
  horario_inicio: string; // "HH:MM:SS"
  horario_fim: string;
  data_inicio?: string;
  data_fim?: string;
  carga_horaria?: number;
  creditos?: number;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'concluido' | 'cancelado';
}

class ClassService {
  /**
   * 🔄 Mapear dados do React para API PHP
   */
  private mapReactToAPI(data: Partial<Class>): Partial<TurmaAPI> {
    const mapped: Partial<TurmaAPI> = {};

    // Mapeamento de campos
    if (data.code) mapped.codigo = data.code;
    if (data.name) mapped.nome = data.name;
    if (data.description) mapped.observacoes = data.description;
    if (data.subject) mapped.disciplina = data.subject;
    if (data.teacher_id !== undefined) mapped.professor_id = data.teacher_id;
    if (data.capacity) mapped.capacidade_maxima = data.capacity;
    if (data.room) mapped.sala = data.room;
    if (data.semester) mapped.semestre = data.semester;
    
    // Converter duration "6 meses" → 6
    if (data.duration) {
      const months = parseInt(data.duration.replace(/\D/g, ''));
      if (!isNaN(months)) {
        mapped.duracao_meses = months;
      }
    }

    // Horários: converter "HH:MM" → "HH:MM:SS"
    if (data.start_time) {
      mapped.horario_inicio = data.start_time.length === 5 
        ? `${data.start_time}:00` 
        : data.start_time;
    }
    if (data.end_time) {
      mapped.horario_fim = data.end_time.length === 5 
        ? `${data.end_time}:00` 
        : data.end_time;
    }

    // Datas
    if (data.start_date) mapped.data_inicio = data.start_date;
    if (data.end_date) mapped.data_fim = data.end_date;

    // Status: active → ativo
    if (data.status) {
      const statusMap: Record<string, any> = {
        'active': 'ativo',
        'inactive': 'inativo',
        'completed': 'concluido'
      };
      mapped.status = statusMap[data.status] || 'ativo';
    }

    // Ano letivo (pegar do start_date ou ano atual)
    if (data.start_date) {
      mapped.ano_letivo = new Date(data.start_date).getFullYear();
    } else {
      mapped.ano_letivo = new Date().getFullYear();
    }

    // Dias da semana: se vier do schedule
    if (data.schedule_days) {
      mapped.dias_semana = data.schedule_days;
    }

    console.log('🔄 Mapeamento React → API:', { original: data, mapped });
    return mapped;
  }

  /**
   * 🔄 Mapear dados da API PHP para React
   */
  private mapAPIToReact(data: any): Class {
    return {
      id: data.id,
      code: data.codigo,
      name: data.nome || data.name,
      description: data.observacoes || data.description,
      subject: data.disciplina || data.subject,
      teacher_id: data.professor_id || data.teacher_id,
      teacher_name: data.professor_nome || data.teacher_name,
      capacity: data.capacidade_maxima || data.max_students || data.capacity,
      students: data.vagas_ocupadas || data.students_count || data.students || 0,
      room: data.sala || data.room,
      schedule: data.schedule,
      schedule_days: data.dias_semana || data.schedule_days,
      start_time: data.horario_inicio?.substring(0, 5) || data.start_time,
      end_time: data.horario_fim?.substring(0, 5) || data.end_time,
      start_date: data.data_inicio || data.start_date,
      end_date: data.data_fim || data.end_date,
      status: this.mapStatusToReact(data.status),
      created_at: data.data_criacao || data.created_at,
      updated_at: data.data_atualizacao || data.updated_at
    };
  }

  /**
   * Mapear status português → inglês
   */
  private mapStatusToReact(status: string): 'active' | 'inactive' | 'completed' {
    const statusMap: Record<string, any> = {
      'ativo': 'active',
      'inativo': 'inactive',
      'concluido': 'completed',
      'cancelado': 'inactive'
    };
    return statusMap[status] || 'active';
  }

  /**
   * 📋 Listar todas as turmas
   */
  async getAll(): Promise<Class[]> {
    try {
      console.log('📤 Buscando todas as turmas...');
      const response = await apiClient.get('/api/turmas.php');
      
      // A API retorna direto o array ou dentro de { data }
      const turmas = response.data.data || response.data || [];
      
      console.log('✅ Turmas recebidas:', turmas);
      return turmas.map((t: any) => this.mapAPIToReact(t));
    } catch (error: any) {
      console.error('❌ Erro ao buscar turmas:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar turmas');
    }
  }

  /**
   * 🔍 Buscar turma por ID
   */
  async getById(id: number): Promise<Class> {
    try {
      console.log('📤 Buscando turma ID:', id);
      const response = await apiClient.get(`/api/turmas.php/${id}`);
      const turma = response.data.data || response.data;
      
      console.log('✅ Turma recebida:', turma);
      return this.mapAPIToReact(turma);
    } catch (error: any) {
      console.error('❌ Erro ao buscar turma:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar turma');
    }
  }

  /**
   * ➕ Criar nova turma
   */
  async create(classData: Partial<Class>): Promise<Class> {
    try {
      console.log('📤 Criando turma (dados do modal):', classData);
      
      // Mapear React → API
      const apiData = this.mapReactToAPI(classData);
      
      // Adicionar campos obrigatórios se faltarem
      const dataToSend = {
        ...apiData,
        status: apiData.status || 'ativo',
        capacidade_maxima: apiData.capacidade_maxima || 30,
        ano_letivo: apiData.ano_letivo || new Date().getFullYear()
      };
      
      console.log('📤 Dados enviados para API:', dataToSend);
      
      const response = await apiClient.post('/api/turmas.php', dataToSend);
      const turma = response.data.data || response.data;
      
      console.log('✅ Turma criada:', turma);
      return this.mapAPIToReact(turma);
    } catch (error: any) {
      console.error('❌ Erro ao criar turma:', error);
      console.error('Resposta do servidor:', error.response?.data);
      throw new Error(error.response?.data?.message || 'Erro ao criar turma');
    }
  }

  /**
   * ✏️ Atualizar turma
   */
  async update(id: number, classData: Partial<Class>): Promise<Class> {
    try {
      console.log('📤 Atualizando turma ID:', id, classData);
      
      // Mapear React → API
      const apiData = this.mapReactToAPI(classData);
      
      console.log('📤 Dados enviados para API:', apiData);
      
      const response = await apiClient.put(`/api/turmas.php/${id}`, apiData);
      const turma = response.data.data || response.data;
      
      console.log('✅ Turma atualizada:', turma);
      return this.mapAPIToReact(turma);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar turma:', error);
      throw new Error(error.response?.data?.message || 'Erro ao atualizar turma');
    }
  }

  /**
   * 🗑️ Deletar turma
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🗑️ Deletando turma ID:', id);
      const response = await apiClient.delete(`/api/turmas.php/${id}`);
      console.log('✅ Turma deletada');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao deletar turma:', error);
      throw new Error(error.response?.data?.message || 'Erro ao deletar turma');
    }
  }

  /**
   * 👨‍🎓 Matricular estudante
   */
  async getClassStudents(turmaId: number): Promise<any[]> {
    try {
      const response = await apiClient.get(`/api/turmas.php?action=get_students&turma_id=${turmaId}`);
      return response.data?.data || [];
    } catch (error: any) {
      console.error('Erro ao buscar estudantes da turma:', error);
      return [];
    }
  }

  async enrollStudent(turmaId: number, studentId: number): Promise<{ success: boolean; message: string; students_count: number }> {
    try {
      console.log('📤 Matriculando estudante:', { turmaId, studentId });
      const response = await apiClient.post(
        `/api/turmas.php/${turmaId}/enroll_student`,
        { student_id: studentId }
      );
      console.log('✅ Estudante matriculado');
      return response.data;
    } catch (error: any) {
      console.error('❌ Erro ao matricular estudante:', error);
      throw new Error(error.response?.data?.message || 'Erro ao matricular estudante');
    }
  }
}

export default new ClassService();