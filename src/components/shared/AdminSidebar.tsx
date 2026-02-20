import { useState, useRef, useEffect } from "react";
import {
  Users, BookOpen, DollarSign, Settings, GraduationCap, Shield,
  BarChart3, ChevronLeft, ChevronRight, Home, FileText,
  LucideIcon, ClipboardList, ChevronDown, PenLine, UserCircle2,
  ArrowRightCircle
} from "lucide-react";
// --- Tipagens ---
export type AdminView = "dashboard" | "students" | "teachers" | "classes" | "courses" | "payments" | "registrations" | "inscriptions" | "users" | "grades" | "transitions";
export interface MenuItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
  badge?: number;
  hasDropdown?: boolean;
  dropdownItems?: { id: AdminView; label: string; icon: LucideIcon; }[];}
interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  onOpenSettings: () => void;
  userName?: string;
  userEmail?: string;
}

// --- Dados do Menu (Todos os itens originais) ---
export const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "students", label: "Estudantes", icon: GraduationCap },
  {
    id: "registrations", label: "Matrículas", icon: ClipboardList, badge: 5, hasDropdown: true,
    dropdownItems: [
      { id: "inscriptions", label: "Inscrição", icon: PenLine },
      { id: "registrations", label: "Matrícula", icon: FileText },
    ],
  },{ id: "teachers", label: "Docentes", icon: Users },
  { id: "classes", label: "Turmas", icon: BookOpen },
  { id: "courses", label: "Cursos", icon: BookOpen },
  { id: "payments", label: "Pagamentos", icon: DollarSign, badge: 12 },
  { id: "users", label: "Usuários", icon: Shield },
  { id: "grades",       label: "Notas",       icon: BarChart3        },
  { id: "transitions",  label: "Transitions", icon: ArrowRightCircle },
];

export function AdminSidebar({ activeView, setActiveView, isSidebarOpen, setIsSidebarOpen, onOpenSettings, userName, userEmail }: AdminSidebarProps) {
  const [openDropdown, setOpenDropdown] = useState<AdminView | null>(null);

  const isDropdownActive = (item: MenuItem) => item.dropdownItems?.some((sub) => sub.id === activeView);

  return (
    <>
      <style>{`
        .sidebar-bg { 
          background-color: #002648; 
          background-image: linear-gradient(180deg, #004B87 0%, #002648 100%); 
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .menu-item { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); color: rgba(255, 255, 255, 0.75); }
        .menu-item:hover { background: rgba(255, 255, 255, 0.1); color: #fff; }
        .menu-item.active { background: #F5821F; color: white; font-weight: 700; }
        .sub-item { transition: all 0.2s ease; color: rgba(255, 255, 255, 0.5); }
        .sub-item:hover { color: #F5821F; background: rgba(245, 130, 31, 0.05); }
        .sub-item.active { color: #F5821F; font-weight: 700; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>

      <aside className={`${isSidebarOpen ? "w-64" : "w-20"} sidebar-bg h-screen transition-all duration-300 flex flex-col relative shadow-2xl overflow-hidden`}>
        
        {/* HEADER (Logo e Título Estilizado) */}
        <div className="p-6">
          <div className={`flex items-center ${!isSidebarOpen ? "justify-center" : "gap-4"}`}>
            <div className={`h-12 w-12 bg-white rounded-xl flex items-center justify-center p-1.5 shadow-inner shrink-0 transition-transform duration-300 ${!isSidebarOpen ? 'scale-90' : ''}`}>
              <img src="/image.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            {/* TÍTULO E SUBTÍTULO AGORA SEPARADOS */}
            {isSidebarOpen && (
              <div className="flex flex-col">
                <h1 className="text-lg font-extrabold text-white tracking-widest uppercase">ISAC ADMIN</h1>
                <p className="text-xs text-[#F5821F] mt-0.5 font-light italic">Sistema de Gestão Escolar</p>
              </div>
            )}
          </div>
        </div>   
        {/* SECÇÃO DE PERFIL DO UTILIZADOR */}
        {isSidebarOpen && (
          <div className="p-4 mx-4 mb-4 bg-[#003d72] rounded-xl">
            <p className="text-sm font-bold text-white tracking-wide">Olá, {userName || 'Admin'}!</p>
            <p className="text-xs text-blue-200/70 font-light">{userEmail || ''}</p>
          </div>
        )}
        {!isSidebarOpen && (
             <div className="flex justify-center p-4 mb-4">
                <UserCircle2 size={36} className="text-[#F5821F]" /> 
             </div>
        )}

        {/* NAVEGACAO */}
        <nav className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id || isDropdownActive(item);
            const isThisOpen = openDropdown === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.hasDropdown) { setOpenDropdown(isThisOpen ? null : item.id); } else { setActiveView(item.id); }
                  }}
                  className={`menu-item w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? "active" : ""} ${!isSidebarOpen && "justify-center"}`}
                >
                  <Icon size={20} />
                  {isSidebarOpen && (
                    <>
                      <span className="flex-1 text-left tracking-wide">{item.label}</span>
                      {item.badge && <span className="bg-red-500/20 text-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold">{item.badge}</span>}
                      {item.hasDropdown && <ChevronDown size={14} className={`transition-transform duration-300 ${isThisOpen ? "rotate-180" : ""}`} />}
                    </>
                  )}
                  {!isSidebarOpen && <span className="absolute left-full ml-4 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{item.label}</span>}
                </button>

                {isSidebarOpen && item.hasDropdown && isThisOpen && (
                  <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-0.5">
                    {item.dropdownItems!.map((sub) => (
                      <button key={sub.id} onClick={() => setActiveView(sub.id)} className={`sub-item w-full flex items-center gap-3 px-3 py-2 text-xs rounded ${activeView === sub.id ? "active" : ""}`}>
                        <sub.icon size={14} />
                        <span className="tracking-wide">{sub.label}</span>
                      </button>
                    ))}
                  </div>
                )}
                {index < menuItems.length - 1 && <hr className="border-white/10 my-2 mx-2" />}
              </div>
            );
          })}
        </nav>

        {/* FOOTER - Botões independentes */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            {/* Botão de Configurações (Apenas ícone) */}
            <button
              onClick={onOpenSettings}
              className="p-3 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all"
              title="Configurações"
            >
              <Settings size={20} />
            </button>

            {/* Botão Recolher/Expandir com cor carregada */}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[#F5821F] text-white hover:bg-[#FF9933] transition-all text-sm shadow-md"
              title={isSidebarOpen ? "Recolher Sidebar" : "Expandir Sidebar"}
            >
              {isSidebarOpen ? (
                <>
                  <span className="font-semibold tracking-wide">Recolher</span>
                  <ChevronLeft size={16} />
                </>
              ) : (
                <ChevronRight size={16} />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default AdminSidebar;
