<template>
  <div class="layout-container">
    <div class="notification-wrapper" @click="togglePanel($event)">
      <!-- 铃铛图标文本 -->
      <span class="bell-text">🔔</span>
      <!-- 红点数字 -->
      <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
    </div>

    <!-- 公告弹窗 -->
    <OverlayPanel ref="op" class="announcement-panel">
      <div class="panel-title">📢 公告通知</div>
      <ul class="announcement-list">
        <li v-for="(item, index) in announcements" :key="index">
          <div class="announcement-date">{{ item.date }}</div>
          <div class="announcement-content">{{ item.content }}</div>
        </li>
      </ul>
    </OverlayPanel>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import OverlayPanel from 'primevue/overlaypanel';

const op = ref(null);

const togglePanel = (event) => {
  op.value.toggle(event);
  unreadCount.value = 0;
};

const announcements = ref([
  {
    date: '2025年6月26日',
    content: '你们是否发现周围有个集所有美德于一身的人？没错，他叫周心阳。',
  },
  {
    date: '2025年6月25日',
    content: '系统将于今晚 10 点维护，请保存好数据。',
  },
]);

const unreadCount = ref(announcements.value.length);
</script>

<style scoped>
.layout-container {
  padding: 48px;
  background-color: #f5f7fb;
  height: 100vh;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}

.notification-wrapper {
  position: relative;
  cursor: pointer;
  font-size: 28px;
  color: #304ffe;
  padding: 10px;
  user-select: none;
}

.bell-text {
  font-size: 28px;
}

/* 红点 */
.badge {
  position: absolute;
  top: 4px;
  right: 0px;
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  border-radius: 50%;
  padding: 2px 6px;
  min-width: 20px;
  text-align: center;
  line-height: 1.3;
}

/* 公告弹窗样式 */
.announcement-panel {
  width: 300px;
  background-color: #fffefc;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  line-height: 1.5;
}

.panel-title {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
  color: #222;
}

.announcement-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.announcement-list li {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dashed #ddd;
}

.announcement-date {
  font-size: 13px;
  color: #888;
  margin-bottom: 4px;
}

.announcement-content {
  font-size: 14px;
  color: #333;
}
</style>