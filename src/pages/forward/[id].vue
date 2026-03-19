<template>
    <Toast />
  <div class="page">
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
            <span class="qdlg-date-inline">
              <i class="pi pi-clock"></i>
              {{ formatDate(selectedProject?.date, true) }}
            </span>
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

              <!-- 右栏指标区域（包含 ProgressBar） -->
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
                >
                  {{ m.raw }}{{ m.unit }}
                </span>
              </div>
            </div>
            <div class="qdlg-metric-label">{{ m.label }}</div>
          </div>
        </div>

      </section>

      <!-- 底部 -->
      <footer class="bottom">
        <button class="accept" @click="onAccept" :disabled="accepting">
          {{ accepting ? 'Processing...' : 'Forward' }}
        </button>

        <AssigneesStack
          v-if="task?.accepted_by?.length"
          :users="task.accepted_by"
          :max-visible="3"
          :size="44"
          :dialog-title="'Assigned'"
          :dialog-width="'420px'"
          :avatar-url-fn="avatarUrl"
          @open="showAssignees = true"
          @close="showAssignees = false"
        />
      </footer>
    </div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<route lang="yaml">
meta:
  requiresAuth: false
  allowMobile: true
</route>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import api from '../../api.js';
import axios from 'axios';
const apiNone = axios.create({
  baseURL: '/', // 建议直接写成 /api，避免路径歧义
});
import DOMPurify from 'dompurify'
import ProgressBar from 'primevue/progressbar'              // ✅ 用 PrimeVue 的进度条
import { levelRanges } from '../../components/levelRange.js' // ✅ 等级上下限
import AssigneesStack from '../../components/AssigneesStack.vue'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const router = useRouter()
const route = useRoute()
// ==== 依赖的导入 ====
// 简单的日期格式化（台湾时区），支持 Date 或字符串
const formatDate = (input: string | number | Date | null | undefined, withTime = false) => {
  if (input == null || input === '') return ''
  const d = input instanceof Date ? input : new Date(input as any)
  if (isNaN(d.getTime())) return ''
  const opts: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Taipei',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {})
  }
  return new Intl.DateTimeFormat('zh-TW', opts).format(d)
}
const task = ref<any>(null)
const showAssignees = ref(false)

const isLoggedIn = computed(() => {
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");

  return access && refresh && isJwtValid(access)
})

function isJwtValid(token: string | null): boolean {
  if (!token) return false;
  try {
    const base64 = token.split(".")[1];
    if (!base64) return false;
    const json = JSON.parse(decodeURIComponent(atob(base64).split("").map(c =>
      "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
    ).join("")));
    if (typeof json.exp !== "number") return true; // 无 exp 当作有效（由接口再兜底）
    return json.exp * 1000 > Date.now();
  } catch {
    // 不是标准 JWT，交由服务端/接口兜底
    return true;
  }
}
// 头像地址统一封装（沿用你原来的 dicebear 规则）
const avatarUrl = (u: any) =>
  `https://api.dicebear.com/9.x/adventurer/svg?seed=${u?.avatar || u?.nickname || 'user'}&skinColor=ecad80,f2d3b1`

// 只展示前三个；用于底部右侧紧凑视图
const visibleAssignees = computed(() => (task.value?.accepted_by || []).slice(0, 3))
// 假头像占位
const hostAvatar = computed(() => {
  const seed = task.value?.publisher_avatar || task.value?.publisher || 'none'
  return `https://api.dicebear.com/9.x/adventurer/svg?skinColor=ecad80,f2d3b1&seed=${encodeURIComponent(seed)}`
})


/** ========== HTML 描述（安全渲染） ========== */
const safeDescription = computed(() => {
  const html = task.value?.description || ''
  const clean = DOMPurify.sanitize(html)
  const div = document.createElement('div')
  div.innerHTML = clean
  // 让富文中的图片自适应
  //ToDo:照片居中，现在照片还不居中
  div.querySelectorAll('img').forEach((img: any) => {
    img.style.maxWidth = '100%'      // 不超过卡片宽度
    img.style.height = 'auto'        // 保持比例
    img.style.maxHeight = '52vh'     // ⭐ 关键：限制最大高度（可调 45~60vh）
    img.style.objectFit = 'contain'  // ⭐ 关键：完整显示，不裁切
    img.style.display = 'block'      // 让 margin 生效
    img.style.margin = '12px auto'   // ⭐ 水平居中

  })
  return div.innerHTML
})
const accepting = ref(false)

/** 真正的“接受任务”的业务逻辑（已登录时跑这里） */
const applyForTask = async (taskId: string | number) => {
  if (!taskId) return
  try {
    await api.post(`/api/tasks/${taskId}/apply/`)
    toast.add({
      severity: 'success',
      summary: '已接受任务',
      detail: '任务申请成功，列表已更新。',
      life: 3000
    })
    // 👉 如果你当前页面也需要刷新任务详情，可以加上：
    await fetchTask(taskId)
  } catch (err: any) {
    console.error(err)
    toast.add({
      severity: 'error',
      summary: '操作失败',
      detail: err?.response?.data?.detail || '接受任务失败，请稍后再试。',
      life: 4000
    })
  }
}

/** 点击 Accept 的统一入口 */
const onAccept = async () => {
  if (accepting.value) return
  if (!isLoggedIn.value) {
    // 带上回跳地址跳登录页（用 name 或 path 看你路由怎么配的）
    router.push({
      path: '/',              // 如果你的登录路由是 '/login'，也可以用 { path: '/login' }
      query: { redirect: route.fullPath }
    })
    return
  }

  // 已登录：执行你的业务
  try {
    accepting.value = true
    await applyForTask(route.params.id as string)
  } finally {
    accepting.value = false
  }
}
/** ========== 进度条：按等级上下限计算 ========== */
// 工具：把接口的三个字段映射到 exp/coin/hour
const mapTaskToMetrics = (t: any) => ({
  exp:  Number(t?.experience_reward ?? 0),
  coin: Number(t?.token_reward ?? 0),
  hour: Number(t?.volunteerTime_reward ?? 0),
})
// 需在父级存在：当前被查看的任务
const selectedProject = ref(null)

// ==== 图标与颜色（每根进度条的配置） ====
const ICON_EXP  = new URL('../../assets/icon/exp.png', import.meta.url).href
const ICON_COIN = new URL('../../assets/icon/token.png', import.meta.url).href
const ICON_TIME = new URL('../../assets/icon/time.png', import.meta.url).href

const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  unit: '',  icon: ICON_EXP,  color: '#11AF9B' },
  { key: 'coin', label: 'Coin', unit: '',  icon: ICON_COIN, color: '#FBE838' },
  { key: 'hour', label: 'Hours', unit: 'h', icon: ICON_TIME, color: '#4ACDF2' },
]

const fetchTask = async (id: string | number) => {
  try {
    const resp = await apiNone.get(`/api/tasks/${id}/`)
    task.value = resp.data

    // 关键：把接口字段映射成进度条期望的键名
    selectedProject.value = {
      ...mapTaskToMetrics(resp.data),       // 提供 exp/coin/hour
      level: resp.data?.required_level || '', // 供范围计算
      date:  resp.data?.deadline || ''        // 若别处还在用
    }
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
// ==== 工具函数 ====
const toNumber = (v) => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/)
    return m ? Number(m[0]) : 0
  }
  return 0
}
const getBoundsByLevel = (level) => levelRanges?.[level] || { exp:[0,100], coin:[0,100], hours:[0,24] }

// ==== 根据任务等级计算每个指标的范围 ====
const selectedBounds = computed(() => {
  const lvl = selectedProject.value?.level
  return getBoundsByLevel(lvl)
})

// ==== 核心：给 ProgressBar 的显示数据（百分比 pct、原始值 raw、颜色 color 等） ====
const metricsBound = computed(() => {
  const p = selectedProject.value || {}
  const b = selectedBounds.value || {}

  return METRIC_DEFS.map(def => {
    const raw = toNumber(p?.[def.key] ?? 0)

    // 注意：范围对象里是 'hours'（复数），而数据键是 'hour'（单数）
    const ranges = def.key === 'hour' ? b?.hours : b?.[def.key]
    const [min, max] = Array.isArray(ranges) && ranges.length === 2 ? ranges : [0, 0]

    // 计算进度百分比
    const clamped = max > min ? Math.min(Math.max(raw, min), max) : raw
    const pct = max > min ? Math.round(((clamped - min) / (max - min)) * 100)
                          : (raw > 0 ? 100 : 0)

    return { ...def, raw, pct }
  })
})
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
.clock{ width:24px; height:24px; color:#2A2C55; }
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
/* 右栏容器与条目布局 */
.qdlg-metrics { display: flex; flex-direction: column; gap: var(--metric-gap); width: clamp(220px, 80%, 320px); margin: 0;}
.qdlg-metric-item { display: flex; flex-direction: column; gap: 4px; }
.qdlg-metric-row { display: flex; align-items: center; width: 100%; position: relative; }

/* 左侧图标（可选，若你只要进度条可忽略） */
.qdlg-metric-icon {
  width: clamp(28px, 4vw, 45px); height: clamp(28px, 4vw, 45px);
  margin-right: max(-12px, -2vw); flex-shrink: 0; z-index: 3; position: relative;
}
.qdlg-pixelated {
  image-rendering: pixelated; image-rendering: crisp-edges; image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}
.qdlg-metric-text {
  position: absolute;
  top: 50%;
  left: 50%;                /* ✅ 改成 50% */
  transform: translate(-50%, -50%);
  font-size: 16px;
  font-weight: 600;
  color: #2A2C55;
  pointer-events: none;
}

/* ProgressBar 外层容器 */
.qdlg-metric-bar {
  flex: 0 0 auto;
  width: 100%; 
  max-width: 280px;   /* ✅ 新增：限制条宽，数值可调 */
  margin: 0 auto;     /* ✅ 新增：让条居中 */
  min-width: 180px;
}

/* PrimeVue ProgressBar 的外观重置 */
.qdlg-metric-bar :deep(.p-progressbar) {
  display: block;
  width: 100%;
  height: clamp(18px, 2.5vw, 28px);
  border-radius: 999px;
  background: #eef2fb;      /* 背景槽颜色 */
  overflow: hidden;
  position: relative;
  z-index: 1;
}

/* 使用 CSS 变量控制进度颜色（由内联 style 的 --bar-color 传入） */
.qdlg-metric-bar :deep(.p-progressbar-value) {
  background-color: var(--bar-color, #3b82f6);
}

/* 若展示数值文本在条内（这里我们关掉 showValue，所以仅作保底） */
.qdlg-metric-bar :deep(.p-progressbar .p-progressbar-content) {
  display: flex; align-items: center; justify-content: center;
}

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
/* 新增：整页背景与左右灰边 */
.page{
  /* 灰色背景就是左右“空出来的空间” */
  background: #f3f4f6;              /* 你也可以换成 #eef1f5 */
  /* 给两侧一个基础内边距，避免巨屏贴边难看 */
  padding: 0 clamp(12px, 4vw, 24px);

}

/* 调整：中间内容容器做成白色卡片并居中 */
.container{
  /* 原有的属性保留，下面是关键新增/覆盖 */
  max-width: 560px;                /* 控制内容最大宽度 */
  margin: 0 auto;                   /* 居中，就会在大屏两侧露出灰色 */
  background: #fff;                 /* 白色卡片 */
  border-radius: 16px;              /* 圆角 */
  box-shadow: 0 8px 24px rgba(0,0,0,.06);
  min-height: 100dvb;               /* 让卡片至少与视口等高 */
  padding: 32px 36px 28px;          /* 适当放大内边距以配合卡片感 */
}

/* —— 桌面 / 平板上的“内容-指标”两栏布局 —— */
@media (min-width: 1024px){
  .content-row{
    display: flex;                  /* ✅ 新增：改为纵向容器 */
    flex-direction: column;         /* ✅ 新增：上下堆叠 */
    margin-left: 1%;
    gap: 24px;
  }
  .qdlg-metrics{
    width: 100%;
    max-width: 340px;               /* ✅ 新增：区域本身定宽 */
    margin-left: 1%;
  }
}


/* —— 手机适配：全宽、去圆角阴影，收紧内边距 —— */
@media (max-width: 768px){
  .page{ padding: 0; }              /* 手机就不要左右 padding 了 */
  .container{
    border-radius: 0;
    box-shadow: none;
    padding: 20px 16px;             /* 更紧凑的手机内边距 */
    min-height: auto;               /* 避免小屏溢出 */
  }
}

/* —— 媒体区网格：去掉“向右偏移”的 margin —— */
.media{
  display: grid;
  grid-template-columns: repeat(2, 300px);
  gap: 20px;
  max-width: 620px;
  margin: 0;
}
@media (max-width: 700px){
  .media{ grid-template-columns: 300px; max-width: 300px; }
}

/* —— 指标区本身保持列布局，去掉横向位移 —— */
.qdlg-metrics{
  display: flex;
  flex-direction: column;
  gap: var(--metric-gap);
  width: clamp(220px, 80%, 320px);
  margin: 0;
  align-items: flex-start;
}

/* 1) 任务封面图（task.image） */
.media-img{
  width: 100%;
  max-width: 100%;
  height: auto;                 /* 保持比例 */
  max-height: 52vh;             /* ✅ 关键：限制最大高度（可调 45~60vh） */
  object-fit: contain;          /* ✅ 关键：整张图完整显示，不裁切 */
  border-radius: 10px;
  display: block;
  margin: 0 auto;
}

/* 2) 富文本（description）里的所有图片：scoped 下必须用 :deep 才选得到 */
:deep(.meta .desc img){
  width: 100%;
  max-width: 100%;
  height: auto;                 /* 保持比例 */
  max-height: 52vh;             /* ✅ 同样限制高度，避免长海报撑爆 */
  object-fit: contain;          /* ✅ 完整容纳 */
  display: block;
  margin: 12px auto;
}
/* 让右侧文字区允许收缩，不把内容顶出卡片 */
.meta{
  min-width: 0;
}

/* 让描述文字一定会在卡片内换行 */
.meta .desc{
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;   /* 最强换行：必要时任意位置断行 */
  word-break: break-word;    /* 兼容处理 */
}



</style>
