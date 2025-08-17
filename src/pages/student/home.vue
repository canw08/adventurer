<template>
    <!-- 右侧 -->
    <div class="main-content">
      <div class="main-header">
        <div class="header-left-group">
          <span class="header-left">{{ $t('questLog.title') }}</span>
          <div class="vertical-divider"></div>
          <span class="header-right">
            <span class="running-count">{{ runningProjects.length }}</span>
            <span class="running-label"> {{ $t('questLog.runningQuest') }}</span>
          </span>
        </div>
        <AnnouncementPanel />
      </div>

      <div class="main-subheader">
        <span class="greeting">{{ $t(greetingKey) }}</span>
        <div class="filter-buttons-wrapper small-toggle">
          <SelectButton
            v-model="activeTab"
            :options="tabOptions"
            optionLabel="label"
            optionValue="value"
            class="tab-toggle"
          />
        </div>
      </div>

      <!-- 主体卡片区域 -->
      <div class="main-body">
        <div class="grid-container">
          <!-- Projects 使用 task-card 样式 -->
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="task-card"
            @click="openProjectDialog(project)"
          >
            <h3 class="task-title">{{ project.title }}</h3>
            <div class="task-time">
              <i class="pi pi-clock"></i>
              <span>{{ project.date }}</span>
            </div>
            <div class="task-exp">{{ project.exp || $t('common.na') }}</div>
            <div class="task-teamwork">
              <img :src="project.image" alt="Project Image" class="task-teamwork-image" />
            </div>
            <div class="task-footer">
              <div class="avatar-wrapper">
                <Avatar
                  :image="project.avatar"
                  shape="circle"
                  style="width: 40px; height: 40px"
                />
                <span class="avatar-name">{{ project.author }}</span>
              </div>
              <span class="task-level">{{ $t('common.level') }} {{ project.level }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗 -->
    <Dialog
      v-model:visible="showDialog"
      modal
      dismissableMask
      :closable="false"
      :style="{ width: '1100px', height: '700px', position: 'relative' }"
      class="project-dialog"
    >
      <template #header>
        <div class="dialog-custom-header">
          <div class="dialog-header-left">
            <Button
              icon="pi pi-arrow-left"
              text
              class="dialog-back-button"
              @click="showDialog = false"
            />
          </div>
          <div class="dialog-header-center">
            <span class="dialog-title">{{ selectedProject?.title || '' }}</span>
          </div>
          <div class="floating-dialog-level">
            Level {{ selectedProject?.level || '' }}
          </div>
        </div>
      </template>

      <div class="dialog-content-wrapper">
        <div class="dialog-left-section">
          <div class="dialog-vertical-divider"></div>
          <div class="dialog-date">
            <i class="pi pi-clock dialog-icon"></i>
            <span>{{ selectedProject?.date || '' }}</span>
          </div>

          <div class="dialog-author">
            <Avatar
              :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
              shape="circle"
              size="large"
              style="width: 40px; height: 40px"
            />
            <span class="author-name">{{ selectedProject?.author || '' }}</span>
          </div>

          <div class="dialog-description-row">
            <div class="fake-avatar-space"></div>
            <p class="dialog-description">
              {{ selectedProject?.description || '无任务说明' }}
            </p>
          </div>

          <div class="dialog-images">
            <div class="image-placeholder"></div>
            <div class="image-placeholder"></div>
          </div>
          <!-- 左下角按钮组（保留原有） -->
        </div>

        <div class="dialog-left-buttons">
          <Button
            label="Button 1"
            class="custom-btn"
            @click="onButton1Click"
          />
          <Button
            label="Button 2"
            class="custom-btn"
            @click="onButton2Click"
          />
        </div>

        <div class="dialog-right-section"></div>

        <!-- ★ 新增：右下角 Assigned + 绑定ID(这里显示作者名) + 头像 -->
        <div class="assigned-box">
          <span class="assigned-label">Mandator</span>
          <span class="assigned-name">{{ selectedProject?.mandator || '' }}</span>
          <Avatar
            :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
            shape="circle"
            style="width: 48px; height: 48px"
          />
        </div>
        <!-- ★ 新增结束 -->
      </div>
    </Dialog>
</template>

<route lang="yaml">
meta:
  layout: "student"
</route>

<script setup>
import { ref, computed } from 'vue';
import Avatar from 'primevue/avatar';
import SelectButton from 'primevue/selectbutton';
import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import Dialog from 'primevue/dialog';
import teamwork from '../../assets/team.png'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const activeTab = ref('ongoing')
const tabOptions = ref([
  { label: t('tabs.ongoing'), value: 'ongoing' },
  { label: t('tabs.completed'), value: 'completed' }
])

const op = ref(null);
const unreadCount = ref(2);
const togglePanel = (event) => {
  op.value.toggle(event);
  unreadCount.value = 0;
};

const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})

// greetingKey 必须是字符串
const greetingKey = computed(() => `greetings.${period.value}`)

const allProjects = [
  {
    id: 1,
    title: 'Volunteer Feeding Stray Cats',
    date: '5 July, 2025',
    status: 'ongoing',
    image: teamwork,
    exp: '300 exp',
    level: 'E',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
    author: 'Amy Elsner',
    description: '中午十二点，在三棵树集合喂猫，时长为1小时，需要5–6人',
    mandator: 'John Doe',
  },
  {
    id: 2,
    title: 'Organize Community Event',
    date: '12 June, 2025',
    status: 'ongoing',
    image: teamwork,
    exp: '400 exp',
    level: 'C',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png',
    author: 'Onya Malimba',
    description: '下午两点，在活动中心组织志愿者会议，需要3人负责接待',
    mandator: 'John Doe',
  },
  {
    id: 3,
    title: 'Schoolyard Cleanup Event',
    date: '20 May, 2025',
    status: 'completed',
    image: teamwork,
    exp: '250 exp',
    level: 'D',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/ivanmagalhaes.png',
    author: 'Ivan Magalhaes',
    description: '早上九点集合，清理学校操场，需要10人，时长2小时',
    mandator: 'John Doe',
  },
  {
    id: 4,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: teamwork,
    exp: '350 exp',
    level: 'B',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png',
    author: 'Xu Xuefeng',
    description: '设计艺术节宣传海报，预计工作时间3小时，需要2位同学合作完成',
    mandator: 'John Doe',
  }
];


const filteredProjects = computed(() =>
  allProjects.filter((p) => p.status === activeTab.value)
);
const runningProjects = computed(() =>
  allProjects.filter((p) => p.status === 'ongoing')
);
const showDialog = ref(false);              //  控制弹窗显示
const selectedProject = ref(null);          //  存储当前点击的项目

const openProjectDialog = (project) => {    //  点击卡片触发
  selectedProject.value = project;
  showDialog.value = true;
};
const onButton1Click = () => {
  console.log('Button 1 clicked');
};

const onButton2Click = () => {
  console.log('Button 2 clicked');
};
</script>

<style scoped>
/* 全局布局 */
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
  overflow: hidden;
}
.sidebar {
  width: 300px;
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
  background-color: #e6e6e6;
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
  padding: 4px 48px;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding-bottom: 4px;
  padding-top: 4px;
  height: 64px;
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
  background-color: #e1e8f5;
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
  margin: 4px 0;
  padding: 0;
  min-height: 40px;
}

.greeting {
  font-style: italic;
  font-size: 18px;
  line-height: 1.2;
  margin: 0;
  padding: 0;
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
  border-radius: 12px;
  overflow: hidden;
  overflow: auto;
  background-color: #f3f7fe;
  border: 1px solid #e4eaf4;
}
.card-background {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  border-radius: 12px;
  z-index: 0;
  pointer-events: none;
}
.grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 40px;
  padding: 40px;
}

/* task-card 样式用于 projects */
.task-card {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2); 
 padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start; 
  transition: transform 0.2s, box-shadow 0.2s;
}
.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
.task-title {
  font-size: 18px;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 4px;
  text-align: left; 
  width: 100%;
}
.task-time {
  color: #888; 
  font-size: 14px;
  margin-bottom: 4px;
  text-align: left; 
  width: 100%; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
}
.task-exp {
  color: #003366; 
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); 
  font-size: 16px; 
  font-weight: bold;
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
}
.task-teamwork {
  width: 90%; 
  border-bottom: 1px solid #ddd; 
  padding-bottom: 8px; 
  margin-bottom: 8px; 
  margin-left: 15px;
}
.task-teamwork-image {
  width: 100%;
  height: auto;  
  max-height: 200px;
  object-fit: contain;
  border-radius: 12px;
  display: block;
  margin: 0 auto;
}
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto; 
  width: 100%;
}
.task-level {
  color: #0099ff; 
  font-weight: bold;
  font-size: 16px;
  text-align: right;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.dialog-custom-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
}
.dialog-back-button {
  font-size: 18px;
  color: #333;
}
.dialog-title {
  font-size: 30px;
  font-weight: bold;
  color: #1e1e1e;
}
.floating-dialog-level {
  position: absolute;
  top: 28px;
  right: 130px;
  color: #2a2c52;
  font-weight: bold;
  font-size: 32px;
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
}
.dialog-content-wrapper {
  display: flex;
  flex-direction: row;
  gap: 24px;
  padding: 4px 24px 24px 24px;
  height: 100%;
}
.dialog-left-section {
  flex: 1;
  max-width: 75%;
}
.dialog-description-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.fake-avatar-space {
  width: 48px;
  height: 48px;
}
.image-placeholder {
  width: 240px;
  height: 160px;
  background-color: #e0e0e0;
  border-radius: 12px;
}
.dialog-images {
  display: flex;
  flex-direction: row;  /* 明确设置横向排列 */
  gap: 12px;
  margin-bottom: 20px;
  margin-left: calc(48px + 12px);
}
.dialog-left-buttons {
  position: absolute;
  left: 30px;
  bottom: 30px;
  display: flex;
  gap: 18px; /* 按钮之间的间距 */
}

.custom-btn {
  background-color: #2A2C55 !important; /* 按钮背景色 */
  color: #FFFFFF !important;            /* 字体颜色 */
  border: none !important;              /* 去掉边框 */
  border-radius: 12px;
  padding: 12px 30px;
  font-weight: 500;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(42, 44, 85, 0.3); /* 默认阴影 */
  transition: all 0.2s ease;
}

.custom-btn:hover {
  transform: translateY(-2px); /* 向上位移 */
  box-shadow: 0 6px 16px rgba(42, 44, 85, 0.4); /* hover 阴影增强 */
}

.custom-btn:focus {
  outline: none !important; /* 去掉默认 outline */
  box-shadow: 0 4px 12px rgba(42, 44, 85, 0.3) !important; /* 聚焦时保留普通阴影 */
}
.dialog-vertical-divider {
  position: absolute;
  top: 100px;
  bottom: 100px;
  left: 75%;
  width: 1px;
  background-color: #ccc;
  border-radius: 1px;
  z-index: 10;
}

.dialog-date {
  display: flex;
  align-items: center;
  color: #666;
  margin-bottom: 12px;
}
.dialog-icon {
  margin-right: 8px;
}

.dialog-author {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 8px;
}
.author-name {
  font-weight: 500;
  font-size: 20px;
}

/* ★ 新增：右下角 Assigned 模块 */
.assigned-box {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;             /* 文本与头像间距 */
  z-index: 1100;         /* 高于分割线和内容 */
}
.assigned-label {
  font-size: 18px;
  color: #b8b8b8;        /* 灰色 */
  font-weight: 600;
}
.assigned-id {
  font-size: 22px;
  font-weight: 800;      /* 黑体粗 */
  color: #000;
  letter-spacing: 0.5px;
}
/* ★ 新增结束 */

</style>