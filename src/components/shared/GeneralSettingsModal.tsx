// src/components/shared/GeneralSettingsModal.tsx
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings, School, MapPin, Phone, Mail, Calendar, DollarSign,
  Clock, Users, BookOpen, Shield, Bell, Globe, Save, X,
  AlertTriangle, CheckCircle, ChevronRight
} from "lucide-react";

interface GeneralSettings {
  institutionName: string;
  institutionLogo?: string;
  institutionAddress: string;
  institutionPhone: string;
  institutionEmail: string;
  institutionWebsite?: string;
  institutionDescription?: string;
  academicYear: string;
  semesterStart: string;
  semesterEnd: string;
  classScheduleStart: string;
  classScheduleEnd: string;
  maxStudentsPerClass: number;
  minStudentsPerClass: number;
  lessonDuration: number;
  defaultMonthlyFee: number;
  registrationFee: number;
  registrationFeeGlobalEnabled: boolean;
  registrationFeeIsento: boolean;
  firstPenaltyPercentage: number;
  secondPenaltyPercentage: number;
  paymentDueDays: number;
  advancePaymentDiscount: number;
  penaltyEnabled: boolean;
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  autoPaymentReminders: boolean;
  reminderDaysBefore: number;
  overdueNotificationDays: number;
  systemLanguage: string;
  timezone: string;
  dateFormat: string;
  theme: string;
  enableAttendanceTracking: boolean;
  enableGradeSystem: boolean;
  enableReports: boolean;
  sessionTimeout: number;
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeInterval: number;
  enableTwoFactor: boolean;
  autoBackupEnabled: boolean;
  backupFrequency: string;
  backupRetention: number;
}

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GeneralSettings) => void;
  currentSettings?: GeneralSettings;
}

const TABS = [
  { key: "institution",   label: "Instituição",  icon: School     },
  { key: "academic",      label: "Académico",    icon: BookOpen   },
  { key: "financial",     label: "Financeiro",   icon: DollarSign },
  { key: "communication", label: "Comunicação",  icon: Bell       },
  { key: "system",        label: "Sistema",      icon: Globe      },
  { key: "security",      label: "Segurança",    icon: Shield     },
];

// Reusable styled primitives
const SectionCard = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
  <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#004B87] to-[#0066BB] flex items-center justify-center flex-shrink-0">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
    </div>
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-xs font-semibold text-slate-600 block mb-1.5">{children}</label>
);

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    {...props}
    className={`h-9 text-sm border-slate-200 focus:border-[#004B87] bg-slate-50 rounded-xl ${props.className || ""}`}
  />
);

const SwitchRow = ({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
    <Switch
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="data-[state=checked]:bg-[#004B87]"
    />
  </div>
);

export function GeneralSettingsModal({
  isOpen,
  onClose,
  onSave,
  currentSettings,
}: GeneralSettingsModalProps) {
  const [settings, setSettings] = useState<GeneralSettings>({
    institutionName: "M007 Oxford",
    institutionAddress: "Maputo, Moçambique",
    institutionPhone: "+258 84 000 0000",
    institutionEmail: "info@m007oxford.com",
    institutionWebsite: "www.m007oxford.com",
    institutionDescription: "Instituto de Ensino de Inglês de excelência",
    academicYear: "2025",
    semesterStart: "2025-02-01",
    semesterEnd: "2025-06-30",
    classScheduleStart: "07:00",
    classScheduleEnd: "20:00",
    maxStudentsPerClass: 15,
    minStudentsPerClass: 5,
    lessonDuration: 90,
    defaultMonthlyFee: 3500,
    registrationFee: 1000,
    registrationFeeGlobalEnabled: false,
    registrationFeeIsento: false,
    firstPenaltyPercentage: 10,
    secondPenaltyPercentage: 10,
    paymentDueDays: 10,
    advancePaymentDiscount: 5,
    penaltyEnabled: true,
    enableEmailNotifications: true,
    enableSMSNotifications: false,
    autoPaymentReminders: true,
    reminderDaysBefore: 5,
    overdueNotificationDays: 3,
    systemLanguage: "pt-MZ",
    timezone: "Africa/Maputo",
    dateFormat: "DD/MM/YYYY",
    theme: "light",
    enableAttendanceTracking: true,
    enableGradeSystem: true,
    enableReports: true,
    sessionTimeout: 60,
    passwordMinLength: 8,
    requirePasswordChange: false,
    passwordChangeInterval: 90,
    enableTwoFactor: false,
    autoBackupEnabled: true,
    backupFrequency: "daily",
    backupRetention: 30,
    ...currentSettings,
  });

  const [activeTab, setActiveTab] = useState("institution");
  const [hasChanges, setHasChanges] = useState(false);
  const [showGlobalFeeModal, setShowGlobalFeeModal] = useState(false);
  const [tempGlobalFee, setTempGlobalFee] = useState<number>(0);

  useEffect(() => {
    if (currentSettings) {
      setSettings((prev) => ({ ...prev, ...currentSettings }));
    }
  }, [currentSettings]);

  const handleInputChange = (field: keyof GeneralSettings, value: GeneralSettings[keyof GeneralSettings]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(amount);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-4xl h-[92vh] p-0 overflow-hidden rounded-2xl flex flex-col gap-0 [&>button]:hidden border-0 shadow-2xl">

          {/* ── HEADER ── */}
          <div className="bg-gradient-to-r from-[#004B87] to-[#003868] px-5 pt-4 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F5821F] flex items-center justify-center shadow-lg flex-shrink-0">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">
                    Configurações do Sistema
                  </h2>
                  <p className="text-blue-200 text-xs mt-0.5">
                    Parâmetros globais da instituição
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {hasChanges && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-400/20">
                    <AlertTriangle className="h-3 w-3 text-yellow-300" />
                    <span className="text-xs font-medium text-yellow-200">Não salvo</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Orange accent line */}
          <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F] flex-shrink-0" />

          {/* ── BODY: sidebar + content ── */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left sidebar tabs */}
            <div className="w-40 bg-slate-50 border-r border-slate-100 flex flex-col py-3 gap-1 flex-shrink-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-xl text-left transition-all ${
                      isActive
                        ? "bg-white border border-slate-200 shadow-sm text-[#004B87]"
                        : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isActive ? "bg-[#004B87]" : "bg-slate-200"
                    }`}>
                      <Icon className={`h-3 w-3 ${isActive ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <span className="text-xs font-semibold leading-tight">{tab.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto text-[#004B87]" />}
                  </button>
                );
              })}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-4 space-y-4">

              {/* ── Instituição ── */}
              {activeTab === "institution" && (
                <SectionCard>
                  <SectionHeader icon={School} title="Informações da Instituição" subtitle="Configure os dados básicos da sua instituição" />
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Nome da Instituição</FieldLabel>
                        <StyledInput
                          value={settings.institutionName}
                          onChange={(e) => handleInputChange("institutionName", e.target.value)}
                          placeholder="M007 Oxford"
                        />
                      </div>
                      <div>
                        <FieldLabel>Website</FieldLabel>
                        <StyledInput
                          value={settings.institutionWebsite || ""}
                          onChange={(e) => handleInputChange("institutionWebsite", e.target.value)}
                          placeholder="www.m007oxford.com"
                        />
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Endereço</FieldLabel>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <StyledInput
                          value={settings.institutionAddress}
                          onChange={(e) => handleInputChange("institutionAddress", e.target.value)}
                          placeholder="Rua, Cidade, País"
                          className="pl-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Telefone</FieldLabel>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <StyledInput
                            value={settings.institutionPhone}
                            onChange={(e) => handleInputChange("institutionPhone", e.target.value)}
                            placeholder="+258 84 000 0000"
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Email</FieldLabel>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <StyledInput
                            type="email"
                            value={settings.institutionEmail}
                            onChange={(e) => handleInputChange("institutionEmail", e.target.value)}
                            placeholder="info@m007oxford.com"
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <FieldLabel>Descrição</FieldLabel>
                      <Textarea
                        value={settings.institutionDescription || ""}
                        onChange={(e) => handleInputChange("institutionDescription", e.target.value)}
                        placeholder="Breve descrição sobre a instituição..."
                        rows={3}
                        className="text-sm border-slate-200 focus:border-[#004B87] bg-slate-50 rounded-xl resize-none"
                      />
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── Académico ── */}
              {activeTab === "academic" && (
                <SectionCard>
                  <SectionHeader icon={Calendar} title="Configurações Académicas" subtitle="Períodos lectivos e parâmetros de aulas" />
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <FieldLabel>Ano Lectivo</FieldLabel>
                        <StyledInput
                          value={settings.academicYear}
                          onChange={(e) => handleInputChange("academicYear", e.target.value)}
                          placeholder="2025"
                        />
                      </div>
                      <div>
                        <FieldLabel>Início do Semestre</FieldLabel>
                        <StyledInput
                          type="date"
                          value={settings.semesterStart}
                          onChange={(e) => handleInputChange("semesterStart", e.target.value)}
                        />
                      </div>
                      <div>
                        <FieldLabel>Fim do Semestre</FieldLabel>
                        <StyledInput
                          type="date"
                          value={settings.semesterEnd}
                          onChange={(e) => handleInputChange("semesterEnd", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Início das Aulas</FieldLabel>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <StyledInput
                            type="time"
                            value={settings.classScheduleStart}
                            onChange={(e) => handleInputChange("classScheduleStart", e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Fim das Aulas</FieldLabel>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <StyledInput
                            type="time"
                            value={settings.classScheduleEnd}
                            onChange={(e) => handleInputChange("classScheduleEnd", e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <FieldLabel>Máx. Estudantes/Turma</FieldLabel>
                        <StyledInput
                          type="number"
                          value={settings.maxStudentsPerClass}
                          onChange={(e) => handleInputChange("maxStudentsPerClass", parseInt(e.target.value))}
                          min="1" max="50"
                        />
                      </div>
                      <div>
                        <FieldLabel>Mín. Estudantes/Turma</FieldLabel>
                        <StyledInput
                          type="number"
                          value={settings.minStudentsPerClass}
                          onChange={(e) => handleInputChange("minStudentsPerClass", parseInt(e.target.value))}
                          min="1" max="20"
                        />
                      </div>
                      <div>
                        <FieldLabel>Duração da Aula (min)</FieldLabel>
                        <StyledInput
                          type="number"
                          value={settings.lessonDuration}
                          onChange={(e) => handleInputChange("lessonDuration", parseInt(e.target.value))}
                          min="30" max="180" step="15"
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── Financeiro ── */}
              {activeTab === "financial" && (
                <SectionCard>
                  <SectionHeader icon={DollarSign} title="Configurações Financeiras" subtitle="Valores e políticas de pagamento" />
                  <div className="p-5 space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Mensalidade Padrão (MZN)</FieldLabel>
                        <StyledInput
                          type="number"
                          value={settings.defaultMonthlyFee}
                          onChange={(e) => handleInputChange("defaultMonthlyFee", parseFloat(e.target.value))}
                          step="0.01" min="0"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">{formatCurrency(settings.defaultMonthlyFee)}</p>
                      </div>

                      <div className="space-y-3">
                        <FieldLabel>Taxa de Matrícula Global</FieldLabel>
                        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50">
                          <div>
                            <p className="text-xs font-semibold text-slate-700">Taxa única para todos os cursos</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {settings.registrationFeeGlobalEnabled ? "Activo" : "Cada curso usa o seu próprio valor"}
                            </p>
                          </div>
                          <Switch
                            checked={settings.registrationFeeGlobalEnabled || false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleInputChange("registrationFeeGlobalEnabled", true);
                              } else {
                                handleInputChange("registrationFeeGlobalEnabled", false);
                                handleInputChange("registrationFeeIsento", false);
                              }
                            }}
                            className="data-[state=checked]:bg-[#004B87]"
                          />
                        </div>

                        {settings.registrationFeeGlobalEnabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange("registrationFeeIsento", false);
                                setTempGlobalFee(settings.registrationFee || 0);
                                setShowGlobalFeeModal(true);
                              }}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                !settings.registrationFeeIsento && settings.registrationFee > 0
                                  ? "border-[#004B87] bg-blue-50"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <DollarSign className={`h-3.5 w-3.5 ${!settings.registrationFeeIsento && settings.registrationFee > 0 ? "text-[#004B87]" : "text-slate-400"}`} />
                                <span className={`text-xs font-bold ${!settings.registrationFeeIsento && settings.registrationFee > 0 ? "text-[#004B87]" : "text-slate-600"}`}>
                                  Definir Valor
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Cobrar valor fixo</p>
                              {!settings.registrationFeeIsento && settings.registrationFee > 0 && (
                                <p className="text-xs font-bold text-[#004B87] mt-1">{formatCurrency(settings.registrationFee)}</p>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange("registrationFeeIsento", true);
                                handleInputChange("registrationFee", 0);
                              }}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                settings.registrationFeeIsento
                                  ? "border-green-500 bg-green-50"
                                  : "border-slate-200 hover:border-slate-300 bg-white"
                              }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1">
                                <CheckCircle className={`h-3.5 w-3.5 ${settings.registrationFeeIsento ? "text-green-600" : "text-slate-400"}`} />
                                <span className={`text-xs font-bold ${settings.registrationFeeIsento ? "text-green-700" : "text-slate-600"}`}>
                                  Gratuito
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500">Sem taxa de matrícula</p>
                            </button>
                          </div>
                        )}

                        {settings.registrationFeeGlobalEnabled && settings.registrationFeeIsento && (
                          <div className="flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-amber-700">Taxa isenta/gratuita para todos os cursos.</p>
                          </div>
                        )}
                        {settings.registrationFeeGlobalEnabled && !settings.registrationFeeIsento && settings.registrationFee > 0 && (
                          <div className="flex items-start gap-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
                            <AlertTriangle className="h-3.5 w-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <p className="text-[10px] text-blue-700">Todos os cursos pagarão <strong>{formatCurrency(settings.registrationFee)}</strong>.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Dia de Vencimento (do mês)</FieldLabel>
                        <StyledInput
                          type="number"
                          value={settings.paymentDueDays}
                          onChange={(e) => handleInputChange("paymentDueDays", parseInt(e.target.value))}
                          min="1" max="28"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Todo dia {settings.paymentDueDays} do mês</p>
                      </div>
                      <div>
                        <FieldLabel>Desconto Antecipado %</FieldLabel>
                        <StyledInput
                          type="number"
                          value={settings.advancePaymentDiscount}
                          onChange={(e) => handleInputChange("advancePaymentDiscount", parseFloat(e.target.value))}
                          step="0.1" min="0" max="50"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">{settings.advancePaymentDiscount}% de desconto antecipado</p>
                      </div>
                    </div>

                    {/* Multas */}
                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Política de Multas por Atraso</p>
                          <p className="text-xs text-slate-500">Penalidades por atraso no pagamento</p>
                        </div>
                        <Switch
                          checked={settings.penaltyEnabled}
                          onCheckedChange={(checked) => handleInputChange("penaltyEnabled", checked)}
                          className="data-[state=checked]:bg-[#004B87]"
                        />
                      </div>

                      {settings.penaltyEnabled && (
                        <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <FieldLabel>1ª Multa % (após dia 10)</FieldLabel>
                              <StyledInput
                                type="number"
                                value={settings.firstPenaltyPercentage}
                                onChange={(e) => handleInputChange("firstPenaltyPercentage", parseFloat(e.target.value))}
                                step="1" min="0" max="100"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">+{settings.firstPenaltyPercentage}% após dia 10</p>
                            </div>
                            <div>
                              <FieldLabel>2ª Multa % (após dia 20)</FieldLabel>
                              <StyledInput
                                type="number"
                                value={settings.secondPenaltyPercentage}
                                onChange={(e) => handleInputChange("secondPenaltyPercentage", parseFloat(e.target.value))}
                                step="1" min="0" max="100"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">+{settings.secondPenaltyPercentage}% após dia 20</p>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-orange-200">
                            <p className="text-xs font-semibold text-slate-700 mb-1">
                              Exemplo — mensalidade de {formatCurrency(settings.defaultMonthlyFee)}:
                            </p>
                            <ul className="text-[10px] text-slate-600 space-y-0.5">
                              <li>• Até dia 10: {formatCurrency(settings.defaultMonthlyFee)}</li>
                              <li>• Dia 11–20: {formatCurrency(settings.defaultMonthlyFee * (1 + settings.firstPenaltyPercentage / 100))} (+{settings.firstPenaltyPercentage}%)</li>
                              <li>• Após dia 20: {formatCurrency(settings.defaultMonthlyFee * (1 + (settings.firstPenaltyPercentage + settings.secondPenaltyPercentage) / 100))} (+{settings.firstPenaltyPercentage + settings.secondPenaltyPercentage}%)</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── Comunicação ── */}
              {activeTab === "communication" && (
                <SectionCard>
                  <SectionHeader icon={Bell} title="Configurações de Comunicação" subtitle="Notificações e lembretes automáticos" />
                  <div className="p-5 space-y-3">
                    <SwitchRow
                      label="Notificações por Email"
                      description="Enviar notificações automáticas por email"
                      checked={settings.enableEmailNotifications}
                      onCheckedChange={(v) => handleInputChange("enableEmailNotifications", v)}
                    />
                    <SwitchRow
                      label="Notificações por SMS"
                      description="Enviar notificações automáticas por SMS"
                      checked={settings.enableSMSNotifications}
                      onCheckedChange={(v) => handleInputChange("enableSMSNotifications", v)}
                    />
                    <SwitchRow
                      label="Lembretes de Pagamento"
                      description="Enviar lembretes automáticos antes do vencimento"
                      checked={settings.autoPaymentReminders}
                      onCheckedChange={(v) => handleInputChange("autoPaymentReminders", v)}
                    />

                    {settings.autoPaymentReminders && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl grid grid-cols-2 gap-4">
                        <div>
                          <FieldLabel>Dias Antes do Vencimento</FieldLabel>
                          <StyledInput
                            type="number"
                            value={settings.reminderDaysBefore}
                            onChange={(e) => handleInputChange("reminderDaysBefore", parseInt(e.target.value))}
                            min="1" max="30"
                          />
                        </div>
                        <div>
                          <FieldLabel>Dias Após Vencimento</FieldLabel>
                          <StyledInput
                            type="number"
                            value={settings.overdueNotificationDays}
                            onChange={(e) => handleInputChange("overdueNotificationDays", parseInt(e.target.value))}
                            min="1" max="30"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* ── Sistema ── */}
              {activeTab === "system" && (
                <SectionCard>
                  <SectionHeader icon={Globe} title="Configurações do Sistema" subtitle="Idioma, fuso horário e funcionalidades" />
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Idioma do Sistema</FieldLabel>
                        <Select value={settings.systemLanguage} onValueChange={(v) => handleInputChange("systemLanguage", v)}>
                          <SelectTrigger className="h-9 text-sm border-slate-200 bg-slate-50 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-MZ">Português (Moçambique)</SelectItem>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Fuso Horário</FieldLabel>
                        <Select value={settings.timezone} onValueChange={(v) => handleInputChange("timezone", v)}>
                          <SelectTrigger className="h-9 text-sm border-slate-200 bg-slate-50 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Africa/Maputo">África/Maputo</SelectItem>
                            <SelectItem value="Africa/Johannesburg">África/Joanesburgo</SelectItem>
                            <SelectItem value="UTC">UTC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Formato de Data</FieldLabel>
                        <Select value={settings.dateFormat} onValueChange={(v) => handleInputChange("dateFormat", v)}>
                          <SelectTrigger className="h-9 text-sm border-slate-200 bg-slate-50 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <FieldLabel>Tema</FieldLabel>
                        <Select value={settings.theme} onValueChange={(v) => handleInputChange("theme", v)}>
                          <SelectTrigger className="h-9 text-sm border-slate-200 bg-slate-50 rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">Claro</SelectItem>
                            <SelectItem value="dark">Escuro</SelectItem>
                            <SelectItem value="auto">Automático</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-100 pt-4">
                      <SwitchRow
                        label="Controle de Presença"
                        description="Habilitar sistema de controle de presença"
                        checked={settings.enableAttendanceTracking}
                        onCheckedChange={(v) => handleInputChange("enableAttendanceTracking", v)}
                      />
                      <SwitchRow
                        label="Sistema de Notas"
                        description="Habilitar sistema de avaliações e notas"
                        checked={settings.enableGradeSystem}
                        onCheckedChange={(v) => handleInputChange("enableGradeSystem", v)}
                      />
                      <SwitchRow
                        label="Relatórios Avançados"
                        description="Habilitar geração de relatórios detalhados"
                        checked={settings.enableReports}
                        onCheckedChange={(v) => handleInputChange("enableReports", v)}
                      />
                    </div>
                  </div>
                </SectionCard>
              )}

              {/* ── Segurança ── */}
              {activeTab === "security" && (
                <SectionCard>
                  <SectionHeader icon={Shield} title="Configurações de Segurança" subtitle="Políticas de acesso e backup automático" />
                  <div className="p-5 space-y-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Políticas de Senha</p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <FieldLabel>Comprimento Mínimo</FieldLabel>
                          <StyledInput
                            type="number"
                            value={settings.passwordMinLength}
                            onChange={(e) => handleInputChange("passwordMinLength", parseInt(e.target.value))}
                            min="6" max="20"
                          />
                        </div>
                        <div>
                          <FieldLabel>Timeout da Sessão (min)</FieldLabel>
                          <StyledInput
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => handleInputChange("sessionTimeout", parseInt(e.target.value))}
                            min="15" max="480" step="15"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <SwitchRow
                          label="Mudança Obrigatória de Senha"
                          description="Exigir mudança periódica de senhas"
                          checked={settings.requirePasswordChange}
                          onCheckedChange={(v) => handleInputChange("requirePasswordChange", v)}
                        />
                        {settings.requirePasswordChange && (
                          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                            <FieldLabel>Intervalo (dias)</FieldLabel>
                            <StyledInput
                              type="number"
                              value={settings.passwordChangeInterval}
                              onChange={(e) => handleInputChange("passwordChangeInterval", parseInt(e.target.value))}
                              min="30" max="365" step="30"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">
                              Utilizadores alteram senha a cada {settings.passwordChangeInterval} dias
                            </p>
                          </div>
                        )}
                        <SwitchRow
                          label="Autenticação de Dois Factores"
                          description="Habilitar 2FA para administradores"
                          checked={settings.enableTwoFactor}
                          onCheckedChange={(v) => handleInputChange("enableTwoFactor", v)}
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">Backup Automático</p>
                      <div className="space-y-3">
                        <SwitchRow
                          label="Backup Automático"
                          description="Realizar backup automático dos dados"
                          checked={settings.autoBackupEnabled}
                          onCheckedChange={(v) => handleInputChange("autoBackupEnabled", v)}
                        />
                        {settings.autoBackupEnabled && (
                          <div className="p-4 bg-green-50 border border-green-200 rounded-xl grid grid-cols-2 gap-4">
                            <div>
                              <FieldLabel>Frequência</FieldLabel>
                              <Select value={settings.backupFrequency} onValueChange={(v) => handleInputChange("backupFrequency", v)}>
                                <SelectTrigger className="h-9 text-sm border-slate-200 bg-white rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="daily">Diário</SelectItem>
                                  <SelectItem value="weekly">Semanal</SelectItem>
                                  <SelectItem value="monthly">Mensal</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <FieldLabel>Retenção (dias)</FieldLabel>
                              <StyledInput
                                type="number"
                                value={settings.backupRetention}
                                onChange={(e) => handleInputChange("backupRetention", parseInt(e.target.value))}
                                min="7" max="365" step="7"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}

            </div>
          </div>

          {/* ── FOOTER ── */}
          <div className="bg-white border-t border-slate-100 px-5 py-3.5 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {hasChanges ? (
                <>
                  <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                  <span className="text-xs text-slate-500">Existem alterações não salvas</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                  <span className="text-xs text-slate-500">Todas as configurações estão salvas</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#F5821F] to-[#e06a10] hover:from-[#e06a10] hover:to-[#cc5f0e] shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Save className="h-3.5 w-3.5" />
                Salvar Configurações
              </button>
            </div>
          </div>

        </DialogContent>
      </Dialog>

      {/* Mini-modal — taxa global de matrícula */}
      <Dialog open={showGlobalFeeModal} onOpenChange={setShowGlobalFeeModal}>
        <DialogContent className="w-[95vw] max-w-md p-0 overflow-hidden rounded-2xl flex flex-col gap-0 [&>button]:hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-r from-[#004B87] to-[#003868] px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#F5821F] flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Taxa Global de Matrícula</p>
                <p className="text-blue-200 text-xs">Aplicada a todos os cursos</p>
              </div>
            </div>
            <button
              onClick={() => setShowGlobalFeeModal(false)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
          <div className="h-0.5 bg-gradient-to-r from-[#F5821F] via-[#FF9933] to-[#F5821F]" />

          <div className="bg-slate-50 p-5 space-y-4">
            <div>
              <FieldLabel>Valor da Taxa (MZN)</FieldLabel>
              <Input
                type="number"
                value={tempGlobalFee || ""}
                onChange={(e) => setTempGlobalFee(parseFloat(e.target.value) || 0)}
                step="0.01" min="0"
                placeholder="Ex: 5000"
                className="h-11 text-base font-bold border-slate-200 focus:border-[#004B87] bg-white rounded-xl"
                autoFocus
              />
              {tempGlobalFee > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-1">{formatCurrency(tempGlobalFee)}</p>
              )}
            </div>

            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[10px] text-amber-700">
                Este valor será a taxa única para <strong>todos os cursos</strong>. Os valores individuais serão ignorados enquanto esta opção estiver activa.
              </p>
            </div>
          </div>

          <div className="bg-white border-t border-slate-100 px-5 py-3.5 flex justify-end gap-2">
            <button
              onClick={() => setShowGlobalFeeModal(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                handleInputChange("registrationFeeGlobalEnabled", true);
                handleInputChange("registrationFee", tempGlobalFee);
                handleInputChange("registrationFeeIsento", false);
                setShowGlobalFeeModal(false);
              }}
              disabled={tempGlobalFee <= 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-[#F5821F] to-[#e06a10] hover:from-[#e06a10] hover:to-[#cc5f0e] shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Confirmar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
