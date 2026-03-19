<template>
  <div class="layout-container">
    <Sidebar />
    <router-view />
  </div>
</template>

<script setup>
import Sidebar from '../components/AdminSidebar.vue'
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.layout-container {
  display: flex;
  height: 100vh;
  background-color: #ffffff;
  font-family: 'Segoe UI', sans-serif;
  overflow: hidden;
}
</style>
