<template>
  <div class="p-field">
    <label class="choose-size-label">Choose award</label>

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
  'F级':     { exp:[5,15],      coin:[10,20],    hours:[0,24] },
  'E级':     { exp:[30,50],     coin:[50,100],   hours:[0,24] },
  'D级':     { exp:[80,150],    coin:[100,150],  hours:[0,24] },
  'C级':     { exp:[250,400],   coin:[300,350],  hours:[0,24] },
  'B级':     { exp:[500,800],   coin:[400,600],  hours:[0,24] },
  'A级':     { exp:[1000,2000], coin:[800,1000], hours:[0,24] },
  'S级':     { exp:[3000,5000], coin:[2000,3000],hours:[0,24] },
  '定制':     { exp:[1,10000],  coin:[1,10000],  hours:[0,24] },

  // 英文别名
  'Level F': { exp:[5,15],      coin:[10,20],    hours:[0,24] },
  'Level E': { exp:[30,50],     coin:[50,100],   hours:[0,24] },
  'Level D': { exp:[80,150],    coin:[100,150],  hours:[0,24] },
  'Level C': { exp:[250,400],   coin:[300,350],  hours:[0,24] },
  'Level B': { exp:[500,800],   coin:[400,600],  hours:[0,24] },
  'Level A': { exp:[1000,2000], coin:[800,1000], hours:[0,24] },
  'Level S': { exp:[3000,5000], coin:[2000,3000],hours:[0,24] }
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


function progressStyle(val: number, min: number, max: number) {
  const pct = max === min ? 0 : ((Number(val) - Number(min)) / (Number(max) - Number(min))) * 100
  return { background: `linear-gradient(to right, var(--fill) ${pct}%, var(--base) ${pct}%)` }
}

function bubbleStyle(val: number, min: number, max: number) {
//注意哥们，这里的奇怪的小数，我都不知道是干啥的，如果你读到了这里，且你是一个前端天才，那你帮我改一下吧，我这里的公式是在chat给我生成出来之后，一点一点实验出来的，这个傻逼56是这个世界上最傻逼的数字，希望后人能让这里变得更加漂亮么么么
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 56
  const sideOffset = 138 // 左边 min 值框固定宽度
  return {
    left: `calc(${pct}% + ${sideOffset}px)`
  }
}

</script>

<style scoped>
/* 基础布局 */
.award-item { display:flex; align-items:center; gap:10px; width:500px; position: relative; margin-left: 2%; margin-top: 14px; /* 让气泡能绝对定位到轨道 */}
.award-item label {
  width: 50px;            /* 左边 label 固定宽度 */
  text-align: left;
}
.min-val, .max-val {
  width: 40px;            /* 数字列固定宽度 */
  text-align: center;
}
.min-val,
.max-val {
  width: 56px;
  flex: 0 0 56px;
  text-align: center;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum"; /* 数字等宽 */
  background-color: #EAF2FF; /* 浅蓝背景 */
  border: 1px solid #C6D8FF; /* 边框颜色可调整 */
  border-radius: 6px;        /* 圆角 */
  padding: 2px 6px;          /* 内边距让框大一点 */
  box-sizing: border-box;    /* 保证宽度计算包含内边距 */
}

.label { width:56px; color:#333; }
.range { flex:1;}
.val { width:80px; text-align:right; }
.range-hint { 
  position: absolute;
  top: 20px; /* 气泡距离轨道上方的高度 */
  transform: translateX(-45%); /* 让气泡中心对齐 thumb 中心 */
  color: #333;
  font-size: 12px;
}
/* 禁用态可见性 */
.range:disabled { opacity: .5; cursor: not-allowed; }
/* 自定义滑杆样式（兼容 WebKit + Firefox） */
.range {
  appearance: none;
  -webkit-appearance: none;
  height: 16px;
  border-radius: 10px;
  outline: none;
  cursor: pointer;
  background: var(--base); /* 默认底色，progressStyle 会覆盖成渐变 */
}

.range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  height: 16px; width: 16px;
  cursor: pointer;
}
.range::-moz-range-thumb {
  height: 16px; width: 16px;
  cursor: pointer;
}

.exp-range::-webkit-slider-thumb { 
  appearance: none;
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border: none;
  background: url('../assets/icon/exp.png') no-repeat center;
  background-size: contain;
  cursor: pointer; }
.exp-range::-moz-range-thumb      { 
  height: 24px;
  width: 24px;
  border: none;
  background: url('../assets/icon/exp.png') no-repeat center;
  background-size: contain;
  cursor: pointer; }

.coin-range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border: none;
  background: url('../assets/icon/token.png') no-repeat center;
  background-size: contain;
  cursor: pointer; }
.coin-range::-moz-range-thumb      { 
  appearance: none;
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border: none;
  background: url('../assets/icon/token.png') no-repeat center;
  background-size: contain;
  cursor: pointer;}
.hours-range::-webkit-slider-thumb { 
  appearance: none;
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border: none;
  background: url('../assets/icon/time.png') no-repeat center;
  background-size: contain;
  cursor: pointer;}
.hours-range::-moz-range-thumb { 
  height: 24px;
  width: 24px;
  border: none;
  background: url('../assets/icon/time.png') no-repeat center;
  background-size: contain;
  cursor: pointer; }
.choose-size-label {
  font-size: 20px;
  font-weight: 300;
}
.min-val,
.max-val,
.range-hint {
/*这里的font-weight的10bold好像不是一个在这个世界存在的代码，所以后人会改的会读的可以改一下*/ 
  width: 50px;
  text-align: center;
  font-weight: 10bold;
  font-size: 14px;
}
.exp-range  { --fill: #11AF9B; --base: #D9D9D9; }
.coin-range { --fill: #F2D84A; --base: #D9D9D9; }
.hours-range{ --fill: #64748B; --base: #D9D9D9; }
.award-label {
  display: flex;
  align-items: center;
  gap: 6px;          /* 图标和文字的间距 */
  width: 80px;       /* 给它一个固定宽度，避免错位 */
}
.award-icon {
  width: 20px;       /* 图标大小，可以调 */
  height: 20px;
  object-fit: contain;
}
</style>