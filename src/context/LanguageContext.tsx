import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (uz: string, ru: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('ru');

  const t = (uz: string, ru: string, en: string): string => {
    switch (lang) {
      case 'uz': return uz;
      case 'en': return en;
      default: return ru;
    }
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
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
