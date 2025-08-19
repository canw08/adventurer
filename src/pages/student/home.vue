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

  <!-- ① 内容包裹层：先开 -->
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
    </div>

    <!-- ✅ 只保留这一组按钮（使用 OverlayPanel） -->
    <div class="dialog-left-buttons">
      <Button
        label="Ask for leave"
        class="custom-btn"
        @click="toggleLeavePanel($event)"
      />
      <Button
        label="Prompt"
        class="custom-btn"
        @click="onButton2Click"
      />
    </div>

    <div class="dialog-right-section"></div>

    <!-- 右下角 Mandator -->
    <div class="assigned-box">
      <span class="assigned-label">Mandator</span>
      <span class="assigned-name">{{ selectedProject?.mandator || '' }}</span>
      <Avatar
        :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
        shape="circle"
        style="width: 48px; height: 48px"
      />
    </div>
  </div>
  <!-- ② 内容包裹层：先关 ↑ 这一行必须在 OverlayPanel 之前 -->

  <!-- ③ OverlayPanel 放在 Dialog 内、content-wrapper 外 -->
<!-- 二次弹窗：更大、圆角、上方一点点 -->
<OverlayPanel
  ref="leavePanel"
  class="leave-overlay"
  appendTo="body"
  :dismissable="true"
  :showCloseIcon="false"
>
  <div class="leave-form">
    <!-- 顶部：左头像 + 右 申请理由（单行） -->
    <div class="leave-top">
      <Avatar
        :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
        shape="circle"
        style="width: 56px; height: 56px"
      />
      <InputText
        v-model="leaveTitle"
        class="leave-title-input"
        placeholder="申请理由（简要）"
      />
    </div>

    <!-- 中部：详情理由（多行） -->
    <div class="leave-middle">
      <Textarea
        v-model="leaveDetail"
        class="leave-detail-textarea"
        :autoResize="true"
        rows="6"
        placeholder="详情理由（时间范围、交接说明等）"
      />
    </div>

    <!-- 底部：右下角 Submit -->
    <div class="leave-bottom">
      <Button
        label="Submit"
        class="custom-btn"
        @click="submitLeave"
      />
    </div>
  </div>
</OverlayPanel>
</Dialog>
</template>

<route lang="yaml">
meta:
  layout: "student"
</route>

<script setup>
/**
 * 说明：
 * - 已移除 showLeaveDialog / 二级 Dialog；
 * - 只保留 OverlayPanel，并通过 toggle(event) 定位到按钮；
 * - 合并 confirmLeave，避免重复定义。
 */
import { ref, computed } from 'vue'
import Avatar from 'primevue/avatar'
import SelectButton from 'primevue/selectbutton'
import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import Dialog from 'primevue/dialog'
import OverlayPanel from 'primevue/overlaypanel'
import teamwork from '../../assets/team.png'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'

const { t } = useI18n()

const activeTab = ref('ongoing')
const tabOptions = ref([
  { label: t('tabs.ongoing'), value: 'ongoing' },
  { label: t('tabs.completed'), value: 'completed' }
])

const op = ref(null)
const unreadCount = ref(2)
const togglePanel = (event) => {
  op.value.toggle(event)
  unreadCount.value = 0
}

const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const greetingKey = computed(() => `greetings-student.${period.value}`)

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
]

const filteredProjects = computed(() =>
  allProjects.filter((p) => p.status === activeTab.value)
)
const runningProjects = computed(() =>
  allProjects.filter((p) => p.status === 'ongoing')
)

const showDialog = ref(false)
const selectedProject = ref(null)
const openProjectDialog = (project) => {
  selectedProject.value = project
  showDialog.value = true
}

const onButton2Click = () => {
  console.log('Prompt clicked')
}

/* ===== Ask for leave（OverlayPanel 实现） ===== */
const leavePanel = ref(null)

/** 切换弹层显示（基于点击事件做锚点） */
const toggleLeavePanel = (event) => {
  leavePanel.value?.toggle(event)
}

/** 确认请假：接入业务逻辑后关闭弹层 */
const confirmLeave = () => {
  console.log('Leave confirmed for project:', selectedProject.value?.title)
  leavePanel.value?.hide()
}
// 表单数据（请假标题 & 详情）
const leaveTitle = ref('') 
const leaveDetail = ref('')

/** 提交请假 */
const submitLeave = () => {
  // 简单校验，你可按需替换为真实校验/请求
  if (!leaveTitle.value.trim()) {
    console.warn('申请理由不能为空')
    return
  }
  console.log('Submit leave:', {
    project: selectedProject.value?.title,
    title: leaveTitle.value,
    detail: leaveDetail.value
  })
  // TODO: 调用 API / 写入状态 …

  // 重置并关闭
  leaveTitle.value = ''
  leaveDetail.value = ''
  leavePanel.value?.hide()
}
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
/* 二次弹窗：更大、圆角、上移一点；左右留白相等由 padding 控制 */
.leave-overlay {
  background: #fff;
  padding: 20px 24px;            /* 左右相等的留白 */
  box-shadow: 0 12px 32px rgba(0,0,0,0.16);
  transform: translateY(-14px);  /* “上面一点点” */
  max-width: 720px;              /* 约束最大宽度 */
}

/* 可选小三角（若不需要删掉本块） */
.leave-overlay::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 40px;                    /* 让小三角指向按钮中心，可微调 */
  border-width: 10px 10px 0 10px;
  border-style: solid;
  border-color: #fff transparent transparent transparent;
  filter: drop-shadow(0 2px 2px rgba(0,0,0,0.08));
}

/* 网格：顶部(auto) / 中部(1fr) / 底部(auto) → Submit 能固定在右下角 */
.leave-form {
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 16px;
  min-width: 560px;              /* 再大一点 */
  min-height: 360px;             /* 再高一点，中间更好写 */
  box-sizing: border-box;
}

/* 顶部：头像 + 申请理由；垂直中心对齐保证和头像中心并齐 */
.leave-top {
  display: grid;
  grid-template-columns: 56px 1fr;  /* 左头像 56px，右输入自适应 */
  align-items: center;              /* 关键：与头像中心对齐 */
  column-gap: 14px;
}

/* 单行输入高度与头像中心对齐更稳： */
.leave-title-input :deep(input),
.leave-title-input input {
  width: 100%;
  height: 44px;                    /* 单行固定高，便于对齐头像中心 */
  line-height: 44px;
  box-sizing: border-box;
  border: 1px solid #F2F2F2
}

/* 中间：详情理由（多行）；宽度 100%，左右留白由 overlay padding 决定=相等 */
.leave-middle,
.leave-detail-textarea,
.leave-detail-textarea :deep(textarea),
.leave-detail-textarea textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #F2F2F2
}

/* 底部：Submit 固定在右下角 */
.leave-bottom {
  display: flex;
  justify-content: flex-end;       /* 右对齐 */
  align-items: center;
}

/* 可选：让弹窗在更大屏下也显大一些 */
@media (min-width: 992px) {
  .leave-form { min-width: 350px; min-height: 260px; }
}
/* Vue3 + scoped 写法 */
:deep(.p-overlaypanel) {
  border-radius: 999px !important;  /* 超大圆角就会成椭圆气泡了 */
  overflow: hidden;                 /* 防止内部方角内容溢出 */
}
</style>