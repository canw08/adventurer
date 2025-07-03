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
        <p class="user-id">ID：A2107034</p>
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
          <span class="header-left">
            {{ activeMenu === 'projects' ? 'My Projects' : 'My Task' }}
          </span>
          <div class="vertical-divider"></div>
          <span class="header-right" v-if="activeMenu === 'projects'">
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

      <div class="main-subheader" v-if="activeMenu === 'projects'">
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
          <!-- Projects -->
          <template v-if="activeMenu === 'projects'">
            <div
              v-for="project in filteredProjects"
              :key="project.id"
              class="project-card"
            >
              <img :src="project.image" alt="Project Image" class="project-image" />
              <div class="project-content">
                <h3 class="project-title">{{ project.title }}</h3>
                <div class="project-date">{{ project.date }}</div>
              </div>
            </div>
          </template>

          <!-- Tasks -->
          <template v-else-if="activeMenu === 'task'">
            <div
              v-for="task in tasks"
              :key="task.id"
              class="task-card"
            >
              <h3 class="task-title">{{ task.title }}</h3>
              <div class="task-time">
                <i class="pi pi-clock"></i>
                <span>{{ task.date }}</span>
              </div>
              <div class="task-exp">{{ task.exp }}</div>
              <div class="task-teamwork">
               <img src="/image/teamwork.png" alt="Teamwork" class="task-teamwork-image" />
                <div class="teamwork-text">{{ task.teamworkText }}</div>
              </div>
              <div class="task-footer">
                <div class="avatar-wrapper">
                  <Avatar
                    image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
                    shape="circle"
                    class="user-avatar"
                  />
                </div>
                <span class="task-level">{{ task.level }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';
import SelectButton from 'primevue/selectbutton';
import OverlayPanel from 'primevue/overlaypanel';
import Button from 'primevue/button';

const activeMenu = ref('projects');
const activeTab = ref('ongoing');
const tabOptions = ref(['ongoing', 'completed']);

const tasks = ref([
  {
    id: 1,
    title: 'Volunteer feeding the cat',
    date: '5 July, 2025',
    exp: '500 exp',
    image: '/image/teamwork.png',
    teamworkText: 'Teamwork',
    level: 'Level B',
  },
]);

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
    exp: '300 exp',
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
/* ✅ 已删除重复，合并冲突，保留全部 CSS（与之前整理输出一致） */
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
}
.main-body { position: relative; flex: 1; display: flex; flex-direction: column; }
.card-background { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: #f3f7fe; border-radius: 12px; z-index: 0; }
.grid-container { position: relative; z-index: 1; display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 24px; padding: 24px; }
.sidebar { width: 280px; background-color: #f3f7fe; color: #333; display: flex; flex-direction: column; align-items: center; padding: 32px 16px; border-right: 1px solid #e3eaf5; }

</style>
<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
}
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
  border: 1px solid #e3eaf5;
}

.grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 24px;
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
  cursor: pointer;
  transition: 0.3s;
}
.menu-button.active {
  background-color: #2A2C56;
  color: white;
}
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
  padding: 16px;
}
.notify-bell .p-button-icon {
  font-size: 48px;
  color: black;
  background: transparent;
  border: none;
  padding: 0;
}
/* ✅ 修改 .badge 为 .notification-badge 避免冲突 */
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
.project-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}
.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
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
.task-time {
  color: #8a8a8a;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.task-time span {
  color: #999;
  font-size: 16px;
}
.task-exp {
  color: #879fe9;
  font-size: 20px;
  text-shadow: 0 1px white;
  font-weight: bold;
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
/* ✅ 合并 .task-level 定义 */
.task-level {
  color: #03bafc;
  font-weight: bold;
  font-size: 18px;
  text-align: right;
  padding-right: 16px;
}
/* ✅ 合并 .task-footer 定义 */
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  margin-top: 12px;
}
.avatar-wrapper .p-avatar img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
}
</style>
