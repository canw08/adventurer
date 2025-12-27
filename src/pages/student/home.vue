<template>
  <UpdateNotice/>
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

        <!-- 切换模式 -->
        <div class="header-action-toggle small-toggle">
          <SelectButton
            v-model="actionTab"
            :options="actionOptions"
            optionLabel="label"
            optionValue="value"
            class="tab-toggle"
            aria-label="action-switch"
            :allowEmpty="false"
          />
        </div>

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
          :allowEmpty="false"
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
              <label>DDL</label>
              <span>{{ project.date }}</span>
            </div>
            <div class="task-exp">{{ project.exp || $t('common.na') }}</div>
            <!-- ✅ 卡片人数条 -->
            <div
              v-if="project.slotsTotal >= 1"
              class="task-slotsline"
              :title="`已占 ${project.slotsUsed} / 名额 ${project.slotsTotal}；剩余 ${Math.max(0, project.slotsTotal - project.slotsUsed)}`"
              aria-label="available-slots"
            >
              <i class="pi pi-users" aria-hidden="true"></i>
              <span class="slots-count">
                {{ project.slotsUsed }} / {{ project.slotsTotal }}
              </span>
            </div>
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
              <span class="task-level" :style="getLevelStyle(project.level)">
                Level {{ project.level }}
              </span>
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
            <label>DDL</label>
            {{ selectedProject?.date }}
          </span>
        </div>

        <!-- 浮动右上角的等级标签（只显示） -->
        <div class="floating-dialog-level" :style="getLevelStyle(selectedProject?.level)">
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
          <div class="author-block">
            <span class="author-name">{{ selectedProject?.author }}</span>
            <div
              v-if="selectedProject?.wechatId"
              class="wechat-pill"
              :title="`Wechat: ${selectedProject.wechatId}`"
            >
              wechat: {{ selectedProject.wechatId }}
            </div>
            <!-- 若想无值也显示占位，可把 v-if 改成 v-show，并用三元：{{ selectedProject?.wechatId || 'N/A' }} -->
          </div>
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
  <div class="metric-row">
    <img :src="m.icon" alt="" class="metric-icon pixelated click-wiggle" />

    <ProgressBar
      :value="m.pct"
      :showValue="false"
      class="metric-bar"
      :style="{ height: '28px', '--bar-color': m.color }"
    />

      <!-- 数值，颜色跟进度条 -->
      <span class="metric-text" :style="{ color: m.color }">
       {{ m.raw }}{{ m.unit }}
      </span>

      <!-- Coin 加成，颜色跟 Coin 一样 -->
      <span v-if="m.key === 'coin'" class="metric-bonus" :style="{ color: m.color }">
        +{{ levelBoost }}
      </span>
  </div>

    <div class="metric-label">{{ m.label }}</div>
  </div>

  <!-- 任务名额显示 -->
  <div v-if="(selectedProject?.slotsTotal ?? 1) >= 1" class="metric-item">
    <div
      class="metric-row dialog-slotsline"
      :title="`已占 ${selectedProject?.slotsUsed} / 名额 ${selectedProject?.slotsTotal}；剩余 ${Math.max(0, (selectedProject?.slotsLeft ?? 0))}`"
      aria-label="available-slots-dialog"
    >
      <i class="pi pi-users" aria-hidden="true"></i>
      <span class="slots-count">
        {{ selectedProject?.slotsUsed }} / {{ selectedProject?.slotsTotal }}
      </span>
    </div>
  </div>
</div>
      </div>
    </div>

    <!-- ✅ 稳定写法：用方法名而不是模板内联箭头函数 -->
    <div class="dialog-footer-left">
      <Button
        :label="$t('questLog.askleave')"
        class="custom-btn"
        @click="toggleLeavePanel"
      />
      <Button
        :label="$t('questLog.prompting')"
        class="custom-btn"
        @click="confirmLeave"
      />
    </div>

    <!-- 右下角 Mandator -->
    <!-- 右下角 Mandator -->
    <div class="assigned-box">
      <span class="assigned-label">Assigned</span>

      <AssigneesStack
        :users="selectedProject?.accepted_by || []"
        :max-visible="3"
        :size="44"
        :overlap-offset="18"
        :avatar-url-fn="avatarUrl"
        :dialog-title="'Assigned'"
        :dialog-width="'420px'"
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
            :placeholder="$t('Input.BriefReason')"
          />
        </div>

        <!-- 中部：详情理由（多行） -->
        <div class="leave-middle">
          <Textarea
            v-model="leaveDetail"
            class="leave-detail-textarea"
            :autoResize="true"
            rows="6"
            :placeholder="$t('Input.DetailReason')"
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
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '../../stores/user.js'

const userStore = useUserStore()

const levelBoost = computed(() => {
  return LEVEL_CONFIG[levelLetter.value]?.extraGold ?? 0
})

/* ================================
 *  Imports
 * ================================ */
import DOMPurify from 'dompurify'
import { useToast } from 'primevue/usetoast'

import api from '../../api.js'
import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import AssigneesStack from '../../components/AssigneesStack.vue'
import UpdateNotice from '../../components/UpdateNotice.vue'

import Avatar from 'primevue/avatar'
import SelectButton from 'primevue/selectbutton'
import Dialog from 'primevue/dialog'
import OverlayPanel from 'primevue/overlaypanel'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import ProgressBar from 'primevue/progressbar'

import {
  levelRanges,
  LEVEL_CONFIG,
  getLevelLetter
} from '../../components/levelRange.js'
import teamwork from '../../assets/team.png'
import solo1 from '../../assets/solo.png'
import solo2 from '../../assets/solo2.png'

import { useRadialTransition } from '../../components/transations/useRadialTransition.js'

const { radialTo, radialEffect } = useRadialTransition()

const levelLetter = computed(() =>
  getLevelLetter(userStore?.userInfo?.level)
)

/* ================================
 *  Setup basics
 * ================================ */
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

/* ================================
 *  Constants & Maps
 * ================================ */
const ACTION_ROUTES = Object.freeze({
  release: '/student/home-sender',
  accept:  '/student/home',
})

const levelColors = Object.freeze({
  S: '#C4A010',
  A: '#DD4546',
  B: '#DD7C1B',
  C: '#E6D624',
  D: '#8FD833',
  E: '#2590D2',
  F: '#911EC7',
})

const METRIC_DEFS = Object.freeze([
  { key: 'exp',  label: 'EXP',  unit: '',  icon: new URL('../../assets/icon/exp.png',   import.meta.url).href, color: '#11AF9B' },
  { key: 'coin', label: 'Coin', unit: '',  icon: new URL('../../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', unit: 'h', icon: new URL('../../assets/icon/time.png',  import.meta.url).href, color: '#4ACDF2' },
])

/* ================================
 *  Utils
 * ================================ */
const toInt = (v, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback
}

const toNumber = (v) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return 0
}

const lighten = (hex, amount = 0.3) => {
  const nhex = (hex || '').replace('#', '') || '333333'
  const bigint = parseInt(nhex, 16)
  let r = (bigint >> 16) & 255
  let g = (bigint >> 8) & 255
  let b = bigint & 255
  r = Math.min(255, Math.floor(r + (255 - r) * amount))
  g = Math.min(255, Math.floor(g + (255 - g) * amount))
  b = Math.min(255, Math.floor(b + (255 - b) * amount))
  const toHex = (v) => v.toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

const getLevelColor = (level) => levelColors[level] || '#333333'

const getLevelStyle = (level) => {
  const stroke = getLevelColor(level)
  const base = lighten(stroke, 0.3)
  return {
    color: base,
    fontStyle: 'italic',
    WebkitTextStrokeWidth: '0.5px',
    WebkitTextStrokeColor: stroke,
    textShadow: [
      `0  1px 0 ${stroke}`, `0 -1px 0 ${stroke}`,
      `1px 0  0 ${stroke}`, `-1px 0  0 ${stroke}`,
      `1px  1px 0 ${stroke}`, `-1px 1px 0 ${stroke}`,
      `1px -1px 0 ${stroke}`, `-1px -1px 0 ${stroke}`
    ].join(', ')
  }
}

const avatarUrl = (u) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(u?.avatar || u?.nickname || u?.name || 'user')}&skinColor=ecad80,f2d3b1`

const pickTaskImage = (task) => {
  if (task.task_type === 'team') return teamwork
  const seedStr = task.deadline || String(task.id) || ''
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2 === 0 ? solo1 : solo2
}

const toastSuccess = (summary, detail, life = 2000) => {
  toast.add({ severity: 'success', summary, detail, life })
}
const toastError = (summary, detail, life = 2500) => {
  toast.add({ severity: 'error', summary, detail, life })
}

const postJson = async (url, payload) => {
  try {
    const { data } = await api.post(url, payload)
    return { ok: true, data }
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.detail ||
      err?.message ||
      t('toasts.common.errorDetailFallback')
    return { ok: false, error: msg, raw: err }
  }
}

/* ================================
 *  Data mapping
 * ================================ */
const mapTaskToProject = (task) => {
  const slotsUsed = toInt(
    Array.isArray(task.accepted_by)
      ? task.accepted_by.length
      : (task.current_participants ?? task.current_people ?? task.joined_count ?? task.current_count ?? 0)
  )
  const slotsTotal = toInt(task.maximum_users)

  return {
    id: task.id,
    title: task.title,
    date: task.deadline,
    status: task.is_completed ? 'completed' : 'ongoing',
    image: pickTaskImage(task),
    exp: `${task.experience_reward} EXP`,
    coin: task.token_reward,
    hour: task.volunteerTime_reward,
    level: task.required_level,
    avatar:
      `https://api.dicebear.com/9.x/adventurer/svg?skinColor=ecad80,f2d3b1&seed=${task.publisher_avatar}` ||
      `https://api.dicebear.com/9.x/adventurer/svg?seed=none`,
    author: task.publisher_nickname,
    description: task.description,
    slotsUsed,
    slotsTotal,
    slotsLeft: Math.max(0, slotsTotal - slotsUsed),
    wechatId: task.wechat || '',
    accepted_by: Array.isArray(task.accepted_by)
      ? task.accepted_by.map(u => ({
          id: u.id, nickname: u.nickname, avatar: u.avatar, realname: u.realname
        }))
      : []
  }
}

/* ================================
 *  State
 * ================================ */
// 顶部 “进行中/已完成” Tabs
const activeTab = ref('ongoing')
const tabOptions = computed(() => ([
  { label: t('tabs.ongoing'),  value: 'ongoing' },
  { label: t('tabs.completed'), value: 'completed' }
]))

// Header 动作切换（Release / Accept）
const actionTab = ref('accept')
const actionOptions = ref([
  { label: t('tabs.acceptTask'),  value: 'accept' },
  { label: t('tabs.releaseTask'), value: 'release' }
])

// 项目数据
const allProjects = ref([])

// Dialog & 当前选中项目
const showDialog = ref(false)
const selectedProject = ref(null)

// 请假面板
const leavePanel = ref(null)
const leaveTitle = ref('')
const leaveDetail = ref('')

/* ================================
 *  Computed
 * ================================ */
const filteredProjects = computed(() => {
  if (!activeTab.value) return allProjects.value
  return allProjects.value.filter(p => p.status === activeTab.value)
})

const runningProjects = computed(() =>
  allProjects.value.filter(p => p.status === 'ongoing')
)

const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const greetingKey = computed(() => `greetings-student.${period.value}`)

// 选中任务的上下限
const getBoundsByLevel = (level) => levelRanges?.[level] || null
const selectedBounds = computed(() => {
  const bounds = getBoundsByLevel(selectedProject.value?.level)
  return bounds || { exp: [0, 100], coin: [0, 100], hours: [0, 24] }
})

// 进度条绑定（百分比）
const metricsBound = computed(() => {
  const p = selectedProject.value || {}
  const b = selectedBounds.value || {}

  return METRIC_DEFS.map(def => {
    let raw = toNumber(p?.[def.key] ?? 0)
    
    // 只给金币加成
    if (def.key === 'coin') {
      raw += levelBoost.value
    }

    const ranges = def.key === 'hour' ? b?.hours : b?.[def.key]
    const [min, max] = Array.isArray(ranges) && ranges.length === 2 ? ranges : [0, 0]
    const clamped = max > min ? Math.min(Math.max(raw, min), max) : raw
    const pct = max > min
      ? Math.round(((clamped - min) / (max - min)) * 100)
      : (raw > 0 ? 100 : 0)
    return { ...def, raw, pct }
  })
})

// 任务说明（XSS 清洗 + 图片宽度处理）
const safeDescription = computed(() => {
  const html = selectedProject.value?.description || t('common.noDescription') || $t('Not.Explain')
  const clean = DOMPurify.sanitize(html)
  // 避免 SSR 报错：仅在浏览器环境处理 DOM
  if (typeof window === 'undefined' || typeof document === 'undefined') return clean
  const div = document.createElement('div')
  div.innerHTML = clean
  div.querySelectorAll('img').forEach(img => {
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'
  })
  return div.innerHTML
})

/* ================================
 *  Watchers
 * ================================ */
watch(actionTab, (val) => {
  const to = ACTION_ROUTES[val]
  if (to)   radialTo('/student/home-sender', {
    color: '#FEF1F5',
    targetClass: '.main-body',
    appearDuration: 500,
    hold: 500,
    coverDuration: 820,
    shrinkDuration: 700,
  })
})

/* ================================
 *  Lifecycle
 * ================================ */
onMounted(async () => {
  try {
    const res = await api.get('/api/tasks/my-tasks/')
    const list = Array.isArray(res?.data) ? res.data : []
    allProjects.value = list.map(mapTaskToProject)
  } catch (err) {
    console.error('加载任务失败:', err)
    toastError(t('toasts.common.errorSummary'), t('toasts.common.errorDetailFallback'))
    allProjects.value = []
  }
})

/* ================================
 *  Actions
 * ================================ */
const openProjectDialog = (project) => {
  selectedProject.value = project
  showDialog.value = true
}

const toggleLeavePanel = (event) => {
  leavePanel.value?.toggle(event)
}

const confirmLeave = async () => {
  const url = `/api/tasks/${selectedProject.value?.id}/urge-approval/`
  const { ok, error } = await postJson(url)
  if (ok) {
    toastSuccess(t('toasts.urge.successSummary'), t('toasts.urge.successDetail'))
    leaveTitle.value = ''
    leaveDetail.value = ''
    leavePanel.value?.hide()
  } else {
    toastError(t('toasts.common.errorSummary'), error)
  }
}

const submitLeave = async () => {
  if (!leaveTitle.value.trim()) {
    toastError(t('toasts.validation.errorSummary'), t('toasts.validation.leaveReasonRequired'), 2000)
    return
  }
  const url = `/api/tasks/${selectedProject.value?.id}/cancel/`
  const payload = { summary: leaveTitle.value.trim(), detail: leaveDetail.value?.trim() || '' }
  const { ok, error } = await postJson(url, payload)
  if (ok) {
    toastSuccess(t('toasts.cancel.successSummary'), t('toasts.cancel.successDetail'))
    leaveTitle.value = ''
    leaveDetail.value = ''
    leavePanel.value?.hide()
  } else {
    toastError(t('toasts.common.errorSummary'), error)
  }
}

const goToQuestStore = () => router.push('/student/task')

/* ================================
 *  Expose helpers for template (可选)
 * ================================ */
defineExpose({
  getLevelColor,
  getLevelStyle,
  avatarUrl
})
</script>


<style scoped>
@font-face {
  font-family: 'Jersey10';
  src: url('../../assets/fonts/jersey-10-regular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

.metric-text,
.metric-bonus {
  font-size: 43px;          /* 可以和数字一样，也可以单独调 */
  font-weight: 600;
  color: #FFFFFF;           /* 字体颜色保持你想要的颜色 */
  font-family: 'Jersey10', sans-serif !important;

  /* 灰色描边 */
  text-shadow:
    2px 2px 0 #676767,
   -2px 2px 0 #676767,
    2px -2px 0 #676767,
   -2px -2px 0 #676767,
    0 2px 0 #676767,
    0 -2px 0 #676767,
    2px 0 0 #676767,
   -2px 0 0 #676767;

  /* 保持位置 */
  position: absolute;
  top: 50%;
  left: calc(100% + 8px);  /* 显示在 Coin 数字右边 */
  transform: translateY(-50%);
  pointer-events: none;
  white-space: nowrap;
}

.metric-bonus {
  left: calc(100% + 8px); /* 显示在 Coin 数字右边 */
}

.metric-text {
  left: 93%;
  transform: translate(-50%, -50%);
}

.metric-row {
  position: relative;
}
.right-metrics,
.metric-item,
.metric-row {
  overflow: visible;
}

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
  font-size: 20px;
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
  font-size: 26px;
  font-weight: 600;
  color: #FFFFFF;

  text-shadow:
    2px 2px 0 #676767,
   -2px 2px 0 #676767,
    2px -2px 0 #676767,
   -2px -2px 0 #676767,
    0 2px 0 #676767,
    0 -2px 0 #676767,
    2px 0 0 #676767,
   -2px 0 0 #676767;
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
.task-slotsline,
.dialog-slotsline {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  color: #A8A6A6;
}
.task-slotsline { margin-top: 6px; }
.dialog-slotsline { margin-top: 8px; gap: 8px; }
.task-slotsline .pi,
.dialog-slotsline .pi { font-size: 20px; }
.slots-count { font-weight: 700; }

/* 已接取状态右下角叠加 */
.absolute-accept-button.assigned-stack {
  display: flex;
  align-items: center;
  gap: 8px;
}
.assigned-label {
  font-size: 18px;
  color: #b8b8b8;
  font-weight: 600;
}

/* =========================
   Filter Dialog
   ========================= */
:deep(.filter-dialog) .p-dialog-title {
  font-size: 30px !important;
  font-weight: 700;
  color: #1e1e1e;
}
:deep(.filter-dialog) .p-dialog-content {
  padding: 10px !important;
  box-sizing: border-box;
  overflow: hidden !important;
  max-height: none !important;
}

.filter-section { margin-bottom: 20px !important; }
.level-section { padding: 0 20px; }
.level-label {
  font-size: 20px;
  font-weight: 600;
  color: #1e1e1e;
  margin: 10px -10px;
}
.level-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  align-items: center;
  margin: 20px 10px;
}
.level-item { display: inline-flex; align-items: center; gap: 10px; }
.level-item :deep(.p-checkbox-box) {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #c8d3e6;
  transition: all 0.2s ease;
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
.level-text { font-size: 18px; color: #1e1e1e; }

/* 状态切换 SelectButton */
.status-toggle-wrap { margin: 0; }
.status-toggle { margin: 0 10px; width: calc(100% - 20px); }
:deep(.filter-dialog) .status-toggle { width: 100% !important; }
:deep(.filter-dialog) .p-selectbutton .p-button { padding: 0 !important; min-width: auto !important; }
:deep(.filter-dialog) .p-selectbutton .p-button .p-button-label {
  display: inline-block;
  padding: 6px 10px !important;
  line-height: 1.2;
}

/* 确认按钮固定右下 */
.absolute-apply-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 999;
}
.apply-button {
  background-color: #2A2C52;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(42, 44, 82, 0.2);
  transition: background-color 0.3s, transform 0.2s;
}
.apply-button:hover { background-color: #2A2C52; transform: translateY(-1px); }
.apply-button:active { background-color: #2A2C52 !important; color: #ffffff !important; box-shadow: 0 4px 12px rgba(42, 44, 82, 0.2); }

/* 富文本图片限制 */
.rich-text img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 8px 0;
  border-radius: 6px;
}
.metric-row.dialog-slotsline {
  height: 40px;             /* 行整体高度加大 */
  border-radius: 999px;
  background: #D1EDF2;      /* 底色保持一致，可去掉 */
  padding: 0 16px;          /* 内边距增加，数字不贴边 */
  gap: 25px;                /* 图标与数字的间距 */
}

.dialog-slotsline .pi {
  font-size: 26px;          /* 用户图标更大 */
  color: #334255;
}

.dialog-slotsline .slots-count {
  font-size: 24px;          /* 数字放大 */
  font-weight: 600;          /* 更粗显眼 */
  color: #334255;
}
/* 修正你上一版的小笔误（这段原注释结尾写成了 * /) 导致 CSS 解析异常） */
.dialog-slotsline {
  font-size: 20px;       /* 文本整体变大 */
  /* gap 已由 .metric-row.dialog-slotsline 控制 */
}

/* 放到本页 <style scoped> 或全局样式里 */
.header-action-toggle {
  margin-left: -10px;
  display: flex;
  align-items: center;
}
.header-action-toggle .tab-toggle :deep(.p-selectbutton .p-button) {
  padding: 0.35rem 0.8rem;
}

.author-block {
  display: flex;
  flex-direction: column;
  gap: 0px; /* 作者名与 pill 的垂直间距 */
}

/* 深色椭圆标签（沿用你的主色 #2A2C55，与 .custom-btn 一致） */
.wechat-pill {
  align-self: flex-start;          /* 贴左对齐，不占满 */
      /* 深色底，与你项目一致 */
  color: #848282;
  border-radius: 999px;            /* 椭圆形 */
  padding: 2px 0px;               /* 高度/左右内边距 */
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>