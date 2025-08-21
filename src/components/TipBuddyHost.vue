<template>
  <TipBuddy :open="open" :message="state.message" :avatar="state.avatar" @close="close" />
</template>

<script setup>
import { reactive, ref, onMounted, onBeforeUnmount } from 'vue'
import TipBuddy from './TipBuddy.vue'
import { useTipBuddy } from '../composables/useTipBuddy'
import avatar from '../assets/tiper.png'

// 你不需要改这些默认项
const AUTOCLOSE_MS = 6000
const DEFAULT_AVATAR = avatar

const { onShow, offShow, onHide, offHide } = useTipBuddy()
const open = ref(false)
const timer = ref(null)

const state = reactive({
  message: '',
  avatar: DEFAULT_AVATAR
})

function clearTimer() { if (timer.value) { clearTimeout(timer.value); timer.value = null } }
function close() { clearTimer(); open.value = false }

function handleShow(payload) {
  clearTimer()
  state.message = payload.message || ''
  state.avatar = DEFAULT_AVATAR
  open.value = true
  // 自动消失
  timer.value = setTimeout(() => { close() }, AUTOCLOSE_MS)
}

function handleHide() { close() }

function onKey(e) { if (e.key === 'Escape' && open.value) close() }

onMounted(() => {
  onShow(handleShow); onHide(handleHide)
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  offShow(handleShow); offHide(handleHide)
  window.removeEventListener('keydown', onKey)
  clearTimer()
})
</script>
