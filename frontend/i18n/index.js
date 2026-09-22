// frontend/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      dashboard: { title: 'Financial Dashboard', income: 'Income', expenses: 'Expenses' },
      common: { save: 'Save', cancel: 'Cancel' }
    }
  },
  es: {
    translation: {
      dashboard: { title: 'Panel Financiero', income: 'Ingresos', expenses: 'Gastos' }
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
});

export default i18n;