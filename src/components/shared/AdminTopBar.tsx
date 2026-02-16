// src/components/shared/AdminTopBar.tsx
// VERSÃO PROFISSIONAL - Cores ISAC

import { Button } from "@/components/ui/button";
import { LogOut, Bell } from "lucide-react";
import { AdminView, menuItems } from "./AdminSidebar";

interface AdminTopBarProps {
  activeView: AdminView;
  displayName: string;
  onLogout: () => Promise<void>;
  userRole?: string;
}

const roleLabelMap: Record<string, string> = {
  admin: 'Super Admin',
  academic_admin: 'Academic Admin',
  docente: 'Docente',
  aluno: 'Aluno',
};

export function AdminTopBar({
  activeView,
  displayName,
  onLogout,
  userRole
}: AdminTopBarProps) {
  const currentMenuItem = menuItems.find(m => m.id === activeView);
  const Icon = currentMenuItem?.icon;

  return (
    <header className="bg-white border-b-2 border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-2 flex items-center justify-between">
        {/* ================================================================ */}
        {/* LADO ESQUERDO: Título com Ícone */}
        {/* ================================================================ */}
        <div className="flex items-center gap-4">
          {/* Ícone da Página */}
          {Icon && (
            <div className="h-11 w-11 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-xl flex items-center justify-center shadow-md">
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Título da Página */}
          <div>
            <h2 className="text-lg font-bold text-[#004B87]">
              {currentMenuItem?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-slate-500">
              Gerencie estudantes, docentes, turmas e cursos da instituição
            </p>
          </div>
        </div>

        {/* ================================================================ */}
        {/* LADO DIREITO: Notificações + Status + User */}
        {/* ================================================================ */}
        <div className="flex items-center gap-3">
          
          {/* Notificações */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-[#004B87] transition-all"
            title="Notificações"
          >
            <Bell className="h-4 w-4" />
            {/* Badge de notificações */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </Button>

          {/* Divisor */}
          <div className="h-6 w-px bg-slate-200"></div>

          {/* Status Online */}
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200">
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-700 font-semibold">Online</span>
          </div>

          {/* User Card com cores ISAC */}
          <div className="flex items-center gap-3 px-3 py-1.5 bg-gradient-to-r from-[#004B87]/5 to-[#F5821F]/5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
            {/* Avatar com gradiente ISAC */}
            <div className="h-8 w-8 bg-gradient-to-br from-[#004B87] to-[#F5821F] rounded-full flex items-center justify-center font-bold text-white shadow-md flex-shrink-0 ring-2 ring-white text-sm">
              {displayName.charAt(0).toUpperCase()}
            </div>
            
            {/* Info do usuário */}
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#004B87] leading-tight">{displayName}</span>
              <span className="text-xs text-slate-500 font-medium leading-tight">{roleLabelMap[userRole || 'admin'] || 'Admin'}</span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-red-500 rounded-lg transition-all ml-1"
              title="Sair do Sistema"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}