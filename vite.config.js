import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';


export default defineConfig({
  plugins: [
    vue(),

    // 自动扫描 src/pages 下所有页面作为路由
    Pages({
      dirs: 'src/pages',
      extensions: ['vue'],
    }),

    // 自动识别 src/layouts 下的 layout
    Layouts({
      layoutsDirs: 'src/layouts',
      defaultLayout: 'default'
    }),

    // 自动导入 PrimeVue 组件
    Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ]
})