<template>
  <div class="main-content">
    <!-- 顶部标题栏 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">{{ $t('settings.title') }}</span>
      </div>
    </div>

    <!-- 主体卡片（浅蓝背景） -->
    <div class="main-body">
      <!-- Language -->
      <section class="block">
        <h3 class="block-title">Language</h3>
        <div class="lang-toggle" role="tablist">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="pill"
            :class="{ active: locale === lang.code }"
            @click="changeLang(lang.code)"
          >
            {{ lang.label }}
          </button>
        </div>
      </section>

      <!-- 快捷方式 -->
      <section class="block">
        <h3 class="block-title">快捷方式</h3>
        <button
          class="icon-btn"
          :class="{ 'has-dot': showShortcutDot }"
          @click="onSaveShortcut"
          aria-label="保存快捷方式至桌面"
        >
          <i class="pi pi-download"></i>
          <span>保存快捷方式至桌面</span>
        </button>
      </section>

      <!-- Acknowledgements（改为按钮跳转到 animations/endroll） -->
      <section class="block">
        <h3 class="block-title">List of Acknowledgements</h3>
        <button
          class="icon-btn"
          @click="goAcknowledgements"
          aria-label="跳转到致谢页面"
        >
          <i class="pi pi-external-link"></i>
          <span>查看致谢名单</span>
        </button>
      </section>

      <!-- 右下角 Sign out -->
      <button class="signout-btn" @click="onSignOut">
        {{ $t('settings.signOut') || 'Sign out' }}
      </button>

      <!-- 左下角署名 -->
      <div class="footer-note">
        王灿，张皓阳，周心阳，鲍语暄，代若辰，刘天运 with love
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
  requiresAuth: true
  roles: ['student']
</route>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { setLocale } from '../../i18n/index.js' // 👈 引入你写的 setLocale 方法
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const router = useRouter()
const { locale } = useI18n()

const SHORTCUT_DOT_KEY = 'settings.shortcutDotDismissed' // 记忆小红点是否已消失
const showShortcutDot = ref(localStorage.getItem(SHORTCUT_DOT_KEY) !== '1')

// 在这里扩展语言即可
const languages = ref([
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'flip-en', label: 'ɥsᴉlƃuƎ dᴉlℲ' },
  // { code: 'jp', label: '日本語' } // 扩展示例
])

const changeLang = async (code) => {
  await setLocale(code) // 👈 调用封装好的方法
}

const onSignOut = () => {
  // TODO: 接入你的登出逻辑
  localStorage.setItem('access_token', '')
  localStorage.setItem('refresh_token', '')
  userStore.clearUser()
  router.push('/')
  console.log('Sign out clicked')
}

const onSaveShortcut = () => {
  sessionStorage.setItem('visitedFromHomeIcon', '1')
  router.push('/help/addToHome')
  showShortcutDot.value = false
  localStorage.setItem(SHORTCUT_DOT_KEY, '1')
}

// ✅ 跳转到另一个文件：animations/endroll
// 如果你项目是文件路由（例如 pages/animations/endroll.vue），一般对应路径就是 /animations/endroll
const goAcknowledgements = () => {
  router.push('/animations/endroll')
}
</script>

<style scoped>
/* ===== 保留原布局与配色 ===== */
.main-content {
  flex: 1;
  padding: 4px 48px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: #ffffff;
  border-radius: 12px;
}

.main-header {
  display: flex;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding: 4px 0;
  height: 64px;
}
.header-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-left {
  font-size: 28px;
  font-weight: 800;
  color: #1e1e1e;
}

.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: auto;
  background-color: #f3f7fe; /* 浅蓝 */
  border: 1px solid #e4eaf4;
  margin-top: 30px;
  padding: 24px;
}

/* ===== 页面块样式（简洁） ===== */
.block {
  margin-bottom: 28px;
}
.block-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px;
  color: #111827;
}

/* 语言胶囊按钮 */
.lang-toggle {
  display: inline-flex;
  gap: 8px;
}
.pill {
  min-width: 84px;
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #d9ddea;
  background: #ffffff;
  color: #111827;
  font-weight: 600;
  cursor: pointer;
}
.pill.active {
  background: #2a2c55;
  color: #fff;
  border-color: #2a2c55;
}

/* 右下角按钮 */
.signout-btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
  height: 44px;
  padding: 0 42px;
  border-radius: 12px;
  border: none;
  background: #2a2c55;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(42, 44, 85, 0.25);
  cursor: pointer;
}

/* 左下角说明文字 */
.footer-note {
  position: absolute;
  left: 24px;
  bottom: 24px;
  color: #a3a3a3;
  font-size: 14px;
}

/* 图标按钮（与页面风格一致的主按钮样式） */
.icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 14px 0 12px;
  border-radius: 12px;
  border: 1px solid #d9ddea;
  background: #ffffff;
  color: #111827;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: transform 0.08s ease, box-shadow 0.12s ease, border-color 0.12s ease;
}
.icon-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(42, 44, 85, 0.12);
  border-color: #cfd6ea;
}
.icon-btn:active {
  transform: translateY(0);
  box-shadow: 0 3px 10px rgba(42, 44, 85, 0.12);
}

/* 小红点（仅在 has-dot 时出现） */
.icon-btn.has-dot::after {
  content: '';
  position: absolute;
  top: -3px;
  right: -3px;
  width: 10px;
  height: 10px;
  background: #ff3b30; /* 清晰的红色 */
  border-radius: 999px;
  box-shadow: 0 0 0 2px #ffffff; /* 形成白色描边，适配浅底 */
}

/* 让图标与文字的视觉对齐更舒适 */
.icon-btn .pi {
  font-size: 16px;
}
.icon-btn span {
  font-size: 14px;
  font-weight: 700;
}
</style>