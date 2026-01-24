// src/components/shared/registration-student-modal/tabs/PaymentTab.tsx

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CreditCard, DollarSign, Sparkles } from "lucide-react";
import type {
  RegistrationFormData,
  PaymentStatus,
  RegistrationStatus,
} from "../types/registrationModal.types";

interface PaymentTabProps {
  formData: RegistrationFormData;

  onChangeField: (field: keyof RegistrationFormData, value: any) => void;

  formatCurrency: (value: number) => string;
}

export function PaymentTab({
  formData,
  onChangeField,
  formatCurrency,
}: PaymentTabProps) {
  const enrollmentFee = Number(formData.enrollmentFee || 0);
  const monthlyFee = Number(formData.monthlyFee || 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* Valores */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 text-[#F5821F] rounded-lg">
              <CreditCard className="h-5 w-5" />
            </div>
            <Label className="font-bold text-slate-700 leading-none">
              Taxa de Matrícula (MZN)
            </Label>
          </div>

          <Input
            type="number"
            min="0"
            step="1"
            value={formData.enrollmentFee ?? ""}
            onChange={(e) =>
              onChangeField(
                "enrollmentFee",
                parseFloat(e.target.value) || 0
              )
            }
            className="h-12 rounded-xl text-lg font-bold"
          />

          {enrollmentFee > 0 && (
            <p className="text-sm text-[#F5821F] font-semibold">
              {formatCurrency(enrollmentFee)}
            </p>
          )}
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <DollarSign className="h-5 w-5" />
            </div>
            <Label className="font-bold text-slate-700 leading-none">
              Mensalidade (MZN)
            </Label>
          </div>

          <Input
            type="number"
            min="0"
            step="1"
            value={formData.monthlyFee ?? ""}
            onChange={(e) =>
              onChangeField("monthlyFee", parseFloat(e.target.value) || 0)
            }
            className="h-12 rounded-xl text-lg font-bold"
          />

          {monthlyFee > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              {formatCurrency(monthlyFee)}/mês
            </p>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <Label className="font-bold text-slate-700">Status da Matrícula</Label>

          <select
            value={(formData.status ?? "active") as RegistrationStatus}
            onChange={(e) =>
              onChangeField("status", e.target.value as RegistrationStatus)
            }
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
          >
            <option value="active">✅ Matriculado (Ativo)</option>
            <option value="suspended">⏸ Trancado</option>
            <option value="cancelled">❌ Cancelado</option>
            <option value="completed">🏆 Concluído</option>
          </select>
        </div>

        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <Label className="font-bold text-slate-700">Status do Pagamento</Label>

          <select
            value={(formData.paymentStatus ?? "pending") as PaymentStatus}
            onChange={(e) =>
              onChangeField("paymentStatus", e.target.value as PaymentStatus)
            }
            className="w-full h-12 px-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#F5821F] focus:border-[#F5821F] outline-none"
          >
            <option value="paid">💰 Pago</option>
            <option value="pending">⏳ Pendente</option>
            <option value="overdue">⚠️ Atrasado</option>
          </select>
        </div>
      </div>

      {/* Observações */}
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <Label className="font-bold text-slate-700">Observações</Label>

        <Textarea
          placeholder="Informações adicionais sobre a matrícula..."
          value={formData.observations ?? ""}
          onChange={(e) => onChangeField("observations", e.target.value)}
          rows={4}
          className={cn("rounded-2xl resize-none")}
        />
      </div>

      {/* Resumo */}
      <div className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-[#004B87] mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#F5821F]" />
          Resumo da Matrícula
        </h3>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Estudante:</span>
            <span className="text-sm font-semibold text-[#004B87]">
              {formData.studentName || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Curso:</span>
            <span className="text-sm font-semibold text-purple-600">
              {formData.courseName || "-"}
            </span>
          </div>

          {formData.className ? (
            <div className="flex justify-between">
              <span className="text-sm text-slate-600">Turma:</span>
              <span className="text-sm font-semibold text-blue-600">
                {formData.className}
              </span>
            </div>
          ) : null}

          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Período:</span>
            <span className="text-sm font-semibold text-[#F5821F]">
              {formData.period || "-"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Taxa de Matrícula:</span>
            <span className="text-sm font-semibold text-orange-600">
              {formatCurrency(enrollmentFee)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-slate-600">Mensalidade:</span>
            <span className="text-sm font-semibold text-green-600">
              {formatCurrency(monthlyFee)}/mês
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
