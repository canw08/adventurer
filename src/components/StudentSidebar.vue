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
      <div class="menu-button active">
        My Projects
      </div>
      <div class="menu-button" @click="goToProfile">
        Go to Profile
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from 'primevue/avatar';
import { useRouter } from 'vue-router';
const router = useRouter();
const goToProfile = () => {
  router.push('/student/task');
};
</script>

<style scoped>
.sidebar {
  width: 280px;
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
  background-color: #e3eaf5;
  color: #1e1e1e;
}
.menu-button.active {
  background-color: #2A2C56;
  color: white;
}
</style>
