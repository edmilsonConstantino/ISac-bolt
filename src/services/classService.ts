import apiClient from './api';

// Interface do React (frontend)
export interface Class {
  id?: number;
  code?: string; // Código da turma (ex: INF-2024-123)
  name: string;
  description?: string;
  subject?: string; // Disciplina/Matéria
  curso?: string; // código do curso (ex: 'INF', 'CONT')
  curso_nome?: string; // nome completo do curso
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
  duration?: string; // "6" ou "12" (apenas número)
  status?: 'active' | 'inactive' | 'completed';
  created_at?: string;
  updated_at?: string;
  selectedStudentIds?: number[]; // IDs dos estudantes a adicionar (criação)
  nivel_id?: number | null;      // ID do nível (quando curso tem_niveis=true)
  nivel_numero?: number | null;  // curso_niveis.nivel — ordinal (1, 2, 3…)
  nivel_nome?: string | null;    // curso_niveis.nome (ex: "Nível 1", "Básico")
}

interface TurmaAPI {
  id?: number;
  codigo?: string;        // agora pode ser opcional se backend gera
  nome: string;
  curso_id: string;       // ✅ adicionar
  // disciplina removida do create
  professor_id?: number | null;
  semestre?: string;
  ano_letivo: number;
  duracao_meses: number;
  capacidade_maxima: number;
  vagas_ocupadas?: number;
  sala?: string;
  dias_semana: string;
  horario_inicio: string;
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
    console.log('🔄 Iniciando mapeamento React → API:', data);
    
    const mapped: Partial<TurmaAPI> = {};

    // ✅ Campos obrigatórios
    if (data.code) {
      mapped.codigo = data.code;
      console.log('✓ Código:', data.code);
    }
    
    if (data.name) {
      mapped.nome = data.name;
      console.log('✓ Nome:', data.name);
    }
    
    if (data.subject) {
      mapped.disciplina = data.subject;
      console.log('✓ Disciplina:', data.subject);
    }

    // ✅ Adicionar curso_id
    if (data.curso) {
      (mapped as any).curso_id = data.curso;
      console.log('✓ curso_id:', data.curso);
    }

    // ✅ Campos opcionais
    if (data.description) {
      mapped.observacoes = data.description;
    }
    
    if (data.teacher_id !== undefined) {
      mapped.professor_id = data.teacher_id;
    }
    
    if (data.capacity) {
      mapped.capacidade_maxima = data.capacity;
      console.log('✓ Capacidade:', data.capacity);
    }
    
    if (data.room) {
      mapped.sala = data.room;
    }
    
    if (data.semester) {
      mapped.semestre = data.semester;
    }
    
    // ✅ Converter duration "6" → 6 (número)
    if (data.duration) {
      const months = parseInt(data.duration.toString().replace(/\D/g, ''));
      if (!isNaN(months) && months > 0) {
        mapped.duracao_meses = months;
        console.log('✓ Duração (meses):', months);
      }
    }

    // ✅ Horários
    mapped.horario_inicio = data.start_time ? 
      (data.start_time.length === 5 ? `${data.start_time}:00` : data.start_time) : 
      '00:00:00';
    
    mapped.horario_fim = data.end_time ? 
      (data.end_time.length === 5 ? `${data.end_time}:00` : data.end_time) : 
      '00:00:00';

    // ✅ Datas
    if (data.start_date) {
      mapped.data_inicio = data.start_date;
    }
    
    if (data.end_date) {
      mapped.data_fim = data.end_date;
    }

    // ✅ Status: active → ativo
    if (data.status) {
      const statusMap: Record<string, any> = {
        'active': 'ativo',
        'inactive': 'inativo',
        'completed': 'concluido'
      };
      mapped.status = statusMap[data.status] || 'ativo';
      console.log('✓ Status:', mapped.status);
    }

    // ✅ Ano letivo
    if (data.start_date) {
      mapped.ano_letivo = new Date(data.start_date).getFullYear();
    } else {
      mapped.ano_letivo = new Date().getFullYear();
    }
    console.log('✓ Ano letivo:', mapped.ano_letivo);

    // ✅ Dias da semana
    if (data.schedule_days) {
      mapped.dias_semana = data.schedule_days;
    } else if (data.schedule) {
      mapped.dias_semana = data.schedule;
    } else {
      mapped.dias_semana = '';
    }

    // Remove disciplina
    delete (mapped as any).disciplina;

    // ✅ Mapear selectedStudentIds → estudante_ids (para criação)
    if (data.selectedStudentIds && data.selectedStudentIds.length > 0) {
      (mapped as any).estudante_ids = data.selectedStudentIds;
      console.log('✓ Estudantes a adicionar:', data.selectedStudentIds.length);
    }

    // ✅ Mapear turno: schedule (manha/tarde/noite)
    if (data.schedule && ['manha', 'tarde', 'noite'].includes(data.schedule)) {
      (mapped as any).turno = data.schedule;
      console.log('✓ Turno:', data.schedule);
    }

    // ✅ Mapear nivel_id
    if (data.nivel_id != null) {
      (mapped as any).nivel_id = data.nivel_id;
      console.log('✓ nivel_id:', data.nivel_id);
    }

    console.log('✅ Mapeamento completo:', mapped);
    console.log('✅ Campos obrigatórios mapeados:', {
      codigo: !!mapped.codigo,
      nome: !!mapped.nome,
      curso_id: !!(mapped as any).curso_id
    });

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
      curso: data.curso_codigo || data.curso || data.curso_id,
      curso_nome: data.curso_nome || undefined,
      semester: data.semestre || data.semester,
      teacher_id: data.professor_id || data.teacher_id,
      teacher_name: data.professor_nome || data.teacher_name,
      capacity: data.capacidade_maxima || data.max_students || data.capacity,
      students: data.vagas_ocupadas || data.students_count || data.students || 0,
      room: data.sala || data.room,
      schedule: data.turno || data.schedule,
      schedule_days: data.dias_semana || data.schedule_days,
      start_time: data.horario_inicio?.substring(0, 5) || data.start_time,
      end_time: data.horario_fim?.substring(0, 5) || data.end_time,
      start_date: data.data_inicio || data.start_date,
      end_date: data.data_fim || data.end_date,
      status: this.mapStatusToReact(data.status),
      created_at: data.data_criacao || data.created_at,
      updated_at: data.data_atualizacao || data.updated_at,
      nivel_id: data.nivel_id ? Number(data.nivel_id) : null,
      nivel_numero: data.nivel_numero != null ? Number(data.nivel_numero) : null,
      nivel_nome: data.nivel_nome ?? null,
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
      console.log('═══════════════════════════════════════════');
      console.log('📤 LISTAR TURMAS - Iniciando requisição...');
      
      const response = await apiClient.get('/api/turmas.php');
      
      console.log('✅ Resposta bruta da API:', response.data);
      
      const turmas = response.data.data || response.data || [];
      
      console.log('✅ Total de turmas encontradas:', turmas.length);
      console.log('✅ Primeira turma (antes do mapeamento):', turmas[0]);
      
      const turmasMapeadas = turmas.map((t: any) => this.mapAPIToReact(t));
      
      console.log('✅ Turmas mapeadas (formato React):', turmasMapeadas);
      console.log('✅ Primeira turma (depois do mapeamento):', turmasMapeadas[0]);
      console.log('═══════════════════════════════════════════');
      
      return turmasMapeadas;
    } catch (error: any) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERRO ao listar turmas');
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Resposta:', error.response?.data);
      console.error('═══════════════════════════════════════════');
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar turmas');
    }
  }

  /**
   * Listar turmas de um estudante específico
   */
  async getByStudent(studentId: number): Promise<Class[]> {
    try {
      const response = await apiClient.get(`/api/turmas.php?student_id=${studentId}`);
      const turmas = response.data.data || response.data || [];
      return turmas.map((t: any) => this.mapAPIToReact(t));
    } catch (error: any) {
      console.error('Erro ao buscar turmas do estudante:', error);
      return [];
    }
  }

  /**
   * Listar turmas de um professor específico
   */
  async getByTeacher(professorId: number): Promise<Class[]> {
    try {
      const response = await apiClient.get(`/api/turmas.php?professor_id=${professorId}`);
      const turmas = response.data.data || response.data || [];
      return turmas.map((t: any) => this.mapAPIToReact(t));
    } catch (error: any) {
      console.error('Erro ao buscar turmas do professor:', error);
      throw new Error(error.response?.data?.message || 'Erro ao buscar turmas do professor');
    }
  }

  /**
   * Atribuir ou desatribuir docente a uma turma
   */
  async assignTeacher(turmaId: number, professorId: number | null): Promise<void> {
    try {
      const response = await apiClient.put('/api/turmas.php?action=assign_teacher', {
        turma_id: turmaId,
        professor_id: professorId
      });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Erro ao atribuir docente');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Erro ao atribuir docente';
      throw new Error(msg);
    }
  }

  /**
   * Buscar turma por ID
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
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Erro ao buscar turma');
    }
  }

  /**
   * ➕ Criar nova turma
   */
  async create(classData: Partial<Class>): Promise<Class> {
    try {
      console.log('═══════════════════════════════════════════');
      console.log('📤 CRIAR TURMA - Dados recebidos do modal:', classData);
      
      // ✅ Mapear React → API
      const apiData = this.mapReactToAPI(classData);
      
      // 🚫 garantir que não vai disciplina em create
      delete (apiData as any).disciplina;
      
      // ✅ Garantir campos obrigatórios
      const dataToSend: any = {
        ...apiData,
        // Valores padrão para campos obrigatórios se faltarem
        status: apiData.status || 'ativo',
        capacidade_maxima: apiData.capacidade_maxima || 30,
        ano_letivo: apiData.ano_letivo || new Date().getFullYear(),
        duracao_meses: apiData.duracao_meses || 6,
        horario_inicio: apiData.horario_inicio || '00:00:00',
        horario_fim: apiData.horario_fim || '00:00:00',
        dias_semana: apiData.dias_semana || '',
        // ✅ Incluir turno se existir
        turno: (apiData as any).turno || 'manha'
      };

      // ✅ Incluir estudante_ids se existir (para adicionar estudantes na criação)
      if ((apiData as any).estudante_ids && (apiData as any).estudante_ids.length > 0) {
        dataToSend.estudante_ids = (apiData as any).estudante_ids;
        console.log('📤 Estudantes a adicionar:', dataToSend.estudante_ids.length);
      }

      console.log('📤 Dados FINAIS enviados para API:', dataToSend);
      console.log('📤 Verificação de campos:');
      console.log('   - nome:', dataToSend.nome, '✓');
      console.log('   - curso_id:', dataToSend.curso_id, '✓');
      console.log('   - turno:', dataToSend.turno, '✓');
      console.log('   - estudante_ids:', dataToSend.estudante_ids?.length || 0, 'estudantes');
      console.log('═══════════════════════════════════════════');

      console.log('🚀 POST /api/turmas.php payload FINAL:', dataToSend);
      
      const response = await apiClient.post('/api/turmas.php', dataToSend);
      
      console.log('✅ Resposta da API:', response.data);
      
      const turma = response.data.data || response.data;
      return this.mapAPIToReact(turma);
      
    } catch (error: any) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERRO ao criar turma');
      console.error('❌ Mensagem:', error.message);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Resposta do servidor:', error.response?.data);
      console.error('═══════════════════════════════════════════');
      
      // Melhorar mensagem de erro
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Erro ao criar turma';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * ➕ Criar nova turma (via payload API direto)
   */
  async createAPI(payload: Partial<TurmaAPI>): Promise<any> {
    try {
      console.log('📤 CRIAR TURMA VIA API - Payload:', payload);
      const response = await apiClient.post('/api/turmas.php', payload);
      console.log('✅ Resposta da API:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ ERRO ao criar turma via API:', error.response?.data);
      throw new Error(error.response?.data?.error || error.response?.data?.message || 'Erro ao criar turma');
    }
  }

  /**
   * ✏️ Atualizar turma
   */
  async update(id: number, classData: Partial<Class>): Promise<Class> {
    try {
      console.log('═══════════════════════════════════════════');
      console.log('📤 ATUALIZAR TURMA - ID:', id);
      console.log('📤 Dados recebidos:', classData);
      
      const apiData = this.mapReactToAPI(classData);
      
      console.log('📤 Dados mapeados para API:', apiData);
      console.log('═══════════════════════════════════════════');
      
      const response = await apiClient.put(`/api/turmas.php/${id}`, apiData);
      
      console.log('✅ Resposta da API:', response.data);
      
      const turma = response.data.data || response.data;
      return this.mapAPIToReact(turma);
      
    } catch (error: any) {
      console.error('═══════════════════════════════════════════');
      console.error('❌ ERRO ao atualizar turma');
      console.error('❌ Resposta do servidor:', error.response?.data);
      console.error('═══════════════════════════════════════════');
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Erro ao atualizar turma';
      
      throw new Error(errorMessage);
    }
  }

  /**
   * 👨‍🎓 Buscar estudantes matriculados numa turma
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
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Erro ao deletar turma';
      throw new Error(errorMessage);
    }
  }
}

export default new ClassService();