<template>
  <!-- ================= 主 Dialog ================= -->
  <Dialog
    v-if="renderDialog"
    :visible="innerVisible"
    @update:visible="onVisibleChange"
    :modal="true"
    :draggable="false"
    :dismissableMask="false"
    :closeOnEscape="true"
    :pt="pt"
  >
    <!-- Header -->
    <template #header>
      <div class="dialog-title-wrapper">
        <span class="dialog-title">
          Watch videos to get
          <span class="token-wrap">
            <span class="token-count">{{ rewardCoins }}</span>
            <img :src="tokenImg" class="token-icon" />
          </span>
        </span>
      </div>
    </template>

    <!-- Content -->
    <div class="dialog-content">
      <!-- player 图标始终存在 -->
      <div class="dialog-middle">
        <img :src="playerImg" class="player-icon" />
      </div>

      <Button
        label="Watch"
        class="watch-btn"
        :disabled="remaining <= 0"
        @click="handleWatch"
      />
    </div>
  </Dialog>

<Teleport to="body">
  <div
    v-if="showVideo"
    class="video-overlay"
    @click.self="closeVideo"
  >
    <video
      ref="videoRef"
      class="overlay-video"
      src="/video/test.mp4"
      autoplay
      controls
      playsinline
      @ended="handleVideoEnded"
    />
  </div>
</Teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const tokenImg = new URL('../../assets/icon/token.png', import.meta.url).href
const playerImg = new URL('../../assets/icon/player.svg', import.meta.url).href

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  rewardCoins: { type: Number, default: 5 },
  maxTrialPerDay: { type: Number, default: 3 }
})

const emit = defineEmits(['update:modelValue', 'rewarded', 'limit'])

/* ================= 主 Dialog ================= */
const pt = computed(() => ({
  mask: { class: 'watch-dialog-mask' },
  root: {
    class: 'watch-dialog',
    style: { width: 'min(348px, 90vw)', height: 'min(290px, 90vh)' }
  },
  header: { class: 'watch-dialog__header' },
  content: { class: 'watch-dialog__content' },
  closeButton: { class: 'watch-dialog__close' }
}))

const innerVisible = ref(false)
const renderDialog = computed(() => props.modelValue || innerVisible.value)

watch(
  () => props.modelValue,
  v => {
    innerVisible.value = v
    if (v) refreshRemaining()
  },
  { immediate: true }
)

const onVisibleChange = v => {
  innerVisible.value = v
  emit('update:modelValue', v)
}

/* ================= 次数逻辑 ================= */
const remaining = ref(0)

const getTodayKey = () =>
  `trial_watch_${new Date().toISOString().slice(0, 10)}`

const refreshRemaining = () => {
  const used = Number(localStorage.getItem(getTodayKey()) || 0)
  remaining.value = Math.max(props.maxTrialPerDay - used, 0)
}

/* ================= Video Overlay ================= */
const showVideo = ref(false)
const videoRef = ref(null)

const handleWatch = async () => {
  refreshRemaining()
  if (remaining.value <= 0) {
    emit('limit')
    return
  }

  showVideo.value = true
  await nextTick()
  videoRef.value?.play()
}

const closeVideo = () => {
  showVideo.value = false
}

const handleVideoEnded = () => {
  const used = Number(localStorage.getItem(getTodayKey()) || 0) + 1
  localStorage.setItem(getTodayKey(), used)

  refreshRemaining()
  emit('rewarded', props.rewardCoins)

  closeVideo()
}
</script>

<style scoped>

/* ===== Dialog 基础布局 ===== */
:deep(.watch-dialog.p-dialog) {
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
  --watch-close-offset: -8px;
}

:deep(.watch-dialog__header.p-dialog-header) {
  position: static !important;
  justify-content: center;
  padding: 0 12px !important;
}

:deep(.watch-dialog__content.p-dialog-content) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  overflow: auto;
}

/* ===== Header ===== */
.dialog-title-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.dialog-title {
  font-size: 18px;
  font-weight: 800;
  color: #1f2937;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* ===== Content ===== */
.dialog-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 12px 0;
  box-sizing: border-box;
}

.dialog-middle {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(-6px);
  padding-bottom: 16px;
}

.video-icon-wrap {
  width: 92px;
  height: 92px;
  display: flex;
  align-items: center;
  justify-content: center;
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
  display: block;          /* 去掉 img 默认 baseline 偏移 */
}

/* ===== Watch 按钮：完全静态，彻底移除绿色 focus ring ===== */
:deep(.watch-btn.p-button),
:deep(.watch-btn.p-button:hover),
:deep(.watch-btn.p-button:focus),
:deep(.watch-btn.p-button:focus-visible),
:deep(.watch-btn.p-button.p-focus),
:deep(.watch-btn.p-button:active) {
  width: 75%;
  margin: 0 auto 12px;
  border-radius: 12px;
  font-weight: 600;
  background: #D9D9D9 !important;
  box-shadow: none !important;
  outline: none !important;
  border-color: transparent !important;
  transform: none !important;
  filter: none !important;
  opacity: 1 !important;
  cursor: default;
}

/* ===== Close Button ===== */
:deep(.watch-dialog__close.p-dialog-header-close) {
  position: absolute !important;
  top: var(--watch-close-offset) !important;
  right: var(--watch-close-offset) !important;
  width: 40px;
  height: 40px;
  margin: 0 !important;
  z-index: 10;
  border-radius: 10px;
}
:deep(.watch-btn.p-button .p-button-label) {
  color: #000 !important;
}

/* ===== token 文本 + 图标整体 ===== */
.token-wrap {
  display: inline-flex;
  align-items: center;     /* ✅ 关键：中心线统一 */
  gap: 4px;
  vertical-align: middle; /* ✅ 与前面文字基线对齐 */
}

/* 数字 2 */
.token-count {
  font-size: inherit;      /* 与标题文字完全一致 */
  font-weight: inherit;
  line-height: 1;          /* 防止上下偏移 */
}


/* ===== 纯 Video Overlay ===== */
.video-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.9);
}

.overlay-video {
  display: block;
  width: min(960px, 90vw);
  aspect-ratio: 16 / 9;

  background: #000;
  object-fit: contain;
}
</style>