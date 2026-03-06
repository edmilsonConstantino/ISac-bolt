// src/components/shared/ProfileModalBase.tsx - COMPONENTE BASE REUTILIZÁVEL
// Usado por todos os modais de perfil: Teacher, Student, Course, etc.

import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Edit, Save, X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================
// TIPOS
// ============================================================

export interface ProfileTab {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  content: ReactNode;
}

export interface ProfileModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  headerIcon: LucideIcon;
  status?: 'active' | 'inactive' | 'suspended';
  customBadge?: ReactNode;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  tabs: ProfileTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  showEditButton?: boolean;
  headerSubtitle?: string;
  maxWidth?: string;
}

// ============================================================
// HELPERS
// ============================================================

const STATUS_CONFIG = {
  active:    { dot: 'bg-emerald-400', badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30', label: 'Activo' },
  inactive:  { dot: 'bg-slate-400',   badge: 'bg-slate-500/20 text-slate-300 border border-slate-400/30',       label: 'Inactivo' },
  suspended: { dot: 'bg-amber-400',   badge: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',       label: 'Suspenso' },
};

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
  maxWidth = "3xl",
}: ProfileModalBaseProps) {

  const statusCfg = status ? STATUS_CONFIG[status] : null;
  const initials = title?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "p-0 flex flex-col overflow-hidden border-0 shadow-2xl rounded-2xl",
        maxWidth === "3xl" ? "sm:max-w-4xl max-h-[90vh]" : `sm:max-w-${maxWidth} max-h-[90vh]`
      )}>
        <DialogTitle className="sr-only">{title}</DialogTitle>

        {/* ── HEADER ─────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#003A6B] via-[#004B87] to-[#0066B3] flex-shrink-0 overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
          <div className="absolute top-2 right-24 h-10 w-10 rounded-full bg-[#F5821F]/15" />

          <div className="relative px-6 pt-5 pb-4 flex items-center gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#F5821F] to-[#FF9933] flex items-center justify-center shadow-lg shadow-orange-500/30 font-black text-2xl text-white select-none">
                {initials || <HeaderIcon className="h-7 w-7" />}
              </div>
              {statusCfg && (
                <div className={cn(
                  "absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-[#004B87]",
                  statusCfg.dot
                )} />
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-white leading-tight truncate">{title}</h2>
              {headerSubtitle && (
                <p className="text-sm text-white/70 mt-0.5 truncate">{headerSubtitle}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {statusCfg && !customBadge && (
                  <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold", statusCfg.badge)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                    {statusCfg.label}
                  </span>
                )}
                {customBadge}
                {isEditing && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F5821F]/20 text-orange-200 border border-orange-400/30">
                    <Edit className="h-3 w-3" /> A editar
                  </span>
                )}
              </div>
            </div>

            {/* Close */}
            <button
              onClick={onClose}
              className="flex-shrink-0 h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── TAB BAR ────────────────────────────────────── */}
          <div className="px-6 flex gap-1">
            {tabs.map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all",
                    isActive
                      ? "bg-white text-[#004B87] shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  )}
                >
                  <TabIcon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-5">
            {tabs.map(tab => (
              <div key={tab.id} className={activeTab === tab.id ? undefined : 'hidden'}>
                {tab.content}
              </div>
            ))}
          </div>
        </div>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <div className="flex-shrink-0 bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isEditing ? 'Edite os campos acima e clique em Guardar' : 'Visualização do perfil'}
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={onCancel}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={onSave}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white text-sm font-bold hover:from-[#E07318] hover:to-[#F58820] transition-colors shadow-sm"
                >
                  <Save className="h-3.5 w-3.5" /> Guardar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Fechar
                </button>
                {showEditButton && (
                  <button
                    onClick={onEdit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#004B87] to-[#0066B3] text-white text-sm font-bold hover:from-[#003868] hover:to-[#004B87] transition-colors shadow-sm"
                  >
                    <Edit className="h-3.5 w-3.5" /> Editar
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// ESTILOS COMPARTILHADOS
// ============================================================

export const PROFILE_MODAL_STYLES = {
  tabs: {
    blue: '#004B87',
    orange: '#F5821F',
    purple: 'purple-500',
    green: 'green-500',
    red: 'red-500',
  },
  card: {
    blue:    'border border-slate-200 bg-white rounded-xl shadow-sm',
    orange:  'border border-slate-200 bg-white rounded-xl shadow-sm',
    purple:  'border border-slate-200 bg-white rounded-xl shadow-sm',
    green:   'border border-slate-200 bg-white rounded-xl shadow-sm',
    red:     'border border-slate-200 bg-white rounded-xl shadow-sm',
    neutral: 'border border-slate-200 bg-white rounded-xl shadow-sm',
  },
  cardTitle: {
    blue:   'text-[#004B87] text-sm font-semibold',
    orange: 'text-[#F5821F] text-sm font-semibold',
    purple: 'text-purple-600 text-sm font-semibold',
    green:  'text-green-600 text-sm font-semibold',
    red:    'text-red-600 text-sm font-semibold',
  },
  input: {
    blue:   'border-[#004B87]/40 focus:border-[#004B87] focus:ring-2 focus:ring-[#004B87]/15',
    orange: 'border-[#F5821F]/40 focus:border-[#F5821F] focus:ring-2 focus:ring-[#F5821F]/15',
  },
};

// Helper: campo em modo de visualização
export function InfoDisplay({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
      <div className="px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 min-h-[36px] flex items-center">
        <span className="text-sm text-slate-800 font-medium">{value || <span className="text-slate-400 font-normal">—</span>}</span>
      </div>
    </div>
  );
}
