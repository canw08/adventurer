<!-- ========================== 模板 ========================== -->
<template>
  <div class="agreement-shell">
    <!-- 页头（竖直上方） -->
    <header class="page-header">
      <h1 class="page-title">校园任务发布与使用协议</h1>
      <p class="page-subtitle">请逐条阅读并勾选，本页全部勾选后方可继续</p>
    </header>

    <!-- 顶部“主题分段条”：✅ 横向排列、整体宽度与卡片一致、居中 -->
    <nav class="wizard-topbar" role="tablist" aria-label="协议阅读进度">
      <div class="pills">
        <button
          v-for="(s, idx) in steps"
          :key="s.key"
          class="step-pill"
          :class="stepClass(idx)"
          :aria-current="idx === currentStep ? 'step' : undefined"
          :aria-disabled="!canJumpTo(idx)"
          @click="goStep(idx)"
        >
          <span class="step-index">{{ idx + 1 }}</span>
          <span class="step-label">{{ s.title }}</span>
          <i v-if="isStepComplete(idx)" class="pi pi-check step-check" aria-hidden="true"></i>
        </button>
      </div>

      <!-- 横向细轨迹，与卡片同宽，显示当前页位置感 -->
      <div class="track" aria-hidden="true">
        <div class="track-fill" :style="{ width: trackPercent + '%' }"></div>
      </div>
    </nav>

    <!-- 中央协议卡片：固定宽度、内部可滚 -->
    <main class="center-wrap">
      <Card class="agreement-card">
        <template #title>{{ steps[currentStep].title }}</template>
        <template #content>
          <div class="card-body-scroll">
            <div v-for="id in steps[currentStep].clauseIds" :key="id" class="clause">
              <div class="clause-header">
                <Checkbox v-model="checked[id]" :binary="true" :inputId="`clause-${id}`" />
                <label :for="`clause-${id}`" class="clause-title"><strong>{{ clauses[id].title }}</strong></label>
              </div>

              <!-- 单段或多行 -->
              <p v-if="typeof clauses[id].content === 'string'" class="clause-body">
                {{ clauses[id].content }}
              </p>
              <ul v-else class="clause-list">
                <li v-for="(line, i) in clauses[id].content" :key="i">{{ line }}</li>
              </ul>

              <Divider />
            </div>
          </div>
        </template>
      </Card>
    </main>

    <!-- 固定底部操作条 -->
    <footer class="footer" aria-live="polite">
      <div class="footer-left">
        <Tag :value="pageCheckedCount + ' / ' + pageTotal" />
        <span class="tip">需勾选完本页条款方可继续</span>
      </div>
      <div class="footer-right">
        <Button label="上一步" icon="pi pi-arrow-left" :disabled="currentStep===0" severity="secondary" @click="prev" />
        <Button v-if="currentStep < steps.length - 1" label="下一步" icon="pi pi-arrow-right" iconPos="right" :disabled="!canNext" @click="next" />
        <Button v-else label="我已阅读并同意全部条款" icon="pi pi-check" :disabled="!canNext" @click="finish" />
      </div>
    </footer>
  </div>
</template>

<!-- ========================== 脚本 ========================== -->
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

const AGREEMENT_VERSION = '2025-11-11'

function safeUseRouter() {
  try { return useRouter() } catch { return null as unknown as ReturnType<typeof useRouter> | null }
}
const router = safeUseRouter()

/* 四个主题（四页） */
const steps = [
  { key: 'overview', title: '概述与生效', clauseIds: [1, 8] },
  { key: 'content',  title: '内容规范',   clauseIds: [2, 3] },
  { key: 'govern',   title: '平台治理',   clauseIds: [4, 6] },
  { key: 'duty',     title: '用户与后果', clauseIds: [5, 7] }
] as const

/* 条款正文（纯中文；含多行条目） */
const clauses: Record<number, { title: string; content: string | string[] }> = {
  1: { title: '协议说明', content: '为营造积极、安全、有序的校园网络环境，规范任务发布行为，保障同学们的合法权益，本平台制定本协议。所有在平台上发布、接受或浏览任务的用户均需遵守本协议。使用本平台相关功能即表示用户已阅读并同意本协议全部内容。' },
  2: { title: '允许发布的任务类型', content: [
      '学习与科研类：项目组建、竞赛团队、资料整理、学习互助等；',
      '创意与设计类：美术设计、手抄报、视频剪辑、海报制作等；',
      '校园服务类：代领快递、志愿活动、物品招领与认领等；',
      '经验分享类：学习指导、Mentor 交流、技能教学等；',
      '二手物品类：校园内合法物品的拍卖、转让与收购。'
  ]},
  3: { title: '禁止发布的任务类型', content: [
      '违法违规类：含暴力、色情、赌博、毒品、诈骗、政治敏感、宗教极端或侵权内容；',
      '危险物品类：涉及烟、酒、药品、化学品、易燃易爆物等；',
      '商业或牟利类：校外兼职、外卖代送、品牌推广、广告营销、收费服务等；',
      '学术不诚信类：代写论文、代做作业、代考、刷分、冒用他人作品等；',
      '线下高风险类：私下约会、陪伴、代签、冒充或存在人身安全风险的任务；',
      '隐私与安全类：涉及他人个人信息、偷拍、隐私调查或不当言论；',
      '其他违规行为：违反学校规章制度或平台管理规定的内容。'
  ]},
  4: { title: '任务审核与管理', content: '平台对任务内容享有审核与管理权，可视情况修改、隐藏、下架或删除。发现违规、虚假或安全风险时，平台有权删除并通知发布者，情节严重者可暂停或封禁账号，必要时上报学校处理。' },
  5: { title: '用户责任', content: '用户应确保任务内容真实、合法、合理，不侵犯他人权益；执行任务过程中应注意安全，遵守学校制度；合作、报酬、物品转让等由双方协商并自行承担责任。' },
  6: { title: '平台权利与免责', content: '平台仅提供信息发布与交流渠道，不直接参与任务履行或交易结算；对用户纠纷或损失不承担责任；必要时依法配合学校或相关部门调查。' },
  7: { title: '违规处理与后果', content: '平台可视情况采取警告、删除、封禁等措施；情节严重者上报学校或主管部门；违规方应依法承担责任。' },
  8: { title: '协议修改与生效', content: '平台可根据实际情况修改本协议并公示；修改后的协议自发布之日起生效；用户继续使用平台视为同意更新内容；本协议自首次使用任务发布功能时生效，长期有效。' }
}

/* 勾选与分页逻辑 */
const checked = reactive<Record<number, boolean>>({1:false,2:false,3:false,4:false,5:false,6:false,7:false,8:false})
const currentStep = ref(0)
const pageTotal = computed(() => steps[currentStep.value].clauseIds.length)
const pageCheckedCount = computed(() => steps[currentStep.value].clauseIds.filter(id => checked[id]).length)
const canNext = computed(() => pageCheckedCount.value === pageTotal.value)

/* 顶部横向分段条：状态与交互 */
function isStepComplete(idx: number) { return steps[idx].clauseIds.every(id => checked[id]) }
function canJumpTo(target: number) {
  if (target <= currentStep.value) return true
  if (target === currentStep.value + 1 && canNext.value) return true
  return false
}
function stepClass(idx: number) {
  return { active: idx === currentStep.value, done: isStepComplete(idx), disabled: !canJumpTo(idx) }
}
function goStep(idx: number) { if (canJumpTo(idx)) currentStep.value = idx }

/* 上一步 / 下一步 / 完成 */
function prev() { if (currentStep.value > 0) currentStep.value-- }
function next() { if (canNext.value && currentStep.value < steps.length - 1) currentStep.value++ }
function finish() {
  if (!canNext.value) return
  localStorage.setItem('agreementConsent', JSON.stringify({ version: AGREEMENT_VERSION, agreedAt: Date.now(), checked }))
  if (router) router.push('/student/publish')
  else window.location.assign('/student/publish')
}

/* 细轨迹百分比（仅位置感） */
const trackPercent = computed(() => (steps.length <= 1 ? 100 : Math.round((currentStep.value / (steps.length - 1)) * 100)))
</script>

<!-- ========================== 样式 ========================== -->
<style scoped>
/* 参数：统一宽度，保证顶部分段条与卡片宽度一致且居中 */
:root, :host {
  --card-w: 840px;
  --card-max-w: min(92vw, var(--card-w));
  --footer-h: 64px;
}

.agreement-shell {
  min-height: 100vh;
  max-width: 980px;
  margin: 0  auto;
  padding: 16px 16px calc(var(--footer-h) + 20px);
}

/* 页头 */
.page-header { text-align: center; margin-bottom: 14px; }
.page-title  { font-size: 1.8rem; margin: 0 0 .25rem; }
.page-subtitle { color: #6b7280; }

/* 顶部横向分段条：宽度与卡片一致、居中 */
.wizard-topbar { margin: 4px 0 16px; }
.wizard-topbar .pills {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)); /* ✅ 横向四等分 */
  gap: .5rem;
  max-width: var(--card-max-w);
  margin: 0 auto;
}
.step-pill {
  position: relative;
  display: flex;
  align-items: center;
  gap: .5rem;
  width: 100%;
  padding: .6rem .75rem;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #374151;
  font-weight: 600;
  transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}
.step-pill .step-index {
  width: 1.6rem; height: 1.6rem;
  display: grid; place-items: center;
  border-radius: 999px;
  background: #f3f4f6;
  font-size: .9rem;
}
.step-pill .step-label { flex: 1; text-align: left; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.step-pill .step-check { font-size: 1rem; color: #10b981; }
.step-pill.active { border-color: #60a5fa; box-shadow: 0 0 0 3px rgba(96,165,250,.2); }
.step-pill.done   { border-color: #34d399; background: #f0fdf4; }
.step-pill.disabled { opacity: .55; cursor: not-allowed; }

/* 细轨迹与卡片等宽 */
.track {
  position: relative;
  height: 4px;
  margin: .5rem auto 0;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
  max-width: var(--card-max-w);
}
.track-fill {
  position: absolute; inset: 0 auto 0 0;
  width: 0%;
  background: linear-gradient(90deg, #60a5fa, #34d399);
  transition: width .25s ease;
}

/* 中央卡片：固定宽度、内部滚动 */
.center-wrap { display: grid; place-items: start center; }
.agreement-card {
  width: var(--card-max-w);
  border-radius: 16px;
  overflow: hidden;
}
.card-body-scroll {
  max-height: calc(100vh - var(--footer-h) - 220px); /* 只让内容滚动，页面不抖动 */
  overflow-y: auto;
  padding-right: .25rem;
}

/* 条款样式 */
.clause + .clause { margin-top: .25rem; }
.clause-header { display: flex; align-items: center; gap: .5rem; font-weight: 600; color: #1f2937; }
.clause-title { cursor: pointer; }
.clause-body  { color: #374151; line-height: 1.7; margin: .5rem 0 .25rem 1.8rem; }
.clause-list  { margin: .25rem 0 .5rem 2rem; color: #374151; line-height: 1.7; list-style-type: disc; }
.clause-list li { margin-bottom: .25rem; }

/* 底部操作条（固定） */
.footer {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff; border-top: 1px solid #e5e7eb;
  display: flex; align-items: center; justify-content: space-between;
  padding: .875rem 1.25rem; height: var(--footer-h); z-index: 50;
}
.footer-left { display: flex; align-items: center; gap: .5rem; }
.tip { color: #6b7280; font-size: .9rem; }
.footer-right { display: flex; align-items: center; gap: .75rem; }

/* 小屏优化 */
@media (max-width: 480px) {
  :root, :host { --card-w: 760px; }
  .step-pill .step-label { font-size: .9rem; }
  .card-body-scroll { max-height: calc(100vh - var(--footer-h) - 200px); }
}
</style>