import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 파일들을 직접 import
import enCommon from '../locales/en/common.json';
import enJournal from '../locales/en/journal.json';
import enAnalysis from '../locales/en/analysis.json';
import enSettings from '../locales/en/settings.json';
import enWidgets from '../locales/en/widgets.json';
import enChartbook from '../locales/en/chartbook.json';
import enEquityCurve from '../locales/en/equityCurve.json';
import enMessages from '../locales/en/messages.json';
import enCsvImport from '../locales/en/csvImport.json';

import koCommon from '../locales/ko/common.json';
import koJournal from '../locales/ko/journal.json';
import koAnalysis from '../locales/ko/analysis.json';
import koSettings from '../locales/ko/settings.json';
import koWidgets from '../locales/ko/widgets.json';
import koChartbook from '../locales/ko/chartbook.json';
import koEquityCurve from '../locales/ko/equityCurve.json';
import koMessages from '../locales/ko/messages.json';
import koCsvImport from '../locales/ko/csvImport.json';

// i18n 초기화 - 동기적으로 실행
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: enCommon,
        journal: enJournal,
        analysis: enAnalysis,
        settings: enSettings,
        widgets: enWidgets,
        chartbook: enChartbook,
        equityCurve: enEquityCurve,
        messages: enMessages,
        csvImport: enCsvImport,
      },
      ko: {
        common: koCommon,
        journal: koJournal,
        analysis: koAnalysis,
        settings: koSettings,
        widgets: koWidgets,
        chartbook: koChartbook,
        equityCurve: koEquityCurve,
        messages: koMessages,
        csvImport: koCsvImport,
      }
    },
    lng: localStorage.getItem('language') || 'ko',
    fallbackLng: 'en',
    ns: ['common', 'journal', 'analysis', 'settings', 'widgets', 'chartbook', 'equityCurve', 'messages', 'csvImport'],
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    
    interpolation: {
      escapeValue: false // React already escapes values
    },
    
    react: {
      useSuspense: false
    }
  });

export default i18n;