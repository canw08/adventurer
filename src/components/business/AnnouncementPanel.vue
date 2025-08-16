<template>
  <div class="announce-root">

    <!-- 铃铛 + 徽章 -->
    <div class="notification-wrapper">
      <Button icon="pi pi-bell" class="notify-bell" text rounded @click="toggle" />
      <span v-if="store.unreadCount > 0" class="notification-badge" aria-live="polite">
        {{ store.unreadCount }}
      </span>
    </div>

    <!-- 公告列表 -->
    <OverlayPanel ref="op" class="announcement-panel" @hide="resetClearButton">

      <!-- 浮动的清除按钮（左上角） -->
      <button
        v-if="op?.visible"
        class="floating-mark-all"
        :class="{ expanded: expanded, done: done }"
        @click.stop="handleClearClick"
        :aria-label="buttonLabel"
      >
        <span v-if="!expanded">&times;</span>
        <span v-else-if="expanded && !done">{{ buttonLabel }}</span>
        <span v-else>✔</span>
      </button>

      <ul class="announcement-list">
        <li
          v-for="a in items"
          :key="a.id"
          class="announcement-item"
          tabindex="0"
          role="button"
          @click="open(a)"
          @keydown.enter.prevent="open(a)"
          @keydown.space.prevent="open(a)"
        >
          <!-- 行头：头像 + 名称 -->
          <div class="item-header">
            <img
              :src="dicebear(a.typeKey,a.avatarSeed)"
              alt="avatar"
              class="avatar-img"
            />
            <div class="name-and-type">
              <div class="name">{{ a.displayName }}</div>
              <div class="event-type">{{ a.typeLabel }}</div>
            </div>
            <span v-if="!a.read" class="dot-unread" aria-hidden="true"></span>
          </div>

          <!-- 简介 -->
          <div class="event-desc line-clamp-2">
            {{ a.content }}
          </div>

          <!-- 提示 -->
          <div class="click-hint">{{ a.clickHint }}</div>
        </li>
      </ul>

      <!-- 放在 <ul class="announcement-list">...</ul> 后面 -->
      <div class="show-all-container">
        <button class="show-all-btn" @click="showAll" :aria-label="t('notifications.showAll')">
          <span class="arrow-head" aria-hidden="true"></span>
        </button>
        <span class="show-all-text">{{ t('notifications.showAll') }}</span>
      </div>

    </OverlayPanel>

    <!-- 详情弹窗 -->
    <component
      v-if="activeDialog"
      :is="activeDialog"
      :key="current?.id"
      v-model:visible="visible"
      :announcement="current"
      @close="visible = false"
    />

  </div>
</template>

<script setup>
/**
 * 父组件完整 <script setup>
 * - 按 typeKey 动态选择不同的弹窗子组件
 * - 仍保留你现有的公告列表、标记已读、Show All 等逻辑
 */

import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import { useAnnouncementStore } from '../../stores/announcement' // 按你的项目路径

// === 异步加载各类弹窗（每种 typeKey 一个组件） ===
const DialogSystem = defineAsyncComponent(() => import('./dialogs/AnnouncementDialogSystem.vue'))
const DialogInvite   = defineAsyncComponent(() => import('./dialogs/AnnouncementDialogInvite.vue'))
// const DialogPR     = defineAsyncComponent(() => import('./dialogs/AnnouncementDialogPR.vue'))
// …根据需要继续扩展

// 映射表：typeKey -> 组件
const dialogRegistry = {
  system: DialogSystem,
  invite:   DialogInvite,
  // pr:     DialogPR,
  // unknown 或未注册类型都回退到 system
}

const store = useAnnouncementStore()
const { t } = useI18n()

// 首次挂载拉取数据
onMounted(() => {
  store.fetchAll()
})

// ===== 弹出面板（OverlayPanel）与当前公告 =====
const op = ref()
const visible = ref(false)     // 统一控制子弹窗显示/隐藏
const current = ref(null)      // 当前被点击的公告项（原始对象）

// 根据当前项的 typeKey 选择对应的弹窗组件；默认回退到 system
const activeDialog = computed(() => {
  if (!current.value) return null
  return dialogRegistry[current.value.typeKey] ?? DialogSystem
})

// ===== 视图数据：在不改动 store 的前提下做 i18n/l10n 兜底 =====
const items = computed(() =>
  store.ordered.map(a => ({
    ...a,
    displayName: a.name ?? t('notifications.systemName'),
    typeLabel: t(`notifications.type.${a.typeKey || 'unknown'}`),
    dateLabel: a.dateISO || t('common.na'),
    clickHint: t('notifications.clickToView'),
  }))
)

// 打开/关闭 OverlayPanel
function toggle(e){
  op.value?.toggle(e)
}

// 打开某一条公告对应的弹窗
function open(a){
  current.value = a
  visible.value = true
  op.value?.hide()
  if (!a.read) store.markRead(a.id)
}

// 日期格式化（与你原来的保持一致）
function fmt(iso){
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  }).format(new Date(iso))
}

/** 头像：缺省给固定 seed；system 用 bottts，其他用 adventurer */
function dicebear(name, seed) {
  const s = seed || 'bridgette'
  if (name && name.toLowerCase() === 'system') {
    return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(s)}`
  }
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(s)}`
}

// ===== 浮动“全部标记为已读”按钮状态与逻辑 =====
const expanded = ref(false) // 是否展开状态（显示“全部标记为已读”文字）
const done = ref(false)     // 是否完成（打勾）

const buttonLabel = computed(() => {
  if (!expanded.value) return t('notifications.markAll')
  if (expanded.value && !done.value) return t('notifications.markAll')
  return '✔'
})

function handleClearClick() {
  if (!expanded.value) {
    // 第一次点击：进入展开态
    expanded.value = true
    done.value = false
  } else if (!done.value) {
    // 第二次点击：执行全部标记为已读，进入完成态
    for (const a of store.ordered) {
      if (!a.read) store.markRead(a.id)
    }
    done.value = true
  }
}

// 面板收起时还原浮动按钮状态
function resetClearButton() {
  expanded.value = false
  done.value = false
}

// ===== “显示所有通知”事件（抛给父级 / 页面容器） =====
const emit = defineEmits(['showAll'])
function showAll() {
  emit('showAll')
  op.value?.hide()
}

// ===== 对外暴露给模板使用的成员（可选，不暴露也能用） =====
defineExpose({
  toggle, open, fmt, dicebear,
  activeDialog, visible, current,
  items,
  handleClearClick, resetClearButton, buttonLabel,
  showAll,
})
</script>


<style scoped>
/* 根容器 */
.announce-root {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

/* 铃铛与徽章 */
.notification-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.notify-bell:deep(.p-button) { padding: 8px; }
.notify-bell:deep(.p-button-icon) { font-size: 18px; }
.notification-badge {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #ef4444;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #fff;
  line-height: 1;
  pointer-events: none;
}

/* 面板 */
.announcement-panel {
  width: 360px;
  background: #fffefc;
  padding: 12px 12px 4px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 6px 16px rgba(0,0,0,.1);
}

/* 列表强制去掉小圆点 */
.announcement-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* 每条公告 */
.announcement-item {
  padding: 10px 8px 12px;
  border-bottom: 1px dashed #ddd;
  cursor: pointer;
  border-radius: 8px;
}
.announcement-item:last-child { border-bottom: 0; }
.announcement-item:hover,
.announcement-item:focus { background: #fff3e0; outline: none; }

/* 头部：头像 + 名称 + 未读点 */
.item-header {
  display: grid;
  grid-template-columns: 36px 300px auto; /* 36px 头像 + 120px 固定名字区域 + 剩余给未读点 */
  align-items: center;
  column-gap: 10px;
}

.name-and-type {
  width: 300px;         /* 固定宽度 */
  overflow: hidden;
}

.name {
  font-weight: 700;
  font-size: 14px;
  color: #222;
  white-space: nowrap;  /* 不换行 */
  overflow: hidden;
  text-overflow: ellipsis; /* 超出显示省略号 */
}

.event-type {
  font-weight: 700;
  font-size: 13px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.avatar-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
}

.dot-unread {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}

/* 简介 */
.event-desc {
  font-size: 13px;
  color: #555;
  margin-top: 6px;
}

/* 点击提示 */
.click-hint {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

/* 多行省略（含标准属性） */
.line-clamp-2 {
  display: -webkit-box; display: box;
  line-clamp: 2; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}

/* 修改：让容器成为定位上下文 */
.announce-root {
  position: relative;
}

/* 新增：浮动按钮（左上角、悬浮在外头） */
.floating-mark-all {
  position: absolute;
  top: -10px;           /* 悬浮到外面一点 */
  left: -10px;
  z-index: 10;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all .2s ease;
}
.floating-mark-all:hover { transform: scale(1.05); }

/* 点击后变为“全部标记为已读”的胶囊态 */
.floating-mark-all.cleared {
  padding: 6px 10px;
  width: auto;
  height: auto;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

/* 新增：面板底部“显示所有通知”区域 */
.show-all-container {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  padding: 10px 0 4px;
}

.show-all-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.show-all-btn:hover { background: #fff3e0; }

/* 仅箭头头部（向下的三角形，没有箭杆） */
.arrow-head {
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 8px solid #333; /* 向下箭头 */
}

.show-all-text {
  font-size: 12px;
  color: #555;
}

/* 默认 X 状态 */
.floating-mark-all {
  position: absolute;
  top: -40px;
  left: 6px;
  z-index: 20;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 1px solid #e5e7eb;
  background: #fff;
  box-shadow: 0 4px 10px rgba(0,0,0,.12);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  cursor: pointer;
  transition: all .25s ease;
}

/* 展开状态（显示文字） */
.floating-mark-all.expanded {
  width: auto;
  height: 26px;
  padding: 0 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 600;
}

/* 对勾状态 */
.floating-mark-all.done {
  color: green;
  font-size: 14px;
  font-weight: bold;
}
</style>
