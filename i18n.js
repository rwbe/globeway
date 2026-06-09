import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importações para inglês
import enAbout from './src/locales/en/about.json';
import enCommon from './src/locales/en/common.json';
import enCountryNames from './src/locales/en/countryNames.json';
import enDetails from './src/locales/en/details.json';
import enFeedback from './src/locales/en/feedback.json';
import enFooter from './src/locales/en/footer.json';
import enHome from './src/locales/en/home.json';
import enNavbar from './src/locales/en/navbar.json';
import enTranslationsTooltip from './src/locales/en/translationsTooltip.json';

// Importações para português
import ptAbout from './src/locales/pt/about.json';
import ptCommon from './src/locales/pt/common.json';
import ptCountryNames from './src/locales/pt/countryNames.json';
import ptDetails from './src/locales/pt/details.json';
import ptFeedback from './src/locales/pt/feedback.json';
import ptFooter from './src/locales/pt/footer.json';
import ptHome from './src/locales/pt/home.json';
import ptNavbar from './src/locales/pt/navbar.json';
import ptTranslationsTooltip from './src/locales/pt/translationsTooltip.json';

// Importações para espanhol
import esAbout from './src/locales/es/about.json';
import esCommon from './src/locales/es/common.json';
import esCountryNames from './src/locales/es/countryNames.json';
import esDetails from './src/locales/es/details.json';
import esFeedback from './src/locales/es/feedback.json';
import esFooter from './src/locales/es/footer.json';
import esHome from './src/locales/es/home.json';
import esNavbar from './src/locales/es/navbar.json';
import esTranslationsTooltip from './src/locales/es/translationsTooltip.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      navbar: enNavbar,
      home: enHome,
      details: enDetails,
      about: enAbout,
      feedback: enFeedback,
      countryNames: enCountryNames,
      translationsTooltip: enTranslationsTooltip,
      footer: enFooter,
    },
    pt: {
      common: ptCommon,
      navbar: ptNavbar,
      home: ptHome,
      details: ptDetails,
      about: ptAbout,
      feedback: ptFeedback,
      countryNames: ptCountryNames,
      translationsTooltip: ptTranslationsTooltip,
      footer: ptFooter,
    },
    es: {
      common: esCommon,
      navbar: esNavbar,
      home: esHome,
      details: esDetails,
      about: esAbout,
      feedback: esFeedback,
      countryNames: esCountryNames,
      translationsTooltip: esTranslationsTooltip,
      footer: esFooter,
    },
  },
  lng: 'pt',
  fallbackLng: 'pt',
  ns: [
    'common',
    'navbar',
    'home',
    'details',
    'about',
    'feedback',
    'countryNames',
    'translationsTooltip',
    'footer',
  ], // Namespaces
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
