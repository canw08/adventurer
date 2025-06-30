<template>
  <div class="layout-container">
    <!-- 左栏 -->
    <div class="sidebar">
      <div class="profile-header">
        <Avatar
          image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
          shape="circle"
          size="xlarge"
        />
        <h2>大帅哥-周心阳</h2>
        <p class="user-id">ID：090129</p>
      </div>
      <div class="menu-list">
        <div
          class="menu-button"
          :class="{ active: activeMenu === 'projects' }"
          @click="activeMenu = 'projects'"
        >
          My Projects
        </div>
        <div
          class="menu-button"
          :class="{ active: activeMenu === 'task' }"
          @click="activeMenu = 'task'"
        >
          My Task
        </div>
      </div>
    </div>

    <!-- 右侧 -->
    <div class="main-content">
      <div class="main-header" style="border-bottom: 2px solid #d5dbe5;">
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
            <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>
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
  <div class="grid-container">
    <div
      v-for="project in filteredProjects.slice(0, 6)"
      :key="project.id"
      class="project-card"
    >
      <img :src="project.image" alt="Project image" class="project-image" />
      <div class="project-content">
        <h3 class="project-title">{{ project.title }}</h3>
        <p class="project-date">{{ project.date }}</p>
        <div class="project-avatar">
          <Avatar
            image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
            shape="circle"
            size="large"
          />
        </div>
      </div>
    </div>
  </div>
</div>
</div> </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';
import SelectButton from 'primevue/selectbutton';
import OverlayPanel from 'primevue/overlaypanel';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Card from 'primevue/card';

const activeMenu = ref('projects');
const activeTab = ref('ongoing');
const tabOptions = ref(['ongoing', 'completed']);

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

const allProjects = [
  {
    id: 1,
    title: 'Volunteer Feeding Stray Cats',
    date: '5 July, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/cat/400/200',
  },
  {
    id: 2,
    title: 'Organize Community Book Drive',
    date: '12 June, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/book/400/200',
  },
  {
    id: 3,
    title: 'Schoolyard Cleanup Event',
    date: '20 May, 2025',
    status: 'completed',
    image: 'https://picsum.photos/seed/school/400/200',
  },
  {
    id: 4,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/poster/400/200',
  },
    {
    id: 1,
    title: 'Volunteer Feeding Stray Cats',
    date: '5 July, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/cat/400/200',
  },
  {
    id: 2,
    title: 'Organize Community Book Drive',
    date: '12 June, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/book/400/200',
  },
  {
    id: 3,
    title: 'Schoolyard Cleanup Event',
    date: '20 May, 2025',
    status: 'completed',
    image: 'https://picsum.photos/seed/school/400/200',
  },
  {
    id: 4,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/poster/400/200',
  },
];

const filteredProjects = computed(() =>
  allProjects.filter((p) => p.status === activeTab.value)
);
const runningProjects = computed(() =>
  allProjects.filter((p) => p.status === 'ongoing')
);
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fb;
  font-family: 'Segoe UI', sans-serif;
}
.sidebar {
  width: 280px;
  background-color: #e9f0fb;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
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
  border-radius: 8px;
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
  cursor: pointer;
  transition: 0.3s;
}
.menu-button.active {
  background-color: #304ffe;
  color: white;
}
.main-content {
  flex: 1;
  padding: 32px 48px;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fb;
}
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 8px;
}
.header-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}
.bell-right-group {
  display: flex;
  align-items: center;
  gap: 8px;
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
.notification-wrapper {
  position: relative;
  cursor: pointer;
  padding: 6px;
}
.notify-bell {
  font-size: 28px;
  color: black;
  background: transparent;
  border: none;
  padding: 0;
}
.badge {
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
  box-shadow: 0 0 2px rgba(0, 0, 0, 0.3);
}
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
  font-weight: normal;
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
  border-color: #304ffe;
}


.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
}

.project-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-4px);
}

.project-image {
  width: 100%;
  height: 140px;
  object-fit: cover;
}

.project-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.project-title {
  font-size: 18px;
  font-weight: bold;
  margin: 8px 0 4px;
  text-align: center;
  color: #222;
}

.project-date {
  font-size: 14px;
  color: #888;
  margin-bottom: 12px;
}

.project-avatar {
  margin-top: auto;
}
</style>