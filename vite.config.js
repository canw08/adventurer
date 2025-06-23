import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'

export default defineConfig({
  plugins: [
    vue(),
    Pages(), // 自动基于 pages 目录生成路由
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ]
})