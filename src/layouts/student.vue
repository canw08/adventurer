<template>
  <div class="layout-container">
    <!-- 左栏 Sidebar -->
    <Sidebar />

    <!-- 主内容 -->
    <router-view />
  </div>
</template>

<script setup>
import Sidebar from '../components/StudentSidebar.vue'
</script>

<style scoped>
html, body {
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

.main-contents {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 保证 router-view 内部滚动 */
  padding: 0; /* 注意 padding 不能设在这里，会撑大高度 */
}
</style>
