// src/components/shared/RecordPaymentModal.tsx
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePaymentPlans, PaymentPlan } from "@/hooks/usePaymentPlans";
import { toast } from "sonner";
import {
  DollarSign,
  User,
  BookOpen,
  Calendar,
  CreditCard,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Loader2
} from "lucide-react";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: PaymentPlan;
  onPaymentRecorded: () => void;
}

// Formatar moeda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('pt-MZ', {
    style: 'currency',
    currency: 'MZN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Métodos de pagamento
const PAYMENT_METHODS = [
  { id: 1, codigo: 'cash', nome: 'Numerário' },
  { id: 2, codigo: 'mpesa', nome: 'M-Pesa' },
  { id: 3, codigo: 'transfer', nome: 'Transferência Bancária' },
  { id: 4, codigo: 'card', nome: 'Cartão' },
  { id: 5, codigo: 'other', nome: 'Outro' }
];

export function RecordPaymentModal({
  isOpen,
  onClose,
  plan,
  onPaymentRecorded
}: RecordPaymentModalProps) {
  const { recordPayment } = usePaymentPlans({ autoFetch: false });

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amountPaid: 0,
    paymentMethodId: 1,
    paymentReference: '',
    paidDate: new Date().toISOString().split('T')[0],
    generateReceipt: true,
    observacoes: ''
  });

  // Resetar form quando o plano mudar
  useEffect(() => {
    if (plan) {
      setFormData({
        amountPaid: plan.total_due_with_penalty,
        paymentMethodId: 1,
        paymentReference: '',
        paidDate: new Date().toISOString().split('T')[0],
        generateReceipt: true,
        observacoes: ''
      });
    }
  }, [plan]);

  const handleSubmit = async () => {
    if (!plan) {
      toast.error('Nenhum plano de pagamento seleccionado');
      return;
    }

    if (formData.amountPaid <= 0) {
      toast.error('O valor do pagamento deve ser maior que zero');
      return;
    }

    setIsLoading(true);

    try {
      const result = await recordPayment({
        student_id: plan.student_id,
        curso_id: plan.curso_id,
        month_reference: plan.month_reference,
        amount_paid: formData.amountPaid,
        payment_type_id: formData.paymentMethodId,
        paid_date: formData.paidDate,
        observacoes: formData.observacoes || undefined
      });

      if (result.success) {
        toast.success('Pagamento registado com sucesso!');
        onPaymentRecorded();
      } else {
        toast.error(result.error || 'Erro ao registar pagamento');
      }
    } catch (error) {
      console.error('Erro ao registar pagamento:', error);
      toast.error('Erro ao registar pagamento');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = () => {
    if (plan) {
      setFormData(prev => ({
        ...prev,
        amountPaid: plan.total_due_with_penalty
      }));
    }
  };

  const selectedMethod = PAYMENT_METHODS.find(m => m.id === formData.paymentMethodId);
  const needsReference = selectedMethod?.codigo !== 'cash';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#004B87]">
            <Receipt className="h-5 w-5" />
            Registar Pagamento
          </DialogTitle>
        </DialogHeader>

        {plan ? (
          <div className="space-y-6">
            {/* Informações do Plano */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-[#004B87] to-[#0066B3] rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                  {plan.student_name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-[#004B87]">{plan.student_name}</h3>
                  <p className="text-sm text-slate-600">{plan.course_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Mês Referência</p>
                    <p className="font-medium text-slate-700">{plan.month_reference}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">Valor Base</p>
                    <p className="font-medium text-slate-700">{formatCurrency(plan.amount_due)}</p>
                  </div>
                </div>
              </div>

              {plan.penalty > 0 && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-700">
                      Multa de {plan.days_overdue} dias de atraso
                    </p>
                    <p className="text-lg font-bold text-red-700">
                      +{formatCurrency(plan.penalty)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-[#004B87]/10 rounded-lg">
                <span className="font-semibold text-[#004B87]">Total a Pagar</span>
                <span className="text-2xl font-bold text-[#004B87]">
                  {formatCurrency(plan.total_due_with_penalty)}
                </span>
              </div>
            </div>

            {/* Formulário de Pagamento */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Valor Pago (MZN)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        amountPaid: parseFloat(e.target.value) || 0
                      }))}
                      className="pl-10"
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAsPaid}
                    className="w-full text-xs"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marcar como Pago Total
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Data do Pagamento</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="date"
                      value={formData.paidDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        paidDate: e.target.value
                      }))}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Select
                  value={formData.paymentMethodId.toString()}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    paymentMethodId: parseInt(value)
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method.id} value={method.id.toString()}>
                        {method.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsReference && (
                <div className="space-y-2">
                  <Label>Referência / Comprovativo</Label>
                  <Input
                    value={formData.paymentReference}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paymentReference: e.target.value
                    }))}
                    placeholder="Ex: Número do comprovativo, código da transacção..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label>Observações (opcional)</Label>
                <Input
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    observacoes: e.target.value
                  }))}
                  placeholder="Notas adicionais sobre o pagamento..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generateReceipt"
                  checked={formData.generateReceipt}
                  onCheckedChange={(checked) => setFormData(prev => ({
                    ...prev,
                    generateReceipt: checked as boolean
                  }))}
                />
                <label
                  htmlFor="generateReceipt"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Gerar recibo automaticamente
                </label>
              </div>
            </div>

            {/* Resumo */}
            {formData.amountPaid > 0 && formData.amountPaid < plan.total_due_with_penalty && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Atenção:</strong> O valor pago ({formatCurrency(formData.amountPaid)}) é inferior ao total ({formatCurrency(plan.total_due_with_penalty)}).
                  Será registado como pagamento parcial.
                </p>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-[#F5821F] to-[#FF9933] hover:from-[#E07318] hover:to-[#F58820]"
                disabled={isLoading || formData.amountPaid <= 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    A processar...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4 mr-2" />
                    Registar Pagamento
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-600">
              Seleccione um plano de pagamento para registar o pagamento.
            </p>
            <Button
              variant="outline"
              onClick={onClose}
              className="mt-4"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default RecordPaymentModal;
