<template>
  <Teleport to="body">
    <transition name="pet-fade">
      <div v-if="VISIBLE" class="desktop-pet" :style="rootStyle" role="application" aria-label="desktop pet">
        <!-- 宠物本体（可拖拽） -->
        <button
          ref="petEl"
          class="desktop-pet__body pixelated"
          type="button"
          aria-label="desktop pet"
          @pointerdown.stop="onPointerDown"
          @click="onPetClick"
        >
          <img :src="AVATAR" alt="" draggable="false" :class="{ mirrored: isRightSide }" />
        </button>

        <!-- 交互面板 -->
        <div
        v-if="panelOpen"
        class="desktop-pet__panel"
        :class="{ 'panel--left': panelSide === 'left', 'panel--right': panelSide === 'right' }"
        :style="panelStyle"
        role="dialog"
        aria-live="polite"
        >

          <button class="desktop-pet__close" aria-label="关闭" @click="panelOpen = false">×</button>

          <div class="desktop-pet__panel-head">
            <p class="desktop-pet__greeting">I can help you to...</p>
          </div>

<div class="desktop-pet__panel-actions">
  <button
  class="desktop-pet__btn"
  type="button"
  @pointerdown.stop
  @click="dispatch('open-bag')"
>
  Open your bag
</button>
</div>

          <div class="desktop-pet__tail"></div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import avatarUrl from '../../assets/tiper.png'

/** =========================
 *  组件内参数：外部不传参
 *  ========================= */
const VISIBLE = true
const AVATAR = avatarUrl
const SIZE = 160

const INIT_MARGIN = 8
function getInitialPosition() {
  const w = window.innerWidth
  const h = window.innerHeight
  return {
    x: Math.max(0, w - SIZE - INIT_MARGIN),
    y: Math.max(0, h - SIZE - INIT_MARGIN)
  }
}

const { x: INIT_X, y: INIT_Y } = getInitialPosition()

const emit = defineEmits(['action'])

function dispatch(action) {
  emit('action', action)
  panelOpen.value = false
}
// 拖动阈值：避免拖动后误触发 click
const DRAG_THRESHOLD = 6

// 重力参数（像素/秒）
const GRAVITY = 540
const MAX_VY = 5200
const STOP_EPS = 0.6


/** =========================
 *  状态
 *  ========================= */
const petEl = ref(null)

// 用 left/top 定位：重力更直观
const x = ref(INIT_X)
const y = ref(INIT_Y)

const panelOpen = ref(false)


// 拖拽状态
const dragging = ref(false)
const pointerId = ref(null)
const start = ref({ px: 0, py: 0, x: 0, y: 0 })
const moved = ref(false)

// 重力状态
const falling = ref(false)
const rafId = ref(0)
const vy = ref(0)
const lastTick = ref(0)

const panelStyle = computed(() => {
  // 面板与宠物之间的水平“咬合”距离（让尾巴贴近）
  const overlap = 36
  const bottom = Math.round(SIZE * 0.28)

  // 绝对定位：不参与 flex 布局，不会把宠物挤走/撑出屏幕
  return panelSide.value === 'right'
    ? { left: `${SIZE - overlap}px`, bottom: `${bottom}px` }
    : { right: `${SIZE - overlap}px`, bottom: `${bottom}px` }
})


/** =========================
 *  计算属性
 *  ========================= */
const rootStyle = computed(() => ({
  left: `${x.value}px`,
  top: `${y.value}px`,
  '--pet-size': `${SIZE}px`
}))

// 宠物在屏幕右侧 -> 镜像
const isRightSide = computed(() => {
  const w = window.innerWidth || 0
  return (x.value + SIZE / 2) > (w / 2)
})

// 面板方向：宠物在屏幕左侧 -> 面板显示在右边；否则显示在左边
const panelSide = computed(() => (isRightSide.value ? 'left' : 'right'))

/** =========================
 *  工具函数
 *  ========================= */
function clampToViewport(nx, ny) {
  const w = window.innerWidth
  const h = window.innerHeight
  const maxX = Math.max(0, w - SIZE)
  const maxY = Math.max(0, h - SIZE)
  return {
    cx: Math.min(Math.max(0, nx), maxX),
    cy: Math.min(Math.max(0, ny), maxY)
  }
}

function stopGravity() {
  falling.value = false
  vy.value = 0
  lastTick.value = 0
  if (rafId.value) cancelAnimationFrame(rafId.value)
  rafId.value = 0
}

function startGravity(initialVy = 0) {
  stopGravity()
  falling.value = true
  vy.value = Math.min(Math.max(initialVy, 0), MAX_VY)
  lastTick.value = performance.now()

  const loop = (now) => {
    if (!falling.value || dragging.value) return

    const dt = Math.min(0.033, (now - lastTick.value) / 1000)
    lastTick.value = now

    vy.value = Math.min(MAX_VY, vy.value + GRAVITY * dt)

    const ny = y.value + vy.value * dt
    const { cy } = clampToViewport(x.value, ny)

    const floorY = window.innerHeight - SIZE
    const hitFloor = cy >= floorY - 0.01
    y.value = cy

    if (hitFloor && vy.value <= STOP_EPS) {
      stopGravity()
      return
    }

    rafId.value = requestAnimationFrame(loop)
  }

  rafId.value = requestAnimationFrame(loop)
}

/** =========================
 *  事件：拖拽
 *  ========================= */
function onPointerDown(e) {
  if (e.button != null && e.button !== 0) return

  // 拖动时停止下落
  stopGravity()

  pointerId.value = e.pointerId
  petEl.value?.setPointerCapture?.(e.pointerId)

  dragging.value = true
  moved.value = false
  start.value = { px: e.clientX, py: e.clientY, x: x.value, y: y.value }
}

function onPointerMove(e) {
  if (!dragging.value) return
  if (pointerId.value != null && e.pointerId !== pointerId.value) return

  const dx = e.clientX - start.value.px
  const dy = e.clientY - start.value.py

  if (!moved.value && Math.hypot(dx, dy) >= DRAG_THRESHOLD) moved.value = true

  const nx = start.value.x + dx
  const ny = start.value.y + dy

  const { cx, cy } = clampToViewport(nx, ny)
  x.value = cx
  y.value = cy
}

function onPointerUp(e) {
  if (!dragging.value) return
  if (pointerId.value != null && e.pointerId !== pointerId.value) return

  dragging.value = false
  pointerId.value = null

  // 松手开始下落（如果没到底）
  const floorY = window.innerHeight - SIZE
  if (y.value < floorY - 0.5) startGravity(0)
}

/** =========================
 *  面板交互
 *  ========================= */
function onPetClick(e) {
  // 拖动后的 click 吞掉
  if (moved.value) {
    e.preventDefault()
    e.stopPropagation()
    return
  }
  stopGravity()
  panelOpen.value = !panelOpen.value
}

/** =========================
 *  其他：键盘、resize
 *  ========================= */
function onKey(e) {
  if (e.key === 'Escape' && panelOpen.value) panelOpen.value = false
}

function onResize() {
  const { cx, cy } = clampToViewport(x.value, y.value)
  x.value = cx
  y.value = cy
}

onMounted(async () => {
  await nextTick()
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
  window.addEventListener('pointercancel', onPointerUp, { passive: true })
  window.addEventListener('keydown', onKey)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  stopGravity()
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('pointercancel', onPointerUp)
  window.removeEventListener('keydown', onKey)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.desktop-pet {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}

.desktop-pet__body {
  pointer-events: auto;
  width: var(--pet-size);
  height: var(--pet-size);
  border: 0;
  padding: 0;
  background: transparent;
  cursor: grab;
  filter: drop-shadow(0 6px 14px rgba(0, 0, 0, 0.18));
  user-select: none;
  -webkit-user-drag: none;
  touch-action: none;
}
.desktop-pet__body:active {
  cursor: grabbing;
}

.desktop-pet__body img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: 50% 50%;
}
.desktop-pet__body img.mirrored {
  transform: scaleX(-1);
}

/* 头部 */
.desktop-pet__panel-head {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 18px; /* 给关闭按钮留空间 */
}

.desktop-pet__greeting {
  margin: 0;
  line-height: 1.45;
  font-size: 14px;
}

/* 按钮区 */
.desktop-pet__panel-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 12px;
}

.desktop-pet__btn {
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  border-radius: 10px;
  padding: 10px 10px;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  transition: transform 0.06s ease, box-shadow 0.12s ease;
}
.desktop-pet__btn:active {
  transform: translateY(1px);
}

/* 尾巴：默认在面板左边（指向宠物在左边的情况） */
.desktop-pet__tail {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  filter: drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
}

/* 面板在右侧：尾巴在左边指向左 */
.desktop-pet__panel.panel--right .desktop-pet__tail {
  left: -8px;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-right: 9px solid #fff;
}

/* 面板在左侧：尾巴在右边指向右 */
.desktop-pet__panel.panel--left .desktop-pet__tail {
  right: -8px;
  border-top: 9px solid transparent;
  border-bottom: 9px solid transparent;
  border-left: 9px solid #fff;
}

.desktop-pet__close {
  position: absolute;
  right: 8px;
  top: 6px;
  width: 26px;
  height: 26px;
  border: 0;
  background: transparent;
  font-size: 18px;
  line-height: 26px;
  cursor: pointer;
  color: #666;
}

/* transition */
.pet-fade-enter-from,
.pet-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
.pet-fade-enter-active,
.pet-fade-leave-active {
  transition: all 0.18s ease;
}
.desktop-pet__panel {
  pointer-events: auto;
  position: absolute;          /* ✅ 关键：不参与 flex，避免撑宽导致跑位 */
  width: min(78vw, 320px);
  background: #fff;
  color: #222;
  border-radius: 14px;
  padding: 14px 14px 12px;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.14);
  border: 1px solid rgba(0, 0, 0, 0.06);

  margin: 0;                   /* ✅ 不再用 margin 做方向 */
}

/* ✅ 下面这两段如果你之前有，请删除或让它们不再生效
.desktop-pet__panel.panel--right { margin-left: ... }
.desktop-pet__panel.panel--left  { margin-right: ... }
*/

</style>
