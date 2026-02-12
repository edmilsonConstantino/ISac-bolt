/**
 * REGISTRATION SERVICE
 * 
 * 📁 LOCATION: src/services/registrationService.ts
 */

import apiClient from './api';

export interface Registration {
  id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  course_id: string;
  course_name?: string;
  class_id?: number | null;
  class_name?: string;
  enrollment_number: string;
  period: string;
  enrollment_date: string;
  status: 'active' | 'suspended' | 'cancelled' | 'completed';
  payment_status: 'paid' | 'pending' | 'overdue';
  enrollment_fee: number;
  monthly_fee: number;
  username: string;
  observations?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRegistrationData {
  student_id: number;
  course_id: string;
  class_id?: number | null;
  enrollment_number: string;
  period: string;
  enrollment_date: string;
  status?: 'active' | 'suspended' | 'cancelled' | 'completed';
  payment_status?: 'paid' | 'pending' | 'overdue';
  enrollment_fee?: number;
  monthly_fee?: number;
  username: string;
  password: string;
  observations?: string;
}

class RegistrationService {
  /**
   * 📋 List all registrations
   */
  async getAll(): Promise<Registration[]> {
    try {
      const response = await apiClient.get<Registration[]>('/api/registrations.php');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      throw new Error(error.response?.data?.message || 'Error fetching registrations');
    }
  }

  /**
   * 🔍 Get registration by ID
   */
  async getById(id: number): Promise<Registration> {
    try {
      const response = await apiClient.get<Registration[]>(`/api/registrations.php?id=${id}`);
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data[0];
      }
      
      throw new Error('Registration not found');
    } catch (error: any) {
      console.error('Error fetching registration:', error);
      throw new Error(error.response?.data?.message || 'Error fetching registration');
    }
  }

  /**
   * 👨‍🎓 Get registrations by student
   */
  async getByStudent(studentId: number): Promise<Registration[]> {
    try {
      const response = await apiClient.get<Registration[]>(`/api/registrations.php?student_id=${studentId}`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Error fetching student registrations:', error);
      throw new Error(error.response?.data?.message || 'Error fetching student registrations');
    }
  }

  /**
   * ➕ Create new registration
   */
  async create(registrationData: CreateRegistrationData): Promise<{ success: boolean; message: string; id?: number }> {
    try {
      console.log('📤 Sending registration data to API:', registrationData);
      
      const response = await apiClient.post<{ success: boolean; message: string; id?: number }>(
        '/api/registrations.php', 
        registrationData
      );
      
      console.log('✅ API Response:', response.data);
      
      return {
        success: response.data.success ?? true,
        message: response.data.message || 'Registration created successfully',
        id: response.data.id
      };
    } catch (error: any) {
      console.error('❌ Error creating registration:', error);
      console.error('Response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Error creating registration';
      throw new Error(errorMessage);
    }
  }

  /**
   * ✏️ Update registration
   */
  async update(id: number, data: Partial<Registration>): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put<{ success: boolean; message: string }>(
        '/api/registrations.php',
        { id, ...data }
      );
      
      return {
        success: response.data.success ?? true,
        message: response.data.message || 'Registration updated successfully'
      };
    } catch (error: any) {
      console.error('Error updating registration:', error);
      throw new Error(error.response?.data?.message || 'Error updating registration');
    }
  }

  /**
   * 🗑️ Cancel registration
   */
  async cancel(id: number): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete<{ success: boolean; message: string }>(
        '/api/registrations.php',
        {
          data: { id }
        }
      );
      
      return {
        success: response.data.success ?? true,
        message: response.data.message || 'Registration cancelled successfully'
      };
    } catch (error: any) {
      console.error('Error cancelling registration:', error);
      throw new Error(error.response?.data?.message || 'Error cancelling registration');
    }
  }
  /**
   * 🔢 Get next enrollment number for course (for enrollment number generation)
   * Returns: { total, next_number, prefix, year, suggested_code }
   * Formato: {CODIGO_CURSO}{ANO}{NUMERO_SEQUENCIAL} ex: INGM202601
   */
  async getCountByCourse(courseId: string): Promise<{
    total: number;
    next_number: number;
    prefix?: string;
    year?: string;
    suggested_code?: string;
  }> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        total: number;
        next_number: number;
        prefix?: string;
        year?: string;
        suggested_code?: string;
      }>(`/api/registrations/count-by-course.php?course_id=${courseId}`);

      return {
        total: response.data.total || 0,
        next_number: response.data.next_number || 1,
        prefix: response.data.prefix,
        year: response.data.year,
        suggested_code: response.data.suggested_code,
      };
    } catch (error: any) {
      console.error('Error getting course count:', error);
      return { total: 0, next_number: 1 };
    }
  }
}

export default new RegistrationService();