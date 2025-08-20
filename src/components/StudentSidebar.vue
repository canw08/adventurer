<template>
  <div class="sidebar" v-if="userStore.userInfo">
    <Toast />
    <!-- 替换你现有的 .profile-header 里的头像块 -->
    <div class="profile-header">
      <div
        class="avatar-progress"
        :class="{ 'is-active': showExp }"
        @click="toggleExp"
        v-ripple
      >
        <!-- 进度环（百分比） -->
        <Knob
          :modelValue="percent"
          :size="120"
          :strokeWidth="14"
          :readonly="true"
          valueColor="#4eb8d0"
          rangeColor="#eee"
        />

        <!-- 头像 -->
        <img
          :src="`https://api.dicebear.com/9.x/adventurer/svg?seed=${userStore.userInfo.avatar}`"
          alt="User Avatar"
          class="avatar-img"
        />

        <!-- 点击后显示：500/1000 这样的经验 -->
        <transition name="fade-up">
          <div v-if="showExp" class="exp-badge">{{ expDisplay }}</div>
        </transition>
      </div>

      <h2 class="user-name">{{ userStore.userInfo.nickname || userStore.userInfo.username }}</h2>
      
      <p class="user-id" @click="copyId">
        ID {{ userStore.userInfo.identifier }}
      </p>
    </div>

    <!-- 代币/时间行 -->
    <div class="stats-row">
      <!-- 代币 -->
      <div class="stat-pill" v-ripple>
        <!-- 像素png：加 pixelated 类 + 整数倍 32x32 -->

        <div class="stat-carpet">
          <img :src="tokenIcon" alt="token" class="stat-icon pixelated click-wiggle-y50" />
          <!-- carpet 是矢量/平滑背景，不用像素化 -->
          <img :src="carpetImgA" alt="" class="carpet-img pixelated" />
          <span class="stat-text">{{ tokenText }}</span>
        </div>
      </div>

      <!-- 时间 -->
      <div class="stat-pill" v-ripple>
        <div class="stat-carpet">
          <img :src="timeIcon" alt="time" class="stat-icon pixelated stat-icon-time click-wiggle-y50" />
          <img :src="carpetImgB" alt="" class="carpet-img pixelated" />
          <span class="stat-text" style="transform: translateY(-0.5px)">{{ timeText }}</span>
        </div>
      </div>
    </div>

    <div class="menu-list">
      <div
        class="menu-button"
        :class="{ active: isActive('/student/home') }"
        @click="goToLog"
        v-ripple
      >
        <i class="pi pi-book icon"></i>
        <span class="label-text">{{ t('sidebar.home') }}</span>
      </div>
      <div
        class="menu-button"
        :class="{ active: isActive('/student/task') }"
        @click="goToBoard"
        v-ripple
      >
        <i class="pi pi-user icon"></i>
        <span class="label-text">{{ t('sidebar.board') }}</span>
      </div>
      <div
        class="menu-button"
        :class="{ active: isActive('/student/settings') }"
        @click="goToTeam"
        v-ripple
      >
        <i class="pi pi-cog icon"></i>
        <span class="label-text">{{ t('sidebar.settings') }}</span>
      </div>
    </div>
  </div>

  <div v-else>加载中...</div>
</template>

<script setup>
import Knob from 'primevue/knob'
import { useRouter, useRoute } from 'vue-router'
import 'primeicons/primeicons.css'
import { onMounted, computed, ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const { t } = useI18n()
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 如果这些 PNG 原图是 16x16，显示用 32x32、64x64 等整数倍
const tokenIcon = new URL('../assets/icon/token.png', import.meta.url).href;
const timeIcon  = new URL('../assets/icon/time.png', import.meta.url).href;
// carpet 是矢量/底图，不需要像素化
const carpetImgB = new URL('../assets/icon/redcarpet.png', import.meta.url).href;
const carpetImgA = new URL('../assets/icon/bluecarpet.png', import.meta.url).href;

const showExp = ref(false)
const toggleExp = () => { showExp.value = !showExp.value }


const tokenText = computed(() => {
  const v = userStore?.userInfo?.tokens ?? 0;
  return `${v} ₷` ;
});
const timeText = computed(() => {
  const hours = userStore?.userInfo?.volunteerTime ?? 0;
  return `${hours} h`;
});

const currentExp = computed(() =>
  Number(userStore?.userInfo?.experience ?? 200 - userStore?.userInfo?.current_level_xp ?? 100)
)
const nextExp = computed(() =>
  Math.max(1, Number(userStore?.userInfo?.next_level_xp ?? 1000) - userStore?.userInfo?.current_level_xp ?? 100) // 防止除零
)

const percent = computed(() => {
  const cur = Math.min(Math.max(currentExp.value, 0), nextExp.value)
  return Math.round((cur / nextExp.value) * 100)
})

const expDisplay = computed(() => `${currentExp.value}/${nextExp.value}`)


const goToLog = () => router.push('/student/home');
const goToBoard = () => router.push('/student/task');
const goToTeam = () => router.push('/student/settings');
const isActive = (path) => route.path === path;

onMounted(async () => {
  try {
    await userStore.fetchUser();
  } catch {}
});

const copyId = async () => {
  try {
    await navigator.clipboard.writeText(userStore.userInfo.identifier)
    toast.add({
      severity: 'success',
      summary: '已复制',
      detail: 'ID 已复制到剪切板',
      life: 2000
    })
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: '复制失败',
      detail: '请手动复制 ID',
      life: 2000
    })
  }
}
</script>

<style scoped>
.sidebar {
  width: 300px;
  background-color: #f3f7fe;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  border-right: 1px solid #e3eaf5;
  position: relative;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 0px;
  margin-top: 40px;
}

.user-name { margin-top: -2px; }

.user-id {
  background-color: #e6e6e6;
  padding: 4px 10px;
  border-radius: 999px;
  margin-top: -20px;
  font-size: 14px;
  color: #a2a0a0;
  cursor: pointer;         /* 👈 鼠标手势 */
  user-select: none;       /* 避免选中高亮 */
  transition: background-color .2s;
}

.user-id:hover {
  background-color: #d5d5d5;
}

.menu-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding: 16px;
}

.menu-button {
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 32px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 14px;
  background-color: #f3f7fe;
  color: #5067b0;
  cursor: pointer;
  transition: background-color .2s ease-in-out, transform .2s ease-in-out;
  transform: translateZ(0); /* 避免合成导致的小数缩放 */
  position: relative;
  overflow: hidden;
  z-index: 1;
}
/* 不用对像素图元素做 scale，按钮自己可以微缩放 */
.menu-button:hover { transform: scale(1.03); background-color: #e0e8ff; }
.menu-button:active { transform: scale(0.96); }
.menu-button.active { background-color: #2a2c56; color: #fff; }

.icon { margin-right: 30px; font-size: 1.2em; }
.label-text { transform: translateY(-1px); display: inline-block; font-size: 20.5px; }

.avatar-img {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background-color: #fff;
  /* Dicebear 是 SVG，像素化无意义，这里保持平滑即可 */
}

/* 代币 / 时间 行容器 */
.stats-row {
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 12px;
  padding: 0 8px;
  margin-left: 3px
}

/* 单个“icon + carpet + 文本” */
.stat-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  transform: translateZ(0);
  cursor: default;
  margin-right: -10px
}

/* 像素PNG：明确整数倍尺寸（16px 原图 → 32px 显示） */
.stat-icon {
  position: absolute;
  left: 8px;                   /* 👈 固定在左侧 */
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  z-index: 2;                  /* 在carpet之上 */
  margin-left: 3px;
}

/* 像素化：最近邻缩放（现代浏览器）+ 兼容项 */
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor; /* legacy IE */
}

/* 右侧 carpet（矢量/平滑） + 文本 */
.stat-carpet {
  position: relative;
  height: 46px;
  min-width: 108px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  justify-content: flex-end; 
}
/* carpet 用作平滑底图，不像素化 */
.carpet-img {
  position: absolute;
  top: 50%;
  left: 0;
  height: 110%;
  width: auto;
  transform: translateY(-50%);
  object-fit: contain;
  pointer-events: none;
  z-index: 0;
}

.stat-text {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 600;
  margin-right: 10px;
  text-align: right;   
  color: #5067b0;
  white-space: nowrap;
  transform: translateY(0.5px);
  margin-right:20px;
  color: #fff
}

.menu-button.active .label-text { color: #fff; }

/* 若有其它像素图也可复用这个类：
.img-pixel { width: 64px; height: 64px; } 与 .pixelated 组合使用 */


/* ========== Avatar 进度/点击态 ========== */
.avatar-progress {
  position: relative;
  width: 120px;
  height: 120px;
  cursor: pointer;
}

/* Knob 占满容器，置于底层 */
.avatar-progress :deep(.p-knob) {
  position: absolute;
  inset: 0;
}

/* 头像覆盖在圆环中央 */
.avatar-img {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  transition: filter .18s ease, opacity .18s ease;
}

/* 点击后压暗头像（你可按需调节） */
.avatar-progress.is-active .avatar-img {
  filter: brightness(0.5) saturate(0.9);
}

/* 经验气泡，显示在头像“上方”居中 */
.exp-badge {
  position: absolute;
  left: 50%;
  bottom: 35%;                 /* 紧贴头像上方 */
  transform: translateX(-50%);
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: rgba(32, 41, 76, 0.9);
  border-radius: 999px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  backdrop-filter: blur(4px);
  pointer-events: none;         /* 避免挡住点击 */
  white-space: nowrap;
}

/* 进出场动画（向上浮现） */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: opacity .18s ease, transform .18s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

.stat-icon-time,
.stat-icon-time + .stat-text {
  transform: translateY(-17px);
}

</style>
