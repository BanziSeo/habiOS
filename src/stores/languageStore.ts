import { create } from 'zustand';
import i18n from '../i18n';

interface LanguageStore {
  language: 'en' | 'ko';
  setLanguage: (lang: 'en' | 'ko') => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: (localStorage.getItem('language') as 'en' | 'ko') || 'ko',
  
  setLanguage: (lang) => {
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    set({ language: lang });
  },
  
  initializeLanguage: () => {
    const savedLang = (localStorage.getItem('language') as 'en' | 'ko') || 'ko';
    i18n.changeLanguage(savedLang);
    set({ language: savedLang });
  }
}));