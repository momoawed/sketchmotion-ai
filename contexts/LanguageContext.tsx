import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import { translations, TranslationKey } from '../translations';

export type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLang = localStorage.getItem('language');
      return (savedLang as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.lang = language;
    root.dir = language === 'ar' ? 'rtl' : 'ltr';

    try {
      localStorage.setItem('language', language);
    } catch (e) {
      console.error("Failed to save language to localStorage", e);
    }
  }, [language]);

  const t = useCallback((key: TranslationKey, fallback?: string): string => {
    return translations[language][key] || fallback || key;
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};