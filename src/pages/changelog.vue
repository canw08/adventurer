<!-- src/pages/ChangelogPage.vue -->
<template>
  <div class="changelog-page">
    <div class="p-4 max-w-5xl mx-auto space-y-4">
      <Timeline :value="logs" align="alternate" class="w-full">
        <template #marker="{ index }">
          <span
            class="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 text-primary-700"
            :title="logs[index].version"
          >
            {{ logs[index].version.replace(/^v/, '') }}
          </span>
        </template>

        <template #opposite="{ item }">
          <span class="text-color-secondary whitespace-nowrap">{{ item.date }}</span>
        </template>

        <template #content="{ item }">
          <Card class="w-full">
            <template #title>
              <div class="flex items-center gap-2">
                <span class="font-semibold">{{ item.version }}</span>
                <Tag v-if="item.channel" :value="item.channel" :severity="channelSeverity(item.channel)" />
                <span class="text-color-secondary">· {{ item.date }}</span>
              </div>
            </template>
            <template #content>
              <Accordion :multiple="true">
                <AccordionTab
                  v-for="(group, gi) in groupItems(item.items)"
                  :key="gi"
                  :header="group.title + '（' + group.items.length + '）'"
                >
                  <ul class="changelog-list">
                    <li v-for="(line, li) in group.items" :key="li">{{ line }}</li>
                  </ul>
                </AccordionTab>
              </Accordion>
            </template>
          </Card>
        </template>
      </Timeline>

      <div v-if="!logs.length && !loading" class="text-center text-color-secondary py-8">
        None
      </div>
      <div v-if="loading" class="text-center text-color-secondary py-8">
        loading
      </div>
    </div>

    <!-- 左下角返回按钮 -->
    <Button
      v-if="canGoBack"
      label="返回"
      class="back-btn"
      @click="goBack"
    />
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: false
</route>

<script setup>
import { ref, onMounted } from 'vue'
import Timeline from 'primevue/timeline'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import { useRouter } from 'vue-router'

import { useI18n } from 'vue-i18n'
const { t } = useI18n()

const router = useRouter()
const loading = ref(false)
const canGoBack = ref(false)

onMounted(() => {
  // window.history.length 通常 > 1 才有上一页
  canGoBack.value = window.history.length > 1
  console.log(window.history.length);
  
})
// 解析后的结构：[{ version, date, channel?, items: [{type,text}, ...] }]
const logs = ref([])


function goBack() {
  router.back()   // 返回上一页
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetch('/CHANGELOG.md?_=' + Date.now())
    const md = await res.text()
    logs.value = parseChangelog(md)
  } finally {
    loading.value = false
  }
})

// --- 将 Markdown 转为结构化数据 ---
// 支持常见 Conventional Changelog：
// ## v1.2.0 (2025-09-18) [Stable]
// ### Features
// - 新增公告系统
// ### Fixes
// - 修复...
function mapTitleToType(title) {
  const t = title.trim().toLowerCase()
  if (/^breaking/.test(t)) return 'breaking'
  if (/^feature(s)?/.test(t)) return 'feature'
  if (/^fix(e|es)?/.test(t)) return 'fix'
  if (/^(perf(ormance)?|performance)s?/.test(t)) return 'perf'
  if (/^doc(s|umentation)?/.test(t)) return 'docs'
  if (/^refactor(s)?/.test(t)) return 'refactor'
  if (/^chore(s)?/.test(t)) return 'chore'
  if (/^test(s)?/.test(t)) return 'test'
  return 'docs'
}
function parseChangelog(md) {
  // 统一换行，去掉可能的 BOM
  const src = md.replace(/^\uFEFF/, '').replace(/\r/g, '')

  // 用多行模式分版本：能匹配第一段（不要求前面一定有换行）
  const sections = src.split(/^##\s+/m).slice(1)

  return sections.map(sec => {
    const lines = sec.split('\n')
    const headerLine = lines[0] || ''
    const body = lines.slice(1).join('\n')

    // 解析头：vX.Y.Z (YYYY-MM-DD) [Channel]
    const m = headerLine.match(/v?([\w.\-]+)\s*\((\d{4}-\d{2}-\d{2})\)(?:\s*\[(.+?)\])?/)
    const version = m?.[1] || headerLine.trim()
    const date = m?.[2] || ''
    const channel = m?.[3] || ''

    // 分块到各个 ### 分组（Features/Fixes/...）
    const blocks = body.split(/^###\s+/m).slice(1)
    const items = []

    blocks.forEach(b => {
      const [titleLine, ...rest] = b.split('\n')
      const type = mapTitleToType(titleLine || '')
      const text = rest.join('\n').trim()

      // ⚠️关键：用多行匹配抓每一条，首条也能匹配到
      const lines = (text.match(/^(?:[*\-+]\s|\d+\.\s).+/gm) || [])
        .map(s => s.replace(/^(?:[*\-+]\s|\d+\.\s)/, '').trim())
        .filter(Boolean)

      lines.forEach(txt => items.push({ type, text: txt }))
    })

    return { version: `v${version.replace(/^v/, '')}`, date, channel, items }
  })
}


function groupItems(items) {
  const order = ['breaking', 'feature', 'fix', 'perf', 'docs', 'refactor', 'chore', 'test']
  const titleMap = {
    breaking: 'Breaking Changes',
    feature: 'Features',
    fix: 'Fixes',
    perf: 'Performance',
    docs: 'Docs',
    refactor: 'Refactor',
    chore: 'Chore',
    test: 'Tests',
  }
  const buckets = items.reduce((acc, cur) => {
    (acc[cur.type] ||= []).push(cur.text)
    return acc
  }, {})
  return order
    .filter(t => buckets[t]?.length)
    .map(t => ({ title: titleMap[t], items: buckets[t] }))
}

function channelSeverity(ch) {
  const map = { Stable: 'success', Beta: 'info', Alpha: 'warning' }
  return map[ch] || 'secondary'
}
</script>

<style scoped>
:deep(.p-timeline-event) {
  margin-bottom: 1rem;
}
/* 修复全局样式导致的项目符号错位/居中等问题 */
.changelog-list {
  list-style-type: disc;          /* 使用实心圆点 */
  list-style-position: outside;   /* 圆点在文本外侧 */
  padding-left: 1.25rem;          /* 给圆点留出缩进 */
  margin: 0.25rem 0 0.75rem;      /* 适度间距 */
  text-align: left;               /* 强制内容左对齐 */
}

.changelog-list li {
  display: list-item;             /* 防止被全局设成 flex 等 */
  margin: 0.25rem 0;
  line-height: 1.6;
  white-space: normal;            /* 允许换行 */
}

/* 有些主题会把 Card/Accordion 里的文本设成居中，这里统一左对齐 */
:deep(.p-card), 
:deep(.p-accordion-content) {
  text-align: left;
}
.changelog-page {
  min-height: 100vh;      /* 占满全屏高度 */
  background-color: #F4F7FE;
  padding: 1rem;
}
.back-btn {
  position: fixed;
  left: 1.5rem;
  bottom: 1.5rem;
  background-color: #2B2C57 !important;
  color: #fff !important;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
</style>
