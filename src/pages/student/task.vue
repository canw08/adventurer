<template>
  <!-- 右侧主容器 -->
  <div class="main-content">
    <!-- 顶部栏 -->
    <div class="main-header">
      <div class="header-left-group">
        <span class="header-left">{{ $t('questBoard.title') }}</span>
        <div class="vertical-divider"></div>
      </div>
      <!-- 公告组件（保持原有交互与样式） -->
      <AnnouncementPanel />
    </div>

    <!-- 次级标题与筛选按钮 -->
    <div class="main-subheader">
      <span class="greeting">{{ $t(greetingKey) }}</span>

      <div class="filter-buttons-wrapper small-toggle">
        <div class="fake-select-wrapper">
          <Button
            :label="$t('questBoard.filter')"
            icon="pi pi-filter"
            @click="showFilterDialog = true"
            class="filter-button"
          />
        </div>
      </div>
    </div>

    <!-- ✅ 卡片区域容器（分页器固定在该容器的右下角） -->
    <div class="main-body">
      <!-- 背景层 -->
      <div class="card-background"></div>

      <!-- 卡片网格 -->
       <div
  class="cards-scroll"
  :class="hasOverflow ? 'with-scroll' : 'no-scroll'"
  ref="cardsScrollRef"
>
      <div class="grid-container">
        <div
          v-for="project in paginatedProjects"
          :key="project.id"
          class="task-card"
          :class="{ 'assigned-card': project.status === 'assigned' }"
          @click="openProjectDialog(project)"
        >
          <!-- 上部图文 -->
          <div class="task-main-content">
            <!-- 左侧文本 -->
            <div class="task-left">
              <h3 class="task-title">{{ project.title }}</h3>

              <div class="task-time">
                <i class="pi pi-clock"></i>
                <span>{{ project.date }}</span>
              </div>

              <div class="task-exp">{{ project.exp || 'N/A' }}</div>
            </div>

            <!-- 右侧图片（assigned 状态通过 CSS 隐藏） -->
            <div class="task-right">
              <img :src="project.image" alt="Project Image" class="task-image" @load="onCardImageLoad"/>
            </div>
          </div>

          <!-- 分割线 -->
          <div class="task-divider"></div>

          <!-- 底部头像与等级 -->
          <div class="task-footer">
            <div class="avatar-wrapper">
              <Avatar :image="project.avatar" shape="circle" style="width: 40px; height: 40px" />
              <span class="avatar-name">{{ project.author }}</span>
            </div>
            <span class="task-level">Level {{ project.level }}</span>
          </div>
        </div>
      </div>
    </div>

      <!-- ✅ 分页器容器（固定在右下角） -->
      <div class="fixed-footer-wrapper">
        <Paginator
          :rows="rowsPerPage"
          :totalRecords="filteredProjects.length"
          :first="currentPage * rowsPerPage"
          @page="(e) => (currentPage = e.page)"
          style="background-color: white; border-radius: 12px; padding: 4px 12px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);"
        />
      </div>
    </div>

    <!-- ✅ 任务详情弹窗 -->
    <Dialog
      v-model:visible="showDialog"
      modal
      blockScroll
      dismissableMask
      :closable="false"
      :style="{ width: '1100px', height: '700px', position: 'relative' }"
      class="project-dialog"
    >
      <!-- 自定义 Header -->
      <template #header>
        <div class="dialog-custom-header">
          <!-- 左侧返回按钮 -->
          <div class="dialog-header-left">
            <Button
              icon="pi pi-arrow-left"
              text
              class="dialog-back-button"
              @click="showDialog = false"
            />
          </div>

          <!-- 中间标题 + 时间 -->
          <div class="dialog-header-center">
            <span class="dialog-title">{{ selectedProject?.title || '' }}</span>
            <span class="dialog-date-inline">
              <i class="pi pi-clock"></i>
              {{ selectedProject?.date }}
            </span>
          </div>

          <!-- 浮动右上角的等级标签（只显示） -->
          <div class="floating-dialog-level">
            Level {{ selectedProject?.level || '' }}
          </div>
        </div>
      </template>

      <!-- 弹窗主体内容 -->
      <div class="dialog-content-wrapper">
        <!-- 左侧内容区域（75%） -->
        <div class="dialog-left-section">
          <!-- ✅ ID（author name）与左边框的对齐：依赖 --rail -->
          <div class="dialog-author">
            <!-- 动态：跟随 selectedProject.avatar -->
<Avatar
  :image="selectedProject?.avatar || 'https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png'"
  shape="circle"
  size="large"
  style="width: 50px; height: 50px"
/>
            <span class="author-name">{{ selectedProject?.author }}</span>
          </div>

          <div class="dialog-description rich-text" v-html="safeDescription"></div>
        </div>
         <div class="dialog-grid-divider" aria-hidden="true"></div>
       <!-- 右侧占位区域（25%） -->
        <div class="dialog-right-section">
          <!-- 为浮动的 Level 预留等高空间，保证与第一条进度条的距离 = 进度条间距 -->
          <div class="right-level-spacer" aria-hidden="true">
            Level {{ selectedProject?.level || '' }}
          </div>

          <!-- 纵向 3 条进度条：EXP / Coin / Hour（显示具体数值） -->
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
        </div>
      </div>

      <!-- 接任务按钮（固定右下角） -->
      <div class="absolute-accept-button">
        <Button label="Accept" class="custom-btn" />
      </div>
    </Dialog>

    <!-- ✅ 筛选弹窗 -->
    <Dialog
      v-model:visible="showFilterDialog"
      modal
      dismissableMask
      header="Filter Tasks"
      class="filter-dialog"
      appendTo="self"
      :style="{ width: '1100px', height: '700px', position: 'relative' }"
    >
      <!-- 状态切换（ongoing/completed） -->
      <div class="filter-section">
        <div class="status-toggle-wrap">
          <SelectButton
            v-model="tempTab"
            :options="['assigned', 'available']"
            class="status-toggle"
          />
        </div>
      </div>

      <!-- Level 多选 -->
      <div class="filter-section level-section">
        <div class="level-label">Choose level</div>
        <div class="level-row">
          <div v-for="opt in levelOptions" :key="opt.value" class="level-item">
            <Checkbox v-model="tempLevels" :inputId="'lvl-' + opt.value" :value="opt.value" />
            <label class="level-text" :for="'lvl-' + opt.value">{{ opt.label }}</label>
          </div>
        </div>
      </div>

      <!-- 确认应用 -->
      <div class="absolute-apply-button">
        <Button label="confirm" @click="confirmFilter" class="apply-button custom-btn" />
      </div>
    </Dialog>
  </div>
</template>

<route lang="yaml">
meta:
  layout: "student"
  requiresAuth: true
  roles: ['student']
</route>

<script setup>
/**
 * 逻辑区块顺序：
 * 1) imports
 * 2) 弹窗/筛选的响应式状态
 * 3) 数据源（mock 接口）
 * 4) 过滤 & 分页（computed）
 * 5) 方法（open/confirm 等）
 * 6) 监听（watch）
 */
import Avatar from 'primevue/avatar';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Checkbox from 'primevue/checkbox';
import SelectButton from 'primevue/selectbutton';
import Paginator from 'primevue/paginator';
import ProgressBar from 'primevue/progressbar';
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

import AnnouncementPanel from '../../components/business/AnnouncementPanel.vue';
import api from '../../api.js';

// === 进度条上下限表 ===
import { levelRanges } from '../../components/levelRange.js';

// === 图片：按任务类型选择 ===
import teamwork from '../../assets/team.png'
import solo1 from '../../assets/solo.png'
import solo2 from '../../assets/solo2.png'

import DOMPurify from 'dompurify'
/* -------------------- 问候语 -------------------- */
const period = computed(() => {
  const h = new Date().getHours()
  return h < 4 ? 'night' : h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening'
})
const greetingKey = computed(() => `greetings-student.${period.value}`)

/* -------------------- 任务弹窗状态 -------------------- */
const showDialog = ref(false);
const selectedProject = ref(null);
const openProjectDialog = (project) => {
  selectedProject.value = project;
  showDialog.value = true;
};

/* -------------------- 数据源（从 mock API 分页获取） -------------------- */
const allProjects = ref([]);
const loading = ref(false);
const loadError = ref('');

// 简单日期展示：直接透传
const formatDate = (s) => s || '';

// 模拟你示例中的图片逻辑 + badge 字段
function pickTaskImage(task) {
  // 团队任务固定用 teamwork
  if (task.task_type === 'team') return teamwork;

  // 用发布时间（deadline）作为种子
  const seedStr = task.deadline || String(task.id) || '';
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0; // 转成 32 位整数
  }

  // 根据 hash 奇偶数来决定用哪张
  return Math.abs(hash) % 2 === 0 ? solo1 : solo2;
}

function mapTaskToProject(task) {
  return {
    id: task.id,
    title: task.title,
    date: formatDate(task.deadline),
    // 参照你给的代码：is_accepted → ongoing；否则 completed
    status: task.is_accepted ? 'accepted' : 'available',
    image: pickTaskImage(task),
    exp: `${task.experience_reward} EXP`,      // 加 EXP 后缀
    coin: task.token_reward,
    hour: task.volunteerTime_reward,
    level: task.required_level || 'F',
    avatar: `https://api.dicebear.com/9.x/adventurer/svg?skinColor=ecad80,f2d3b1&seed=${task.publisher_avatar}` || `https://api.dicebear.com/9.x/adventurer/svg?seed=none`,
    author: task.publisher_nickname || 'Anonymous',
    description: task.description || '',
    mandator: task.publisher_nickname || 'Anonymous',
  }
}

const fetchAllProjects = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    const acc = [];
    let page = 1;
    // 拉取分页直到 next 为空（使用你之前的 /api/tasks/ mock 接口）
    while (true) {
      const { data } = await api.get('/api/tasks/', { params: { page } });
      const results = Array.isArray(data?.results) ? data.results : [];
      acc.push(...results.map(mapTaskToProject));
      if (!data?.next) break;
      page += 1;
    }
    allProjects.value = acc;
  } catch (err) {
    console.error(err);
    loadError.value = '加载任务失败';
    allProjects.value = [];
  } finally {
    loading.value = false;
  }
};

/* -------------------- 筛选状态（ongoing/completed + level 多选） -------------------- */
const activeTab = ref('available');          // 生效状态
const showFilterDialog = ref(false);       // Filter 弹窗显隐
const tempTab = ref(activeTab.value);      // 弹窗临时状态
const levelOptions = [
  { label: 'Level F', value: 'F' },
  { label: 'Level E', value: 'E' },
  { label: 'Level D', value: 'D' },
  { label: 'Level C', value: 'C' },
  { label: 'Level B', value: 'B' },
  { label: 'Level A', value: 'A' },
  { label: 'Level S', value: 'S' },
  { label: 'Level S*', value: 'S*' },
];
const selectedLevels = ref([]); // 生效中的 level 集合
const tempLevels = ref([]);     // 弹窗内临时 level 集合

/* -------------------- 过滤 + 分页 -------------------- */
// ongoing 时包含 assigned（保持老逻辑兼容）
// === 过滤逻辑 ===
const filteredProjects = computed(() => {
  const statusFiltered = allProjects.value.filter(
    (p) => p.status === activeTab.value
  )
  if (!selectedLevels.value?.length) return statusFiltered;
  return statusFiltered.filter((p) => selectedLevels.value.includes(p.level));
})

const safeDescription = computed(() => {
  const html = selectedProject.value?.description || '无任务说明'
  const clean = DOMPurify.sanitize(html)
  const div = document.createElement('div')
  div.innerHTML = clean
  div.querySelectorAll('img').forEach(img => {
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'
  })
  return div.innerHTML
})


const currentPage = ref(0);
const rowsPerPage = 4;
const paginatedProjects = computed(() => {
  const start = currentPage.value * rowsPerPage;
  return filteredProjects.value.slice(start, start + rowsPerPage);
});

/* -------------------- 方法 -------------------- */
const applyFilter = () => {
  activeTab.value = tempTab.value;
  selectedLevels.value = [...tempLevels.value];
  showFilterDialog.value = false;
  currentPage.value = 0; // 重置到第一页
};
const confirmFilter = () => applyFilter();

/* -------------------- 监听 -------------------- */
watch(showFilterDialog, (v) => {
  if (v) {
    tempTab.value = activeTab.value;
    tempLevels.value = [...selectedLevels.value];
  }
});

// 提取数字：'400 exp' -> 400；数字则原样返回
const toNumber = (v) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const m = v.match(/[\d.]+/);
    return m ? Number(m[0]) : 0;
  }
  return 0;
};

/* -------------------- 进度条：按等级动态上下限 -------------------- */
// 允许 'A' / 'Level A' / 'A级' 等多种键，levelRanges 内需自行准备这些映射
const getBoundsByLevel = (level) => levelRanges?.[level] || null;

// 当前选中任务的上下限：{ exp:[min,max], coin:[min,max], hours:[min,max] }
const selectedBounds = computed(() => {
  const lvl = selectedProject.value?.level;
  const bounds = getBoundsByLevel(lvl);
  return bounds || { exp:[0,100], coin:[0,100], hours:[0,24] }; // 兜底
});

// 注意：我们项目字段是 'hour'，而范围表是 'hours'，这里做一次键位适配
const pickBounds = (b, key) => {
  if (!b) return [0, 0];
  if (key === 'hour') return b.hours ?? [0, 0];
  return b[key] ?? [0, 0];
};

// 用于 UI 的度量元数据（去掉固定 max，只保留单位/图标/颜色）
const METRIC_DEFS = [
  { key: 'exp',  label: 'EXP',  unit: '',  icon: new URL('../../assets/icon/exp.png', import.meta.url).href,  color: '#F58B40' },
  { key: 'coin', label: 'Coin', unit: '',  icon: new URL('../../assets/icon/token.png', import.meta.url).href, color: '#FBE838' },
  { key: 'hour', label: 'Hour', unit: 'h', icon: new URL('../../assets/icon/time.png', import.meta.url).href,  color: '#65D6ef' },
];

// 百分比 = (raw - min) / (max - min)，并对 raw 做 clamp，避免溢出或负值
const metricsBound = computed(() => {
  const p = selectedProject.value || {};
  const b = selectedBounds.value;

  return METRIC_DEFS.map(def => {
    const raw = toNumber(p?.[def.key] ?? 0);
    const [min, max] = pickBounds(b, def.key);
    let clamped = raw;

    if (max > min) {
      if (clamped < min) clamped = min;
      if (clamped > max) clamped = max;
    }

    const pct = (max > min) ? Math.round(((clamped - min) / (max - min)) * 100) : 0;
    // 进度条文本：原值（可改为 `${raw}/${max}${def.unit}`）
    const text = `${raw}${def.unit}`;

    return { ...def, raw, pct, text, min, max };
  });
});

/* -------------------- 卡片区域溢出控制 -------------------- */
const cardsScrollRef = ref(null)     // 绑定 DOM
const hasOverflow = ref(false)       // 是否需要滚动

// 检查是否溢出
const updateOverflow = () => {
  const el = cardsScrollRef.value
  if (!el) return
  hasOverflow.value = el.scrollHeight - el.clientHeight > 1
}

// 窗口 resize 时重新检查
let resizeTimer = null
const onResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    updateOverflow()
  }, 100)
}

onMounted(async () => {
  await fetchAllProjects();   // 从 mock 接口加载数据（分页）
  await nextTick()
  updateOverflow()
  window.addEventListener('resize', onResize)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (resizeTimer) clearTimeout(resizeTimer)
})

// 监听项目列表/分页变化
watch([filteredProjects, currentPage, showFilterDialog], async () => {
  await nextTick()
  updateOverflow()
}, { flush: 'post' })

// 图片加载完成后也检查
const onCardImageLoad = () => {
  updateOverflow()
}
</script>



<style scoped>
/* =========================
   布局与头部
   ========================= */
.main-content {
  flex: 1;
  padding: 4px 48px;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #d5dbe5;
  padding: 4px 0;
  height: 64px;
}

.header-left-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-left {
  font-size: 28px;
  font-weight: 800;
  color: #1e1e1e;
}

.vertical-divider {
  height: 32px;
  width: 2px;
  background-color: #e1e8f5;
}

.main-subheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 4px 0;
  min-height: 40px;
}

.greeting {
  font-style: italic;
  font-size: 18px;
  color: #333;
}

/* =========================
   筛选按钮
   ========================= */
.filter-buttons-wrapper {
  display: inline-flex;
  padding: 2px;
  border: 1px solid #c5d4ea;
  border-radius: 12px;
  background-color: white;
}

.filter-button.p-button,
.filter-button {
  font-size: 14px !important;
  font-weight: 500;
  padding: 4px 14px !important;
  height: 36px !important;
  line-height: 1 !important;
  border-radius: 8px !important;
  border: 1px solid #c5d4ea !important;
  background-color: white !important;
  color: #1e1e1e !important;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: none !important;
  gap: 8px;
}

.small-toggle {
  transform: scale(0.9);
  transform-origin: right center;
}

/* =========================
   卡片区域
   ========================= */
.main-body {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 32px;
  overflow: hidden;
  border: 1px solid #e4eaf4;
  min-height: 0; 
}

.card-background {
  position: absolute;
  inset: 0;
  background-color: #f3f7fe;
  border-radius: 12px;
  z-index: 0;
}

.grid-container {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  padding: 0;
  min-height: fit-content; 
}

/* 卡片 */
.task-card {
  position: relative;            /* 供水印定位 */
  display: flex;
  flex-direction: column;
  padding: 16px 16px 8px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
  gap: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.task-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
}

.task-main-content {
  display: flex;
  gap: 16px;
}

.task-left,
.task-right {
  width: 50%;
  box-sizing: border-box;
}

.task-left {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  overflow-wrap: break-word;
}

.task-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0 0 4px 0;
  text-align: left;
  width: 100%;
}

.task-time {
  color: #888;
  font-size: 14px;
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-exp {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: left;
  width: 100%;
  color: #81A0EF !important;
  -webkit-text-stroke: 1px #3A494D;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.task-right {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 0;
}

.task-image {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
}

.task-divider {
  width: 100%;
  height: 1px;
  background-color: #e1e8f5;
  margin: 0;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.task-level {
  font-weight: bold;
  font-size: 22px;
  text-align: right;
  color: #C3F9E6 !important;
  -webkit-text-stroke: 1px #1BA5BF;
}

/* Assigned 卡片配色与水印 */
.assigned-card {
  background-color: #D1EDF2 !important;
}
.assigned-card .task-divider {
  background-color: #B8DBEB !important;
}
.assigned-card .task-title,
.assigned-card .task-time {
  color: #95B0B5 !important;
}
.assigned-card .task-exp {
  color: #BCD8DD !important;
  -webkit-text-stroke: 1px #A1BEC3;
  text-shadow: none !important;
}
.assigned-card .task-level {
  -webkit-text-stroke: 1px #A1BEC3;
  color: #CCE8ED !important;
}
/* 保留右侧列和图片的尺寸，但不显示内容 */
.assigned-card .task-right {
  display: flex !important;   /* 恢复布局参与 */
  visibility: hidden;         /* 不显示，但保留空间 */
}

.assigned-card .task-image {
  visibility: hidden;         /* 图片同样不显示，但保留尺寸 */
}
/* 水印 */
.assigned-card::before {
  content: "Assigned";
  position: absolute;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-20deg);
  font-size: 48px;
  font-weight: bold;
  color: #A0C0C9;
  opacity: 0.25;
  pointer-events: none;
  white-space: nowrap;
}

/* =========================
   分页器
   ========================= */
.fixed-footer-wrapper {
  position: absolute;
  right: 16px;
  bottom: 8px;
  height: 64px;
  display: flex;
  justify-content: flex-end;
  pointer-events: auto !important;
  z-index: 20 !important;
}
.fixed-footer-wrapper .p-paginator {
  pointer-events: auto;
}

/* =========================
   Dialog：通用结构与样式
   ========================= */
:deep(.p-dialog) {
  height: 100%;
}
.project-dialog :deep(.p-dialog-header) {
  padding: 0 !important;
}
.project-dialog :deep(.p-dialog-content) {
  padding: 0 !important;            /* 统一由 wrapper 控制 */
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: auto !important;
  overflow: hidden;
  position: relative;               /* 供绝对定位按钮使用 */
  box-sizing: border-box;
}
:deep(.p-dialog-mask.p-component-overlay) {
  backdrop-filter: blur(6px);
  background-color: rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

/* Dialog Header */
.dialog-custom-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: stretch;
  padding: 0 16px;
  box-sizing: border-box;
  gap: 12px;
}
.dialog-back-button {
  font-size: 18px;
  color: #333;
}
.dialog-header-center {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 0;
}
.dialog-title {
  font-size: 30px;
  font-weight: 800;
  color: #1e1e1e;
  margin: 0;
}
.dialog-date-inline {
  font-size: 16px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top:5px;
}
.floating-dialog-level {
  position: absolute;
  top: 28px;
  right: 130px;
  color: #2a2c52;
  font-weight: bold;
  font-size: 32px;
  text-shadow: 0px 1px 3px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  pointer-events: none;
}

/* =========================
   左侧主列：统一“对齐基线”
   ========================= */

/* =========================
   左侧内容细节（严格依赖 --rail）
   ========================= */

/* 1) ID（author name） */
.dialog-author {
  position: relative;               /* 让头像以左栏为参照“悬挂”出去 */
  display: flex;
  align-items: center;
  min-height: 40px;                 /* 与头像高度一致，避免覆盖文本 */
  margin-bottom: 16px;
  margin-left: -14px;
  gap: 20px;
}
/* 头像不计入对齐：向左外悬，不改变文本对齐 */
.dialog-author :deep(.p-avatar) {
  position: static;
  left: calc(-50px - 8px);          /* 头像宽度 40 + 与文本间距 8 */
  top: 0;
}
.author-name {
  font-weight: 500;
  font-size: 20px;
  line-height: 1.2;                /* 与头像对齐更稳 */
  margin: 0;                        /* ✅ 靠 --rail 对齐，不额外偏移 */
}

/* 2) 描述（依赖 --rail，对齐左边框；不包含头像） */
.dialog-description-row {
  /* ✅ 不再使用任何左侧额外缩进或占位元素 */
  margin: 0;
  padding: 0;                       /* 继承 .dialog-left-section 的 --rail */
  margin-left: 25px;
}
.dialog-description {
  color: #666;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  white-space: normal;
  overflow-wrap: anywhere;          /* 长词也能换行 */
  margin-left: 60px;
  margin-top: -10px
}

/* 3) 图片（依赖 --rail，对齐左边框；不包含头像） */
.dialog-images {
  display: flex;
  flex-direction: row;
  gap: 16px;
  margin-top: 12px;
  /* ✅ 关键：不做任何左偏移，保持与 --rail 对齐 */
  padding-left: 0;
  margin-left: 60px;
}
.image-placeholder {
  width: 240px;
  height: 160px;
  background-color: #e0e0e0;
  border-radius: 12px;
  flex-shrink: 0;
  object-fit: cover;
}

/* 接任务按钮（右下） */
.absolute-accept-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}
.custom-btn {
  background-color: #2a2c55;
  color: #ffffff;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.custom-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.25);
}

/* =========================
   Filter Dialog
   ========================= */
:deep(.filter-dialog) .p-dialog-title {
  font-size: 30px !important;
  font-weight: 700;
  color: #1e1e1e;
}
:deep(.filter-dialog) .p-dialog-content {
  /* 与页面保持紧凑风格：上下左右 10px */
  padding: 10px !important;
  box-sizing: border-box;
  overflow: hidden !important;
  max-height: none !important;
}

.filter-section {
  margin-bottom: 20px !important;
}

.level-section {
  padding: 0 20px;
}
.level-label {
  font-size: 20px;
  font-weight: 600;
  color: #1e1e1e;
  margin: 10px -10px;
}
.level-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  align-items: center;
  margin: 20px 10px;
}
.level-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.level-item :deep(.p-checkbox-box) {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid #c8d3e6;
  transition: all 0.2s ease;
}
.level-item :deep(.p-checkbox-box.p-highlight) {
  background: #3f5aa8;
  border-color: #3f5aa8;
}
.level-item :deep(.p-checkbox-icon) {
  font-size: 12px;
  line-height: 1;
  color: #fff;
}
.level-text {
  font-size: 18px;
  color: #1e1e1e;
}

/* 状态切换 SelectButton */
.status-toggle-wrap {
  margin: 0;
}
.status-toggle {
  margin: 0 10px;
  width: calc(100% - 20px);
}
:deep(.filter-dialog) .status-toggle {
  width: 100% !important; /* 撑满容器 */
}
:deep(.filter-dialog) .p-selectbutton .p-button {
  padding: 0 !important;
  min-width: auto !important;
}
:deep(.filter-dialog) .p-selectbutton .p-button .p-button-label {
  display: inline-block;
  padding: 6px 10px !important; /* 文字到按钮边框 10px */
  line-height: 1.2;
}

/* 确认按钮固定右下 */
.absolute-apply-button {
  position: absolute;
  right: 24px;
  bottom: 24px;
  z-index: 999;
}
.apply-button {
  background-color: #2A2C52;
  color: #ffffff;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(42, 44, 82, 0.2);
  transition: background-color 0.3s, transform 0.2s;
}
.apply-button:hover {
  background-color: #2A2C52;
  transform: translateY(-1px);
}
.apply-button:active {
  background-color: #2A2C52 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(42, 44, 82, 0.2);
}
.dialog-right-section {
  display: flex;
  flex-direction: column;
  align-items: center;   /* 右栏内部水平居中 */
  justify-content: flex-start; /* 内容从上往下 */
  padding: 8px 16px;
  --metric-gap: 16px;
  z-index: 2;            /* 让它在分割线之上 */
}
.right-level-spacer {
  font-weight: bold;
  font-size: 32px;
  line-height: 1.2;
  visibility: hidden;        /* 不显示，但占位与浮动 Level 等高空间 */
}

.right-metrics {
  display: flex;
  flex-direction: column;
  gap: var(--metric-gap);
  width: clamp(220px, 80%, 320px);
  margin: 0 auto;       /* ⬅ 居中 */
}
.metric-text {
  font-size: 12px;
  font-weight: 600;
  color: #FFf;
}
.pixelated {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor; /* legacy IE */
}

.metric-item {
  display: flex;
  flex-direction: column;   /* 上下布局：第一行 icon+bar，第二行 label */
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
  margin-right: max(-12px, -2vw);   /* 维持你原来的“嵌入进度条”的效果 */
  flex-shrink: 0;
  z-index: 3;
  position: relative;
}

.metric-bar {
  flex: 1;                  /* 占满剩余空间 */
  width: 100%;              /* 确保进度条撑满父容器 */
  min-width: 120px;         /* 避免太小挤没了 */
}

.metric-label {
  margin-left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #5a6275;
}
.metric-bar :deep(.p-progressbar) {
  display: block;
  width: 100%;
  height: clamp(18px, 2.5vw, 28px);
  border-radius: 999px;
  background: #eef2fb;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.metric-bar :deep(.p-progressbar-value) {
  border-radius: 999px;
  background-color: var(--bar-color, #3b82f6); /* 默认蓝色 */
}

/* 内容居中即可，不要再设高度覆盖 */
.metric-bar :deep(.p-progressbar .p-progressbar-content) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content-wrapper {
  display: grid;
  grid-template-columns: minmax(0, 3fr) 1px minmax(0, 1fr);
  column-gap: 24px;
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  --divider-inset: 0px;
}

.dialog-left-section { grid-column: 1; }
.dialog-right-section { grid-column: 3; }
.dialog-left-section {
  grid-column: 1;
  display: flex;
  flex-direction: column;
  padding-left: 24px;      /* 唯一的“左基线” */
  margin-top: 0;
  overflow: visible;
}
.dialog-grid-divider {
  grid-column: 2;
  background-color: #ccc;
  border-radius: 1px;
  align-self: stretch;                    /* 拉满网格行高度 */
  margin-block: var(--divider-inset);     /* ⬅ 上下等距内缩 */
}
.dialog-vertical-divider {
  display: none !important;
}
/* 只对自定义的 custom-btn 生效，避免影响全局按钮 */
:deep(.custom-btn.p-button) {
  background-color: #2A2C55 !important;
  border: none !important;
  color: #ffffff !important;
  border-radius: 12px;
  padding: 12px 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

:deep(.custom-btn.p-button:hover) {
  background-color: #1f2344 !important; /* hover 稍微深一点 */
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.25);
}
:deep(.custom-btn.p-button:active) {
  background-color: #1f2344 !important;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2) inset;
}
.cards-scroll {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 64px;       /* 分页器预留高度 */
  padding: 40px;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

.cards-scroll.with-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-gutter: stable;
}

.cards-scroll.no-scroll {
  overflow: hidden;
}

/* 限制图片最大宽度，高度自适应 */
.rich-text img {
  max-width: 100%;
  height: auto;
  display: block;     /* 避免行内空隙 */
  margin: 8px 0;      /* 给点间距 */
  border-radius: 6px; /* 看起来更美观，可选 */
}

</style>