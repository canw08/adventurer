import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'

const routesWithLayouts = setupLayouts(routes)

const router = createRouter({
  history: createWebHistory(),
  routes: routesWithLayouts,
})

// —— 移动端检测函数 ——
// 兼容性：先用 UA，兜底再用视口宽度（可按需调整阈值）
function isMobileDevice() {
  const ua = navigator.userAgent
  const byUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  const byViewport = window.matchMedia?.('(max-width: 820px)').matches || window.innerWidth <= 820
  return byUA || byViewport
}

// 如果只想在“第一次进入站点时”拦截一次，可用 sessionStorage
const SEEN_FLAG = 'mobile_notice_seen'

router.beforeEach((to, from, next) => {
  const isMobile = isMobileDevice()

  // 允许进入的情况：
  // 1) 已经在提示页（避免循环）
  // 2) 路由显式允许手机访问：meta.allowMobile === true
  // 3)（可选）本会话已看过提示页
  const allowMobile = to.meta?.allowMobile === true
  const seen = sessionStorage.getItem(SEEN_FLAG) === '1'

  if (isMobile && to.path !== '/mobile-notice' && !allowMobile) {
    next('/mobile-notice')
  } else {
    next()
  }
})

export default router
