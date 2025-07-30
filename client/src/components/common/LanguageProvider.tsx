import React, { useState, useEffect, ReactNode } from 'react';
import { LanguageContext, type Language, getNestedValue, interpolate } from '@/i18n';
import { translations } from '@/i18n/translations/index';

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to English
    const stored = localStorage.getItem('controlcore-language');
    return (stored as Language) || 'en';
  });

  // Translation function
  const t = (key: string, variables?: Record<string, string>): string => {
    const translation = getNestedValue(translations[language], key);
    return interpolate(translation, variables);
  };

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('controlcore-language', lang);
  };

  // Set document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}