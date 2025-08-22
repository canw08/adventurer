import { createI18n } from 'vue-i18n'

const STORAGE_KEY = 'app-locale'

// 1. 检测默认语言
function detectLocale() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) return saved
  const nav = navigator.language || 'en'
  if (nav.startsWith('zh')) return 'zh-CN'
  return 'en'
}

const defaultLocale = detectLocale()

// 2. 使用 import.meta.glob 收集所有语言文件（不会立即加载）
const messageFiles = import.meta.glob('./messages/*.json')

// 3. 异步加载语言文件
async function loadMessages(locale) {
  const path = `./messages/${locale}.json`
  if (!messageFiles[path]) {
    console.error(`[i18n] No language file found for: ${locale}`)
    return {}
  }
  const mod = await messageFiles[path]() // 动态加载
  return mod.default
}

// 持有 i18n 引用，供 setLocale 使用
let i18nInstance = null

// 4. 初始化 i18n（在应用启动时调用）
export async function initI18n() {
  const [defaultMessages, enMessages] = await Promise.all([
    loadMessages(defaultLocale),
    loadMessages('en'),
  ])

  i18nInstance = createI18n({
    legacy: false,
    locale: defaultLocale,
    fallbackLocale: 'en',
    messages: {
      [defaultLocale]: defaultMessages,
      en: enMessages,
    },
  })

  // 可选：同步 html lang
  document.documentElement.setAttribute('lang', defaultLocale)

  return i18nInstance
}

// 5. 切换语言方法
export async function setLocale(locale) {
  if (!i18nInstance) throw new Error('[i18n] call initI18n() first')
  if (i18nInstance.global.locale.value === locale) return

  const msgs = await loadMessages(locale)
  i18nInstance.global.setLocaleMessage(locale, msgs)
  i18nInstance.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)
}

// （可选）需要时导出当前实例
export function getI18n() {
  return i18nInstance
}
