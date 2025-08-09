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
    <OverlayPanel ref="op" class="announcement-panel">
      <ul class="announcement-list">
        <li
          v-for="a in store.ordered"
          :key="a.id"
          class="announcement-item"
          tabindex="0"
          role="button"
          @click="open(a)"
          @keydown.enter.prevent="open(a)"
          @keydown.space.prevent="open(a)"
        >
          <!-- 行头：头像 + 名称（每条都有自己的） -->
          <div class="item-header">
            <img
              :src="dicebear(a.avatarSeed)"
              alt="avatar"
              class="avatar-img"
            />
            <div class="name-and-type">
              <div class="name">{{ a.name || 'Bridgette-文碧之' }}</div>
              <div class="event-type">{{ a.type || '事件类型' }}</div>
            </div>
            <span v-if="!a.read" class="dot-unread" aria-hidden="true"></span>
          </div>

          <!-- 简介 -->
          <div class="event-desc line-clamp-2">
            {{ a.content }}
          </div>

          <!-- 提示 -->
          <div class="click-hint">点击查看详情</div>
        </li>
      </ul>
    </OverlayPanel>

    <!-- 详情弹窗 -->
    <Dialog v-model:visible="visible" modal :header="dlgHeader" :style="{ width: '520px' }" dismissableMask>
      <template v-if="current">
        <div class="text-xs text-gray-500 mb-2">{{ fmt(current.dateISO) }}</div>
        <div class="whitespace-pre-wrap leading-relaxed">{{ current.content }}</div>
      </template>
      <template #footer>
        <Button label="关闭" @click="visible = false" />
      </template>
    </Dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Button from 'primevue/button'
import OverlayPanel from 'primevue/overlaypanel'
import Dialog from 'primevue/dialog'
import { useAnnouncementStore } from '../../stores/announcement' // 确保路径正确

const store = useAnnouncementStore()

const op = ref()
const visible = ref(false)
const current = ref(null)
const dlgHeader = computed(() => current.value ? `公告 - ${current.value.name || 'Bridgette-文碧之'}` : '公告详情')

function toggle(e){
  op.value?.toggle(e)
}

function open(a){
  current.value = a
  visible.value = true
  op.value?.hide()
  if(!a.read) store.markRead(a.id)
}

function fmt(iso){
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: '2-digit' }).format(new Date(iso))
}

/** 头像生成：缺省给一个固定种子，或从每条 item 的 avatarSeed 取 */
function dicebear(seed){
  const s = seed || 'bridgette'
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(s)}`
}
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
</style>
