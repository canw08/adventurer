import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Toast from 'primevue/toast'
import Aura from '@primeuix/themes/aura'
import Ripple from 'primevue/ripple'
import { createPinia } from 'pinia'
import ConfirmationService from 'primevue/confirmationservice'
import './assets/main.css'

// 注意：这里改成引入 initI18n，而不是直接 i18n
import { initI18n } from './i18n'

async function bootstrap() {
  const pinia = createPinia()
  const app = createApp(App)

  app.use(ToastService)
  app.use(PrimeVue, { theme: { preset: Aura } })
  app.use(ConfirmationService)
  app.use(router)

  app.component('Toast', Toast)
  app.directive('ripple', Ripple)

  app.use(pinia)

  // ⬇️ 等待 i18n 初始化
  const i18n = await initI18n()
  app.use(i18n)

  app.mount('#app')
}

bootstrap()
