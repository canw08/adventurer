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

    <!-- 悬浮按钮 -->
    <Button
      icon="pi pi-plus"
      class="floating-new-quest-btn custom-round-button p-button-rounded p-button-icon-only"
      @click="showDialog = true"
    />

    <!-- 发布任务弹窗 -->
    <Dialog
      v-model:visible="showDialog"
      modal
      class="p-fluid my-task-dialog"
      :style="{ width: '1100px', maxWidth: '90vw' , height:'700px'}"
    >

  <template #header>
    <h2 class="dialog-header-title">Release a task</h2>
  </template>

    <div class="gapping">
      <!-- Choose level -->
        <div class="p-field">
          <label class="choose-size-label">Choose level</label>
          <div class="level-options">
            <div v-for="level in levels" :key="level" class="level-item">
              <RadioButton 
                v-model="selectedLevel"
                :inputId="level"
                :value="level"
                name="quest-level"
                class="gapBetweenElements"
              />
              <label :for="level">{{ level }}</label>
            </div>
          </div>
        </div>
      </div>
      <div class="gapping">
        <!-- 选择奖励 -->
          <AwardSliders
            v-if="selectedLevel"
            :level="selectedLevel === 'Design' ? '定制' : selectedLevel"
            v-model:exp="exp"
            v-model:coin="coin"
            v-model:hours="hours"
            :customRanges="selectedLevel === 'Design' ? customRanges : null"
          />
      </div>

      <div class="gapping">
        <!-- 任务日期 -->
        <div class="p-field field-stack">
          <label class="choose-size-label">Task Details</label>
          <!-- 让输入框占满一行或指定宽度都可以 -->
          <div class="pos">
           <span class="p-float-label">
            <Calendar
              id="date"
              v-model="taskDate"
              inputId="taskDateInput"
              dateFormat="mm/dd/yy"
              placeholder="MM/DD/YYYY"
              showIcon
              class="task-date-input"
            ></Calendar>
          </span>
          </div>
        </div>
      </div>

      <div class="gapping">
        <!-- 新增：任务大标题 -->
        <div class="p-field pos">
          <InputText id="bigTitle" v-model="bigTitle" placeholder="Enter main title" style="width: 100%;" />
        </div>
      </div>

      <div class="gapping">
        <!-- 富文本编辑表单（替换原 Textarea+自定义提交按钮） -->
        <Form
          v-slot="$form"
          :resolver="resolver"
          :initialValues="initialValues"
          @submit="onFormSubmit"
          class="flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1 pos">
            <Editor name="content" editorStyle="height: 320px" />
            <Message
              v-if="$form?.content?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form?.content?.error?.message }}
            </Message>
          </div>
          <Button class="submitPosition" type="submit" severity="secondary" label="Submit" />
        </Form>
      </div>
    </Dialog>

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
</template>

<route lang="yaml">
meta:
  layout: "teacher"
</route>

<script setup>
// src/mock/index.js
import { useUserStore } from '../../stores/user';
import '../../styles/overrides.css'

import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import AwardSliders from '../../components/AwardSliders.vue' // 确认相对路径

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import teamwork from '../../assets/team.png'


import { onMounted } from 'vue';
const userStore = useUserStore();

const selectedLevel = ref('')   // 或 'Level F'
const exp   = ref(0)
const coin  = ref(0)
const hours = ref(0)

const bigTitle = ref('')

const router = useRouter()

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
}


const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})

// greetingKey 必须是字符串
const greetingKey = computed(() => `greetings-teacher.${period.value}`)

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
)
const runningProjects = computed(() =>
  allProjects.filter((p) => p.status === 'ongoing')
)
const goToProfile = () => {
  router.push('/teacher/home')
}

/* 弹窗相关 */
const showDialog = ref(false)
const levels = computed(() => {
  const baseLevels = ['Level F', 'Level E', 'Level D', 'Level C', 'Level B', 'Level A', 'Level S']
  // 如果是 boss，额外加 Design
  if (userStore.userInfo.role === 'boss') {
    baseLevels.push('Design')
  }
  return baseLevels
})


const taskDate = ref(null)

/* Form + Editor 必需：初始值 / 校验 / 提交 */
const initialValues = {
  content: ''
}

const resolver = (values) => {
  const errors = {}
  if (!values.content || values.content.trim() === '') {
    errors.content = { message: '任务内容不能为空' }
  }
  return { values, errors }
}

const onFormSubmit = () => {
  const plainText = editorContent.value.replace(/<[^>]*>/g, '').trim()
  if (!plainText) {
    contentError.value = '任务内容不能为空'
    return
  }
  contentError.value = ''
  console.log({
    selectedLevel: selectedLevel.value,
    exp: exp.value,
    coin: coin.value,
    hours: hours.value,
    taskDate: taskDate.value,
    taskDetails: editorContent.value
  })
  showDialog.value = false
}
const editorContent = ref('')
const contentError = ref('')


onMounted(async () => {
  try {
    await userStore.fetchUser();
  } catch {
    // 可做错误提示
  }
});
</script>

<style scoped>
/* 全局布局 */
.layout-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
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
  padding: 4px 48px;
  display: flex;
  flex-direction: column;
}
.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding-bottom: 4px;
  padding-top: 4px;
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
  margin: 10px 0;
}
.greeting {
  font-style: italic;
  font-size: 18px;
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

/* 新加的button的 */
.floating-new-quest-btn {
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: 1000;
}
.custom-round-button {
  background-color: #2A2C55;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 28px 28px;
  font-size: 1.5rem;
  .pi {
    font-size: 1.5rem;
  }
}
.custom-round-button.p-button:hover,
.custom-round-button.p-button:enabled:hover {
  background-color: #DFE8FF !important;
  color: #2A2C55 !important;
  border-color: #DFE8FF !important;
  transition: background-color 0.3s ease;
}
.award-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
/* 让 Level 横向排列 */
.level-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
  margin-left: 2%;
}
.level-item {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
.choose-size-label {
  font-size: 20px;
  font-weight: 300;
}
.gapping {
  margin-bottom: 20px;
  margin-left: 1%;
  margin-right: 3%;
}

.dialog-header-title {
  font-size: 28px;     /* 字体大小 */
  font-weight: bold;   /* 粗细 */
  color: #2A2C55;      /* 深蓝色 */
  margin: 0;           /* 去掉默认 margin */
}

.field-stack {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;           /* 标题和输入之间的间距 */
}
/* PrimeVue Calendar 实际渲染的是一个 input，
   若需要更强控制，也可以覆盖内部 input 宽度： */
.field-stack :deep(.p-inputtext) {
  width: 100%;
}
.task-date-input { width:100%; }
.task-date-wrapper :deep(.p-calendar){ width:40%; }
.task-date-wrapper :deep(.p-inputtext){
  width:100%;
  font-size:18px;
  padding:12px 44px 12px 12px; /* 右侧留给图标 */
}

/* 浮动 label 的字型（可选） */
.task-date-wrapper :deep(label){
  color:#2A3246;
  font-weight:500;
}
.submitPosition{
  margin-top: 14px;
  font-size: 20px;
  margin-left: 85%;
  border-radius: 20px;
  border-color: #003366;
  background-color: #003366;
  color: #fff;
  padding-left: 4%;
  padding-right: 4%;
  margin-bottom: 16px;
}
/* ① PrimeVue 3.x：通过 input:checked 选中态改色 */
:deep(.level-options .p-radiobutton .p-radiobutton-input:checked + .p-radiobutton-box) {
  border-color: #2A2C55 !important;
  background: #2A2C55 !important;
}
:deep(.level-options .p-radiobutton .p-radiobutton-input:checked + .p-radiobutton-box .p-radiobutton-icon) {
  background: #ffffff !important; /* 中间小点白色 */
  transform: scale(1);
}
/* ② PrimeVue 4.x：选中态会在盒子上挂 .p-highlight 或 data-p-highlight */
:deep(.level-options .p-radiobutton .p-radiobutton-box.p-highlight),
:deep(.level-options .p-radiobutton .p-radiobutton-box[data-p-highlight="true"]) {
  border-color: #2A2C55 !important;
  background: #2A2C55 !important;
}
:deep(.level-options .p-radiobutton .p-radiobutton-box.p-highlight .p-radiobutton-icon),
:deep(.level-options .p-radiobutton .p-radiobutton-box[data-p-highlight="true"] .p-radiobutton-icon) {
  background: #ffffff !important;
}
/* hover/focus 边框也保持深蓝（可选） */
:deep(.level-options .p-radiobutton .p-radiobutton-box:hover),
:deep(.level-options .p-radiobutton .p-radiobutton-box.p-focus) {
  border-color: #2A2C55 !important;
  box-shadow: 0 0 0 2px rgba(42,44,85,0.15);
}
/* 覆盖 Dialog 内 Calendar 获得焦点时的边框 & 外圈高亮颜色 */
.my-task-dialog :deep(.p-calendar .p-inputtext:enabled:focus),
.my-task-dialog :deep(.p-calendar.p-inputwrapper-focus .p-inputtext),
.my-task-dialog :deep(.p-inputwrapper-focus > .p-inputtext) {
  border-color: #2A2C55 !important;
  box-shadow: 0 0 0 2px #2A2C55 !important; /* 覆盖主题绿色外圈 */
  outline: none !important;
}
/* showIcon 时右侧按钮的 focus 外圈也统一一下（可选） */
.my-task-dialog :deep(.p-calendar.p-inputwrapper-focus .p-button),
.my-task-dialog :deep(.p-calendar .p-button:enabled:focus) {
  border-color: #2A2C55 !important;
  box-shadow: 0 0 0 2px #2A2C55 !important;
}
.pos{
  margin-left: 2%;
}
:deep(.p-editor .ql-editor.ql-blank::before) {
  content: "Enter your assignment description......";
  color: #999;
  position: absolute;
}
.gapBetweenElements{
  margin-right: 6.98px;
}
</style>
