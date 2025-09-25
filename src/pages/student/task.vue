<template>
  <Toast />
  <!-- 右侧主容器 -->
  <div class="main-content">
    <!-- 顶部栏 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">{{ $t('questBoard.title') }}</span>
        <div class="vertical-divider"></div>
      </div>
      <!-- 公告组件（保持原有交互与样式） -->
      <AnnouncementPanel />
    </div>

    <!-- 次级标题与筛选按钮 -->
    <div class="main-subheader">
      <span class="greeting">{{ $t(greetingKey) }}</span>

      <div class="filter-buttons-wrapper small-toggle">
        <div class="fake-select-wrapper">
          <Button
            :label="$t('questBoard.filter')"
            icon="pi pi-filter"
            @click="showFilterDialog = true"
            class="filter-button"
          />
        </div>
      </div>
    </div>

    <!-- ✅ 卡片区域容器（分页器固定在该容器的右下角） -->
    <div class="main-body">
      <!-- 背景层 -->
      <div class="card-background"></div>

      <!-- 卡片网格（可滚动包裹） -->
      <div
        class="cards-scroll"
        :class="hasOverflow ? 'with-scroll' : 'no-scroll'"
        ref="cardsScrollRef"
        aria-label="projects-scroll-container"
      >
        <div class="grid-container">
          <div
            v-for="project in filteredProjects"
            :key="project.id"
            class="task-card"
            :class="{ 'assigned-card': project.status === 'assigned' }"
            @click="openProjectDialog(project)"
            role="button"
            tabindex="0"
            @keydown.enter="openProjectDialog(project)"
            aria-label="project-card"
          >
            <!-- 上部图文 -->
            <div class="task-main-content">
              <!-- 左侧文本 -->
              <div class="task-left">
                <h3 class="task-title">{{ project.title }}</h3>

                <div class="task-time">
                  <label>DDL</label>
                  <span>{{ project.date }}</span>
                </div>

                <div class="task-exp">{{ project.exp || 'N/A' }}</div>

                <!-- ✅ 名额条：仅在存在多个名额时显示 -->
                <div
                  v-if="project.slotsTotal >= 1"
                  class="task-slotsline"
                  :title="`已占 ${project.slotsUsed} / 名额 ${project.slotsTotal}；剩余 ${Math.max(0, project.slotsLeft)}`"
                  aria-label="available-slots"
                >
                  <i class="pi pi-users" aria-hidden="true"></i>
                  <span class="slots-count">
                    {{ project.slotsUsed }} / {{ project.slotsTotal }}
                  </span>
                </div>
              </div>

              <!-- 右侧图片（assigned 状态通过 CSS 隐藏） -->
              <div class="task-right">
                <img
                  :src="project.image"
                  alt="Project Image"
                  class="task-image"
                  @load="onCardImageLoad"
                />
              </div>
            </div>

            <!-- 分割线 -->
            <div class="task-divider"></div>

            <!-- 底部头像与等级 -->
            <div class="task-footer">
              <div class="avatar-wrapper">
                <Avatar :image="project.avatar" shape="circle" style="width: 40px; height: 40px" />
                <span class="avatar-name">{{ project.author }}</span>
              </div>

              <span class="task-level" :style="getLevelStyle(project.level)">
                Level {{ project.level }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ✅ 分页器容器（固定在右下角） -->
      <div class="fixed-footer-wrapper">
        <Paginator
          :rows="rowsPerPage"
          :totalRecords="totalRecords"
          :first="currentPage * rowsPerPage"
          @page="(e) => (currentPage = e.page)"
          style="background-color: white; border-radius: 12px; padding: 4px 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"
          aria-label="paginator"
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
              aria-label="back"
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
          <div
            class="floating-dialog-level"
            :style="getLevelStyle(selectedProject?.level)"
          >
            Level {{ selectedProject?.level || '' }}
          </div>
        </div>
      </template>

      <!-- 弹窗主体内容 -->
      <div class="dialog-content-wrapper">
        <!-- 左侧内容区域（75%） -->
        <div class="dialog-left-section">
          <!-- ✅ 头像与作者 -->
          <div class="dialog-author">
            <Avatar
              :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
              shape="circle"
              size="large"
              style="width: 50px; height: 50px"
            />
            <span class="author-name">{{ selectedProject?.author }}</span>
          </div>

          <!-- ✅ 描述：富文本清洗后输出 -->
          <div class="dialog-description rich-text" v-html="safeDescription"></div>
        </div>

        <!-- 中间分割线 -->
        <div class="dialog-grid-divider" aria-hidden="true"></div>

        <!-- 右侧占位区域（25%） -->
        <div class="dialog-right-section">
          <!-- 为浮动的 Level 预留等高空间，保证与第一条进度条的距离 -->
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
                <span
                  class="metric-text"
                  style="position:absolute;top:50%;left:93%;transform:translate(-50%,-50%);font-size:16px;font-weight:600;color:#2A2C55;pointer-events:none;"
                >
                  {{ m.raw }}{{ m.unit }}
                </span>
              </div>
              <div class="metric-label">{{ m.label }}</div>
            </div>

            <!-- ✅ 名额条（右侧） -->
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

      <!-- 接任务按钮 + (可选) 已接取者头像叠加（固定右下角） -->
      <div
        class="absolute-accept-button"
        :class="{ 'assigned-stack': selectedProject?.status === 'assigned' }"
      >
        <!-- ✅ 无论是否 assigned：只要 accepted_by 有人，就并排显示头像叠加 -->
        <AssigneesStack
          v-if="(selectedProject?.accepted_by?.length ?? 0) > 0"
          :users="selectedProject?.accepted_by"
          :max-visible="3"
          :size="44"
          :overlap-offset="18"
          :avatar-url-fn="avatarUrl"
          :dialog-title="'Assigned'"
          :dialog-width="'420px'"
        />

        <!-- 未接取：显示 Accept 按钮 -->
        <template v-if="selectedProject?.status !== 'assigned'">
          <Button
            label="Accept"
            class="custom-btn"
            @click="applyForTask(selectedProject?.id)"
          />
        </template>

        <!-- 已接取：显示“Assigned”标签 -->
        <template v-else>
          <span class="assigned-label">Assigned</span>
        </template>
      </div>
    </Dialog>

    <!-- ✅ 筛选弹窗 -->
    <Dialog
      v-model:visible="showFilterDialog"
      modal
      dismissableMask
      header="Filter Tasks"
      class="filter-dialog"
      appendTo="self"
      :style="{ width: '1100px', height: '700px', position: 'relative' }"
    >
      <!-- 状态切换（assigned / available） -->
      <div class="filter-section">
        <div class="status-toggle-wrap">
          <SelectButton
            v-model="tempTab"
            :options="['assigned', 'available']"
            class="status-toggle"
            aria-label="status-toggle"
          />
        </div>
      </div>

      <!-- Level 多选 -->
      <div class="filter-section level-section">
        <div class="level-label">Choose level</div>
        <div class="level-row">
          <div v-for="opt in levelOptions" :key="opt.value" class="level-item">
            <Checkbox v-model="tempLevels" :inputId="'lvl-' + opt.value" :value="opt.value" />
            <label class="level-text" :for="'lvl-' + opt.value">{{ opt.label }}</label>
          </div>
        </div>
      </div>

      <!-- 确认应用 -->
      <div class="absolute-apply-button">
        <Button label="confirm" @click="confirmFilter" class="apply-button custom-btn" />
      </div>
    </Dialog>
  </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
  requiresAuth: true
  roles: ['student']
</route>

<script setup>
/**
 * 逻辑区块顺序：
 * 1) imports
 * 2) 弹窗/筛选的响应式状态
 * 3) 数据源（服务端分页）
 * 4) 过滤（computed）
 * 5) 分页与加载方法
 * 6) 监听与溢出判定
 * 7) 工具函数与样式工具
 */
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Checkbox from 'primevue/checkbox'
import SelectButton from 'primevue/selectbutton'
import Paginator from 'primevue/paginator'
import ProgressBar from 'primevue/progressbar'
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import api from '../../api.js'

// === 进度条上下限表 ===
import { levelRanges } from '../../components/levelRange.js'

// === 图片：按任务类型选择 ===
import teamwork from '../../assets/team.png'
import solo1 from '../../assets/solo.png'
import solo2 from '../../assets/solo2.png'

import DOMPurify from 'dompurify'
import { useToast } from 'primevue/usetoast'
import AssigneesStack from '../../components/AssigneesStack.vue'

const toast = useToast()

/* -------------------- 问候语 -------------------- */
const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const greetingKey = computed(() => `greetings-student.${period.value}`)

/* -------------------- 任务弹窗状态 -------------------- */
const showDialog = ref(false)
const selectedProject = ref(null)
const openProjectDialog = (project) => {
  selectedProject.value = project
  showDialog.value = true
}

/* -------------------- 数据源（服务端分页获取） -------------------- */
const allProjects = ref([])          // 当前页的数据
const loading = ref(false)
const loadError = ref('')
const totalRecords = ref(0)          // 服务端总条数（用于分页器）
const rowsPerPage = 4                // ✅ 单一来源：分页大小

// 简单日期展示：直接透传或兜底
const formatDate = (s) => s || ''

// 按任务类型选择图片（与你原逻辑一致，hash 保证多样性）
function pickTaskImage(task) {
  if (task.task_type === 'team') return teamwork
  const seedStr = task.deadline || String(task.id) || ''
  let hash = 0
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash) % 2 === 0 ? solo1 : solo2
}

// ✅ 修复 avatar URL 的兜底逻辑（避免“第一个始终 truthy”）
function buildAvatarUrl(seedRaw) {
  const seed = (seedRaw ?? '').toString().trim()
  const base = 'https://api.dicebear.com/9.x/adventurer/svg'
  const skin = 'skinColor=ecad80,f2d3b1'
  if (seed) return `${base}?${skin}&seed=${encodeURIComponent(seed)}`
  return `${base}?seed=none`
}

function mapTaskToProject(task) {
  // 工具：确保整数兜底
  const toInt = (v, fallback = 0) => {
    const n = Number(v)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback
  }

  const slotsUsed = toInt(
    Array.isArray(task.accepted_by)
      ? task.accepted_by.length
      : (task.current_participants ?? task.current_people ?? task.joined_count ?? task.current_count ?? 0)
  )

  const slotsTotal = toInt(
    task.maximum_users
  )


  return {
    id: task.id,
    title: task.title,
    date: formatDate(task.deadline),
    status: task.is_accepted ? 'assigned' : 'available',
    image: pickTaskImage(task),
    exp: `${task.experience_reward} EXP`,
    coin: task.token_reward,
    hour: task.volunteerTime_reward,
    level: task.required_level || 'F',
    avatar: buildAvatarUrl(task.publisher_avatar),
    author: task.publisher_nickname || 'Anonymous',
    description: task.description || '',
    slotsUsed,
    slotsTotal,
    slotsLeft: Math.max(0, slotsTotal - slotsUsed),
    accepted_by: Array.isArray(task.accepted_by)
      ? task.accepted_by.map(u => ({
          id: u.id,
          nickname: u.nickname || u.name || 'User',
          avatar: u.avatar,
          realname: u.realname
        }))
      : []
  }
}

/* -------------------- 筛选状态（tab + level 多选） -------------------- */
const activeTab = ref('available')  // ✅ 明确默认 Tab
const showFilterDialog = ref(false)
const tempTab = ref(activeTab.value)
const levelOptions = [
  { label: 'Level F', value: 'F' },
  { label: 'Level E', value: 'E' },
  { label: 'Level D', value: 'D' },
  { label: 'Level C', value: 'C' },
  { label: 'Level B', value: 'B' },
  { label: 'Level A', value: 'A' },
  { label: 'Level S', value: 'S' },
  { label: 'Level S*', value: 'S*' },
]
const selectedLevels = ref([])
const tempLevels = ref([])

const avatarUrl = (u) =>
  buildAvatarUrl(u?.avatar || u?.nickname || u?.name || 'user')

/* -------------------- 过滤（当前页内） -------------------- */
const filteredProjects = computed(() => {
  if (!selectedLevels.value?.length) return allProjects.value
  return allProjects.value.filter((p) => selectedLevels.value.includes(p.level))
})

/* -------------------- 安全描述（富文本清洗） -------------------- */
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

/* -------------------- 分页与加载方法 -------------------- */
const currentPage = ref(0) // 0 基，用于配合 Paginator

// 仅加载指定页（page 从 1 开始）
const fetchPage = async (page = 1, isAssigned = null) => {
  loading.value = true
  loadError.value = ''
  try {
    const params = { page, page_size: rowsPerPage }
    // ⭐ 只有在手动筛选时才加 is_accepted
    if (isAssigned === true) params.is_accepted = true
    if (isAssigned === false) params.is_accepted = false

    const { data } = await api.get('/api/tasks/', { params })
    const results = Array.isArray(data?.results) ? data.results : []
    allProjects.value = results.map(mapTaskToProject)
    totalRecords.value = Number.isFinite(data?.count) ? data.count : (data?.total ?? results.length)
  } catch (err) {
    console.error(err)
    loadError.value = '加载任务失败'
    allProjects.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

// 应用筛选：重置到第 1 页并请求
const applyFilter = async () => {
  activeTab.value = tempTab.value
  selectedLevels.value = [...tempLevels.value]
  showFilterDialog.value = false
  currentPage.value = 0

  // 只有手动切换才决定是否加 is_accepted
  let flag = null
  if (activeTab.value === 'assigned') flag = true
  if (activeTab.value === 'available') flag = false

  await fetchPage(1, flag)
}
const confirmFilter = () => applyFilter()

/* -------------------- 监听 -------------------- */
// 打开筛选弹窗时同步临时值
watch(showFilterDialog, (v) => {
  if (v) {
    tempTab.value = activeTab.value
    tempLevels.value = [...selectedLevels.value]
  }
})

// 翻页时请求对应页（Paginator 会把 e.page 设为 0 基索引）
watch(currentPage, async (newIdx, oldIdx) => {
  if (newIdx === oldIdx) return
  let flag = null
  if (activeTab.value === 'assigned') flag = true
  if (activeTab.value === 'available') flag = false
  await fetchPage(newIdx + 1, flag)
})

/* -------------------- 进度条：按等级动态上下限 -------------------- */
const toNumber = (v) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return 0
}
const getBoundsByLevel = (level) => levelRanges?.[level] || null

const selectedBounds = computed(() => {
  const lvl = selectedProject.value?.level
  const b = getBoundsByLevel(lvl)
  return b || { exp: [0, 100], coin: [0, 100], hours: [0, 24] }
})

const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  unit: '',  icon: new URL('../../assets/icon/exp.png', import.meta.url).href,  color: '#11AF9B' },
  { key: 'coin', label: 'Coin', unit: '',  icon: new URL('../../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', unit: 'h', icon: new URL('../../assets/icon/time.png', import.meta.url).href,  color: '#4ACDF2' },
]

const metricsBound = computed(() => {
  const p = selectedProject.value || {}
  const b = selectedBounds.value || {}
  return METRIC_DEFS.map(def => {
    const raw = toNumber(p?.[def.key] ?? 0)
    const ranges = def.key === 'hour' ? b?.hours : b?.[def.key]
    const [min, max] = Array.isArray(ranges) && ranges.length === 2 ? ranges : [0, 0]
    const clamped = max > min ? Math.min(Math.max(raw, min), max) : raw
    const pct = max > min
      ? Math.round(((clamped - min) / (max - min)) * 100)
      : (raw > 0 ? 100 : 0)
    return { ...def, raw, pct }
  })
})

/* -------------------- 卡片区域溢出控制 -------------------- */
const cardsScrollRef = ref(null)
const hasOverflow = ref(false)

const updateOverflow = () => {
  const el = cardsScrollRef.value
  if (!el) return
  hasOverflow.value = el.scrollHeight - el.clientHeight > 1
}

let resizeTimer = null
const onResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    updateOverflow()
  }, 100)
}

onMounted(async () => {
  // 初次加载：不带 is_accepted，交由后端返回“全部/默认集”
  await fetchPage(1, null)
  await nextTick()
  updateOverflow()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})
// 监听项目列表/筛选弹窗变化（仅用于溢出计算）
watch([filteredProjects, showFilterDialog], async () => {
  await nextTick()
  updateOverflow()
}, { flush: 'post' })

const onCardImageLoad = () => updateOverflow()

/* -------------------- 接任务 API 调用 -------------------- */
const applyForTask = async (taskId) => {
  if (!taskId) return
  try {
    await api.post(`/api/tasks/${taskId}/apply/`)
    showDialog.value = false

    // 接受任务后，按当前 tab 重新拉取并回到第一页
    const wantAssigned = activeTab.value === 'assigned'
    currentPage.value = 0
    await fetchPage(1, wantAssigned)

    toast.add({
      severity: 'success',
      summary: '已接受任务',
      detail: '任务申请成功，列表已更新。',
      life: 3000
    })
  } catch (err) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: '操作失败',
      detail: (err?.response?.data?.detail) || '接受任务失败，请稍后再试。',
      life: 4000
    })
  }
}

/* -------------------- 等级颜色样式工具 -------------------- */
const levelColors = {
  S: '#C4A010',
  A: '#DD4546',
  B: '#DD7C1B',
  C: '#E6D624',
  D: '#8FD833',
  E: '#2590D2',
  F: '#911EC7'
}
function lighten(hex, amount = 0.3) {
  const nhex = hex.replace('#', '')
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
function getLevelStyle(level) {
  const stroke = levelColors[level] || '#333333'
  const base = lighten(stroke, 0.3)
  return {
    color: base,
    fontStyle: 'italic',
    WebkitTextStrokeWidth: '0.3px',
    WebkitTextStrokeColor: stroke,
    textShadow: [
      `0  1px 0 ${stroke}`,
      `0 -1px 0 ${stroke}`,
      `1px 0  0 ${stroke}`,
      `-1px 0  0 ${stroke}`,
      `1px  1px 0 ${stroke}`,
      `-1px 1px 0 ${stroke}`,
      `1px -1px 0 ${stroke}`,
      `-1px -1px 0 ${stroke}`
    ].join(', ')
  }
}
</script>

<style scoped>
/* =========================
   布局与头部
   ========================= */
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
  padding: 4px 0;
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

.main-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
  min-height: 40px;
}

.greeting {
  font-style: italic;
  font-size: 18px;
  color: #333;
}

/* =========================
   筛选按钮
   ========================= */
.filter-buttons-wrapper {
  display: inline-flex;
  padding: 2px;
  border: 1px solid #c5d4ea;
  border-radius: 12px;
  background-color: white;
}

/* 合并 .filter-button 与 .filter-button.p-button */
.filter-button,
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

.small-toggle {
  transform: scale(0.9);
  transform-origin: right center;
}

/* =========================
   卡片区域
   ========================= */
.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid #e4eaf4;
  min-height: 0; 
}

.card-background {
  position: absolute;
  inset: 0;
  background-color: #f3f7fe;
  border-radius: 12px;
  z-index: 0;
}

.cards-scroll {
  position: absolute;
  inset: 0 0 64px 0;  /* bottom 预留分页器高度 */
  padding: 40px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}
.cards-scroll.with-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}
.cards-scroll.no-scroll {
  overflow: hidden;
}

.grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 0;
  min-height: fit-content; 
}

/* 卡片 */
.task-card {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px 16px 8px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.task-main-content {
  display: flex;
  gap: 16px;
}

.task-left,
.task-right {
  width: 50%;
  box-sizing: border-box;
}

.task-left {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-wrap: break-word;
}

.task-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 4px 0;
  text-align: left;
  width: 100%;
}

.task-time {
  color: #888;
  font-size: 18px;
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-exp {
  font-size: 17px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
  color: #81A0EF !important;
  -webkit-text-stroke: 1px #3A494D;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.task-right {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 0;
}

.task-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

.task-divider {
  width: 100%;
  height: 1px;
  background-color: #e1e8f5;
  margin: 0;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.task-level {
  font-size: 22px;
  text-align: right;
  font-weight: bold;
}

/* ===== Assigned 卡片配色与水印（合并相关样式） ===== */
.assigned-card {
  background-color: #D1EDF2 !important;
}
.assigned-card .task-divider { background-color: #B8DBEB !important; }
.assigned-card .task-title,
.assigned-card .task-time { color: #95B0B5 !important; }
.assigned-card .task-exp {
  color: #BCD8DD !important;
  -webkit-text-stroke: 1px #A1BEC3;
  text-shadow: none !important;
}
.assigned-card .task-level {
  -webkit-text-stroke: 1px #A1BEC3;
  color: #CCE8ED !important;
}
/* 保留右侧列和图片的尺寸，但不显示内容 */
.assigned-card .task-right,
.assigned-card .task-image {
  visibility: hidden;
}
/* 水印 */
.assigned-card::before {
  content: "Assigned";
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
  font-size: 48px;
  font-weight: bold;
  color: #A0C0C9;
  opacity: 0.25;
  pointer-events: none;
  white-space: nowrap;
}

/* =========================
   分页器
   ========================= */
.fixed-footer-wrapper {
  position: absolute;
  right: 16px;
  bottom: 8px;
  height: 64px;
  display: flex;
  justify-content: flex-end;
  pointer-events: auto !important;
  z-index: 20 !important;
}
.fixed-footer-wrapper :deep(.p-paginator) {
  pointer-events: auto;
}

/* =========================
   Dialog：结构与样式
   ========================= */
:deep(.p-dialog) { height: 100%; }
.project-dialog :deep(.p-dialog-header) { padding: 0 !important; }
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

/* Dialog Header */
.dialog-custom-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 12px;
}
.dialog-back-button { font-size: 18px; color: #333; }
.dialog-header-center { display: flex; flex-direction: column; justify-content: space-between; padding: 0; }
.dialog-title {
  font-size: 30px;
  font-weight: 800;
  color: #1e1e1e;
  margin: 0;
}
.dialog-date-inline {
  font-size: 16px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 5px;
}
.floating-dialog-level {
  position: absolute;
  top: 28px;
  right: 130px;
  font-weight: bold;
  font-size: 32px;
  text-shadow: none;
}

/* 左侧主列 */
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
.dialog-left-section {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  padding-left: 24px;
  margin-top: 0;
  overflow: visible;
}
.dialog-grid-divider {
  grid-column: 2;
  background-color: #ccc;
  border-radius: 1px;
  align-self: stretch;
  margin-block: var(--divider-inset);
}
.dialog-right-section {
  grid-column: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 8px 16px;
  --metric-gap: 16px;
  z-index: 2;
}

/* 头像与作者名 */
.dialog-author {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 40px;
  margin-bottom: 16px;
  margin-left: -14px;
  gap: 20px;
}
.dialog-author :deep(.p-avatar) {
  position: static;
  left: calc(-50px - 8px);
  top: 0;
}
.author-name {
  font-weight: 500;
  font-size: 20px;
  line-height: 1.2;
  margin: 0;
}

/* 描述富文本 */
.dialog-description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  white-space: normal;
  overflow-wrap: anywhere;
  margin-left: 60px;
  margin-top: -10px;
}

/* 图片占位容器（如描述中含图片） */
.dialog-images {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-top: 12px;
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

/* 接任务按钮（右下） */
.absolute-accept-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
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
:deep(.custom-btn.p-button) {
  background-color: #2A2C55 !important;
  border: none !important;
  color: #ffffff !important;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
:deep(.custom-btn.p-button:hover) {
  background-color: #1f2344 !important;
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.25);
}
:deep(.custom-btn.p-button:active) {
  background-color: #1f2344 !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2) inset;
}

/* 右侧指标区 */
.right-level-spacer {
  font-weight: bold;
  font-size: 32px;
  line-height: 1.2;
  visibility: hidden;
}
.right-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--metric-gap);
  width: clamp(220px, 80%, 320px);
  margin: 0 auto;
}
.metric-item { display: flex; flex-direction: column; gap: 4px; }
.metric-row {
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
}
.metric-icon {
  width: clamp(28px, 4vw, 45px);
  height: clamp(28px, 4vw, 45px);
  margin-right: max(-12px, -2vw);
  flex-shrink: 0;
  z-index: 3;
  position: relative;
}
.metric-bar { flex: 1; width: 100%; min-width: 120px; }
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
  background-color: var(--bar-color, #3b82f6);
}
.metric-label { margin-left: 10px; font-size: 13px; font-weight: 600; color: #5a6275; }
.metric-text { font-size: 12px; font-weight: 600; color: #fff; }

.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}

/* ✅ 卡片与弹窗的名额条样式统一 */
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

/* 固定右下角容器：统一用 flex 横向排列，按钮与头像叠加并排显示 */
.absolute-accept-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
  display: inline-flex;     /* 关键：让子元素横向排列 */
  align-items: center;
  gap: 12px;                /* 按钮与头像叠加之间的间距 */
}

/* 已接取时仍然横排；保留你原先的“Assigned”文案样式 */
.absolute-accept-button.assigned-stack {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.assigned-label {
  font-size: 18px;
  color: #b8b8b8;
  font-weight: 600;
}

</style>