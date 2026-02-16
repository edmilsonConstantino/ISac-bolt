// src/components/shared/GeneralSettingsModal.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  School,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Clock,
  Users,
  BookOpen,
  Shield,
  Bell,
  Globe,
  Palette,
  Save,
  X,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface GeneralSettings {
  // Informações da Instituição
  institutionName: string;
  institutionLogo?: string;
  institutionAddress: string;
  institutionPhone: string;
  institutionEmail: string;
  institutionWebsite?: string;
  institutionDescription?: string;
  
  // Configurações Acadêmicas
  academicYear: string;
  semesterStart: string;
  semesterEnd: string;
  classScheduleStart: string;
  classScheduleEnd: string;
  maxStudentsPerClass: number;
  minStudentsPerClass: number;
  lessonDuration: number; // em minutos
  
  // Configurações Financeiras
  defaultMonthlyFee: number;
  registrationFee: number;
  registrationFeeGlobalEnabled: boolean;
  registrationFeeIsento: boolean;
  firstPenaltyPercentage: number;  // Primeira multa (após dia 10)
  secondPenaltyPercentage: number; // Segunda multa (após dia 20)
  paymentDueDays: number;
  advancePaymentDiscount: number;
  penaltyEnabled: boolean;
  
  // Configurações de Comunicação
  enableEmailNotifications: boolean;
  enableSMSNotifications: boolean;
  autoPaymentReminders: boolean;
  reminderDaysBefore: number;
  overdueNotificationDays: number;
  
  // Configurações do Sistema
  systemLanguage: string;
  timezone: string;
  dateFormat: string;
  theme: string;
  enableAttendanceTracking: boolean;
  enableGradeSystem: boolean;
  enableReports: boolean;
  
  // Configurações de Segurança
  sessionTimeout: number; // em minutos
  passwordMinLength: number;
  requirePasswordChange: boolean;
  passwordChangeInterval: number; // em dias
  enableTwoFactor: boolean;
  
  // Configurações de Backup
  autoBackupEnabled: boolean;
  backupFrequency: string; // daily, weekly, monthly
  backupRetention: number; // em dias
}

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GeneralSettings) => void;
  currentSettings?: GeneralSettings;
}

export function GeneralSettingsModal({ 
  isOpen, 
  onClose, 
  onSave, 
  currentSettings 
}: GeneralSettingsModalProps) {
  const [settings, setSettings] = useState<GeneralSettings>({
    // Valores padrão
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
    
    ...currentSettings
  });

  const [activeTab, setActiveTab] = useState("institution");
  const [hasChanges, setHasChanges] = useState(false);
  const [showGlobalFeeModal, setShowGlobalFeeModal] = useState(false);
  const [tempGlobalFee, setTempGlobalFee] = useState<number>(0);

  useEffect(() => {
    if (currentSettings) {
      setSettings({ ...settings, ...currentSettings });
    }
  }, [currentSettings]);

  const handleInputChange = (field: keyof GeneralSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    }).format(amount);
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Settings className="h-5 w-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl">Configurações Gerais do Sistema</DialogTitle>
              <DialogDescription>
                Configure os parâmetros globais da instituição
              </DialogDescription>
            </div>
          </div>
          {hasChanges && (
            <Badge variant="secondary" className="w-fit">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alterações não salvas
            </Badge>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-6 mb-4">
              <TabsTrigger value="institution" className="flex items-center gap-1">
                <School className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Instituição</span>
              </TabsTrigger>
              <TabsTrigger value="academic" className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Acadêmico</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Financeiro</span>
              </TabsTrigger>
              <TabsTrigger value="communication" className="flex items-center gap-1">
                <Bell className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Comunicação</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Sistema</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Segurança</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto pr-2">
              {/* Aba Instituição */}
              <TabsContent value="institution" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="h-5 w-5" />
                      Informações da Instituição
                    </CardTitle>
                    <CardDescription>
                      Configure as informações básicas da sua instituição
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="institutionName">Nome da Instituição</Label>
                        <Input
                          id="institutionName"
                          value={settings.institutionName}
                          onChange={(e) => handleInputChange('institutionName', e.target.value)}
                          placeholder="M007 Oxford"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="institutionWebsite">Website</Label>
                        <Input
                          id="institutionWebsite"
                          value={settings.institutionWebsite || ''}
                          onChange={(e) => handleInputChange('institutionWebsite', e.target.value)}
                          placeholder="www.m007oxford.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institutionAddress">Endereço</Label>
                      <Input
                        id="institutionAddress"
                        value={settings.institutionAddress}
                        onChange={(e) => handleInputChange('institutionAddress', e.target.value)}
                        placeholder="Rua, Cidade, País"
                        className="flex items-center gap-2"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="institutionPhone">Telefone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="institutionPhone"
                            value={settings.institutionPhone}
                            onChange={(e) => handleInputChange('institutionPhone', e.target.value)}
                            placeholder="+258 84 000 0000"
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="institutionEmail">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="institutionEmail"
                            type="email"
                            value={settings.institutionEmail}
                            onChange={(e) => handleInputChange('institutionEmail', e.target.value)}
                            placeholder="info@m007oxford.com"
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institutionDescription">Descrição</Label>
                      <Textarea
                        id="institutionDescription"
                        value={settings.institutionDescription || ''}
                        onChange={(e) => handleInputChange('institutionDescription', e.target.value)}
                        placeholder="Breve descrição sobre a instituição..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Acadêmico */}
              <TabsContent value="academic" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Configurações Acadêmicas
                    </CardTitle>
                    <CardDescription>
                      Configure períodos letivos e parâmetros de aulas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="academicYear">Ano Letivo</Label>
                        <Input
                          id="academicYear"
                          value={settings.academicYear}
                          onChange={(e) => handleInputChange('academicYear', e.target.value)}
                          placeholder="2025"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="semesterStart">Início do Semestre</Label>
                        <Input
                          id="semesterStart"
                          type="date"
                          value={settings.semesterStart}
                          onChange={(e) => handleInputChange('semesterStart', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="semesterEnd">Fim do Semestre</Label>
                        <Input
                          id="semesterEnd"
                          type="date"
                          value={settings.semesterEnd}
                          onChange={(e) => handleInputChange('semesterEnd', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="classScheduleStart">Início das Aulas</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="classScheduleStart"
                            type="time"
                            value={settings.classScheduleStart}
                            onChange={(e) => handleInputChange('classScheduleStart', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="classScheduleEnd">Fim das Aulas</Label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="classScheduleEnd"
                            type="time"
                            value={settings.classScheduleEnd}
                            onChange={(e) => handleInputChange('classScheduleEnd', e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxStudentsPerClass">Máx. Estudantes/Turma</Label>
                        <Input
                          id="maxStudentsPerClass"
                          type="number"
                          value={settings.maxStudentsPerClass}
                          onChange={(e) => handleInputChange('maxStudentsPerClass', parseInt(e.target.value))}
                          min="1"
                          max="50"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="minStudentsPerClass">Mín. Estudantes/Turma</Label>
                        <Input
                          id="minStudentsPerClass"
                          type="number"
                          value={settings.minStudentsPerClass}
                          onChange={(e) => handleInputChange('minStudentsPerClass', parseInt(e.target.value))}
                          min="1"
                          max="20"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lessonDuration">Duração da Aula (min)</Label>
                        <Input
                          id="lessonDuration"
                          type="number"
                          value={settings.lessonDuration}
                          onChange={(e) => handleInputChange('lessonDuration', parseInt(e.target.value))}
                          min="30"
                          max="180"
                          step="15"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Financeiro */}
              <TabsContent value="financial" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Configurações Financeiras
                    </CardTitle>
                    <CardDescription>
                      Configure valores e políticas de pagamento
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultMonthlyFee">Mensalidade Padrão</Label>
                        <Input
                          id="defaultMonthlyFee"
                          type="number"
                          value={settings.defaultMonthlyFee}
                          onChange={(e) => handleInputChange('defaultMonthlyFee', parseFloat(e.target.value))}
                          step="0.01"
                          min="0"
                        />
                        <p className="text-xs text-muted-foreground">
                          Valor: {formatCurrency(settings.defaultMonthlyFee)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label className="font-medium">Taxa de Matrícula Global</Label>

                        {/* Toggle para activar taxa global */}
                        <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                          <div className="space-y-0.5">
                            <Label htmlFor="registrationFeeGlobalEnabled" className="text-sm font-medium cursor-pointer">
                              Definir taxa única para todos os cursos
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {settings.registrationFeeGlobalEnabled
                                ? 'Activo - todos os cursos usam esta definição'
                                : 'Desactivado - cada curso usa o seu próprio valor'
                              }
                            </p>
                          </div>
                          <Switch
                            id="registrationFeeGlobalEnabled"
                            checked={settings.registrationFeeGlobalEnabled || false}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleInputChange('registrationFeeGlobalEnabled', true);
                              } else {
                                handleInputChange('registrationFeeGlobalEnabled', false);
                                handleInputChange('registrationFeeIsento', false);
                              }
                            }}
                          />
                        </div>

                        {/* Opções quando activo */}
                        {settings.registrationFeeGlobalEnabled && (
                          <div className="space-y-3">
                            {/* Duas opções claras */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Opção 1: Definir valor */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('registrationFeeIsento', false);
                                  setTempGlobalFee(settings.registrationFee || 0);
                                  setShowGlobalFeeModal(true);
                                }}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  !settings.registrationFeeIsento && settings.registrationFee > 0
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <DollarSign className={`h-4 w-4 ${!settings.registrationFeeIsento && settings.registrationFee > 0 ? 'text-blue-600' : 'text-slate-400'}`} />
                                  <span className={`text-sm font-bold ${!settings.registrationFeeIsento && settings.registrationFee > 0 ? 'text-blue-700' : 'text-slate-600'}`}>
                                    Definir Valor
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  Cobrar um valor fixo a todos os cursos
                                </p>
                                {!settings.registrationFeeIsento && settings.registrationFee > 0 && (
                                  <p className="text-sm font-bold text-blue-600 mt-2">
                                    {formatCurrency(settings.registrationFee)}
                                  </p>
                                )}
                              </button>

                              {/* Opção 2: Isento / Gratuito */}
                              <button
                                type="button"
                                onClick={() => {
                                  handleInputChange('registrationFeeIsento', true);
                                  handleInputChange('registrationFee', 0);
                                }}
                                className={`p-4 rounded-xl border-2 text-left transition-all ${
                                  settings.registrationFeeIsento
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <CheckCircle className={`h-4 w-4 ${settings.registrationFeeIsento ? 'text-green-600' : 'text-slate-400'}`} />
                                  <span className={`text-sm font-bold ${settings.registrationFeeIsento ? 'text-green-700' : 'text-slate-600'}`}>
                                    Isento / Gratuito
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                  Sem taxa de matrícula para nenhum curso
                                </p>
                                {settings.registrationFeeIsento && (
                                  <p className="text-sm font-bold text-green-600 mt-2">
                                    Gratuito
                                  </p>
                                )}
                              </button>
                            </div>

                            {/* Aviso */}
                            {settings.registrationFeeIsento && (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-amber-700">
                                    A taxa de matrícula será <strong>isenta/gratuita</strong> para todos os cursos.
                                    Os valores definidos na criação de cada curso serão ignorados.
                                  </p>
                                </div>
                              </div>
                            )}

                            {!settings.registrationFeeIsento && settings.registrationFee > 0 && (
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-blue-700">
                                    Todos os cursos terão a taxa de matrícula de <strong>{formatCurrency(settings.registrationFee)}</strong>.
                                    Os valores individuais definidos na criação de cada curso serão ignorados.
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {!settings.registrationFeeGlobalEnabled && (
                          <p className="text-xs text-slate-500">
                            Cada curso utiliza o valor definido no processo de criação do curso.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paymentDueDays">Dia de Vencimento (do mês)</Label>
                        <Input
                          id="paymentDueDays"
                          type="number"
                          value={settings.paymentDueDays}
                          onChange={(e) => handleInputChange('paymentDueDays', parseInt(e.target.value))}
                          min="1"
                          max="28"
                        />
                        <p className="text-xs text-muted-foreground">
                          Vencimento todo dia {settings.paymentDueDays} do mês
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="advancePaymentDiscount">Desconto Antecipado %</Label>
                        <Input
                          id="advancePaymentDiscount"
                          type="number"
                          value={settings.advancePaymentDiscount}
                          onChange={(e) => handleInputChange('advancePaymentDiscount', parseFloat(e.target.value))}
                          step="0.1"
                          min="0"
                          max="50"
                        />
                        <p className="text-xs text-muted-foreground">
                          {settings.advancePaymentDiscount}% de desconto para pagamento antecipado
                        </p>
                      </div>
                    </div>

                    {/* Secção de Multas */}
                    <div className="border-t pt-4 mt-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-medium">Política de Multas por Atraso</h4>
                          <p className="text-xs text-muted-foreground">Configure as penalidades por atraso no pagamento</p>
                        </div>
                        <Switch
                          checked={settings.penaltyEnabled}
                          onCheckedChange={(checked) => handleInputChange('penaltyEnabled', checked)}
                        />
                      </div>

                      {settings.penaltyEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="space-y-2">
                            <Label htmlFor="firstPenaltyPercentage">Primeira Multa % (após dia 10)</Label>
                            <Input
                              id="firstPenaltyPercentage"
                              type="number"
                              value={settings.firstPenaltyPercentage}
                              onChange={(e) => handleInputChange('firstPenaltyPercentage', parseFloat(e.target.value))}
                              step="1"
                              min="0"
                              max="100"
                            />
                            <p className="text-xs text-muted-foreground">
                              +{settings.firstPenaltyPercentage}% após o dia 10 do mês
                            </p>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="secondPenaltyPercentage">Segunda Multa % (após dia 20)</Label>
                            <Input
                              id="secondPenaltyPercentage"
                              type="number"
                              value={settings.secondPenaltyPercentage}
                              onChange={(e) => handleInputChange('secondPenaltyPercentage', parseFloat(e.target.value))}
                              step="1"
                              min="0"
                              max="100"
                            />
                            <p className="text-xs text-muted-foreground">
                              +{settings.secondPenaltyPercentage}% adicional após o dia 20
                            </p>
                          </div>

                          <div className="col-span-2 p-3 bg-white rounded border border-orange-300">
                            <p className="text-sm text-slate-700">
                              <strong>Exemplo:</strong> Para uma mensalidade de {formatCurrency(settings.defaultMonthlyFee)}:
                            </p>
                            <ul className="text-xs text-slate-600 mt-1 space-y-1">
                              <li>• Até dia 10: {formatCurrency(settings.defaultMonthlyFee)} (sem multa)</li>
                              <li>• Dia 11-20: {formatCurrency(settings.defaultMonthlyFee * (1 + settings.firstPenaltyPercentage / 100))} (+{settings.firstPenaltyPercentage}%)</li>
                              <li>• Após dia 20: {formatCurrency(settings.defaultMonthlyFee * (1 + (settings.firstPenaltyPercentage + settings.secondPenaltyPercentage) / 100))} (+{settings.firstPenaltyPercentage + settings.secondPenaltyPercentage}%)</li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Comunicação */}
              <TabsContent value="communication" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Configurações de Comunicação
                    </CardTitle>
                    <CardDescription>
                      Configure notificações e lembretes automáticos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Notificações por Email</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar notificações automáticas por email
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableEmailNotifications}
                          onCheckedChange={(checked) => handleInputChange('enableEmailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Notificações por SMS</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar notificações automáticas por SMS
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableSMSNotifications}
                          onCheckedChange={(checked) => handleInputChange('enableSMSNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Lembretes de Pagamento</Label>
                          <p className="text-sm text-muted-foreground">
                            Enviar lembretes automáticos antes do vencimento
                          </p>
                        </div>
                        <Switch
                          checked={settings.autoPaymentReminders}
                          onCheckedChange={(checked) => handleInputChange('autoPaymentReminders', checked)}
                        />
                      </div>
                    </div>

                    {settings.autoPaymentReminders && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor="reminderDaysBefore">Dias Antes do Vencimento</Label>
                          <Input
                            id="reminderDaysBefore"
                            type="number"
                            value={settings.reminderDaysBefore}
                            onChange={(e) => handleInputChange('reminderDaysBefore', parseInt(e.target.value))}
                            min="1"
                            max="30"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="overdueNotificationDays">Dias Após Vencimento</Label>
                          <Input
                            id="overdueNotificationDays"
                            type="number"
                            value={settings.overdueNotificationDays}
                            onChange={(e) => handleInputChange('overdueNotificationDays', parseInt(e.target.value))}
                            min="1"
                            max="30"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Sistema */}
              <TabsContent value="system" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5" />
                      Configurações do Sistema
                    </CardTitle>
                    <CardDescription>
                      Configure idioma, fuso horário e funcionalidades
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="systemLanguage">Idioma do Sistema</Label>
                        <Select 
                          value={settings.systemLanguage} 
                          onValueChange={(value) => handleInputChange('systemLanguage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pt-MZ">Português (Moçambique)</SelectItem>
                            <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                            <SelectItem value="en-US">English (US)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Fuso Horário</Label>
                        <Select 
                          value={settings.timezone} 
                          onValueChange={(value) => handleInputChange('timezone', value)}
                        >
                          <SelectTrigger>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dateFormat">Formato de Data</Label>
                        <Select 
                          value={settings.dateFormat} 
                          onValueChange={(value) => handleInputChange('dateFormat', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                            <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                            <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="theme">Tema</Label>
                        <Select 
                          value={settings.theme} 
                          onValueChange={(value) => handleInputChange('theme', value)}
                        >
                          <SelectTrigger>
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

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Controle de Presença</Label>
                          <p className="text-sm text-muted-foreground">
                            Habilitar sistema de controle de presença
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableAttendanceTracking}
                          onCheckedChange={(checked) => handleInputChange('enableAttendanceTracking', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Sistema de Notas</Label>
                          <p className="text-sm text-muted-foreground">
                            Habilitar sistema de avaliações e notas
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableGradeSystem}
                          onCheckedChange={(checked) => handleInputChange('enableGradeSystem', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Relatórios Avançados</Label>
                          <p className="text-sm text-muted-foreground">
                            Habilitar geração de relatórios detalhados
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableReports}
                          onCheckedChange={(checked) => handleInputChange('enableReports', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Aba Segurança */}
              <TabsContent value="security" className="space-y-6 mt-0">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Configurações de Segurança
                    </CardTitle>
                    <CardDescription>
                      Configure políticas de segurança e backup
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Políticas de Senha
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="passwordMinLength">Comprimento Mínimo</Label>
                          <Input
                            id="passwordMinLength"
                            type="number"
                            value={settings.passwordMinLength}
                            onChange={(e) => handleInputChange('passwordMinLength', parseInt(e.target.value))}
                            min="6"
                            max="20"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="sessionTimeout">Timeout da Sessão (min)</Label>
                          <Input
                            id="sessionTimeout"
                            type="number"
                            value={settings.sessionTimeout}
                            onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                            min="15"
                            max="480"
                            step="15"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Mudança Obrigatória de Senha</Label>
                          <p className="text-sm text-muted-foreground">
                            Exigir mudança periódica de senhas
                          </p>
                        </div>
                        <Switch
                          checked={settings.requirePasswordChange}
                          onCheckedChange={(checked) => handleInputChange('requirePasswordChange', checked)}
                        />
                      </div>
                      
                      {settings.requirePasswordChange && (
                        <div className="space-y-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <Label htmlFor="passwordChangeInterval">Intervalo (dias)</Label>
                          <Input
                            id="passwordChangeInterval"
                            type="number"
                            value={settings.passwordChangeInterval}
                            onChange={(e) => handleInputChange('passwordChangeInterval', parseInt(e.target.value))}
                            min="30"
                            max="365"
                            step="30"
                          />
                          <p className="text-xs text-muted-foreground">
                            Usuários deverão alterar senha a cada {settings.passwordChangeInterval} dias
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Autenticação de Dois Fatores</Label>
                          <p className="text-sm text-muted-foreground">
                            Habilitar 2FA para administradores
                          </p>
                        </div>
                        <Switch
                          checked={settings.enableTwoFactor}
                          onCheckedChange={(checked) => handleInputChange('enableTwoFactor', checked)}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t pt-6">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Backup Automático
                      </h4>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <Label className="text-base font-medium">Backup Automático</Label>
                          <p className="text-sm text-muted-foreground">
                            Realizar backup automático dos dados
                          </p>
                        </div>
                        <Switch
                          checked={settings.autoBackupEnabled}
                          onCheckedChange={(checked) => handleInputChange('autoBackupEnabled', checked)}
                        />
                      </div>
                      
                      {settings.autoBackupEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="space-y-2">
                            <Label htmlFor="backupFrequency">Frequência</Label>
                            <Select 
                              value={settings.backupFrequency} 
                              onValueChange={(value) => handleInputChange('backupFrequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="daily">Diário</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="backupRetention">Retenção (dias)</Label>
                            <Input
                              id="backupRetention"
                              type="number"
                              value={settings.backupRetention}
                              onChange={(e) => handleInputChange('backupRetention', parseInt(e.target.value))}
                              min="7"
                              max="365"
                              step="7"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {hasChanges ? (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span>Existem alterações não salvas</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Todas as configurações estão salvas</span>
              </>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              variant="oxford" 
              onClick={handleSave}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
       
      </DialogContent>

    </Dialog>

    {/* Mini Modal - Definir valor global da taxa de matrícula */}
    <Dialog open={showGlobalFeeModal} onOpenChange={setShowGlobalFeeModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-[#F5821F]" />
            Definir Taxa Global de Matrícula
          </DialogTitle>
          <DialogDescription>
            Este valor será aplicado a <strong>todos os cursos</strong> no processo de matrícula.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="globalFeeValue">Valor da Taxa (MZN)</Label>
            <Input
              id="globalFeeValue"
              type="number"
              value={tempGlobalFee || ''}
              onChange={(e) => setTempGlobalFee(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              placeholder="Ex: 5000"
              className="h-12 text-lg font-bold"
              autoFocus
            />
            {tempGlobalFee > 0 && (
              <p className="text-sm text-green-600 font-medium">
                {formatCurrency(tempGlobalFee)}
              </p>
            )}
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Este valor será a taxa única de matrícula para <strong>todos os cursos</strong>.
                Os valores individuais definidos na criação de cada curso serão ignorados enquanto esta opção estiver activa.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowGlobalFeeModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="oxford"
            onClick={() => {
              handleInputChange('registrationFeeGlobalEnabled', true);
              handleInputChange('registrationFee', tempGlobalFee);
              handleInputChange('registrationFeeIsento', false);
              setShowGlobalFeeModal(false);
            }}
            disabled={tempGlobalFee <= 0}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
} 