<script setup>
import { useRoute } from 'vue-router'
import TipBuddyHost from '../src/components/TipBuddyHost.vue'
const route = useRoute()

</script>

<template>
  <router-view :key="route.fullPath" />
  <TipBuddyHost />
  <link href="https://fonts.googleapis.com/css2?family=Inria+Sans:wght@300;400;700&display=swap" rel="stylesheet">
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
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