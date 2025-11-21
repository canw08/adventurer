<template>
  <div class="agreement-shell">
    <!-- 页头（竖直上方） -->
    <header class="page-header">
      <h1 class="page-title">冒险者公会发布协议</h1>
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
        <Button v-else label="我已阅读并同意全部条款" icon="pi pi-check" :disabled="!canNext" @click="openSignatureDialog" />
      </div>
    </footer>

    <!-- 签名对话框（已添加前缀下拉） -->
    <Dialog
      v-model:visible="signatureDialogVisible"
      header="签名确认"
      :modal="true"
      :closable="true"
      :style="{ width: '480px' }"
      draggable
      aria-label="签名对话框"
      @hide="onSignatureDialogHide"
    >
      <div class="signature-row">
        <Dropdown
          v-model="selectedPrefix"
          :options="prefixOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="选择前缀"
          class="prefix-dropdown"
          showClear
        />
        <InputText
          v-model="signature"
          placeholder="输入姓名"
          class="signature-input"
          @keyup.enter="confirmSignature"
        />
      </div>

      <p class="preview" v-if="previewSignature">预览：{{ previewSignature }}</p>

      <template #footer>
        <Button label="取消" text @click="signatureDialogVisible = false" />
        <Button label="确认" :disabled="!canConfirmSignature" @click="confirmSignature" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import Card from 'primevue/card'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
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

const prefixOptions = [
  { label: '帅气的', value: '帅气的' },
  { label: '温柔的', value: '温柔的' },
  { label: '神秘的', value: '神秘的' },
  { label: '快乐的', value: '快乐的' },
  { label: '高冷的', value: '高冷的' },
  { label: '创意无限的', value: '创意无限的' },
  { label: '代码骑士', value: '代码骑士' },
  { label: '学习狂魔', value: '学习狂魔' },
  { label: '掌柜的', value: '掌柜的' },
  { label: '甜甜的', value: '甜甜的' },
  { label: '唐唐的', value: '唐唐的' },
  { label: '细心的', value: '细心的' },
  { label: '冷静的', value: '冷静的' },
  { label: '阳光的', value: '阳光的' },
  { label: 'BOT的', value: 'BOT的' },
  { label: 'SSS级的', value: 'SSS级的' },
  { label: '赤石冠军', value: '赤石冠军' },
  { label: '资深搬运工', value: '资深搬运工' },
  { label: '来自异世界的', value: '来自异世界的' },
  { label: '从头帅到脚趾间的', value: '从头帅到脚趾间的' },
  { label: '装糊涂的天才', value: '装糊涂的天才' },
  { label: '不想写作业的', value: '不想写作业的' },
  { label: '表情包大王', value: '表情包大王' },
  { label: '社恐却努力的', value: '社恐却努力的' },
]

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

/* 上一步 / 下一步 */
function prev() { if (currentStep.value > 0) currentStep.value-- }
function next() { if (canNext.value && currentStep.value < steps.length - 1) currentStep.value++ }

/* 细轨迹百分比（仅位置感） */
const trackPercent = computed(() => (steps.length <= 1 ? 100 : Math.round((currentStep.value / (steps.length - 1)) * 100)))

/* -------------------- 签名对话框逻辑 -------------------- */
const signatureDialogVisible = ref(false) // already present in original — keep single source of truth
const signature = ref('')
const signatureError = ref('')
const signatureInputRef = ref<HTMLInputElement | null>(null)

const selectedPrefix = ref<string | null>(null)
const customPrefix = ref('')


/* 计算：是否可以确认（需要前缀 + 姓名） */
const canConfirmSignature = computed(() => {
  const hasPrefix = selectedPrefix.value && (selectedPrefix.value !== 'other' || customPrefix.value.trim().length > 0)
  return Boolean(hasPrefix && signature.value.trim().length > 0)
})

/* 预览最终签名（例如：帅气的 张三） */
const previewSignature = computed(() => {
  if (!selectedPrefix.value) return ''
  const prefix = selectedPrefix.value === 'other' ? customPrefix.value.trim() : selectedPrefix.value
  if (!prefix) return ''
  const name = signature.value.trim()
  return name ? `${prefix} ${name}` : ''
})

/* 打开对话框时清理并聚焦 */
function openSignatureDialog() {
  if (!canNext.value) return
  signature.value = ''
  signatureError.value = ''
  selectedPrefix.value = null
  customPrefix.value = ''
  signatureDialogVisible.value = true
  nextTick(() => {
    // 聚焦姓名输入
    const el = (signatureInputRef.value as any)?.$el ?? signatureInputRef.value
    if (el && typeof el.focus === 'function') el.focus()
  })
}

/* 确认签名：保存 prefix、name、finalSignature */
function confirmSignature() {
  const name = signature.value.trim()
  if (!name) {
    signatureError.value = '签名姓名不能为空，请输入姓名。'
    return
  }
  if (!selectedPrefix.value) {
    signatureError.value = '请选择一个前缀。'
    return
  }
  let prefix = selectedPrefix.value === 'other' ? customPrefix.value.trim() : selectedPrefix.value
  if (!prefix) {
    signatureError.value = '自定义前缀不能为空，请输入或选择其他前缀。'
    return
  }
  if (prefix.length > 30) {
    signatureError.value = '前缀过长，请保持在 30 字以内。'
    return
  }

  // 最终签名组合
  const finalSignature = `${prefix} ${name}`

  // 保存到 localStorage（保留 checked 快照）
  try {
    const payload = {
      version: AGREEMENT_VERSION,
      agreedAt: Date.now(),
      signerPrefix: prefix,
      signerName: name,
      finalSignature
    }
    localStorage.setItem('agreementConsent', JSON.stringify(payload))
  } catch (e) {
    signatureError.value = '保存失败，请检查浏览器设置或稍后重试。'
    return
  }

  signatureDialogVisible.value = false

  // 跳转
  if (router) router.push('/student/home-sender')
  else window.location.assign('/student/home-sender')
}

/* onSignatureDialogHide 保持此前实现：清理错误 */
function onSignatureDialogHide() {
  signatureError.value = ''
}



</script>

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
  margin-top: 15px;
  margin-bottom: 100px;
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

/* 签名对话框样式微调 */
.signature-body { display: flex; flex-direction: column; gap: .5rem; padding: .25rem 0; }
.signature-label { font-weight: 600; color: #374151; }
.signature-help { color: #dc2626; font-size: .875rem; margin: 0; }

/* 小屏优化 */
@media (max-width: 480px) {
  :root, :host { --card-w: 760px; }
  .step-pill .step-label { font-size: .9rem; }
  .card-body-scroll { max-height: calc(100vh - var(--footer-h) - 200px); }
}
.custom-prefix { margin-top: 0.5rem; margin-bottom: 0.5rem; }
.signature-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.prefix-dropdown {
  flex: 0 0 150px;
}

.signature-input {
  flex: 1;
}

.preview {
  font-size: 0.9rem;
  color: #666;
  margin-left: 4px;
}
</style>
