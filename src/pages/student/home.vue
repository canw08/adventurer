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
        <!-- 有任务：照常渲染 -->
        <template v-if="filteredProjects.length">
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
        </template>

        <!-- 无任务：显示可点击的“新增/获取任务”卡片 -->
        <div
          v-else
          class="task-card add-card"
          role="button"
          tabindex="0"
          @click="goToQuestStore"
          @keypress.enter="goToQuestStore"
        >
          <div class="add-card-content">
            <i class="pi pi-plus large-plus" aria-hidden="true"></i>
            <div class="add-text">{{ $t('questLog.getQuest') || '获取任务' }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 弹窗 -->
  <Dialog
    v-model:visible="showDialog"
    modal
    blockScroll
    dismissableMask
    :closable="false"
    :style="{ width: '1100px', height: '700px', position: 'relative' }"
    class="project-dialog"
  >
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

        <!-- 中间标题 + 时间 -->
        <div class="dialog-header-center">
          <span class="dialog-title">{{ selectedProject?.title || '' }}</span>
          <span class="dialog-date-inline">
            <i class="pi pi-clock"></i>
            {{ selectedProject?.date }}
          </span>
        </div>

        <!-- 浮动右上角的等级标签（只显示） -->
        <div class="floating-dialog-level">
          Level {{ selectedProject?.level || '' }}
        </div>
      </div>
    </template>

    <!-- ① 内容包裹层：先开 -->
    <div class="dialog-content-wrapper">
      <div class="dialog-left-section">
        <div class="dialog-author">
          <Avatar
            :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
            shape="circle"
            size="large"
            style="width: 50px; height: 50px"
          />
          <span class="author-name">{{ selectedProject?.author}}</span>
        </div>

        <div class="dialog-description" v-html="safeDescription"></div>
      </div>
      <div class="dialog-grid-divider" aria-hidden="true"></div>
      <div class="dialog-right-section">
        <div class="right-level-spacer" aria-hidden="true">
          Level {{ selectedProject?.level || '' }}
        </div>
        <!-- 纵向 3 条进度条：EXP / Coin / Hour（显示具体数值） -->
        <div class="right-metrics">
          <div v-for="m in metricsBound" :key="m.key" class="metric-item">
            <!-- 上行：icon + 进度条 -->
            <div class="metric-row">
              <img :src="m.icon" alt="" class="metric-icon pixelated click-wiggle" />
              <ProgressBar
                    :value="m.pct"
                    :showValue="false"
                    class="metric-bar"
                    :style="{ height: '28px', '--bar-color': m.color }"
                  />
                  <span
                    class="metric-text"
                    style="position:absolute;top:50%;left:93%;transform:translate(-50%,-50%);font-size:16px;font-weight:600;color:#2A2C55;pointer-events:none;"
                  >
                    {{ m.raw }}{{ m.unit }}
                  </span>
            </div>
            <!-- 下行：label -->
            <div class="metric-label">{{ m.label }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ 稳定写法：用方法名而不是模板内联箭头函数 -->
    <div class="dialog-footer-left">
      <Button
        label="Ask for leave"
        class="custom-btn"
        @click="toggleLeavePanel"
      />
      <Button
        label="Prompting"
        class="custom-btn"
        @click="confirmLeave"
      />
    </div>

    <!-- 右下角 Mandator -->
    <div class="assigned-box">
      <div class="right-level-spacer" aria-hidden="true"></div>
      <span class="assigned-label">Assigned</span>
      <span class="assigned-name">{{ selectedProject?.mandator || '' }}</span>
      <Avatar
        :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
        shape="circle"
        style="width: 48px; height: 48px"
      />
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
  requiresAuth: true
  roles: ['student']
</route>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api.js';
import DOMPurify from 'dompurify'
import Avatar from 'primevue/avatar'
import SelectButton from 'primevue/selectbutton'
import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import Dialog from 'primevue/dialog'
import OverlayPanel from 'primevue/overlaypanel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'
import { useI18n } from 'vue-i18n'

import { levelRanges } from '../../components/levelRange.js'

import teamwork from '../../assets/team.png'
import solo1 from '../../assets/solo.png'
import solo2 from '../../assets/solo2.png'

const router = useRouter()
const { t } = useI18n()

// ====== Tabs ======
const activeTab = ref('ongoing')
const tabOptions = ref([
  { label: t('tabs.ongoing'), value: 'ongoing' },
  { label: t('tabs.completed'), value: 'completed' }
])

// ====== 项目数据（从mock获取） ======
const allProjects = ref([])

function mapTaskToProject(task) {
  return {
    id: task.id,
    title: task.title,
    date: task.deadline,   
    status: task.is_accepted ? 'ongoing' : 'completed', 
    // 根据任务类型选择图片
    image: pickTaskImage(task),
    exp: task.experience_reward + ' EXP', // 加 EXP 后缀
    coin: task.token_reward,
    hour: task.volunteerTime_reward,
    level: task.required_level,
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?skinColor=ecad80,f2d3b1&seed=${task.publisher_avatar}` || `https://api.dicebear.com/9.x/adventurer/svg?seed=none`,
    author: task.publisher_nickname,
    description: task.description,
    mandator: task.publisher_nickname,
  }
}

function pickTaskImage(task) {
  // 团队任务固定用 teamwork
  if (task.task_type === 'team') return teamwork;

  // 用发布时间（deadline）作为种子
  const seedStr = task.deadline || String(task.id) || '';
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0; // 转成 32 位整数
  }

  // 根据 hash 奇偶数来决定用哪张
  return Math.abs(hash) % 2 === 0 ? solo1 : solo2;
}
const safeDescription = computed(() => {
  const html = selectedProject.value?.description || '无任务说明'
  const clean = DOMPurify.sanitize(html)
  const div = document.createElement('div')
  div.innerHTML = clean
  div.querySelectorAll('img').forEach(img => {
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'
  })
  return div.innerHTML
})

onMounted(async () => {
  try {
    const res = await api.get('/api/tasks/my-tasks/')
    allProjects.value = res.data.map(mapTaskToProject)
  } catch (err) {
    console.error('加载任务失败:', err)
  }
})

// ====== 过滤 ======
const filteredProjects = computed(() =>
  allProjects.value.filter((p) => p.status === activeTab.value)
)
const runningProjects = computed(() =>
  allProjects.value.filter((p) => p.status === 'ongoing')
)

// ====== Dialog逻辑 ======
const showDialog = ref(false)
const selectedProject = ref(null)
const openProjectDialog = (project) => {
  selectedProject.value = project
  showDialog.value = true
}

// ====== 请假 OverlayPanel ======
const leavePanel = ref(null)
const leaveTitle = ref('')
const leaveDetail = ref('')

const toggleLeavePanel = (event) => {
  leavePanel.value?.toggle(event)
}
const confirmLeave = () => {
  console.log('Leave confirmed for project:', selectedProject.value?.title)
  leavePanel.value?.hide()
}
const submitLeave = () => {
  if (!leaveTitle.value.trim()) {
    console.warn('申请理由不能为空')
    return
  }
  console.log('Submit leave:', {
    project: selectedProject.value?.title,
    title: leaveTitle.value,
    detail: leaveDetail.value
  })
  leaveTitle.value = ''
  leaveDetail.value = ''
  leavePanel.value?.hide()
}

// ====== Metrics绑定 ======
const toNumber = (v) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return 0
}

// ② 工具：根据 level 拿到该等级的各项上下限
const getBoundsByLevel = (level) => {
  // 允许传中文 'A级' 或英文 'Level A'，我们字典里都放了
  return levelRanges?.[level] || null
}

// ③ 计算选中任务对应的上下限（exp/coin/hours）
const selectedBounds = computed(() => {
  const lvl = selectedProject.value?.level
  const bounds = getBoundsByLevel(lvl)
  // 兜底：如果没匹配到等级，给个通用范围（你也可以自定义）
  return bounds || { exp:[0,100], coin:[0,100], hours:[0,24] }
})

// 原先有 max 的地方删掉它；保留 unit/icon/color
const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  unit: '',  icon: new URL('../../assets/icon/exp.png', import.meta.url).href,  color: '#11AF9B' },
  { key: 'coin', label: 'Coin', unit: '',  icon: new URL('../../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', unit: 'h', icon: new URL('../../assets/icon/time.png', import.meta.url).href,  color: '#4ACDF2' },
]

// 百分比 = (raw - min) / (max - min)
// 同时把 raw clamp 到 [min, max]，避免条溢出或负数
const metricsBound = computed(() => {
  const p = selectedProject.value || {}
  const b = selectedBounds.value || {}

  return METRIC_DEFS.map(def => {
    const raw = toNumber(p?.[def.key] ?? 0)

    // ⭐ bounds 用 'hours'（复数），而 metric key 是 'hour'（单数）
    const ranges = def.key === 'hour' ? b?.hours : b?.[def.key]
    const [min, max] = Array.isArray(ranges) && ranges.length === 2 ? ranges : [0, 0]

    // 夹取 + 百分比
    const clamped = max > min ? Math.min(Math.max(raw, min), max) : raw
    const pct = max > min ? Math.round(((clamped - min) / (max - min)) * 100)
                          : (raw > 0 ? 100 : 0) // ⭐ 没拿到范围时的兜底

    return { ...def, raw, pct }
  })
})


// ====== 其他 ======
const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const greetingKey = computed(() => `greetings-student.${period.value}`)

const goToQuestStore = () => {
  router.push('/student/task')
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
  border-radius: 32px;
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
.grid-container:has(.add-card) {
  display: flex;              /* 改成 flex 布局 */
  justify-content: center;    /* 水平居中 */
  align-items: center;        /* 垂直居中（可选） */
  min-height: 100%;           /* 保证占满容器高度 */
}
/* task-card 样式用于 projects */
.task-card {
  --card-padding: 16px;          /* 定义统一间距 */
  padding: var(--card-padding);  /* 上下左右统一 */
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2); 
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
  margin: 0;
  padding: 0;  
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
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 12px;
}

.dialog-header-center {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
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
.dialog-date-inline {
  font-size: 16px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top:5px;
}
.floating-dialog-level {
  position: absolute;
  top: 28px;
  right: 130px;
  color: #2a2c52;
  font-weight: bold;
  font-size: 32px;
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 1000;             /* 额外层级 */
  pointer-events: none;       /* 不遮挡点击 */
}
.dialog-description-row {
  /* ✅ 不再使用任何左侧额外缩进或占位元素 */
  margin: 0;
  padding: 0;                       /* 继承 .dialog-left-section 的 --rail */
  margin-left: 25px;
}
.dialog-description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  white-space: normal;
  overflow-wrap: anywhere;          /* 长词也能换行 */
  margin-left: 60px;
  margin-top: -10px
}
.dialog-images {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-top: 12px;
  /* ✅ 关键：不做任何左偏移，保持与 --rail 对齐 */
  padding-left: 0;
  margin-left: 60px;
}
.image-placeholder {
  width: 240px;
  height: 160px;
  background-color: #e0e0e0;
  border-radius: 12px;
  flex-shrink: 0;
  object-fit: cover;
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
/* 作用于加了 custom-btn 的 Button */
:deep(.custom-btn.p-button) {
  background-color: #2A2C55 !important;
  border-color: #2A2C55 !important;
  color: #fff !important;
}

:deep(.custom-btn.p-button:hover) {
  background-color: #1f2344 !important; /* hover 稍微深一点 */
  border-color: #1f2344 !important;
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
  position: relative;               /* 让头像以左栏为参照“悬挂”出去 */
  display: flex;
  align-items: center;
  min-height: 40px;                 /* 与头像高度一致，避免覆盖文本 */
  margin-bottom: 16px;
  margin-left: -14px;
  gap: 20px;
}
/* 头像不计入对齐：向左外悬，不改变文本对齐 */
.dialog-author :deep(.p-avatar) {
  position: static;
  left: calc(-50px - 8px);          /* 头像宽度 40 + 与文本间距 8 */
  top: 0;
}
.author-name {
  font-weight: 500;
  font-size: 20px;
  line-height: 1.2;                /* 与头像对齐更稳 */
  margin: 0;                        /* ✅ 靠 --rail 对齐，不额外偏移 */
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
.right-level-spacer {
  font-weight: bold;
  font-size: 32px;
  line-height: 1.2;
  visibility: hidden;        /* 不显示，但占位与浮动 Level 等高空间 */
}

.right-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--metric-gap);
  width: clamp(220px, 80%, 320px);
  margin: 0 auto;       /* ⬅ 居中 */
}
.metric-text {
  font-size: 12px;
  font-weight: 600;
  color: #FFf;
}
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor; /* legacy IE */
}

.metric-item {
  display: flex;
  flex-direction: column;   /* 上下布局：第一行 icon+bar，第二行 label */
  gap: 4px;
}

.metric-row {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}

.metric-icon {
  width: clamp(28px, 4vw, 45px);
  height: clamp(28px, 4vw, 45px);
  margin-right: max(-12px, -2vw);   /* 维持你原来的“嵌入进度条”的效果 */
  flex-shrink: 0;
  z-index: 3;
  position: relative;
}

.metric-bar {
  flex: 1;                  /* 占满剩余空间 */
  width: 100%;              /* 确保进度条撑满父容器 */
  min-width: 120px;         /* 避免太小挤没了 */
}

.metric-label {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #5a6275;
}
.metric-bar :deep(.p-progressbar) {
  display: block;
  width: 100%;
  height: clamp(18px, 2.5vw, 28px);
  border-radius: 999px;
  background: #eef2fb;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.metric-bar :deep(.p-progressbar-value) {
  background-color: var(--bar-color, #3b82f6); /* 默认蓝色 */
}

/* 内容居中即可，不要再设高度覆盖 */
.metric-bar :deep(.p-progressbar .p-progressbar-content) {
  display: flex;
  align-items: center;
  justify-content: center;
}


/* 空态：与 task-card 一致的卡片，内容居中 */
.add-card {
  cursor: pointer;
  display: flex;
  align-items: center;     /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  min-height: 200px;            /* 保持和普通卡片差不多的高度 */
  min-width: 350px;   
  border: 2px dashed rgba(0, 123, 255, 0.25);
}


.add-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.add-card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; /* 关键：纵向也居中 */
  gap: 12px;
  text-align: center;      /* 文本水平居中 */
  user-select: none;
}


.large-plus {
  font-size: 42px;
}

.add-text {
  font-size: 16px;
  font-weight: 600;
  color: #2A2C55;
}

:deep(.p-dialog) {
  height: 100%;
}
.project-dialog :deep(.p-dialog-header) {
  padding: 0 !important;
}
.project-dialog :deep(.p-dialog-content) {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
}
:deep(.p-dialog-mask.p-component-overlay) {
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.dialog-content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 3fr) 1px minmax(0, 1fr);
  column-gap: 24px;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  --divider-inset: 0px;
}

.dialog-left-section { grid-column: 1; }
.dialog-right-section { grid-column: 3; }
/* 左右列不再写固定百分比宽度，由 Grid 控制 */

.dialog-left-section {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  padding-left: 24px;
  margin-top: 0;
  overflow: visible;
}

.dialog-right-section {
  display: flex;
  flex-direction: column;
  align-items: center;   /* 右栏内部水平居中 */
  justify-content: flex-start; /* 内容从上往下 */
  padding: 8px 16px;
  --metric-gap: 16px;
  z-index: 2;            /* 让它在分割线之上 */
}

.dialog-grid-divider {
  grid-column: 2;
  background-color: #ccc;
  border-radius: 1px;
  align-self: stretch;                    /* 拉满网格行高度 */
  margin-block: var(--divider-inset);     /* ⬅ 上下等距内缩 */
}
.dialog-vertical-divider {
  display: none !important;
}
.dialog-footer-left {
  position: absolute;
  bottom: 24px;   /* 距离底部 24px，可以自己调 */
  left: 24px;     /* 距离左侧 24px */
  display: flex;
  gap: 12px;      /* 按钮之间的间隔 */
  z-index: 5;     /* 确保不被内容遮挡 */
}
</style>