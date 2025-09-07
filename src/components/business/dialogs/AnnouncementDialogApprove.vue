<!-- /components/dialogs/AnnouncementDialogInvite.vue -->
<template>
  <Dialog
    v-model:visible="innerVisible"
    modal
    :style="{ width: widthPx }"
    dismissableMask
    @hide="handleHide"
  >
    <!-- 自定义 header（与 system 弹窗一致的风格） -->
    <template #header>
      <div class="custom-dialog-header">
        <span class="custom-title">{{ header }}</span>
      </div>
    </template>

    <template v-if="announcement">
      <div class="sysdlg__date">{{ fmt(announcement.dateISO) }}</div>

      <div class="invite__body">
        <div class="sysdlg__content">
          {{ announcement.content }}
        </div>

        <!-- 可选信息区 -->
        <div v-if="announcement?.target" class="invite__meta">
          <span class="invite__meta-key">{{ t('common.target') || '目标' }}：</span>
          <span class="invite__meta-val">{{ announcement.target }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="sysdlg__content text-muted">
        {{ t('notifications.empty') || '暂无可显示的内容' }}
      </div>
    </template>

    <template #footer>
      <!-- 拒绝：浅色描边按钮 -->
      <Button
        :label="t('common.notComplete') || '拒绝'"
        class="custom-outline-btn"
        :loading="loadingDecline"
        :disabled="loadingAccept || loadingDecline"
        @click="onDecline"
      />
      <!-- 接受：主色按钮 -->
      <Button
        :label="t('common.markComplete') || '接受'"
        class="custom-close-btn"
        :loading="loadingAccept"
        :disabled="loadingAccept || loadingDecline"
        @click="onAccept"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import { useToast } from 'primevue/usetoast'
import api from '../../../api.js'
import { useAnnouncementStore } from '../../../stores/announcement'

const props = defineProps({
  visible: { type: Boolean, default: undefined },
  modelValue: { type: Boolean, default: undefined },
  announcement: { type: Object, default: null },
  width: { type: [Number, String], default: 520 },
})

const emit = defineEmits([
  'update:visible',
  'update:modelValue',
  'close',
  'accept',   // 点击“接受”时触发
  'decline',  // 点击“拒绝”时触发
])

const { t } = useI18n()
const toast = useToast()
const store = useAnnouncementStore()

// 可见性双向绑定
const innerVisible = ref(!!(props.visible ?? props.modelValue ?? false))
watch(() => props.visible, v => { if (v !== undefined) innerVisible.value = !!v })
watch(() => props.modelValue, v => { if (v !== undefined) innerVisible.value = !!v })
watch(innerVisible, v => {
  emit('update:visible', v)
  emit('update:modelValue', v)
})

function handleHide () {
  innerVisible.value = false
  emit('close')
}

const header = computed(() => {
  const sysName = t('notifications.systemName')
  const baseTitle = t('notifications.type.completion_request') || t('notifications.type.unknown')
  const name = props.announcement?.name || sysName
  return `${baseTitle} - ${name}`
})

const widthPx = computed(() =>
  typeof props.width === 'number' ? `${props.width}px` : props.width
)

function fmt(iso) {
  if (!iso) return t('common.na') || 'N/A'
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// —— 动作与接口 —— //
const loadingAccept = ref(false)
const loadingDecline = ref(false)

/**
 * 根据实际数据结构取任务 ID：
 * 你可以按需调整候选键位
 */
function getTaskId(a) {
  return a?.taskid ?? null
}

async function markReadIfNeeded() {
  const a = props.announcement
  if (a && !a.read) {
    try {
      await store.markRead(a.id)
    } catch (e) {
      // 标记已读失败不阻塞主流程，仅提示
      console.error('标记已读失败', e)
      toast.add({
        severity: 'warn',
        summary: t('common.warning') || '提示',
        detail: t('notifications.readFail') || '消息已处理，但标记已读失败',
        life: 2500
      })
    }
  }
}

async function onAccept() {
  const taskId = getTaskId(props.announcement)
  if (!taskId) {
    toast.add({
      severity: 'error',
      summary: t('common.failed') || '失败',
      detail: t('errors.missingTaskId') || '缺少任务 ID，无法执行接受操作',
      life: 3000
    })
    return
  }
  loadingAccept.value = true
  try {
    await api.post(`/api/tasks/${taskId}/complete/`)
    await markReadIfNeeded()
    toast.add({
      severity: 'success',
      summary: t('common.success') || '成功',
      detail: t('notifications.accepted') || '已接受完成请求',
      life: 2000
    })
    emit('accept', props.announcement)
    innerVisible.value = false
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: t('common.failed') || '失败',
      detail: e?.response?.data?.detail || e?.message || (t('errors.unknown') || '操作失败，请稍后重试'),
      life: 3500
    })
  } finally {
    loadingAccept.value = false
  }
}

async function onDecline() {
  console.log(props.announcement);
  
  const taskId = getTaskId(props.announcement)
  if (!taskId) {
    toast.add({
      severity: 'error',
      summary: t('common.failed') || '失败',
      detail: t('errors.missingTaskId') || '缺少任务 ID，无法执行拒绝操作',
      life: 3000
    })
    return
  }

  // 从 announcement 中取 requester_id
  const requesterId = props.announcement?.userid
  if (!requesterId) {
    toast.add({
      severity: 'error',
      summary: t('common.failed') || '失败',
      detail: '缺少 requester_id，无法执行拒绝操作',
      life: 3000
    })
    return
  }

  loadingDecline.value = true
  try {
    await api.post(`/api/tasks/${taskId}/reject-complete/`, {
      requester_id: requesterId
    })
    await markReadIfNeeded()
    toast.add({
      severity: 'success',
      summary: t('common.success') || '成功',
      detail: t('notifications.rejected') || '已拒绝完成请求',
      life: 2000
    })
    emit('decline', props.announcement)
    innerVisible.value = false
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: t('common.failed') || '失败',
      detail: e?.response?.data?.detail || e?.message || (t('errors.unknown') || '操作失败，请稍后重试'),
      life: 3500
    })
  } finally {
    loadingDecline.value = false
  }
}

</script>

<style scoped>
/* Header 与 System 弹窗一致 */
.custom-dialog-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5rem 1rem;
}
.custom-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2B2C57;
}

/* 日期与正文 */
.sysdlg__date {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 3px;
  margin-left: 18px;
}
.sysdlg__content {
  white-space: pre-wrap;
  line-height: 1.7;
  color: #1f2937;
  margin-left: 17px;
}
.text-muted { color: #6b7280; }

/* 邀请信息块 */
.invite__body { margin-left: 0; }
.invite__line {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin: 0 17px 6px 17px;
}
.invite__label {
  font-size: 12px;
  color: #6b7280;
}
.invite__name {
  font-size: 13px;
  color: #374151;
}
.invite__meta {
  margin: 8px 17px 0 17px;
  font-size: 13px;
  color: #4b5563;
}
.invite__meta-key { margin-right: 4px; }

/* 主色按钮（#2B2C57） */
.custom-close-btn {
  background-color: #2B2C57 !important;
  border: 1px solid #2B2C57 !important;
  color: #fff !important;
}
.custom-close-btn:hover {
  background-color: #242448 !important;
  border-color: #242448 !important;
  box-shadow: none !important;
}
.custom-close-btn:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(43,44,87,0.4) !important;
  border-color: #2B2C57 !important;
}

/* 描边按钮（拒绝）——与主色协调 */
.custom-outline-btn {
  background-color: #fff !important;
  color: #2B2C57 !important;
  border: 1px solid #2B2C57 !important;
  margin-right: 8px;
}
.custom-outline-btn:hover {
  background-color: #F3F4F6 !important; /* 淡灰 hover */
  border-color: #242448 !important;
  color: #242448 !important;
  box-shadow: none !important;
}
.custom-outline-btn:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(43,44,87,0.2) !important;
  border-color: #2B2C57 !important;
}
</style>
