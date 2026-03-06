// src/components/shared/inscription-modal/InscriptionPaymentTab.tsx

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DollarSign,
  Wallet,
  Building,
  Smartphone,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "cash" | "transfer" | "mobile" | "check";
export type PaymentStatus = "pending" | "paid" | "exempt" | "reversed";

interface InscriptionPaymentTabProps {
  inscriptionFee: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference: string;
  isMarkingPaid?: boolean; // Loading state
  onChangeField: (field: string, value: string | number) => void;
  onMarkAsPaid: () => void;
  formatCurrency: (value: number) => string;
}

const paymentMethods: Array<{
  id: PaymentMethod;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "cash", label: "Numerário", icon: Wallet },
  { id: "transfer", label: "Transferência", icon: Building },
  { id: "mobile", label: "M-Pesa/E-Mola", icon: Smartphone },
  { id: "check", label: "Cheque", icon: FileText },
];

export function InscriptionPaymentTab({
  inscriptionFee,
  paymentMethod,
  paymentStatus,
  paymentReference,
  isMarkingPaid = false,
  onChangeField,
  onMarkAsPaid,
  formatCurrency,
}: InscriptionPaymentTabProps) {
  const isPaid = paymentStatus === "paid";
  const isExempt = paymentStatus === "exempt";
  const isCompleted = isPaid || isExempt;

  return (
    <div className="space-y-6">
      {/* Taxa de Inscrição - Valor a Pagar */}
      <section className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 rounded-xl border border-[#004B87]/20 p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center flex-shrink-0">
            <DollarSign className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Taxa de Inscrição</h3>
            <p className="text-xs text-slate-500">Valor obrigatório para inscrição</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xl font-black text-[#004B87]">
            {inscriptionFee > 0 ? formatCurrency(inscriptionFee) : "Gratuita"}
          </p>
          <p className="text-[10px] text-slate-500">
            {inscriptionFee > 0 ? "Montante a Pagar" : "Inscrição sem custo"}
          </p>
        </div>
      </section>

      {/* Só mostra campos de pagamento se houver taxa */}
      {inscriptionFee > 0 && (
        <>
          {/* Método de Pagamento */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 block">
              Método de Pagamento
            </Label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = paymentMethod === method.id;

                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => onChangeField("paymentMethod", method.id)}
                    disabled={isCompleted || isMarkingPaid}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2",
                      isSelected
                        ? "border-[#F5821F] bg-orange-50 text-[#F5821F]"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-50",
                      (isCompleted || isMarkingPaid) && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{method.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Valor a Pagar (display only) */}
          <section className="bg-white rounded-2xl border border-slate-200 p-6">
            <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 block">
              Valor a Pagar
            </Label>

            <div className="flex gap-3 items-center">
              {/* Valor (somente leitura) */}
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
                  MZN
                </span>
                <div className="h-14 pl-14 pr-4 text-xl font-bold border-2 border-slate-200 rounded-lg bg-slate-50 flex items-center text-slate-700">
                  {inscriptionFee.toLocaleString("pt-MZ")}
                </div>
              </div>

              {/* Botão Marcar como Pago */}
              <button
                type="button"
                onClick={onMarkAsPaid}
                disabled={isCompleted || isMarkingPaid}
                className={cn(
                  "h-14 px-6 rounded-xl font-bold transition-all flex items-center gap-2",
                  isCompleted
                    ? "bg-green-100 text-green-700 border-2 border-green-200 cursor-default"
                    : isMarkingPaid
                    ? "bg-slate-200 text-slate-500 cursor-wait"
                    : "bg-[#F5821F] text-white hover:bg-[#E07318] active:scale-95"
                )}
              >
                {isMarkingPaid ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : isCompleted ? (
                  <>
                    <CheckCircle2 className="h-5 w-5" />
                    Pago
                  </>
                ) : (
                  "Marcar como Pago"
                )}
              </button>
            </div>
          </section>

          {/* Referência de Pagamento (para métodos não numerário) */}
          {paymentMethod !== "cash" && (
            <section className="bg-white rounded-2xl border border-slate-200 p-6 animate-in slide-in-from-top-2">
              <Label className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 block">
                Referência / Comprovativo
              </Label>
              <Input
                type="text"
                value={paymentReference}
                onChange={(e) => onChangeField("paymentReference", e.target.value)}
                disabled={isCompleted || isMarkingPaid}
                placeholder={
                  paymentMethod === "transfer"
                    ? "Ex: NIB ou número da transferência"
                    : paymentMethod === "mobile"
                    ? "Ex: MP-2026-XXXXX"
                    : "Ex: Número do cheque"
                }
                className={cn(
                  "h-12 border-2 focus:border-[#F5821F]",
                  (isCompleted || isMarkingPaid) && "opacity-60 cursor-not-allowed bg-slate-50"
                )}
              />
              <p className="text-xs text-slate-500 mt-2">
                Insira o número de referência ou comprovativo do pagamento
              </p>
            </section>
          )}
        </>
      )}

      {/* Status de Pagamento */}
      <div
        className={cn(
          "p-4 rounded-xl border flex items-start gap-3",
          isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-amber-50 border-amber-200"
        )}
      >
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
        ) : (
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
        )}
        <div>
          <p
            className={cn(
              "font-medium",
              isCompleted ? "text-green-800" : "text-amber-800"
            )}
          >
            {isExempt
              ? "Inscrição Gratuita"
              : isPaid
              ? "Pagamento confirmado"
              : "Aguardando confirmação"}
          </p>
          <p
            className={cn(
              "text-sm",
              isCompleted ? "text-green-600" : "text-amber-600"
            )}
          >
            {isExempt
              ? "Esta inscrição não requer pagamento."
              : isPaid
              ? "A inscrição será efectivada após confirmar."
              : "Clique em 'Marcar como Pago' após receber o pagamento."}
          </p>
        </div>
      </div>
    </div>
  );
}
