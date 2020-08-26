import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import resources from '../locales/translation.json';
// the translations
// (tip move them in a JSON file and import them)
/*const resources = {
  en: {
    translation: {
      "cadre": "All cadres",
      "facility":"All facilities",
      "treatment":"All service treatments"
    }
  },
  fr: {
    translation: {
      "cadre": "Catégories",
      "facility":"Structure",
      "treatment":"Activités de service"
    }
  }
};*/

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: localStorage.getItem("language"),

    keySeparator: false, // we do not use keys in form messages.welcome

    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

  export default i18n;