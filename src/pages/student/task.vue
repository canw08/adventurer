<template>
  <!-- 右侧 -->
  <div class="main-content">
    <!-- 顶部栏 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">Quest Board</span>
        <div class="vertical-divider"></div>
      </div>
      <AnnouncementPanel />
    </div>

    <!-- 次级标题与筛选按钮 -->
    <div class="main-subheader">
      <span class="greeting">Good morning, adventurer</span>
      <div class="filter-buttons-wrapper small-toggle">
        <div class="fake-select-wrapper">
          <Button
            label="Filter"
            icon="pi pi-filter"
            @click="showFilterDialog = true"
            class="filter-button"
          />
        </div>
      </div>
    </div>

    <!-- ✅ 卡片区域容器（分页器将相对它的底部居中） -->
    <div class="main-body">
      <div class="card-background"></div>

      <!-- 卡片网格 -->
      <div class="grid-container">
        <div
          v-for="project in paginatedProjects"
          :key="project.id"
          class="task-card"
          :class="{ 'assigned-card': project.status === 'assigned' }"
          @click="openProjectDialog(project)"
        >
          <!-- 上部图文 -->
          <div class="task-main-content">
            <div class="task-left">
              <h3 class="task-title">{{ project.title }}</h3>
              <div class="task-time">
                <i class="pi pi-clock"></i>
                <span>{{ project.date }}</span>
              </div>
              <div class="task-exp">{{ project.exp || 'N/A' }}</div>
            </div>

            <!-- 右侧图片（assigned 状态下会通过 CSS 隐藏） -->
            <div class="task-right">
              <img :src="project.image" alt="Project Image" class="task-image" />
            </div>
          </div>

          <div class="task-divider"></div>

          <!-- 底部头像与等级 -->
          <div class="task-footer">
            <div class="avatar-wrapper">
              <Avatar
                :image="project.avatar"
                shape="circle"
                style="width: 40px; height: 40px"
              />
              <span class="avatar-name">{{ project.author }}</span>
            </div>
            <span class="task-level">Level {{ project.level }}</span>
          </div>
        </div>
      </div>

      <!-- ✅ 分页器容器：相对 .main-body 绝对定位，底部居中 -->
      <div class="fixed-footer-wrapper">
        <Paginator
          :rows="rowsPerPage"
          :totalRecords="filteredProjects.length"
          :first="currentPage * rowsPerPage"
          @page="(e) => currentPage = e.page"
          style="background-color: white; border-radius: 12px; padding: 4px 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"
        />
      </div>
    </div>

    <!-- ✅ 任务详情弹窗 -->
    <Dialog
      v-model:visible="showDialog"
      modal
      blockScroll
      dismissableMask
      :closable="false"
      :style="{ width: '1100px', height: '700px', position: 'relative' }"
      class="project-dialog"
    >
      <!-- 自定义 Header -->
      <template #header>
        <div class="dialog-custom-header">
          <!-- 左侧返回按钮 -->
          <div class="dialog-header-left">
            <Button
              icon="pi pi-arrow-left"
              text
              class="dialog-back-button"
              @click="showDialog = false"
            />
          </div>

          <!-- 中间标题 -->
          <div class="dialog-header-center">
            <span class="dialog-title">{{ selectedProject?.title || '' }}</span>
          </div>

          <!-- 浮动右上角的等级标签（仅显示，不可交互） -->
          <div class="floating-dialog-level">
            Level {{ selectedProject?.level || '' }}
          </div>
        </div>
      </template>

      <!-- 弹窗主体内容区域 -->
      <div class="dialog-content-wrapper">
        <!-- 左侧内容区域 -->
        <div class="dialog-left-section">
          <div class="dialog-date">
            <i class="pi pi-clock dialog-icon"></i>
            <span>{{ selectedProject?.date }}</span>
          </div>

          <div class="dialog-author">
            <Avatar
              image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
              shape="circle"
              size="large"
              style="width: 40px; height: 40px"
            />
            <span class="author-name">{{ selectedProject?.author }}</span>
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
        </div>

        <!-- 分隔线 -->
        <div class="dialog-vertical-divider"></div>

        <!-- 右侧区域（留空占位，后续可扩展） -->
        <div class="dialog-right-section"></div>
      </div>

      <!-- 接任务按钮（保持在 content 外层，绝对定位，不占高度） -->
      <div class="absolute-accept-button">
        <Button label="Accept" class="custom-btn" />
      </div>
    </Dialog>

    <!-- ✅ 筛选弹窗（不包含 assigned，assigned 作为 ongoing 的分支） -->
<Dialog
  v-model:visible="showFilterDialog"
  modal
  dismissableMask
  header="Filter Tasks"
  class="filter-dialog"
  appendTo="self"
  :style="{ width: '1100px', height: '700px', position: 'relative' }"
>
  <!-- ⛔️ 移除原来的 “Task Status” 那一行文本 -->

  <!-- 状态切换：按钮文字离左右边框 10px -->
  <div class="filter-section">
    <div class="status-toggle-wrap">
    <SelectButton
      v-model="tempTab"
      :options="['ongoing', 'completed']"
      class="status-toggle"
    />
  </div>
</div>
  <!-- 新增：Choose level，多选样式与截图一致 -->
  <div class="filter-section level-section">
    <div class="level-label">Choose level</div>
    <div class="level-row">
      <div
        v-for="opt in levelOptions"
        :key="opt.value"
        class="level-item"
      >
        <!-- PrimeVue Checkbox 多选 -->
        <Checkbox
          v-model="tempLevels"
          :inputId="'lvl-' + opt.value"
          :value="opt.value"
        />
        <label class="level-text" :for="'lvl-' + opt.value">
          {{ opt.label }}
        </label>
      </div>
    </div>
  </div>

  <!-- 应用按钮（保持你原有绝对定位不变） -->
  <div class="absolute-apply-button">
    <Button label="confirm" @click="confirmFilter" class="apply-button" />
  </div>
</Dialog>
  </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
</route>

<script setup>

import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import SelectButton from 'primevue/selectbutton';

import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue';

/* -------------------- 路由 -------------------- */
const router = useRouter();
const goToProfile = () => router.push('/student/task');

/* -------------------- 任务弹窗 -------------------- */
const showDialog = ref(false);
const selectedProject = ref(null);
const openProjectDialog = (project) => {
  selectedProject.value = project;
  showDialog.value = true;
};

/* -------------------- 顶部公告（保持与模板兼容） -------------------- */
const op = ref(null);
const unreadCount = ref(2);
const togglePanel = (event) => {
  op.value?.toggle(event);
  unreadCount.value = 0;
};

/* -------------------- 数据源（演示） -------------------- */
const allProjects = [
  {
    id: 1,
    title: 'Volunteer Feeding Stray Cats',
    date: '5 July, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/cat/400/200',
    exp: '300 exp',
    level: 'E',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png',
    author: 'Amy Elsner',
    description: '中午十二点，在三棵树集合喂猫，时长为1小时，需要5–6人',
  },
  {
    id: 2,
    title: 'Organize Community Event',
    date: '12 June, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/book/400/200',
    exp: '400 exp',
    level: 'C',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/onyamalimba.png',
    author: 'Onya Malimba',
    description: '下午两点，在活动中心组织志愿者会议，需要3人负责接待',
  },
  {
    id: 3,
    title: 'Schoolyard Cleanup Event',
    date: '20 May, 2025',
    status: 'completed',
    image: 'https://picsum.photos/seed/school/400/200',
    exp: '250 exp',
    level: 'D',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/ivanmagalhaes.png',
    author: 'Ivan Magalhaes',
    description: '早上九点集合，清理学校操场，需要10人，时长2小时',
  },
  {
    id: 4,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'assigned',
    image: 'https://picsum.photos/seed/poster/400/200',
    exp: '350 exp',
    level: 'B',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png',
    author: 'Xu Xuefeng',
    description: '设计艺术节宣传海报，预计工作时间3小时，需要2位同学合作完成',
  },
  {
    id: 5,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/poster/400/200',
    exp: '350 exp',
    level: 'B',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png',
    author: 'Xu Xuefeng',
    description: '设计艺术节宣传海报，预计工作时间3小时，需要2位同学合作完成',
  },
  {
    id: 6,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/poster/400/200',
    exp: '350 exp',
    level: 'B',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png',
    author: 'Xu Xuefeng',
    description: '设计艺术节宣传海报，预计工作时间3小时，需要2位同学合作完成',
  },
  {
    // 避免 v-for key 冲突：你的原始数据里 id:5 重复，这里改为 7
    id: 7,
    title: 'Design Posters for Art Festival',
    date: '15 August, 2025',
    status: 'ongoing',
    image: 'https://picsum.photos/seed/poster/400/200',
    exp: '350 exp',
    level: 'B',
    avatar: 'https://primefaces.org/cdn/primevue/images/avatar/xuxuefeng.png',
    author: 'Xu Xuefeng',
    description: '设计艺术节宣传海报，预计工作时间3小时，需要2位同学合作完成',
  }
];

/* -------------------- 状态切换（ongoing/completed） -------------------- */
const activeTab = ref('ongoing');      // 实际生效的状态
const tabOptions = ref(['ongoing', 'completed']); // 备用
const showFilterDialog = ref(false);   // Filter 弹窗显隐
const tempTab = ref(activeTab.value);  // 弹窗内的临时状态选择

/* -------------------- Level 多选筛选 -------------------- */
const levelOptions = [
  { label: 'Level F', value: 'F' },
  { label: 'Level E', value: 'E' },
  { label: 'Level D', value: 'D' },
  { label: 'Level C', value: 'C' },
  { label: 'Level B', value: 'B' },
  { label: 'Level A', value: 'A' },
  { label: 'Level S', value: 'S' },
  { label: 'Level S*', value: 'S*' },
];
const selectedLevels = ref([]); // 生效中的 level 集合
const tempLevels = ref([]);     // 弹窗内的临时 level 选择

/* -------------------- 过滤 + 分页 -------------------- */
// 先按状态过滤（ongoing 时包含 assigned），再按 level 过滤
const filteredProjects = computed(() => {
  const statusFiltered = allProjects.filter(
    (p) =>
      p.status === activeTab.value ||
      (activeTab.value === 'ongoing' && p.status === 'assigned')
  );
  if (!selectedLevels.value || selectedLevels.value.length === 0) {
    return statusFiltered;
  }
  return statusFiltered.filter((p) => selectedLevels.value.includes(p.level));
});

// 分页
const currentPage = ref(0);
const rowsPerPage = 4;
const paginatedProjects = computed(() => {
  const start = currentPage.value * rowsPerPage;
  return filteredProjects.value.slice(start, start + rowsPerPage);
});

watch(showFilterDialog, (v) => {
  if (v) {
    tempTab.value = activeTab.value;
    tempLevels.value = [...selectedLevels.value];
  }
});
/* -------------------- 应用筛选（弹窗 Apply） -------------------- */
const applyFilter = () => {
  activeTab.value = tempTab.value;              // 应用状态
  selectedLevels.value = [...tempLevels.value]; // 应用 level
  showFilterDialog.value = false;
  currentPage.value = 0;                        // 重置到第一页
};
const confirmFilter = () => {
  applyFilter();
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
  background-color: #ffffff;
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
  color: #333;
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
  border: 1px solid #e4eaf4;
}
.card-background {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  background-color: #f3f7fe;
  border-radius: 12px;
  z-index: 0;
}
.grid-container {
  position: relative;
  z-index: 1;
  display: grid;
 grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 40px;
}
.author-name {
  font-weight: 500;
  font-size: 20px;
}

/* task-card 样式用于 projects */

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}
.task-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
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
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); 
  font-size: 16px; 
  font-weight: bold;
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
   color: #81A0EF !important;               /* exp 填充色 */
  -webkit-text-stroke: 1px #3A494D;
}
.task-teamwork {
  width: 100%; 
  border-bottom: 1px solid #ddd; 
  padding-bottom: 8px; 
  margin-bottom: 8px; 
}
.task-teamwork-image {
  display: block;  
  width: calc(100% - 32px); 
  height: auto;  
  margin: 0 auto;
  border-radius: 8px;  
  object-fit: cover;
}

.task-level {
  font-weight: bold;
  font-size: 22px;
  text-align: right;
  color: #C3F9E6 !important;                /* level 填充色 */
  -webkit-text-stroke: 1px #1BA5BF;
}
/* ✅ 横向卡片整体结构 */
.task-card {
  display: flex;
  flex-direction: column;
  height: auto;
  padding: 16px;
  padding-top: 16px;      /* 保持原上边距 */
  padding-bottom: 8px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  gap: 12px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}
.task-main-content {
  display: flex;
  flex: 5;
  flex-direction: row;
  gap: 16px;
}
.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-top: 0px;
  padding: 0px 0;
}
/* 分割线以下区域整体居中对齐 */
.task-footer {
  flex: 1;                          /* 占满剩余高度 */
  display: flex;
  justify-content: space-between;   /* 左右分布：左边头像/名字，右边等级 */
  align-items: center;              /* 垂直居中 */
  margin-top: 0;                    /* 去掉多余间距 */
  padding: 0px 0;                   /* 左右留点内边距 */
  box-sizing: border-box;
}
.task-divider {
  width: 100%;
  height: 1px;
  background-color: #e1e8f5;
  margin-top: 0px;
  margin-bottom: 4px;
}

.task-left,
.task-right {
  width: 50%;
  height: 100%;
  box-sizing: border-box;
}
.task-left {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  overflow: hidden;
  overflow-wrap: break-word;
}
.task-right {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 6px; 
  padding-bottom: 6px;
}
.task-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

#testDiv {
  width: 100%;
  word-wrap: break-word;
  word-break: break-all;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

:deep(.p-dialog-title) {
  font-size: 100px;
  color: #333;
  font-weight: bold;
}

.dialog-level {
  color: #2F80ED;
  font-weight: bold;
}
.dialog-date {
  display: flex;
  align-items: center;
  color: #666;
  margin-bottom: 16px;
}
.dialog-icon {
  margin-right: 8px;
}
.dialog-author {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}
.dialog-description {
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 16px;
}
/* 图片区域就是你左侧最后一块：不要底部外边距 */
.dialog-images {
  display: flex;
  flex-direction: row;     /* 横向排列 */
  gap: 16px;               /* 图片之间的水平间距 */
  margin-top: 12px;        /* 跟上面内容分开一点 */
  margin-bottom: 0 !important; 
}
.image-placeholder {
  width: 240px;
  height: 160px;
  background-color: #e0e0e0;
  border-radius: 12px;
  flex-shrink: 0;
  object-fit: cover;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
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

:deep(.p-dialog-mask.p-component-overlay) {
  backdrop-filter: blur(6px); /* 背景模糊 */
  background-color: rgba(0, 0, 0, 0.2); /* 带轻微暗色 */
  transition: all 0.3s ease;
}

/* ✅ 保持分割线上下分别 48px，不受按钮影响 */
.dialog-vertical-divider {
  position: absolute;
  top: 0px;
  bottom: 0px;
  left: 75%;
  width: 1px;
  background-color: #ccc;
  border-radius: 1px;
  z-index: 10;
}

/* 占满内容区高度，不滚动；去掉底部内边距 */
/* 2) 与 home 保持一致的内容留白（关键！）*/
.dialog-content-wrapper {
  position: relative;               /* 作为分割线的定位上下文 */
  display: flex;
  gap: 24px;
  padding: 4px 24px 24px 24px;      /* ← 与 home 保持一致的 padding */
  min-height: 0;
  height: 100%;
  box-sizing: border-box;
}

.fixed-accept-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
}
:deep(.p-dialog) {
  height: 100%;
}
/* ✅ 任务详情弹窗内容区样式 */
.project-dialog :deep(.p-dialog-content) {
  /* PrimeVue 默认 padding 会和 wrapper 叠加，这里清掉 */
  padding: 0 !important;
  /* 保证布局灵活 */
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  /* 控制高度和滚动 */
  height: auto !important;
  overflow: hidden;
  /* 避免溢出，保证绝对定位可用 */
  position: relative; /* ⭐ 作为 .absolute-accept-button 的定位父级 */
  box-sizing: border-box;
}

/* ⭐ 新增：接任务按钮固定右下 & 不占文档流高度 */
.absolute-accept-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}

.floating-dialog-level {
  position: absolute;
  top: 28px;
  right: 130px;
  color: #2a2c52;
  font-weight: bold;
  font-size: 32px;
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: none;
}
.dialog-description-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}

.fake-avatar-space {
  width: 48px;   /* 模拟头像宽度 */
  height: 48px;  /* 可设为 0 也可以跟高度统一 */
  flex-shrink: 0;
}

.dialog-description {
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

/* 3) 左右比例不变，但确保与分割线的 75% 对齐 */
.dialog-left-section {
  flex: 0 0 75%;
  width: 75%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  word-wrap: break-word;
  word-break: break-word;
}
.dialog-right-section {
  flex: 0 0 25%;
  position: relative;
  width: 25%;
  min-height: 0;
  overflow: hidden;
}
.fixed-footer-wrapper {
  position: absolute;
  bottom: 16px;          /* 贴近卡片区域底部 */
  right: 16px;           /* 🔽 改为靠右对齐 */
  left: auto;            /* ❌ 取消之前的居中 */
  transform: none;       /* ❌ 去掉居中位移 */
  display: flex;
  justify-content: flex-end; /* 内容靠右 */
  width: auto;           /* 宽度随内容 */
  pointer-events: auto !important;
  z-index: 20 !important;
}
.footer-text {
  background-color: #ffffff;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  color: #333;
  font-weight: 500;
}


.filter-buttons-wrapper {
  display: inline-flex;
  padding: 2px;
  border: 1px solid #c5d4ea;
  border-radius: 12px;
  background-color: white;
}

.tab-toggle ::v-deep(.p-button) {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 0;
}
.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px; /* 控制头像与名字之间的间距 */
}

.avatar-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.filter-button.p-button {
  font-size: 14px !important;
  font-weight: 500;
  padding: 4px 14px !important;
  height: 36px !important;
  line-height: 1 !important;
  border-radius: 8px !important;
  border: 1px solid #c5d4ea !important;
  background-color: white !important;
  color: #1e1e1e !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none !important;
  gap: 8px;
}

.filter-button {
  padding: 6px 16px;
  font-size: 14px;
  border: 1px solid #c5d4ea;
  border-radius: 8px;
  background-color: white;
  color: #1e1e1e;
  box-shadow: none;
}

/* 缩放保持一致 */
.small-toggle {
  transform: scale(0.9);
  transform-origin: right center;
}
.apply-button {
  background-color: #2A2C52; /* 主色 */
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(42, 44, 82, 0.2); /* 同色阴影 */
  transition: background-color 0.3s, transform 0.2s;
}
.apply-button:hover {
  background-color: #2A2C52; /* 深一点作为悬停色 */
  transform: translateY(-1px);
}
.apply-button:active {
  background-color: #2A2C52 !important;  /* 固定颜色 */
  color: #ffffff !important;             /* 固定文字颜色 */
  box-shadow: 0 4px 12px rgba(42, 44, 82, 0.2); /* 保持统一阴影 */
}
.absolute-apply-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 999;
}
.custom-btn {
  background-color: #2a2c55;
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.custom-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.25);
}

.author-name {
  font-weight: 500;
  font-size: 20px;
}

.assigned-card {
  background-color: #D1EDF2 !important;
}

/* 分割线颜色：B8DBEB */
.assigned-card .task-divider {
  background-color: #B8DBEB !important;
}

/* 标题 & 时间颜色：95B0B5 */
.assigned-card .task-title {
  color: #95B0B5 !important;
}
.assigned-card .task-time {
  color: #95B0B5 !important;
}

/* exp：文字 BCD8DD，描边 A1BEC3 */
.assigned-card .task-exp {
  color: #BCD8DD !important;
  -webkit-text-stroke: 1px #A1BEC3; /* 描边 */
  text-shadow: none !important;     /* 若原来有阴影，这里关闭它，避免脏感 */
}

/* Level：底色 CCE8ED，描边 A1BEC3
   注：这里用背景 + 文字描边，保留你原本字号与布局 */
.assigned-card .task-level {
  -webkit-text-stroke: 1px #A1BEC3; /* 描边 */
  color: #CCE8ED !important;        /* 文字填充色 */
  font-weight: bold;
  font-size: 22px;
  text-align: right;
}

/* （如果卡片里有 ID 文本）ID 颜色：000000
   你的 ID 现在在侧边栏 .user-id；卡片里若也有相同类名则会生效；没有就不影响。 */
.assigned-card .user-id {
  color: #000000 !important;
}
/* ✅ 只对 assigned 状态的卡片加水印 */
.assigned-card::before {
  content: "Assigned";              /* 水印文字 */
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg); /* 左高右低的角度 */
  font-size: 48px;                   /* 文字大小，可调 */
  font-weight: bold;
  color: #A0C0C9;                    /* 文字颜色 */
  opacity: 0.25;                     /* 透明度，让内容可见 */
  pointer-events: none;              /* 不影响点击事件 */
  white-space: nowrap;
  z-index: 0;                        /* 在内容下面 */
}

/* 确保 task-card 是相对定位，让 ::before 能按卡片定位 */
.task-card {
  position: relative;
}

.assigned-card .task-right {
  display: none !important;
}
.fixed-footer-wrapper .p-paginator {
  pointer-events: auto;  /* 让分页器可以正常点击 */
}
.fixed-footer-wrapper {
  pointer-events: auto !important;
  z-index: 20 !important;         /* 保证在网格之上 */
}

/* —— 状态切换按钮：左右内边距=10px —— */
.status-toggle :deep(.p-button) {
  padding: 6px 10px !important; /* 关键：文字到边框 10px */
  border-radius: 8px;
}

/* —— Level 组标题 —— */
.level-label {
  font-size: 20px;
  font-weight: 600;
  color: #1e1e1e;
  margin:10px -10px;
}

/* —— Level 横排 —— */
.level-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  align-items: center;
  margin: 20px 10px;   /* 上下 20px，左右 10px */
}

/* 单个 level 项：复选框 + 文本 */
.level-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

/* 复选框样式 */
.level-item :deep(.p-checkbox-box) {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #c8d3e6;
  transition: all .2s ease;
}
.level-item :deep(.p-checkbox-box.p-highlight) {
  background: #3f5aa8;
  border-color: #3f5aa8;
}
.level-item :deep(.p-checkbox-icon) {
  font-size: 12px;
  line-height: 1;
  color: #fff;
}

/* 文本样式 */
.level-text {
  font-size: 18px;
  color: #1e1e1e;
}

/* 2) 区块之间垂直间距 = 20px */
.filter-section {
  margin-bottom: 20px !important;        /* 组与组之间的间距 */
}

/* —— Filter 弹窗：内容区四周 24px 留白 —— */
:deep(.filter-dialog) .p-dialog-content {
  padding: 10px !important;
  box-sizing: border-box;
  overflow: hidden !important;
  max-height: none !important;
}

/* —— 两个筛选区块之间垂直间距 = 20px —— */
:deep(.filter-dialog) .filter-section {
  margin-bottom: 20px !important;
  overflow: visible !important;
}
:deep(.filter-dialog) .filter-section:last-of-type {
  margin-bottom: 0 !important;
}
/* 只改 Filter 弹窗标题字号 */
:deep(.filter-dialog) .p-dialog-title {
  font-size: 30px !important;
  font-weight: 700;  /* 粗细可调整 */
  color: #1e1e1e;    /* 可选：颜色 */
}

/* —— Level 部分 —— */
.level-section {
  padding: 0 20px;
}

/* —— 状态切换（ongoing/completed）与边框 10px —— */
.status-toggle {
  margin: 0 10px;   /* 左右与边框距离 10px */
  width: calc(100% - 20px); /* 扣掉左右 10px */
}
/* 外层容器控制与边框 10px（不会受 scoped 限制） */
.status-toggle-wrap {
  margin: 0px;
}

/* 让 SelectButton 撑满容器（容器已扣了 10px 外边距） */
:deep(.filter-dialog) .status-toggle {
  width: 100% !important;
}

/* 按钮内文字到按钮边框 10px（你已有，可保留） */
:deep(.filter-dialog) .p-selectbutton .p-button {
  padding: 0 !important;
  min-width: auto !important;
}
:deep(.filter-dialog) .p-selectbutton .p-button .p-button-label {
  display: inline-block;
  padding: 6px 10px !important;
  line-height: 1.2;
}
.tab-toggle :deep(.p-button) {
  padding: 6px 16px;
  font-size: 14px;
  border-radius: 0;
}
</style>