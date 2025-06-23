<!-- src/App.vue -->
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import StudentLayout from './layouts/StudentLayout.vue'
import BlankLayout from './layouts/BlankLayout.vue'

import Toast from 'primevue/toast'

const route = useRoute()

const layout = computed(() => {
  const name = route.meta.layout || 'blank';
  return {
    student: StudentLayout,
    blank: BlankLayout,
  }[name] || StudentLayout;
});
</script>

<template>
  <component :is="layout">
    <router-view />
    <Toast />
  </component>
</template>