<template>
  <div class="p-field">
    <div class="choose-size-label-wrapper">
      <label class="choose-size-label">Choose award</label>
      <i
        class="pi pi-question-circle help-icon"
        v-tooltip.top="'Coins金币：学生用来购买一些有趣的道具。'"
      ></i>
    </div>

    <!-- COINS -->
    <div class="award-item">
      <label>COINS</label>
      <span class="min-val">{{ coinMin }}</span>
      <input
        class="range coin-range pixelated"
        type="range"
        :min="coinMin"
        :max="coinMax"
        :step="coinStep"
        v-model.number="coinLocal"
        aria-label="coin range"
        :style="progressStyle(coinLocal, coinMin, coinMax)"
        @input="emit('update:coin', coinLocal)"
      />
      <small class="range-hint" :style="bubbleStyle(coinLocal, coinMin, coinMax)">
        {{ coinLocal }}
      </small>
      <span class="max-val">{{ coinMax }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, withDefaults, computed } from 'vue'

const props = withDefaults(defineProps<{
  /** 当前 coins 值（v-model:coin） */
  coin: number
  /** 可选：覆盖默认区间 */
  coinRange?: [number, number]
  /** 可选：当 coin 未传或不在区间时，是否自动填充为区间最小值（默认 true） */
  autofillIfEmpty?: boolean
}>(), {
  coinRange: () => [1, 10000],
  autofillIfEmpty: true
})

const emit = defineEmits<{ (e:'update:coin', v:number): void }>()

/* 区间与步长 */
const coinMin = computed(() => Math.min(props.coinRange[0], props.coinRange[1]))
const coinMax = computed(() => Math.max(props.coinRange[0], props.coinRange[1]))
const coinStep = ref(1)

function pickStep(min:number, max:number) {
  const span = max - min
  if (span <= 25) return 0.5
  if (span <= 50) return 1
  if (span <= 200) return 5
  if (span <= 1000) return 10
  return 50
}
function clamp(v:number, min:number, max:number){ return Math.min(max, Math.max(min, v)) }

/* 本地值初始化与同步 */
const coinLocal = ref(0)

function initOrClamp(value?: number) {
  const min = coinMin.value, max = coinMax.value
  const n = Number(value)
  const isValid = Number.isFinite(n) && n >= min && n <= max
  coinLocal.value = isValid
    ? n
    : (props.autofillIfEmpty ? min : clamp(Number(value ?? 0), min, max))
  // 确保父层拿到合法值
  emit('update:coin', coinLocal.value)
}

watch(() => props.coinRange, () => {
  coinStep.value = pickStep(coinMin.value, coinMax.value)
  initOrClamp(coinLocal.value)
}, { immediate: true })

watch(() => props.coin, (v) => {
  initOrClamp(v)
}, { immediate: true })

/* 进度与气泡样式 */
function progressStyle(val: number, min: number, max: number) {
  const pct = max === min ? 0 : ((Number(val) - Number(min)) / (Number(max) - Number(min))) * 100
  return { background: `linear-gradient(to right, var(--fill) ${pct}%, var(--base) ${pct}%)` }
}
function bubbleStyle(val: number, min: number, max: number) {
  // 简单位移（有需要可改成测量 thumb 宽度）
  const pct = max === min ? 0 : ((val - min) / (max - min)) * 56
  const sideOffset = 138
  return { left: `calc(${pct}% + ${sideOffset}px)` }
}
</script>

<style scoped>
.award-item { display:flex; align-items:center; gap:10px; width:500px; position: relative; margin-left: 2%; margin-top: 14px; }
.award-item label { width: 50px; text-align: left; }
.min-val, .max-val {
  width: 56px; flex: 0 0 56px; text-align: center;
  font-weight: 600; font-variant-numeric: tabular-nums; font-feature-settings: "tnum";
  background-color: #EAF2FF; border: 1px solid #C6D8FF; border-radius: 6px; padding: 2px 6px; box-sizing: border-box;
}
.range { flex:1; }
.range-hint { position: absolute; top: 20px; transform: translateX(-45%); color: #333; font-size: 12px; }
.range {
  appearance: none; -webkit-appearance: none; height: 16px; border-radius: 10px;
  outline: none; cursor: pointer; background: var(--base);
}
.range:disabled { opacity: .5; cursor: not-allowed; }
.range::-webkit-slider-thumb { appearance: none; -webkit-appearance: none; height: 16px; width: 16px; cursor: pointer; }
.range::-moz-range-thumb { height: 16px; width: 16px; cursor: pointer; }

/* coins thumb 与配色 */
.coin-range::-webkit-slider-thumb { height: 24px; width: 24px; border: none; background: url('../assets/icon/token.png') no-repeat center; background-size: contain; cursor: pointer; }
.coin-range::-moz-range-thumb      { height: 24px; width: 24px; border: none; background: url('../assets/icon/token.png') no-repeat center; background-size: contain; cursor: pointer; }

.choose-size-label { font-size: 20px; font-weight: 300; }
.min-val, .max-val, .range-hint { width: 50px; text-align: center; font-weight: 600; font-size: 14px; }
.coin-range { --fill: #F2D84A; --base: #D9D9D9; }
.choose-size-label-wrapper { display: flex; align-items: center; gap: 6px; }
.help-icon { font-size: 18px; color: #2A2C55; cursor: pointer; transition: color 0.2s; }
.help-icon:hover { color: #8949d1; }
</style>
