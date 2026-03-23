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
        </div>
        <AnnouncementPanel />
      </div>

      <div class="main-subheader">
        <span class="greeting">{{ $t(greetingKey) }}</span>
        <div class="filter-buttons-wrapper small-toggle">
          <SelectButton
            v-model="activeTab"
            :options="tabOptions"
            :allowEmpty="false"
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
      @click="openNewTaskDialog"
    />

    <!-- 发布任务弹窗 -->
    <Dialog
      v-model:visible="showDialog"
      modal
      class="p-fluid my-task-dialog"
      :style="{ width: '1100px', maxWidth: '90vw' , height:'700px'}"
      @hide="onPublishDialogHide"
    >
      <template #header>
      <div class="dialog-header-custom">
        <h2 class="dialog-header-title">{{ $t('teacherHome.releaaseTask') }}</h2>
        <i 
          class="pi pi-question-circle help-icon"
          v-tooltip.top="$t('teacherHome.helpText')"
        ></i>
      </div>
    </template>

    <div class="gapping">
      <!-- Choose level -->
        <div class="p-field">
          <label class="choose-size-label">{{ $t('teacherHome.chooseLevel') }}</label>
          <div class="level-options">
            <div v-for="level in levels" :key="level" class="level-item">
              <RadioButton 
                v-model="selectedLevel"
                :inputId="level"
                :value="level"
                name="quest-level"
                class="gapBetweenElements"
                @change="onLevelChange"
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
            v-model:num = "num"
            :customRanges="selectedLevel === 'Design' ? customRanges : null"
          />
      </div>

      <div class="gapping">
        <div class="mode-switch" :class="{ active: taskMode }">
          <div class="switch-bg" :class="{ right: taskMode === 'team' }"></div>

          <div
            class="switch-btn"
            :class="{ active: taskMode === 'solo' }"
            @click="taskMode = 'solo'"
          >
            单人
          </div>

          <div
            class="switch-btn"
            :class="{ active: taskMode === 'team' }"
            @click="taskMode = 'team'"
          >
            组队
          </div>
        </div>
      </div>

      <div class="gapping">
        <!-- 任务日期 -->
        <div class="p-field field-stack">
          <label class="choose-size-label">{{ $t('teacherHome.taskDetails') }}</label>
          <!-- 让输入框占满一行或指定宽度都可以 -->
          <div class="pos">
           <span class="p-float-label">
            <Calendar
              id="date"
              v-model="taskDate"
              inputId="taskDateInput"
              dateFormat="mm/dd/yy"
              :placeholder="$t('teacherHome.datePlaceholder')"
              showIcon
              class="task-date-input"
              :minDate="todayStart"
              :manualInput="false"  
            ></Calendar>
          </span>
          </div>
        </div>
      </div>

      <div class="gapping">
        <!-- 新增：任务大标题 -->
        <div class="p-field pos">
          <InputText id="bigTitle" v-model="bigTitle" :placeholder="$t('teacherHome.bigTitle')" style="width: 100%;" />
        </div>
      </div>

      <div class="gapping">
        <!-- 富文本编辑表单（替换原 Textarea+自定义提交按钮） -->
        <Form
          v-slot="$form"
          :key="formKey"
          :resolver="resolver"
          :initialValues="initialValues"
          @submit="onFormSubmit"
          class="flex flex-col gap-4"
        >
          <div class="flex flex-col gap-1 pos">
            <Editor
              name="content"
              v-model="editorContent"
              editorStyle="height: 320px"
              :placeholder="$t('teacherHome.editorPlaceholder')"
            />
            <Message
              v-if="$form?.content?.invalid"
              severity="error"
              size="small"
              variant="simple"
            >
              {{ $form?.content?.error?.message }}
            </Message>
          </div>
          <Button
            class="submitPosition"
            type="submit"
            severity="secondary"
            :label="$t('teacherHome.submit')"
            :loading="isDownloading"
            :disabled="!isFormValid || isDownloading"
          />
        </Form>
      </div>
    </Dialog>
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
              <span>
                <label>{{ $t('teacherHome.deadlineLabel') }}</label>
                {{ project.date }}
              </span>
            </div>
            <div class="task-exp">{{ formatExp(project.exp) }}</div>
          <div
            v-if="project.slotsTotal >= 1"
            class="task-slotsline"
            :title="formatSlotsTitle(project.slotsUsed, project.slotsTotal, Math.max(0, project.slotsTotal - project.slotsUsed))"
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
                {{ $t('common.level') }} {{ project.level }}
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
          @click="showDialog = true"
          @keypress.enter="showDialog = true"
        >
          <div class="add-card-content">
            <i class="pi pi-plus large-plus" aria-hidden="true"></i>
            <div class="add-text">{{ $t('questLog.publishQuest') }}</div>
          </div>
        </div>
      </div>
    </div>
    </div>

        <!-- ============ 项目详情弹窗（qdlg-* 命名空间） ============ -->
    <Dialog
      v-model:visible="showProjectDialog"
      modal
      blockScroll
      dismissableMask
      :closable="false"
      :style="{ width: '1100px', height: '700px', position: 'relative' }"
      class="qdlg-dialog"
    >
      <template #header>
        <div class="qdlg-header">
          <!-- 左侧返回 -->
          <div class="qdlg-header-left">
            <Button
              icon="pi pi-arrow-left"
              text
              class="qdlg-back-btn"
              :aria-label="$t('common.back')"
              @click="showProjectDialog = false"
            />
          </div>
          <!-- 标题 + 时间 -->
          <div class="qdlg-header-center">
            <span class="qdlg-title">{{ selectedProject?.title || '' }}</span>
            <span class="qdlg-date-inline">
              <label>{{ $t('teacherHome.deadlineLabel') }}</label>
              {{ selectedProject?.date }}
            </span>
          </div>
          <!-- 编辑任务按钮（右上角小铅笔） -->
          <Button
            v-if="!isCompleted"
            icon="pi pi-pencil"
            class="qdlg-edit-task-btn p-button-rounded p-button-text"
            v-tooltip.top="$t('teacherHome.editTask')"
            severity="secondary"
            @click="editThisTask"
          />
          <!-- 右上角 Level 只显示 -->
          <div class="floating-dialog-level" :style="getLevelStyle(selectedProject?.level)">
            {{ $t('common.level') }} {{ selectedProject?.level || '' }}
          </div>
        </div>
      </template>

      <div class="qdlg-content">
        <div class="qdlg-left">
          <div class="qdlg-author">
            <Avatar
              :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
              shape="circle"
              size="large"
              style="width: 50px; height: 50px"
            />
            <span class="qdlg-author-name">{{ selectedProject?.author }}</span>
          </div>

          <div class="qdlg-description rich-text" v-html="safeDescription"></div>
        </div>

        <div class="qdlg-divider" aria-hidden="true"></div>

        <div class="qdlg-right">
          <div class="qdlg-level-spacer" aria-hidden="true">
            {{ $t('common.level') }} {{ selectedProject?.level || '' }}
          </div>

          <div class="qdlg-metrics">
            <div v-for="m in metricsBound" :key="m.key" class="qdlg-metric-item">
              <div class="qdlg-metric-row">
                <img :src="m.icon" alt="" class="qdlg-metric-icon qdlg-pixelated click-wiggle" />
                <div class="qdlg-metric-bar-wrapper" style="position:relative;">
                  <ProgressBar
                    :value="m.pct"
                    :showValue="false"
                    class="qdlg-metric-bar"
                    :style="{ height: '28px', '--bar-color': m.color }"
                  />
                  <span
                    class="qdlg-metric-text"
                    style="position:absolute;top:50%;left:93%;transform:translate(-50%,-50%);font-size:16px;font-weight:600;color:#2A2C55;pointer-events:none;"
                  >
                    {{ m.raw }}{{ m.unit }}
                  </span>
                </div>
              </div>
              <div class="qdlg-metric-label">{{ m.label }}</div>
            </div>
          <div v-if="(selectedProject?.slotsTotal ?? 1) >= 1" class="metric-item">
            <div
              class="metric-row dialog-slotsline"
              :title="formatSlotsTitle(selectedProject?.slotsUsed, selectedProject?.slotsTotal, Math.max(0, (selectedProject?.slotsLeft ?? 0)))"
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

        <!-- 右下角 Assigned（显示用） -->
        <div
        v-if="selectedProject?.accepted_by && selectedProject.accepted_by.length > 0"
        class="qdlg-assigned qdlg-assigned-stack"
      >
          <span class="qdlg-assigned-label">{{ $t('teacherHome.assigned') }}</span>

          <AssigneesStack
            :users="selectedProject.accepted_by"
            :max-visible="3"
            :size="44"
            :overlap-offset="18"
            :avatar-url-fn="avatarUrl"
            :dialog-title="$t('teacherHome.assigned')"
            :dialog-width="'420px'"
            :showRemove="true"
            :onRemove="handleRemove"
          />
        </div>
            <!-- 左下角按钮 -->
            <div class="qdlg-footer-left">
              <Button 
                v-if="!isCompleted"
                :label="$t('teacherHome.approve')" 
                icon="pi pi-check" 
                class="approve-btn"
                :loading="loadingApprove"
                :disabled="loadingApprove || (selectedProject?.accepted_by?.length ?? 0) === 0"
                v-tooltip.top="(selectedProject?.accepted_by?.length ?? 0) === 0 ? $t('teacherHome.noAssigneeToComplete') : ''"
                @click="onApprove"
              />
              <Button
                v-if="!selectedProject?.is_completed"
                :label="$t('teacherHome.cancelTask')"
                icon="pi pi-times"
                class="approve-btn"
                @click="onCancel"
              />
              <Button 
                icon="pi pi-share-alt" 
                class="share-btn p-button-rounded p-button-text" 
                v-tooltip.top="$t('teacherHome.shareTask')"
                :loading="isDownloading"
                :disabled="isDownloading"
                @click="onShare"
              />
            </div>

    </Dialog>

</template>


<route lang="yaml">
meta:
  layout: "teacher"
  requiresAuth: true
  roles: ['teacher']
</route>
<script setup lang="ts">
/* ===== Imports ===== */
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useI18n } from 'vue-i18n'
import api from '../../api.js'
import DOMPurify from 'dompurify'

import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue'
import Dialog from 'primevue/dialog'
import Avatar from 'primevue/avatar'
import ProgressBar from 'primevue/progressbar'

import { showOnce } from '../../composables/tip-once.js'
import { levelRanges } from '../../components/levelRange.js'

import '../../styles/overrides.css'
import teamwork from '../../assets/team.png'
import solo1 from '../../assets/solo.png'
import solo2 from '../../assets/solo2.png'
import { useToast } from 'primevue/usetoast'
import UpdateNotice from "../../components/UpdateNotice.vue"
import AssigneesStack from '../../components/AssigneesStack.vue'
import { watch } from 'vue'

const avatarUrl = (u) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(u?.avatar || u?.nickname || u?.name || 'user')}&skinColor=ecad80,f2d3b1`


const toast = useToast()
const loadingApprove = ref(false)

async function onApprove() {
  const id = selectedProject.value?.id

  const assignedCount = selectedProject.value?.accepted_by?.length ?? 0

  // ⛔ 无人接取 或 正在提交 时直接返回，并提示
  if (!id || loadingApprove.value || assignedCount === 0) {
    if (assignedCount === 0) {
      toast.add({
        severity: t('Hint.Warn'),
        summary: t('Not.Complete'),
        detail: t('Not.Receive'),
        life: 2500
      })
    }
    return
  }
  
  if (!id || loadingApprove.value) return
  loadingApprove.value = true
  try {
    await api.post(`/api/tasks/${id}/complete/`)

    // 本地状态更新：把该任务标记为 completed
    const idx = allProjects.value.findIndex(p => p.id === id)
    if (idx !== -1) {
      allProjects.value[idx] = { ...allProjects.value[idx], status: 'completed' }
    }
    if (selectedProject.value) {
      selectedProject.value = { ...selectedProject.value, status: 'completed' }
    }

    toast.add({
      severity: 'success',
      summary: t('Success.Operation'),
      detail: t('Success.Mark'),
      life: 2500
    })
    showProjectDialog.value = false
  } catch (err) {
    console.error('完成任务失败:', err)
    const msg =
      err?.response?.data?.detail ||
      err?.message ||
      t('Fail.Retry')
    toast.add({
      severity: 'error',
      summary: t('Fail.Operation'),
      detail: msg,
      life: 3500
    })
  } finally {
    loadingApprove.value = false
  }
}
const handleRemove = async (user) => {
  if (!selectedProject.value?.id) {
    toast.add({
      severity: t('Hint.Warn'),
      summary: t('Not.Operation'),
      detail: t('Not.Select'),
      life: 2500
    })
    return
  }

  const taskId = selectedProject.value.id
  const participantId = user?.id

  if (!participantId) {
    toast.add({
      severity: t('Fail.Operation'),
      summary: t('Fail.Operation'),
      detail: t('Not.Participants'),
      life: 3000
    })
    return
  }

  loadingApprove.value = true
  try {
    await api.post(`/api/tasks/${taskId}/remove-student/`, {
      participant_id: participantId
    })

    // 更新本地 accepted_by
    if (selectedProject.value?.accepted_by) {
      selectedProject.value.accepted_by = selectedProject.value.accepted_by.filter(
        u => u.id !== participantId
      )
    }

    // 全局列表同步更新
    const idx = allProjects.value.findIndex(p => p.id === taskId)
    if (idx !== -1) {
      allProjects.value[idx].accepted_by = allProjects.value[idx].accepted_by.filter(
        u => u.id !== participantId
      )
    }
    if (selectedProject.value) {
      selectedProject.value = { ...selectedProject.value, status: 'completed', is_completed: true }   // ✅
    }

    toast.add({
      severity: t('Success.Operation'),
      summary: t('Success.Operation'),
      detail: t('teacherHome.removedUser', { name: user.nickname || user.name || t('teacherHome.defaultUser') }),
      life: 2000
    })

    // ⭐ 判断是否已经没有参与者，刷新页面
    const remaining = selectedProject.value?.accepted_by?.length ?? 0
    if (remaining === 0) {
      window.location.reload()
    }

  } catch (err) {
    console.error('踢出失败:', err)
    toast.add({
      severity: t('Fail.Operation'),
      summary: t('Fail.Operation'),
      detail: err?.response?.data?.detail || err?.message || t('Fail.Retry'),
      life: 3500
    })
  } finally {
    loadingApprove.value = false
  }
}

const isCompleted = computed(() => {
  
  const sp = selectedProject.value
  return !!(sp?.is_completed || sp?.status === 'completed')
})

/** 分享：复制当前任务 id 到剪贴板（带兜底） */
const isDownloading = ref(false)

async function onShare() {
  if (isDownloading.value) return
  const proj = selectedProject.value
  const id = proj?.id
  if (!id) {
    toast.add({ severity: t('Hint.Warn'), summary: t('Not.Share'), detail: t('Not.Select'), life: 2500 })
    return
  }
  const shareUrl = `https://www.aidiventure.com/forward/${id}`
  isDownloading.value = true
  // 可选：提示正在生成
  toast.add({ severity: 'info', summary: t('Hint.Dispose'), detail: t('Hint.ORcode'), life: 1500 })

  try {
    const res = await api.get('api/qr/compose/', {
      params: { data: shareUrl, label: proj?.title || t('teacherHome.taskLabel', { id }) },
      responseType: 'blob'
    })

    const contentType = res.headers?.['content-type'] || 'image/png'
    const blob = new Blob([res.data], { type: contentType })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = getTaskDownloadName(id)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    toast.add({ severity: t('Success.Success'), summary: t('Success.Download'), detail: t('Success.Preserve'), life: 2000 })
  } catch (err) {
    console.error('二维码下载失败:', err)
    toast.add({ severity: t('Hint.Warn'), summary: t('Fail.Download'), detail: t('Fail.Retry'), life: 4000 })
  } finally {
    isDownloading.value = false
  }
}


/* ===== Icons ===== */
const ICON_EXP  = new URL('../../assets/icon/exp.png', import.meta.url).href
const ICON_COIN = new URL('../../assets/icon/token.png', import.meta.url).href
const ICON_TIME = new URL('../../assets/icon/time.png', import.meta.url).href

/* ===== Router / i18n / store ===== */
const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()

/* ===== Tabs ===== */
const activeTab = ref('ongoing')
const tabOptions = computed(() => [
  { label: t('tabs.ongoing'), value: 'ongoing' },
  { label: t('tabs.completed'), value: 'completed' }
])

/* ===== 项目数据：从后端获取 ===== */
const allProjects = ref([])

/** 把后端 task 映射成前端用的 project 结构（字段名尽量贴合你原本的 UI） */
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
    date: task.deadline, // 可是 ISO 或字符串，后续 parseDateLoose 兜底
    status: task.is_completed ? 'completed' : 'ongoing',
    is_completed: !!task.is_completed,
    image: pickTaskImage(task),
    exp: Number(task.experience_reward ?? 0),
    coin: task.token_reward,
    hour: task.volunteerTime_reward,
    level: task.required_level, // 例：'E' 或 'Level E'
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=${task.publisher_avatar || 'none'}&skinColor=ecad80,f2d3b1`,
    author: task.publisher_nickname,
    description: task.description,
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

/** 任务配图：team 固定 teamwork，其它根据 seed 选 solo1/solo2 */
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

/* ===== 详情 Dialog（与表单 Dialog 分离，保持 editThisTask 的行为） ===== */
const showProjectDialog = ref(false) // 任务详情弹窗（editThisTask 会把它关掉）
const selectedProject = ref(null)

function openProjectDialog(project) {
  selectedProject.value = project
  showProjectDialog.value = true
}

/* ===== 安全描述渲染 ===== */
const safeDescription = computed(() => {
  const html = selectedProject.value?.description || t('Not.Explain')
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

async function onCancel() {
  if (!selectedProject.value?.id) {
    toast.add({
      severity: t('Hint.Warn'),
      summary: t('Not.Operation'),
      detail: t('Not.Select'),
      life: 2500
    })
    return
  }

  const taskId = selectedProject.value.id

  loadingApprove.value = true
  try {
    await api.post(`/api/tasks/${taskId}/approve-cancel/?mark_completed=true`, {
    })

    toast.add({
      severity: t('Success.Success'),
      summary: t('Success.Operation'),
      detail: t('Success.Cancel'),
      life: 2000
    })

    // ⭐ 判断是否已经没有参与者，刷新页面
    window.location.reload()

  } catch (err) {
    console.error('取消失败:', err)
    toast.add({
      severity: t('Fail.Error'),
      summary: t('Fail.Operation'),
      detail: err?.response?.data?.detail || err?.message || t('Fail.Retry'),
      life: 3500
    })
  }
}

/* ===== 指标（EXP / Coin / Hour） ===== */
const toNumber = (v) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return 0
}
const getBoundsByLevel = (level) => levelRanges?.[level] || { exp:[0,100], coin:[0,100], hours:[0,24] }
const selectedBounds = computed(() => {
  const lvl = selectedProject.value?.level
  return getBoundsByLevel(lvl)
})
const metricDefs = computed(() => [
  { key: 'exp',  label: t('teacherHome.metrics.exp'), unit: '', icon: ICON_EXP, color: '#11AF9B' },
  { key: 'coin', label: t('teacherHome.metrics.coin'), unit: '', icon: ICON_COIN, color: '#FBE838' },
  { key: 'hour', label: t('teacherHome.metrics.hours'), unit: t('teacherHome.metrics.hoursUnit'), icon: ICON_TIME, color: '#4ACDF2' },
])
const metricsBound = computed(() => {
  const p = selectedProject.value || {}
  const b = selectedBounds.value || {}

  return metricDefs.value.map(def => {
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


/* ===== 用户问候 & 右上角通知示例 ===== */
const op = ref(null);
const unreadCount = ref(2);
const togglePanel = (event) => {
  op.value?.toggle(event);
  unreadCount.value = 0;
}
const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const greetingKey = computed(() => `greetings-teacher.${period.value}`)

/* ===== 过滤视图数据 ===== */
const filteredProjects = computed(() =>
  allProjects.value.filter((p) => p.status === activeTab.value)
)
const runningProjects = computed(() =>
  allProjects.value.filter((p) => p.status === 'ongoing')
)

/* ===== 路由跳转 ===== */
const goToProfile = () => {
  router.push('/teacher/home')
}

/* ===== 发布任务表单（保持你原逻辑，editThisTask 依赖这些状态） ===== */
const showDialog = ref(false)          // 发布任务弹窗
const selectedLevel = ref('')          // 或 'Level F'
const exp   = ref(0)
const coin  = ref(0)
const hours = ref(0)
const num = ref(1)
const taskMode = ref('solo')
const bigTitle = ref('')
const editorContent = ref('')
const taskDate = ref(null)

const todayStart = computed(() => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
})

watch(taskMode, (val) => {
  if (val === 'solo') {
    num.value = 1
  }
})

const isValidDateValue = (val) => {
  if (!val) return false
  if (Array.isArray(val)) {
    if (val.length === 0) return false
    const first = val[0]
    return first instanceof Date ? !isNaN(first.getTime()) : String(first).trim() !== ''
  }
  if (val instanceof Date) return !isNaN(val.getTime())
  return String(val).trim() !== ''
}

const isFormValid = computed(() => {
  const hasAwards = exp.value > 0 || coin.value > 0 || hours.value > 0 || num > 0
  const hasTitle  = bigTitle.value.trim() !== ''
  const plainText = editorContent.value.replace(/<[^>]*>/g, '').trim()
  const hasContent = plainText !== ''
  const validDate =
    taskDate.value instanceof Date &&
    !isNaN(taskDate.value.getTime()) &&
    taskDate.value.setHours(0,0,0,0) >= todayStart.value.getTime()
  return hasAwards && hasTitle && hasContent && validDate
})

const levels = computed(() => {
  const baseLevels = ['Level F', 'Level E', 'Level D', 'Level C', 'Level B', 'Level A', 'Level S']
  if (userStore.userInfo.role === 'boss') {
    baseLevels.push('Design')
  }
  return baseLevels
})

const onLevelChange = () => {
  showOnce('select-level-tip', t('teacherHome.levelTip'))
}

const initialValues = { content: '' }
const resolver = (values) => {
  const errors = {}
  if (!values.content || values.content.trim() === '') {
    errors.content = { message: t('teacherHome.contentRequired') }
  }
  return { values, errors }
}

/* 图片/内容上传替换 + 提交 */
const onFormSubmit = async (e) => {
  e?.preventDefault?.()
  try {
    let html = editorContent.value

    // 处理 base64 图片上传（保持原逻辑）
    const imgRegex = /<img[^>]+src="data:image\/[^"]+"[^>]*>/g
    const matches = html.match(imgRegex) || []
    for (const tag of matches) {
      const base64 = tag.match(/src="([^"]+)"/)?.[1]
      if (base64?.startsWith('data:image')) {
        const res = await fetch(base64)
        const blob = await res.blob()
        const fd = new FormData()
        fd.append('file', blob, `image-${Date.now()}.png`)
        const uploadResp = await api.post('/api/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        const uploadData = uploadResp.data
        if (uploadData?.url) {
          html = html.replace(base64, uploadData.url)
        }
      }
    }

    const levelLetter = selectedLevel.value?.split(' ').pop() || ''
    const payload = {
      title: bigTitle.value,
      description: html,
      required_level: levelLetter,
      experience_reward: exp.value,
      token_reward: coin.value,
      volunteerTime_reward: hours.value,
      maximum_users: num.value,
      deadline: toLocalDateTime(taskDate.value, 'end', { withOffset: false }),
      task_type: taskMode.value
    }

    const isEdit = !!isEditing.value
    const taskId = selectedProject.value?.id

    let resp
    if (isEdit && taskId) {
      // 🔹 编辑模式：PATCH
      resp = await api.patch(`/api/tasks/${taskId}/edit/`, payload)
      console.log('任务编辑成功:', resp.data)
    } else {
      // 🔹 新建模式：POST
      resp = await api.post('/api/tasks/create/', payload)
      console.log('任务创建成功:', resp.data)
    }

    const newId = resp?.data?.id || taskId
    if (newId) {
      await downloadQrForTask(newId, payload.title)
    }

    showDialog.value = false

    // 刷新任务列表
    const res = await api.get('/api/tasks/my-tasks/')
    allProjects.value = res.data.map(mapTaskToProject)

    // 重置表单和状态
    isEditing.value = false
    resetPublishForm()
  } catch (err) {
    console.error('提交任务失败:', err)
  }
}

function dateToYYYYMMDD(d: Date | null | undefined): string | null {
  if (!d) return null
  // 保险处理：Calendar 也可能在某些模式下返回数组
  const date = Array.isArray(d) ? d[0] : d
  if (!(date instanceof Date) || isNaN(date.getTime())) return null
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
/* ===== 工具函数（editThisTask 依赖） ===== */
function parseDateLoose(s) {
  if (!s) return null
  const d = new Date(s)
  if (!isNaN(d.getTime())) return d
  const s2 = String(s).replace('，', ',').replace(/\./g, '/')
  const d2 = new Date(s2)
  return isNaN(d2.getTime()) ? null : d2
}

/* ====== 挂载时获取用户与任务 ====== */
onMounted(async () => {
  try { await userStore.fetchUser() } catch {}
  try {
    const res = await api.get('/api/tasks/my-tasks/')
    allProjects.value = res.data.map(mapTaskToProject)
  } catch (err) {
    console.error('加载任务失败:', err)
  }
})

/* ====== 保持原样：不要修改 ====== */
function editThisTask() {
  if (!selectedProject.value) return
  const p = selectedProject.value
  isEditing.value = true   // ✅ 新增：标记为编辑模式
  // ① 预填“发布任务”表单
  bigTitle.value     = p.title || ''
  editorContent.value = p.description || ''
  // level：如果后端给的是 'E' 这种字母，转成 'Level E'
  if (p.level === 'Design') {
    selectedLevel.value = 'Design'
  } else if (typeof p.level === 'string' && p.level.startsWith('Level ')) {
    selectedLevel.value = p.level
  } else if (p.level) {
    selectedLevel.value = `Level ${p.level}`
  } else {
    selectedLevel.value = ''
  }
  // 三个奖励数值（用你已有的 toNumber 更稳）
  exp.value   = typeof toNumber === 'function' ? toNumber(p.exp)  : (parseFloat(p.exp)  || 0)
  coin.value  = typeof toNumber === 'function' ? toNumber(p.coin) : (parseFloat(p.coin) || 0)
  hours.value = typeof toNumber === 'function' ? toNumber(p.hour) : (parseFloat(p.hour) || 0)
  num.value = typeof toNumber === 'function' ? toNumber(p.slotsTotal) : (parseFloat(p.slotsTotal) || 0)
  
  // 日期（发布弹窗里的 Calendar 需要 Date 对象）
  taskDate.value = parseDateLoose(p.date)

  console.log(taskDate.value)

  // ② 关闭详情 → 打开发布
  showProjectDialog.value = false
  showDialog.value = true
}

/* ===== 其他跳转 ===== */
const goToQuestStore = () => { router.push('/student/task') }

// 新增：是否处于“编辑已存在任务”模式
const isEditing = ref(false)

// 新增：强制让发布表单重渲染用（清空校验/Editor等内部状态）
const formKey = ref(0)

// 新增：重置“发布任务”表单
function resetPublishForm() {
  selectedLevel.value = ''
  exp.value = 0
  coin.value = 0
  hours.value = 0
  bigTitle.value = ''
  editorContent.value = ''
  taskDate.value = null

  // 让 <Form> / Editor 等子组件重新挂载，清掉内部状态与校验
  formKey.value++
}

// 新增：打开“新建任务”弹窗（先清空）
function openNewTaskDialog() {
  isEditing.value = false
  resetPublishForm()
  showDialog.value = true
}

// 新增：发布弹窗关闭时逻辑（从编辑模式退出后，清空一次）
function onPublishDialogHide() {
  if (isEditing.value) {
    isEditing.value = false
    resetPublishForm()
  }
}

function formatSlotsTitle(used, total, left) {
  return t('teacherHome.slotsSummary', { used: used ?? 0, total: total ?? 0, left: left ?? 0 })
}

function formatExp(value) {
  const exp = Number(value ?? 0)
  return exp > 0 ? `${exp} ${t('teacherHome.metrics.expUnit')}` : t('common.na')
}

function getTaskDownloadName(taskId) {
  return t('teacherHome.downloadFileName', { id: taskId })
}
const levelColors = {
  S: '#C4A010',
  A: '#DD4546',
  B: '#DD7C1B',
  C: '#E6D624',
  D: '#8FD833',
  E: '#2590D2',
  F: '#911EC7'
}


function getLevelStyle(level) {
  const stroke = levelColors[level] || '#333333'      // 描边用原始颜色
  const base = lighten(stroke, 0.3)                   // 字体颜色 = 提亮版
  return {
    color: base,
    fontStyle: 'italic',
    WebkitTextStrokeWidth: '0.5px',
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
type DayEdge = 'start' | 'end'

function normalizeToDate(input: Date | Date[] | string | null | undefined): Date | null {
  if (!input) return null
  const raw = Array.isArray(input) ? input[0] : input
  const d = raw instanceof Date ? new Date(raw) : new Date(raw)
  return isNaN(d.getTime()) ? null : d
}

/**
 * 返回本地时间的日期时间字符串
 * - withOffset=false: "YYYY-MM-DDTHH:mm:ss"（无时区，俗称 naive local）
 * - withOffset=true:  "YYYY-MM-DDTHH:mm:ss+08:00"（带本地时区偏移，RFC3339）
 */
function toLocalDateTime(
  input: Date | Date[] | string | null | undefined,
  edge: DayEdge = 'end',
  opts: { withOffset?: boolean } = {}
): string | null {
  const d = normalizeToDate(input)
  if (!d) return null
  if (edge === 'start') d.setHours(0, 0, 0, 0)
  else d.setHours(23, 59, 59, 0)

  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  const base = `${yyyy}-${mm}-${dd}T${hh}:${mi}:${ss}`

  if (opts.withOffset) {
    const offset = -d.getTimezoneOffset() // 分钟；东八区 = +480
    const sign = offset >= 0 ? '+' : '-'
    const oh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')
    const om = String(Math.abs(offset) % 60).padStart(2, '0')
    return `${base}${sign}${oh}:${om}`
  }
  return base
}

/** 返回 UTC 的 ISO 字符串（结尾带 Z），后端要绝对时间就用它 */
function toLocalEdgeISOString(
  input: Date | Date[] | string | null | undefined,
  edge: DayEdge = 'end'
): string | null {
  const d = normalizeToDate(input)
  if (!d) return null
  if (edge === 'start') d.setHours(0, 0, 0, 0)
  else d.setHours(23, 59, 59, 0)
  return d.toISOString() // e.g. "2025-09-16T15:59:59.000Z" (东八区)
}

// ✅ 复用 2号代码的“下载二维码”逻辑：给 submit 用
async function downloadQrForTask(taskId: number | string, title?: string) {
  if (isDownloading.value) return
  if (!taskId) {
    toast.add({
      severity: 'warn',
      summary: t('Not.Share'),
      detail: t('errors.missingTaskId'),
      life: 2500
    })
    return
  }

  const shareUrl = `https://www.aidiventure.com/forward/${taskId}`

  isDownloading.value = true
  toast.add({
    severity: 'info',
    summary: t('Hint.Dispose'),
    detail: t('Hint.ORcode'),
    life: 1500
  })

  try {
    const res = await api.get('/api/qr/compose/', {
      params: {
        data: shareUrl,
        label: title || t('teacherHome.taskLabel', { id: taskId })
      },
      responseType: 'blob'
    })

    const blob = new Blob([res.data], {
      type: res.headers?.['content-type'] || 'image/png'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getTaskDownloadName(taskId)
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)

    toast.add({
      severity: 'success',
      summary: t('Success.Download'),
      detail: t('Success.Preserve'),
      life: 2000
    })
  } catch (err) {
    console.error('二维码下载失败:', err)
    toast.add({
      severity: 'error',
      summary: t('Not.Share'),
      detail: t('Hint.Retry'),
      life: 3500
    })
    // 不 throw 也行；看你要不要让 submit 失败
  } finally {
    isDownloading.value = false
  }
}

</script>


<style scoped>

.gapping {
  padding-left: 20px;   /* ✅ 整体右移 */
}

.switch-btn.active {
  color: white;
  font-weight: 600;
}

.mode-switch:not(.active) .switch-bg {
  display: none;
}

.mode-switch:has(.switch-btn.active) .switch-bg {
  opacity: 1;               /* 只有选中才显示 */
}

.mode-switch {
  position: relative;
  width: 100px;
  height: 40px;
  background: white;
  border-radius: 10px;
  display: flex;
  overflow: hidden;
  font-weight: 500;
}

.switch-bg {
  position: absolute;
  width: 50%;
  height: 100%;
  background: #4a67af;
  border-radius: 10px;
  left: 0;
  transition: all 0.3s ease;
  opacity: 0;
}

.switch-bg.right {
  left: 50%;
}

.switch-btn {
  flex: 1;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-size: 15px;
  transition: all 0.2s;
}

.switch-btn.active {
  color: white;
}

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
  font-weight: 600;
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
.dialog-header-custom {
  display: flex;
  align-items: center;
  gap: 8px;
}
.help-icon {
  font-size: 20px;
  color: #2A2C55;
  cursor: pointer;
}
.help-icon:hover {
  color: #8949d1;
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
  margin-left: 89%;
  border-radius: 12px;
  padding: 12px 24px;
  border-color: #003366;
  background-color: #003366;
  color: #fff;
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
  content: attr(data-placeholder);
  color: #999;
  position: absolute;
}
.gapBetweenElements{
  margin-right: 6.98px;
}
/* ========== qdlg-* 命名空间样式（项目详情弹窗） ========== */
:deep(.p-dialog) { height: 100%; }

.qdlg-dialog :deep(.p-dialog-header) { padding: 0 !important; }
.qdlg-dialog :deep(.p-dialog-content) {
  padding: 0 !important;
  display: flex; flex-direction: column;
  flex: 1 1 auto; min-height: 0;
  height: auto !important; overflow: hidden;
  position: relative; box-sizing: border-box;
}
:deep(.p-dialog-mask.p-component-overlay) {
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.qdlg-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 12px;
}
.qdlg-header-center { display: flex; flex-direction: column; justify-content: space-between; }
.qdlg-back-btn { font-size: 18px; color: #333; }
.qdlg-title { font-size: 30px; font-weight: bold; color: #1e1e1e; }
.qdlg-date-inline { font-size: 16px; color: #666; display: flex; align-items: center; gap: 6px; margin-top: 5px; }
.qdlg-level-chip {
  position: absolute; top: 28px; right: 130px;
  color: #2a2c52; font-weight: bold; font-size: 32px;
  text-shadow: 0px 1px 3px rgba(0,0,0,0.2);
  z-index: 1000; pointer-events: none;
}

.qdlg-content {
  display: grid;
  grid-template-columns: minmax(0, 3fr) 1px minmax(0, 1fr);
  column-gap: 24px; padding: 24px; height: 100%;
  box-sizing: border-box; position: relative; --divider-inset: 0px;
}
.qdlg-left { grid-column: 1; display: flex; flex-direction: column; padding-left: 24px; overflow: visible; }
.qdlg-right {
  grid-column: 3; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-start;
  padding: 8px 16px; --metric-gap: 16px; z-index: 2;
}
.qdlg-divider {
  grid-column: 2; background-color: #ccc; border-radius: 1px;
  align-self: stretch; margin-block: var(--divider-inset);
}

.qdlg-author { position: relative; display: flex; align-items: center; min-height: 40px; margin-bottom: 16px; margin-left: -14px; gap: 20px; }
.qdlg-author :deep(.p-avatar) { position: static; left: calc(-50px - 8px); top: 0; }
.qdlg-author-name { font-weight: 500; font-size: 20px; line-height: 1.2; margin: 0; }
.qdlg-description {
  color: #666; font-size: 16px; line-height: 1.6;
  white-space: normal; overflow-wrap: anywhere;
  margin: 0 0 0 60px; margin-top: -10px;
}

/* 右下角 Assigned */
.qdlg-assigned {
  position: absolute; right: 24px; bottom: 24px;
  display: flex; align-items: center; gap: 12px; z-index: 1100;
}
.qdlg-assigned-label { font-size: 18px; color: #b8b8b8; font-weight: 600; }
.qdlg-assigned-name { font-size: 22px; font-weight: 800; color: #000; letter-spacing: .5px; }

/* 右栏指标 */
.qdlg-level-spacer { font-weight: bold; font-size: 32px; line-height: 1.2; visibility: hidden; }
.qdlg-metrics { display: flex; flex-direction: column; gap: var(--metric-gap); width: clamp(220px, 80%, 320px); margin: 0 auto; }
.qdlg-metric-item { display: flex; flex-direction: column; gap: 4px; }
.qdlg-metric-row { display: flex; align-items: center; width: 100%; position: relative; }
.qdlg-metric-icon {
  width: clamp(28px, 4vw, 45px); height: clamp(28px, 4vw, 45px);
  margin-right: max(-12px, -2vw); flex-shrink: 0; z-index: 3; position: relative;
}
.qdlg-pixelated {
  image-rendering: pixelated; image-rendering: crisp-edges; image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}
.qdlg-metric-bar { flex: 1; width: 100%; min-width: 180px; }
.qdlg-metric-bar :deep(.p-progressbar) {
  display: block; width: 100%; height: clamp(18px, 2.5vw, 28px);
  border-radius: 999px; background: #eef2fb; overflow: hidden; position: relative; z-index: 1;
}
.qdlg-metric-bar :deep(.p-progressbar-value) { background-color: var(--bar-color, #3b82f6); }
.qdlg-metric-bar :deep(.p-progressbar .p-progressbar-content) { display: flex; align-items: center; justify-content: center; }
.qdlg-metric-text { font-size: 12px; font-weight: 600; color: #fff; }

/* 标题行：标题 + 编辑按钮并排，自动换行更友好 */
.qdlg-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  flex-direction: row;       /* ← 别写成 row-reverse */
}
/* 编辑按钮贴近标题的样式（不再用绝对定位） */
.qdlg-edit-btn :deep(.p-button-icon) {
  font-size: 18px;
}

/* 定制 hover 颜色，避免默认绿色 */
.qdlg-edit-btn.p-button,
.qdlg-edit-btn.p-button:enabled {
  color: #2A2C55;
  background: transparent;
  border-color: transparent;
}
.qdlg-edit-btn.p-button:hover,
.qdlg-edit-btn.p-button:enabled:hover {
  color: #2A2C55 !important;
  background: rgba(42,44,85,.08) !important;
  border-color: transparent !important;
}
.qdlg-edit-btn.p-button:focus,
.qdlg-edit-btn.p-button:enabled:focus {
  box-shadow: 0 0 0 2px rgba(42,44,85,.20) !important;
}

.rich-text img {
  max-width: 100%;
  height: auto;
  display: block;     /* 避免行内空隙 */
  margin: 8px 0;      /* 给点间距 */
  border-radius: 6px; /* 看起来更美观，可选 */
}
.qdlg-footer-left {
  position: absolute;
  bottom: 20px;
  left: 20px;
  display: flex;
  gap: 12px;
}
/* 默认状态 */
:deep(.approve-btn.p-button) {
  background-color: #2A2C55 !important;
  border-color: #FFFFFF !important;
  color: #fff !important;
  border-radius: 12px;
  padding: 12px 24px;
}
/* 分享是 text 样式，需要改文字/图标颜色和 hover 背景 */
:deep(.share-btn.p-button.p-button-text) {
  color: #fff;
  background-color: #2A2C55 !important;
  border-color: #2A2C55;
  padding: 24px;
}

:deep(.approve-btn.p-button),
:deep(.share-btn.p-button) {
  transition: transform 0.2s ease; /* 平滑过渡 */
}

:deep(.approve-btn.p-button:hover),
:deep(.share-btn.p-button:hover) {
  transform: translateY(-2px);; /* 垂直方向拉高 8% */
  /* 如果你想整体变大，用 scale(1.05) */
}
:deep(.qdlg-back-btn.p-button) {
  color: #495057;              /* 默认文字/图标颜色 */
  transition: color 0.2s ease, background-color 0.2s ease;
}

:deep(.qdlg-back-btn.p-button:hover) {
  color: #495057;                 /* 鼠标放上去图标变白 */
  background-color:rgba(42,44,85,.08);   /* 背景变成红色（可改成你喜欢的颜色） */
}

.add-card {
  cursor: pointer;
  display: flex;
  align-items: center;     /* 垂直居中 */
  justify-content: center; /* 水平居中 */
  min-height: 200px;            /* 保持和普通卡片差不多的高度 */
  min-width: 350px;   
  border: 2px dashed rgba(0, 123, 255, 0.25);
}
.grid-container:has(.add-card) {
  display: flex;              /* 改成 flex 布局 */
  justify-content: center;    /* 水平居中 */
  align-items: center;        /* 垂直居中（可选） */
  min-height: 100%;           /* 保证占满容器高度 */
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
</style>
