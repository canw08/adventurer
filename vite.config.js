import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';

export default defineConfig({
  plugins: [
    vue(),
    Pages(), // 自动路由插件
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
})