// ============================================================
// EXEMPLO DE USO DO ProfileModalBase
// ============================================================
// Este arquivo mostra como usar o componente base para criar
// qualquer modal de perfil (Teacher, Student, Course, etc.)
// ============================================================

import { useState } from "react";
import { ProfileModalBase, ProfileTab, PROFILE_MODAL_STYLES } from "./ProfileModalBase";
import { User, GraduationCap, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ============================================================
// EXEMPLO 1: Modal de Perfil de Professor
// ============================================================

interface Teacher {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
}

export function ExemploTeacherModal({
  isOpen,
  onClose,
  teacher,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSave: (teacher: Teacher) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(teacher || {} as Teacher);
  const [activeTab, setActiveTab] = useState('perfil');

  if (!teacher) return null;

  // ============================================================
  // DEFINIR AS TABS COM SEU CONTEÚDO
  // ============================================================
  const tabs: ProfileTab[] = [
    {
      id: 'perfil',
      label: 'Perfil',
      icon: User,
      color: PROFILE_MODAL_STYLES.tabs.blue, // ou '#004B87'
      content: (
        <div className="space-y-4">
          <Card className={PROFILE_MODAL_STYLES.card.blue}>
            <CardHeader className="pb-3">
              <CardTitle className={PROFILE_MODAL_STYLES.cardTitle.blue}>
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? PROFILE_MODAL_STYLES.input.orange : 'bg-slate-50'}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email</Label>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!isEditing}
                  className={isEditing ? PROFILE_MODAL_STYLES.input.orange : 'bg-slate-50'}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: 'turmas',
      label: 'Turmas',
      icon: GraduationCap,
      color: PROFILE_MODAL_STYLES.tabs.orange, // ou '#F5821F'
      content: (
        <Card className={PROFILE_MODAL_STYLES.card.orange}>
          <CardHeader>
            <CardTitle className={PROFILE_MODAL_STYLES.cardTitle.orange}>
              Turmas Atribuídas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Conteúdo das turmas aqui...</p>
          </CardContent>
        </Card>
      )
    },
    {
      id: 'historico',
      label: 'Histórico',
      icon: Activity,
      color: 'purple-500', // Pode usar classe Tailwind também
      content: (
        <Card className={PROFILE_MODAL_STYLES.card.purple}>
          <CardHeader>
            <CardTitle className={PROFILE_MODAL_STYLES.cardTitle.purple}>
              Histórico de Atividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">Conteúdo do histórico aqui...</p>
          </CardContent>
        </Card>
      )
    }
  ];

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleEdit = () => setIsEditing(true);

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(teacher);
    setIsEditing(false);
  };

  // ============================================================
  // USAR O COMPONENTE BASE
  // ============================================================
  return (
    <ProfileModalBase
      // Controle
      isOpen={isOpen}
      onClose={onClose}

      // Header
      title={formData.name}
      headerIcon={User}
      status={formData.status}
      headerSubtitle="Professor" // opcional

      // Edição
      isEditing={isEditing}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}

      // Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}

      // Customização (opcional)
      showEditButton={true}
      maxWidth="3xl"
    />
  );
}

// ============================================================
// EXEMPLO 2: Modal Simples (sem edição)
// ============================================================

export function ExemploSimpleModal({
  isOpen,
  onClose,
  data
}: {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}) {
  const [activeTab, setActiveTab] = useState('info');

  const tabs: ProfileTab[] = [
    {
      id: 'info',
      label: 'Informações',
      icon: User,
      color: '#004B87',
      content: (
        <Card className={PROFILE_MODAL_STYLES.card.neutral}>
          <CardContent className="pt-6">
            <p>Conteúdo informativo apenas leitura</p>
          </CardContent>
        </Card>
      )
    }
  ];

  return (
    <ProfileModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={data?.title || "Título"}
      headerIcon={User}
      isEditing={false}
      onEdit={() => {}}
      onSave={() => {}}
      onCancel={() => {}}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      showEditButton={false} // Não mostra botão editar
    />
  );
}

// ============================================================
// VANTAGENS DESTA ABORDAGEM:
// ============================================================
// ✅ Código 70% mais curto em cada modal
// ✅ Estilização consistente automática
// ✅ Mudanças no design afetam todos os modais
// ✅ Fácil de adicionar novas tabs
// ✅ Fácil de manter
// ✅ Reutilização total do código
// ============================================================
