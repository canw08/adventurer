import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages' // vite-plugin-pages 生成的路由
import { setupLayouts } from 'virtual:generated-layouts' // vite-plugin-vue-layouts 提供

const routesWithLayouts = setupLayouts(routes)

const router = createRouter({
  history: createWebHistory(),
  routes: routesWithLayouts,
})

export default router
