<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <router-view :key="route.fullPath" />
  <link href="https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&display=swap" rel="stylesheet">
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  overflow-y: hidden; /* 禁止上下滚动 */
}

.layout-container,
.main-content {
  font-family: 'Inria Sans', sans-serif !important;
}
/* src/styles/overrides.css */
body, button, input, textarea, select {
  font-family: 'Inria Sans', sans-serif !important;
}
</style>