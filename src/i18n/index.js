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
  const module = await messageFiles[path]() // 执行函数 → 动态加载
  return module.default
}

// 4. 初始化 i18n（先加载默认语言）
const defaultMessages = await loadMessages(defaultLocale)
const enMessages = await loadMessages('en')
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 风格
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    [defaultLocale]: defaultMessages,
    en: enMessages
  }
})

// 5. 切换语言方法
export async function setLocale(locale) {
  if (i18n.global.locale.value === locale) return
  const msgs = await loadMessages(locale)
  i18n.global.setLocaleMessage(locale, msgs)
  i18n.global.locale.value = locale
  localStorage.setItem(STORAGE_KEY, locale)
  document.documentElement.setAttribute('lang', locale)
}
