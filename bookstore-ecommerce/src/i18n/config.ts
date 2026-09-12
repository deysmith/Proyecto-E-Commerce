import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { es } from "./lang/es"

export default i18n
  .use(initReactI18next)
  .init({
    resources: {
      es
    },
    lng: "es",
    fallbackLng: "es",
    interpolation: {
      escapeValue: false
    }
  })