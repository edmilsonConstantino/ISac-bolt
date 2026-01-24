// src/hooks/useStudentData.ts
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://localhost:8000/api/turmas/";

export function useStudentData() {
  const [students, setStudents] = useState([]);

  // Função para buscar os estudantes da API
  useEffect(() => {
    axios.get(`${API_URL}/students/`)
      .then(res => setStudents(res.data))
      .catch(err => console.error("Erro ao buscar estudantes:", err));
  }, []);

  // Criar estudante
  const addStudent = async (student: any) => {
    try {
      const res = await axios.post(`${API_URL}/students/`, student);
      setStudents(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Erro ao adicionar estudante:", err);
    }
  };

  const updateStudent = async (id: number, updatedStudent: any) => {
    try {
      await axios.put(`${API_URL}/students/${id}/`, updatedStudent);
      setStudents(prev => prev.map(s => s.id === id ? updatedStudent : s));
    } catch (err) {
      console.error("Erro ao atualizar estudante:", err);
    }
  };

  const deleteStudent = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/students/${id}/`);
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error("Erro ao deletar estudante:", err);
    }
  };

  return { students, addStudent, updateStudent, deleteStudent };
}
