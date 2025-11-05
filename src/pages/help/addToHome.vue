<template>
  <div class="a2hs">
    <header class="a2hs-header">
      <img class="app-icon" :src="appIcon" alt="App Icon" />
      <h1 class="title">如何添加到主屏幕</h1>
      <p class="subtitle">Follow these steps to save this app to your iPad Home Screen</p>
    </header>

    <main class="steps">
      <section class="step">
        <h2 class="step-title">1. 点击「分享」图标</h2>
        <div class="img-wrap">
          <img :src="step1" alt="Step 1" />
        </div>
      </section>

      <section class="step">
        <h2 class="step-title">2. 选择「添加到主屏幕」</h2>
        <div class="img-wrap">
          <img :src="step2" alt="Step 2" />
        </div>
      </section>

      <div class="actions">
        <button class="primary" @click="goHome">先去主页看看</button>
      </div>
    </main>

    <footer class="tip">
      <p>提示：从主屏幕图标进入时，本页面将自动跳转到主界面。</p>
    </footer>
  </div>
</template>

<route lang="yaml">
meta:
  layout: ""
  requiresAuth: false
</route>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ↓ 换成你自己的资源路径
const step1 = new URL('../../../public/image/addHome1.jpg', import.meta.url).href
const step2 = new URL('../../../public/image/addHome2.png', import.meta.url).href
// 可选：应用图标（显示在页眉）
const appIcon = new URL('../../assets/tiper.png', import.meta.url).href

// 判断是否从“主屏幕图标 / PWA”进入
const isStandalone = () => {
  return (window.matchMedia?.('(display-mode: standalone)').matches) ||
         ('standalone' in navigator && navigator.standalone)
}
// 判断是否为“桌面启动”
const checkShouldRedirect = () => {
  // 若当前 session 里还没存标记 => 是桌面启动（新 session）
  const hasFlag = sessionStorage.getItem('visitedFromHomeIcon')
  if (!hasFlag && (isStandalone() || true)) {
    // 第一次进入主屏幕/独立窗口 => 标记 & 跳主界面
    sessionStorage.setItem('visitedFromHomeIcon', '1')
    router.replace('/')
  }
}

onMounted(() => {
  checkShouldRedirect()
})

const goHome = () => router.push('/')
</script>

<style scoped>
.a2hs {
  min-height: 100%;
  background: #ffffff;
  color: #111827;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px 48px;
}

.a2hs-header {
  text-align: center;
  margin-top: 12px;
  margin-bottom: 12px;
}
.app-icon {
  width: 64px;
  height: 64px;
  border-radius: 14px;
  display: inline-block;
  margin-bottom: 8px;
}
.title {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
}
.subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.steps {
  width: min(380px, 92vw);
  background: #fff;
  border-radius: 16px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 20px rgba(0,0,0,.04);
  padding: 16px;
}

.step {
  padding: 12px;
}
.step + .step {
  border-top: 1px dashed #e5e7eb;
}
.step-title {
  font-size: 18px;
  font-weight: 700;
  margin: 2px 0 10px;
  text-align: center;
}
.img-wrap {
  border-radius: 16px;
  overflow: hidden;
  background: #f9fafb;
  border: 1px solid #eef2f7;
}
.img-wrap img {
  width: 100%;
  height: auto;
  display: block;
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.primary {
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 12px;
  background: #2a2c55;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(42,44,85,.18);
}

.tip {
  margin-top: 16px;
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
}
</style>
