<template>
  <div class="help-page">
    <!-- 顶部标题栏 -->
    <header class="header glass">
      <h1 class="title">帮助中心</h1>
      <p class="subtitle">请选择你的身份，查看对应的帮助文档（在新标签中打开）</p>
    </header>

    <div class="content">
      <section class="single-pane">
        <Card class="card">
          <template #title>
            <div class="card-title">选择身份</div>
          </template>

          <template #content>
            <div class="role-select">
              <SelectButton
                v-model="role"
                :options="roleOptions"
                optionLabel="label"
                optionValue="value"
                :allowEmpty="false"
              />
            </div>

            <div class="docs-header">
              <span class="docs-title">可用文档</span>
              <Tag :value="docs.length + ' 项'" severity="info" />
            </div>

            <Listbox
              v-model="selectedDoc"
              :options="docs"
              optionLabel="label"
              listStyle="max-height: 300px"
              :filter="true"
              filterPlaceholder="搜索文档..."
              :emptyMessage="'暂无文档'"
              @dblclick="handleDblClick"
            >
              <template #option="slotProps">
                <div class="doc-item">
                  <i class="pi pi-file-pdf"></i>
                  <div class="doc-meta">
                    <div class="doc-label">{{ slotProps.option.label }}</div>
                    <small class="doc-path">{{ slotProps.option.path }}</small>
                  </div>
                </div>
              </template>
            </Listbox>

            <div class="actions">
              <Button
                :disabled="!selectedDoc"
                label="在新标签打开"
                icon="pi pi-external-link"
                @click="openInNewTab"
              />
            </div>
          </template>
        </Card>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import SelectButton from 'primevue/selectbutton'
import Listbox from 'primevue/listbox'

type Doc = { label: string; path: string }

const role = ref<'student' | 'teacher'>('student')
const roleOptions = [
  { label: '学生', value: 'student' },
  { label: '老师', value: 'teacher' },
]

// public 下的绝对路径
const studentDocs = ref<Doc[]>([
  { label: '学生账号指南', path: '/pdf/accounts.pdf' },
  { label: '爱迪邮箱教程', path: '/pdf/email.pdf' },
])
const teacherDocs = ref<Doc[]>([
  { label: '老师账号指南', path: '/pdf/teacheraccount.pdf' },
])

const selectedDoc = ref<Doc | null>(null)

const docs = computed<Doc[]>(() => (role.value === 'student' ? studentDocs.value : teacherDocs.value))

watch(
  () => role.value,
  () => {
    selectedDoc.value = docs.value[0] ?? null
  },
  { immediate: true }
)

function openInNewTab() {
  if (!selectedDoc.value) return
  window.open(selectedDoc.value.path, '_blank', 'noopener')
}

function handleDblClick(e: MouseEvent) {
  // Listbox 的 dblclick 事件会冒泡，这里直接复用当前选中项
  openInNewTab()
}
</script>

<style scoped>
/* =========================
   基础色与文本
   ========================= */
:root {
  --bg: #F4F7FE;      /* 页面背景 */
  --ink: #2B2C57;     /* 文字/主色 */
  --card: #FFFFFF;    /* 卡片 */
  --muted: rgba(43, 44, 87, 0.6);
}

/* =========================
   页面布局（单栏）
   ========================= */
.help-page {
  min-height: 100vh;
  background: var(--bg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: var(--ink);
}

.header {
  background: var(--card);
  border: 1px solid rgba(43, 44, 87, 0.08);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
  align-self: center;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--ink);
}
.subtitle {
  margin: 4px 0 0;
  color: var(--muted);
  font-size: 13px;
}

/* 单栏内容容器，居中限定宽度 */
.content {
  display: grid;
  grid-template-columns: 1fr;
  justify-items: center;
  flex: 1;
}
.single-pane {
  width: 100%;
  max-width: 720px;
}

/* =========================
   卡片与列表
   ========================= */
.card {
  background: var(--card);
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.06);
}

.card-title {
  font-weight: 600;
  color: var(--ink);
}

.role-select {
  margin-bottom: 16px;
}

.docs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 6px 0 10px;
}
.docs-title {
  font-weight: 600;
  color: var(--ink);
}

.doc-item {
  display: flex;
  align-items: center;
  gap: 10px;
}
.doc-item .pi {
  font-size: 1rem;
  color: var(--ink);
}
.doc-meta {
  display: flex;
  flex-direction: column;
}
.doc-label {
  font-weight: 600;
  color: var(--ink);
}
.doc-path {
  color: var(--muted);
}

.actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

/* =========================
   玻璃效果（可选）
   ========================= */
.glass {
  background: rgba(255, 255, 255, 0.85);
  -webkit-backdrop-filter: blur(12px) saturate(140%);
  backdrop-filter: blur(12px) saturate(140%);
  border: 1px solid rgba(43, 44, 87, 0.08);
}

/* =========================
   PrimeVue 主题强制覆盖（去绿换主色）
   ========================= */
:deep(.p-button) {
  background: #2B2C57 !important;
  border-color: #2B2C57 !important;
  color: #FFF !important;
}
:deep(.p-button:enabled:hover),
:deep(.p-button:enabled:focus) {
  background: #242555 !important;
  border-color: #242555 !important;
  box-shadow: 0 0 0 0.2rem rgba(43,44,87,0.2) !important;
}

:deep(.p-button.p-button-text) {
  background: transparent !important;
  color: #2B2C57 !important;
  border-color: transparent !important;
}
:deep(.p-button.p-button-text:enabled:hover),
:deep(.p-button.p-button-text:enabled:focus) {
  background: rgba(43,44,87,0.08) !important;
  color: #2B2C57 !important;
  box-shadow: none !important;
}

/* SelectButton 高亮/选中态 */
:deep(.p-selectbutton .p-button.p-highlight) {
  background: #2B2C57 !important;
  border-color: #2B2C57 !important;
  color: #FFF !important;
}
:deep(.p-selectbutton .p-button.p-highlight:enabled:hover),
:deep(.p-selectbutton .p-button.p-highlight:enabled:focus) {
  background: #242555 !important;
  border-color: #242555 !important;
  color: #FFF !important;
}
/* SelectButton 未选中 hover 也统一主色 */
:deep(.p-selectbutton .p-button:enabled:hover),
:deep(.p-selectbutton .p-button:enabled:focus) {
  background: #242555 !important;
  border-color: #242555 !important;
  color: #FFF !important;
}

/* Tag 统一主色 */
:deep(.p-tag),
:deep(.p-tag.p-tag-info),
:deep(.p-tag.p-tag-success),
:deep(.p-tag.p-tag-warning),
:deep(.p-tag.p-tag-danger) {
  background: #2B2C57 !important;
  border-color: #2B2C57 !important;
  color: #FFF !important;
}

/* Listbox 选中/悬停色 */
:deep(.p-listbox .p-listbox-item.p-highlight) {
  background: rgba(43,44,87,0.1) !important;
  color: #2B2C57 !important;
}
:deep(.p-listbox .p-listbox-item:hover) {
  background: rgba(43,44,87,0.06) !important;
}

/* 输入框聚焦描边（过滤框等） */
:deep(.p-inputtext:enabled:focus),
:deep(.p-inputtext:enabled:hover) {
  box-shadow: 0 0 0 0.2rem rgba(43,44,87,0.2) !important;
  border-color: #2B2C57 !important;
}
</style>
