// src/components/shared/registration-student-modal/tabs/ConfirmationTab.tsx

import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, GraduationCap, User, BookOpen, Calendar,
  CreditCard, DollarSign, Wallet, Building, Smartphone,
  Clock, BadgeCheck, FileText, Sparkles, RotateCcw
} from "lucide-react";
import type { RegistrationFormData, PaymentMethod } from "../types/registrationModal.types";
import { ConfirmDialog, useConfirmDialog } from "@/components/ui/confirm-dialog";

interface PaymentItem {
  id: string;
  label: string;
  description: string;
  amount: number;
  isRequired: boolean;
  isSelected: boolean;
}

interface ConfirmationTabProps {
  formData: RegistrationFormData;
  onChangeField: (field: keyof RegistrationFormData, value: any) => void;
  formatCurrency: (value: number) => string;
  selectedStudent?: { name: string; email: string; phone?: string | null } | null;
  selectedCourse?: { nome: string; codigo: string } | null;
}

export function ConfirmationTab({
  formData,
  onChangeField,
  formatCurrency,
  selectedStudent,
  selectedCourse,
}: ConfirmationTabProps) {
  const { openConfirm, dialogProps } = useConfirmDialog();
  const isBolsista = Boolean(formData.isBolsista);
  const enrollmentFee = Number(formData.enrollmentFee || 0);
  const monthlyFee = Number(formData.monthlyFee || 0);

  // Inicializar com valores do formData se existirem
  const [includeFirstMonth, setIncludeFirstMonth] = useState<boolean>(
    formData.includeFirstMonth ?? false
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (formData.paymentMethod as PaymentMethod) || 'cash'
  );
  const [paidAmount, setPaidAmount] = useState<number>(
    Number(formData.paidAmount) || 0
  );
  const [paymentReference, setPaymentReference] = useState<string>(
    formData.paymentReference || ''
  );

  // Calcular total a pagar
  const totalToPay = enrollmentFee + (includeFirstMonth ? monthlyFee : 0);

  // ✅ Bolsista → garantir que 1ª mensalidade nunca está incluída
  useEffect(() => {
    if (isBolsista && includeFirstMonth) {
      setIncludeFirstMonth(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBolsista]);

  // ✅ Clamp paidAmount quando totalToPay diminui (ex: desmarcou mensalidade)
  useEffect(() => {
    if (paidAmount > totalToPay) {
      setPaidAmount(totalToPay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalToPay]);

  // Calcular valor pendente (sempre >= 0)
  const pendingAmount = Math.max(0, totalToPay - paidAmount);

  // Determinar status da matrícula baseado no pagamento
  const isEnrollmentPaid = paidAmount >= enrollmentFee;
  const isFullyPaid = paidAmount >= totalToPay && totalToPay > 0;

  // ✅ Sincronizar com formData sempre que valores mudarem
  useEffect(() => {
    onChangeField("includeFirstMonth", includeFirstMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [includeFirstMonth]);

  useEffect(() => {
    onChangeField("paymentMethod", paymentMethod);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethod]);

  useEffect(() => {
    onChangeField("paidAmount", paidAmount);

    // Atualizar status baseado no pagamento
    if (paidAmount >= enrollmentFee) {
      onChangeField("status", "active"); // Taxa paga = matrícula ativa
      onChangeField("paymentStatus", isFullyPaid ? "paid" : "pending");
    } else {
      onChangeField("status", "pending"); // Taxa não paga = pendente
      onChangeField("paymentStatus", "pending");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paidAmount, enrollmentFee, isFullyPaid]);

  useEffect(() => {
    onChangeField("paymentReference", paymentReference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentReference]);

  // Métodos de pagamento disponíveis
  const paymentMethods: Array<{ id: PaymentMethod; label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = [
    { id: 'cash', label: 'Numerário', icon: Wallet, color: 'green' },
    { id: 'transfer', label: 'Transferência', icon: Building, color: 'blue' },
    { id: 'mobile', label: 'M-Pesa/E-Mola', icon: Smartphone, color: 'orange' },
    { id: 'check', label: 'Cheque', icon: FileText, color: 'slate' },
  ];

  // Determinar tipo de inscrição
  const getRegistrationTypeLabel = () => {
    switch (formData.registrationType) {
      case 'new': return 'Novo Estudante - Primeira Matrícula';
      case 'renewal': return 'Renovação de Matrícula';
      case 'transfer': return 'Inscrição por Módulo';
      default: return 'Não especificado';
    }
  };

  return (
    <>
    <ConfirmDialog {...dialogProps} />
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* ===== RESUMO ACADÉMICO ===== */}
      <section className="bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 rounded-2xl p-4">
        {/* Header: título + badge de estado */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#004B87] flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#F5821F]" />
            Resumo da Matrícula
          </h3>
          <div className={cn(
            "px-3 py-1 rounded-full text-xs font-bold",
            isEnrollmentPaid ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
          )}>
            {isEnrollmentPaid ? '✓ Activa' : '⏳ Pendente'}
          </div>
        </div>

        {/* Linha 1: Estudante (largura total) */}
        <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100 mb-2">
          <div className="h-8 w-8 bg-[#004B87] rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">Estudante</p>
            <p className="font-bold text-slate-800 text-sm truncate">{selectedStudent?.name || formData.studentName || '-'}</p>
          </div>
          {formData.studentCode && (
            <span className="ml-auto flex-shrink-0 text-xs font-mono bg-slate-100 text-[#004B87] px-2 py-0.5 rounded-md font-semibold">
              {formData.studentCode}
            </span>
          )}
        </div>

        {/* Linha 2: Curso + Período em 2 colunas */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
            <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">Curso</p>
              <p className="font-bold text-slate-800 text-sm truncate">{selectedCourse?.nome || formData.courseName || '-'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
            <div className="h-8 w-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">Período</p>
              <p className="font-bold text-slate-800 text-sm truncate">{formData.period || '-'}</p>
            </div>
          </div>
        </div>

        {/* Linha 3: Turma + Tipo de Inscrição em 2 colunas */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
            <div className="h-8 w-8 bg-sky-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">Turma</p>
              <p className="font-bold text-slate-800 text-sm truncate">
                {formData.className || <span className="text-slate-400 font-normal italic text-xs">Não atribuída</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2.5 bg-white rounded-xl border border-slate-100">
            <div className="h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide leading-none mb-0.5">Tipo</p>
              <p className="font-bold text-slate-800 text-sm truncate">{getRegistrationTypeLabel()}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ITENS DE PAGAMENTO ===== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[#F5821F]" />
          Itens de Pagamento
        </h3>

        <div className="space-y-3">
          {/* Taxa de Matrícula (obrigatória) */}
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-green-400 bg-green-50">
            <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">Taxa de Matrícula</span>
                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">
                  OBRIGATÓRIO
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Obrigatória para activar a matrícula</p>
            </div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(enrollmentFee)}
            </div>
          </div>

          {/* 1ª Mensalidade — oculto para bolsistas */}
          {isBolsista ? (
            <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-purple-200 bg-purple-50">
              <div className="h-6 w-6 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1">
                <span className="font-bold text-purple-800">Mensalidade</span>
                <p className="text-xs text-purple-600 mt-0.5">Isento — Estudante Bolsista</p>
              </div>
              <div className="text-sm font-bold text-purple-400 line-through">
                {formatCurrency(monthlyFee)}
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIncludeFirstMonth(!includeFirstMonth)}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                includeFirstMonth
                  ? "border-green-400 bg-green-50"
                  : "border-slate-200 bg-slate-50 hover:border-slate-300"
              )}
            >
              <div className={cn(
                "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                includeFirstMonth
                  ? "bg-green-500 border-green-500"
                  : "bg-white border-slate-300"
              )}>
                {includeFirstMonth && <CheckCircle2 className="h-4 w-4 text-white" />}
              </div>
              <div className="flex-1">
                <span className="font-bold text-slate-800">1ª Mensalidade</span>
                <p className="text-xs text-slate-500 mt-0.5">Opcional - pode pagar depois</p>
              </div>
              <div className={cn(
                "text-lg font-bold",
                includeFirstMonth ? "text-green-600" : "text-slate-400"
              )}>
                {formatCurrency(monthlyFee)}
              </div>
            </button>
          )}
        </div>

        {/* Total */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-600">Total a Pagar:</span>
            <span className="text-2xl font-black text-[#004B87]">{formatCurrency(totalToPay)}</span>
          </div>
        </div>
      </section>

      {/* ===== MÉTODO DE PAGAMENTO ===== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[#F5821F]" />
          Método de Pagamento
        </h3>

        <div className="grid grid-cols-4 gap-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={cn(
                  "p-4 rounded-xl border-2 transition-all text-center",
                  isSelected
                    ? "border-[#F5821F] bg-orange-50 shadow-md"
                    : "border-slate-200 bg-white hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-full mx-auto mb-2 flex items-center justify-center",
                  isSelected ? "bg-[#F5821F]" : "bg-slate-100"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    isSelected ? "text-white" : "text-slate-500"
                  )} />
                </div>
                <span className={cn(
                  "text-xs font-semibold",
                  isSelected ? "text-[#F5821F]" : "text-slate-600"
                )}>
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Referência/Comprovativo */}
        {(paymentMethod === 'transfer' || paymentMethod === 'mobile' || paymentMethod === 'check') && (
          <div className="mt-4">
            <Label className="text-xs font-bold text-slate-600 mb-2 block">
              {paymentMethod === 'check' ? 'Número do Cheque' : 'Referência/Comprovativo'}
            </Label>
            <Input
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder={paymentMethod === 'check' ? 'Ex: 123456' : 'Ex: MP-2026-XXXXX'}
              className="h-12 rounded-xl"
            />
          </div>
        )}
      </section>

      {/* ===== VALOR PAGO AGORA ===== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-green-600" />
          Valor Pago Agora
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs font-bold text-slate-600 mb-2 block">Montante a Pagar</Label>
            {/* Total a pagar - Não editável, calculado automaticamente */}
            <div className="h-14 rounded-xl bg-gradient-to-br from-[#004B87]/5 to-[#F5821F]/5 border-2 border-[#004B87]/20 flex items-center justify-center">
              <span className="text-2xl font-black text-[#004B87]">
                {formatCurrency(totalToPay)}
              </span>
            </div>

            {/* Botão Marcar como Pago / Cancelar Pagamento */}
            <div className="mt-3 space-y-1">
              {paidAmount >= totalToPay ? (
                <>
                  <div className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-bold bg-green-100 text-green-700 border-2 border-green-300">
                    <CheckCircle2 className="h-5 w-5" />
                    Pagamento Completo
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openConfirm(
                        {
                          title: "Cancelar Pagamento",
                          message: "Deseja cancelar o registo de pagamento? O valor pago voltará a zero.",
                          confirmLabel: "Cancelar Pagamento",
                          variant: "warning",
                        },
                        async () => setPaidAmount(0)
                      )
                    }
                    className="w-full flex items-center justify-center gap-1.5 h-8 rounded-lg text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Cancelar Pagamento
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openConfirm(
                      {
                        title: "Confirmar Pagamento",
                        message: `Confirma o recebimento de ${formatCurrency(totalToPay)}?`,
                        confirmLabel: "Confirmar Pagamento",
                        variant: "info",
                      },
                      async () => setPaidAmount(totalToPay)
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-bold transition-all bg-[#F5821F] hover:bg-[#E07318] text-white shadow-lg shadow-orange-200"
                >
                  <CheckCircle2 className="h-5 w-5" />
                  Marcar como Pago
                </button>
              )}
            </div>
          </div>

          {/* Resumo do Pagamento */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total Seleccionado:</span>
              <span className="font-bold text-slate-800">{formatCurrency(totalToPay)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Pago Agora:</span>
              <span className="font-bold text-green-600">{formatCurrency(paidAmount)}</span>
            </div>
            <div className="border-t border-slate-200 pt-2">
              <div className="flex justify-between">
                <span className="text-sm font-semibold text-slate-600">Pendente:</span>
                <span className={cn(
                  "text-lg font-black",
                  pendingAmount > 0 ? "text-orange-600" : "text-green-600"
                )}>
                  {formatCurrency(pendingAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATUS FINAL ===== */}
      <section className={cn(
        "rounded-2xl p-6 border-2",
        isEnrollmentPaid
          ? "bg-green-50 border-green-300"
          : "bg-yellow-50 border-yellow-300"
      )}>
        <div className="flex items-center gap-4">
          {isEnrollmentPaid ? (
            <>
              <div className="h-14 w-14 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-green-800 text-lg">Matrícula Activa</h4>
                <p className="text-sm text-green-600">
                  {isFullyPaid
                    ? 'Todos os valores foram pagos. Matrícula completa!'
                    : `Taxa de matrícula paga. Resta ${formatCurrency(pendingAmount)} pendente.`}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="h-14 w-14 bg-yellow-500 rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-yellow-800 text-lg">Matrícula Pendente</h4>
                <p className="text-sm text-yellow-600">
                  Aguarda pagamento da taxa de matrícula ({formatCurrency(enrollmentFee)}) para activar.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ===== OBSERVAÇÕES ===== */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6">
        <Label className="text-xs font-bold text-slate-600 mb-2 block flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#F5821F]" />
          Observações
        </Label>
        <Textarea
          placeholder="Informações adicionais sobre a matrícula ou pagamento..."
          value={formData.observations ?? ''}
          onChange={(e) => onChangeField('observations', e.target.value)}
          rows={3}
          className="rounded-xl resize-none"
        />
      </section>
    </div>
    </>
  );
}
