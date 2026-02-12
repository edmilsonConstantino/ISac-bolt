// src/components/shared/CourseFeesModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePaymentPlans, CourseFee } from "@/hooks/usePaymentPlans";
import { toast } from "sonner";
import {
  Settings,
  DollarSign,
  BookOpen,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Edit2,
  X
} from "lucide-react";

interface CourseFeesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Formatar moeda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(amount);
};

export function CourseFeesModal({ isOpen, onClose }: CourseFeesModalProps) {
  const { courseFees, fetchCourseFees, updateCourseFees, isLoading } = usePaymentPlans({ autoFetch: false });

  const [fees, setFees] = useState<CourseFee[]>([]);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    matricula_valor: 0,
    mensalidade_valor: 0,
    meses_total: 6
  });
  const [isSaving, setIsSaving] = useState(false);

  // Carregar taxas quando abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadFees();
    }
  }, [isOpen]);

  const loadFees = async () => {
    const data = await fetchCourseFees();
    setFees(data || []);
  };

  const handleEdit = (course: CourseFee) => {
    setEditingCourse(course.curso_id);
    setEditForm({
      matricula_valor: course.matricula_valor,
      mensalidade_valor: course.mensalidade_valor,
      meses_total: course.meses_total
    });
  };

  const handleCancelEdit = () => {
    setEditingCourse(null);
    setEditForm({
      matricula_valor: 0,
      mensalidade_valor: 0,
      meses_total: 6
    });
  };

  const handleSave = async (cursoId: string) => {
    setIsSaving(true);
    try {
      const result = await updateCourseFees({
        curso_id: cursoId,
        matricula_valor: editForm.matricula_valor,
        mensalidade_valor: editForm.mensalidade_valor,
        meses_total: editForm.meses_total
      });

      if (result.success) {
        toast.success('Taxas actualizadas com sucesso!');
        setEditingCourse(null);
        await loadFees();
      } else {
        toast.error(result.error || 'Erro ao actualizar taxas');
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao actualizar taxas');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#004B87]">
            <Settings className="h-5 w-5" />
            Configuração de Taxas por Curso
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#004B87] mb-4" />
              <p className="text-slate-600">A carregar taxas...</p>
            </div>
          ) : fees.length === 0 ? (
            <div className="py-12 text-center">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600">Nenhum curso encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Configure as taxas de matrícula e mensalidade para cada curso.
              </p>

              {fees.map((course) => (
                <Card
                  key={course.curso_id}
                  className={`border-2 transition-all ${
                    editingCourse === course.curso_id
                      ? 'border-[#F5821F] shadow-lg'
                      : course.configured
                      ? 'border-green-200'
                      : 'border-slate-200'
                  }`}
                >
                  <CardContent className="p-4">
                    {editingCourse === course.curso_id ? (
                      // Modo de Edição
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                              {course.curso_sigla?.substring(0, 2) || 'C'}
                            </div>
                            <div>
                              <h3 className="font-bold text-[#004B87]">{course.curso_nome}</h3>
                              <p className="text-xs text-slate-500">Código: {course.curso_id}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-xs">Taxa de Matrícula (MZN)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.matricula_valor}
                                onChange={(e) => setEditForm(prev => ({
                                  ...prev,
                                  matricula_valor: parseFloat(e.target.value) || 0
                                }))}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Mensalidade (MZN)</Label>
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editForm.mensalidade_valor}
                                onChange={(e) => setEditForm(prev => ({
                                  ...prev,
                                  mensalidade_valor: parseFloat(e.target.value) || 0
                                }))}
                                className="pl-10"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-xs">Duração (meses)</Label>
                            <Input
                              type="number"
                              min="1"
                              max="48"
                              value={editForm.meses_total}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                meses_total: parseInt(e.target.value) || 6
                              }))}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                          <Button
                            onClick={() => handleSave(course.curso_id)}
                            disabled={isSaving}
                            className="bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820]"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                A guardar...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={isSaving}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      // Modo de Visualização
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                            {course.curso_sigla?.substring(0, 2) || 'C'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-[#004B87]">{course.curso_nome}</h3>
                              {course.configured ? (
                                <Badge className="bg-green-100 text-green-700 text-[10px]">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Configurado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-500 text-[10px]">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Não configurado
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{course.curso_id}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Matrícula</p>
                            <p className="font-bold text-[#004B87]">
                              {formatCurrency(course.matricula_valor)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Mensalidade</p>
                            <p className="font-bold text-[#F5821F]">
                              {formatCurrency(course.mensalidade_valor)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-500">Duração</p>
                            <p className="font-bold text-slate-700">
                              {course.meses_total} meses
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            className="border-[#004B87] text-[#004B87] hover:bg-[#004B87] hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t mt-4">
          <p className="text-xs text-slate-500">
            As alterações são aplicadas imediatamente.
          </p>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CourseFeesModal;
