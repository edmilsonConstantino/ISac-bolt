// src/components/shared/registration-student-modal/components/RegistrationSidebar.tsx

import { cn } from "@/lib/utils";
import { Sparkles, FileText, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { RegistrationTabKey, SidebarTabItem } from "../types/registrationModal.types";

interface RegistrationSidebarProps {
  activeTab: RegistrationTabKey;
  onChangeTab: (tab: RegistrationTabKey) => void;
  isEditing: boolean;
  tabs: SidebarTabItem[];
}

export function RegistrationSidebar({
  activeTab,
  onChangeTab,
  isEditing,
  tabs,
}: RegistrationSidebarProps) {
  return (
    <div className="w-72 bg-[#004B87] p-8 flex flex-col text-white">
      <div className="flex items-center gap-3 mb-12">
        <div className="h-10 w-10 bg-[#F5821F] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <FileText className="text-white h-6 w-6" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-none">Matrícula</h2>
          <span className="text-[10px] text-blue-200 uppercase tracking-widest">
            {isEditing ? "Editar Matrícula" : "Nova Matrícula"}
          </span>
        </div>
      </div>

      <nav className="space-y-4 flex-1">
        {tabs.map((tab) => (
          <SidebarButton
            key={tab.id}
            tab={tab}
            active={activeTab === tab.id}
            onClick={() => onChangeTab(tab.id)}
          />
        ))}
      </nav>

      <div className="mt-auto p-4 bg-[#F5821F]/10 border border-[#F5821F]/20 rounded-2xl">
        <div className="flex items-center gap-2 mb-2 text-[#F5821F]">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-bold uppercase">Importante</span>
        </div>
        <p className="text-[11px] text-blue-100 leading-relaxed">
          O estudante deve estar previamente cadastrado no sistema.
        </p>
      </div>
    </div>
  );
}

function SidebarButton({
  tab,
  active,
  onClick,
}: {
  tab: SidebarTabItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon as LucideIcon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 text-left group",
        active
          ? "bg-white/10 text-white ring-1 ring-[#F5821F]/30 shadow-xl"
          : "text-blue-200/60 hover:text-white hover:bg-white/5"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg transition-colors",
          active
            ? "bg-[#F5821F] text-white"
            : "bg-[#003A6B] text-blue-300 group-hover:bg-[#003A6B]/80"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-bold">{tab.label}</p>
        <p className="text-[11px] opacity-60">{tab.desc}</p>
      </div>
    </button>
  );
}
