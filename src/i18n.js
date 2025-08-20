// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { userAppLocalConfig, setUserAppLocalConfig, getUserAppLocalConfig, action, Types } from './utils/helper'

import enTranslation from './translations/en.json';
import frTranslation from './translations/fr.json';
// import configureStore from './store/configureStore';
// const store = configureStore();

const localSettings = await getUserAppLocalConfig()

// Get the default language from Redux store
// const getDefaultLanguage = () => {
//   const state = store.getState();
//   const { language } = state.app.user_profile;
//   return language || 'en'; // Return the language from Redux store, defaulting to English ('en') if not set
// };

// Initialize i18n with the default language
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      fr: {
        translation: frTranslation,
      },
    },
    lng: localSettings?.language || 'en', // Set default language based on Redux store
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
