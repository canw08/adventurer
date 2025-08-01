<template>
  <div class="sidebar">
    <div class="profile-header">
      <Avatar
        image="https://primefaces.org/cdn/primevue/images/avatar/amyelsner.png"
        shape="circle"
        size="xlarge"
      />
      <h2>大帅哥-周心阳</h2>
      <p class="user-id">ID：A2107034</p>
    </div>
    <div class="menu-list">
      <div
        class="menu-button"
        :class="{ active: isActive('/student/home') }"
        @click="goToLog"
        v-ripple
      >
        Quest Log
      </div>
      <div
        class="menu-button"
        :class="{ active: isActive('/student/task') }"
        @click="goToBoard"
        v-ripple
      >
        Quest Board
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from 'primevue/avatar';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const goToLog = () => {
  router.push('/student/home');
};
const goToBoard = () => {
  router.push('/student/task');
};
const isActive = (path) => route.path === path;
</script>

<style scoped>
.sidebar {
  width: 300px;
  background-color: #f3f7fe;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  border-right: 1px solid #e3eaf5;
}
.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}
.user-id {
  background-color: #e0e0e0;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 14px;
  color: #333;
}
.menu-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}
.menu-button {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 14px;
  background-color: #f3f7fe;
  color: #5067b0;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  transform: scale(1);
  position: relative;
  overflow: hidden;
}
.menu-button:hover {
  transform: scale(1.03);
  background-color: #e0e8ff;
}
.menu-button:active {
  transform: scale(0.96);
}
.menu-button.active {
  background-color: #2a2c56;
  color: white;
}
</style>
