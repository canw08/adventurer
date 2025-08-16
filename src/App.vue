<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <router-view :key="route.fullPath" />
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-y: hidden; /* 禁止上下滚动 */
}


</style>