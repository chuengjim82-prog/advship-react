import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './zh-CN'
import enUS from './en-US'

const DEFAULT_LOCALE = 'zh-CN'
const LOCALE_STORAGE_KEY = 'locale'

const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) || DEFAULT_LOCALE

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'en-US': { translation: enUS }
    },
    lng: savedLocale,
    fallbackLng: DEFAULT_LOCALE,
    interpolation: {
      escapeValue: false
    }
  })

// 监听语言变化并持久化
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LOCALE_STORAGE_KEY, lng)
})

export default i18n
