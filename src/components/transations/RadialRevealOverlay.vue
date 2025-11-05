<template>
  <div v-show="visible" class="radial-overlay" :style="{ zIndex: String(zIndex) }">
    <div ref="ball" class="ball" :style="ballCssVars"></div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onMounted, onBeforeUnmount } from 'vue'

const visible = ref(false)
const ball = ref(null)

// 记录最近一次指针位置
const lastPointer = reactive({ x: null, y: null })
function handlePointerDown(e) {
  lastPointer.x = e.clientX
  lastPointer.y = e.clientY
}
onMounted(() => {
  window.addEventListener('pointerdown', handlePointerDown, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', handlePointerDown)
})

const st = reactive({
  color: '#FEF1F5',
  size: 160,      // px
  cx: 0, cy: 0,   // px
  zIndex: 2147483647
})

const zIndex = computed(() => st.zIndex)
const ballCssVars = computed(() => ({
  '--size': st.size + 'px',
  '--cx': st.cx + 'px',
  '--cy': st.cy + 'px',
  '--color': st.color
}))

let playing = false

function coverScale({ w, h, cx, cy, r }) {
  const dx = Math.max(cx, w - cx)
  const dy = Math.max(cy, h - cy)
  const dist = Math.hypot(dx, dy)
  return (dist / r) * 1.05 // 5% 冗余，确保覆盖
}

/**
 * 播放转场
 * @param {object} opts
 *  - to: 路由目标（可选）
 *  - push: (to)=>Promise 路由切换函数（可选）
 *  - color: '#FEF1F5'
 *  - baseSize: 160  (px)
 *  - coverDuration: 240 (ms) 覆盖
 *  - shrinkDuration: 380 (ms) 缩回
 *  - center: 'center' | {x,y} | MouseEvent | 'auto' | 方位
 *  - zIndex: 置顶层级（默认 2147483647）
 */
async function play(opts = {}) {
  if (playing) return
  playing = true

  const {
    to = null,
    push = null,
    color = '#FEF1F5',
    baseSize = 160,
    coverDuration = 300,
    shrinkDuration = 380,
    center = 'auto',
    zIndex = 99
  } = opts

  st.color = color
  st.size = baseSize
  st.zIndex = zIndex

  const w = window.innerWidth
  const h = window.innerHeight

  let cx, cy
  if (center === 'auto' || !center) {
    // 优先使用最近一次指针位置；无记录时使用屏幕 85%×85%（偏右下，像 FAB 动画的感觉）
      cx = w
      cy = h

  } else if (center === 'center') {
    cx = w / 2; cy = h / 2
  } else if (center?.x != null && center?.y != null) {
    cx = center.x; cy = center.y
  } else if (center?.clientX != null) {
    cx = center.clientX; cy = center.clientY
  } else if (typeof center === 'string') {
    // 一些方便的方位预设
    const map = {
      'top-left':   [0.15, 0.15],
      'top-right':  [0.85, 0.15],
      'bottom-left':[0.15, 0.85],
      'bottom-right':[0.85, 0.85]
    }
    const preset = map[center]
    if (preset) { cx = Math.round(w * preset[0]); cy = Math.round(h * preset[1]) }
    else { cx = w / 2; cy = h / 2 }
  } else {
    cx = w / 2; cy = h / 2
  }
  st.cx = cx; st.cy = cy

  visible.value = true
  await nextTick()

  const el = ball.value
  const r = st.size / 2
  const scaleTo = coverScale({ w, h, cx, cy, r })

  // 初始：保持 scale(0)
  el.style.transform = 'scale(0)'
  el.style.opacity = '1'
  el.style.background = st.color

  // 直接覆盖（0 → scaleTo）
  await el.animate(
    [{ transform: 'scale(0)' }, { transform: `scale(${scaleTo})` }],
    { duration: coverDuration, easing: 'ease-in-out', fill: 'forwards' }
  ).finished.catch(() => {})

  // 切路由（已被遮挡）
  if (to != null && typeof push === 'function') {
    try { await push(to) } catch {}
    await new Promise(r => requestAnimationFrame(() => r()))
  }

  // 缩回（scaleTo → 0）
  await el.animate(
    [{ transform: `scale(${scaleTo})` }, { transform: 'scale(0)' }],
    { duration: shrinkDuration, easing: 'ease-in-out', fill: 'forwards' }
  ).finished.catch(() => {})

  visible.value = false
  playing = false
}

defineExpose({ play })
</script>

<style scoped>
.radial-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  /* 永远置顶：再配合运行时 z-index 2147483647 */
}

.ball {
  position: fixed;
  left: calc(var(--cx) - var(--size) / 2);
  top: calc(var(--cy) - var(--size) / 2);
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  background: var(--color);
  transform: scale(0);
  will-change: transform;
  contain: layout paint style;
  backface-visibility: hidden;
}
</style>
