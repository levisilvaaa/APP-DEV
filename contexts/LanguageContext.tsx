import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';

type Language = 'pt' | 'en';

interface Translations {
  [key: string]: {
    pt: string;
    en: string;
  };
}

const translations: Translations = {
  home: { pt: 'Início', en: 'Home' },
  shop: { pt: 'Loja', en: 'Shop' },
  guides: { pt: 'Guias', en: 'Guides' },
  progress: { pt: 'Progresso', en: 'Progress' },
  settings: { pt: 'Configurações', en: 'Settings' },
  login: { pt: 'Entrar', en: 'Login' },
  register: { pt: 'Registrar', en: 'Register' },
  email: { pt: 'Email', en: 'Email' },
  password: { pt: 'Senha', en: 'Password' },
  dailyCheckIn: { pt: 'Check-in Diário', en: 'Daily Check-in' },
  markComplete: { pt: 'Marcar como Completo', en: 'Mark as Complete' },
  capsules: { pt: 'cápsulas', en: 'capsules' },
  monthlyProgress: { pt: 'Progresso Mensal', en: 'Monthly Progress' },
  daysCompleted: { pt: 'Dias Concluídos', en: 'Days Completed' },
  currentStreak: { pt: 'Sequência Atual', en: 'Current Streak' },
  averagePerDay: { pt: 'Média por Dia', en: 'Average per Day' },
  consistency: { pt: 'Consistência', en: 'Consistency' },
  dosageInfo: { pt: 'Informações de Dosagem', en: 'Dosage Information' },
  about: { pt: 'Sobre', en: 'About' },
  logout: { pt: 'Sair', en: 'Logout' },
  theme: { pt: 'Tema', en: 'Theme' },
  language: { pt: 'Idioma', en: 'Language' },
  notifications: { pt: 'Notificações', en: 'Notifications' },
  helpSupport: { pt: 'Ajuda e Suporte', en: 'Help & Support' },
  account: { pt: 'Conta', en: 'Account' },
  buyNow: { pt: 'Comprar Agora', en: 'Buy Now' },
  bestValue: { pt: 'MELHOR VALOR', en: 'BEST VALUE' },
  perBottle: { pt: 'por frasco', en: 'per bottle' },
  totalSavings: { pt: 'Economia total', en: 'Total savings' },
  freeShipping: { pt: 'Frete Grátis', en: 'Free Shipping' },
  moneyBackGuarantee: { pt: 'Garantia de Devolução', en: 'Money Back Guarantee' },
  securePayment: { pt: 'Pagamento Seguro', en: 'Secure Payment' },
  support24_7: { pt: 'Suporte 24/7', en: '24/7 Support' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getDeviceLanguage(): Language {
  const deviceLocale = Localization.getLocales()[0]?.languageCode;

  if (deviceLocale === 'pt' || deviceLocale === 'en') {
    return deviceLocale;
  }

  return 'en';
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(getDeviceLanguage());

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
