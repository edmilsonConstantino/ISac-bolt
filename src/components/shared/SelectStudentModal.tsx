import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, UserPlus, Users, X, Loader2, AlertCircle, CheckCircle2,
  Sun, Sunset, Moon
} from "lucide-react";
import { toast } from "sonner";

interface Student {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  curso_id: string;
  data_nascimento?: string;
}

interface SelectStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  turmaId: number;
  cursoId: string;
  turno?: string;
  onStudentsAdded: () => void;
}

export function SelectStudentModal({
  isOpen,
  onClose,
  turmaId,
  cursoId,
  turno,
  onStudentsAdded
}: SelectStudentModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Buscar estudantes disponíveis
  useEffect(() => {
    if (isOpen && turmaId && cursoId) {
      loadAvailableStudents();
    }
  }, [isOpen, turmaId, cursoId, turno]);

  // Filtrar estudantes com base na busca
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const loadAvailableStudents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      let url = `http://localhost/API-LOGIN/api/turmas.php?action=get_available_students&turma_id=${turmaId}&curso_id=${cursoId}`;
      if (turno) {
        url += `&turno=${turno}`;
      }
      const response = await fetch(
        url,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const result = await response.json();

      if (result.success) {
        setStudents(result.data || []);
        setFilteredStudents(result.data || []);
      } else {
        toast.error(result.message || "Erro ao carregar estudantes");
      }
    } catch (error) {
      console.error("Erro ao buscar estudantes:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredStudents.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, studentId]);
    } else {
      setSelectedIds(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleAddStudents = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Selecione pelo menos um estudante");
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        'http://localhost/API-LOGIN/api/turmas.php?action=add_students',
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            turma_id: turmaId,
            estudante_ids: selectedIds
          })
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(result.message || `${selectedIds.length} estudante(s) adicionado(s) com sucesso!`);
        onStudentsAdded();
        handleClose();
      } else {
        toast.error(result.message || "Erro ao adicionar estudantes");
      }
    } catch (error) {
      console.error("Erro ao adicionar estudantes:", error);
      toast.error("Erro ao conectar com o servidor");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedIds([]);
    setSearchTerm("");
    onClose();
  };

  const allSelected = filteredStudents.length > 0 && selectedIds.length === filteredStudents.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredStudents.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066BB] rounded-xl flex items-center justify-center shadow-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-2xl text-[#004B87]">
                Adicionar Estudantes à Turma
              </DialogTitle>
              <DialogDescription className="text-sm flex items-center gap-2">
                Selecione os estudantes que deseja matricular nesta turma
                {turno && (
                  <Badge className={`ml-2 ${
                    turno === 'manha' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    turno === 'tarde' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}>
                    {turno === 'manha' && <Sun className="h-3 w-3 mr-1" />}
                    {turno === 'tarde' && <Sunset className="h-3 w-3 mr-1" />}
                    {turno === 'noite' && <Moon className="h-3 w-3 mr-1" />}
                    {turno === 'manha' ? 'Manhã' : turno === 'tarde' ? 'Tarde' : 'Noite'}
                  </Badge>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* BUSCA E FILTROS */}
        <div className="py-4 space-y-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="h-11 pl-10 border-2 border-slate-300 focus:border-[#004B87]"
            />
          </div>

          {/* Estatísticas */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="h-3 w-3 mr-1" />
                {filteredStudents.length} disponíveis
              </Badge>
              {selectedIds.length > 0 && (
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {selectedIds.length} selecionados
                </Badge>
              )}
            </div>

            {filteredStudents.length > 0 && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-2"
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer"
                >
                  Selecionar todos
                </label>
              </div>
            )}
          </div>
        </div>

        {/* LISTA DE ESTUDANTES */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-[#004B87] animate-spin mb-3" />
              <p className="text-slate-600">Carregando estudantes...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
              <AlertCircle className="h-12 w-12 text-slate-400 mb-3" />
              <h4 className="text-lg font-semibold text-slate-600 mb-1">
                {searchTerm ? "Nenhum estudante encontrado" : "Nenhum estudante disponível"}
              </h4>
              <p className="text-sm text-slate-500">
                {searchTerm 
                  ? "Tente outro termo de busca" 
                  : "Todos os estudantes do curso já estão nesta turma"}
              </p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              
              return (
                <div
                  key={student.id}
                  className={`flex items-center gap-4 p-4 border-2 rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#004B87] bg-blue-50 shadow-sm"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm bg-white"
                  }`}
                  onClick={() => handleSelectStudent(student.id, !isSelected)}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => 
                      handleSelectStudent(student.id, checked as boolean)
                    }
                    className="border-2"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <div className="h-12 w-12 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-lg">
                      {student.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#004B87] truncate">
                      {student.nome}
                    </h4>
                    <p className="text-sm text-slate-600 truncate">{student.email}</p>
                    {student.telefone && (
                      <p className="text-xs text-slate-500 mt-0.5">{student.telefone}</p>
                    )}
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="border-t pt-4">
          <div className="flex justify-between items-center w-full gap-3">
            <p className="text-sm text-slate-600">
              {selectedIds.length > 0 && (
                <>
                  <span className="font-semibold text-[#004B87]">
                    {selectedIds.length}
                  </span>
                  {" "}estudante{selectedIds.length !== 1 ? "s" : ""} será{selectedIds.length !== 1 ? "ão" : ""} adicionado{selectedIds.length !== 1 ? "s" : ""}
                </>
              )}
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSaving}
                className="border-2 border-slate-300 hover:bg-slate-100"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              
              <Button
                onClick={handleAddStudents}
                disabled={selectedIds.length === 0 || isSaving}
                className="bg-gradient-to-r from-[#004B87] to-[#0066BB] hover:from-[#003D6E] hover:to-[#0055A0] text-white shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Adicionar {selectedIds.length > 0 ? `(${selectedIds.length})` : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}