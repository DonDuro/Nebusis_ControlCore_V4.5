import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// Language codes
export type Language = 'en' | 'es';

// Translation keys type
export type TranslationKey = string;

// Translation interface
export interface Translations {
  [key: string]: string | Translations;
}

// Language context
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, variables?: Record<string, string>) => string;
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

// Translation function
export function interpolate(text: string, variables?: Record<string, string>): string {
  if (!variables) return text;
  
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] || match;
  });
}

// Get nested translation value
export function getNestedValue(obj: Translations, key: string): string {
  const keys = key.split('.');
  let value: any = obj;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Hook to use language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for translations
export function useTranslation() {
  const { t } = useLanguage();
  return { t };
}