// src/components/shared/AdminTopBar.tsx
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { AdminView, menuItems } from "./AdminSidebar";

interface AdminTopBarProps {
  activeView: AdminView;
  displayName: string;
  onLogout: () => Promise<void>;
}

export function AdminTopBar({
  activeView,
  displayName,
  onLogout
}: AdminTopBarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-8 py-4 flex items-center justify-between">
        {/* Alinhamento à Esquerda: Título e Subtítulo */}
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gradient-to-br from-[#004B87] to-[#003366] rounded-lg shadow-md flex items-center justify-center">
            <span className="text-xl font-bold text-white">iS</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Gerencie estudantes, docentes, turmas e cursos da instituição
            </p>
          </div>
        </div>

        {/* Alinhamento à Direita: User Info/Status/Logout */}
        <div className="flex items-center gap-4">
          
          {/* Status Online */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200 shadow-sm hover:bg-emerald-100 transition-colors cursor-pointer">
            <div className="h-2.5 w-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-emerald-700 font-semibold">Online</span>
          </div>

          {/* User Card */}
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border-2 border-[#004B87]/20 shadow-md">
            <div className="h-9 w-9 bg-gradient-to-br from-[#F5821F] to-[#FF9933] rounded-full flex items-center justify-center font-bold text-white shadow-inner flex-shrink-0 text-lg">
              {displayName.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-800">{displayName}</span>
              <span className="text-xs text-slate-500">Super Admin</span>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors ml-2"
              title="Sair do Sistema"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}