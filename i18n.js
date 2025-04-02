import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importações para inglês
import enCommon from './src/locales/en/common.json';
import enNavbar from './src/locales/en/navbar.json';
import enHome from './src/locales/en/home.json';
import enDetails from './src/locales/en/details.json';
import enAbout from './src/locales/en/about.json';
import enFeedback from './src/locales/en/feedback.json';
import enCountryNames from './src/locales/en/countryNames.json';
import enTranslationsTooltip from './src/locales/en/translationsTooltip.json';
import enFooter from './src/locales/en/footer.json';

// Importações para português
import ptCommon from './src/locales/pt/common.json';
import ptNavbar from './src/locales/pt/navbar.json';
import ptHome from './src/locales/pt/home.json';
import ptDetails from './src/locales/pt/details.json';
import ptAbout from './src/locales/pt/about.json';
import ptFeedback from './src/locales/pt/feedback.json';
import ptCountryNames from './src/locales/pt/countryNames.json';
import ptTranslationsTooltip from './src/locales/pt/translationsTooltip.json';
import ptFooter from './src/locales/pt/footer.json';

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
  },
  lng: 'pt',
  fallbackLng: 'pt', 
  ns: ['common', 'navbar', 'home', 'details', 'about', 'feedback', 'countryNames', 'translationsTooltip', 'footer'], // Namespaces
  defaultNS: 'common', 
  interpolation: {
    escapeValue: false, 
  },
});

export default i18n;