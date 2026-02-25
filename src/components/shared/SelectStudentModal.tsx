import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
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

const TURNO_CONFIG = {
  manha: { label: "Manhã",  icon: Sun,    bg: "bg-yellow-400/20", text: "text-yellow-200" },
  tarde: { label: "Tarde",  icon: Sunset, bg: "bg-orange-400/20",  text: "text-orange-200" },
  noite: { label: "Noite",  icon: Moon,   bg: "bg-indigo-400/20",  text: "text-indigo-200" },
};

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

  useEffect(() => {
    if (isOpen && turmaId && cursoId) {
      loadAvailableStudents();
    }
  }, [isOpen, turmaId, cursoId, turno]);

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
      if (turno) url += `&turno=${turno}`;
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
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
    setSelectedIds(checked ? filteredStudents.map(s => s.id) : []);
  };

  const handleSelectStudent = (studentId: number, checked: boolean) => {
    setSelectedIds(prev =>
      checked ? [...prev, studentId] : prev.filter(id => id !== studentId)
    );
  };

  const handleAddStudents = async () => {
    if (selectedIds.length === 0) {
      toast.warning("Selecione pelo menos um estudante");
      return;
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://localhost/API-LOGIN/api/turmas.php?action=add_students', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ turma_id: turmaId, estudante_ids: selectedIds })
      });
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
  const turnoInfo = turno ? TURNO_CONFIG[turno as keyof typeof TURNO_CONFIG] : null;
  const TurnoIcon = turnoInfo?.icon;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl h-[80vh] p-0 overflow-hidden rounded-2xl flex flex-col gap-0 [&>button]:hidden border-0 shadow-2xl">

        {/* ── HEADER ── */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#003868] px-5 pt-4 pb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#F5821F] flex items-center justify-center shadow-lg flex-shrink-0">
                <UserPlus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base leading-tight">
                  Adicionar Estudantes
                </h2>
                <p className="text-blue-200 text-xs mt-0.5">
                  Selecione os estudantes para matricular na turma
                </p>
              </div>
            </div>

            {/* Right side: turno badge + close */}
            <div className="flex items-center gap-2">
              {turnoInfo && TurnoIcon && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${turnoInfo.bg}`}>
                  <TurnoIcon className={`h-3 w-3 ${turnoInfo.text}`} />
                  <span className={`text-xs font-medium ${turnoInfo.text}`}>{turnoInfo.label}</span>
                </div>
              )}
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Orange accent line */}
        <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F] flex-shrink-0" />

        {/* ── SEARCH + STATS ── */}
        <div className="bg-white px-5 py-3 flex-shrink-0 border-b border-slate-100">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="h-9 pl-9 text-sm border-slate-200 focus:border-[#004B87] bg-slate-50 rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Stats chips */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-100">
                <Users className="h-3 w-3 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">
                  {filteredStudents.length} disponíveis
                </span>
              </div>
              {selectedIds.length > 0 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-100">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600">
                    {selectedIds.length} selecionados
                  </span>
                </div>
              )}
            </div>

            {/* Select all */}
            {filteredStudents.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  className="border-slate-300 data-[state=checked]:bg-[#004B87] data-[state=checked]:border-[#004B87]"
                />
                <span className="text-xs font-medium text-slate-600">Selecionar todos</span>
              </label>
            )}
          </div>
        </div>

        {/* ── STUDENT LIST ── */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-3">
                <Loader2 className="h-7 w-7 text-[#004B87] animate-spin" />
              </div>
              <p className="text-sm font-medium text-slate-600">Carregando estudantes...</p>
              <p className="text-xs text-slate-400 mt-1">Aguarde um momento</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-3 shadow-sm">
                <AlertCircle className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm font-semibold text-slate-600">
                {searchTerm ? "Nenhum resultado" : "Sem estudantes disponíveis"}
              </p>
              <p className="text-xs text-slate-400 mt-1 text-center max-w-48">
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
                  onClick={() => handleSelectStudent(student.id, !isSelected)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "border-[#004B87] bg-blue-50/70 shadow-sm"
                      : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                    className="border-slate-300 data-[state=checked]:bg-[#004B87] data-[state=checked]:border-[#004B87] flex-shrink-0"
                  />

                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F5821F] to-[#FF9933] flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-sm">
                      {student.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${isSelected ? "text-[#004B87]" : "text-slate-800"}`}>
                      {student.nome}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{student.email}</p>
                    {student.telefone && (
                      <p className="text-[10px] text-slate-400 mt-0.5">{student.telefone}</p>
                    )}
                  </div>

                  {isSelected && (
                    <CheckCircle2 className="h-4.5 w-4.5 text-[#004B87] flex-shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className="bg-white border-t border-slate-100 px-5 py-3.5 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              {selectedIds.length > 0 ? (
                <>
                  <span className="font-semibold text-[#004B87]">{selectedIds.length}</span>
                  {" "}estudante{selectedIds.length !== 1 ? "s" : ""}{" "}
                  será{selectedIds.length !== 1 ? "ão" : ""} adicionado{selectedIds.length !== 1 ? "s" : ""}
                </>
              ) : (
                "Nenhum estudante selecionado"
              )}
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClose}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>

              <button
                onClick={handleAddStudents}
                disabled={selectedIds.length === 0 || isSaving}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#F5821F] to-[#e06a10] hover:from-[#e06a10] hover:to-[#cc5f0e] shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Adicionar{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}
