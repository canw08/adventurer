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
      <!-- Acknowledgements -->
      <section class="block">
        <h3 class="block-title">
          List of Acknowledgements ：
          <button class="linklike" @click="ackOpen = !ackOpen">
            {{ ackOpen ? 'Collapse' : 'Unfold' }}
          </button>
        </h3>

        <transition name="fade">
          <ul v-if="ackOpen" class="ack-list">
            <li v-for="name in ackNames" :key="name">{{ name }}</li>
          </ul>
        </transition>
      </section>

      <!-- 右下角 Sign out -->
      <button class="signout-btn" @click="onSignOut">
        {{ $t('settings.signOut') || 'Sign out' }}
      </button>

      <!-- 左下角署名 -->
      <div class="footer-note">
        王灿，张皓阳，周心阳，鲍语暄，代若辰 with love
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
import { setLocale } from '../../i18n/index.js'   // 👈 引入你写的 setLocale 方法
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
const userStore = useUserStore();
const router = useRouter();
const { locale, t } = useI18n()

// 在这里扩展语言即可
const languages = ref([
  { code: 'en', label: 'English' },
  { code: 'zh-CN', label: '中文' },
  { code: 'flip-en', label: 'ɥsᴉlƃuƎ dᴉlℲ' },
  // { code: 'jp', label: '日本語' } // 扩展示例
])

const changeLang = async (code) => {
  await setLocale(code)    // 👈 调用封装好的方法
}

const ackOpen = ref(false)
const ackNames = [
  '王天瑞Eric'
]

const onSignOut = () => {
  // TODO: 接入你的登出逻辑

  userStore.clearUser()
  router.push('/');
  console.log('Sign out clicked')
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
.header-left-group { display: flex; align-items: center; gap: 16px; }
.header-left { font-size: 28px; font-weight: 800; color: #1e1e1e; }

.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: auto;
  background-color: #f3f7fe;   /* 浅蓝 */
  border: 1px solid #e4eaf4;
  margin-top: 30px;
  padding: 24px;
}

/* ===== 页面块样式（简洁） ===== */
.block { margin-bottom: 28px; }
.block-title { font-size: 18px; font-weight: 700; margin: 0 0 12px; color: #111827; }

/* 语言胶囊按钮 */
.lang-toggle { display: inline-flex; gap: 8px; }
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

/* Acknowledgements */
.linklike {
  background: transparent;
  border: none;
  color: #4f60c6;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.ack-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 8px 16px;
  margin: 12px 0 0;
  padding: 0;
  list-style: none;
  color: #1f2937;
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
  box-shadow: 0 6px 16px rgba(42,44,85,0.25);
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

/* 小过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity .16s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
