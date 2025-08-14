<template>
  <div class="p-field">
    <label>Choose award</label>

    <!-- EXP -->
    <div class="award-item">
      <span class="label">EXP</span>
      <input
        class="range exp-range"
        type="range"
        :min="expMin"
        :max="expMax"
        :step="expStep"
        :value="expLocal"
        :disabled="disabled"
        @input="onExp(($event.target as HTMLInputElement).value)"
        aria-label="EXP range"
      />
      <span class="val">{{ expLocal }}</span>
    </div>
    <small class="range-hint">
      范围：{{ expMin }} - {{ expMax }} 点经验
      <span v-if="disabled">（请先选择等级）</span>
    </small>

    <!-- coin -->
    <div class="award-item" style="margin-top:8px">
      <span class="label">coin</span>
      <input
        class="range coin-range"
        type="range"
        :min="coinMin"
        :max="coinMax"
        :step="coinStep"
        :value="coinLocal"
        :disabled="disabled"
        @input="onCoin(($event.target as HTMLInputElement).value)"
        aria-label="coin range"
      />
      <span class="val">{{ coinLocal }}</span>
    </div>
    <small class="range-hint">
      范围：{{ coinMin }} - {{ coinMax }} 阿幺斯
      <span v-if="disabled">（请先选择等级）</span>
    </small>

    <!-- 志愿者时长 -->
    <div class="award-item" style="margin-top:12px">
      <span class="label">Hours</span>
      <input
        class="range hours-range"
        type="range"
        :min="hoursMin"
        :max="hoursMax"
        :step="hoursStep"
        :value="hoursLocal"
        :disabled="disabled"
        @input="onHours(($event.target as HTMLInputElement).value)"
        aria-label="volunteer hours range"
      />
      <span class="val">{{ hoursLocal }} h</span>
    </div>
    <small class="range-hint">
      范围：{{ hoursMin }} - {{ hoursMax }} 小时
      <span v-if="disabled">（请先选择等级）</span>
    </small>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, withDefaults, computed } from 'vue'

const props = withDefaults(defineProps<{
  level?: string                    // 父组件传入的等级；允许空字符串
  exp: number
  coin: number
  hours?: number
  // A 改法：boss 选 Design/定制 时，可传自定义区间覆盖
  customRanges?: {
    exp?: [number, number]
    coin?: [number, number]
    hours?: [number, number]
  } | null
}>(), {
  level: '',                        // 默认未选择
  hours: 0,
  customRanges: null
})

const emit = defineEmits<{
  (e:'update:exp', v:number): void
  (e:'update:coin', v:number): void
  (e:'update:hours', v:number): void
}>()

// 本地显示值（与父同步）
const expLocal   = ref(props.exp ?? 0)
const coinLocal  = ref(props.coin ?? 0)
const hoursLocal = ref(props.hours ?? 0)
watch(() => props.exp,   v => expLocal.value   = v ?? 0)
watch(() => props.coin,  v => coinLocal.value  = v ?? 0)
watch(() => props.hours, v => hoursLocal.value = v ?? 0)

// 范围/步长
const expMin=ref(0),  expMax=ref(0),  expStep=ref(1)
const coinMin=ref(0), coinMax=ref(0), coinStep=ref(1)
const hoursMin=ref(0),hoursMax=ref(0),hoursStep=ref(0.5)

// 等级为空则禁用（父层可通过 v-if 决定“是否渲染”）
const disabled = computed(() => !normalizeLevel(props.level))

// 等级映射
const levelRanges: Record<string, {exp:[number,number], coin:[number,number], hours:[number,number]}> = {
  'F级':     { exp:[5,15],      coin:[10,20],    hours:[0.5, 1] },
  'E级':     { exp:[30,50],     coin:[50,100],   hours:[1,   2] },
  'D级':     { exp:[80,150],    coin:[100,150],  hours:[2,   3] },
  'C级':     { exp:[250,400],   coin:[300,350],  hours:[3,   4] },
  'B级':     { exp:[500,800],   coin:[400,600],  hours:[4,   6] },
  'A级':     { exp:[1000,2000], coin:[800,1000], hours:[6,   8] },
  'S级':     { exp:[3000,5000], coin:[2000,3000],hours:[8,  12] },
  '定制':     { exp:[1,10000],  coin:[1,10000],  hours:[0.5,24] },

  // 英文别名
  'Level F': { exp:[5,15],      coin:[10,20],    hours:[0.5, 1] },
  'Level E': { exp:[30,50],     coin:[50,100],   hours:[1,   2] },
  'Level D': { exp:[80,150],    coin:[100,150],  hours:[2,   3] },
  'Level C': { exp:[250,400],   coin:[300,350],  hours:[3,   4] },
  'Level B': { exp:[500,800],   coin:[400,600],  hours:[4,   6] },
  'Level A': { exp:[1000,2000], coin:[800,1000], hours:[6,   8] },
  'Level S': { exp:[3000,5000], coin:[2000,3000],hours:[8,  12] }
}

// 传入等级 -> 标准 key；返回 '' 表示未选择
function normalizeLevel(lvl?: string): string {
  if (!lvl) return ''
  const s = lvl.trim().toLowerCase()
  if (s === 'design') return '定制'   // 兼容 boss 的 Design 选项
  if (s === 'level f' || s === 'f级' || s === 'f') return 'F级'
  if (s === 'level e' || s === 'e级' || s === 'e') return 'E级'
  if (s === 'level d' || s === 'd级' || s === 'd') return 'D级'
  if (s === 'level c' || s === 'c级' || s === 'c') return 'C级'
  if (s === 'level b' || s === 'b级' || s === 'b') return 'B级'
  if (s === 'level a' || s === 'a级' || s === 'a') return 'A级'
  if (s === 'level s' || s === 's级' || s === 's') return 'S级'
  if (s.includes('定制')) return '定制'
  return ''
}

function pickStep(min:number, max:number) {
  const span = max - min
  if (span <= 5) return 0.5
  if (span <= 50) return 1
  if (span <= 200) return 5
  if (span <= 1000) return 10
  return 50
}

function setDisabledRanges() {
  // 未选择等级：禁用且范围 0~0，值保持 0
  expMin.value=0;   expMax.value=0;   expStep.value=1
  coinMin.value=0;  coinMax.value=0;  coinStep.value=1
  hoursMin.value=0; hoursMax.value=0; hoursStep.value=0.5

  expLocal.value=0; coinLocal.value=0; hoursLocal.value=0
  emit('update:exp',0); emit('update:coin',0); emit('update:hours',0)
}

function applyRange(levelRaw?: string) {
  const key = normalizeLevel(levelRaw)

  if (!key) { // 未选择
    setDisabledRanges()
    return
  }

  // ① 基础区间
  const base = levelRanges[key] || levelRanges['定制']

  // ② 定制/Design 时，使用 customRanges 覆盖（若传入）
  const isDesign = key === '定制'
  const expPair   = (isDesign && props.customRanges?.exp)   ? props.customRanges!.exp   : base.exp
  const coinPair  = (isDesign && props.customRanges?.coin)  ? props.customRanges!.coin  : base.coin
  const hoursPair = (isDesign && props.customRanges?.hours) ? props.customRanges!.hours : base.hours

  const [emin, emax] = expPair
  const [cmin, cmax] = coinPair
  const [hmin, hmax] = hoursPair

  expMin.value = emin;  expMax.value = emax;  expStep.value  = pickStep(emin, emax)
  coinMin.value = cmin; coinMax.value = cmax; coinStep.value = pickStep(cmin, cmax)
  hoursMin.value = hmin;hoursMax.value = hmax;hoursStep.value = pickStep(hmin, hmax)

  // 统一设为“最左边”（最小值）
  expLocal.value   = emin
  coinLocal.value  = cmin
  hoursLocal.value = hmin

  emit('update:exp',   expLocal.value)
  emit('update:coin',  coinLocal.value)
  emit('update:hours', hoursLocal.value)
}

// 初次与每次 level 变化时应用
watch(() => props.level, lvl => applyRange(lvl), { immediate: true })

function onExp(v:string){   expLocal.value   = Math.min(expMax.value,   Math.max(expMin.value,   Number(v))); emit('update:exp',   expLocal.value) }
function onCoin(v:string){  coinLocal.value  = Math.min(coinMax.value,  Math.max(coinMin.value,  Number(v))); emit('update:coin',  coinLocal.value) }
function onHours(v:string){ hoursLocal.value = Math.min(hoursMax.value, Math.max(hoursMin.value, Number(v))); emit('update:hours', hoursLocal.value) }
</script>

<style scoped>
/* 基础布局 */
.award-item { display:flex; align-items:center; gap:10px; }
.label { width:56px; color:#333; }
.range { flex:1; }
.val { width:80px; text-align:right; }
.range-hint { display:block; margin-top:4px; color:#888; font-size:12px; }

/* 禁用态可见性 */
.range:disabled { opacity: .5; cursor: not-allowed; }

/* 自定义滑杆样式（兼容 WebKit + Firefox） */
.range {
  appearance: none;
  -webkit-appearance: none;
  height: 8px;
  background: #eee;
  border-radius: 4px;
  outline: none;
}
.range::-webkit-slider-runnable-track { height: 8px; border-radius: 4px; }
.range::-moz-range-track              { height: 8px; border-radius: 4px; }
.range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  height: 16px; width: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-top: -4px;
  cursor: pointer;
}
.range::-moz-range-thumb {
  height: 16px; width: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  cursor: pointer;
}

/* 主题色：EXP（#F39536） */
.exp-range { background: #FFF4EB; border: 2px solid #F39536; }
.exp-range::-webkit-slider-runnable-track { background: #FFF4EB; }
.exp-range::-moz-range-track              { background: #FFF4EB; }
.exp-range::-webkit-slider-thumb { background: #F39536; }
.exp-range::-moz-range-thumb      { background: #F39536; }

/* 主题色：coin（#F2D84A） */
.coin-range { background: #FFFBE6; border: 2px solid #F2D84A; }
.coin-range::-webkit-slider-runnable-track { background: #FFFBE6; }
.coin-range::-moz-range-track              { background: #FFFBE6; }
.coin-range::-webkit-slider-thumb { background: #F2D84A; }
.coin-range::-moz-range-thumb      { background: #F2D84A; }

/* hours：中性配色 */
.hours-range { background: #F3F4F6; border: 2px solid #CBD5E1; }
.hours-range::-webkit-slider-runnable-track { background: #F3F4F6; }
.hours-range::-moz-range-track              { background: #F3F4F6; }
.hours-range::-webkit-slider-thumb { background: #64748B; }
.hours-range::-moz-range-thumb      { background: #64748B; }
</style>
