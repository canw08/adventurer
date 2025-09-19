<template>
  <Dialog
    v-model:visible="visible"
    :modal="true"
    :draggable="false"
    :dismissableMask="false"
    :closable="true"
    header="没错😎 我们又更新🥳"
    class="update-notice-dialog"
    :style="{ width: width }"
    @hide="onHide"
  >
    <div class="content">
      <h3 class="title">{{ titleText }}</h3>
      <p class="desc">
        我们刚刚发布了 <b>v{{ resolvedVersion }}</b> 版本，带来了一些改进和修复。
      </p>
      <p class="desc small">点击下方按钮查看更新日志。</p>

      <div class="actions">
        <!-- 文本按钮 -->
        <Button
          label="让我看看!"
          class="p-button-text brand-text"
          icon="pi pi-external-link"
          :style="{ '--brand-color': buttonColor }"
          severity="secondary"
          @click="goChangelog"
        />
        <Button
          label="朕知道了"
          class="brand-solid"
          :style="{ '--brand-color': buttonColor }"
          severity="secondary"
          @click="dismiss"
        />


      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, getCurrentInstance } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

const globalVersion =
  (getCurrentInstance()?.appContext.app as any)?.config?.globalProperties?.$version
  ?? import.meta.env.VITE_APP_VERSION
  ?? 'dev'

const resolvedVersion = computed(() => props.version ?? globalVersion)

/**
 * Props
 */
const props = withDefaults(defineProps<{
  /** 当前站点版本号（例如："1.4.2"）。更换此值将会重新弹窗一次。 */
  version: string
  /** 更新日志地址。 */
  changelogUrl?: string
  /** localStorage 键名前缀，可在多站点或多环境中区分。 */
  storagePrefix?: string
  /** Dialog 宽度，如 "28rem"/"520px"/"40vw"。 */
  width?: string
  /** 自定义标题文案。 */
  title?: string
  /** 是否在组件挂载时自动检查并展示弹窗。*/
  autoCheck?: boolean
  /** 允许弹窗出现的路径列表 */
  allowedPaths?: string[]
  /** 按钮品牌色 */
  buttonColor?: string
}>(), {
  changelogUrl: '/changelog',
  storagePrefix: 'update_notice_seen__',
  width: '520px',
  title: '有新版本可用',
  autoCheck: true,
  allowedPaths: ['/student/home/', '/teacher/home/'],
  buttonColor: '#2B2C57'
})

/**
 * Emits
 */
const emit = defineEmits<{
  (e: 'opened'): void
  (e: 'closed'): void
  (e: 'view-changelog'): void
}>()

const visible = ref(false)
const storageKey = computed(() => `${props.storagePrefix}${resolvedVersion.value}`)
const titleText = computed(() => props.title || '有新版本可用')

function getPathname(): string {
  try {
    const maybeRouter = (getCurrentInstance()?.appContext.app as any)?.config?.globalProperties?.$router
    if (maybeRouter && maybeRouter.currentRoute?.value?.path) {
      return maybeRouter.currentRoute.value.path as string
    }
  } catch {}
  return window.location?.pathname || '/'
}

function isAllowedPath(): boolean {
  return true;
  const path = getPathname()
  console.log(path);
  
  return props.allowedPaths?.includes(path) ?? false
}

function hasSeen(): boolean {
  try {
    return localStorage.getItem(storageKey.value) === '1'
  } catch {
    return false
  }
}

function markSeen() {
  try {
    localStorage.setItem(storageKey.value, '1')
  } catch {
    // 忽略隐私模式/满额错误
  }
}

function openIfNeeded() {
  if (isAllowedPath() && !hasSeen()) {
    visible.value = true
    emit('opened')
  }
}

function dismiss() {
  markSeen()
  visible.value = false
}

function goChangelog() {
  markSeen()
  emit('view-changelog')
  // 优先使用前端路由（若存在），否则回退到 location 跳转
  try {
    const maybeRouter = (getCurrentInstance()?.appContext.app as any)?.config?.globalProperties?.$router
    if (maybeRouter && typeof maybeRouter.push === 'function') {
      maybeRouter.push(props.changelogUrl)
    } else {
      window.location.assign(props.changelogUrl)
    }
  } catch {
    window.location.assign(props.changelogUrl)
  }
  visible.value = false
}

function onHide() {
  emit('closed')
}

onMounted(() => {
  if (props.autoCheck) {
    openIfNeeded()
  }
})

// 如果版本或路径变化，自动重新判断
watch(() => props.version, () => {
  openIfNeeded()
})
</script>

<style scoped>
.update-notice-dialog :deep(.p-dialog-header) {
  font-weight: 600;
}
.content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.title {
  margin: 0.25rem 0 0.25rem;
  font-size: 1.1rem;
}
.desc {
  margin: 0;
  color: var(--text-color, #4b5563);
}
.desc.small {
  font-size: 0.9rem;
  opacity: 0.9;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}
/* 按钮品牌色： #2B2C57（可由 props.buttonColor 覆盖） */
.brand-solid :deep(.p-button) {
  background-color: var(--brand-color);
  border-color: var(--brand-color);
}
.brand-solid :deep(.p-button:hover),
.brand-solid :deep(.p-button:focus) {
  filter: brightness(0.92);
}
.brand-text :deep(.p-button) {
  color: var(--brand-color);
}
.brand-text :deep(.p-button:hover),
.brand-text :deep(.p-button:focus) {
  background-color: rgba(43, 44, 87, 0.08);
}
/* 实心 */
:deep(.p-button.brand-solid) {
  background-color: var(--brand-color) !important;
  border-color: var(--brand-color) !important;
  color: #fff !important;
}
:deep(.p-button.brand-solid:hover),
:deep(.p-button.brand-solid:focus) {
  filter: brightness(0.92);
}

/* 文本 */
:deep(.p-button.p-button-text.brand-text) {
  color: var(--brand-color) !important;
  background-color: transparent !important;
  border-color: transparent !important;
}
:deep(.p-button.p-button-text.brand-text:hover),
:deep(.p-button.p-button-text.brand-text:focus) {
  background-color: rgba(43, 44, 87, 0.08) !important;
}

</style>
