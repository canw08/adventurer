<template>
  <!-- ================= 主 Dialog ================= -->
  <Dialog
    v-if="renderDialog"
    :visible="innerVisible"
    @update:visible="onVisibleChange"
    :modal="true"
    :draggable="false"
    :dismissableMask="false"
    :closeOnEscape="dialogStep !== 'reward'"
    :closable="false"
    :pt="pt"
    appendTo="self"
  >
    <!-- ================= Header（自定义 close：固定右上角） ================= -->
    <template #header>
      <!-- ✅ 作为 close 的定位锚点（不会影响你原本标题 absolute 居中） -->
      <div class="watch-header-slot">
        <!-- ✅ 你原来的标题（不动） -->
        <div class="dialog-title-wrapper">
          <span class="dialog-title">
            <template v-if="dialogStep === 'watch'">
              Watch videos to get
              <span class="token-wrap">
                <span class="token-count">{{ previewReward }}</span>
                <img :src="tokenImg" class="token-icon pixelated click-wiggle-y50" />
              </span>
            </template>

            <template v-else>
              The rewards have been distributed
            </template>
          </span>
        </div>

        <!-- ✅ 自定义 close：只在 watch 阶段显示 -->
        <Button
          v-if="dialogStep === 'watch'"
          class="watch-dialog-close"
          icon="pi pi-times"
          text
          rounded
          aria-label="Close"
          @click="handleCloseDialog"
        />
      </div>
    </template>

    <!-- ================= Content ================= -->
    <div class="dialog-content" :class="{ 'is-watch': dialogStep === 'watch' }">
      <!-- ================= Watch ================= -->
      <template v-if="dialogStep === 'watch'">
        <!-- ✅ 关键：middle 用 flex:1 吃满高度，把按钮自然推到底 -->
        <div class="dialog-middle">
          <img :src="playerImg" class="player-icon" />
        </div>

        <!-- ✅ Watch 按钮：不再 absolute，使用 mt-auto “自然贴底” -->
        <Button
          label="Watch"
          class="watch-btn"
          :disabled="remaining <= 0"
          @click="handleWatch"
        />
      </template>

      <!-- ================= Reward ================= -->
      <template v-else>
        <div class="reward-middle">
          <span class="reward-count">{{ rewardAmount }}</span>
          <img :src="tokenImg" class="reward-token pixelated334" />
        </div>

        <div class="reward-footer">
          <Button label="OK" class="watch-btn" @click="handleRewardOk" />
        </div>
      </template>
    </div>
  </Dialog>

  <Teleport to="body">
    <!-- ================= Video ================= -->
    <div
      v-if="showVideo"
      class="video-overlay"
      tabindex="0"
      @click.self="closeVideo"
      @wheel.prevent
      @touchmove.prevent
      @keydown.capture="onKeydown"
    >
      <video
        ref="videoRef"
        class="overlay-video"
        src="/video/test.mp4"
        autoplay
        playsinline
        @ended="handleVideoEnded"
        @click.stop
        @mousedown.stop
        @touchstart.stop
      />
    </div>

    <!-- ================= Confirm Leave ================= -->
    <div v-if="showConfirmLeave" class="confirm-overlay" @click.self="() => {}">
      <div class="confirm-box" @click.stop>
        <p>Only {{ remainSeconds }}s left to receive the reward.</p>
        <p>Do you want to continue?</p>

        <div class="confirm-actions">
          <Button label="Continue" @click="continueWatch" />
          <Button label="Leave" severity="secondary" @click="confirmLeave" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import api from '../../api.js' // ✅ 用法同 axios
import { useUserStore } from '../../stores/user.js'

const userStore = useUserStore()
const tokenImg = new URL('../../assets/icon/token.png', import.meta.url).href
const playerImg = new URL('../../assets/icon/player.svg', import.meta.url).href

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  rewardCoins: { type: Number, default: 5 },     // ✅ 一次签到奖励（默认 5）
  maxTrialPerDay: { type: Number, default: 100 } // ✅ 这里不再用本地次数限制了（保留不影响）
})

const emit = defineEmits(['update:modelValue', 'rewarded', 'limit', 'available'])


/* ================= Dialog 状态 ================= */
const dialogStep = ref('watch')
const innerVisible = ref(false)
const renderDialog = computed(() => props.modelValue || innerVisible.value)

onMounted(() => {
  refreshCheckinStatus()
})


watch(
  () => props.modelValue,
  async (v) => {
    innerVisible.value = v
    if (v) {
      await refreshCheckinStatus()
    }
  },
  { immediate: true }
)

const onVisibleChange = (v) => {
  innerVisible.value = v
  emit('update:modelValue', v)
}

const handleCloseDialog = () => {
  emit('update:modelValue', false)
}

/* ================= ✅ 改成 API：签到状态 / 剩余次数 ================= */
// remaining：用于控制 Watch 按钮是否可点（今天已签到就禁用）
const remaining = ref(1) // 1=可签到，0=不可（已签到）
const tokensFromServer = ref(null)

const rewardAmount = ref(0)            // ✅ 最终展示：后端返回的奖励
const previewReward = computed(() => {
  // ✅ watch 阶段显示用：随机奖励未发放前显示 "?"
  // 你也可以改成 "1~10" 或者从后端 GET 返回一个范围
  return '1~5'
})

const refreshCheckinStatus = async () => {
  try {
    const { data } = await api.get('/api/users/checkin/')

    const checked = !!data?.checked_in
    remaining.value = checked ? 0 : 1
    tokensFromServer.value = data?.tokens ?? null

    if (checked) {
      // ✅ 关掉弹窗（如果父组件误开）
      emit('update:modelValue', false)

      // ✅ 通知父组件：今天不可用 -> icon 不要显示
      emit('available', false)
    } else {
      emit('available', true)
    }
  } catch (err) {
    emit('available', true)
    remaining.value = 1
  }
}


/* ================= Video Overlay ================= */
const showVideo = ref(false)
const videoRef = ref(null)

const showConfirmLeave = ref(false)
const remainSeconds = ref(0)

const onKeydown = (e) => {
  e.preventDefault()
  e.stopPropagation()
}

const lockBody = () => {
  document.body.style.overflow = 'hidden'
  document.body.style.touchAction = 'none'
}
const unlockBody = () => {
  document.body.style.overflow = ''
  document.body.style.touchAction = ''
}

watch(showVideo, async (v) => {
  if (v) {
    lockBody()
    await nextTick()
    document.querySelector('.video-overlay')?.focus?.()
  } else {
    unlockBody()
  }
})

const syncRemainSeconds = () => {
  const v = videoRef.value
  if (!v) return
  const dur = Number(v.duration)
  const cur = Number(v.currentTime)
  if (!Number.isFinite(dur) || dur <= 0) {
    remainSeconds.value = 0
    return
  }
  const left = Math.max(dur - cur, 0)
  remainSeconds.value = Math.ceil(left)
}

/* ================= Watch 按钮：先查状态，再播视频 ================= */
const handleWatch = async () => {
  // ✅ 每次点之前刷新一下，避免多端/多窗口重复领
  await refreshCheckinStatus()

  if (remaining.value <= 0) {
    emit('limit') // 你原来的事件：这里用来提示“今日已签到/已领取”
    return
  }

  showVideo.value = true
  await nextTick()
  videoRef.value?.play?.()
}

const closeVideo = () => {
  if (!showVideo.value) return
  if (showConfirmLeave.value) return

  videoRef.value?.pause?.()
  syncRemainSeconds()
  showConfirmLeave.value = true
}

const continueWatch = () => {
  showConfirmLeave.value = false
  videoRef.value?.play?.()
}

const confirmLeave = () => {
  showConfirmLeave.value = false
  showVideo.value = false
}

/* ================= ✅ 视频结束：调用签到 API 发放奖励 ================= */
const handleVideoEnded = async () => {
  showVideo.value = false

  try {
    const { data } = await api.post('/api/users/checkin/')

    // ✅ 关键：后端决定奖励数量
    // 兼容不同字段名：reward / rewardCoins / coins
    const r =
      Number(data?.reward ?? data?.rewardCoins ?? data?.coins ?? 0)

    rewardAmount.value = Number.isFinite(r) ? r : 0

    remaining.value = 0
    tokensFromServer.value = data?.tokens ?? tokensFromServer.value

    // ✅ 通知父组件：本次实际奖励是多少
    emit('rewarded', rewardAmount.value)

    // ✅ 进入 reward 展示
    dialogStep.value = 'reward'
    userStore.refreshUser()
  } catch (err) {
    await refreshCheckinStatus()
    // 如果失败，你可以选择不进 reward 页，或给 0
    rewardAmount.value = 0
    dialogStep.value = 'reward'
  }
}


const handleRewardOk = () => {
  dialogStep.value = 'watch'
  emit('update:modelValue', false)
}

/* ================= PrimeVue pt ================= */
const pt = computed(() => {
  const isReward = dialogStep.value === 'reward'

  return {
    mask: { class: 'watch-dialog-mask' },
    root: {
      class: ['watch-dialog', isReward ? 'is-reward' : ''],
      style: {
        width: 'min(348px, 90vw)',
        height: isReward ? 'auto' : 'min(290px, 90vh)',
      },
    },
    header: {
      class: 'watch-dialog__header',
      style: { position: 'relative' },
    },
    content: { class: 'watch-dialog__content' },
    headerActions: { class: 'watch-dialog__actions' },
    closeButton: { class: 'watch-dialog__close' },
  }
})
</script>

<style scoped>
/* ===== Dialog 基础布局 ===== */
:deep(.watch-dialog.p-dialog) {
  position: relative;
  overflow: visible;
}

/* ✅ content 必须是 flex，dialog-content 才能 flex:1 + 推底按钮 */
:deep(.watch-dialog .p-dialog-content) {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  position: relative;
}

/* ✅ header：只做 padding，不碰布局 */
:deep(.watch-dialog__header.p-dialog-header) {
  position: relative !important;
  padding: 0 12px !important;
  overflow: visible !important;
}

/* ===== Header 标题（保持你原来绝对居中） ===== */
.watch-header-slot {
  position: relative;
  width: 100%;
  overflow: visible;
  height: 56px;
}

/* ===== Header 标题（统一用“安全区变量”控制） ===== */
.watch-header-slot {
  position: relative;
  width: 100%;
  overflow: visible;
  height: 56px;
}

/* ✅ reward 时安全区归零：中间区 = 100% */
:deep(.watch-dialog.is-reward) .watch-header-slot {
  --header-safe-space: 0px;
}

.dialog-title-wrapper {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  display: flex;
  align-items: center;
  justify-content: center;

  /* ✅ 用变量统一控制 */
  max-width: calc(100% - var(--header-safe-space));
  padding: 10px 0;

  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ reward 时：不省略 + 缩小字号兜底（可选） */
:deep(.watch-dialog.is-reward) .dialog-title-wrapper {
  overflow: visible !important;
  text-overflow: clip !important;
}

:deep(.watch-dialog.is-reward) .dialog-title {
  font-size: 14px !important; /* 13-15 自调 */
  white-space: nowrap !important;
}

.dialog-title {
  font-size: 18px;
  font-weight: 800;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ✅ 自定义 close：固定右上角 */
:deep(.watch-dialog-close.p-button) {
  position: absolute !important;
  top: 8px !important;
  right: 8px !important;
  z-index: 10 !important;

  width: 34px;
  height: 34px;
  border-radius: 10px;

  box-shadow: none !important;
  outline: none !important;
}

/* ===== Content 容器：flex column ===== */
.dialog-content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;

  /* ✅ 统一内边距 */
  padding: 12px 12px 12px;
  box-sizing: border-box;
}

/* ✅ middle 吃满高度：按钮自然被推到底 */
.dialog-middle {
  flex: 1;
  min-height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.player-icon {
  width: 120px;
  height: 120px;
  object-fit: contain;
}

.token-icon {
  width: 22px;
  height: 22px;
  object-fit: contain;
  transform: translateY(1px);
  display: block;
}

/* ===== token 文本 + 图标整体 ===== */
.token-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
}

.token-count {
  font-size: inherit;
  font-weight: inherit;
  line-height: 1;
}

/* ===== Watch / OK 按钮：自然贴底（关键是 margin-top:auto） ===== */
:deep(.watch-btn.p-button),
:deep(.watch-btn.p-button:hover),
:deep(.watch-btn.p-button:focus),
:deep(.watch-btn.p-button:focus-visible),
:deep(.watch-btn.p-button.p-focus),
:deep(.watch-btn.p-button:active) {
  width: 75%;
  margin: auto auto 0; /* ✅ 上方 auto：推到底；下方 0：贴住 padding 底 */
  border-radius: 12px;
  font-weight: 600;

  background: #d9d9d9 !important;
  box-shadow: none !important;
  outline: none !important;
  border-color: transparent !important;

  /* ✅ 这里保留你“完全静态”的诉求 */
  transform: none !important;
  filter: none !important;
  opacity: 1 !important;
  cursor: pointer;
}

:deep(.watch-btn.p-button .p-button-label) {
  color: #000 !important;
}

/* ===== Reward ===== */
.reward-middle {
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.reward-count {
  font-size: 48px;
  font-weight: 800;
  color: #111;
}

.reward-token {
  width: 40px;
  height: 40px;
}

.reward-footer {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

/* reward 专属：底部稍微留一点 */
:deep(.watch-dialog.is-reward) .dialog-content {
  padding: 12px 12px 10px;
}

/* ===== Video Overlay ===== */
.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;

  backdrop-filter: blur(2px) saturate(110%) contrast(105%);
  -webkit-backdrop-filter: blur(2px) saturate(110%) contrast(105%);

  pointer-events: auto;
  user-select: none;
}

.overlay-video {
  display: block;
  width: min(960px, 90vw);
  aspect-ratio: 16 / 9;

  background: #000;
  object-fit: contain;
}

/* ===== Confirm Leave ===== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.65);

  display: flex;
  align-items: center;
  justify-content: center;
}

.confirm-box {
  width: 300px;
  padding: 20px;
  border-radius: 14px;
  background: #fff;
  text-align: center;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
}

:deep(.watch-dialog-close.p-button),
:deep(.watch-dialog-close.p-button:hover),
:deep(.watch-dialog-close.p-button:active),
:deep(.watch-dialog-close.p-button:focus),
:deep(.watch-dialog-close.p-button:focus-visible) {
  color: #000 !important; /* 有些主题会用 color */
  background: transparent !important; /* 保持 text 风格 */
  box-shadow: none !important;
  outline: none !important;
}

:deep(.watch-dialog-close .pi) {
  color: #000 !important;
}

.dialog-content.is-watch .dialog-middle {
  margin-top: -30px; /* 👈 数值越大，player 离 title 越远 */
  margin-bottom: 20px;
}

/* ================= Reward：让 token 区域可控，不要被 flex:1 居中撑住 ================= */
:deep(.watch-dialog.is-reward) .reward-middle {
  flex: 0 0 auto !important; /* ✅ 不再占满高度 */
  justify-content: center !important; /* 横向居中保持 */
  margin-top: 6px !important; /* ✅ title ↔ token 距离：调这里（越小越近） */
}

/* 1️⃣ 允许 dialog 内容区不要用最小内容宽度卡整体 */
:deep(.watch-dialog .p-dialog-content) {
  min-width: 0 !important;
}

/* 2️⃣ reward footer 不参与最小宽度计算 */
:deep(.watch-dialog.is-reward .reward-footer) {
  width: 100% !important;
}

/* 3️⃣ OK 按钮不要影响布局最小宽度 */
:deep(.watch-dialog.is-reward .watch-btn) {
  width: 75%;
  max-width: 240px;       /* 可选：给个视觉上限 */
}

/* ================= 方案 B：Reward 阶段放大中间区 ================= */

/* 1️⃣ Reward 时：左右安全区 = 0（释放全部宽度给 title） */
:deep(.watch-dialog.is-reward .dialog-title-wrapper) {
  max-width: 100% !important;      /* ✅ 中间区 = 全宽 */
  padding-left: 0 !important;      /* 防止残留安全区 */
  padding-right: 0 !important;

  overflow: visible !important;
  text-overflow: clip !important;
}

/* 2️⃣ Reward 时：标题保持一行 + 轻微缩字号兜底 */
:deep(.watch-dialog.is-reward .dialog-title) {
  white-space: nowrap !important;
  font-size: 14px !important;      /* 👈 兜底字号，可调 13–15 */
  line-height: 1.2 !important;
}

/* 3️⃣ Reward 时：header actions 不占位（防止 PrimeVue 隐性三段式） */
:deep(.watch-dialog.is-reward .p-dialog-header-actions),
:deep(.watch-dialog.is-reward .watch-dialog__actions) {
  display: none !important;
}

/* ================= Reward 阶段：释放左右安全区 ================= */

/* 1️⃣ reward 时：中间区 = 100%，不再扣 88px */
:deep(.watch-dialog.is-reward .dialog-title-wrapper) {
  max-width: 100% !important;     /* 🔑 核心修复 */
  overflow: visible !important;
  text-overflow: clip !important;
}

/* 2️⃣ reward 时：标题缩小一点作为兜底 */
:deep(.watch-dialog.is-reward .dialog-title) {
  font-size: 14px !important;     /* 13–15 自行微调 */
  white-space: nowrap !important;
}

:deep(.watch-dialog.is-reward .p-dialog-header-actions),
:deep(.watch-dialog.is-reward .watch-dialog__actions) {
  display: none !important;
}
</style>