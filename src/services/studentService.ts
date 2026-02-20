/**
 * STUDENT SERVICE - ENGLISH VERSION
 * 
 * 📁 LOCATION: src/services/studentService.ts
 */

import apiClient from './api';

// Complete student interface (matching database - English)
export interface Student {
  id: number;
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  bi_number: string;
  gender: 'M' | 'F';
  curso_id: string;
  curso?: string;
  username?: string;
  enrollment_year?: number;
  emergency_contact_1?: string;
  emergency_contact_2?: string;
  notes?: string;
  status: 'ativo' | 'inativo';
  created_at?: string;
  updated_at?: string;
}

// Interface for creating student
export interface CreateStudentData {
  name: string;
  email: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  bi_number: string;
  gender: 'M' | 'F';
  curso_id: string;
  curso?: string;
  enrollment_year?: number;
  emergency_contact_1?: string;
  emergency_contact_2?: string;
  notes?: string;
  status?: 'ativo' | 'inativo';
  class_id?: number; // To link to class during creation
}

// Interface for updating student
export interface UpdateStudentData {
  id: number;
  name?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  address?: string;
  bi_number?: string;
  gender?: 'M' | 'F';
  curso_id?: string;
  curso?: string;
  enrollment_year?: number;
  emergency_contact_1?: string;
  emergency_contact_2?: string;
  notes?: string;
  status?: 'ativo' | 'inativo';
}

class StudentService {
  /**
   * 📋 List all students
   */
  async getAll(): Promise<Student[]> {
    try {
      const response = await apiClient.get<{ success: boolean; data: Student[] } | Student[]>('/api/students.php');

      // API retorna { success: true, data: [...] }
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return Array.isArray(response.data.data) ? response.data.data : [];
      }

      // Fallback para array directo (caso o formato mude)
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching students:', error);
      throw new Error(error.response?.data?.message || 'Error fetching students');
    }
  }

  /**
   * 🔍 Get student by ID
   */
  async getById(id: number): Promise<Student> {
    try {
      const response = await apiClient.get<Student[]>(`/api/students.php?id=${id}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      
      throw new Error('Student not found');
    } catch (error: any) {
      console.error('Error fetching student:', error);
      throw new Error(error.response?.data?.message || 'Error fetching student');
    }
  }

  /**
   * ➕ Create new student
   */
  async create(studentData: CreateStudentData): Promise<{ success: boolean; message: string; id?: number; credentials?: { username: string; password: string } }> {
    try {
      console.log('📤 Sending student data to API:', studentData);

      const response = await apiClient.post<{
        success: boolean;
        message: string;
        id?: number;
        credentials?: { username: string; password: string };
      }>(
        '/api/students.php',
        studentData
      );

      // Debug logging detalhado
      console.log('📥 Full axios response:', response);
      console.log('📥 response.data:', response.data);
      console.log('📥 response.data type:', typeof response.data);
      console.log('📥 response.data.id:', response.data?.id);
      console.log('📥 response.data.success:', response.data?.success);
      console.log('📥 response.data.message:', response.data?.message);

      // Extrair dados da resposta (pode estar em response.data ou response.data.data)
      const data = response.data?.data ?? response.data;

      console.log('📥 Extracted data:', data);

      // Verificar se a resposta tem id
      const studentId = data?.id ?? response.data?.id;

      if (!studentId && data?.success !== false) {
        console.warn('⚠️ API retornou sucesso mas sem ID. Response completa:', JSON.stringify(response.data, null, 2));
      }

      return {
        success: data?.success ?? response.data?.success ?? true,
        message: data?.message ?? response.data?.message ?? 'Student created successfully',
        id: studentId ? Number(studentId) : undefined,
        credentials: data?.credentials ?? response.data?.credentials
      };
    } catch (error: any) {
      console.error('❌ Error creating student:', error);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      const responseData = error.response?.data;
      const errorMessage = responseData?.message || error.message || 'Error creating student';
      const err = new Error(errorMessage) as any;
      err.field = responseData?.field || '';
      throw err;
    }
  }

  /**
   * ✏️ Update student
   */
  async update(studentData: UpdateStudentData): Promise<{ success: boolean; message: string }> {
    try {
      if (!studentData.id) {
        throw new Error('Student ID is required for update');
      }

      const response = await apiClient.put<{ success: boolean; message: string }>(
        '/api/students.php',
        studentData
      );
      
      return {
        success: response.data.success ?? true,
        message: response.data.message || 'Student updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating student:', error);
      throw new Error(error.response?.data?.message || 'Error updating student');
    }
  }

  /**
   * 🗑️ Delete student (soft delete)
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        '/api/students.php',
        {
          data: { id }
        }
      );
      
      return {
        success: response.data.success ?? true,
        message: response.data.message || 'Student deleted successfully'
      };
    } catch (error: any) {
      console.error('Error deleting student:', error);
      throw new Error(error.response?.data?.message || 'Error deleting student');
    }
  }
}

export default new StudentService();