<template>
    <div class="main-header">
    <div class="header-left-group">
        <span class="header-left">My Projects</span>
        <div class="vertical-divider"></div>
        <span class="header-right">
        <span class="running-count">{{ runningProjects.length }}</span>
        <span class="running-label"> running project</span>
        </span>
    </div>
    <div class="bell-right-group">
        <div class="notification-wrapper" @click="togglePanel($event)">
        <Button icon="pi pi-bell" class="notify-bell" text rounded />
        <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount }}</span>
        </div>
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
    </div>

    <div class="main-subheader">
    <span class="greeting">Good morning, adventurer</span>
    <div class="filter-buttons-wrapper small-toggle">
        <SelectButton
        v-model="activeTab"
        :options="tabOptions"
        class="tab-toggle"
        />
    </div>
    </div>

    <!-- 主体卡片区域 -->
    <div class="main-body">
    <div class="card-background"></div>
    <div class="grid-container">
        <!-- Projects 使用 task-card 样式 -->
        <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="task-card"
        >
        <h3 class="task-title">{{ project.title }}</h3>
        <div class="task-time">
            <i class="pi pi-clock"></i>
            <span>{{ project.date }}</span>
        </div>
        <div class="task-exp">{{ project.exp || 'N/A' }}</div>
        <div class="task-teamwork">
            <img :src="project.image" alt="Project Image" class="task-teamwork-image" />
            <div class="teamwork-text">Teamwork</div>
        </div>
        <div class="task-footer">
            <div class="avatar-wrapper">
            <Avatar
                image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                shape="circle"
                class="user-avatar"
            />
            </div>
            <span class="task-level">Level B</span>
        </div>
        </div>
    </div>
    </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
</route>

<script setup>
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';
import SelectButton from 'primevue/selectbutton';
import OverlayPanel from 'primevue/overlaypanel';
import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const router = useRouter();

const activeTab = ref('ongoing');
const tabOptions = ref(['ongoing', 'completed']);

const op = ref(null);
const unreadCount = ref(2);
const togglePanel = (event) => {
  op.value.toggle(event);
  unreadCount.value = 0;
};

const announcements = ref([
  { date: '2025年6月26日', content: '你们是否发现周围有个集所有美德于一身的人？没错，他叫周心阳。' },
  { date: '2025年6月25日', content: '系统将于今晚 10 点维护，请保存好数据。' },
]);

const allProjects = [
  {
    id: 1,
    title: 'Volunteer Feeding Stray Cats',
    date: '5 July, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/cat/400/200',
    exp: '300 exp',
  },
  {
    id: 2,
    title: 'Organize Community Book Drive',
    date: '12 June, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/book/400/200',
    exp: '400 exp',
  },
  {
    id: 3,
    title: 'Schoolyard Cleanup Event',
    date: '20 May, 2025',
    status: 'completed',
    image: 'https://picsum.photos/seed/school/400/200',
    exp: '250 exp',
  },
  {
    id: 4,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/poster/400/200',
    exp: '350 exp',
  },
];

const filteredProjects = computed(() =>
  allProjects.filter((p) => p.status === activeTab.value)
);
const runningProjects = computed(() =>
  allProjects.filter((p) => p.status === 'ongoing')
);
const goToProfile = () => {
  router.push('/student/task');
};
</script>

<style scoped>
/* 全局布局 */
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
}
.sidebar {
  width: 280px;
  background-color: #f3f7fe;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  border-right: 1px solid #e3eaf5;
}
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
.user-id {
  background-color: #e0e0e0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 14px;
  color: #333;
}
.menu-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
.menu-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 14px;
  background-color: #e3eaf5;
  color: #1e1e1e;
}
.menu-button.active {
  background-color: #2A2C56;
  color: white;
}

/* 右侧内容 */
.main-content {
  flex: 1;
  padding: 32px 48px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding-bottom: 8px;
}
.header-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-left {
  font-size: 28px;
  font-weight: 800;
  color: #1e1e1e;
}
.vertical-divider {
  height: 32px;
  width: 2px;
  background-color: #999;
}
.header-right {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.running-count {
  color: #304ffe;
  font-weight: bold;
  font-size: 16px;
}
.running-label {
  color: #888;
  margin-left: 4px;
}

/* 通知 */
.bell-right-group {
  display: flex;
  align-items: center;
  gap: 8px;
}
.notification-wrapper {
  position: relative;
  cursor: pointer;
  padding: 16px;
}
.notify-bell .p-button-icon {
  font-size: 48px;
  color: black;
}
.notification-badge {
  position: absolute;
  top: 2px;
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
.announcement-panel {
  width: 300px;
  background-color: #fffefc;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}
.panel-title {
  font-weight: bold;
  margin-bottom: 12px;
  font-size: 16px;
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

/* Subheader */
.main-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0;
}
.greeting {
  font-style: italic;
  font-size: 16px;
  color: #333;
}
.filter-buttons-wrapper {
  display: inline-flex;
  padding: 2px;
  border: 1px solid #c5d4ea;
  border-radius: 12px;
  background-color: white;
}
.small-toggle {
  transform: scale(0.9);
  transform-origin: right center;
}
.tab-toggle ::v-deep(.p-button) {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 0;
}
.tab-toggle ::v-deep(.p-highlight) {
  background-color: #304ffe;
  color: white;
}

/* 主体卡片区域 */
.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.card-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f3f7fe;
  border-radius: 12px;
  z-index: 0;
}
.grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 24px;
}

/* task-card 样式用于 projects */
.task-card {
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}
.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
.task-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}
.task-time {
  color: #8a8a8a;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.task-exp {
  color: #879fe9;
  font-size: 20px;
  text-shadow: 0 1px white;
  font-weight: bold;
  margin: 8px 0;
}
.task-teamwork img {
  width: 70%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.teamwork-text {
  font-size: 18px;
  font-weight: bold;
  margin-top: 8px;
  text-align: center;
}
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-top: 12px;
}
.task-level {
  color: #03bafc;
  font-weight: bold;
  font-size: 18px;
  text-align: right;
  padding-right: 16px;
}
</style>