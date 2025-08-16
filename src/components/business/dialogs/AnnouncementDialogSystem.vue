<template>
  <Dialog
    v-model:visible="innerVisible"
    modal
    :style="{ width: widthPx }"
    dismissableMask
    @hide="handleHide"
  >
    <!-- 自定义 header -->
    <template #header>
      <div class="custom-dialog-header">
        <span class="custom-title">{{ header }}</span>
      </div>
    </template>

    <template v-if="announcement">
      <div class="sysdlg__date">{{ fmt(announcement.dateISO) }}</div>
      <div class="sysdlg__content">{{ announcement.content }}</div>
    </template>

    <template v-else>
      <div class="sysdlg__content text-muted">
        {{ t('notifications.empty') || '暂无可显示的内容' }}
      </div>
    </template>

    <template #footer>
      <Button
        :label="t('common.close') || '关闭'"
        @click="innerVisible = false"
        class="custom-close-btn"
      />
    </template>
  </Dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const props = defineProps({
  visible: { type: Boolean, default: undefined },
  modelValue: { type: Boolean, default: undefined },
  announcement: { type: Object, default: null },
  width: { type: [Number, String], default: 520 },
})

const emit = defineEmits(['update:visible', 'update:modelValue', 'close'])
const { t } = useI18n()

const initial = props.visible ?? props.modelValue ?? false
const innerVisible = ref(!!initial)

watch(() => props.visible, v => {
  if (v === undefined) return
  innerVisible.value = !!v
})
watch(() => props.modelValue, v => {
  if (v === undefined) return
  innerVisible.value = !!v
})

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
  const baseTitle = t('notifications.type.system') || t('notifications.unknown')
  const name = props.announcement?.name || sysName
  return `${baseTitle} - ${name}`
})

const widthPx = computed(() => {
  return typeof props.width === 'number' ? `${props.width}px` : props.width
})

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
</script>

<style scoped>
/* 自定义 header 样式 */
.custom-dialog-header {
  display: flex;
  align-items: center;
  justify-content: flex-start; /* 改成 center 就是居中 */
  padding: 0.5rem 1rem;
}

.custom-title {
  margin-left: 0px; /* 向右移动 */
  font-size: 1.1rem;
  font-weight: 600;
  color: #2B2C57;
}

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
  margin-left: 17px
}
.text-muted {
  color: #6b7280;
}

/* 以 #2B2C57 作为基础色 */
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
</style>
