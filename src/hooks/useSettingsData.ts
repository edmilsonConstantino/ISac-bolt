// src/hooks/useSettingsData.ts
import { useState, useEffect } from 'react';

export interface GeneralSettings {
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

  // Configurações de Inscrição
  inscriptionIsPaid: boolean; // Se inscrição requer pagamento
  inscriptionFee: number; // Valor da taxa de inscrição em MZN
}

const SETTINGS_STORAGE_KEY = 'oxford_general_settings';
const SETTINGS_CHANGE_EVENT = 'oxford_settings_changed';

const defaultSettings: GeneralSettings = {
  // Informações da Instituição
  institutionName: "  ISAC",
  institutionAddress: "Maputo, Moçambique",
  institutionPhone: "+258 84 000 0000",
  institutionEmail: "info@m007oxford.com",
  institutionWebsite: "www.m007oxford.com",
  institutionDescription: "Instituto de Ensino de Inglês de excelência em Moçambique",
  
  // Configurações Acadêmicas
  academicYear: "2025",
  semesterStart: "2025-02-01",
  semesterEnd: "2025-06-30",
  classScheduleStart: "07:00",
  classScheduleEnd: "20:00",
  maxStudentsPerClass: 15,
  minStudentsPerClass: 5,
  lessonDuration: 90,
  
  // Configurações Financeiras
  defaultMonthlyFee: 3500,
  registrationFee: 1000,
  firstPenaltyPercentage: 10,
  secondPenaltyPercentage: 10,
  paymentDueDays: 10,
  advancePaymentDiscount: 5,
  penaltyEnabled: true,
  
  // Configurações de Comunicação
  enableEmailNotifications: true,
  enableSMSNotifications: false,
  autoPaymentReminders: true,
  reminderDaysBefore: 5,
  overdueNotificationDays: 3,
  
  // Configurações do Sistema
  systemLanguage: "pt-MZ",
  timezone: "Africa/Maputo",
  dateFormat: "DD/MM/YYYY",
  theme: "light",
  enableAttendanceTracking: true,
  enableGradeSystem: true,
  enableReports: true,
  
  // Configurações de Segurança
  sessionTimeout: 60,
  passwordMinLength: 8,
  requirePasswordChange: false,
  passwordChangeInterval: 90,
  enableTwoFactor: false,
  
  // Configurações de Backup
  autoBackupEnabled: true,
  backupFrequency: "daily",
  backupRetention: 30,

  // Configurações de Inscrição
  inscriptionIsPaid: false, // Por defeito, inscrição é gratuita
  inscriptionFee: 0, // Taxa zero quando gratuita
};

export function useSettingsData() {
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Função para carregar settings do localStorage
  const loadSettingsFromStorage = () => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  // Carregar configurações do localStorage na inicialização
  useEffect(() => {
    loadSettingsFromStorage();
    setIsLoading(false);
  }, []);

  // Escutar por mudanças de settings de outros componentes
  useEffect(() => {
    const handleSettingsChange = () => {
      loadSettingsFromStorage();
    };

    // Escutar evento customizado para sincronização entre componentes
    window.addEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);

    // Escutar storage event para sincronização entre abas
    window.addEventListener('storage', (e) => {
      if (e.key === SETTINGS_STORAGE_KEY) {
        loadSettingsFromStorage();
      }
    });

    return () => {
      window.removeEventListener(SETTINGS_CHANGE_EVENT, handleSettingsChange);
    };
  }, []);

  // Salvar configurações
  const saveSettings = (newSettings: GeneralSettings): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        setSettings(newSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));

        // Disparar evento customizado para sincronizar outros componentes
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));

        // Simular um delay de salvamento para feedback visual
        setTimeout(() => {
          console.log('Configurações salvas com sucesso:', newSettings);
          resolve(true);
        }, 500);
      } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        resolve(false);
      }
    });
  };

  // Resetar configurações para valores padrão
  const resetSettings = (): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        setSettings(defaultSettings);
        localStorage.removeItem(SETTINGS_STORAGE_KEY);

        // Disparar evento customizado para sincronizar outros componentes
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));

        setTimeout(() => {
          console.log('Configurações resetadas para valores padrão');
          resolve(true);
        }, 300);
      } catch (error) {
        console.error('Erro ao resetar configurações:', error);
        resolve(false);
      }
    });
  };

  // Atualizar configurações específicas
  const updateSetting = <K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K]
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const updatedSettings = { ...settings, [key]: value };
        setSettings(updatedSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));

        // Disparar evento customizado para sincronizar outros componentes
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));

        setTimeout(() => {
          console.log(`Configuração ${key} atualizada:`, value);
          resolve(true);
        }, 200);
      } catch (error) {
        console.error('Erro ao atualizar configuração:', error);
        resolve(false);
      }
    });
  };

  // Exportar configurações
  const exportSettings = (): string => {
    return JSON.stringify(settings, null, 2);
  };

  // Importar configurações
  const importSettings = (settingsJson: string): Promise<boolean> => {
    return new Promise((resolve) => {
      try {
        const importedSettings = JSON.parse(settingsJson);
        const mergedSettings = { ...defaultSettings, ...importedSettings };

        setSettings(mergedSettings);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(mergedSettings));

        // Disparar evento customizado para sincronizar outros componentes
        window.dispatchEvent(new CustomEvent(SETTINGS_CHANGE_EVENT));

        setTimeout(() => {
          console.log('Configurações importadas com sucesso');
          resolve(true);
        }, 500);
      } catch (error) {
        console.error('Erro ao importar configurações:', error);
        resolve(false);
      }
    });
  };

  // Validar configurações
  const validateSettings = (settingsToValidate: Partial<GeneralSettings>): string[] => {
    const errors: string[] = [];

    // Validações de campos obrigatórios
    if (!settingsToValidate.institutionName?.trim()) {
      errors.push('Nome da instituição é obrigatório');
    }

    if (!settingsToValidate.institutionEmail?.trim()) {
      errors.push('Email da instituição é obrigatório');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settingsToValidate.institutionEmail)) {
      errors.push('Email da instituição deve ter formato válido');
    }

    if (!settingsToValidate.institutionPhone?.trim()) {
      errors.push('Telefone da instituição é obrigatório');
    }

    // Validações de valores numéricos
    if (settingsToValidate.maxStudentsPerClass !== undefined) {
      if (settingsToValidate.maxStudentsPerClass < 1 || settingsToValidate.maxStudentsPerClass > 50) {
        errors.push('Máximo de estudantes por turma deve estar entre 1 e 50');
      }
    }

    if (settingsToValidate.minStudentsPerClass !== undefined) {
      if (settingsToValidate.minStudentsPerClass < 1 || settingsToValidate.minStudentsPerClass > 20) {
        errors.push('Mínimo de estudantes por turma deve estar entre 1 e 20');
      }
    }

    if (settingsToValidate.maxStudentsPerClass !== undefined && 
        settingsToValidate.minStudentsPerClass !== undefined) {
      if (settingsToValidate.minStudentsPerClass >= settingsToValidate.maxStudentsPerClass) {
        errors.push('Mínimo de estudantes deve ser menor que o máximo');
      }
    }

    if (settingsToValidate.defaultMonthlyFee !== undefined && settingsToValidate.defaultMonthlyFee <= 0) {
      errors.push('Mensalidade padrão deve ser maior que zero');
    }

    if (settingsToValidate.passwordMinLength !== undefined) {
      if (settingsToValidate.passwordMinLength < 6 || settingsToValidate.passwordMinLength > 20) {
        errors.push('Comprimento mínimo da senha deve estar entre 6 e 20 caracteres');
      }
    }

    // Validações de datas
    if (settingsToValidate.semesterStart && settingsToValidate.semesterEnd) {
      if (new Date(settingsToValidate.semesterStart) >= new Date(settingsToValidate.semesterEnd)) {
        errors.push('Data de início do semestre deve ser anterior ao fim');
      }
    }

    return errors;
  };

  // Obter formatador de moeda baseado nas configurações
  const getCurrencyFormatter = () => {
    return new Intl.NumberFormat('pt-MZ', {
      style: 'currency',
      currency: 'MZN'
    });
  };

  // Obter formatador de data baseado nas configurações
  const getDateFormatter = () => {
    const locale = settings.systemLanguage === 'en-US' ? 'en-US' : 'pt-BR';
    return new Intl.DateTimeFormat(locale, {
      timeZone: settings.timezone
    });
  };

  return {
    // Estado
    settings,
    isLoading,
    
    // Ações principais
    saveSettings,
    resetSettings,
    updateSetting,
    
    // Utilitários
    exportSettings,
    importSettings,
    validateSettings,
    getCurrencyFormatter,
    getDateFormatter,
    
    // Configurações padrão para referência
    defaultSettings
  };
}