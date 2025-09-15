<template>
  <div class="p-field">
    <div class="choose-size-label-wrapper">
      <label class="choose-size-label">Choose award</label>
      <i
        class="pi pi-question-circle help-icon"
        v-tooltip.top="'Coins金币：学生用来购买一些有趣的道具/ EXP：学生用来升级/ HOURS：志愿者时长，请在任务是志愿者任务是添加，别的任务只需保持默认为0就好'"
      ></i>
    </div>

    <!-- EXP -->
    <div class="award-item">
      <label>EXP</label>
      <span class="min-val">{{ expMin }}</span>
      <input
        class="range exp-range pixelated"
        type="range"
        :min="expMin"
        :max="expMax"
        :step="expStep"
        :value="expLocal"
        :disabled="disabled"
        @input="onExp(($event.target as HTMLInputElement).value)"
        aria-label="EXP range"
        :style="progressStyle(expLocal, expMin, expMax)"
      />
      <small class="range-hint" :style="bubbleStyle(expLocal, expMin, expMax)">
        {{ expLocal }} 
        <span v-if="disabled">（请先选择等级）</span> 
      </small>
      <span class="max-val" >{{ expMax }}</span>
    </div>

    <!-- coin -->
    <div class="award-item">
      <label>COINS</label>
      <span class="min-val">{{ coinMin }}</span>
      <input
        class="range coin-range pixelated"
        type="range"
        :min="coinMin"
        :max="coinMax"
        :step="coinStep"
        :value="coinLocal"
        :disabled="disabled"
        @input="onCoin(($event.target as HTMLInputElement).value)"
        aria-label="coin range"
        :style="progressStyle(coinLocal, coinMin, coinMax)"
      />
      <small class="range-hint" :style="bubbleStyle(coinLocal, coinMin, coinMax)">
        {{ coinLocal }}
        <span v-if="disabled">（请先选择等级）</span>
      </small>
      <span class="max-val">{{ coinMax }}</span>
    </div>

    <!-- 志愿者时长 -->
    <div class="award-item">
      <label>HOURS</label>
      <span class="min-val">{{ hoursMin }}</span>
      <input
        class="range hours-range pixelated"
        type="range"
        :min="hoursMin"
        :max="hoursMax"
        :step="hoursStep"
        :value="hoursLocal"
        :disabled="disabled"
        @input="onHours(($event.target as HTMLInputElement).value)"
        aria-label="volunteer hours range"
        :style="progressStyle(hoursLocal, hoursMin, hoursMax)"
      />
      <small class="range-hint" :style="bubbleStyle(hoursLocal, hoursMin, hoursMax)">
        {{ hoursLocal }} 
        <span v-if="disabled">（请先选择等级）</span>
      </small>
      <span class="max-val">{{ hoursMax }}</span>
    </div>

    <!-- Num 步进器（在 HOURS 下方） -->
    <div class="award-item num-item">
      <label>NUM</label>
      <div class="num-wrap">
        <button
          type="button"
          class="num-btn"
          :disabled="numLocal <= numMin"
          @click="decNum"
          aria-label="decrease num"
        >-</button>

        <div class="num-value" :aria-live="'polite'">{{ numLocal }}</div>

        <button
          type="button"
          class="num-btn"
          :disabled="numLocal >= numMax"
          @click="incNum"
          aria-label="increase num"
        >+</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, withDefaults, computed } from 'vue'

const props = withDefaults(defineProps<{
  level?: string
  exp: number
  coin: number
  hours?: number
  /** 新增：Num 步进器的值与范围 */
  num?: number
  numMin?: number
  numMax?: number
  // A 改法：boss 选 Design/定制 时，可传自定义区间覆盖
  customRanges?: {
    exp?: [number, number]
    coin?: [number, number]
    hours?: [number, number]
  } | null
}>(), {
  level: '',
  hours: 0,
  /** 下面三项是为 Num 提供默认值（示例图 - 10 +） */
  num: 10,
  numMin: 1,
  numMax: 999,
  customRanges: null
})

const emit = defineEmits<{
  (e:'update:exp', v:number): void
  (e:'update:coin', v:number): void
  (e:'update:hours', v:number): void
  /** 新增：对外同步 Num 值 */
  (e:'update:num', v:number): void
}>()

// 本地显示值（与父同步）
const expLocal   = ref(props.exp ?? 0)
const coinLocal  = ref(props.coin ?? 0)
const hoursLocal = ref(props.hours ?? 0)
/** 新增：Num 本地值 */
const numLocal   = ref(props.num ?? 10)

watch(() => props.exp,   v => expLocal.value   = v ?? 0)
watch(() => props.coin,  v => coinLocal.value  = v ?? 0)
watch(() => props.hours, v => hoursLocal.value = v ?? 0)
/** 新增：外部变更时同步 Num */
watch(() => props.num,   v => { 
  const clamped = clampNumber(v ?? props.numMin, props.numMin, props.numMax)
  numLocal.value = clamped
})

/** 范围/步长 */
const expMin=ref(0),  expMax=ref(0),  expStep=ref(1)
const coinMin=ref(0), coinMax=ref(0), coinStep=ref(1)
const hoursMin=ref(0),hoursMax=ref(0),hoursStep=ref(0.5)

/** 等级为空则禁用滑块（Num 不依赖等级，始终可用） */
const disabled = computed(() => !normalizeLevel(props.level))

// 等级映射
const levelRanges: Record<string, {exp:[number,number], coin:[number,number], hours:[number,number]}> = {
  'F级':     { exp:[5,15],      coin:[10,20],    hours:[0,24] },
  'E级':     { exp:[30,50],     coin:[50,100],   hours:[0,24] },
  'D级':     { exp:[80,150],    coin:[100,150],  hours:[0,24] },
  'C级':     { exp:[250,400],   coin:[300,350],  hours:[0,24] },
  'B级':     { exp:[500,800],   coin:[400,600],  hours:[0,24] },
  'A级':     { exp:[1000,2000], coin:[800,1000], hours:[0,24] },
  'S级':     { exp:[3000,5000], coin:[2000,3000],hours:[0,24] },
  '定制':     { exp:[1,10000],  coin:[1,10000],  hours:[0,24] },
  'Level F': { exp:[5,15],      coin:[10,20],    hours:[0,24] },
  'Level E': { exp:[30,50],     coin:[50,100],   hours:[0,24] },
  'Level D': { exp:[80,150],    coin:[100,150],  hours:[0,24] },
  'Level C': { exp:[250,400],   coin:[300,350],  hours:[0,24] },
  'Level B': { exp:[500,800],   coin:[400,600],  hours:[0,24] },
  'Level A': { exp:[1000,2000], coin:[800,1000], hours:[0,24] },
  'Level S': { exp:[3000,5000], coin:[2000,3000],hours:[0,24] }
}

function normalizeLevel(lvl?: string): string {
  if (!lvl) return ''
  const s = lvl.trim().toLowerCase()
  if (s === 'design') return '定制'
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
  if (span <= 25) return 0.5
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
  if (!key) { setDisabledRanges(); return }

  const base = levelRanges[key] || levelRanges['定制']
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

  // 统一设为“最左边”
  expLocal.value   = emin
  coinLocal.value  = cmin
  hoursLocal.value = hmin

  emit('update:exp',   expLocal.value)
  emit('update:coin',  coinLocal.value)
  emit('update:hours', hoursLocal.value)
}

watch(() => props.level, lvl => applyRange(lvl), { immediate: true })

function onExp(v:string){   expLocal.value   = Math.min(expMax.value,   Math.max(expMin.value,   Number(v))); emit('update:exp',   expLocal.value) }
function onCoin(v:string){  coinLocal.value  = Math.min(coinMax.value,  Math.max(coinMin.value,  Number(v))); emit('update:coin',  coinLocal.value) }
function onHours(v:string){ hoursLocal.value = Math.min(hoursMax.value, Math.max(hoursMin.value, Number(v))); emit('update:hours', hoursLocal.value) }

/** Num：工具函数与事件 */
function clampNumber(v:number, min:number, max:number){ return Math.min(max, Math.max(min, v)) }
const numMin = computed(() => props.numMin)
const numMax = computed(() => props.numMax)

function incNum(){
  numLocal.value = clampNumber((numLocal.value ?? props.numMin) + 1, numMin.value, numMax.value)
  emit('update:num', numLocal.value)
}
function decNum(){
  numLocal.value = clampNumber((numLocal.value ?? props.numMin) - 1, numMin.value, numMax.value)
  emit('update:num', numLocal.value)
}

function progressStyle(val: number, min: number, max: number) {
  const pct = max === min ? 0 : ((Number(val) - Number(min)) / (Number(max) - Number(min))) * 100
  return { background: `linear-gradient(to right, var(--fill) ${pct}%, var(--base) ${pct}%)` }
}

function bubbleStyle(val: number, min: number, max: number) {
  // TODO: 后续我们把这里的“魔法数字”彻底拿掉，改为测量 thumb 实际宽度进行位移
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 56
  const sideOffset = 138
  return { left: `calc(${pct}% + ${sideOffset}px)` }
}
</script>

<style scoped>
/* 基础布局 */
.award-item { display:flex; align-items:center; gap:10px; width:500px; position: relative; margin-left: 2%; margin-top: 14px; }
.award-item label { width: 50px; text-align: left; }
.min-val, .max-val {
  width: 56px;
  flex: 0 0 56px;
  text-align: center;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  background-color: #EAF2FF;
  border: 1px solid #C6D8FF;
  border-radius: 6px;
  padding: 2px 6px;
  box-sizing: border-box;
}
.label { width:56px; color:#333; }
.range { flex:1;}
.val { width:80px; text-align:right; }
.range-hint { 
  position: absolute;
  top: 20px;
  transform: translateX(-45%);
  color: #333;
  font-size: 12px;
}
.range:disabled { opacity: .5; cursor: not-allowed; }
.range {
  appearance: none;
  -webkit-appearance: none;
  height: 16px;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  background: var(--base);
}
.range::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; height: 16px; width: 16px; cursor: pointer; }
.range::-moz-range-thumb { height: 16px; width: 16px; cursor: pointer; }

.exp-range::-webkit-slider-thumb { height: 24px; width: 24px; border: none; background: url('../assets/icon/exp.png') no-repeat center; background-size: contain; cursor: pointer; }
.exp-range::-moz-range-thumb      { height: 24px; width: 24px; border: none; background: url('../assets/icon/exp.png') no-repeat center; background-size: contain; cursor: pointer; }

.coin-range::-webkit-slider-thumb { height: 24px; width: 24px; border: none; background: url('../assets/icon/token.png') no-repeat center; background-size: contain; cursor: pointer; }
.coin-range::-moz-range-thumb      { height: 24px; width: 24px; border: none; background: url('../assets/icon/token.png') no-repeat center; background-size: contain; cursor: pointer;}

.hours-range::-webkit-slider-thumb { height: 24px; width: 24px; border: none; background: url('../assets/icon/time.png') no-repeat center; background-size: contain; cursor: pointer;}
.hours-range::-moz-range-thumb { height: 24px; width: 24px; border: none; background: url('../assets/icon/time.png') no-repeat center; background-size: contain; cursor: pointer; }

.choose-size-label { font-size: 20px; font-weight: 300; }

.min-val, .max-val, .range-hint {
  width: 50px;
  text-align: center;
  font-weight: 600; /* 修复原来的“10bold” */
  font-size: 14px;
}

.exp-range  { --fill: #11AF9B; --base: #D9D9D9; }
.coin-range { --fill: #F2D84A; --base: #D9D9D9; }
.hours-range{ --fill: #4ACDF2; --base: #D9D9D9; }

.award-label { display: flex; align-items: center; gap: 6px; width: 80px; }
.award-icon { width: 20px; height: 20px; object-fit: contain; }
.choose-size-label-wrapper { display: flex; align-items: center; gap: 6px; }
.help-icon { font-size: 18px; color: #2A2C55; cursor: pointer; transition: color 0.2s; }
.help-icon:hover { color: #8949d1; }

/* ===== Num 步进器样式 ===== */
.num-wrap {
  display: inline-flex;
  align-items: center;
  background: #ECEEF5;          /* 接近示例图的浅灰底 */
  border-radius: 12px;
  padding: 2px 8px;
  gap: 12px;
  user-select: none;
}
.num-btn {
  min-width: 28px;
  height: 28px;
  line-height: 28px;
  border: none;
  border-radius: 8px;
  background: #E9F2FF;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.06) inset;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  color: #1F3A8A;
}
.num-btn:disabled {
  cursor: not-allowed;
  opacity: .5;
}
.num-value {
  min-width: 40px;
  text-align: center;
  font-weight: 700;
}
</style>
