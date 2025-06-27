import App from './App.vue'

// ========== 引入路由相关 ==========
import { createRouter, createWebHistory } from 'vue-router'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'

// ========== 生成路由，启用 layout 插件 ==========
const routes = setupLayouts(generatedRoutes)
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ========== 引入 PrimeVue ==========
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Aura from '@primeuix/themes/aura'
import Toast from 'primevue/toast'

// ========== 创建 App ==========
const app = createApp(App)

app.use(ToastService)
app.use(ConfirmationService)
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
})
app.use(router)
app.component('Toast', Toast)

app.mount('#app')
