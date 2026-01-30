// src/components/shared/AdminSidebar.tsx
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, DollarSign, Settings, GraduationCap,
  Shield, BarChart3, ChevronLeft, ChevronRight, Home, FileText, LucideIcon,
  LogOut, Bell, User
} from "lucide-react";

// Type for available views
export type AdminView = 'dashboard' | 'students' | 'teachers' | 'classes' | 'courses' | 'payments' | 'registrations' | 'users' | 'grades';

export interface MenuItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onOpenSettings: () => void;
}

// Menu items configuration
export const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'students', label: 'Estudantes', icon: GraduationCap },
  { id: 'registrations', label: 'Matrículas', icon: FileText, badge: 5 },
  { id: 'teachers', label: 'Docentes', icon: Users },
  { id: 'classes', label: 'Turmas', icon: BookOpen },
  { id: 'courses', label: 'Cursos', icon: BookOpen },
  { id: 'payments', label: 'Pagamentos', icon: DollarSign, badge: 12 },
  { id: 'users', label: 'Usuários', icon: Shield },
  { id: 'grades', label: 'Notas', icon: BarChart3 },
];

export function AdminSidebar({
  activeView,
  setActiveView,
  isSidebarOpen,
  setIsSidebarOpen,
  onOpenSettings
}: AdminSidebarProps) {
  return (
    <aside
      className={`${
        isSidebarOpen ? 'w-72' : 'w-20'
      } bg-gradient-to-b from-[#004B87] via-[#003868] to-[#002850] transition-all duration-300 ease-in-out flex flex-col relative z-50 shadow-2xl`}
    >
      {/* Header com Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center w-full'}`}>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-xl blur-md opacity-75"></div>
              <div className="relative h-11 w-11 bg-white rounded-xl flex items-center justify-center shadow-lg border-2 border-white/20 p-1">
                <img src="/image.png" alt="ISAC" className="h-full w-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-[#002850]"></div>
            </div>
            {isSidebarOpen && (
              <div className="flex-1">
                <h1 className="text-lg font-bold text-white">
                  ISAC Admin
                </h1>
                <p className="text-xs text-slate-300 font-medium">Sistema de Gestão</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Info - quando expandido */}
      {isSidebarOpen && (
        <div className="px-4 py-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-lg flex items-center justify-center text-white font-semibold shadow-md">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Administrador</p>
              <p className="text-xs text-slate-300 truncate">admin@isac.ac.mz</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Menu Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-200 hover:bg-white/10'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                )}
                
                <div className="relative">
                  <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${
                    isActive ? '' : 'group-hover:scale-110'
                  }`} />
                  {item.badge && !isSidebarOpen && (
                    <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center border border-[#002850]">
                      <span className="text-[9px] font-bold text-white">{item.badge > 9 ? '9+' : item.badge}</span>
                    </div>
                  )}
                </div>
                
                {isSidebarOpen && (
                  <div className="flex items-center justify-between flex-1">
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge && (
                      <div className="px-2 py-0.5 bg-red-500 rounded-full shadow-sm">
                        <span className="text-[10px] font-bold text-white">{item.badge}</span>
                      </div>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-white/10"></div>

        {/* Secondary Actions */}
        <div className="space-y-1">
          <button
            onClick={onOpenSettings}
            className={`group w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-slate-200 hover:bg-white/10 ${
              !isSidebarOpen && 'justify-center'
            }`}
          >
            <Settings className="h-5 w-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" />
            {isSidebarOpen && (
              <span className="font-medium text-sm">Configurações</span>
            )}
          </button>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-white/10 bg-white/5">
        {isSidebarOpen ? (
          <div className="space-y-3">
            {/* System Info */}
            <div className="px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-white">Sistema ISAC</p>
                <span className="px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold rounded-full">
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-slate-300">Versão 1.0.0 • 2025</p>
            </div>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-slate-200 hover:text-red-400 hover:bg-red-500/10 hover:border-red-400/50 transition-colors border-white/20 bg-white/5"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm font-medium">Sair do Sistema</span>
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="icon"
            className="w-full h-11 text-slate-200 hover:text-red-400 hover:bg-red-500/10 hover:border-red-400/50 rounded-xl border-white/20 bg-white/5"
            title="Sair do Sistema"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute -right-3 top-28 bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white rounded-full p-1.5 shadow-lg hover:shadow-xl hover:shadow-orange-500/50 transition-all duration-200 z-10 border-2 border-[#002850]"
        title={isSidebarOpen ? 'Recolher menu' : 'Expandir menu'}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
}

export default AdminSidebar;