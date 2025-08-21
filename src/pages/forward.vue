<template>
  <div class="quest-fullpage">
    <div class="container">
      <!-- 顶部：标题/日期/等级 -->
      <header class="top">
        <div class="title-side">
          <h1 class="title">Volunteer feeding the cat</h1>
          <div class="date">
            <svg class="clock" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/>
              <path d="M12 7v5.2l3.6 1.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>5 July，2025</span>
          </div>
        </div>
        <div class="level">Level E</div>
      </header>

      <!-- 作者信息 -->
      <section class="author">
        <img class="avatar" :src="hostAvatar" alt="host avatar" />
        <div class="meta">
          <div class="name">
            Bridgette-<strong>文碧之</strong>
          </div>
          <p class="desc">
            中午十二点，在三棵树集合喂猫时长为1h<br />
            需要5-6个人
          </p>
        </div>
      </section>

      <section class="media">
        <img src="/public/login.jpg" alt="login" class="media-img" />
        <img src="/public/login.jpg" alt="login" class="media-img" />
      </section>

      <!-- 奖励条 -->
        <div class="right-metrics">
            <div v-for="m in metricsBound" :key="m.key" class="metric-item">
              <!-- 上行：icon + 进度条 -->
              <div class="metric-row">
                <img :src="m.icon" alt="" class="metric-icon pixelated click-wiggle" />
                <ProgressBar :value="m.pct" class="metric-bar" :style="{ height: '28px','--bar-color': m.color }">
                  <span class="metric-text">{{ m.raw }}{{ m.unit }}</span>
                </ProgressBar>
              </div>
              <!-- 下行：label -->
              <div class="metric-label">{{ m.label }}</div>
            </div>
          </div>

      <!-- 底部：左按钮 + 右指派 -->
      <footer class="bottom">
        <button class="accept">Accept</button>

        <div class="assigned">
          <span class="muted">Assigned</span>
          <span class="who">张皓阳</span>
          <img class="assignee" :src="assigneeAvatar" alt="assignee avatar"/>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, defineComponent, h } from 'vue'

const hostAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=bridgette'
const assigneeAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=haoyang'
// <script setup>
const pics = [
  'public/image/login.jpg',
]
const metricsBound = computed(() => {
  const p = selectedProject.value || {};
  return METRIC_DEFS.map(def => {
    const raw = toNumber(p?.[def.key] ?? 0);
    const pct = def.max > 0 ? Math.max(0, Math.min(100, Math.round((raw / def.max) * 100))) : 0;
    return { ...def, raw, pct };
  });
});
// 统一的上限与单位（可按业务调整）
const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  max: 500, unit: '', icon: new URL('../assets/icon/exp.png',   import.meta.url).href, color: '#F58B40' },
  { key: 'coin', label: 'Coin', max: 100, unit: '', icon: new URL('../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', max: 10,  unit: 'h', icon: new URL('../assets/icon/time.png',  import.meta.url).href, color: '#65D6ef'  },
]

/* ✅ 补齐：selectedProject（如果你之后从接口赋值，可以把这里的初始值替换掉） */
type Project = { exp?: number; coin?: number; hour?: number }
const selectedProject = ref<Project>({
  exp: 500,
  coin: 85,
  hour: 1,
})

/* ✅ 补齐：toNumber 工具 */
const toNumber = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const ProgressBar = defineComponent({
  name: 'ProgressBar',
  props: { value: { type: Number, required: true } },
  setup(props, { slots }) {
    return () =>
      h('div', { class: 'pbar-bg' }, [
        h('div', {
          class: 'pbar-fill',
          style: { width: `${Math.max(0, Math.min(100, props.value))}%` }
        }, slots.default?.())
      ])
  }
})
</script>

<style scoped>
:root{
  --ink:#2A2C56;
  --muted:#9aa0af;
  --orange:#FF8A42;
  --yellow:#FFD84A;
  --bar-bg:#D9D9D9;
  --btn:#2A2C56;
}

/* 整页白底 */
.quest-fullpage{
  min-height:100vh;
  background:#fff;
}
.container{
  height:100%;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  padding:40px 48px 28px;
}

/* 顶部区 */
.top{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:16px;
}
.title{
  margin:0 0 10px 0;
  color:var(--ink);
  font-size:32px;
  font-weight:800;
  letter-spacing:.2px;
}
.date{
  display:flex; align-items:center; gap:10px;
  color:#9aa0af;
  font-weight:800;
  font-size:18px;
}
.clock{ width:24px; height:24px; color:#b9beca; }

.level{
  align-self:flex-start;
  font-size:36px;
  font-weight:900;
  color:#6DEAFF;
  -webkit-text-stroke: 1px #bff3ff;
  text-shadow: 0 1px 0 #bff3ff;
  transform: translateY(6px);
}

/* 作者区 */
.author{
  display:grid;
  grid-template-columns:64px 1fr;
  gap:14px 16px;
  margin-top:28px;
}
.avatar{
  width:64px; height:64px; border-radius:50%;
}
.meta .name{
  color:var(--ink); font-size:20px; font-weight:700;
}
.meta .desc{
  margin:8px 0 0 0;
  color:#222; line-height:1.7;
  grid-column:2 / -1;
}

/* 图片占位 */
/* 替换占位样式 */
.media {
  display: grid;
  grid-template-columns: repeat(2, 300px);
  gap: 28px;
  margin: 24px 0 16px;
  margin-left: 5%;
}

.media-img {
  width: 300px;
  height: 220px;
  object-fit: cover;   /* 保证图片不变形 */
  border-radius: 10px;
}


/* 奖励条 */
.rewards{
  display:grid;
  gap:18px;
  margin-top:4px;
}
.reward{
  display:grid;
  grid-template-columns: 44px 320px;
  grid-template-rows: 20px auto;
  column-gap:12px;
  row-gap:6px;
  align-items:center;
}
.icon-wrap{ grid-row: 1 / span 2; display:flex; align-items:center; justify-content:center; }
.r-icon{ width:28px; height:28px; image-rendering: pixelated; }

.bar-bg{
  position:relative;
  height:22px;
  background:var(--bar-bg);
  border-radius:12px;
  overflow:hidden;
}
.bar-fill{
  position:absolute; left:0; top:0; bottom:0;
  display:flex; align-items:center; justify-content:flex-end;
  padding-right:10px;
  font-weight:800; font-size:12px; color:#fff;
}
.bar-orange{ background:var(--orange); }
.bar-yellow{ background:var(--yellow); color:#2a2a2a; }
.amount{ opacity:.95; }
.under-label{
  grid-column:2;
  font-size:12px; color:#6b7280; font-weight:800;
  margin-top:2px;
}

/* 底部 */
.bottom{
  margin-top:auto; /* 推到底部 */
  display:flex; align-items:center; justify-content:space-between;
  padding-top:22px;
}
.accept{
  background:var(--btn);
  color:#fff;
  border:none;
  padding:12px 58px;
  font-weight:900;
  border-radius:500px;
  font-size:18px;
  cursor:pointer;
  background-color: #2A2C55;
}
.accept:active{ transform: translateY(1px); }

.assigned{ display:flex; align-items:center; gap:12px; }
.muted{ color:#b9bcc6; font-weight:900; letter-spacing:.4px; }
.who{ color:#111; font-weight:900; font-size:20px; }
.assignee{ width:52px; height:52px; border-radius:50%; }

@media (max-width: 1080px){
  .media{ grid-template-columns: repeat(2, 1fr); }
  .reward{ grid-template-columns: 44px 1fr; }
}
@media (max-width: 720px){
  .container{ padding:24px 18px; }
  .media{ grid-template-columns: 1fr; }
}

.right-metrics {
  display: flex;
  position: absolute;
  flex-direction: column;
  gap: var(--metric-gap);     /* 三条之间的间距 */
  margin-top: -45px; /* 与 Level 的距离，= gap */
  top: 65%;
  margin-left: 5%;
}
.metric-item {
  display: flex;
  flex-direction: column;   /* 上下布局：第一行 icon+bar，第二行 label */
  gap: 4px;
}
.metric-row {
  display: flex;
  align-items: center;
  gap: 0px;                 /* icon 和 bar 的距离 */
}
.metric-icon {
  width: 45px;
  height: 45px;
  flex-shrink: 0;           /* 图标固定大小，不会被压缩 */
  margin-right: -18px;
  z-index: 2;
}
.metric-bar {
  flex: 1;                  /* 占满剩余空间 */
  z-index: 1;
}
.metric-label {
  text-align: left;       /* label 居中到 icon 下方 */
  font-size: 13px;
  font-weight: 600;
  margin-left: 10px;
  color: #5a6275;
}
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor; /* legacy IE */
}
.metric-text {
  font-size: 12px;
  font-weight: 600;
  color: #FFf;
}
</style>
