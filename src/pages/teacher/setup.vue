<template>
  <div class="page">
    <!-- 背景：图片完整显示（contain），多余区域用浅色当“白边” -->
    <div class="bg"></div>

    <!-- 顶部居中的头像与色子区 -->
    <section class="hero" aria-label="profile and dice">
      <!-- 头像：可替换为你的用户头像地址 -->
      <img
        class="avatar glass-ring"
        :src="`https://api.dicebear.com/9.x/adventurer/svg?skinColor=ecad80,f2d3b1&seed=${randomStr}`"
        alt="你的头像"
        @error="onAvatarError"
      />

      <!-- 色子 + 玻璃底盘托着色子 -->
      <div class="dice-wrap" @click="rollDice">
        <div class="dice-base glass" aria-hidden="true"></div>
        <!-- 使用 SVG 色子，确保清晰缩放 -->
          <svg t="1755423256040" class="dice-icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1689"><path d="M970.852 184.635a46.953 46.953 0 0 0-20.027-14.158c-79.46-32.506-160.039-64.886-240.059-96.146C648.246 49.554 586.358 24.777 523.856 0h-25.608l-16.957 7.061c-122.53 48.38-244.447 97.356-366.345 145.718-15.621 6.501-30.7 12.389-46.954 18.89-12.515 5.291-21.255 13.562-21.255 27.088s7.494 22.43 20.623 27.721c1.806 1.192 5.002 1.806 6.88 2.962 138.784 58.403 278.2 116.805 416.965 175.786 13.761 6.501 26.258 6.501 40.65 0 119.407-50.132 237.55-100.282 356.341-150.431 23.116-8.831 45.003-18.872 67.505-28.317 19.377-8.253 26.258-27.088 15.007-41.879M341.17 223.534c-31.874 23.604-92.517 24.181-126.269 0.596-22.501-15.332-22.501-39.53-0.632-55.459 15.007-11.214 37.509-17.698 54.394-17.698 31.26 0 53.13 4.136 72.507 17.698 21.255 15.928 21.255 39.531 0 54.863m233.196 0c-31.26 24.181-95.027 24.181-126.919 0-21.237-15.928-20.623-39.513 1.264-54.863 19.378-13.562 40.633-17.698 69.383-17.698 15.621 0 37.508 4.136 55.64 16.524 21.887 16.524 22.501 40.11 0.632 55.983m234.424 1.192c-31.874 23.585-92.517 24.181-126.287 0.578-22.501-15.928-22.501-39.531 0-55.46 18.763-14.157 40.019-18.275 62.52-18.275s43.757 4.118 62.52 17.698c23.134 15.928 23.134 38.935 1.247 55.46M466.356 437.713c-30.7-12.388-61.256-25.373-92.516-38.935-108.156-46.014-215.68-90.837-323.835-136.273-10.004-4.714-20.641-7.08-31.26-1.806C4.298 267.779 0 280.167 0 294.326v496.153c0 29.508 13.129 50.15 41.879 61.942 133.149 55.46 265.052 110.919 397.587 166.956 28.768 11.792 49.391-0.596 49.391-30.086V732.076c0-86.123 0-171.56 1.246-257.792 1.806-17.698-5.616-29.49-23.747-36.57M270 680.174c-15.007 21.238-40.633 23.008-58.132 2.944-19.955-21.833-25.571-48.326-22.447-75.414 1.806-14.754 7.494-29.509 14.447-42.475 13.13-22.411 39.387-23.007 57.5-4.136 15.64 15.928 23.766 39.532 23.766 59.595 0 25.95-3.757 43.053-15.007 59.595m704.482-417.777l-416.35 175.172c-17.518 7.675-25.013 18.872-25.013 36.57v257.25c0 86.683 0 172.265 0.614 258.966 0 27.74 20.642 40.705 47.532 29.509l402.59-169.303c26.89-11.215 40-31.279 40-58.403V293.838c-0.614-28.894-21.87-42.475-49.373-31.26M715.173 840.665c-17.517 20.063-42.511 18.89-58.782-2.944-22.502-31.892-19.378-89.157 7.512-118.051 18.746-20.642 43.125-18.872 58.764 4.135 9.373 13.58 14.448 33.03 14.448 55.46 0 20.045-5.635 42.474-21.87 61.4M897.081 547.44c-17.499 20.063-42.51 18.871-58.764-2.944-21.887-31.278-19.377-87.315 5.635-115.577 20.623-23.604 45.635-21.834 62.52 4.713 8.127 11.81 13.11 28.894 13.11 48.38-1.245 23.603-5.616 47.188-22.5 65.482" p-id="1690" fill="#ffffff"></path></svg>
      </div>
    </section>

    <button
      class="btn glass"
      @click="proceed"
    >
      <span class="arrow">➜</span>
    </button>

    <!-- 黑场过渡层 -->
    <div class="blackout" :class="{ show: fading }"></div>
        <!-- 全屏 confetti 的发射锚点（看不见，仅作为动画起点） -->
    <span id="reward-anchor" class="reward-anchor" aria-hidden="true"></span>

    <div
      class="blackout"
      :class="{ show: fading || entering }"
    ></div>
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
  roles: ['teacher']
</route>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReward } from 'vue-rewards'
import { useTipBuddy } from '../../composables/useTipBuddy'
import api from '../../api'
const { show } = useTipBuddy()
const router = useRouter()

const randomStr = ref('')
const fading = ref(false)

const FADE_MS = 800

const tipShown = ref(false)  // 变量：是否已经显示过

const entering = ref(true)   // 👈 新增：入场黑屏状态


// --- vue-rewards: 创建 confetti 奖励 ---
let fireConfetti = null



onMounted(() => {
  const { reward } = useReward('reward-anchor', 'confetti', {
    // 这些参数以“全屏铺满”的观感为目标
    position: 'fixed',     // 粒子挂在视口
    zIndex: 9998,          // 低于黑场(9999)，高于内容
    angle: 270,            // 从顶部往下喷
    spread: 360,           // 360° 扩散
    lifetime: 300,         // 持续稍长
    startVelocity: 20,     // 初速度大一点
    elementCount: 200,     // 粒子数量加大
    elementSize: 8,
    colors: ['#FFFFFF', '#FFD166', '#06D6A0', '#118AB2', '#EF476F'],
  })
  fireConfetti = reward

  // 初始头像
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 50; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  randomStr.value = result
  console.log(result)



  setTimeout(() => {
    entering.value = false
  }, FADE_MS)
})

function rollDice() {
  // 生成长度 50 的随机字符串（包含大小写字母 + 数字）
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 50; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  randomStr.value = result
  console.log(result)

  // 触发整屏 confetti
  fireConfetti && fireConfetti()
  if (!tipShown.value) {
    show('Tips:头像一定要认真挑选噢~ 还没有渠道更换头像呢')
    tipShown.value = true
  }
}

async function proceed() {
  if (fading.value) return

  try {
    // 调用后端接口
    await api.post('/api/users/update-profile/', {
      avatar: randomStr.value,
    })

    // 成功后再跳转
    fading.value = true
    setTimeout(() => {
      router.push('/teacher/home')
    }, FADE_MS)
  } catch (err) {
    console.error('更新用户资料失败', err)
    alert('更新资料失败，请重试') // 你也可以换成 Toast 等提示
  }
}
function onAvatarError(e) {
  // 如果没有默认头像，则退化为纯色占位
  const target = e.target
  target.style.background = 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)'
  target.src = ''
  target.alt = '头像占位'
}
</script>


<style scoped>
/* 基础清理，避免出现细小滚动条 */
:root, html, body { height: 100%; }
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
  height: 100vh; height: 100svh; height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;                 /* 元素之间的间距 */
  overflow: clip;            /* 彻底避免溢出触发滚动 */
  padding: 0 20px;
}
@supports not (overflow: clip) { .page { overflow: hidden; } }

/* 背景：public 下的资源用绝对路径 /image/... */
.bg {
  position: absolute;
  inset: 0;
  background-image: url('/image/login-real.jpg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;      /* 保持比例完整显示 */
  background-color: #E7F0F9;     /* 不够的区域填充为浅色“白边” */
  z-index: 0;
}
/* 👇新增：在背景上加一层暗色滤镜 */
.bg::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.12); /* 这里调整透明度，0.2~0.4 比较合适 */
}
/* ====== 玻璃基类：复用到 input / button / 底盘环 ====== */
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

/* 头像增加玻璃感的细环（不改变图片内容） */
.glass-ring {
  position: relative;
}
.glass-ring::after {
  content: '';
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  background: rgba(255,255,255,0.10);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.45);
  box-shadow:
    0 10px 24px rgba(0,0,0,0.22),
    inset 0 1px 0 rgba(255,255,255,0.55);
  pointer-events: none;
}

/* ====== 头像与色子区域 ====== */
.hero {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;
  z-index: 1; /* 盖在背景上 */
}

.avatar {
  margin-top: 100px;
  margin-bottom: -50px;
  width: 112px;
  height: 112px;
  border-radius: 50%;
  object-fit: cover;
  object-position: center;
  border: 1px solid rgba(255,255,255,0.55);
  box-shadow: 0 12px 28px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.35);
  background-color: #fff;
}

.dice-wrap:hover .dice-base {
  background: linear-gradient(
    to bottom,
    rgba(255,255,255,0.22),
    rgba(255,255,255,0.14)
  ),
  rgba(255,255,255,0.16);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.32),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
}

/* 色子 + 玻璃底盘 */
.dice-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 92px;
  height: 92px;
  cursor: pointer;          /* 鼠标变小手 */
  user-select: none;        /* 避免选中文字 */
}

.dice-wrap:active {
  transform: scale(0.95);   /* 按下有缩放效果 */
}

/* 底盘为完美圆形玻璃，稍有投影，托着色子 */
.dice-base {
  position: absolute;
  bottom: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  -webkit-backdrop-filter: blur(14px) saturate(140%);
  backdrop-filter: blur(14px) saturate(140%);
  border: 1px solid rgba(255,255,255,0.45);
  box-shadow:
    0 20px 32px rgba(0,0,0,0.28),
    inset 0 1px 0 rgba(255,255,255,0.55),
    inset 0 -10px 30px rgba(255,255,255,0.08);

}
.dice {
  font-size: 42px;  /* 调整大小 */
  color: #fff;      /* 白色，和玻璃背景协调 */
  z-index: 1;
}

.dice-icon {
  margin-top: 50px;
  width: 22px;   /* 你可以试试 42px ~ 60px */
  height: 22px;
  z-index: 1;
  pointer-events: none;
}

/* ====== 输入框 ====== */
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
  z-index: 1;
}
.input + .btn { 
  margin-top: 10px; 
  margin-left: 260px;
}
.input::placeholder { color: #ffffffaa; }
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

/* ====== 按钮（沿用玻璃） ====== */
.btn {
  width: 100%;
  max-width: 60px;
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
  z-index: 1;
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
.arrow { font-size: 16px; line-height: 1; }

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

.reward-anchor{
  position: fixed;
  top: -10px;          /* 稍微在视口上方，避免看到起点 */
  left: 50%;
  transform: translateX(-50%);
  width: 1px; height: 1px;
  pointer-events: none;
  z-index: 0;          /* 粒子的 zIndex 在 JS 配置里控制 */
}

.btn:disabled {
  opacity: 0.5;               /* 灰掉 */
  cursor: not-allowed;        /* 鼠标变禁止 */
  transform: none !important; /* 去掉 hover/active 效果 */
  box-shadow: none;
}

</style>
