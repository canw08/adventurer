<template>
  <div class="page">
    <!-- 背景：图片完整显示（contain），多余区域用浅色当“白边” -->
    <div class="bg"></div>

    <!-- 直接摆放表单元素（无外层容器、无标题） -->
    <input
      v-model="id"
      type="text"
      placeholder="输入你的ID"
      class="input glass"
    />
    <input
      v-model="password"
      type="password"
      placeholder="输入你的密码"
      class="input glass"
    />

    <button class="btn glass" @click="login">
      <span class="arrow">➜</span>
    </button>
    <div class="blackout" :class="{ show: fading }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const id = ref("");
const password = ref("");
const fading = ref(false);

const FADE_MS = 800; // 和 CSS 里 transition 时间保持一致


function login() {
  if (fading.value) return;       // 防抖：避免重复点击
  // TODO: 这里可先做校验/登录请求，成功后再触发黑场
  fading.value = true;            // 黑幕淡入
  setTimeout(() => {
    router.push("/animations/login");         // TODO: 改成你的目标路由
  }, FADE_MS);
}
</script>

<style scoped>
/* 基础清理，避免出现细小滚动条 */
:root, html, body {
  height: 100%;
}
html, body {
  margin: 0;
  padding: 0;
  overflow: hidden;          /* 防止出现轻微滚动 */
  overscroll-behavior: none; /* 阻止回弹 */
}

/* ====== 页面与背景 ====== */
.page {
  position: relative;
  width: 100vw;

  /* 使用多种视口单位，兼容移动端地址栏变化 */
  height: 100vh;
  height: 100svh;
  height: 100dvh;

  /* 直接用 page 做垂直居中，无需任何外层容器 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;                 /* 元素之间的间距 */
  overflow: clip;            /* 彻底避免溢出触发滚动 */
  padding: 0 20px;           /* 仅左右留一点内边距，避免贴边 */
    padding-top: 100px;
}
@supports not (overflow: clip) {
  .page { overflow: hidden; }
}

/* 背景：public 下的资源用绝对路径 /image/... */
.bg {
  position: absolute;
  inset: 0;
  background-image: url("/image/login-real.jpg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;      /* 保持比例完整显示 */
  background-color: #E7F0F9;     /* 不够的区域填充为浅色“白边” */
  z-index: 0;
}

/* ====== 玻璃基类：可复用到 input / button ====== */
.glass {
  background: rgba(255, 255, 255, 0.14);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.35);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
}

/* ====== label / input ====== */
.label {
  align-self: stretch;               /* label 与输入框齐宽 */
  max-width: 520px;
  margin: 0px 2px 6px;
  font-size: 13px;
  color: #f7f7f7cc;
  z-index: 1;                        /* 盖在背景上 */
}

.input {
  width: 100%;
  max-width: 320px;
  padding: 22px 14px 22px 22px;
  color: #fff;
  outline: none;
  border: 1px solid rgba(255,255,255,0.38);
  background: rgba(255, 255, 255, 0.10);
  -webkit-appearance: none;
  appearance: none;
  font-size: 16px;
  letter-spacing: 0.2px;
  z-index: 1;                        /* 盖在背景上 */
}

.input + .input {
  margin-top: 15px; /* 你想多一点/少一点就改这个值 */
}


.input::placeholder {
  color: #ffffffaa;
}

.input:focus {
  background: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 10px 25px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 0 0 2px rgba(180, 220, 255, 0.45);
}

.input:-webkit-autofill,
.input:-webkit-autofill:hover,
.input:-webkit-autofill:focus {
  -webkit-text-fill-color: #fff;
  transition: background-color 5000s ease-in-out 0s;
}

/* ====== 按钮 ====== */
.btn {
  width: 100%;
  max-width: 60px;
  margin-top: 6px;
  padding: 12px 14px;
  color: #fff;
  font-weight: 700;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.45);
  background: linear-gradient(
      to bottom,
      rgba(255,255,255,0.18),
      rgba(255,255,255,0.10)
    ),
    rgba(255,255,255,0.12);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  z-index: 1;                         /* 盖在背景上 */
  margin-left: 260px;
}

.btn:hover {
  transform: translateY(-1px);
  background: linear-gradient(
      to bottom,
      rgba(255,255,255,0.22),
      rgba(255,255,255,0.14)
    ),
    rgba(255,255,255,0.16);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.btn:active {
  transform: translateY(0);
  box-shadow:
    0 8px 22px rgba(0, 0, 0, 0.26),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.arrow {
  font-size: 16px;
  line-height: 1;
}

/* ====== 黑场过渡层 ====== */
.blackout {
  position: fixed;   /* 覆盖整个视口，确保在一切之上 */
  inset: 0;
  background: #000;
  opacity: 0;
  transition: opacity 800ms ease;  /* 和 FADE_MS 对齐 */
  pointer-events: none;            /* 未显示时不拦截点击 */
  z-index: 9999;
}
.blackout.show {
  opacity: 1;
  pointer-events: auto;            /* 显示时拦截交互，避免多次点击 */
}

/* ====== 降级方案 ====== */
@supports not ((backdrop-filter: blur(10px)) or (-webkit-backdrop-filter: blur(10px))) {
  .glass { background: rgba(255, 255, 255, 0.75); }
}
</style>
