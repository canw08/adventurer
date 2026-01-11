<template>
  <!-- 入口按钮：逻辑内聚在组件里 -->
  <Button
    class="video-icon-btn"
    text
    rounded
    aria-label="watch-video"
    v-if="checkinAvailable"
    @click="openTrialDialog"
  >
    <img :src="playerImg" alt="player" class="player-icon" />
  </Button>

  <!-- Dialog：同组件内 -->
  <WatchVideoTrialDialog v-model="showTrialDialog" />
</template>

<script setup>
import { computed, ref } from 'vue'
import { useUserStore } from '../../stores/user.js'

import Button from 'primevue/button'
import WatchVideoTrialDialog from '../../components/dialog/WatchVideoTrialDialog.vue'

const userStore = useUserStore()

const showTrialDialog = ref(false)
const openTrialDialog = () => {
  showTrialDialog.value = true
}

// 你原来的逻辑 그대로
const checkinAvailable = computed(() => !userStore?.userInfo?.checked_in)

// 你原来的资源引用
const playerImg = new URL('../../assets/icon/player.svg', import.meta.url).href
</script>

<style scoped>
/* 直接沿用你现在页面里的样式 */
.player-icon {
  width: 24px;
  height: 24px;
  display: block;
  object-fit: contain;
}
</style>
