import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from '@primevue/auto-import-resolver'
import Layouts from 'vite-plugin-vue-layouts'

export default defineConfig({
  plugins: [
    vue(),
    Pages(), // 自动基于 pages 目录生成路由
    Layouts({
      layoutsDirs: 'src/layouts', // 指定布局文件的目录路径
      defaultLayout: 'default' // 指定默认布局文件的名称
    }),
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ]
})