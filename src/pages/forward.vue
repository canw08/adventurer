<template>
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

      <!-- 图片和指标 -->
      <section class="content-row">
        <section class="media">
          <img src="/public/login.jpg" alt="login" class="media-img" />
          <img src="/public/login.jpg" alt="login" class="media-img" />
        </section>

        <aside class="right-metrics">
          <div v-for="m in metricsBound" :key="m.key" class="metric-item">
            <div class="metric-row">
              <img :src="m.icon" alt="" class="metric-icon pixelated click-wiggle" />
              <!-- ✅ 进度条：改用 pbar-bg / pbar-fill -->
              <ProgressBar
                :value="m.pct"
                class="metric-bar"
                :style="{ height: '28px', '--bar-color': m.color, '--bar-track': '#E5E7EB' }"
              >
                <span class="metric-text">{{ m.raw }}{{ m.unit }}</span>
              </ProgressBar>
            </div>
            <div class="metric-label">{{ m.label }}</div>
          </div>
        </aside>
      </section>

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
</template>

<script setup lang="ts">
import { computed, ref, defineComponent, h } from 'vue'

const hostAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=bridgette'
const assigneeAvatar = 'https://api.dicebear.com/9.x/adventurer/svg?seed=haoyang'

const metricsBound = computed(() => {
  const p = selectedProject.value || {};
  return METRIC_DEFS.map(def => {
    const raw = toNumber(p?.[def.key] ?? 0);
    const pct = def.max > 0 ? Math.max(0, Math.min(100, Math.round((raw / def.max) * 100))) : 0;
    return { ...def, raw, pct };
  });
});

const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  max: 500, unit: '', icon: new URL('../assets/icon/exp.png',   import.meta.url).href, color: '#F58B40' },
  { key: 'coin', label: 'Coin', max: 100, unit: '', icon: new URL('../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', max: 10,  unit: 'h', icon: new URL('../assets/icon/time.png',  import.meta.url).href, color: '#65D6ef'  },
]

type Project = { exp?: number; coin?: number; hour?: number }
const selectedProject = ref<Project>({
  exp: 500,
  coin: 85,
  hour: 1,
})

const toNumber = (v: unknown) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const ProgressBar = defineComponent({
  name: 'ProgressBar',
  props: { value: { type: Number, required: true } },
  setup(props, { slots, attrs }) {
    // ✅ 把父级传来的 class/style 透传到根 div
    return () =>
      h('div', { class: ['pbar-bg', attrs.class], style: attrs.style }, [
        h('div', {
          class: 'pbar-fill',
          style: { width: `${Math.max(0, Math.min(100, props.value))}%` }
        }, slots.default?.())
      ])
  }
})

</script>

<style scoped>
:root{ --ink:#2A2C56; --muted:#9aa0af; --orange:#FF8A42; --yellow:#FFD84A; --bar-bg:#D9D9D9; --btn:#2A2C56; }
/* ✅ 注意：用 :deep 作用到子组件内部 DOM */
:deep(.metric-bar) {        /* 这个类是你写在 <ProgressBar class="metric-bar"> 上的 */
  flex: 1;                  /* 占满剩余空间，自适应宽度 */
  height: 28px;
  position: relative;
  background: var(--bar-bg);
  border-radius: 12px;
  overflow: hidden;
  min-width: 120px;
  /* 避免被其它规则写死宽度 */
  width: auto;
}
/* 进度填充条 */
:deep(.pbar-fill) {
  position: absolute; left: 0; top: 0; bottom: 0;
  display: flex; align-items: center; justify-content: flex-end;
  padding-right: 10px;
  font-weight: 800; font-size: 12px; color: #fff;
  background: var(--bar-color, #65D6ef); /* 颜色来自你传入的 --bar-color */
}
.container{ height:100%; min-height:100vh; display:flex; flex-direction:column; padding:40px 48px 28px; }

/* 顶部区 */
.top{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; }
.title{ margin:0 0 10px 0; color:var(--ink); font-size:32px; font-weight:800; letter-spacing:.2px; }
.date{ display:flex; align-items:center; gap:10px; color:#9aa0af; font-weight:800; font-size:18px; }
.clock{ width:24px; height:24px; color:#b9beca; }
.level{ align-self:flex-start; font-size:36px; font-weight:900; color:#6DEAFF; }

/* 作者区 */
.author{ display:grid; grid-template-columns:64px 1fr; gap:14px 16px; margin-top:28px; }
.avatar{ width:64px; height:64px; border-radius:50%; }
.meta .name{ color:var(--ink); font-size:20px; font-weight:700; }
.meta .desc{ margin:8px 0 0 0; color:#222; line-height:1.7; grid-column:2 / -1; }

/* ✅ 图片区：固定宽度，靠左，不居中 */
.media {
  display: grid;
  grid-template-columns: repeat(2, 300px); /* 两张固定 300px */
  gap: 20px;
  max-width: 620px; /* 总宽 */
  margin-left: 5%;
}
.media-img {
  width: 300px;
  height: 225px;
  object-fit: cover;
  border-radius: 10px;
}

/* 指标区 */
.container {
  height:100%;
  min-height:100vh;
  display:flex;
  flex-direction:column;
  padding:40px 48px 28px;
}
.content-row {
  display:flex;
  flex-direction:column;
  gap:28px;
  margin:24px 0 16px;
  /* ❌ 不要加 flex:1，这样 footer 才能贴底 */
}

.right-metrics {
  position: static;
  align-self: flex-start;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  margin-left: 5%;
}
.metric-item { display: flex; flex-direction: column; gap: 4px; }
.metric-row { display: flex; align-items: center; gap: 0; gap: 6px;   /* 给 icon 和条留点间距 */}
.metric-icon { width: 45px; height: 45px; flex-shrink: 0; margin-right: -18px; z-index: 2; }
.metric-label { font-size: 13px; font-weight: 600; margin-left: 10px; color: #5a6275; }
.metric-text { font-size: 12px; font-weight: 600; color:#fff; }
/* ✅ 条容器：同时有 .pbar-bg 和 .metric-bar 类 */
.metric-bar {
  flex: 1;             /* 占满剩余空间 */
  height: 28px;
  background: var(--bar-bg);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  min-width: 120px;    /* 避免太窄 */
}
/* 底部 */
.bottom{ margin-top:auto; display:flex; align-items:center; justify-content:space-between; padding-top:22px; }
.accept{ background:var(--btn); color:#fff; border:none; padding:12px 58px; font-weight:900; border-radius:500px; font-size:18px; cursor:pointer; background-color: #2A2C55;}
.assigned{ display:flex; align-items:center; gap:12px; }
.muted{ color:#b9bcc6; font-weight:900; letter-spacing:.4px; }
.who{ color:#111; font-weight:900; font-size:20px; }
.assignee{ width:52px; height:52px; border-radius:50%; }

/* 小屏下图片收缩 */
@media (max-width: 700px){
  .media{ grid-template-columns: 300px; max-width:300px; }
}
</style>