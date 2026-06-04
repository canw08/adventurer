import { createRouter, createWebHistory } from 'vue-router'
import routes from '~pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { useUserStore } from '../src/stores/user.js'

const routesWithLayouts = setupLayouts(routes)

const router = createRouter({
  history: createWebHistory(),
  routes: routesWithLayouts,
})

// —— 移动端检测（JS） ——
function isMobileDevice() {
  const ua = navigator.userAgent
  const byUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
  //const byViewport = (window.matchMedia && window.matchMedia('(max-width: 820px)').matches) || window.innerWidth <= 820
  return byUA
}
const SEEN_FLAG = 'mobile_notice_seen'

// —— 角色检查（JS） ——
function hasRoleAccess(to, role) {
  const needAuth = to.meta && to.meta.requiresAuth === true
  const allowRoles = to.meta && to.meta.roles

  if (!needAuth) return true
  if (!role) return false
  if (!Array.isArray(allowRoles) || allowRoles.length === 0) return true
  return allowRoles.includes(role)
}

// —— 路由前置守卫（返回式写法） ——
router.beforeEach(async (to) => {
  // 1) 移动端拦截
  const isMobile = isMobileDevice()
  const allowMobile = to.meta && to.meta.allowMobile === true
  const seen = sessionStorage.getItem(SEEN_FLAG) === '1'
  if (isMobile && to.path !== '/mobile-notice' && !allowMobile && !seen) {
    return { path: '/mobile-notice', query: { redirect: to.fullPath } }
  }

  // 2) 需要鉴权才拉用户
  const needAuth = to.meta && to.meta.requiresAuth === true
  const userStore = useUserStore()

  if (needAuth && !userStore.userInfo) {
    try {
      await userStore.fetchUser()
    } catch (e) {
      return { path: '/', query: { redirect: to.fullPath } }
    }
  }

  const role = userStore.userInfo && userStore.userInfo.role

  if (!hasRoleAccess(to, role)) {
    if (!role) {
      return { path: '/', query: { redirect: to.fullPath } }
    }
    // 已登录但没权限：按角色分流或 403
    if (role === 'teacher') return { path: '/teacher/home' }
    if (role === 'student') return { path: '/student/home' }
    if (role === 'admin') return { path: '/admin/email' }
    return { path: '/403' }
  }

  return true
})

export default router
