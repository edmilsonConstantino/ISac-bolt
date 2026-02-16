// src/components/shared/InscriptionSettingsModal.tsx
// VERSÃO SIMPLIFICADA - Lógica mais direta

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  DollarSign,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useSettingsData } from "@/hooks/useSettingsData";

interface InscriptionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InscriptionSettingsModal({
  isOpen,
  onClose,
}: InscriptionSettingsModalProps) {
  const { settings, updateSetting, saveSettings } = useSettingsData();

  // ============================================================================
  // ESTADO LOCAL
  // ============================================================================
  // LÓGICA CORRETA FINAL:
  // - Switch ON (checked=true) = PAGA (isPaid = true)
  // - Switch OFF (checked=false) = GRATUITA (isPaid = false)
  // Por padrão, a inscrição começa como GRATUITA (isPaid = false, switch OFF)
  const [isPaid, setIsPaid] = useState(false);
  const [fee, setFee] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // ============================================================================
  // CARREGAR CONFIGURAÇÕES AO ABRIR O MODAL
  // ============================================================================
  useEffect(() => {
    if (isOpen) {
      // Carrega diretamente do backend (sem inversão)
      setIsPaid(settings.inscriptionIsPaid ?? false);
      setFee(settings.inscriptionFee ?? 0);
      setHasChanges(false);
    }
  }, [isOpen, settings.inscriptionIsPaid, settings.inscriptionFee]);

  // ============================================================================
  // DETECTAR MUDANÇAS NOS CAMPOS
  // ============================================================================
  useEffect(() => {
    const changed =
      isPaid !== settings.inscriptionIsPaid || fee !== settings.inscriptionFee;
    setHasChanges(changed);
  }, [isPaid, fee, settings.inscriptionIsPaid, settings.inscriptionFee]);

  // ============================================================================
  // SALVAR CONFIGURAÇÕES
  // ============================================================================
  const handleSave = async () => {
    // Validação: se for paga, precisa ter valor
    if (isPaid && fee <= 0) {
      toast.error("Taxa de inscrição deve ser maior que zero");
      return;
    }

    setIsSaving(true);
    try {
      const newSettings = {
        ...settings,
        inscriptionIsPaid: isPaid,
        inscriptionFee: isPaid ? fee : 0, // Zera se gratuita
      };

      const success = await saveSettings(newSettings);

      if (success) {
        toast.success("Configurações de inscrição salvas com sucesso!");
        onClose();
      } else {
        toast.error("Erro ao salvar configurações");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  // ============================================================================
  // FORMATAÇÃO DE MOEDA
  // ============================================================================
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-MZ", {
      style: "currency",
      currency: "MZN",
    }).format(value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {/* ====================================================================== */}
        {/* HEADER DO MODAL */}
        {/* ====================================================================== */}
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-[#004B87] rounded-xl flex items-center justify-center">
              <Settings className="text-white h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#004B87]">
                Configurações de Inscrição
              </DialogTitle>
              <p className="text-sm text-slate-500">
                Defina se a inscrição é gratuita ou paga
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ================================================================== */}
          {/* TOGGLE GRATUITA / PAGA */}
          {/* LÓGICA FINAL CORRETA: */}
          {/* - Switch ON = PAGA (laranja) */}
          {/* - Switch OFF = GRATUITA (verde) */}
          {/* ================================================================== */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border">
            <div className="flex items-center gap-3">
              {/* Ícone muda conforme o estado */}
              <div
                className={`p-2 rounded-lg transition-all ${
                  isPaid 
                    ? "bg-[#F5821F] text-white"
                    : "bg-green-100 text-green-600" 
                }`}
              >
                {isPaid ? (
                  <DollarSign className="h-5 w-5" />
                ) : (
                  <Sparkles className="h-5 w-5" />
                )}
              </div>
              <div>
                <Label className="font-bold text-slate-700">
                  {isPaid ? "Inscrição Paga" : "Inscrição Gratuita"}
                </Label>
                <p className="text-xs text-slate-500">
                  {isPaid
                    ? "Estudantes devem pagar para se inscrever"
                    : "Estudantes podem se inscrever gratuitamente"}
                </p>
              </div>
            </div>
            {/* 
              Switch DIRETO:
              - checked={isPaid}: ON quando PAGA (laranja)
              - onCheckedChange={setIsPaid}: atualiza diretamente
              - Cor laranja quando ON
            */}
            <Switch
              checked={isPaid}
              onCheckedChange={setIsPaid}
              className="data-[state=checked]:bg-[#F5821F]"
            />
          </div>

          {/* ================================================================== */}
          {/* CAMPO DE TAXA (só aparece quando É PAGA) */}
          {/* ================================================================== */}
          {isPaid && (
            <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-xl animate-in slide-in-from-top-2">
              {/* Label do campo */}
              <Label className="font-bold text-slate-700 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#F5821F]" />
                Taxa de Inscrição
              </Label>

              {/* Input de valor */}
              <div className="relative">
                <Input
                  type="text"
                  inputMode="numeric"
                  value={fee > 0 ? fee.toString() : ""}
                  onChange={(e) => {
                    // Permite apenas números (remove qualquer outro caractere)
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFee(value ? parseInt(value, 10) : 0);
                  }}
                  placeholder="0"
                  className={`text-lg font-bold pl-16 pr-4 h-14 border-2 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
                    fee > 0
                      ? "border-[#F5821F] bg-white"
                      : "border-orange-200 focus:border-[#F5821F]"
                  }`}
                />
                {/* Prefixo "MZN" fixo à esquerda */}
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F5821F] font-bold text-base">
                  MZN
                </span>
                {/* Ícone de check quando valor é válido */}
                {fee > 0 && (
                  <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-600" />
                )}
              </div>

              {/* ============================================================== */}
              {/* FEEDBACK VISUAL DO VALOR */}
              {/* ============================================================== */}
              {fee > 0 ? (
                // Card VERDE - Valor configurado
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-green-800">
                      {formatCurrency(fee)}
                    </p>
                    <p className="text-xs text-green-600">
                      Valor configurado com sucesso
                    </p>
                  </div>
                </div>
              ) : (
                // Card ÂMBAR - Campo vazio (alerta)
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
                    Digite um valor para a taxa de inscrição
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ================================================================== */}
          {/* INFO BOX - Explica o comportamento do sistema */}
          {/* ================================================================== */}
          <div
            className={`p-4 rounded-xl border ${
              isPaid
                ? "bg-amber-50 border-amber-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {isPaid ? (
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              )}
              <div>
                <p
                  className={`text-sm font-medium ${
                    isPaid ? "text-amber-800" : "text-green-800"
                  }`}
                >
                  {isPaid
                    ? "Pagamento obrigatório"
                    : "Sem pagamento necessário"}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isPaid ? "text-amber-600" : "text-green-600"
                  }`}
                >
                  {isPaid
                    ? "O modal de inscrição vai incluir uma etapa de pagamento antes de gerar as credenciais."
                    : "O modal de inscrição vai direto para a geração de credenciais sem solicitar pagamento."}
                </p>
              </div>
            </div>
          </div>

          {/* ================================================================== */}
          {/* INDICADOR DE MUDANÇAS NÃO SALVAS */}
          {/* ================================================================== */}
          {hasChanges && (
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>Existem alterações não salvas</span>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* FOOTER - BOTÕES DE AÇÃO */}
        {/* ==================================================================== */}
        <DialogFooter className="gap-2">
          {/* Botão Cancelar */}
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          
          {/* Botão Salvar */}
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-[#004B87] hover:bg-[#003A6B] text-white"
          >
            {isSaving ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Salvando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}