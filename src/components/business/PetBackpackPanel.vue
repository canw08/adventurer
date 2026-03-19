<template>
  <!-- 桌宠 -->
  <DesktopPet @action="handlePetAction" />

  <!-- 背包弹窗 -->
  <Dialog
    v-model:visible="bagOpen"
    modal
    :dismissableMask="true"
    :closable="false"
    :showHeader="false"
    :style="{ width: '755px' }"
  >
    <div class="bag-content">
      <div class="bag-title">My back pack</div>

      <div class="bag-grid" role="grid" aria-label="backpack grid">
        <button
          v-for="(slot, index) in bagSlots"
          :key="index"
          class="bag-slot"
          type="button"
          :aria-label="slot ? slot.name : 'empty bag slot'"
          @click="onBagSlotClick(index)"
        >
          <img
            v-if="slot"
            :src="slot.icon"
            class="bag-icon"
            :alt="slot.name"
          />
        </button>
      </div>
    </div>
  </Dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Dialog from 'primevue/dialog'
import DesktopPet from './DesktopPet.vue'

/**
 * 路由
 */
const router = useRouter()

/**
 * 背包弹窗状态
 */
const bagOpen = ref(false)

/**
 * 背包网格尺寸
 * 8 列 6 行 = 48 格
 */
const GRID_COLS = 8
const GRID_ROWS = 6

/**
 * 背包物品图标
 */
const item1 = new URL('../../assets/icon/backpack/item1.png', import.meta.url).href
const item9 = new URL('../../assets/icon/backpack/item9.png', import.meta.url).href
const item17 = new URL('../../assets/icon/backpack/item17.png', import.meta.url).href
const item75 = new URL('../../assets/icon/backpack/item75.png', import.meta.url).href

/**
 * 背包数据
 * null = 空格子
 * object = 有物品
 */
const bagSlots = ref(Array(GRID_COLS * GRID_ROWS).fill(null))

/**
 * 测试数据
 * 你之后可以改成接口返回的数据
 */
bagSlots.value[0] = { icon: item1, name: 'item1' }
bagSlots.value[1] = { icon: item9, name: 'item9' }
bagSlots.value[5] = { icon: item17, name: 'item17' }
bagSlots.value[10] = { icon: item75, name: 'item75' }

/**
 * 桌宠动作分发
 */
function handlePetAction(action) {
  switch (action) {
    case 'open-bag':
      bagOpen.value = true
      break

    case 'open-quest':
      router.push('/student/task')
      break

    case 'open-store':
      router.push('/student/store')
      break

    default:
      console.log('unknown pet action:', action)
  }
}

/**
 * 点击背包格子
 */
function onBagSlotClick(index) {
  const slot = bagSlots.value[index]

  if (!slot) {
    console.log('empty slot:', index)
    return
  }

  console.log('bag slot clicked:', index, slot)
}
</script>

<style scoped>
/* 背包弹窗内容区域 */
:deep(.p-dialog-content) {
  padding: 0 !important;
}

/* 背包整体内容 */
.bag-content {
  padding-left: 6px;
  padding-right: 6px;
  padding-bottom: 6px;
  padding-top: 10px;
}

/* 标题 */
.bag-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  color: #2f4668;
}

/* 网格 */
.bag-grid {
  --inner-gap: 8px;

  display: grid;
  grid-template-columns: repeat(8, 80px);
  grid-auto-rows: 80px;
  gap: var(--inner-gap);
}

/* 格子 */
.bag-slot {
  width: 80px;
  height: 80px;
  border-radius: 0;
  border: 1px solid #dcdcdc;
  background: #f8f8f8;
  cursor: pointer;
  transition: background 0.12s ease, transform 0.06s ease;

  display: flex;
  align-items: center;
  justify-content: center;
}

.bag-slot:hover {
  background: rgba(0, 0, 0, 0.06);
}

.bag-slot:active {
  transform: scale(0.98);
}

/* 物品图标 */
.bag-icon {
  width: 68px;
  height: 68px;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
  image-rendering: -moz-crisp-edges;
  -ms-interpolation-mode: nearest-neighbor;
}
</style>