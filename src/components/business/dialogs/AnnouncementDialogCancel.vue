<!-- /components/dialogs/AnnouncementDialogCancel.vue -->
<template>
  <Dialog
    v-model:visible="innerVisible"
    modal
    :style="{ width: widthPx }"
    dismissableMask
    @hide="handleHide"
  >
    <!-- Header -->
    <template #header>
      <div class="custom-dialog-header">
        <span class="custom-title">{{ header }}</span>
      </div>
    </template>

    <!-- 内容 -->
    <template v-if="announcement">
      <div class="sysdlg__date">{{ fmt(announcement.dateISO) }}</div>

      <div class="cancel__body">
        <div class="sysdlg__content">
          {{ announcement.content }}
        </div>

        <!-- 可选信息区：比如取消原因、申请人等 -->
        <div v-if="announcement?.reason" class="cancel__meta">
          <span class="cancel__meta-key">{{ t('common.reason') || 'Reason' }}：</span>
          <span class="cancel__meta-val">{{ announcement.reason }}</span>
        </div>
        <div v-if="announcement?.name" class="cancel__meta">
          <span class="cancel__meta-key">{{ t('common.applicant') || 'Applicant' }}：</span>
          <span class="cancel__meta-val">{{ announcement.name }}</span>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="sysdlg__content text-muted">
        {{ t('notifications.empty') || 'Nothing to display' }}
      </div>
    </template>

    <!-- Footer -->
    <template #footer>
      <Button
        :label="t('teacherCancel.reject') || 'Reject cancellation'"
        class="custom-outline-btn"
        :loading="loadingReject"
        :disabled="loadingApprove || loadingReject"
        @click="onReject"
      />
      <Button
        :label="t('teacherCancel.approve') || 'Approve cancellation'"
        class="custom-close-btn"
        :loading="loadingApprove"
        :disabled="loadingApprove || loadingReject"
        @click="onApprove"
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
  'approve',   // 同意
  'reject',    // 拒绝
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
  const baseTitle = t('notifications.type.cancel_request') || t('notifications.type.unknown')
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
const loadingApprove = ref(false)
const loadingReject = ref(false)

/** 取任务 ID：与现有组件保持一致（你当前使用 a.taskid） */
function getTaskId(a) {
  return a?.taskid ?? null
}

/** 成功后标记已读（仅当前通知） */
async function markReadIfNeeded() {
  const a = props.announcement
  if (a && !a.read) {
    try {
      await store.markRead(a.id)
    } catch (e) {
      console.error('标记已读失败', e)
      toast.add({
        severity: 'warn',
        summary: t('common.warning') || 'Warning',
        detail: t('notifications.readFail') || 'Action succeeded, but failed to mark as read.',
        life: 2500
      })
    }
  }
}

async function onApprove() {
  const taskId = getTaskId(props.announcement)
  if (!taskId) {
    toast.add({
      severity: 'error',
      summary: t('common.failed') || 'Failed',
      detail: t('errors.missingTaskId') || 'Missing task ID; cannot proceed.',
      life: 3000
    })
    return
  }

  // 从 announcement 中取 participant_id
  const participantId = props.announcement?.userid
  if (!participantId) {
    toast.add({
      severity: 'error',
      summary: t('common.failed') || 'Failed',
      detail: 'Missing participant_id; cannot proceed.',
      life: 3000
    })
    return
  }

  loadingApprove.value = true
  try {
    await api.post(`/api/tasks/${taskId}/remove-student/`, {
      participant_id: participantId
    })
    await markReadIfNeeded()
    toast.add({
      severity: 'success',
      summary: t('common.success') || 'Success',
      detail: t('teacherCancel.toastApprove') || 'Cancellation approved.',
      life: 2000
    })
    emit('approve', props.announcement)
    innerVisible.value = false
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: t('common.failed') || 'Failed',
      detail: e?.response?.data?.detail || e?.message || (t('errors.unknown') || 'Operation failed, please try again later.'),
      life: 3500
    })
  } finally {
    loadingApprove.value = false
  }
}


async function onReject() {
  const taskId = getTaskId(props.announcement)
  if (!taskId) {
    toast.add({
      severity: 'error',
      summary: t('common.failed') || 'Failed',
      detail: t('errors.missingTaskId') || 'Missing task ID; cannot proceed.',
      life: 3000
    })
    return
  }
  loadingReject.value = true
  try {
    await api.post(`/api/tasks/${taskId}/reject-cancel/`)
    await markReadIfNeeded()
    toast.add({
      severity: 'success',
      summary: t('common.success') || 'Success',
      detail: t('teacherCancel.toastReject') || 'Cancellation rejected.',
      life: 2000
    })
    emit('reject', props.announcement)
    innerVisible.value = false
  } catch (e) {
    console.error(e)
    toast.add({
      severity: 'error',
      summary: t('common.failed') || 'Failed',
      detail: e?.response?.data?.detail || e?.message || (t('errors.unknown') || 'Operation failed, please try again later.'),
      life: 3500
    })
  } finally {
    loadingReject.value = false
  }
}
</script>

<style scoped>
/* 头部 */
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

/* 信息块 */
.cancel__body { margin-left: 0; }
.cancel__meta {
  margin: 8px 17px 0 17px;
  font-size: 13px;
  color: #4b5563;
}
.cancel__meta-key { margin-right: 4px; }

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

/* 描边按钮（拒绝） */
.custom-outline-btn {
  background-color: #fff !important;
  color: #2B2C57 !important;
  border: 1px solid #2B2C57 !important;
  margin-right: 8px;
}
.custom-outline-btn:hover {
  background-color: #F3F4F6 !important;
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
