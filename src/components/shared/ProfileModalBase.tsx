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
      <DialogContent className="max-w-[900px] p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl max-h-[90vh]">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="flex h-[80vh]">

          {/* ====== SIDEBAR ====== */}
          <div className="w-[240px] bg-gradient-to-b from-[#004B87] to-[#003366] flex flex-col flex-shrink-0">

            {/* Header */}
            <div className="px-6 pt-6 pb-5 border-b border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <HeaderIcon className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-sm leading-tight truncate">{title}</h3>
                  {headerSubtitle && (
                    <p className="text-blue-200 text-[10px] truncate">{headerSubtitle}</p>
                  )}
                </div>
              </div>

              {/* Status badge */}
              {statusCfg && !customBadge && (
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold w-full justify-center",
                  statusCfg.badge
                )}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", statusCfg.dot)} />
                  {statusCfg.label}
                </div>
              )}
              {customBadge && <div className="mt-1">{customBadge}</div>}
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-1.5">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left",
                      isActive
                        ? "bg-[#F5821F] text-white shadow-lg shadow-orange-900/30"
                        : "text-blue-100 hover:bg-white/10"
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm font-bold truncate">{tab.label}</p>
                  </button>
                );
              })}
            </nav>

            {/* Avatar + name at bottom */}
            <div className="px-4 pb-4">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#F5821F] to-[#FF9933] flex items-center justify-center font-black text-sm text-white flex-shrink-0 select-none">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{title}</p>
                  {isEditing && (
                    <p className="text-orange-200 text-[10px]">A editar...</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ====== CONTENT ====== */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Top bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white">
              <div>
                <h2 className="text-xl font-bold text-[#004B87]">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {tabs.map(tab => (
                <div key={tab.id} className={activeTab === tab.id ? undefined : 'hidden'}>
                  {tab.content}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 bg-white border-t border-slate-100 px-5 py-3 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                {isEditing ? 'Edite os campos e clique em Guardar' : 'Visualização do perfil'}
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
