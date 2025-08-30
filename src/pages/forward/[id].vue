<template>
  <div class="container" v-if="task">
    <!-- 顶部：标题/日期/等级 -->
    <header class="top">
      <div class="title-side">
        <h1 class="title">{{ task.title }}</h1>
        <div class="date">
          <svg class="clock" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7v5.2l3.6 1.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>{{ formatDate(task.deadline) }}</span>
        </div>
      </div>
      <div class="level">Level {{ task.required_level }}</div>
    </header>

    <!-- 作者信息 -->
    <section class="author">
      <img class="avatar" :src="hostAvatar" alt="host avatar" />
      <div class="meta">
        <div class="name">{{ task.publisher }}</div>

        <!-- ✅ 渲染富文本描述（已净化） -->
        <div class="desc" v-html="safeDescription"></div>
      </div>
    </section>

    <!-- 图片和指标 -->
    <section class="content-row">
      <section class="media">
        <img v-if="task.image" :src="task.image" alt="task image" class="media-img" />
      </section>

      <aside class="right-metrics">
        <div v-for="m in metricsBound" :key="m.key" class="metric-item">
          <div class="metric-row">
            <img :src="m.icon" alt="" class="metric-icon pixelated click-wiggle" />
            <!-- ✅ PrimeVue ProgressBar -->
            <ProgressBar
              :value="m.pct"
              :showValue="false"
              class="metric-bar"
              :style="{ '--bar-color': m.color }"
            />
            <!-- ✅ 数值（右侧悬浮） -->
            <span class="metric-text">
              {{ m.raw }}{{ m.unit }}
            </span>
          </div>
          <div class="metric-label">{{ m.label }}</div>
        </div>
      </aside>

    </section>

    <!-- 底部 -->
    <footer class="bottom">
      <button class="accept">Accept</button>

      <!-- 头像叠加：点击可查看详情 -->
      <div
        v-if="task.accepted_by?.length"
        class="assignees"
        role="button"
        :aria-label="`assignees ${task.accepted_by.length}`"
        @click="showAssignees = true"
        title="查看参与者"
      >
        <!-- 只渲染前三个：第 2 个覆盖在第 1 个上；第 3 个不再叠 -->
        <img
          v-for="(u, idx) in visibleAssignees"
          :key="u.id"
          class="assignee avtr"
          :class="idx === 1 ? 'overlap' : ''"
          :src="avatarUrl(u)"
          alt="assignee avatar"
        />
        <!-- 超过 3 个时显示 +N，不再继续叠 -->
        <span v-if="task.accepted_by.length > 3" class="more-pill">
          +{{ task.accepted_by.length - 3 }}
        </span>
      </div>

      <!-- 详情弹窗 -->
      <Dialog v-model:visible="showAssignees" modal header="Assigned">
        <ul class="assignees-list">
          <li v-for="u in task.accepted_by" :key="u.id" class="assignee-row">
            <img :src="avatarUrl(u)" class="avtr sm" alt="" />
            <div class="assignee-info">
              <div class="assignee-name">{{ u.nickname }}</div>
              <div class="assignee-id">ID: {{ u.id }}</div>
            </div>
          </li>
        </ul>
      </Dialog>
    </footer>


  </div>
  <div v-else class="loading">Loading...</div>
</template>

<route lang="yaml">
meta:
  requiresAuth: true
  allowMobile: true
</route>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../../api'
import DOMPurify from 'dompurify'
import ProgressBar from 'primevue/progressbar'              // ✅ 用 PrimeVue 的进度条
import { levelRanges } from '../../components/levelRange.js' // ✅ 等级上下限

const route = useRoute()
const task = ref<any>(null)
const showAssignees = ref(false)

// 头像地址统一封装（沿用你原来的 dicebear 规则）
const avatarUrl = (u: any) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${u?.avatar || u?.nickname || 'user'}`

// 只展示前三个；用于底部右侧紧凑视图
const visibleAssignees = computed(() => (task.value?.accepted_by || []).slice(0, 3))
// 假头像占位
const hostAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=bridgette'
const assigneeAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=haoyang'

/** ========== HTML 描述（安全渲染） ========== */
const safeDescription = computed(() => {
  const html = task.value?.description || ''
  const clean = DOMPurify.sanitize(html)
  const div = document.createElement('div')
  div.innerHTML = clean
  // 让富文中的图片自适应
  div.querySelectorAll('img').forEach((img: any) => {
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'
  })
  return div.innerHTML
})

/** ========== 进度条：按等级上下限计算 ========== */
// 工具：把接口的三个字段映射到 exp/coin/hour
const mapTaskToMetrics = (t: any) => ({
  exp:  Number(t?.experience_reward ?? 0),
  coin: Number(t?.token_reward ?? 0),
  hour: Number(t?.volunteerTime_reward ?? 0),
})
const toNumber = (v: any) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return 0
}

// 取对应等级的范围；未命中给兜底
const getBoundsByLevel = (level: string) => levelRanges?.[level] || { exp:[0,100], coin:[0,100], hours:[0,24] }
const selectedBounds = computed(() => getBoundsByLevel(task.value?.required_level))

// UI 定义
const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  unit: '',  icon: new URL('../../assets/icon/exp.png',   import.meta.url).href, color: '#11AF9B' },
  { key: 'coin', label: 'Coin', unit: '',  icon: new URL('../../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', unit: 'h', icon: new URL('../../assets/icon/time.png',  import.meta.url).href, color: '#4ACDF2' },
]

// 百分比 = (raw - min) / (max - min)，并把 raw clamp 到范围内
const metricsBound = computed(() => {
  if (!task.value) return []
  const metricVals = mapTaskToMetrics(task.value)
  const b = selectedBounds.value

  return METRIC_DEFS.map(def => {
    const raw = toNumber(metricVals[def.key as 'exp'|'coin'|'hour'] ?? 0)
    const ranges = def.key === 'hour' ? b.hours : (b as any)[def.key]
    const [min, max] = Array.isArray(ranges) && ranges.length === 2 ? ranges : [0, 0]
    const clamped = max > min ? Math.min(Math.max(raw, min), max) : raw
    const pct = max > min ? Math.round(((clamped - min) / (max - min)) * 100) : (raw > 0 ? 100 : 0)
    return { ...def, raw, pct }
  })
})

/** ========== 获取任务详情 ========== */
const fetchTask = async (id: string | number) => {
  try {
    const resp = await api.get(`/api/tasks/${id}/`) // 保持和你的 mock/后端一致（末尾 /）
    task.value = resp.data
  } catch (e) {
    console.error('加载任务失败', e)
  }
}

onMounted(() => {
  fetchTask(route.params.id as string)
})
watch(() => route.params.id, (newId) => {
  if (newId) fetchTask(newId as string)
})

/** ========== 工具函数 ========== */
const formatDate = (iso: string) => {
  if (!iso) return ''
  return new Date(iso).toLocaleString()
}
</script>

<style scoped>
:root{ --ink:#2A2C56; --muted:#9aa0af; --orange:#FF8A42; --yellow:#FFD84A; --bar-bg:#D9D9D9; --btn:#2A2C56; }
/* 进度条容器（与 PrimeVue 结合） */

.metric-bar {
  flex: 1;                  /* 占满剩余空间 */
  width: 100%;              /* 确保进度条撑满父容器 */
  min-width: 120px;         /* 避免太小挤没了 */
}
.p-progressbar {
  height: 28px;
  border-radius: 12px;
  overflow: hidden;
}
.p-progressbar .p-progressbar-value {
  background: var(--bar-color, #65D6ef) !important; /* 用传入的 --bar-color */
}

.container{ height:100%; min-height:100vh; display:flex; flex-direction:column; padding:40px 48px 28px; }
.top{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.title{ margin:0 0 10px 0; color:var(--ink); font-size:32px; font-weight:800; letter-spacing:.2px; }
.date{ display:flex; align-items:center; gap:10px; color:#9aa0af; font-weight:800; font-size:18px; }
.clock{ width:24px; height:24px; color:#b9beca; }
.level{ align-self:flex-start; font-size:36px; font-weight:900; color:#6DEAFF; }

.author{ display:grid; grid-template-columns:64px 1fr; gap:14px 16px; margin-top:28px; }
.avatar{ width:64px; height:64px; border-radius:50%; }
.meta .name{ color:var(--ink); font-size:20px; font-weight:700; }
.meta .desc{ margin:8px 0 0 0; color:#222; line-height:1.7; grid-column:2 / -1; }

.media {
  display: grid;
  grid-template-columns: repeat(2, 300px);
  gap: 20px;
  max-width: 620px;
  margin-left: 5%;
}
.media-img {
  width: 300px;
  height: 225px;
  object-fit: cover;
  border-radius: 10px;
}

.content-row { display:flex; flex-direction:column; gap:28px; margin:24px 0 16px; }
.right-metrics { position: static; align-self: flex-start; display: flex; flex-direction: column; gap: 12px; margin-top: 12px; margin-left: 5%; }
.metric-item { display: flex; flex-direction: column; gap: 4px; }
.metric-row { display: flex; align-items: center; gap: 6px; position:relative; }
.metric-icon { width: 45px; height: 45px; flex-shrink: 0; margin-right: -18px; z-index: 2; }
.metric-label { font-size: 13px; font-weight: 600; margin-left: 10px; color: #5a6275; }
.metric-text { font-size: 12px; font-weight: 600; color:#000000; }

.bottom{ margin-top:auto; display:flex; align-items:center; justify-content:space-between; padding-top:22px; }
.accept{ background:var(--btn); color:#fff; border:none; padding:12px 58px; font-weight:900; border-radius:500px; font-size:18px; cursor:pointer; background-color: #2A2C55;}
.assigned{ display:flex; align-items:center; gap:12px; }
.muted{ color:#b9bcc6; font-weight:900; letter-spacing:.4px; }
.who{ color:#111; font-weight:900; font-size:20px; }
.assignee{ width:52px; height:52px; border-radius:50%; }

@media (max-width: 700px){
  .media{ grid-template-columns: 300px; max-width:300px; }
}

.assigned-list {
  display: flex;
  gap: 12px;
  align-items: center;
}

.assigned-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.right-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--metric-gap, 16px);
  width: clamp(220px, 80%, 320px);
  margin: 0 auto;
}

.metric-item {
  display: flex;
  flex-direction: column;
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
  margin-right: max(-12px, -2vw);
  flex-shrink: 0;
  z-index: 3;
  position: relative;
}


.metric-label {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #5a6275;
}
/* 进度条背景容器 */
:deep(.metric-bar) {
  flex: 1;
  height: 28px;
  position: relative;
  background: var(--bar-bg, #D9D9D9); /* 灰色背景 */
  border-radius: 12px;
  overflow: hidden;
  min-width: 120px;
  width: auto;
}

/* 进度填充条 */
:deep(.pbar-fill) {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 10px;
  font-weight: 800;
  font-size: 12px;
  color: #fff;
  background: var(--bar-color, #65D6ef); /* 彩色部分用传入的 bar-color */
}

/* 数值（如果你要单独控制样式） */
.metric-text {
  font-size: 12px;
  font-weight: 600;
  color: #000000;
}


/* 卡片右下角 */
/* —— 底部头像区域 —— */
.assignees{
  display: flex;
  align-items: center;
  gap: 8px;               /* 与 +N 的间距 */
  cursor: pointer;
  user-select: none;
}

.avtr{
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #fff; /* 让叠层边界更清楚 */
  box-shadow: 0 1px 3px rgba(0,0,0,.12);
}

/* 详情列表里的小号头像 */
.avtr.sm{
  width: 36px;
  height: 36px;
  border-width: 1.5px;
}

/* 只让第二张叠到第一张的右侧（更高 z-index） */
.assignees .avtr.overlap{
  margin-left: -14px;   /* 让下层从左边露出一点 */
  position: relative;
  z-index: 2;
}

/* 第三个不再叠，正常排列（与第二张留一点空隙） */
.assignees .avtr:not(.overlap):not(:first-child){
  margin-left: 6px;
}

/* 超过 3 人时显示 +N */
.more-pill{
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 12px;
  background: #eef0f4;
  color: #2a2c56;
  font-weight: 700;
  font-size: 12px;
}

/* —— 弹窗里的列表 —— */
.assignees-list{
  margin: 0; padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.assignee-row{
  display: flex;
  align-items: center;
  gap: 10px;
}
.assignee-info{
  display: flex;
  flex-direction: column;
}
.assignee-name{
  font-weight: 700; color: #111;
}
.assignee-id{
  font-size: 12px; color: #9aa0af;
}

/* 卡片右下角完 */

</style>
