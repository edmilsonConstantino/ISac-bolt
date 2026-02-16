// src/components/shared/ProfileModalBase.tsx - COMPONENTE BASE REUTILIZÁVEL
// Usado por todos os modais de perfil: Teacher, Student, Course, etc.

import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Save, X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/ui/gradient-button";

// ============================================================
// TIPOS
// ============================================================

export interface ProfileTab {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string; // Ex: "#004B87", "#F5821F", "purple-500"
  content: ReactNode;
}

export interface ProfileModalBaseProps {
  // Controle do modal
  isOpen: boolean;
  onClose: () => void;

  // Header
  title: string;
  headerIcon: LucideIcon;
  status?: 'active' | 'inactive' | 'suspended';
  customBadge?: ReactNode; // Badge customizado opcional

  // Edição
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;

  // Tabs
  tabs: ProfileTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;

  // Customização (opcional)
  showEditButton?: boolean; // Default: true
  headerSubtitle?: string;
  maxWidth?: string; // Default: "3xl"
}

// ============================================================
// COMPONENTE BASE
// ============================================================

export function ProfileModalBase({
  isOpen,
  onClose,
  title,
  headerIcon: HeaderIcon,
  status,
  customBadge,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  tabs,
  activeTab,
  onTabChange,
  showEditButton = true,
  headerSubtitle,
  maxWidth = "3xl"
}: ProfileModalBaseProps) {

  // Helper para cor do status
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'inactive': return 'bg-slate-400';
      case 'suspended': return 'bg-amber-500';
      default: return 'bg-slate-400';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return '✓ Activo';
      case 'inactive': return 'Inactivo';
      case 'suspended': return '⚠ Suspenso';
      default: return 'N/A';
    }
  };

  // Helper para cor da tab
  const getTabBorderColor = (color: string) => {
    // Se já é uma classe Tailwind completa (ex: "purple-500")
    if (color.includes('-')) return color;
    // Se é uma cor hex (ex: "#004B87")
    return color;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "max-h-[90vh] p-0 flex flex-col",
        `sm:max-w-${maxWidth}`
      )}>
        {/* ============================================================ */}
        {/* HEADER - CORES ISAC (SÓ AZUL) */}
        {/* ============================================================ */}
        <div className="bg-gradient-to-r from-[#004B87] to-[#0066B3] p-4 rounded-t-lg flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <HeaderIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold block">{title}</span>
                  {headerSubtitle && (
                    <span className="text-xs text-white/80 block mt-0.5">{headerSubtitle}</span>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {/* Badge de status padrão */}
                    {status && !customBadge && (
                      <Badge className={cn(
                        "text-[10px] px-2 py-0.5 border-0",
                        getStatusColor(status)
                      )}>
                        {getStatusText(status)}
                      </Badge>
                    )}

                    {/* Badge customizado */}
                    {customBadge}

                    {/* Badge de edição */}
                    {isEditing && (
                      <Badge className="bg-white/90 text-[#004B87] text-[10px] px-2 py-0.5">
                        <Edit className="h-3 w-3 mr-1" /> Editando
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* ============================================================ */}
        {/* TABS */}
        {/* ============================================================ */}
        <div className="bg-[#F5F5DC] border-b border-slate-200 px-4 py-3 flex-shrink-0">
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
            <TabsList className="w-full h-auto bg-transparent p-0 gap-2 justify-start flex-wrap">
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;

                // Determina a cor da borda baseado na cor fornecida
                let borderColorClass = '';
                let textColorClass = '';

                if (tab.color.startsWith('#')) {
                  // Cor hex - usa as cores ISAC padrão
                  if (tab.color === '#004B87') {
                    borderColorClass = 'data-[state=active]:border-[#004B87] data-[state=active]:text-[#004B87]';
                  } else if (tab.color === '#F5821F') {
                    borderColorClass = 'data-[state=active]:border-[#F5821F] data-[state=active]:text-[#F5821F]';
                  } else {
                    borderColorClass = 'data-[state=active]:border-[#004B87] data-[state=active]:text-[#004B87]';
                  }
                } else {
                  // Classe Tailwind (ex: "purple-500", "green-600")
                  borderColorClass = `data-[state=active]:border-${tab.color} data-[state=active]:text-${tab.color.replace('-', '-')}`;
                }

                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-transparent",
                      "data-[state=active]:bg-white data-[state=active]:shadow",
                      "hover:bg-white/50 transition-all text-slate-600 font-medium",
                      borderColorClass
                    )}
                  >
                    <TabIcon className="h-4 w-4" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* ============================================================ */}
            {/* CONTEÚDO SCROLLABLE */}
            {/* ============================================================ */}
            <div className="mt-4 max-h-[calc(90vh-280px)] overflow-y-auto px-1">
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="mt-0">
                  {tab.content}
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>

        {/* ============================================================ */}
        {/* FOOTER */}
        {/* ============================================================ */}
        <div className="flex justify-end gap-2 p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={onCancel}
                className="h-9 px-4 text-sm border border-slate-300"
              >
                <X className="h-3 w-3 mr-1" /> Cancelar
              </Button>
              <GradientButton onClick={onSave} size="sm">
                <Save className="h-3 w-3 mr-1" /> Guardar
              </GradientButton>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="h-9 px-4 text-sm border border-slate-300"
              >
                Fechar
              </Button>
              {showEditButton && (
                <GradientButton onClick={onEdit} variant="navy" size="sm">
                  <Edit className="h-3 w-3 mr-1" /> Editar
                </GradientButton>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ESTILOS COMPARTILHADOS (constantes para reutilização)
// ============================================================

export const PROFILE_MODAL_STYLES = {
  // Cores das tabs
  tabs: {
    blue: '#004B87',
    orange: '#F5821F',
    purple: 'purple-500',
    green: 'green-500',
    red: 'red-500',
  },

  // Classes de cards
  card: {
    blue: 'border-2 border-[#004B87]/20',
    orange: 'border-2 border-[#F5821F]/20',
    purple: 'border-2 border-purple-500/20',
    green: 'border-2 border-green-200',
    red: 'border-2 border-red-200',
    neutral: 'border-2 border-slate-200',
  },

  // Classes de título de card
  cardTitle: {
    blue: 'text-[#004B87] text-sm',
    orange: 'text-[#F5821F] text-sm',
    purple: 'text-purple-600 text-sm',
    green: 'text-green-600 text-sm',
    red: 'text-red-600 text-sm',
  },

  // Classes de input quando está editando
  input: {
    blue: 'border-[#004B87] focus:border-[#004B87]',
    orange: 'border-[#F5821F] focus:border-[#F5821F]',
  },
};
