// src/components/shared/AdminSidebar.tsx
import { Button } from "@/components/ui/button";
import {
  Users, BookOpen, DollarSign, Settings, GraduationCap,
  Shield, BarChart3, ChevronLeft, ChevronRight, Home, FileText, LucideIcon
} from "lucide-react";

// Type for available views
export type AdminView = 'dashboard' | 'students' | 'teachers' | 'classes' | 'courses' | 'payments' | 'registrations' | 'users' | 'grades';

export interface MenuItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
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
  { id: 'registrations', label: 'Matrículas', icon: FileText },
  { id: 'teachers', label: 'Docentes', icon: Users },
  { id: 'classes', label: 'Turmas', icon: BookOpen },
  { id: 'courses', label: 'Cursos', icon: BookOpen },
  { id: 'payments', label: 'Pagamentos', icon: DollarSign },
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
      } bg-gradient-to-b from-[#004B87] via-[#003868] to-[#002850] text-white transition-all duration-300 ease-in-out flex flex-col shadow-2xl relative z-50`}
    >
      {/* Logo e Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-3 ${!isSidebarOpen && 'justify-center'}`}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#F5821F] to-[#FF9933] rounded-xl blur-md opacity-75"></div>
              <div className="relative h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-lg p-1">
                <img src="/image.png" alt="ISAC" className="h-full w-full object-contain" />
              </div>
            </div>
            {isSidebarOpen && (
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#F5821F] to-[#FF9933] bg-clip-text text-transparent">
                  ISAC
                </h1>
                <p className="text-xs text-slate-300">Portal Admin</p>
              </div>
            )}
          </div>
        </div>
      </div>

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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white shadow-lg'
                    : 'text-slate-200 hover:bg-white/10'
                } ${!isSidebarOpen && 'justify-center'}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Info */}
      <div className="p-3 border-t border-white/10">
        {isSidebarOpen ? (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSettings}
              className="h-10 w-10 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg flex-shrink-0"
              title="Configurações"
            >
              <Settings className="h-5 w-5" />
            </Button>
            <div className="flex-1 px-2 py-3 bg-white/5 rounded-lg">
              <p className="text-xs text-slate-400">Sistema Acadêmico ISAC</p>
              <p className="text-xs text-slate-500 mt-1">Versão 1.0.0</p>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            className="w-full h-12 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute -right-3 top-24 bg-gradient-to-r from-[#F5821F] to-[#FF9933] text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-200"
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
